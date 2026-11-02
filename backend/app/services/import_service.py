"""
Bulk complaint import (CSV / Excel) - the "integration layer" for bureaus whose
complaints currently live in spreadsheets or other systems.

Every row goes through the same smart intake pipeline as a manually filed
complaint. Re-uploading the same file is safe: rows whose external reference
was already imported for that bureau are skipped.
"""
import io
import json
import re
import uuid
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional

import pandas as pd
from sqlalchemy.orm import Session

from backend.app.models.models import Bureau, Case, ImportBatch, OverlapAlert
from backend.app.services.intake_service import IntakeError, preview_intake, process_intake
from backend.app.services.overlap_service import scan_and_generate_overlap_alerts

MAX_ROWS = 5000

# Accepted header spellings -> canonical field
COLUMN_ALIASES = {
    "institution_name": ["institution_name", "institution", "college", "college_name", "institute", "institute_name", "name_of_institution"],
    "aicte_permanent_id": ["aicte_permanent_id", "permanent_id", "aicte_id", "pid", "aicte_pid"],
    "institution_id": ["institution_id", "inst_id"],
    "source_bureau_id": ["source_bureau_id", "bureau", "bureau_id", "cell", "bureau_code"],
    "description": ["description", "complaint", "complaint_text", "grievance", "details", "complaint_details", "subject"],
    "category": ["category", "complaint_category", "type"],
    "priority": ["priority"],
    "complainant_name": ["complainant_name", "complainant", "name", "filed_by"],
    "complainant_contact": ["complainant_contact", "contact", "email", "phone", "mobile"],
    "external_reference": ["external_reference", "reference", "reference_no", "ref_no", "complaint_no", "grievance_no", "registration_no"],
    "received_at": ["received_at", "date", "received_date", "complaint_date", "date_of_receipt"],
}

BUREAU_CODE_TO_ID = {"RB": "BUR-RB", "PGRC": "BUR-PGRC", "APPROVAL": "BUR-APP", "APP": "BUR-APP",
                     "VIGILANCE": "BUR-VIG", "VIG": "BUR-VIG"}

TEMPLATE_CSV = (
    "external_reference,received_date,institution_name,aicte_permanent_id,bureau,complainant_name,"
    "complainant_contact,complaint,category,priority\n"
    "PG/2026/1001,2026-10-01,Aryabhata Instt of Tech & Mgmt,,PGRC,Ravi Kumar,ravi@example.com,"
    "\"College is demanding donation of 2 lakh for admission and not giving receipt\",,\n"
    "RB/2026/0420,2026-10-05,,1-4329811,RB,Anonymous,,"
    "\"Institute admitted more students than sanctioned intake in CSE\",Regulatory Compliance,HIGH\n"
)


def _canonical_columns(df: pd.DataFrame) -> pd.DataFrame:
    norm = {c: str(c).strip().lower().replace(" ", "_").replace("-", "_").replace(".", "") for c in df.columns}
    df = df.rename(columns=norm)
    rename = {}
    for field, aliases in COLUMN_ALIASES.items():
        for alias in aliases:
            if alias in df.columns and field not in rename.values():
                rename[alias] = field
                break
    return df.rename(columns=rename)


def read_table(content: bytes, filename: str) -> pd.DataFrame:
    name = (filename or "").lower()
    if name.endswith((".xlsx", ".xlsm", ".xls")):
        df = pd.read_excel(io.BytesIO(content), dtype=str)
    elif name.endswith(".csv") or name.endswith(".txt"):
        try:
            df = pd.read_csv(io.BytesIO(content), dtype=str, encoding="utf-8-sig")
        except UnicodeDecodeError:
            df = pd.read_csv(io.BytesIO(content), dtype=str, encoding="latin-1")
    else:
        raise IntakeError("Unsupported file type. Upload a .csv or .xlsx file")
    df = _canonical_columns(df).dropna(how="all")
    if len(df) > MAX_ROWS:
        raise IntakeError(f"File has {len(df)} rows; the limit per upload is {MAX_ROWS}")
    if "description" not in df.columns:
        raise IntakeError("Missing a complaint text column (e.g. 'complaint' or 'description')")
    if not ({"institution_name", "aicte_permanent_id", "institution_id"} & set(df.columns)):
        raise IntakeError("Missing an institution column (e.g. 'institution_name' or 'aicte_permanent_id')")
    return df


def _value(row: pd.Series, key: str) -> Optional[str]:
    if key not in row.index:
        return None
    v = row[key]
    if v is None or (isinstance(v, float) and pd.isna(v)) or (isinstance(v, str) and not v.strip()):
        return None
    return str(v).strip()


def _row_payload(row: pd.Series, default_bureau: Optional[str]) -> Dict[str, Any]:
    bureau = _value(row, "source_bureau_id") or default_bureau
    if bureau:
        bureau = BUREAU_CODE_TO_ID.get(bureau.upper(), bureau.upper() if bureau.upper().startswith("BUR-") else bureau)
    received = _value(row, "received_at")
    received_dt = None
    if received:
        # ISO dates (2026-10-01) are year-first; Indian-style dates (01/10/2026) are day-first.
        iso = bool(re.match(r"^\d{4}[-/]", received))
        parsed = pd.to_datetime(received, errors="coerce", dayfirst=not iso)
        if pd.isna(parsed):
            raise IntakeError(f"Unreadable date '{received}'")
        received_dt = parsed.to_pydatetime()
        if received_dt.tzinfo is None:
            received_dt = received_dt.replace(tzinfo=timezone.utc)
    priority = _value(row, "priority")
    return {
        "institution_id": _value(row, "institution_id"),
        "institution_name": _value(row, "institution_name"),
        "aicte_permanent_id": _value(row, "aicte_permanent_id"),
        "source_bureau_id": bureau,
        "description": _value(row, "description"),
        "category": _value(row, "category"),
        "priority": priority.upper() if priority else None,
        "complainant_name": _value(row, "complainant_name"),
        "complainant_contact": _value(row, "complainant_contact"),
        "external_reference": _value(row, "external_reference"),
        "received_at": received_dt,
    }


def run_import(db: Session, content: bytes, filename: str, actor_user_id: str,
               default_bureau_id: Optional[str] = None, dry_run: bool = False,
               allowed_bureau_id: Optional[str] = None) -> Dict[str, Any]:
    """
    `allowed_bureau_id`: when set (bureau officers), every row must belong to that bureau.
    `dry_run`: validate and preview the automation results without saving anything.
    """
    df = read_table(content, filename)
    if default_bureau_id and not db.query(Bureau).filter(Bureau.bureau_id == default_bureau_id).first():
        raise IntakeError(f"Unknown bureau '{default_bureau_id}'")

    alerts_before = db.query(OverlapAlert).count()
    results: List[Dict[str, Any]] = []
    touched_institutions = set()
    counts = {"created": 0, "needs_review": 0, "duplicates": 0, "auto_categorized": 0, "rejected": 0, "skipped": 0}

    for idx, row in df.iterrows():
        row_no = int(idx) + 2  # +1 header, +1 one-based
        try:
            payload = _row_payload(row, default_bureau_id)
            if not payload["source_bureau_id"]:
                raise IntakeError("No bureau given (add a 'bureau' column or choose a default bureau)")
            if allowed_bureau_id and payload["source_bureau_id"] != allowed_bureau_id:
                raise IntakeError(f"Row belongs to {payload['source_bureau_id']}; you can only import for {allowed_bureau_id}")
            ext = payload["external_reference"]
            if ext and db.query(Case.case_id).filter(Case.external_reference == ext,
                                                     Case.source_bureau_id == payload["source_bureau_id"]).first():
                counts["skipped"] += 1
                results.append({"row": row_no, "status": "SKIPPED_ALREADY_IMPORTED", "external_reference": ext,
                                "message": "Already imported earlier"})
                continue

            if dry_run:
                if not payload["description"] or len(payload["description"]) < 10:
                    raise IntakeError("Complaint text missing or too short")
                preview = preview_intake(db, payload)
                if preview["institution_error"]:
                    raise IntakeError(preview["institution_error"])
                inst = preview["institution"]
                cat = preview["category"] or {}
                dup = preview["possible_duplicates"][0] if preview["possible_duplicates"] else None
                status = "WOULD_CREATE_NEEDS_REVIEW" if inst["match_status"] == "PENDING_REVIEW" else "WOULD_CREATE"
                results.append({"row": row_no, "status": status, "external_reference": ext,
                                "institution": inst["canonical_name"], "match_status": inst["match_status"],
                                "match_score": inst["score"], "category": cat.get("value"),
                                "category_source": cat.get("source"), "category_confidence": cat.get("confidence"),
                                "duplicate_of": dup["case_id"] if dup else None})
                counts["needs_review" if status.endswith("REVIEW") else "created"] += 1
                counts["auto_categorized"] += 1 if cat.get("source") == "AUTO" else 0
                counts["duplicates"] += 1 if dup else 0
                continue

            out = process_intake(db, payload, actor_user_id=actor_user_id, channel="BULK_IMPORT", run_overlap_scan=False)
            touched_institutions.add(out["institution"]["institution_id"])
            needs_review = out["institution"]["match_status"] == "PENDING_REVIEW"
            counts["needs_review" if needs_review else "created"] += 1
            counts["auto_categorized"] += 1 if out["category"]["source"] == "AUTO" else 0
            counts["duplicates"] += 1 if out["duplicate"] else 0
            results.append({
                "row": row_no, "status": "CREATED_NEEDS_REVIEW" if needs_review else "CREATED",
                "case_id": out["case_id"], "external_reference": ext,
                "institution": out["institution"]["canonical_name"], "match_status": out["institution"]["match_status"],
                "match_score": out["institution"]["score"], "category": out["category"]["value"],
                "category_source": out["category"]["source"], "category_confidence": out["category"].get("confidence"),
                "priority": out["priority"]["value"],
                "duplicate_of": out["duplicate"]["case_id"] if out["duplicate"] else None,
            })
        except IntakeError as e:
            db.rollback()
            counts["rejected"] += 1
            results.append({"row": row_no, "status": "REJECTED", "message": str(e)})
        except Exception as e:  # never let one bad row kill the batch
            db.rollback()
            counts["rejected"] += 1
            results.append({"row": row_no, "status": "REJECTED", "message": f"Unexpected error: {e}"})

    new_alerts = 0
    if not dry_run:
        for inst_id in touched_institutions:
            scan_and_generate_overlap_alerts(db, institution_id=inst_id)
        new_alerts = db.query(OverlapAlert).count() - alerts_before

    summary = {
        "file_name": filename, "dry_run": dry_run, "total_rows": int(len(df)),
        "created": counts["created"], "needs_review": counts["needs_review"],
        "duplicates_flagged": counts["duplicates"], "auto_categorized": counts["auto_categorized"],
        "rejected": counts["rejected"], "skipped_already_imported": counts["skipped"],
        "new_overlap_alerts": new_alerts, "rows": results,
    }

    if not dry_run:
        batch = ImportBatch(
            import_id=f"IMP-{uuid.uuid4().hex[:8].upper()}", source="FILE_UPLOAD", file_name=filename,
            source_bureau_id=default_bureau_id, created_by=actor_user_id, imported_at=datetime.now(timezone.utc),
            record_count=int(len(df)), valid_count=counts["created"] + counts["needs_review"],
            rejected_count=counts["rejected"], needs_review_count=counts["needs_review"],
            duplicate_count=counts["duplicates"], auto_categorized_count=counts["auto_categorized"],
            new_overlap_alerts=new_alerts, processing_status="COMPLETED",
            error_report=json.dumps([r for r in results if r["status"] == "REJECTED"]),
        )
        db.add(batch)
        db.commit()
        summary["import_id"] = batch.import_id
    return summary


def batch_to_dict(b: ImportBatch) -> Dict[str, Any]:
    return {
        "import_id": b.import_id, "source": b.source, "file_name": b.file_name,
        "source_bureau_id": b.source_bureau_id, "created_by": b.created_by, "imported_at": b.imported_at,
        "record_count": b.record_count, "valid_count": b.valid_count, "rejected_count": b.rejected_count,
        "needs_review_count": b.needs_review_count, "duplicate_count": b.duplicate_count,
        "auto_categorized_count": b.auto_categorized_count, "new_overlap_alerts": b.new_overlap_alerts,
        "processing_status": b.processing_status,
        "errors": json.loads(b.error_report) if b.error_report else [],
    }

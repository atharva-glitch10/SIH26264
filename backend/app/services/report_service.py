import io
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import func
import openpyxl
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.utils import get_column_letter

from backend.app.models.models import (
    Case, Institution, Bureau, OverlapAlert, CaseAction, RelatedCase
)
from backend.app.services.sla_service import evaluate_case_sla

def get_dashboard_summary(db: Session) -> Dict[str, Any]:
    cases = db.query(Case).all()
    institutions = db.query(Institution).all()
    
    total_cases = len(cases)
    pending_cases = sum(1 for c in cases if c.status in ("RECEIVED", "PENDING"))
    under_process_cases = sum(1 for c in cases if c.status == "UNDER_PROCESS")
    disposed_cases = sum(1 for c in cases if c.status in ("DISPOSED", "CLOSED"))
    transferred_cases = sum(1 for c in cases if c.status == "TRANSFERRED")
    escalated_cases = sum(1 for c in cases if c.status == "ESCALATED")
    
    overdue_cases = 0
    for c in cases:
        if c.status not in ("DISPOSED", "CLOSED"):
            sla = evaluate_case_sla(c.received_at, c.expected_disposal_at, c.status, c.actual_disposal_at)
            if sla["is_overdue"]:
                overdue_cases += 1
                
    unresolved_overlaps = db.query(OverlapAlert).filter(
        OverlapAlert.status.in_(["NEW", "UNDER_REVIEW", "COORDINATION_REQUIRED", "LINKED_ACKNOWLEDGED"])
    ).count()

    # Multi-bureau institutions
    inst_bureau_map: Dict[str, set] = {}
    for c in cases:
        if c.status not in ("DISPOSED", "CLOSED"):
            inst_bureau_map.setdefault(c.institution_id, set()).add(c.current_bureau_id)
    multi_bureau_count = sum(1 for s in inst_bureau_map.values() if len(s) >= 2)

    return {
        "total_cases": total_cases,
        "pending_cases": pending_cases,
        "under_process_cases": under_process_cases,
        "disposed_cases": disposed_cases,
        "transferred_cases": transferred_cases,
        "escalated_cases": escalated_cases,
        "overdue_cases": overdue_cases,
        "unresolved_overlap_alerts": unresolved_overlaps,
        "total_institutions": len(institutions),
        "multi_bureau_institutions_count": multi_bureau_count
    }

def get_bureau_workload(db: Session) -> List[Dict[str, Any]]:
    bureaus = db.query(Bureau).filter(Bureau.active == True).all()
    workload = []
    
    for b in bureaus:
        b_cases = db.query(Case).filter(Case.current_bureau_id == b.bureau_id).all()
        overdue_cnt = 0
        for c in b_cases:
            if c.status not in ("DISPOSED", "CLOSED"):
                sla = evaluate_case_sla(c.received_at, c.expected_disposal_at, c.status, c.actual_disposal_at)
                if sla["is_overdue"]:
                    overdue_cnt += 1
                    
        workload.append({
            "bureau_id": b.bureau_id,
            "bureau_code": b.bureau_code,
            "bureau_name": b.bureau_name,
            "total_cases": len(b_cases),
            "received_cases": sum(1 for c in b_cases if c.status == "RECEIVED"),
            "pending_cases": sum(1 for c in b_cases if c.status == "PENDING"),
            "under_process_cases": sum(1 for c in b_cases if c.status == "UNDER_PROCESS"),
            "transferred_cases": sum(1 for c in b_cases if c.status == "TRANSFERRED"),
            "escalated_cases": sum(1 for c in b_cases if c.status == "ESCALATED"),
            "disposed_cases": sum(1 for c in b_cases if c.status in ("DISPOSED", "CLOSED")),
            "overdue_cases": overdue_cnt
        })
    return workload

def get_status_distribution(db: Session) -> List[Dict[str, Any]]:
    cases = db.query(Case).all()
    total = len(cases) or 1
    counts: Dict[str, int] = {}
    for c in cases:
        counts[c.status] = counts.get(c.status, 0) + 1
        
    order = ["RECEIVED", "PENDING", "UNDER_PROCESS", "TRANSFERRED", "ESCALATED", "DISPOSED", "CLOSED"]
    res = []
    for s in order:
        cnt = counts.get(s, 0)
        res.append({
            "status": s,
            "count": cnt,
            "percentage": round((cnt / total) * 100, 1)
        })
    return res

def get_region_distribution(db: Session) -> List[Dict[str, Any]]:
    institutions = db.query(Institution).all()
    reg_map: Dict[str, Dict[str, Any]] = {}
    
    for inst in institutions:
        r = inst.region
        if r not in reg_map:
            reg_map[r] = {"region": r, "count": 0, "institutions_count": 0, "active_cases": 0}
        reg_map[r]["institutions_count"] += 1
        
        for c in inst.cases:
            reg_map[r]["count"] += 1
            if c.status not in ("DISPOSED", "CLOSED"):
                reg_map[r]["active_cases"] += 1
                
    return sorted(list(reg_map.values()), key=lambda x: x["count"], reverse=True)

def get_ageing_analysis(db: Session) -> List[Dict[str, Any]]:
    active_cases = db.query(Case).filter(Case.status.notin_(["DISPOSED", "CLOSED"])).all()
    
    buckets = {
        "0-15 Days": 0,
        "16-30 Days": 0,
        "31-60 Days": 0,
        "61-90 Days": 0,
        ">90 Days": 0
    }
    
    for c in active_cases:
        sla = evaluate_case_sla(c.received_at, c.expected_disposal_at, c.status, c.actual_disposal_at)
        d = sla["days_pending"]
        if d <= 15:
            buckets["0-15 Days"] += 1
        elif d <= 30:
            buckets["16-30 Days"] += 1
        elif d <= 60:
            buckets["31-60 Days"] += 1
        elif d <= 90:
            buckets["61-90 Days"] += 1
        else:
            buckets[">90 Days"] += 1
            
    return [{"bucket": k, "count": v} for k, v in buckets.items()]

def get_monthly_trends(db: Session) -> List[Dict[str, Any]]:
    cases = db.query(Case).all()
    months_map: Dict[str, Dict[str, int]] = {}
    
    for c in cases:
        r_month = c.received_at.strftime("%Y-%m")
        if r_month not in months_map:
            months_map[r_month] = {"received": 0, "disposed": 0}
        months_map[r_month]["received"] += 1
        
        if c.actual_disposal_at:
            d_month = c.actual_disposal_at.strftime("%Y-%m")
            if d_month not in months_map:
                months_map[d_month] = {"received": 0, "disposed": 0}
            months_map[d_month]["disposed"] += 1
            
    sorted_months = sorted(months_map.keys())
    # Return last 6 to 12 months
    return [
        {"month": m, "received": months_map[m]["received"], "disposed": months_map[m]["disposed"]}
        for m in sorted_months[-12:]
    ]

def generate_excel_report(db: Session) -> io.BytesIO:
    """Generates an authentic multi-worksheet Excel report containing genuine database analytics."""
    wb = openpyxl.Workbook()
    
    # Styling
    header_fill = PatternFill(start_color="0F2027", end_color="0F2027", fill_type="solid")
    header_font = Font(name="Calibri", size=11, bold=True, color="FFFFFF")
    title_font = Font(name="Calibri", size=14, bold=True, color="0F2027")
    subtitle_font = Font(name="Calibri", size=10, italic=True, color="555555")
    cell_border = Border(
        left=Side(style='thin', color='DDDDDD'),
        right=Side(style='thin', color='DDDDDD'),
        top=Side(style='thin', color='DDDDDD'),
        bottom=Side(style='thin', color='DDDDDD')
    )

    # 1. Executive Summary Sheet
    ws_summary = wb.active
    ws_summary.title = "Executive Summary"
    
    ws_summary["A1"] = "ALL INDIA COUNCIL FOR TECHNICAL EDUCATION (AICTE)"
    ws_summary["A1"].font = title_font
    ws_summary["A2"] = f"Integrated Institution Complaint Monitoring Report — Generated {datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M UTC')}"
    ws_summary["A2"].font = subtitle_font
    ws_summary["A3"] = "DISCLAIMER: Generated for SIH26264 Prototype with Synthetic Demonstration Records."
    ws_summary["A3"].font = subtitle_font

    summary_data = get_dashboard_summary(db)
    headers = ["Metric Indicator", "Calculated Count", "Operational Description"]
    
    row_idx = 5
    for col_idx, h in enumerate(headers, start=1):
        cell = ws_summary.cell(row=row_idx, column=col_idx, value=h)
        cell.fill = header_fill
        cell.font = header_font
        cell.alignment = Alignment(horizontal="center", vertical="center")

    kpi_rows = [
        ("Total Complaints Registered", summary_data["total_cases"], "Cumulative complaints recorded across all AICTE bureaus"),
        ("Pending Scrutiny", summary_data["pending_cases"], "Cases in RECEIVED or PENDING preliminary review"),
        ("Under Active Investigation", summary_data["under_process_cases"], "Cases actively being investigated by responsible Bureau"),
        ("Transferred Cases", summary_data["transferred_cases"], "Cases transferred inter-bureau requiring receiving handover"),
        ("Escalated to Management", summary_data["escalated_cases"], "Cases escalated to Senior Management / Member Secretary"),
        ("Disposed / Resolved", summary_data["disposed_cases"], "Cases resolved with recorded disposal findings and timestamps"),
        ("Cases Overdue SLA", summary_data["overdue_cases"], "Cases past their priority-based disposal deadline"),
        ("Active Cross-Bureau Overlap Alerts", summary_data["unresolved_overlap_alerts"], "Institutions with concurrent multi-bureau investigations requiring coordination"),
        ("Institutions Under Multi-Bureau Scrutiny", summary_data["multi_bureau_institutions_count"], "Institutions with cases currently split across >= 2 Bureaus")
    ]

    for title, val, desc in kpi_rows:
        row_idx += 1
        ws_summary.cell(row=row_idx, column=1, value=title).border = cell_border
        c2 = ws_summary.cell(row=row_idx, column=2, value=val)
        c2.border = cell_border
        c2.alignment = Alignment(horizontal="right")
        ws_summary.cell(row=row_idx, column=3, value=desc).border = cell_border

    # 2. Cases Register Sheet
    ws_cases = wb.create_sheet(title="Cases Register")
    case_headers = [
        "Case ID", "Reference No", "Institution Name", "AICTE Permanent ID",
        "Current Bureau", "Category", "Priority", "Status", "Received Date",
        "Expected Disposal", "Days Pending", "Overdue Status", "Next Action"
    ]
    for col_idx, h in enumerate(case_headers, start=1):
        cell = ws_cases.cell(row=1, column=col_idx, value=h)
        cell.fill = header_fill
        cell.font = header_font
        cell.alignment = Alignment(horizontal="center")

    cases = db.query(Case).order_by(Case.received_at.desc()).all()
    for r_idx, c in enumerate(cases, start=2):
        sla = evaluate_case_sla(c.received_at, c.expected_disposal_at, c.status, c.actual_disposal_at)
        inst = c.institution
        ws_cases.cell(row=r_idx, column=1, value=c.case_id).border = cell_border
        ws_cases.cell(row=r_idx, column=2, value=c.complaint_reference).border = cell_border
        ws_cases.cell(row=r_idx, column=3, value=inst.canonical_name if inst else "").border = cell_border
        ws_cases.cell(row=r_idx, column=4, value=inst.aicte_permanent_id if inst else "").border = cell_border
        ws_cases.cell(row=r_idx, column=5, value=c.current_bureau_id).border = cell_border
        ws_cases.cell(row=r_idx, column=6, value=c.category).border = cell_border
        ws_cases.cell(row=r_idx, column=7, value=c.priority).border = cell_border
        ws_cases.cell(row=r_idx, column=8, value=c.status).border = cell_border
        ws_cases.cell(row=r_idx, column=9, value=c.received_at.strftime("%Y-%m-%d")).border = cell_border
        ws_cases.cell(row=r_idx, column=10, value=c.expected_disposal_at.strftime("%Y-%m-%d")).border = cell_border
        ws_cases.cell(row=r_idx, column=11, value=sla["days_pending"]).border = cell_border
        ws_cases.cell(row=r_idx, column=12, value="OVERDUE" if sla["is_overdue"] else "ON TRACK").border = cell_border
        ws_cases.cell(row=r_idx, column=13, value=c.next_action or "").border = cell_border

    # 3. Cross-Bureau Overlaps Sheet
    ws_overlaps = wb.create_sheet(title="Cross-Bureau Overlaps")
    ovr_headers = ["Alert ID", "Institution Name", "Severity", "Status", "Explanation", "Recommended Action", "Resolution / Justification"]
    for col_idx, h in enumerate(ovr_headers, start=1):
        cell = ws_overlaps.cell(row=1, column=col_idx, value=h)
        cell.fill = header_fill
        cell.font = header_font
        cell.alignment = Alignment(horizontal="center")

    alerts = db.query(OverlapAlert).order_by(OverlapAlert.created_at.desc()).all()
    for r_idx, a in enumerate(alerts, start=2):
        inst = a.institution
        ws_overlaps.cell(row=r_idx, column=1, value=a.alert_id).border = cell_border
        ws_overlaps.cell(row=r_idx, column=2, value=inst.canonical_name if inst else a.institution_id).border = cell_border
        ws_overlaps.cell(row=r_idx, column=3, value=a.severity).border = cell_border
        ws_overlaps.cell(row=r_idx, column=4, value=a.status).border = cell_border
        ws_overlaps.cell(row=r_idx, column=5, value=a.explanation).border = cell_border
        ws_overlaps.cell(row=r_idx, column=6, value=a.recommended_action).border = cell_border
        ws_overlaps.cell(row=r_idx, column=7, value=a.resolution_reason or "").border = cell_border

    # Auto-adjust column widths
    for ws in [ws_summary, ws_cases, ws_overlaps]:
        for col in ws.columns:
            max_len = 0
            col_letter = get_column_letter(col[0].column)
            for cell in col:
                val = str(cell.value or "")
                if len(val) > max_len and len(val) < 80:
                    max_len = len(val)
            ws.column_dimensions[col_letter].width = max(max_len + 3, 12)

    output = io.BytesIO()
    wb.save(output)
    output.seek(0)
    return output

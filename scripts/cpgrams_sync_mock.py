"""
Mock CPGRAMS sync: pushes a CSV of complaints to the external intake API.

    set INTAKE_API_KEY=my-secret-key        (same value as the backend's INTAKE_API_KEY)
    python -m scripts.cpgrams_sync_mock [csv_path] [--url http://127.0.0.1:8080]

Uses only the standard library. Rows are sent to POST /api/v1/intake/complaints/batch
(500 per request, the endpoint's maximum) and a summary is printed.
"""
import argparse
import csv
import json
import os
import sys
import urllib.error
import urllib.request
from datetime import datetime
from pathlib import Path

DEFAULT_CSV = Path(__file__).resolve().parent.parent / "data" / "sample_imports" / "pgrc_october_2026_batch.csv"
BATCH_SIZE = 500
BUREAU_IDS = {"RB": "BUR-RB", "PGRC": "BUR-PGRC", "APPROVAL": "BUR-APP", "APP": "BUR-APP", "VIGILANCE": "BUR-VIG", "VIG": "BUR-VIG"}


def _received_at(value: str):
    value = (value or "").strip()
    for fmt in ("%d/%m/%Y", "%Y-%m-%d"):
        try:
            return datetime.strptime(value, fmt).isoformat()
        except ValueError:
            continue
    return None


def row_to_payload(row: dict) -> dict:
    bureau = (row.get("Bureau") or "").strip().upper()
    return {
        "institution_name": (row.get("Name of Institution") or "").strip() or None,
        "aicte_permanent_id": (row.get("AICTE Permanent ID") or "").strip() or None,
        "source_bureau_id": BUREAU_IDS.get(bureau, bureau),
        "description": (row.get("Complaint Details") or "").strip(),
        "category": (row.get("Category") or "").strip() or None,
        "priority": (row.get("Priority") or "").strip().upper() or None,
        "complainant_name": (row.get("Complainant") or "").strip() or None,
        "complainant_contact": (row.get("Contact") or "").strip() or None,
        "external_reference": (row.get("Complaint No") or "").strip() or None,
        "received_at": _received_at(row.get("Received Date")),
    }


def post_batch(url: str, api_key: str, payloads: list) -> dict:
    req = urllib.request.Request(
        f"{url.rstrip('/')}/api/v1/intake/complaints/batch",
        data=json.dumps(payloads).encode("utf-8"),
        headers={"Content-Type": "application/json", "X-API-Key": api_key},
        method="POST",
    )
    with urllib.request.urlopen(req, timeout=60) as resp:
        return json.load(resp)


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[1].strip())
    parser.add_argument("csv_path", nargs="?", default=str(DEFAULT_CSV))
    parser.add_argument("--url", default="http://127.0.0.1:8080")
    args = parser.parse_args()

    api_key = os.environ.get("INTAKE_API_KEY", "")
    if not api_key:
        print("INTAKE_API_KEY is not set in the environment.", file=sys.stderr)
        return 2

    with open(args.csv_path, newline="", encoding="utf-8-sig") as f:
        rows = list(csv.DictReader(f))
    payloads = [row_to_payload(r) for r in rows]

    created, failures = 0, []
    try:
        for start in range(0, len(payloads), BATCH_SIZE):
            body = post_batch(args.url, api_key, payloads[start:start + BATCH_SIZE])
            created += body.get("created", 0)
            for res in body.get("results", []):
                if not res.get("ok"):
                    ref = payloads[start + res["index"]]["external_reference"]
                    failures.append((ref, res.get("error")))
    except urllib.error.HTTPError as e:
        print(f"HTTP {e.code} from intake API: {e.read().decode('utf-8', 'replace')[:300]}", file=sys.stderr)
        return 1
    except urllib.error.URLError as e:
        print(f"Could not reach {args.url}: {e.reason}", file=sys.stderr)
        return 1

    print(f"Source file : {args.csv_path}")
    print(f"Rows read   : {len(rows)}")
    print(f"Created     : {created}")
    print(f"Failed      : {len(failures)}")
    for ref, err in failures:
        print(f"  - {ref}: {err}")
    return 0 if not failures else 1


if __name__ == "__main__":
    sys.exit(main())

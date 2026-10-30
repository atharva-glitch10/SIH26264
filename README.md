# AICTE Integrated Institution Complaint Monitoring Dashboard (SIH26264)

![React](https://img.shields.io/badge/Frontend-React%20%7C%20Vite%20%7C%20TypeScript-blue)
![FastAPI](https://img.shields.io/badge/Backend-FastAPI%20%7C%20Python%203.11%2B-teal)
![DB](https://img.shields.io/badge/Database-SQLite%20%7C%20PostgreSQL-orange)

A full-stack prototype for **Smart India Hackathon 2026, Problem Statement SIH26264**: *Integrated Dashboard for Monitoring and Tracking Institution-Related Complaint Cases Across AICTE Bureaus/Cells* (Technology bucket: **Smart Automation**).

AICTE's Regulation Bureau (RB), Public Grievance Redressal Cell (PGRC) and other cells often handle complaints about the **same institution** without knowing about each other. This system gives one real-time, institution-wise view of every case and automates the error-prone steps:

```
 Ingest  ─►  Link to institution  ─►  Classify & deduplicate  ─►  Dashboard & alerts
 (form,      (Permanent ID, alias,     (category + confidence,      (cross-bureau overlaps,
  Excel,      fuzzy match with          priority hint, duplicate     SLA monitor, risk score,
  API)        ambiguity guard)          detection across bureaus)    repeat offenders)
```

---

## 🚀 What it does

| PS requirement | How it is met |
|---|---|
| Central dashboard across all bureaus | Overview KPIs, bureau workload, ageing, trends, smart-automation panel, state hotspots |
| Institution-wise view | **Institution 360°**: every case from every bureau, unified timeline, explainable **risk score** |
| Integration layer | **Bulk CSV/Excel import** (flexible headers, dry run, idempotent) and **intake API** (`X-API-Key`) for CPGRAMS / portals |
| Auto-linking to institutions | Permanent ID → name → verified alias → fuzzy match weighted on distinctive words; ambiguous names go to a **review queue**, never silently merged |
| Complaint categorisation (NLP) | Naive Bayes classifier with confidence + evidence words; officer corrections retrain it |
| Duplicate detection | Paraphrase-tolerant similarity + same complainant + date proximity, **across bureaus**; officer confirms/dismisses |
| Repeat offenders / overdue | Risk score (0-100) with reasons, repeat-offender flag, **background SLA monitor** (reminders, breaches, stagnant cases, auto-escalation) |
| Role-based access | JWT login; everyone can *view* everything, officers can *act* only on their bureau's cases; regional officers read-only; full audit log |
| Real-time monitoring | Notifications per bureau (overlap, duplicate, SLA, transfer), SLA monitor every 15 min |

### Measured accuracy (`python -m scripts.evaluate_models`)
Shown on the **Reports** page and written to `data/evaluation_report.json`:
- **Complaint categorisation:** ~93% accuracy on 70 held-out complaints (written separately from the training phrases)
- **Duplicate detection:** precision 1.00 / recall ~0.87 on 35 labelled pairs
- **Institution auto-linking:** ~85% of noisy names auto-linked with 100% precision (0 wrong merges); the rest go to review; 0/8 unknown colleges wrongly linked

> These were measured on synthetic data with the difflib fallback matcher; your machine uses RapidFuzz, so re-run the script and quote **your** numbers. Re-measure on real AICTE data before any deployment.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| Frontend | React 19, Vite, TypeScript, Tailwind CSS, Lucide, React Router 7, Axios, Recharts |
| Backend | Python 3.11+, FastAPI, SQLAlchemy 2, Pydantic 2, RapidFuzz, Pandas, OpenPyXL, PyJWT |
| NLP | Pure-Python Naive Bayes + paraphrase-tolerant similarity (no heavy ML dependencies, runs offline) |
| Database | SQLite (default) or PostgreSQL (`DATABASE_URL`) |
| Deployment | Docker Compose (nginx + FastAPI), optional Postgres profile |

---

## 📦 Project Structure

```text
SIH26264/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   ├── deps.py              # auth dependency + role-based permission rules
│   │   │   └── routes/              # auth, dashboard, institutions, cases, overlaps, matching,
│   │   │                            # alerts, reports, imports (bulk), intake (external API)
│   │   ├── core/                    # config, database, security (JWT/PBKDF2), ids, migrations
│   │   ├── models/                  # SQLAlchemy ORM models
│   │   ├── schemas/                 # Pydantic request/response models
│   │   ├── services/
│   │   │   ├── intake_service.py    # smart intake pipeline (link → classify → dedupe → alert)
│   │   │   ├── import_service.py    # CSV/Excel bulk import
│   │   │   ├── nlp_service.py       # classifier, duplicate scoring, priority hints (pure)
│   │   │   ├── text_utils.py        # normalisation, name matching, similarity (pure)
│   │   │   ├── overlap_rules_engine.py / overlap_service.py
│   │   │   ├── sla_rules_engine.py / sla_monitor_service.py
│   │   │   ├── risk_engine.py       # explainable risk score + repeat offender (pure)
│   │   │   └── matching, workflow, institution, complaint, report, audit, notification
│   │   └── main.py
│   └── tests/                       # conftest + test_backend, test_smart_features, test_pure_logic
├── frontend/src/
│   ├── context/AuthContext.tsx      # login state & permissions
│   ├── components/case/             # SmartIntakeModal, SmartCasePanel
│   ├── components/dashboard/        # SmartAutomationPanels, ModelMetricsCard
│   └── pages/                       # Login, Overview, Institutions, Institution360, Cases, CaseDetails,
│                                    # OverlapAlerts, Workflow, ImportData, Reports, DataQuality, Settings
├── config/                          # overlap_rules.json (incl. duplicate & classifier settings), sla_rules.json, workflow_rules.json
├── data/
│   ├── eval/                        # labelled test sets for the evaluation script
│   ├── sample_imports/              # messy PGRC (.csv) and RB (.xlsx) batches for the demo
│   └── synthetic_*.csv              # exported demo data
├── scripts/
│   ├── generate_demo_data.py        # seeds 60 institutions, ~510 cases, officers, duplicates, SLA alerts
│   └── evaluate_models.py           # measures matching / classification / duplicate detection
├── docker-compose.yml, Dockerfile.backend, Dockerfile.frontend, docker/
├── .env.example
├── SPEC.md                          # technical specification (section 11 = v2.0 additions)
└── CHANGES.md                       # what changed in v2.0 and why
```

---

## ⚡ Quick Start (local)

**Prerequisites:** Python 3.11+, Node.js 18+.

```bash
# from the project root
pip install -r backend/requirements.txt

# Seed demo data (wipes and recreates the local database), then measure the models
python -m scripts.generate_demo_data

# Start the API (Swagger docs at http://127.0.0.1:8080/docs)
python -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8080 --reload
```

In a second terminal:

```bash
cd frontend
npm install
npm run dev        # http://localhost:5173
```

### Demo logins (synthetic data only)
All demo officers use the password **`Aicte@2026`** (shown on the login screen while `DEMO_MODE=true`).

| Officer ID | Role | Can change |
|---|---|---|
| `USR-SUPER-01` | Super Admin | everything |
| `USR-MGMT-01` | Senior Management | any case, overlap decisions, imports |
| `USR-PGRC-01` | PGRC Bureau Officer | PGRC cases, PGRC imports |
| `USR-RB-01` | RB Bureau Officer | RB cases, RB imports |
| `USR-REG-NORTH` | Regional Officer | read-only |

> Upgrading from v1? Just start the backend: new columns are added automatically and existing officers get the demo password. For the full demo (duplicates, SLA alerts, evaluation report) re-run `python -m scripts.generate_demo_data`.

### Run the tests
```bash
python -m pytest backend/tests -v
```

### Docker (one command)
```bash
docker compose up --build          # UI: http://localhost:8000   API: http://localhost:8080/docs
```
The backend seeds demo data on first start only. PostgreSQL: see the comment at the top of `docker-compose.yml`.

### External intake API example
`scripts/cpgrams_sync_mock.py` mocks a CPGRAMS sync: it reads `data/sample_imports/pgrc_october_2026_batch.csv` (or a path you pass).
It posts the rows to `/api/v1/intake/complaints/batch` with the `X-API-Key` taken from the `INTAKE_API_KEY` environment variable.
Run `python -m scripts.cpgrams_sync_mock [csv] [--url http://127.0.0.1:8080]` with the backend running; it prints rows read, created and failed.

```bash
# set INTAKE_API_KEY=my-secret-key in .env, restart the backend, then:
curl -X POST http://127.0.0.1:8080/api/v1/intake/complaints \
  -H "X-API-Key: my-secret-key" -H "Content-Type: application/json" \
  -d '{"institution_name":"Aryabhata Instt of Tech & Mgmt","source_bureau_id":"BUR-PGRC",
       "description":"College demanding donation of 2 lakh for admission","external_reference":"CPGRAMS/2026/123"}'
```

---

## 🎯 Demo Walkthrough (≈3 minutes)

| # | Action | What to point out |
|---|---|---|
| 1 | Sign in as **PGRC officer** (`USR-PGRC-01`) | Role-based access; header shows officer and bureau |
| 2 | **Overview** | KPIs + *Smart Automation at Work* (auto-linked, auto-categorised, duplicates, SLA alerts, auto-escalations) + highest-risk institutions + state hotspots |
| 3 | **Cases → File New Complaint**: type *"Aryabhata Instt. of Tech & Mgmt"* and *"college demanding donation of 2 lakh, no receipt"* | Live panel: institution matched, category *Fee Related* with confidence and evidence words, priority HIGH, possible duplicates |
| 4 | **Bulk Import** → `data/sample_imports/pgrc_october_2026_batch.csv` → *Validate*, then *Import* | Per-row results: auto-linked, sent to review ("Bhabha Instt" is ambiguous), rejected (unknown college, bad date), re-sent row skipped |
| 5 | Sign in as **RB officer**, import `rb_october_2026_batch.xlsx` | RB complaint about Aryabhata is flagged as a **duplicate of the PGRC case**; a **new cross-bureau overlap alert** appears |
| 6 | Open the duplicate case | *Smart Intake Results*: confirm/dismiss duplicate, confirm category (retrains classifier) |
| 7 | Open a PGRC case while signed in as RB | **View only**: cross-bureau visibility without cross-bureau editing |
| 8 | **Overlap Alerts** | Rules A/B/C explanation, side-by-side cases, link with a lead bureau |
| 9 | **Institutions → Sort by Risk / Repeat Offenders → Institution 360** | Risk score with reasons ("+10 repeated 'Fee Related Grievances' complaints") |
| 10 | **Data Quality** | Approve the "Bhabha Instt" match; the pending case becomes confirmed and an alias is learned |
| 11 | **Reports** | Measured accuracy card + authenticated Excel export |

---

## 🔒 Synthetic Data & Sandbox Disclaimer
All institutions, officers, complainants and complaints are synthetic. The prototype is not connected to AICTE systems. Overlap and duplicate flags are decision support for officers, not findings of wrongdoing. Before real use: set `DEMO_MODE=false`, a strong `SECRET_KEY`, real officer passwords, PostgreSQL, HTTPS, and re-measure the models on real data.

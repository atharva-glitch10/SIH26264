# AICTE Integrated Institution Complaint Monitoring & Status Dashboard (SIH26264)

[![React](https://img.shields.io/badge/Frontend-React%20%7C%20Vite%20%7C%20TypeScript-blue)](https://vitejs.dev/)
[![FastAPI](https://img.shields.io/badge/Backend-FastAPI%20%7C%20Python%203.13-teal)](https://fastapi.tiangolo.com/)
[![SQLite](https://img.shields.io/badge/Database-SQLite%20%7C%20SQLAlchemy%202.0-orange)](https://sqlite.org/)
[![Tests](https://img.shields.io/badge/Tests-13%2F13%20Passing-brightgreen)](https://pytest.org/)

A full-stack prototype engineered for **Smart India Hackathon 2026 (Problem Statement SIH26264)**. This system establishes a centralized single-window dashboard consolidating institution-related complaints, regulatory actions, and grievances handled across AICTE Bureaus and Cells:
- **RB (Regulation Bureau)**: Regulatory compliance, institutional approvals, faculty cadre ratios, and norms enforcement.
- **PGRC (Public Grievance Redressal Cell)**: Student/faculty grievances, unauthorized fee overcharging, certificate withholding, and harassment complaints.
- **Approval Bureau (BUR-APP)**: Annual intake capacity approvals, course variations, and NOC certifications.
- **Vigilance Cell (BUR-VIG)**: Capitation fee violations, ethical complaints, and statutory inquiry boards.

---

## 🚀 Key Innovations & Functional Capabilities

1. **Deterministic & Rule-Based Cross-Bureau Overlap Detection Hub**:
   - Automatically identifies institutions with concurrent, uncoordinated cases split across multiple bureaus.
   - Evaluates multi-bureau presence (Rule A), shared complaint categories (Rule B), and textual description similarity via RapidFuzz (Rule C).
   - Side-by-side comparative inspection of participating cases (receipt dates, handling officers, last actions, upcoming steps).
   - Structured lifecycle: Review, Formally Link Cases, Resolve with recorded Lead Bureau, or Dismiss with mandatory justification.
2. **Centralized Institution 360° Profile**:
   - Unified dossier tracking AICTE Permanent ID, verified aliases, regional council, and contact information.
   - Cross-bureau involvement indicators and risk scoring (High, Medium, Low attention levels).
   - Complete chronological timeline synthesizing actions taken across all bureaus for each institution.
3. **Robust Workflow State Machine & SLA Engine**:
   - Strict status transitions: `RECEIVED` → `PENDING` → `UNDER_PROCESS` → `TRANSFERRED` / `ESCALATED` → `DISPOSED` → `CLOSED`.
   - Immutable chronological audit trail (`CaseAction` records) created for assignments, transfers, escalations, and disposals.
   - Dynamic SLA evaluation with approaching-deadline warnings (< 7 days) and overdue tracking based on configured priority windows (Urgent: 15d, High: 30d, Medium: 45d, Low: 60d).
4. **Hierarchical Institution Matching & Safe Disambiguation**:
   - Multi-stage matching: Exact AICTE Permanent ID (100%), Exact Canonical Name (100%), Verified Alias (98%), RapidFuzz Fuzzy Token Match.
   - 10% ambiguity safety margin prevents silent erroneous merging of similarly named institutions into review queues.
5. **Analytics & Genuine Multi-Worksheet Excel Export**:
   - Executive dashboard KPIs, bureau workload breakdown, status distribution, and pending ageing analysis.
   - Direct download of verified multi-worksheet `.xlsx` reports with formula explanations and synthetic data disclaimers.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 19, Vite, TypeScript, Tailwind CSS, Lucide React, React Router v7, Axios, Recharts |
| **Backend** | Python 3.11+, FastAPI, Uvicorn, SQLAlchemy 2.0, Pydantic v2, RapidFuzz, Pandas, OpenPyXL |
| **Database** | SQLite (WAL mode, foreign key enforcement; fully structured for PostgreSQL migration) |
| **Testing** | Pytest, FastAPI TestClient, Browser Subagent recording |

---

## 📦 Project Structure

```text
SIH26264/
├── backend/
│   ├── app/
│   │   ├── api/routes/          # REST API endpoints (health, dashboard, institutions, cases, overlaps, reports, matching)
│   │   ├── core/                # Configuration settings, database connection & session
│   │   ├── models/              # Normalized SQLAlchemy ORM models
│   │   ├── schemas/             # Pydantic schemas (Request/Response DTOs)
│   │   ├── services/            # Core business logic (matching, overlap, sla, workflow, reports, audit)
│   │   └── main.py              # FastAPI application entrypoint with CORS
│   ├── tests/
│   │   └── test_backend.py      # Automated pytest suite (13 unit/integration tests)
│   ├── aicte_complaints.db      # Local SQLite database
│   └── requirements.txt         # Python dependencies
├── frontend/
│   ├── src/
│   │   ├── components/layout/   # Layout shell, persistent Sidebar, compact Header
│   │   ├── pages/               # 8 Core views (Overview, Institutions, Institution 360, Cases, Case Details, Overlaps, Workflow, Reports, Data Quality)
│   │   ├── services/api.ts      # Axios API client
│   │   ├── types/index.ts       # TypeScript domain models
│   │   ├── App.tsx              # React router definitions
│   │   └── main.tsx             # Application bootstrap
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.ts           # Vite server with backend API proxy
├── config/                      # Configurable rules (workflow_rules.json, sla_rules.json, overlap_rules.json)
├── data/                        # Exported synthetic CSV datasets (institutions, cases, actions)
├── scripts/
│   └── generate_demo_data.py    # Deterministic synthetic data generator (seed = 42)
├── SPEC.md                      # Detailed technical specification
└── README.md
```

---

## ⚡ Quick Start & Run Instructions

### 1. Prerequisites
- **Python 3.11+** installed (`python --version`)
- **Node.js 18+** & npm installed (`node --version`)

### 2. Backend Setup & Startup
```powershell
# Navigate to project root
cd d:\SIH26264

# Install Python requirements
pip install -r backend/requirements.txt

# (Optional) Regenerate or reset synthetic demonstration database (60 institutions, ~505 cases)
python -m scripts.generate_demo_data

# Start FastAPI backend server
python -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8080 --reload
```
*API Swagger Documentation will be live at:* `http://127.0.0.1:8080/docs`

### 3. Frontend Setup & Startup
```powershell
# Navigate to frontend folder
cd d:\SIH26264\frontend

# Install node dependencies
npm install

# Start Vite React development server
npm run dev
```
*Frontend Application will be live at:* `http://localhost:5173/`

### 4. Running Automated Tests
```powershell
cd d:\SIH26264
python -m pytest backend/tests/test_backend.py -v
```
*All 13 automated tests run against an in-memory test database and verify matching, cross-bureau overlap detection, state transitions, case transfer histories, escalation alerts, SLA calculations, and Excel exports.*

---

## 🎯 100-Second Demonstration Scenario (Walkthrough Guide)

| Scene | Action | Target View | Expected Result |
|---|---|---|---|
| **Scene 1** | Land on Central Overview Dashboard | `/` | 8 real KPI counters populate; Recharts charts display bureau workload, status breakdown, and pending ageing; Overlap Alert callout displays active flagged colleges. |
| **Scene 2** | Open Cases and filter by "Fictional Institution Alpha" | `/cases` | Displays synthetic PGRC Case (`CASE-2026-00001` - Fee/Capitation Grievance) and RB Case (`CASE-2026-00002` - Unauthorized Intake). |
| **Scene 3** | Inspect Case Details | `/cases/CASE-2026-00001` | Displays target SLA date, handling bureau (`BUR-PGRC`), assigned officer, and chronological action history timeline. |
| **Scene 4** | Open Cross-Bureau Overlap Hub | `/overlaps` | Rule-based engine flags `OVR-2026-0048` for Fictional Institution Alpha with "Potential Overlapping Cases — Coordination Required". |
| **Scene 5** | Inspect Side-by-Side Comparison | `/overlaps` | Side-by-side cards compare PGRC Case vs RB Case (receipt dates, officers, last actions, upcoming steps). |
| **Scene 6** | Execute Inter-Bureau Linkage | Modal on `/overlaps` | Click **Link Related Cases**, designate Regulation Bureau (RB) as Lead Bureau, record coordination strategy, and confirm. |
| **Scene 7** | Open Institution 360 Dossier | `/institutions/INST-1001` | Aggregates full multi-bureau profile: participating bureaus (`BUR-PGRC`, `BUR-RB`), unified chronological action timeline, and active overlap indicator. |
| **Scene 8** | Review Inter-Bureau Workflow & Transfers | `/workflow` | Pipeline displays active transferred cases and escalated cases under Senior Management review. |
| **Scene 9** | Review Analytics & Excel Export | `/reports` | Displays calculated disposal rate (`24.6%`), bureau workload performance, and generates genuine multi-sheet `.xlsx` file download. |
| **Scene 10** | Inspect Data Quality Sandbox | `/data-quality` | Demonstrates RapidFuzz fuzzy token disambiguation preventing misspelled institution submissions from silently merging into existing records. |

---

## 🔒 Synthetic Data & Sandbox Disclaimer
This application has been developed solely as an engineering prototype for the Smart India Hackathon (SIH26264). All data—including institution names, permanent IDs, complaint narratives, and officer identities—is synthetic and generated for demonstration purposes. It does not connect to live AICTE government databases or disclose confidential citizen grievance records. Overlap detection is decision-support tooling designed to facilitate inter-bureau coordination, not an automated finding of institutional wrongdoing.

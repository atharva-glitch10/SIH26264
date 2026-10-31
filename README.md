# AICTE Integrated Institution Complaint Monitoring Dashboard (SIH26264)

![React](https://img.shields.io/badge/Frontend-React%2019%20%7C%20Vite%20%7C%20TypeScript-blue)
![FastAPI](https://img.shields.io/badge/Backend-FastAPI%20%7C%20Python%203.11%2B-teal)
![DB](https://img.shields.io/badge/Database-SQLite%20%7C%20PostgreSQL-orange)
![Docker](https://img.shields.io/badge/Deploy-Docker%20Compose-2496ED)
![Status](https://img.shields.io/badge/Data-Synthetic%20prototype-lightgrey)

A full-stack prototype for **Smart India Hackathon 2026, Problem Statement SIH26264**: *Integrated Dashboard for Monitoring and Tracking Institution-Related Complaint Cases Across AICTE Bureaus/Cells* (Technology bucket: **Smart Automation**).

---

## Table of Contents

1. [The Problem](#the-problem)
2. [The Solution](#the-solution)
3. [Feature Overview](#feature-overview)
4. [How It Works](#how-it-works)
5. [Technology Stack](#technology-stack)
6. [Project Structure](#project-structure)
7. [Getting Started](#getting-started)
8. [Configuration](#configuration)
9. [Demo Accounts and Roles](#demo-accounts-and-roles)
10. [Application Pages](#application-pages)
11. [REST API](#rest-api)
12. [Data Model](#data-model)
13. [Workflow State Machine](#workflow-state-machine)
14. [Measured Accuracy](#measured-accuracy)
15. [Testing](#testing)
16. [Demo Walkthrough](#demo-walkthrough)
17. [Security Notes](#security-notes)
18. [Further Documentation](#further-documentation)
19. [Disclaimer](#disclaimer)

---

## The Problem

AICTE receives grievances, regulatory issues and complaints about technical institutions across several bureaus and cells:

| Unit | Typical matters |
|---|---|
| **RB** (Regulation Bureau) | Regulatory compliance, approvals, affiliation, intake irregularities, non-adherence to AICTE norms |
| **PGRC** (Public Grievance Redressal Cell) | Student/faculty grievances, fee overcharging, capitation fee, withheld certificates, harassment |
| **Approval Bureau** | Annual intake approvals, course variations, NOCs |
| **Vigilance Cell** | Ethical complaints, capitation-fee violations, inquiry boards |
| **Regional Offices** | Northern, Southern, Western, Eastern, ... |

Each unit tracks its own cases. Nobody sees the whole picture for a given institution, so the **same institution can be investigated by RB and PGRC at the same time without either knowing**. The result is duplicated effort, conflicting actions, delayed resolution and administrative opacity.

## The Solution

A **single-window, institution-wise monitoring dashboard** that pulls every complaint from every bureau into one place and automates the error-prone steps:

```
 Ingest  ─►  Link to institution  ─►  Classify & deduplicate  ─►  Dashboard & alerts
 (form,      (Permanent ID, alias,     (category + confidence,      (cross-bureau overlaps,
  Excel,      fuzzy match with          priority hint, duplicate     SLA monitor, risk score,
  API)        ambiguity guard)          detection across bureaus)    repeat offenders)
```

Everything runs offline in pure Python: no external AI service, no heavy ML framework.

---

## Feature Overview

| PS requirement | How it is met |
|---|---|
| Central dashboard across all bureaus | Overview KPIs, bureau workload, status distribution, ageing, monthly trends, regional spread, state hotspots, smart-automation panel |
| Institution-wise view | **Institution 360°**: every case from every bureau, unified timeline, bureau involvement and an explainable **risk score** |
| Integration layer | **Bulk CSV/Excel import** (flexible headers, dry-run, idempotent) and a **machine-to-machine intake API** (`X-API-Key`) for CPGRAMS / portals / bureau software |
| Auto-linking to institutions | Permanent ID, canonical name, verified alias, then fuzzy match weighted on distinctive words. Ambiguous names go to a **review queue** and are never silently merged |
| Complaint categorisation (NLP) | Naive Bayes classifier with confidence and evidence words. Officer corrections retrain it |
| Duplicate detection | Paraphrase-tolerant similarity, same complainant and date proximity, **across all bureaus**. Officers confirm or dismiss |
| Cross-bureau overlap alerts | Rule A/B/C/D engine that flags concurrent investigations of one institution and supports Link / Lead-bureau / Resolve / Dismiss |
| Repeat offenders and overdue cases | 0-100 risk score with reasons, repeat-offender flag, **background SLA monitor** (reminders, breaches, stagnant cases, auto-escalation) |
| Workflow and action history | Validated state machine, transfers with rationale, escalations, immutable action log and audit trail |
| Role-based access | JWT login. Everyone can **view** everything, officers can **act** only on their own bureau's cases, regional officers are read-only |
| Reporting | Analytics page and genuine multi-sheet **Excel (.xlsx)** export |
| Public tracking | Complainants can look up a complaint's status at `/track` without logging in (minimal fields only) |

---

## How It Works

### Smart intake pipeline (`services/intake_service.py`)
Every complaint, whether from the UI form, a bulk import or the external API, runs through the same pipeline:

| Step | Module | Behaviour |
|---|---|---|
| **Link** | `matching_service.py`, `text_utils.py` | Exact Permanent ID / canonical name / verified alias, then fuzzy match (70% distinctive words + 30% full name, abbreviations such as *Engg, Instt, Mgmt* expanded). Auto-link at score ≥ 90 with a ≥ 10-point lead over the runner-up; otherwise the case is created as `PENDING_REVIEW` and queued. Unknown institutions are rejected |
| **Classify** | `nlp_service.py`, `nlp_seed.py` | Multinomial Naive Bayes (unigrams + bigrams) with confidence and evidence words. An officer-entered category always wins; corrections (`category_source = MANUAL`) retrain the model |
| **Prioritise** | `nlp_service.suggest_priority` | Safety terms → URGENT, high-impact terms → HIGH, otherwise MEDIUM (only when no priority is given) |
| **Deduplicate** | `nlp_service.score_duplicate` | Against that institution's cases in **all** bureaus (180-day look-back): 70% text similarity + 20% same complainant + 7% same category + 3% date proximity. Flag at ≥ 60 as a proposed `DUPLICATE_SUBMISSION` link plus notifications |
| **Overlap scan** | `overlap_service.py` | Re-evaluates the institution and creates or updates overlap alerts |

### Institution matching priority
1. **AICTE Permanent ID** exact match (score 100, auto-linked)
2. **Exact canonical name** after normalisation (100, auto-linked)
3. **Verified alias** (98, auto-linked)
4. **RapidFuzz** fuzzy match. ≥ 90 with a > 10-point gap auto-links; 75-89 or an ambiguous top two go to the review queue; < 75 is unmatched

### Cross-bureau overlap engine (`overlap_rules_engine.py`)
Overlap detection is **decision support**. It flags a coordination need; it never declares fraud or guilt.

- **Rule A**: ≥ 2 active cases handled by ≥ 2 distinct bureaus for one institution (MEDIUM, HIGH when priorities are high)
- **Rule B**: cross-bureau cases in the same or a related category cluster, from `category_clusters` in config (HIGH)
- **Rule C**: description similarity above the configured threshold after institution names and aliases are removed (CRITICAL)
- **Rule D**: alerts are keyed by institution + set of active bureaus, so repeat scans update an open alert instead of spamming new ones; the key expands when another bureau joins
- **Lifecycle**: Review → Link cases → Assign lead bureau → Resolve (remark required) or Dismiss (justification required)

### SLA monitor (`sla_rules_engine.py`, `sla_monitor_service.py`)
Runs every `SLA_SCAN_INTERVAL_MINUTES` in the background and on demand via `POST /api/v1/alerts/run-sla-scan`:

| Priority | Resolution SLA |
|---|---|
| URGENT | 15 days |
| HIGH | 30 days |
| MEDIUM | 45 days |
| LOW | 60 days |

- Deadline reminders at 7, 3 and 1 days
- Breach alert once overdue
- Stagnant-case alert after 14 days without an action
- Unacknowledged-transfer alert after 5 days
- Auto-escalation when elapsed time reaches `escalation_threshold_ratio` × the SLA window
- Each alert is sent only once

### Institution risk score (`risk_engine.py`)
A 0-100 sum of capped, explainable components: complaint volume (12 months), number of active bureaus, overdue and escalated cases, high/urgent complaints, repeated same-category complaints, and unresolved overlap. **HIGH ≥ 60, MEDIUM ≥ 30.** An institution is a *repeat offender* with ≥ 5 complaints in 12 months or ≥ 3 in one category. The UI shows the reasons behind every score.

---

## Technology Stack

| Layer | Technologies |
|---|---|
| Frontend | React 19, Vite, TypeScript, Tailwind CSS 3, Framer Motion, Lucide icons, React Router 7, Axios, Recharts |
| Backend | Python 3.11+, FastAPI, SQLAlchemy 2, Pydantic 2, RapidFuzz, Pandas, OpenPyXL, PyJWT |
| NLP | Pure-Python Naive Bayes plus paraphrase-tolerant similarity (runs offline) |
| Database | SQLite by default, PostgreSQL via `DATABASE_URL` |
| Auth | JWT bearer tokens, PBKDF2-SHA256 password hashing |
| Deployment | Docker Compose (nginx + FastAPI), optional Postgres profile |
| Tooling | pytest, httpx, Oxlint |

---

## Project Structure

```text
SIH26264/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   ├── deps.py              # auth dependency + role-based permission rules
│   │   │   └── routes/              # auth, dashboard, institutions, cases, overlaps, matching,
│   │   │                            # alerts, reports, imports, intake, public, health
│   │   ├── core/                    # config, database, security (JWT/PBKDF2), ids, migrations
│   │   ├── models/                  # SQLAlchemy ORM models
│   │   ├── schemas/                 # Pydantic request/response models
│   │   ├── services/
│   │   │   ├── intake_service.py    # smart intake pipeline (link → classify → dedupe → alert)
│   │   │   ├── import_service.py    # CSV/Excel bulk import
│   │   │   ├── nlp_service.py       # classifier, duplicate scoring, priority hints
│   │   │   ├── nlp_seed.py          # classifier seed phrases
│   │   │   ├── text_utils.py        # normalisation, name matching, similarity
│   │   │   ├── overlap_rules_engine.py / overlap_service.py
│   │   │   ├── sla_rules_engine.py / sla_monitor_service.py / sla_service.py
│   │   │   ├── risk_engine.py       # explainable risk score + repeat offender
│   │   │   └── matching, workflow, institution, complaint, report, audit, notification
│   │   └── main.py
│   └── tests/                       # conftest, test_backend, test_smart_features, test_pure_logic
├── frontend/src/
│   ├── context/AuthContext.tsx      # login state and permissions
│   ├── components/
│   │   ├── ui/                      # design-system kit (Button, Card, Modal, Field, Badge, Toast, ...)
│   │   ├── layout/                  # Sidebar, Header, Footer, Layout
│   │   ├── case/                    # SmartIntakeModal, SmartCasePanel
│   │   ├── dashboard/               # SmartAutomationPanels, ModelMetricsCard
│   │   └── legal/                   # TermsAcceptanceModal
│   ├── pages/                       # Login, Overview, Institutions, Institution360, Cases, CaseDetails,
│   │                                # OverlapAlerts, Workflow, ImportData, Reports, DataQuality, Settings,
│   │                                # TrackComplaint, DesignSystem, legal/ (Terms, Privacy), NotFound
│   ├── services/ types/ lib/ i18n.ts
├── config/                          # overlap_rules.json, sla_rules.json, workflow_rules.json
├── data/
│   ├── eval/                        # labelled test sets for the evaluation script
│   ├── sample_imports/              # messy PGRC (.csv) and RB (.xlsx) demo batches
│   ├── evaluation_report.json       # latest measured accuracy
│   └── synthetic_*.csv              # exported demo data
├── scripts/
│   ├── generate_demo_data.py        # seeds 60 institutions, ~510 cases, officers, duplicates, SLA alerts
│   ├── evaluate_models.py           # measures matching / classification / duplicate detection
│   └── cpgrams_sync_mock.py         # mock external system pushing complaints to the intake API
├── docker/                          # nginx.conf, backend-entrypoint.sh
├── docker-compose.yml, Dockerfile.backend, Dockerfile.frontend
├── .env.example
├── SPEC.md                          # technical specification (section 11 = v2.0 additions)
└── CHANGES.md                       # what changed in v2.0 and why
```

---

## Getting Started

### Option 1: Docker (one command)

```bash
docker compose up --build
```

- UI: http://localhost:8000
- API docs (Swagger): http://localhost:8080/docs

The backend seeds synthetic demo data on first start only and never wipes a database that already has cases. For PostgreSQL, see the comment at the top of `docker-compose.yml` (`docker compose --profile postgres up --build`).

### Option 2: Local development

**Prerequisites:** Python 3.11+ and Node.js 18+.

```bash
# from the project root
python -m venv .venv
# Windows: .venv\Scripts\activate      macOS/Linux: source .venv/bin/activate
pip install -r backend/requirements.txt

# (optional) copy and edit configuration
cp .env.example .env

# Seed demo data (wipes and recreates the local database), then measure the models
python -m scripts.generate_demo_data

# Start the API: Swagger docs at http://127.0.0.1:8080/docs
python -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8080 --reload
```

In a second terminal:

```bash
cd frontend
npm install
npm run dev        # http://localhost:5173
```

Other frontend scripts: `npm run build` (type-check and production build), `npm run lint`, `npm run preview`.

> Upgrading from v1? Just start the backend: new columns are added automatically at startup (`core/migrations.py`) and existing officers get the demo password. For the full demo (duplicates, SLA alerts, evaluation report) re-run `python -m scripts.generate_demo_data`.

---

## Configuration

Copy `.env.example` to `.env` in the project root. All values are optional for local demos.

| Variable | Default | Purpose |
|---|---|---|
| `DATABASE_URL` | SQLite file in `backend/` | Use `postgresql+psycopg2://user:pass@host:5432/db` for PostgreSQL |
| `SECRET_KEY` | demo value | JWT signing key. **Change it for any real use** |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | `480` | Login token lifetime |
| `DEMO_MODE` | `true` | Shows demo officer accounts and password on the login screen |
| `DEMO_PASSWORD` | `Aicte@2026` | Password assigned to seeded demo officers |
| `INTAKE_API_KEY` | empty | Enables the `X-API-Key` header for the intake API. Empty disables it |
| `SLA_MONITOR_ENABLED` | `true` | Background SLA scan on/off |
| `SLA_SCAN_INTERVAL_MINUTES` | `15` | SLA scan frequency |
| `CORS_ORIGINS` | `localhost:5173` origins | Comma-separated allowed origins |

Business rules live in `config/` and need no code changes:

- `overlap_rules.json`: rule toggles and thresholds, category clusters, matching thresholds, duplicate weights and look-back, classifier confidence
- `sla_rules.json`: SLA days per priority, reminder windows, stagnant/transfer thresholds, auto-escalation ratio
- `workflow_rules.json`: bureaus, statuses and allowed transitions

---

## Demo Accounts and Roles

All demo officers use the password **`Aicte@2026`** (shown on the login screen while `DEMO_MODE=true`).

| Officer ID | Role | Can change |
|---|---|---|
| `USR-SUPER-01` | Super Admin | Everything |
| `USR-MGMT-01` | Senior Management | Any case, overlap decisions, imports |
| `USR-PGRC-01` | PGRC Bureau Officer | PGRC cases, PGRC imports |
| `USR-RB-01` | RB Bureau Officer | RB cases, RB imports |
| `USR-REG-NORTH` | Regional Officer | Read-only |

Permission model: all signed-in officers can **view** every bureau's cases (cross-bureau visibility is the point); **changes** are scoped to the officer's own bureau. The acting user always comes from the token, never from the request body. A first-login Terms of Use acceptance is recorded per user.

---

## Application Pages

| Route | Page | Purpose |
|---|---|---|
| `/login` | Login | JWT sign-in, demo accounts hint |
| `/` | Overview | KPI cards, bureau workload, status distribution, ageing, trends, smart-automation panel, highest-risk institutions, state hotspots |
| `/institutions` | Institutions | Searchable list with region, type, risk and repeat-offender filters |
| `/institutions/:id` | Institution 360° | Full dossier, bureau involvement, active cases, unified timeline, risk reasons |
| `/cases` | Cases | Filterable table, SLA status pills, smart "File New Complaint" modal with live suggestions |
| `/cases/:id` | Case Details | SLA countdown, action timeline, transfer / escalate / dispose / close, duplicate decision, category confirmation |
| `/overlaps` | Overlap Alerts | Side-by-side case comparison, link, lead bureau, resolve, dismiss |
| `/workflow` | Workflow and Transfers | Transfer log, pending handovers, escalation monitor |
| `/import` | Bulk Import | CSV/Excel upload with dry-run validation, per-row results, batch history, template download |
| `/reports` | Reports and Analytics | Bureau performance, regional compliance, measured model accuracy, authenticated Excel export |
| `/data-quality` | Data Quality | Fuzzy-match review queue, alias learning |
| `/settings` | Settings | User and system preferences |
| `/track` | Track Complaint | **Public** status lookup by complaint reference (no login) |
| `/terms`, `/privacy` | Legal | Public Terms of Use and Privacy Notice |
| `/design-system` | Design System | Live preview of the UI kit |

---

## REST API

Base path `/api/v1`. Interactive docs at `/docs` (Swagger). Everything except health, login, the public tracker and the intake API requires a Bearer token.

| Module | Endpoints |
|---|---|
| **Health** | `GET /health` |
| **Auth** | `POST /auth/login`, `GET /auth/me`, `POST /auth/accept-terms`, `GET /auth/demo-accounts` |
| **Dashboard** | `GET /dashboard/summary`, `/bureau-workload`, `/status-distribution`, `/region-distribution`, `/ageing`, `/trends`, `/automation`, `/hotspots` |
| **Institutions** | `GET/POST /institutions`, `GET/PATCH /institutions/{id}`, `GET /institutions/{id}/cases`, `GET /institutions/{id}/timeline` |
| **Cases** | `GET/POST /cases`, `GET/PATCH /cases/{id}`, `POST /cases/{id}/assign`, `/transfer`, `/escalate`, `/dispose`, `/close`, `/duplicate-decision`, `GET/POST /cases/{id}/actions` |
| **Overlaps** | `GET /overlaps`, `POST /overlaps/scan`, `GET /overlaps/{id}`, `POST /overlaps/{id}/review`, `/link-cases`, `/resolve`, `/dismiss` |
| **Matching** | `POST /matching/match`, `GET /matching/review-queue`, `POST /matching/{id}/review` |
| **Alerts** | `GET /alerts`, `PATCH /alerts/{id}/read`, `POST /alerts/run-sla-scan` |
| **Reports** | `GET /reports/summary`, `/reports/model-metrics`, `/reports/export` (`.xlsx`) |
| **Imports** | `GET /imports/template`, `POST /imports/upload`, `GET /imports`, `GET /imports/{id}` |
| **Intake** | `POST /intake/preview`, `POST /intake/complaints`, `POST /intake/complaints/batch` (Bearer token or `X-API-Key`) |
| **Public** | `GET /public/status/{complaint_reference}` (no auth, minimal fields) |

### External intake API example

`scripts/cpgrams_sync_mock.py` mocks a CPGRAMS sync: it reads `data/sample_imports/pgrc_october_2026_batch.csv` (or a path you pass) and posts the rows to `/api/v1/intake/complaints/batch` using the `INTAKE_API_KEY` environment variable.

```bash
# set INTAKE_API_KEY=my-secret-key in .env, restart the backend, then:
python -m scripts.cpgrams_sync_mock [csv] [--url http://127.0.0.1:8080]

# or a single complaint:
curl -X POST http://127.0.0.1:8080/api/v1/intake/complaints \
  -H "X-API-Key: my-secret-key" -H "Content-Type: application/json" \
  -d '{"institution_name":"Aryabhata Instt of Tech & Mgmt","source_bureau_id":"BUR-PGRC",
       "description":"College demanding donation of 2 lakh for admission","external_reference":"CPGRAMS/2026/123"}'
```

Re-sending a row whose `external_reference` already exists for that bureau is skipped, so the integration is idempotent.

---

## Data Model

Normalised SQLAlchemy models (full column-level detail in [`SPEC.md`](SPEC.md) section 3):

| Table | Purpose |
|---|---|
| `institutions`, `institution_aliases` | Institution master data (AICTE Permanent ID, type, region, state) and verified name variants |
| `bureaus`, `users` | AICTE units and officers with roles (`SUPER_ADMIN`, `BUREAU_OFFICER`, `REGIONAL_OFFICER`, `SENIOR_MANAGEMENT`) |
| `cases`, `case_actions` | Complaint cases and their immutable action history |
| `related_cases` | Links between cases (`CROSS_BUREAU_OVERLAP`, `SAME_ISSUE`, `DUPLICATE_SUBMISSION`, `CONCURRENT_INVESTIGATION`) with a proposed/confirmed/dismissed decision |
| `overlap_alerts`, `overlap_alert_cases` | Cross-bureau coordination alerts and the cases they cover |
| `notifications` | In-app overlap, duplicate, SLA, escalation and transfer alerts |
| `audit_logs` | Before/after snapshots of every change |
| `matching_review_queue` | Ambiguous institution matches awaiting an officer's decision |

Case columns added in v2.0 for smart intake: `complainant_name`, `complainant_contact`, `intake_channel`, `external_reference`, `raw_institution_name`, `institution_match_status`, `institution_match_score`, `category_source`, `category_confidence`, `duplicate_of_case_id`, `duplicate_score`.

---

## Workflow State Machine

```
RECEIVED ─► PENDING ─► UNDER_PROCESS ─► DISPOSED ─► CLOSED
               │            │  ▲            │
               │            ▼  │            └─► reopen (authorised, reason required)
               └─► TRANSFERRED / ESCALATED ──┘
```

Allowed transitions are defined in `config/workflow_rules.json` and enforced by `workflow_service.py`. Transfers keep the origin bureau and a reason, escalations record a reason and raise an alert, and disposing a case requires a disposal remark and writes an immutable action record in a single transaction.

---

## Measured Accuracy

Run `python -m scripts.evaluate_models`. Results are written to `data/evaluation_report.json` and shown on the **Reports** page.

| Component | Test set | Result |
|---|---|---|
| Complaint categorisation | 70 held-out complaints | **92.9% accuracy**, top-2 accuracy 100%, macro-F1 0.929 |
| Duplicate detection | 35 labelled pairs | **Precision 1.00, recall 0.87**, F1 0.93 (0 false positives) |
| Institution auto-linking | 180 noisy name variants + 8 unknown colleges | 85% auto-linked with **100% precision** (0 wrong merges); 11% sent to review; 0 of 8 unknown colleges wrongly linked; 96% correct end to end |

> These numbers come from synthetic data (the duplicate threshold was tuned on the same pair set). Re-measure on real, labelled AICTE data before any deployment.

---

## Testing

```bash
python -m pytest backend/tests -v
```

- `test_pure_logic.py`: database-free tests for the classifier, similarity, duplicate scoring, name ranking, overlap rules, SLA rules and risk score
- `test_smart_features.py`: intake, duplicates, overlap rules, SLA monitor, risk, bulk import, login, RBAC and token-based actor
- `test_backend.py`: core API behaviour, including per-user terms acceptance

---

## Demo Walkthrough

About three minutes, using the seeded data.

| # | Action | What to point out |
|---|---|---|
| 1 | Sign in as **PGRC officer** (`USR-PGRC-01`) | Role-based access; header shows officer and bureau |
| 2 | **Overview** | KPIs, *Smart Automation at Work* (auto-linked, auto-categorised, duplicates, SLA alerts, auto-escalations), highest-risk institutions, state hotspots |
| 3 | **Cases → File New Complaint**: type *"Aryabhata Instt. of Tech & Mgmt"* and *"college demanding donation of 2 lakh, no receipt"* | Live panel: institution matched, category *Fee Related* with confidence and evidence words, priority HIGH, possible duplicates |
| 4 | **Bulk Import** → `data/sample_imports/pgrc_october_2026_batch.csv` → *Validate*, then *Import* | Per-row results: auto-linked, sent to review ("Bhabha Instt" is ambiguous), rejected (unknown college, bad date), re-sent row skipped |
| 5 | Sign in as **RB officer**, import `rb_october_2026_batch.xlsx` | The RB complaint about Aryabhata is flagged as a **duplicate of the PGRC case** and a **new cross-bureau overlap alert** appears |
| 6 | Open the duplicate case | *Smart Intake Results*: confirm/dismiss the duplicate, confirm category (retrains the classifier) |
| 7 | Open a PGRC case while signed in as RB | **View only**: cross-bureau visibility without cross-bureau editing |
| 8 | **Overlap Alerts** | Rules A/B/C explanation, side-by-side cases, link with a lead bureau |
| 9 | **Institutions → Sort by Risk / Repeat Offenders → Institution 360** | Risk score with reasons ("+10 repeated 'Fee Related Grievances' complaints") |
| 10 | **Data Quality** | Approve the "Bhabha Instt" match; the pending case becomes confirmed and an alias is learned |
| 11 | **Reports** | Measured accuracy card and authenticated Excel export |

---

## Security Notes

- JWT authentication with PBKDF2-SHA256 password hashing; CORS limited to configured origins
- Actor identity is taken from the token only, so one officer cannot act as another
- Bureau-scoped write permissions; regional officers are read-only
- Every change is recorded in `audit_logs` with before/after snapshots
- The public tracker exposes only minimal status fields

Before real use: set `DEMO_MODE=false`, use a strong `SECRET_KEY`, set real officer passwords, switch to PostgreSQL, serve over HTTPS and re-measure the models on real data.

---

## Further Documentation

- [`SPEC.md`](SPEC.md): full technical specification (schema, state machine, rule matrix, API table, v2.0 additions)
- [`CHANGES.md`](CHANGES.md): what changed in v2.0 and why
- `/docs` on the running backend: interactive OpenAPI documentation

## Disclaimer

All institutions, officers, complainants and complaints are **synthetic**. The prototype is not connected to any AICTE system. Overlap and duplicate flags are decision support for officers, not findings of wrongdoing.

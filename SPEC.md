# SPECIFICATION: AICTE Integrated Institution Complaint Monitoring & Status Dashboard (SIH26264)

## 1. System Overview & Problem Formulation
AICTE (All India Council for Technical Education) receives grievances, regulatory issues, and complaints concerning technical institutions across various bureaus:
- **RB (Regulation Bureau)**: Regulatory compliance, approvals, affiliation, intake irregularities, non-adherence to AICTE norms.
- **PGRC (Public Grievance Redressal Cell)**: Student/faculty grievances, fee overcharging, capitation fees, certificates withholding, harassment.
- **Other Cells/Bureaus**: Fin (Finance/Scholarship), Approvals Bureau, Vigilance Cell.
- **Regional Offices/Centres**: Northern, Southern, Western, Eastern, etc.

Without centralized cross-bureau visibility, the same institution may undergo concurrent, uncoordinated investigations by RB and PGRC, causing duplication of effort, conflicting actions, delayed resolution, and administrative opacity.

This application provides a **Single-Window Centralized Monitoring Dashboard** with **Rule-Based Cross-Bureau Overlap Detection**, **Institution 360° Profile**, **Workflow & Action History**, **SLA/Escalation Engine**, and **Analytical Reporting with Excel Exports**.

---

## 2. Architecture & Monorepo Layout
```
SIH26264/
  backend/
    app/
      core/           # Settings, DB session, event handlers, logging
      models/         # Normalized SQLAlchemy ORM models
      schemas/        # Pydantic schemas (Request/Response DTOs)
      services/       # Business logic (matching, overlap, sla, reports, audit)
      api/routes/     # REST Endpoints under /api/v1
      main.py         # FastAPI application entrypoint
    tests/            # Pytest test suite
    requirements.txt  # Python dependencies
  frontend/
    src/
      components/     # UI primitives, layout, domain widgets
      pages/          # 8 Core Views + Detail pages + NotFound
      services/       # Axios API client
      types/          # TypeScript interfaces matching backend DTOs
      lib/            # Utility functions (formatting, dates, classes)
    package.json
    vite.config.ts
  config/             # JSON configs for rules (workflow, SLA, overlap)
  data/               # CSV exports of synthetic datasets
  scripts/            # Reproducible data generation scripts
  SPEC.md
  README.md
```

---

## 3. Database Schema & Data Models

### 3.1 Institutions (`institutions`)
- `institution_id` (PK, String, e.g. `INST-1001`)
- `aicte_permanent_id` (Unique, String, e.g. `1-4329811`)
- `canonical_name` (String, indexed)
- `normalized_name` (String, lower-cased & alphanumeric-stripped)
- `institution_type` (Enum: Technical University, Autonomous College, Engineering College, Polytechnic Institute, Management Institute)
- `region` (Enum: Northern, North-West, Eastern, Western, Southern, South-West, Central)
- `state` (String)
- `district` (String)
- `address` (Text)
- `contact_email` (String)
- `created_at` (DateTime, UTC)
- `updated_at` (DateTime, UTC)

### 3.2 Institution Aliases (`institution_aliases`)
- `alias_id` (PK, Integer, autoincrement)
- `institution_id` (FK -> `institutions.institution_id`)
- `alias_name` (String)
- `normalized_alias` (String)
- `source` (String: e.g. "Complaint Submission", "Historical DB")
- `verification_status` (Enum: VERIFIED, PENDING_REVIEW, REJECTED)

### 3.3 Bureaus (`bureaus`)
- `bureau_id` (PK, String: e.g. `BUR-RB`, `BUR-PGRC`, `BUR-APP`, `BUR-VIG`)
- `bureau_code` (Unique, e.g. `RB`, `PGRC`, `APPROVAL`, `VIGILANCE`)
- `bureau_name` (String: e.g. "Regulation Bureau", "Public Grievance Redressal Cell")
- `active` (Boolean)

### 3.4 Users (`users`)
- `user_id` (PK, String, e.g. `USR-RB-01`)
- `display_name` (String)
- `role` (Enum: SUPER_ADMIN, BUREAU_OFFICER, REGIONAL_OFFICER, SENIOR_MANAGEMENT)
- `bureau_id` (FK -> `bureaus.bureau_id`, nullable for multi-bureau admins)
- `active` (Boolean)

### 3.5 Cases (`cases`)
- `case_id` (PK, String, e.g. `CASE-2026-00101`)
- `complaint_reference` (Unique, String, e.g. `AICTE/PGRC/2026/0042`)
- `institution_id` (FK -> `institutions.institution_id`, indexed)
- `source_bureau_id` (FK -> `bureaus.bureau_id`)
- `current_bureau_id` (FK -> `bureaus.bureau_id`)
- `assigned_user_id` (FK -> `users.user_id`, nullable)
- `category` (Enum: Academic & Examination, Infrastructure & Facilities, Faculty & Staffing, Regulatory Compliance, Admission Grievances, Fee Related Grievances, General Institutional)
- `priority` (Enum: LOW, MEDIUM, HIGH, URGENT)
- `description` (Text)
- `status` (Enum: RECEIVED, PENDING, UNDER_PROCESS, TRANSFERRED, ESCALATED, DISPOSED, CLOSED)
- `received_at` (DateTime, UTC)
- `last_action_at` (DateTime, UTC)
- `last_action_summary` (String)
- `next_action` (String)
- `expected_disposal_at` (DateTime, UTC)
- `actual_disposal_at` (DateTime, UTC, nullable)
- `created_at` (DateTime, UTC)
- `updated_at` (DateTime, UTC)

### 3.6 Case Actions / History (`case_actions`)
- `action_id` (PK, Integer, autoincrement)
- `case_id` (FK -> `cases.case_id`, indexed)
- `action_type` (Enum: REGISTERED, ASSIGNED, STATUS_CHANGE, OFFICER_CHANGE, TRANSFERRED, ESCALATED, LINKED, COORDINATION_NOTE, DISPOSED, REOPENED)
- `previous_status` (String, nullable)
- `new_status` (String)
- `previous_bureau_id` (String, nullable)
- `new_bureau_id` (String, nullable)
- `actor_user_id` (FK -> `users.user_id`)
- `remarks` (Text)
- `next_action` (String, nullable)
- `created_at` (DateTime, UTC)

### 3.7 Related Cases (`related_cases`)
- `relationship_id` (PK, Integer, autoincrement)
- `source_case_id` (FK -> `cases.case_id`)
- `related_case_id` (FK -> `cases.case_id`)
- `relationship_type` (Enum: CROSS_BUREAU_OVERLAP, SAME_ISSUE, DUPLICATE_SUBMISSION, CONCURRENT_INVESTIGATION)
- `decision_status` (Enum: PROPOSED, CONFIRMED, DISMISSED)
- `reason` (Text)
- `created_by` (FK -> `users.user_id`)
- `created_at` (DateTime, UTC)

### 3.8 Overlap Alerts (`overlap_alerts`)
- `alert_id` (PK, String, e.g. `OVR-2026-0001`)
- `institution_id` (FK -> `institutions.institution_id`, indexed)
- `alert_type` (String: "CROSS_BUREAU_CONCURRENT_CASES", "SIMILAR_CATEGORY_MULTI_BUREAU")
- `severity` (Enum: LOW, MEDIUM, HIGH, CRITICAL)
- `status` (Enum: NEW, UNDER_REVIEW, COORDINATION_REQUIRED, LINKED_ACKNOWLEDGED, RESOLVED, DISMISSED)
- `explanation` (Text)
- `recommended_action` (Text)
- `resolution_reason` (Text, nullable)
- `lead_bureau_id` (FK -> `bureaus.bureau_id`, nullable)
- `reviewed_by` (FK -> `users.user_id`, nullable)
- `created_at` (DateTime, UTC)
- `reviewed_at` (DateTime, UTC, nullable)
- `resolved_at` (DateTime, UTC, nullable)

### 3.9 Overlap Alert Cases (`overlap_alert_cases`)
- `alert_id` (FK -> `overlap_alerts.alert_id`)
- `case_id` (FK -> `cases.case_id`)
- Primary Key: `(alert_id, case_id)`

### 3.10 System Notifications (`notifications`)
- `notification_id` (PK, Integer, autoincrement)
- `user_id` (FK -> `users.user_id`, nullable for broadcast)
- `bureau_id` (FK -> `bureaus.bureau_id`, nullable)
- `alert_type` (Enum: OVERLAP_DETECTED, SLA_APPROACHING, SLA_BREACHED, ESCALATION, TRANSFER_RECEIVED)
- `reference_id` (String: e.g. case_id or alert_id)
- `message` (String)
- `read_at` (DateTime, UTC, nullable)
- `created_at` (DateTime, UTC)

### 3.11 Audit Logs (`audit_logs`)
- `audit_id` (PK, Integer, autoincrement)
- `actor_user_id` (String)
- `entity_type` (String: "CASE", "INSTITUTION", "OVERLAP_ALERT", "ACTION")
- `entity_id` (String)
- `action` (String: "CREATE", "UPDATE", "TRANSFER", "ESCALATE", "DISPOSE", "LINK", "DISMISS", "RESOLVE")
- `before_snapshot` (JSON/Text, nullable)
- `after_snapshot` (JSON/Text, nullable)
- `timestamp` (DateTime, UTC)

### 3.12 Matching Queue (`matching_review_queue`)
- `match_id` (PK, Integer, autoincrement)
- `raw_input_name` (String)
- `normalized_input_name` (String)
- `candidate_institution_id` (FK -> `institutions.institution_id`)
- `confidence_score` (Float, 0-100)
- `matching_method` (Enum: EXACT_AICTE_ID, EXACT_CANONICAL, ALIAS_MATCH, FUZZY_RAPIDFUZZ)
- `decision_status` (Enum: PENDING, APPROVED, REJECTED)
- `reviewer_id` (FK -> `users.user_id`, nullable)
- `reviewed_at` (DateTime, UTC, nullable)
- `created_at` (DateTime, UTC)

---

## 4. Workflow State Machine & Allowed Transitions

```
                    +--------------+
                    |   RECEIVED   |
                    +-------+------+
                            | Assign / Verify
                            v
                    +-------+------+
      +------------>|   PENDING    |
      |             +-------+------+
      |                     | Start processing
      |                     v
      |             +-------+------+<-------------+
      | Transfer    |UNDER PROCESS |             |
      +-------------+---+------+---+             |
      |                 |      |                 | Reopen (Authorized)
      |                 |      | Escalate        |
      |                 |      v                 |
      |                 |   +--+-------+         |
      |                 |   |ESCALATED |         |
      |                 |   +--+-------+         |
      |                 |      |                 |
      |                 v      v                 |
      |             +---+------+---+             |
      +------------>|   DISPOSED   +-------------+
                    +-------+------+
                            | Formal closure
                            v
                    +-------+------+
                    |    CLOSED    |
                    +--------------+
```

### Transition Validation Rules:
1. `RECEIVED` -> `PENDING`, `UNDER_PROCESS`
2. `PENDING` -> `UNDER_PROCESS`, `TRANSFERRED`, `ESCALATED`
3. `UNDER_PROCESS` -> `TRANSFERRED`, `ESCALATED`, `DISPOSED`
4. `TRANSFERRED` -> `UNDER_PROCESS`, `PENDING` (must retain origin bureau & reason)
5. `ESCALATED` -> `UNDER_PROCESS`, `DISPOSED` (must record escalation reason and alert)
6. `DISPOSED` -> `CLOSED`, `REOPENED` (Reopening requires explicit authorization and reason)
7. Disposing a case requires `actual_disposal_at` timestamp, disposal remark, and creates an immutable `CaseAction` record inside a single DB transaction.

---

## 5. Cross-Bureau Overlap Detection Engine

### Decision-Support Principles:
- Overlap detection flags potential coordination needs between bureaus. It does NOT automatically declare fraud, guilt, or identical complaints.
- It prevents siloed investigations where RB and PGRC concurrently contact an institution on related matters without mutual knowledge.

### Rules Matrix:
1. **Rule A (Concurrent Multi-Bureau Active Cases)**:
   - Condition: Institution `I` has >= 2 active cases (`status IN ('RECEIVED', 'PENDING', 'UNDER_PROCESS', 'ESCALATED')`) handled by >= 2 distinct Bureaus.
   - Severity: `MEDIUM` (or `HIGH` if priority is HIGH/URGENT).
   - Trigger: Cross-bureau coordination alert generated.
2. **Rule B (Same Institution + Similar Category / Topic)**:
   - Condition: Cross-bureau active cases belong to identical or related complaint categories (e.g. "Regulatory Compliance" and "Academic & Examination" or "Faculty & Staffing").
   - Severity: `HIGH` / `CRITICAL`.
   - Alert: Coordination recommended to align document requests and inspection dates.
3. **Rule C (Fuzzy Text Description Similarity)**:
   - Optional local token similarity (RapidFuzz token_set_ratio) > 75 on descriptions.
   - Increments severity score and highlights specific overlapping excerpt in the alert UI.
4. **Rule D (Deduplication & Stable Keys)**:
   - Overlap alert uniqueness key is scoped to `institution_id` + sorted active bureau set.
   - Subsequent checks update existing open alerts rather than creating duplicate spam alerts.
5. **Lifecycle Actions for Authorized Officers**:
   - `Review`: Change status to `UNDER_REVIEW`.
   - `Link Cases`: Formally creates a `RelatedCase` record between the two cases.
   - `Assign Joint/Lead Bureau`: Designates lead bureau (e.g., RB leads regulatory hearing, PGRC holds grievance until regulatory finding).
   - `Resolve`: Mark `RESOLVED` with mandatory resolution remark.
   - `Dismiss`: Mark `DISMISSED` with mandatory justification (e.g. "Unrelated matters handled independently by agreement").

---

## 6. Institution Matching Engine

### Priority Hierarchy:
1. **Priority 1: AICTE Permanent ID Match**
   - Exact alphanumeric match on canonical `aicte_permanent_id` (e.g. `1-4329811`).
   - Match Score: 100%. Auto-linked directly.
2. **Priority 2: Exact Canonical Name Match**
   - Normalization removes punctuation, collapses spaces, converts to lowercase.
   - Match Score: 100%. Auto-linked directly.
3. **Priority 3: Verified Alias Match**
   - Exact match on verified aliases in `institution_aliases`.
   - Match Score: 98%. Auto-linked directly.
4. **Priority 4: RapidFuzz Fuzzy String Matching**
   - Evaluates `token_sort_ratio` and `token_set_ratio` against canonical names.
   - **Score >= 90**: Eligible for auto-matching IF the gap between top candidate and second candidate is > 10% (ambiguity safety rule). If gap <= 10%, routes to manual review queue.
   - **Score 75 - 89**: Added to `matching_review_queue` with status `PENDING`.
   - **Score < 75**: Unmatched; flagged for registrar entry.

---

## 7. SLA and Alert Engine

### Configuration Assumptions (Configurable via `sla_rules.json`):
- Default Resolution SLA by Priority:
  - `URGENT`: 15 days
  - `HIGH`: 30 days
  - `MEDIUM`: 45 days
  - `LOW`: 60 days
- Notification Triggers:
  - **Approaching Deadline Warning**: Within 7 days and 3 days of `expected_disposal_at`.
  - **Breached / Overdue Alert**: When `now() > expected_disposal_at` and `status NOT IN ('DISPOSED', 'CLOSED')`.
  - **Stagnant Case Warning**: When `now() - last_action_at > 14 days`.
  - **Transfer Pending**: When case has been transferred to a new bureau and has not had an action recorded in 5 days.

---

## 8. REST API Specifications (`/api/v1`)

| Module | Method | Endpoint | Description |
|---|---|---|---|
| **Health** | GET | `/health` | API & DB status |
| **Dashboard** | GET | `/dashboard/summary` | Top KPI counters (total, pending, under process, disposed, transferred, escalated, overdue, active overlaps) |
| | GET | `/dashboard/bureau-workload` | Case breakdown per bureau & status |
| | GET | `/dashboard/status-distribution` | Case counts per status |
| | GET | `/dashboard/region-distribution` | Regional geographic case spread |
| | GET | `/dashboard/ageing` | Cases pending <30d, 30-60d, 60-90d, >90d |
| | GET | `/dashboard/trends` | Monthly received vs disposed trends |
| **Institutions**| GET | `/institutions` | Paginated listing with search, region, type, risk filters |
| | POST | `/institutions` | Register new institution |
| | GET | `/institutions/{id}` | Institution 360 profile summary |
| | PATCH | `/institutions/{id}` | Update profile details |
| | GET | `/institutions/{id}/cases` | All active & historical cases for institution |
| | GET | `/institutions/{id}/timeline` | Combined chronological audit & action events |
| **Cases** | GET | `/cases` | Filterable list (search, bureau, status, priority, category, overdue) |
| | POST | `/cases` | Register new complaint case |
| | GET | `/cases/{id}` | Detailed case record with actions and related cases |
| | PATCH | `/cases/{id}` | Update case attributes |
| | POST | `/cases/{id}/assign` | Assign officer |
| | POST | `/cases/{id}/transfer` | Transfer case to another Bureau with rationale |
| | POST | `/cases/{id}/escalate` | Escalate case with reason |
| | POST | `/cases/{id}/actions` | Record new action entry |
| | GET | `/cases/{id}/actions` | Retrieve chronological action history |
| | POST | `/cases/{id}/dispose` | Formally dispose case with resolution remark |
| **Overlaps** | GET | `/overlaps` | List overlap alerts with severity and review status filters |
| | GET | `/overlaps/{id}` | Overlap alert detail with participating cases comparison |
| | POST | `/overlaps/{id}/review`| Mark under review |
| | POST | `/overlaps/{id}/link-cases` | Formally link overlapping cases |
| | POST | `/overlaps/{id}/resolve`| Resolve overlap with decision & lead bureau |
| | POST | `/overlaps/{id}/dismiss`| Dismiss overlap alert with required justification |
| **Matching** | GET | `/matching/review-queue` | Unresolved ambiguous institution matches |
| | POST | `/matching/{id}/review` | Approve or reject candidate match |
| **Alerts** | GET | `/alerts` | In-app SLA and overlap notifications |
| | PATCH | `/alerts/{id}/read` | Mark notification as read |
| **Reports** | GET | `/reports/summary` | Consolidated analytics summary |
| | GET | `/reports/export` | Download verified multi-worksheet `.xlsx` report |
| **Imports** | POST | `/imports/batch` | Upload synthetic CSV/JSON batch |
| | GET | `/imports/{id}` | Batch import processing status |

---

## 9. Frontend Page Structure & UX Design
Built with React, Vite, TypeScript, Tailwind CSS, Lucide icons:
1. **Layout Shell**:
   - Sidebar: AICTE Emblems/Branding, Navigation items with badges for active overlaps and overdue alerts.
   - Top Header: Current active role switcher (Simulated Demo Role: Senior Officer, RB Officer, PGRC Officer), Search bar, Notifications dropdown, Synthetic Environment indicator banner.
2. **Pages**:
   - **Overview (`/`)**: 8 KPI Cards, Bureau Workload Chart, Status Distribution, Ageing Chart, Multi-bureau Institution hotspots, Overlap banner.
   - **Institutions (`/institutions`)**: Grid/Table view of all 60 institutions, active cases, multi-bureau tag, search and region filter.
   - **Institution 360 (`/institutions/:id`)**: Comprehensive dossier, bureau involvement badges, active cases list, consolidated timeline, risk indicators.
   - **All Cases (`/cases`)**: Filterable data table, SLA status pill (Normal, Approaching, Overdue), full search, Register Case Modal.
   - **Case Details (`/cases/:id`)**: Deep-dive case view, current owner & bureau, SLA countdown, action timeline, Transfer dialog, Escalate dialog, Dispose dialog.
   - **Overlap Alerts (`/overlaps`)**: Cross-Bureau Overlap Hub. Shows side-by-side case cards comparing RB vs PGRC cases, action buttons to Link, Resolve, or Dismiss.
   - **Workflow & Transfers (`/workflow`)**: Transfer logs, pending handovers, escalation monitor.
   - **Reports & Analytics (`/reports`)**: Bureau performance, regional compliance, disposal rate, genuine Excel (.xlsx) download.
   - **Data Quality (`/data-quality`)**: RapidFuzz matching review queue, alias manager, synthetic data regeneration trigger.
   - **NotFound (`*`)**: Clean 404 page with navigation return.

---

## 10. Demonstration Scenario (100-Second Pitch)
- **Scene 1**: Open Overview Dashboard. Highlight KPI cards and "Multi-Bureau Institution" indicators showing disparate complaints across AICTE cells.
- **Scene 2**: Navigate to Cases, filter by "Fictional Institution Alpha" (e.g. `INST-1001` / `1-4329811`). Inspect synthetic PGRC case (`Fee overcharging`).
- **Scene 3**: Inspect related RB case for same institution (`Unauthorized branch expansion & regulatory non-compliance`).
- **Scene 4**: Click "Overlap Alerts". Point out `OVR-2026-0001` flagged under "Potential Overlapping Cases — Coordination Required".
- **Scene 5**: Open Overlap Details. Compare PGRC case vs RB case side-by-side with receipt dates, officers, and next steps.
- **Scene 6**: Click "Link Cases", assign RB as Lead Coordination Bureau, and input joint resolution strategy.
- **Scene 7**: View Institution 360 for Institution Alpha. Notice unified multi-bureau timeline and updated relationship tag.
- **Scene 8**: Check SLA & Ageing metrics, identifying overdue cases and approaching deadlines.
- **Scene 9**: Navigate to Reports, generate and download genuine Excel report (`AICTE_Institution_Complaint_Report.xlsx`).
- **Scene 10**: Display Data Quality review queue demonstrating RapidFuzz fuzzy matching handling misspelled college submissions.

---

## 11. Version 2.0 Additions (Smart Automation, Integration, Access Control)

### 11.1 Smart intake pipeline (`services/intake_service.py`)
Every complaint (UI form, bulk import, external API) runs through one pipeline:
`Ingest → Link to institution → Classify & prioritise → Detect duplicates → Overlap scan & alerts`.

| Step | Module | Behaviour |
|---|---|---|
| Link | `matching_service.py`, `text_utils.py` | Exact Permanent ID / canonical name / verified alias, then fuzzy match (70% distinctive words + 30% full name, abbreviations expanded). Auto-link at ≥90 with a ≥10-point lead; otherwise the case is created as `PENDING_REVIEW` and queued. Unknown institutions are rejected. |
| Classify | `nlp_service.py`, `nlp_seed.py` | Multinomial Naive Bayes (unigrams + bigrams) with confidence and evidence words. Officer-entered category always wins; officer corrections (`category_source = MANUAL`) retrain the model. |
| Prioritise | `nlp_service.suggest_priority` | Safety terms → URGENT, high-impact terms → HIGH, else MEDIUM (only when no priority given). |
| Duplicates | `nlp_service.score_duplicate` | Against the institution's cases in **all** bureaus (180-day look-back): 70% paraphrase-tolerant text similarity + 20% same complainant + 7% same category + 3% date proximity; strong text alone (≥75) suffices. Flag at ≥60 → `RelatedCase(DUPLICATE_SUBMISSION, PROPOSED)` + notifications; officers confirm/dismiss. |

New `cases` columns: `complainant_name`, `complainant_contact`, `intake_channel`, `external_reference`, `raw_institution_name`, `institution_match_status`, `institution_match_score`, `category_source`, `category_confidence`, `duplicate_of_case_id`, `duplicate_score`. Existing databases are upgraded automatically at startup (`core/migrations.py`).

### 11.2 Integration layer
- `POST /api/v1/imports/upload` - CSV/XLSX with flexible headers, dry-run validation, per-row results, idempotent re-upload (skips rows whose `external_reference` already exists for that bureau), batch history.
- `POST /api/v1/intake/complaints` (+ `/batch`) - for CPGRAMS / portal / bureau software; Bearer token or `X-API-Key`.
- `POST /api/v1/intake/preview` - live suggestions while typing.

### 11.3 Overlap engine fixes
Rule B now uses the configured `category_clusters`; rule `enabled` flags and thresholds are read from config; only **cross-bureau** pairs are compared; Rule C removes institution names/aliases before comparing; Rule D keys open alerts by institution + bureau set (expanding a subset alert when another bureau joins); severity is recomputed on each scan; alert IDs are collision-safe (`core/ids.py`). The pure rule logic lives in `overlap_rules_engine.py`.

### 11.4 SLA monitor (`sla_rules_engine.py`, `sla_monitor_service.py`)
Runs every `SLA_SCAN_INTERVAL_MINUTES` in the background and via `POST /alerts/run-sla-scan`: reminders at 7/3/1 days, breach alert, stagnant-case alert (no action for 14 days, repeating), unacknowledged-transfer alert (5 days), and auto-escalation at 1.5× the SLA window. Each alert is sent once (tagged messages).

### 11.5 Institution risk score (`risk_engine.py`)
0-100, sum of capped, explainable components: complaint volume (12 months), number of active bureaus, overdue and escalated cases, high/urgent complaints, repeated same-category complaints, unresolved overlap. HIGH ≥ 60, MEDIUM ≥ 30. `is_repeat_offender` = ≥5 complaints in 12 months or ≥3 in one category.

### 11.6 Authentication & RBAC (`core/security.py`, `api/deps.py`)
JWT bearer tokens; PBKDF2-SHA256 passwords. All signed-in officers can **view** everything (cross-bureau visibility is the goal); **changes** are scoped: Bureau officers act only on cases currently with their bureau and import/register only for their bureau; Senior Management/Super Admin act on any case; Regional officers are read-only. The acting user always comes from the token, never the request body.

### 11.7 Measurement (`scripts/evaluate_models.py`)
Writes `data/evaluation_report.json` (shown on the Reports page): classifier accuracy on 70 held-out complaints, duplicate precision/recall on 35 labelled pairs, and institution-matching precision on noisy name variants + unknown colleges.

# v2.0 – What changed and why

Review findings against the SIH26264 problem statement, and how each was addressed.

## Smart automation (the PS's technology bucket)
| Gap in v1 | Change |
|---|---|
| Fuzzy institution matcher existed but was only used on the Data Quality page; registering a complaint required the exact internal `institution_id` | New **smart intake pipeline** (`intake_service.py`) used by the form, bulk import and API. Accepts a free-text name or Permanent ID and links automatically, or creates the case as *pending review* and queues it. Approving or rejecting in Data Quality updates those cases. |
| Category was always picked by hand | **Naive Bayes classifier** suggests a category with confidence and evidence words. Officer-confirmed categories retrain it. |
| No complaint-level duplicate detection | **Duplicate scoring across all bureaus** (paraphrase-tolerant similarity, same complainant, category, date). Possible duplicates are linked as *proposed* and the officer confirms or dismisses. |
| Fuzzy matching was dominated by boilerplate ("Institute of Technology and Management") | Name score weights distinctive words at 70% and expands common abbreviations (Engg, Instt, Mgmt…). Matching now also uses verified aliases. |

## Integration layer
| Gap | Change |
|---|---|
| `/imports` was a stub that stored an empty batch | **Real CSV/Excel import** with flexible header matching, dry-run validation, per-row results, a skip for rows already imported, batch history and downloadable template. A new **Bulk Import** page. |
| No way for other systems to push complaints | **Intake API** `POST /api/v1/intake/complaints` (+ batch), with an `X-API-Key` option. |

## Overlap engine bugs
- Rule B ignored the configured `category_clusters` (exact category only). **Fixed.**
- Rule `enabled` flags and thresholds were ignored (75 was hard-coded). **Now read from config.**
- Rule C compared descriptions that both started with the institution name, inflating similarity and severity. **Names and aliases are now removed first, and only cross-bureau pairs are compared.**
- Duplicate-alert key was the institution only (SPEC said institution + bureau set). **Fixed, with expansion when another bureau joins.**
- Severity could only go up. **Now recomputed on each scan.**

## SLA monitor & risk
- `sla_rules.json` defined reminders, stagnant threshold, transfer acknowledgement and escalation ratio, but **nothing used them**. A new background monitor (every 15 min) plus a *Run SLA scan* button create one-time alerts and auto-escalate.
- Risk level used to be a simple if/else. It is now an **explainable 0-100 risk score** with a repeat-offender flag, shown on Institutions, Institution 360 and the Overview.

## Security
- There was no login, and the acting user came from the request body (anyone could act as anyone). Now: **JWT login**, PBKDF2 password hashing, role-based permissions (view everything, act only on own bureau, regional read-only), and the actor always comes from the token.
- CORS was `*` with credentials; it is now limited to configured origins.

## Other bugs fixed
- `POST /cases/{id}/actions` used `datetime` without importing it, so adding a note crashed.
- Institution list applied risk and overlap filters **after** pagination, giving short pages and wrong totals.
- Case, alert and institution IDs were built from `COUNT(*)+1`, which collides after deletions. Now based on the highest existing suffix (`core/ids.py`).
- The case list loaded every case into memory and ran 2 extra queries per row. Filtering and pagination now happen in SQL with eager loading.
- The Excel export opened a raw URL, which would fail once auth is on. It now uses an authenticated blob download.
- No endpoint existed for DISPOSED → CLOSED. Added `POST /cases/{id}/close` and a button.
- ISO dates in imports would have been parsed day-first. Handled.
- Repo hygiene: removed committed SQLite `-shm/-wal` files, fixed the README's garbled UTF-16 ending and hard-coded `d:\` paths, added `.env.example`, Docker and Compose.

## Measurement
- `scripts/evaluate_models.py` plus labelled test sets in `data/eval/`. Results appear on the Reports page. It runs automatically at the end of `generate_demo_data`.

## Tests
- `test_pure_logic.py` (10 tests, no database) covers the classifier, similarity, duplicates, name ranking, overlap rules, SLA rules and risk.
- `test_smart_features.py` (20 tests) covers intake, duplicates, overlap rules, SLA monitor, risk, bulk import, login, RBAC, and the token-based actor.
- The existing `test_backend.py` was updated for the new explanation text. Its fixtures moved to `conftest.py`.

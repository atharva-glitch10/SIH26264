import os
import random
import json
from datetime import datetime, timezone, timedelta
from pathlib import Path
import pandas as pd

from backend.app.core.config import settings
from backend.app.core.database import SessionLocal, engine, Base
from backend.app.models.models import (
    Institution, InstitutionAlias, Bureau, User, Case, CaseAction,
    RelatedCase, OverlapAlert, OverlapAlertCase, Notification,
    AuditLog, MatchingReviewQueue, ImportBatch
)
from backend.app.services.matching_service import normalize_text
from backend.app.services.sla_service import calculate_expected_disposal_date
from backend.app.services.overlap_service import scan_and_generate_overlap_alerts

RANDOM_SEED = 42
random.seed(RANDOM_SEED)

REGIONS = [
    ("Northern", "Uttar Pradesh", "Kanpur"),
    ("Northern", "Uttarakhand", "Dehradun"),
    ("North-West", "Punjab", "Ludhiana"),
    ("North-West", "Haryana", "Gurugram"),
    ("North-West", "Delhi", "New Delhi"),
    ("Eastern", "West Bengal", "Kolkata"),
    ("Eastern", "Odisha", "Bhubaneswar"),
    ("Eastern", "Bihar", "Patna"),
    ("Western", "Maharashtra", "Pune"),
    ("Western", "Maharashtra", "Mumbai"),
    ("Western", "Gujarat", "Ahmedabad"),
    ("Southern", "Tamil Nadu", "Chennai"),
    ("Southern", "Tamil Nadu", "Coimbatore"),
    ("Southern", "Andhra Pradesh", "Visakhapatnam"),
    ("South-West", "Karnataka", "Bengaluru"),
    ("South-West", "Karnataka", "Mysuru"),
    ("South-West", "Kerala", "Thiruvananthapuram"),
    ("Central", "Madhya Pradesh", "Bhopal"),
    ("Central", "Madhya Pradesh", "Indore"),
    ("Central", "Chhattisgarh", "Raipur")
]

INSTITUTION_TYPES = [
    "Technical University",
    "Autonomous Engineering College",
    "Affiliated Engineering College",
    "Polytechnic Institute",
    "Management and Technology Institute"
]

PREFIXES = [
    "Aryabhata", "CV Raman", "Visvesvaraya", "Bhabha", "APJ Abdul Kalam",
    "Srinivasa Ramanujan", "Sardar Patel", "Tagore", "Vikram Sarabhai", "Homi Bhabha",
    "National", "Premier", "Apex", "Horizon", "Pioneer", "Zenith", "Sterling", "Imperial",
    "Heritage", "Global", "Metro", "Cosmos", "Vanguard", "Beacon", "Radiant", "Summit",
    "Everest", "Galaxy", "Trinity", "Universal", "Navodaya", "Pratibha", "Vidya", "Gyan",
    "Pragathi", "Shiksha", "Vishwa", "Shanti", "Adarsh", "Utkarsh", "Arya", "Saraswati",
    "Chanakya", "Dronacharya", "Bhaskaracharya", "Vivekananda", "Subhash", "Netaji", "Ashoka",
    "Shivaji", "Tilak", "Gokhale", "Nehru", "Shastri", "Indira", "Rajiv", "Mahatma", "Kautilya"
]

CATEGORIES = [
    "Academic and Examination",
    "Infrastructure and Facilities",
    "Faculty and Staffing",
    "Regulatory Compliance",
    "Admission Grievances",
    "Fee Related Grievances",
    "General Institutional"
]

CASE_DESCRIPTIONS_TEMPLATES = {
    "Regulatory Compliance": [
        "Unauthorized intake expansion in Computer Science division beyond AICTE approved sanction without requisite laboratories.",
        "Non-compliance with faculty cadre ratio and violation of mandatory reservation norms in institutional appointments.",
        "Operating unapproved offshore campus / evening shifts without council prior concurrence.",
        "Failure to submit mandatory annual compliance report and audited financial balance sheets."
    ],
    "Fee Related Grievances": [
        "Unlawful demand of capitation fee and unauthorized development charges exceeding state fee committee mandates.",
        "Withholding original matriculation certificates and demanding full 4-year tuition fee for course withdrawal.",
        "Levying excessive laboratory and examination surcharges not declared in institutional admission prospectus.",
        "Denial of mandatory fee waiver scholarship reimbursement to eligible reserved category candidates."
    ],
    "Faculty and Staffing": [
        "Non-payment of 7th CPC revised pay scales and delayed salary disbursements exceeding 4 consecutive months.",
        "Arbitrary termination of adjunct faculty without issuance of formal show-cause notice or statutory inquiry.",
        "Shortage of qualified PhD guide supervisors in core mechanical and civil engineering departments.",
        "Engaging non-qualified teaching assistants in lieu of regular Assistant Professors."
    ],
    "Infrastructure and Facilities": [
        "Inadequate laboratory computing equipment and unlicensed CAD/CAM design software suites for accredited courses.",
        "Severe safety hazards: absent fire safety clearances and non-functional emergency exits in multi-story hostel.",
        "Deficient barrier-free campus accessibility ramps and assistive braille facilities for differently-abled scholars.",
        "Substandard hostel sanitation facilities and contaminated drinking water supplies in campus boarding quarters."
    ],
    "Academic and Examination": [
        "Irregular evaluation practices and denial of photocopy inspection of evaluated end-semester answer scripts.",
        "Unapproved curriculum alterations deviating from AICTE Model Curriculum framework.",
        "Arbitrary attendance detention and punitive denial of hall tickets despite certified medical absences.",
        "Disruption of internal continuous evaluation assessments due to non-availability of faculty examiners."
    ],
    "Admission Grievances": [
        "Irregular management quota admissions finalized after statutory counseling cutoff deadline.",
        "Non-refund of admission advance deposit following seat surrender within stipulated AICTE cancellation window.",
        "Discrepancies in lateral entry diploma student seat allotment matrix.",
        "Misleading advertisement claims regarding NBA accreditation status during admission outreach drives."
    ],
    "General Institutional": [
        "Absence of functional Internal Complaints Committee (ICC) and non-constitution of Student Grievance Cell.",
        "Student harassment by campus disciplinary squad without due process hearing.",
        "Arbitrary withholding of migration and provisional degree transcripts upon successful graduation.",
        "Lack of grievance redressal portal integration on the institutional website."
    ]
}

def generate_synthetic_dataset():
    print("Initializing Database & Seeding Synthetic Data...")
    
    # Ensure fresh DB schema
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    now = datetime.now(timezone.utc)
    
    # 1. Bureaus
    bureaus_data = [
        ("BUR-RB", "RB", "Regulation Bureau", "Handles regulatory compliance, affiliations, norms & standard enforcement"),
        ("BUR-PGRC", "PGRC", "Public Grievance Redressal Cell", "Handles student, faculty, and public grievances"),
        ("BUR-APP", "APPROVAL", "Approval Bureau", "Handles annual intake approvals, course variations, and NOC"),
        ("BUR-VIG", "VIGILANCE", "Vigilance Cell", "Handles ethical complaints, capitation fee violations, and inquiry boards")
    ]
    for bid, bcode, bname, bdesc in bureaus_data:
        db.add(Bureau(bureau_id=bid, bureau_code=bcode, bureau_name=bname, description=bdesc, active=True))
    db.commit()

    # 2. Users / Synthetic Officers
    users_data = [
        ("USR-SUPER-01", "Dr. A. K. Sharma", "SUPER_ADMIN", None, "ak.sharma@aicte-demo.gov.in"),
        ("USR-RB-01", "Shri Rajesh Verma", "BUREAU_OFFICER", "BUR-RB", "r.verma@aicte-demo.gov.in"),
        ("USR-RB-02", "Ms. Sangeeta Rao", "BUREAU_OFFICER", "BUR-RB", "s.rao@aicte-demo.gov.in"),
        ("USR-PGRC-01", "Dr. Meenakshi Sundaram", "BUREAU_OFFICER", "BUR-PGRC", "m.sundaram@aicte-demo.gov.in"),
        ("USR-PGRC-02", "Shri Amit Trivedi", "BUREAU_OFFICER", "BUR-PGRC", "a.trivedi@aicte-demo.gov.in"),
        ("USR-APP-01", "Dr. Sanjay Deshmukh", "BUREAU_OFFICER", "BUR-APP", "s.deshmukh@aicte-demo.gov.in"),
        ("USR-VIG-01", "Shri V. K. Iyer", "BUREAU_OFFICER", "BUR-VIG", "vk.iyer@aicte-demo.gov.in"),
        ("USR-REG-NORTH", "Shri Pradeep Nautiyal", "REGIONAL_OFFICER", None, "ro.north@aicte-demo.gov.in"),
        ("USR-REG-SOUTH", "Dr. K. Chandrasekhar", "REGIONAL_OFFICER", None, "ro.south@aicte-demo.gov.in")
    ]
    for uid, dname, role, bid, email in users_data:
        db.add(User(user_id=uid, display_name=dname, role=role, bureau_id=bid, email=email, active=True))
    db.commit()

    # 3. 60 Fictional Institutions
    institutions: List[Institution] = []
    
    # Guaranteed Demo Flagship: Fictional Institution Alpha
    alpha_inst = Institution(
        institution_id="INST-1001",
        aicte_permanent_id="1-4329811",
        canonical_name="Fictional Institution Alpha Institute of Technology",
        normalized_name=normalize_text("Fictional Institution Alpha Institute of Technology"),
        institution_type="Autonomous Engineering College",
        region="Northern",
        state="Uttar Pradesh",
        district="Kanpur",
        address="Sector 14, Knowledge Corridor, GT Road, Kanpur, UP 208016",
        contact_email="registrar@alpha-tech.edu.in",
        contact_phone="+91-512-2589001",
        created_at=now - timedelta(days=400),
        updated_at=now - timedelta(days=10)
    )
    institutions.append(alpha_inst)
    db.add(alpha_inst)

    # Add verified aliases for Alpha
    db.add(InstitutionAlias(
        institution_id="INST-1001",
        alias_name="Alpha Tech Kanpur",
        normalized_alias=normalize_text("Alpha Tech Kanpur"),
        source="Historical DB",
        verification_status="VERIFIED"
    ))
    db.add(InstitutionAlias(
        institution_id="INST-1001",
        alias_name="FIAIT Kanpur",
        normalized_alias=normalize_text("FIAIT Kanpur"),
        source="Student Portal",
        verification_status="VERIFIED"
    ))

    # Generate remaining 59 institutions
    for i in range(2, 61):
        inst_id = f"INST-{1000 + i}"
        perm_id = f"1-{random.randint(1000000, 9999999)}"
        region, state, district = random.choice(REGIONS)
        itype = random.choice(INSTITUTION_TYPES)
        prefix = PREFIXES[(i - 2) % len(PREFIXES)]
        name = f"{prefix} Institute of Technology and Management"
        if i % 4 == 0:
            name = f"{prefix} College of Engineering and Polytechnic"
        elif i % 5 == 0:
            name = f"{prefix} Technical University Campus"

        inst = Institution(
            institution_id=inst_id,
            aicte_permanent_id=perm_id,
            canonical_name=name,
            normalized_name=normalize_text(name),
            institution_type=itype,
            region=region,
            state=state,
            district=district,
            address=f"Campus Plot #{random.randint(10, 800)}, Institutional Zone, {district}, {state}",
            contact_email=f"info@{prefix.lower().replace(' ', '')}tech.ac.in",
            contact_phone=f"+91-{random.randint(11, 80)}-{random.randint(2000000, 8999999)}",
            created_at=now - timedelta(days=random.randint(300, 800)),
            updated_at=now - timedelta(days=random.randint(2, 30))
        )
        institutions.append(inst)
        db.add(inst)
        
        # Add aliases to some
        if i % 3 == 0:
            alias_str = f"{prefix} Engg College"
            db.add(InstitutionAlias(
                institution_id=inst_id,
                alias_name=alias_str,
                normalized_alias=normalize_text(alias_str),
                source="Public Grievance Portal",
                verification_status="VERIFIED"
            ))

    db.commit()
    print(f"Created {len(institutions)} synthetic institutions.")

    # 4. Generate ~500 Cases
    cases: List[Case] = []
    actions: List[CaseAction] = []
    
    # 4.1 SPECIFIC SCENARIO 1: Flagship Overlap Demo for Fictional Institution Alpha
    # Case A: PGRC Case (Student Grievance on Fee & Certificate Withholding)
    pgrc_alpha = Case(
        case_id="CASE-2026-00001",
        complaint_reference="AICTE/PGRC/2026/00142",
        institution_id="INST-1001",
        source_bureau_id="BUR-PGRC",
        current_bureau_id="BUR-PGRC",
        assigned_user_id="USR-PGRC-01",
        category="Fee Related Grievances",
        priority="HIGH",
        description="Fictional Institution Alpha unlawfully collected Rs 1,45,000 capitation/development fee and is withholding original degree transcripts of final-year engineering batch.",
        status="UNDER_PROCESS",
        received_at=now - timedelta(days=18),
        last_action_at=now - timedelta(days=4),
        last_action_summary="Show cause notice issued to Registrar regarding certificate withholding",
        next_action="Awaiting institutional explanation submission by Registrar",
        expected_disposal_at=now + timedelta(days=12),
        created_at=now - timedelta(days=18),
        updated_at=now - timedelta(days=4)
    )
    db.add(pgrc_alpha)
    cases.append(pgrc_alpha)

    # Actions for Case A
    actions.append(CaseAction(
        case_id="CASE-2026-00001",
        action_type="REGISTERED",
        previous_status=None,
        new_status="RECEIVED",
        actor_user_id="USR-PGRC-01",
        remarks="Complaint filed through National Student Grievance Portal",
        next_action="Preliminary verification",
        created_at=now - timedelta(days=18)
    ))
    actions.append(CaseAction(
        case_id="CASE-2026-00001",
        action_type="STATUS_CHANGE",
        previous_status="RECEIVED",
        new_status="UNDER_PROCESS",
        actor_user_id="USR-PGRC-01",
        remarks="Prima facie violation of AICTE Fee Guidelines 2026. Official notice drafted.",
        next_action="Issue formal show cause notice",
        created_at=now - timedelta(days=10)
    ))
    actions.append(CaseAction(
        case_id="CASE-2026-00001",
        action_type="STATUS_CHANGE",
        previous_status="UNDER_PROCESS",
        new_status="UNDER_PROCESS",
        actor_user_id="USR-PGRC-01",
        remarks="Show cause notice issued to Registrar regarding certificate withholding.",
        next_action="Awaiting institutional explanation submission by Registrar",
        created_at=now - timedelta(days=4)
    ))

    # Case B: RB Case (Regulatory Compliance & Unauthorized Intake Expansion)
    rb_alpha = Case(
        case_id="CASE-2026-00002",
        complaint_reference="AICTE/RB/2026/00089",
        institution_id="INST-1001",
        source_bureau_id="BUR-RB",
        current_bureau_id="BUR-RB",
        assigned_user_id="USR-RB-01",
        category="Regulatory Compliance",
        priority="HIGH",
        description="Fictional Institution Alpha is operating unauthorized student intake in Computer Science and charging unapproved infrastructure development fees in direct violation of council norms.",
        status="UNDER_PROCESS",
        received_at=now - timedelta(days=12),
        last_action_at=now - timedelta(days=2),
        last_action_summary="Scrutiny of AICTE approval portal records and intake capacity underway",
        next_action="Inter-bureau inspection scheduling with regional office",
        expected_disposal_at=now + timedelta(days=18),
        created_at=now - timedelta(days=12),
        updated_at=now - timedelta(days=2)
    )
    db.add(rb_alpha)
    cases.append(rb_alpha)

    # Actions for Case B
    actions.append(CaseAction(
        case_id="CASE-2026-00002",
        action_type="REGISTERED",
        previous_status=None,
        new_status="RECEIVED",
        actor_user_id="USR-RB-01",
        remarks="Regulatory complaint forwarded by State Technical Education Directorate",
        next_action="Document verification",
        created_at=now - timedelta(days=12)
    ))
    actions.append(CaseAction(
        case_id="CASE-2026-00002",
        action_type="STATUS_CHANGE",
        previous_status="RECEIVED",
        new_status="UNDER_PROCESS",
        actor_user_id="USR-RB-01",
        remarks="Scrutiny of AICTE approval portal records and intake capacity underway.",
        next_action="Inter-bureau inspection scheduling with regional office",
        created_at=now - timedelta(days=2)
    ))

    # 4.2 SPECIFIC SCENARIO 2: Non-Duplicate cases on same institution (Distinguishable issues)
    # INST-1002 (Bhabha Institute) has two legitimate separate cases in PGRC and APP
    bhabha_pgrc = Case(
        case_id="CASE-2026-00003",
        complaint_reference="AICTE/PGRC/2026/00091",
        institution_id="INST-1002",
        source_bureau_id="BUR-PGRC",
        current_bureau_id="BUR-PGRC",
        assigned_user_id="USR-PGRC-02",
        category="Academic and Examination",
        priority="LOW",
        description="Delay in publishing re-evaluation results for 4th semester mathematics examination.",
        status="UNDER_PROCESS",
        received_at=now - timedelta(days=25),
        last_action_at=now - timedelta(days=5),
        last_action_summary="Directives sent to Controller of Examinations",
        next_action="Verification of published scorecard",
        expected_disposal_at=now + timedelta(days=35),
        created_at=now - timedelta(days=25),
        updated_at=now - timedelta(days=5)
    )
    db.add(bhabha_pgrc)
    cases.append(bhabha_pgrc)

    bhabha_app = Case(
        case_id="CASE-2026-00004",
        complaint_reference="AICTE/APPROVAL/2026/00044",
        institution_id="INST-1002",
        source_bureau_id="BUR-APP",
        current_bureau_id="BUR-APP",
        assigned_user_id="USR-APP-01",
        category="Infrastructure and Facilities",
        priority="MEDIUM",
        description="Routine application scrutiny for adding new Artificial Intelligence specialization laboratory.",
        status="PENDING",
        received_at=now - timedelta(days=15),
        last_action_at=now - timedelta(days=10),
        last_action_summary="Inspection committee nominated",
        next_action="Field inspection visit",
        expected_disposal_at=now + timedelta(days=30),
        created_at=now - timedelta(days=15),
        updated_at=now - timedelta(days=10)
    )
    db.add(bhabha_app)
    cases.append(bhabha_app)

    # 4.3 Populate remaining ~496 cases across 60 institutions
    officer_pool = {
        "BUR-RB": ["USR-RB-01", "USR-RB-02"],
        "BUR-PGRC": ["USR-PGRC-01", "USR-PGRC-02"],
        "BUR-APP": ["USR-APP-01"],
        "BUR-VIG": ["USR-VIG-01"]
    }

    # Ensure multiple institutions have active cases across bureaus to create realistic overlap candidates
    multi_bureau_target_institutions = ["INST-1003", "INST-1005", "INST-1008", "INST-1012", "INST-1015", "INST-1020", "INST-1025"]

    case_counter = 5
    for inst in institutions:
        # Determine number of cases for this institution (between 3 and 15)
        num_cases = random.randint(4, 14)
        if inst.institution_id in multi_bureau_target_institutions:
            num_cases = random.randint(8, 16)

        for _ in range(num_cases):
            case_id = f"CASE-2026-{case_counter:05d}"
            category = random.choice(CATEGORIES)
            template_list = CASE_DESCRIPTIONS_TEMPLATES.get(category, CASE_DESCRIPTIONS_TEMPLATES["General Institutional"])
            base_desc = random.choice(template_list)
            desc = f"{inst.canonical_name}: {base_desc}"

            # Bureau assignment
            if inst.institution_id in multi_bureau_target_institutions:
                bureau_id = random.choice(["BUR-RB", "BUR-PGRC", "BUR-APP", "BUR-VIG"])
            else:
                # 60% PGRC, 25% RB, 10% APP, 5% VIG
                bureau_id = random.choices(["BUR-PGRC", "BUR-RB", "BUR-APP", "BUR-VIG"], weights=[0.55, 0.25, 0.12, 0.08])[0]

            bcode = "PGRC" if "PGRC" in bureau_id else ("RB" if "RB" in bureau_id else ("APPROVAL" if "APP" in bureau_id else "VIGILANCE"))
            complaint_ref = f"AICTE/{bcode}/2026/{case_counter:05d}"
            
            # Status distribution
            # RECEIVED: 10%, PENDING: 15%, UNDER_PROCESS: 40%, TRANSFERRED: 5%, ESCALATED: 5%, DISPOSED: 20%, CLOSED: 5%
            status = random.choices(
                ["RECEIVED", "PENDING", "UNDER_PROCESS", "TRANSFERRED", "ESCALATED", "DISPOSED", "CLOSED"],
                weights=[0.10, 0.15, 0.40, 0.05, 0.05, 0.20, 0.05]
            )[0]

            priority = random.choices(["LOW", "MEDIUM", "HIGH", "URGENT"], weights=[0.25, 0.45, 0.20, 0.10])[0]
            
            # Date receipt: from 120 days ago to 2 days ago
            days_ago = random.randint(2, 120)
            received_at = now - timedelta(days=days_ago)
            
            # SLA timeline
            sla_days = {"URGENT": 15, "HIGH": 30, "MEDIUM": 45, "LOW": 60}[priority]
            expected_disposal = received_at + timedelta(days=sla_days)
            
            actual_disposal = None
            if status in ("DISPOSED", "CLOSED"):
                max_disp = max(1, min(days_ago, sla_days + 10))
                disposal_days = random.randint(1, max_disp)
                actual_disposal = received_at + timedelta(days=disposal_days)

            # Assign officer
            assigned_user = random.choice(officer_pool[bureau_id]) if status != "RECEIVED" else None

            last_action_date = now - timedelta(days=random.randint(1, min(days_ago, 20)))
            
            case_obj = Case(
                case_id=case_id,
                complaint_reference=complaint_ref,
                institution_id=inst.institution_id,
                source_bureau_id=bureau_id,
                current_bureau_id=bureau_id,
                assigned_user_id=assigned_user,
                category=category,
                priority=priority,
                description=desc,
                status=status,
                received_at=received_at,
                last_action_at=last_action_date,
                last_action_summary=f"Processed by {bcode} handling cell",
                next_action="Ongoing regulatory / grievance review" if status not in ("DISPOSED", "CLOSED") else "Case finalized and closed",
                expected_disposal_at=expected_disposal,
                actual_disposal_at=actual_disposal,
                created_at=received_at,
                updated_at=last_action_date
            )
            db.add(case_obj)
            cases.append(case_obj)

            # Add registered action
            actions.append(CaseAction(
                case_id=case_id,
                action_type="REGISTERED",
                previous_status=None,
                new_status="RECEIVED",
                actor_user_id=assigned_user or "USR-SUPER-01",
                remarks=f"Registration in {bcode} division under {category}",
                next_action="Scrutiny",
                created_at=received_at
            ))

            # If escalated, add escalation action
            if status == "ESCALATED":
                actions.append(CaseAction(
                    case_id=case_id,
                    action_type="ESCALATED",
                    previous_status="UNDER_PROCESS",
                    new_status="ESCALATED",
                    actor_user_id=assigned_user or "USR-SUPER-01",
                    remarks="Escalated due to repeated non-responsiveness and potential serious compliance violation",
                    next_action="Appellate board review",
                    created_at=last_action_date
                ))
            elif status == "TRANSFERRED":
                actions.append(CaseAction(
                    case_id=case_id,
                    action_type="TRANSFERRED",
                    previous_status="UNDER_PROCESS",
                    new_status="TRANSFERRED",
                    previous_bureau_id=bureau_id,
                    new_bureau_id="BUR-RB" if bureau_id == "BUR-PGRC" else "BUR-PGRC",
                    actor_user_id=assigned_user or "USR-SUPER-01",
                    remarks="Transferred to specialized bureau for statutory hearing",
                    next_action="Inter-bureau transfer acknowledgment",
                    created_at=last_action_date
                ))
            elif status in ("DISPOSED", "CLOSED"):
                actions.append(CaseAction(
                    case_id=case_id,
                    action_type="DISPOSED",
                    previous_status="UNDER_PROCESS",
                    new_status="DISPOSED",
                    actor_user_id=assigned_user or "USR-SUPER-01",
                    remarks="Disposed following submission of satisfactory institutional compliance evidence",
                    next_action="Archived",
                    created_at=actual_disposal or last_action_date
                ))

            case_counter += 1
            if case_counter > 505:
                break
        if case_counter > 505:
            break

    db.commit()
    print(f"Created {len(cases)} synthetic complaint cases with {len(actions)} historical action records.")

    # 5. Overlap Alerts Scanning & Creation
    print("Running initial Rule-Based Cross-Bureau Overlap Engine...")
    alerts = scan_and_generate_overlap_alerts(db)
    print(f"Overlap detection engine generated/updated {len(alerts)} alerts.")

    # Create one resolved and one dismissed alert for realism
    resolved_alert = db.query(OverlapAlert).filter(OverlapAlert.status == "NEW").first()
    if resolved_alert:
        resolved_alert.status = "RESOLVED"
        resolved_alert.resolution_reason = "Inter-bureau joint meeting concluded. Lead responsibility assigned to Regulation Bureau."
        resolved_alert.resolved_at = now - timedelta(days=3)
        resolved_alert.lead_bureau_id = "BUR-RB"

    dismissed_candidate = db.query(OverlapAlert).filter(
        OverlapAlert.status == "NEW", 
        OverlapAlert.institution_id != "INST-1001"
    ).first()
    if dismissed_candidate:
        dismissed_candidate.status = "DISMISSED"
        dismissed_candidate.resolution_reason = "Evaluated by coordination committee: Matters are distinct and do not require joint proceeding."
        dismissed_candidate.resolved_at = now - timedelta(days=1)

    # 6. Seed Matching Review Queue with Ambiguous / Misspelled Candidates
    ambiguous_examples = [
        ("Fictional Inst Alpha Technolog", "INST-1001", 86.5, "FUZZY_RAPIDFUZZ"),
        ("CV Raman Eng College", "INST-1002", 78.4, "FUZZY_RAPIDFUZZ"),
        ("Sardar Patel Tech Instt", "INST-1006", 81.2, "FUZZY_RAPIDFUZZ"),
        ("Apex Institue of Technlogy", "INST-1012", 84.0, "FUZZY_RAPIDFUZZ")
    ]
    for raw, inst_id, score, method in ambiguous_examples:
        db.add(MatchingReviewQueue(
            raw_input_name=raw,
            normalized_input_name=normalize_text(raw),
            candidate_institution_id=inst_id,
            confidence_score=score,
            matching_method=method,
            decision_status="PENDING",
            created_at=now - timedelta(days=random.randint(1, 10))
        ))
    db.commit()

    # 7. Export Datasets to CSV
    data_dir = settings.DATA_DIR
    data_dir.mkdir(parents=True, exist_ok=True)
    
    # Export institutions
    inst_df = pd.DataFrame([{
        "institution_id": i.institution_id,
        "aicte_permanent_id": i.aicte_permanent_id,
        "canonical_name": i.canonical_name,
        "institution_type": i.institution_type,
        "region": i.region,
        "state": i.state,
        "district": i.district,
        "created_at": i.created_at.isoformat()
    } for i in institutions])
    inst_df.to_csv(data_dir / "synthetic_institutions.csv", index=False)

    # Export cases
    case_df = pd.DataFrame([{
        "case_id": c.case_id,
        "complaint_reference": c.complaint_reference,
        "institution_id": c.institution_id,
        "source_bureau_id": c.source_bureau_id,
        "current_bureau_id": c.current_bureau_id,
        "category": c.category,
        "priority": c.priority,
        "status": c.status,
        "received_at": c.received_at.isoformat(),
        "expected_disposal_at": c.expected_disposal_at.isoformat()
    } for c in cases])
    case_df.to_csv(data_dir / "synthetic_cases.csv", index=False)

    # Export actions
    action_df = pd.DataFrame([{
        "action_id": a.action_id,
        "case_id": a.case_id,
        "action_type": a.action_type,
        "new_status": a.new_status,
        "actor_user_id": a.actor_user_id,
        "remarks": a.remarks,
        "created_at": a.created_at.isoformat()
    } for a in actions])
    action_df.to_csv(data_dir / "synthetic_actions.csv", index=False)

    print("Synthetic dataset successfully created and exported to data/*.csv!")
    db.close()

if __name__ == "__main__":
    generate_synthetic_dataset()

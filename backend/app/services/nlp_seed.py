"""
Seed knowledge for the complaint classifier and the synthetic data generator.

Each category has example complaint sentences (written in the style of AICTE
grievance submissions) plus keyword phrases. The classifier is trained on these
seeds and, at runtime, on every officer-confirmed case in the database, so it
improves as officers correct categories.
"""

CATEGORIES = [
    "Academic and Examination",
    "Infrastructure and Facilities",
    "Faculty and Staffing",
    "Regulatory Compliance",
    "Admission Grievances",
    "Fee Related Grievances",
    "General Institutional",
]

# Used by scripts/generate_demo_data.py for synthetic complaints.
CASE_DESCRIPTIONS_TEMPLATES = {
    "Regulatory Compliance": [
        "Unauthorized intake expansion in Computer Science division beyond AICTE approved sanction without requisite laboratories.",
        "Non-compliance with faculty cadre ratio and violation of mandatory reservation norms in institutional appointments.",
        "Operating unapproved offshore campus / evening shifts without council prior concurrence.",
        "Failure to submit mandatory annual compliance report and audited financial balance sheets.",
    ],
    "Fee Related Grievances": [
        "Unlawful demand of capitation fee and unauthorized development charges exceeding state fee committee mandates.",
        "Withholding original matriculation certificates and demanding full 4-year tuition fee for course withdrawal.",
        "Levying excessive laboratory and examination surcharges not declared in institutional admission prospectus.",
        "Denial of mandatory fee waiver scholarship reimbursement to eligible reserved category candidates.",
    ],
    "Faculty and Staffing": [
        "Non-payment of 7th CPC revised pay scales and delayed salary disbursements exceeding 4 consecutive months.",
        "Arbitrary termination of adjunct faculty without issuance of formal show-cause notice or statutory inquiry.",
        "Shortage of qualified PhD guide supervisors in core mechanical and civil engineering departments.",
        "Engaging non-qualified teaching assistants in lieu of regular Assistant Professors.",
    ],
    "Infrastructure and Facilities": [
        "Inadequate laboratory computing equipment and unlicensed CAD/CAM design software suites for accredited courses.",
        "Severe safety hazards: absent fire safety clearances and non-functional emergency exits in multi-story hostel.",
        "Deficient barrier-free campus accessibility ramps and assistive braille facilities for differently-abled scholars.",
        "Substandard hostel sanitation facilities and contaminated drinking water supplies in campus boarding quarters.",
    ],
    "Academic and Examination": [
        "Irregular evaluation practices and denial of photocopy inspection of evaluated end-semester answer scripts.",
        "Unapproved curriculum alterations deviating from AICTE Model Curriculum framework.",
        "Arbitrary attendance detention and punitive denial of hall tickets despite certified medical absences.",
        "Disruption of internal continuous evaluation assessments due to non-availability of faculty examiners.",
    ],
    "Admission Grievances": [
        "Irregular management quota admissions finalized after statutory counseling cutoff deadline.",
        "Non-refund of admission advance deposit following seat surrender within stipulated AICTE cancellation window.",
        "Discrepancies in lateral entry diploma student seat allotment matrix.",
        "Misleading advertisement claims regarding NBA accreditation status during admission outreach drives.",
    ],
    "General Institutional": [
        "Absence of functional Internal Complaints Committee (ICC) and non-constitution of Student Grievance Cell.",
        "Student harassment by campus disciplinary squad without due process hearing.",
        "Arbitrary withholding of migration and provisional degree transcripts upon successful graduation.",
        "Lack of grievance redressal portal integration on the institutional website.",
    ],
}

# Extra keyword phrases per category (vocabulary officers and complainants actually use).
CATEGORY_KEYWORDS = {
    "Academic and Examination": [
        "exam result delayed", "revaluation result not declared", "answer sheet evaluation unfair",
        "hall ticket not issued", "attendance shortage detained", "syllabus not completed",
        "internal marks not uploaded", "backlog exam not conducted", "grade card error",
        "practical exam cancelled", "question paper out of syllabus", "semester marksheet",
        "project viva not conducted", "academic calendar not followed", "lectures not conducted",
    ],
    "Infrastructure and Facilities": [
        "no proper laboratory", "lab equipment not working", "hostel food quality poor",
        "drinking water not available", "library has no books", "no wifi internet",
        "building unsafe cracks", "fire safety missing", "toilets unhygienic", "no ramp for disabled",
        "classrooms overcrowded no fans", "transport bus facility", "computers outdated",
        "electricity power cuts", "no playground sports facility",
    ],
    "Faculty and Staffing": [
        "salary not paid", "teachers salary pending months", "faculty resigned not replaced",
        "unqualified teachers", "no regular professors", "faculty student ratio",
        "staff terminated without notice", "pay scale not implemented", "provident fund not deposited",
        "faculty harassed by management", "guest lecturers only", "no phd faculty",
        "experience certificate not given to staff", "relieving letter withheld", "staff appointment irregular",
    ],
    "Regulatory Compliance": [
        "running course without approval", "excess intake admitted", "not approved by aicte",
        "violation of aicte norms", "extension of approval", "mandatory disclosure not published",
        "land documents fake", "affiliation expired", "unapproved branch", "fake accreditation",
        "inspection required", "closure of course without permission", "norms and standards violated",
        "approval process handbook", "noc not obtained",
    ],
    "Admission Grievances": [
        "admission cancelled", "seat not allotted", "counselling seat", "management quota seat sold",
        "admission refund not given", "lateral entry admission", "merit list manipulated",
        "eligibility criteria ignored", "admission withdrawn", "documents taken at admission",
        "cap round allotment", "admission denied", "spot admission irregular", "provisional admission",
        "seat surrender refund",
    ],
    "Fee Related Grievances": [
        "excess fee charged", "capitation fee demanded", "donation demanded", "fee refund not given",
        "scholarship not credited", "fee receipt not given", "hidden charges", "development fee",
        "fee hike without approval", "fee regulatory committee", "cash payment demanded",
        "tuition fee waiver denied", "fine imposed illegally", "exam fee extra charges", "hostel fee excess",
    ],
    "General Institutional": [
        "harassment by management", "ragging incident", "grievance cell not functional",
        "certificates withheld", "transfer certificate not issued", "migration certificate",
        "discrimination against students", "internal complaints committee", "anti ragging committee",
        "website information missing", "student threatened", "no response from principal",
        "bonafide certificate not given", "character certificate", "misbehaviour by staff",
    ],
}

# Words that suggest a complaint needs faster handling (used for priority hints).
URGENT_KEYWORDS = {
    "ragging", "suicide", "assault", "sexual", "molestation", "threat", "threatened",
    "fire", "collapse", "unsafe", "injury", "death", "emergency", "violence",
}
HIGH_KEYWORDS = {
    "harassment", "harassed", "capitation", "donation", "withheld", "withholding", "fake",
    "without approval", "unapproved", "salary", "certificates", "fraud", "refund",
}

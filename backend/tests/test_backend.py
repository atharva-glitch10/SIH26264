import pytest
from datetime import datetime, timezone, timedelta
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from backend.app.core.database import Base, get_db
from backend.app.main import app
from backend.app.models.models import Institution, Case, Bureau, User, OverlapAlert, CaseAction, RelatedCase
from backend.app.services.matching_service import match_institution, normalize_text
from backend.app.services.overlap_service import (
    scan_and_generate_overlap_alerts, review_overlap_alert,
    link_overlap_cases, resolve_overlap_alert, dismiss_overlap_alert
)
from backend.app.services.workflow_service import assign_case, transfer_case, escalate_case, dispose_case
from backend.app.services.sla_service import evaluate_case_sla, calculate_expected_disposal_date
from backend.app.services.report_service import get_dashboard_summary, generate_excel_report

# Setup in-memory SQLite for tests
SQLALCHEMY_TEST_DATABASE_URL = "sqlite:///:memory:"
test_engine = create_engine(SQLALCHEMY_TEST_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)

@pytest.fixture(scope="function")
def db_session():
    Base.metadata.create_all(bind=test_engine)
    session = TestingSessionLocal()
    
    # Seed core bureaus and officers
    b_rb = Bureau(bureau_id="BUR-RB", bureau_code="RB", bureau_name="Regulation Bureau", active=True)
    b_pgrc = Bureau(bureau_id="BUR-PGRC", bureau_code="PGRC", bureau_name="Public Grievance Redressal Cell", active=True)
    b_app = Bureau(bureau_id="BUR-APP", bureau_code="APPROVAL", bureau_name="Approval Bureau", active=True)
    session.add_all([b_rb, b_pgrc, b_app])
    
    u1 = User(user_id="USR-RB-01", display_name="Officer RB", role="BUREAU_OFFICER", bureau_id="BUR-RB", active=True)
    u2 = User(user_id="USR-PGRC-01", display_name="Officer PGRC", role="BUREAU_OFFICER", bureau_id="BUR-PGRC", active=True)
    session.add_all([u1, u2])
    
    # Seed institution Alpha
    inst_alpha = Institution(
        institution_id="INST-1001",
        aicte_permanent_id="1-4329811",
        canonical_name="Fictional Institution Alpha",
        normalized_name=normalize_text("Fictional Institution Alpha"),
        institution_type="Engineering College",
        region="Northern",
        state="Uttar Pradesh",
        district="Kanpur"
    )
    # Seed institution Beta (similar name to test safe disambiguation)
    inst_beta = Institution(
        institution_id="INST-1002",
        aicte_permanent_id="1-9998888",
        canonical_name="Fictional Institution Alpha College of Management",
        normalized_name=normalize_text("Fictional Institution Alpha College of Management"),
        institution_type="Management Institute",
        region="Western",
        state="Maharashtra",
        district="Pune"
    )
    session.add_all([inst_alpha, inst_beta])
    session.commit()
    
    yield session
    
    session.close()
    Base.metadata.drop_all(bind=test_engine)

@pytest.fixture(scope="function")
def client(db_session):
    def override_get_db():
        try:
            yield db_session
        finally:
            pass
    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()

# --- 1. Matching & Disambiguation Tests ---

def test_exact_permanent_id_matching(db_session):
    res = match_institution(db_session, raw_name="Completely Distorted Name", aicte_permanent_id="1-4329811")
    assert res["matched"] is True
    assert res["institution_id"] == "INST-1001"
    assert res["matching_method"] == "EXACT_AICTE_ID"

def test_canonical_name_matching(db_session):
    res = match_institution(db_session, raw_name="fictional   institution   alpha!!!")
    assert res["matched"] is True
    assert res["institution_id"] == "INST-1001"
    assert res["matching_method"] == "EXACT_CANONICAL"

def test_similar_names_no_silent_merge(db_session):
    """Verifies that two similar institution names do NOT silently merge."""
    res = match_institution(db_session, raw_name="Fictional Institution Alpha Institute")
    # Score for Alpha vs Alpha College of Management is close, so safety margin should trigger review rather than auto-link
    assert res["requires_review"] is True or res["matched"] is False

# --- 2. Cross-Bureau Overlap Detection Tests ---

def test_cross_bureau_overlap_alert_generation(db_session):
    """When same institution has active RB and PGRC cases, coordination alert must be generated."""
    now = datetime.now(timezone.utc)
    c1 = Case(
        case_id="CASE-T1",
        complaint_reference="REF-T1",
        institution_id="INST-1001",
        source_bureau_id="BUR-RB",
        current_bureau_id="BUR-RB",
        category="Regulatory Compliance",
        priority="HIGH",
        description="Regulatory inspection pending",
        status="UNDER_PROCESS",
        received_at=now,
        last_action_at=now,
        expected_disposal_at=now + timedelta(days=30)
    )
    c2 = Case(
        case_id="CASE-T2",
        complaint_reference="REF-T2",
        institution_id="INST-1001",
        source_bureau_id="BUR-PGRC",
        current_bureau_id="BUR-PGRC",
        category="Fee Related Grievances",
        priority="HIGH",
        description="Student complaint on fee overcharge",
        status="UNDER_PROCESS",
        received_at=now,
        last_action_at=now,
        expected_disposal_at=now + timedelta(days=30)
    )
    db_session.add_all([c1, c2])
    db_session.commit()
    
    alerts = scan_and_generate_overlap_alerts(db_session, institution_id="INST-1001")
    assert len(alerts) >= 1
    alert = alerts[0]
    assert alert.institution_id == "INST-1001"
    assert alert.status == "NEW"
    assert "Cross-bureau coordination signal" in alert.explanation

def test_avoid_duplicate_alerts(db_session):
    """Re-scanning does not produce duplicate open alerts for the same institution."""
    now = datetime.now(timezone.utc)
    c1 = Case(
        case_id="CASE-T1", complaint_reference="REF-T1", institution_id="INST-1001",
        source_bureau_id="BUR-RB", current_bureau_id="BUR-RB", category="Regulatory Compliance",
        priority="HIGH", description="Case 1", status="UNDER_PROCESS",
        received_at=now, last_action_at=now, expected_disposal_at=now + timedelta(days=30)
    )
    c2 = Case(
        case_id="CASE-T2", complaint_reference="REF-T2", institution_id="INST-1001",
        source_bureau_id="BUR-PGRC", current_bureau_id="BUR-PGRC", category="Regulatory Compliance",
        priority="HIGH", description="Case 2", status="UNDER_PROCESS",
        received_at=now, last_action_at=now, expected_disposal_at=now + timedelta(days=30)
    )
    db_session.add_all([c1, c2])
    db_session.commit()
    
    alerts_1 = scan_and_generate_overlap_alerts(db_session, institution_id="INST-1001")
    alerts_2 = scan_and_generate_overlap_alerts(db_session, institution_id="INST-1001")
    
    total_alerts_for_inst = db_session.query(OverlapAlert).filter(OverlapAlert.institution_id == "INST-1001").count()
    assert total_alerts_for_inst == 1

def test_link_related_cases_and_history(db_session):
    now = datetime.now(timezone.utc)
    c1 = Case(
        case_id="CASE-L1", complaint_reference="REF-L1", institution_id="INST-1001",
        source_bureau_id="BUR-RB", current_bureau_id="BUR-RB", category="Regulatory Compliance",
        priority="HIGH", description="Case L1", status="UNDER_PROCESS",
        received_at=now, last_action_at=now, expected_disposal_at=now + timedelta(days=30)
    )
    c2 = Case(
        case_id="CASE-L2", complaint_reference="REF-L2", institution_id="INST-1001",
        source_bureau_id="BUR-PGRC", current_bureau_id="BUR-PGRC", category="Fee Related Grievances",
        priority="HIGH", description="Case L2", status="UNDER_PROCESS",
        received_at=now, last_action_at=now, expected_disposal_at=now + timedelta(days=30)
    )
    alert = OverlapAlert(
        alert_id="OVR-TEST-1", institution_id="INST-1001", alert_type="TEST",
        severity="HIGH", status="NEW", explanation="Test", recommended_action="Test"
    )
    db_session.add_all([c1, c2, alert])
    db_session.commit()
    
    rel = link_overlap_cases(
        db=db_session,
        alert_id="OVR-TEST-1",
        source_case_id="CASE-L1",
        target_case_id="CASE-L2",
        reason="Concurrent hearing recommended",
        actor_user_id="USR-SUPER-01",
        lead_bureau_id="BUR-RB"
    )
    assert rel.decision_status == "CONFIRMED"
    # Verify action history on both cases
    act_c1 = db_session.query(CaseAction).filter(CaseAction.case_id == "CASE-L1", CaseAction.action_type == "LINKED").first()
    assert act_c1 is not None
    assert "Concurrent hearing recommended" in act_c1.remarks

def test_dismiss_overlap_alert_requires_reason(db_session):
    alert = OverlapAlert(
        alert_id="OVR-TEST-2", institution_id="INST-1001", alert_type="TEST",
        severity="MEDIUM", status="NEW", explanation="Test", recommended_action="Test"
    )
    db_session.add(alert)
    db_session.commit()
    
    # Dismiss with empty reason must raise ValueError
    with pytest.raises(ValueError):
        dismiss_overlap_alert(db_session, "OVR-TEST-2", "", "USR-RB-01")
        
    dismissed = dismiss_overlap_alert(db_session, "OVR-TEST-2", "Independent distinct proceedings agreed by bureaus", "USR-RB-01")
    assert dismissed.status == "DISMISSED"

# --- 3. Workflow State Transitions & Actions Tests ---

def test_invalid_workflow_transition(db_session):
    now = datetime.now(timezone.utc)
    c = Case(
        case_id="CASE-W1", complaint_reference="REF-W1", institution_id="INST-1001",
        source_bureau_id="BUR-RB", current_bureau_id="BUR-RB", category="Regulatory Compliance",
        priority="HIGH", description="Case W1", status="RECEIVED",
        received_at=now, last_action_at=now, expected_disposal_at=now + timedelta(days=30)
    )
    db_session.add(c)
    db_session.commit()
    
    # Disposing directly from RECEIVED is prohibited
    with pytest.raises(ValueError):
        dispose_case(db_session, "CASE-W1", "Premature disposal attempt", "RESOLVED", "USR-RB-01")

def test_case_transfer_and_history(db_session):
    now = datetime.now(timezone.utc)
    c = Case(
        case_id="CASE-W2", complaint_reference="REF-W2", institution_id="INST-1001",
        source_bureau_id="BUR-RB", current_bureau_id="BUR-RB", category="Regulatory Compliance",
        priority="HIGH", description="Case W2", status="UNDER_PROCESS",
        received_at=now, last_action_at=now, expected_disposal_at=now + timedelta(days=30)
    )
    db_session.add(c)
    db_session.commit()
    
    updated = transfer_case(
        db=db_session,
        case_id="CASE-W2",
        destination_bureau_id="BUR-PGRC",
        reason="Matter involves student fee grievance under PGRC jurisdiction",
        actor_user_id="USR-RB-01"
    )
    assert updated.current_bureau_id == "BUR-PGRC"
    assert updated.status == "TRANSFERRED"
    
    action = db_session.query(CaseAction).filter(CaseAction.case_id == "CASE-W2", CaseAction.action_type == "TRANSFERRED").first()
    assert action is not None
    assert action.previous_bureau_id == "BUR-RB"
    assert action.new_bureau_id == "BUR-PGRC"

def test_case_escalation(db_session):
    now = datetime.now(timezone.utc)
    c = Case(
        case_id="CASE-W3", complaint_reference="REF-W3", institution_id="INST-1001",
        source_bureau_id="BUR-PGRC", current_bureau_id="BUR-PGRC", category="Fee Related Grievances",
        priority="MEDIUM", description="Case W3", status="UNDER_PROCESS",
        received_at=now, last_action_at=now, expected_disposal_at=now + timedelta(days=45)
    )
    db_session.add(c)
    db_session.commit()
    
    escalated = escalate_case(db_session, "CASE-W3", "Institution failed to respond to 3 show-cause notices", "USR-PGRC-01")
    assert escalated.status == "ESCALATED"
    assert escalated.priority == "URGENT"

def test_case_disposal_requires_timestamp_and_summary(db_session):
    now = datetime.now(timezone.utc)
    c = Case(
        case_id="CASE-W4", complaint_reference="REF-W4", institution_id="INST-1001",
        source_bureau_id="BUR-RB", current_bureau_id="BUR-RB", category="Regulatory Compliance",
        priority="HIGH", description="Case W4", status="UNDER_PROCESS",
        received_at=now, last_action_at=now, expected_disposal_at=now + timedelta(days=30)
    )
    db_session.add(c)
    db_session.commit()
    
    with pytest.raises(ValueError):
        dispose_case(db_session, "CASE-W4", "", "RESOLVED", "USR-RB-01")
        
    disposed = dispose_case(db_session, "CASE-W4", "Institution corrected faculty cadre ratio and submitted proof", "RESOLVED", "USR-RB-01")
    assert disposed.status == "DISPOSED"
    assert disposed.actual_disposal_at is not None

# --- 4. SLA & Deadline Engine Tests ---

def test_sla_evaluation_on_track_vs_overdue():
    now = datetime.now(timezone.utc)
    # Case received 10 days ago, due in 30 days -> ON_TRACK
    res1 = evaluate_case_sla(now - timedelta(days=10), now + timedelta(days=20), "UNDER_PROCESS")
    assert res1["is_overdue"] is False
    assert res1["sla_status"] == "ON_TRACK"
    
    # Case received 40 days ago, due 10 days ago -> OVERDUE
    res2 = evaluate_case_sla(now - timedelta(days=40), now - timedelta(days=10), "UNDER_PROCESS")
    assert res2["is_overdue"] is True
    assert res2["sla_status"] == "OVERDUE"
    
    # Case approaching deadline (due in 3 days) -> APPROACHING_DEADLINE
    res3 = evaluate_case_sla(now - timedelta(days=27), now + timedelta(days=3), "UNDER_PROCESS")
    assert res3["is_overdue"] is False
    assert res3["sla_status"] == "APPROACHING_DEADLINE"

# --- 5. Reports & Excel Export Tests ---

def test_dashboard_summary_and_excel_export(db_session):
    now = datetime.now(timezone.utc)
    c1 = Case(
        case_id="CASE-R1", complaint_reference="REF-R1", institution_id="INST-1001",
        source_bureau_id="BUR-RB", current_bureau_id="BUR-RB", category="Regulatory Compliance",
        priority="HIGH", description="Case R1", status="DISPOSED",
        received_at=now - timedelta(days=20), last_action_at=now, expected_disposal_at=now + timedelta(days=10),
        actual_disposal_at=now
    )
    db_session.add(c1)
    db_session.commit()
    
    summary = get_dashboard_summary(db_session)
    assert summary["total_cases"] == 1
    assert summary["disposed_cases"] == 1
    
    excel_io = generate_excel_report(db_session)
    assert excel_io is not None
    assert excel_io.getbuffer().nbytes > 1000  # Genuine binary xlsx file

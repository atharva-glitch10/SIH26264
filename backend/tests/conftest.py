"""Test configuration: isolated in-memory database, no background SLA task."""
import os

os.environ.setdefault("DATABASE_URL", "sqlite://")
os.environ.setdefault("SLA_MONITOR_ENABLED", "false")
os.environ.setdefault("AUTH_ENABLED", "true")

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from backend.app.core.database import Base, get_db
from backend.app.core.security import hash_password
from backend.app.main import app
from backend.app.models.models import Bureau, Institution, User
from backend.app.services.intake_service import invalidate_classifier
from backend.app.services.matching_service import normalize_text

# Setup in-memory SQLite for tests
SQLALCHEMY_TEST_DATABASE_URL = "sqlite:///:memory:"
test_engine = create_engine(SQLALCHEMY_TEST_DATABASE_URL, connect_args={"check_same_thread": False}, poolclass=StaticPool)
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
    
    pw = hash_password("test-pass")
    u1 = User(user_id="USR-RB-01", display_name="Officer RB", role="BUREAU_OFFICER", bureau_id="BUR-RB", password_hash=pw, active=True)
    u2 = User(user_id="USR-PGRC-01", display_name="Officer PGRC", role="BUREAU_OFFICER", bureau_id="BUR-PGRC", password_hash=pw, active=True)
    u3 = User(user_id="USR-SUPER-01", display_name="Admin", role="SUPER_ADMIN", password_hash=pw, active=True)
    u4 = User(user_id="USR-REG-01", display_name="Regional", role="REGIONAL_OFFICER", password_hash=pw, active=True)
    session.add_all([u1, u2, u3, u4])
    
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
    
    invalidate_classifier()
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


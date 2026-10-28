from datetime import datetime, timezone
from sqlalchemy import (
    Column, String, Integer, Float, Boolean, DateTime, Text, ForeignKey,
    Table, UniqueConstraint, Index
)
from sqlalchemy.orm import relationship
from backend.app.core.database import Base

def utc_now():
    return datetime.now(timezone.utc)

class Institution(Base):
    __tablename__ = "institutions"

    institution_id = Column(String(50), primary_key=True, index=True)
    aicte_permanent_id = Column(String(50), unique=True, index=True, nullable=True)
    canonical_name = Column(String(255), nullable=False, index=True)
    normalized_name = Column(String(255), nullable=False, index=True)
    institution_type = Column(String(100), nullable=False)
    region = Column(String(50), nullable=False, index=True)
    state = Column(String(100), nullable=False, index=True)
    district = Column(String(100), nullable=True)
    address = Column(Text, nullable=True)
    contact_email = Column(String(150), nullable=True)
    contact_phone = Column(String(50), nullable=True)
    created_at = Column(DateTime, default=utc_now, nullable=False)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now, nullable=False)

    aliases = relationship("InstitutionAlias", back_populates="institution", cascade="all, delete-orphan")
    cases = relationship("Case", back_populates="institution", cascade="all, delete-orphan")
    overlap_alerts = relationship("OverlapAlert", back_populates="institution", cascade="all, delete-orphan")


class InstitutionAlias(Base):
    __tablename__ = "institution_aliases"

    alias_id = Column(Integer, primary_key=True, autoincrement=True)
    institution_id = Column(String(50), ForeignKey("institutions.institution_id", ondelete="CASCADE"), nullable=False, index=True)
    alias_name = Column(String(255), nullable=False)
    normalized_alias = Column(String(255), nullable=False, index=True)
    source = Column(String(100), default="Complaint Submission")
    verification_status = Column(String(50), default="VERIFIED")  # VERIFIED, PENDING_REVIEW, REJECTED
    created_at = Column(DateTime, default=utc_now, nullable=False)

    institution = relationship("Institution", back_populates="aliases")


class Bureau(Base):
    __tablename__ = "bureaus"

    bureau_id = Column(String(50), primary_key=True)
    bureau_code = Column(String(20), unique=True, nullable=False)
    bureau_name = Column(String(150), nullable=False)
    description = Column(Text, nullable=True)
    active = Column(Boolean, default=True, nullable=False)

    users = relationship("User", back_populates="bureau")


class User(Base):
    __tablename__ = "users"

    user_id = Column(String(50), primary_key=True)
    display_name = Column(String(100), nullable=False)
    role = Column(String(50), nullable=False)  # SUPER_ADMIN, BUREAU_OFFICER, REGIONAL_OFFICER, SENIOR_MANAGEMENT
    bureau_id = Column(String(50), ForeignKey("bureaus.bureau_id"), nullable=True)
    email = Column(String(150), nullable=True)
    active = Column(Boolean, default=True, nullable=False)

    bureau = relationship("Bureau", back_populates="users")
    assigned_cases = relationship("Case", back_populates="assigned_user")


class Case(Base):
    __tablename__ = "cases"

    case_id = Column(String(50), primary_key=True, index=True)
    complaint_reference = Column(String(100), unique=True, index=True, nullable=False)
    institution_id = Column(String(50), ForeignKey("institutions.institution_id", ondelete="CASCADE"), nullable=False, index=True)
    source_bureau_id = Column(String(50), ForeignKey("bureaus.bureau_id"), nullable=False)
    current_bureau_id = Column(String(50), ForeignKey("bureaus.bureau_id"), nullable=False, index=True)
    assigned_user_id = Column(String(50), ForeignKey("users.user_id"), nullable=True)
    
    category = Column(String(100), nullable=False, index=True)
    priority = Column(String(20), default="MEDIUM", nullable=False, index=True)
    description = Column(Text, nullable=False)
    status = Column(String(30), default="RECEIVED", nullable=False, index=True)
    
    received_at = Column(DateTime, default=utc_now, nullable=False, index=True)
    last_action_at = Column(DateTime, default=utc_now, nullable=False)
    last_action_summary = Column(String(255), nullable=True)
    next_action = Column(String(255), nullable=True)
    expected_disposal_at = Column(DateTime, nullable=False, index=True)
    actual_disposal_at = Column(DateTime, nullable=True)
    
    created_at = Column(DateTime, default=utc_now, nullable=False)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now, nullable=False)

    institution = relationship("Institution", back_populates="cases")
    source_bureau = relationship("Bureau", foreign_keys=[source_bureau_id])
    current_bureau = relationship("Bureau", foreign_keys=[current_bureau_id])
    assigned_user = relationship("User", back_populates="assigned_cases")
    
    actions = relationship("CaseAction", back_populates="case", cascade="all, delete-orphan", order_by="CaseAction.created_at.desc()")
    overlap_links = relationship("OverlapAlertCase", back_populates="case", cascade="all, delete-orphan")


class CaseAction(Base):
    __tablename__ = "case_actions"

    action_id = Column(Integer, primary_key=True, autoincrement=True)
    case_id = Column(String(50), ForeignKey("cases.case_id", ondelete="CASCADE"), nullable=False, index=True)
    action_type = Column(String(50), nullable=False)  # REGISTERED, ASSIGNED, STATUS_CHANGE, OFFICER_CHANGE, TRANSFERRED, ESCALATED, LINKED, COORDINATION_NOTE, DISPOSED, REOPENED
    previous_status = Column(String(30), nullable=True)
    new_status = Column(String(30), nullable=False)
    previous_bureau_id = Column(String(50), nullable=True)
    new_bureau_id = Column(String(50), nullable=True)
    actor_user_id = Column(String(50), nullable=False)
    remarks = Column(Text, nullable=False)
    next_action = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=utc_now, nullable=False, index=True)

    case = relationship("Case", back_populates="actions")


class RelatedCase(Base):
    __tablename__ = "related_cases"

    relationship_id = Column(Integer, primary_key=True, autoincrement=True)
    source_case_id = Column(String(50), ForeignKey("cases.case_id", ondelete="CASCADE"), nullable=False, index=True)
    related_case_id = Column(String(50), ForeignKey("cases.case_id", ondelete="CASCADE"), nullable=False, index=True)
    relationship_type = Column(String(50), default="CROSS_BUREAU_OVERLAP", nullable=False)
    decision_status = Column(String(30), default="CONFIRMED", nullable=False)  # PROPOSED, CONFIRMED, DISMISSED
    reason = Column(Text, nullable=False)
    created_by = Column(String(50), nullable=False)
    created_at = Column(DateTime, default=utc_now, nullable=False)

    __table_args__ = (
        UniqueConstraint("source_case_id", "related_case_id", name="uq_related_case_pair"),
    )


class OverlapAlert(Base):
    __tablename__ = "overlap_alerts"

    alert_id = Column(String(50), primary_key=True, index=True)
    institution_id = Column(String(50), ForeignKey("institutions.institution_id", ondelete="CASCADE"), nullable=False, index=True)
    alert_type = Column(String(100), default="CROSS_BUREAU_CONCURRENT_CASES", nullable=False)
    severity = Column(String(20), default="MEDIUM", nullable=False)  # LOW, MEDIUM, HIGH, CRITICAL
    status = Column(String(30), default="NEW", nullable=False, index=True)  # NEW, UNDER_REVIEW, COORDINATION_REQUIRED, LINKED_ACKNOWLEDGED, RESOLVED, DISMISSED
    explanation = Column(Text, nullable=False)
    recommended_action = Column(Text, nullable=False)
    resolution_reason = Column(Text, nullable=True)
    lead_bureau_id = Column(String(50), ForeignKey("bureaus.bureau_id"), nullable=True)
    reviewed_by = Column(String(50), nullable=True)
    
    created_at = Column(DateTime, default=utc_now, nullable=False)
    reviewed_at = Column(DateTime, nullable=True)
    resolved_at = Column(DateTime, nullable=True)

    institution = relationship("Institution", back_populates="overlap_alerts")
    lead_bureau = relationship("Bureau", foreign_keys=[lead_bureau_id])
    alert_cases = relationship("OverlapAlertCase", back_populates="alert", cascade="all, delete-orphan")


class OverlapAlertCase(Base):
    __tablename__ = "overlap_alert_cases"

    alert_id = Column(String(50), ForeignKey("overlap_alerts.alert_id", ondelete="CASCADE"), primary_key=True)
    case_id = Column(String(50), ForeignKey("cases.case_id", ondelete="CASCADE"), primary_key=True)

    alert = relationship("OverlapAlert", back_populates="alert_cases")
    case = relationship("Case", back_populates="overlap_links")


class Notification(Base):
    __tablename__ = "notifications"

    notification_id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(String(50), nullable=True, index=True)
    bureau_id = Column(String(50), nullable=True, index=True)
    alert_type = Column(String(50), nullable=False)  # OVERLAP_DETECTED, SLA_APPROACHING, SLA_BREACHED, ESCALATION, TRANSFER_RECEIVED
    reference_id = Column(String(50), nullable=True)
    message = Column(String(255), nullable=False)
    read_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=utc_now, nullable=False)


class AuditLog(Base):
    __tablename__ = "audit_logs"

    audit_id = Column(Integer, primary_key=True, autoincrement=True)
    actor_user_id = Column(String(50), nullable=False)
    entity_type = Column(String(50), nullable=False, index=True)  # CASE, INSTITUTION, OVERLAP_ALERT, ACTION
    entity_id = Column(String(50), nullable=False, index=True)
    action = Column(String(50), nullable=False)  # CREATE, UPDATE, TRANSFER, ESCALATE, DISPOSE, LINK, DISMISS, RESOLVE
    before_snapshot = Column(Text, nullable=True)
    after_snapshot = Column(Text, nullable=True)
    timestamp = Column(DateTime, default=utc_now, nullable=False, index=True)


class MatchingReviewQueue(Base):
    __tablename__ = "matching_review_queue"

    match_id = Column(Integer, primary_key=True, autoincrement=True)
    raw_input_name = Column(String(255), nullable=False)
    normalized_input_name = Column(String(255), nullable=False)
    candidate_institution_id = Column(String(50), ForeignKey("institutions.institution_id", ondelete="CASCADE"), nullable=False)
    confidence_score = Column(Float, nullable=False)
    matching_method = Column(String(50), nullable=False)  # EXACT_AICTE_ID, EXACT_CANONICAL, ALIAS_MATCH, FUZZY_RAPIDFUZZ
    decision_status = Column(String(30), default="PENDING", nullable=False)  # PENDING, APPROVED, REJECTED
    reviewer_id = Column(String(50), nullable=True)
    reviewed_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=utc_now, nullable=False)

    candidate_institution = relationship("Institution")


class ImportBatch(Base):
    __tablename__ = "import_batches"

    import_id = Column(String(50), primary_key=True)
    source = Column(String(100), nullable=False)
    imported_at = Column(DateTime, default=utc_now, nullable=False)
    record_count = Column(Integer, default=0, nullable=False)
    valid_count = Column(Integer, default=0, nullable=False)
    rejected_count = Column(Integer, default=0, nullable=False)
    processing_status = Column(String(30), default="COMPLETED", nullable=False)

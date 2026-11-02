from typing import Optional, List, Dict, Any
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_, func

from backend.app.models.models import (
    Institution, InstitutionAlias, Case, OverlapAlert, CaseAction, Bureau
)
from backend.app.services.sla_service import evaluate_case_sla
from backend.app.services.matching_service import normalize_text
from backend.app.services.risk_engine import compute_risk

def get_institution_metrics(db: Session, institution_id: str) -> Dict[str, Any]:
    cases = db.query(Case).filter(Case.institution_id == institution_id).all()
    
    active_cases = [c for c in cases if c.status not in ("DISPOSED", "CLOSED")]
    pending_cases = [c for c in cases if c.status in ("RECEIVED", "PENDING")]
    
    overdue_count = 0
    bureaus_set = set()
    cases_summary: Dict[str, int] = {}
    
    for c in cases:
        bureaus_set.add(c.current_bureau_id)
        cases_summary[c.status] = cases_summary.get(c.status, 0) + 1
        if c.status not in ("DISPOSED", "CLOSED"):
            sla_info = evaluate_case_sla(c.received_at, c.expected_disposal_at, c.status, c.actual_disposal_at)
            if sla_info["is_overdue"]:
                overdue_count += 1
                
    # Check unresolved overlap alerts
    has_active_overlap = db.query(OverlapAlert).filter(
        OverlapAlert.institution_id == institution_id,
        OverlapAlert.status.in_(["NEW", "UNDER_REVIEW", "COORDINATION_REQUIRED", "LINKED_ACKNOWLEDGED"])
    ).count() > 0

    # Explainable risk score + repeat-offender flag (see risk_engine.py)
    risk = compute_risk(cases, has_active_overlap)

    return {
        "active_cases_count": len(active_cases),
        "pending_cases_count": len(pending_cases),
        "overdue_cases_count": overdue_count,
        "bureaus_count": len(bureaus_set),
        "has_active_overlap": has_active_overlap,
        "risk_level": risk["risk_level"],
        "risk_score": risk["risk_score"],
        "is_repeat_offender": risk["is_repeat_offender"],
        "risk_factors": risk["risk_factors"],
        "cases_summary": cases_summary,
        "participating_bureaus": sorted(list(bureaus_set))
    }

def list_institutions(
    db: Session,
    search: Optional[str] = None,
    region: Optional[str] = None,
    state: Optional[str] = None,
    institution_type: Optional[str] = None,
    risk_level: Optional[str] = None,
    has_overlap: Optional[bool] = None,
    page: int = 1,
    page_size: int = 20,
    repeat_offender_only: bool = False,
    sort_by: Optional[str] = None
) -> Dict[str, Any]:
    query = db.query(Institution)
    
    if search and search.strip():
        term = f"%{search.strip()}%"
        query = query.filter(
            or_(
                Institution.canonical_name.ilike(term),
                Institution.aicte_permanent_id.ilike(term),
                Institution.institution_id.ilike(term)
            )
        )
        
    if region and region != "ALL":
        query = query.filter(Institution.region == region)
    if state and state != "ALL":
        query = query.filter(Institution.state == state)
    if institution_type and institution_type != "ALL":
        query = query.filter(Institution.institution_type == institution_type)
        
    def build(inst: Institution) -> Dict[str, Any]:
        return {
            "institution_id": inst.institution_id,
            "aicte_permanent_id": inst.aicte_permanent_id,
            "canonical_name": inst.canonical_name,
            "institution_type": inst.institution_type,
            "region": inst.region,
            "state": inst.state,
            "district": inst.district,
            "address": inst.address,
            "contact_email": inst.contact_email,
            "contact_phone": inst.contact_phone,
            "created_at": inst.created_at,
            "updated_at": inst.updated_at,
            **get_institution_metrics(db, inst.institution_id),
        }

    needs_metrics_filter = (risk_level and risk_level != "ALL") or has_overlap is not None or repeat_offender_only
    if needs_metrics_filter or sort_by == "risk":
        # Metric-based filters/sorting must run BEFORE pagination.
        rows = [build(i) for i in query.order_by(Institution.canonical_name.asc()).all()]
        if risk_level and risk_level != "ALL":
            rows = [r for r in rows if r["risk_level"] == risk_level]
        if has_overlap is not None:
            rows = [r for r in rows if r["has_active_overlap"] == has_overlap]
        if repeat_offender_only:
            rows = [r for r in rows if r["is_repeat_offender"]]
        if sort_by == "risk":
            rows.sort(key=lambda r: r["risk_score"], reverse=True)
        total = len(rows)
        result_items = rows[(page - 1) * page_size: page * page_size]
    else:
        total = query.count()
        items = query.order_by(Institution.canonical_name.asc()).offset((page - 1) * page_size).limit(page_size).all()
        result_items = [build(i) for i in items]

    total_pages = max(1, (total + page_size - 1) // page_size)
    return {
        "items": result_items,
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": total_pages
    }

def get_institution_360(db: Session, institution_id: str) -> Dict[str, Any]:
    inst = db.query(Institution).filter(Institution.institution_id == institution_id).first()
    if not inst:
        raise ValueError("Institution not found")
        
    metrics = get_institution_metrics(db, institution_id)
    
    # Get all aliases
    aliases = db.query(InstitutionAlias).filter(InstitutionAlias.institution_id == institution_id).all()
    
    # Get all cases with SLA evaluated
    cases = db.query(Case).filter(Case.institution_id == institution_id).order_by(Case.received_at.desc()).all()
    case_items = []
    for c in cases:
        sla_info = evaluate_case_sla(c.received_at, c.expected_disposal_at, c.status, c.actual_disposal_at)
        case_items.append({
            "case_id": c.case_id,
            "complaint_reference": c.complaint_reference,
            "institution_id": c.institution_id,
            "institution_name": inst.canonical_name,
            "source_bureau_id": c.source_bureau_id,
            "current_bureau_id": c.current_bureau_id,
            "assigned_user_id": c.assigned_user_id,
            "category": c.category,
            "priority": c.priority,
            "description": c.description,
            "status": c.status,
            "received_at": c.received_at,
            "last_action_at": c.last_action_at,
            "last_action_summary": c.last_action_summary,
            "next_action": c.next_action,
            "expected_disposal_at": c.expected_disposal_at,
            "actual_disposal_at": c.actual_disposal_at,
            "days_pending": sla_info["days_pending"],
            "is_overdue": sla_info["is_overdue"],
            "sla_status": sla_info["sla_status"],
            "created_at": c.created_at,
            "updated_at": c.updated_at
        })
        
    # Get overlap alerts
    alerts = db.query(OverlapAlert).filter(OverlapAlert.institution_id == institution_id).all()
    alert_items = []
    for a in alerts:
        alert_items.append({
            "alert_id": a.alert_id,
            "alert_type": a.alert_type,
            "severity": a.severity,
            "status": a.status,
            "explanation": a.explanation,
            "recommended_action": a.recommended_action,
            "resolution_reason": a.resolution_reason,
            "lead_bureau_id": a.lead_bureau_id,
            "created_at": a.created_at
        })
        
    # Get chronological timeline of actions across all cases of this institution
    case_ids = [c.case_id for c in cases]
    actions = db.query(CaseAction).filter(CaseAction.case_id.in_(case_ids)).order_by(CaseAction.created_at.desc()).limit(50).all()
    timeline_items = []
    for act in actions:
        timeline_items.append({
            "action_id": act.action_id,
            "case_id": act.case_id,
            "action_type": act.action_type,
            "previous_status": act.previous_status,
            "new_status": act.new_status,
            "previous_bureau_id": act.previous_bureau_id,
            "new_bureau_id": act.new_bureau_id,
            "actor_user_id": act.actor_user_id,
            "remarks": act.remarks,
            "next_action": act.next_action,
            "created_at": act.created_at
        })
        
    return {
        "institution": {
            "institution_id": inst.institution_id,
            "aicte_permanent_id": inst.aicte_permanent_id,
            "canonical_name": inst.canonical_name,
            "institution_type": inst.institution_type,
            "region": inst.region,
            "state": inst.state,
            "district": inst.district,
            "address": inst.address,
            "contact_email": inst.contact_email,
            "contact_phone": inst.contact_phone,
            "created_at": inst.created_at,
            "updated_at": inst.updated_at,
            **metrics
        },
        "aliases": [
            {
                "alias_id": al.alias_id,
                "alias_name": al.alias_name,
                "normalized_alias": al.normalized_alias,
                "source": al.source,
                "verification_status": al.verification_status
            }
            for al in aliases
        ],
        "cases": case_items,
        "overlap_alerts": alert_items,
        "timeline": timeline_items
    }

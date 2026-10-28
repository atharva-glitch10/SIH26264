from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional, List, Dict, Any

from backend.app.core.database import get_db
from backend.app.models.models import OverlapAlert, OverlapAlertCase, Case, Bureau
from backend.app.schemas.schemas import (
    OverlapAlertOut, OverlapAlertDetailOut, OverlapReviewRequest,
    OverlapLinkRequest, OverlapResolveRequest, OverlapDismissRequest
)
from backend.app.services.overlap_service import (
    scan_and_generate_overlap_alerts, review_overlap_alert,
    link_overlap_cases, resolve_overlap_alert, dismiss_overlap_alert
)

router = APIRouter(prefix="/overlaps", tags=["Cross-Bureau Overlaps"])

@router.get("")
def list_overlap_alerts(
    status: Optional[str] = Query(None, description="Alert status filter"),
    severity: Optional[str] = Query(None, description="Severity filter"),
    institution_id: Optional[str] = Query(None, description="Institution ID filter"),
    db: Session = Depends(get_db)
):
    query = db.query(OverlapAlert)
    if status and status != "ALL":
        query = query.filter(OverlapAlert.status == status)
    if severity and severity != "ALL":
        query = query.filter(OverlapAlert.severity == severity)
    if institution_id:
        query = query.filter(OverlapAlert.institution_id == institution_id)
        
    alerts = query.order_by(OverlapAlert.created_at.desc()).all()
    
    result = []
    for a in alerts:
        inst = a.institution
        case_links = a.alert_cases
        bureau_set = set()
        for link in case_links:
            if link.case:
                bureau_set.add(link.case.current_bureau_id)
                
        result.append({
            "alert_id": a.alert_id,
            "institution_id": a.institution_id,
            "institution_name": inst.canonical_name if inst else a.institution_id,
            "aicte_permanent_id": inst.aicte_permanent_id if inst else None,
            "alert_type": a.alert_type,
            "severity": a.severity,
            "status": a.status,
            "explanation": a.explanation,
            "recommended_action": a.recommended_action,
            "resolution_reason": a.resolution_reason,
            "lead_bureau_id": a.lead_bureau_id,
            "created_at": a.created_at,
            "reviewed_at": a.reviewed_at,
            "resolved_at": a.resolved_at,
            "participating_bureaus": sorted(list(bureau_set)),
            "cases_count": len(case_links)
        })
    return result

@router.post("/scan")
def trigger_overlap_scan(db: Session = Depends(get_db)):
    alerts = scan_and_generate_overlap_alerts(db)
    return {"message": f"Scan completed. {len(alerts)} overlap conditions evaluated/updated."}

@router.get("/{alert_id}")
def get_overlap_alert_detail(alert_id: str, db: Session = Depends(get_db)):
    alert = db.query(OverlapAlert).filter(OverlapAlert.alert_id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Overlap alert not found")
        
    inst = alert.institution
    cases_summary = []
    bureau_set = set()
    
    for link in alert.alert_cases:
        c = link.case
        if c:
            bureau_set.add(c.current_bureau_id)
            bureau = db.query(Bureau).filter(Bureau.bureau_id == c.current_bureau_id).first()
            user_name = c.assigned_user.display_name if c.assigned_user else "Unassigned"
            cases_summary.append({
                "case_id": c.case_id,
                "complaint_reference": c.complaint_reference,
                "bureau_id": c.current_bureau_id,
                "bureau_code": bureau.bureau_code if bureau else c.current_bureau_id,
                "category": c.category,
                "priority": c.priority,
                "status": c.status,
                "received_at": c.received_at,
                "last_action_summary": c.last_action_summary,
                "next_action": c.next_action,
                "assigned_user_name": user_name
            })
            
    return {
        "alert_id": alert.alert_id,
        "institution_id": alert.institution_id,
        "institution_name": inst.canonical_name if inst else alert.institution_id,
        "aicte_permanent_id": inst.aicte_permanent_id if inst else None,
        "alert_type": alert.alert_type,
        "severity": alert.severity,
        "status": alert.status,
        "explanation": alert.explanation,
        "recommended_action": alert.recommended_action,
        "resolution_reason": alert.resolution_reason,
        "lead_bureau_id": alert.lead_bureau_id,
        "created_at": alert.created_at,
        "reviewed_at": alert.reviewed_at,
        "resolved_at": alert.resolved_at,
        "participating_bureaus": sorted(list(bureau_set)),
        "cases_count": len(cases_summary),
        "cases": cases_summary
    }

@router.post("/{alert_id}/review")
def review_alert(alert_id: str, data: OverlapReviewRequest, db: Session = Depends(get_db)):
    try:
        updated = review_overlap_alert(
            db=db,
            alert_id=alert_id,
            reviewer_id=data.reviewer_id or "USR-SYS-01",
            remarks=data.remarks
        )
        return {"message": "Overlap alert status set to COORDINATION_REQUIRED", "status": updated.status}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/{alert_id}/link-cases")
def link_cases(alert_id: str, data: OverlapLinkRequest, db: Session = Depends(get_db)):
    try:
        rel = link_overlap_cases(
            db=db,
            alert_id=alert_id,
            source_case_id=data.source_case_id,
            target_case_id=data.target_case_id,
            reason=data.reason,
            actor_user_id=data.actor_user_id or "USR-SYS-01",
            lead_bureau_id=data.lead_bureau_id
        )
        return {
            "message": "Cases successfully linked with cross-bureau coordination flag",
            "relationship_id": rel.relationship_id,
            "source_case_id": rel.source_case_id,
            "target_case_id": rel.related_case_id
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/{alert_id}/resolve")
def resolve_alert(alert_id: str, data: OverlapResolveRequest, db: Session = Depends(get_db)):
    try:
        updated = resolve_overlap_alert(
            db=db,
            alert_id=alert_id,
            resolution_reason=data.resolution_reason,
            actor_user_id=data.actor_user_id or "USR-SYS-01",
            lead_bureau_id=data.lead_bureau_id
        )
        return {
            "message": "Overlap alert marked as RESOLVED",
            "status": updated.status,
            "resolved_at": updated.resolved_at
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/{alert_id}/dismiss")
def dismiss_alert(alert_id: str, data: OverlapDismissRequest, db: Session = Depends(get_db)):
    try:
        updated = dismiss_overlap_alert(
            db=db,
            alert_id=alert_id,
            justification=data.justification,
            actor_user_id=data.actor_user_id or "USR-SYS-01"
        )
        return {
            "message": "Overlap alert DISMISSED with recorded justification",
            "status": updated.status
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

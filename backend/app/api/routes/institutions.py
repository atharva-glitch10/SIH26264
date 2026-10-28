from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional, List, Dict, Any

from backend.app.core.database import get_db
from backend.app.models.models import Institution
from backend.app.schemas.schemas import (
    InstitutionOut, InstitutionDetailOut, InstitutionCreate, InstitutionUpdate
)
from backend.app.services.institution_service import list_institutions, get_institution_360
from backend.app.services.matching_service import normalize_text
from backend.app.services.audit_service import record_audit_log

router = APIRouter(prefix="/institutions", tags=["Institutions"])

@router.get("")
def get_all_institutions(
    search: Optional[str] = Query(None, description="Search by name, Permanent ID, or ID"),
    region: Optional[str] = Query(None, description="Regional office filter"),
    state: Optional[str] = Query(None, description="State filter"),
    institution_type: Optional[str] = Query(None, description="Institution type"),
    risk_level: Optional[str] = Query(None, description="Risk level filter (LOW, MEDIUM, HIGH)"),
    has_overlap: Optional[bool] = Query(None, description="Filter institutions with active cross-bureau overlap"),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db)
):
    return list_institutions(
        db=db,
        search=search,
        region=region,
        state=state,
        institution_type=institution_type,
        risk_level=risk_level,
        has_overlap=has_overlap,
        page=page,
        page_size=page_size
    )

@router.post("", status_code=201)
def create_institution(
    data: InstitutionCreate,
    actor_user_id: Optional[str] = "USR-SYS-01",
    db: Session = Depends(get_db)
):
    # Check duplicate permanent ID
    if data.aicte_permanent_id:
        existing = db.query(Institution).filter(Institution.aicte_permanent_id == data.aicte_permanent_id).first()
        if existing:
            raise HTTPException(status_code=400, detail="AICTE Permanent ID already registered")
            
    count = db.query(Institution).count()
    inst_id = f"INST-{1000 + count + 1}"
    
    inst = Institution(
        institution_id=inst_id,
        aicte_permanent_id=data.aicte_permanent_id,
        canonical_name=data.canonical_name,
        normalized_name=normalize_text(data.canonical_name),
        institution_type=data.institution_type,
        region=data.region,
        state=data.state,
        district=data.district,
        address=data.address,
        contact_email=data.contact_email,
        contact_phone=data.contact_phone
    )
    db.add(inst)
    
    record_audit_log(
        db=db,
        actor_user_id=actor_user_id,
        entity_type="INSTITUTION",
        entity_id=inst_id,
        action="CREATE",
        before=None,
        after={"name": data.canonical_name, "permanent_id": data.aicte_permanent_id}
    )
    
    db.commit()
    db.refresh(inst)
    return {"message": "Institution registered successfully", "institution_id": inst_id}

@router.get("/{institution_id}")
def get_institution(institution_id: str, db: Session = Depends(get_db)):
    try:
        return get_institution_360(db, institution_id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

@router.patch("/{institution_id}")
def update_institution(
    institution_id: str,
    data: InstitutionUpdate,
    actor_user_id: Optional[str] = "USR-SYS-01",
    db: Session = Depends(get_db)
):
    inst = db.query(Institution).filter(Institution.institution_id == institution_id).first()
    if not inst:
        raise HTTPException(status_code=404, detail="Institution not found")
        
    before = {
        "canonical_name": inst.canonical_name,
        "region": inst.region,
        "state": inst.state
    }
    
    update_data = data.model_dump(exclude_unset=True)
    if "canonical_name" in update_data:
        inst.canonical_name = update_data["canonical_name"]
        inst.normalized_name = normalize_text(update_data["canonical_name"])
    for key, val in update_data.items():
        if key != "canonical_name":
            setattr(inst, key, val)
            
    record_audit_log(
        db=db,
        actor_user_id=actor_user_id,
        entity_type="INSTITUTION",
        entity_id=institution_id,
        action="UPDATE",
        before=before,
        after=update_data
    )
    
    db.commit()
    return {"message": "Institution profile updated successfully"}

@router.get("/{institution_id}/cases")
def get_institution_cases(institution_id: str, db: Session = Depends(get_db)):
    res = get_institution_360(db, institution_id)
    return res.get("cases", [])

@router.get("/{institution_id}/timeline")
def get_institution_timeline(institution_id: str, db: Session = Depends(get_db)):
    res = get_institution_360(db, institution_id)
    return res.get("timeline", [])

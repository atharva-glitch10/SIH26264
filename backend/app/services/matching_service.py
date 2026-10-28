import re
import json
from typing import Optional, Dict, Any, List, Tuple
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from rapidfuzz import fuzz

from backend.app.core.config import settings
from backend.app.models.models import Institution, InstitutionAlias, MatchingReviewQueue, AuditLog

def normalize_text(text: str) -> str:
    """Normalizes string: lowercase, strips punctuation and multiple whitespace."""
    if not text:
        return ""
    text = text.lower()
    text = re.sub(r"[^\w\s]", " ", text)
    text = re.sub(r"\s+", " ", text)
    return text.strip()

def load_overlap_matching_config() -> Dict[str, Any]:
    if settings.OVERLAP_RULES_PATH.exists():
        with open(settings.OVERLAP_RULES_PATH, "r", encoding="utf-8") as f:
            return json.load(f)
    return {
        "matching_thresholds": {
            "auto_match_min_score": 90.0,
            "ambiguity_safety_margin": 10.0,
            "manual_review_min_score": 75.0
        }
    }

def match_institution(
    db: Session, 
    raw_name: str, 
    aicte_permanent_id: Optional[str] = None
) -> Dict[str, Any]:
    """
    Performs multi-stage hierarchical matching:
    1. Exact Permanent ID
    2. Exact Canonical Name (Normalized)
    3. Verified Alias Match
    4. Fuzzy RapidFuzz with Ambiguity Margin
    """
    cfg = load_overlap_matching_config().get("matching_thresholds", {})
    auto_threshold = cfg.get("auto_match_min_score", 90.0)
    safety_margin = cfg.get("ambiguity_safety_margin", 10.0)
    manual_threshold = cfg.get("manual_review_min_score", 75.0)

    # 1. Exact AICTE Permanent ID Match
    if aicte_permanent_id and aicte_permanent_id.strip():
        pid = aicte_permanent_id.strip()
        inst = db.query(Institution).filter(Institution.aicte_permanent_id == pid).first()
        if inst:
            return {
                "matched": True,
                "institution_id": inst.institution_id,
                "confidence_score": 100.0,
                "matching_method": "EXACT_AICTE_ID",
                "requires_review": False,
                "details": f"Matched directly via Permanent ID {pid}"
            }

    norm_input = normalize_text(raw_name)
    if not norm_input:
        return {
            "matched": False,
            "institution_id": None,
            "confidence_score": 0.0,
            "matching_method": "NONE",
            "requires_review": False,
            "details": "Empty institution name provided"
        }

    # 2. Exact Normalized Canonical Name Match
    inst_canonical = db.query(Institution).filter(Institution.normalized_name == norm_input).first()
    if inst_canonical:
        return {
            "matched": True,
            "institution_id": inst_canonical.institution_id,
            "confidence_score": 100.0,
            "matching_method": "EXACT_CANONICAL",
            "requires_review": False,
            "details": f"Exact match with canonical record: {inst_canonical.canonical_name}"
        }

    # 3. Verified Alias Match
    alias_match = db.query(InstitutionAlias).filter(
        InstitutionAlias.normalized_alias == norm_input,
        InstitutionAlias.verification_status == "VERIFIED"
    ).first()
    if alias_match:
        return {
            "matched": True,
            "institution_id": alias_match.institution_id,
            "confidence_score": 98.0,
            "matching_method": "ALIAS_MATCH",
            "requires_review": False,
            "details": f"Matched via verified alias '{alias_match.alias_name}'"
        }

    # 4. Fuzzy RapidFuzz Token Match
    all_institutions = db.query(Institution).all()
    scored_candidates: List[Tuple[float, Institution]] = []
    
    for inst in all_institutions:
        # Evaluate token_sort_ratio as primary canonical comparison
        score_sort = fuzz.token_sort_ratio(norm_input, inst.normalized_name)
        if score_sort >= manual_threshold:
            scored_candidates.append((float(score_sort), inst))

    # Sort descending by score
    scored_candidates.sort(key=lambda x: x[0], reverse=True)

    if not scored_candidates:
        return {
            "matched": False,
            "institution_id": None,
            "confidence_score": 0.0,
            "matching_method": "FUZZY_RAPIDFUZZ",
            "requires_review": True,
            "details": f"No candidate institution found above {manual_threshold}% threshold"
        }

    top_score, top_inst = scored_candidates[0]
    second_score = scored_candidates[1][0] if len(scored_candidates) > 1 else 0.0

    # Check Ambiguity: If second candidate is within safety margin, do not auto-match!
    is_ambiguous = (top_score - second_score) < safety_margin

    if top_score >= auto_threshold and not is_ambiguous:
        return {
            "matched": True,
            "institution_id": top_inst.institution_id,
            "confidence_score": float(top_score),
            "matching_method": "FUZZY_RAPIDFUZZ",
            "requires_review": False,
            "details": f"Auto-matched with {top_inst.canonical_name} (Score: {top_score:.1f}%)"
        }

    # Ambiguous or between 75 and 89: Add to review queue
    review_entry = MatchingReviewQueue(
        raw_input_name=raw_name,
        normalized_input_name=norm_input,
        candidate_institution_id=top_inst.institution_id,
        confidence_score=float(top_score),
        matching_method="FUZZY_RAPIDFUZZ",
        decision_status="PENDING",
        created_at=datetime.now(timezone.utc)
    )
    db.add(review_entry)
    db.commit()
    db.refresh(review_entry)

    reason = "Ambiguous top candidates" if is_ambiguous else "Candidate score requires manual confirmation"
    return {
        "matched": False,
        "institution_id": top_inst.institution_id,
        "queue_id": review_entry.match_id,
        "confidence_score": float(top_score),
        "matching_method": "FUZZY_RAPIDFUZZ",
        "requires_review": True,
        "details": f"{reason} (Top: {top_score:.1f}%, Second: {second_score:.1f}%)"
    }

def review_matching_candidate(
    db: Session,
    match_id: int,
    decision: str,  # APPROVED or REJECTED
    reviewer_id: str,
    create_alias: bool = True
) -> Dict[str, Any]:
    item = db.query(MatchingReviewQueue).filter(MatchingReviewQueue.match_id == match_id).first()
    if not item:
        raise ValueError("Matching queue item not found")
    
    item.decision_status = decision.upper()
    item.reviewer_id = reviewer_id
    item.reviewed_at = datetime.now(timezone.utc)

    if decision.upper() == "APPROVED" and create_alias:
        # Check if alias already exists
        norm_alias = item.normalized_input_name
        existing = db.query(InstitutionAlias).filter(
            InstitutionAlias.institution_id == item.candidate_institution_id,
            InstitutionAlias.normalized_alias == norm_alias
        ).first()
        if not existing:
            alias = InstitutionAlias(
                institution_id=item.candidate_institution_id,
                alias_name=item.raw_input_name,
                normalized_alias=norm_alias,
                source="Manual Review Approval",
                verification_status="VERIFIED"
            )
            db.add(alias)

    db.commit()
    return {"success": True, "match_id": match_id, "status": item.decision_status}

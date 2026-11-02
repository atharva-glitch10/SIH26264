"""
Pure overlap-rule evaluation (Rules A, B, C from SPEC.md).

Kept free of database imports so it can be unit-tested and evaluated directly.
"""
from typing import Any, Dict, List, Optional, Tuple

from backend.app.services.text_utils import content_similarity

SEVERITY_ORDER = ["LOW", "MEDIUM", "HIGH", "CRITICAL"]
OPEN_ALERT_STATUSES = ["NEW", "UNDER_REVIEW", "COORDINATION_REQUIRED", "LINKED_ACKNOWLEDGED"]
DEFAULT_ACTIVE_STATUSES = ["RECEIVED", "PENDING", "UNDER_PROCESS", "ESCALATED", "TRANSFERRED"]


def _max_severity(a: str, b: str) -> str:
    return a if SEVERITY_ORDER.index(a) >= SEVERITY_ORDER.index(b) else b


def categories_related(cat_a: str, cat_b: str, clusters: List[List[str]]) -> bool:
    """Rule B: two categories are related if identical or in the same configured cluster."""
    if cat_a == cat_b:
        return True
    return any(cat_a in cluster and cat_b in cluster for cluster in clusters)


def evaluate_institution_overlap(
    cases: List[Any],
    rules: Dict[str, Any],
    institution_names: List[str],
) -> Optional[Dict[str, Any]]:
    """
    Pure evaluation of the overlap rules for one institution's active cases.
    Works on any objects exposing case_id, current_bureau_id, category, description, priority.
    Returns None when Rule A (the gate) is not met.
    """
    rule_a = rules.get("rule_a_multi_bureau", {})
    rule_b = rules.get("rule_b_category_overlap", {})
    rule_c = rules.get("rule_c_description_similarity", {})

    if not rule_a.get("enabled", True):
        return None

    bureaus = sorted({c.current_bureau_id for c in cases})
    if len(bureaus) < rule_a.get("min_bureaus", 2) or len(cases) < rule_a.get("min_cases", 2):
        return None

    severity = rule_a.get("base_severity", "MEDIUM")
    if any(c.priority in ("HIGH", "URGENT") for c in cases):
        severity = _max_severity(severity, "HIGH")
    triggered = ["A"]
    category_pairs: List[Tuple[str, str]] = []
    similar_pairs: List[Tuple[str, str, float]] = []

    clusters = rule_b.get("category_clusters", [])
    threshold = float(rule_c.get("similarity_threshold", 70))

    # Only CROSS-bureau pairs matter: two cases in the same bureau are already visible to each other.
    for i in range(len(cases)):
        for j in range(i + 1, len(cases)):
            a, b = cases[i], cases[j]
            if a.current_bureau_id == b.current_bureau_id:
                continue
            if rule_b.get("enabled", True) and categories_related(a.category, b.category, clusters):
                category_pairs.append((a.case_id, b.case_id))
            if rule_c.get("enabled", True):
                sim = content_similarity(a.description or "", b.description or "", institution_names)
                if sim >= threshold:
                    similar_pairs.append((a.case_id, b.case_id, sim))

    if category_pairs:
        triggered.append("B")
        severity = _max_severity(severity, rule_b.get("severity_boost", "HIGH"))
    if similar_pairs:
        triggered.append("C")
        severity = _max_severity(severity, rule_c.get("severity_boost", "CRITICAL"))

    explanation = (
        f"Rule A: {len(cases)} active cases are being handled by {len(bureaus)} different "
        f"Bureaus/Cells ({', '.join(bureaus)}) without a common view."
    )
    if category_pairs:
        shown = ", ".join(f"{x}↔{y}" for x, y in category_pairs[:4])
        explanation += f" Rule B: {len(category_pairs)} cross-bureau case pair(s) share the same or related complaint category ({shown})."
    if similar_pairs:
        top = max(similar_pairs, key=lambda p: p[2])
        explanation += (
            f" Rule C: {len(similar_pairs)} cross-bureau pair(s) describe a similar issue "
            f"(highest {top[2]:.0f}% between {top[0]} and {top[1]}, after removing the institution name)."
        )

    return {
        "bureaus": bureaus,
        "bureau_set_key": "|".join(bureaus),
        "severity": severity,
        "rules_triggered": ",".join(triggered),
        "category_pairs": category_pairs,
        "similar_pairs": similar_pairs,
        "explanation": explanation,
    }

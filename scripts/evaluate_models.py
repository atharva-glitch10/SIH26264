"""
Measures the smart-automation components on labelled data and writes
data/evaluation_report.json (shown on the Reports page).

    python -m scripts.evaluate_models

1. Complaint classifier   - held-out set data/eval/complaints_labelled.csv (70 complaints,
                            written independently of the training phrases).
2. Duplicate detection    - data/eval/duplicate_pairs.csv (35 labelled pairs).
3. Institution matching   - noisy name variants (abbreviations, typos, extra city names)
                            generated from the institution master + unknown colleges.

Honesty notes are written into the report: the duplicate threshold was tuned on the
same small pair set, and all institution data is synthetic.
"""
import csv
import json
import random
import re
import sys
from collections import Counter, defaultdict
from datetime import datetime, timedelta, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from backend.app.services.nlp_service import build_classifier, score_duplicate  # noqa: E402
from backend.app.services.text_utils import FUZZY_BACKEND, normalize_text, rank_name_candidates  # noqa: E402

EVAL_DIR = ROOT / "data" / "eval"
REPORT_PATH = ROOT / "data" / "evaluation_report.json"
CONFIG_PATH = ROOT / "config" / "overlap_rules.json"


def _config():
    with open(CONFIG_PATH, encoding="utf-8") as f:
        return json.load(f)


def _prf(tp, fp, fn):
    p = tp / (tp + fp) if tp + fp else 0.0
    r = tp / (tp + fn) if tp + fn else 0.0
    f = 2 * p * r / (p + r) if p + r else 0.0
    return round(p, 3), round(r, 3), round(f, 3)


# --------------------------------------------------------------------------- 1. classifier
def evaluate_classifier():
    rows = list(csv.DictReader(open(EVAL_DIR / "complaints_labelled.csv", encoding="utf-8")))
    clf = build_classifier()  # seed knowledge only: nothing from the test set
    labels = sorted({r["category"] for r in rows})
    confusion = defaultdict(Counter)
    correct = 0
    top2 = 0
    for r in rows:
        pred = clf.predict(r["text"])
        confusion[r["category"]][pred["category"]] += 1
        correct += pred["category"] == r["category"]
        top2 += r["category"] in [pred["category"]] + [a["category"] for a in pred["alternatives"][:1]]
    per_class = {}
    f1s = []
    for lab in labels:
        tp = confusion[lab][lab]
        fp = sum(confusion[o][lab] for o in labels if o != lab)
        fn = sum(v for k, v in confusion[lab].items() if k != lab)
        p, r_, f = _prf(tp, fp, fn)
        per_class[lab] = {"precision": p, "recall": r_, "f1": f, "support": sum(confusion[lab].values())}
        f1s.append(f)
    return {
        "test_size": len(rows),
        "accuracy": round(correct / len(rows), 3),
        "top2_accuracy": round(top2 / len(rows), 3),
        "macro_f1": round(sum(f1s) / len(f1s), 3),
        "per_category": per_class,
        "method": "Multinomial Naive Bayes (unigrams + bigrams), trained on seed phrases only",
    }


# --------------------------------------------------------------------------- 2. duplicates
def evaluate_duplicates():
    cfg = _config().get("duplicate_detection", {})
    threshold = float(cfg.get("threshold", 60))
    rows = list(csv.DictReader(open(EVAL_DIR / "duplicate_pairs.csv", encoding="utf-8")))
    now = datetime.now(timezone.utc)
    tp = fp = fn = tn = 0
    for r in rows:
        a = {"description": r["text_a"], "category": "C1", "complainant_name": "Person A", "received_at": now}
        b = {"description": r["text_b"], "category": "C1" if r["same_category"] == "1" else "C2",
             "complainant_name": "Person A" if r["same_complainant"] == "1" else "Person B",
             "received_at": now - timedelta(days=int(r["days_apart"]))}
        res = score_duplicate(a, b, [], cfg.get("weights"), int(cfg.get("date_window_days", 30)))
        pred, gold = res["score"] >= threshold, r["is_duplicate"] == "1"
        tp += pred and gold
        fp += pred and not gold
        fn += gold and not pred
        tn += not pred and not gold
    p, r_, f = _prf(tp, fp, fn)
    return {"pairs": len(rows), "threshold": threshold, "precision": p, "recall": r_, "f1": f,
            "true_positives": tp, "false_positives": fp, "false_negatives": fn, "true_negatives": tn,
            "note": "Threshold chosen on this same pair set; collect real labelled pairs to confirm."}


# --------------------------------------------------------------------------- 3. matching
ABBREV = [("Institute", "Instt."), ("Institute", "Inst"), ("Technology", "Tech"), ("Management", "Mgmt"),
          ("Engineering", "Engg"), ("University", "Univ"), (" and ", " & "), ("College", "Clg")]
UNKNOWN_NAMES = ["Shree Ganesh Institute of Technology", "Lotus Valley College of Engineering",
                 "Sunrise Polytechnic Institute", "Krishna Institute of Management Studies",
                 "Blue Ridge Technical University", "Orchid College of Engineering and Technology",
                 "Silver Oak Institute of Technology", "Green Valley Engineering College"]


def _typo(word: str, rng: random.Random) -> str:
    if len(word) < 5:
        return word
    i = rng.randrange(1, len(word) - 2)
    return word[:i] + word[i + 1] + word[i] + word[i + 2:] if rng.random() < 0.5 else word[:i] + word[i + 1:]


def make_variants(name: str, district: str, rng: random.Random, k: int = 3):
    out = []
    for _ in range(k):
        v = name
        for full, short in rng.sample(ABBREV, 3):
            if full in v and rng.random() < 0.8:
                v = v.replace(full, short, 1)
        words = v.split()
        if rng.random() < 0.5:
            j = rng.randrange(len(words))
            words[j] = _typo(words[j], rng)
        v = " ".join(words)
        if rng.random() < 0.4:
            v += f", {district}"
        if rng.random() < 0.3:
            v = v.upper()
        out.append(v)
    return out


def _decide(ranked, thresholds):
    if not ranked:
        return None, "NO_MATCH"
    top, top_id = ranked[0]
    second = ranked[1][0] if len(ranked) > 1 else 0.0
    if top >= thresholds["auto_match_min_score"] and top - second >= thresholds["ambiguity_safety_margin"]:
        return top_id, "AUTO"
    return top_id, "REVIEW"


def evaluate_matching(seed: int = 7):
    thresholds = _config()["matching_thresholds"]
    rng = random.Random(seed)
    institutions, aliases = [], []
    try:  # prefer the live database (includes verified aliases)
        from backend.app.core.database import SessionLocal
        from backend.app.models.models import Institution, InstitutionAlias
        db = SessionLocal()
        try:
            institutions = [(i.institution_id, i.canonical_name, i.district or "") for i in db.query(Institution).all()]
            aliases = [(a.institution_id, a.alias_name) for a in
                       db.query(InstitutionAlias).filter(InstitutionAlias.verification_status == "VERIFIED").all()]
        finally:
            db.close()
    except Exception:
        institutions = []
    if not institutions:
        rows = list(csv.DictReader(open(ROOT / "data" / "synthetic_institutions.csv", encoding="utf-8")))
        institutions = [(r["institution_id"], r["canonical_name"], r.get("district", "")) for r in rows]

    candidates = [(i, normalize_text(n)) for i, n, _ in institutions] + [(i, normalize_text(a)) for i, a in aliases]
    auto_correct = auto_wrong = review = review_correct_top = missed = 0
    total_known = 0
    for inst_id, name, district in institutions:
        for v in make_variants(name, district, rng):
            total_known += 1
            norm = normalize_text(v)
            exact = [i for i, c in candidates if c == norm]
            if exact:
                decision_id, decision = exact[0], "AUTO"
            else:
                decision_id, decision = _decide(rank_name_candidates(norm, candidates, thresholds["manual_review_min_score"]), thresholds)
            if decision == "AUTO":
                auto_correct += decision_id == inst_id
                auto_wrong += decision_id != inst_id
            elif decision == "REVIEW":
                review += 1
                review_correct_top += decision_id == inst_id
            else:
                missed += 1

    unknown_auto_linked = 0
    for name in UNKNOWN_NAMES:
        _, decision = _decide(rank_name_candidates(normalize_text(name), candidates, thresholds["manual_review_min_score"]), thresholds)
        unknown_auto_linked += decision == "AUTO"

    auto_total = auto_correct + auto_wrong
    return {
        "variants_tested": total_known,
        "auto_linked_pct": round(auto_total / total_known, 3),
        "auto_link_precision": round(auto_correct / auto_total, 3) if auto_total else None,
        "wrong_auto_links": auto_wrong,
        "sent_to_review_pct": round(review / total_known, 3),
        "review_top_candidate_correct_pct": round(review_correct_top / review, 3) if review else None,
        "not_found_pct": round(missed / total_known, 3),
        "end_to_end_correct_pct": round((auto_correct + review_correct_top) / total_known, 3),
        "unknown_colleges_tested": len(UNKNOWN_NAMES),
        "unknown_colleges_wrongly_auto_linked": unknown_auto_linked,
        "method": "Exact ID/name/alias, then fuzzy match weighted on distinctive name words, with 10-point ambiguity guard",
    }


def main():
    report = {
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "fuzzy_backend": FUZZY_BACKEND,
        "classifier": evaluate_classifier(),
        "duplicate_detection": evaluate_duplicates(),
        "institution_matching": evaluate_matching(),
        "disclaimer": "Measured on synthetic institutions and team-written labelled complaints; "
                      "re-measure on real AICTE data before deployment.",
    }
    REPORT_PATH.write_text(json.dumps(report, indent=2), encoding="utf-8")
    c, d, m = report["classifier"], report["duplicate_detection"], report["institution_matching"]
    print(f"Classifier      : accuracy {c['accuracy']:.1%}, macro-F1 {c['macro_f1']:.2f} on {c['test_size']} held-out complaints")
    print(f"Duplicates      : precision {d['precision']:.0%}, recall {d['recall']:.0%} on {d['pairs']} pairs (threshold {d['threshold']})")
    print(f"Inst. matching  : {m['auto_linked_pct']:.0%} auto-linked with {m['auto_link_precision']:.1%} precision, "
          f"{m['sent_to_review_pct']:.0%} to review, {m['wrong_auto_links']} wrong auto-links, "
          f"{m['unknown_colleges_wrongly_auto_linked']}/{m['unknown_colleges_tested']} unknown colleges wrongly linked")
    print(f"Report written to {REPORT_PATH}")
    return report


if __name__ == "__main__":
    main()

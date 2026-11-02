"""
Smart-automation NLP for complaint intake (pure Python, no extra dependencies):

1. ComplaintClassifier - multinomial Naive Bayes over unigrams + bigrams.
   Trained on seed phrases (nlp_seed.py) plus officer-confirmed cases from the
   database, so it keeps learning from corrections.
2. score_duplicate - scores whether a new complaint repeats an existing one
   (same issue filed again, often with a different bureau).
3. suggest_priority - keyword-based priority hint.

Everything returns explanations so officers can see *why* a suggestion was made.
"""
import math
from collections import Counter, defaultdict
from datetime import datetime, timezone
from typing import Dict, Iterable, List, Optional, Sequence, Tuple

from backend.app.services.nlp_seed import (
    CATEGORIES, CASE_DESCRIPTIONS_TEMPLATES, CATEGORY_KEYWORDS, URGENT_KEYWORDS, HIGH_KEYWORDS,
)
from backend.app.services.text_utils import normalize_text, semantic_similarity, tokenize


def _features(text: str) -> List[str]:
    toks = tokenize(text)
    return toks + [f"{a}_{b}" for a, b in zip(toks, toks[1:])]


class ComplaintClassifier:
    def __init__(self, alpha: float = 0.5):
        self.alpha = alpha
        self.class_doc_counts: Counter = Counter()
        self.class_token_counts: Dict[str, Counter] = defaultdict(Counter)
        self.class_totals: Counter = Counter()
        self.vocab: set = set()
        self.n_docs = 0

    def fit(self, texts: Sequence[str], labels: Sequence[str]) -> "ComplaintClassifier":
        for text, label in zip(texts, labels):
            self.partial_fit(text, label)
        return self

    def partial_fit(self, text: str, label: str) -> None:
        feats = _features(text)
        if not feats:
            return
        self.n_docs += 1
        self.class_doc_counts[label] += 1
        self.class_token_counts[label].update(feats)
        self.class_totals[label] += len(feats)
        self.vocab.update(feats)

    def _log_scores(self, feats: List[str]) -> Dict[str, float]:
        v = len(self.vocab) or 1
        scores = {}
        for label, docs in self.class_doc_counts.items():
            score = math.log(docs / self.n_docs)
            denom = self.class_totals[label] + self.alpha * v
            counts = self.class_token_counts[label]
            for f in feats:
                if f in self.vocab:
                    score += math.log((counts[f] + self.alpha) / denom)
            scores[label] = score
        return scores

    def predict(self, text: str, top_k: int = 3) -> Dict:
        feats = [f for f in _features(text) if f in self.vocab]
        if not feats or not self.n_docs:
            return {"category": None, "confidence": 0.0, "alternatives": [], "evidence": []}
        scores = self._log_scores(feats)
        # Temperature-softened posterior: raw NB posteriors are over-confident.
        temperature = max(1.0, math.sqrt(len(feats)))
        top = max(scores.values())
        exp = {k: math.exp((s - top) / temperature) for k, s in scores.items()}
        total = sum(exp.values())
        probs = sorted(((v / total, k) for k, v in exp.items()), reverse=True)
        best_label = probs[0][1]
        evidence = self._evidence(feats, best_label)
        return {
            "category": best_label,
            "confidence": round(probs[0][0], 3),
            "alternatives": [{"category": k, "confidence": round(p, 3)} for p, k in probs[1:top_k]],
            "evidence": evidence,
        }

    def _evidence(self, feats: List[str], label: str, k: int = 5) -> List[str]:
        """Words that pushed the decision towards `label` most (for explainability)."""
        v = len(self.vocab) or 1
        gains = []
        for f in set(feats):
            p_label = (self.class_token_counts[label][f] + self.alpha) / (self.class_totals[label] + self.alpha * v)
            others = [
                (self.class_token_counts[c][f] + self.alpha) / (self.class_totals[c] + self.alpha * v)
                for c in self.class_doc_counts if c != label
            ]
            if others:
                gains.append((math.log(p_label / (sum(others) / len(others))), f))
        return [f.replace("_", " ") for g, f in sorted(gains, reverse=True)[:k] if g > 0]


def seed_training_data() -> Tuple[List[str], List[str]]:
    texts, labels = [], []
    for cat, examples in CASE_DESCRIPTIONS_TEMPLATES.items():
        for ex in examples:
            texts.append(ex)
            labels.append(cat)
    for cat, phrases in CATEGORY_KEYWORDS.items():
        for ph in phrases:
            texts.append(ph)
            labels.append(cat)
    return texts, labels


def build_classifier(extra_samples: Iterable[Tuple[str, str]] = ()) -> ComplaintClassifier:
    texts, labels = seed_training_data()
    clf = ComplaintClassifier().fit(texts, labels)
    for text, label in extra_samples:
        if label in CATEGORIES and text:
            clf.partial_fit(text, label)
    return clf


def suggest_priority(text: str) -> Dict:
    norm = normalize_text(text)
    words = set(norm.split())
    urgent_hits = sorted(w for w in URGENT_KEYWORDS if (w in words if " " not in w else w in norm))
    if urgent_hits:
        return {"priority": "URGENT", "reason": f"Safety/serious-harm terms: {', '.join(urgent_hits)}"}
    high_hits = sorted(w for w in HIGH_KEYWORDS if (w in words if " " not in w else w in norm))
    if high_hits:
        return {"priority": "HIGH", "reason": f"High-impact terms: {', '.join(high_hits)}"}
    return {"priority": "MEDIUM", "reason": "No escalation keywords found"}


def _same_complainant(a_name: Optional[str], a_contact: Optional[str],
                      b_name: Optional[str], b_contact: Optional[str]) -> bool:
    ac, bc = normalize_text(a_contact).replace(" ", ""), normalize_text(b_contact).replace(" ", "")
    if ac and bc and ac == bc:
        return True
    an, bn = normalize_text(a_name), normalize_text(b_name)
    return bool(an and bn and an == bn)


def _aware(dt: Optional[datetime]) -> Optional[datetime]:
    if dt is None:
        return None
    return dt if dt.tzinfo else dt.replace(tzinfo=timezone.utc)


def score_duplicate(
    new: Dict,
    existing: Dict,
    institution_names: Sequence[str],
    weights: Optional[Dict[str, float]] = None,
    date_window_days: int = 30,
) -> Dict:
    """
    Score (0-100) how likely `new` repeats `existing`. Both dicts carry:
    description, category, complainant_name, complainant_contact, received_at.
    """
    w = weights or {"text_similarity": 0.7, "same_complainant": 0.2, "same_category": 0.07, "date_proximity": 0.03}
    text_sim = semantic_similarity(new.get("description") or "", existing.get("description") or "", institution_names)
    same_person = _same_complainant(new.get("complainant_name"), new.get("complainant_contact"),
                                    existing.get("complainant_name"), existing.get("complainant_contact"))
    same_cat = bool(new.get("category") and new.get("category") == existing.get("category"))
    d1, d2 = _aware(new.get("received_at")), _aware(existing.get("received_at"))
    if d1 and d2:
        gap = abs((d1 - d2).days)
        proximity = max(0.0, 1 - gap / float(date_window_days))
    else:
        gap, proximity = None, 0.0

    score = (
        w["text_similarity"] * text_sim
        + w["same_complainant"] * (100 if same_person else 0)
        + w["same_category"] * (100 if same_cat else 0)
        + w["date_proximity"] * 100 * proximity
    )
    # Strong textual similarity is sufficient evidence on its own
    # (the same issue is often reported by different students to different bureaus).
    if text_sim >= 75:
        score = max(score, text_sim)

    reasons = [f"description similarity {text_sim:.0f}%"]
    if same_person:
        reasons.append("same complainant")
    if same_cat:
        reasons.append("same category")
    if gap is not None:
        reasons.append(f"filed {gap} day(s) apart")
    return {"score": round(min(score, 100.0), 1), "text_similarity": text_sim,
            "same_complainant": same_person, "reasons": reasons}

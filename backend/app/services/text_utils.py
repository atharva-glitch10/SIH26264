"""
Pure-Python text helpers shared by matching, overlap, duplicate detection and
classification. No database imports here, so this module can be unit-tested
and evaluated on its own.

RapidFuzz is used when installed (it is in requirements.txt). A difflib-based
fallback keeps the module importable in minimal environments.
"""
import re
from typing import Iterable, List, Optional, Tuple

try:  # pragma: no cover - exercised implicitly
    from rapidfuzz import fuzz as _fuzz

    def token_set_ratio(a: str, b: str) -> float:
        return float(_fuzz.token_set_ratio(a, b))

    def token_sort_ratio(a: str, b: str) -> float:
        return float(_fuzz.token_sort_ratio(a, b))

    FUZZY_BACKEND = "rapidfuzz"
except ImportError:  # pragma: no cover - fallback
    from difflib import SequenceMatcher

    def _ratio(a: str, b: str) -> float:
        return SequenceMatcher(None, a, b).ratio() * 100.0

    def token_sort_ratio(a: str, b: str) -> float:
        return _ratio(" ".join(sorted(a.split())), " ".join(sorted(b.split())))

    def token_set_ratio(a: str, b: str) -> float:
        ta, tb = set(a.split()), set(b.split())
        inter = " ".join(sorted(ta & tb))
        diff_a = " ".join(sorted(ta - tb))
        diff_b = " ".join(sorted(tb - ta))
        s1 = (inter + " " + diff_a).strip()
        s2 = (inter + " " + diff_b).strip()
        if not inter:
            return _ratio(s1, s2)
        return max(_ratio(inter, s1), _ratio(inter, s2), _ratio(s1, s2))

    FUZZY_BACKEND = "difflib"


STOPWORDS = {
    "a", "an", "the", "and", "or", "of", "in", "on", "for", "to", "by", "with", "at",
    "from", "is", "are", "was", "were", "be", "been", "has", "have", "had", "this",
    "that", "these", "those", "it", "its", "as", "into", "not", "no", "without",
    "our", "we", "they", "their", "them", "he", "she", "his", "her", "i", "my", "me",
    "college", "institute", "institution", "university", "campus", "students", "student",
    "aicte", "please", "kindly", "sir", "madam", "respected", "regarding", "complaint",
}

# Common abbreviations seen in Indian institution names and complaint text.
ABBREVIATIONS = {
    "engg": "engineering",
    "eng": "engineering",
    "instt": "institute",
    "inst": "institute",
    "institue": "institute",
    "tech": "technology",
    "technlogy": "technology",
    "technolgy": "technology",
    "mgmt": "management",
    "univ": "university",
    "clg": "college",
    "coll": "college",
    "poly": "polytechnic",
}


def normalize_text(text: Optional[str]) -> str:
    """Lowercase, replace punctuation with spaces and collapse whitespace."""
    if not text:
        return ""
    text = text.lower()
    text = re.sub(r"[^\w\s]", " ", text)
    text = re.sub(r"\s+", " ", text)
    return text.strip()


def expand_abbreviations(normalized: str) -> str:
    return " ".join(ABBREVIATIONS.get(tok, tok) for tok in normalized.split())


def normalize_institution_name(text: Optional[str]) -> str:
    """Normalisation used for institution matching (expands common abbreviations)."""
    return expand_abbreviations(normalize_text(text))


def tokenize(text: Optional[str]) -> List[str]:
    """Lowercased content tokens without stopwords or pure numbers."""
    return [
        t for t in normalize_text(text).split()
        if t not in STOPWORDS and len(t) > 1 and not t.isdigit()
    ]


def strip_names(description: str, names: Iterable[str]) -> str:
    """
    Remove institution names/aliases from a complaint description so that two
    complaints about the same college are not 'similar' just because both
    mention the college's name.
    """
    norm = normalize_text(description)
    for name in sorted({normalize_text(n) for n in names if n}, key=len, reverse=True):
        if name:
            norm = re.sub(rf"\b{re.escape(name)}\b", " ", norm)
    return re.sub(r"\s+", " ", norm).strip()


def content_similarity(a: str, b: str, names: Iterable[str] = ()) -> float:
    """
    Similarity (0-100) of two complaint descriptions after removing institution
    names and stopwords. Uses token_set_ratio on content words.
    """
    names = list(names)
    ta = " ".join(t for t in strip_names(a, names).split() if t not in STOPWORDS)
    tb = " ".join(t for t in strip_names(b, names).split() if t not in STOPWORDS)
    if not ta or not tb:
        return 0.0
    # token_set_ratio is generous when one text is a subset of the other;
    # blend with token_sort_ratio so short generic texts do not score 100.
    return round(0.6 * token_set_ratio(ta, tb) + 0.4 * token_sort_ratio(ta, tb), 1)


# Canonical forms so paraphrased complaints share vocabulary.
SYNONYMS = {
    "teachers": "faculty", "teacher": "faculty", "professor": "faculty", "professors": "faculty",
    "lecturer": "faculty", "lecturers": "faculty", "staff": "faculty", "staffs": "faculty",
    "salaries": "salary", "pay": "salary", "paid": "salary", "wages": "salary",
    "dismissed": "terminated", "termination": "terminated", "removed": "terminated",
    "tc": "transfer_certificate", "certificates": "certificate", "marksheet": "certificate",
    "donation": "capitation", "results": "result", "exams": "exam", "examination": "exam",
    "examinations": "exam", "semester": "sem", "fees": "fee", "charges": "fee", "charged": "fee",
    "refunded": "refund", "admissions": "admission", "admitted": "admission", "seats": "seat",
    "ragged": "ragging", "rag": "ragging", "harassed": "harassment", "contaminated": "unsafe",
    "dirty": "unsafe", "polluted": "unsafe", "hostels": "hostel", "books": "textbook",
    "textbooks": "textbook", "extinguishers": "fire", "extinguisher": "fire",
    "cse": "computer", "programme": "course", "program": "course", "mba": "course",
    "withholding": "withheld", "withhold": "withheld", "demanding": "demand", "demanded": "demand",
    "sanctioned": "approved", "approval": "approved", "excess": "beyond", "more": "beyond",
    "pending": "delayed", "delay": "delayed", "declared": "result", "two": "2", "three": "3",
    "four": "4", "five": "5", "lakh": "lakh", "lakhs": "lakh", "rupees": "rs", "inr": "rs",
}


def stem(token: str) -> str:
    for suffix in ("ing", "ied", "ies", "ed", "es", "s"):
        if token.endswith(suffix) and len(token) - len(suffix) >= 3:
            return token[: -len(suffix)] + ("y" if suffix in ("ied", "ies") else "")
    return token


def canonical_tokens(text: str, names: Iterable[str] = ()) -> set:
    """Content tokens after removing names, mapping synonyms and light stemming."""
    out = set()
    for tok in strip_names(text, names).split():
        tok = SYNONYMS.get(tok, tok)
        if tok in STOPWORDS or len(tok) < 2:
            continue
        out.add(SYNONYMS.get(stem(tok), stem(tok)))
    return out


def semantic_similarity(a: str, b: str, names: Iterable[str] = ()) -> float:
    """
    Paraphrase-tolerant similarity (0-100): the higher of the fuzzy string
    similarity and the overlap coefficient of canonical tokens.
    """
    names = list(names)
    ta, tb = canonical_tokens(a, names), canonical_tokens(b, names)
    if not ta or not tb:
        return 0.0
    overlap = len(ta & tb) / min(len(ta), len(tb))
    dice = 2 * len(ta & tb) / (len(ta) + len(tb))
    token_score = 100 * (0.5 * overlap + 0.5 * dice)
    return round(max(content_similarity(a, b, names), token_score), 1)


GENERIC_NAME_WORDS = {
    "institute", "institution", "technology", "technological", "management", "college", "engineering",
    "polytechnic", "university", "campus", "technical", "school", "studies", "science", "sciences",
    "and", "of", "the", "for", "in", "at", "group", "institutions", "academy", "centre", "center",
}


def distinctive_part(normalized_expanded: str) -> str:
    return " ".join(t for t in normalized_expanded.split() if t not in GENERIC_NAME_WORDS)


def name_similarity(query_expanded: str, cand_expanded: str) -> float:
    """
    70% weight on the distinctive words (e.g. 'aryabhata', 'cv raman kanpur') and 30%
    on the full name, so shared boilerplate like 'Institute of Technology and
    Management' cannot make two different colleges look alike.
    """
    full = max(token_sort_ratio(query_expanded, cand_expanded), 0.9 * token_set_ratio(query_expanded, cand_expanded))
    dq, dc = distinctive_part(query_expanded), distinctive_part(cand_expanded)
    if not dq or not dc:
        return full
    distinct = max(token_sort_ratio(dq, dc), 0.9 * token_set_ratio(dq, dc))
    return round(0.7 * distinct + 0.3 * full, 1)


def rank_name_candidates(
    normalized_input: str,
    candidates: Iterable[Tuple[str, str]],
    min_score: float,
) -> List[Tuple[float, str]]:
    """
    Score (institution_id, normalized_name) candidates against an input name.
    Returns [(score, institution_id)] sorted descending, keeping one entry per id.
    """
    query = expand_abbreviations(normalized_input)
    best: dict = {}
    for inst_id, cand in candidates:
        score = name_similarity(query, expand_abbreviations(cand))
        if score >= min_score and score > best.get(inst_id, -1):
            best[inst_id] = score
    return sorted(((s, i) for i, s in best.items()), reverse=True)

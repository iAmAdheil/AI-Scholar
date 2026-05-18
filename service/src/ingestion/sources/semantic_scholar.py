"""Semantic Scholar source: bulk paper search for non-arXiv coverage, plus
citation enrichment for records discovered via arXiv (so dedupe and ranking
have a citation signal).

Uses the public Graph API; honors SEMANTIC_SCHOLAR_API_KEY if set (higher
rate limits) and falls back to anonymous requests otherwise.
"""
import threading
import time
from typing import Iterator, List, Optional, Dict, Any

import requests

from ...config import SEMANTIC_SCHOLAR_API_KEY
from ..types import PaperRecord

S2_BASE = "https://api.semanticscholar.org/graph/v1/paper"

DEFAULT_FIELDS = (
    "paperId,externalIds,title,abstract,authors,year,venue,citationCount,"
    "openAccessPdf,fieldsOfStudy"
)

_rate_lock = threading.Lock()
_last_request_ts = 0.0


def _headers() -> Dict[str, str]:
    h = {"User-Agent": "AI-Scholar/1.0"}
    if SEMANTIC_SCHOLAR_API_KEY:
        h["x-api-key"] = SEMANTIC_SCHOLAR_API_KEY
    return h


def _polite_request(method: str, url: str, *, min_interval: float, **kwargs):
    """Token-bucket rate-limited request. min_interval is shorter when an API key is set."""
    global _last_request_ts
    with _rate_lock:
        elapsed = time.monotonic() - _last_request_ts
        if elapsed < min_interval:
            time.sleep(min_interval - elapsed)
        _last_request_ts = time.monotonic()
    kwargs.setdefault("headers", _headers())
    kwargs.setdefault("timeout", 30)
    return requests.request(method, url, **kwargs)


def _interval() -> float:
    # 1 req / 1s with key, 1 req / 3s without (conservative).
    return 1.0 if SEMANTIC_SCHOLAR_API_KEY else 3.0


def _s2_to_paper(p: Dict[str, Any]) -> Optional[PaperRecord]:
    if not p or not p.get("title"):
        return None
    ext = p.get("externalIds") or {}
    authors = [a.get("name", "") for a in (p.get("authors") or []) if a.get("name")]
    pdf = (p.get("openAccessPdf") or {}).get("url")
    categories = list(p.get("fieldsOfStudy") or [])

    return PaperRecord(
        title=p.get("title", "").strip(),
        authors=authors,
        abstract=p.get("abstract"),
        year=p.get("year"),
        categories=categories,
        venue=p.get("venue"),
        doi=(ext.get("DOI") or None),
        arxiv_id=(ext.get("ArXiv") or None),
        s2_paper_id=p.get("paperId"),
        url=pdf or f"https://www.semanticscholar.org/paper/{p.get('paperId', '')}",
        pdf_url=pdf,
        citation_count=p.get("citationCount"),
        source="s2",
    )


def search_bulk(
    query: str,
    *,
    fields: str = DEFAULT_FIELDS,
    max_records: Optional[int] = None,
    min_citations: int = 0,
) -> Iterator[PaperRecord]:
    """Iterate papers matching `query` via the bulk search endpoint.

    The bulk endpoint returns up to 1000 papers per page with a continuation token.
    Records below `min_citations` are filtered client-side (useful to skip noise).
    """
    url = f"{S2_BASE}/search/bulk"
    params: Dict[str, Any] = {"query": query, "fields": fields}
    token: Optional[str] = None
    fetched = 0
    while True:
        if token:
            params["token"] = token
        resp = _polite_request("GET", url, min_interval=_interval(), params=params)
        if resp.status_code == 429:
            time.sleep(5)
            continue
        resp.raise_for_status()
        body = resp.json()
        for raw in body.get("data") or []:
            if (raw.get("citationCount") or 0) < min_citations:
                continue
            rec = _s2_to_paper(raw)
            if rec is None:
                continue
            fetched += 1
            yield rec
            if max_records is not None and fetched >= max_records:
                return

        token = body.get("token")
        if not token:
            return


def get_paper(paper_id: str, *, fields: str = DEFAULT_FIELDS) -> Optional[PaperRecord]:
    """Fetch a single paper. paper_id may be 'arXiv:1234', 'DOI:...', or an S2 id."""
    url = f"{S2_BASE}/{paper_id}"
    resp = _polite_request("GET", url, min_interval=_interval(), params={"fields": fields})
    if resp.status_code == 404:
        return None
    resp.raise_for_status()
    return _s2_to_paper(resp.json())


def batch_enrich(arxiv_ids: List[str]) -> Dict[str, Dict[str, Any]]:
    """Use S2 batch endpoint to enrich arXiv records with citation counts.

    Returns: {arxiv_id: {paperId, doi, citationCount}}.
    The batch endpoint accepts up to 500 IDs per request.
    """
    if not arxiv_ids:
        return {}
    url = f"{S2_BASE}/batch"
    fields = "paperId,externalIds,citationCount"
    out: Dict[str, Dict[str, Any]] = {}
    for i in range(0, len(arxiv_ids), 500):
        chunk = arxiv_ids[i : i + 500]
        body = {"ids": [f"ARXIV:{aid}" for aid in chunk]}
        resp = _polite_request(
            "POST", url, min_interval=_interval(), params={"fields": fields}, json=body
        )
        if resp.status_code == 429:
            time.sleep(5)
            continue
        resp.raise_for_status()
        rows = resp.json() or []
        for aid, row in zip(chunk, rows):
            if not row:
                continue
            ext = row.get("externalIds") or {}
            out[aid] = {
                "s2_paper_id": row.get("paperId"),
                "doi": ext.get("DOI"),
                "citation_count": row.get("citationCount"),
            }
    return out

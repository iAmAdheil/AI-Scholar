"""arXiv source: Kaggle metadata bootstrap + OAI-PMH delta harvest + PDF fetcher.

Kaggle snapshot is the bootstrap path (download the arXiv dataset JSONL once).
OAI-PMH is for ongoing delta sync after the bootstrap.

The PDF fetcher uses a 3s token-bucket per request to stay within arXiv's
politeness guidelines.
"""
import gzip
import json
import os
import re
import threading
import time
import xml.etree.ElementTree as ET
from collections import defaultdict
from typing import Iterator, List, Optional, Dict

import requests

from ..types import PaperRecord
from .. import sources as _sources  # noqa: F401  # package-import friendliness

ARXIV_PDF_BASE = "https://export.arxiv.org/pdf/{arxiv_id}.pdf"
OAI_PMH_URL = "https://export.arxiv.org/oai2"
OAI_PMH_NS = {
    "oai": "http://www.openarchives.org/OAI/2.0/",
    "arxiv": "http://arxiv.org/OAI/arXiv/",
}

DEFAULT_HEADERS = {
    "User-Agent": "Mozilla/5.0 (compatible; AI-Scholar/1.0; mailto:research@example.com)"
}

# Broad-STEM filter — categories begin with one of these prefixes.
DEFAULT_PREFIXES = ("cs.", "math.", "stat.", "physics.", "q-bio.", "eess.")


_rate_lock = threading.Lock()
_last_request_ts = 0.0


def _polite_get(url: str, *, min_interval: float = 3.0, **kwargs) -> requests.Response:
    """Token-bucket wrapper: ensures at least `min_interval` seconds between hits."""
    global _last_request_ts
    with _rate_lock:
        elapsed = time.monotonic() - _last_request_ts
        if elapsed < min_interval:
            time.sleep(min_interval - elapsed)
        _last_request_ts = time.monotonic()
    kwargs.setdefault("headers", DEFAULT_HEADERS)
    kwargs.setdefault("timeout", 30)
    return requests.get(url, **kwargs)


def _kaggle_record_to_paper(raw: dict) -> Optional[PaperRecord]:
    """Convert a single Kaggle arXiv JSONL line into a PaperRecord."""
    arxiv_id = raw.get("id")
    if not arxiv_id:
        return None
    title = (raw.get("title") or "").replace("\n", " ").strip()
    abstract = (raw.get("abstract") or "").replace("\n", " ").strip()
    categories = (raw.get("categories") or "").split()

    # Authors field varies: "authors" is "Last1, F1, Last2, F2..." style or
    # "authors_parsed" is [[last, first, suffix], ...]
    authors: List[str] = []
    if isinstance(raw.get("authors_parsed"), list):
        for entry in raw["authors_parsed"]:
            if isinstance(entry, list) and entry:
                last = entry[0] if len(entry) > 0 else ""
                first = entry[1] if len(entry) > 1 else ""
                full = (f"{first} {last}").strip()
                if full:
                    authors.append(full)
    elif isinstance(raw.get("authors"), str):
        authors = [a.strip() for a in re.split(r",| and ", raw["authors"]) if a.strip()]

    year: Optional[int] = None
    update_date = raw.get("update_date") or raw.get("date")
    if update_date and isinstance(update_date, str) and len(update_date) >= 4:
        try:
            year = int(update_date[:4])
        except ValueError:
            year = None

    doi = (raw.get("doi") or None) or None
    venue = raw.get("journal-ref") or None

    return PaperRecord(
        title=title,
        authors=authors,
        abstract=abstract,
        year=year,
        categories=categories,
        venue=venue,
        doi=doi,
        arxiv_id=arxiv_id,
        url=f"https://arxiv.org/abs/{arxiv_id}",
        pdf_url=None,
        source="arxiv",
    )


def _open_kaggle(path: str):
    """Open Kaggle arXiv dump (plain .json or .json.gz)."""
    if path.endswith(".gz"):
        return gzip.open(path, "rt", encoding="utf-8")
    return open(path, "r", encoding="utf-8")


def iter_kaggle_dump(
    path: str,
    *,
    prefixes: tuple = DEFAULT_PREFIXES,
    per_category_cap: int = 5000,
    overall_cap: Optional[int] = None,
) -> Iterator[PaperRecord]:
    """Stream papers from the Kaggle arXiv JSONL dump.

    Filters by category prefix; enforces per-category cap (first paper wins per category)
    and an overall cap. The Kaggle dump is large (~3GB), so this is a streaming iterator,
    never a list-in-memory.
    """
    seen_per_cat: Dict[str, int] = defaultdict(int)
    yielded = 0
    with _open_kaggle(path) as f:
        for line in f:
            line = line.strip()
            if not line:
                continue
            try:
                raw = json.loads(line)
            except json.JSONDecodeError:
                continue

            cats = (raw.get("categories") or "").split()
            primary = cats[0] if cats else ""
            if not primary.startswith(prefixes):
                continue

            # Per-category cap, applied to the primary category only.
            top_prefix = next((p for p in prefixes if primary.startswith(p)), primary)
            if seen_per_cat[top_prefix] >= per_category_cap:
                continue

            rec = _kaggle_record_to_paper(raw)
            if not rec:
                continue
            seen_per_cat[top_prefix] += 1
            yielded += 1
            yield rec

            if overall_cap is not None and yielded >= overall_cap:
                return


def _parse_oai_record(record_elem) -> Optional[PaperRecord]:
    md = record_elem.find("oai:metadata/arxiv:arXiv", OAI_PMH_NS)
    if md is None:
        return None

    def _text(tag: str) -> Optional[str]:
        el = md.find(f"arxiv:{tag}", OAI_PMH_NS)
        return el.text.strip() if (el is not None and el.text) else None

    arxiv_id = _text("id")
    if not arxiv_id:
        return None
    title = (_text("title") or "").replace("\n", " ").strip()
    abstract = (_text("abstract") or "").replace("\n", " ").strip()
    categories = (_text("categories") or "").split()
    doi = _text("doi")

    authors: List[str] = []
    for author in md.findall("arxiv:authors/arxiv:author", OAI_PMH_NS):
        keyname = author.findtext("arxiv:keyname", default="", namespaces=OAI_PMH_NS)
        forenames = author.findtext("arxiv:forenames", default="", namespaces=OAI_PMH_NS)
        full = f"{forenames} {keyname}".strip()
        if full:
            authors.append(full)

    year: Optional[int] = None
    created = _text("created")
    if created and len(created) >= 4:
        try:
            year = int(created[:4])
        except ValueError:
            year = None

    return PaperRecord(
        title=title,
        authors=authors,
        abstract=abstract,
        year=year,
        categories=categories,
        doi=doi,
        arxiv_id=arxiv_id,
        url=f"https://arxiv.org/abs/{arxiv_id}",
        pdf_url=ARXIV_PDF_BASE.format(arxiv_id=arxiv_id),
        source="arxiv",
    )


def iter_oai_pmh(
    *,
    since: str,
    set_spec: str = "physics:physics",  # OAI sets are coarse — caller can override
    until: Optional[str] = None,
    max_records: Optional[int] = None,
) -> Iterator[PaperRecord]:
    """Harvest arXiv via OAI-PMH for incremental sync.

    `since` and `until` are YYYY-MM-DD strings. arXiv OAI-PMH sets correspond to
    coarse groupings (e.g., 'cs', 'math', 'physics:*'). Callers that want
    fine-grained filtering should post-filter on rec.categories.
    """
    params = {
        "verb": "ListRecords",
        "metadataPrefix": "arXiv",
        "set": set_spec,
        "from": since,
    }
    if until:
        params["until"] = until

    fetched = 0
    while True:
        resp = _polite_get(OAI_PMH_URL, params=params, min_interval=3.0)
        resp.raise_for_status()
        root = ET.fromstring(resp.content)

        for rec_elem in root.findall(".//oai:record", OAI_PMH_NS):
            header = rec_elem.find("oai:header", OAI_PMH_NS)
            if header is not None and header.get("status") == "deleted":
                continue
            rec = _parse_oai_record(rec_elem)
            if rec is None:
                continue
            fetched += 1
            yield rec
            if max_records is not None and fetched >= max_records:
                return

        token_elem = root.find(".//oai:resumptionToken", OAI_PMH_NS)
        token = token_elem.text if (token_elem is not None and token_elem.text) else None
        if not token:
            break
        params = {"verb": "ListRecords", "resumptionToken": token}


def fetch_pdf(arxiv_id: str) -> bytes:
    """Politely fetch an arXiv PDF (respects 3s interval)."""
    url = ARXIV_PDF_BASE.format(arxiv_id=arxiv_id)
    resp = _polite_get(url, min_interval=3.0)
    resp.raise_for_status()
    return resp.content

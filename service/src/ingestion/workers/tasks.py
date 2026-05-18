"""RQ job functions. Module-level so RQ workers can pickle/import them."""
from typing import Optional

from ..pipeline.runner import process_paper
from ..types import PaperRecord


def ingest_paper_job(record_dict: dict, pdf_bytes: Optional[bytes] = None) -> dict:
    """Top-level RQ job: rebuild a PaperRecord and run the pipeline.

    Keep argument types pickle-friendly (dict + bytes) so RQ can serialize them.
    """
    record = PaperRecord.from_dict(record_dict)
    return process_paper(record, pdf_bytes=pdf_bytes)

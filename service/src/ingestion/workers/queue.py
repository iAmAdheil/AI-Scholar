"""Redis-backed RQ queue setup. Lazy singleton so importing this module
does not fail when Redis is unavailable (e.g., during unit tests).
"""
from typing import Optional

from ...config import REDIS_URL, RQ_QUEUE


_redis = None
_queue = None


def get_redis():
    global _redis
    if _redis is None:
        import redis  # local import: optional dep at import-time
        _redis = redis.from_url(REDIS_URL)
    return _redis


def get_queue(name: Optional[str] = None):
    global _queue
    if _queue is None:
        from rq import Queue
        _queue = Queue(name or RQ_QUEUE, connection=get_redis())
    return _queue


def enqueue_ingest(record_dict: dict, *, pdf_bytes: Optional[bytes] = None) -> str:
    """Enqueue a paper-ingest job. Returns the RQ job id."""
    from .tasks import ingest_paper_job

    q = get_queue()
    job = q.enqueue(
        ingest_paper_job,
        record_dict,
        pdf_bytes,
        job_timeout=600,
        result_ttl=86400,
        failure_ttl=86400,
    )
    return job.id


def get_job_status(job_id: str) -> dict:
    """Return a dict {status, error?, result?} for a queued/finished job."""
    from rq.job import Job

    try:
        job = Job.fetch(job_id, connection=get_redis())
    except Exception as e:
        return {"status": "not_found", "error": str(e)}
    status = job.get_status(refresh=True)
    out = {"status": status}
    if status == "failed":
        out["error"] = (job.exc_info or "")[-500:]
    if status == "finished":
        out["result"] = job.result
    return out

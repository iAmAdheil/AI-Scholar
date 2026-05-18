"""SQLite-backed ingestion ledger. Tracks per-paper status so jobs are resumable.

Schema:
    canonical_id TEXT PRIMARY KEY
    status       TEXT NOT NULL     -- queued|processing|done|failed|skipped_ocr|skipped_dup
    source       TEXT
    title        TEXT
    error        TEXT
    chunks       INTEGER
    job_id       TEXT
    uploader_id  TEXT
    created_at   TEXT
    updated_at   TEXT
"""
import os
import sqlite3
import threading
from datetime import datetime, timezone
from typing import Optional, Iterable, List, Dict, Any

from ...config import DATA_DIR

LEDGER_PATH = os.path.join(DATA_DIR, "ingestion_ledger.sqlite")

_lock = threading.Lock()
_conn: Optional[sqlite3.Connection] = None


def _now() -> str:
    return datetime.now(timezone.utc).isoformat()


def _connect() -> sqlite3.Connection:
    global _conn
    if _conn is None:
        os.makedirs(os.path.dirname(LEDGER_PATH), exist_ok=True)
        _conn = sqlite3.connect(LEDGER_PATH, check_same_thread=False)
        _conn.row_factory = sqlite3.Row
        _init_schema(_conn)
    return _conn


def _init_schema(conn: sqlite3.Connection) -> None:
    conn.executescript(
        """
        CREATE TABLE IF NOT EXISTS ingestion_ledger (
            canonical_id TEXT PRIMARY KEY,
            status       TEXT NOT NULL,
            source       TEXT,
            title        TEXT,
            error        TEXT,
            chunks       INTEGER DEFAULT 0,
            job_id       TEXT,
            uploader_id  TEXT,
            created_at   TEXT NOT NULL,
            updated_at   TEXT NOT NULL
        );
        CREATE INDEX IF NOT EXISTS idx_ledger_status ON ingestion_ledger(status);
        CREATE INDEX IF NOT EXISTS idx_ledger_job_id ON ingestion_ledger(job_id);
        CREATE INDEX IF NOT EXISTS idx_ledger_uploader ON ingestion_ledger(uploader_id);
        """
    )
    conn.commit()


def get(canonical_id: str) -> Optional[Dict[str, Any]]:
    with _lock:
        cur = _connect().execute(
            "SELECT * FROM ingestion_ledger WHERE canonical_id = ?", (canonical_id,)
        )
        row = cur.fetchone()
        return dict(row) if row else None


def by_job_id(job_id: str) -> Optional[Dict[str, Any]]:
    with _lock:
        cur = _connect().execute(
            "SELECT * FROM ingestion_ledger WHERE job_id = ? ORDER BY updated_at DESC LIMIT 1",
            (job_id,),
        )
        row = cur.fetchone()
        return dict(row) if row else None


def upsert(
    canonical_id: str,
    status: str,
    source: Optional[str] = None,
    title: Optional[str] = None,
    error: Optional[str] = None,
    chunks: Optional[int] = None,
    job_id: Optional[str] = None,
    uploader_id: Optional[str] = None,
) -> None:
    with _lock:
        conn = _connect()
        existing = conn.execute(
            "SELECT canonical_id FROM ingestion_ledger WHERE canonical_id = ?",
            (canonical_id,),
        ).fetchone()
        now = _now()
        if existing:
            sets, vals = [], []
            for k, v in (
                ("status", status),
                ("source", source),
                ("title", title),
                ("error", error),
                ("chunks", chunks),
                ("job_id", job_id),
                ("uploader_id", uploader_id),
            ):
                if v is not None:
                    sets.append(f"{k} = ?")
                    vals.append(v)
            sets.append("updated_at = ?")
            vals.append(now)
            vals.append(canonical_id)
            conn.execute(
                f"UPDATE ingestion_ledger SET {', '.join(sets)} WHERE canonical_id = ?",
                vals,
            )
        else:
            conn.execute(
                """INSERT INTO ingestion_ledger
                   (canonical_id, status, source, title, error, chunks, job_id, uploader_id, created_at, updated_at)
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
                (
                    canonical_id,
                    status,
                    source,
                    title,
                    error,
                    chunks or 0,
                    job_id,
                    uploader_id,
                    now,
                    now,
                ),
            )
        conn.commit()


def is_done(canonical_id: str) -> bool:
    row = get(canonical_id)
    return bool(row and row["status"] == "done")


def counts() -> Dict[str, int]:
    with _lock:
        cur = _connect().execute(
            "SELECT status, COUNT(*) c FROM ingestion_ledger GROUP BY status"
        )
        return {r["status"]: r["c"] for r in cur.fetchall()}


def list_recent(limit: int = 20) -> List[Dict[str, Any]]:
    with _lock:
        cur = _connect().execute(
            "SELECT * FROM ingestion_ledger ORDER BY updated_at DESC LIMIT ?", (limit,)
        )
        return [dict(r) for r in cur.fetchall()]

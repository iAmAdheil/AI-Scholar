import { Request, Response, NextFunction } from 'express';
import { FASTAPI_URL } from '../config';

// Node 18+ has fetch + FormData + Blob in global scope.

export async function UploadPaper(req: Request, res: Response, _next: NextFunction) {
  try {
    const file = (req as any).file as { buffer: Buffer; originalname: string; mimetype: string } | undefined;
    if (!file) {
      res.status(400).json({ msg: 'No file uploaded under field "file"' });
      return;
    }
    const fId = req.fId as string;
    const title = (req.body?.title as string) || '';

    const form = new FormData();
    const blob = new Blob([new Uint8Array(file.buffer)], { type: file.mimetype || 'application/pdf' });
    form.append('file', blob, file.originalname || 'upload.pdf');
    if (title) form.append('title', title);
    if (fId) form.append('uploader_id', fId);

    const url = `${FASTAPI_URL}/fastapi/ingest/upload`;
    const resp = await fetch(url, { method: 'POST', body: form });
    const data = await resp.json().catch(() => ({ msg: 'upstream returned non-JSON' }));

    if (!resp.ok) {
      res.status(resp.status).json({ msg: 'Upstream ingest failed', detail: data });
      return;
    }
    res.status(202).json(data);
  } catch (e: any) {
    console.error('UploadPaper error:', e);
    res.status(500).json({ msg: e?.message || 'Upload failed' });
  }
}

export async function GetUploadStatus(req: Request, res: Response, _next: NextFunction) {
  try {
    const jobId = req.params.jobId;
    if (!jobId) {
      res.status(400).json({ msg: 'jobId required' });
      return;
    }
    const url = `${FASTAPI_URL}/fastapi/ingest/status/${encodeURIComponent(jobId)}`;
    const resp = await fetch(url);
    const data = await resp.json().catch(() => ({}));
    res.status(resp.status).json(data);
  } catch (e: any) {
    console.error('GetUploadStatus error:', e);
    res.status(500).json({ msg: e?.message || 'Status fetch failed' });
  }
}

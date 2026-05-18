import { Router } from 'express';
import { UploadPaper, GetUploadStatus } from '../controllers/papers.controller';
import { uploadPdf } from '../middlewares/upload.middleware';

const router = Router();

router.post('/upload', uploadPdf.single('file'), UploadPaper);
router.get('/status/:jobId', GetUploadStatus);

export default router;

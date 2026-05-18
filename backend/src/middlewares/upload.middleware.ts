import multer from 'multer';

// In-memory storage: PDFs are forwarded to FastAPI as a stream, not persisted on Express.
const storage = multer.memoryStorage();

export const uploadPdf = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50 MB
  fileFilter: (_req, file, cb) => {
    if (file.mimetype === 'application/pdf' || file.originalname.toLowerCase().endsWith('.pdf')) {
      cb(null, true);
      return;
    }
    cb(new Error('Only PDF files are accepted'));
  },
});

export default uploadPdf;

import multer from 'multer';
import path from 'path';
import { randomUUID } from 'crypto';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const UPLOAD_DIR = path.resolve(__dirname, '../../../../uploads/tenders');

if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const ALLOWED_MIME = new Set([
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'image/jpeg',
  'image/png',
]);

const MIME_TO_EXT = {
  'application/pdf': '.pdf',
  'application/msword': '.doc',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
  'application/vnd.ms-excel': '.xls',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': '.xlsx',
  'image/jpeg': '.jpg',
  'image/png': '.png',
};

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (_req, file, cb) => {
    const ext = MIME_TO_EXT[file.mimetype] || path.extname(file.originalname).toLowerCase() || '';
    cb(null, `${randomUUID()}${ext}`);
  },
});

const fileFilter = (_req, file, cb) => {
  if (ALLOWED_MIME.has(file.mimetype)) {
    cb(null, true);
  } else {
    cb(Object.assign(new Error('File type not allowed. Accepted formats: PDF, Word, Excel, JPEG, PNG'), { statusCode: 400 }), false);
  }
};

export const uploadTenderDoc = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 },
}).single('document');

// ── Tender Submission Document (dealer bid attachment) ────────────────────────

const SUB_DOC_DIR = path.resolve(__dirname, '../../../../uploads/tender-submissions');

if (!fs.existsSync(SUB_DOC_DIR)) {
  fs.mkdirSync(SUB_DOC_DIR, { recursive: true });
}

const subDocStorage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, SUB_DOC_DIR),
  filename:    (_req, file, cb) => {
    const ext = MIME_TO_EXT[file.mimetype] || path.extname(file.originalname).toLowerCase() || '';
    cb(null, `${randomUUID()}${ext}`);
  },
});

export const uploadSubmissionDoc = multer({
  storage:    subDocStorage,
  fileFilter,
  limits:     { fileSize: 10 * 1024 * 1024 },
}).single('document');

export { UPLOAD_DIR, SUB_DOC_DIR };

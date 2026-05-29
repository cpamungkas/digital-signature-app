import { Router } from 'express';
import multer from 'multer';
import { documentController } from '../controllers/document.controller';
import { authenticate } from '../middlewares/auth';

const router = Router();

// Configure multer for file upload
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Only allow PDF files
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'));
    }
  }
});

/**
 * @route   POST /api/documents/upload
 * @desc    Upload new document
 * @access  Private
 */
router.post('/upload', authenticate, upload.single('file'), documentController.uploadDocument);

/**
 * @route   GET /api/documents
 * @desc    Get user's documents with pagination
 * @access  Private
 */
router.get('/', authenticate, documentController.getUserDocuments);

/**
 * @route   GET /api/documents/statistics
 * @desc    Get document statistics
 * @access  Private
 */
router.get('/statistics', authenticate, documentController.getStatistics);

/**
 * @route   GET /api/documents/:id
 * @desc    Get document by ID
 * @access  Private
 */
router.get('/:id', authenticate, documentController.getDocument);

/**
 * @route   DELETE /api/documents/:id
 * @desc    Delete document
 * @access  Private
 */
router.delete('/:id', authenticate, documentController.deleteDocument);

/**
 * @route   POST /api/documents/:id/sign
 * @desc    Sign a document
 * @access  Private
 */
router.post('/:id/sign', authenticate, documentController.signDocument);

/**
 * @route   GET /api/documents/:id/signatures
 * @desc    Get document signatures
 * @access  Private
 */
router.get('/:id/signatures', authenticate, documentController.getDocumentSignatures);

export default router;

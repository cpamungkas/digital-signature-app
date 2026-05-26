const express = require('express');
const router = express.Router();
const documentController = require('../controllers/documentController');
const { validateDocument } = require('../middleware/validation');

// GET /api/documents - List user's documents
router.get('/', documentController.listDocuments);

// GET /api/documents/:id - Get document details
router.get('/:id', documentController.getDocument);

// POST /api/documents - Upload document
router.post('/', validateDocument, documentController.uploadDocument);

// DELETE /api/documents/:id - Delete document
router.delete('/:id', documentController.deleteDocument);

// GET /api/documents/:id/download - Download document
router.get('/:id/download', documentController.downloadDocument);

// GET /api/documents/:id/audit-log - Get audit trail
router.get('/:id/audit-log', documentController.getAuditLog);

module.exports = router;
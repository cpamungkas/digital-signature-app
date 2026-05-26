const express = require('express');
const multer = require('multer');
const { body, param } = require('express-validator');
const documentService = require('../services/document.service');
const { authenticateToken } = require('../middleware/auth');
const { validate } = require('../middleware/validation');
const { rateLimit } = require('../middleware/rateLimit');
const { createAuditLog } = require('../middleware/audit');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['application/pdf', 'image/png', 'image/jpeg'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Allowed: PDF, PNG, JPEG'), false);
    }
  },
});

const router = express.Router();

router.post('/create',
  authenticateToken,
  validate([
    body('title').trim().isLength({ min: 2 }).withMessage('Title min 2 chars'),
    body('content').optional().trim(),
  ]),
  async (req, res, next) => {
    try {
      const doc = await documentService.createDocument(req.user.id, req.body);
      await createAuditLog({ action: 'CREATE', entity: 'document', entityId: doc.id, userId: req.user.id, ipAddress: req.ip, userAgent: req.headers['user-agent'] });
      res.status(201).json({ success: true, data: doc });
    } catch (error) { next(error); }
  }
);

router.post('/upload',
  authenticateToken,
  rateLimit('documents'),
  upload.single('file'),
  async (req, res, next) => {
    try {
      const doc = await documentService.uploadDocument(req.user.id, req.file, req.body.title);
      await createAuditLog({ action: 'UPLOAD', entity: 'document', entityId: doc.id, userId: req.user.id, ipAddress: req.ip, userAgent: req.headers['user-agent'] });
      res.status(201).json({ success: true, data: doc });
    } catch (error) { next(error); }
  }
);

router.get('/',
  authenticateToken,
  rateLimit('documents'),
  async (req, res, next) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const { status } = req.query;
      const result = await documentService.listDocuments(req.user.id, page, limit, status);
      res.json({ success: true, ...result });
    } catch (error) { next(error); }
  }
);

router.get('/:id', authenticateToken, async (req, res, next) => {
  try {
    const doc = await documentService.getDocument(req.params.id, req.user.id);
    res.json({ success: true, data: doc });
  } catch (error) { next(error); }
});

router.put('/:id',
  authenticateToken,
  validate([
    body('title').optional().trim().isLength({ min: 2 }),
    body('content').optional().trim(),
    body('status').optional().isIn(['DRAFT', 'PENDING', 'SIGNED', 'COMPLETED', 'CANCELLED']),
  ]),
  async (req, res, next) => {
    try {
      const doc = await documentService.updateDocument(req.params.id, req.user.id, req.body);
      await createAuditLog({ action: 'UPDATE', entity: 'document', entityId: doc.id, userId: req.user.id, ipAddress: req.ip, userAgent: req.headers['user-agent'], metadata: { changes: Object.keys(req.body) } });
      res.json({ success: true, data: doc });
    } catch (error) { next(error); }
  }
);

router.delete('/:id', authenticateToken, async (req, res, next) => {
  try {
    const result = await documentService.deleteDocument(req.params.id, req.user.id);
    await createAuditLog({ action: 'DELETE', entity: 'document', entityId: req.params.id, userId: req.user.id, ipAddress: req.ip, userAgent: req.headers['user-agent'] });
    res.json({ success: true, ...result });
  } catch (error) { next(error); }
});

module.exports = router;

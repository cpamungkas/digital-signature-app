const express = require('express');
const { param } = require('express-validator');
const signatureService = require('../services/signature.service');
const { authenticateToken } = require('../middleware/auth');
const { validate } = require('../middleware/validation');
const { rateLimit } = require('../middleware/rateLimit');
const { createAuditLog } = require('../middleware/audit');

const router = express.Router();

router.post('/documents/:id/sign',
  authenticateToken,
  rateLimit('signatures'),
  async (req, res, next) => {
    try {
      const signature = await signatureService.signDocument(req.params.id, req.user.id);
      await createAuditLog({ action: 'SIGN', entity: 'document', entityId: req.params.id, userId: req.user.id, ipAddress: req.ip, userAgent: req.headers['user-agent'] });
      res.status(201).json({ success: true, data: signature });
    } catch (error) { next(error); }
  }
);

router.get('/documents/:id/signatures',
  authenticateToken,
  async (req, res, next) => {
    try {
      const signatures = await signatureService.listSignatures(req.params.id);
      res.json({ success: true, data: signatures });
    } catch (error) { next(error); }
  }
);

router.get('/documents/:id/verify',
  authenticateToken,
  async (req, res, next) => {
    try {
      const result = await signatureService.verifyDocumentIntegrity(req.params.id);
      await createAuditLog({ action: 'VERIFY', entity: 'document', entityId: req.params.id, userId: req.user.id, ipAddress: req.ip, userAgent: req.headers['user-agent'] });
      res.json({ success: true, ...result });
    } catch (error) { next(error); }
  }
);

router.get('/:id/verify',
  authenticateToken,
  async (req, res, next) => {
    try {
      const result = await signatureService.verifySignature(req.params.id);
      res.json({ success: true, ...result });
    } catch (error) { next(error); }
  }
);

module.exports = router;

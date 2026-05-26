const express = require('express');
const { body, param } = require('express-validator');
const signingService = require('../services/signing.service');
const { authenticateToken } = require('../middleware/auth');
const { validate } = require('../middleware/validation');
const { rateLimit } = require('../middleware/rateLimit');
const { createAuditLog } = require('../middleware/audit');

const router = express.Router();

router.post('/documents/:id/signatories',
  authenticateToken,
  rateLimit('documents'),
  validate([
    param('id').isUUID(),
    body('email').isEmail().normalizeEmail(),
    body('name').optional().trim().isLength({ min: 2 }),
  ]),
  async (req, res, next) => {
    try {
      const signatory = await signingService.addSignatory(req.params.id, req.user.id, req.body);
      await createAuditLog({ action: 'CREATE', entity: 'document_signatory', entityId: signatory.id, userId: req.user.id, ipAddress: req.ip, userAgent: req.headers['user-agent'] });
      res.status(201).json({ success: true, data: signatory });
    } catch (error) { next(error); }
  }
);

router.get('/documents/:id/signatories',
  authenticateToken,
  async (req, res, next) => {
    try {
      const signatories = await signingService.listSignatories(req.params.id, req.user.id);
      res.json({ success: true, data: signatories });
    } catch (error) { next(error); }
  }
);

router.delete('/signatories/:sigId',
  authenticateToken,
  async (req, res, next) => {
    try {
      const result = await signingService.removeSignatory(req.params.sigId, req.user.id);
      await createAuditLog({ action: 'DELETE', entity: 'document_signatory', entityId: req.params.sigId, userId: req.user.id, ipAddress: req.ip, userAgent: req.headers['user-agent'] });
      res.json({ success: true, ...result });
    } catch (error) { next(error); }
  }
);

router.post('/sign/:token',
  rateLimit('signatures'),
  validate([
    param('token').notEmpty(),
    body('name').optional().trim(),
  ]),
  async (req, res, next) => {
    try {
      const signature = await signingService.signViaToken(req.params.token, req.body.name || 'Signatory');
      res.json({ success: true, data: signature });
    } catch (error) { next(error); }
  }
);

router.get('/status/:token',
  async (req, res, next) => {
    try {
      const status = await signingService.getSigningStatus(req.params.token);
      res.json({ success: true, data: status });
    } catch (error) { next(error); }
  }
);

module.exports = router;

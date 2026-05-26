const express = require('express');
const { body } = require('express-validator');
const authService = require('../services/auth.service');
const { authenticateToken } = require('../middleware/auth');
const { validate } = require('../middleware/validation');
const { rateLimit } = require('../middleware/rateLimit');
const { createAuditLog } = require('../middleware/audit');

const router = express.Router();

router.post('/register',
  rateLimit('register'),
  validate([
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 8 }).withMessage('Password min 8 chars'),
    body('name').optional().trim().isLength({ min: 2 }),
  ]),
  async (req, res, next) => {
    try {
      const result = await authService.register(req.body);
      await createAuditLog({ action: 'CREATE', entity: 'user', entityId: result.user.id, ipAddress: req.ip, userAgent: req.headers['user-agent'] });
      res.status(201).json({ success: true, ...result });
    } catch (error) { next(error); }
  }
);

router.post('/login',
  rateLimit('auth'),
  validate([
    body('email').isEmail().normalizeEmail(),
    body('password').notEmpty(),
  ]),
  async (req, res, next) => {
    try {
      const result = await authService.login(req.body);
      await createAuditLog({ action: 'LOGIN', entity: 'user', entityId: result.user.id, ipAddress: req.ip, userAgent: req.headers['user-agent'] });
      res.json({ success: true, ...result });
    } catch (error) { next(error); }
  }
);

router.post('/refresh',
  validate([ body('refreshToken').notEmpty() ]),
  async (req, res, next) => {
    try {
      const result = await authService.refresh(req.body.refreshToken);
      res.json({ success: true, ...result });
    } catch (error) { next(error); }
  }
);

router.post('/change-password',
  authenticateToken,
  validate([
    body('currentPassword').notEmpty(),
    body('newPassword').isLength({ min: 8 }),
  ]),
  async (req, res, next) => {
    try {
      const result = await authService.changePassword(req.user.id, req.body.currentPassword, req.body.newPassword);
      await createAuditLog({ action: 'PASSWORD_CHANGE', entity: 'user', entityId: req.user.id, userId: req.user.id, ipAddress: req.ip, userAgent: req.headers['user-agent'] });
      res.json({ success: true, ...result });
    } catch (error) { next(error); }
  }
);

router.post('/logout',
  authenticateToken,
  async (req, res, next) => {
    try {
      const result = await authService.logout(req.body.refreshToken);
      await createAuditLog({ action: 'LOGOUT', entity: 'user', entityId: req.user.id, userId: req.user.id, ipAddress: req.ip, userAgent: req.headers['user-agent'] });
      res.json({ success: true, ...result });
    } catch (error) { next(error); }
  }
);

module.exports = router;

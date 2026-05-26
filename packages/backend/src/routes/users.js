const express = require('express');
const { body } = require('express-validator');
const userService = require('../services/user.service');
const { authenticateToken } = require('../middleware/auth');
const { validate } = require('../middleware/validation');
const { rateLimit } = require('../middleware/rateLimit');

const router = express.Router();

router.get('/profile', authenticateToken, async (req, res, next) => {
  try {
    const user = await userService.getProfile(req.user.id);
    res.json({ success: true, data: user });
  } catch (error) { next(error); }
});

router.put('/profile',
  authenticateToken,
  validate([
    body('name').optional().trim().isLength({ min: 2 }),
    body('avatarUrl').optional().trim().isURL(),
  ]),
  async (req, res, next) => {
    try {
      const user = await userService.updateProfile(req.user.id, req.body);
      res.json({ success: true, data: user });
    } catch (error) { next(error); }
  }
);

router.get('/',
  authenticateToken,
  rateLimit('general'),
  async (req, res, next) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const result = await userService.listUsers(page, limit);
      res.json({ success: true, ...result });
    } catch (error) { next(error); }
  }
);

router.get('/:id', authenticateToken, async (req, res, next) => {
  try {
    const user = await userService.getUserById(req.params.id);
    res.json({ success: true, data: user });
  } catch (error) { next(error); }
});

router.put('/:id',
  authenticateToken,
  validate([
    body('name').optional().trim().isLength({ min: 2 }),
    body('role').optional().isIn(['USER', 'ADMIN']),
    body('isActive').optional().isBoolean(),
  ]),
  async (req, res, next) => {
    try {
      const user = await userService.updateUser(req.params.id, req.body);
      res.json({ success: true, data: user });
    } catch (error) { next(error); }
  }
);

router.delete('/:id', authenticateToken, async (req, res, next) => {
  try {
    const result = await userService.deleteUser(req.params.id);
    res.json({ success: true, ...result });
  } catch (error) { next(error); }
});

module.exports = router;

const express = require('express');
const router = express.Router();
const signingController = require('../controllers/signingController');

// POST /api/signing-sessions - Create signing session
router.post('/', signingController.createSigningSession);

// GET /api/signing-sessions/:token - Get signing session (public)
router.get('/:token', signingController.getSigningSession);

// POST /api/signing-sessions/:token/sign - Sign document
router.post('/:token/sign', signingController.signDocument);

// GET /api/signing-sessions/:id/status - Check signing status
router.get('/:id/status', signingController.getSigningStatus);

module.exports = router;
const express = require('express');
const router = express.Router();
const signatureController = require('../controllers/signatureController');
const { validateSignature } = require('../middleware/validation');

// GET /api/signatures - List user's signatures
router.get('/', signatureController.listSignatures);

// POST /api/signatures - Create/upload signature
router.post('/', validateSignature, signatureController.createSignature);

// DELETE /api/signatures/:id - Delete signature
router.delete('/:id', signatureController.deleteSignature);

module.exports = router;
import { Router } from 'express';
import { signatureController } from '../controllers/signature.controller';
import { authenticate } from '../middlewares/auth';

const router = Router();

/**
 * @route   POST /api/signatures
 * @desc    Create user signature
 * @access  Private
 */
router.post('/', authenticate, signatureController.createSignature);

/**
 * @route   GET /api/signatures/me
 * @desc    Get current user's signature
 * @access  Private
 */
router.get('/me', authenticate, signatureController.getUserSignature);

/**
 * @route   DELETE /api/signatures/:id
 * @desc    Delete signature
 * @access  Private
 */
router.delete('/:id', authenticate, signatureController.deleteSignature);

/**
 * @route   GET /api/signatures/:signatureId/verify/:documentId
 * @desc    Verify signature on document
 * @access  Public
 */
router.get('/:signatureId/verify/:documentId', signatureController.verifySignature);

export default router;

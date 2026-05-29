import { Request, Response } from 'express';
import { signatureService } from '../services/signature.service';
import { sendSuccess, sendError, sendNotFound } from '../utils/response';
import { asyncHandler } from '../middlewares/errorHandler';
import { logger } from '../utils/logger';
import { validateSafe, createSignatureSchema } from '../utils/validation';

export class SignatureController {
  /**
   * Create signature
   */
  createSignature = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      return sendError(res, 'Authentication required', 401);
    }

    // Validate request body
    const validation = validateSafe(createSignatureSchema, req.body);
    if (!validation.success) {
      return sendError(res, 'Validation failed', 400, validation.error.errors);
    }

    const signature = await signatureService.createSignature(
      req.user.userId,
      validation.data.signatureData
    );

    sendSuccess(res, signature, 'Signature created successfully', 201);
  });

  /**
   * Get user's signature
   */
  getUserSignature = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      return sendError(res, 'Authentication required', 401);
    }

    const signature = await signatureService.getUserSignature(req.user.userId);

    if (!signature) {
      return sendNotFound(res, 'No signature found');
    }

    sendSuccess(res, signature, 'Signature retrieved successfully');
  });

  /**
   * Delete signature
   */
  deleteSignature = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      return sendError(res, 'Authentication required', 401);
    }

    const { id } = req.params;

    await signatureService.deleteSignature(req.user.userId, id);

    sendSuccess(res, null, 'Signature deleted successfully');
  });

  /**
   * Verify signature
   */
  verifySignature = asyncHandler(async (req: Request, res: Response) => {
    const { signatureId, documentId } = req.params;

    const verification = await signatureService.verifySignature(signatureId, documentId);

    sendSuccess(res, verification, 'Signature verification completed');
  });
}

export const signatureController = new SignatureController();

import { Request, Response } from 'express';
import { documentService } from '../services/document.service';
import { signatureService } from '../services/signature.service';
import { sendSuccess, sendError, sendPaginated, sendNotFound } from '../utils/response';
import { asyncHandler } from '../middlewares/errorHandler';
import { logger } from '../utils/logger';
import { validateSafe, uploadDocumentSchema, documentQuerySchema, signDocumentSchema } from '../utils/validation';

export class DocumentController {
  /**
   * Upload document
   */
  uploadDocument = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      return sendError(res, 'Authentication required', 401);
    }

    if (!req.file) {
      return sendError(res, 'No file provided', 400);
    }

    // Validate request body
    const validation = validateSafe(uploadDocumentSchema, req.body);
    if (!validation.success) {
      return sendError(res, 'Validation failed', 400, validation.error.errors);
    }

    const document = await documentService.uploadDocument(
      req.user.userId,
      req.file.buffer,
      req.file.originalname,
      req.file.mimetype,
      validation.data.title
    );

    sendSuccess(res, document, 'Document uploaded successfully', 201);
  });

  /**
   * Get user's documents
   */
  getUserDocuments = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      return sendError(res, 'Authentication required', 401);
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const status = req.query.status as any;
    const search = req.query.search as string;

    const result = await documentService.getUserDocuments(
      req.user.userId,
      page,
      limit,
      status,
      search
    );

    sendPaginated(res, result.items, result.pagination, 'Documents retrieved successfully');
  });

  /**
   * Get document by ID
   */
  getDocument = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      return sendError(res, 'Authentication required', 401);
    }

    const { id } = req.params;

    const document = await documentService.getDocumentById(req.user.userId, id);

    if (!document) {
      return sendNotFound(res, 'Document not found');
    }

    sendSuccess(res, document, 'Document retrieved successfully');
  });

  /**
   * Delete document
   */
  deleteDocument = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      return sendError(res, 'Authentication required', 401);
    }

    const { id } = req.params;

    await documentService.deleteDocument(req.user.userId, id);

    sendSuccess(res, null, 'Document deleted successfully');
  });

  /**
   * Get document statistics
   */
  getStatistics = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      return sendError(res, 'Authentication required', 401);
    }

    const stats = await documentService.getStatistics(req.user.userId);

    sendSuccess(res, stats, 'Statistics retrieved successfully');
  });

  /**
   * Sign document
   */
  signDocument = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      return sendError(res, 'Authentication required', 401);
    }

    const { id } = req.params;

    // Validate request body
    const validation = validateSafe(signDocumentSchema, req.body);
    if (!validation.success) {
      return sendError(res, 'Validation failed', 400, validation.error.errors);
    }

    const documentSignature = await signatureService.signDocument(
      req.user.userId,
      id,
      validation.data.signatureId,
      validation.data.positionX,
      validation.data.positionY,
      validation.data.pageNumber
    );

    sendSuccess(res, documentSignature, 'Document signed successfully');
  });

  /**
   * Get document signatures
   */
  getDocumentSignatures = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      return sendError(res, 'Authentication required', 401);
    }

    const { id } = req.params;

    const signatures = await signatureService.getDocumentSignatures(id);

    sendSuccess(res, signatures, 'Signatures retrieved successfully');
  });
}

export const documentController = new DocumentController();

import { prisma } from '../utils/database';
import { uploadService } from './upload.service';
import { logger } from '../utils/logger';
import { ApiError } from '../middlewares/errorHandler';
import { Signature, DocumentSignature, DocumentStatus } from '@prisma/client';

export class SignatureService {
  /**
   * Create user signature
   */
  async createSignature(userId: string, signatureData: string): Promise<Signature> {
    try {
      // Check if user already has a signature
      const existingSignature = await prisma.signature.findFirst({
        where: { userId }
      });

      if (existingSignature) {
        throw new ApiError('User already has a signature. Delete the existing one first.', 409);
      }

      // Upload signature to Cloudinary
      const uploadResult = await uploadService.uploadSignature(signatureData, userId);

      // Create signature record
      const signature = await prisma.signature.create({
        data: {
          userId,
          signatureData: uploadResult.secureUrl,
          signatureHash: uploadResult.signatureHash
        }
      });

      // Create audit log
      await prisma.auditLog.create({
        data: {
          userId,
          action: 'CREATE_SIGNATURE',
          resourceType: 'SIGNATURE',
          resourceId: signature.id
        }
      });

      logger.info(`Signature created for user: ${userId}`);

      return signature;
    } catch (error) {
      logger.error('Create signature error:', error);
      throw error;
    }
  }

  /**
   * Get user's signature
   */
  async getUserSignature(userId: string): Promise<Signature | null> {
    try {
      const signature = await prisma.signature.findFirst({
        where: { userId }
      });

      return signature;
    } catch (error) {
      logger.error('Get signature error:', error);
      throw error;
    }
  }

  /**
   * Delete user's signature
   */
  async deleteSignature(userId: string, signatureId: string): Promise<void> {
    try {
      const signature = await prisma.signature.findUnique({
        where: { id: signatureId }
      });

      if (!signature) {
        throw new ApiError('Signature not found', 404);
      }

      if (signature.userId !== userId) {
        throw new ApiError('Unauthorized', 403);
      }

      // Check if signature is used in any documents
      const usedInDocuments = await prisma.documentSignature.count({
        where: { signatureId }
      });

      if (usedInDocuments > 0) {
        throw new ApiError('Cannot delete signature that is used in documents', 403);
      }

      // Delete from Cloudinary
      const publicId = signature.signatureData.split('/').pop()?.split('.')[0];
      if (publicId) {
        await uploadService.deleteFile(publicId, 'image');
      }

      // Delete from database
      await prisma.signature.delete({
        where: { id: signatureId }
      });

      // Create audit log
      await prisma.auditLog.create({
        data: {
          userId,
          action: 'DELETE_SIGNATURE',
          resourceType: 'SIGNATURE',
          resourceId: signatureId
        }
      });

      logger.info(`Signature deleted: ${signatureId}`);
    } catch (error) {
      logger.error('Delete signature error:', error);
      throw error;
    }
  }

  /**
   * Sign a document
   */
  async signDocument(
    userId: string,
    documentId: string,
    signatureId: string,
    positionX: number,
    positionY: number,
    pageNumber: number
  ): Promise<DocumentSignature> {
    try {
      // Verify document exists and belongs to user
      const document = await prisma.document.findUnique({
        where: { id: documentId }
      });

      if (!document) {
        throw new ApiError('Document not found', 404);
      }

      if (document.userId !== userId) {
        throw new ApiError('Unauthorized', 403);
      }

      if (document.status === DocumentStatus.SIGNED) {
        throw new ApiError('Document is already signed', 400);
      }

      // Verify signature exists and belongs to user
      const signature = await prisma.signature.findUnique({
        where: { id: signatureId }
      });

      if (!signature) {
        throw new ApiError('Signature not found', 404);
      }

      if (signature.userId !== userId) {
        throw new ApiError('Unauthorized', 403);
      }

      // Create document signature
      const documentSignature = await prisma.documentSignature.create({
        data: {
          documentId,
          signatureId,
          positionX,
          positionY,
          pageNumber
        }
      });

      // Update document status to SIGNED
      await prisma.document.update({
        where: { id: documentId },
        data: { status: DocumentStatus.SIGNED }
      });

      // Create audit log
      await prisma.auditLog.create({
        data: {
          userId,
          action: 'SIGN_DOCUMENT',
          resourceType: 'DOCUMENT',
          resourceId: documentId,
          details: {
            signatureId,
            positionX,
            positionY,
            pageNumber
          }
        }
      });

      logger.info(`Document signed: ${documentId} by user: ${userId}`);

      return documentSignature;
    } catch (error) {
      logger.error('Sign document error:', error);
      throw error;
    }
  }

  /**
   * Get document signatures
   */
  async getDocumentSignatures(documentId: string): Promise<DocumentSignature[]> {
    try {
      const signatures = await prisma.documentSignature.findMany({
        where: { documentId },
        include: {
          signature: {
            include: {
              user: {
                select: {
                  id: true,
                  fullName: true,
                  email: true
                }
              }
            }
          }
        }
      });

      return signatures;
    } catch (error) {
      logger.error('Get document signatures error:', error);
      throw error;
    }
  }

  /**
   * Verify signature authenticity
   */
  async verifySignature(signatureId: string, documentId: string): Promise<{
    isValid: boolean;
    signedAt: Date;
    signedBy: string;
  }> {
    try {
      const documentSignature = await prisma.documentSignature.findFirst({
        where: {
          signatureId,
          documentId
        },
        include: {
          signature: {
            include: {
              user: true
            }
          }
        }
      });

      if (!documentSignature) {
        return {
          isValid: false,
          signedAt: new Date(),
          signedBy: 'Unknown'
        };
      }

      return {
        isValid: true,
        signedAt: documentSignature.signedAt,
        signedBy: documentSignature.signature.user.fullName
      };
    } catch (error) {
      logger.error('Verify signature error:', error);
      throw error;
    }
  }
}

export const signatureService = new SignatureService();

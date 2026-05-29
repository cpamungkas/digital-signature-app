import { prisma } from '../utils/database';
import { uploadService } from './upload.service';
import { logger } from '../utils/logger';
import { ApiError } from '../middlewares/errorHandler';
import { Document, DocumentStatus } from '@prisma/client';
import { PaginationMeta, PaginatedResponse } from '../types';

export class DocumentService {
  /**
   * Upload new document
   */
  async uploadDocument(
    userId: string,
    file: Buffer,
    originalName: string,
    mimeType: string,
    title: string
  ): Promise<Document> {
    try {
      // Upload to Cloudinary
      const uploadResult = await uploadService.uploadDocument(file, originalName, mimeType);

      // Create database record
      const document = await prisma.document.create({
        data: {
          userId,
          fileName: originalName,
          filePath: uploadResult.secureUrl,
          fileHash: uploadResult.hash,
          fileSize: uploadResult.size,
          mimeType,
          status: DocumentStatus.UNSIGNED
        }
      });

      // Create audit log
      await prisma.auditLog.create({
        data: {
          userId,
          action: 'UPLOAD_DOCUMENT',
          resourceType: 'DOCUMENT',
          resourceId: document.id,
          details: {
            fileName: originalName,
            fileSize: uploadResult.size,
            title
          }
        }
      });

      logger.info(`Document uploaded by user ${userId}: ${document.id}`);

      return document;
    } catch (error) {
      logger.error('Document upload error:', error);
      throw error;
    }
  }

  /**
   * Get user's documents with pagination
   */
  async getUserDocuments(
    userId: string,
    page: number = 1,
    limit: number = 10,
    status?: DocumentStatus,
    search?: string
  ): Promise<PaginatedResponse<Document>> {
    try {
      const skip = (page - 1) * limit;

      const where: any = {
        userId
      };

      if (status) {
        where.status = status;
      }

      if (search) {
        where.OR = [
          { title: { contains: search, mode: 'insensitive' } },
          { fileName: { contains: search, mode: 'insensitive' } }
        ];
      }

      const [documents, total] = await prisma.$transaction([
        prisma.document.findMany({
          where,
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            userId: true,
            fileName: true,
            filePath: true,
            fileHash: true,
            fileSize: true,
            mimeType: true,
            status: true,
            createdAt: true,
            updatedAt: true
          }
        }),
        prisma.document.count({ where })
      ]);

      const totalPages = Math.ceil(total / limit);

      return {
        items: documents,
        pagination: {
          page,
          limit,
          total,
          totalPages
        }
      };
    } catch (error) {
      logger.error('Get user documents error:', error);
      throw error;
    }
  }

  /**
   * Get document by ID
   */
  async getDocumentById(userId: string, documentId: string): Promise<Document | null> {
    try {
      const document = await prisma.document.findUnique({
        where: {
          id: documentId,
          userId
        }
      });

      if (!document) {
        throw new ApiError('Document not found', 404);
      }

      return document;
    } catch (error) {
      logger.error('Get document error:', error);
      throw error;
    }
  }

  /**
   * Delete document (only draft documents)
   */
  async deleteDocument(userId: string, documentId: string): Promise<void> {
    try {
      const document = await prisma.document.findUnique({
        where: { id: documentId }
      });

      if (!document) {
        throw new ApiError('Document not found', 404);
      }

      if (document.userId !== userId) {
        throw new ApiError('Unauthorized', 403);
      }

      if (document.status !== DocumentStatus.UNSIGNED) {
        throw new ApiError('Cannot delete signed documents', 403);
      }

      // Delete from Cloudinary
      const publicId = document.filePath.split('/').pop()?.split('.')[0];
      if (publicId) {
        await uploadService.deleteFile(publicId, 'raw');
      }

      // Delete from database
      await prisma.document.delete({
        where: { id: documentId }
      });

      // Create audit log
      await prisma.auditLog.create({
        data: {
          userId,
          action: 'DELETE_DOCUMENT',
          resourceType: 'DOCUMENT',
          resourceId: documentId
        }
      });

      logger.info(`Document deleted: ${documentId}`);
    } catch (error) {
      logger.error('Delete document error:', error);
      throw error;
    }
  }

  /**
   * Get document statistics
   */
  async getStatistics(userId: string): Promise<{
    totalDocuments: number;
    unsigned: number;
    signed: number;
    totalSize: number;
  }> {
    try {
      const stats = await prisma.document.groupBy({
        by: ['status'],
        where: { userId },
        _count: true,
        _sum: { fileSize: true }
      });

      const totalDocuments = stats.reduce((acc, s) => acc + s._count, 0);
      const unsigned = stats.find(s => s.status === 'UNSIGNED')?._count || 0;
      const signed = stats.find(s => s.status === 'SIGNED')?._count || 0;
      const totalSize = stats.reduce((acc, s) => acc + (s._sum.fileSize || 0), 0);

      return {
        totalDocuments,
        unsigned,
        signed,
        totalSize
      };
    } catch (error) {
      logger.error('Get statistics error:', error);
      throw error;
    }
  }
}

export const documentService = new DocumentService();

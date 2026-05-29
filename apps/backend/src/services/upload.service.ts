import { v2 as cloudinary, UploadApiResponse, UploadApiErrorResponse } from 'cloudinary';
import { logger } from '../utils/logger';
import { ApiError } from '../middlewares/errorHandler';
import crypto from 'crypto';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

export interface UploadResult {
  publicId: string;
  url: string;
  secureUrl: string;
  resourceType: string;
  format: string;
  size: number;
  hash: string;
}

export interface SignatureUploadResult extends UploadResult {
  signatureHash: string;
}

export class UploadService {
  /**
   * Upload document to Cloudinary
   */
  async uploadDocument(
    file: Buffer,
    originalName: string,
    mimeType: string
  ): Promise<UploadResult> {
    try {
      // Validate file type
      if (mimeType !== 'application/pdf') {
        throw new ApiError('Only PDF files are allowed', 400);
      }

      // Validate file size (max 10MB)
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.length > maxSize) {
        throw new ApiError('File size exceeds 10MB limit', 413);
      }

      // Generate hash for file integrity
      const hash = crypto.createHash('sha256').update(file).digest('hex');

      // Upload to Cloudinary
      const result = await new Promise<UploadApiResponse>((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          {
            folder: 'digital-signature/documents',
            resource_type: 'auto',
            use_filename: true,
            unique_filename: true,
            tags: ['document', 'digital-signature']
          },
          (error: UploadApiErrorResponse | undefined, result: UploadApiResponse | undefined) => {
            if (error || !result) {
              reject(error || new Error('Upload failed'));
            } else {
              resolve(result);
            }
          }
        ).end(file);
      });

      logger.info(`Document uploaded: ${originalName} -> ${result.public_id}`);

      return {
        publicId: result.public_id,
        url: result.url,
        secureUrl: result.secure_url,
        resourceType: result.resource_type,
        format: result.format,
        size: result.bytes,
        hash
      };
    } catch (error) {
      logger.error('Document upload error:', error);
      throw error;
    }
  }

  /**
   * Upload signature image to Cloudinary
   */
  async uploadSignature(
    signatureData: string,
    userId: string
  ): Promise<SignatureUploadResult> {
    try {
      // Validate base64 image format
      if (!signatureData.startsWith('data:image/')) {
        throw new ApiError('Invalid signature format', 400);
      }

      // Generate hash for signature
      const signatureHash = crypto
        .createHash('sha256')
        .update(signatureData)
        .digest('hex');

      // Upload to Cloudinary
      const result = await new Promise<UploadApiResponse>((resolve, reject) => {
        cloudinary.uploader.upload(
          signatureData,
          {
            folder: 'digital-signature/signatures',
            resource_type: 'image',
            format: 'png',
            public_id: `signature_${userId}_${Date.now()}`,
            tags: ['signature', 'digital-signature']
          },
          (error: UploadApiErrorResponse | undefined, result: UploadApiResponse | undefined) => {
            if (error || !result) {
              reject(error || new Error('Signature upload failed'));
            } else {
              resolve(result);
            }
          }
        );
      });

      logger.info(`Signature uploaded for user: ${userId}`);

      return {
        publicId: result.public_id,
        url: result.url,
        secureUrl: result.secure_url,
        resourceType: result.resource_type,
        format: result.format,
        size: result.bytes,
        hash: signatureHash,
        signatureHash
      };
    } catch (error) {
      logger.error('Signature upload error:', error);
      throw error;
    }
  }

  /**
   * Delete file from Cloudinary
   */
  async deleteFile(publicId: string, resourceType: string = 'image'): Promise<void> {
    try {
      await cloudinary.uploader.destroy(publicId, {
        resource_type: resourceType
      });

      logger.info(`File deleted: ${publicId}`);
    } catch (error) {
      logger.error('File deletion error:', error);
      throw error;
    }
  }

  /**
   * Generate signed URL for secure access
   */
  generateSignedUrl(publicId: string, expiresIn: number = 3600): string {
    return cloudinary.url(publicId, {
      secure: true,
      sign_url: true,
      expires_at: Math.floor(Date.now() / 1000) + expiresIn
    });
  }

  /**
   * Get file metadata
   */
  async getFileMetadata(publicId: string): Promise<any> {
    try {
      const result = await cloudinary.api.resource(publicId);
      return {
        publicId: result.public_id,
        url: result.secure_url,
        format: result.format,
        size: result.bytes,
        createdAt: result.created_at,
        width: result.width,
        height: result.height
      };
    } catch (error) {
      logger.error('Get file metadata error:', error);
      throw error;
    }
  }
}

export const uploadService = new UploadService();

import { z } from 'zod';

/**
 * User validation schemas
 */
export const registerSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
  fullName: z.string().min(2, 'Full name must be at least 2 characters')
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required')
});

export const updateProfileSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters').optional()
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character')
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required')
});

/**
 * Document validation schemas
 */
export const uploadDocumentSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255, 'Title too long')
});

export const documentQuerySchema = z.object({
  page: z.string().optional().transform(val => val ? parseInt(val) : 1),
  limit: z.string().optional().transform(val => val ? parseInt(val) : 10),
  status: z.enum(['UNSIGNED', 'SIGNED', 'ARCHIVED']).optional(),
  search: z.string().optional()
});

/**
 * Signature validation schemas
 */
export const createSignatureSchema = z.object({
  signatureData: z.string().min(1, 'Signature data is required')
    .regex(/^data:image\/(png|jpeg|jpg);base64,/, 'Invalid signature format')
});

export const signDocumentSchema = z.object({
  signatureId: z.string().uuid('Invalid signature ID'),
  positionX: z.number().min(0, 'Invalid position X'),
  positionY: z.number().min(0, 'Invalid position Y'),
  pageNumber: z.number().min(1, 'Invalid page number')
});

/**
 * Generic validation helper
 */
export const validate = <T>(schema: z.ZodSchema<T>, data: unknown): T => {
  return schema.parse(data);
};

/**
 * Safe validation that returns errors
 */
export const validateSafe = <T>(schema: z.ZodSchema<T>, data: unknown) => {
  return schema.safeParse(data);
};

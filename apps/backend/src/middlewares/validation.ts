import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { sendValidationError } from '../utils/response';
import { logger } from '../utils/logger';

/**
 * Validation middleware factory
 */
export const validateRequest = (schema: z.ZodSchema) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Validate body
      const validatedBody = await schema.parseAsync(req.body);
      req.body = validatedBody;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors = error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }));
        logger.warn('Validation error:', errors);
        return sendValidationError(res, 'Validation failed', errors);
      }
      next(error);
    }
  };
};

/**
 * Query validation middleware factory
 */
export const validateQuery = (schema: z.ZodSchema) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validatedQuery = await schema.parseAsync(req.query);
      req.query = validatedQuery as any;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors = error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }));
        logger.warn('Query validation error:', errors);
        return sendValidationError(res, 'Invalid query parameters', errors);
      }
      next(error);
    }
  };
};

/**
 * Params validation middleware factory
 */
export const validateParams = (schema: z.ZodSchema) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validatedParams = await schema.parseAsync(req.params);
      req.params = validatedParams as any;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors = error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }));
        logger.warn('Params validation error:', errors);
        return sendValidationError(res, 'Invalid URL parameters', errors);
      }
      next(error);
    }
  };
};

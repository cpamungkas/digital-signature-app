import { Response } from 'express';
import { ApiResponse } from '../types';

/**
 * Send success response
 */
export const sendSuccess = <T = any>(
  res: Response,
  data: T,
  message: string = 'Success',
  statusCode: number = 200
): Response<ApiResponse<T>> => {
  return res.status(statusCode).json({
    success: true,
    data,
    message,
    timestamp: new Date().toISOString()
  });
};

/**
 * Send error response
 */
export const sendError = (
  res: Response,
  message: string,
  statusCode: number = 500,
  error?: string
): Response<ApiResponse> => {
  return res.status(statusCode).json({
    success: false,
    message,
    error,
    timestamp: new Date().toISOString()
  });
};

/**
 * Send validation error response
 */
export const sendValidationError = (
  res: Response,
  message: string = 'Validation failed',
  errors?: any[]
): Response<ApiResponse> => {
  return res.status(400).json({
    success: false,
    message,
    error: errors || 'Invalid request data',
    timestamp: new Date().toISOString()
  });
};

/**
 * Send not found response
 */
export const sendNotFound = (
  res: Response,
  message: string = 'Resource not found'
): Response<ApiResponse> => {
  return res.status(404).json({
    success: false,
    message,
    timestamp: new Date().toISOString()
  });
};

/**
 * Send unauthorized response
 */
export const sendUnauthorized = (
  res: Response,
  message: string = 'Unauthorized'
): Response<ApiResponse> => {
  return res.status(401).json({
    success: false,
    message,
    timestamp: new Date().toISOString()
  });
};

/**
 * Send forbidden response
 */
export const sendForbidden = (
  res: Response,
  message: string = 'Forbidden'
): Response<ApiResponse> => {
  return res.status(403).json({
    success: false,
    message,
    timestamp: new Date().toISOString()
  });
};

/**
 * Send paginated response
 */
export const sendPaginated = <T = any>(
  res: Response,
  items: T[],
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  },
  message: string = 'Success'
): Response<ApiResponse<{ items: T[]; pagination: typeof meta }>> => {
  return res.status(200).json({
    success: true,
    data: {
      items,
      pagination: meta
    },
    message,
    timestamp: new Date().toISOString()
  });
};

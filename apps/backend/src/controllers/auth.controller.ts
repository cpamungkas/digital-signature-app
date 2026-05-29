import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/auth.service';
import { sendSuccess, sendError } from '../utils/response';
import { asyncHandler } from '../middlewares/errorHandler';
import { logger } from '../utils/logger';
import { 
  registerSchema, 
  loginSchema, 
  refreshTokenSchema, 
  updateProfileSchema, 
  changePasswordSchema,
  validateSafe 
} from '../utils/validation';

export class AuthController {
  /**
   * Register new user
   */
  register = asyncHandler(async (req: Request, res: Response) => {
    // Validate request body
    const validation = validateSafe(registerSchema, req.body);
    if (!validation.success) {
      return sendError(res, 'Validation failed', 400, validation.error.errors);
    }

    const user = await authService.register(validation.data);
    
    sendSuccess(res, user, 'User registered successfully', 201);
  });

  /**
   * Login user
   */
  login = asyncHandler(async (req: Request, res: Response) => {
    // Validate request body
    const validation = validateSafe(loginSchema, req.body);
    if (!validation.success) {
      return sendError(res, 'Validation failed', 400, validation.error.errors);
    }

    const authResponse = await authService.login(validation.data);
    
    sendSuccess(res, authResponse, 'Login successful');
  });

  /**
   * Refresh access token
   */
  refreshToken = asyncHandler(async (req: Request, res: Response) => {
    // Validate request body
    const validation = validateSafe(refreshTokenSchema, req.body);
    if (!validation.success) {
      return sendError(res, 'Validation failed', 400, validation.error.errors);
    }

    const { accessToken } = await authService.refreshToken(validation.data.refreshToken);
    
    sendSuccess(res, { accessToken }, 'Token refreshed successfully');
  });

  /**
   * Logout user
   */
  logout = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      return sendError(res, 'Authentication required', 401);
    }

    await authService.logout(req.user.userId);
    
    sendSuccess(res, null, 'Logged out successfully');
  });

  /**
   * Get current user profile
   */
  getProfile = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      return sendError(res, 'Authentication required', 401);
    }

    const user = await authService.getProfile(req.user.userId);
    
    sendSuccess(res, user, 'Profile retrieved successfully');
  });

  /**
   * Update user profile
   */
  updateProfile = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      return sendError(res, 'Authentication required', 401);
    }

    // Validate request body
    const validation = validateSafe(updateProfileSchema, req.body);
    if (!validation.success) {
      return sendError(res, 'Validation failed', 400, validation.error.errors);
    }

    const user = await authService.updateProfile(req.user.userId, validation.data);
    
    sendSuccess(res, user, 'Profile updated successfully');
  });

  /**
   * Change password
   */
  changePassword = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      return sendError(res, 'Authentication required', 401);
    }

    // Validate request body
    const validation = validateSafe(changePasswordSchema, req.body);
    if (!validation.success) {
      return sendError(res, 'Validation failed', 400, validation.error.errors);
    }

    await authService.changePassword(
      req.user.userId,
      validation.data.currentPassword,
      validation.data.newPassword
    );
    
    sendSuccess(res, null, 'Password changed successfully');
  });

  /**
   * Health check endpoint
   */
  healthCheck = asyncHandler(async (req: Request, res: Response) => {
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: 'connected', // We'll add actual DB check later
      memory: process.memoryUsage()
    };
    
    sendSuccess(res, health, 'Service is healthy');
  });
}

export const authController = new AuthController();

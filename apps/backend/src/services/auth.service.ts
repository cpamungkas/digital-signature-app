import { PrismaClient, User, Role } from '@prisma/client';
import { 
  hashPassword, 
  comparePassword, 
  generateAccessToken, 
  generateRefreshToken,
  generateRandomPassword 
} from '../utils/auth';
import { prisma } from '../utils/database';
import { logger } from '../utils/logger';
import { ApiError } from '../middlewares/errorHandler';
import { 
  AuthRequest, 
  RegisterRequest, 
  AuthResponse,
  User as UserType 
} from '../types';

export class AuthService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = prisma;
  }

  /**
   * Register new user
   */
  async register(data: RegisterRequest): Promise<UserType> {
    try {
      // Check if user already exists
      const existingUser = await this.prisma.user.findUnique({
        where: { email: data.email }
      });

      if (existingUser) {
        throw new ApiError('Email already exists', 409);
      }

      // Hash password
      const passwordHash = await hashPassword(data.password);

      // Create user
      const user = await this.prisma.user.create({
        data: {
          email: data.email,
          passwordHash,
          fullName: data.fullName,
          role: Role.USER,
          isActive: true
        }
      });

      logger.info(`User registered: ${user.email}`);

      return {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        isActive: user.isActive,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      };
    } catch (error) {
      logger.error('Registration error:', error);
      throw error;
    }
  }

  /**
   * Login user
   */
  async login(data: AuthRequest): Promise<AuthResponse> {
    try {
      // Find user
      const user = await this.prisma.user.findUnique({
        where: { email: data.email }
      });

      if (!user) {
        throw new ApiError('Invalid credentials', 401);
      }

      // Check if user is active
      if (!user.isActive) {
        throw new ApiError('Account is deactivated', 403);
      }

      // Verify password
      const isValidPassword = await comparePassword(data.password, user.passwordHash);
      if (!isValidPassword) {
        throw new ApiError('Invalid credentials', 401);
      }

      // Generate tokens
      const userPayload = {
        id: user.id,
        email: user.email,
        role: user.role
      };

      const accessToken = generateAccessToken(userPayload);
      const refreshToken = generateRefreshToken(userPayload);

      // Create audit log
      await this.prisma.auditLog.create({
        data: {
          userId: user.id,
          action: 'LOGIN',
          resourceType: 'USER',
          resourceId: user.id,
          details: { method: 'email' }
        }
      });

      logger.info(`User logged in: ${user.email}`);

      return {
        accessToken,
        refreshToken,
        user: {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          role: user.role,
          isActive: user.isActive,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
        }
      };
    } catch (error) {
      logger.error('Login error:', error);
      throw error;
    }
  }

  /**
   * Refresh access token
   */
  async refreshToken(refreshToken: string): Promise<{ accessToken: string }> {
    try {
      // Verify refresh token
      const { verifyRefreshToken, generateAccessToken } = await import('../utils/auth');
      const decoded = verifyRefreshToken(refreshToken);

      // Check if user exists and is active
      const user = await this.prisma.user.findUnique({
        where: { id: decoded.userId }
      });

      if (!user || !user.isActive) {
        throw new ApiError('Invalid refresh token', 401);
      }

      // Generate new access token
      const userPayload = {
        id: user.id,
        email: user.email,
        role: user.role
      };

      const newAccessToken = generateAccessToken(userPayload);

      logger.info(`Token refreshed for user: ${user.email}`);

      return { accessToken: newAccessToken };
    } catch (error) {
      logger.error('Token refresh error:', error);
      throw new ApiError('Invalid refresh token', 401);
    }
  }

  /**
   * Logout user
   */
  async logout(userId: string): Promise<void> {
    try {
      // Create audit log
      await this.prisma.auditLog.create({
        data: {
          userId,
          action: 'LOGOUT',
          resourceType: 'USER',
          resourceId: userId
        }
      });

      logger.info(`User logged out: ${userId}`);
    } catch (error) {
      logger.error('Logout error:', error);
      throw error;
    }
  }

  /**
   * Get current user profile
   */
  async getProfile(userId: string): Promise<UserType> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId }
      });

      if (!user) {
        throw new ApiError('User not found', 404);
      }

      return {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        isActive: user.isActive,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      };
    } catch (error) {
      logger.error('Get profile error:', error);
      throw error;
    }
  }

  /**
   * Update user profile
   */
  async updateProfile(userId: string, data: { fullName?: string }): Promise<UserType> {
    try {
      const user = await this.prisma.user.update({
        where: { id: userId },
        data: {
          fullName: data.fullName
        }
      });

      // Create audit log
      await this.prisma.auditLog.create({
        data: {
          userId,
          action: 'UPDATE_PROFILE',
          resourceType: 'USER',
          resourceId: userId,
          details: { updatedFields: Object.keys(data) }
        }
      });

      logger.info(`Profile updated for user: ${user.email}`);

      return {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        isActive: user.isActive,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      };
    } catch (error) {
      logger.error('Update profile error:', error);
      throw error;
    }
  }

  /**
   * Change password
   */
  async changePassword(
    userId: string, 
    currentPassword: string, 
    newPassword: string
  ): Promise<void> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId }
      });

      if (!user) {
        throw new ApiError('User not found', 404);
      }

      // Verify current password
      const isValidPassword = await comparePassword(currentPassword, user.passwordHash);
      if (!isValidPassword) {
        throw new ApiError('Current password is incorrect', 401);
      }

      // Hash new password
      const newPasswordHash = await hashPassword(newPassword);

      // Update password
      await this.prisma.user.update({
        where: { id: userId },
        data: { passwordHash: newPasswordHash }
      });

      // Create audit log
      await this.prisma.auditLog.create({
        data: {
          userId,
          action: 'CHANGE_PASSWORD',
          resourceType: 'USER',
          resourceId: userId
        }
      });

      logger.info(`Password changed for user: ${user.email}`);
    } catch (error) {
      logger.error('Change password error:', error);
      throw error;
    }
  }
}

export const authService = new AuthService();

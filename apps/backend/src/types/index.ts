// User types
export interface User {
  id: string;
  email: string;
  fullName: string;
  role: 'ADMIN' | 'USER';
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserPayload {
  id: string;
  email: string;
  role: 'ADMIN' | 'USER';
}

// Auth types
export interface AuthRequest {
  email: string;
  password: string;
}

export interface RegisterRequest extends AuthRequest {
  fullName: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface TokenPayload {
  userId: string;
  email: string;
  role: string;
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  timestamp: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  pagination: PaginationMeta;
}

// Document types
export interface Document {
  id: string;
  userId: string;
  fileName: string;
  filePath: string;
  fileHash: string;
  fileSize: number;
  mimeType: string;
  status: 'UNSIGNED' | 'SIGNED' | 'ARCHIVED';
  createdAt: Date;
  updatedAt: Date;
}

// Signature types
export interface Signature {
  id: string;
  userId: string;
  signatureData: string;
  signatureHash: string;
  createdAt: Date;
}

// Audit Log types
export interface AuditLog {
  id: string;
  userId?: string;
  action: string;
  resourceType: string;
  resourceId?: string;
  details?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
}

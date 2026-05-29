// User & Auth Types
export interface User {
  id: string
  email: string
  name: string
  avatar?: string
  role: 'admin' | 'user' | 'signer'
  createdAt: string
  updatedAt: string
}

export interface AuthSession {
  user: User
  token: string
  expiresAt: string
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterCredentials {
  email: string
  password: string
  confirmPassword: string
  name: string
}

// Document Types
export interface Document {
  id: string
  title: string
  description?: string
  fileName: string
  fileSize: number
  fileType: string
  fileUrl: string
  status: 'draft' | 'pending' | 'signed' | 'rejected' | 'archived'
  createdBy: User
  createdAt: string
  updatedAt: string
  signers: DocumentSigner[]
  metadata?: Record<string, unknown>
}

export interface DocumentSigner {
  id: string
  documentId: string
  signer: User
  status: 'pending' | 'signed' | 'rejected'
  signedAt?: string
  rejectionReason?: string
  signatureUrl?: string
  order: number
}

export interface DocumentListResponse {
  data: Document[]
  total: number
  page: number
  pageSize: number
  hasMore: boolean
}

// Signature Types
export interface SignatureData {
  documentId: string
  signerId: string
  signatureImage: string // base64 or URL
  timestamp: string
  coordinates?: {
    x: number
    y: number
    page: number
  }
}

export interface SigningSession {
  id: string
  documentId: string
  signerId: string
  status: 'active' | 'completed' | 'expired'
  expiresAt: string
  createdAt: string
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: {
    code: string
    message: string
    details?: Record<string, unknown>
  }
  timestamp: string
}

export interface PaginationParams {
  page: number
  pageSize: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

// Form Types
export interface FormError {
  field: string
  message: string
}

export interface FormState<T> {
  data: T
  errors: FormError[]
  isSubmitting: boolean
  isValid: boolean
}
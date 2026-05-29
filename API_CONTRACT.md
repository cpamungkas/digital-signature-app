# Digital Signature App - API Contract

## Base URL
- Development: `http://localhost:3001/api`
- Production: `https://api.yourdomain.com/api`

## Authentication
All endpoints (except `/auth/*`) require JWT token in Authorization header:
```
Authorization: Bearer <access_token>
```

## Response Format
All responses follow this format:
```json
{
  "success": true,
  "data": {},
  "message": "Success message",
  "timestamp": "2026-05-23T17:32:11.595Z"
}
```

Error responses:
```json
{
  "success": false,
  "error": "ERROR_CODE",
  "message": "Error description",
  "timestamp": "2026-05-23T17:32:11.595Z"
}
```

---

## Authentication Endpoints

### POST /auth/register
Register new user

**Request:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!",
  "fullName": "John Doe"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "fullName": "John Doe",
    "role": "user",
    "createdAt": "2026-05-23T17:32:11.595Z"
  }
}
```

**Errors:**
- 400: Invalid email format
- 409: Email already exists

---

### POST /auth/login
Login user

**Request:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "accessToken": "jwt_token",
    "refreshToken": "refresh_token",
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "fullName": "John Doe",
      "role": "user"
    }
  }
}
```

**Errors:**
- 401: Invalid credentials
- 404: User not found

---

### POST /auth/refresh
Refresh access token

**Request:**
```json
{
  "refreshToken": "refresh_token"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "accessToken": "new_jwt_token"
  }
}
```

---

### POST /auth/logout
Logout user

**Response (200):**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

## User Endpoints

### GET /users/me
Get current user profile

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "fullName": "John Doe",
    "role": "user",
    "createdAt": "2026-05-23T17:32:11.595Z",
    "updatedAt": "2026-05-23T17:32:11.595Z"
  }
}
```

---

### PUT /users/me
Update user profile

**Request:**
```json
{
  "fullName": "Jane Doe"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "fullName": "Jane Doe",
    "role": "user",
    "updatedAt": "2026-05-23T17:32:11.595Z"
  }
}
```

---

### PUT /users/me/password
Change password

**Request:**
```json
{
  "currentPassword": "OldPassword123!",
  "newPassword": "NewPassword123!"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

**Errors:**
- 401: Current password is incorrect

---

## Document Endpoints

### GET /documents
List user's documents

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `status` (optional): Filter by status (draft, signed, rejected)
- `search` (optional): Search by title

**Response (200):**
```json
{
  "success": true,
  "data": {
    "documents": [
      {
        "id": "uuid",
        "title": "Contract Agreement",
        "fileName": "contract.pdf",
        "status": "draft",
        "fileSize": 102400,
        "uploadedAt": "2026-05-23T17:32:11.595Z",
        "createdBy": {
          "id": "uuid",
          "fullName": "John Doe"
        }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 25,
      "totalPages": 3
    }
  }
}
```

---

### POST /documents/upload
Upload new document

**Request:** (multipart/form-data)
- `file`: PDF file (max 10MB)
- `title`: Document title

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "title": "Contract Agreement",
    "fileName": "contract.pdf",
    "status": "draft",
    "fileSize": 102400,
    "fileUrl": "https://storage.example.com/documents/uuid.pdf",
    "uploadedAt": "2026-05-23T17:32:11.595Z"
  }
}
```

**Errors:**
- 400: Invalid file type (only PDF allowed)
- 413: File too large (max 10MB)

---

### GET /documents/:id
Get document details

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "title": "Contract Agreement",
    "fileName": "contract.pdf",
    "status": "draft",
    "fileSize": 102400,
    "fileUrl": "https://storage.example.com/documents/uuid.pdf",
    "uploadedAt": "2026-05-23T17:32:11.595Z",
    "createdBy": {
      "id": "uuid",
      "fullName": "John Doe"
    },
    "signatures": [
      {
        "id": "uuid",
        "signedBy": {
          "id": "uuid",
          "fullName": "Jane Doe"
        },
        "signatureUrl": "https://storage.example.com/signatures/uuid.png",
        "signedAt": "2026-05-23T17:32:11.595Z"
      }
    ]
  }
}
```

---

### DELETE /documents/:id
Delete document (only draft documents)

**Response (200):**
```json
{
  "success": true,
  "message": "Document deleted successfully"
}
```

**Errors:**
- 403: Cannot delete signed documents
- 404: Document not found

---

## Signature Endpoints

### POST /signatures/create
Create user's signature

**Request:**
```json
{
  "signatureData": "data:image/png;base64,iVBORw0KGgo..."
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "signatureUrl": "https://storage.example.com/signatures/uuid.png",
    "signatureHash": "sha256_hash_value",
    "createdAt": "2026-05-23T17:32:11.595Z"
  }
}
```

---

### GET /signatures/me
Get current user's signature

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "signatureUrl": "https://storage.example.com/signatures/uuid.png",
    "createdAt": "2026-05-23T17:32:11.595Z"
  }
}
```

---

### POST /documents/:id/sign
Sign a document

**Request:**
```json
{
  "signatureId": "uuid"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "documentId": "uuid",
    "signedBy": {
      "id": "uuid",
      "fullName": "Jane Doe"
    },
    "signatureUrl": "https://storage.example.com/signatures/uuid.png",
    "signatureHash": "sha256_hash_value",
    "signedAt": "2026-05-23T17:32:11.595Z"
  }
}
```

**Errors:**
- 404: Document or signature not found
- 409: Document already signed by this user

---

### POST /documents/:id/verify
Verify document signature

**Request:**
```json
{
  "signatureHash": "sha256_hash_value"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "isValid": true,
    "signedBy": {
      "id": "uuid",
      "fullName": "Jane Doe"
    },
    "signedAt": "2026-05-23T17:32:11.595Z"
  }
}
```

---

## Audit Log Endpoints

### GET /audit-logs
Get audit logs (admin only)

**Query Parameters:**
- `page` (optional): Page number
- `limit` (optional): Items per page
- `userId` (optional): Filter by user
- `action` (optional): Filter by action

**Response (200):**
```json
{
  "success": true,
  "data": {
    "logs": [
      {
        "id": "uuid",
        "userId": "uuid",
        "action": "DOCUMENT_SIGNED",
        "resourceType": "document",
        "resourceId": "uuid",
        "ipAddress": "192.168.1.1",
        "userAgent": "Mozilla/5.0...",
        "timestamp": "2026-05-23T17:32:11.595Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 100,
      "totalPages": 10
    }
  }
}
```

---

## Health Check

### GET /health
Health check endpoint (no auth required)

**Response (200):**
```json
{
  "status": "OK",
  "timestamp": "2026-05-23T17:32:11.595Z"
}
```

---

## Error Codes

| Code | HTTP | Description |
|------|------|-------------|
| INVALID_CREDENTIALS | 401 | Email or password is incorrect |
| UNAUTHORIZED | 401 | Missing or invalid token |
| FORBIDDEN | 403 | User doesn't have permission |
| NOT_FOUND | 404 | Resource not found |
| CONFLICT | 409 | Resource already exists |
| VALIDATION_ERROR | 400 | Invalid request data |
| FILE_TOO_LARGE | 413 | File exceeds size limit |
| INTERNAL_ERROR | 500 | Server error |

---

## Rate Limiting

- Auth endpoints: 5 requests per minute per IP
- Other endpoints: 100 requests per minute per user
- File upload: 10 requests per minute per user

---

## CORS Configuration

**Allowed Origins:**
- Development: `http://localhost:3000`
- Production: `https://yourdomain.com`

**Allowed Methods:** GET, POST, PUT, DELETE, OPTIONS

**Allowed Headers:** Content-Type, Authorization

---

## Versioning

Current API version: `v1`

Future versions will be available at `/api/v2`, etc.

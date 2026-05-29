# API Integration Guide

## Overview
This directory contains API client utilities and configurations for the Digital Signature App frontend.

## Structure

### `client.ts` (To be created)
- Axios instance with interceptors
- Authentication token management
- Error handling
- Request/response transformation

### `endpoints.ts` (To be created)
- API endpoint constants
- Request/response types
- Query builders

## Authentication

All API requests require a Bearer token in the Authorization header:
```
Authorization: Bearer {token}
```

The token is automatically added by the API client interceptor.

## Error Handling

API errors follow this format:
```typescript
{
  success: false,
  error: {
    code: "ERROR_CODE",
    message: "Human readable message",
    details: { /* optional */ }
  }
}
```

## Endpoints

### Auth
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/logout` - User logout
- `POST /api/auth/refresh` - Refresh token

### Documents
- `GET /api/documents` - List documents (paginated)
- `GET /api/documents/:id` - Get document details
- `POST /api/documents/upload` - Upload new document
- `PUT /api/documents/:id` - Update document
- `DELETE /api/documents/:id` - Delete document

### Signing
- `POST /api/signing/session` - Create signing session
- `GET /api/signing/session/:id` - Get signing session
- `POST /api/signing/sign` - Submit signature
- `GET /api/signing/verify/:documentId/:signatureId` - Verify signature

## Usage Example

```typescript
import { useAuth } from '@/lib/context/AuthContext'

export function useDocuments() {
  const { session } = useAuth()

  const fetchDocuments = async () => {
    const response = await fetch('/api/documents', {
      headers: {
        'Authorization': `Bearer ${session?.token}`,
      },
    })
    return response.json()
  }

  return { fetchDocuments }
}
```

## TODO
- [ ] Create centralized API client with axios
- [ ] Implement request/response interceptors
- [ ] Add retry logic for failed requests
- [ ] Implement request caching with React Query
- [ ] Add request timeout handling
- [ ] Create API documentation with Swagger/OpenAPI

# API Testing Guide

## Quick Start

### 1. Start Development Server

```bash
cd apps/backend
pnpm dev
```

Server akan berjalan di `http://localhost:4000`

### 2. Health Check

```bash
curl http://localhost:4000/health
```

Response:
```json
{
  "status": "ok",
  "timestamp": "2026-05-23T19:43:49.889Z",
  "uptime": 123.456,
  "database": "connected"
}
```

## Authentication Flow

### Register User

```bash
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePassword123!",
    "fullName": "John Doe"
  }'
```

Response:
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "fullName": "John Doe",
    "role": "user",
    "createdAt": "2026-05-23T19:43:49.889Z"
  },
  "message": "User registered successfully",
  "timestamp": "2026-05-23T19:43:49.889Z"
}
```

### Login User

```bash
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePassword123!"
  }'
```

Response:
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "fullName": "John Doe",
      "role": "user"
    }
  },
  "message": "Login successful",
  "timestamp": "2026-05-23T19:43:49.889Z"
}
```

### Get Current User Profile

```bash
curl -X GET http://localhost:4000/api/auth/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## Document Operations

### Upload Document

```bash
curl -X POST http://localhost:4000/api/documents/upload \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -F "file=@document.pdf" \
  -F "title=My Document"
```

### Get User's Documents

```bash
curl -X GET "http://localhost:4000/api/documents?page=1&limit=10" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Get Document Statistics

```bash
curl -X GET http://localhost:4000/api/documents/statistics \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## Signature Operations

### Create Signature

```bash
curl -X POST http://localhost:4000/api/signatures \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "signatureData": "data:image/png;base64,iVBORw0KGgo..."
  }'
```

### Get User's Signature

```bash
curl -X GET http://localhost:4000/api/signatures/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Sign Document

```bash
curl -X POST http://localhost:4000/api/documents/:documentId/sign \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "signatureId": "signature-uuid",
    "positionX": 100,
    "positionY": 200,
    "pageNumber": 1
  }'
```

## Using Postman

1. Import the API collection from `POSTMAN_COLLECTION.json`
2. Set environment variables:
   - `base_url`: http://localhost:4000
   - `access_token`: Your JWT token from login
3. Run requests from the collection

## Common Errors

### 401 Unauthorized
- Missing or invalid access token
- Token has expired
- Use refresh token to get new access token

### 400 Bad Request
- Invalid request body
- Missing required fields
- Invalid file format

### 403 Forbidden
- Insufficient permissions
- Trying to access another user's resource

### 404 Not Found
- Resource doesn't exist
- Invalid resource ID

## Response Format

All responses follow this format:

**Success:**
```json
{
  "success": true,
  "data": {},
  "message": "Success message",
  "timestamp": "2026-05-23T19:43:49.889Z"
}
```

**Error:**
```json
{
  "success": false,
  "message": "Error message",
  "error": "ERROR_CODE",
  "timestamp": "2026-05-23T19:43:49.889Z"
}
```

## Debugging

### Enable Debug Logging

Set environment variable:
```bash
LOG_LEVEL=debug
```

### View Database

```bash
pnpm prisma:studio
```

Opens Prisma Studio at `http://localhost:5555`

### Check Logs

Logs are saved in:
- `logs/error.log` - Error logs
- `logs/combined.log` - All logs

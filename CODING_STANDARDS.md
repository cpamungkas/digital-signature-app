# Digital Signature App - Coding Standards

## Overview
This document defines the coding standards and conventions for the Digital Signature App project. All team members must follow these guidelines to ensure consistency, maintainability, and quality.

## TypeScript Configuration

### Strict Mode
All TypeScript code must use strict mode:
```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "noImplicitThis": true,
    "alwaysStrict": true
  }
}
```

### File Naming
- **Components**: `PascalCase.tsx`
- **Hooks**: `usePascalCase.ts` or `usePascalCase.tsx`
- **Utils**: `camelCase.ts`
- **Types**: `PascalCase.ts` or `PascalCase.interface.ts`
- **Styles**: `camelCase.css` or `camelCase.module.css`

## Backend Standards (Node.js + Express)

### Code Style
- Use TypeScript with strict mode
- Follow ESLint + Prettier rules
- Use async/await, no callbacks
- Proper error handling with try-catch

### File Structure
```
src/
├── controllers/     # Request handlers
├── routes/          # Route definitions
├── middlewares/     # Custom middleware
├── services/        # Business logic
├── models/          # Database models (Prisma)
├── utils/           # Utility functions
├── types/           # TypeScript types
└── index.ts         # Entry point
```

### Controller Pattern
```typescript
// src/controllers/auth.controller.ts
import { Request, Response, NextFunction } from 'express';

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password } = req.body;
    
    // Business logic
    const user = await prisma.user.findUnique({ where: { email } });
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Success response
    res.status(200).json({ message: 'Login successful', user });
  } catch (error) {
    next(error);
  }
};
```

### Error Handling
```typescript
// src/middlewares/error.middleware.ts
import { Request, Response, NextFunction, ErrorRequestHandler } from 'express';

export const errorHandler: ErrorRequestHandler = (
  err,
  req,
  res,
  next
) => {
  const statusCode = err.statusCode || 500;
  
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};
```

### Database Queries (Prisma)
```typescript
// Always use async/await
const user = await prisma.user.findUnique({
  where: { id: userId },
  select: {
    id: true,
    email: true,
    fullName: true,
    role: true,
  },
});

// Use transactions for multi-step operations
const result = await prisma.$transaction([
  prisma.user.update({ ... }),
  prisma.auditLog.create({ ... }),
]);
```

### Validation
```typescript
// Use Zod for validation
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

try {
  const { email, password } = loginSchema.parse(req.body);
  // Process validated data
} catch (error) {
  return res.status(400).json({ error: error.errors });
}
```

## Frontend Standards (Next.js 14)

### Code Style
- Use TypeScript with strict mode
- Follow ESLint + Prettier rules
- Use Server Components by default
- Client Components only when needed (interactivity, hooks)

### File Structure
```
src/
├── app/             # App Router pages
│   ├── (auth)/      # Auth routes
│   ├── (dashboard)/ # Protected routes
│   └── layout.tsx
├── components/      # Reusable components
│   ├── ui/          # Base UI components
│   └── features/    # Feature-specific components
├── lib/             # Utilities, API client
├── hooks/           # Custom hooks
├── types/           # TypeScript types
└── styles/          # Global styles
```

### Component Pattern
```typescript
// src/components/features/SignatureCanvas.tsx
'use client';

import { useState, useRef } from 'react';
import SignatureCanvas from 'react-signature-canvas';

interface SignatureCanvasProps {
  onSignatureComplete: (data: string) => void;
}

export default function SignatureCanvas({ 
  onSignatureComplete 
}: SignatureCanvasProps) {
  const sigCanvas = useRef<SignatureCanvas>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  const clear = () => {
    if (sigCanvas.current) {
      sigCanvas.current.clear();
    }
  };

  const handleEnd = () => {
    if (sigCanvas.current) {
      const data = sigCanvas.current.toDataURL();
      onSignatureComplete(data);
    }
  };

  return (
    <div className="signature-canvas">
      <SignatureCanvas
        ref={sigCanvas}
        onBegin={() => setIsDrawing(true)}
        onEnd={handleEnd}
        canvasProps={{ className: 'w-full h-64 border rounded' }}
      />
      <button onClick={clear}>Clear</button>
    </div>
  );
}
```

### API Client
```typescript
// src/lib/api.ts
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
```

### Form Handling
```typescript
// src/app/signature/create/page.tsx
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const signatureSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  description: z.string().optional(),
});

type SignatureFormData = z.infer<typeof signatureSchema>;

export default function CreateSignaturePage() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignatureFormData>({
    resolver: zodResolver(signatureSchema),
  });

  const onSubmit = async (data: SignatureFormData) => {
    try {
      // Submit form data
    } catch (error) {
      // Handle error
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input
        {...register('name')}
        placeholder="Signature name"
      />
      {errors.name && <p>{errors.name.message}</p>}
      
      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Saving...' : 'Save'}
      </button>
    </form>
  );
}
```

### State Management
```typescript
// src/lib/store/useAuthStore.ts
import { create } from 'zustand';

interface User {
  id: string;
  email: string;
  fullName: string;
  role: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  token: string | null;
  login: (user: User, token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  token: null,
  login: (user, token) => set({ user, isAuthenticated: true, token }),
  logout: () => set({ user: null, isAuthenticated: false, token: null }),
}));
```

## Shared Types

### Type Definitions
```typescript
// packages/types/src/index.ts
export interface User {
  id: string;
  email: string;
  fullName: string;
  role: 'admin' | 'user';
  createdAt: string;
  updatedAt: string;
}

export interface Document {
  id: string;
  title: string;
  description?: string;
  fileUrl: string;
  status: 'pending' | 'signed' | 'rejected';
  uploadedBy: string;
  signedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Signature {
  id: string;
  userId: string;
  signatureData: string;
  signatureHash: string;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  action: string;
  resourceType: string;
  resourceId: string;
  ipAddress: string;
  userAgent: string;
  createdAt: string;
}
```

## Security Standards

### Authentication
- Use JWT for API authentication
- Store refresh tokens in HTTP-only cookies
- Store access tokens in memory or secure storage
- Implement token refresh mechanism

### Authorization
- Implement RBAC (Role-Based Access Control)
- Validate user permissions on every request
- Use middleware for route protection

### Input Validation
- Validate all inputs with Zod schemas
- Sanitize user inputs
- Prevent SQL injection (use Prisma)
- Prevent XSS (escape user inputs)

### File Upload
- Validate file type (PDF only)
- Limit file size (10MB max)
- Generate unique filenames (UUID)
- Scan for malware (optional)

## Testing Standards

### Backend Testing
```typescript
// tests/auth.test.ts
import request from 'supertest';
import app from '../src/app';

describe('POST /api/auth/login', () => {
  it('should login user with valid credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@example.com',
        password: 'password123',
      });
    
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('token');
  });
});
```

### Frontend Testing
```typescript
// tests/SignatureCanvas.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import SignatureCanvas from '../components/SignatureCanvas';

test('clears signature when clear button is clicked', () => {
  render(<SignatureCanvas onSignatureComplete={() => {}} />);
  
  const clearButton = screen.getByText('Clear');
  fireEvent.click(clearButton);
  
  // Assert canvas is cleared
});
```

## Documentation Standards

### JSDoc Comments
```typescript
/**
 * Creates a new user in the database
 * @param email - User's email address
 * @param password - User's password (will be hashed)
 * @param fullName - User's full name
 * @returns Created user object
 * @throws {Error} If user already exists
 */
export const createUser = async (
  email: string,
  password: string,
  fullName: string
): Promise<User> => {
  // Implementation
};
```

### API Documentation
- Document all endpoints in OpenAPI/Swagger format
- Include request/response examples
- Document error responses
- Specify authentication requirements

## Performance Standards

### Backend
- Use database indexes for frequently queried fields
- Implement pagination for list endpoints
- Use caching for expensive operations
- Monitor query performance

### Frontend
- Use Server Components by default
- Implement lazy loading for heavy components
- Optimize images (use next/image)
- Implement proper loading states

## Accessibility Standards

### WCAG 2.1 Level AA
- Use semantic HTML
- Add ARIA labels where needed
- Ensure keyboard navigation works
- Provide sufficient color contrast
- Support screen readers

## Code Review Checklist

- [ ] Code follows project conventions
- [ ] TypeScript types are correct
- [ ] Error handling is implemented
- [ ] Input validation is in place
- [ ] Tests are included
- [ ] Documentation is updated
- [ ] No security vulnerabilities
- [ ] Performance is acceptable
- [ ] Accessibility requirements met

## Support
For questions about coding standards, contact:
- **Backend**: Riko (@backend_dev)
- **Frontend**: Naya (@frontend_dev)
- **Lead**: Dimas (@dev_fullstack)

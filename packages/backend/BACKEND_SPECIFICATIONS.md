# Backend Specifications - Digital Signature App

## Tech Stack

| Component | Technology |
|-----------|------------|
| Runtime | Node.js 20.x LTS |
| Framework | Express.js 4.x |
| Language | TypeScript 5.x |
| Database | PostgreSQL (Supabase) |
| ORM | Prisma 5.x |
| Authentication | JWT + Refresh Tokens |
| File Storage | Cloudinary |
| Email Service | Resend |
| Validation | Zod |
| Logging | Winston |

## Project Structure

```
apps/backend/
├── src/
│   ├── controllers/      # Request handlers
│   ├── routes/          # API routes
│   ├── services/        # Business logic
│   ├── models/          # Database models (Prisma)
│   ├── types/           # TypeScript types
│   ├── utils/           # Utility functions
│   ├── middlewares/     # Express middleware
│   └── index.ts         # Entry point
├── prisma/
│   ├── schema.prisma    # Database schema
│   └── migrations/      # Database migrations
├── .env                 # Environment variables
├── package.json
└── tsconfig.json
```

## API Endpoints

### Authentication (`/api/auth`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/register` | Register new user | No |
| POST | `/login` | Login user | No |
| POST | `/refresh` | Refresh access token | No |
| POST | `/logout` | Logout user | Yes |
| GET | `/me` | Get current user profile | Yes |
| PUT | `/me` | Update user profile | Yes |
| PUT | `/me/password` | Change password | Yes |

### Documents (`/api/documents`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/upload` | Upload new document | Yes |
| GET | `/` | Get user's documents | Yes |
| GET | `/statistics` | Get document statistics | Yes |
| GET | `/:id` | Get document by ID | Yes |
| DELETE | `/:id` | Delete document | Yes |
| POST | `/:id/sign` | Sign a document | Yes |
| GET | `/:id/signatures` | Get document signatures | Yes |

### Signatures (`/api/signatures`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/` | Create user signature | Yes |
| GET | `/me` | Get current user's signature | Yes |
| DELETE | `/:id` | Delete signature | Yes |
| GET | `/:signatureId/verify/:documentId` | Verify signature | No |

## Database Schema

### Tables

1. **users**
   - id (UUID, Primary Key)
   - email (String, Unique)
   - password_hash (String)
   - full_name (String)
   - role (Enum: ADMIN, USER)
   - is_active (Boolean)
   - created_at (DateTime)
   - updated_at (DateTime)

2. **documents**
   - id (UUID, Primary Key)
   - user_id (UUID, Foreign Key)
   - file_name (String)
   - file_path (String - Cloudinary URL)
   - file_hash (String - SHA-256)
   - file_size (Integer)
   - mime_type (String)
   - status (Enum: UNSIGNED, SIGNED, ARCHIVED)
   - created_at (DateTime)
   - updated_at (DateTime)

3. **signatures**
   - id (UUID, Primary Key)
   - user_id (UUID, Foreign Key)
   - signature_data (String - Cloudinary URL)
   - signature_hash (String - SHA-256)
   - created_at (DateTime)

4. **document_signatures**
   - id (UUID, Primary Key)
   - document_id (UUID, Foreign Key)
   - signature_id (UUID, Foreign Key)
   - position_x (Integer)
   - position_y (Integer)
   - page_number (Integer)
   - signed_at (DateTime)

5. **audit_logs**
   - id (UUID, Primary Key)
   - user_id (UUID, Foreign Key)
   - action (String)
   - resource_type (String)
   - resource_id (String)
   - details (JSON)
   - ip_address (String)
   - user_agent (String)
   - created_at (DateTime)

## Authentication Flow

```
1. User registers/login → Receive access + refresh tokens
2. Access token used for API requests (expires in 15 min)
3. When access token expires → Use refresh token to get new access token
4. Refresh token valid for 7 days
5. Logout → Token invalidated (audit log created)
```

## Security Features

- ✅ Password hashing with bcrypt (10 rounds)
- ✅ JWT access tokens (15 min expiry)
- ✅ Refresh tokens (7 days expiry)
- ✅ Role-based access control (RBAC)
- ✅ Input validation with Zod
- ✅ SQL injection protection (Prisma)
- ✅ XSS protection (helmet.js)
- ✅ Rate limiting
- ✅ Audit logging
- ✅ File upload validation

## Environment Variables

```env
# Database
DATABASE_URL=postgresql://...

# JWT
JWT_SECRET=your-secret-key
JWT_REFRESH_SECRET=your-refresh-secret
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Resend
RESEND_API_KEY=re_...

# Server
PORT=4000
NODE_ENV=development

# Frontend URL
FRONTEND_URL=http://localhost:3000

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

## Development Setup

```bash
# Install dependencies
pnpm install

# Setup environment
cp .env.example .env
# Update .env with your credentials

# Run migrations
pnpm prisma:migrate

# Generate Prisma client
pnpm prisma:generate

# Seed database (optional)
pnpm prisma:seed

# Start development server
pnpm dev
```

## Testing

```bash
# Run tests
pnpm test

# Run linter
pnpm lint

# Build
pnpm build
```

## Deployment Checklist

- [ ] Update DATABASE_URL for production
- [ ] Set NODE_ENV=production
- [ ] Update JWT secrets for production
- [ ] Configure Cloudinary credentials
- [ ] Configure Resend API key
- [ ] Set up SSL/HTTPS
- [ ] Configure CORS for production domain
- [ ] Set up monitoring (Sentry, etc.)
- [ ] Configure backup strategy
- [ ] Set up CI/CD pipeline

## Support

For questions or issues, contact:
- Backend Developer: Riko (backend_dev)
- Fullstack Lead: Dimas (dev_fullstack)

# Database Configuration Guide

## Supabase Setup

### 1. Get Supabase Connection String

Login ke Supabase dengan credentials:
- Email: aliejosh@yahoo.com
- Password: Jakarta2008@!

### 2. Get Database Connection String

1. Go to Project Settings > Database
2. Copy the Connection String (URI format)
3. Replace `[YOUR-PASSWORD]` with your database password

Example format:
```
postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres
```

### 3. Update .env File

Update the DATABASE_URL in your `.env` file:

```env
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres
```

### 4. Test Connection

Run the following command to test the connection:

```bash
cd apps/backend
npx prisma db pull
```

If successful, you should see the database schema.

## Local Development (Alternative)

If you want to use local PostgreSQL:

```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/digital_signature?schema=public
```

### Setup Local PostgreSQL

1. Install PostgreSQL 15+
2. Create database:
```sql
CREATE DATABASE digital_signature;
```

3. Run migrations:
```bash
npx prisma migrate dev
```

## Environment Variables Template

Copy this to your `.env` file:

```env
# Database
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_REFRESH_SECRET=your-super-secret-refresh-token-key-change-in-production
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Resend
RESEND_API_KEY=re_123456789_secret_key

# Server
PORT=4000
NODE_ENV=development

# Frontend URL
FRONTEND_URL=http://localhost:3000

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Logging
LOG_LEVEL=info
```

## Troubleshooting

### Connection Timeout
- Check if your IP is whitelisted in Supabase
- Verify the connection string format

### Authentication Failed
- Verify the database password
- Check if the user has proper permissions

### SSL Error
Add `?sslmode=require` to the connection string:
```
postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres?sslmode=require
```

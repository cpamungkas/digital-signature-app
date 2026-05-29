# Digital Signature App

A full-stack digital signature application built with Next.js, Express, and PostgreSQL.

## Tech Stack

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript 5.x
- **Styling**: Tailwind CSS 3.x
- **State Management**: Zustand
- **Form Handling**: React Hook Form + Zod
- **Auth**: NextAuth.js
- **Hosting**: Cloudflare Pages

### Backend
- **Runtime**: Node.js 20.x LTS
- **Framework**: Express.js 4.x
- **Language**: TypeScript
- **Database**: PostgreSQL 15+ (Supabase)
- **ORM**: Prisma
- **Authentication**: JWT + Refresh Tokens
- **File Storage**: Cloudinary
- **Email**: Resend
- **Hosting**: Railway

## Project Structure

```
digital-signature-app/
├── apps/
│   ├── frontend/          # Next.js application
│   └── backend/           # Express API
├── packages/
│   ├── types/            # Shared TypeScript types
│   ├── config/           # Shared configurations
│   └── utils/            # Shared utilities
└── package.json          # Root workspace config
```

## Getting Started

### Prerequisites
- Node.js 20.x or higher
- pnpm 8.x or higher
- PostgreSQL 15+ (or Supabase account)

### Installation

```bash
# Install dependencies
pnpm install

# Setup environment variables
cp apps/backend/.env.example apps/backend/.env
cp apps/frontend/.env.example apps/frontend/.env

# Run database migrations
cd apps/backend
pnpm prisma migrate dev

# Start development servers
pnpm dev
```

### Development

```bash
# Run all apps in development mode
pnpm dev

# Run specific app
pnpm --filter frontend dev
pnpm --filter backend dev

# Build all apps
pnpm build

# Run tests
pnpm test

# Lint code
pnpm lint

# Format code
pnpm format
```

## Environment Variables

### Backend (.env)
```
DATABASE_URL=postgresql://...
JWT_SECRET=your-secret-key
JWT_REFRESH_SECRET=your-refresh-secret
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
RESEND_API_KEY=your-resend-key
```

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret
```

## Features

- ✅ User authentication and authorization
- ✅ Document upload and management
- ✅ Digital signature creation
- ✅ Document signing with signature placement
- ✅ Signature verification
- ✅ Audit trail logging
- ✅ Role-based access control (Admin, User)
- ✅ Responsive UI with Tailwind CSS

## Team

- **Fullstack Lead**: Dimas (dev_fullstack)
- **Backend Developer**: Riko (backend_dev)
- **Frontend Developer**: Naya (frontend_dev)
- **DevOps Engineer**: Dewo (devops_agent)
- **Supervisor**: Siwa (siwa_agent)

## License

MIT

# Digital Signature App - Environment Setup

## Infrastructure Credentials

### GitHub Repository
- **URL**: https://github.com/cpamungkas/digital-signature-app
- **Login**: aliejosh@yahoo.com
- **Password**: Jakarta2008@!

### Slack Channel
- **Workspace**: https://evothegenerals.slack.com/
- **Channel**: #digital-signature-app
- **Link**: https://app.slack.com/client/T0B5T33MKEE/C0B5WMH6VMJ

### Third-Party Services
All services use the same credentials:
- **Email**: aliejosh@yahoo.com
- **Password**: Jakarta2008@!

**Services:**
- Supabase (Database + Storage)
- Cloudinary (File Storage)
- Vercel (Frontend Hosting)
- Upstash (Redis Cache)
- Resend (Email Service)

---

## Backend Environment Variables

Create `apps/backend/.env` file:

```env
# Server Configuration
PORT=3001
NODE_ENV=development

# Database (Supabase)
DATABASE_URL="postgresql://postgres:[password]@[host]:5432/postgres"

# JWT Configuration
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
JWT_REFRESH_SECRET="your-refresh-secret-key-change-this-in-production"
ACCESS_TOKEN_EXPIRY="15m"
REFRESH_TOKEN_EXPIRY="7d"

# Cloudinary (File Storage)
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"

# Resend (Email Service)
RESEND_API_KEY="your-resend-api-key"
FROM_EMAIL="noreply@yourdomain.com"

# CORS Configuration
FRONTEND_URL="http://localhost:3000"
```

---

## Frontend Environment Variables

Create `apps/frontend/.env.local` file:

```env
# Next.js Configuration
NEXT_PUBLIC_API_URL="http://localhost:3001/api"
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# NextAuth.js
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-nextauth-secret-change-this-in-production"

# Supabase
NEXT_PUBLIC_SUPABASE_URL="your-supabase-project-url"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-supabase-anon-key"
```

---

## Quick Start

### 1. Clone Repository
```bash
git clone https://github.com/cpamungkas/digital-signature-app.git
cd digital-signature-app
```

### 2. Install Dependencies
```bash
# Install pnpm globally
npm install -g pnpm

# Install all dependencies
pnpm install
```

### 3. Setup Environment Variables
```bash
# Backend
cd apps/backend
cp .env.example .env
# Edit .env with your credentials

# Frontend
cd apps/frontend
cp .env.local.example .env.local
# Edit .env.local with your credentials
```

### 4. Setup Database
```bash
cd apps/backend
pnpm prisma db push
pnpm prisma generate
```

### 5. Start Development Servers
```bash
# Terminal 1: Backend
cd apps/backend
pnpm dev

# Terminal 2: Frontend
cd apps/frontend
pnpm dev
```

### 6. Verify Setup
- Backend: http://localhost:3001/health
- Frontend: http://localhost:3000

---

## Team Communication

### Daily Standup
- **Time**: 10:00 AM WIB
- **Channel**: Slack #digital-signature-app
- **Format**: What did you do? What will you do? Any blockers?

### Weekly Sync
- **Time**: Monday 2:00 PM WIB
- **Location**: Google Meet
- **Agenda**: Sprint review, planning, retrospective

### Code Review
- **Platform**: GitHub Pull Requests
- **Reviewer**: Dimas (dev_fullstack)
- **Requirement**: 1 approval before merge

---

## Support

### Technical Issues
- **Slack**: #digital-signature-app
- **GitHub**: Create an issue
- **Email**: aliejosh@yahoo.com

### Team Contacts
- **Fullstack Lead**: Dimas (@dev_fullstack)
- **Backend Dev**: Riko (@backend_dev)
- **Frontend Dev**: Naya (@frontend_dev)
- **DevOps**: Dewo (@devops_agent)
- **Supervisor**: Siwa (@siwa_agent)

---

**Last Updated**: May 23, 2026  
**Status**: Ready for Development

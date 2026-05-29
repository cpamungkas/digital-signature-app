# Digital Signature App - Development Setup Guide

## Prerequisites

### System Requirements
- Node.js 20.x LTS or higher
- pnpm 8.x or higher
- Git 2.x or higher
- PostgreSQL 15+ (or Supabase account)

### Recommended Tools
- VS Code with extensions:
  - ESLint
  - Prettier
  - Prisma
  - Tailwind CSS IntelliSense
  - Thunder Client (API testing)
- Docker (optional, for local database)
- Git GUI (SourceTree, GitKraken, etc.)

## Local Development Setup

### 1. Clone Repository
```bash
git clone <repository-url>
cd digital-signature-app
```

### 2. Install Dependencies
```bash
# Install pnpm globally if not installed
npm install -g pnpm

# Install all workspace dependencies
pnpm install
```

### 3. Environment Setup

#### Backend (.env)
```bash
cd apps/backend
cp .env.example .env
```

Edit `.env` with your configuration:
```env
# Server
PORT=3001
NODE_ENV=development

# Database (Supabase)
DATABASE_URL="postgresql://postgres:[password]@[host]:5432/postgres"

# JWT
JWT_SECRET="your-super-secret-jwt-key-change-this"
JWT_REFRESH_SECRET="your-refresh-secret-key-change-this"
ACCESS_TOKEN_EXPIRY="15m"
REFRESH_TOKEN_EXPIRY="7d"

# File Storage (Cloudinary)
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"

# Email (Resend)
RESEND_API_KEY="your-resend-api-key"
FROM_EMAIL="noreply@yourdomain.com"

# CORS
FRONTEND_URL="http://localhost:3000"
```

#### Frontend (.env.local)
```bash
cd apps/frontend
cp .env.local.example .env.local
```

Edit `.env.local`:
```env
# Next.js
NEXT_PUBLIC_API_URL="http://localhost:3001/api"
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# NextAuth.js
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-nextauth-secret-change-this"

# Supabase
NEXT_PUBLIC_SUPABASE_URL="your-supabase-project-url"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-supabase-anon-key"
```

### 4. Database Setup

#### Option A: Supabase (Recommended)
1. Create account at [supabase.com](https://supabase.com)
2. Create new project
3. Run Prisma migrations:
```bash
cd apps/backend
pnpm prisma db push
```

#### Option B: Local PostgreSQL
```bash
# Start PostgreSQL with Docker
docker run --name postgres-ds -e POSTGRES_PASSWORD=password -p 5432:5432 -d postgres:15

# Run migrations
cd apps/backend
pnpm prisma db push
```

### 5. Start Development Servers

#### Terminal 1: Backend
```bash
cd apps/backend
pnpm dev
```
Server runs at: http://localhost:3001

#### Terminal 2: Frontend
```bash
cd apps/frontend
pnpm dev
```
App runs at: http://localhost:3000

### 6. Verify Setup
1. Open http://localhost:3001/health - Should return "OK"
2. Open http://localhost:3000 - Should show Next.js app
3. Check API docs at http://localhost:3001/api-docs

## Development Workflow

### Git Workflow
```bash
# Create feature branch
git checkout -b feature/description

# Make changes and commit
git add .
git commit -m "type(scope): description"

# Push to remote
git push -u origin feature/description

# Create Pull Request on GitHub
```

### Commit Message Convention
```
type(scope): description

Types:
- feat: New feature
- fix: Bug fix
- docs: Documentation
- style: Code style (formatting, etc.)
- refactor: Code refactoring
- test: Adding tests
- chore: Maintenance tasks

Examples:
feat(auth): add JWT authentication
fix(api): resolve CORS issue
docs(readme): update installation guide
```

### Code Quality
```bash
# Run linting
pnpm lint

# Run type checking
pnpm type-check

# Run tests
pnpm test

# Run all checks
pnpm check
```

## Troubleshooting

### Common Issues

#### 1. Port Already in Use
```bash
# Find process using port
lsof -i :3000
lsof -i :3001

# Kill process
kill -9 <PID>
```

#### 2. Database Connection Issues
- Verify DATABASE_URL in .env
- Check if PostgreSQL is running
- Ensure Supabase project is active

#### 3. pnpm Issues
```bash
# Clear pnpm cache
pnpm store prune

# Reinstall dependencies
rm -rf node_modules
pnpm install
```

#### 4. TypeScript Errors
```bash
# Clear TypeScript cache
rm -rf apps/frontend/.next
rm -rf apps/backend/dist

# Rebuild
pnpm build
```

## Useful Commands

### Backend
```bash
# Generate Prisma client
pnpm prisma generate

# Run migrations
pnpm prisma migrate dev

# Reset database
pnpm prisma migrate reset

# Open Prisma Studio
pnpm prisma studio
```

### Frontend
```bash
# Build for production
pnpm build

# Run production server
pnpm start

# Analyze bundle size
pnpm analyze
```

### Monorepo
```bash
# Run command in all packages
pnpm -r <command>

# Run command in specific package
pnpm --filter <package-name> <command>

# Examples:
pnpm -r lint
pnpm --filter backend test
pnpm --filter frontend build
```

## IDE Configuration

### VS Code Settings (.vscode/settings.json)
```json
{
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.preferences.importModuleSpecifier": "relative",
  "files.exclude": {
    "**/node_modules": true,
    "**/.next": true,
    "**/dist": true
  }
}
```

### Recommended Extensions
- ESLint
- Prettier
- Prisma
- Tailwind CSS IntelliSense
- Thunder Client
- GitLens
- Error Lens

## Team Collaboration

### Code Review Checklist
- [ ] Code follows project conventions
- [ ] Tests are included
- [ ] Documentation is updated
- [ ] No security vulnerabilities
- [ ] Performance considerations addressed
- [ ] Accessibility requirements met

### Communication Channels
- **Slack**: #digital-signature-app
- **GitHub**: Issues and PRs
- **Daily Standup**: 10:00 AM WIB
- **Weekly Sync**: Monday 2:00 PM WIB

## Support
For technical issues, contact:
- **Backend**: Riko (@backend_dev)
- **Frontend**: Naya (@frontend_dev)
- **DevOps**: Dewo (@devops_agent)
- **Lead**: Dimas (@dev_fullstack)
- **Supervisor**: Siwa (@siwa_agent)

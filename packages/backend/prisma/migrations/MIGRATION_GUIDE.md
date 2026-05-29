# Prisma Migration Guide

## Setup Database

### Option 1: Using Supabase (Recommended)

1. Update `.env` file with your Supabase connection string:
```env
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres
```

2. Run migration:
```bash
cd apps/backend
npx prisma migrate dev --name init
```

### Option 2: Using Local PostgreSQL

1. Create local database:
```sql
CREATE DATABASE digital_signature;
```

2. Update `.env`:
```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/digital_signature?schema=public
```

3. Run migration:
```bash
cd apps/backend
npx prisma migrate dev --name init
```

## Available Commands

### Generate Prisma Client
```bash
npx prisma generate
```

### Create Migration
```bash
npx prisma migrate dev --name [migration_name]
```

### Reset Database
```bash
npx prisma migrate reset
```

### Open Prisma Studio
```bash
npx prisma studio
```

### Seed Database
```bash
npx prisma db seed
```

## Troubleshooting

### Migration Fails
- Check database connection string
- Verify database permissions
- Check if database exists

### Prisma Client Not Generated
```bash
npx prisma generate
```

### Connection Issues
- Verify DATABASE_URL is correct
- Check if database server is running
- Verify network connectivity

## Schema Overview

The database consists of 5 main tables:

1. **users** - User accounts
2. **documents** - Uploaded documents
3. **signatures** - User signatures
4. **document_signatures** - Junction table for documents and signatures
5. **audit_logs** - System audit trail

## Next Steps

After successful migration:
1. Run seed script to populate test data
2. Start the development server
3. Test the API endpoints

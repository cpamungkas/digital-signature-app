import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../src/utils/auth';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Create admin user
  const adminPasswordHash = await hashPassword('Admin123!');
  const admin = await prisma.user.upsert({
    where: { email: 'admin@digitalsignature.app' },
    update: {},
    create: {
      email: 'admin@digitalsignature.app',
      passwordHash: adminPasswordHash,
      fullName: 'Admin User',
      role: 'ADMIN',
      isActive: true
    }
  });
  console.log('✅ Admin user created:', admin.email);

  // Create regular user
  const userPasswordHash = await hashPassword('User123!');
  const user = await prisma.user.upsert({
    where: { email: 'user@digitalsignature.app' },
    update: {},
    create: {
      email: 'user@digitalsignature.app',
      passwordHash: userPasswordHash,
      fullName: 'Regular User',
      role: 'USER',
      isActive: true
    }
  });
  console.log('✅ Regular user created:', user.email);

  // Create second user
  const user2PasswordHash = await hashPassword('Test123!');
  const user2 = await prisma.user.upsert({
    where: { email: 'test@digitalsignature.app' },
    update: {},
    create: {
      email: 'test@digitalsignature.app',
      passwordHash: user2PasswordHash,
      fullName: 'Test User',
      role: 'USER',
      isActive: true
    }
  });
  console.log('✅ Test user created:', user2.email);

  // Create audit logs for demo
  const auditLogs = [
    {
      userId: admin.id,
      action: 'LOGIN',
      resourceType: 'USER',
      resourceId: admin.id,
      details: { method: 'email' }
    },
    {
      userId: user.id,
      action: 'LOGIN',
      resourceType: 'USER',
      resourceId: user.id,
      details: { method: 'email' }
    },
    {
      userId: user.id,
      action: 'CREATE_SIGNATURE',
      resourceType: 'SIGNATURE',
      resourceId: 'demo-signature-1',
      details: { method: 'draw' }
    }
  ];

  for (const log of auditLogs) {
    await prisma.auditLog.create({
      data: log
    });
  }
  console.log('✅ Audit logs created');

  console.log('\n🌱 Database seeding completed!');
  console.log('\n📋 Demo Credentials:');
  console.log('  Admin: admin@digitalsignature.app / Admin123!');
  console.log('  User:  user@digitalsignature.app / User123!');
  console.log('  Test:  test@digitalsignature.app / Test123!');
}

main()
  .catch(e => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

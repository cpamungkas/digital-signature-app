const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');
  const passwordHash = await bcrypt.hash('password123', 12);

  const users = await Promise.all([
    prisma.user.upsert({ where: { email: 'admin@digitalsign.app' }, update: {}, create: { email: 'admin@digitalsign.app', name: 'Admin User', passwordHash, role: 'ADMIN', emailVerified: true } }),
    prisma.user.upsert({ where: { email: 'user@digitalsign.app' }, update: {}, create: { email: 'user@digitalsign.app', name: 'Demo User', passwordHash, role: 'USER', emailVerified: true } }),
    prisma.user.upsert({ where: { email: 'test@digitalsign.app' }, update: {}, create: { email: 'test@digitalsign.app', name: 'Test User', passwordHash, role: 'USER', emailVerified: true } }),
  ]);
  console.log(`✅ Created ${users.length} demo users`);

  const doc = await prisma.document.create({ data: { title: 'Welcome Document', content: 'This is a sample document for testing digital signatures.', userId: users[1].id, status: 'PENDING', hash: 'sample_hash_123' } });
  console.log(`✅ Created sample document: ${doc.title}`);

  await prisma.documentSignatory.create({ data: { documentId: doc.id, email: 'signer@example.com', name: 'External Signer', token: require('crypto').randomBytes(32).toString('hex') } });
  console.log('✅ Created signatory invite');
  console.log('🎉 Seeding complete!');
}

main().catch(e => { console.error('❌ Seed failed:', e); process.exit(1); }).finally(async () => { await prisma.$disconnect(); });

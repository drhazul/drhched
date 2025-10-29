import { PrismaClient, UserRole } from '@prisma/client';
import * as crypto from 'crypto';

const prisma = new PrismaClient();
const hash = (pwd: string) => crypto.createHash('sha256').update(pwd).digest('hex');

async function main() {
  const company = await prisma.company.upsert({
    where: { id: 'seed-company' },
    update: {},
    create: { id: 'seed-company', name: 'Empresa Demo' },
  });

  const branch = await prisma.branch.upsert({
    where: { id: 'seed-branch' },
    update: {},
    create: { id: 'seed-branch', name: 'Sucursal Demo', companyId: company.id },
  });

  await prisma.user.upsert({
    where: { email: 'admin@demo.local' },
    update: {},
    create: {
      email: 'admin@demo.local',
      password: hash('Admin123!'),
      role: UserRole.ADMIN,
      companyId: company.id,
      branchId: branch.id,
    },
  });

  console.log('✅ Seed listo: Empresa Demo, Sucursal Demo, Usuario admin@demo.local / Admin123!');
}

main()
  .then(async () => { await prisma.$disconnect(); })
  .catch(async (e) => { console.error(e); await prisma.$disconnect(); process.exit(1); });

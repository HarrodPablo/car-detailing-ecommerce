const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const email = await prisma.setting.findFirst({where: {key: 'admin_email'}});
  const pass = await prisma.setting.findFirst({where: {key: 'admin_password'}});
  console.log('Email:', email);
  console.log('Pass:', pass);
}

check()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

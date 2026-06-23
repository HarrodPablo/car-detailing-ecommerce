const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

async function update() {
  const hash = await bcrypt.hash('admin123', 10);
  await prisma.setting.update({
    where: {key: 'admin_password'},
    data: {value: hash}
  });
  console.log('Updated to admin123');
}

update()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

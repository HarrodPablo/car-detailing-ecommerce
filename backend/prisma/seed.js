const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

async function main() {
  console.log('Iniciando seed...');

  // Credenciales admin
  const hashedPassword = await bcrypt.hash('admin123', 10);
  await prisma.setting.upsert({
    where: { key: 'admin_email' },
    update: {},
    create: { key: 'admin_email', value: 'admin@goodshop.com' }
  });
  await prisma.setting.upsert({
    where: { key: 'admin_password' },
    update: {},
    create: { key: 'admin_password', value: hashedPassword }
  });

  // Config WhatsApp
  await prisma.setting.upsert({
    where: { key: 'whatsapp_number' },
    update: {},
    create: { key: 'whatsapp_number', value: '5493814000000' }
  });
  await prisma.setting.upsert({
    where: { key: 'tienda_nombre' },
    update: {},
    create: { key: 'tienda_nombre', value: 'Good Shop' }
  });

  // Marcas
  const marcas = [
    { name: 'Chemical Guys', slug: 'chemical-guys', country: 'USA' },
    { name: 'Koch Chemie', slug: 'koch-chemie', country: 'Alemania' },
    { name: 'Sonax', slug: 'sonax', country: 'Alemania' },
    { name: "Meguiar's", slug: 'meguiars', country: 'USA' },
    { name: 'Turtle Wax', slug: 'turtle-wax', country: 'USA' },
    { name: 'Autoglym', slug: 'autoglym', country: 'Reino Unido' },
    { name: 'Gyeon', slug: 'gyeon', country: 'Corea' },
    { name: 'CarPro', slug: 'carpro', country: 'España' },
  ];
  for (const marca of marcas) {
    await prisma.brand.upsert({
      where: { slug: marca.slug },
      update: {},
      create: marca
    });
  }

  // Categorías
  const categorias = [
    'Shampoo', 'Cera', 'Sellador', 'Coating', 'Pulidor',
    'Microfibra', 'Guante', 'Balde', 'Aplicador',
    'Quick Detailer', 'Desengrasante', 'Limpiador Llantas',
    'Limpiador Vidrios', 'Cuero', 'Accesorios', 'Kits'
  ];
  for (const nombre of categorias) {
    const slug = nombre.toLowerCase()
      .replace(/\s+/g, '-')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
    await prisma.category.upsert({
      where: { slug },
      update: {},
      create: { name: nombre, slug }
    });
  }

  console.log('✅ Seed completado');
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());

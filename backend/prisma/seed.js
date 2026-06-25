const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {



  // Config WhatsApp
  await prisma.setting.upsert({
    where: { key: 'whatsapp_number' },
    update: { value: '5493813333090' },
    create: { key: 'whatsapp_number', value: '5493813333090' }
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


}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());

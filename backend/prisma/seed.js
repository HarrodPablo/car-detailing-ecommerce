const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Iniciando seed de datos base...');

  // 1. Settings iniciales
  const initialSettings = [
    { key: 'whatsapp_number', value: '5493814000000' },
    { key: 'tienda_nombre', value: 'Good Shop' },
    { key: 'tienda_slogan', value: 'Productos Premium' }
  ];

  for (const setting of initialSettings) {
    await prisma.setting.upsert({
      where: { key: setting.key },
      update: { value: setting.value },
      create: setting,
    });
  }
  console.log('✅ Settings iniciales cargados.');

  // 2. Marcas
  const marcas = [
    'Chemical Guys', 'Koch Chemie', 'Sonax', "Meguiar's", 
    'Turtle Wax', 'Autoglym', 'Gyeon', 'CarPro'
  ];

  for (const marca of marcas) {
    const slug = marca.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    await prisma.brand.upsert({
      where: { slug },
      update: {},
      create: { name: marca, slug },
    });
  }
  console.log('✅ Marcas cargadas.');

  // 3. Categorías
  const categorias = [
    'Shampoo', 'Cera', 'Sellador', 'Coating', 'Pulidor', 
    'Microfibra', 'Guante', 'Balde', 'Aplicador', 'Quick Detailer', 
    'Desengrasante', 'Limpiador Llantas', 'Limpiador Vidrios', 
    'Cuero', 'Accesorios', 'Kits'
  ];

  for (const cat of categorias) {
    const slug = cat.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    await prisma.category.upsert({
      where: { slug },
      update: {},
      create: { name: cat, slug },
    });
  }
  console.log('✅ Categorías cargadas.');

  console.log('🎉 Seed finalizado exitosamente.');
}

main()
  .catch((e) => {
    console.error('Error durante el seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

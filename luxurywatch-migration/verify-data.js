// Script de verificación de datos migrados
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function verifyMigration() {
  try {
    console.log('🔍 VERIFICACIÓN DE MIGRACIÓN\n');
    
    // 1. Verificar categorías
    console.log('📁 Categorías:');
    const categories = await prisma.category.findMany();
    categories.forEach(cat => {
      console.log(`  • ${cat.name} (${cat.slug})`);
    });
    
    // 2. Verificar materiales
    console.log('\n📦 Materiales:');
    const materials = await prisma.material.findMany();
    materials.forEach(material => {
      console.log(`  • ${material.name} - ${material.materialType} - $${material.price}`);
    });
    
    // 3. Verificar componentes
    console.log('\n⚙️ Componentes de reloj:');
    const watchCases = await prisma.watchCase.findMany();
    const watchDials = await prisma.watchDial.findMany();
    const watchHands = await prisma.watchHands.findMany();
    const watchStraps = await prisma.watchStrap.findMany();
    
    console.log(`  Cajas: ${watchCases.length} tipos`);
    watchCases.forEach(case => {
      console.log(`    • ${case.name} (${case.sizeMm}mm)`);
    });
    
    console.log(`  Esferas: ${watchDials.length} tipos`);
    watchDials.forEach(dial => {
      console.log(`    • ${dial.name} (${dial.styleCategory})`);
    });
    
    console.log(`  Manecillas: ${watchHands.length} tipos`);
    watchHands.forEach(hand => {
      console.log(`    • ${hand.name} (${hand.style})`);
    });
    
    console.log(`  Correas: ${watchStraps.length} tipos`);
    watchStraps.forEach(strap => {
      console.log(`    • ${strap.name} (${strap.style})`);
    });
    
    // 4. Verificar productos
    console.log('\n📦 Productos:');
    const products = await prisma.product.findMany();
    products.forEach(product => {
      console.log(`  • ${product.name} (${product.slug})`);
      console.log(`    - Estado: ${product.status}`);
      console.log(`    - Configurable: ${product.isConfigurable}`);
    });
    
    // 5. Verificar configuraciones
    console.log('\n⚙️ Configuraciones:');
    const watchConfigs = await prisma.watchConfiguration.findMany();
    console.log(`  Total configuraciones: ${watchConfigs.length}`);
    watchConfigs.forEach(config => {
      console.log(`  • ${config.name} - $${config.price}`);
    });
    
    // 6. Verificar usuarios
    console.log('\n👥 Usuarios:');
    const users = await prisma.user.findMany();
    users.forEach(user => {
      console.log(`  • ${user.email} (${user.firstName} ${user.lastName})`);
    });
    
    // 7. Verificar perfiles
    console.log('\n👤 Perfiles:');
    const profiles = await prisma.userProfile.findMany();
    profiles.forEach(profile => {
      console.log(`  • VIP: ${profile.isVip} - Puntos: ${profile.loyaltyPoints}`);
    });
    
    console.log('\n✅ VERIFICACIÓN COMPLETADA');
    console.log('\n📊 RESUMEN:');
    console.log(`  • Categorías: ${categories.length}`);
    console.log(`  • Materiales: ${materials.length}`);
    console.log(`  • Cajas: ${watchCases.length}`);
    console.log(`  • Esferas: ${watchDials.length}`);
    console.log(`  • Manecillas: ${watchHands.length}`);
    console.log(`  • Correas: ${watchStraps.length}`);
    console.log(`  • Productos: ${products.length}`);
    console.log(`  • Configuraciones: ${watchConfigs.length}`);
    console.log(`  • Usuarios: ${users.length}`);
    console.log(`  • Perfiles: ${profiles.length}`);
    
    const totalRecords = categories.length + materials.length + watchCases.length + 
                        watchDials.length + watchHands.length + watchStraps.length + 
                        products.length + watchConfigs.length + users.length + profiles.length;
    
    console.log(`\n📈 TOTAL REGISTROS MIGRADOS: ${totalRecords}`);
    
  } catch (error) {
    console.error('❌ Error durante la verificación:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar verificación
verifyMigration();
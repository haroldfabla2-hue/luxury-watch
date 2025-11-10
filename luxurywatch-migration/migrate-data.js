// Script de migración automática de datos
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function migrateSampleData() {
  try {
    console.log('🚀 Iniciando migración de datos de ejemplo...');
    
    // 1. Crear categorías
    console.log('📁 Creando categorías...');
    const categories = [
      { name: 'Relojes Clásicos', slug: 'clasicos', description: 'Relojes de estilo clásico y atemporal' },
      { name: 'Relojes Deportivos', slug: 'deportivos', description: 'Relojes para actividades deportivas' },
      { name: 'Relojes de Lujo', slug: 'lujo', description: 'Relojes de alta gama y lujo' },
      { name: 'Relojes Cronógrafos', slug: 'cronografos', description: 'Relojes con función de cronógrafo' }
    ];
    
    const createdCategories = [];
    for (const category of categories) {
      const created = await prisma.category.upsert({
        where: { slug: category.slug },
        update: category,
        create: category
      });
      createdCategories.push(created);
      console.log(`  ✅ ${category.name}`);
    }
    
    // 2. Crear materiales
    console.log('📦 Creando materiales...');
    const materials = [
      { name: 'Acero Inoxidable 316L', materialType: 'metal', colorHex: '#C0C0C0', price: 150.00 },
      { name: 'Oro Amarillo 18K', materialType: 'metal', colorHex: '#FFD700', price: 1200.00 },
      { name: 'Oro Rosa 18K', materialType: 'metal', colorHex: '#E8B4B8', price: 1100.00 },
      { name: 'Oro Blanco 18K', materialType: 'metal', colorHex: '#F5F5F5', price: 1150.00 },
      { name: 'Cerámica Negro', materialType: 'ceramic', colorHex: '#1C1C1C', price: 300.00 },
      { name: 'Cerámica Blanco', materialType: 'ceramic', colorHex: '#FFFFFF', price: 300.00 },
      { name: 'Cuero Natural', materialType: 'leather', colorHex: '#8B4513', price: 80.00 },
      { name: 'Cuero Negro', materialType: 'leather', colorHex: '#000000', price: 85.00 },
      { name: 'Caucho Negro', materialType: 'rubber', colorHex: '#000000', price: 60.00 }
    ];
    
    const createdMaterials = [];
    for (const material of materials) {
      const created = await prisma.material.upsert({
        where: { name: material.name },
        update: material,
        create: material
      });
      createdMaterials.push(created);
      console.log(`  ✅ ${material.name}`);
    }
    
    // 3. Crear cajas de relojes
    console.log('📦 Creando cajas de relojes...');
    const steelMaterial = createdMaterials.find(m => m.name === 'Acero Inoxidable 316L');
    const goldMaterial = createdMaterials.find(m => m.name === 'Oro Amarillo 18K');
    const ceramicMaterial = createdMaterials.find(m => m.name === 'Cerámica Negro');
    
    const cases = [
      { name: 'Caja Clásica Acero 40mm', shape: 'round', sizeMm: 40.00, materialId: steelMaterial.id, price: 200.00 },
      { name: 'Caja Clásica Acero 42mm', shape: 'round', sizeMm: 42.00, materialId: steelMaterial.id, price: 220.00 },
      { name: 'Caja Lujo Oro 40mm', shape: 'round', sizeMm: 40.00, materialId: goldMaterial.id, price: 1500.00 },
      { name: 'Caja Deportiva Cerámica 44mm', shape: 'round', sizeMm: 44.00, materialId: ceramicMaterial.id, price: 400.00 }
    ];
    
    const createdCases = [];
    for (const watchCase of cases) {
      const created = await prisma.watchCase.create({ data: watchCase });
      createdCases.push(created);
      console.log(`  ✅ ${watchCase.name}`);
    }
    
    // 4. Crear esferas
    console.log('📦 Creando esferas...');
    const dials = [
      { name: 'Esfera Blanca Clásica', styleCategory: 'classic', colorHex: '#FFFFFF', patternType: 'plain' },
      { name: 'Esfera Negro Mate', styleCategory: 'sport', colorHex: '#000000', patternType: 'matte' },
      { name: 'Esfera Azul Marina', styleCategory: 'elegant', colorHex: '#000080', patternType: 'sunburst' },
      { name: 'Esfera Plata', styleCategory: 'luxury', colorHex: '#C0C0C0', patternType: 'guilloche' }
    ];
    
    const createdDials = [];
    for (const dial of dials) {
      const created = await prisma.watchDial.create({ data: dial });
      createdDials.push(created);
      console.log(`  ✅ ${dial.name}`);
    }
    
    // 5. Crear manecillas
    console.log('📦 Creando manecillas...');
    const hands = [
      { name: 'Manecillas Dauphine', style: 'dauphine', color: 'Plateado', materialType: 'metal' },
      { name: 'Manecillas Sword', style: 'sword', color: 'Azul', materialType: 'metal' },
      { name: 'Manecillas Breguet', style: 'breguet', color: 'Oro', materialType: 'metal' },
      { name: 'Manecillas Lollipop', style: 'lollipop', color: 'Rojo', materialType: 'metal' }
    ];
    
    const createdHands = [];
    for (const hand of hands) {
      const created = await prisma.watchHands.create({ data: hand });
      createdHands.push(created);
      console.log(`  ✅ ${hand.name}`);
    }
    
    // 6. Crear correas
    console.log('📦 Creando correas...');
    const leatherMaterial = createdMaterials.find(m => m.name === 'Cuero Natural');
    const rubberMaterial = createdMaterials.find(m => m.name === 'Caucho Negro');
    
    const straps = [
      { name: 'Correa Cuero Marrón', materialType: 'leather', color: 'Marrón', style: 'classic', buckleType: 'pin', materialId: leatherMaterial.id },
      { name: 'Correa Cuero Negro', materialType: 'leather', color: 'Negro', style: 'formal', buckleType: 'pin', materialId: leatherMaterial.id },
      { name: 'Correa Deportiva', materialType: 'rubber', color: 'Negro', style: 'sport', buckleType: 'deployant', materialId: rubberMaterial.id },
      { name: 'Correa Milanesa', materialType: 'metal', color: 'Plateado', style: 'elegant', buckleType: 'folding' }
    ];
    
    const createdStraps = [];
    for (const strap of straps) {
      const created = await prisma.watchStrap.create({ data: strap });
      createdStraps.push(created);
      console.log(`  ✅ ${strap.name}`);
    }
    
    // 7. Crear productos principales
    console.log('📦 Creando productos...');
    const classicCategory = createdCategories.find(c => c.slug === 'clasicos');
    const luxuryCategory = createdCategories.find(c => c.slug === 'lujo');
    
    const products = [
      {
        name: 'Reloj Clásico Acero',
        slug: 'reloj-clasico-acero',
        description: 'Un reloj clásico con caja de acero inoxidable y esfera blanca',
        shortDescription: 'Reloj clásico de acero inoxidable',
        productType: 'CONFIGURABLE',
        status: 'ACTIVE',
        isFeatured: true,
        categoryId: classicCategory.id,
        isConfigurable: true
      },
      {
        name: 'Reloj de Lujo Dorado',
        slug: 'reloj-lujo-dorado',
        description: 'Un reloj de lujo con caja de oro 18k y detalles refinados',
        shortDescription: 'Reloj de lujo en oro 18k',
        productType: 'CONFIGURABLE',
        status: 'ACTIVE',
        isFeatured: true,
        categoryId: luxuryCategory.id,
        isConfigurable: true
      }
    ];
    
    const createdProducts = [];
    for (const product of products) {
      const created = await prisma.product.upsert({
        where: { slug: product.slug },
        update: product,
        create: product
      });
      createdProducts.push(created);
      console.log(`  ✅ ${product.name}`);
    }
    
    // 8. Crear configuraciones de ejemplo
    console.log('⚙️ Creando configuraciones de ejemplo...');
    const steelCase = createdCases.find(c => c.name === 'Caja Clásica Acero 40mm');
    const whiteDial = createdDials.find(d => d.name === 'Esfera Blanca Clásica');
    const dauphineHands = createdHands.find(h => h.name === 'Manecillas Dauphine');
    const brownStrap = createdStraps.find(s => s.name === 'Correa Cuero Marrón');
    const steelProduct = createdProducts.find(p => p.slug === 'reloj-clasico-acero');
    
    if (steelCase && whiteDial && dauphineHands && brownStrap && steelProduct) {
      const config = {
        productId: steelProduct.id,
        dialId: whiteDial.id,
        caseId: steelCase.id,
        handsId: dauphineHands.id,
        strapId: brownStrap.id,
        name: 'Configuración Clásica',
        price: 450.00
      };
      
      const createdConfig = await prisma.watchConfiguration.create({ data: config });
      console.log(`  ✅ ${createdConfig.name}`);
    }
    
    // 9. Crear usuarios de ejemplo
    console.log('👥 Creando usuarios de ejemplo...');
    const users = [
      {
        id: '550e8400-e29b-41d4-a716-446655440001',
        email: 'admin@luxurywatch.com',
        firstName: 'Admin',
        lastName: 'User',
        emailVerified: true
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440002',
        email: 'cliente@example.com',
        firstName: 'Juan',
        lastName: 'Pérez',
        emailVerified: true
      }
    ];
    
    const createdUsers = [];
    for (const user of users) {
      const created = await prisma.user.upsert({
        where: { email: user.email },
        update: user,
        create: user
      });
      createdUsers.push(created);
      console.log(`  ✅ ${user.email}`);
    }
    
    // 10. Crear perfiles de usuario
    console.log('👤 Creando perfiles de usuario...');
    const adminProfile = {
      userId: createdUsers[0].id,
      firstName: 'Admin',
      lastName: 'User',
      isVip: true
    };
    
    const clientProfile = {
      userId: createdUsers[1].id,
      firstName: 'Juan',
      lastName: 'Pérez',
      phone: '+1234567890',
      isVip: false
    };
    
    await prisma.userProfile.upsert({
      where: { userId: adminProfile.userId },
      update: adminProfile,
      create: adminProfile
    });
    
    await prisma.userProfile.upsert({
      where: { userId: clientProfile.userId },
      update: clientProfile,
      create: clientProfile
    });
    
    console.log('  ✅ Perfiles creados');
    
    console.log('\n✅ MIGRACIÓN COMPLETADA EXITOSAMENTE!');
    console.log('\n📊 RESUMEN:');
    console.log(`  • Categorías: ${createdCategories.length}`);
    console.log(`  • Materiales: ${createdMaterials.length}`);
    console.log(`  • Cajas: ${createdCases.length}`);
    console.log(`  • Esferas: ${createdDials.length}`);
    console.log(`  • Manecillas: ${createdHands.length}`);
    console.log(`  • Correas: ${createdStraps.length}`);
    console.log(`  • Productos: ${createdProducts.length}`);
    console.log(`  • Usuarios: ${createdUsers.length}`);
    
  } catch (error) {
    console.error('❌ Error durante la migración:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar migración
migrateSampleData();
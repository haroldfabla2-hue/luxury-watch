// Script de migración automática de datos - CORREGIDO
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function migrateSampleData() {
  try {
    console.log('🚀 Iniciando migración de datos de ejemplo...');
    
    // 1. Crear categorías de productos
    console.log('📁 Creando categorías de productos...');
    const categories = [
      { name: 'Relojes Clásicos', slug: 'clasicos', description: 'Relojes de estilo clásico y atemporal' },
      { name: 'Relojes Deportivos', slug: 'deportivos', description: 'Relojes para actividades deportivas' },
      { name: 'Relojes de Lujo', slug: 'lujo', description: 'Relojes de alta gama y lujo' },
      { name: 'Relojes Cronógrafos', slug: 'cronografos', description: 'Relojes con función de cronógrafo' }
    ];
    
    const createdCategories = [];
    for (const category of categories) {
      const created = await prisma.productCategory.upsert({
        where: { slug: category.slug },
        update: category,
        create: category
      });
      createdCategories.push(created);
      console.log(`  ✅ ${category.name}`);
    }
    
    // 2. Crear materiales de relojes
    console.log('📦 Creando materiales de relojes...');
    const materials = [
      { 
        name: 'Stainless Steel 316L', 
        type: 'METAL', 
        price: 150.00,
        color: 'Silver',
        finish: 'Polished',
        description: 'High-quality stainless steel with excellent corrosion resistance'
      },
      { 
        name: '18K Yellow Gold', 
        type: 'PRECIOUS_METAL', 
        price: 2500.00,
        color: 'Gold',
        finish: 'Polished',
        description: 'Pure 18k yellow gold for luxury timepieces'
      },
      { 
        name: 'Ceramic Zirconia', 
        type: 'CERAMIC', 
        price: 800.00,
        color: 'Black',
        finish: 'Matte',
        description: 'Advanced ceramic material for scratch resistance'
      },
      { 
        name: 'Italian Leather', 
        type: 'LEATHER', 
        price: 120.00,
        color: 'Brown',
        finish: 'Smooth',
        description: 'Premium Italian leather for watch straps'
      },
      { 
        name: 'Rubber FKM', 
        type: 'RUBBER', 
        price: 80.00,
        color: 'Black',
        finish: 'Textured',
        description: 'High-performance FKM rubber for sports watches'
      },
      { 
        name: 'Rose Gold 18K', 
        type: 'PRECIOUS_METAL', 
        price: 2300.00,
        color: 'Rose Gold',
        finish: 'Polished',
        description: 'Elegant 18k rose gold with copper alloy'
      },
      { 
        name: 'Platinum 950', 
        type: 'PRECIOUS_METAL', 
        price: 3200.00,
        color: 'Platinum',
        finish: 'Satin',
        description: 'Premium platinum for ultimate luxury'
      },
      { 
        name: 'Carbon Fiber', 
        type: 'EXOTIC', 
        price: 600.00,
        color: 'Black',
        finish: 'Matte',
        description: 'Ultra-lightweight carbon fiber composite'
      },
      { 
        name: 'Blue Ceramic', 
        type: 'CERAMIC', 
        price: 950.00,
        color: 'Blue',
        finish: 'Polished',
        description: 'Vibrant blue ceramic for distinctive styling'
      }
    ];
    
    const createdMaterials = [];
    for (const material of materials) {
      const created = await prisma.watchMaterial.upsert({
        where: { name: material.name },
        update: material,
        create: material
      });
      createdMaterials.push(created);
      console.log(`  ✅ ${material.name}`);
    }
    
    // 3. Crear cajas de relojes
    console.log('📦 Creando cajas de relojes...');
    const steelMaterial = createdMaterials.find(m => m.name === 'Stainless Steel 316L');
    const goldMaterial = createdMaterials.find(m => m.name === '18K Yellow Gold');
    const ceramicMaterial = createdMaterials.find(m => m.name === 'Ceramic Zirconia');
    const roseGoldMaterial = createdMaterials.find(m => m.name === 'Rose Gold 18K');
    
    const cases = [
      { 
        name: 'Classic Steel 40mm', 
        shape: 'Round', 
        diameter: 40.00, 
        thickness: 11.00,
        lugWidth: 20.00,
        materialId: steelMaterial.id, 
        price: 200.00,
        waterResistance: 50,
        crystal: 'Sapphire',
        description: 'Classic round case in stainless steel'
      },
      { 
        name: 'Classic Steel 42mm', 
        shape: 'Round', 
        diameter: 42.00, 
        thickness: 11.50,
        lugWidth: 22.00,
        materialId: steelMaterial.id, 
        price: 220.00,
        waterResistance: 50,
        crystal: 'Sapphire',
        description: 'Larger classic round case in stainless steel'
      },
      { 
        name: 'Gold Luxury 40mm', 
        shape: 'Round', 
        diameter: 40.00, 
        thickness: 10.50,
        lugWidth: 20.00,
        materialId: goldMaterial.id, 
        price: 1500.00,
        waterResistance: 30,
        crystal: 'Sapphire',
        description: 'Luxury gold case for premium timepieces'
      },
      { 
        name: 'Sport Ceramic 44mm', 
        shape: 'Round', 
        diameter: 44.00, 
        thickness: 12.00,
        lugWidth: 22.00,
        materialId: ceramicMaterial.id, 
        price: 400.00,
        waterResistance: 200,
        crystal: 'Sapphire',
        description: 'Scratch-resistant ceramic sports case'
      },
      { 
        name: 'Rose Gold Elegant 38mm', 
        shape: 'Round', 
        diameter: 38.00, 
        thickness: 10.00,
        lugWidth: 18.00,
        materialId: roseGoldMaterial.id, 
        price: 1800.00,
        waterResistance: 50,
        crystal: 'Sapphire',
        description: 'Elegant rose gold case for sophisticated wear'
      }
    ];
    
    const createdCases = [];
    for (const watchCase of cases) {
      const created = await prisma.watchCase.create({ data: watchCase });
      createdCases.push(created);
      console.log(`  ✅ ${watchCase.name}`);
    }
    
    // 4. Crear esferas (dials)
    console.log('📦 Creando esferas...');
    const dialMaterials = createdMaterials.filter(m => ['Stainless Steel 316L', '18K Yellow Gold', 'Ceramic Zirconia'].includes(m.name));
    
    const dials = [
      { 
        name: 'Classic White Dial', 
        color: 'White', 
        finish: 'Matte', 
        hourMarkers: 'Arabic',
        materialId: dialMaterials[0]?.id,
        price: 0.00,
        description: 'Clean white dial with Arabic numerals'
      },
      { 
        name: 'Sport Black Dial', 
        color: 'Black', 
        finish: 'Sunburst', 
        hourMarkers: 'Indices',
        materialId: dialMaterials[2]?.id,
        price: 50.00,
        description: 'Bold black dial with_indices for sports styling'
      },
      { 
        name: 'Navy Blue Dial', 
        color: 'Navy Blue', 
        finish: 'Sunburst', 
        hourMarkers: 'Roman',
        materialId: dialMaterials[0]?.id,
        price: 75.00,
        description: 'Sophisticated navy blue dial with Roman numerals'
      },
      { 
        name: 'Champagne Dial', 
        color: 'Champagne', 
        finish: 'Guilloche', 
        hourMarkers: 'Arabic',
        materialId: dialMaterials[1]?.id,
        price: 100.00,
        description: 'Luxurious champagne dial with guilloche pattern'
      }
    ];
    
    const createdDials = [];
    for (const dial of dials) {
      const created = await prisma.watchDial.create({ data: dial });
      createdDials.push(created);
      console.log(`  ✅ ${dial.name}`);
    }
    
    // 5. Crear manecillas
    console.log('📦 Creando manecillas...');
    const handMaterials = createdMaterials.filter(m => ['Stainless Steel 316L', '18K Yellow Gold', 'Ceramic Zirconia'].includes(m.name));
    
    const hands = [
      { 
        name: 'Classic Sword Hands', 
        style: 'Sword', 
        color: 'Silver',
        size: 'Dauphine',
        materialId: handMaterials[0]?.id,
        price: 0.00
      },
      { 
        name: 'Gold Breguet Hands', 
        style: 'Breguet', 
        color: 'Gold',
        size: 'Elegant',
        materialId: handMaterials[1]?.id,
        price: 150.00
      },
      { 
        name: 'Sport Lume Hands', 
        style: 'Arrow', 
        color: 'Lume Green',
        size: 'Sport',
        materialId: handMaterials[2]?.id,
        price: 50.00
      }
    ];
    
    const createdHands = [];
    for (const hand of hands) {
      const created = await prisma.watchHands.create({ data: hand });
      createdHands.push(created);
      console.log(`  ✅ ${hand.name}`);
    }
    
    // 6. Crear correas
    console.log('📦 Creando correas...');
    const strapMaterials = createdMaterials.filter(m => ['Italian Leather', 'Rubber FKM', 'Stainless Steel 316L'].includes(m.name));
    
    const straps = [
      { 
        name: 'Leather Brown Classic', 
        type: 'LEATHER',
        materialId: strapMaterials[0]?.id,
        color: 'Brown', 
        width: 20.00, 
        length: 120.00,
        buckleType: 'Buckle',
        price: 120.00
      },
      { 
        name: 'Steel Bracelet', 
        type: 'METAL',
        materialId: strapMaterials[2]?.id,
        color: 'Silver', 
        width: 20.00, 
        length: 0,
        buckleType: 'Deployant',
        price: 300.00
      },
      { 
        name: 'Rubber Sport Black', 
        type: 'RUBBER',
        materialId: strapMaterials[1]?.id,
        color: 'Black', 
        width: 22.00, 
        length: 125.00,
        buckleType: 'Buckle',
        price: 80.00
      },
      { 
        name: 'Leather Black Dress', 
        type: 'LEATHER',
        materialId: strapMaterials[0]?.id,
        color: 'Black', 
        width: 18.00, 
        length: 115.00,
        buckleType: 'Buckle',
        price: 140.00
      }
    ];
    
    const createdStraps = [];
    for (const strap of straps) {
      const created = await prisma.watchStrap.create({ data: strap });
      createdStraps.push(created);
      console.log(`  ✅ ${strap.name}`);
    }
    
    // 7. Crear configuraciones de ejemplo
    console.log('📦 Creando configuraciones de ejemplo...');
    const configurations = [
      {
        name: 'Classic Steel & Leather',
        materialId: steelMaterial.id,
        caseId: createdCases[0].id,
        dialId: createdDials[0].id,
        handsId: createdHands[0].id,
        strapId: createdStraps[0].id,
        totalPrice: 470.00,
        description: 'Timeless combination of steel case, white dial, and brown leather strap'
      },
      {
        name: 'Luxury Gold Edition',
        materialId: goldMaterial.id,
        caseId: createdCases[2].id,
        dialId: createdDials[3].id,
        handsId: createdHands[1].id,
        strapId: createdStraps[1].id,
        totalPrice: 4250.00,
        description: 'Ultimate luxury with gold case, champagne dial, and steel bracelet'
      },
      {
        name: 'Sport Ceramic',
        materialId: ceramicMaterial.id,
        caseId: createdCases[3].id,
        dialId: createdDials[1].id,
        handsId: createdHands[2].id,
        strapId: createdStraps[2].id,
        totalPrice: 1080.00,
        description: 'Modern sport watch with ceramic case and rubber strap'
      }
    ];
    
    for (const config of configurations) {
      const created = await prisma.watchConfiguration.create({ data: config });
      console.log(`  ✅ ${config.name} - $${config.totalPrice}`);
    }
    
    // 8. Crear clientes de ejemplo
    console.log('📦 Creando clientes de ejemplo...');
    const customers = [
      {
        email: 'juan.perez@email.com',
        firstName: 'Juan',
        lastName: 'Pérez',
        phone: '+34 600 123 456',
        segment: 'HIGH',
        lifetimeValue: 2500.00,
        totalOrders: 3,
        address: 'Calle Mayor 123',
        city: 'Madrid',
        country: 'Spain',
        postalCode: '28001'
      },
      {
        email: 'maria.garcia@email.com',
        firstName: 'María',
        lastName: 'García',
        phone: '+34 600 654 321',
        segment: 'VIP',
        lifetimeValue: 8500.00,
        totalOrders: 7,
        address: 'Avenida de la Paz 45',
        city: 'Barcelona',
        country: 'Spain',
        postalCode: '08001'
      }
    ];
    
    const createdCustomers = [];
    for (const customer of customers) {
      const created = await prisma.customer.create({ data: customer });
      createdCustomers.push(created);
      console.log(`  ✅ ${customer.firstName} ${customer.lastName}`);
    }
    
    // 9. Crear productos de ejemplo
    console.log('📦 Creando productos de ejemplo...');
    const category1 = createdCategories[0]; // Clásicos
    const category3 = createdCategories[2]; // Lujo
    
    const products = [
      {
        name: 'Classic Heritage 40',
        description: 'Elegant timepiece with timeless design',
        price: 1200.00,
        currency: 'USD',
        sku: 'CH-40-001',
        stock: 15,
        categoryId: category1.id
      },
      {
        name: 'Gold Prestige Edition',
        description: 'Luxury gold timepiece for special occasions',
        price: 4500.00,
        currency: 'USD',
        sku: 'GPE-40-001',
        stock: 5,
        categoryId: category3.id
      }
    ];
    
    for (const product of products) {
      const created = await prisma.product.create({ data: product });
      console.log(`  ✅ ${product.name} - $${product.price}`);
    }
    
    // 10. Crear proveedores de IA
    console.log('📦 Creando proveedores de IA...');
    const aiProviders = [
      {
        name: 'OpenAI GPT-4',
        type: 'OPENAI',
        status: 'ACTIVE',
        config: { model: 'gpt-4', maxTokens: 1000, temperature: 0.7 }
      },
      {
        name: 'Anthropic Claude',
        type: 'ANTHROPIC',
        status: 'ACTIVE',
        config: { model: 'claude-3-sonnet', maxTokens: 1000, temperature: 0.7 }
      },
      {
        name: 'Google Gemini',
        type: 'GOOGLE',
        status: 'ACTIVE',
        config: { model: 'gemini-pro', maxTokens: 1000, temperature: 0.7 }
      }
    ];
    
    for (const provider of aiProviders) {
      const created = await prisma.aiProvider.create({ data: provider });
      console.log(`  ✅ ${provider.name}`);
    }
    
    // 11. Crear configuraciones de aplicación
    console.log('📦 Creando configuraciones de aplicación...');
    const appSettings = [
      { key: 'site_name', value: 'LuxuryWatch', category: 'general' },
      { key: 'currency', value: 'USD', category: 'general' },
      { key: 'tax_rate', value: '0.21', category: 'pricing' },
      { key: 'shipping_cost', value: '25.00', category: 'pricing' },
      { key: 'free_shipping_threshold', value: '500.00', category: 'pricing' }
    ];
    
    for (const setting of appSettings) {
      await prisma.appSetting.upsert({
        where: { key: setting.key },
        update: setting,
        create: setting
      });
      console.log(`  ✅ ${setting.key} = ${setting.value}`);
    }
    
    console.log('\n🎉 ¡Migración completada exitosamente!');
    console.log('📊 Resumen:');
    console.log(`   - ${createdCategories.length} categorías`);
    console.log(`   - ${createdMaterials.length} materiales`);
    console.log(`   - ${createdCases.length} cajas`);
    console.log(`   - ${createdDials.length} esferas`);
    console.log(`   - ${createdHands.length} manecillas`);
    console.log(`   - ${createdStraps.length} correas`);
    console.log(`   - ${createdCustomers.length} clientes`);
    console.log(`   - ${configurations.length} configuraciones`);
    console.log(`   - ${products.length} productos`);
    console.log(`   - ${aiProviders.length} proveedores de IA`);
    console.log(`   - ${appSettings.length} configuraciones`);
    
  } catch (error) {
    console.error('❌ Error durante la migración:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar migración si se llama directamente
if (require.main === module) {
  migrateSampleData()
    .then(() => {
      console.log('\n✅ Proceso completado');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Proceso fallido:', error);
      process.exit(1);
    });
}

module.exports = { migrateSampleData };
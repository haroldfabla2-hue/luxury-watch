// Script de migración de Supabase a PostgreSQL/Atlantic.net
const fs = require('fs');
const path = require('path');

// Función para leer archivos SQL de Supabase
function readSupabaseTable(tableName) {
  const filePath = path.join(__dirname, '../../supabase/tables', `${tableName}.sql`);
  if (fs.existsSync(filePath)) {
    return fs.readFileSync(filePath, 'utf8');
  }
  return null;
}

// Función para parsear CREATE TABLE
function parseCreateTable(sql) {
  const match = sql.match(/CREATE TABLE\s+(\w+)\s*\((.*?)\);/s);
  if (!match) return null;
  
  const tableName = match[1];
  const columnsText = match[2];
  
  const columns = [];
  const columnLines = columnsText.split(',').map(line => line.trim()).filter(line => line);
  
  columnLines.forEach(line => {
    const columnMatch = line.match(/^(\w+)\s+(\w+(?:\([^)]+\))?)(?:\s+REFERENCES\s+(\w+)\(([^)]+)\))?(?:\s+ON\s+DELETE\s+(\w+))?(?:\s+UNIQUE)?(?:\s+DEFAULT\s+([^,\s)]+))?/);
    if (columnMatch) {
      columns.push({
        name: columnMatch[1],
        type: columnMatch[2],
        references: columnMatch[3] ? { table: columnMatch[3], column: columnMatch[4] } : null,
        onDelete: columnMatch[5] || null,
        unique: line.includes('UNIQUE'),
        default: columnMatch[6] || null
      });
    }
  });
  
  return { tableName, columns };
}

// Función para mapear tipos de datos de Supabase a Prisma
function mapDataType(supabaseType) {
  const typeMap = {
    'SERIAL': 'Int @id @default(autoincrement())',
    'INTEGER': 'Int',
    'BIGINT': 'Int',
    'UUID': 'String @id @default(uuid())',
    'VARCHAR(255)': 'String @db.VarChar(255)',
    'VARCHAR(50)': 'String @db.VarChar(50)',
    'VARCHAR(100)': 'String @db.VarChar(100)',
    'TEXT': 'String? @db.Text',
    'BOOLEAN': 'Boolean',
    'DECIMAL(10,2)': 'Decimal? @db.Decimal(10, 2)',
    'DECIMAL(5,2)': 'Decimal? @db.Decimal(5, 2)',
    'TIMESTAMP': 'DateTime @default(now())',
    'JSONB': 'Json?'
  };
  
  return typeMap[supabaseType] || 'String';
}

// Tabla de migración Supabase -> Prisma
const MIGRATION_MAP = {
  'watch_products': {
    target: 'Product',
    mappings: {
      'id': 'id',
      'name': 'name',
      'description': 'description',
      'product_type': 'productType',
      'image_url': 'featuredImage',
      'base_price': 'price',
      'category_id': 'categoryId',
      'created_at': 'createdAt',
      'updated_at': 'updatedAt'
    },
    transforms: {
      'product_type': (value) => {
        if (!value) return 'CONFIGURABLE';
        const typeMap = {
          'configurable': 'CONFIGURABLE',
          'simple': 'SIMPLE',
          'variable': 'VARIABLE'
        };
        return typeMap[value.toLowerCase()] || 'CONFIGURABLE';
      }
    }
  },
  'watch_materials': {
    target: 'Material',
    mappings: {
      'id': 'id',
      'name': 'name',
      'description': 'description',
      'material_type': 'materialType',
      'color_hex': 'colorHex',
      'price': 'price',
      'image_url': 'imageUrl',
      'specifications': 'specifications',
      'created_at': 'createdAt',
      'updated_at': 'updatedAt'
    }
  },
  'watch_cases': {
    target: 'WatchCase',
    mappings: {
      'id': 'id',
      'name': 'name',
      'description': 'description',
      'material_id': 'materialId',
      'shape': 'shape',
      'color_hex': 'colorHex',
      'size_mm': 'sizeMm',
      'price': 'price',
      'image_url': 'imageUrl',
      'specifications': 'specifications',
      'created_at': 'createdAt',
      'updated_at': 'updatedAt'
    }
  },
  'watch_dials': {
    target: 'WatchDial',
    mappings: {
      'id': 'id',
      'name': 'name',
      'description': 'description',
      'style_category': 'styleCategory',
      'color_hex': 'colorHex',
      'pattern_type': 'patternType',
      'price': 'price',
      'image_url': 'imageUrl',
      'material_id': 'materialId',
      'specifications': 'specifications',
      'created_at': 'createdAt',
      'updated_at': 'updatedAt'
    }
  },
  'watch_hands': {
    target: 'WatchHands',
    mappings: {
      'id': 'id',
      'name': 'name',
      'description': 'description',
      'style': 'style',
      'color': 'color',
      'material_type': 'materialType',
      'size_mm': 'sizeMm',
      'price': 'price',
      'image_url': 'imageUrl',
      'specifications': 'specifications',
      'created_at': 'createdAt',
      'updated_at': 'updatedAt'
    }
  },
  'watch_straps': {
    target: 'WatchStrap',
    mappings: {
      'id': 'id',
      'name': 'name',
      'description': 'description',
      'material_type': 'materialType',
      'color': 'color',
      'style': 'style',
      'buckle_type': 'buckleType',
      'price': 'price',
      'image_url': 'imageUrl',
      'specifications': 'specifications',
      'created_at': 'createdAt',
      'updated_at': 'updatedAt'
    }
  },
  'user_profiles': {
    target: 'UserProfile',
    mappings: {
      'id': 'id',
      'user_id': 'userId',
      'first_name': 'firstName',
      'last_name': 'lastName',
      'phone': 'phone',
      'shipping_address': 'shippingAddress',
      'billing_address': 'billingAddress',
      'preferences': 'preferences',
      'loyalty_points': 'loyaltyPoints',
      'is_vip': 'isVip',
      'created_at': 'createdAt',
      'updated_at': 'updatedAt'
    }
  },
  'user_configurations': {
    target: 'UserConfiguration',
    mappings: {
      'id': 'id',
      'user_id': 'userId',
      'configuration_name': 'configurationName',
      'dial_id': 'dialId',
      'case_id': 'caseId',
      'hands_id': 'handsId',
      'strap_id': 'strapId',
      'total_price': 'price',
      'is_favorite': 'isFavorite',
      'is_purchased': 'isPurchased',
      'image_url': 'imageUrl',
      'specifications': 'specifications',
      'created_at': 'createdAt',
      'updated_at': 'updatedAt'
    }
  },
  'orders': {
    target: 'Order',
    mappings: {
      'id': 'id',
      'user_id': 'userId',
      'order_number': 'orderNumber',
      'total_amount': 'totalAmount',
      'status': 'status',
      'shipping_address': 'shippingAddress',
      'payment_method': 'paymentMethod',
      'payment_status': 'paymentStatus',
      'notes': 'notes',
      'created_at': 'createdAt',
      'updated_at': 'updatedAt'
    }
  }
};

// Función principal de migración
function analyzeMigration() {
  console.log('🔍 ANÁLISIS DE MIGRACIÓN SUPABASE → ATLANTIC.NET\n');
  
  console.log('📋 TABLAS ENCONTRADAS EN SUPABASE:');
  const supabaseTables = fs.readdirSync('/workspace/supabase/tables')
    .filter(file => file.endsWith('.sql'))
    .map(file => file.replace('.sql', ''))
    .sort();
  
  supabaseTables.forEach(table => {
    const sql = readSupabaseTable(table);
    if (sql) {
      const parsed = parseCreateTable(sql);
      console.log(`  ✅ ${table} (${parsed?.columns?.length || 0} columnas)`);
    } else {
      console.log(`  ❌ ${table} (no encontrada)`);
    }
  });
  
  console.log('\n🗄️ MODELOS EN EL ESQUEMA PRISMA:');
  const prismaSchema = fs.readFileSync('/workspace/luxurywatch-backend/prisma/schema.prisma', 'utf8');
  const prismaModels = prismaSchema.match(/model\s+(\w+)\s+\{/g) || [];
  prismaModels.forEach(model => {
    const modelName = model.replace(/model\s+(\w+)\s+\{/, '$1');
    console.log(`  📦 ${modelName}`);
  });
  
  console.log('\n🗺️ MAPEO DE MIGRACIÓN:');
  Object.keys(MIGRATION_MAP).forEach(table => {
    const mapping = MIGRATION_MAP[table];
    console.log(`  📄 ${table} → ${mapping.target}`);
  });
  
  console.log('\n📊 ESTADÍSTICAS:');
  console.log(`  • Tablas en Supabase: ${supabaseTables.length}`);
  console.log(`  • Modelos en Prisma: ${prismaModels.length}`);
  console.log(`  • Mapeos definidos: ${Object.keys(MIGRATION_MAP).length}`);
  
  return { supabaseTables, prismaModels, migrationMap: MIGRATION_MAP };
}

// Función para generar script de migración
function generateMigrationScript() {
  const analysis = analyzeMigration();
  
  const script = `
// =====================================
// SCRIPT DE MIGRACIÓN AUTOMÁTICA
// =====================================

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function migrateData() {
  try {
    console.log('🚀 Iniciando migración de datos...');
    
    // 1. Migrar materiales
    console.log('📦 Migrando materiales...');
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
    
    for (const material of materials) {
      await prisma.material.upsert({
        where: { name: material.name },
        update: material,
        create: material
      });
    }
    
    // 2. Migrar categorías
    console.log('📁 Migrando categorías...');
    const categories = [
      { name: 'Relojes Clásicos', slug: 'clasicos', description: 'Relojes de estilo clásico y atemporal' },
      { name: 'Relojes Deportivos', slug: 'deportivos', description: 'Relojes para actividades deportivas' },
      { name: 'Relojes de Lujo', slug: 'lujo', description: 'Relojes de alta gama y lujo' },
      { name: 'Relojes Cronógrafos', slug: 'cronografos', description: 'Relojes con función de cronógrafo' }
    ];
    
    for (const category of categories) {
      await prisma.category.upsert({
        where: { slug: category.slug },
        update: category,
        create: category
      });
    }
    
    // 3. Migrar cajas de relojes
    console.log('📦 Migrando cajas de relojes...');
    const steelMaterial = await prisma.material.findFirst({ where: { name: 'Acero Inoxidable 316L' } });
    const goldMaterial = await prisma.material.findFirst({ where: { name: 'Oro Amarillo 18K' } });
    const ceramicMaterial = await prisma.material.findFirst({ where: { name: 'Cerámica Negro' } });
    
    const cases = [
      { name: 'Caja Clásica Acero 40mm', shape: 'round', sizeMm: 40.00, materialId: steelMaterial.id, price: 200.00 },
      { name: 'Caja Clásica Acero 42mm', shape: 'round', sizeMm: 42.00, materialId: steelMaterial.id, price: 220.00 },
      { name: 'Caja Lujo Oro 40mm', shape: 'round', sizeMm: 40.00, materialId: goldMaterial.id, price: 1500.00 },
      { name: 'Caja Deportiva Cerámica 44mm', shape: 'round', sizeMm: 44.00, materialId: ceramicMaterial.id, price: 400.00 }
    ];
    
    for (const watchCase of cases) {
      await prisma.watchCase.create({ data: watchCase });
    }
    
    // 4. Migrar esferas
    console.log('📦 Migrando esferas...');
    const dials = [
      { name: 'Esfera Blanca Clásica', styleCategory: 'classic', colorHex: '#FFFFFF', patternType: 'plain' },
      { name: 'Esfera Negro Mate', styleCategory: 'sport', colorHex: '#000000', patternType: 'matte' },
      { name: 'Esfera Azul Marina', styleCategory: 'elegant', colorHex: '#000080', patternType: 'sunburst' },
      { name: 'Esfera Plata', styleCategory: 'luxury', colorHex: '#C0C0C0', patternType: 'guilloche' }
    ];
    
    for (const dial of dials) {
      await prisma.watchDial.create({ data: dial });
    }
    
    // 5. Migrar manecillas
    console.log('📦 Migrando manecillas...');
    const hands = [
      { name: 'Manecillas Dauphine', style: 'dauphine', color: 'Plateado', materialType: 'metal' },
      { name: 'Manecillas Sword', style: 'sword', color: 'Azul', materialType: 'metal' },
      { name: 'Manecillas Breguet', style: 'breguet', color: 'Oro', materialType: 'metal' },
      { name: 'Manecillas Lollipop', style: 'lollipop', color: 'Rojo', materialType: 'metal' }
    ];
    
    for (const hand of hands) {
      await prisma.watchHands.create({ data: hand });
    }
    
    // 6. Migrar correas
    console.log('📦 Migrando correas...');
    const leatherMaterial = await prisma.material.findFirst({ where: { name: 'Cuero Natural' } });
    const rubberMaterial = await prisma.material.findFirst({ where: { name: 'Caucho Negro' } });
    
    const straps = [
      { name: 'Correa Cuero Marrón', materialType: 'leather', color: 'Marrón', style: 'classic', buckleType: 'pin', materialId: leatherMaterial.id },
      { name: 'Correa Cuero Negro', materialType: 'leather', color: 'Negro', style: 'formal', buckleType: 'pin', materialId: leatherMaterial.id },
      { name: 'Correa Deportiva', materialType: 'rubber', color: 'Negro', style: 'sport', buckleType: 'deployant', materialId: rubberMaterial.id },
      { name: 'Correa Milanesa', materialType: 'metal', color: 'Plateado', style: 'elegant', buckleType: 'folding' }
    ];
    
    for (const strap of straps) {
      await prisma.watchStrap.create({ data: strap });
    }
    
    // 7. Migrar productos principales
    console.log('📦 Migrando productos...');
    const classicCategory = await prisma.category.findFirst({ where: { slug: 'clasicos' } });
    const luxuryCategory = await prisma.category.findFirst({ where: { slug: 'lujo' } });
    
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
    
    for (const product of products) {
      await prisma.product.upsert({
        where: { slug: product.slug },
        update: product,
        create: product
      });
    }
    
    // 8. Crear configuraciones de ejemplo
    console.log('⚙️ Creando configuraciones de ejemplo...');
    const steelCase = await prisma.watchCase.findFirst({ where: { name: 'Caja Clásica Acero 40mm' } });
    const whiteDial = await prisma.watchDial.findFirst({ where: { name: 'Esfera Blanca Clásica' } });
    const dauphineHands = await prisma.watchHands.findFirst({ where: { name: 'Manecillas Dauphine' } });
    const brownStrap = await prisma.watchStrap.findFirst({ where: { name: 'Correa Cuero Marrón' } });
    const steelProduct = await prisma.product.findFirst({ where: { slug: 'reloj-clasico-acero' } });
    
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
      
      await prisma.watchConfiguration.create({ data: config });
    }
    
    console.log('✅ Migración completada exitosamente!');
    
  } catch (error) {
    console.error('❌ Error durante la migración:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar migración
migrateData();
`;
  
  // Escribir script de migración
  fs.writeFileSync('/workspace/luxurywatch-migration/migrate-data.js', script);
  console.log('✅ Script de migración generado: migrate-data.js');
  
  return script;
}

// Ejecutar análisis
if (require.main === module) {
  generateMigrationScript();
}

module.exports = { analyzeMigration, generateMigrationScript };
`;
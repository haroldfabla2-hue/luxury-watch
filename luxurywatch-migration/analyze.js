// Script de análisis de migración de Supabase a PostgreSQL/Atlantic.net
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

// Función principal de análisis
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
      console.log(`  ✅ ${table}`);
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
  
  console.log('\n📊 ESTADÍSTICAS:');
  console.log(`  • Tablas en Supabase: ${supabaseTables.length}`);
  console.log(`  • Modelos en Prisma: ${prismaModels.length}`);
  
  return { supabaseTables, prismaModels };
}

// Ejecutar análisis
analyzeMigration();
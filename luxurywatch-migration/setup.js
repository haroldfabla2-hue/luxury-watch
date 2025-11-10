// Script de configuración inicial para migración
const { execSync } = require('child_process');
const fs = require('fs');

console.log('🚀 CONFIGURACIÓN INICIAL PARA MIGRACIÓN\n');

// 1. Verificar Prisma
console.log('1️⃣ Verificando Prisma...');
try {
  execSync('npx prisma --version', { stdio: 'inherit' });
  console.log('✅ Prisma instalado correctamente\n');
} catch (error) {
  console.log('❌ Prisma no encontrado. Instalando...');
  execSync('npm install prisma @prisma/client', { stdio: 'inherit' });
  console.log('✅ Prisma instalado\n');
}

// 2. Generar cliente Prisma
console.log('2️⃣ Generando cliente Prisma...');
try {
  execSync('npx prisma generate', { stdio: 'inherit' });
  console.log('✅ Cliente Prisma generado\n');
} catch (error) {
  console.error('❌ Error generando cliente Prisma:', error.message);
}

// 3. Aplicar esquema
console.log('3️⃣ Aplicando esquema a base de datos...');
try {
  execSync('npx prisma db push', { stdio: 'inherit' });
  console.log('✅ Esquema aplicado correctamente\n');
} catch (error) {
  console.error('❌ Error aplicando esquema:', error.message);
}

// 4. Verificar estructura
console.log('4️⃣ Verificando estructura de base de datos...');
try {
  // Esta es una consulta simple para verificar que la DB esté funcionando
  const sqlite3 = require('sqlite3').verbose();
  const db = new sqlite3.Database('./luxurywatch.db');
  
  db.all("SELECT name FROM sqlite_master WHERE type='table'", [], (err, rows) => {
    if (err) {
      console.error('❌ Error verificando base de datos:', err.message);
      return;
    }
    
    console.log('📋 Tablas creadas:');
    rows.forEach(row => {
      console.log(`  • ${row.name}`);
    });
    
    db.close();
    console.log('\n✅ Base de datos configurada correctamente!\n');
    
    // 5. Ejecutar migración de datos
    console.log('5️⃣ Ejecutando migración de datos...');
    execSync('node migrate-data.js', { stdio: 'inherit' });
    
    console.log('\n🎉 CONFIGURACIÓN COMPLETADA!');
    console.log('\n📋 PRÓXIMOS PASOS:');
    console.log('  1. npx prisma studio (para ver los datos)');
    console.log('  2. node verify-data.js (para verificar migración)');
    console.log('  3. Configurar variables de entorno para Atlantic.net');
    
  });
} catch (error) {
  console.error('❌ Error verificando base de datos:', error.message);
}
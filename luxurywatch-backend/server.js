#!/usr/bin/env node

/**
 * LuxuryWatch Backend Server
 * Entry point para la aplicación backend
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

// Verificar variables de entorno requeridas
const requiredEnvVars = [
  'DATABASE_URL',
  'REDIS_URL',
  'JWT_SECRET'
];

const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  console.error('❌ Variables de entorno requeridas faltantes:');
  missingEnvVars.forEach(envVar => {
    console.error(`   - ${envVar}`);
  });
  console.error('\n📝 Copia .env.example a .env y configura las variables');
  process.exit(1);
}

// Importar aplicación
const app = require('./src/app');
const logger = require('./src/utils/logger');

// Información de inicio
console.log(`
╔══════════════════════════════════════════════════════════════╗
║                    🚀 LUXURYWATCH BACKEND                    ║
║                                                                  ║
║  Plataforma de e-commerce de relojes de lujo                   ║
║  con configurador 3D, CRM y chat IA                           ║
║                                                                  ║
║  ✅ Configurador 3D Avanzado                                   ║
║  ✅ CRM Completo                                               ║
║  ✅ Chat IA Multi-Proveedor                                    ║
║  ✅ Sistema de Fallback Inteligente                            ║
║  ✅ Rate Limiting & Seguridad                                  ║
║  ✅ Monitoreo y Analytics                                      ║
║                                                                  ║
║  Desarrollado por: MiniMax Agent                              ║
║  Versión: 1.0.0                                                ║
╚══════════════════════════════════════════════════════════════╝
`);

// Iniciar servidor
const PORT = process.env.PORT || 3001;
const HOST = process.env.HOST || '0.0.0.0';

const server = app.listen(PORT, HOST, () => {
  console.log(`\n🌐 Servidor iniciado exitosamente:`);
  console.log(`   📍 Dirección: http://${HOST}:${PORT}`);
  console.log(`   🌍 Entorno: ${process.env.NODE_ENV || 'development'}`);
  console.log(`   🔧 Node.js: ${process.version}`);
  console.log(`   💾 PID: ${process.pid}`);
  console.log(`\n📡 Endpoints disponibles:`);
  console.log(`   🏥 Health Check: http://${HOST}:${PORT}/health`);
  console.log(`   ℹ️  API Info: http://${HOST}:${PORT}/api/info`);
  console.log(`   📦 Products: http://${HOST}:${PORT}/api/products`);
  console.log(`   👥 CRM: http://${HOST}:${PORT}/api/crm`);
  console.log(`   🤖 Chat: http://${HOST}:${PORT}/api/chat`);
  console.log(`\n🔧 Comandos útiles:`);
  console.log(`   📊 Status: curl http://${HOST}:${PORT}/health`);
  console.log(`   📋 Logs: tail -f logs/app.log`);
  console.log(`   🔄 Restart: npm run pm2:restart`);
  console.log(`\n✅ ¡Listo para recibir requests!`);
  console.log('');

  // Log de inicio
  logger.info('Servidor LuxuryWatch iniciado', {
    port: PORT,
    host: HOST,
    environment: process.env.NODE_ENV || 'development',
    nodeVersion: process.version,
    pid: process.pid
  });
});

// Manejo de errores no capturados
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection', {
    reason: reason?.message || reason,
    stack: reason?.stack,
    promise: promise.toString()
  });
  console.error('❌ Unhandled Rejection:', reason);
});

process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception', {
    message: error.message,
    stack: error.stack
  });
  console.error('❌ Uncaught Exception:', error.message);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM recibido, cerrando servidor...');
  console.log('\n🛑 Cerrando servidor gracefully...');
  server.close(() => {
    console.log('✅ Servidor cerrado exitosamente');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  logger.info('SIGINT recibido, cerrando servidor...');
  console.log('\n🛑 Cerrando servidor gracefully...');
  server.close(() => {
    console.log('✅ Servidor cerrado exitosamente');
    process.exit(0);
  });
});

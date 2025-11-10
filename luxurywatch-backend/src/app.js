const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs');

// Configuración
const { testConnection, closePool } = require('./config/database');
const { redis, cacheService } = require('./config/redis');
const { corsOptions } = require('./middleware/auth');
const { rateLimit, routeSpecificRateLimit } = require('./middleware/rateLimit');
const logger = require('./utils/logger');

// Rutas
const productsRoutes = require('./routes/products');
const crmRoutes = require('./routes/crm');
const chatRoutes = require('./routes/chat');

// Crear aplicación Express
const app = express();
const PORT = process.env.PORT || 3001;

// =====================================
// MIDDLEWARES GLOBALES
// =====================================

// Seguridad
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      scriptSrc: ["'self'"],
      connectSrc: ["'self'", "wss:", "https:"]
    }
  },
  crossOriginEmbedderPolicy: false
}));

// CORS
app.use(cors(corsOptions));

// Compresión
app.use(compression());

// Logging
if (process.env.NODE_ENV === 'production') {
  // En producción, log a archivo
  const logStream = fs.createWriteStream(path.join(__dirname, '../logs/access.log'), { flags: 'a' });
  app.use(morgan('combined', { stream: logStream }));
} else {
  // En desarrollo, log a consola
  app.use(morgan('dev'));
}

// Parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Headers de la aplicación
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});

// =====================================
// RUTAS PÚBLICAS
// =====================================

// Health check
app.get('/health', async (req, res) => {
  try {
    const [dbHealthy, redisHealthy] = await Promise.all([
      testConnection(),
      cacheService.healthCheck()
    ]);

    const health = {
      status: dbHealthy && redisHealthy ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.env.npm_package_version || '1.0.0',
      services: {
        database: dbHealthy ? 'healthy' : 'unhealthy',
        redis: redisHealthy ? 'healthy' : 'unhealthy'
      },
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + 'MB',
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + 'MB'
      }
    };

    res.status(dbHealthy && redisHealthy ? 200 : 503).json({
      success: dbHealthy && redisHealthy,
      data: health
    });
  } catch (error) {
    logger.error('Error en health check', error);
    res.status(503).json({
      success: false,
      error: 'Service unavailable',
      timestamp: new Date().toISOString()
    });
  }
});

// Info de la API
app.get('/api/info', (req, res) => {
  res.json({
    success: true,
    data: {
      name: 'LuxuryWatch API',
      version: '1.0.0',
      description: 'API para plataforma de e-commerce de relojes de lujo con configurador 3D y CRM',
      endpoints: {
        products: '/api/products',
        crm: '/api/crm',
        chat: '/api/chat',
        watchComponents: '/api/watch-components'
      },
      features: [
        'Configurador 3D de relojes',
        'CRM completo con gestión de clientes',
        'Chat IA con múltiples proveedores',
        'Sistema de fallback inteligente',
        'Gestión de productos y variaciones',
        'Panel de administración',
        'API con rate limiting',
        'Upload de archivos con procesamiento'
      ],
      documentation: 'https://api.luxurywatch.com/docs',
      support: 'support@luxurywatch.com'
    }
  });
});

// Rate limiting global
app.use(rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 1000, // 1000 requests por 15 minutos por IP
  message: 'Demasiadas requests desde esta IP, intenta más tarde.'
}));

// =====================================
// RUTAS DE LA API
// =====================================

// Productos
app.use('/api/products', productsRoutes);

// Componentes de watches (sub-ruta de productos)
app.use('/api/watch-components', productsRoutes);

// CRM
app.use('/api/crm', crmRoutes);

// Chat
app.use('/api/chat', chatRoutes);

// =====================================
// ARCHIVOS ESTÁTICOS
// =====================================

// Servir uploads
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Servir imágenes de productos
app.use('/images', express.static(path.join(__dirname, '../public/images')));

// =====================================
// WEBHOOKS
// =====================================

// Webhook para pagos
app.post('/webhooks/stripe', express.raw({ type: 'application/json' }), (req, res) => {
  const sig = req.headers['stripe-signature'];
  // Aquí se verificaría la firma del webhook
  logger.info('Webhook de Stripe recibido', { signature: sig });
  res.json({ received: true });
});

// Webhook para chat notifications
app.post('/webhooks/chat', (req, res) => {
  logger.info('Webhook de chat recibido', { body: req.body });
  res.json({ received: true });
});

// =====================================
// MANEJO DE ERRORES
// =====================================

// 404 para rutas no encontradas
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint no encontrado',
    path: req.originalUrl,
    method: req.method,
    timestamp: new Date().toISOString()
  });
});

// Error handler global
app.use((error, req, res, next) => {
  logger.error('Error no manejado', {
    error: error.message,
    stack: error.stack,
    path: req.path,
    method: req.method,
    body: req.body,
    params: req.params,
    query: req.query
  });

  // Error de validación
  if (error.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      error: 'Error de validación',
      details: error.details
    });
  }

  // Error de base de datos
  if (error.code === 'P2002') {
    return res.status(409).json({
      success: false,
      error: 'Conflicto de datos',
      message: 'El recurso ya existe'
    });
  }

  // Error de sintaxis en JSON
  if (error instanceof SyntaxError && error.status === 400 && 'body' in error) {
    return res.status(400).json({
      success: false,
      error: 'JSON inválido',
      message: 'El cuerpo de la request no es un JSON válido'
    });
  }

  // Error de Multer (upload)
  if (error.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({
      success: false,
      error: 'Archivo muy grande',
      message: 'El archivo excede el tamaño máximo permitido'
    });
  }

  if (error.code === 'LIMIT_FILE_COUNT') {
    return res.status(413).json({
      success: false,
      error: 'Demasiados archivos',
      message: 'Se excedió el número máximo de archivos'
    });
  }

  if (error.code === 'LIMIT_UNEXPECTED_FILE') {
    return res.status(400).json({
      success: false,
      error: 'Campo de archivo inesperado',
      message: 'El campo de archivo no es válido'
    });
  }

  // Error por defecto
  res.status(error.status || 500).json({
    success: false,
    error: process.env.NODE_ENV === 'production' ? 'Error interno del servidor' : error.message,
    timestamp: new Date().toISOString(),
    ...(process.env.NODE_ENV !== 'production' && { stack: error.stack })
  });
});

// =====================================
// SEÑALES DE PROCESO
// =====================================

// Manejo graceful de cierre
process.on('SIGTERM', async () => {
  logger.info('SIGTERM recibido, cerrando servidor...');
  await gracefulShutdown();
});

process.on('SIGINT', async () => {
  logger.info('SIGINT recibido, cerrando servidor...');
  await gracefulShutdown();
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection', { reason, promise });
});

process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception', { error: error.message, stack: error.stack });
  process.exit(1);
});

// =====================================
// FUNCIONES AUXILIARES
// =====================================

/**
 * Cerrado graceful del servidor
 */
const gracefulShutdown = async () => {
  try {
    logger.info('Iniciando cierre graceful...');
    
    // Cerrar servidor HTTP
    if (server) {
      server.close(() => {
        logger.info('Servidor HTTP cerrado');
      });
    }
    
    // Cerrar conexiones de base de datos
    await closePool();
    logger.info('Conexiones de base de datos cerradas');
    
    // Cerrar conexión de Redis
    await redis.quit();
    logger.info('Conexión de Redis cerrada');
    
    logger.info('Cierre graceful completado');
    process.exit(0);
  } catch (error) {
    logger.error('Error durante el cierre graceful', error);
    process.exit(1);
  }
};

// =====================================
// INICIALIZACIÓN
// =====================================

let server;

const startServer = async () => {
  try {
    // Verificar conexiones
    logger.info('Verificando conexiones...');
    
    const [dbHealthy, redisHealthy] = await Promise.all([
      testConnection(),
      cacheService.healthCheck()
    ]);

    if (!dbHealthy) {
      throw new Error('No se pudo conectar a la base de datos');
    }

    if (!redisHealthy) {
      throw new Error('No se pudo conectar a Redis');
    }

    logger.info('Conexiones verificadas exitosamente');

    // Iniciar servidor
    server = app.listen(PORT, process.env.HOST || '0.0.0.0', () => {
      logger.info(`🚀 Servidor iniciado exitosamente`, {
        port: PORT,
        host: process.env.HOST || '0.0.0.0',
        environment: process.env.NODE_ENV || 'development',
        nodeVersion: process.version,
        pid: process.pid
      });

      // Log de endpoints disponibles
      logger.info('📡 Endpoints disponibles:', {
        health: `http://localhost:${PORT}/health`,
        apiInfo: `http://localhost:${PORT}/api/info`,
        products: `http://localhost:${PORT}/api/products`,
        crm: `http://localhost:${PORT}/api/crm`,
        chat: `http://localhost:${PORT}/api/chat`
      });
    });

  } catch (error) {
    logger.error('Error iniciando servidor', error);
    process.exit(1);
  }
};

// Iniciar servidor
startServer();

module.exports = app;

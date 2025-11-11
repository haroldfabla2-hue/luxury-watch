const { cacheService } = require('../config/redis');
const logger = require('../utils/logger');

/**
 * Rate Limiter personalizado usando Redis
 */
class RateLimiter {
  constructor() {
    this.defaults = {
      windowMs: 15 * 60 * 1000, // 15 minutos
      max: 100, // máximo 100 requests
      keyGenerator: (req) => {
        // Generar clave basada en IP o user ID
        return req.user ? `user:${req.user.id}` : `ip:${req.ip}`;
      },
      message: 'Demasiadas requests, por favor intenta más tarde.',
      statusCode: 429,
      headers: true,
      standardHeaders: true, // rate limit info in the `RateLimit-*` headers
      legacyHeaders: false, // Disable the `X-RateLimit-*` headers
      skipSuccessfulRequests: false,
      skipFailedRequests: false
    };
  }

  /**
   * Crear middleware de rate limiting
   */
  create(options = {}) {
    const config = { ...this.defaults, ...options };
    
    return async (req, res, next) => {
      try {
        const key = config.keyGenerator(req);
        const current = await this.getCurrentCount(key, config.windowMs);
        
        if (current >= config.max) {
          // Log del rate limit
          logger.warn('Rate limit excedido', {
            key,
            current,
            limit: config.max,
            windowMs: config.windowMs,
            userAgent: req.get('User-Agent'),
            ip: req.ip
          });

          // Enviar headers de rate limit
          if (config.headers) {
            res.set({
              'Retry-After': Math.round(config.windowMs / 1000),
              'X-RateLimit-Limit': config.max,
              'X-RateLimit-Remaining': 0,
              'X-RateLimit-Reset': new Date(Date.now() + config.windowMs)
            });
          }

          // Responder según configuración
          if (config.skipSuccessfulRequests && res.statusCode < 400) {
            return next();
          }

          if (config.skipFailedRequests && res.statusCode >= 400) {
            return next();
          }

          return res.status(config.statusCode).json({
            success: false,
            error: config.message,
            retryAfter: Math.round(config.windowMs / 1000)
          });
        }

        // Incrementar contador
        await this.increment(key, config.windowMs);

        // Agregar headers
        if (config.headers) {
          res.set({
            'X-RateLimit-Limit': config.max,
            'X-RateLimit-Remaining': Math.max(0, config.max - current - 1),
            'X-RateLimit-Reset': new Date(Date.now() + config.windowMs)
          });
        }

        next();
      } catch (error) {
        logger.error('Error en rate limiter', error);
        // En caso de error con Redis, continuar sin rate limiting
        next();
      }
    };
  }

  /**
   * Obtener count actual para una clave
   */
  async getCurrentCount(key, windowMs) {
    try {
      const results = await Promise.all([
        cacheService.redis.get(key),
        cacheService.redis.get(`${key}:expire`)
      ]);

      const current = parseInt(results[0] || '0');
      const expireTime = parseInt(results[1] || '0');

      // Si la key no existe o ha expirado, retornar 0
      if (!expireTime || Date.now() > expireTime) {
        return 0;
      }

      return current;
    } catch (error) {
      logger.error('Error obteniendo count de rate limit', error);
      return 0;
    }
  }

  /**
   * Incrementar contador
   */
  async increment(key, windowMs) {
    try {
      const multi = cacheService.redis.multi();
      
      // Incrementar contador
      multi.incr(key);
      
      // Establecer expiración
      const expireTime = Date.now() + windowMs;
      multi.set(`${key}:expire`, expireTime.toString());
      multi.expireat(key, Math.floor(expireTime / 1000));
      multi.expireat(`${key}:expire`, Math.floor(expireTime / 1000));
      
      await multi.exec();
    } catch (error) {
      logger.error('Error incrementando rate limit', error);
    }
  }

  /**
   * Resetear rate limit para una clave
   */
  async reset(key) {
    try {
      await cacheService.redis.del(key, `${key}:expire`);
      logger.info('Rate limit reseteado', { key });
    } catch (error) {
      logger.error('Error reseteando rate limit', error);
    }
  }
}

// Instancia global del rate limiter
const rateLimiter = new RateLimiter();

/**
 * Rate limiting por defecto
 */
const rateLimit = (options = {}) => {
  return rateLimiter.create({
    max: 100,
    windowMs: 15 * 60 * 1000, // 15 minutos
    ...options
  });
};

/**
 * Rate limiting estricto (más restrictivo)
 */
const strictRateLimit = (options = {}) => {
  return rateLimiter.create({
    max: 20,
    windowMs: 15 * 60 * 1000, // 15 minutos
    message: 'Demasiadas requests. Intenta en 15 minutos.',
    ...options
  });
};

/**
 * Rate limiting para autenticación
 */
const authRateLimit = (options = {}) => {
  return rateLimiter.create({
    max: 5,
    windowMs: 15 * 60 * 1000, // 15 minutos
    keyGenerator: (req) => `auth:${req.ip}`,
    message: 'Demasiados intentos de autenticación. Intenta en 15 minutos.',
    ...options
  });
};

/**
 * Rate limiting para uploads
 */
const uploadRateLimit = (options = {}) => {
  return rateLimiter.create({
    max: 10,
    windowMs: 60 * 60 * 1000, // 1 hora
    keyGenerator: (req) => `upload:${req.user?.id || req.ip}`,
    message: 'Demasiados uploads. Intenta en 1 hora.',
    ...options
  });
};

/**
 * Rate limiting para chat
 */
const chatRateLimit = (options = {}) => {
  return rateLimiter.create({
    max: 20,
    windowMs: 60 * 1000, // 1 minuto
    keyGenerator: (req) => `chat:${req.user?.id || req.ip}`,
    message: 'Demasiados mensajes. Espera un momento.',
    ...options
  });
};

/**
 * Rate limiting para API externa
 */
const apiRateLimit = (options = {}) => {
  return rateLimiter.create({
    max: 1000,
    windowMs: 60 * 60 * 1000, // 1 hora
    keyGenerator: (req) => `api:${req.apiUser?.apiKeyId || req.ip}`,
    message: 'Límite de API excedido. Intenta en 1 hora.',
    ...options
  });
};

/**
 * Rate limiting para endpoints críticos
 */
const criticalRateLimit = (options = {}) => {
  return rateLimiter.create({
    max: 5,
    windowMs: 60 * 60 * 1000, // 1 hora
    keyGenerator: (req) => `critical:${req.user?.id || req.ip}`,
    message: 'Límite de requests críticos excedido.',
    ...options
  });
};

/**
 * Rate limiting para búsquedas
 */
const searchRateLimit = (options = {}) => {
  return rateLimiter.create({
    max: 30,
    windowMs: 15 * 60 * 1000, // 15 minutos
    keyGenerator: (req) => `search:${req.user?.id || req.ip}`,
    message: 'Demasiadas búsquedas. Intenta en 15 minutos.',
    ...options
  });
};

/**
 * Rate limiting dinámico basado en el usuario
 */
const dynamicRateLimit = () => {
  return async (req, res, next) => {
    try {
      let max = 100; // Default
      let windowMs = 15 * 60 * 1000; // 15 minutos

      // Ajustar límites según el tipo de usuario
      if (req.user) {
        switch (req.user.role) {
          case 'admin':
            max = 1000;
            windowMs = 60 * 60 * 1000; // 1 hora
            break;
          case 'manager':
            max = 500;
            windowMs = 60 * 60 * 1000; // 1 hora
            break;
          case 'sales':
            max = 300;
            windowMs = 30 * 60 * 1000; // 30 minutos
            break;
          case 'user':
            max = 100;
            windowMs = 15 * 60 * 1000; // 15 minutos
            break;
          default:
            max = 50;
            windowMs = 15 * 60 * 1000; // 15 minutos
        }
      }

      // Aplicar rate limiting dinámico
      const middleware = rateLimiter.create({
        max,
        windowMs,
        keyGenerator: (req) => `dynamic:${req.user?.id || req.ip}`,
        message: `Límite de requests excedido para tu rol (${req.user?.role || 'guest'})`
      });

      middleware(req, res, next);
    } catch (error) {
      logger.error('Error en rate limiting dinámico', error);
      next();
    }
  };
};

/**
 * Rate limiting por endpoint
 */
const endpointRateLimits = {
  // Autenticación
  'POST /auth/login': authRateLimit(),
  'POST /auth/register': authRateLimit({ max: 3 }),
  'POST /auth/forgot-password': authRateLimit({ max: 3 }),
  'POST /auth/reset-password': authRateLimit({ max: 3 }),
  
  // Chat
  'POST /api/chat/sessions': chatRateLimit({ max: 10 }),
  'POST /api/chat/sessions/*/messages': chatRateLimit({ max: 15 }),
  
  // Productos
  'GET /api/products': rateLimit({ max: 200 }),
  'GET /api/products/search': searchRateLimit({ max: 30 }),
  'POST /api/products': strictRateLimit({ max: 20 }),
  'PUT /api/products/*': strictRateLimit({ max: 30 }),
  'DELETE /api/products/*': criticalRateLimit({ max: 5 }),
  
  // CRM
  'GET /api/customers': rateLimit({ max: 100 }),
  'POST /api/customers': rateLimit({ max: 30 }),
  'GET /api/opportunities': rateLimit({ max: 100 }),
  'POST /api/opportunities': rateLimit({ max: 30 }),
  
  // Upload
  'POST /upload': uploadRateLimit(),
  
  // API externa
  'GET /api/*': apiRateLimit(),
  'POST /api/*': apiRateLimit({ max: 500 }),
  'PUT /api/*': apiRateLimit({ max: 200 }),
  'DELETE /api/*': apiRateLimit({ max: 50 })
};

/**
 * Rate limiting específico por ruta
 */
const routeSpecificRateLimit = (req, res, next) => {
  const route = `${req.method} ${req.route?.path || req.path}`;
  const middleware = endpointRateLimits[route];
  
  if (middleware) {
    return middleware(req, res, next);
  }
  
  // Aplicar rate limiting por defecto si no hay uno específico
  return rateLimit()(req, res, next);
};

module.exports = {
  rateLimit,
  strictRateLimit,
  authRateLimit,
  uploadRateLimit,
  chatRateLimit,
  apiRateLimit,
  criticalRateLimit,
  searchRateLimit,
  dynamicRateLimit,
  routeSpecificRateLimit,
  rateLimiter
};

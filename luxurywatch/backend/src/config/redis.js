const Redis = require('ioredis');
const logger = require('../utils/logger');

// Configuración de Redis
const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD || undefined,
  db: parseInt(process.env.REDIS_DB) || 0,
  
  // Configuración de retry
  retryDelayOnFailover: 100,
  enableReadyCheck: true,
  maxRetriesPerRequest: 3,
  
  // Configuración de keep alive
  keepAlive: 30000,
  
  // Configuración de conexión
  connectTimeout: 10000,
  lazyConnect: true,
  
  // Configuración de key prefixes
  keyPrefix: 'luxurywatch:',
  
  // Configuración de TLS (para producción)
  tls: process.env.NODE_ENV === 'production' ? {} : undefined
});

// Event listeners para logging
redis.on('connect', () => {
  logger.info('Conectado a Redis');
});

redis.on('ready', () => {
  logger.info('Redis listo para operaciones');
});

redis.on('error', (error) => {
  logger.error('Error en Redis', error);
});

redis.on('close', () => {
  logger.warn('Conexión a Redis cerrada');
});

// Utilidades de cache
class CacheService {
  constructor(redisClient) {
    this.redis = redisClient;
  }

  // Operaciones básicas
  async get(key) {
    try {
      const value = await this.redis.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      logger.error(`Error obteniendo cache para key: ${key}`, error);
      return null;
    }
  }

  async set(key, value, ttl = 3600) {
    try {
      const serialized = JSON.stringify(value);
      if (ttl > 0) {
        await this.redis.setex(key, ttl, serialized);
      } else {
        await this.redis.set(key, serialized);
      }
      return true;
    } catch (error) {
      logger.error(`Error guardando cache para key: ${key}`, error);
      return false;
    }
  }

  async del(key) {
    try {
      await this.redis.del(key);
      return true;
    } catch (error) {
      logger.error(`Error eliminando cache para key: ${key}`, error);
      return false;
    }
  }

  // Operaciones de hash
  async hget(key, field) {
    try {
      const value = await this.redis.hget(key, field);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      logger.error(`Error obteniendo hash para key: ${key}, field: ${field}`, error);
      return null;
    }
  }

  async hset(key, field, value, ttl) {
    try {
      const serialized = JSON.stringify(value);
      await this.redis.hset(key, field, serialized);
      if (ttl > 0) {
        await this.redis.expire(key, ttl);
      }
      return true;
    } catch (error) {
      logger.error(`Error guardando hash para key: ${key}, field: ${field}`, error);
      return false;
    }
  }

  async hdel(key, field) {
    try {
      await this.redis.hdel(key, field);
      return true;
    } catch (error) {
      logger.error(`Error eliminando hash para key: ${key}, field: ${field}`, error);
      return false;
    }
  }

  // Operaciones de lista
  async lpush(key, value) {
    try {
      const serialized = JSON.stringify(value);
      await this.redis.lpush(key, serialized);
      return true;
    } catch (error) {
      logger.error(`Error agregando a lista key: ${key}`, error);
      return false;
    }
  }

  async lrange(key, start = 0, stop = -1) {
    try {
      const values = await this.redis.lrange(key, start, stop);
      return values.map(v => JSON.parse(v));
    } catch (error) {
      logger.error(`Error obteniendo lista key: ${key}`, error);
      return [];
    }
  }

  // Operaciones de set
  async sadd(key, value) {
    try {
      await this.redis.sadd(key, JSON.stringify(value));
      return true;
    } catch (error) {
      logger.error(`Error agregando a set key: ${key}`, error);
      return false;
    }
  }

  async smembers(key) {
    try {
      const members = await this.redis.smembers(key);
      return members.map(m => JSON.parse(m));
    } catch (error) {
      logger.error(`Error obteniendo set key: ${key}`, error);
      return [];
    }
  }

  // Limpiar patrones
  async clearPattern(pattern) {
    try {
      const keys = await this.redis.keys(pattern);
      if (keys.length > 0) {
        await this.redis.del(...keys);
      }
      return keys.length;
    } catch (error) {
      logger.error(`Error limpiando patrón: ${pattern}`, error);
      return 0;
    }
  }

  // Rate limiting
  async checkRateLimit(key, limit, window) {
    try {
      const current = await this.redis.incr(key);
      if (current === 1) {
        await this.redis.expire(key, window);
      }
      return {
        allowed: current <= limit,
        remaining: Math.max(0, limit - current),
        resetTime: window
      };
    } catch (error) {
      logger.error(`Error verificando rate limit para key: ${key}`, error);
      return { allowed: true, remaining: limit, resetTime: window };
    }
  }

  // Sesiones de usuario
  async setUserSession(userId, sessionData, ttl = 86400) {
    return await this.set(`session:${userId}`, sessionData, ttl);
  }

  async getUserSession(userId) {
    return await this.get(`session:${userId}`);
  }

  async deleteUserSession(userId) {
    return await this.del(`session:${userId}`);
  }

  // Cache de productos
  async setProductCache(productId, productData, ttl = 3600) {
    return await this.set(`product:${productId}`, productData, ttl);
  }

  async getProductCache(productId) {
    return await this.get(`product:${productId}`);
  }

  async clearProductCache(productId) {
    return await this.del(`product:${productId}`);
  }

  // Cache de configuraciones 3D
  async set3DConfigCache(configId, configData, ttl = 1800) {
    return await this.set(`3d-config:${configId}`, configData, ttl);
  }

  async get3DConfigCache(configId) {
    return await this.get(`3d-config:${configId}`);
  }

  // Cache de chat sessions
  async setChatSession(sessionId, sessionData, ttl = 3600) {
    return await this.set(`chat:session:${sessionId}`, sessionData, ttl);
  }

  async getChatSession(sessionId) {
    return await this.get(`chat:session:${sessionId}`);
  }

  async deleteChatSession(sessionId) {
    return await this.del(`chat:session:${sessionId}`);
  }

  // Verificar salud de Redis
  async healthCheck() {
    try {
      const result = await this.redis.ping();
      return result === 'PONG';
    } catch (error) {
      logger.error('Error en health check de Redis', error);
      return false;
    }
  }
}

// Instancia del servicio de cache
const cacheService = new CacheService(redis);

// Verificar conexión al inicializar
redis.on('ready', async () => {
  const isHealthy = await cacheService.healthCheck();
  logger.info(`Redis health check: ${isHealthy ? 'OK' : 'FAILED'}`);
});

module.exports = {
  redis,
  cacheService
};

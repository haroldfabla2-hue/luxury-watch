/**
 * Servicio de Cache con Redis
 * Implementación de caching para mejorar performance
 */

const Redis = require('ioredis');
const logger = require('../utils/logger');

class CacheService {
  constructor() {
    this.redis = null;
    this.isConnected = false;
    this.defaultTTL = 3600; // 1 hora en segundos
    this.shortTTL = 300; // 5 minutos
    this.longTTL = 86400; // 24 horas
  }

  /**
   * Inicializar conexión con Redis
   */
  async connect() {
    try {
      if (!process.env.REDIS_URL) {
        logger.warn('Redis URL no configurado, cache deshabilitado');
        return;
      }

      this.redis = new Redis(process.env.REDIS_URL, {
        retryDelayOnFailover: 100,
        maxRetriesPerRequest: 3,
        lazyConnect: true
      });

      // Event listeners
      this.redis.on('connect', () => {
        logger.info('Redis conectado exitosamente');
        this.isConnected = true;
      });

      this.redis.on('error', (error) => {
        logger.error('Error en Redis:', error);
        this.isConnected = false;
      });

      this.redis.on('close', () => {
        logger.warn('Redis desconectado');
        this.isConnected = false;
      });

      await this.redis.connect();
    } catch (error) {
      logger.error('Error conectando a Redis:', error);
      this.isConnected = false;
    }
  }

  /**
   * Verificar si Redis está disponible
   */
  isAvailable() {
    return this.isConnected && this.redis;
  }

  /**
   * Obtener valor del cache
   */
  async get(key) {
    if (!this.isAvailable()) {
      logger.debug('Redis no disponible, cache miss para:', key);
      return null;
    }

    try {
      const value = await this.redis.get(key);
      if (value) {
        logger.debug('Cache hit para:', key);
        return JSON.parse(value);
      }
      logger.debug('Cache miss para:', key);
      return null;
    } catch (error) {
      logger.error('Error obteniendo del cache:', error);
      return null;
    }
  }

  /**
   * Establecer valor en cache
   */
  async set(key, value, ttl = this.defaultTTL) {
    if (!this.isAvailable()) {
      return false;
    }

    try {
      const stringValue = JSON.stringify(value);
      await this.redis.setex(key, ttl, stringValue);
      logger.debug('Cache set para:', key, 'TTL:', ttl);
      return true;
    } catch (error) {
      logger.error('Error estableciendo cache:', error);
      return false;
    }
  }

  /**
   * Eliminar clave del cache
   */
  async del(key) {
    if (!this.isAvailable()) {
      return false;
    }

    try {
      const result = await this.redis.del(key);
      logger.debug('Cache delete para:', key, 'resultado:', result);
      return result > 0;
    } catch (error) {
      logger.error('Error eliminando del cache:', error);
      return false;
    }
  }

  /**
   * Eliminar múltiples claves por patrón
   */
  async delPattern(pattern) {
    if (!this.isAvailable()) {
      return 0;
    }

    try {
      const keys = await this.redis.keys(pattern);
      if (keys.length > 0) {
        const result = await this.redis.del(...keys);
        logger.debug('Cache pattern delete:', pattern, 'keys:', keys.length);
        return result;
      }
      return 0;
    } catch (error) {
      logger.error('Error eliminando patrón del cache:', error);
      return 0;
    }
  }

  /**
   * Verificar si una clave existe
   */
  async exists(key) {
    if (!this.isAvailable()) {
      return false;
    }

    try {
      const result = await this.redis.exists(key);
      return result === 1;
    } catch (error) {
      logger.error('Error verificando existencia en cache:', error);
      return false;
    }
  }

  /**
   * Establecer TTL para una clave
   */
  async expire(key, ttl) {
    if (!this.isAvailable()) {
      return false;
    }

    try {
      const result = await this.redis.expire(key, ttl);
      return result === 1;
    } catch (error) {
      logger.error('Error estableciendo TTL en cache:', error);
      return false;
    }
  }

  /**
   * Obtener estadísticas del cache
   */
  async getStats() {
    if (!this.isAvailable()) {
      return {
        available: false,
        message: 'Redis no configurado o no disponible'
      };
    }

    try {
      const info = await this.redis.info();
      const memory = await this.redis.memory('USAGE');
      const connected = await this.redis.ping();
      
      return {
        available: true,
        connected: connected === 'PONG',
        memory: memory,
        info: info.split('\r\n').slice(0, 10) // Primeras 10 líneas de info
      };
    } catch (error) {
      logger.error('Error obteniendo estadísticas:', error);
      return {
        available: true,
        connected: false,
        error: error.message
      };
    }
  }

  /**
   * Limpiar todo el cache (usar con cuidado)
   */
  async flushAll() {
    if (!this.isAvailable()) {
      return false;
    }

    try {
      await this.redis.flushall();
      logger.info('Cache completamente limpiado');
      return true;
    } catch (error) {
      logger.error('Error limpiando cache:', error);
      return false;
    }
  }

  /**
   * Cache con middleware para funciones
   */
  cached(key, ttl = this.defaultTTL) {
    return async (fn, ...args) => {
      // Intentar obtener del cache
      const cached = await this.get(key);
      if (cached) {
        return cached;
      }

      // Ejecutar función y cachear resultado
      try {
        const result = await fn(...args);
        await this.set(key, result, ttl);
        return result;
      } catch (error) {
        logger.error('Error en función cacheada:', error);
        throw error;
      }
    };
  }

  /**
   * Cache específico para productos
   */
  async cacheProducts(products, ttl = this.defaultTTL) {
    const key = `products:all`;
    return await this.set(key, products, ttl);
  }

  async getCachedProducts() {
    const key = `products:all`;
    return await this.get(key);
  }

  async cacheProduct(productId, product, ttl = this.defaultTTL) {
    const key = `product:${productId}`;
    return await this.set(key, product, ttl);
  }

  async getCachedProduct(productId) {
    const key = `product:${productId}`;
    return await this.get(key);
  }

  async invalidateProduct(productId) {
    await this.del(`product:${productId}`);
    // Invalidar cache de lista de productos
    await this.del(`products:all`);
  }

  /**
   * Cache específico para clientes
   */
  async cacheCustomers(customers, ttl = this.longTTL) {
    const key = `customers:all`;
    return await this.set(key, customers, ttl);
  }

  async getCachedCustomers() {
    const key = `customers:all`;
    return await this.get(key);
  }

  async cacheCustomer(customerId, customer, ttl = this.longTTL) {
    const key = `customer:${customerId}`;
    return await this.set(key, customer, ttl);
  }

  async getCachedCustomer(customerId) {
    const key = `customer:${customerId}`;
    return await this.get(key);
  }

  async invalidateCustomer(customerId) {
    await this.del(`customer:${customerId}`);
    await this.del(`customers:all`);
  }

  /**
   * Cache para sesiones de usuario
   */
  async cacheUserSession(userId, sessionData, ttl = this.shortTTL) {
    const key = `session:user:${userId}`;
    return await this.set(key, sessionData, ttl);
  }

  async getUserSession(userId) {
    const key = `session:user:${userId}`;
    return await this.get(key);
  }

  async invalidateUserSession(userId) {
    const key = `session:user:${userId}`;
    return await this.del(key);
  }

  /**
   * Cache para analytics y estadísticas
   */
  async cacheAnalytics(key, data, ttl = this.longTTL) {
    return await this.set(`analytics:${key}`, data, ttl);
  }

  async getCachedAnalytics(key) {
    return await this.get(`analytics:${key}`);
  }

  async invalidateAnalytics() {
    await this.delPattern('analytics:*');
  }

  /**
   * Cerrar conexión con Redis
   */
  async disconnect() {
    if (this.redis && this.isConnected) {
      await this.redis.quit();
      logger.info('Redis desconectado');
    }
  }
}

// Singleton instance
const cacheService = new CacheService();

module.exports = cacheService;
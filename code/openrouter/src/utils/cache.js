const NodeCache = require('node-cache');
const logger = require('./logger');

/**
 * Sistema de caché para respuestas de OpenRouter
 */
class ResponseCache {
  constructor(config) {
    this.ttl = config.ttl || 3600; // 1 hour default
    this.maxSize = config.maxSize || 1000;
    this.enabled = config.enabled !== false;

    if (this.enabled) {
      this.cache = new NodeCache({
        stdTTL: this.ttl,
        checkperiod: Math.min(this.ttl / 2, 300), // Check every 5 minutes or half TTL
        useClones: false
      });

      // Set up cache statistics
      this.stats = {
        hits: 0,
        misses: 0,
        sets: 0,
        deletes: 0,
        expirations: 0,
        lastCleanup: new Date().toISOString()
      };

      // Handle cache errors
      this.cache.on('set', (key, value) => {
        this.stats.sets++;
        logger.debug('Cache set', { key, ttl: this.ttl });
      });

      this.cache.on('del', (key, value) => {
        this.stats.deletes++;
        logger.debug('Cache delete', { key });
      });

      this.cache.on('expired', (key, value) => {
        this.stats.expirations++;
        logger.debug('Cache expired', { key });
      });

      logger.info('Response Cache initialized', {
        ttl: this.ttl,
        maxSize: this.maxSize,
        enabled: this.enabled
      });
    } else {
      this.cache = null;
      this.stats = { disabled: true };
      logger.info('Response Cache disabled');
    }
  }

  /**
   * Obtiene un valor del caché
   * @param {string} key - Clave del caché
   * @returns {any|null} Valor del caché o null si no existe
   */
  get(key) {
    if (!this.enabled || !this.cache) return null;

    try {
      const value = this.cache.get(key);
      
      if (value !== undefined) {
        this.stats.hits++;
        logger.debug('Cache hit', { key });
        return value;
      } else {
        this.stats.misses++;
        logger.debug('Cache miss', { key });
        return null;
      }
    } catch (error) {
      logger.error('Cache get error', { key, error: error.message });
      this.stats.misses++;
      return null;
    }
  }

  /**
   * Establece un valor en el caché
   * @param {string} key - Clave del caché
   * @param {any} value - Valor a almacenar
   * @param {number} customTtl - TTL personalizado en segundos
   * @returns {boolean} True si se almacenó exitosamente
   */
  set(key, value, customTtl = null) {
    if (!this.enabled || !this.cache) return false;

    try {
      const ttl = customTtl || this.ttl;
      const result = this.cache.set(key, value, ttl);
      
      if (result) {
        logger.debug('Cache set successful', { key, ttl });
      } else {
        logger.warn('Cache set failed', { key, ttl });
      }
      
      return result;
    } catch (error) {
      logger.error('Cache set error', { key, error: error.message });
      return false;
    }
  }

  /**
   * Elimina una entrada del caché
   * @param {string} key - Clave a eliminar
   * @returns {number} Número de elementos eliminados
   */
  del(key) {
    if (!this.enabled || !this.cache) return 0;

    try {
      const result = this.cache.del(key);
      logger.debug('Cache delete result', { key, deleted: result });
      return result;
    } catch (error) {
      logger.error('Cache delete error', { key, error: error.message });
      return 0;
    }
  }

  /**
   * Verifica si una clave existe en el caché
   * @param {string} key - Clave a verificar
   * @returns {boolean} True si existe
   */
  has(key) {
    if (!this.enabled || !this.cache) return false;

    try {
      return this.cache.has(key);
    } catch (error) {
      logger.error('Cache has error', { key, error: error.message });
      return false;
    }
  }

  /**
   * Limpia todo el caché
   */
  clear() {
    if (!this.enabled || !this.cache) return;

    try {
      this.cache.flushAll();
      logger.info('Cache cleared');
    } catch (error) {
      logger.error('Cache clear error', { error: error.message });
    }
  }

  /**
   * Obtiene todas las claves del caché
   * @returns {Array<string>} Array de claves
   */
  keys() {
    if (!this.enabled || !this.cache) return [];

    try {
      return this.cache.keys();
    } catch (error) {
      logger.error('Cache keys error', { error: error.message });
      return [];
    }
  }

  /**
   * Obtiene estadísticas del caché
   * @returns {Object} Estadísticas actuales
   */
  getStats() {
    if (!this.enabled || !this.cache) {
      return { disabled: true };
    }

    try {
      const cacheStats = this.cache.getStats();
      
      return {
        enabled: this.enabled,
        totalKeys: cacheStats.keys,
        totalElements: cacheStats.ksize,
        hits: this.stats.hits,
        misses: this.stats.misses,
        hitRate: this.stats.hits + this.stats.missHits > 0 
          ? ((this.stats.hits / (this.stats.hits + this.stats.misses)) * 100).toFixed(2) 
          : '0.00',
        sets: this.stats.sets,
        deletes: this.stats.deletes,
        expirations: this.stats.expirations,
        lastCleanup: this.stats.lastCleanup,
        configuration: {
          ttl: this.ttl,
          maxSize: this.maxSize
        }
      };
    } catch (error) {
      logger.error('Cache stats error', { error: error.message });
      return { error: error.message };
    }
  }

  /**
   * Obtiene estadísticas detalladas de rendimiento
   * @returns {Object} Estadísticas de rendimiento
   */
  getPerformanceStats() {
    if (!this.enabled || !this.cache) {
      return { disabled: true };
    }

    const totalRequests = this.stats.hits + this.stats.misses;
    const hitRate = totalRequests > 0 ? (this.stats.hits / totalRequests * 100) : 0;
    const missRate = totalRequests > 0 ? (this.stats.misses / totalRequests * 100) : 0;

    return {
      totalRequests,
      hitRate: `${hitRate.toFixed(2)}%`,
      missRate: `${missRate.toFixed(2)}%`,
      efficiency: hitRate > 70 ? 'excellent' : hitRate > 50 ? 'good' : hitRate > 30 ? 'fair' : 'poor',
      operations: {
        successful: this.stats.sets + this.stats.hits,
        failed: this.stats.deletes + this.stats.expirations
      },
      uptime: new Date().toISOString()
    };
  }

  /**
   * Limpia entradas expiradas manualmente
   */
  cleanup() {
    if (!this.enabled || !this.cache) return;

    try {
      // NodeCache handles expiration automatically, but we can force a cleanup
      this.cache.flushStats();
      this.stats.lastCleanup = new Date().toISOString();
      
      logger.info('Cache cleanup performed');
    } catch (error) {
      logger.error('Cache cleanup error', { error: error.message });
    }
  }

  /**
   * Ajusta el TTL de todas las entradas
   * @param {number} newTtl - Nuevo TTL en segundos
   */
  adjustTtl(newTtl) {
    if (!this.enabled || !this.cache) return;

    const keys = this.keys();
    this.ttl = newTtl;
    
    // Update cache configuration
    this.cache.ttl = this.ttl;
    
    logger.info('Cache TTL adjusted', { newTtl, affectedKeys: keys.length });
  }

  /**
   * Obtiene el tamaño aproximado del caché en memoria
   * @returns {Object} Información de memoria
   */
  getMemoryInfo() {
    if (!this.enabled || !this.cache) {
      return { disabled: true };
    }

    try {
      const stats = this.cache.getStats();
      return {
        keys: stats.keys,
        elements: stats.ksize,
        estimatedMemory: `${(stats.vsize / 1024 / 1024).toFixed(2)} MB`,
        utilizationPercent: ((stats.keys / this.maxSize) * 100).toFixed(2)
      };
    } catch (error) {
      logger.error('Cache memory info error', { error: error.message });
      return { error: error.message };
    }
  }
}

module.exports = { ResponseCache };
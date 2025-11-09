/**
 * Rate Limiter para controlar el número de solicitudes a OpenRouter
 */
class RateLimiter {
  constructor(config) {
    this.perMinute = config.perMinute || 60;
    this.perHour = config.perHour || 1000;
    this.perDay = config.perDay || 10000;
    this.enabled = config.enabled !== false;

    // Request tracking
    this.requests = {
      minute: [],
      hour: [],
      day: []
    };

    // Statistics
    this.stats = {
      totalRequests: 0,
      rejectedRequests: 0,
      lastReset: new Date().toISOString()
    };

    logger.info('Rate Limiter initialized', {
      perMinute: this.perMinute,
      perHour: this.perHour,
      perDay: this.perDay,
      enabled: this.enabled
    });
  }

  /**
   * Limpia las solicitudes antiguas
   */
  _cleanOldRequests() {
    const now = Date.now();
    const minuteAgo = now - 60000;
    const hourAgo = now - 3600000;
    const dayAgo = now - 86400000;

    this.requests.minute = this.requests.minute.filter(time => time > minuteAgo);
    this.requests.hour = this.requests.hour.filter(time => time > hourAgo);
    this.requests.day = this.requests.day.filter(time => time > dayAgo);
  }

  /**
   * Verifica si se puede realizar una solicitud
   * @returns {Promise<void>} Resuelve si se puede proceder, rechaza si se debe esperar
   */
  async checkLimit() {
    if (!this.enabled) return;

    this._cleanOldRequests();
    const now = Date.now();

    // Check daily limit
    if (this.requests.day.length >= this.perDay) {
      const oldestRequest = Math.min(...this.requests.day);
      const waitTime = 86400000 - (now - oldestRequest);
      
      this.stats.rejectedRequests++;
      logger.warn('Daily rate limit exceeded', {
        current: this.requests.day.length,
        limit: this.perDay,
        waitTime: `${waitTime}ms`
      });
      
      throw new Error(`Daily rate limit exceeded. Wait ${Math.ceil(waitTime / 1000)} seconds.`);
    }

    // Check hourly limit
    if (this.requests.hour.length >= this.perHour) {
      const oldestRequest = Math.min(...this.requests.hour);
      const waitTime = 3600000 - (now - oldestRequest);
      
      this.stats.rejectedRequests++;
      logger.warn('Hourly rate limit exceeded', {
        current: this.requests.hour.length,
        limit: this.perHour,
        waitTime: `${waitTime}ms`
      });
      
      throw new Error(`Hourly rate limit exceeded. Wait ${Math.ceil(waitTime / 1000)} seconds.`);
    }

    // Check minute limit
    if (this.requests.minute.length >= this.perMinute) {
      const oldestRequest = Math.min(...this.requests.minute);
      const waitTime = 60000 - (now - oldestRequest);
      
      this.stats.rejectedRequests++;
      logger.warn('Minute rate limit exceeded', {
        current: this.requests.minute.length,
        limit: this.perMinute,
        waitTime: `${waitTime}ms`
      });
      
      throw new Error(`Rate limit exceeded. Wait ${Math.ceil(waitTime / 1000)} seconds.`);
    }

    // Record this request
    this._recordRequest(now);
  }

  /**
   * Registra una nueva solicitud
   * @param {number} timestamp - Timestamp de la solicitud
   */
  _recordRequest(timestamp) {
    this.requests.minute.push(timestamp);
    this.requests.hour.push(timestamp);
    this.requests.day.push(timestamp);
    this.stats.totalRequests++;
  }

  /**
   * Obtiene estadísticas del rate limiter
   * @returns {Object} Estadísticas actuales
   */
  getStats() {
    this._cleanOldRequests();
    
    return {
      enabled: this.enabled,
      limits: {
        perMinute: this.perMinute,
        perHour: this.perHour,
        perDay: this.perDay
      },
      currentUsage: {
        minute: this.requests.minute.length,
        hour: this.requests.hour.length,
        day: this.requests.day.length
      },
      usagePercentages: {
        minute: (this.requests.minute.length / this.perMinute * 100).toFixed(2),
        hour: (this.requests.hour.length / this.perHour * 100).toFixed(2),
        day: (this.requests.day.length / this.perDay * 100).toFixed(2)
      },
      statistics: {
        ...this.stats,
        lastUpdated: new Date().toISOString()
      }
    };
  }

  /**
   * Obtiene el tiempo estimado para la próxima ventana disponible
   * @returns {Object|null} Tiempo de espera o null si no hay límite
   */
  getNextAvailableTime() {
    this._cleanOldRequests();
    const now = Date.now();

    // Check if we're close to any limit
    if (this.requests.minute.length >= this.perMinute * 0.9) {
      const oldestRequest = Math.min(...this.requests.minute);
      const waitTime = 60000 - (now - oldestRequest);
      if (waitTime > 0) {
        return {
          reason: 'minute_limit',
          waitTime: Math.ceil(waitTime / 1000),
          waitTimeMs: waitTime
        };
      }
    }

    if (this.requests.hour.length >= this.perHour * 0.9) {
      const oldestRequest = Math.min(...this.requests.hour);
      const waitTime = 3600000 - (now - oldestRequest);
      if (waitTime > 0) {
        return {
          reason: 'hour_limit',
          waitTime: Math.ceil(waitTime / 1000),
          waitTimeMs: waitTime
        };
      }
    }

    if (this.requests.day.length >= this.perDay * 0.9) {
      const oldestRequest = Math.min(...this.requests.day);
      const waitTime = 86400000 - (now - oldestRequest);
      if (waitTime > 0) {
        return {
          reason: 'day_limit',
          waitTime: Math.ceil(waitTime / 1000),
          waitTimeMs: waitTime
        };
      }
    }

    return null;
  }

  /**
   * Resetea los contadores de uso
   */
  reset() {
    this.requests.minute = [];
    this.requests.hour = [];
    this.requests.day = [];
    this.stats.lastReset = new Date().toISOString();
    
    logger.info('Rate limiter statistics reset');
  }

  /**
   * Configura nuevos límites
   * @param {Object} newLimits - Nuevos límites
   */
  updateLimits(newLimits) {
    if (newLimits.perMinute) this.perMinute = newLimits.perMinute;
    if (newLimits.perHour) this.perHour = newLimits.perHour;
    if (newLimits.perDay) this.perDay = newLimits.perDay;

    logger.info('Rate limiter limits updated', newLimits);
  }
}

module.exports = { RateLimiter };
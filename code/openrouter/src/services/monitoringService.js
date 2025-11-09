const { MonitoringError } = require('../utils/errors');
const logger = require('../utils/logger');
const config = require('../config');

/**
 * Sistema de monitoreo para OpenRouter integration
 */
class MonitoringService {
  constructor(client, agentCoordinator = null) {
    this.client = client;
    this.agentCoordinator = agentCoordinator;
    this.isRunning = false;
    this.intervals = [];
    this.metrics = new Map();
    this.alerts = [];
    
    // Thresholds for alerts
    this.thresholds = {
      responseTime: 5000, // 5 seconds
      errorRate: 0.1, // 10%
      cacheHitRate: 0.7, // 70%
      rateLimitUsage: 0.9, // 90%
      memoryUsage: 0.8, // 80%
      diskUsage: 0.9 // 90%
    };

    logger.info('Monitoring Service initialized');
  }

  /**
   * Inicia el monitoreo
   */
  start() {
    if (this.isRunning) {
      logger.warn('Monitoring Service is already running');
      return;
    }

    this.isRunning = true;
    logger.info('Starting Monitoring Service');

    // Health check monitoring
    const healthInterval = setInterval(() => {
      this.performHealthCheck();
    }, config.monitoring.healthCheckInterval);

    // General monitoring
    const monitoringInterval = setInterval(() => {
      this.collectMetrics();
      this.checkAlerts();
      this.generateReport();
    }, config.monitoring.interval);

    this.intervals.push(healthInterval, monitoringInterval);

    logger.info('Monitoring Service started', {
      healthCheckInterval: config.monitoring.healthCheckInterval,
      monitoringInterval: config.monitoring.interval
    });
  }

  /**
   * Detiene el monitoreo
   */
  stop() {
    if (!this.isRunning) {
      return;
    }

    this.isRunning = false;
    
    // Clear all intervals
    this.intervals.forEach(interval => clearInterval(interval));
    this.intervals = [];

    logger.info('Monitoring Service stopped');
  }

  /**
   * Realiza verificación de salud
   */
  async performHealthCheck() {
    try {
      const health = await this.client.healthCheck();
      
      this.recordMetric('health.status', health.status === 'healthy' ? 1 : 0);
      this.recordMetric('health.responseTime', parseInt(health.responseTime));
      
      if (health.status === 'healthy') {
        logger.health('healthy', {
          responseTime: health.responseTime,
          rateLimits: health.rateLimits,
          cache: health.cache
        });
      } else {
        logger.health('unhealthy', {
          error: health.error,
          rateLimits: health.rateLimits
        });
        
        this.addAlert('unhealthy', 'System health check failed', {
          error: health.error
        });
      }

      return health;
    } catch (error) {
      logger.error('Health check failed', { error: error.message });
      this.recordMetric('health.status', 0);
      
      this.addAlert('critical', 'Health check error', {
        error: error.message
      });
    }
  }

  /**
   * Recolecta métricas del sistema
   */
  collectMetrics() {
    try {
      // Client metrics
      const rateLimitStats = this.client.getRateLimitStats();
      const cacheStats = this.client.getCacheStats();

      // Record rate limit metrics
      if (rateLimitStats.enabled) {
        this.recordMetric('rateLimit.usage.minute', 
          rateLimitStats.currentUsage.minute / rateLimitStats.limits.perMinute);
        this.recordMetric('rateLimit.usage.hour', 
          rateLimitStats.currentUsage.hour / rateLimitStats.limits.perHour);
        this.recordMetric('rateLimit.usage.day', 
          rateLimitStats.currentUsage.day / rateLimitStats.limits.perDay);
      }

      // Record cache metrics
      if (!cacheStats.disabled) {
        this.recordMetric('cache.hitRate', parseFloat(cacheStats.hitRate) / 100);
        this.recordMetric('cache.totalKeys', cacheStats.totalKeys);
      }

      // Agent metrics if coordinator is available
      if (this.agentCoordinator) {
        const agentStats = this.agentCoordinator.getAgentsStatus();
        const taskStats = this.agentCoordinator.getTaskStats();

        this.recordMetric('agents.total', agentStats.total);
        this.recordMetric('agents.idle', agentStats.idle);
        this.recordMetric('agents.busy', agentStats.busy);
        this.recordMetric('agents.queueLength', agentStats.queueLength);
        this.recordMetric('agents.activeTasks', agentStats.activeTasks);

        this.recordMetric('tasks.total', taskStats.total);
        this.recordMetric('tasks.processing', taskStats.processing);
        this.recordMetric('tasks.completed', taskStats.completed);
        this.recordMetric('tasks.failed', taskStats.failed);
        
        if (taskStats.averageProcessingTime > 0) {
          this.recordMetric('tasks.averageProcessingTime', taskStats.averageProcessingTime);
        }
      }

      // System metrics
      this.recordSystemMetrics();

      logger.debug('Metrics collected', {
        metricsCount: this.metrics.size,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Error collecting metrics', { error: error.message });
    }
  }

  /**
   * Registra métricas del sistema
   */
  recordSystemMetrics() {
    // Memory usage
    const memoryUsage = process.memoryUsage();
    this.recordMetric('system.memory.rss', memoryUsage.rss);
    this.recordMetric('system.memory.heapUsed', memoryUsage.heapUsed);
    this.recordMetric('system.memory.heapTotal', memoryUsage.heapTotal);
    this.recordMetric('system.memory.external', memoryUsage.external);

    // CPU usage (approximate)
    const cpuUsage = process.cpuUsage();
    this.recordMetric('system.cpu.user', cpuUsage.user);
    this.recordMetric('system.cpu.system', cpuUsage.system);

    // Uptime
    this.recordMetric('system.uptime', process.uptime());

    // Node.js version and platform
    this.recordMetric('system.nodejs.version', parseFloat(process.version.substring(1)));
  }

  /**
   * Registra una métrica
   * @param {string} name - Nombre de la métrica
   * @param {number} value - Valor de la métrica
   * @param {Object} tags - Tags adicionales
   */
  recordMetric(name, value, tags = {}) {
    const timestamp = Date.now();
    
    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }
    
    this.metrics.get(name).push({
      value,
      timestamp,
      tags
    });

    // Keep only recent metrics (last 24 hours)
    const cutoff = timestamp - (24 * 60 * 60 * 1000);
    const recentMetrics = this.metrics.get(name)
      .filter(metric => metric.timestamp > cutoff);
    
    this.metrics.set(name, recentMetrics);
  }

  /**
   * Obtiene métricas por nombre
   * @param {string} name - Nombre de la métrica
   * @param {number} since - Timestamp desde cuando obtener métricas
   * @returns {Array} Métricas filtradas
   */
  getMetrics(name, since = null) {
    if (!this.metrics.has(name)) {
      return [];
    }

    let metrics = this.metrics.get(name);
    
    if (since) {
      metrics = metrics.filter(metric => metric.timestamp > since);
    }

    return metrics;
  }

  /**
   * Calcula estadísticas de una métrica
   * @param {string} name - Nombre de la métrica
   * @param {number} since - Timestamp desde cuando calcular
   * @returns {Object|null} Estadísticas
   */
  calculateStats(name, since = null) {
    const metrics = this.getMetrics(name, since);
    
    if (metrics.length === 0) {
      return null;
    }

    const values = metrics.map(m => m.value);
    
    return {
      count: values.length,
      min: Math.min(...values),
      max: Math.max(...values),
      avg: values.reduce((sum, val) => sum + val, 0) / values.length,
      latest: values[values.length - 1],
      first: values[0],
      lastUpdate: metrics[metrics.length - 1].timestamp
    };
  }

  /**
   * Verifica alertas
   */
  checkAlerts() {
    // Response time alert
    const responseTimeStats = this.calculateStats('health.responseTime', Date.now() - 60000);
    if (responseTimeStats && responseTimeStats.avg > this.thresholds.responseTime) {
      this.addAlert('warning', 'High response time detected', {
        averageResponseTime: responseTimeStats.avg,
        threshold: this.thresholds.responseTime
      });
    }

    // Error rate alert
    const healthStats = this.calculateStats('health.status', Date.now() - 300000); // 5 minutes
    if (healthStats && healthStats.count > 10) {
      const errorRate = 1 - (healthStats.avg);
      if (errorRate > this.thresholds.errorRate) {
        this.addAlert('warning', 'High error rate detected', {
          errorRate,
          threshold: this.thresholds.errorRate
        });
      }
    }

    // Cache hit rate alert
    const cacheHitStats = this.calculateStats('cache.hitRate', Date.now() - 300000);
    if (cacheHitStats && cacheHitStats.avg < this.thresholds.cacheHitRate) {
      this.addAlert('warning', 'Low cache hit rate', {
        cacheHitRate: cacheHitStats.avg,
        threshold: this.thresholds.cacheHitRate
      });
    }

    // Rate limit usage alert
    const rateLimitStats = [
      this.calculateStats('rateLimit.usage.minute', Date.now() - 60000),
      this.calculateStats('rateLimit.usage.hour', Date.now() - 3600000),
      this.calculateStats('rateLimit.usage.day', Date.now() - 86400000)
    ];

    rateLimitStats.forEach((stats, index) => {
      if (stats && stats.latest > this.thresholds.rateLimitUsage) {
        const types = ['minute', 'hour', 'day'];
        this.addAlert('warning', `High rate limit usage (${types[index]})`, {
          usage: stats.latest,
          threshold: this.thresholds.rateLimitUsage,
          period: types[index]
        });
      }
    });

    // Memory usage alert
    const memoryStats = this.calculateStats('system.memory.heapUsed', Date.now() - 60000);
    const totalMemoryStats = this.calculateStats('system.memory.heapTotal', Date.now() - 60000);
    
    if (memoryStats && totalMemoryStats && totalMemoryStats.latest > 0) {
      const memoryUsageRatio = memoryStats.latest / totalMemoryStats.latest;
      if (memoryUsageRatio > this.thresholds.memoryUsage) {
        this.addAlert('warning', 'High memory usage', {
          memoryUsage: memoryUsageRatio,
          heapUsed: memoryStats.latest,
          heapTotal: totalMemoryStats.latest,
          threshold: this.thresholds.memoryUsage
        });
      }
    }

    // Clean old alerts
    this.cleanOldAlerts();
  }

  /**
   * Añade una alerta
   * @param {string} severity - Severidad (info, warning, critical)
   * @param {string} message - Mensaje de la alerta
   * @param {Object} data - Datos adicionales
   */
  addAlert(severity, message, data = {}) {
    const alert = {
      id: Date.now() + Math.random(),
      severity,
      message,
      data,
      timestamp: new Date().toISOString(),
      acknowledged: false
    };

    this.alerts.push(alert);

    logger.warn(`Alert: ${message}`, {
      severity,
      data,
      timestamp: alert.timestamp
    });

    // Keep only recent alerts (last 7 days)
    this.cleanOldAlerts(7 * 24 * 60 * 60 * 1000);

    this.emit('alert', alert);
  }

  /**
   * Limpia alertas antiguas
   * @param {number} maxAge - Edad máxima en milisegundos
   */
  cleanOldAlerts(maxAge = 24 * 60 * 60 * 1000) { // 24 hours default
    const cutoff = Date.now() - maxAge;
    this.alerts = this.alerts.filter(alert => 
      new Date(alert.timestamp).getTime() > cutoff
    );
  }

  /**
   * Obtiene alertas
   * @param {Object} filters - Filtros
   * @returns {Array} Alertas filtradas
   */
  getAlerts(filters = {}) {
    let alerts = [...this.alerts];

    if (filters.severity) {
      alerts = alerts.filter(alert => alert.severity === filters.severity);
    }

    if (filters.acknowledged !== undefined) {
      alerts = alerts.filter(alert => alert.acknowledged === filters.acknowledged);
    }

    if (filters.since) {
      alerts = alerts.filter(alert => 
        new Date(alert.timestamp).getTime() > filters.since
      );
    }

    return alerts.sort((a, b) => 
      new Date(b.timestamp) - new Date(a.timestamp)
    );
  }

  /**
   * Reconoce una alerta
   * @param {string} alertId - ID de la alerta
   * @returns {boolean} True si se reconoció exitosamente
   */
  acknowledgeAlert(alertId) {
    const alert = this.alerts.find(a => a.id === parseInt(alertId));
    if (alert) {
      alert.acknowledged = true;
      alert.acknowledgedAt = new Date().toISOString();
      return true;
    }
    return false;
  }

  /**
   * Genera un reporte de estado
   * @returns {Object} Reporte de estado
   */
  generateReport() {
    const now = Date.now();
    const oneHourAgo = now - 3600000;
    
    return {
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      metrics: {
        health: this.calculateStats('health.status', oneHourAgo),
        responseTime: this.calculateStats('health.responseTime', oneHourAgo),
        cacheHitRate: this.calculateStats('cache.hitRate', oneHourAgo),
        rateLimitUsage: {
          minute: this.calculateStats('rateLimit.usage.minute', now - 60000),
          hour: this.calculateStats('rateLimit.usage.hour', now - 3600000),
          day: this.calculateStats('rateLimit.usage.day', now - 86400000)
        }
      },
      alerts: {
        total: this.alerts.length,
        unacknowledged: this.alerts.filter(a => !a.acknowledged).length,
        recent: this.getAlerts({ since: oneHourAgo })
      },
      system: {
        memory: {
          used: this.calculateStats('system.memory.heapUsed', now - 60000),
          total: this.calculateStats('system.memory.heapTotal', now - 60000)
        },
        cpu: {
          user: this.calculateStats('system.cpu.user', now - 60000),
          system: this.calculateStats('system.cpu.system', now - 60000)
        }
      }
    };
  }

  /**
   * Exporta métricas en formato JSON
   * @param {number} since - Timestamp desde cuando exportar
   * @returns {string} JSON con las métricas
   */
  exportMetrics(since = null) {
    const exportData = {
      timestamp: new Date().toISOString(),
      metrics: {}
    };

    for (const [name, values] of this.metrics.entries()) {
      let filteredValues = values;
      
      if (since) {
        filteredValues = values.filter(v => v.timestamp > since);
      }

      exportData.metrics[name] = {
        values: filteredValues,
        count: filteredValues.length,
        latest: filteredValues[filteredValues.length - 1] || null
      };
    }

    return JSON.stringify(exportData, null, 2);
  }
}

// Extend EventEmitter for alerts
MonitoringService.prototype.emit = require('events').EventEmitter.prototype.emit;
MonitoringService.prototype.on = require('events').EventEmitter.prototype.on;

module.exports = MonitoringService;
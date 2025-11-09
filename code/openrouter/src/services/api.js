const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const Joi = require('joi');
const OpenRouterClient = require('../clients/openrouter');
const AgentCoordinator = require('../services/agentCoordinator');
const MonitoringService = require('../services/monitoringService');
const { ValidationError, ConfigurationError } = require('../utils/errors');
const logger = require('../utils/logger');
const config = require('../config');

/**
 * API REST para OpenRouter integration
 */
class OpenRouterAPI {
  constructor() {
    this.app = express();
    this.client = null;
    this.agentCoordinator = null;
    this.monitoringService = null;
    
    this.setupMiddleware();
    this.setupRoutes();
  }

  /**
   * Configura middleware de Express
   */
  setupMiddleware() {
    // Security middleware
    this.app.use(helmet(config.security.helmet));
    
    // CORS
    this.app.use(cors(config.security.cors));
    
    // Rate limiting
    this.app.use('/api/', rateLimit({
      windowMs: config.security.rateLimit.windowMs,
      max: config.security.rateLimit.max,
      message: {
        error: 'Too many requests from this IP'
      },
      standardHeaders: true,
      legacyHeaders: false
    }));

    // Body parsing
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Request logging
    this.app.use((req, res, next) => {
      const start = Date.now();
      
      res.on('finish', () => {
        const duration = Date.now() - start;
        logger.request(`${req.method} ${req.path}`, {
          ip: req.ip,
          userAgent: req.get('User-Agent'),
          status: res.statusCode,
          duration: `${duration}ms`
        });
      });
      
      next();
    });
  }

  /**
   * Configura las rutas de la API
   */
  setupRoutes() {
    const router = express.Router();

    // Health check
    router.get('/health', this.healthCheck.bind(this));
    
    // Direct OpenRouter endpoints
    router.post('/chat', this.chat.bind(this));
    router.post('/generate', this.generate.bind(this));
    router.post('/batch', this.batchGenerate.bind(this));
    
    // Model info and usage
    router.get('/model', this.getModelInfo.bind(this));
    router.get('/usage', this.getUsageStats.bind(this));
    
    // Agent coordination
    router.post('/agents/register', this.registerAgent.bind(this));
    router.delete('/agents/:agentId', this.unregisterAgent.bind(this));
    router.get('/agents', this.getAgentsStatus.bind(this));
    router.post('/agents/:agentId/task', this.createAgentTask.bind(this));
    router.get('/tasks', this.getTasksStatus.bind(this));
    router.delete('/tasks/:taskId', this.cancelTask.bind(this));
    
    // Monitoring
    router.get('/monitoring/report', this.getMonitoringReport.bind(this));
    router.get('/monitoring/alerts', this.getAlerts.bind(this));
    router.post('/monitoring/alerts/:alertId/acknowledge', this.acknowledgeAlert.bind(this));
    router.get('/monitoring/metrics', this.getMetrics.bind(this));
    
    // Cache management
    router.delete('/cache', this.clearCache.bind(this));
    router.get('/cache/stats', this.getCacheStats.bind(this));
    
    // System status
    router.get('/system/status', this.getSystemStatus.bind(this));

    this.app.use('/api/openrouter', router);

    // Error handling middleware
    this.app.use(this.errorHandler.bind(this));
    
    // 404 handler
    this.app.use('*', (req, res) => {
      res.status(404).json({
        error: 'Not Found',
        message: `Route ${req.originalUrl} not found`,
        timestamp: new Date().toISOString()
      });
    });
  }

  /**
   * Inicializa los servicios
   */
  async initialize() {
    try {
      // Initialize client
      this.client = new OpenRouterClient();
      
      // Test client
      await this.client.getModelInfo();
      logger.info('OpenRouter client initialized successfully');

      // Initialize agent coordinator if enabled
      if (config.agents.coordinationEnabled) {
        this.agentCoordinator = new AgentCoordinator();
        logger.info('Agent Coordinator initialized');
      }

      // Initialize monitoring if enabled
      if (config.monitoring.enabled) {
        this.monitoringService = new MonitoringService(this.client, this.agentCoordinator);
        this.monitoringService.start();
        logger.info('Monitoring Service started');
      }

    } catch (error) {
      logger.error('Failed to initialize OpenRouter API', { error: error.message });
      throw new ConfigurationError('Failed to initialize services', error.message);
    }
  }

  /**
   * Middleware para validar requests
   */
  validate(schema) {
    return (req, res, next) => {
      const { error } = schema.validate(req.body);
      if (error) {
        return res.status(400).json({
          error: 'Validation Error',
          message: error.details[0].message,
          timestamp: new Date().toISOString()
        });
      }
      next();
    };
  }

  /**
   * Health check endpoint
   */
  async healthCheck(req, res) {
    try {
      const health = await this.client.healthCheck();
      const status = health.status === 'healthy' ? 200 : 503;
      
      res.status(status).json({
        ...health,
        apiVersion: '1.0.0',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      logger.error('Health check failed', { error: error.message });
      res.status(503).json({
        status: 'unhealthy',
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Chat endpoint
   */
  async chat(req, res) {
    const schema = Joi.object({
      messages: Joi.array().items(
        Joi.object({
          role: Joi.string().valid('user', 'assistant', 'system').required(),
          content: Joi.string().required()
        })
      ).required(),
      system: Joi.string().optional(),
      temperature: Joi.number().min(0).max(2).default(0.7),
      max_tokens: Joi.number().min(1).max(32000).default(1000),
      top_p: Joi.number().min(0).max(1).default(0.9)
    });

    if (this.validate(schema)(req, res, () => {})) return;

    try {
      const result = await this.client.chat(req.body.messages, req.body);
      
      res.json({
        success: true,
        data: result,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      logger.error('Chat endpoint error', { error: error.message });
      this.handleError(res, error);
    }
  }

  /**
   * Generate response endpoint
   */
  async generate(req, res) {
    const schema = Joi.object({
      prompt: Joi.string().required(),
      system: Joi.string().optional(),
      temperature: Joi.number().min(0).max(2).default(0.7),
      max_tokens: Joi.number().min(1).max(32000).default(1000),
      top_p: Joi.number().min(0).max(1).default(0.9)
    });

    if (this.validate(schema)(req, res, () => {})) return;

    try {
      const result = await this.client.generateResponse(req.body.prompt, req.body);
      
      res.json({
        success: true,
        data: result,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      logger.error('Generate endpoint error', { error: error.message });
      this.handleError(res, error);
    }
  }

  /**
   * Batch generation endpoint
   */
  async batchGenerate(req, res) {
    const schema = Joi.object({
      prompts: Joi.array().items(Joi.string().required()).required(),
      temperature: Joi.number().min(0).max(2).default(0.7),
      max_tokens: Joi.number().min(1).max(32000).default(1000),
      top_p: Joi.number().min(0).max(1).default(0.9)
    });

    if (this.validate(schema)(req, res, () => {})) return;

    try {
      const results = await this.client.generateBatch(req.body.prompts, req.body);
      
      res.json({
        success: true,
        data: results,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      logger.error('Batch generate endpoint error', { error: error.message });
      this.handleError(res, error);
    }
  }

  /**
   * Get model info endpoint
   */
  async getModelInfo(req, res) {
    try {
      const modelInfo = await this.client.getModelInfo();
      
      res.json({
        success: true,
        data: modelInfo,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      logger.error('Get model info error', { error: error.message });
      this.handleError(res, error);
    }
  }

  /**
   * Get usage stats endpoint
   */
  async getUsageStats(req, res) {
    try {
      const usage = await this.client.getUsageStats();
      
      res.json({
        success: true,
        data: usage,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      logger.error('Get usage stats error', { error: error.message });
      this.handleError(res, error);
    }
  }

  /**
   * Register agent endpoint
   */
  registerAgent(req, res) {
    if (!this.agentCoordinator) {
      return res.status(503).json({
        error: 'Agent coordination disabled',
        message: 'Agent coordination is not enabled in the configuration'
      });
    }

    const schema = Joi.object({
      name: Joi.string().optional(),
      type: Joi.string().default('general'),
      capabilities: Joi.array().items(Joi.string()).default([]),
      temperature: Joi.number().min(0).max(2).default(0.7),
      maxTokens: Joi.number().min(1).max(32000).default(1000),
      systemPrompt: Joi.string().default('')
    });

    if (this.validate(schema)(req, res, () => {})) return;

    try {
      const agentId = req.params.agentId || `agent_${Date.now()}`;
      const agent = this.agentCoordinator.registerAgent(agentId, req.body);
      
      res.status(201).json({
        success: true,
        data: agent,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      logger.error('Register agent error', { error: error.message });
      this.handleError(res, error);
    }
  }

  /**
   * Unregister agent endpoint
   */
  unregisterAgent(req, res) {
    if (!this.agentCoordinator) {
      return res.status(503).json({
        error: 'Agent coordination disabled'
      });
    }

    try {
      const success = this.agentCoordinator.unregisterAgent(req.params.agentId);
      
      if (success) {
        res.json({
          success: true,
          message: 'Agent unregistered successfully',
          timestamp: new Date().toISOString()
        });
      } else {
        res.status(404).json({
          error: 'Agent not found',
          timestamp: new Date().toISOString()
        });
      }
    } catch (error) {
      logger.error('Unregister agent error', { error: error.message });
      this.handleError(res, error);
    }
  }

  /**
   * Get agents status endpoint
   */
  getAgentsStatus(req, res) {
    if (!this.agentCoordinator) {
      return res.status(503).json({
        error: 'Agent coordination disabled'
      });
    }

    try {
      const status = this.agentCoordinator.getAgentsStatus();
      
      res.json({
        success: true,
        data: status,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      logger.error('Get agents status error', { error: error.message });
      this.handleError(res, error);
    }
  }

  /**
   * Create agent task endpoint
   */
  createAgentTask(req, res) {
    if (!this.agentCoordinator) {
      return res.status(503).json({
        error: 'Agent coordination disabled'
      });
    }

    const schema = Joi.object({
      prompt: Joi.string().required(),
      type: Joi.string().default('general'),
      context: Joi.object().default({}),
      priority: Joi.number().default(0),
      timeout: Joi.number().min(1000).max(300000).default(60000)
    });

    if (this.validate(schema)(req, res, () => {})) return;

    try {
      const taskId = this.agentCoordinator.createTask({
        ...req.body,
        agentId: req.params.agentId
      });
      
      res.status(201).json({
        success: true,
        data: { taskId },
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      logger.error('Create agent task error', { error: error.message });
      this.handleError(res, error);
    }
  }

  /**
   * Get tasks status endpoint
   */
  getTasksStatus(req, res) {
    if (!this.agentCoordinator) {
      return res.status(503).json({
        error: 'Agent coordination disabled'
      });
    }

    try {
      const stats = this.agentCoordinator.getTaskStats();
      
      res.json({
        success: true,
        data: stats,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      logger.error('Get tasks status error', { error: error.message });
      this.handleError(res, error);
    }
  }

  /**
   * Cancel task endpoint
   */
  cancelTask(req, res) {
    if (!this.agentCoordinator) {
      return res.status(503).json({
        error: 'Agent coordination disabled'
      });
    }

    try {
      const success = this.agentCoordinator.cancelTask(req.params.taskId);
      
      if (success) {
        res.json({
          success: true,
          message: 'Task cancelled successfully',
          timestamp: new Date().toISOString()
        });
      } else {
        res.status(404).json({
          error: 'Task not found or cannot be cancelled',
          timestamp: new Date().toISOString()
        });
      }
    } catch (error) {
      logger.error('Cancel task error', { error: error.message });
      this.handleError(res, error);
    }
  }

  /**
   * Get monitoring report endpoint
   */
  getMonitoringReport(req, res) {
    if (!this.monitoringService) {
      return res.status(503).json({
        error: 'Monitoring disabled'
      });
    }

    try {
      const report = this.monitoringService.generateReport();
      
      res.json({
        success: true,
        data: report,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      logger.error('Get monitoring report error', { error: error.message });
      this.handleError(res, error);
    }
  }

  /**
   * Get alerts endpoint
   */
  getAlerts(req, res) {
    if (!this.monitoringService) {
      return res.status(503).json({
        error: 'Monitoring disabled'
      });
    }

    try {
      const alerts = this.monitoringService.getAlerts(req.query);
      
      res.json({
        success: true,
        data: alerts,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      logger.error('Get alerts error', { error: error.message });
      this.handleError(res, error);
    }
  }

  /**
   * Acknowledge alert endpoint
   */
  acknowledgeAlert(req, res) {
    if (!this.monitoringService) {
      return res.status(503).json({
        error: 'Monitoring disabled'
      });
    }

    try {
      const success = this.monitoringService.acknowledgeAlert(req.params.alertId);
      
      if (success) {
        res.json({
          success: true,
          message: 'Alert acknowledged successfully',
          timestamp: new Date().toISOString()
        });
      } else {
        res.status(404).json({
          error: 'Alert not found',
          timestamp: new Date().toISOString()
        });
      }
    } catch (error) {
      logger.error('Acknowledge alert error', { error: error.message });
      this.handleError(res, error);
    }
  }

  /**
   * Get metrics endpoint
   */
  getMetrics(req, res) {
    if (!this.monitoringService) {
      return res.status(503).json({
        error: 'Monitoring disabled'
      });
    }

    try {
      const { metric, since } = req.query;
      const sinceTimestamp = since ? parseInt(since) : null;
      
      if (metric) {
        const metrics = this.monitoringService.getMetrics(metric, sinceTimestamp);
        const stats = this.monitoringService.calculateStats(metric, sinceTimestamp);
        
        res.json({
          success: true,
          data: { metrics, stats },
          timestamp: new Date().toISOString()
        });
      } else {
        const exportData = this.monitoringService.exportMetrics(sinceTimestamp);
        res.json(JSON.parse(exportData));
      }
    } catch (error) {
      logger.error('Get metrics error', { error: error.message });
      this.handleError(res, error);
    }
  }

  /**
   * Clear cache endpoint
   */
  clearCache(req, res) {
    try {
      this.client.clearCache();
      
      res.json({
        success: true,
        message: 'Cache cleared successfully',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      logger.error('Clear cache error', { error: error.message });
      this.handleError(res, error);
    }
  }

  /**
   * Get cache stats endpoint
   */
  getCacheStats(req, res) {
    try {
      const stats = this.client.getCacheStats();
      
      res.json({
        success: true,
        data: stats,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      logger.error('Get cache stats error', { error: error.message });
      this.handleError(res, error);
    }
  }

  /**
   * Get system status endpoint
   */
  getSystemStatus(req, res) {
    try {
      const status = {
        client: {
          healthy: true,
          rateLimits: this.client.getRateLimitStats(),
          cache: this.client.getCacheStats()
        },
        agents: this.agentCoordinator ? {
          enabled: true,
          ...this.agentCoordinator.getAgentsStatus()
        } : { enabled: false },
        monitoring: this.monitoringService ? {
          enabled: true,
          running: this.monitoringService.isRunning
        } : { enabled: false },
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        timestamp: new Date().toISOString()
      };
      
      res.json({
        success: true,
        data: status,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      logger.error('Get system status error', { error: error.message });
      this.handleError(res, error);
    }
  }

  /**
   * Manejador de errores global
   */
  errorHandler(error, req, res, next) {
    logger.error('Unhandled error', {
      error: error.message,
      stack: error.stack,
      url: req.url,
      method: req.method,
      ip: req.ip
    });

    // Don't leak error details in production
    const message = process.env.NODE_ENV === 'production' 
      ? 'Internal server error' 
      : error.message;

    res.status(500).json({
      error: 'Internal Server Error',
      message,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Maneja errores específicos de la API
   */
  handleError(res, error) {
    const statusCode = error.statusCode || 500;
    const message = error.message || 'Internal server error';
    
    res.status(statusCode).json({
      error: error.name || 'ApiError',
      message,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Inicia el servidor
   */
  listen(port = 3000, callback) {
    this.app.listen(port, callback || (() => {
      logger.info(`OpenRouter API server started on port ${port}`);
    }));
  }

  /**
   * Obtiene la instancia de Express
   */
  getApp() {
    return this.app;
  }
}

module.exports = OpenRouterAPI;
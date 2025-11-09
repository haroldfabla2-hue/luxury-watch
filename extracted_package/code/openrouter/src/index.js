const OpenRouterAPI = require('./services/api');
const OpenRouterClient = require('./clients/openrouter');
const AgentCoordinator = require('./services/agentCoordinator');
const MonitoringService = require('./services/monitoringService');
const config = require('./config');
const logger = require('./utils/logger');

/**
 * Clase principal para el sistema de integración con OpenRouter
 */
class OpenRouterSystem {
  constructor() {
    this.client = null;
    this.agentCoordinator = null;
    this.monitoringService = null;
    this.api = null;
    this.initialized = false;
  }

  /**
   * Inicializa todos los componentes del sistema
   */
  async initialize() {
    try {
      logger.info('Initializing OpenRouter System...');

      // Initialize core client
      this.client = new OpenRouterClient();
      
      // Test client connection
      await this.client.getModelInfo();
      logger.info('OpenRouter client initialized and tested');

      // Initialize agent coordinator if enabled
      if (config.agents.coordinationEnabled) {
        this.agentCoordinator = new AgentCoordinator();
        logger.info('Agent Coordinator initialized');
      }

      // Initialize monitoring service if enabled
      if (config.monitoring.enabled) {
        this.monitoringService = new MonitoringService(this.client, this.agentCoordinator);
        this.monitoringService.start();
        logger.info('Monitoring Service started');
      }

      // Initialize API if requested
      if (process.env.ENABLE_API === 'true') {
        this.api = new OpenRouterAPI();
        await this.api.initialize();
        logger.info('API server initialized');
      }

      this.initialized = true;
      logger.info('OpenRouter System initialized successfully');

      return this;
    } catch (error) {
      logger.error('Failed to initialize OpenRouter System', { error: error.message });
      throw error;
    }
  }

  /**
   * Inicia el servidor API
   */
  startServer(port = process.env.PORT || 3000) {
    if (!this.initialized) {
      throw new Error('System must be initialized before starting server');
    }

    if (!this.api) {
      throw new Error('API is not enabled. Set ENABLE_API=true in environment');
    }

    return new Promise((resolve, reject) => {
      try {
        this.api.listen(port, () => {
          logger.info(`🚀 OpenRouter System running on port ${port}`);
          logger.info(`📊 Health check: http://localhost:${port}/api/openrouter/health`);
          logger.info(`📚 API docs: http://localhost:${port}/api/openrouter`);
          resolve(this.server);
        });
      } catch (error) {
        logger.error('Failed to start server', { error: error.message });
        reject(error);
      }
    });
  }

  /**
   * Obtiene el cliente directo
   */
  getClient() {
    return this.client;
  }

  /**
   * Obtiene el coordinador de agentes
   */
  getAgentCoordinator() {
    return this.agentCoordinator;
  }

  /**
   * Obtiene el servicio de monitoreo
   */
  getMonitoringService() {
    return this.monitoringService;
  }

  /**
   * Obtiene la API
   */
  getAPI() {
    return this.api;
  }

  /**
   * Cierra todos los servicios
   */
  async shutdown() {
    logger.info('Shutting down OpenRouter System...');

    try {
      // Stop monitoring service
      if (this.monitoringService) {
        this.monitoringService.stop();
        logger.info('Monitoring Service stopped');
      }

      // Stop API server
      if (this.server) {
        await new Promise(resolve => this.server.close(resolve));
        logger.info('API server stopped');
      }

      logger.info('OpenRouter System shutdown complete');
    } catch (error) {
      logger.error('Error during shutdown', { error: error.message });
    }
  }

  /**
   * Obtiene el estado completo del sistema
   */
  async getSystemStatus() {
    if (!this.initialized) {
      return { status: 'not_initialized' };
    }

    const status = {
      status: 'running',
      initialized: this.initialized,
      components: {
        client: !!this.client,
        agentCoordinator: !!this.agentCoordinator,
        monitoringService: !!this.monitoringService,
        api: !!this.api
      },
      timestamp: new Date().toISOString()
    };

    try {
      // Test client health
      const clientHealth = await this.client.healthCheck();
      status.client = clientHealth;

      // Add agent stats if available
      if (this.agentCoordinator) {
        status.agents = {
          ...this.agentCoordinator.getAgentsStatus(),
          ...this.agentCoordinator.getTaskStats()
        };
      }

      // Add monitoring stats if available
      if (this.monitoringService) {
        status.monitoring = this.monitoringService.generateReport();
      }

      status.status = 'healthy';
    } catch (error) {
      status.status = 'unhealthy';
      status.error = error.message;
    }

    return status;
  }
}

// Función de conveniencia para crear instancia del sistema
function createOpenRouterSystem() {
  return new OpenRouterSystem();
}

// Función de conveniencia para usar solo el cliente
async function createClient() {
  const client = new OpenRouterClient();
  await client.getModelInfo(); // Test connection
  return client;
}

// Función de conveniencia para usar con agentes
async function createAgentSystem() {
  const system = new OpenRouterSystem();
  await system.initialize();
  return system;
}

// Función de conveniencia para usar la API completa
async function createAPIServer(port = 3000) {
  const system = new OpenRouterSystem();
  await system.initialize();
  await system.startServer(port);
  return system;
}

module.exports = {
  OpenRouterSystem,
  createOpenRouterSystem,
  createClient,
  createAgentSystem,
  createAPIServer
};

// CLI usage
if (require.main === module) {
  (async () => {
    try {
      const port = parseInt(process.env.PORT) || 3000;
      const system = await createAPIServer(port);
      
      // Graceful shutdown
      process.on('SIGTERM', async () => {
        logger.info('Received SIGTERM, shutting down...');
        await system.shutdown();
        process.exit(0);
      });

      process.on('SIGINT', async () => {
        logger.info('Received SIGINT, shutting down...');
        await system.shutdown();
        process.exit(0);
      });

    } catch (error) {
      logger.error('Failed to start OpenRouter System', { error: error.message });
      process.exit(1);
    }
  })();
}
require('dotenv').config();

const config = {
  // OpenRouter Configuration
  openrouter: {
    apiKey: process.env.OPENROUTER_API_KEY,
    baseURL: process.env.OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1',
    model: process.env.OPENROUTER_MODEL || 'google/gemini-2.0-flash-exp:free',
    timeout: parseInt(process.env.API_TIMEOUT) || 30000,
    retries: parseInt(process.env.API_RETRIES) || 3,
    retryDelay: parseInt(process.env.API_RETRY_DELAY) || 1000,
  },

  // Rate Limiting Configuration
  rateLimit: {
    perMinute: parseInt(process.env.RATE_LIMIT_REQUESTS_PER_MINUTE) || 60,
    perHour: parseInt(process.env.RATE_LIMIT_REQUESTS_PER_HOUR) || 1000,
    perDay: parseInt(process.env.RATE_LIMIT_REQUESTS_PER_DAY) || 10000,
    enabled: true,
  },

  // Cache Configuration
  cache: {
    ttl: parseInt(process.env.CACHE_TTL_SECONDS) || 3600, // 1 hour
    maxSize: parseInt(process.env.CACHE_MAX_SIZE) || 1000,
    enabled: true,
  },

  // Logging Configuration
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    file: process.env.LOG_FILE || 'logs/openrouter.log',
    maxSize: process.env.LOG_MAX_SIZE || '10m',
    maxFiles: parseInt(process.env.LOG_MAX_FILES) || 5,
    enabled: true,
  },

  // Agent Configuration
  agents: {
    coordinationEnabled: process.env.AGENT_COORDINATION_ENABLED === 'true',
    maxConcurrent: parseInt(process.env.AGENT_MAX_CONCURRENT) || 5,
    timeout: parseInt(process.env.AGENT_TIMEOUT) || 60000,
  },

  // Monitoring Configuration
  monitoring: {
    enabled: process.env.MONITORING_ENABLED === 'true',
    interval: parseInt(process.env.MONITORING_INTERVAL) || 60000,
    healthCheckInterval: parseInt(process.env.HEALTH_CHECK_INTERVAL) || 30000,
  },

  // Security Configuration
  security: {
    cors: {
      origin: process.env.CORS_ORIGIN || '*',
      credentials: true,
    },
    helmet: {
      enabled: true,
    },
    rateLimit: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // limit each IP to 100 requests per windowMs
    },
  },
};

module.exports = config;
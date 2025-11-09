const winston = require('winston');
const path = require('path');
const fs = require('fs');
const config = require('../config');

// Ensure logs directory exists
const logDir = path.dirname(config.logging.file);
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// Custom log format
const logFormat = winston.format.combine(
  winston.format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss'
  }),
  winston.format.errors({ stack: true }),
  winston.format.json(),
  winston.format.prettyPrint()
);

// Console format for development
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({
    format: 'HH:mm:ss'
  }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    let msg = `${timestamp} [${level}]: ${message}`;
    if (Object.keys(meta).length > 0) {
      msg += `\n${JSON.stringify(meta, null, 2)}`;
    }
    return msg;
  })
);

// Create logger instance
const logger = winston.createLogger({
  level: config.logging.level,
  format: logFormat,
  defaultMeta: {
    service: 'openrouter-integration',
    version: '1.0.0'
  },
  transports: [
    // File transport for all logs
    new winston.transports.File({
      filename: config.logging.file,
      maxsize: parseSize(config.logging.maxSize),
      maxFiles: config.logging.maxFiles,
      tailable: true
    }),

    // File transport for errors only
    new winston.transports.File({
      filename: path.join(logDir, 'error.log'),
      level: 'error',
      maxsize: parseSize(config.logging.maxSize),
      maxFiles: config.logging.maxFiles,
      tailable: true
    })
  ],
  // Handle exceptions and rejections
  exceptionHandlers: [
    new winston.transports.File({
      filename: path.join(logDir, 'exceptions.log'),
      maxsize: parseSize(config.logging.maxSize),
      maxFiles: config.logging.maxFiles
    })
  ],
  rejectionHandlers: [
    new winston.transports.File({
      filename: path.join(logDir, 'rejections.log'),
      maxsize: parseSize(config.logging.maxSize),
      maxFiles: config.logging.maxFiles
    })
  ]
});

// Add console transport in development
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: consoleFormat
  }));
}

// Helper function to parse size strings like "10m", "1g", etc.
function parseSize(size) {
  const units = {
    'b': 1,
    'k': 1024,
    'm': 1024 * 1024,
    'g': 1024 * 1024 * 1024
  };
  
  const match = size.toLowerCase().match(/^(\d+)([kmg]?)$/);
  if (!match) return 10 * 1024 * 1024; // Default 10MB
  
  const value = parseInt(match[1]);
  const unit = match[2] || 'b';
  
  return value * (units[unit] || 1);
}

// Enhanced logger methods for OpenRouter integration
logger.request = (action, data) => {
  logger.info(`[REQUEST] ${action}`, { timestamp: new Date().toISOString(), ...data });
};

logger.response = (action, status, data) => {
  const level = status >= 400 ? 'warn' : 'info';
  logger[level](`[RESPONSE] ${action}`, { status, timestamp: new Date().toISOString(), ...data });
};

logger.error = (message, meta = {}) => {
  logger.error(message, {
    timestamp: new Date().toISOString(),
    stack: meta.stack,
    ...meta
  });
};

logger.performance = (operation, duration, meta = {}) => {
  logger.info(`[PERFORMANCE] ${operation}`, {
    duration: `${duration}ms`,
    timestamp: new Date().toISOString(),
    ...meta
  });
};

logger.rateLimit = (type, current, limit, meta = {}) => {
  const percentage = (current / limit * 100).toFixed(1);
  const level = percentage > 90 ? 'warn' : 'info';
  
  logger[level](`[RATE LIMIT] ${type}`, {
    current,
    limit,
    percentage: `${percentage}%`,
    timestamp: new Date().toISOString(),
    ...meta
  });
};

logger.cache = (action, key, meta = {}) => {
  logger.debug(`[CACHE] ${action}`, {
    key,
    timestamp: new Date().toISOString(),
    ...meta
  });
};

logger.agent = (agentId, action, meta = {}) => {
  logger.info(`[AGENT ${agentId}] ${action}`, {
    timestamp: new Date().toISOString(),
    ...meta
  });
};

logger.usage = (type, value, meta = {}) => {
  logger.info(`[USAGE] ${type}`, {
    value,
    timestamp: new Date().toISOString(),
    ...meta
  });
};

// Create a stream for Morgan HTTP logging (if needed)
logger.stream = {
  write: (message) => {
    logger.info(message.trim());
  }
};

// Performance monitoring wrapper
logger.monitor = (operation) => {
  const start = Date.now();
  return {
    end: (meta = {}) => {
      const duration = Date.now() - start;
      logger.performance(operation, duration, meta);
      return duration;
    }
  };
};

// Context logger for specific modules
logger.createContext = (context) => {
  return {
    info: (message, meta = {}) => logger.info(`[${context}] ${message}`, meta),
    warn: (message, meta = {}) => logger.warn(`[${context}] ${message}`, meta),
    error: (message, meta = {}) => logger.error(`[${context}] ${message}`, meta),
    debug: (message, meta = {}) => logger.debug(`[${context}] ${message}`, meta)
  };
};

// Health check logging
logger.health = (status, meta = {}) => {
  const level = status === 'healthy' ? 'info' : 'warn';
  logger[level](`[HEALTH] ${status}`, {
    timestamp: new Date().toISOString(),
    ...meta
  });
};

// Security logging
logger.security = (event, meta = {}) => {
  logger.warn(`[SECURITY] ${event}`, {
    timestamp: new Date().toISOString(),
    ...meta
  });
};

// Graceful shutdown handling
process.on('SIGTERM', () => {
  logger.info('Received SIGTERM, shutting down gracefully');
});

process.on('SIGINT', () => {
  logger.info('Received SIGINT, shutting down gracefully');
});

process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception', {
    error: error.message,
    stack: error.stack
  });
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection', {
    reason: reason?.message || reason,
    stack: reason?.stack,
    promise
  });
});

module.exports = logger;
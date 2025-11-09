/**
 * Errores personalizados para el sistema OpenRouter
 */

/**
 * Error base para la API de OpenRouter
 */
class OpenRouterError extends Error {
  constructor(message, code = null, details = null) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.details = details;
    this.timestamp = new Date().toISOString();
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      details: this.details,
      timestamp: this.timestamp
    };
  }
}

/**
 * Error de API general
 */
class ApiError extends OpenRouterError {
  constructor(message, statusCode = null, originalError = null) {
    super(message, 'API_ERROR', {
      statusCode,
      originalError: originalError?.message,
      stack: originalError?.stack
    });
    this.statusCode = statusCode;
  }
}

/**
 * Error de límite de velocidad (Rate Limit)
 */
class RateLimitError extends OpenRouterError {
  constructor(message, headers = null, originalError = null) {
    super(message, 'RATE_LIMIT_ERROR', {
      headers,
      originalError: originalError?.message,
      retryAfter: headers?.['retry-after'] || null,
      resetTime: headers?.['x-ratelimit-reset'] || null
    });
    
    this.retryAfter = headers?.['retry-after'];
    this.resetTime = headers?.['x-ratelimit-reset'];
  }
}

/**
 * Error de timeout
 */
class TimeoutError extends OpenRouterError {
  constructor(message, originalError = null) {
    super(message, 'TIMEOUT_ERROR', {
      originalError: originalError?.message,
      timeout: originalError?.config?.timeout || null
    });
  }
}

/**
 * Error de autenticación
 */
class AuthenticationError extends OpenRouterError {
  constructor(message = 'Authentication failed', details = null) {
    super(message, 'AUTHENTICATION_ERROR', details);
  }
}

/**
 * Error de autorización
 */
class AuthorizationError extends OpenRouterError {
  constructor(message = 'Authorization failed', details = null) {
    super(message, 'AUTHORIZATION_ERROR', details);
  }
}

/**
 * Error de validación
 */
class ValidationError extends OpenRouterError {
  constructor(message, validationErrors = null) {
    super(message, 'VALIDATION_ERROR', {
      validationErrors
    });
    this.validationErrors = validationErrors;
  }
}

/**
 * Error de configuración
 */
class ConfigurationError extends OpenRouterError {
  constructor(message, configKey = null) {
    super(message, 'CONFIGURATION_ERROR', {
      configKey
    });
    this.configKey = configKey;
  }
}

/**
 * Error de caché
 */
class CacheError extends OpenRouterError {
  constructor(message, operation = null, key = null) {
    super(message, 'CACHE_ERROR', {
      operation,
      key
    });
    this.operation = operation;
    this.key = key;
  }
}

/**
 * Error del sistema de agentes
 */
class AgentError extends OpenRouterError {
  constructor(message, agentId = null, operation = null) {
    super(message, 'AGENT_ERROR', {
      agentId,
      operation
    });
    this.agentId = agentId;
    this.operation = operation;
  }
}

/**
 * Error de coordinación de agentes
 */
class CoordinationError extends OpenRouterError {
  constructor(message, agentIds = null, reason = null) {
    super(message, 'COORDINATION_ERROR', {
      agentIds,
      reason
    });
    this.agentIds = agentIds;
    this.reason = reason;
  }
}

/**
 * Error de monitoreo
 */
class MonitoringError extends OpenRouterError {
  constructor(message, metric = null, value = null) {
    super(message, 'MONITORING_ERROR', {
      metric,
      value
    });
    this.metric = metric;
    this.value = value;
  }
}

/**
 * Utilidades para manejo de errores
 */
class ErrorHandler {
  /**
   * Determina si un error es recuperable
   * @param {Error} error - Error a evaluar
   * @returns {boolean} True si es recuperable
   */
  static isRecoverable(error) {
    if (error instanceof RateLimitError) return false;
    if (error instanceof AuthenticationError) return false;
    if (error instanceof AuthorizationError) return false;
    
    const retryableStatuses = [408, 429, 500, 502, 503, 504];
    return retryableStatuses.includes(error.statusCode) || 
           error instanceof TimeoutError;
  }

  /**
   * Obtiene el tiempo de espera recomendado para reintentar
   * @param {Error} error - Error ocurrido
   * @returns {number} Tiempo de espera en milisegundos
   */
  static getRetryDelay(error) {
    if (error instanceof RateLimitError && error.retryAfter) {
      return parseInt(error.retryAfter) * 1000;
    }
    
    if (error instanceof TimeoutError) {
      return 5000; // 5 seconds for timeouts
    }
    
    const statusCode = error.statusCode;
    switch (statusCode) {
      case 408: // Request Timeout
        return 2000;
      case 429: // Too Many Requests
        return 60000; // 1 minute
      case 500: // Internal Server Error
        return 5000;
      case 502: // Bad Gateway
        return 10000;
      case 503: // Service Unavailable
        return 30000;
      case 504: // Gateway Timeout
        return 10000;
      default:
        return 1000;
    }
  }

  /**
   * Crea un error basado en el código de estado HTTP
   * @param {number} status - Código de estado HTTP
   * @param {string} message - Mensaje de error
   * @param {Error} originalError - Error original
   * @returns {Error} Error especializado
   */
  static createFromStatus(status, message, originalError = null) {
    switch (status) {
      case 400:
        return new ValidationError(message, originalError?.details);
      case 401:
        return new AuthenticationError(message, originalError?.details);
      case 403:
        return new AuthorizationError(message, originalError?.details);
      case 404:
        return new ApiError(message, status, originalError);
      case 408:
        return new TimeoutError(message, originalError);
      case 429:
        return new RateLimitError(message, originalError?.headers, originalError);
      case 500:
      case 502:
      case 503:
      case 504:
        return new ApiError(message, status, originalError);
      default:
        return new ApiError(message, status, originalError);
    }
  }

  /**
   * Registra un error en el logger
   * @param {Error} error - Error a registrar
   * @param {Object} context - Contexto adicional
   */
  static log(error, context = {}) {
    const logger = require('./logger');
    
    logger.error(error.message, {
      errorType: error.name,
      errorCode: error.code,
      stack: error.stack,
      context,
      timestamp: new Date().toISOString()
    });

    // Log additional details for specific error types
    if (error instanceof RateLimitError) {
      logger.warn('Rate limit details', {
        retryAfter: error.retryAfter,
        resetTime: error.resetTime
      });
    }

    if (error instanceof TimeoutError) {
      logger.warn('Timeout details', {
        timeout: error.timeout
      });
    }
  }
}

module.exports = {
  OpenRouterError,
  ApiError,
  RateLimitError,
  TimeoutError,
  AuthenticationError,
  AuthorizationError,
  ValidationError,
  ConfigurationError,
  CacheError,
  AgentError,
  CoordinationError,
  MonitoringError,
  ErrorHandler
};
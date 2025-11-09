const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
const config = require('../config');
const logger = require('../utils/logger');
const { RateLimiter } = require('../utils/rateLimiter');
const { ResponseCache } = require('../utils/cache');
const { ApiError, RateLimitError, TimeoutError } = require('../utils/errors');

/**
 * Cliente principal para OpenRouter con Gemini 2.0 Experimental Free
 */
class OpenRouterClient {
  constructor() {
    this.apiKey = config.openrouter.apiKey;
    this.baseURL = config.openrouter.baseURL;
    this.model = config.openrouter.model;
    this.timeout = config.openrouter.timeout;
    this.retries = config.openrouter.retries;
    this.retryDelay = config.openrouter.retryDelay;
    
    // Initialize rate limiter
    this.rateLimiter = new RateLimiter(config.rateLimit);
    
    // Initialize cache
    this.cache = new ResponseCache(config.cache);
    
    // Initialize axios instance
    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: this.timeout,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://openrouter-integration.local',
        'X-Title': 'OpenRouter Gemini 2 Integration'
      }
    });

    // Add request interceptor for logging
    this.client.interceptors.request.use(
      (request) => {
        request.metadata = {
          requestId: uuidv4(),
          timestamp: Date.now(),
          model: this.model
        };
        logger.info('Request initiated', {
          requestId: request.metadata.requestId,
          model: this.model,
          endpoint: request.url
        });
        return request;
      },
      (error) => {
        logger.error('Request interceptor error', { error: error.message });
        return Promise.reject(error);
      }
    );

    // Add response interceptor for logging and error handling
    this.client.interceptors.response.use(
      (response) => {
        const duration = Date.now() - response.config.metadata.timestamp;
        logger.info('Request completed', {
          requestId: response.config.metadata.requestId,
          status: response.status,
          duration: `${duration}ms`
        });
        return response;
      },
      (error) => {
        const requestId = error.config?.metadata?.requestId || 'unknown';
        const duration = error.config ? Date.now() - error.config.metadata.timestamp : 0;
        
        logger.error('Request failed', {
          requestId,
          error: error.message,
          status: error.response?.status,
          duration: `${duration}ms`
        });
        
        return Promise.reject(this._handleError(error));
      }
    );
  }

  /**
   * Maneja errores de la API y los convierte a tipos específicos
   * @param {Error} error - Error original de axios
   * @returns {Error} Error especializado
   */
  _handleError(error) {
    if (error.code === 'ECONNABORTED') {
      return new TimeoutError(`Request timeout after ${this.timeout}ms`, error);
    }

    if (error.response) {
      const status = error.response.status;
      const data = error.response.data;

      switch (status) {
        case 429:
          return new RateLimitError(
            data?.error?.message || 'Rate limit exceeded',
            error.response.headers,
            error
          );
        case 401:
          return new ApiError('Unauthorized - Invalid API key', status, error);
        case 403:
          return new ApiError('Forbidden - Access denied', status, error);
        case 404:
          return new ApiError('Not found', status, error);
        case 422:
          return new ApiError('Unprocessable entity', status, error);
        case 500:
          return new ApiError('Internal server error', status, error);
        default:
          return new ApiError(
            data?.error?.message || `HTTP ${status} error`,
            status,
            error
          );
      }
    }

    if (error.request) {
      return new ApiError('Network error - No response received', 0, error);
    }

    return new ApiError(error.message || 'Unknown error', 0, error);
  }

  /**
   * Genera una clave de caché para una solicitud
   * @param {Object} params - Parámetros de la solicitud
   * @returns {string} Clave de caché
   */
  _generateCacheKey(params) {
    const { messages, system, temperature, max_tokens, top_p } = params;
    return `gemini2_${JSON.stringify({ messages, system, temperature, max_tokens, top_p })}`;
  }

  /**
   * Realiza una solicitud con reintentos automáticos
   * @param {Object} params - Parámetros de la solicitud
   * @param {number} attempt - Número de intento actual
   * @returns {Promise} Respuesta de la API
   */
  async _requestWithRetry(params, attempt = 1) {
    // Check rate limiting
    await this.rateLimiter.checkLimit();
    
    // Check cache for GET-like requests (when using cache key)
    const cacheKey = this._generateCacheKey(params);
    if (config.cache.enabled) {
      const cached = this.cache.get(cacheKey);
      if (cached) {
        logger.info('Cache hit', { cacheKey });
        return cached;
      }
    }

    try {
      const requestData = {
        model: this.model,
        messages: params.messages || [],
        system: params.system,
        temperature: params.temperature || 0.7,
        max_tokens: params.max_tokens || 1000,
        top_p: params.top_p || 0.9,
        stream: params.stream || false,
      };

      // Remove undefined values
      Object.keys(requestData).forEach(key => {
        if (requestData[key] === undefined) {
          delete requestData[key];
        }
      });

      const response = await this.client.post('/chat/completions', requestData);
      const result = {
        content: response.data.choices[0]?.message?.content || '',
        usage: response.data.usage,
        model: response.data.model,
        id: response.data.id,
        created: response.data.created,
      };

      // Cache successful responses
      if (config.cache.enabled && result.content) {
        this.cache.set(cacheKey, result);
      }

      return result;

    } catch (error) {
      // Retry on specific errors
      if (attempt < this.retries && this._isRetryableError(error)) {
        logger.warn(`Retry attempt ${attempt + 1}/${this.retries}`, {
          error: error.message,
          requestId: error.config?.metadata?.requestId
        });
        
        await this._sleep(this.retryDelay * attempt);
        return this._requestWithRetry(params, attempt + 1);
      }
      
      throw error;
    }
  }

  /**
   * Verifica si un error es reintentable
   * @param {Error} error - Error a verificar
   * @returns {boolean} True si es reintentable
   */
  _isRetryableError(error) {
    if (error instanceof RateLimitError) return false;
    if (error instanceof TimeoutError) return true;
    
    const status = error.response?.status;
    return status >= 500 || status === 408 || status === 429;
  }

  /**
   * Pausa la ejecución por un tiempo determinado
   * @param {number} ms - Milisegundos a esperar
   */
  _sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Genera una respuesta basada en un prompt
   * @param {string} prompt - Prompt para generar respuesta
   * @param {Object} options - Opciones adicionales
   * @returns {Promise<Object>} Respuesta generada
   */
  async generateResponse(prompt, options = {}) {
    const messages = [
      {
        role: 'user',
        content: prompt
      }
    ];

    return this._requestWithRetry({
      messages,
      ...options
    });
  }

  /**
   * Genera una respuesta basada en conversación
   * @param {Array} messages - Array de mensajes de conversación
   * @param {Object} options - Opciones adicionales
   * @returns {Promise<Object>} Respuesta generada
   */
  async chat(messages, options = {}) {
    return this._requestWithRetry({
      messages,
      ...options
    });
  }

  /**
   * Genera múltiples respuestas en paralelo
   * @param {Array} prompts - Array de prompts
   * @param {Object} options - Opciones para todas las solicitudes
   * @returns {Promise<Array>} Array de respuestas
   */
  async generateBatch(prompts, options = {}) {
    const requests = prompts.map(prompt => 
      this.generateResponse(prompt, options).catch(error => ({ error: error.message }))
    );

    return Promise.all(requests);
  }

  /**
   * Obtiene información del modelo disponible
   * @returns {Promise<Object>} Información del modelo
   */
  async getModelInfo() {
    try {
      const response = await this.client.get('/models');
      const models = response.data.data;
      
      return models.find(model => model.id === this.model) || {
        id: this.model,
        name: 'Gemini 2.0 Experimental Free',
        description: 'Experimental version of Gemini 2.0 with free tier access'
      };
    } catch (error) {
      logger.warn('Could not fetch model info, using defaults', { error: error.message });
      return {
        id: this.model,
        name: 'Gemini 2.0 Experimental Free',
        description: 'Experimental version of Gemini 2.0 with free tier access',
        context_length: 1000000,
        pricing: {
          prompt: "0",
          completion: "0"
        }
      };
    }
  }

  /**
   * Obtiene estadísticas de uso
   * @returns {Promise<Object>} Estadísticas de uso
   */
  async getUsageStats() {
    try {
      const response = await this.client.get('/key');
      return {
        credits: response.data.credits,
        usedCredits: response.data.used_credits,
        remainingCredits: response.data.credits - response.data.used_credits,
        rateLimits: this.rateLimiter.getStats()
      };
    } catch (error) {
      logger.warn('Could not fetch usage stats', { error: error.message });
      return {
        credits: 0,
        usedCredits: 0,
        remainingCredits: 0,
        rateLimits: this.rateLimiter.getStats()
      };
    }
  }

  /**
   * Verifica el estado del cliente
   * @returns {Promise<Object>} Estado del cliente
   */
  async healthCheck() {
    try {
      const startTime = Date.now();
      await this.getModelInfo();
      const responseTime = Date.now() - startTime;

      return {
        status: 'healthy',
        responseTime: `${responseTime}ms`,
        timestamp: new Date().toISOString(),
        rateLimits: this.rateLimiter.getStats(),
        cache: this.cache.getStats()
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error.message,
        timestamp: new Date().toISOString(),
        rateLimits: this.rateLimiter.getStats()
      };
    }
  }

  /**
   * Limpia el caché manualmente
   */
  clearCache() {
    this.cache.clear();
    logger.info('Cache cleared manually');
  }

  /**
   * Obtiene estadísticas del rate limiter
   * @returns {Object} Estadísticas del rate limiter
   */
  getRateLimitStats() {
    return this.rateLimiter.getStats();
  }

  /**
   * Obtiene estadísticas del caché
   * @returns {Object} Estadísticas del caché
   */
  getCacheStats() {
    return this.cache.getStats();
  }
}

module.exports = OpenRouterClient;
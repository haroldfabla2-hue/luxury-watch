const { PrismaClient } = require('@prisma/client');
const { cacheService } = require('../config/redis');
const logger = require('../utils/logger');
const OpenAI = require('openai');
const Anthropic = require('@anthropic-ai/sdk');
const { GoogleGenerativeAI } = require('@google/generative-ai');

class ChatService {
  constructor() {
    this.prisma = new PrismaClient();
    this.providers = new Map();
    this.fallbackChain = [];
    this.circuitBreakers = new Map();
    this.initializeProviders();
  }

  /**
   * Inicializar proveedores de IA
   */
  initializeProviders() {
    // Inicializar OpenAI
    if (process.env.OPENAI_API_KEY) {
      this.providers.set('openai', {
        client: new OpenAI({ apiKey: process.env.OPENAI_API_KEY }),
        name: 'OpenAI',
        models: ['gpt-4', 'gpt-4-turbo', 'gpt-3.5-turbo']
      });
    }

    // Inicializar Anthropic
    if (process.env.ANTHROPIC_API_KEY) {
      this.providers.set('anthropic', {
        client: new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY }),
        name: 'Anthropic',
        models: ['claude-3-sonnet-20240229', 'claude-3-haiku-20240307']
      });
    }

    // Inicializar Google
    if (process.env.GOOGLE_AI_API_KEY) {
      this.providers.set('google', {
        client: new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY),
        name: 'Google',
        models: ['gemini-pro', 'gemini-pro-vision']
      });
    }

    // Configurar cadena de fallback
    this.setupFallbackChain();
    
    logger.info('Proveedores de IA inicializados', {
      providers: Array.from(this.providers.keys()),
      fallbackChain: this.fallbackChain
    });
  }

  /**
   * Configurar cadena de fallback
   */
  setupFallbackChain() {
    this.fallbackChain = ['openai', 'anthropic', 'google'];
    
    // Verificar qué proveedores están disponibles
    this.fallbackChain = this.fallbackChain.filter(provider => 
      this.providers.has(provider)
    );
  }

  // =====================================
  // GESTIÓN DE SESIONES DE CHAT
  // =====================================

  /**
   * Crear nueva sesión de chat
   */
  async createChatSession(customerId, userType = 'CUSTOMER', metadata = {}) {
    try {
      const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      const session = await this.prisma.chatSession.create({
        data: {
          sessionId,
          customerId,
          userType,
          metadata
        }
      });

      // Guardar en cache
      await cacheService.setChatSession(sessionId, {
        id: session.id,
        sessionId,
        customerId,
        userType,
        status: 'ACTIVE',
        metadata,
        createdAt: session.startedAt
      }, 3600);

      logger.info('Sesión de chat creada', { sessionId, customerId, userType });

      return session;
    } catch (error) {
      logger.error('Error creando sesión de chat', error);
      throw error;
    }
  }

  /**
   * Obtener sesión de chat
   */
  async getChatSession(sessionId) {
    try {
      // Verificar cache primero
      const cached = await cacheService.getChatSession(sessionId);
      if (cached) {
        return cached;
      }

      const session = await this.prisma.chatSession.findUnique({
        where: { sessionId },
        include: {
          messages: {
            orderBy: { createdAt: 'asc' }
          },
          customer: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true
            }
          }
        }
      });

      if (!session) {
        throw new Error('Sesión de chat no encontrada');
      }

      // Guardar en cache
      await cacheService.setChatSession(sessionId, session, 3600);

      return session;
    } catch (error) {
      logger.error('Error obteniendo sesión de chat', error);
      throw error;
    }
  }

  /**
   * Terminar sesión de chat
   */
  async endChatSession(sessionId) {
    try {
      const session = await this.prisma.chatSession.update({
        where: { sessionId },
        data: {
          status: 'ENDED',
          endedAt: new Date()
        }
      });

      // Limpiar cache
      await cacheService.deleteChatSession(sessionId);

      logger.info('Sesión de chat terminada', { sessionId });

      return session;
    } catch (error) {
      logger.error('Error terminando sesión de chat', error);
      throw error;
    }
  }

  // =====================================
  // PROCESAMIENTO DE MENSAJES
  // =====================================

  /**
   * Procesar mensaje del usuario con fallback inteligente
   */
  async processMessage(sessionId, userMessage, options = {}) {
    try {
      const startTime = Date.now();
      
      // Verificar rate limiting
      const rateLimitKey = `rate_limit:chat:${sessionId}`;
      const rateLimit = await cacheService.checkRateLimit(
        rateLimitKey, 
        options.rateLimit || 20, 
        options.rateWindow || 60
      );

      if (!rateLimit.allowed) {
        throw new Error('Rate limit excedido. Por favor, espera antes de enviar otro mensaje.');
      }

      // Obtener sesión
      const session = await this.getChatSession(sessionId);
      
      // Guardar mensaje del usuario
      const userMessageRecord = await this.saveMessage(
        sessionId, 
        'USER', 
        userMessage, 
        null, 
        null, 
        null, 
        null
      );

      // Preparar contexto de la conversación
      const conversationHistory = await this.getConversationHistory(sessionId);
      
      // Intentar con cada proveedor en la cadena de fallback
      let response = null;
      let usedProvider = null;
      let error = null;

      for (const providerName of this.fallbackChain) {
        try {
          // Verificar circuit breaker
          if (this.isCircuitBreakerOpen(providerName)) {
            logger.warn(`Circuit breaker abierto para ${providerName}, saltando...`);
            continue;
          }

          // Verificar health del proveedor
          const isHealthy = await this.checkProviderHealth(providerName);
          if (!isHealthy) {
            this.recordFailure(providerName);
            continue;
          }

          // Intentar generar respuesta
          response = await this.generateResponse(
            providerName,
            userMessage,
            conversationHistory,
            options
          );

          if (response) {
            usedProvider = providerName;
            this.recordSuccess(providerName);
            break;
          }
        } catch (err) {
          logger.error(`Error con proveedor ${providerName}`, err);
          this.recordFailure(providerName);
          error = err;
          
          // Si es el último proveedor, re-lanzar el error
          if (providerName === this.fallbackChain[this.fallbackChain.length - 1]) {
            throw err;
          }
        }
      }

      if (!response) {
        throw new Error('No se pudo generar una respuesta con ningún proveedor');
      }

      // Calcular métricas
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      const tokensUsed = this.estimateTokens(userMessage + response);
      const cost = this.calculateCost(usedProvider, tokensUsed);

      // Guardar respuesta del asistente
      const assistantMessage = await this.saveMessage(
        sessionId,
        'ASSISTANT',
        response,
        usedProvider,
        options.model,
        tokensUsed,
        cost,
        responseTime
      );

      logger.info('Mensaje procesado exitosamente', {
        sessionId,
        provider: usedProvider,
        tokensUsed,
        responseTime,
        cost
      });

      return {
        message: assistantMessage,
        provider: usedProvider,
        responseTime,
        cost,
        rateLimit: {
          remaining: rateLimit.remaining,
          resetTime: rateLimit.resetTime
        }
      };

    } catch (error) {
      logger.error('Error procesando mensaje', { sessionId, error: error.message });
      
      // Guardar mensaje de error
      await this.saveMessage(
        sessionId,
        'ASSISTANT',
        'Lo siento, ocurrió un error al procesar tu mensaje. Por favor, inténtalo de nuevo.',
        null,
        null,
        0,
        0,
        null
      );

      throw error;
    }
  }

  /**
   * Generar respuesta con un proveedor específico
   */
  async generateResponse(providerName, userMessage, conversationHistory, options = {}) {
    const provider = this.providers.get(providerName);
    if (!provider) {
      throw new Error(`Proveedor ${providerName} no disponible`);
    }

    const { model = this.getDefaultModel(providerName) } = options;

    try {
      switch (providerName) {
        case 'openai':
          return await this.generateOpenAIResponse(provider, userMessage, conversationHistory, model);
        case 'anthropic':
          return await this.generateAnthropicResponse(provider, userMessage, conversationHistory, model);
        case 'google':
          return await this.generateGoogleResponse(provider, userMessage, conversationHistory, model);
        default:
          throw new Error(`Proveedor ${providerName} no implementado`);
      }
    } catch (error) {
      logger.error(`Error generando respuesta con ${providerName}`, error);
      throw error;
    }
  }

  /**
   * Generar respuesta con OpenAI
   */
  async generateOpenAIResponse(provider, userMessage, history, model) {
    const messages = [
      {
        role: 'system',
        content: this.getSystemPrompt('openai')
      },
      ...history.map(msg => ({
        role: msg.role === 'ASSISTANT' ? 'assistant' : 'user',
        content: msg.content
      })),
      {
        role: 'user',
        content: userMessage
      }
    ];

    const response = await provider.client.chat.completions.create({
      model,
      messages,
      max_tokens: options.maxTokens || 1000,
      temperature: options.temperature || 0.7,
      stream: false
    });

    return response.choices[0]?.message?.content || 'No se pudo generar respuesta';
  }

  /**
   * Generar respuesta con Anthropic
   */
  async generateAnthropicResponse(provider, userMessage, history, model) {
    const messages = [
      ...history.map(msg => ({
        role: msg.role === 'ASSISTANT' ? 'assistant' : 'user',
        content: msg.content
      })),
      {
        role: 'user',
        content: userMessage
      }
    ];

    const response = await provider.client.messages.create({
      model,
      max_tokens: options.maxTokens || 1000,
      messages
    });

    return response.content[0]?.text || 'No se pudo generar respuesta';
  }

  /**
   * Generar respuesta con Google
   */
  async generateGoogleResponse(provider, userMessage, history, model) {
    const modelInstance = provider.client.getGenerativeModel({ model });
    
    const conversation = history.map(msg => ({
      role: msg.role === 'ASSISTANT' ? 'model' : 'user',
      parts: [{ text: msg.content }]
    }));

    conversation.push({
      role: 'user',
      parts: [{ text: userMessage }]
    });

    const result = await modelInstance.generateContent({
      contents: conversation,
      generationConfig: {
        maxOutputTokens: options.maxTokens || 1000,
        temperature: options.temperature || 0.7
      }
    });

    return result.response.text() || 'No se pudo generar respuesta';
  }

  // =====================================
  // GESTIÓN DE FALLBACK Y HEALTH
  // =====================================

  /**
   * Verificar health de un proveedor
   */
  async checkProviderHealth(providerName) {
    try {
      const cacheKey = `health:${providerName}`;
      const cached = await cacheService.get(cacheKey);
      
      if (cached && Date.now() - cached.lastCheck < 60000) { // Cache por 1 minuto
        return cached.isHealthy;
      }

      // Test básico de conectividad
      const provider = this.providers.get(providerName);
      if (!provider) {
        return false;
      }

      // Realizar test específico por proveedor
      let isHealthy = false;
      
      switch (providerName) {
        case 'openai':
          // Test simple de API
          isHealthy = true; // Simplificado para el ejemplo
          break;
        case 'anthropic':
          isHealthy = true; // Simplificado para el ejemplo
          break;
        case 'google':
          isHealthy = true; // Simplificado para el ejemplo
          break;
        default:
          isHealthy = false;
      }

      // Guardar resultado
      await cacheService.set(cacheKey, {
        isHealthy,
        lastCheck: Date.now()
      }, 60);

      return isHealthy;
    } catch (error) {
      logger.error(`Error verificando health de ${providerName}`, error);
      return false;
    }
  }

  /**
   * Circuit breaker para un proveedor
   */
  isCircuitBreakerOpen(providerName) {
    const breaker = this.circuitBreakers.get(providerName);
    if (!breaker) return false;

    const { failures, lastFailure } = breaker;
    const now = Date.now();
    const failureWindow = 60000; // 1 minuto

    // Si hay muchas fallas recientes, abrir el circuit breaker
    if (failures >= 5 && (now - lastFailure) < failureWindow) {
      return true;
    }

    // Resetear después de un tiempo
    if ((now - lastFailure) > failureWindow) {
      this.circuitBreakers.delete(providerName);
      return false;
    }

    return false;
  }

  /**
   * Registrar falla de proveedor
   */
  recordFailure(providerName) {
    const breaker = this.circuitBreakers.get(providerName) || { failures: 0, lastFailure: 0 };
    breaker.failures += 1;
    breaker.lastFailure = Date.now();
    this.circuitBreakers.set(providerName, breaker);

    logger.warn(`Falla registrada para ${providerName}`, { failures: breaker.failures });
  }

  /**
   * Registrar éxito de proveedor
   */
  recordSuccess(providerName) {
    this.circuitBreakers.delete(providerName);
    logger.info(`Éxito registrado para ${providerName}`);
  }

  // =====================================
  // UTILIDADES
  // =====================================

  /**
   * Guardar mensaje en la base de datos
   */
  async saveMessage(sessionId, role, content, provider, model, tokensUsed, cost, responseTime) {
    const session = await this.prisma.chatSession.findUnique({
      where: { sessionId }
    });

    if (!session) {
      throw new Error('Sesión no encontrada');
    }

    return await this.prisma.chatMessage.create({
      data: {
        sessionId: session.id,
        role: role.toUpperCase(),
        content,
        provider,
        model,
        tokensUsed: tokensUsed || 0,
        cost: cost || 0,
        responseTimeMs: responseTime || null
      }
    });
  }

  /**
   * Obtener historial de conversación
   */
  async getConversationHistory(sessionId, limit = 20) {
    const messages = await this.prisma.chatMessage.findMany({
      where: { session: { sessionId } },
      orderBy: { createdAt: 'asc' },
      take: limit
    });

    return messages;
  }

  /**
   * Obtener prompt del sistema para el proveedor
   */
  getSystemPrompt(providerName) {
    const basePrompt = `Eres un asistente especializado en relojes de lujo para LuxuryWatch. Tu función es ayudar a los clientes con:

1. Configuración y personalización de relojes
2. Información sobre materiales (oro, platino, titanio, cerámica, etc.)
3. Recomendaciones basadas en preferencias
4. Ayuda con pedidos y consultas
5. Soporte técnico del configurador 3D

Sé amable, profesional y detallado en tus respuestas. Si no sabes algo, admite que necesitas más información.

Contexto: LuxuryWatch es una plataforma de e-commerce de relojes de lujo con configurador 3D avanzado.`;

    return basePrompt;
  }

  /**
   * Obtener modelo por defecto para un proveedor
   */
  getDefaultModel(providerName) {
    const defaults = {
      openai: 'gpt-4',
      anthropic: 'claude-3-sonnet-20240229',
      google: 'gemini-pro'
    };
    return defaults[providerName] || 'gpt-3.5-turbo';
  }

  /**
   * Estimar tokens en un texto
   */
  estimateTokens(text) {
    // Estimación aproximada: 1 token = 4 caracteres en promedio
    return Math.ceil(text.length / 4);
  }

  /**
   * Calcular costo de la API
   */
  calculateCost(providerName, tokens) {
    const costs = {
      openai: { input: 0.00003, output: 0.00004 }, // USD per token
      anthropic: { input: 0.000015, output: 0.000075 },
      google: { input: 0.0000005, output: 0.0000015 }
    };

    const cost = costs[providerName];
    if (!cost) return 0;

    // Asumir 60% input, 40% output
    const inputTokens = Math.ceil(tokens * 0.6);
    const outputTokens = Math.ceil(tokens * 0.4);

    return (inputTokens * cost.input) + (outputTokens * cost.output);
  }

  // =====================================
  // ANÁLISIS Y ESTADÍSTICAS
  // =====================================

  /**
   * Obtener estadísticas de chat
   */
  async getChatStats() {
    try {
      const cacheKey = 'stats:chat';
      const cached = await cacheService.get(cacheKey);
      if (cached) {
        return cached;
      }

      const [
        totalSessions,
        activeSessions,
        avgMessagesPerSession,
        providerUsage,
        totalCost,
        avgResponseTime
      ] = await Promise.all([
        this.prisma.chatSession.count(),
        this.prisma.chatSession.count({ where: { status: 'ACTIVE' } }),
        this.getAverageMessagesPerSession(),
        this.getProviderUsage(),
        this.getTotalChatCost(),
        this.getAverageResponseTime()
      ]);

      const stats = {
        sessions: {
          total: totalSessions,
          active: activeSessions
        },
        messages: {
          avgPerSession: avgMessagesPerSession
        },
        providers: providerUsage,
        cost: totalCost,
        performance: {
          avgResponseTime: avgResponseTime
        }
      };

      // Guardar en cache por 30 minutos
      await cacheService.set(cacheKey, stats, 1800);

      return stats;
    } catch (error) {
      logger.error('Error obteniendo estadísticas de chat', error);
      throw error;
    }
  }

  /**
   * Obtener promedio de mensajes por sesión
   */
  async getAverageMessagesPerSession() {
    const result = await this.prisma.$queryRaw`
      SELECT AVG(message_count) as avg_messages
      FROM (
        SELECT session_id, COUNT(*) as message_count
        FROM chat_messages
        GROUP BY session_id
      ) session_counts
    `;
    
    return parseFloat(result[0]?.avg_messages) || 0;
  }

  /**
   * Obtener uso de proveedores
   */
  async getProviderUsage() {
    const usage = await this.prisma.chatMessage.groupBy({
      by: ['provider'],
      _count: true,
      _avg: { responseTimeMs: true }
    });

    return usage.map(item => ({
      provider: item.provider,
      usage: item._count,
      avgResponseTime: item._avg.responseTimeMs || 0
    }));
  }

  /**
   * Obtener costo total del chat
   */
  async getTotalChatCost() {
    const result = await this.prisma.chatMessage.aggregate({
      _sum: { cost: true }
    });

    return result._sum.cost || 0;
  }

  /**
   * Obtener tiempo de respuesta promedio
   */
  async getAverageResponseTime() {
    const result = await this.prisma.chatMessage.aggregate({
      _avg: { responseTimeMs: true }
    });

    return result._avg.responseTimeMs || 0;
  }
}

module.exports = ChatService;

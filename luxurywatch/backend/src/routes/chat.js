const express = require('express');
const router = express.Router();
const ChatService = require('../services/ChatService');
const { authMiddleware } = require('../middleware/auth');
const { rateLimit } = require('../middleware/rateLimit');
const { validateRequest } = require('../middleware/validation');
const logger = require('../utils/logger');

// Inicializar servicio
const chatService = new ChatService();

// =====================================
// GESTIÓN DE SESIONES DE CHAT
// =====================================

/**
 * @route   POST /api/chat/sessions
 * @desc    Crear nueva sesión de chat
 * @access  Public
 */
router.post('/chat/sessions',
  rateLimit({ windowMs: 15 * 60 * 1000, max: 20 }), // 20 nuevas sesiones por 15 minutos
  validateRequest({
    customerId: 'string',
    userType: 'in:CUSTOMER,ADMIN',
    metadata: 'object'
  }),
  async (req, res) => {
    try {
      const { customerId, userType = 'CUSTOMER', metadata = {} } = req.body;
      
      const session = await chatService.createChatSession(customerId, userType, metadata);
      
      res.status(201).json({
        success: true,
        data: {
          sessionId: session.sessionId,
          customerId: session.customerId,
          userType: session.userType,
          status: session.status,
          startedAt: session.startedAt
        },
        message: 'Sesión de chat creada exitosamente'
      });
    } catch (error) {
      logger.error('Error en POST /chat/sessions', error);
      res.status(500).json({
        success: false,
        error: 'Error al crear sesión de chat'
      });
    }
  }
);

/**
 * @route   GET /api/chat/sessions/:sessionId
 * @desc    Obtener sesión de chat
 * @access  Public (con validación de sesión)
 */
router.get('/chat/sessions/:sessionId',
  rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }),
  async (req, res) => {
    try {
      const { sessionId } = req.params;
      const session = await chatService.getChatSession(sessionId);
      
      res.json({
        success: true,
        data: {
          session: {
            id: session.id,
            sessionId: session.sessionId,
            customerId: session.customerId,
            userType: session.userType,
            status: session.status,
            startedAt: session.startedAt,
            endedAt: session.endedAt
          },
          customer: session.customer,
          messages: session.messages.map(msg => ({
            id: msg.id,
            role: msg.role,
            content: msg.content,
            provider: msg.provider,
            model: msg.model,
            tokensUsed: msg.tokensUsed,
            cost: msg.cost,
            responseTime: msg.responseTimeMs,
            createdAt: msg.createdAt
          }))
        }
      });
    } catch (error) {
      logger.error('Error en GET /chat/sessions/:sessionId', error);
      res.status(error.message === 'Sesión de chat no encontrada' ? 404 : 500).json({
        success: false,
        error: error.message
      });
    }
  }
);

/**
 * @route   DELETE /api/chat/sessions/:sessionId
 * @desc    Terminar sesión de chat
 * @access  Public (con validación de sesión)
 */
router.delete('/chat/sessions/:sessionId',
  rateLimit({ windowMs: 15 * 60 * 1000, max: 50 }),
  async (req, res) => {
    try {
      const { sessionId } = req.params;
      const session = await chatService.endChatSession(sessionId);
      
      res.json({
        success: true,
        data: session,
        message: 'Sesión de chat terminada exitosamente'
      });
    } catch (error) {
      logger.error('Error en DELETE /chat/sessions/:sessionId', error);
      res.status(error.message === 'Sesión de chat no encontrada' ? 404 : 500).json({
        success: false,
        error: error.message
      });
    }
  }
);

// =====================================
// PROCESAMIENTO DE MENSAJES
// =====================================

/**
 * @route   POST /api/chat/sessions/:sessionId/messages
 * @desc    Procesar mensaje del usuario
 * @access  Public (con validación de sesión)
 */
router.post('/chat/sessions/:sessionId/messages',
  rateLimit({ windowMs: 60 * 1000, max: 10 }), // 10 mensajes por minuto
  validateRequest({
    message: 'required|string|max:4000',
    model: 'string',
    maxTokens: 'integer|min:50|max:2000',
    temperature: 'decimal:2,1|min:0|max:2'
  }),
  async (req, res) => {
    try {
      const { sessionId } = req.params;
      const { message, model, maxTokens, temperature } = req.body;
      
      const options = {
        model,
        maxTokens,
        temperature
      };
      
      const result = await chatService.processMessage(sessionId, message, options);
      
      res.json({
        success: true,
        data: {
          message: {
            id: result.message.id,
            role: result.message.role,
            content: result.message.content,
            provider: result.message.provider,
            model: result.message.model,
            tokensUsed: result.message.tokensUsed,
            cost: result.message.cost,
            responseTime: result.message.responseTimeMs,
            createdAt: result.message.createdAt
          },
          metadata: {
            provider: result.provider,
            responseTime: result.responseTime,
            cost: result.cost,
            rateLimit: result.rateLimit
          }
        }
      });
    } catch (error) {
      logger.error('Error en POST /chat/sessions/:sessionId/messages', { 
        sessionId: req.params.sessionId, 
        error: error.message 
      });
      
      res.status(error.message.includes('Rate limit') ? 429 : 500).json({
        success: false,
        error: error.message
      });
    }
  }
);

/**
 * @route   GET /api/chat/sessions/:sessionId/messages
 * @desc    Obtener historial de mensajes
 * @access  Public (con validación de sesión)
 */
router.get('/chat/sessions/:sessionId/messages',
  rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }),
  async (req, res) => {
    try {
      const { sessionId } = req.params;
      const limit = Math.min(parseInt(req.query.limit) || 50, 200);
      
      const session = await chatService.getChatSession(sessionId);
      
      const messages = session.messages.slice(-limit).map(msg => ({
        id: msg.id,
        role: msg.role,
        content: msg.content,
        provider: msg.provider,
        model: msg.model,
        tokensUsed: msg.tokensUsed,
        cost: msg.cost,
        responseTime: msg.responseTimeMs,
        createdAt: msg.createdAt
      }));
      
      res.json({
        success: true,
        data: {
          messages,
          session: {
            sessionId: session.sessionId,
            status: session.status,
            messageCount: session.messages.length
          }
        }
      });
    } catch (error) {
      logger.error('Error en GET /chat/sessions/:sessionId/messages', error);
      res.status(error.message === 'Sesión de chat no encontrada' ? 404 : 500).json({
        success: false,
        error: error.message
      });
    }
  }
);

// =====================================
// ESTADÍSTICAS Y ANÁLISIS
// =====================================

/**
 * @route   GET /api/chat/stats
 * @desc    Obtener estadísticas de chat
 * @access  Private (Admin)
 */
router.get('/chat/stats',
  authMiddleware,
  rateLimit({ windowMs: 15 * 60 * 1000, max: 20 }),
  async (req, res) => {
    try {
      const stats = await chatService.getChatStats();
      
      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      logger.error('Error en GET /chat/stats', error);
      res.status(500).json({
        success: false,
        error: 'Error al obtener estadísticas de chat'
      });
    }
  }
);

/**
 * @route   GET /api/chat/providers/health
 * @desc    Verificar salud de proveedores de IA
 * @access  Private (Admin)
 */
router.get('/chat/providers/health',
  authMiddleware,
  rateLimit({ windowMs: 15 * 60 * 1000, max: 30 }),
  async (req, res) => {
    try {
      const providers = ['openai', 'anthropic', 'google'];
      const healthStatus = {};
      
      // Verificar salud de cada proveedor
      for (const provider of providers) {
        try {
          const isHealthy = await chatService.checkProviderHealth(provider);
          const circuitBreakerOpen = chatService.isCircuitBreakerOpen(provider);
          
          healthStatus[provider] = {
            healthy: isHealthy,
            circuitBreakerOpen,
            status: isHealthy ? (circuitBreakerOpen ? 'degraded' : 'healthy') : 'unhealthy'
          };
        } catch (error) {
          healthStatus[provider] = {
            healthy: false,
            circuitBreakerOpen: false,
            status: 'unhealthy',
            error: error.message
          };
        }
      }
      
      res.json({
        success: true,
        data: {
          providers: healthStatus,
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      logger.error('Error en GET /chat/providers/health', error);
      res.status(500).json({
        success: false,
        error: 'Error al verificar salud de proveedores'
      });
    }
  }
);

/**
 * @route   POST /api/chat/providers/test
 * @desc    Probar proveedor de IA específico
 * @access  Private (Admin)
 */
router.post('/chat/providers/test',
  authMiddleware,
  rateLimit({ windowMs: 15 * 60 * 1000, max: 10 }),
  validateRequest({
    provider: 'required|in:openai,anthropic,google',
    message: 'required|string|max:500'
  }),
  async (req, res) => {
    try {
      const { provider, message } = req.body;
      
      // Crear sesión temporal para la prueba
      const session = await chatService.createChatSession(null, 'ADMIN', { test: true });
      
      // Generar respuesta de prueba
      const response = await chatService.generateResponse(provider, message, [], {
        model: chatService.getDefaultModel(provider)
      });
      
      // Limpiar sesión de prueba
      await chatService.endChatSession(session.sessionId);
      
      res.json({
        success: true,
        data: {
          provider,
          status: 'success',
          response,
          message: `Prueba exitosa con ${provider}`
        }
      });
    } catch (error) {
      logger.error('Error en POST /chat/providers/test', error);
      res.status(500).json({
        success: false,
        error: `Error probando proveedor: ${error.message}`
      });
    }
  }
);

// =====================================
// CONFIGURACIÓN DE CHAT
// =====================================

/**
 * @route   GET /api/chat/config
 * @desc    Obtener configuración de chat
 * @access  Public
 */
router.get('/chat/config',
  rateLimit({ windowMs: 15 * 60 * 1000, max: 50 }),
  async (req, res) => {
    try {
      const config = {
        providers: {
          available: ['openai', 'anthropic', 'google'].filter(p => 
            process.env[`${p.toUpperCase()}_API_KEY`]
          ),
          fallback: ['openai', 'anthropic', 'google'],
          default: 'openai'
        },
        limits: {
          messageMaxLength: 4000,
          sessionMaxDuration: 3600, // 1 hora en segundos
          messagesPerMinute: 10,
          rateLimitWindow: 60
        },
        features: {
          typing: true,
          fileUpload: false,
          voice: false,
          ai: true
        }
      };
      
      res.json({
        success: true,
        data: config
      });
    } catch (error) {
      logger.error('Error en GET /chat/config', error);
      res.status(500).json({
        success: false,
        error: 'Error al obtener configuración de chat'
      });
    }
  }
);

/**
 * @route   POST /api/chat/feedback
 * @desc    Enviar feedback sobre conversación
 * @access  Public
 */
router.post('/chat/feedback',
  rateLimit({ windowMs: 15 * 60 * 1000, max: 20 }),
  validateRequest({
    sessionId: 'required|string',
    messageId: 'string',
    rating: 'required|integer|min:1|max:5',
    comment: 'string|max:1000'
  }),
  async (req, res) => {
    try {
      const { sessionId, messageId, rating, comment } = req.body;
      
      // Aquí se integraría con un sistema de feedback
      // Por ahora, solo registramos el feedback
      logger.info('Feedback recibido', {
        sessionId,
        messageId,
        rating,
        comment,
        timestamp: new Date().toISOString()
      });
      
      res.json({
        success: true,
        message: 'Feedback enviado exitosamente'
      });
    } catch (error) {
      logger.error('Error en POST /chat/feedback', error);
      res.status(500).json({
        success: false,
        error: 'Error al enviar feedback'
      });
    }
  }
);

module.exports = router;

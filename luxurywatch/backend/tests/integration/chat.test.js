/**
 * Tests de Integración para API de Chat
 */

const request = require('supertest');
const app = require('../../src/app');

describe('Chat API Integration Tests', () => {
  let authToken;
  let userId = 1;

  beforeAll(async () => {
    authToken = 'test-jwt-token';
  });

  afterEach(async () => {
    // Limpiar datos de chat después de cada test
    if (global.prisma) {
      await global.prisma.chatMessage.deleteMany();
    }
  });

  describe('POST /api/chat/message', () => {
    it('debería procesar mensaje de chat', async () => {
      const messageData = {
        message: '¿Cuál es el mejor reloj de lujo?',
        userId: userId,
        sessionId: 'test-session-123'
      };

      const response = await request(app)
        .post('/api/chat/message')
        .send(messageData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('content');
      expect(response.body.data).toHaveProperty('provider');
      expect(response.body.data).toHaveProperty('timestamp');
    });

    it('debería validar mensaje requerido', async () => {
      const response = await request(app)
        .post('/api/chat/message')
        .send({
          userId: userId
          // message faltante
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('message');
    });

    it('debería rechazar mensajes muy largos', async () => {
      const longMessage = 'a'.repeat(2001); // Más de 2000 caracteres

      const response = await request(app)
        .post('/api/chat/message')
        .send({
          message: longMessage,
          userId: userId
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('debería detectar y rechazar spam', async () => {
      const spamMessage = 'cheap fake watches buy now www.fakewatches.com';

      const response = await request(app)
        .post('/api/chat/message')
        .send({
          message: spamMessage,
          userId: userId
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('spam');
    });

    it('debería aplicar rate limiting', async () => {
      // Simular múltiples mensajes rápidos
      const promises = [];
      for (let i = 0; i < 60; i++) { // Supera el límite de 50 por hora
        promises.push(
          request(app)
            .post('/api/chat/message')
            .send({
              message: `Test message ${i}`,
              userId: userId
            })
        );
      }

      const responses = await Promise.all(promises);
      const rateLimited = responses.some(res => res.status === 429);

      expect(rateLimited).toBe(true);
    });

    it('debería manejar errores de API externa', async () => {
      // Mock de error en el servicio de IA
      const originalSend = app.locals.chatService.sendMessage;
      app.locals.chatService.sendMessage = jest.fn().mockRejectedValue(new Error('AI service unavailable'));

      const response = await request(app)
        .post('/api/chat/message')
        .send({
          message: 'Test message',
          userId: userId
        })
        .expect(500);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('AI service unavailable');

      // Restaurar función original
      app.locals.chatService.sendMessage = originalSend;
    });
  });

  describe('GET /api/chat/history/:userId', () => {
    it('debería devolver historial de chat del usuario', async () => {
      // Crear algunos mensajes de prueba
      const testMessages = [
        { message: 'Hola', response: '¡Hola!', userId: userId, sessionId: 'session1' },
        { message: '¿Cómo estás?', response: 'Muy bien, gracias', userId: userId, sessionId: 'session1' }
      ];

      await global.prisma.chatMessage.createMany({ data: testMessages });

      const response = await request(app)
        .get(`/api/chat/history/${userId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBe(2);
    });

    it('debería limitar historial a los últimos 50 mensajes', async () => {
      // Crear más de 50 mensajes
      const manyMessages = [];
      for (let i = 0; i < 60; i++) {
        manyMessages.push({
          message: `Message ${i}`,
          response: `Response ${i}`,
          userId: userId,
          sessionId: `session${i}`
        });
      }

      await global.prisma.chatMessage.createMany({ data: manyMessages });

      const response = await request(app)
        .get(`/api/chat/history/${userId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.data.length).toBeLessThanOrEqual(50);
    });

    it('debería filtrar por sesión específica', async () => {
      // Crear mensajes en diferentes sesiones
      const testMessages = [
        { message: 'Session 1 message', response: 'Response 1', userId: userId, sessionId: 'session1' },
        { message: 'Session 2 message', response: 'Response 2', userId: userId, sessionId: 'session2' }
      ];

      await global.prisma.chatMessage.createMany({ data: testMessages });

      const response = await request(app)
        .get(`/api/chat/history/${userId}?sessionId=session1`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.data.length).toBe(1);
      expect(response.body.data[0].sessionId).toBe('session1');
    });
  });

  describe('DELETE /api/chat/history/:userId', () => {
    it('debería eliminar historial de chat del usuario', async () => {
      // Crear mensajes de prueba
      await global.prisma.chatMessage.createMany({
        data: [
          { message: 'Test 1', response: 'Response 1', userId: userId },
          { message: 'Test 2', response: 'Response 2', userId: userId }
        ]
      });

      const response = await request(app)
        .delete(`/api/chat/history/${userId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.deleted).toBe(2);

      // Verificar que se eliminaron
      const remainingMessages = await global.prisma.chatMessage.findMany({
        where: { userId: userId }
      });
      expect(remainingMessages.length).toBe(0);
    });
  });

  describe('GET /api/chat/analytics', () => {
    it('debería devolver analytics de chat', async () => {
      // Crear algunos datos de prueba
      const testUsers = [1, 2, 3];
      const testSessions = ['session1', 'session2', 'session3'];

      for (const userId of testUsers) {
        for (let i = 0; i < 5; i++) {
          await global.prisma.chatMessage.create({
            data: {
              message: `Message ${i} for user ${userId}`,
              response: `Response ${i} for user ${userId}`,
              userId: userId,
              sessionId: testSessions[i % testSessions.length]
            }
          });
        }
      }

      const response = await request(app)
        .get('/api/chat/analytics')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('totalMessages');
      expect(response.body.data).toHaveProperty('activeUsers');
      expect(response.body.data).toHaveProperty('avgMessagesPerUser');
      expect(response.body.data.totalMessages).toBe(15); // 3 usuarios x 5 mensajes
      expect(response.body.data.activeUsers).toBe(3);
    });
  });

  describe('POST /api/chat/recommendation', () => {
    it('debería generar recomendación de producto', async () => {
      const recommendationData = {
        userId: userId,
        preferences: {
          style: 'luxury',
          budget: 5000,
          material: 'gold'
        }
      };

      // Mock de productos disponibles
      const mockProducts = [
        { id: 1, name: 'Gold Luxury Watch', price: 4500, category: 'luxury' }
      ];

      global.prisma.product.findMany = jest.fn().mockResolvedValue(mockProducts);

      const response = await request(app)
        .post('/api/chat/recommendation')
        .set('Authorization', `Bearer ${authToken}`)
        .send(recommendationData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('recommendations');
      expect(Array.isArray(response.body.data.recommendations)).toBe(true);
    });

    it('debería validar datos de preferencias', async () => {
      const invalidData = {
        userId: userId
        // preferences faltantes
      };

      const response = await request(app)
        .post('/api/chat/recommendation')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('Autenticación y Rate Limiting', () => {
    it('debería aplicar autenticación apropiada', async () => {
      // Test sin autenticación - debería funcionar para chat básico
      const response = await request(app)
        .post('/api/chat/message')
        .send({
          message: 'Test message',
          userId: userId
        })
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    it('debería validar parámetros de entrada', async () => {
      const invalidMessage = {
        message: null, // Inválido
        userId: 'invalid' // Tipo incorrecto
      };

      const response = await request(app)
        .post('/api/chat/message')
        .send(invalidMessage)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('Error Handling', () => {
    it('debería manejar errores de base de datos', async () => {
      // Mock de error en prisma
      const originalCreate = global.prisma.chatMessage.create;
      global.prisma.chatMessage.create = jest.fn().mockRejectedValue(new Error('DB error'));

      const response = await request(app)
        .post('/api/chat/message')
        .send({
          message: 'Test message',
          userId: userId
        })
        .expect(500);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();

      // Restaurar función original
      global.prisma.chatMessage.create = originalCreate;
    });

    it('debería manejar timeouts de servicios externos', async () => {
      // Mock de timeout
      const originalSend = app.locals.chatService.sendMessage;
      app.locals.chatService.sendMessage = jest.fn().mockRejectedValue(new Error('Request timeout'));

      const response = await request(app)
        .post('/api/chat/message')
        .send({
          message: 'Test message',
          userId: userId
        })
        .expect(500);

      expect(response.body.success).toBe(false);

      // Restaurar función original
      app.locals.chatService.sendMessage = originalSend;
    });
  });
});
/**
 * Tests para ChatService
 */

const ChatService = require('../../src/services/ChatService');

describe('ChatService', () => {
  let chatService;

  beforeEach(() => {
    chatService = new ChatService();
  });

  describe('sendMessage', () => {
    it('debería enviar mensaje con OpenAI cuando API key está disponible', async () => {
      const messageData = {
        message: '¿Cuál es el mejor reloj de lujo?',
        userId: 1,
        sessionId: 'session-123'
      };

      const mockResponse = {
        content: 'Recomiendo los relojes de la marca Rolex por su calidad...',
        provider: 'openai',
        timestamp: new Date()
      };

      // Mock de OpenAI
      const mockOpenAI = {
        chat: {
          completions: {
            create: jest.fn().mockResolvedValue({
              choices: [{ message: { content: mockResponse.content } }]
            })
          }
        }
      };

      global.prisma = {
        chatMessage: {
          create: jest.fn().mockResolvedValue({ id: 1, ...messageData }),
          findMany: jest.fn().mockResolvedValue([])
        }
      };

      // Mock de los servicios de IA
      chatService.openai = mockOpenAI;

      const result = await chatService.sendMessage(messageData);

      expect(result).toBeDefined();
      expect(result.content).toBe(mockResponse.content);
      expect(global.prisma.chatMessage.create).toHaveBeenCalled();
    });

    it('debería manejar errores de OpenAI', async () => {
      const messageData = {
        message: 'Test message',
        userId: 1
      };

      const mockOpenAI = {
        chat: {
          completions: {
            create: jest.fn().mockRejectedValue(new Error('API Error'))
          }
        }
      };

      global.prisma = {
        chatMessage: {
          create: jest.fn().mockResolvedValue({ id: 1 })
        }
      };

      chatService.openai = mockOpenAI;

      await expect(chatService.sendMessage(messageData)).rejects.toThrow('API Error');
    });

    it('debería usar fallback cuando no hay API key de OpenAI', async () => {
      const messageData = {
        message: 'Test message',
        userId: 1
      };

      global.prisma = {
        chatMessage: {
          create: jest.fn().mockResolvedValue({ id: 1 })
        }
      };

      // Sin API keys
      delete process.env.OPENAI_API_KEY;

      const result = await chatService.sendMessage(messageData);

      expect(result).toBeDefined();
      expect(result.content).toContain('Lo siento');
    });
  });

  describe('getChatHistory', () => {
    it('debería devolver historial de chat para un usuario', async () => {
      const mockHistory = [
        {
          id: 1,
          message: 'Hola, ¿cómo estás?',
          response: '¡Hola! Estoy muy bien, ¿en qué puedo ayudarte?',
          userId: 1,
          createdAt: new Date()
        }
      ];

      global.prisma = {
        chatMessage: {
          findMany: jest.fn().mockResolvedValue(mockHistory)
        }
      };

      const result = await chatService.getChatHistory(1);

      expect(result).toEqual(mockHistory);
      expect(global.prisma.chatMessage.findMany).toHaveBeenCalledWith({
        where: { userId: 1 },
        orderBy: { createdAt: 'desc' },
        take: 50
      });
    });
  });

  describe('deleteChatHistory', () => {
    it('debería eliminar historial de chat de un usuario', async () => {
      global.prisma = {
        chatMessage: {
          deleteMany: jest.fn().mockResolvedValue({ count: 5 })
        }
      };

      const result = await chatService.deleteChatHistory(1);

      expect(result).toEqual({ deleted: 5 });
      expect(global.prisma.chatMessage.deleteMany).toHaveBeenCalledWith({
        where: { userId: 1 }
      });
    });
  });

  describe('generateProductRecommendation', () => {
    it('debería generar recomendación de producto', async () => {
      const userId = 1;
      const preferences = {
        style: 'classic',
        budget: 5000,
        material: 'gold'
      };

      const mockProducts = [
        { id: 1, name: 'Classic Gold Watch', price: 4500, category: 'classic' }
      ];

      global.prisma = {
        product: {
          findMany: jest.fn().mockResolvedValue(mockProducts)
        },
        customer: {
          findUnique: jest.fn().mockResolvedValue({
            preferences: ['classic', 'gold']
          })
        }
      };

      const result = await chatService.generateProductRecommendation(userId, preferences);

      expect(result).toBeDefined();
      expect(result.recommendations).toBeDefined();
    });
  });

  describe('handleCustomizationQuery', () => {
    it('debería manejar consultas de personalización', async () => {
      const query = 'Quiero un reloj con correa de cuero negro';

      const result = await chatService.handleCustomizationQuery(query);

      expect(result).toBeDefined();
      expect(result.understanding).toBeDefined();
      expect(result.suggestions).toBeDefined();
      expect(result.action).toBeDefined();
    });

    it('debería identificar componentes correctamente', () => {
      const testCases = [
        {
          query: 'correa de cuero',
          expectedComponents: ['strap']
        },
        {
          query: 'esfera azul',
          expectedComponents: ['dial']
        },
        {
          query: 'caja de oro',
          expectedComponents: ['case']
        }
      ];

      testCases.forEach(testCase => {
        const result = chatService.handleCustomizationQuery(testCase.query);
        expect(result.understanding.components).toEqual(expect.arrayContaining(testCase.expectedComponents));
      });
    });
  });

  describe('validateMessage', () => {
    it('debería validar mensajes correctamente', () => {
      const validMessage = '¿Cuál es el precio del reloj de oro?';
      const invalidMessage = ''; // vacío
      const spamMessage = 'compra ahora cheap fake watches'; // posible spam

      expect(chatService.validateMessage(validMessage)).toBe(true);
      expect(chatService.validateMessage(invalidMessage)).toBe(false);
      expect(chatService.validateMessage(spamMessage)).toBe(false);
    });
  });

  describe('rateLimiting', () => {
    it('debería aplicar rate limiting correctamente', () => {
      const userId = 1;
      
      // Simular que el usuario ha enviado 50 mensajes en la última hora
      for (let i = 0; i < 50; i++) {
        chatService.recordMessage(userId);
      }

      const isAllowed = chatService.checkRateLimit(userId);
      expect(isAllowed).toBe(false);
    });

    it('debería permitir mensajes dentro del límite', () => {
      const userId = 2;
      
      // Simular que el usuario ha enviado 5 mensajes
      for (let i = 0; i < 5; i++) {
        chatService.recordMessage(userId);
      }

      const isAllowed = chatService.checkRateLimit(userId);
      expect(isAllowed).toBe(true);
    });
  });
});
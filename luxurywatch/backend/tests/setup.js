/**
 * Setup global para tests
 * Configuración que se ejecuta antes de cada test
 */

const { PrismaClient } = require('@prisma/client');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env.test') });

// Crear Prisma client en modo test
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL || 'file:./test.db'
    }
  }
});

// Configurar variables de entorno para tests
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret-key';
process.env.PORT = '3001';

// Mock de Redis para tests
const mockRedis = {
  connect: jest.fn().mockResolvedValue(),
  disconnect: jest.fn().mockResolvedValue(),
  get: jest.fn().mockResolvedValue(null),
  set: jest.fn().mockResolvedValue('OK'),
  del: jest.fn().mockResolvedValue(1),
  exists: jest.fn().mockResolvedValue(0),
  expire: jest.fn().mockResolvedValue(1),
  quit: jest.fn().mockResolvedValue('OK')
};

// Mock de winston logger
jest.mock('winston', () => ({
  format: {
    combine: jest.fn(),
    timestamp: jest.fn(),
    errors: jest.fn(),
    json: jest.fn(),
    printf: jest.fn()
  },
  transports: {
    Console: jest.fn(),
    File: jest.fn()
  },
  createLogger: jest.fn().mockReturnValue({
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn()
  })
}));

// Mock de servicios externos
jest.mock('openai', () => ({
  OpenAI: jest.fn().mockImplementation(() => ({
    chat: {
      completions: {
        create: jest.fn().mockResolvedValue({
          choices: [{ message: { content: 'Test response' } }]
        })
      }
    }
  }))
}));

jest.mock('@google/generative-ai', () => ({
  GoogleGenerativeAI: jest.fn().mockImplementation(() => ({
    getGenerativeModel: jest.fn().mockReturnValue({
      generateContent: jest.fn().mockResolvedValue({
        response: { text: () => 'Test Gemini response' }
      })
    })
  }))
}));

jest.mock('@anthropic-ai/sdk', () => ({
  Anthropic: jest.fn().mockImplementation(() => ({
    messages: {
      create: jest.fn().mockResolvedValue({
        content: [{ type: 'text', text: 'Test Anthropic response' }]
      })
    }
  }))
}));

// Mock de ioredis
jest.mock('ioredis', () => {
  return jest.fn().mockImplementation(() => mockRedis);
});

// Función global para cleanup
global.testCleanup = async () => {
  await prisma.$disconnect();
};

// Hook para limpiar después de cada test
afterEach(async () => {
  // Limpiar mocks
  jest.clearAllMocks();
  
  // Limpiar prisma
  if (prisma) {
    await prisma.$executeRaw`DELETE FROM _TestResults WHERE 1=1`;
  }
});

// Hook para cleanup final
afterAll(async () => {
  await prisma.$disconnect();
});

// Exponer prisma globalmente para tests
global.prisma = prisma;

// Exponer mockRedis globalmente
global.mockRedis = mockRedis;
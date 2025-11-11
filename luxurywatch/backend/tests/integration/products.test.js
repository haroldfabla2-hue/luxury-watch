/**
 * Tests de Integración para API de Productos
 */

const request = require('supertest');
const app = require('../../src/app');

describe('Product API Integration Tests', () => {
  let authToken;

  beforeAll(async () => {
    // Configurar token de autenticación para tests
    authToken = 'test-jwt-token';
  });

  afterEach(async () => {
    // Limpiar datos después de cada test
    if (global.prisma) {
      await global.prisma.product.deleteMany();
    }
  });

  describe('GET /api/products', () => {
    it('debería devolver lista vacía de productos inicialmente', async () => {
      const response = await request(app)
        .get('/api/products')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('debería devolver productos cuando existen', async () => {
      // Crear productos de prueba
      const testProducts = [
        {
          name: 'Luxury Gold Watch',
          price: 5000,
          category: 'luxury',
          description: 'A beautiful luxury watch'
        },
        {
          name: 'Classic Silver Watch',
          price: 2000,
          category: 'classic',
          description: 'A classic silver timepiece'
        }
      ];

      await global.prisma.product.createMany({ data: testProducts });

      const response = await request(app)
        .get('/api/products')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBe(2);
      expect(response.body.data[0]).toHaveProperty('name');
      expect(response.body.data[0]).toHaveProperty('price');
    });

    it('debería filtrar productos por categoría', async () => {
      const testProducts = [
        { name: 'Gold Watch', price: 5000, category: 'luxury' },
        { name: 'Silver Watch', price: 2000, category: 'classic' }
      ];

      await global.prisma.product.createMany({ data: testProducts });

      const response = await request(app)
        .get('/api/products?category=luxury')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBe(1);
      expect(response.body.data[0].category).toBe('luxury');
    });

    it('debería manejar errores de base de datos', async () => {
      // Mock de error en prisma
      const originalFindMany = global.prisma.product.findMany;
      global.prisma.product.findMany = jest.fn().mockRejectedValue(new Error('DB Error'));

      const response = await request(app)
        .get('/api/products')
        .expect(500);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error');

      // Restaurar función original
      global.prisma.product.findMany = originalFindMany;
    });
  });

  describe('GET /api/products/:id', () => {
    it('debería devolver un producto por ID', async () => {
      const product = await global.prisma.product.create({
        data: {
          name: 'Test Watch',
          price: 1000,
          category: 'test',
          description: 'Test product'
        }
      });

      const response = await request(app)
        .get(`/api/products/${product.id}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id', product.id);
      expect(response.body.data).toHaveProperty('name', 'Test Watch');
    });

    it('debería devolver 404 para producto inexistente', async () => {
      const response = await request(app)
        .get('/api/products/99999')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('not found');
    });
  });

  describe('POST /api/products', () => {
    it('debería crear un nuevo producto con datos válidos', async () => {
      const productData = {
        name: 'New Luxury Watch',
        price: 3000,
        category: 'luxury',
        description: 'A beautiful new watch'
      };

      const response = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${authToken}`)
        .send(productData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.name).toBe(productData.name);
      expect(response.body.data.price).toBe(productData.price);
    });

    it('debería rechazar creación sin autenticación', async () => {
      const productData = {
        name: 'Test Watch',
        price: 1000,
        category: 'test'
      };

      const response = await request(app)
        .post('/api/products')
        .send(productData)
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('debería validar datos requeridos', async () => {
      const response = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'Incomplete Product' })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('validation');
    });

    it('debería validar precio positivo', async () => {
      const productData = {
        name: 'Test Watch',
        price: -100,
        category: 'test'
      };

      const response = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${authToken}`)
        .send(productData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /api/products/:id', () => {
    it('debería actualizar un producto existente', async () => {
      const product = await global.prisma.product.create({
        data: {
          name: 'Original Watch',
          price: 1000,
          category: 'test'
        }
      });

      const updateData = {
        name: 'Updated Watch',
        price: 1500
      };

      const response = await request(app)
        .put(`/api/products/${product.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe(updateData.name);
      expect(response.body.data.price).toBe(updateData.price);
    });

    it('debería devolver 404 para producto inexistente', async () => {
      const updateData = {
        name: 'Non-existent Watch',
        price: 1000
      };

      const response = await request(app)
        .put('/api/products/99999')
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe('DELETE /api/products/:id', () => {
    it('debería eliminar un producto', async () => {
      const product = await global.prisma.product.create({
        data: {
          name: 'Watch to Delete',
          price: 1000,
          category: 'test'
        }
      });

      const response = await request(app)
        .delete(`/api/products/${product.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(product.id);
    });

    it('debería devolver 404 para producto inexistente', async () => {
      const response = await request(app)
        .delete('/api/products/99999')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/products/categories', () => {
    it('debería devolver lista de categorías disponibles', async () => {
      // Crear productos con diferentes categorías
      await global.prisma.product.createMany({
        data: [
          { name: 'Gold Watch', price: 1000, category: 'luxury' },
          { name: 'Silver Watch', price: 800, category: 'classic' },
          { name: 'Sport Watch', price: 600, category: 'sport' }
        ]
      });

      const response = await request(app)
        .get('/api/products/categories')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data).toContain('luxury');
      expect(response.body.data).toContain('classic');
      expect(response.body.data).toContain('sport');
    });
  });

  describe('Health Check', () => {
    it('debería responder al health check', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body.status).toBe('healthy');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('uptime');
    });
  });
});
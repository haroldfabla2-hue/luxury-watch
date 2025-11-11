/**
 * Tests de Integración para API de CRM
 */

const request = require('supertest');
const app = require('../../src/app');

describe('CRM API Integration Tests', () => {
  let authToken;
  let testCustomerId;

  beforeAll(async () => {
    authToken = 'test-jwt-token';
  });

  beforeEach(async () => {
    // Crear cliente de prueba
    const customer = await global.prisma.customer.create({
      data: {
        email: 'test@customer.com',
        name: 'Test Customer',
        phone: '+1234567890'
      }
    });
    testCustomerId = customer.id;
  });

  afterEach(async () => {
    // Limpiar datos después de cada test
    if (global.prisma) {
      await global.prisma.customer.deleteMany();
      await global.prisma.order.deleteMany();
    }
  });

  describe('POST /api/crm/customers', () => {
    it('debería crear un nuevo cliente', async () => {
      const customerData = {
        email: 'nuevo@cliente.com',
        name: 'Nuevo Cliente',
        phone: '+9876543210',
        preferences: ['luxury', 'gold']
      };

      const response = await request(app)
        .post('/api/crm/customers')
        .set('Authorization', `Bearer ${authToken}`)
        .send(customerData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.email).toBe(customerData.email);
      expect(response.body.data.name).toBe(customerData.name);
    });

    it('debería rechazar email duplicado', async () => {
      const customerData = {
        email: 'test@customer.com', // Ya existe
        name: 'Duplicate Email',
        phone: '+1234567891'
      };

      const response = await request(app)
        .post('/api/crm/customers')
        .set('Authorization', `Bearer ${authToken}`)
        .send(customerData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('email');
    });

    it('debería validar email requerido', async () => {
      const response = await request(app)
        .post('/api/crm/customers')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Cliente Sin Email'
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('debería validar formato de email', async () => {
      const customerData = {
        email: 'email-invalido',
        name: 'Cliente Inválido'
      };

      const response = await request(app)
        .post('/api/crm/customers')
        .set('Authorization', `Bearer ${authToken}`)
        .send(customerData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/crm/customers', () => {
    it('debería devolver lista de clientes', async () => {
      // Crear clientes adicionales
      await global.prisma.customer.createMany({
        data: [
          { email: 'cliente1@email.com', name: 'Cliente 1' },
          { email: 'cliente2@email.com', name: 'Cliente 2' }
        ]
      });

      const response = await request(app)
        .get('/api/crm/customers')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
    });

    it('debería paginar resultados', async () => {
      // Crear múltiples clientes
      for (let i = 0; i < 15; i++) {
        await global.prisma.customer.create({
          data: {
            email: `cliente${i}@email.com`,
            name: `Cliente ${i}`
          }
        });
      }

      const response = await request(app)
        .get('/api/crm/customers?page=1&limit=10')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBe(10);
      expect(response.body).toHaveProperty('pagination');
    });

    it('debería buscar por email', async () => {
      const response = await request(app)
        .get('/api/crm/customers?search=test')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
    });
  });

  describe('GET /api/crm/customers/:id', () => {
    it('debería devolver cliente por ID', async () => {
      const response = await request(app)
        .get(`/api/crm/customers/${testCustomerId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id', testCustomerId);
      expect(response.body.data).toHaveProperty('email', 'test@customer.com');
    });

    it('debería devolver 404 para cliente inexistente', async () => {
      const response = await request(app)
        .get('/api/crm/customers/99999')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /api/crm/customers/:id', () => {
    it('debería actualizar cliente existente', async () => {
      const updateData = {
        name: 'Cliente Actualizado',
        phone: '+9999999999'
      };

      const response = await request(app)
        .put(`/api/crm/customers/${testCustomerId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe(updateData.name);
      expect(response.body.data.phone).toBe(updateData.phone);
    });

    it('debería rechazar email duplicado en actualización', async () => {
      // Crear otro cliente
      await global.prisma.customer.create({
        data: {
          email: 'otro@email.com',
          name: 'Otro Cliente'
        }
      });

      const updateData = {
        email: 'otro@email.com' // Ya existe
      };

      const response = await request(app)
        .put(`/api/crm/customers/${testCustomerId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('DELETE /api/crm/customers/:id', () => {
    it('debería eliminar cliente (soft delete)', async () => {
      const response = await request(app)
        .delete(`/api/crm/customers/${testCustomerId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('deletedAt');
    });
  });

  describe('GET /api/crm/customers/:id/orders', () => {
    it('debería devolver órdenes del cliente', async () => {
      // Crear orden de prueba
      await global.prisma.order.create({
        data: {
          customerId: testCustomerId,
          productId: 1,
          quantity: 2,
          total: 2000
        }
      });

      const response = await request(app)
        .get(`/api/crm/customers/${testCustomerId}/orders`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  describe('GET /api/crm/customers/:id/stats', () => {
    it('debería devolver estadísticas del cliente', async () => {
      // Crear algunas órdenes para generar estadísticas
      await global.prisma.order.createMany({
        data: [
          {
            customerId: testCustomerId,
            productId: 1,
            quantity: 1,
            total: 1000
          },
          {
            customerId: testCustomerId,
            productId: 2,
            quantity: 2,
            total: 2000
          }
        ]
      });

      const response = await request(app)
        .get(`/api/crm/customers/${testCustomerId}/stats`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('totalOrders');
      expect(response.body.data).toHaveProperty('totalSpent');
      expect(response.body.data.totalOrders).toBe(2);
      expect(response.body.data.totalSpent).toBe(3000);
    });
  });

  describe('GET /api/crm/analytics', () => {
    it('debería devolver analytics generales', async () => {
      // Crear algunos datos para analytics
      await global.prisma.customer.createMany({
        data: [
          { email: 'analytics1@email.com', name: 'Analytics 1' },
          { email: 'analytics2@email.com', name: 'Analytics 2' }
        ]
      });

      await global.prisma.order.createMany({
        data: [
          { customerId: testCustomerId, productId: 1, total: 1000 },
          { customerId: testCustomerId, productId: 2, total: 1500 }
        ]
      });

      const response = await request(app)
        .get('/api/crm/analytics')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('totalCustomers');
      expect(response.body.data).toHaveProperty('totalOrders');
      expect(response.body.data).toHaveProperty('revenue');
    });
  });

  describe('Autenticación requerida', () => {
    it('debería requerir autenticación para operaciones CRUD', async () => {
      const customerData = {
        email: 'nuevo@cliente.com',
        name: 'Nuevo Cliente'
      };

      // Test sin token
      await request(app)
        .post('/api/crm/customers')
        .send(customerData)
        .expect(401);

      await request(app)
        .get('/api/crm/customers')
        .expect(401);

      await request(app)
        .put(`/api/crm/customers/${testCustomerId}`)
        .send({ name: 'Updated' })
        .expect(401);

      await request(app)
        .delete(`/api/crm/customers/${testCustomerId}`)
        .expect(401);
    });
  });
});
/**
 * Tests para CRMService
 */

const CRMService = require('../../src/services/CRMService');

describe('CRMService', () => {
  let crmService;

  beforeEach(() => {
    crmService = new CRMService();
  });

  describe('createCustomer', () => {
    it('debería crear un nuevo cliente', async () => {
      const customerData = {
        email: 'cliente@example.com',
        name: 'Juan Pérez',
        phone: '+1234567890',
        preferences: ['luxury', 'sport']
      };

      const mockCustomer = { id: 1, ...customerData, createdAt: new Date() };

      global.prisma = {
        customer: {
          create: jest.fn().mockResolvedValue(mockCustomer)
        }
      };

      const result = await crmService.createCustomer(customerData);

      expect(result).toEqual(mockCustomer);
      expect(global.prisma.customer.create).toHaveBeenCalledWith({
        data: customerData
      });
    });

    it('debería validar email único', async () => {
      const customerData = {
        email: 'existing@example.com',
        name: 'Cliente Existente',
        phone: '+1234567890'
      };

      const error = new Error('Email already exists');
      error.code = 'P2002';

      global.prisma = {
        customer: {
          create: jest.fn().mockRejectedValue(error)
        }
      };

      await expect(crmService.createCustomer(customerData)).rejects.toThrow('Email already exists');
    });
  });

  describe('getCustomers', () => {
    it('debería devolver lista de clientes con paginación', async () => {
      const mockCustomers = [
        { id: 1, email: 'cliente1@example.com', name: 'Cliente 1' },
        { id: 2, email: 'cliente2@example.com', name: 'Cliente 2' }
      ];

      global.prisma = {
        customer: {
          findMany: jest.fn().mockResolvedValue(mockCustomers)
        }
      };

      const result = await crmService.getCustomers();

      expect(result).toEqual(mockCustomers);
      expect(global.prisma.customer.findMany).toHaveBeenCalled();
    });
  });

  describe('getCustomerById', () => {
    it('debería devolver un cliente por ID', async () => {
      const mockCustomer = {
        id: 1,
        email: 'cliente@example.com',
        name: 'Juan Pérez',
        orders: []
      };

      global.prisma = {
        customer: {
          findUnique: jest.fn().mockResolvedValue(mockCustomer)
        }
      };

      const result = await crmService.getCustomerById(1);

      expect(result).toEqual(mockCustomer);
      expect(global.prisma.customer.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        include: { orders: true }
      });
    });
  });

  describe('updateCustomer', () => {
    it('debería actualizar un cliente existente', async () => {
      const updateData = { name: 'Juan Pérez Actualizado', phone: '+0987654321' };
      const mockUpdatedCustomer = { id: 1, email: 'cliente@example.com', ...updateData };

      global.prisma = {
        customer: {
          update: jest.fn().mockResolvedValue(mockUpdatedCustomer)
        }
      };

      const result = await crmService.updateCustomer(1, updateData);

      expect(result).toEqual(mockUpdatedCustomer);
      expect(global.prisma.customer.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: updateData
      });
    });
  });

  describe('deleteCustomer', () => {
    it('debería eliminar un cliente (soft delete)', async () => {
      const mockCustomer = { id: 1, email: 'cliente@example.com', deletedAt: new Date() };

      global.prisma = {
        customer: {
          update: jest.fn().mockResolvedValue(mockCustomer)
        }
      };

      const result = await crmService.deleteCustomer(1);

      expect(result).toEqual(mockCustomer);
      expect(global.prisma.customer.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { deletedAt: expect.any(Date) }
      });
    });
  });

  describe('getCustomerOrders', () => {
    it('debería devolver órdenes de un cliente', async () => {
      const mockOrders = [
        { id: 1, customerId: 1, productId: 10, quantity: 1 },
        { id: 2, customerId: 1, productId: 20, quantity: 2 }
      ];

      global.prisma = {
        order: {
          findMany: jest.fn().mockResolvedValue(mockOrders)
        }
      };

      const result = await crmService.getCustomerOrders(1);

      expect(result).toEqual(mockOrders);
      expect(global.prisma.order.findMany).toHaveBeenCalledWith({
        where: { customerId: 1 }
      });
    });
  });

  describe('getCustomerStats', () => {
    it('debería devolver estadísticas del cliente', async () => {
      const mockStats = {
        totalOrders: 5,
        totalSpent: 15000,
        lastOrderDate: new Date('2024-01-01'),
        favoriteCategory: 'luxury'
      };

      global.prisma = {
        $transaction: jest.fn().mockResolvedValue([
          [{ count: 5 }], // totalOrders
          [{ _sum: { total: 15000 } }], // totalSpent
          [{ max: { createdAt: new Date('2024-01-01') } }] // lastOrderDate
        ])
      };

      const result = await crmService.getCustomerStats(1);

      expect(result).toEqual(mockStats);
    });
  });
});
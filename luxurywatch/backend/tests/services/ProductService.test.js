/**
 * Tests para ProductService
 */

const ProductService = require('../../src/services/ProductService');

describe('ProductService', () => {
  let productService;

  beforeEach(() => {
    productService = new ProductService();
  });

  describe('getProducts', () => {
    it('debería devolver una lista de productos', async () => {
      const mockProducts = [
        { id: 1, name: 'Luxury Watch 1', price: 1000, category: 'premium' },
        { id: 2, name: 'Luxury Watch 2', price: 1500, category: 'luxury' }
      ];

      // Mock de prisma
      global.prisma = {
        product: {
          findMany: jest.fn().mockResolvedValue(mockProducts)
        }
      };

      const result = await productService.getProducts();

      expect(result).toEqual(mockProducts);
      expect(global.prisma.product.findMany).toHaveBeenCalled();
    });

    it('debería manejar errores correctamente', async () => {
      global.prisma = {
        product: {
          findMany: jest.fn().mockRejectedValue(new Error('Database error'))
        }
      };

      await expect(productService.getProducts()).rejects.toThrow('Database error');
    });
  });

  describe('getProductById', () => {
    it('debería devolver un producto por ID', async () => {
      const mockProduct = { id: 1, name: 'Test Watch', price: 1000 };

      global.prisma = {
        product: {
          findUnique: jest.fn().mockResolvedValue(mockProduct)
        }
      };

      const result = await productService.getProductById(1);

      expect(result).toEqual(mockProduct);
      expect(global.prisma.product.findUnique).toHaveBeenCalledWith({
        where: { id: 1 }
      });
    });

    it('debería devolver null si el producto no existe', async () => {
      global.prisma = {
        product: {
          findUnique: jest.fn().mockResolvedValue(null)
        }
      };

      const result = await productService.getProductById(999);

      expect(result).toBeNull();
    });
  });

  describe('createProduct', () => {
    it('debería crear un nuevo producto', async () => {
      const productData = {
        name: 'New Luxury Watch',
        price: 2000,
        category: 'premium',
        description: 'A beautiful luxury watch'
      };

      const mockCreatedProduct = { id: 3, ...productData };

      global.prisma = {
        product: {
          create: jest.fn().mockResolvedValue(mockCreatedProduct)
        }
      };

      const result = await productService.createProduct(productData);

      expect(result).toEqual(mockCreatedProduct);
      expect(global.prisma.product.create).toHaveBeenCalledWith({
        data: productData
      });
    });

    it('debería validar datos requeridos', async () => {
      const invalidData = { name: 'Incomplete Product' };

      global.prisma = {
        product: {
          create: jest.fn().mockRejectedValue(new Error('Validation failed'))
        }
      };

      await expect(productService.createProduct(invalidData)).rejects.toThrow();
    });
  });

  describe('updateProduct', () => {
    it('debería actualizar un producto existente', async () => {
      const updateData = { name: 'Updated Watch Name', price: 2500 };
      const mockUpdatedProduct = { id: 1, ...updateData };

      global.prisma = {
        product: {
          update: jest.fn().mockResolvedValue(mockUpdatedProduct)
        }
      };

      const result = await productService.updateProduct(1, updateData);

      expect(result).toEqual(mockUpdatedProduct);
      expect(global.prisma.product.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: updateData
      });
    });
  });

  describe('deleteProduct', () => {
    it('debería eliminar un producto', async () => {
      global.prisma = {
        product: {
          delete: jest.fn().mockResolvedValue({ id: 1 })
        }
      };

      const result = await productService.deleteProduct(1);

      expect(result).toEqual({ id: 1 });
      expect(global.prisma.product.delete).toHaveBeenCalledWith({
        where: { id: 1 }
      });
    });
  });
});
const express = require('express');
const router = express.Router();
const ProductService = require('../services/ProductService');
const CRMService = require('../services/CRMService');
const ChatService = require('../services/ChatService');
const { authMiddleware } = require('../middleware/auth');
const { rateLimit } = require('../middleware/rateLimit');
const { validateRequest } = require('../middleware/validation');
const { upload } = require('../middleware/upload');
const logger = require('../utils/logger');

// Inicializar servicios
const productService = new ProductService();
const crmService = new CRMService();
const chatService = new ChatService();

// =====================================
// RUTAS DE PRODUCTOS
// =====================================

/**
 * @route   GET /api/products
 * @desc    Obtener productos con filtros
 * @access  Public
 */
router.get('/products', 
  rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }), // 100 requests per 15 minutes
  async (req, res) => {
    try {
      const filters = {
        page: parseInt(req.query.page) || 1,
        limit: Math.min(parseInt(req.query.limit) || 20, 100), // Max 100 items
        categoryId: req.query.categoryId ? parseInt(req.query.categoryId) : null,
        search: req.query.search,
        status: req.query.status || 'ACTIVE',
        isFeatured: req.query.featured === 'true' ? true : req.query.featured === 'false' ? false : undefined,
        sortBy: req.query.sortBy || 'createdAt',
        sortOrder: req.query.sortOrder || 'desc'
      };

      const result = await productService.getProducts(filters);
      
      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      logger.error('Error en GET /products', error);
      res.status(500).json({
        success: false,
        error: 'Error al obtener productos'
      });
    }
  }
);

/**
 * @route   GET /api/products/:identifier
 * @desc    Obtener producto por ID o slug
 * @access  Public
 */
router.get('/products/:identifier', 
  rateLimit({ windowMs: 15 * 60 * 1000, max: 200 }),
  async (req, res) => {
    try {
      const { identifier } = req.params;
      const product = await productService.getProduct(identifier);
      
      res.json({
        success: true,
        data: product
      });
    } catch (error) {
      logger.error('Error en GET /products/:identifier', error);
      res.status(error.message === 'Producto no encontrado' ? 404 : 500).json({
        success: false,
        error: error.message
      });
    }
  }
);

/**
 * @route   POST /api/products
 * @desc    Crear nuevo producto
 * @access  Private (Admin)
 */
router.post('/products',
  authMiddleware,
  rateLimit({ windowMs: 15 * 60 * 1000, max: 20 }),
  upload.single('featuredImage'),
  validateRequest({
    name: 'required|string|max:255',
    slug: 'required|string|max:255|unique',
    description: 'string',
    productType: 'in:SIMPLE,VARIABLE,CONFIGURABLE',
    categoryId: 'integer',
    price: 'decimal:10,2'
  }),
  async (req, res) => {
    try {
      const productData = {
        ...req.body,
        featuredImage: req.file ? req.file.filename : req.body.featuredImage
      };

      const product = await productService.createProduct(productData);
      
      res.status(201).json({
        success: true,
        data: product,
        message: 'Producto creado exitosamente'
      });
    } catch (error) {
      logger.error('Error en POST /products', error);
      res.status(error.message.includes('Ya existe') ? 400 : 500).json({
        success: false,
        error: error.message
      });
    }
  }
);

/**
 * @route   PUT /api/products/:id
 * @desc    Actualizar producto
 * @access  Private (Admin)
 */
router.put('/products/:id',
  authMiddleware,
  rateLimit({ windowMs: 15 * 60 * 1000, max: 30 }),
  async (req, res) => {
    try {
      const { id } = req.params;
      const product = await productService.updateProduct(id, req.body);
      
      res.json({
        success: true,
        data: product,
        message: 'Producto actualizado exitosamente'
      });
    } catch (error) {
      logger.error('Error en PUT /products/:id', error);
      res.status(error.message === 'Producto no encontrado' ? 404 : 500).json({
        success: false,
        error: error.message
      });
    }
  }
);

/**
 * @route   DELETE /api/products/:id
 * @desc    Eliminar producto
 * @access  Private (Admin)
 */
router.delete('/products/:id',
  authMiddleware,
  rateLimit({ windowMs: 15 * 60 * 1000, max: 10 }),
  async (req, res) => {
    try {
      const { id } = req.params;
      await productService.deleteProduct(id);
      
      res.json({
        success: true,
        message: 'Producto eliminado exitosamente'
      });
    } catch (error) {
      logger.error('Error en DELETE /products/:id', error);
      res.status(error.message === 'Producto no encontrado' ? 404 : 500).json({
        success: false,
        error: error.message
      });
    }
  }
);

/**
 * @route   GET /api/products/search
 * @desc    Búsqueda avanzada de productos
 * @access  Public
 */
router.get('/products/search',
  rateLimit({ windowMs: 15 * 60 * 1000, max: 50 }),
  async (req, res) => {
    try {
      const searchParams = {
        query: req.query.query,
        categoryIds: req.query.categories ? req.query.categories.split(',').map(id => parseInt(id)) : [],
        priceMin: req.query.priceMin ? parseFloat(req.query.priceMin) : null,
        priceMax: req.query.priceMax ? parseFloat(req.query.priceMax) : null,
        materials: req.query.materials ? req.query.materials.split(',') : [],
        styles: req.query.styles ? req.query.styles.split(',') : [],
        sizes: req.query.sizes ? req.query.sizes.split(',') : [],
        availability: req.query.availability || 'in_stock',
        sortBy: req.query.sortBy || 'relevance',
        page: parseInt(req.query.page) || 1,
        limit: Math.min(parseInt(req.query.limit) || 20, 50)
      };

      const result = await productService.searchProducts(searchParams);
      
      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      logger.error('Error en GET /products/search', error);
      res.status(500).json({
        success: false,
        error: 'Error en la búsqueda de productos'
      });
    }
  }
);

// =====================================
// COMPONENTES 3D PARA WATCHES
// =====================================

/**
 * @route   GET /api/watch-components/materials
 * @desc    Obtener materiales disponibles
 * @access  Public
 */
router.get('/watch-components/materials',
  rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }),
  async (req, res) => {
    try {
      const materials = await productService.getWatchMaterials();
      
      res.json({
        success: true,
        data: materials
      });
    } catch (error) {
      logger.error('Error en GET /watch-components/materials', error);
      res.status(500).json({
        success: false,
        error: 'Error al obtener materiales'
      });
    }
  }
);

/**
 * @route   GET /api/watch-components/cases
 * @desc    Obtener cajas disponibles
 * @access  Public
 */
router.get('/watch-components/cases',
  rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }),
  async (req, res) => {
    try {
      const cases = await productService.getWatchCases();
      
      res.json({
        success: true,
        data: cases
      });
    } catch (error) {
      logger.error('Error en GET /watch-components/cases', error);
      res.status(500).json({
        success: false,
        error: 'Error al obtener cajas'
      });
    }
  }
);

/**
 * @route   GET /api/watch-components/dials
 * @desc    Obtener esferas disponibles
 * @access  Public
 */
router.get('/watch-components/dials',
  rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }),
  async (req, res) => {
    try {
      const dials = await productService.getWatchDials();
      
      res.json({
        success: true,
        data: dials
      });
    } catch (error) {
      logger.error('Error en GET /watch-components/dials', error);
      res.status(500).json({
        success: false,
        error: 'Error al obtener esferas'
      });
    }
  }
);

/**
 * @route   GET /api/watch-components/hands
 * @desc    Obtener manecillas disponibles
 * @access  Public
 */
router.get('/watch-components/hands',
  rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }),
  async (req, res) => {
    try {
      const hands = await productService.getWatchHands();
      
      res.json({
        success: true,
        data: hands
      });
    } catch (error) {
      logger.error('Error en GET /watch-components/hands', error);
      res.status(500).json({
        success: false,
        error: 'Error al obtener manecillas'
      });
    }
  }
);

/**
 * @route   GET /api/watch-components/straps
 * @desc    Obtener correas disponibles
 * @access  Public
 */
router.get('/watch-components/straps',
  rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }),
  async (req, res) => {
    try {
      const straps = await productService.getWatchStraps();
      
      res.json({
        success: true,
        data: straps
      });
    } catch (error) {
      logger.error('Error en GET /watch-components/straps', error);
      res.status(500).json({
        success: false,
        error: 'Error al obtener correas'
      });
    }
  }
);

/**
 * @route   POST /api/products/calculate-3d-price
 * @desc    Calcular precio de configuración 3D
 * @access  Public
 */
router.post('/products/calculate-3d-price',
  rateLimit({ windowMs: 15 * 60 * 1000, max: 50 }),
  validateRequest({
    materialId: 'integer',
    caseId: 'integer',
    dialId: 'integer',
    handsId: 'integer',
    strapId: 'integer'
  }),
  async (req, res) => {
    try {
      const result = await productService.calculate3DConfigPrice(req.body);
      
      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      logger.error('Error en POST /products/calculate-3d-price', error);
      res.status(500).json({
        success: false,
        error: 'Error calculando precio de configuración'
      });
    }
  }
);

/**
 * @route   POST /api/products/validate-3d-config
 * @desc    Validar configuración 3D
 * @access  Public
 */
router.post('/products/validate-3d-config',
  rateLimit({ windowMs: 15 * 60 * 1000, max: 50 }),
  validateRequest({
    materialId: 'integer',
    caseId: 'integer'
  }),
  async (req, res) => {
    try {
      const result = await productService.validate3DConfiguration(req.body);
      
      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      logger.error('Error en POST /products/validate-3d-config', error);
      res.status(500).json({
        success: false,
        error: 'Error validando configuración 3D'
      });
    }
  }
);

// =====================================
// VARIACIONES DE PRODUCTO
// =====================================

/**
 * @route   POST /api/products/:productId/variants
 * @desc    Crear variación de producto
 * @access  Private (Admin)
 */
router.post('/products/:productId/variants',
  authMiddleware,
  rateLimit({ windowMs: 15 * 60 * 1000, max: 20 }),
  async (req, res) => {
    try {
      const { productId } = req.params;
      const variantData = {
        ...req.body,
        productId
      };

      const variant = await productService.createProductVariant(variantData);
      
      res.status(201).json({
        success: true,
        data: variant,
        message: 'Variación creada exitosamente'
      });
    } catch (error) {
      logger.error('Error en POST /products/:productId/variants', error);
      res.status(error.message === 'Producto no encontrado' ? 404 : 500).json({
        success: false,
        error: error.message
      });
    }
  }
);

/**
 * @route   PUT /api/variants/:variantId/stock
 * @desc    Actualizar stock de variación
 * @access  Private (Admin)
 */
router.put('/variants/:variantId/stock',
  authMiddleware,
  rateLimit({ windowMs: 15 * 60 * 1000, max: 30 }),
  validateRequest({
    quantity: 'required|integer|min:0',
    operation: 'in:set,add,subtract'
  }),
  async (req, res) => {
    try {
      const { variantId } = req.params;
      const { quantity, operation = 'set' } = req.body;

      const result = await productService.updateVariantStock(variantId, quantity, operation);
      
      res.json({
        success: true,
        data: result,
        message: 'Stock actualizado exitosamente'
      });
    } catch (error) {
      logger.error('Error en PUT /variants/:variantId/stock', error);
      res.status(error.message === 'Variación no encontrada' ? 404 : 500).json({
        success: false,
        error: error.message
      });
    }
  }
);

// =====================================
// PRODUCTOS RELACIONADOS
// =====================================

/**
 * @route   GET /api/products/:id/related
 * @desc    Obtener productos relacionados
 * @access  Public
 */
router.get('/products/:id/related',
  rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }),
  async (req, res) => {
    try {
      const { id } = req.params;
      const limit = Math.min(parseInt(req.query.limit) || 4, 10);
      
      const products = await productService.getRelatedProducts(id, limit);
      
      res.json({
        success: true,
        data: products
      });
    } catch (error) {
      logger.error('Error en GET /products/:id/related', error);
      res.status(error.message === 'Producto no encontrado' ? 404 : 500).json({
        success: false,
        error: error.message
      });
    }
  }
);

module.exports = router;

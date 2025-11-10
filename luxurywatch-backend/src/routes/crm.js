const express = require('express');
const router = express.Router();
const CRMService = require('../services/CRMService');
const { authMiddleware } = require('../middleware/auth');
const { rateLimit } = require('../middleware/rateLimit');
const { validateRequest } = require('../middleware/validation');
const logger = require('../utils/logger');

// Inicializar servicio
const crmService = new CRMService();

// =====================================
// GESTIÓN DE CLIENTES
// =====================================

/**
 * @route   GET /api/customers
 * @desc    Obtener clientes con filtros
 * @access  Private (Admin/Sales)
 */
router.get('/customers',
  authMiddleware,
  rateLimit({ windowMs: 15 * 60 * 1000, max: 50 }),
  async (req, res) => {
    try {
      const filters = {
        page: parseInt(req.query.page) || 1,
        limit: Math.min(parseInt(req.query.limit) || 20, 100),
        search: req.query.search,
        customerType: req.query.customerType,
        status: req.query.status || 'ACTIVE',
        sortBy: req.query.sortBy || 'createdAt',
        sortOrder: req.query.sortOrder || 'desc'
      };

      const result = await crmService.getCustomers(filters);
      
      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      logger.error('Error en GET /customers', error);
      res.status(500).json({
        success: false,
        error: 'Error al obtener clientes'
      });
    }
  }
);

/**
 * @route   GET /api/customers/:id
 * @desc    Obtener cliente por ID
 * @access  Private (Admin/Sales)
 */
router.get('/customers/:id',
  authMiddleware,
  rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }),
  async (req, res) => {
    try {
      const { id } = req.params;
      const customer = await crmService.getCustomer(id);
      
      res.json({
        success: true,
        data: customer
      });
    } catch (error) {
      logger.error('Error en GET /customers/:id', error);
      res.status(error.message === 'Cliente no encontrado' ? 404 : 500).json({
        success: false,
        error: error.message
      });
    }
  }
);

/**
 * @route   POST /api/customers
 * @desc    Crear nuevo cliente
 * @access  Public/Private (Admin)
 */
router.post('/customers',
  rateLimit({ windowMs: 15 * 60 * 1000, max: 30 }),
  validateRequest({
    email: 'required|email',
    firstName: 'string|max:100',
    lastName: 'string|max:100',
    company: 'string|max:255',
    phone: 'string|max:50',
    customerType: 'in:INDIVIDUAL,BUSINESS,WHOLESALE'
  }),
  async (req, res) => {
    try {
      const customer = await crmService.createCustomer(req.body);
      
      res.status(201).json({
        success: true,
        data: customer,
        message: 'Cliente creado exitosamente'
      });
    } catch (error) {
      logger.error('Error en POST /customers', error);
      res.status(error.message.includes('Ya existe') ? 400 : 500).json({
        success: false,
        error: error.message
      });
    }
  }
);

/**
 * @route   PUT /api/customers/:id
 * @desc    Actualizar cliente
 * @access  Private (Admin/Sales)
 */
router.put('/customers/:id',
  authMiddleware,
  rateLimit({ windowMs: 15 * 60 * 1000, max: 50 }),
  validateRequest({
    email: 'email',
    firstName: 'string|max:100',
    lastName: 'string|max:100',
    company: 'string|max:255',
    phone: 'string|max:50'
  }),
  async (req, res) => {
    try {
      const { id } = req.params;
      const customer = await crmService.updateCustomer(id, req.body);
      
      res.json({
        success: true,
        data: customer,
        message: 'Cliente actualizado exitosamente'
      });
    } catch (error) {
      logger.error('Error en PUT /customers/:id', error);
      res.status(error.message === 'Cliente no encontrado' ? 404 : 500).json({
        success: false,
        error: error.message
      });
    }
  }
);

/**
 * @route   POST /api/customers/:id/addresses
 * @desc    Añadir dirección a cliente
 * @access  Private (Admin/Sales)
 */
router.post('/customers/:id/addresses',
  authMiddleware,
  rateLimit({ windowMs: 15 * 60 * 1000, max: 30 }),
  validateRequest({
    type: 'in:BILLING,SHIPPING,BOTH',
    firstName: 'string|max:100',
    lastName: 'string|max:100',
    company: 'string|max:255',
    addressLine1: 'required|string|max:255',
    addressLine2: 'string|max:255',
    city: 'required|string|max:100',
    state: 'string|max:100',
    postalCode: 'required|string|max:20',
    country: 'required|string|length:2'
  }),
  async (req, res) => {
    try {
      const { id } = req.params;
      const address = await crmService.addCustomerAddress(id, req.body);
      
      res.status(201).json({
        success: true,
        data: address,
        message: 'Dirección añadida exitosamente'
      });
    } catch (error) {
      logger.error('Error en POST /customers/:id/addresses', error);
      res.status(error.message === 'Cliente no encontrado' ? 404 : 500).json({
        success: false,
        error: error.message
      });
    }
  }
);

// =====================================
// OPORTUNIDADES DE VENTA
// =====================================

/**
 * @route   GET /api/opportunities
 * @desc    Obtener oportunidades de venta
 * @access  Private (Admin/Sales)
 */
router.get('/opportunities',
  authMiddleware,
  rateLimit({ windowMs: 15 * 60 * 1000, max: 50 }),
  async (req, res) => {
    try {
      const filters = {
        page: parseInt(req.query.page) || 1,
        limit: Math.min(parseInt(req.query.limit) || 20, 100),
        customerId: req.query.customerId,
        stage: req.query.stage,
        assignedTo: req.query.assignedTo,
        search: req.query.search,
        sortBy: req.query.sortBy || 'createdAt',
        sortOrder: req.query.sortOrder || 'desc'
      };

      const result = await crmService.getOpportunities(filters);
      
      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      logger.error('Error en GET /opportunities', error);
      res.status(500).json({
        success: false,
        error: 'Error al obtener oportunidades'
      });
    }
  }
);

/**
 * @route   POST /api/opportunities
 * @desc    Crear nueva oportunidad
 * @access  Private (Admin/Sales)
 */
router.post('/opportunities',
  authMiddleware,
  rateLimit({ windowMs: 15 * 60 * 1000, max: 30 }),
  validateRequest({
    customerId: 'string',
    title: 'required|string|max:255',
    description: 'string',
    value: 'decimal:12,2',
    currency: 'string|length:3',
    stage: 'in:PROSPECT,QUALIFIED,PROPOSAL,NEGOTIATION,CLOSED_WON,CLOSED_LOST',
    probability: 'integer|min:0|max:100',
    expectedCloseDate: 'date'
  }),
  async (req, res) => {
    try {
      const opportunity = await crmService.createOpportunity(req.body);
      
      res.status(201).json({
        success: true,
        data: opportunity,
        message: 'Oportunidad creada exitosamente'
      });
    } catch (error) {
      logger.error('Error en POST /opportunities', error);
      res.status(500).json({
        success: false,
        error: 'Error al crear oportunidad'
      });
    }
  }
);

/**
 * @route   PUT /api/opportunities/:id/stage
 * @desc    Actualizar etapa de oportunidad
 * @access  Private (Admin/Sales)
 */
router.put('/opportunities/:id/stage',
  authMiddleware,
  rateLimit({ windowMs: 15 * 60 * 1000, max: 50 }),
  validateRequest({
    stage: 'required|in:PROSPECT,QUALIFIED,PROPOSAL,NEGOTIATION,CLOSED_WON,CLOSED_LOST',
    probability: 'required|integer|min:0|max:100',
    actualCloseDate: 'date'
  }),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { stage, probability, actualCloseDate } = req.body;
      
      const opportunity = await crmService.updateOpportunityStage(id, stage, probability, actualCloseDate);
      
      res.json({
        success: true,
        data: opportunity,
        message: 'Etapa de oportunidad actualizada exitosamente'
      });
    } catch (error) {
      logger.error('Error en PUT /opportunities/:id/stage', error);
      res.status(500).json({
        success: false,
        error: 'Error al actualizar etapa de oportunidad'
      });
    }
  }
);

// =====================================
// LEADS Y ASIGNACIÓN
// =====================================

/**
 * @route   GET /api/leads/unassigned
 * @desc    Obtener leads no asignados
 * @access  Private (Admin/Sales)
 */
router.get('/leads/unassigned',
  authMiddleware,
  rateLimit({ windowMs: 15 * 60 * 1000, max: 50 }),
  async (req, res) => {
    try {
      const limit = Math.min(parseInt(req.query.limit) || 20, 50);
      const leads = await crmService.getUnassignedLeads(limit);
      
      res.json({
        success: true,
        data: leads
      });
    } catch (error) {
      logger.error('Error en GET /leads/unassigned', error);
      res.status(500).json({
        success: false,
        error: 'Error al obtener leads no asignados'
      });
    }
  }
);

/**
 * @route   POST /api/leads/:id/assign
 * @desc    Asignar lead a representante
 * @access  Private (Admin/Sales)
 */
router.post('/leads/:id/assign',
  authMiddleware,
  rateLimit({ windowMs: 15 * 60 * 1000, max: 30 }),
  validateRequest({
    assignedTo: 'required|string'
  }),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { assignedTo } = req.body;
      
      const result = await crmService.assignLead(id, assignedTo);
      
      res.json({
        success: true,
        data: result,
        message: 'Lead asignado exitosamente'
      });
    } catch (error) {
      logger.error('Error en POST /leads/:id/assign', error);
      res.status(500).json({
        success: false,
        error: 'Error al asignar lead'
      });
    }
  }
);

// =====================================
// SEGMENTACIÓN Y CAMPAÑAS
// =====================================

/**
 * @route   GET /api/customers/segments
 * @desc    Obtener segmentación de clientes
 * @access  Private (Admin/Sales)
 */
router.get('/customers/segments',
  authMiddleware,
  rateLimit({ windowMs: 15 * 60 * 1000, max: 20 }),
  async (req, res) => {
    try {
      const segments = await crmService.segmentCustomersByValue();
      
      res.json({
        success: true,
        data: segments
      });
    } catch (error) {
      logger.error('Error en GET /customers/segments', error);
      res.status(500).json({
        success: false,
        error: 'Error al obtener segmentación de clientes'
      });
    }
  }
);

/**
 * @route   POST /api/campaigns
 * @desc    Crear campaña de email
 * @access  Private (Admin/Marketing)
 */
router.post('/campaigns',
  authMiddleware,
  rateLimit({ windowMs: 15 * 60 * 1000, max: 20 }),
  validateRequest({
    name: 'required|string|max:255',
    segmentType: 'required|in:vip,highValue,medium,lowValue,inactive',
    subject: 'required|string|max:255',
    content: 'required|string'
  }),
  async (req, res) => {
    try {
      const campaign = await crmService.createEmailCampaign(req.body);
      
      res.status(201).json({
        success: true,
        data: campaign,
        message: 'Campaña creada exitosamente'
      });
    } catch (error) {
      logger.error('Error en POST /campaigns', error);
      res.status(500).json({
        success: false,
        error: 'Error al crear campaña'
      });
    }
  }
);

// =====================================
// ACTIVIDADES Y NOTAS
// =====================================

/**
 * @route   POST /api/customers/:id/activities
 * @desc    Registrar actividad de cliente
 * @access  Private (Admin/Sales)
 */
router.post('/customers/:id/activities',
  authMiddleware,
  rateLimit({ windowMs: 15 * 60 * 1000, max: 50 }),
  validateRequest({
    type: 'required|string',
    description: 'required|string'
  }),
  async (req, res) => {
    try {
      const { id } = req.params;
      const result = await crmService.logCustomerActivity(id, req.body);
      
      res.json({
        success: true,
        data: result,
        message: 'Actividad registrada exitosamente'
      });
    } catch (error) {
      logger.error('Error en POST /customers/:id/activities', error);
      res.status(error.message === 'Cliente no encontrado' ? 404 : 500).json({
        success: false,
        error: error.message
      });
    }
  }
);

// =====================================
// ESTADÍSTICAS Y REPORTES
// =====================================

/**
 * @route   GET /api/stats/customers
 * @desc    Obtener estadísticas de clientes
 * @access  Private (Admin)
 */
router.get('/stats/customers',
  authMiddleware,
  rateLimit({ windowMs: 15 * 60 * 1000, max: 20 }),
  async (req, res) => {
    try {
      const stats = await crmService.getCustomerStats();
      
      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      logger.error('Error en GET /stats/customers', error);
      res.status(500).json({
        success: false,
        error: 'Error al obtener estadísticas de clientes'
      });
    }
  }
);

/**
 * @route   GET /api/stats/opportunities
 * @desc    Obtener estadísticas de oportunidades
 * @access  Private (Admin)
 */
router.get('/stats/opportunities',
  authMiddleware,
  rateLimit({ windowMs: 15 * 60 * 1000, max: 20 }),
  async (req, res) => {
    try {
      const stats = await crmService.getOpportunityStats();
      
      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      logger.error('Error en GET /stats/opportunities', error);
      res.status(500).json({
        success: false,
        error: 'Error al obtener estadísticas de oportunidades'
      });
    }
  }
);

/**
 * @route   GET /api/dashboard
 * @desc    Dashboard principal del CRM
 * @access  Private (Admin)
 */
router.get('/dashboard',
  authMiddleware,
  rateLimit({ windowMs: 15 * 60 * 1000, max: 30 }),
  async (req, res) => {
    try {
      const [customerStats, opportunityStats] = await Promise.all([
        crmService.getCustomerStats(),
        crmService.getOpportunityStats()
      ]);

      // Obtener métricas adicionales
      const recentLeads = await crmService.getUnassignedLeads(10);
      const topCustomers = customerStats.topBySpent.slice(0, 5);
      
      const dashboard = {
        overview: {
          totalCustomers: customerStats.total,
          activeCustomers: customerStats.active,
          newThisMonth: customerStats.newThisMonth,
          totalOpportunities: opportunityStats.total,
          conversionRate: opportunityStats.conversionRate
        },
        recentLeads,
        topCustomers,
        opportunityStages: opportunityStats.byStage,
        customerGrowth: {
          thisMonth: customerStats.newThisMonth,
          growth: 0 // Se calcularía con datos históricos
        },
        revenue: {
          totalValue: opportunityStats.totalValue,
          avgDealSize: opportunityStats.avgDealSize
        }
      };
      
      res.json({
        success: true,
        data: dashboard
      });
    } catch (error) {
      logger.error('Error en GET /dashboard', error);
      res.status(500).json({
        success: false,
        error: 'Error al obtener dashboard'
      });
    }
  }
);

module.exports = router;

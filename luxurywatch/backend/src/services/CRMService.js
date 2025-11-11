const { PrismaClient } = require('@prisma/client');
const { cacheService } = require('../config/redis');
const logger = require('../utils/logger');

class CRMService {
  constructor() {
    this.prisma = new PrismaClient();
  }

  // =====================================
  // GESTIÓN DE CLIENTES
  // =====================================

  /**
   * Obtener todos los clientes con filtros
   */
  async getCustomers(filters = {}) {
    try {
      const {
        page = 1,
        limit = 20,
        search,
        customerType,
        status = 'ACTIVE',
        sortBy = 'createdAt',
        sortOrder = 'desc'
      } = filters;

      // Verificar cache
      const cacheKey = `customers:${JSON.stringify(filters)}:${page}:${limit}`;
      const cached = await cacheService.get(cacheKey);
      if (cached) {
        return cached;
      }

      const skip = (page - 1) * limit;

      const where = {
        status: status || undefined,
        customerType: customerType || undefined,
        ...(search && {
          OR: [
            { email: { contains: search, mode: 'insensitive' } },
            { firstName: { contains: search, mode: 'insensitive' } },
            { lastName: { contains: search, mode: 'insensitive' } },
            { company: { contains: search, mode: 'insensitive' } },
            { phone: { contains: search, mode: 'insensitive' } }
          ]
        })
      };

      const [customers, total] = await Promise.all([
        this.prisma.customer.findMany({
          where,
          skip,
          take: limit,
          orderBy: { [sortBy]: sortOrder },
          include: {
            addresses: {
              where: { isDefault: true },
              take: 1
            },
            orders: {
              take: 1,
              orderBy: { createdAt: 'desc' }
            }
          }
        }),
        this.prisma.customer.count({ where })
      ]);

      const result = {
        customers,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      };

      // Guardar en cache por 15 minutos
      await cacheService.set(cacheKey, result, 900);

      return result;
    } catch (error) {
      logger.error('Error obteniendo clientes', error);
      throw new Error('Error al obtener clientes');
    }
  }

  /**
   * Obtener un cliente por ID
   */
  async getCustomer(customerId) {
    try {
      const cacheKey = `customer:${customerId}`;
      const cached = await cacheService.get(cacheKey);
      if (cached) {
        return cached;
      }

      const customer = await this.prisma.customer.findUnique({
        where: { id: customerId },
        include: {
          addresses: {
            orderBy: { isDefault: 'desc' }
          },
          orders: {
            orderBy: { createdAt: 'desc' },
            take: 10
          },
          opportunities: {
            orderBy: { createdAt: 'desc' },
            take: 5
          }
        }
      });

      if (!customer) {
        throw new Error('Cliente no encontrado');
      }

      // Guardar en cache por 30 minutos
      await cacheService.set(cacheKey, customer, 1800);

      return customer;
    } catch (error) {
      logger.error('Error obteniendo cliente', error);
      throw error;
    }
  }

  /**
   * Crear un nuevo cliente
   */
  async createCustomer(customerData) {
    try {
      const {
        email,
        firstName,
        lastName,
        company,
        phone,
        taxId,
        customerType = 'INDIVIDUAL',
        birthday,
        gender,
        marketingOptIn = false,
        notes,
        tags
      } = customerData;

      // Verificar email único
      const existingCustomer = await this.prisma.customer.findUnique({
        where: { email }
      });

      if (existingCustomer) {
        throw new Error('Ya existe un cliente con este email');
      }

      const customer = await this.prisma.customer.create({
        data: {
          email,
          firstName,
          lastName,
          company,
          phone,
          taxId,
          customerType,
          birthday: birthday ? new Date(birthday) : null,
          gender,
          marketingOptIn,
          notes,
          tags
        }
      });

      // Limpiar cache
      await cacheService.clearPattern('customers:*');

      logger.info('Cliente creado exitosamente', { customerId: customer.id, email: customer.email });

      return customer;
    } catch (error) {
      logger.error('Error creando cliente', error);
      throw error;
    }
  }

  /**
   * Actualizar un cliente
   */
  async updateCustomer(customerId, updateData) {
    try {
      const customer = await this.prisma.customer.findUnique({
        where: { id: customerId }
      });

      if (!customer) {
        throw new Error('Cliente no encontrado');
      }

      // Verificar email único si se está actualizando
      if (updateData.email && updateData.email !== customer.email) {
        const existingCustomer = await this.prisma.customer.findUnique({
          where: { email: updateData.email }
        });

        if (existingCustomer) {
          throw new Error('Ya existe un cliente con este email');
        }
      }

      const updatedCustomer = await this.prisma.customer.update({
        where: { id: customerId },
        data: {
          ...updateData,
          updatedAt: new Date()
        }
      });

      // Limpiar cache
      await cacheService.del(`customer:${customerId}`);
      await cacheService.clearPattern('customers:*');

      logger.info('Cliente actualizado exitosamente', { customerId });

      return updatedCustomer;
    } catch (error) {
      logger.error('Error actualizando cliente', error);
      throw error;
    }
  }

  /**
   * Añadir dirección a cliente
   */
  async addCustomerAddress(customerId, addressData) {
    try {
      const {
        type = 'BOTH',
        firstName,
        lastName,
        company,
        addressLine1,
        addressLine2,
        city,
        state,
        postalCode,
        country,
        phone,
        isDefault = false
      } = addressData;

      const result = await this.prisma.$transaction(async (tx) => {
        // Si es la dirección por defecto, desmarcar otras del mismo tipo
        if (isDefault) {
          await tx.customerAddress.updateMany({
            where: {
              customerId,
              type
            },
            data: { isDefault: false }
          });
        }

        return await tx.customerAddress.create({
          data: {
            customerId,
            type,
            firstName,
            lastName,
            company,
            addressLine1,
            addressLine2,
            city,
            state,
            postalCode,
            country,
            phone,
            isDefault
          }
        });
      });

      // Limpiar cache del cliente
      await cacheService.del(`customer:${customerId}`);

      logger.info('Dirección añadida exitosamente', { customerId, addressId: result.id });

      return result;
    } catch (error) {
      logger.error('Error añadiendo dirección', error);
      throw error;
    }
  }

  // =====================================
  // OPORTUNIDADES DE VENTA
  // =====================================

  /**
   * Obtener oportunidades de venta
   */
  async getOpportunities(filters = {}) {
    try {
      const {
        page = 1,
        limit = 20,
        customerId,
        stage,
        assignedTo,
        search,
        sortBy = 'createdAt',
        sortOrder = 'desc'
      } = filters;

      const skip = (page - 1) * limit;

      const where = {
        ...(customerId && { customerId }),
        ...(stage && { stage }),
        ...(assignedTo && { assignedTo }),
        ...(search && {
          OR: [
            { title: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } }
          ]
        })
      };

      const [opportunities, total] = await Promise.all([
        this.prisma.salesOpportunity.findMany({
          where,
          skip,
          take: limit,
          orderBy: { [sortBy]: sortOrder },
          include: {
            customer: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                company: true
              }
            }
          }
        }),
        this.prisma.salesOpportunity.count({ where })
      ]);

      return {
        opportunities,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      logger.error('Error obteniendo oportunidades', error);
      throw new Error('Error al obtener oportunidades');
    }
  }

  /**
   * Crear una nueva oportunidad
   */
  async createOpportunity(opportunityData) {
    try {
      const {
        customerId,
        title,
        description,
        value,
        currency = 'USD',
        stage = 'PROSPECT',
        probability = 0,
        expectedCloseDate,
        assignedTo,
        source = 'WEBSITE',
        productsInterest,
        notes
      } = opportunityData;

      const result = await this.prisma.salesOpportunity.create({
        data: {
          customerId,
          title,
          description,
          value,
          currency,
          stage,
          probability,
          expectedCloseDate: expectedCloseDate ? new Date(expectedCloseDate) : null,
          assignedTo,
          source,
          productsInterest,
          notes
        },
        include: {
          customer: true
        }
      });

      logger.info('Oportunidad creada exitosamente', { 
        opportunityId: result.id, 
        title: result.title 
      });

      return result;
    } catch (error) {
      logger.error('Error creando oportunidad', error);
      throw error;
    }
  }

  /**
   * Actualizar etapa de oportunidad
   */
  async updateOpportunityStage(opportunityId, newStage, probability, actualCloseDate = null) {
    try {
      const updateData = {
        stage: newStage,
        probability,
        updatedAt: new Date()
      };

      if (actualCloseDate) {
        updateData.actualCloseDate = new Date(actualCloseDate);
      }

      // Si se cierra como ganado, actualizar valor total
      if (newStage === 'CLOSED_WON') {
        const opportunity = await this.prisma.salesOpportunity.findUnique({
          where: { id: opportunityId },
          include: { customer: true }
        });

        if (opportunity && opportunity.value) {
          // Actualizar estadísticas del cliente
          await this.prisma.customer.update({
            where: { id: opportunity.customerId },
            data: {
              totalSpent: opportunity.customer.totalSpent + opportunity.value,
              ordersCount: opportunity.customer.ordersCount + 1,
              lastOrderDate: new Date()
            }
          });
        }
      }

      const result = await this.prisma.salesOpportunity.update({
        where: { id: opportunityId },
        data: updateData
      });

      logger.info('Etapa de oportunidad actualizada', { 
        opportunityId, 
        newStage, 
        probability 
      });

      return result;
    } catch (error) {
      logger.error('Error actualizando etapa de oportunidad', error);
      throw error;
    }
  }

  // =====================================
  // ESTADÍSTICAS Y REPORTES
  // =====================================

  /**
   * Obtener estadísticas de clientes
   */
  async getCustomerStats() {
    try {
      const cacheKey = 'stats:customers';
      const cached = await cacheService.get(cacheKey);
      if (cached) {
        return cached;
      }

      const [
        totalCustomers,
        activeCustomers,
        newCustomersThisMonth,
        customerTypes,
        topCustomersBySpent
      ] = await Promise.all([
        this.prisma.customer.count(),
        this.prisma.customer.count({ where: { status: 'ACTIVE' } }),
        this.prisma.customer.count({
          where: {
            createdAt: {
              gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
            }
          }
        }),
        this.prisma.customer.groupBy({
          by: ['customerType'],
          _count: true
        }),
        this.prisma.customer.findMany({
          take: 10,
          orderBy: { totalSpent: 'desc' },
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            totalSpent: true,
            ordersCount: true
          }
        })
      ]);

      const stats = {
        total: totalCustomers,
        active: activeCustomers,
        newThisMonth: newCustomersThisMonth,
        byType: customerTypes.reduce((acc, type) => {
          acc[type.customerType] = type._count;
          return acc;
        }, {}),
        topBySpent: topCustomersBySpent
      };

      // Guardar en cache por 1 hora
      await cacheService.set(cacheKey, stats, 3600);

      return stats;
    } catch (error) {
      logger.error('Error obteniendo estadísticas de clientes', error);
      throw error;
    }
  }

  /**
   * Obtener estadísticas de oportunidades
   */
  async getOpportunityStats() {
    try {
      const cacheKey = 'stats:opportunities';
      const cached = await cacheService.get(cacheKey);
      if (cached) {
        return cached;
      }

      const [
        totalOpportunities,
        opportunitiesByStage,
        totalValue,
        avgDealSize,
        conversionRate,
        topPerformingReps
      ] = await Promise.all([
        this.prisma.salesOpportunity.count(),
        this.prisma.salesOpportunity.groupBy({
          by: ['stage'],
          _count: true,
          _sum: { value: true }
        }),
        this.prisma.salesOpportunity.aggregate({
          _sum: { value: true }
        }),
        this.prisma.salesOpportunity.aggregate({
          _avg: { value: true }
        }),
        this.calculateConversionRate(),
        this.getTopPerformingReps()
      ]);

      const stats = {
        total: totalOpportunities,
        byStage: opportunitiesByStage.reduce((acc, stage) => {
          acc[stage.stage] = {
            count: stage._count,
            value: stage._sum.value || 0
          };
          return acc;
        }, {}),
        totalValue: totalValue._sum.value || 0,
        avgDealSize: avgDealSize._avg.value || 0,
        conversionRate,
        topPerformingReps
      };

      // Guardar en cache por 1 hora
      await cacheService.set(cacheKey, stats, 3600);

      return stats;
    } catch (error) {
      logger.error('Error obteniendo estadísticas de oportunidades', error);
      throw error;
    }
  }

  /**
   * Calcular tasa de conversión
   */
  async calculateConversionRate() {
    try {
      const [totalOpportunities, closedWon] = await Promise.all([
        this.prisma.salesOpportunity.count({
          where: {
            stage: { in: ['CLOSED_WON', 'CLOSED_LOST'] }
          }
        }),
        this.prisma.salesOpportunity.count({
          where: { stage: 'CLOSED_WON' }
        })
      ]);

      return totalOpportunities > 0 ? (closedWon / totalOpportunities) * 100 : 0;
    } catch (error) {
      logger.error('Error calculando tasa de conversión', error);
      return 0;
    }
  }

  /**
   * Obtener mejores representantes de ventas
   */
  async getTopPerformingReps() {
    try {
      const repStats = await this.prisma.salesOpportunity.groupBy({
        by: ['assignedTo'],
        where: {
          stage: 'CLOSED_WON',
          assignedTo: { not: null }
        },
        _count: true,
        _sum: { value: true }
      });

      return repStats
        .map(rep => ({
          assignedTo: rep.assignedTo,
          deals: rep._count,
          totalValue: rep._sum.value || 0
        }))
        .sort((a, b) => b.totalValue - a.totalValue)
        .slice(0, 5);
    } catch (error) {
      logger.error('Error obteniendo mejores representantes', error);
      return [];
    }
  }

  // =====================================
  // GESTIÓN DE LEADS
  // =====================================

  /**
   * Obtener leads no asignados
   */
  async getUnassignedLeads(limit = 20) {
    try {
      const leads = await this.prisma.salesOpportunity.findMany({
        where: {
          stage: 'PROSPECT',
          assignedTo: null
        },
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          customer: true
        }
      });

      return leads;
    } catch (error) {
      logger.error('Error obteniendo leads no asignados', error);
      throw error;
    }
  }

  /**
   * Asignar lead a representante
   */
  async assignLead(opportunityId, assignedTo) {
    try {
      const result = await this.prisma.salesOpportunity.update({
        where: { id: opportunityId },
        data: {
          assignedTo,
          stage: 'QUALIFIED',
          probability: 25,
          updatedAt: new Date()
        }
      });

      logger.info('Lead asignado', { opportunityId, assignedTo });

      return result;
    } catch (error) {
      logger.error('Error asignando lead', error);
      throw error;
    }
  }

  // =====================================
  // SEGMENTACIÓN DE CLIENTES
  // =====================================

  /**
   * Segmentar clientes por valor
   */
  async segmentCustomersByValue() {
    try {
      const customers = await this.prisma.customer.findMany({
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          totalSpent: true,
          ordersCount: true,
          lastOrderDate: true
        },
        orderBy: { totalSpent: 'desc' }
      });

      const segments = {
        vip: [], // Top 10%
        highValue: [], // 10-30%
        medium: [], // 30-70%
        lowValue: [], // 70-100%
        inactive: [] // Sin compras en 6 meses
      };

      const now = new Date();
      const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 6, now.getDate());

      customers.forEach((customer, index) => {
        const isInactive = !customer.lastOrderDate || 
                          new Date(customer.lastOrderDate) < sixMonthsAgo;

        if (isInactive) {
          segments.inactive.push(customer);
        } else if (index < customers.length * 0.1) {
          segments.vip.push(customer);
        } else if (index < customers.length * 0.3) {
          segments.highValue.push(customer);
        } else if (index < customers.length * 0.7) {
          segments.medium.push(customer);
        } else {
          segments.lowValue.push(customer);
        }
      });

      return segments;
    } catch (error) {
      logger.error('Error segmentando clientes', error);
      throw error;
    }
  }

  /**
   * Crear campaña de email segmentada
   */
  async createEmailCampaign(campaignData) {
    try {
      const {
        name,
        segmentType,
        subject,
        content,
        scheduledDate,
        assignedTo
      } = campaignData;

      // Obtener clientes del segmento
      const segments = await this.segmentCustomersByValue();
      const targetCustomers = segments[segmentType] || [];

      // Aquí se integraría con el servicio de email marketing
      // Por ahora, creamos un registro de la campaña
      const campaign = {
        id: `campaign_${Date.now()}`,
        name,
        segmentType,
        subject,
        content,
        scheduledDate: scheduledDate ? new Date(scheduledDate) : null,
        assignedTo,
        targetCount: targetCustomers.length,
        status: 'draft',
        createdAt: new Date()
      };

      logger.info('Campaña de email creada', { 
        campaignId: campaign.id, 
        segmentType, 
        targetCount: targetCustomers.length 
      });

      return campaign;
    } catch (error) {
      logger.error('Error creando campaña de email', error);
      throw error;
    }
  }

  // =====================================
  // ACTIVIDADES Y NOTAS
  // =====================================

  /**
   * Registrar actividad de cliente
   */
  async logCustomerActivity(customerId, activityData) {
    try {
      // Esta funcionalidad se implementaría con un modelo de actividades
      // Por ahora, agregamos la nota al cliente
      const customer = await this.prisma.customer.findUnique({
        where: { id: customerId }
      });

      if (!customer) {
        throw new Error('Cliente no encontrado');
      }

      // Agregar nota con timestamp de actividad
      const currentNotes = customer.notes || '';
      const newNote = `\n[${new Date().toISOString()}] ${activityData.description}`;
      const updatedNotes = currentNotes + newNote;

      await this.prisma.customer.update({
        where: { id: customerId },
        data: { notes: updatedNotes }
      });

      // Limpiar cache
      await cacheService.del(`customer:${customerId}`);

      logger.info('Actividad registrada', { customerId, activity: activityData.type });

      return { success: true };
    } catch (error) {
      logger.error('Error registrando actividad', error);
      throw error;
    }
  }
}

module.exports = CRMService;

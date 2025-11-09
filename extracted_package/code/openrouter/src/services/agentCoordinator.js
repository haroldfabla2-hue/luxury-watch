const { v4: uuidv4 } = require('uuid');
const { EventEmitter } = require('events');
const OpenRouterClient = require('../clients/openrouter');
const { AgentError, CoordinationError, ErrorHandler } = require('../utils/errors');
const logger = require('../utils/logger');
const config = require('../config');

/**
 * Sistema de coordinación de agentes con OpenRouter
 */
class AgentCoordinator extends EventEmitter {
  constructor() {
    super();
    this.client = new OpenRouterClient();
    this.agents = new Map();
    this.activeTasks = new Map();
    this.taskQueue = [];
    this.isProcessing = false;
    
    // Configuration
    this.maxConcurrent = config.agents.maxConcurrent || 5;
    this.timeout = config.agents.timeout || 60000;
    this.coordinationEnabled = config.agents.coordinationEnabled !== false;

    logger.info('Agent Coordinator initialized', {
      maxConcurrent: this.maxConcurrent,
      timeout: this.timeout,
      coordinationEnabled: this.coordinationEnabled
    });

    // Start processing queue
    this.startProcessingQueue();
  }

  /**
   * Registra un nuevo agente
   * @param {string} agentId - ID único del agente
   * @param {Object} agentConfig - Configuración del agente
   * @returns {Object} Información del agente registrado
   */
  registerAgent(agentId, agentConfig) {
    if (this.agents.has(agentId)) {
      throw new AgentError(`Agent ${agentId} is already registered`, agentId, 'register');
    }

    const agent = {
      id: agentId,
      name: agentConfig.name || `Agent-${agentId}`,
      type: agentConfig.type || 'general',
      capabilities: agentConfig.capabilities || [],
      status: 'idle',
      createdAt: new Date().toISOString(),
      lastActive: null,
      taskCount: 0,
      successCount: 0,
      errorCount: 0,
      config: {
        temperature: agentConfig.temperature || 0.7,
        maxTokens: agentConfig.maxTokens || 1000,
        systemPrompt: agentConfig.systemPrompt || '',
        ...agentConfig.config
      }
    };

    this.agents.set(agentId, agent);
    this.emit('agentRegistered', agent);

    logger.agent(agentId, 'registered', {
      type: agent.type,
      capabilities: agent.capabilities
    });

    return agent;
  }

  /**
   * Des-registra un agente
   * @param {string} agentId - ID del agente
   * @returns {boolean} True si se des-registró exitosamente
   */
  unregisterAgent(agentId) {
    if (!this.agents.has(agentId)) {
      logger.warn(`Attempted to unregister non-existent agent ${agentId}`);
      return false;
    }

    // Check if agent has active tasks
    const agent = this.agents.get(agentId);
    if (agent.status !== 'idle') {
      throw new AgentError(`Cannot unregister agent ${agentId} with active tasks`, agentId, 'unregister');
    }

    this.agents.delete(agentId);
    this.emit('agentUnregistered', { agentId });

    logger.agent(agentId, 'unregistered');
    return true;
  }

  /**
   * Obtiene un agente disponible
   * @param {string} type - Tipo de agente preferido
   * @returns {Object|null} Agente disponible o null
   */
  getAvailableAgent(type = null) {
    const availableAgents = Array.from(this.agents.values())
      .filter(agent => agent.status === 'idle')
      .filter(agent => !type || agent.type === type);

    if (availableAgents.length === 0) {
      return null;
    }

    // Sort by success rate and task count
    availableAgents.sort((a, b) => {
      const aSuccessRate = a.taskCount > 0 ? a.successCount / a.taskCount : 1;
      const bSuccessRate = b.taskCount > 0 ? b.successCount / b.taskCount : 1;
      
      if (aSuccessRate !== bSuccessRate) {
        return bSuccessRate - aSuccessRate;
      }
      
      return a.taskCount - b.taskCount;
    });

    return availableAgents[0];
  }

  /**
   * Crea una tarea para un agente
   * @param {Object} taskConfig - Configuración de la tarea
   * @returns {string} ID de la tarea creada
   */
  createTask(taskConfig) {
    const taskId = uuidv4();
    const task = {
      id: taskId,
      type: taskConfig.type || 'general',
      prompt: taskConfig.prompt,
      context: taskConfig.context || {},
      priority: taskConfig.priority || 0,
      createdAt: new Date().toISOString(),
      assignedAgent: null,
      status: 'pending',
      attempts: 0,
      maxAttempts: taskConfig.maxAttempts || 3,
      timeout: taskConfig.timeout || this.timeout,
      result: null,
      error: null
    };

    this.activeTasks.set(taskId, task);
    this.taskQueue.push(taskId);

    logger.info('Task created', {
      taskId,
      type: task.type,
      priority: task.priority,
      queueLength: this.taskQueue.length
    });

    this.emit('taskCreated', task);
    return taskId;
  }

  /**
   * Procesa la cola de tareas
   */
  async processQueue() {
    if (this.isProcessing || this.taskQueue.length === 0) {
      return;
    }

    this.isProcessing = true;

    try {
      while (this.taskQueue.length > 0) {
        // Check concurrent limit
        const activeCount = Array.from(this.activeTasks.values())
          .filter(task => task.status === 'processing').length;

        if (activeCount >= this.maxConcurrent) {
          break;
        }

        // Get next task
        const taskId = this.taskQueue.shift();
        const task = this.activeTasks.get(taskId);

        if (!task || task.status !== 'pending') {
          continue;
        }

        // Assign to agent
        const agent = this.getAvailableAgent(task.type);
        if (!agent) {
          // Put task back and wait
          this.taskQueue.unshift(taskId);
          break;
        }

        await this.assignTaskToAgent(taskId, agent);
      }
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Asigna una tarea a un agente
   * @param {string} taskId - ID de la tarea
   * @param {Object} agent - Agente asignado
   */
  async assignTaskToAgent(taskId, agent) {
    const task = this.activeTasks.get(taskId);
    if (!task) return;

    task.assignedAgent = agent.id;
    task.status = 'processing';
    task.startedAt = new Date().toISOString();
    task.attempts++;

    // Update agent status
    agent.status = 'processing';
    agent.lastActive = new Date().toISOString();
    agent.taskCount++;

    logger.agent(agent.id, 'task assigned', {
      taskId,
      taskType: task.type,
      attempt: task.attempts
    });

    this.emit('taskAssigned', { taskId, agentId: agent.id });

    try {
      // Execute task
      const result = await this.executeTask(task, agent);
      
      task.status = 'completed';
      task.result = result;
      task.completedAt = new Date().toISOString();

      // Update agent stats
      agent.status = 'idle';
      agent.successCount++;
      agent.lastActive = new Date().toISOString();

      this.emit('taskCompleted', {
        taskId,
        agentId: agent.id,
        result,
        duration: new Date(task.completedAt) - new Date(task.startedAt)
      });

      logger.agent(agent.id, 'task completed', {
        taskId,
        duration: `${new Date(task.completedAt) - new Date(task.startedAt)}ms`
      });

    } catch (error) {
      await this.handleTaskError(task, agent, error);
    }
  }

  /**
   * Ejecuta una tarea en un agente
   * @param {Object} task - Tarea a ejecutar
   * @param {Object} agent - Agente que ejecuta la tarea
   * @returns {Promise<Object>} Resultado de la tarea
   */
  async executeTask(task, agent) {
    const startTime = Date.now();
    
    try {
      const messages = [];
      
      // Add system prompt if configured
      if (agent.config.systemPrompt) {
        messages.push({
          role: 'system',
          content: agent.config.systemPrompt
        });
      }

      // Add context if provided
      if (task.context && Object.keys(task.context).length > 0) {
        messages.push({
          role: 'system',
          content: `Context: ${JSON.stringify(task.context)}`
        });
      }

      // Add the main prompt
      messages.push({
        role: 'user',
        content: task.prompt
      });

      // Call OpenRouter
      const response = await this.client._requestWithRetry({
        messages,
        temperature: agent.config.temperature,
        max_tokens: agent.config.maxTokens
      });

      const duration = Date.now() - startTime;
      logger.performance(`Agent ${agent.id} task execution`, duration, {
        taskId: task.id,
        agentType: agent.type
      });

      return {
        content: response.content,
        usage: response.usage,
        model: response.model,
        agentId: agent.id,
        taskId: task.id,
        duration
      };

    } catch (error) {
      const duration = Date.now() - startTime;
      logger.error(`Agent ${agent.id} task failed`, {
        taskId: task.id,
        error: error.message,
        duration: `${duration}ms`
      });
      throw error;
    }
  }

  /**
   * Maneja errores de tareas
   * @param {Object} task - Tarea que falló
   * @param {Object} agent - Agente que ejecutó la tarea
   * @param {Error} error - Error que ocurrió
   */
  async handleTaskError(task, agent, error) {
    task.status = 'failed';
    task.error = error;
    task.failedAt = new Date().toISOString();

    // Update agent stats
    agent.status = 'idle';
    agent.errorCount++;
    agent.lastActive = new Date().toISOString();

    logger.agent(agent.id, 'task failed', {
      taskId: task.id,
      error: error.message,
      attempts: task.attempts,
      maxAttempts: task.maxAttempts
    });

    this.emit('taskFailed', {
      taskId: task.id,
      agentId: agent.id,
      error: error.message,
      attempts: task.attempts
    });

    // Retry logic
    if (task.attempts < task.maxAttempts && ErrorHandler.isRecoverable(error)) {
      const delay = ErrorHandler.getRetryDelay(error);
      
      setTimeout(() => {
        task.status = 'pending';
        task.error = null;
        task.startedAt = null;
        this.taskQueue.push(task.id);
        this.processQueue();
      }, delay);

      logger.info(`Task ${taskId} will retry in ${delay}ms`, {
        attempt: task.attempts + 1,
        maxAttempts: task.maxAttempts
      });
    }
  }

  /**
   * Inicia el procesamiento de la cola
   */
  startProcessingQueue() {
    setInterval(() => {
      this.processQueue();
    }, 1000);
  }

  /**
   * Obtiene el estado de todos los agentes
   * @returns {Object} Estado de los agentes
   */
  getAgentsStatus() {
    const agents = Array.from(this.agents.values()).map(agent => ({
      ...agent,
      successRate: agent.taskCount > 0 ? agent.successCount / agent.taskCount : 0,
      errorRate: agent.taskCount > 0 ? agent.errorCount / agent.taskCount : 0
    }));

    const activeTasks = Array.from(this.activeTasks.values())
      .filter(task => task.status === 'processing');

    return {
      total: agents.length,
      idle: agents.filter(a => a.status === 'idle').length,
      busy: agents.filter(a => a.status === 'processing').length,
      agents,
      activeTasks: activeTasks.length,
      queueLength: this.taskQueue.length,
      isProcessing: this.isProcessing
    };
  }

  /**
   * Obtiene estadísticas de tareas
   * @returns {Object} Estadísticas de tareas
   */
  getTaskStats() {
    const tasks = Array.from(this.activeTasks.values());
    
    return {
      total: tasks.length,
      pending: tasks.filter(t => t.status === 'pending').length,
      processing: tasks.filter(t => t.status === 'processing').length,
      completed: tasks.filter(t => t.status === 'completed').length,
      failed: tasks.filter(t => t.status === 'failed').length,
      averageProcessingTime: this.calculateAverageProcessingTime(tasks)
    };
  }

  /**
   * Calcula el tiempo promedio de procesamiento
   * @param {Array} tasks - Lista de tareas
   * @returns {number} Tiempo promedio en milisegundos
   */
  calculateAverageProcessingTime(tasks) {
    const completedTasks = tasks.filter(t => t.status === 'completed' && t.startedAt && t.completedAt);
    
    if (completedTasks.length === 0) return 0;
    
    const totalTime = completedTasks.reduce((sum, task) => {
      return sum + (new Date(task.completedAt) - new Date(task.startedAt));
    }, 0);
    
    return Math.round(totalTime / completedTasks.length);
  }

  /**
   * Cancela una tarea
   * @param {string} taskId - ID de la tarea
   * @returns {boolean} True si se canceló exitosamente
   */
  cancelTask(taskId) {
    const task = this.activeTasks.get(taskId);
    if (!task || task.status === 'completed' || task.status === 'failed') {
      return false;
    }

    task.status = 'cancelled';
    task.cancelledAt = new Date().toISOString();

    // Update agent status if assigned
    if (task.assignedAgent && this.agents.has(task.assignedAgent)) {
      const agent = this.agents.get(task.assignedAgent);
      agent.status = 'idle';
      agent.lastActive = new Date().toISOString();
    }

    // Remove from queue if pending
    const queueIndex = this.taskQueue.indexOf(taskId);
    if (queueIndex > -1) {
      this.taskQueue.splice(queueIndex, 1);
    }

    this.emit('taskCancelled', { taskId, assignedAgent: task.assignedAgent });

    logger.info('Task cancelled', { taskId, assignedAgent: task.assignedAgent });
    return true;
  }

  /**
   * Limpia tareas antiguas
   * @param {number} olderThan - Tiempo en milisegundos
   */
  cleanupOldTasks(olderThan = 24 * 60 * 60 * 1000) { // 24 hours default
    const cutoff = Date.now() - olderThan;
    
    for (const [taskId, task] of this.activeTasks.entries()) {
      const taskTime = new Date(task.createdAt).getTime();
      
      if (taskTime < cutoff && (task.status === 'completed' || task.status === 'failed')) {
        this.activeTasks.delete(taskId);
        logger.debug('Old task cleaned up', { taskId, createdAt: task.createdAt });
      }
    }
  }
}

module.exports = AgentCoordinator;
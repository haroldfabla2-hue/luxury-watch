import { useEffect, useState } from 'react'

/**
 * Singleton pattern RELAJADO para configuradores 3D
 * Permite múltiples instancias pero monitorea el rendimiento
 */
class Configurator3DSingleton {
  private static instance: Configurator3DSingleton | null = null
  private activeConfigurators: Map<string, { timestamp: number; performance: number }> = new Map()
  private subscribers: Set<() => void> = new Set()
  private maxInstances = 3 // Permitir hasta 3 instancias antes de avisar

  private constructor() {}

  static getInstance(): Configurator3DSingleton {
    if (!Configurator3DSingleton.instance) {
      Configurator3DSingleton.instance = new Configurator3DSingleton()
    }
    return Configurator3DSingleton.instance
  }

  registerConfigurator(id: string): boolean {
    const now = Date.now()
    
    // Limpiar instancias antiguas (> 5 minutos)
    this.cleanupOldInstances()
    
    // Permitir registro
    this.activeConfigurators.set(id, { 
      timestamp: now, 
      performance: 0 
    })
    
    console.log(`✅ Configurador 3D registrado: "${id}" (total: ${this.activeConfigurators.size})`)
    this.notifySubscribers()
    return true
  }

  unregisterConfigurator(id: string): void {
    if (this.activeConfigurators.has(id)) {
      this.activeConfigurators.delete(id)
      console.log(`🗑️ Configurador 3D desregistrado: "${id}" (total: ${this.activeConfigurators.size})`)
      this.notifySubscribers()
    }
  }

  updatePerformance(id: string, performance: number): void {
    const existing = this.activeConfigurators.get(id)
    if (existing) {
      existing.performance = performance
      this.activeConfigurators.set(id, existing)
    }
  }

  getActiveConfigurators(): string[] {
    this.cleanupOldInstances()
    return Array.from(this.activeConfigurators.keys())
  }

  getInstanceCount(): number {
    this.cleanupOldInstances()
    return this.activeConfigurators.size
  }

  shouldWarnMultipleInstances(): boolean {
    this.cleanupOldInstances()
    return this.activeConfigurators.size > this.maxInstances
  }

  isConfiguratorActive(): string | null {
    const configurators = this.getActiveConfigurators()
    return configurators.length > 0 ? configurators[0] : null
  }

  subscribe(callback: () => void): () => void {
    this.subscribers.add(callback)
    return () => this.subscribers.delete(callback)
  }

  private notifySubscribers(): void {
    this.subscribers.forEach(callback => callback())
  }

  private cleanupOldInstances(): void {
    const now = Date.now()
    const fiveMinutes = 5 * 60 * 1000
    
    for (const [id, data] of this.activeConfigurators.entries()) {
      if (now - data.timestamp > fiveMinutes) {
        console.log(`🧹 Limpiando instancia antigua: "${id}"`)
        this.activeConfigurators.delete(id)
      }
    }
  }

  forceCleanup(): void {
    console.log('🚨 Forzando limpieza de todos los configuradores 3D...')
    this.activeConfigurators.clear()
    this.notifySubscribers()
  }
}

const configuratorSingleton = Configurator3DSingleton.getInstance()

export const useConfigurator3DSingleton = (configuratorId: string) => {
  const [isActive, setIsActive] = useState(false)
  const [activeConfigurator, setActiveConfigurator] = useState<string | null>(null)
  const [instanceCount, setInstanceCount] = useState(0)

  useEffect(() => {
    // Verificar estado inicial
    setActiveConfigurator(configuratorSingleton.isConfiguratorActive())
    setIsActive(!!configuratorSingleton.isConfiguratorActive())
    setInstanceCount(configuratorSingleton.getInstanceCount())

    // Suscribirse a cambios
    const unsubscribe = configuratorSingleton.subscribe(() => {
      const currentActive = configuratorSingleton.isConfiguratorActive()
      setActiveConfigurator(currentActive)
      setIsActive(!!currentActive)
      setInstanceCount(configuratorSingleton.getInstanceCount())
    })

    // Intentar registrar este configurador (SIEMPRE exitoso)
    configuratorSingleton.registerConfigurator(configuratorId)

    // Cleanup al desmontar
    return () => {
      configuratorSingleton.unregisterConfigurator(configuratorId)
      unsubscribe()
    }
  }, [configuratorId])

  const updatePerformance = (performance: number) => {
    configuratorSingleton.updatePerformance(configuratorId, performance)
  }

  const forceCleanup = () => {
    configuratorSingleton.forceCleanup()
  }

  return {
    isActive,
    activeConfigurator,
    canInitialize: true, // SIEMPRE puede inicializar
    instanceCount,
    shouldWarn: configuratorSingleton.shouldWarnMultipleInstances(),
    getActiveConfigurators: configuratorSingleton.getActiveConfigurators(),
    updatePerformance,
    forceCleanup
  }
}

export default configuratorSingleton

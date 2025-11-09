import { useEffect, useState } from 'react'

/**
 * Singleton pattern para prevenir múltiples instancias de configuradores 3D
 * Esto resuelve el problema de "Too many active WebGL contexts"
 */
class Configurator3DSingleton {
  private static instance: Configurator3DSingleton | null = null
  private activeConfigurator: string | null = null
  private subscribers: Set<() => void> = new Set()

  private constructor() {}

  static getInstance(): Configurator3DSingleton {
    if (!Configurator3DSingleton.instance) {
      Configurator3DSingleton.instance = new Configurator3DSingleton()
    }
    return Configurator3DSingleton.instance
  }

  registerConfigurator(id: string): boolean {
    if (this.activeConfigurator && this.activeConfigurator !== id) {
      console.warn(
        `⚠️ Configurador 3D activo detectado: "${this.activeConfigurator}". ` +
        `Negando registro de nuevo configurador: "${id}"`
      )
      return false
    }

    this.activeConfigurator = id
    console.log(`✅ Configurador 3D registrado: "${id}"`)
    this.notifySubscribers()
    return true
  }

  unregisterConfigurator(id: string): void {
    if (this.activeConfigurator === id) {
      console.log(`🗑️ Configurador 3D desregistrado: "${id}"`)
      this.activeConfigurator = null
      this.notifySubscribers()
    }
  }

  isConfiguratorActive(): string | null {
    return this.activeConfigurator
  }

  subscribe(callback: () => void): () => void {
    this.subscribers.add(callback)
    return () => this.subscribers.delete(callback)
  }

  private notifySubscribers(): void {
    this.subscribers.forEach(callback => callback())
  }

  forceCleanup(): void {
    console.log('🚨 Forzando limpieza de todos los configuradores 3D...')
    this.activeConfigurator = null
    this.notifySubscribers()
  }
}

const configuratorSingleton = Configurator3DSingleton.getInstance()

export const useConfigurator3DSingleton = (configuratorId: string) => {
  const [isActive, setIsActive] = useState(false)
  const [activeConfigurator, setActiveConfigurator] = useState<string | null>(null)

  useEffect(() => {
    // Verificar estado inicial
    setActiveConfigurator(configuratorSingleton.isConfiguratorActive())
    setIsActive(!!configuratorSingleton.isConfiguratorActive())

    // Suscribirse a cambios
    const unsubscribe = configuratorSingleton.subscribe(() => {
      const currentActive = configuratorSingleton.isConfiguratorActive()
      setActiveConfigurator(currentActive)
      setIsActive(!!currentActive)
    })

    // Intentar registrar este configurador
    const canRegister = configuratorSingleton.registerConfigurator(configuratorId)
    
    if (!canRegister) {
      console.warn(
        `❌ No se pudo registrar el configurador 3D "${configuratorId}" ` +
        `porque ya hay uno activo: "${configuratorSingleton.isConfiguratorActive()}"`
      )
    }

    // Cleanup al desmontar
    return () => {
      configuratorSingleton.unregisterConfigurator(configuratorId)
      unsubscribe()
    }
  }, [configuratorId])

  const forceCleanup = () => {
    configuratorSingleton.forceCleanup()
  }

  return {
    isActive,
    activeConfigurator,
    canInitialize: !configuratorSingleton.isConfiguratorActive() || configuratorSingleton.isConfiguratorActive() === configuratorId,
    forceCleanup
  }
}

export default configuratorSingleton
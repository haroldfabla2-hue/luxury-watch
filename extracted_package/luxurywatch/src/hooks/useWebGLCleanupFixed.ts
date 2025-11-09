import { useEffect, useRef } from 'react'
import * as THREE from 'three'

interface WebGLCleanupConfig {
  autoCleanup?: boolean
  maxContexts?: number
  preserveActiveContext?: boolean  // NUEVO: Preserva el contexto activo
  gentleCleanup?: boolean         // NUEVO: Limpieza suave sin perder contexto
}

/**
 * Hook CORREGIDO para manejo inteligente de limpieza de contextos WebGL
 * Evita el parpadeo eliminando loseContext() agresivo
 */
export const useWebGLCleanup = (config: WebGLCleanupConfig = {}) => {
  const { 
    autoCleanup = true, 
    maxContexts = 1,  // Reducido a 1 para mayor estabilidad
    preserveActiveContext = true,  // NUEVO: Preserva el contexto del renderer activo
    gentleCleanup = true          // NUEVO: Limpieza suave sin forzar pérdida
  } = config

  const cleanupRef = useRef<(() => void)[]>([])
  const activeRenderersRef = useRef<THREE.WebGLRenderer[]>([])
  const isActiveRef = useRef(true)

  useEffect(() => {
    // Verificar contextos activos sin interferir
    const monitorContexts = () => {
      const canvases = document.querySelectorAll('canvas')
      const contextCount = canvases.length
      
      if (contextCount > maxContexts) {
        console.warn(
          `⚠️ ${contextCount} contextos WebGL activos (máximo recomendado: ${maxContexts})`
        )
      }
    }

    // Monitoreo inicial
    monitorContexts()

    // Intervalo de monitoreo cada 30 segundos (menos agresivo)
    const monitorInterval = setInterval(monitorContexts, 30000)

    return () => {
      isActiveRef.current = false
      clearInterval(monitorInterval)
      if (autoCleanup) {
        performGentleCleanup()
      }
    }
  }, [autoCleanup, maxContexts, preserveActiveContext, gentleCleanup])

  const registerRenderer = (renderer: THREE.WebGLRenderer) => {
    if (!activeRenderersRef.current.includes(renderer)) {
      activeRenderersRef.current.push(renderer)
      console.log(`🎮 Renderer registrado (total: ${activeRenderersRef.current.length})`)
    }
  }

  const unregisterRenderer = (renderer: THREE.WebGLRenderer) => {
    const index = activeRenderersRef.current.indexOf(renderer)
    if (index > -1) {
      activeRenderersRef.current.splice(index, 1)
      console.log(`🗑️ Renderer desregistrado (total: ${activeRenderersRef.current.length})`)
    }
  }

  const performGentleCleanup = () => {
    console.log('🧹 Iniciando limpieza suave de recursos WebGL...')
    
    // Limpiar recursos de cada renderer SIN perder el contexto
    activeRenderersRef.current.forEach((renderer, index) => {
      try {
        if (renderer && renderer.domElement) {
          // Solo limpiar si NO es el contexto activo o si gentleCleanup está desactivado
          if (!preserveActiveContext || index < activeRenderersRef.current.length - 1) {
            console.log(`🧹 Limpiando renderer ${index + 1}/${activeRenderersRef.current.length}`)
            
            // Dispose recursos específicos sin perder contexto
            renderer.clear(true, true, true)
            renderer.clearDepth()
            renderer.clearStencil()
            
            // Remover del DOM SOLO si no es el último activo
            if (renderer.domElement && renderer.domElement.parentNode) {
              renderer.domElement.parentNode.removeChild(renderer.domElement)
            }
          }
        }
      } catch (error) {
        console.warn(`⚠️ Error limpiando renderer ${index}:`, error)
      }
    })

    // Limpiar array de referencias (pero preservar el último)
    if (!preserveActiveContext || activeRenderersRef.current.length <= 1) {
      activeRenderersRef.current = []
    } else {
      // Mantener solo el último renderer activo
      activeRenderersRef.current = [activeRenderersRef.current[activeRenderersRef.current.length - 1]]
    }
  }

  const registerCleanup = (cleanupFn: () => void) => {
    if (!cleanupRef.current.includes(cleanupFn)) {
      cleanupRef.current.push(cleanupFn)
    }
  }

  const unregisterCleanup = (cleanupFn: () => void) => {
    const index = cleanupRef.current.indexOf(cleanupFn)
    if (index > -1) {
      cleanupRef.current.splice(index, 1)
    }
  }

  const getRendererInfo = () => {
    return {
      activeRenderers: activeRenderersRef.current.length,
      cleanupFunctions: cleanupRef.current.length,
      isActive: isActiveRef.current,
      contextsDetected: document.querySelectorAll('canvas').length
    }
  }

  return {
    registerRenderer,
    unregisterRenderer,
    registerCleanup,
    unregisterCleanup,
    performGentleCleanup,
    getRendererInfo,
    activeRenderersCount: activeRenderersRef.current.length
  }
}

export default useWebGLCleanup

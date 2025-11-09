import { useEffect, useRef } from 'react'

interface WebGLCleanupConfig {
  autoCleanup?: boolean
  maxContexts?: number
  warnOnMultipleContexts?: boolean
}

/**
 * Hook para manejo robusto de limpieza de contextos WebGL
 * Previene la pérdida de contextos y optimiza el rendimiento
 */
export const useWebGLCleanup = (config: WebGLCleanupConfig = {}) => {
  const { 
    autoCleanup = true, 
    maxContexts = 2, // Máximo 2 contextos activos
    warnOnMultipleContexts = true 
  } = config

  const cleanupRef = useRef<(() => void)[]>([])
  const isActiveRef = useRef(true)

  useEffect(() => {
    // Log de contextos activos al inicializar
    if (warnOnMultipleContexts) {
      const activeContexts = getActiveWebGLContexts()
      if (activeContexts > maxContexts) {
        console.warn(
          `⚠️ Múltiples contextos WebGL detectados (${activeContexts}). ` +
          `Recomendado: máximo ${maxContexts} contextos para evitar pérdida de rendimiento.`
        )
      }
    }

    return () => {
      isActiveRef.current = false
      if (autoCleanup) {
        cleanupAllWebGLContexts()
      }
    }
  }, [autoCleanup, maxContexts, warnOnMultipleContexts])

  const registerCleanup = (cleanupFn: () => void) => {
    cleanupRef.current.push(cleanupFn)
  }

  const unregisterCleanup = (cleanupFn: () => void) => {
    const index = cleanupRef.current.indexOf(cleanupFn)
    if (index > -1) {
      cleanupRef.current.splice(index, 1)
    }
  }

  const forceCleanup = () => {
    console.log('🧹 Forzando limpieza de contextos WebGL...')
    cleanupRef.current.forEach(cleanupFn => cleanupFn())
    cleanupRef.current = []
    cleanupAllWebGLContexts()
  }

  const cleanupAllWebGLContexts = () => {
    try {
      // Limpiar todos los renderers Three.js activos
      const canvases = document.querySelectorAll('canvas')
      canvases.forEach((canvas) => {
        const gl = canvas.getContext('webgl') || canvas.getContext('webgl2')
        if (gl && !gl.isContextLost()) {
          // Forzar pérdida del contexto para limpieza completa
          const loseContext = gl.getExtension('WEBGL_lose_context')
          if (loseContext) {
            loseContext.loseContext()
          }
        }
      })
    } catch (error) {
      console.warn('⚠️ Error durante limpieza de contextos WebGL:', error)
    }
  }

  const getActiveWebGLContexts = (): number => {
    try {
      const canvases = document.querySelectorAll('canvas')
      let activeContexts = 0
      
      canvases.forEach((canvas) => {
        const gl = canvas.getContext('webgl') || canvas.getContext('webgl2')
        if (gl && !gl.isContextLost()) {
          activeContexts++
        }
      })
      
      return activeContexts
    } catch (error) {
      return 0
    }
  }

  return {
    registerCleanup,
    unregisterCleanup,
    forceCleanup,
    isActive: isActiveRef.current,
    activeContexts: getActiveWebGLContexts()
  }
}
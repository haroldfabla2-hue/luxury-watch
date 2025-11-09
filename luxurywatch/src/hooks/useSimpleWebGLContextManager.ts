import { useCallback, useEffect, useRef } from 'react'
import * as THREE from 'three'

/**
 * Hook SIMPLE para gestión básica de contexto WebGL
 * Previene conflictos entre múltiples componentes WebGL
 */
export const useSimpleWebGLContextManager = () => {
  const activeContextCount = useRef(0)
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)

  const incrementContextCount = useCallback(() => {
    activeContextCount.current++
    console.log(`🎮 Contexto WebGL #${activeContextCount.current} iniciado`)
    
    // Advertir si hay demasiados contextos
    if (activeContextCount.current > 2) {
      console.warn(`⚠️ Múltiples contextos WebGL detectados: ${activeContextCount.current}`)
    }
    
    return activeContextCount.current
  }, [])

  const decrementContextCount = useCallback(() => {
    activeContextCount.current = Math.max(0, activeContextCount.current - 1)
    console.log(`🗑️ Contexto WebGL cerrado (restantes: ${activeContextCount.current})`)
    return activeContextCount.current
  }, [])

  const getContextCount = useCallback(() => {
    return activeContextCount.current
  }, [])

  // Obtener mejor configuración de WebGL para prevenir pérdida
  const getOptimalWebGLConfig = useCallback(() => {
    return {
      antialias: true,
      alpha: true,
      depth: true,
      stencil: false, // Menos memoria
      preserveDrawingBuffer: true, // Previene pérdida por visibilidad
      powerPreference: 'high-performance' as const,
      failIfMajorPerformanceCaveat: false,
      // Configuración adicional para estabilidad
      xrCompatible: false, // Evita conflictos con WebXR
      desynchronized: true // Mejora rendimiento
    }
  }, [])

  // Monitorear pérdida de contexto
  const setupContextMonitoring = useCallback((renderer: THREE.WebGLRenderer) => {
    rendererRef.current = renderer
    
    const gl = renderer.getContext()
    if (gl) {
      // Configurar extensiones para estabilidad
      const extensions = [
        'WEBGL_lose_context',
        'WEBGL_depth_texture',
        'OES_texture_float'
      ]
      
      extensions.forEach(ext => {
        const extension = gl.getExtension(ext)
        if (extension) {
          console.log(`✅ Extensión WebGL habilitada: ${ext}`)
        }
      })

      // Event listeners para monitoreo de contexto
      const handleContextLost = (event: Event) => {
        console.warn('🚨 WebGL Context Lost detectado - contexto #', activeContextCount.current)
        event.preventDefault() // Prevenir pérdida completa
      }

      const handleContextRestored = (event: Event) => {
        console.log('✅ WebGL Context Restored - contexto #', activeContextCount.current)
        // Reconfigurar renderer después de restauración
        if (rendererRef.current) {
          rendererRef.current.setSize(800, 600) // Tamaño por defecto
        }
      }

      if ('onwebglcontextlost' in gl) {
        ;(gl as any).onwebglcontextlost = handleContextLost
      }
      if ('onwebglcontextrestored' in gl) {
        ;(gl as any).onwebglcontextrestored = handleContextRestored
      }

      console.log('🔍 Monitoreo de contexto WebGL configurado')
    }
  }, [])

  // Cleanup en unmount
  useEffect(() => {
    return () => {
      if (rendererRef.current) {
        try {
          const gl = rendererRef.current.getContext()
          if (gl && 'onwebglcontextlost' in gl) {
            ;(gl as any).onwebglcontextlost = null
          }
          if (gl && 'onwebglcontextrestored' in gl) {
            ;(gl as any).onwebglcontextrestored = null
          }
        } catch (error) {
          console.warn('⚠️ Error durante cleanup de contexto:', error)
        }
      }
      decrementContextCount()
    }
  }, [decrementContextCount])

  return {
    incrementContextCount,
    decrementContextCount,
    getContextCount,
    getOptimalWebGLConfig,
    setupContextMonitoring,
    activeRenderer: rendererRef.current
  }
}

export default useSimpleWebGLContextManager
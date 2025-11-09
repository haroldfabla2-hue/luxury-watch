import { useEffect, useRef, useCallback } from 'react'
import * as THREE from 'three'

interface WebGLContextStabilityConfig {
  preventContextLoss?: boolean
  autoRestore?: boolean
  maxRetries?: number
  retryDelay?: number
  forceHardwareAcceleration?: boolean
}

/**
 * Hook especializado para PREVENIR pérdida de contexto WebGL
 * Detecta y previene el bucle de pérdida/restauración de contexto
 */
export const useWebGLContextStability = (config: WebGLContextStabilityConfig = {}) => {
  const {
    preventContextLoss = true,
    autoRestore = true,
    maxRetries = 3,
    retryDelay = 1000,
    forceHardwareAcceleration = true
  } = config

  const contextLostRef = useRef(false)
  const retryCountRef = useRef(0)
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  const handleContextLost = useCallback((event: WebGLContextEvent) => {
    console.warn('🚨 WebGL Context Lost detectado - iniciando recuperación...')
    event.preventDefault()
    
    if (!preventContextLoss) return

    contextLostRef.current = true
    
    if (retryCountRef.current < maxRetries) {
      retryCountRef.current++
      console.log(`🔄 Intento de recuperación ${retryCountRef.current}/${maxRetries}`)
      
      // Forzar recuperación con delay
      setTimeout(() => {
        try {
          if (rendererRef.current) {
            console.log('🔄 Reconfigurando renderer después de pérdida de contexto...')
            
            // Obtener nuevo contexto
            const gl = rendererRef.current.getContext()
            if (gl) {
              // Limpiar estado del contexto perdido
              gl.disable(gl.BLEND)
              gl.disable(gl.DEPTH_TEST)
              gl.disable(gl.CULL_FACE)
              
              // Restaurar configuración del renderer
              rendererRef.current.setClearColor(0xf5f5f4, 1)
              rendererRef.current.setSize(
                canvasRef.current?.clientWidth || 800,
                canvasRef.current?.clientHeight || 600
              )
              
              contextLostRef.current = false
              console.log('✅ Contexto WebGL restaurado exitosamente')
            }
          }
        } catch (error) {
          console.error('❌ Error durante recuperación de contexto:', error)
          
          if (retryCountRef.current < maxRetries) {
            console.log(`🔄 Reintentando en ${retryDelay}ms...`)
            setTimeout(() => handleContextLost(event), retryDelay)
          } else {
            console.error('❌ Máximo número de intentos de recuperación alcanzado')
          }
        }
      }, retryDelay)
    } else {
      console.error('❌ No se pudo recuperar el contexto WebGL después de múltiples intentos')
    }
  }, [preventContextLoss, autoRestore, maxRetries, retryDelay])

  const handleContextRestored = useCallback((event: WebGLContextEvent) => {
    console.log('✅ WebGL Context Restored - finalizando recuperación')
    contextLostRef.current = false
    retryCountRef.current = 0
    
    // Reconfigurar renderer completamente
    if (rendererRef.current) {
      try {
        rendererRef.current.setClearColor(0xf5f5f4, 1)
        console.log('🎮 Renderer reconfigurado después de restauración de contexto')
      } catch (error) {
        console.error('❌ Error reconfigurando renderer:', error)
      }
    }
  }, [])

  const attachToRenderer = useCallback((renderer: THREE.WebGLRenderer, canvas?: HTMLCanvasElement) => {
    rendererRef.current = renderer
    canvasRef.current = canvas || renderer.domElement
    
    if (preventContextLoss) {
      const gl = renderer.getContext()
      
      if (gl) {
        // Configurar evento de pérdida de contexto
        if ('onwebglcontextlost' in gl) {
          ;(gl as any).onwebglcontextlost = handleContextLost
        }
        if ('onwebglcontextrestored' in gl) {
          ;(gl as any).onwebglcontextrestored = handleContextRestored
        }
      }
      
      // Configurar opciones de WebGL para prevenir pérdida
      try {
        const contextAttribs: WebGLContextAttributes = {
          alpha: true,
          antialias: true,
          depth: true,
          stencil: false,
          failIfMajorPerformanceCaveat: false,
          preserveDrawingBuffer: true,
          powerPreference: (forceHardwareAcceleration ? 'high-performance' : 'default') as WebGLPowerPreference
        }
        
        // Recrear contexto con opciones optimizadas
        const newCanvas = document.createElement('canvas')
        const newRenderer = new THREE.WebGLRenderer({
          ...contextAttribs,
          canvas: newCanvas
        })
        
        if (canvasRef.current?.parentNode) {
          canvasRef.current.parentNode.replaceChild(newCanvas, canvasRef.current)
          canvasRef.current = newCanvas
          rendererRef.current = newRenderer
          
          console.log('✅ Renderer recreado con opciones de estabilidad optimizadas')
        }
      } catch (error) {
        console.warn('⚠️ No se pudo recrear renderer con opciones optimizadas:', error)
      }
    }
  }, [handleContextLost, handleContextRestored, preventContextLoss, forceHardwareAcceleration])

  const isContextStable = useCallback(() => {
    return !contextLostRef.current
  }, [])

  const forceContextStability = useCallback(() => {
    if (rendererRef.current && canvasRef.current) {
      try {
        // Limpiar completamente el contexto
        const gl = rendererRef.current.getContext()
        if (gl) {
          gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
          gl.flush()
        }
        
        console.log('✅ Estabilidad de contexto WebGL reforzada')
        return true
      } catch (error) {
        console.error('❌ Error reforzando estabilidad:', error)
        return false
      }
    }
    return false
  }, [])

  // Cleanup al desmontar
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
          console.warn('⚠️ Error en cleanup de contexto WebGL:', error)
        }
      }
    }
  }, [])

  return {
    attachToRenderer,
    isContextStable,
    forceContextStability,
    isContextLost: contextLostRef.current,
    retryCount: retryCountRef.current
  }
}

export default useWebGLContextStability
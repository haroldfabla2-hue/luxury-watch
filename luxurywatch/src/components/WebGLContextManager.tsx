import { useEffect, useRef, useState } from 'react'
import { useWebGLContextStability } from '../hooks/useWebGLContextStability'
import * as THREE from 'three'

interface WebGLContextManagerProps {
  children: React.ReactNode
  onContextReady?: (renderer: THREE.WebGLRenderer) => void
  preventContextLoss?: boolean
}

/**
 * Componente especializado para gestionar estabilidad de contexto WebGL
 * Previene y maneja pérdida de contexto de manera proactiva
 */
export const WebGLContextManager: React.FC<WebGLContextManagerProps> = ({
  children,
  onContextReady,
  preventContextLoss = true
}) => {
  const [isInitialized, setIsInitialized] = useState(false)
  const [contextStatus, setContextStatus] = useState<'stable' | 'lost' | 'recovering' | 'error'>('stable')
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)

  // Hook de estabilidad de contexto
  const {
    attachToRenderer,
    isContextStable,
    forceContextStability,
    isContextLost,
    retryCount
  } = useWebGLContextStability({
    preventContextLoss,
    autoRestore: true,
    maxRetries: 5,
    retryDelay: 1500,
    forceHardwareAcceleration: true
  })

  // Monitorear estabilidad del contexto
  useEffect(() => {
    if (isContextLost) {
      setContextStatus('recovering')
    } else if (isContextStable()) {
      setContextStatus('stable')
    } else {
      setContextStatus('lost')
    }
  }, [isContextLost, isContextStable])

  // Función para crear renderer estable
  const createStableRenderer = (canvas: HTMLCanvasElement): THREE.WebGLRenderer => {
    console.log('🎮 Creando renderer con máxima estabilidad...')
    
    // Configuración optimizada para estabilidad
    const rendererOptions = {
      alpha: true,
      antialias: true,
      depth: true,
      stencil: false,
      failIfMajorPerformanceCaveat: false,
      preserveDrawingBuffer: true, // CLAVE: Preserva el buffer para evitar pérdida
      powerPreference: 'high-performance' as const,
      contextCreationAttributes: {
        alpha: true,
        antialias: true,
        depth: true,
        stencil: false,
        failIfMajorPerformanceCaveat: false,
        preserveDrawingBuffer: true, // Evita pérdida de contexto
        powerPreference: 'high-performance'
      }
    }

    const renderer = new THREE.WebGLRenderer({
      ...rendererOptions,
      canvas
    })

    // Configuración adicional de estabilidad
    renderer.setClearColor(0xf5f5f4, 1)
    renderer.sortObjects = false // Evita conflictos de ordenamiento
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    
    // Configurar capacidades de contexto para estabilidad
    const gl = renderer.getContext()
    if (gl) {
      try {
        // Habilitar extensiones para estabilidad
        gl.getExtension('WEBGL_lose_context')
        gl.getExtension('WEBGL_depth_texture')
        gl.getExtension('OES_texture_float')
        
        console.log('✅ Extensiones WebGL habilitadas para estabilidad')
      } catch (error) {
        console.warn('⚠️ Algunas extensiones WebGL no están disponibles:', error)
      }
    }

    return renderer
  }

  // Inicializar renderer estable
  useEffect(() => {
    const initializeContext = async () => {
      if (!canvasRef.current) return

      try {
        console.log('🚀 Inicializando contexto WebGL estable...')
        
        // Crear renderer estable
        const renderer = createStableRenderer(canvasRef.current)
        rendererRef.current = renderer
        
        // Adjuntar al sistema de estabilidad
        attachToRenderer(renderer, canvasRef.current)
        
        // Forzar estabilidad inicial
        forceContextStability()
        
        // Callback para componente padre
        if (onContextReady) {
          onContextReady(renderer)
        }
        
        setIsInitialized(true)
        setContextStatus('stable')
        console.log('✅ Contexto WebGL inicializado con máxima estabilidad')
        
      } catch (error) {
        console.error('❌ Error inicializando contexto WebGL:', error)
        setContextStatus('error')
      }
    }

    initializeContext()

    // Cleanup
    return () => {
      if (rendererRef.current) {
        try {
          // Limpiar extensiones de contexto
          const gl = rendererRef.current.getContext()
          if (gl) {
            const loseContext = gl.getExtension('WEBGL_lose_context')
            if (loseContext && 'loseContext' in loseContext) {
              // NO llamar loseContext() para evitar problemas
              console.log('🧹 Contexto WebGL limpiado sin forzar pérdida')
            }
          }
          
          rendererRef.current.dispose()
          rendererRef.current = null
        } catch (error) {
          console.warn('⚠️ Error durante cleanup:', error)
        }
      }
    }
  }, [attachToRenderer, forceContextStability, onContextReady])

  // Render condicional basado en estado
  if (contextStatus === 'error') {
    return (
      <div className="webgl-error">
        <div className="error-message">
          <h3>⚠️ Error de Contexto WebGL</h3>
          <p>No se pudo inicializar el contexto WebGL estable.</p>
          <button 
            onClick={() => window.location.reload()}
            className="retry-button"
          >
            🔄 Reintentar
          </button>
        </div>
      </div>
    )
  }

  if (contextStatus === 'recovering') {
    return (
      <div className="webgl-recovering">
        <div className="recovering-message">
          <div className="spinner">🔄</div>
          <h3>Recuperando Contexto WebGL</h3>
          <p>Intento {retryCount + 1}/5 - Manteniendo estabilidad...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="webgl-context-manager" data-status={contextStatus}>
      <canvas
        ref={canvasRef}
        className="webgl-canvas"
        style={{
          display: 'block',
          width: '100%',
          height: '100%',
          background: 'transparent'
        }}
      />
      {isInitialized && children}
      
      {/* Indicador de estado (solo en desarrollo) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="context-status-indicator">
          <span className={`status-${contextStatus}`}>
            WebGL: {contextStatus}
          </span>
        </div>
      )}
    </div>
  )
}

export default WebGLContextManager
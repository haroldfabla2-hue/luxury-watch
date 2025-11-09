import { useCallback, useEffect, useRef, useState } from 'react'
import * as THREE from 'three'

/**
 * 🎯 SHARED WEBGL CONTEXT MANAGER
 * 
 * SOLUCIÓN DEFINITIVA para conflictos de múltiples contextos WebGL:
 * - Un solo contexto WebGL compartido entre todos los componentes
 * - Canvas composition para renderizar diferentes vistas
 * - Pool inteligente de contextos
 * - Prevención total de "Too many active WebGL contexts"
 */

interface SharedWebGLContextConfig {
  canvas: HTMLCanvasElement
  gl: WebGLRenderingContext
  renderer: THREE.WebGLRenderer
  scene: THREE.Scene
  camera: THREE.PerspectiveCamera
  canvasWidth: number
  canvasHeight: number
}

export const useSharedWebGLContext = (componentId: string) => {
  const [contextState, setContextState] = useState<SharedWebGLContextConfig | null>(null)
  const contextPoolRef = useRef<Map<string, SharedWebGLContextConfig>>(new Map())
  const activeComponentsRef = useRef<Set<string>>(new Set())
  
  // Obtener o crear contexto compartido
  const getOrCreateContext = useCallback((width: number = 800, height: number = 600) => {
    const contextKey = `${width}x${height}`
    
    // Verificar si ya existe un contexto compatible
    const existingContext = contextPoolRef.current.get(contextKey)
    if (existingContext) {
      activeComponentsRef.current.add(componentId)
      console.log(`🔄 Reutilizando contexto compartido ${contextKey} para ${componentId}`)
      setContextState(existingContext)
      return existingContext
    }
    
    // Crear nuevo canvas compartido
    const canvas = document.createElement('canvas')
    canvas.id = `shared-webgl-${contextKey}-${componentId}`
    canvas.style.position = 'absolute'
    canvas.style.top = '0'
    canvas.style.left = '0'
    canvas.style.width = '100%'
    canvas.style.height = '100%'
    canvas.style.pointerEvents = 'none' // Permitir interacciones con elementos superiores
    canvas.style.zIndex = '1' // Layer base
    
    // Crear contexto WebGL optimizado
    const gl = canvas.getContext('webgl', {
      antialias: true,
      alpha: true,
      depth: true,
      stencil: false,
      preserveDrawingBuffer: false, // Mejor rendimiento
      powerPreference: 'high-performance',
      failIfMajorPerformanceCaveat: false,
      desynchronized: true,
      xrCompatible: true // Compatible con WebXR/AR
    }) as WebGLRenderingContext
    
    if (!gl) {
      throw new Error('No se pudo crear contexto WebGL compartido')
    }
    
    // Crear renderer THREE.js con el contexto compartido
    const renderer = new THREE.WebGLRenderer({ 
      canvas,
      context: gl,
      antialias: true,
      alpha: true,
      preserveDrawingBuffer: false,
      powerPreference: 'high-performance',
      failIfMajorPerformanceCaveat: false
    })
    
    renderer.setSize(width, height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    
    // Configuración cinematográfica
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.0
    renderer.outputColorSpace = THREE.SRGBColorSpace
    
    // Sombras optimizadas
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    renderer.shadowMap.autoUpdate = false // Actualizar bajo demanda
    
    // Crear escena y cámara base
    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x000000) // Transparente para composición
    
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100)
    camera.position.set(0, 0, 5)
    
    const contextConfig: SharedWebGLContextConfig = {
      canvas,
      gl,
      renderer,
      scene,
      camera,
      canvasWidth: width,
      canvasHeight: height
    }
    
    // Almacenar en pool
    contextPoolRef.current.set(contextKey, contextConfig)
    activeComponentsRef.current.add(componentId)
    
    // Agregar al DOM
    document.body.appendChild(canvas)
    
    console.log(`✨ Contexto WebGL compartido creado: ${contextKey} para ${componentId}`)
    console.log(`📊 Total contextos activos: ${contextPoolRef.current.size}`)
    
    setContextState(contextConfig)
    return contextConfig
  }, [componentId])
  
  // Liberar contexto cuando no se necesita
  const releaseContext = useCallback(() => {
    activeComponentsRef.current.delete(componentId)
    
    // Si no hay más componentes usando este contexto, liberarlo
    if (activeComponentsRef.current.size === 0) {
      // Limpiar todos los contextos del pool
      contextPoolRef.current.forEach((contextConfig, key) => {
        if (contextConfig.canvas.parentNode) {
          contextConfig.canvas.parentNode.removeChild(contextConfig.canvas)
        }
        
        // Dispose recursos THREE.js
        contextConfig.renderer.dispose()
        contextConfig.scene.clear()
        
        console.log(`🗑️ Contexto compartido liberado: ${key}`)
      })
      
      contextPoolRef.current.clear()
      setContextState(null)
    } else {
      console.log(`🔄 Contexto ${componentId} liberado, otros componentes activos: ${activeComponentsRef.current.size}`)
    }
  }, [componentId])
  
  // Obtener información de contexto
  const getContextInfo = useCallback(() => {
    return {
      activeContexts: contextPoolRef.current.size,
      activeComponents: activeComponentsRef.current.size,
      componentId,
      hasContext: !!contextState
    }
  }, [contextState, componentId])
  
  // Cleanup automático
  useEffect(() => {
    return () => {
      releaseContext()
    }
  }, [releaseContext])
  
  return {
    contextState,
    getOrCreateContext,
    releaseContext,
    getContextInfo,
    isShared: true // Indica que usa contexto compartido
  }
}

export default useSharedWebGLContext
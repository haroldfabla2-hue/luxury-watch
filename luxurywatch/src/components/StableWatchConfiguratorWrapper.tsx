import React, { useEffect, useRef, useState } from 'react'
import WebGLContextManager from './WebGLContextManager'
import { useWebGLContextStability } from '../hooks/useWebGLContextStability'
import * as THREE from 'three'
import { useConfiguratorStore } from '../store/configuratorStore'
import { 
  FINAL_CALIBRATION_CONFIG, 
  detectPerformanceLevel, 
  getOptimizedConfig 
} from '../config/final-calibration-config'

interface StableWatchConfiguratorWrapperProps {
  onReady?: () => void
  onError?: (error: Error) => void
}

/**
 * Wrapper especializado para el configurador de relojes con estabilidad WebGL máxima
 * Gestiona contexto WebGL de manera proactiva para prevenir pérdida
 */
const StableWatchConfiguratorWrapper: React.FC<StableWatchConfiguratorWrapperProps> = ({
  onReady,
  onError
}) => {
  const [renderer, setRenderer] = useState<THREE.WebGLRenderer | null>(null)
  const [scene, setScene] = useState<THREE.Scene | null>(null)
  const [camera, setCamera] = useState<THREE.PerspectiveCamera | null>(null)
  const [isInitializing, setIsInitializing] = useState(true)
  const [initError, setInitError] = useState<string | null>(null)

  const sceneRef = useRef<THREE.Scene | null>(null)
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null)
  const controlsRef = useRef<any>(null)
  const animationIdRef = useRef<number | null>(null)
  const pmremGeneratorRef = useRef<THREE.PMREMGenerator | null>(null)
  const envMapRef = useRef<THREE.Texture | null>(null)
  const composerRef = useRef<any>(null)

  const { currentConfiguration } = useConfiguratorStore()
  const [performanceLevel, setPerformanceLevel] = useState<'highEnd' | 'mobile' | 'lowEnd'>('highEnd')
  const [calibratedConfig, setCalibratedConfig] = useState(getOptimizedConfig())

  // Hook de estabilidad
  const {
    attachToRenderer,
    isContextStable,
    forceContextStability,
    isContextLost,
    retryCount
  } = useWebGLContextStability({
    preventContextLoss: true,
    autoRestore: true,
    maxRetries: 5,
    retryDelay: 1500,
    forceHardwareAcceleration: true
  })

  // Detectar nivel de rendimiento al montar
  useEffect(() => {
    const detectedLevel = detectPerformanceLevel()
    setPerformanceLevel(detectedLevel)
    setCalibratedConfig(getOptimizedConfig())
    console.log(`🎯 Nivel de rendimiento detectado: ${detectedLevel}`)
  }, [])

  // Inicializar sistema 3D cuando el renderer esté listo
  useEffect(() => {
    if (!renderer) return

    const initialize3DSystem = async () => {
      try {
        console.log('🎬 Inicializando sistema 3D estable...')
        
        // Detectar nivel de rendimiento
        const detectedLevel = detectPerformanceLevel()
        setPerformanceLevel(detectedLevel)
        setCalibratedConfig(getOptimizedConfig())
        
        // Crear escena
        const scene = new THREE.Scene()
        scene.background = new THREE.Color(0xf5f5f4)
        scene.fog = new THREE.Fog(0xf5f5f4, 10, 30)
        sceneRef.current = scene
        setScene(scene)

        // Crear cámara calibrada
        const container = document.querySelector('.webgl-canvas') as HTMLCanvasElement
        const width = container?.clientWidth || 800
        const height = container?.clientHeight || 600
        const aspect = width / height
        
        const camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 100)
        camera.position.set(0, 3, 6)
        cameraRef.current = camera
        setCamera(camera)

        // Configurar renderer con estabilidad máxima
        configureRendererStability(renderer, width, height)

        // Inicializar PMREMGenerator
        pmremGeneratorRef.current = new THREE.PMREMGenerator(renderer)
        pmremGeneratorRef.current.compileEquirectangularShader()

        // Configurar iluminación calibrada
        setupCalibratedLighting(scene)

        // Cargar HDRI principal con fallback robusto
        await loadStableHDRI(scene)

        // Crear reloj con materiales calibrados
        createStableWatch(scene)

        // Configurar controles e interactividad
        await setupStableControls(camera, renderer.domElement)

        // Configurar post-procesado si está habilitado
        await setupStablePostProcessing(scene, camera, width, height)

        // Iniciar loop de render estable
        startStableRenderLoop()

        // Configurar manejo de eventos
        setupStableEventHandling()

        console.log('✅ Sistema 3D inicializado con máxima estabilidad')
        setIsInitializing(false)
        onReady?.()

      } catch (error) {
        console.error('❌ Error inicializando sistema 3D:', error)
        setInitError(error instanceof Error ? error.message : 'Error desconocido')
        onError?.(error instanceof Error ? error : new Error('Error desconocido'))
      }
    }

    initialize3DSystem()
  }, [renderer, onReady, onError])

  const configureRendererStability = (renderer: THREE.WebGLRenderer, width: number, height: number) => {
    // Configurar tamaño y pixel ratio
    renderer.setSize(width, height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, calibratedConfig.performance[performanceLevel].maxPixelRatio))
    
    // Parámetros de render estables
    renderer.toneMapping = calibratedConfig.renderer.toneMapping
    renderer.toneMappingExposure = calibratedConfig.renderer.toneMappingExposure
    renderer.outputColorSpace = calibratedConfig.renderer.outputColorSpace

    
    // Sombras estables
    renderer.shadowMap.enabled = calibratedConfig.shadows.enabled
    renderer.shadowMap.type = calibratedConfig.performance[performanceLevel].shadowType
    renderer.shadowMap.autoUpdate = calibratedConfig.shadows.autoUpdate

    console.log('🎮 Renderer configurado con estabilidad máxima')
  }

  const setupCalibratedLighting = (scene: THREE.Scene) => {
    // Key Light calibrado
    const keyLight = new THREE.DirectionalLight(0xFFF8E7, 1.5)
    keyLight.position.set(5, 10, 5)
    keyLight.castShadow = true
    keyLight.shadow.mapSize.width = 2048
    keyLight.shadow.mapSize.height = 2048
    scene.add(keyLight)

    // Fill Light calibrado
    const fillLight = new THREE.DirectionalLight(0xE3F2FD, 0.8)
    fillLight.position.set(-5, 5, -5)
    scene.add(fillLight)

    // Rim Light calibrado
    const rimLight = new THREE.DirectionalLight(0xE1F5FE, 1.2)
    rimLight.position.set(0, 8, -10)
    scene.add(rimLight)

    // Ambient Light suave
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.1)
    scene.add(ambientLight)

    console.log('💡 Iluminación calibrada configurada')
  }

  const loadStableHDRI = async (scene: THREE.Scene) => {
    try {
      // Usar iluminación sintética sin HDRI para máxima estabilidad
      console.log('💡 Usando iluminación sintética calibrada (sin HDRI para estabilidad)')
    } catch (error) {
      console.warn('⚠️ Error cargando HDRI, usando fallback:', error)
    }
  }

  const createStableWatch = (scene: THREE.Scene) => {
    const watchGroup = new THREE.Group()
    scene.add(watchGroup)

    // Crear reloj básico con materiales simples pero estables
    const caseGeometry = new THREE.CylinderGeometry(1.2, 1.2, 0.82, 32)
    const caseMaterial = new THREE.MeshStandardMaterial({
      color: 0xC0C0C0, // Plateado
      metalness: 0.9,
      roughness: 0.3
    })
    
    const caseMesh = new THREE.Mesh(caseGeometry, caseMaterial)
    caseMesh.castShadow = true
    caseMesh.receiveShadow = true
    watchGroup.add(caseMesh)

    // Dial simple
    const dialGeometry = new THREE.CircleGeometry(1.15, 64)
    const dialMaterial = new THREE.MeshStandardMaterial({
      color: 0x0A0A0A, // Negro
      metalness: 0.2,
      roughness: 0.4
    })
    
    const dial = new THREE.Mesh(dialGeometry, dialMaterial)
    dial.rotation.x = -Math.PI / 2
    dial.position.y = 0.41
    watchGroup.add(dial)

    // Cristal simple
    const glassGeometry = new THREE.CylinderGeometry(1.16, 1.16, 0.08, 32)
    const glassMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      metalness: 0,
      roughness: 0,
      transmission: 0.9,
      thickness: 0.1
    })
    
    const glassMesh = new THREE.Mesh(glassGeometry, glassMaterial)
    glassMesh.position.y = 0.3
    watchGroup.add(glassMesh)

    console.log('⌚ Reloj estable creado')
  }

  const setupStableControls = async (camera: THREE.PerspectiveCamera, canvas: HTMLCanvasElement) => {
    try {
      const { OrbitControls } = await import('three/examples/jsm/controls/OrbitControls.js')
      
      const controls = new OrbitControls(camera, canvas)
      controls.enableDamping = true
      controls.dampingFactor = 0.05
      controls.enablePan = false
      controls.enableZoom = true
      controls.minDistance = performanceLevel === 'lowEnd' ? 4 : 3
      controls.maxDistance = performanceLevel === 'lowEnd' ? 8 : 10
      controls.maxPolarAngle = Math.PI / 2 + 0.3
      controls.minPolarAngle = Math.PI / 4
      
      controlsRef.current = controls
      console.log('🎮 Controles Orbit configurados')
    } catch (error) {
      console.warn('⚠️ Error configurando controles:', error)
    }
  }

  const setupStablePostProcessing = async (scene: THREE.Scene, camera: THREE.PerspectiveCamera, width: number, height: number) => {
    if (!calibratedConfig.performance[performanceLevel].postProcessingEnabled) {
      console.log('⏭️ Post-procesado desactivado para este nivel de rendimiento')
      return
    }

    try {
      const { EffectComposer } = await import('three/examples/jsm/postprocessing/EffectComposer.js')
      const { RenderPass } = await import('three/examples/jsm/postprocessing/RenderPass.js')
      
      const composer = new EffectComposer(renderer)
      const renderPass = new RenderPass(scene, camera)
      composer.addPass(renderPass)
      
      composerRef.current = composer
      console.log('🎭 Post-procesado básico configurado')
    } catch (error) {
      console.warn('⚠️ Error configurando post-procesado:', error)
    }
  }

  const startStableRenderLoop = () => {
    const animate = () => {
      animationIdRef.current = requestAnimationFrame(animate)
      
      // Verificar estabilidad antes de renderizar
      if (!isContextStable()) {
        console.log('⏸️ Render pausado por inestabilidad de contexto')
        return
      }
      
      try {
        // Actualizar controles
        if (controlsRef.current) {
          controlsRef.current.update()
        }
        
        // Render con post-procesado si está disponible
        if (composerRef.current && scene && camera) {
          composerRef.current.render()
        } else if (scene && camera && renderer) {
          renderer.render(scene, camera)
        }
        
        // Forzar estabilidad ocasionalmente
        if (Math.random() < 0.01) { // 1% de las veces
          forceContextStability()
        }
        
      } catch (error) {
        console.error('❌ Error durante renderizado:', error)
      }
    }
    
    animate()
    console.log('🔄 Loop de render estable iniciado')
  }

  const setupStableEventHandling = () => {
    const handleResize = () => {
      if (!cameraRef.current || !renderer) return
      
      const container = document.querySelector('.webgl-canvas') as HTMLCanvasElement
      if (!container) return
      
      const width = container.clientWidth
      const height = container.clientHeight
      
      cameraRef.current.aspect = width / height
      cameraRef.current.updateProjectionMatrix()
      renderer.setSize(width, height)
      
      if (composerRef.current) {
        composerRef.current.setSize(width, height)
      }
    }
    
    window.addEventListener('resize', handleResize)
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }

  // Cleanup al desmontar
  useEffect(() => {
    return () => {
      // Cancelar animación
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current)
      }
      
      // Limpiar recursos
      if (composerRef.current) {
        composerRef.current.dispose()
      }
      
      if (pmremGeneratorRef.current) {
        pmremGeneratorRef.current.dispose()
      }
      
      if (envMapRef.current) {
        envMapRef.current.dispose()
      }
      
      if (controlsRef.current) {
        controlsRef.current.dispose()
      }
      
      if (sceneRef.current) {
        sceneRef.current.clear()
      }
      
      console.log('🧹 Cleanup de sistema 3D completado')
    }
  }, [])

  if (initError) {
    return (
      <div className="configurator-error">
        <div className="error-content">
          <h3>❌ Error de Inicialización</h3>
          <p>{initError}</p>
          <button onClick={() => window.location.reload()}>
            🔄 Recargar Página
          </button>
        </div>
      </div>
    )
  }

  return (
    <WebGLContextManager
      onContextReady={(rendererInstance) => {
        setRenderer(rendererInstance)
      }}
      preventContextLoss={true}
    >
      {isInitializing && (
        <div className="initializing-overlay">
          <div className="loading-spinner">🔄</div>
          <h3>Inicializando Sistema 3D...</h3>
          <p>Nivel: {performanceLevel} | Intentos de estabilidad: {retryCount}</p>
        </div>
      )}
    </WebGLContextManager>
  )
}

export default StableWatchConfiguratorWrapper
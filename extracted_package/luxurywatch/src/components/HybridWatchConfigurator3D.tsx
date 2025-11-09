/**
 * CONFIGURADOR 3D HÍBRIDO ULTRA-PREMIUM
 * 
 * Sistema híbrido que combina:
 * - Renderizado 3D con Three.js (para dispositivos compatibles)
 * - Fallback automático a imágenes estáticas (compatibilidad universal)
 * - Carga ultra-optimizada (< 2 segundos)
 * - Personalización en tiempo real
 * - Vistas múltiples con presets de cámara
 */

import { useEffect, useRef, useState, useCallback } from 'react'
import { RotateCcw, ZoomIn, ZoomOut, Eye, Maximize2 } from 'lucide-react'
import { 
  checkDeviceCapabilities, 
  getRenderConfig, 
  logDeviceCapabilities,
  type DeviceCapabilities 
} from '../utils/webglDetection'
import { 
  MATERIALS, 
  CASES, 
  DIALS, 
  HANDS, 
  STRAPS,
  CAMERA_PRESETS,
  type CameraPreset 
} from '../data/watchVariations'
import { findClosestStaticImage } from '../utils/staticImageMapping'
import { createPhotorealisticWatchModel } from '../utils/photorealisticWatchModel'
import { loadHDRIEnvironment, setupCinematicLighting, setupPostProcessing, applyEnvironmentToMaterials } from '../utils/hdriLighting'
import { useConfiguratorStore } from '../store/configuratorStore'

interface HybridConfigurator3DProps {
  className?: string
}

type LoadingStage = 
  | 'detecting'
  | 'loading-engine'
  | 'creating-scene'
  | 'loading-geometry'
  | 'applying-materials'
  | 'finalizing'
  | 'complete'
  | 'fallback'

const HybridWatchConfigurator3D: React.FC<HybridConfigurator3DProps> = ({ className = '' }) => {
  // Estado de dispositivo y capacidades
  const [capabilities, setCapabilities] = useState<DeviceCapabilities | null>(null)
  const [loadingStage, setLoadingStage] = useState<LoadingStage>('detecting')
  const [loadingProgress, setLoadingProgress] = useState(0)
  const [isReady, setIsReady] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Referencias Three.js
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const sceneRef = useRef<any>(null)
  const cameraRef = useRef<any>(null)
  const rendererRef = useRef<any>(null)
  const watchGroupRef = useRef<any>(null)
  const controlsRef = useRef<any>(null)
  const animationFrameRef = useRef<number>(0)
  
  // Estado de vista
  const [currentPreset, setCurrentPreset] = useState(0)
  const [zoomLevel, setZoomLevel] = useState(1)
  const [isRotating, setIsRotating] = useState(true)
  const [staticImagePath, setStaticImagePath] = useState<string | null>(null)
  const [envMap, setEnvMap] = useState<any>(null)
  
  // Store de configuración
  const { currentConfiguration } = useConfiguratorStore()
  
  // Timeout de seguridad
  const initTimeoutRef = useRef<NodeJS.Timeout>()
  
  /**
   * ETAPA 1: Detección de capacidades
   */
  useEffect(() => {
    const detectCapabilities = () => {
      setLoadingStage('detecting')
      setLoadingProgress(5)
      
      const caps = checkDeviceCapabilities()
      setCapabilities(caps)
      logDeviceCapabilities(caps)
      
      setLoadingProgress(15)
      
      // Decidir modo: 3D o Fallback
      if (caps.use3D) {
        initThreeJS()
      } else {
        setLoadingStage('fallback')
        setLoadingProgress(100)
        setIsReady(true)
        console.log('🖼️ Usando modo fallback (imágenes estáticas)')
      }
    }
    
    detectCapabilities()
    
    // Timeout de seguridad (5 segundos)
    initTimeoutRef.current = setTimeout(() => {
      if (!isReady) {
        console.warn('⏱️ Timeout de inicialización - usando fallback')
        setLoadingStage('fallback')
        setIsReady(true)
      }
    }, 5000)
    
    return () => {
      if (initTimeoutRef.current) {
        clearTimeout(initTimeoutRef.current)
      }
      cleanup()
    }
  }, [])
  
  /**
   * ETAPA 2: Inicialización Three.js Ultra-Optimizada
   */
  const initThreeJS = async () => {
    if (!canvasRef.current || !capabilities) return
    
    try {
      // Paso 1: Cargar motor 3D
      setLoadingStage('loading-engine')
      setLoadingProgress(20)
      
      const THREE = await import('three')
      const { OrbitControls } = await import('three/examples/jsm/controls/OrbitControls.js')
      
      setLoadingProgress(35)
      
      // Paso 2: Crear escena
      setLoadingStage('creating-scene')
      
      const canvas = canvasRef.current
      const rect = canvas.getBoundingClientRect()
      const renderConfig = getRenderConfig(capabilities)
      
      // Renderer optimizado
      const renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: renderConfig.antialias,
        alpha: true,
        powerPreference: 'high-performance'
      })
      
      renderer.setPixelRatio(renderConfig.pixelRatio)
      renderer.setSize(rect.width, rect.height)
      renderer.toneMapping = renderConfig.toneMapping ? THREE.ACESFilmicToneMapping : THREE.NoToneMapping
      renderer.toneMappingExposure = 1
      renderer.outputColorSpace = THREE.SRGBColorSpace
      
      if (renderConfig.shadows) {
        renderer.shadowMap.enabled = true
        renderer.shadowMap.type = THREE.PCFSoftShadowMap
      }
      
      setLoadingProgress(50)
      
      // Escena
      const scene = new THREE.Scene()
      scene.background = new THREE.Color(0xf5f5f4)
      
      // Cámara
      const camera = new THREE.PerspectiveCamera(45, rect.width / rect.height, 0.1, 100)
      camera.position.set(0, 3, 6)
      
      // Controles
      const controls = new OrbitControls(camera, canvas)
      controls.enableDamping = true
      controls.dampingFactor = 0.05
      controls.minDistance = 3
      controls.maxDistance = 10
      controls.enablePan = false
      controls.autoRotate = true
      controls.autoRotateSpeed = 1
      
      setLoadingProgress(65)
      
      // Paso 3: Sistema de iluminación cinematográfica + HDRI
      setLoadingStage('loading-geometry')
      
      // Configurar iluminación cinematográfica (6 luces)
      const { setupCinematicLighting: setupLights } = await import('../utils/hdriLighting')
      setupLights(scene, renderConfig)
      
      // Cargar HDRI environment (si está disponible)
      try {
        const { loadHDRIEnvironment } = await import('../utils/hdriLighting')
        const envMapResult = await loadHDRIEnvironment(scene, renderer)
        setEnvMap(envMapResult)
      } catch (error) {
        console.warn('HDRI no disponible, usando iluminación estándar')
      }
      
      setLoadingProgress(75)
      
      // Paso 4: Modelo fotorrealista del reloj
      setLoadingStage('applying-materials')
      
      const { createPhotorealisticWatchModel } = await import('../utils/photorealisticWatchModel')
      const watchGroup = createPhotorealisticWatchModel(THREE, currentConfiguration, capabilities.qualityLevel)
      scene.add(watchGroup)
      
      // Aplicar environment map a los materiales
      if (envMap) {
        const { applyEnvironmentToMaterials } = await import('../utils/hdriLighting')
        applyEnvironmentToMaterials(watchGroup, envMap)
      }
      
      setLoadingProgress(90)
      
      // Paso 5: Guardar referencias
      setLoadingStage('finalizing')
      
      sceneRef.current = scene
      cameraRef.current = camera
      rendererRef.current = renderer
      watchGroupRef.current = watchGroup
      controlsRef.current = controls
      
      setLoadingProgress(95)
      
      // Paso 6: Iniciar animación
      startAnimation()
      
      setLoadingProgress(100)
      setLoadingStage('complete')
      setIsReady(true)
      
      console.log('✅ Configurador 3D híbrido fotorrealista inicializado')
      
    } catch (err) {
      console.error('❌ Error inicializando Three.js:', err)
      setError('Error de inicialización 3D')
      setLoadingStage('fallback')
      setStaticImagePath(findClosestStaticImage(currentConfiguration))
      setIsReady(true)
    }
  }
  
  /**
   * Iniciar loop de animación
   */
  const startAnimation = () => {
    const animate = () => {
      if (!sceneRef.current || !cameraRef.current || !rendererRef.current) return
      
      // Actualizar controles
      if (controlsRef.current) {
        controlsRef.current.update()
      }
      
      // Renderizar
      rendererRef.current.render(sceneRef.current, cameraRef.current)
      
      animationFrameRef.current = requestAnimationFrame(animate)
    }
    
    animate()
  }
  
  /**
   * Limpieza de recursos
   */
  const cleanup = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
    }
    
    if (rendererRef.current) {
      rendererRef.current.dispose()
    }
    
    if (controlsRef.current) {
      controlsRef.current.dispose()
    }
  }
  
  /**
   * Cambiar preset de cámara
   */
  const applyPreset = useCallback((preset: CameraPreset) => {
    if (!cameraRef.current || !controlsRef.current) return
    
    const [x, y, z] = preset.position
    const [tx, ty, tz] = preset.target
    
    // Animación suave de cámara
    const startPos = cameraRef.current.position.clone()
    const endPos = new (window as any).THREE.Vector3(x, y, z)
    
    let progress = 0
    const duration = 1000 // 1 segundo
    const startTime = Date.now()
    
    const animateCamera = () => {
      const elapsed = Date.now() - startTime
      progress = Math.min(elapsed / duration, 1)
      
      // Interpolación suave
      const eased = 1 - Math.pow(1 - progress, 3) // easeOutCubic
      
      cameraRef.current.position.lerpVectors(startPos, endPos, eased)
      controlsRef.current.target.set(tx, ty, tz)
      controlsRef.current.update()
      
      if (progress < 1) {
        requestAnimationFrame(animateCamera)
      }
    }
    
    animateCamera()
  }, [])
  
  /**
   * Controlar zoom
   */
  const handleZoom = useCallback((direction: 'in' | 'out') => {
    if (!cameraRef.current) return
    
    const step = 0.5
    const currentDistance = cameraRef.current.position.length()
    
    if (direction === 'in' && currentDistance > 3) {
      cameraRef.current.position.multiplyScalar(0.9)
      setZoomLevel(prev => Math.min(prev + 0.1, 3))
    } else if (direction === 'out' && currentDistance < 10) {
      cameraRef.current.position.multiplyScalar(1.1)
      setZoomLevel(prev => Math.max(prev - 0.1, 0.5))
    }
  }, [])
  
  /**
   * Toggle rotación automática
   */
  const toggleRotation = useCallback(() => {
    if (controlsRef.current) {
      controlsRef.current.autoRotate = !controlsRef.current.autoRotate
      setIsRotating(!isRotating)
    }
  }, [isRotating])
  
  /**
   * Resetear vista
   */
  const resetView = useCallback(() => {
    applyPreset(CAMERA_PRESETS[0])
    setCurrentPreset(0)
    setZoomLevel(1)
  }, [applyPreset])
  
  /**
   * Actualizar modelo cuando cambia configuración
   */
  useEffect(() => {
    if (!isReady || loadingStage === 'fallback' || !sceneRef.current) return
    
    import('three').then((THREE) => {
      import('../utils/photorealisticWatchModel').then(({ createPhotorealisticWatchModel }) => {
        if (watchGroupRef.current && sceneRef.current) {
          sceneRef.current.remove(watchGroupRef.current)
        }
        
        const newWatch = createPhotorealisticWatchModel(
          THREE, 
          currentConfiguration,
          capabilities?.qualityLevel || 'high'
        )
        sceneRef.current.add(newWatch)
        watchGroupRef.current = newWatch
        
        // Aplicar environment map si está disponible
        if (envMap) {
          import('../utils/hdriLighting').then(({ applyEnvironmentToMaterials }) => {
            applyEnvironmentToMaterials(newWatch, envMap)
          })
        }
      })
    })
  }, [currentConfiguration, isReady, loadingStage, capabilities, envMap])
  
  /**
   * Actualizar imagen estática en modo fallback cuando cambia configuración
   */
  useEffect(() => {
    if (loadingStage === 'fallback') {
      setStaticImagePath(findClosestStaticImage(currentConfiguration))
    }
  }, [currentConfiguration, loadingStage])
  
  /**
   * Resize handler
   */
  useEffect(() => {
    const handleResize = () => {
      if (!canvasRef.current || !cameraRef.current || !rendererRef.current) return
      
      const rect = canvasRef.current.getBoundingClientRect()
      cameraRef.current.aspect = rect.width / rect.height
      cameraRef.current.updateProjectionMatrix()
      rendererRef.current.setSize(rect.width, rect.height)
    }
    
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])
  
  /**
   * RENDERIZADO DE CARGA
   */
  if (!isReady) {
    const stageMessages: Record<LoadingStage, string> = {
      'detecting': 'Detectando capacidades del dispositivo...',
      'loading-engine': 'Cargando motor de renderizado 3D...',
      'creating-scene': 'Creando escena 3D...',
      'loading-geometry': 'Cargando geometría del reloj...',
      'applying-materials': 'Aplicando materiales premium...',
      'finalizing': 'Finalizando configuración...',
      'complete': 'Listo',
      'fallback': 'Preparando vista optimizada...'
    }
    
    return (
      <div className={`${className} relative w-full h-full min-h-[500px] md:min-h-[600px] bg-gradient-to-br from-neutral-100 to-neutral-200 rounded-lg overflow-hidden shadow-modal flex items-center justify-center`}>
        <div className="text-center max-w-md px-6">
          <div className="w-20 h-20 border-4 border-gold-500 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
          <h3 className="text-xl font-bold text-neutral-900 mb-3">
            Configurador 3D Ultra-Premium
          </h3>
          <p className="text-neutral-700 mb-6">{stageMessages[loadingStage]}</p>
          
          {/* Barra de progreso */}
          <div className="w-full bg-neutral-300 rounded-full h-3 mb-3 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-gold-500 to-gold-600 transition-all duration-300 ease-out"
              style={{ width: `${loadingProgress}%` }}
            />
          </div>
          <p className="text-sm text-neutral-600">{loadingProgress}% completado</p>
          
          {/* Info de capacidades */}
          {capabilities && (
            <div className="mt-6 bg-white/50 backdrop-blur-sm p-4 rounded-lg text-sm text-left">
              <div className="font-semibold text-neutral-800 mb-2">Información del Sistema:</div>
              <div className="space-y-1 text-neutral-700">
                <div>WebGL: {capabilities.webgl ? '✅ Soportado' : '❌ No soportado'}</div>
                <div>Calidad: {capabilities.qualityLevel.toUpperCase()}</div>
                <div>Modo: {capabilities.use3D ? '3D Completo' : 'Imágenes Estáticas'}</div>
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }
  
  /**
   * RENDERIZADO MODO FALLBACK (Imágenes Estáticas)
   */
  if (loadingStage === 'fallback') {
    const imagePath = staticImagePath || findClosestStaticImage(currentConfiguration)
    
    return (
      <div className={`${className} relative w-full h-full min-h-[500px] md:min-h-[600px] bg-gradient-to-br from-neutral-100 to-neutral-200 rounded-lg overflow-hidden shadow-modal`}>
        <div className="w-full h-full flex items-center justify-center p-8">
          <div className="text-center w-full max-w-2xl">
            {/* Imagen estática del reloj */}
            <div className="w-full max-w-md mx-auto aspect-square bg-white rounded-lg shadow-xl mb-6 flex items-center justify-center overflow-hidden">
              <img 
                src={imagePath} 
                alt="Vista estática del reloj personalizado" 
                className="w-full h-full object-contain p-8"
                onError={(e) => {
                  // Fallback si la imagen no carga
                  (e.target as HTMLImageElement).style.display = 'none'
                  const parent = (e.target as HTMLImageElement).parentElement
                  if (parent) {
                    parent.innerHTML = `
                      <div class="text-neutral-400 p-8">
                        <svg class="w-24 h-24 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p class="text-lg font-medium">Vista del Reloj</p>
                        <p class="text-sm mt-2">Configuración personalizada</p>
                      </div>
                    `
                  }
                }}
              />
            </div>
            
            {/* Información de configuración */}
            <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
              <h3 className="text-xl font-bold text-neutral-900 mb-4">Tu Configuración</h3>
              <div className="grid grid-cols-2 gap-4 text-sm text-left">
                {currentConfiguration.material && (
                  <div>
                    <span className="font-semibold text-neutral-700">Material:</span>
                    <p className="text-neutral-900">{currentConfiguration.material.name}</p>
                  </div>
                )}
                {currentConfiguration.case && (
                  <div>
                    <span className="font-semibold text-neutral-700">Caja:</span>
                    <p className="text-neutral-900">{currentConfiguration.case.name}</p>
                  </div>
                )}
                {currentConfiguration.dial && (
                  <div>
                    <span className="font-semibold text-neutral-700">Esfera:</span>
                    <p className="text-neutral-900">{currentConfiguration.dial.name}</p>
                  </div>
                )}
                {currentConfiguration.hands && (
                  <div>
                    <span className="font-semibold text-neutral-700">Manecillas:</span>
                    <p className="text-neutral-900">{currentConfiguration.hands.name}</p>
                  </div>
                )}
                {currentConfiguration.strap && (
                  <div>
                    <span className="font-semibold text-neutral-700">Correa:</span>
                    <p className="text-neutral-900">{currentConfiguration.strap.name}</p>
                  </div>
                )}
              </div>
            </div>
            
            {/* Mensaje informativo */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-blue-800">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-0.5">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="text-left">
                  <p className="font-medium mb-1">Modo de Compatibilidad</p>
                  <p className="text-sm">
                    Tu dispositivo no soporta renderizado 3D completo. Mostrando vista optimizada de alta calidad del reloj personalizado.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
  
  /**
   * RENDERIZADO MODO 3D COMPLETO
   */
  return (
    <div className={`${className} relative w-full h-full min-h-[500px] md:min-h-[600px] bg-gradient-to-br from-neutral-100 to-neutral-200 rounded-lg overflow-hidden shadow-modal`}>
      {/* Canvas 3D */}
      <canvas 
        ref={canvasRef}
        className="w-full h-full"
        style={{ display: 'block' }}
      />
      
      {/* Controles de Vista */}
      <div className="absolute top-4 left-4 z-10 space-y-2">
        {/* Presets de cámara */}
        <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-2">
          <div className="text-xs font-semibold text-neutral-700 mb-2 px-2">Vistas</div>
          <div className="grid grid-cols-3 gap-1">
            {CAMERA_PRESETS.map((preset, index) => (
              <button
                key={preset.name}
                onClick={() => {
                  applyPreset(preset)
                  setCurrentPreset(index)
                }}
                className={`px-3 py-2 text-xs font-medium rounded transition-colors ${
                  currentPreset === index
                    ? 'bg-gold-500 text-white'
                    : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                }`}
              >
                {preset.name}
              </button>
            ))}
          </div>
        </div>
        
        {/* Controles de zoom y rotación */}
        <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-2 flex gap-1">
          <button
            onClick={() => handleZoom('in')}
            className="p-2 bg-neutral-100 hover:bg-neutral-200 rounded transition-colors"
            title="Acercar"
          >
            <ZoomIn size={18} />
          </button>
          <button
            onClick={() => handleZoom('out')}
            className="p-2 bg-neutral-100 hover:bg-neutral-200 rounded transition-colors"
            title="Alejar"
          >
            <ZoomOut size={18} />
          </button>
          <button
            onClick={toggleRotation}
            className={`p-2 rounded transition-colors ${
              isRotating 
                ? 'bg-gold-500 text-white' 
                : 'bg-neutral-100 hover:bg-neutral-200'
            }`}
            title={isRotating ? 'Pausar rotación' : 'Activar rotación'}
          >
            <RotateCcw size={18} />
          </button>
          <button
            onClick={resetView}
            className="p-2 bg-neutral-100 hover:bg-neutral-200 rounded transition-colors"
            title="Resetear vista"
          >
            <Eye size={18} />
          </button>
        </div>
      </div>
      
      {/* Badge de calidad */}
      <div className="absolute bottom-4 right-4 z-10">
        <div className="bg-green-500 text-white px-3 py-1.5 rounded-full text-xs font-semibold shadow-lg">
          ✨ Renderizado 3D {capabilities?.qualityLevel.toUpperCase()}
        </div>
      </div>
      
      {/* Info de controles */}
      <div className="absolute bottom-4 left-4 z-10">
        <div className="bg-black/75 text-white px-3 py-2 rounded-lg text-xs backdrop-blur-sm max-w-xs">
          <div className="font-semibold mb-1">Controles:</div>
          <div className="space-y-0.5 text-[10px]">
            <div>• Arrastrar: Rotar modelo</div>
            <div>• Rueda del ratón: Zoom</div>
            <div>• Botones: Vistas predefinidas</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HybridWatchConfigurator3D

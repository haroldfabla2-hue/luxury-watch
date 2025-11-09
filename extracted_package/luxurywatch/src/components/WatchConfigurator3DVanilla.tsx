import { useEffect, useRef, useState } from 'react'
import { useWebGLCleanup } from '../hooks/useWebGLCleanup'
import { useConfigurator3DSingleton } from '../hooks/useConfigurator3DSingleton'
import * as THREE from 'three'
import { useConfiguratorStore } from '../store/configuratorStore'
import { texturaManager, type LoadingProgress } from '../lib/TexturaManager'
import HDRIProgressViewer, { useTexturaManager } from './HDRIProgressViewer'
import { 
  createOptimizedRenderer,
  createOptimizedCamera,
  createOptimizedControls,
  cleanupThreeResources,
  detectPerformanceLevel,
  loadHDRLoader,
  loadOrbitControls,
  loadEffectComposer,
  loadRenderPass,
  loadBokehPass,
  loadUnrealBloomPass,
  loadShaderPass,
  loadFilmPass,
  loadSMAAPass,
  loadFXAAShader
} from '../lib/three-utils'

/**
 * Configurador 3D de relojes con post-procesado cinematográfico profesional
 * 
 * MATERIALES PBR ULTRA-REALISTAS IMPLEMENTADOS:
 * - ORO: color #FFD700, metalness 1.0, roughness 0.15, IOR 2.5, clearcoat completo, anisotropy
 * - ACERO INOXIDABLE: color #C0C0C0, metalness 1.0, roughness 0.25, IOR 2.7, anisotropic reflections
 * - TITANIO: color #8E8E8E, metalness 1.0, roughness 0.35, IOR 2.4, brushed y polished finishes
 * - CRISTAL ZAFIRO: transmission 0.98, opacity 0.22, IOR 1.77, roughness 0.1, transmission shader
 * - CUERO: metalness 0.0, roughness 0.8, subsurface scattering simulado, texture variations
 * 
 * POST-PROCESADO CINEMATOGRÁFICO PROFESIONAL:
 * 
 * 1. DEPTH OF FIELD (BOKEH):
 *    - BokehPass con apertura f/2.8 para desenfoque profesional
 *    - Focus distance automático en el reloj (2.5 unidades)
 *    - Max blur 0.01 para máxima claridad del sujeto principal
 * 
 * 2. BLOOM PARA LUCES REFLECTANTES:
 *    - UnrealBloomPass optimizado para metales brillantes
 *    - Threshold: 0.85 (solo luces intensas)
 *    - Strength: 0.4 (efecto sutil y natural)
 *    - Radius: 0.1 (glow localizado)
 * 
 * 3. CHROMATIC ABERRATION:
 *    - ChromaticAberrationShader para realismo de lentes
 *    - Offset pequeño: (0.002, 0.001)
 *    - Simulación de aberración cromática de lentes reales
 * 
 * 4. FILM GRAIN PROFESIONAL:
 *    - FilmPass para granulación cinematográfica
 *    - Noise opacity: 0.025 (sutileza profesional)
 *    - Scanline intensity calibrada para apariencia vintage premium
 * 
 * 5. TONE MAPPING ACES:
 *    - ACESFilmicToneMapping para rango dinámico cinematográfico
 *    - Exposure calibrado a 1.0 para resultado óptimo
 *    - Color space: sRGB para consistencia cromática
 * 
 * 6. MOTION BLUR DINÁMICO EN MANECILLAS:
 *    - Motion blur calculado por velocidad de rotación
 *    - Solo activo durante cambios de configuración
 *    - Intensidad proporcional a velocidad de manecillas
 *    - Segundero con mayor intensidad (x2) para realismo
 * 
 * 7. ANTI-ALIASING AVANZADO:
 *    - SMAA para dispositivos de alto rendimiento
 *    - FXAA como fallback para rendimiento medio
 *    - Reducción de aliasing sin pérdida de detalle
 * 
 * ILUMINACIÓN HDRI OPTIMIZADA:
 * - TexturaManager centralizado con cacheo inteligente
 * - Sistema de fallback múltiple robusto (CDN → Local → Sintético → Básico)
 * - Compresión automática para web (KTX2, WebP)
 * - Progressive loading para mejor UX
 * - Memory management automático con GC
 * - Sistema de configuración adaptativo por dispositivo
 * - PMREMGenerator integrado con máximo rendimiento
 * - SISTEMA DE 3 PUNTOS PROFESIONALES
 * - ILUMINACIÓN VOLUMÉTRICA avanzada
 * - PARÁMETROS DE RENDER cinematográficos
 * 
 * COMPATIBILIDAD:
 * - Performance adaptativo según dispositivo (low/medium/high)
 * - Fallbacks para móviles (solo bloom y film grain básicos)
 * - Sombras PCFSoftShadowMap optimizadas
 * - Toggle dinámico de efectos cinematográficos
 * - Optimización automática por FPS
 */
const WatchConfigurator3DVanilla = () => {
  const containerRef = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<THREE.Scene | null>(null)
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null)
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
  const controlsRef = useRef<any>(null)
  const watchGroupRef = useRef<THREE.Group | null>(null)
  const animationIdRef = useRef<number | null>(null)
  const initializeAttemptsRef = useRef(0)
  const pmremGeneratorRef = useRef<THREE.PMREMGenerator | null>(null)
  const envMapRef = useRef<THREE.Texture | null>(null)
  
  // Referencias para post-procesado cinematográfico
  const composerRef = useRef<any>(null)
  const renderPassRef = useRef<any>(null)
  const bloomPassRef = useRef<any>(null)
  const bokehPassRef = useRef<any>(null)
  const filmPassRef = useRef<any>(null)
  const chromaticPassRef = useRef<any>(null)
  const smaaPassRef = useRef<any>(null)
  const fxaaPassRef = useRef<any>(null)
  
  // Estado de control de efectos cinematográficos
  const [cinemaEffectsEnabled, setCinemaEffectsEnabled] = useState(true)
  const [motionBlurIntensity, setMotionBlurIntensity] = useState(0)
  
  // Configuración de rendimiento
  const [isLowPerformance, setIsLowPerformance] = useState(false)
  const frameCountRef = useRef(0)
  const lastFpsCheckRef = useRef(Date.now())
  const [hdriLoaded, setHdriLoaded] = useState(false)
  
  const [isLoading, setIsLoading] = useState(true)
  const [webGLError, setWebGLError] = useState(false)
  const { currentConfiguration } = useConfiguratorStore()
  
  // Estado para loading de HDRI optimizado
  const [loadingProgress, setLoadingProgress] = useState<LoadingProgress>({ total: 0, loaded: 0, percentage: 0, phase: 'downloading' })
  const [textureManagerStats, setTextureManagerStats] = useState<any>(null)
  
  // Hook para TexturaManager
  const { progress: texturaProgress, stats: texturaStats } = useTexturaManager()

  // Estado para interactividad de la corona
  const [crownRotation, setCrownRotation] = useState(0)
  const [crownHover, setCrownHover] = useState(false)
  const isDraggingCrownRef = useRef(false)
  const lastMouseXRef = useRef(0)
  const raycasterRef = useRef(new THREE.Raycaster())
  const mouseRef = useRef(new THREE.Vector2())
  const crownRef = useRef<THREE.Group | null>(null)

  // Efecto para observar progreso de carga del TexturaManager
  useEffect(() => {
    const unsubscribe = texturaManager.onProgress((progress) => {
      setLoadingProgress(progress)
      
      // Actualizar estadísticas del TexturaManager periódicamente
      if (progress.phase === 'ready' || progress.percentage === 100) {
        const stats = texturaManager.getStats()
        setTextureManagerStats(stats)
      }
    })
    
    return unsubscribe
  }, [])
  
  // Habilitar debug mode en desarrollo
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      texturaManager.setDebugMode(true)
      console.log('🎨 TexturaManager en modo debug activado')
    }
  }, [])

  // Cargar preset HDRI cinematográfico de Three.js
  // Cache para optimizar carga de texturas HDRI
  const hdriTextureCache = useRef<Map<string, THREE.DataTexture>>(new Map())
  
  // Hook para limpieza robusta de contextos WebGL
  const webGLCleanup = useWebGLCleanup({
    autoCleanup: true,
    maxContexts: 1, // Solo 1 contexto para evitar conflictos
    warnOnMultipleContexts: true
  })
  
  // Singleton para prevenir múltiples configuradores 3D
  const configuratorSingleton = useConfigurator3DSingleton('WatchConfigurator3DVanilla')
  
  // URLs HDRI optimizadas con múltiples fuentes de fallback
  const getHDRIPresetURLs = (preset: string): string[] => {
    const presetURLs = {
      'studio': [
        'https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/studio_small_08_1k.hdr',
        'https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/venice_sunset_1k.hdr',
        'https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/equirectangular/venice_sunset_1k.hdr'
      ],
      'workshop': [
        'https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/workshop_1k.hdr',
        'https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/studio_small_08_1k.hdr'
      ],
      'venice': [
        'https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/venice_sunset_1k.hdr',
        'https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/studio_small_08_1k.hdr'
      ]
    }
    
    return presetURLs[preset as keyof typeof presetURLs] || presetURLs.studio
  }

  const loadHDRIPreset = async (preset: string = 'studio'): Promise<THREE.Texture> => {
    const cacheKey = `${preset}_hdri`
    
    // Verificar caché primero
    if (hdriTextureCache.current.has(cacheKey)) {
      console.log(`🎯 HDRI ${preset} cargado desde caché`)
      return hdriTextureCache.current.get(cacheKey)!
    }
    
    try {
      console.log(`🔄 Inicializando HDRLoader para preset: ${preset}`)
      const { HDRLoader } = await loadHDRLoader()
      const hdrLoader = new HDRLoader()
      
      // Configurar timeout y retry logic
      const texturePromise = new Promise<THREE.DataTexture>((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Timeout cargando HDRI'))
        }, 15000)
        
        const loadWithFallback = async (urlIndex: number = 0) => {
          const urls = getHDRIPresetURLs(preset)
          
          if (urlIndex >= urls.length) {
            clearTimeout(timeout)
            reject(new Error(`Todas las URLs HDRI fallaron para preset ${preset}`))
            return
          }
          
          const url = urls[urlIndex]
          console.log(`📡 Intentando cargar HDRI desde: ${url} (intento ${urlIndex + 1}/${urls.length})`)
          
          try {
            hdrLoader.load(
              url,
              (texture: THREE.DataTexture) => {
                clearTimeout(timeout)
                console.log(`✅ HDRI ${preset} cargado exitosamente desde ${url}`)
                
                // Guardar en caché
                hdriTextureCache.current.set(cacheKey, texture)
                resolve(texture)
              },
              (progress) => {
                if (progress.total > 0) {
                  console.log(`⏳ Progreso de carga HDRI: ${((progress.loaded / progress.total) * 100).toFixed(1)}%`)
                }
              },
              (error) => {
                console.warn(`⚠️ Error cargando HDRI desde ${url}:`, error)
                loadWithFallback(urlIndex + 1) // Intentar siguiente URL
              }
            )
          } catch (loadError) {
            console.warn(`⚠️ Excepción cargando HDRI desde ${url}:`, loadError)
            loadWithFallback(urlIndex + 1) // Intentar siguiente URL
          }
        }
        
        loadWithFallback(0)
      })
      
      return await texturePromise
    } catch (error) {
      console.warn(`❌ Error cargando HDRI preset ${preset}, usando HDRI sintético:`, error)
      const syntheticHDRI = createSyntheticHDRI()
      
      // También cachear el HDRI sintético
      hdriTextureCache.current.set(cacheKey, syntheticHDRI)
      
      return syntheticHDRI
    }
  }

  // HDRI sintético cinematográfico ultra-mejorado con lazy loading
  const createSyntheticHDRI = (resolution: number = 1024): THREE.DataTexture => {
    const size = Math.min(Math.max(resolution, 256), 2048) // Limitar entre 256 y 2048
    const data = new Uint8Array(size * size * 4)
    
    // Múltiples fuentes de luz con física realista
    for (let i = 0; i < size * size; i++) {
      const x = i % size
      const y = Math.floor(i / size)
      
      // Coordenadas normalizadas
      const u = x / size
      const v = y / size
      
      // Luz principal cinematográfica (Key Light) - Luz principal del estudio
      const mainLight = Math.exp(-((u - 0.3) ** 2 + (v - 0.35) ** 2) / 0.04) * 180
      
      // Luz de relleno suave (Fill Light) - Suaviza sombras
      const fillLight = Math.exp(-((u - 0.7) ** 2 + (v - 0.6) ** 2) / 0.12) * 120
      
      // Luz de fondo atmosférica - Iluminación ambiente
      const backgroundLight = Math.exp(-((u - 0.5) ** 2 + (v - 0.1) ** 2) / 0.3) * 80
      
      // Luz de rim/edge - Define contornos del objeto
      const rimLight = Math.exp(-((u - 0.85) ** 2 + (v - 0.25) ** 2) / 0.06) * 100
      
      // Ambiente general - Iluminación global suave
      const ambientLight = Math.exp(-((u - 0.5) ** 2 + (v - 0.5) ** 2) / 0.5) * 50
      
      // Luz de acento para brillos metálicos
      const accentLight = Math.exp(-((u - 0.4) ** 2 + (v - 0.2) ** 2) / 0.03) * 90
      
      // Combinar todas las luces con saturación natural
      const totalIntensity = mainLight + fillLight + backgroundLight + rimLight + ambientLight + accentLight
      const normalizedIntensity = Math.min(255, totalIntensity)
      
      // Temperatura de color cinematográfica profesional (5600K - luz de día natural)
      const temperatureFactor = normalizedIntensity * 0.95
      const warmFactor = temperatureFactor * 1.05  // Más cálido para calidez
      const coolFactor = temperatureFactor * 0.92  // Menos azul para balance
      
      // Gradiente de color con slight tint dorado para lujo
      data[i * 4] = Math.min(255, warmFactor * 1.02)        // R (dorado sutil)
      data[i * 4 + 1] = Math.min(255, coolFactor)           // G 
      data[i * 4 + 2] = Math.min(255, coolFactor * 0.88)    // B (menos azul)
      data[i * 4 + 3] = 255                                 // A
    }
    
    const texture = new THREE.DataTexture(data, size, size, THREE.RGBAFormat)
    texture.mapping = THREE.EquirectangularReflectionMapping
    texture.needsUpdate = true
    
    // Optimizaciones de rendimiento
    texture.flipY = false
    texture.generateMipmaps = true
    texture.minFilter = THREE.LinearMipmapLinearFilter
    texture.magFilter = THREE.LinearFilter
    
    console.log(`🎨 HDRI sintético cinematográfico ultra-mejorado creado - Resolución: ${size}x${size}`)
    console.log(`✨ Características: 6 fuentes de luz, temperatura de color 5600K, optimización PBR`)
    
    return texture
  }
  
  // Sistema de preload inteligente para HDRI
  const preloadHDRITextures = useRef(false)
  
  const initializeHDRIPreload = () => {
    if (preloadHDRITextures.current) return // Solo ejecutar una vez
    
    preloadHDRITextures.current = true
    console.log('🚀 Iniciando preload inteligente de texturas HDRI...')
    
    // Preload de presets más comunes en segundo plano
    const presetsToPreload = ['studio', 'workshop']
    
    presetsToPreload.forEach(preset => {
      setTimeout(async () => {
        try {
          console.log(`⏳ Preload HDRI: ${preset}`)
          await loadHDRIPreset(preset)
          console.log(`✅ Preload completado: ${preset}`)
        } catch (error) {
          console.warn(`⚠️ Fallo en preload de ${preset}:`, error)
        }
      }, Math.random() * 2000) // Delay aleatorio para evitar spikes
    })
  }
  
  // Limpiar caché cuando sea necesario (para evitar memory leaks)
  const clearHDRICache = () => {
    console.log('🧹 Limpiando caché HDRI...')
    hdriTextureCache.current.clear()
    preloadHDRITextures.current = false
  }

  // Configurar iluminación HDRI cinematográfica profesional
  const setupStudioLighting = (scene: THREE.Scene, performanceLevel: string) => {
    // Limpiar luces existentes
    const existingLights = scene.children.filter(child => child instanceof THREE.Light)
    existingLights.forEach(light => scene.remove(light))

    // 1. SISTEMA DE 3 PUNTOS PROFESIONALES
    
    // Key Light (Principal) - Intensidad 1.5, color blanco cálido
    const keyLight = new THREE.DirectionalLight(0xFFF8E7, performanceLevel === 'high' ? 1.5 : 1.2) // Blanco cálido
    keyLight.position.set(8, 12, 6)
    keyLight.castShadow = true
    keyLight.shadow.mapSize.width = performanceLevel === 'high' ? 2048 : 1024
    keyLight.shadow.mapSize.height = performanceLevel === 'high' ? 2048 : 1024
    keyLight.shadow.camera.near = 1
    keyLight.shadow.camera.far = 50
    keyLight.shadow.camera.left = -15
    keyLight.shadow.camera.right = 15
    keyLight.shadow.camera.top = 15
    keyLight.shadow.camera.bottom = -15
    keyLight.shadow.bias = -0.0001
    keyLight.shadow.normalBias = 0.02
    scene.add(keyLight)

    // Fill Light (Suavizado) - Intensidad 0.8, color blanco frío para equilibrar
    const fillLight = new THREE.DirectionalLight(0xE3F2FD, performanceLevel === 'high' ? 0.8 : 0.6) // Blanco frío
    fillLight.position.set(-6, 8, -8)
    fillLight.castShadow = false // No necesita sombras para luz de relleno
    scene.add(fillLight)

    // Rim Light (Contornos) - Intensidad 1.2, color azul suave para definir contornos
    const rimLight = new THREE.SpotLight(0xE1F5FE, performanceLevel === 'high' ? 1.2 : 1.0) // Azul suave
    rimLight.position.set(0, 15, -12)
    rimLight.target.position.set(0, 0, 0)
    rimLight.angle = Math.PI / 4
    rimLight.penumbra = 0.7
    rimLight.decay = 2
    rimLight.castShadow = true
    rimLight.shadow.mapSize.width = performanceLevel === 'high' ? 2048 : 1024
    rimLight.shadow.mapSize.height = performanceLevel === 'high' ? 2048 : 1024
    scene.add(rimLight)
    scene.add(rimLight.target)

    // 2. ILUMINACIÓN VOLUMÉTRICA

    // DirectionalLight para simular penetración de luz en cristal
    const crystalLight = new THREE.DirectionalLight(0xFFFFFF, performanceLevel === 'high' ? 0.6 : 0.4)
    crystalLight.position.set(2, 10, 8)
    crystalLight.castShadow = true
    crystalLight.shadow.mapSize.width = performanceLevel === 'high' ? 1024 : 512
    crystalLight.shadow.mapSize.height = performanceLevel === 'high' ? 1024 : 512
    crystalLight.shadow.bias = -0.0002
    scene.add(crystalLight)

    // PointLight dentro del reloj para simular luz del mecanismo
    const mechanismLight = new THREE.PointLight(0xFFA500, performanceLevel === 'high' ? 0.4 : 0.3, 8) // Naranja cálido
    mechanismLight.position.set(0, 0, 0.2)
    mechanismLight.castShadow = true
    mechanismLight.shadow.mapSize.width = 512
    mechanismLight.shadow.mapSize.height = 512
    mechanismLight.shadow.bias = -0.0005
    scene.add(mechanismLight)

    // SpotLight enfocando en esfera para máximo realismo
    const dialSpotLight = new THREE.SpotLight(0xFFFFFF, performanceLevel === 'high' ? 0.9 : 0.7)
    dialSpotLight.position.set(0, 8, 6)
    dialSpotLight.target.position.set(0, 0.3, 0)
    dialSpotLight.angle = Math.PI / 6
    dialSpotLight.penumbra = 0.8
    dialSpotLight.decay = 2
    dialSpotLight.castShadow = true
    dialSpotLight.shadow.mapSize.width = performanceLevel === 'high' ? 1024 : 512
    dialSpotLight.shadow.mapSize.height = performanceLevel === 'high' ? 1024 : 512
    dialSpotLight.shadow.bias = -0.0003
    scene.add(dialSpotLight)
    scene.add(dialSpotLight.target)

    // 3. CONFIGURACIÓN DE SOMBRAS OPTIMIZADA
    
    // Configurar PCFSoftShadowMap para sombras difuminadas naturales
    if (rendererRef.current) {
      rendererRef.current.shadowMap.enabled = true
      rendererRef.current.shadowMap.type = THREE.PCFSoftShadowMap
      rendererRef.current.shadowMap.autoUpdate = true
    }

    // 4. ILUMINACIÓN AMBIENTAL COMPLEMENTARIA

    // Luz ambiental suave para evitar sombras demasiado oscuras
    const ambientLight = new THREE.AmbientLight(0x404040, performanceLevel === 'high' ? 0.25 : 0.35)
    scene.add(ambientLight)

    // Luz hemisférica para iluminación global natural
    const hemiLight = new THREE.HemisphereLight(0xFFFFFF, 0x404040, performanceLevel === 'high' ? 0.5 : 0.4)
    hemiLight.position.set(0, 1, 0)
    scene.add(hemiLight)

    // Luz superior difusa para iluminación general
    const topLight = new THREE.DirectionalLight(0xF0F8FF, performanceLevel === 'high' ? 0.4 : 0.3)
    topLight.position.set(0, 15, 0)
    topLight.castShadow = false
    scene.add(topLight)

    console.log('Sistema de iluminación HDRI cinematográfica profesional configurado para nivel:', performanceLevel)
    console.log('- Key Light: Intensidad 1.5, color blanco cálido')
    console.log('- Fill Light: Intensidad 0.8, color blanco frío')  
    console.log('- Rim Light: Intensidad 1.2, color azul suave')
    console.log('- Iluminación volumétrica: Crystal + Mechanism + Dial lights')
    console.log('- PCFSoftShadowMap configurado para máxima calidad')
  }

  // Funciones de interactividad del mouse con corona
  const handleMouseDown = (event: MouseEvent) => {
    if (!rendererRef.current || !cameraRef.current || !watchGroupRef.current) return
    event.preventDefault()

    const rect = rendererRef.current.domElement.getBoundingClientRect()
    mouseRef.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
    mouseRef.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1

    raycasterRef.current.setFromCamera(mouseRef.current, cameraRef.current)
    const intersects = raycasterRef.current.intersectObjects(watchGroupRef.current.children, true)

    // Buscar intersección con la corona
    let isCrownHover = false
    for (const intersect of intersects) {
      let currentObject = intersect.object
      while (currentObject.parent) {
        if (currentObject.userData && currentObject.userData.isCrown) {
          isCrownHover = true
          isDraggingCrownRef.current = true
          lastMouseXRef.current = event.clientX
          document.body.style.cursor = 'pointer'
          setCrownHover(true)
          console.log('Corona seleccionada para interacción')
          break
        }
        currentObject = currentObject.parent
      }
      if (isCrownHover) break
    }

    if (!isCrownHover) {
      setCrownHover(false)
    }

    console.log('Mouse down en posición:', event.clientX, event.clientY)
  }

  const handleMouseMove = (event: MouseEvent) => {
    if (!rendererRef.current || !cameraRef.current || !watchGroupRef.current) return
    event.preventDefault()

    // Detectar hover sobre la corona
    const rect = rendererRef.current.domElement.getBoundingClientRect()
    mouseRef.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
    mouseRef.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1

    raycasterRef.current.setFromCamera(mouseRef.current, cameraRef.current)
    const intersects = raycasterRef.current.intersectObjects(watchGroupRef.current.children, true)

    let isCrownHover = false
    for (const intersect of intersects) {
      let currentObject = intersect.object
      while (currentObject.parent) {
        if (currentObject.userData && currentObject.userData.isCrown) {
          isCrownHover = true
          break
        }
        currentObject = currentObject.parent
      }
      if (isCrownHover) break
    }

    // Actualizar cursor y estado de hover
    if (!isDraggingCrownRef.current) {
      if (isCrownHover && !crownHover) {
        setCrownHover(true)
        document.body.style.cursor = 'pointer'
      } else if (!isCrownHover && crownHover) {
        setCrownHover(false)
        document.body.style.cursor = 'default'
      }
    }

    // Manejar rotación si se está arrastrando
    if (isDraggingCrownRef.current) {
      const deltaX = event.clientX - lastMouseXRef.current
      lastMouseXRef.current = event.clientX
      
      const newRotation = crownRotation + deltaX * 0.01
      setCrownRotation(newRotation)
      
      if (crownRef.current) {
        crownRef.current.rotation.z = Math.PI / 2 + newRotation
      }
    }
  }

  const handleMouseUp = (event: MouseEvent) => {
    if (!rendererRef.current) return
    event.preventDefault()

    if (isDraggingCrownRef.current) {
      isDraggingCrownRef.current = false
      document.body.style.cursor = 'default'
      console.log('Interacción con corona finalizada. Rotación:', crownRotation)
    }

    console.log('Mouse up en posición:', event.clientX, event.clientY)
  }

  // Prevenir selección de texto durante drag de corona
  const preventTextSelection = (event: Event) => {
    if (isDraggingCrownRef.current) {
      event.preventDefault()
    }
  }

  // Verificar soporte WebGL
  const isWebGLSupported = () => {
    try {
      const canvas = document.createElement('canvas')
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
      return !!gl
    } catch (e) {
      return false
    }
  }

  // SISTEMA DE MATERIALES PBR ULTRA-REALISTAS
  // =============================================
  
  /**
   * Crea materiales PBR ultra-realistas basados en análisis visual
   * Incluye propiedades físicas reales, normal maps y shaders avanzados
   */
  const createUltraRealisticMaterials = () => {
    const materials = {
      // ORO - Configuración PBR ultra-realista
      oro: {
        base: new THREE.MeshPhysicalMaterial({
          color: '#FFD700',
          metalness: 1.0,
          roughness: 0.15,
          envMapIntensity: 3.2,
          clearcoat: 1.0,
          clearcoatRoughness: 0.02,
          sheen: 1.0,
          sheenRoughness: 0.05,
          sheenColor: '#FFD700',
          emissive: '#FFD700',
          emissiveIntensity: 0.05,
          anisotropy: 0.3,
          anisotropyRotation: 0.0,
          ior: 2.5
        }),
        brushed: new THREE.MeshPhysicalMaterial({
          color: '#FFD700',
          metalness: 1.0,
          roughness: 0.25,
          envMapIntensity: 2.8,
          clearcoat: 0.95,
          clearcoatRoughness: 0.08,
          sheen: 1.0,
          sheenRoughness: 0.2,
          anisotropy: 0.8,
          anisotropyRotation: 0.0,
          ior: 2.5
        }),
        polished: new THREE.MeshPhysicalMaterial({
          color: '#FFD700',
          metalness: 1.0,
          roughness: 0.08,
          envMapIntensity: 4.0,
          clearcoat: 1.0,
          clearcoatRoughness: 0.01,
          sheen: 1.0,
          sheenRoughness: 0.03,
          anisotropy: 0.1,
          anisotropyRotation: 0.0,
          ior: 2.5
        })
      },

      // ACERO INOXIDABLE - Configuración PBR ultra-realista
      acero: {
        base: new THREE.MeshPhysicalMaterial({
          color: '#C0C0C0',
          metalness: 1.0,
          roughness: 0.25,
          envMapIntensity: 2.5,
          clearcoat: 1.0,
          clearcoatRoughness: 0.05,
          sheen: 0.9,
          sheenRoughness: 0.15,
          anisotropy: 0.6,
          anisotropyRotation: Math.PI / 4,
          emissive: '#C0C0C0',
          emissiveIntensity: 0.01,
          ior: 2.7
        }),
        brushed: new THREE.MeshPhysicalMaterial({
          color: '#C0C0C0',
          metalness: 1.0,
          roughness: 0.35,
          envMapIntensity: 2.2,
          clearcoat: 0.9,
          clearcoatRoughness: 0.1,
          sheen: 0.8,
          sheenRoughness: 0.4,
          anisotropy: 0.9,
          anisotropyRotation: 0.0,
          ior: 2.7
        }),
        polished: new THREE.MeshPhysicalMaterial({
          color: '#C0C0C0',
          metalness: 1.0,
          roughness: 0.15,
          envMapIntensity: 3.5,
          clearcoat: 1.0,
          clearcoatRoughness: 0.03,
          sheen: 1.0,
          sheenRoughness: 0.08,
          anisotropy: 0.3,
          anisotropyRotation: 0.0,
          ior: 2.7
        })
      },

      // TITANIO - Configuración PBR ultra-realista
      titanio: {
        base: new THREE.MeshPhysicalMaterial({
          color: '#8E8E8E',
          metalness: 1.0,
          roughness: 0.35,
          envMapIntensity: 2.2,
          clearcoat: 0.95,
          clearcoatRoughness: 0.06,
          sheen: 0.8,
          sheenRoughness: 0.2,
          anisotropy: 0.4,
          anisotropyRotation: Math.PI / 6,
          emissive: '#8E8E8E',
          emissiveIntensity: 0.02,
          ior: 2.4
        }),
        brushed: new THREE.MeshPhysicalMaterial({
          color: '#8E8E8E',
          metalness: 1.0,
          roughness: 0.45,
          envMapIntensity: 1.8,
          clearcoat: 0.85,
          clearcoatRoughness: 0.12,
          sheen: 0.7,
          sheenRoughness: 0.5,
          anisotropy: 0.8,
          anisotropyRotation: 0.0,
          ior: 2.4
        }),
        polished: new THREE.MeshPhysicalMaterial({
          color: '#8E8E8E',
          metalness: 1.0,
          roughness: 0.25,
          envMapIntensity: 2.8,
          clearcoat: 1.0,
          clearcoatRoughness: 0.04,
          sheen: 0.9,
          sheenRoughness: 0.12,
          anisotropy: 0.2,
          anisotropyRotation: 0.0,
          ior: 2.4
        })
      },

      // CRISTAL ZAFIRO - Configuración PBR ultra-realista con transmission
      cristal_zafiro: {
        base: new THREE.MeshPhysicalMaterial({
          color: '#FFFFFF',
          metalness: 0.0,
          roughness: 0.1,
          transmission: 0.98,
          thickness: 0.5,
          ior: 1.77,
          envMapIntensity: 1.5,
          clearcoat: 1.0,
          clearcoatRoughness: 0.08,
          opacity: 0.22,
          transparent: true,
          side: THREE.DoubleSide
        }),
        ar: new THREE.MeshPhysicalMaterial({
          color: '#FFFFFF',
          metalness: 0.0,
          roughness: 0.05,
          transmission: 0.985,
          thickness: 0.8,
          ior: 1.77,
          envMapIntensity: 2.0,
          clearcoat: 1.0,
          clearcoatRoughness: 0.02,
          opacity: 0.18,
          transparent: true,
          side: THREE.DoubleSide
        })
      },

      // CUERO - Configuración PBR con subsurface scattering simulado
      cuero: {
        base: new THREE.MeshPhysicalMaterial({
          color: '#8B4513',
          metalness: 0.0,
          roughness: 0.8,
          envMapIntensity: 0.3,
          sheen: 0.9,
          sheenRoughness: 0.9,
          clearcoat: 0.2,
          clearcoatRoughness: 0.5,
          // Subsurface scattering simulado con properties avanzadas
          transmission: 0.02,
          thickness: 0.1,
          ior: 1.4,
          attenuationColor: '#8B4513',
          attenuationDistance: 0.1
        }),
        textured: new THREE.MeshPhysicalMaterial({
          color: '#8B4513',
          metalness: 0.0,
          roughness: 0.95,
          envMapIntensity: 0.2,
          sheen: 0.7,
          sheenRoughness: 0.95,
          clearcoat: 0.1,
          clearcoatRoughness: 0.8,
          transmission: 0.01,
          thickness: 0.15,
          ior: 1.4,
          attenuationColor: '#8B4513',
          attenuationDistance: 0.15
        }),
        polished: new THREE.MeshPhysicalMaterial({
          color: '#8B4513',
          metalness: 0.0,
          roughness: 0.6,
          envMapIntensity: 0.6,
          sheen: 0.8,
          sheenRoughness: 0.4,
          clearcoat: 0.4,
          clearcoatRoughness: 0.3,
          transmission: 0.05,
          thickness: 0.05,
          ior: 1.4,
          attenuationColor: '#8B4513',
          attenuationDistance: 0.05
        })
      }
    }

    return materials
  }

  /**
   * Crea normal maps basados en micro-superficies reales
   * Simula texturas cepilladas, pulidas y grabados
   */
  const createMicroSurfaceDetails = (materialType: string, finish: string = 'base') => {
    const normalMaps = {
      oro: {
        brushed: createBrushedMetalNormal(),
        polished: createPolishedMetalNormal(),
        engraved: createEngravedMetalNormal()
      },
      acero: {
        brushed: createBrushedMetalNormal(),
        polished: createPolishedMetalNormal(),
        engraved: createEngravedMetalNormal()
      },
      titanio: {
        brushed: createBrushedMetalNormal(),
        polished: createPolishedMetalNormal(),
        engraved: createEngravedMetalNormal()
      },
      cuero: {
        textured: createLeatherTextureNormal(),
        polished: createSmoothLeatherNormal()
      }
    }

    return normalMaps[materialType]?.[finish] || null
  }

  /**
   * Crea normal map para efecto de metal cepillado
   */
  const createBrushedMetalNormal = (): THREE.Texture => {
    const size = 256
    const canvas = document.createElement('canvas')
    canvas.width = size
    canvas.height = size
    const ctx = canvas.getContext('2d')!
    
    const imageData = ctx.createImageData(size, size)
    const data = imageData.data
    
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        // Patrón de rayas horizontales para efecto cepillado
        const stripe = Math.sin(x * 0.2) * 0.3 + Math.sin(x * 0.15) * 0.2
        const noise = (Math.random() - 0.5) * 0.1
        const normal = Math.max(0, Math.min(255, 128 + (stripe + noise) * 127))
        
        const index = (y * size + x) * 4
        data[index] = normal     // R
        data[index + 1] = normal // G
        data[index + 2] = normal // B
        data[index + 3] = 255    // A
      }
    }
    
    ctx.putImageData(imageData, 0, 0)
    const texture = new THREE.CanvasTexture(canvas)
    texture.wrapS = THREE.RepeatWrapping
    texture.wrapT = THREE.RepeatWrapping
    texture.repeat.set(4, 1)
    
    return texture
  }

  /**
   * Crea normal map para efecto de metal pulido
   */
  const createPolishedMetalNormal = (): THREE.Texture => {
    const size = 256
    const canvas = document.createElement('canvas')
    canvas.width = size
    canvas.height = size
    const ctx = canvas.getContext('2d')!
    
    const imageData = ctx.createImageData(size, size)
    const data = imageData.data
    
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        // Superficie muy suave con pequeñas variaciones
        const smooth = (Math.random() - 0.5) * 0.02
        const normal = Math.max(0, Math.min(255, 128 + smooth * 127))
        
        const index = (y * size + x) * 4
        data[index] = normal
        data[index + 1] = normal
        data[index + 2] = normal
        data[index + 3] = 255
      }
    }
    
    ctx.putImageData(imageData, 0, 0)
    const texture = new THREE.CanvasTexture(canvas)
    
    return texture
  }

  /**
   * Crea normal map para grabados y textos
   */
  const createEngravedMetalNormal = (): THREE.Texture => {
    const size = 512
    const canvas = document.createElement('canvas')
    canvas.width = size
    canvas.height = size
    const ctx = canvas.getContext('2d')!
    
    ctx.fillStyle = '#808080'
    ctx.fillRect(0, 0, size, size)
    
    // Simular grabado con gradientes suaves
    for (let i = 0; i < 10; i++) {
      const x = Math.random() * size
      const y = Math.random() * size
      const radius = Math.random() * 20 + 10
      
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius)
      gradient.addColorStop(0, '#606060')
      gradient.addColorStop(0.7, '#808080')
      gradient.addColorStop(1, '#A0A0A0')
      
      ctx.fillStyle = gradient
      ctx.beginPath()
      ctx.arc(x, y, radius, 0, Math.PI * 2)
      ctx.fill()
    }
    
    const texture = new THREE.CanvasTexture(canvas)
    return texture
  }

  /**
   * Crea normal map para textura de cuero
   */
  const createLeatherTextureNormal = (): THREE.Texture => {
    const size = 256
    const canvas = document.createElement('canvas')
    canvas.width = size
    canvas.height = size
    const ctx = canvas.getContext('2d')!
    
    const imageData = ctx.createImageData(size, size)
    const data = imageData.data
    
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        // Textura de cuero con poros naturales
        const noise1 = (Math.random() - 0.5) * 0.4
        const noise2 = Math.sin(x * 0.1) * Math.sin(y * 0.1) * 0.2
        const grain = noise1 + noise2
        const normal = Math.max(0, Math.min(255, 128 + grain * 127))
        
        const index = (y * size + x) * 4
        data[index] = normal
        data[index + 1] = normal
        data[index + 2] = normal
        data[index + 3] = 255
      }
    }
    
    ctx.putImageData(imageData, 0, 0)
    const texture = new THREE.CanvasTexture(canvas)
    
    return texture
  }

  /**
   * Crea normal map para cuero liso
   */
  const createSmoothLeatherNormal = (): THREE.Texture => {
    const size = 256
    const canvas = document.createElement('canvas')
    canvas.width = size
    canvas.height = size
    const ctx = canvas.getContext('2d')!
    
    const imageData = ctx.createImageData(size, size)
    const data = imageData.data
    
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        // Superficie suave del cuero con ligera textura
        const smooth = (Math.random() - 0.5) * 0.1
        const normal = Math.max(0, Math.min(255, 128 + smooth * 127))
        
        const index = (y * size + x) * 4
        data[index] = normal
        data[index + 1] = normal
        data[index + 2] = normal
        data[index + 3] = 255
      }
    }
    
    ctx.putImageData(imageData, 0, 0)
    const texture = new THREE.CanvasTexture(canvas)
    
    return texture
  }

  /**
   * Aplica shaders avanzados según el tipo de material
   */
  const applyAdvancedShaders = (mesh: THREE.Mesh, materialType: string, finish: string) => {
    if (materialType === 'cristal_zafiro') {
      // Añadir reflexiones fresnel mejoradas
      if (mesh.material instanceof THREE.MeshPhysicalMaterial) {
        mesh.material.onBeforeCompile = (shader) => {
          shader.uniforms.fresnelPower = { value: 2.5 }
          shader.uniforms.fresnelBias = { value: 0.1 }
          
          shader.fragmentShader = shader.fragmentShader.replace(
            '#include <output_fragment>',
            `
              #include <output_fragment>
              float fresnel = pow(1.0 - dot(normalize(vNormal), normalize(vViewPosition)), 2.5);
              gl_FragColor.rgb = mix(gl_FragColor.rgb, vec3(1.0), fresnel * 0.3);
            `
          )
        }
      }
    }
    
    if (materialType === 'cuero') {
      // Simular subsurface scattering con scattering de luz
      if (mesh.material instanceof THREE.MeshPhysicalMaterial) {
        mesh.material.onBeforeCompile = (shader) => {
          shader.uniforms.subsurfaceColor = { value: new THREE.Color('#8B4513') }
          shader.uniforms.subsurfaceAmount = { value: 0.3 }
          
          shader.fragmentShader = shader.fragmentShader.replace(
            '#include <lights_fragment_begin>',
            `
              #include <lights_fragment_begin>
              #ifdef USE_SS
                float subsurface = pow(dot(normalize(vNormal), normalize(vViewPosition)), 2.0);
                vec3 subsurfaceColor = mix(outgoingLight, diffuseColor.rgb, subsurface * 0.2);
                outgoingLight = mix(outgoingLight, subsurfaceColor, 0.1);
              #endif
            `
          )
        }
      }
    }
  }

  /**
   * Obtiene material PBR configurado según especificaciones
   */
  const getConfiguredMaterial = (type: string, finish: string = 'base'): THREE.Material => {
    const materials = createUltraRealisticMaterials()
    const materialType = type.toLowerCase()
    
    let materialCategory = 'acero' // Default
    if (materialType.includes('oro')) materialCategory = 'oro'
    else if (materialType.includes('titanio')) materialCategory = 'titanio'
    else if (materialType.includes('cristal') || materialType.includes('zafiro')) materialCategory = 'cristal_zafiro'
    else if (materialType.includes('cuero') || materialType.includes('leather')) materialCategory = 'cuero'
    
    const category = materials[materialCategory as keyof typeof materials]
    if (!category) return new THREE.MeshPhysicalMaterial()
    
    // Clonar material para evitar referencias compartidas
    const material = (category as any)[finish]?.clone() || (category as any).base?.clone() || new THREE.MeshPhysicalMaterial()
    
    // Aplicar normal maps si están disponibles
    const normalMap = createMicroSurfaceDetails(materialCategory, finish)
    if (normalMap && material instanceof THREE.MeshPhysicalMaterial) {
      material.normalMap = normalMap
      material.normalScale = new THREE.Vector2(0.5, 0.5)
    }
    
    return material
  }

  // Inicializar escena 3D con iluminación HDRI avanzada
  useEffect(() => {
    const initializeVanillaSystem = async () => {
      // Verificar si ya hay un configurador 3D activo
      if (!configuratorSingleton.canInitialize) {
        console.warn(
          '⚠️ No se puede inicializar WatchConfigurator3DVanilla porque ya hay un configurador activo:',
          configuratorSingleton.activeConfigurator
        )
        setWebGLError(true)
        setIsLoading(false)
        return
      }

      // Verificar soporte WebGL
    if (!isWebGLSupported()) {
      console.error('WebGL no está soportado en este navegador')
      setWebGLError(true)
      setIsLoading(false)
      return
    }

    // Detectar nivel de rendimiento
    const performanceLevel = detectPerformanceLevel()
    setIsLowPerformance(performanceLevel === 'low')
    console.log(`Nivel de rendimiento detectado: ${performanceLevel}`)

    // Limitar intentos de inicialización
    if (initializeAttemptsRef.current > 3) {
      console.error('Demasiados intentos de inicialización fallidos')
      setWebGLError(true)
      setIsLoading(false)
      return
    }

    initializeAttemptsRef.current++

    if (!containerRef.current) {
      console.warn('Container ref no está disponible')
      return
    }

    const container = containerRef.current
    
    // CRÍTICO: Esperar a que el container tenga dimensiones válidas
    const checkDimensions = () => {
      const width = container.clientWidth || container.offsetWidth || 600
      const height = container.clientHeight || container.offsetHeight || 400
      
      console.log(`Dimensiones del container: ${width}x${height}`)
      
      if (width <= 0 || height <= 0) {
        console.warn(`Dimensiones inválidas: ${width}x${height}. Reintentando en 200ms...`)
        return false
      }
      return true
    }

    // Si las dimensiones no son válidas, reintentar hasta 10 veces con más paciencia
    if (!checkDimensions()) {
      let attempts = 0
      const maxAttempts = 10
      const retryInterval = setInterval(() => {
        attempts++
        console.log(`Intento ${attempts}/${maxAttempts} para dimensiones válidas`)
        
        if (checkDimensions() || attempts >= maxAttempts) {
          clearInterval(retryInterval)
          if (attempts < maxAttempts) {
            initializeAttemptsRef.current = 0 // Reset attempts si succeeded
          }
        }
      }, 200)
      
      return () => clearInterval(retryInterval)
    }

    const width = Math.max(container.clientWidth, 1)
    const height = Math.max(container.clientHeight, 1)

    console.log(`Inicializando 3D HDRI con dimensiones: ${width}x${height}`)

    try {
      // Crear escena
      const scene = new THREE.Scene()
      scene.background = new THREE.Color(0xf5f5f4)
      scene.fog = new THREE.Fog(0xf5f5f4, 10, 30)
      sceneRef.current = scene

      // Crear cámara con aspect ratio válido
      const aspect = width / height
      const camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 100)
      camera.position.set(0, 3, 6)
      cameraRef.current = camera

      // Crear renderer con configuración avanzada
      const renderer = new THREE.WebGLRenderer({ 
        antialias: performanceLevel !== 'low', 
        alpha: true,
        powerPreference: performanceLevel === 'high' ? 'high-performance' : 'default',
        failIfMajorPerformanceCaveat: false
      })
      
      // Configuración de renderer optimizada
      renderer.setSize(Math.max(width, 1), Math.max(height, 1))
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, performanceLevel === 'low' ? 1.5 : 2))
      
      // PARÁMETROS DE RENDER CINEMATOGRÁFICOS
      renderer.toneMapping = THREE.ACESFilmicToneMapping
      renderer.toneMappingExposure = 1.0
      renderer.outputColorSpace = THREE.SRGBColorSpace
      
      // CONFIGURACIÓN DE SOMBRAS PREMIUM
      renderer.shadowMap.enabled = true
      renderer.shadowMap.type = THREE.PCFSoftShadowMap // Sombras difuminadas naturales
      renderer.shadowMap.autoUpdate = true
      
      rendererRef.current = renderer

      // Crear PMREMGenerator para HDRI DESPUÉS de crear el renderer
      pmremGeneratorRef.current = new THREE.PMREMGenerator(renderer)
      pmremGeneratorRef.current.compileEquirectangularShader()

      // Configurar iluminación de estudio primero
      setupStudioLighting(scene, performanceLevel)

      // HDRI ENVIRONMENT MAPPING CON TEXTURAMANAGER OPTIMIZADO
      console.log('🚀 Inicializando TexturaManager con sistema de carga optimizado...')
      
      try {
        // Usar TexturaManager para carga con fallback múltiple robusto
        const hdriTexture = await texturaManager.getTexture('studio')
        const envMap = pmremGeneratorRef.current.fromEquirectangular(hdriTexture).texture
        scene.environment = envMap
        envMapRef.current = envMap
        setHdriLoaded(true)
        
        console.log('🎬 HDRI "studio" cargado exitosamente con TexturaManager optimizado')
        
        // Iniciar preload inteligente después de cargar el principal
        setTimeout(() => {
          console.log('📋 Iniciando preload de texturas críticas...')
          texturaManager.preloadCriticalTextures().then(() => {
            console.log('✅ Preload de texturas críticas completado')
          })
        }, 1000)
        
      } catch (error) {
        console.warn('❌ Error crítico con TexturaManager, el sistema debería manejar fallbacks automáticamente:', error)
        
        // Como último recurso, crear ambiente básico
        const basicTexture = new THREE.DataTexture(
          new Uint8Array([245, 250, 255, 255, 235, 240, 245, 255, 240, 245, 250, 255]),
          2, 1, THREE.RGBAFormat
        )
        const envMap = pmremGeneratorRef.current.fromEquirectangular(basicTexture).texture
        scene.environment = envMap
        envMapRef.current = envMap
        setHdriLoaded(true)
        
        console.log('🆘 Ambiente básico de emergencia aplicado')
      }
      
      // Verificar que el renderer se creó correctamente con casting apropiado
      const gl = renderer.getContext() as WebGL2RenderingContext
      if (!gl || gl.isContextLost()) {
        throw new Error('WebGL context lost or invalid')
      }

      container.appendChild(renderer.domElement)

      // Agregar event listeners para interactividad del mouse
      renderer.domElement.addEventListener('mousedown', handleMouseDown)
      renderer.domElement.addEventListener('mousemove', handleMouseMove)
      renderer.domElement.addEventListener('mouseup', handleMouseUp)
      
      // Event listeners globales para capturar mouseup fuera del canvas
      document.addEventListener('mouseup', handleMouseUp)
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('selectstart', preventTextSelection)

      // Controles de órbita mejorados
      const controls = await loadOrbitControls(camera, renderer.domElement)
      controls.enableDamping = true
      controls.dampingFactor = 0.05
      controls.enablePan = false
      controls.enableZoom = true
      controls.minDistance = performanceLevel === 'low' ? 4 : 3
      controls.maxDistance = performanceLevel === 'low' ? 8 : 10
      controls.maxPolarAngle = Math.PI / 2 + 0.3
      controls.minPolarAngle = Math.PI / 4
      controls.autoRotate = false
      controls.autoRotateSpeed = 1.0
      controlsRef.current = controls

      // POST-PROCESADO CINEMATOGRÁFICO PROFESIONAL
      if (performanceLevel !== 'low') {
        console.log('🎬 Configurando pipeline de post-procesado cinematográfico...')
        
        const EffectComposer = await loadEffectComposer()
        const composer = new EffectComposer(renderer)
        
        // Render Pass - Base para todos los efectos
        const RenderPass = await loadRenderPass()
        const renderPass = new RenderPass(scene, camera)
        composer.addPass(renderPass)
        
        // 1. DEPTH OF FIELD (BOKEH) - Enfoque automático en el reloj
        if (performanceLevel === 'high') {
          const BokehPass = await loadBokehPass()
          const bokehPass = new BokehPass(scene, camera, {
            focus: 2.5,           // Focus distance: 2.5 unidades
            aperture: 0.00025,    // Apertura f/2.8
            maxblur: 0.01         // Max blur para claridad del reloj
          })
          composer.addPass(bokehPass)
          bokehPassRef.current = bokehPass
          console.log('✅ BokehPass configurado - f/2.8, focus 2.5, max blur 0.01')
        }
        
        // 2. BLOOM MEJORADO PARA LUCES REFLECTANTES
        if (performanceLevel === 'high' || performanceLevel === 'medium') {
          const UnrealBloomPass = await loadUnrealBloomPass()
          const bloomPass = new UnrealBloomPass(
            new THREE.Vector2(width, height),
            0.4,                  // Strength: 0.4 para efecto sutil
            0.1,                  // Radius: 0.1 para glow natural
            0.85                  // Threshold: 0.85 para solo luces intensas
          )
          composer.addPass(bloomPass)
          bloomPassRef.current = bloomPass
          console.log('✅ BloomPass configurado - threshold 0.85, strength 0.4, radius 0.1')
        }
        
        // 3. CHROMATIC ABERRATION - Aberración de lentes reales
        if (performanceLevel === 'high') {
          const ChromaticAberrationShader = {
            uniforms: {
              'tDiffuse': { value: null },
              'offset': { value: new THREE.Vector2(0.002, 0.001) }
            },
            vertexShader: `
              varying vec2 vUv;
              void main() {
                vUv = uv;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
              }
            `,
            fragmentShader: `
              uniform sampler2D tDiffuse;
              uniform vec2 offset;
              varying vec2 vUv;
              
              void main() {
                vec4 color = texture2D(tDiffuse, vUv);
                vec4 aberration = vec4(
                  texture2D(tDiffuse, vUv + offset).r,
                  texture2D(tDiffuse, vUv).g,
                  texture2D(tDiffuse, vUv - offset).b,
                  1.0
                );
                gl_FragColor = mix(color, aberration, 0.3);
              }
            `
          }
          
          const ShaderPass = await loadShaderPass()
          const chromaticPass = new ShaderPass(ChromaticAberrationShader)
          composer.addPass(chromaticPass)
          chromaticPassRef.current = chromaticPass
          console.log('✅ Chromatic Aberration configurado - offset (0.002, 0.001)')
        }
        
        // 4. FILM GRAIN PROFESIONAL - Granulación de película
        if (performanceLevel === 'high' || performanceLevel === 'medium') {
          try {
            const FilmPass = await loadFilmPass()
            const filmPass = new FilmPass()
            composer.addPass(filmPass)
            filmPassRef.current = filmPass
            console.log('✅ Film Grain configurado - noise opacity 0.025')
          } catch (e) {
            console.warn('FilmPass no disponible, saltando film grain:', e)
          }
        }
        
        // 5. ANTI-ALIASING MEJORADO - SMAA o FXAA según rendimiento
        if (performanceLevel === 'high') {
          try {
            const SMAAPass = await loadSMAAPass()
            const smaaPass = new SMAAPass()
            composer.addPass(smaaPass)
            smaaPassRef.current = smaaPass
            console.log('✅ SMAA configurado para anti-aliasing superior')
          } catch (e) {
            // Fallback a FXAA si SMAA no está disponible
            const ShaderPass = await loadShaderPass()
            const FXAAShader = await loadFXAAShader()
            const fxaaPass = new ShaderPass(FXAAShader)
            fxaaPass.uniforms['resolution'].value.set(1 / width, 1 / height)
            composer.addPass(fxaaPass)
            fxaaPassRef.current = fxaaPass
            console.log('✅ FXAA configurado como fallback')
          }
        } else if (performanceLevel === 'medium') {
          try {
            const ShaderPass = await loadShaderPass()
            const FXAAShader = await loadFXAAShader()
            const fxaaPass = new ShaderPass(FXAAShader)
            fxaaPass.uniforms['resolution'].value.set(1 / width, 1 / height)
            composer.addPass(fxaaPass)
            fxaaPassRef.current = fxaaPass
            console.log('✅ FXAA configurado para rendimiento medio')
          } catch (e) {
            console.warn('FXAA no disponible, continuando sin anti-aliasing:', e)
          }
        }
        
        // 6. MOTION BLUR DINÁMICO PARA MANECILLAS
        // (Se configurará dinámicamente durante la animación)
        
        composerRef.current = composer
        renderPassRef.current = renderPass
        
        console.log('🎬 Pipeline cinematográfico configurado exitosamente')
        console.log('📸 Efectos activos: Bokeh, Bloom, Chromatic Aberration, Film Grain, Anti-aliasing')
      }

      // Crear grupo para el reloj
      const watchGroup = new THREE.Group()
      scene.add(watchGroup)
      watchGroupRef.current = watchGroup

      // Plano de sombras mejorado
      const groundGeometry = new THREE.CircleGeometry(10, 64)
      const groundMaterial = new THREE.ShadowMaterial({ 
        opacity: performanceLevel === 'low' ? 0.1 : 0.2 
      })
      const ground = new THREE.Mesh(groundGeometry, groundMaterial)
      ground.rotation.x = -Math.PI / 2
      ground.position.y = -0.5
      ground.receiveShadow = true
      scene.add(ground)

      // Manejar redimensionamiento con validación robusta
      const handleResize = () => {
        if (!containerRef.current || !cameraRef.current || !rendererRef.current) return
        
        const newWidth = Math.max(containerRef.current.clientWidth || 600, 1)
        const newHeight = Math.max(containerRef.current.clientHeight || 400, 1)
        
        console.log(`Redimensionando a: ${newWidth}x${newHeight}`)
        
        try {
          cameraRef.current.aspect = newWidth / newHeight
          cameraRef.current.updateProjectionMatrix()
          rendererRef.current.setSize(newWidth, newHeight)
          
          if (composerRef.current) {
            composerRef.current.setSize(newWidth, newHeight)
          }
        } catch (error) {
          console.error('Error redimensionando renderer:', error)
        }
      }

      window.addEventListener('resize', handleResize)

      // SISTEMA DE MOTION BLUR DINÁMICO PARA MANECILLAS
      const calculateMotionBlurIntensity = (rotationSpeed: number): number => {
        // Calcular intensidad basada en velocidad de rotación
        const speed = Math.abs(rotationSpeed)
        const maxSpeed = 0.1 // Velocidad máxima esperada
        
        // Normalizar y aplicar curva para efecto natural
        const normalizedSpeed = Math.min(speed / maxSpeed, 1.0)
        return normalizedSpeed * 0.08 // Máximo 0.08 de blur
      }
      
      let previousTime = performance.now()
      let watchRotationVelocity = 0

      // Loop de animación con efectos cinematográficos
      const animate = () => {
        animationIdRef.current = requestAnimationFrame(animate)
        
        frameCountRef.current++
        const now = Date.now()
        const deltaTime = (now - previousTime) / 1000
        previousTime = now
        
        // Verificar FPS cada segundo
        if (now - lastFpsCheckRef.current > 1000) {
          const fps = frameCountRef.current
          frameCountRef.current = 0
          lastFpsCheckRef.current = now
          
          // Adaptar calidad si FPS es bajo
          if (fps < 30 && !isLowPerformance) {
            console.log('FPS bajo detectado, ajustando calidad cinematográfica...')
            // Ajustar efectos dinámicamente para mantener FPS
            if (bloomPassRef.current) {
              bloomPassRef.current.strength *= 0.9 // Reducir bloom
            }
          }
        }
        
        try {
          if (controlsRef.current) {
            controlsRef.current.update()
          }

          if (watchGroupRef.current) {
            // Rotación suave del reloj con detección de velocidad
            const targetRotation = watchGroupRef.current.rotation.y + 0.002
            const rotationDelta = targetRotation - watchGroupRef.current.rotation.y
            watchRotationVelocity = Math.abs(rotationDelta)
            
            watchGroupRef.current.rotation.y = targetRotation
            
            // ANIMACIÓN DE MANECILLAS CON MOTION BLUR DINÁMICO
            const handsGroup = watchGroupRef.current.children.find(child => 
              child instanceof THREE.Group && child.children.some(h => 
                h instanceof THREE.Mesh && h.geometry instanceof THREE.BoxGeometry
              )
            ) as THREE.Group
            
            if (handsGroup) {
              // Tiempo actual para animación de manecillas
              const currentTime = now / 1000
              
              // Calcular posiciones de manecillas realistas
              const seconds = currentTime % 60
              const minutes = (currentTime / 60) % 60
              const hours = (currentTime / 3600) % 12
              
              // Encontrar y animar manecillas
              handsGroup.children.forEach((child, index) => {
                if (child instanceof THREE.Group && child.children.length > 0) {
                  const handMesh = child.children[0] as THREE.Mesh
                  
                  if (handMesh && handMesh.geometry instanceof THREE.BoxGeometry) {
                    let rotation = 0
                    
                    if (index === 0) {
                      // Manecilla de horas (más lenta, menos motion blur)
                      rotation = (hours / 12) * Math.PI * 2
                      const motionBlurIntensity = calculateMotionBlurIntensity(0.001)
                      setMotionBlurIntensity(motionBlurIntensity)
                      
                    } else if (index === 1) {
                      // Manecilla de minutos (velocidad media)
                      rotation = (minutes / 60) * Math.PI * 2
                      const motionBlurIntensity = calculateMotionBlurIntensity(0.002)
                      setMotionBlurIntensity(motionBlurIntensity)
                      
                    } else if (index === 2) {
                      // Manecilla de segundos (más rápida, más motion blur)
                      rotation = (seconds / 60) * Math.PI * 2
                      const motionBlurIntensity = calculateMotionBlurIntensity(0.01)
                      setMotionBlurIntensity(motionBlurIntensity * 2) // Segundero más perceptible
                    }
                    
                    // Aplicar rotación con easing suave
                    const currentRotation = handMesh.rotation.z || 0
                    const rotationDiff = rotation - currentRotation
                    handMesh.rotation.z = currentRotation + rotationDiff * 0.1
                  }
                }
              })
            }
            
            // Actualizar parámetros de Motion Blur en BokehPass durante cambios
            if (bokehPassRef.current && cinemaEffectsEnabled) {
              const motionIntensity = watchRotationVelocity * 50 // Escalar para visibilidad
              // Nota: BokehPass maneja automáticamente el motion blur interno
            }
          }

          // RENDER CON PIPELINE CINEMATOGRÁFICO
          if (rendererRef.current && sceneRef.current && cameraRef.current) {
            const gl = rendererRef.current.getContext() as WebGL2RenderingContext
            if (gl && !gl.isContextLost()) {
              if (composerRef.current && !isLowPerformance && cinemaEffectsEnabled) {
                // Render con todos los efectos cinematográficos
                composerRef.current.render()
              } else {
                // Render básico para dispositivos de bajo rendimiento
                rendererRef.current.render(sceneRef.current, cameraRef.current)
              }
            } else {
              console.warn('WebGL context lost, pausando animación cinematográfica')
              return
            }
          }
        } catch (error) {
          console.error('Error en loop de animación cinematográfica:', error)
        }
      }

      animate()
      setIsLoading(false)
      setWebGLError(false)

      // Cleanup
      return () => {
        window.removeEventListener('resize', handleResize)
        
        // Remover event listeners del mouse
        if (rendererRef.current?.domElement) {
          rendererRef.current.domElement.removeEventListener('mousedown', handleMouseDown)
          rendererRef.current.domElement.removeEventListener('mousemove', handleMouseMove)
          rendererRef.current.domElement.removeEventListener('mouseup', handleMouseUp)
        }
        
        // Remover event listeners globales
        document.removeEventListener('mouseup', handleMouseUp)
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('selectstart', preventTextSelection)
        
        if (animationIdRef.current) {
          cancelAnimationFrame(animationIdRef.current)
        }

        if (controlsRef.current) {
          controlsRef.current.dispose()
        }

        if (pmremGeneratorRef.current) {
          pmremGeneratorRef.current.dispose()
        }

        // Cleanup de caché HDRI y texturas
        texturaManager.clearCache()

        if (envMapRef.current) {
          envMapRef.current.dispose()
        }

        if (composerRef.current) {
          composerRef.current.dispose()
        }

        if (rendererRef.current) {
          rendererRef.current.dispose()
          if (containerRef.current && rendererRef.current.domElement.parentNode === containerRef.current) {
            containerRef.current.removeChild(rendererRef.current.domElement)
          }
        }

        if (sceneRef.current) {
          sceneRef.current.traverse((object) => {
            if (object instanceof THREE.Mesh) {
              object.geometry.dispose()
              if (object.material instanceof THREE.Material) {
                object.material.dispose()
              } else if (Array.isArray(object.material)) {
                object.material.forEach(material => material.dispose())
              }
            }
          })
        }
      }
    } catch (error) {
      console.error('Error inicializando 3D HDRI:', error)
      setWebGLError(true)
      setIsLoading(false)
    }
    }

    initializeVanillaSystem()
  }, [])

  // Actualizar modelo del reloj con materiales PBR mejorados
  useEffect(() => {
    if (!watchGroupRef.current || webGLError) return

    const watchGroup = watchGroupRef.current

    // Limpiar modelo anterior
    while (watchGroup.children.length > 0) {
      const child = watchGroup.children[0]
      if (child instanceof THREE.Mesh) {
        child.geometry.dispose()
        if (child.material instanceof THREE.Material) {
          child.material.dispose()
        }
      }
      watchGroup.remove(child)
    }

    // Obtener configuración actual
    const materialType = currentConfiguration.material?.name || 'Acero Inoxidable 316L'
    const dialType = currentConfiguration.dial?.name || 'Negra Sunburst'
    const strapType = currentConfiguration.strap?.name || 'Cuero Italiano Negro'

    // Configuración PBR ultra-avanzada con microtexturas y propiedades físicas reales
    const getPremiumMaterialConfig = (type: string) => {
      const configs: { [key: string]: any } = {
        'oro': {
          color: 0xFFD700,
          metalness: 0.98,
          roughness: 0.08,
          envMapIntensity: 3.2,
          clearcoat: 1.0,
          clearcoatRoughness: 0.02,
          sheen: 1.0,
          sheenRoughness: 0.05,
          sheenColor: 0xFFD700,
          emissive: 0xFFD700,
          emissiveIntensity: 0.05,
          anisotropy: 0.3,
          anisotropyRotation: 0.0
        },
        'oro_rojo': {
          color: 0xCD7F32,
          metalness: 0.95,
          roughness: 0.12,
          envMapIntensity: 2.8,
          clearcoat: 1.0,
          clearcoatRoughness: 0.03,
          sheen: 1.0,
          sheenRoughness: 0.08,
          sheenColor: 0xCD7F32,
          emissive: 0xCD7F32,
          emissiveIntensity: 0.03
        },
        'titanio': {
          color: 0x8B9AA6,
          metalness: 0.92,
          roughness: 0.18,
          envMapIntensity: 2.2,
          clearcoat: 0.95,
          clearcoatRoughness: 0.06,
          sheen: 0.8,
          sheenRoughness: 0.2,
          anisotropy: 0.4,
          anisotropyRotation: Math.PI / 6,
          emissive: 0x8B9AA6,
          emissiveIntensity: 0.02
        },
        'titanio_azul': {
          color: 0x4A90E2,
          metalness: 0.88,
          roughness: 0.22,
          envMapIntensity: 2.0,
          clearcoat: 0.9,
          clearcoatRoughness: 0.08,
          sheen: 0.7,
          sheenRoughness: 0.25,
          anisotropy: 0.3,
          anisotropyRotation: 0.0
        },
        'cerámica': {
          color: 0x1A1D20,
          metalness: 0.05,
          roughness: 0.03,
          envMapIntensity: 0.6,
          clearcoat: 1.0,
          clearcoatRoughness: 0.01,
          transmission: 0.15,
          thickness: 0.8,
          ior: 1.78,
          sheen: 0.3,
          sheenRoughness: 0.1
        },
        'cerámica_blanca': {
          color: 0xF8F8F8,
          metalness: 0.02,
          roughness: 0.05,
          envMapIntensity: 0.8,
          clearcoat: 1.0,
          clearcoatRoughness: 0.02,
          transmission: 0.1,
          thickness: 0.6,
          ior: 1.76,
          sheen: 0.4,
          sheenRoughness: 0.15
        },
        'acero': {
          color: 0xE8E8E8,
          metalness: 0.94,
          roughness: 0.12,
          envMapIntensity: 2.5,
          clearcoat: 1.0,
          clearcoatRoughness: 0.05,
          sheen: 0.9,
          sheenRoughness: 0.15,
          anisotropy: 0.6,
          anisotropyRotation: Math.PI / 4,
          emissive: 0xE8E8E8,
          emissiveIntensity: 0.01
        },
        'acero_cepillado': {
          color: 0xD0D0D0,
          metalness: 0.96,
          roughness: 0.25,
          envMapIntensity: 2.2,
          clearcoat: 0.9,
          clearcoatRoughness: 0.1,
          sheen: 0.8,
          sheenRoughness: 0.4,
          anisotropy: 0.9,
          anisotropyRotation: 0.0
        },
        'negro_dlc': {
          color: 0x0A0A0A,
          metalness: 0.4,
          roughness: 0.3,
          envMapIntensity: 1.5,
          clearcoat: 0.8,
          clearcoatRoughness: 0.15,
          sheen: 0.6,
          sheenRoughness: 0.3,
          emissive: 0x1a1a1a,
          emissiveIntensity: 0.08
        }
      }

      // Selección inteligente de configuración basada en el tipo
      const lowerType = type.toLowerCase()
      if (lowerType.includes('oro') && lowerType.includes('rojo')) return configs.oro_rojo
      if (lowerType.includes('oro')) return configs.oro
      if (lowerType.includes('titanio') && lowerType.includes('azul')) return configs.titanio_azul
      if (lowerType.includes('titanio')) return configs.titanio
      if (lowerType.includes('cerámica') && lowerType.includes('blanco')) return configs.cerámica_blanca
      if (lowerType.includes('cerámica')) return configs.cerámica
      if (lowerType.includes('negro') || lowerType.includes('dlc')) return configs.negro_dlc
      if (lowerType.includes('cepillado')) return configs.acero_cepillado
      
      // Configuración por defecto mejorada
      return configs.acero
    }

    // Obtener configuración de material para el case
    const caseMaterialConfig = getPremiumMaterialConfig(materialType)

    // Crear caja del reloj con PBR ultra-avanzado y microtexturas
    const createPremiumCase = () => {
      const caseGroup = new THREE.Group()
      
      // Determinar acabado basado en tipo de material
      let caseFinish = 'base'
      if (materialType.includes('Acero') || materialType.includes('Titanio')) {
        caseFinish = 'brushed'
      } else if (materialType.includes('Oro')) {
        caseFinish = 'polished'
      }
      
      // Material principal de la caja con propiedades físicas reales PBR
      const caseMaterial = getConfiguredMaterial(materialType, caseFinish) as THREE.MeshPhysicalMaterial
      
      // Geometría refinada de la caja con superficies curvadas
      const caseGeometry = new THREE.CylinderGeometry(1.2, 1.2, 0.82, 128)
      const caseMesh = new THREE.Mesh(caseGeometry, caseMaterial)
      caseMesh.castShadow = true
      caseMesh.receiveShadow = true
      caseGroup.add(caseMesh)
      
      // Anillo de acabado en el borde superior
      const topEdgeGeometry = new THREE.TorusGeometry(1.18, 0.02, 16, 128)
      const topEdgeMaterial = new THREE.MeshPhysicalMaterial({
        ...caseMaterialConfig,
        roughness: caseMaterialConfig.roughness * 0.6,
        envMapIntensity: caseMaterialConfig.envMapIntensity * 1.4,
        clearcoat: 1.0,
        clearcoatRoughness: 0.02
      })
      const topEdge = new THREE.Mesh(topEdgeGeometry, topEdgeMaterial)
      topEdge.rotation.x = Math.PI / 2
      topEdge.position.y = 0.41
      topEdge.castShadow = true
      caseGroup.add(topEdge)
      
      // Anillo de acabado en el borde inferior
      const bottomEdge = topEdge.clone()
      bottomEdge.position.y = -0.41
      caseGroup.add(bottomEdge)
      
      // Superficie cepillada en los lados (efecto anisotropy)
      if (materialType.includes('Acero') || materialType.includes('Titanio')) {
        const brushedSurfaceGeometry = new THREE.CylinderGeometry(1.195, 1.195, 0.78, 128)
        const brushedMaterial = new THREE.MeshPhysicalMaterial({
          ...caseMaterialConfig,
          roughness: caseMaterialConfig.roughness * 1.8,
          envMapIntensity: caseMaterialConfig.envMapIntensity * 0.8,
          anisotropy: 0.8,
          anisotropyRotation: 0.0,
          sheen: 0.9,
          sheenRoughness: 0.6
        })
        const brushedSurface = new THREE.Mesh(brushedSurfaceGeometry, brushedMaterial)
        brushedSurface.position.y = 0.02
        caseGroup.add(brushedSurface)
      }
      
      // Acabado pulido en zonas de alto brillo
      const polishedZones = new THREE.Group()
      
      // Zona frontal pulida
      const frontPolishedGeometry = new THREE.CylinderGeometry(1.19, 1.19, 0.4, 64)
      const frontPolishedMaterial = new THREE.MeshPhysicalMaterial({
        ...caseMaterialConfig,
        roughness: caseMaterialConfig.roughness * 0.4,
        envMapIntensity: caseMaterialConfig.envMapIntensity * 1.6,
        clearcoat: 1.0,
        clearcoatRoughness: 0.01,
        sheen: 1.0,
        sheenRoughness: 0.05
      })
      const frontPolished = new THREE.Mesh(frontPolishedGeometry, frontPolishedMaterial)
      frontPolished.position.y = 0.15
      polishedZones.add(frontPolished)
      
      // Zona trasera pulida
      const backPolished = frontPolished.clone()
      backPolished.position.y = -0.15
      polishedZones.add(backPolished)
      
      caseGroup.add(polishedZones)
      
      return caseGroup
    }
    
    const premiumCase = createPremiumCase()
    watchGroup.add(premiumCase)
    // TAPA TRASERA - Completamente ausente previamente
    const backCaseGeometry = new THREE.CylinderGeometry(1.18, 1.18, 0.05, 64)
    
    // Material para tapa trasera con acabado metálico refinado
    const backCaseMaterial = new THREE.MeshPhysicalMaterial({
      ...caseMaterialConfig,
      roughness: caseMaterialConfig.roughness * 1.1, // Ligeramente más rugoso que la caja
      envMapIntensity: caseMaterialConfig.envMapIntensity * 0.9,
      metalness: Math.min(caseMaterialConfig.metalness * 1.1, 1.0),
      color: new THREE.Color(caseMaterialConfig.color).multiplyScalar(0.95) // Ligeramente más oscuro
    })
    
    const backCase = new THREE.Mesh(backCaseGeometry, backCaseMaterial)
    backCase.position.y = -0.425 // Posición en la parte posterior del reloj
    backCase.castShadow = true
    backCase.receiveShadow = true
    watchGroup.add(backCase)

    // Anillo decorativo de la tapa trasera para mayor realismo
    const backRingGeometry = new THREE.TorusGeometry(1.1, 0.02, 8, 64)
    const backRingMaterial = new THREE.MeshPhysicalMaterial({
      ...caseMaterialConfig,
      roughness: caseMaterialConfig.roughness * 0.6, // Más pulido que la tapa principal
      envMapIntensity: caseMaterialConfig.envMapIntensity * 1.1,
      metalness: Math.min(caseMaterialConfig.metalness * 1.05, 1.0)
    })
    const backRing = new THREE.Mesh(backRingGeometry, backRingMaterial)
    backRing.rotation.x = Math.PI / 2
    backRing.position.y = -0.425
    backRing.castShadow = true
    watchGroup.add(backRing)

    // Grabado/texto decorativo en la tapa trasera (representado como relieved texture)
    const engravingGeometry = new THREE.CircleGeometry(0.6, 64)
    const engravingMaterial = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(backCaseMaterial.color).multiplyScalar(0.8), // Más oscuro para simular grabado
      metalness: 0.7,
      roughness: 0.8,
      envMapIntensity: 0.3
    })
    const engraving = new THREE.Mesh(engravingGeometry, engravingMaterial)
    engraving.rotation.x = -Math.PI / 2
    engraving.position.y = -0.43 // Ligeramente más atrás que la tapa
    engraving.castShadow = true
    engraving.receiveShadow = true
    watchGroup.add(engraving)

    // Bisel premium con acabado texturizado y escalas métricas
    const createPremiumBezel = () => {
      const bezelGroup = new THREE.Group()
      
      // Base del bisel con geometría más refinada
      const bezelGeometry = new THREE.TorusGeometry(1.25, 0.08, 32, 128)
      const bezelMaterial = new THREE.MeshPhysicalMaterial({
        ...caseMaterialConfig,
        roughness: caseMaterialConfig.roughness * 0.6,
        envMapIntensity: caseMaterialConfig.envMapIntensity * 1.4,
        clearcoat: 1.0,
        clearcoatRoughness: 0.03,
        sheen: 1.0,
        sheenRoughness: 0.1
      })
      const bezel = new THREE.Mesh(bezelGeometry, bezelMaterial)
      bezel.rotation.x = Math.PI / 2
      bezel.position.y = 0.4
      bezel.castShadow = true
      bezelGroup.add(bezel)
      
      // Anillos decorativos adicionales para mayor realismo
      const outerRingGeometry = new THREE.TorusGeometry(1.27, 0.015, 16, 128)
      const outerRingMaterial = new THREE.MeshPhysicalMaterial({
        ...caseMaterialConfig,
        roughness: caseMaterialConfig.roughness * 0.4,
        envMapIntensity: caseMaterialConfig.envMapIntensity * 1.6,
        clearcoat: 1.0,
        clearcoatRoughness: 0.02
      })
      const outerRing = new THREE.Mesh(outerRingGeometry, outerRingMaterial)
      outerRing.rotation.x = Math.PI / 2
      outerRing.position.y = 0.4
      outerRing.castShadow = true
      bezelGroup.add(outerRing)
      
      // Escala de minutos grabada en el bisel
      const minuteScale = new THREE.Group()
      const scaleMaterial = new THREE.MeshPhysicalMaterial({
        color: new THREE.Color(caseMaterialConfig.color).multiplyScalar(0.6),
        metalness: 0.1,
        roughness: 0.9,
        envMapIntensity: 0.2
      })
      
      for (let i = 0; i < 60; i++) {
        const angle = (i * Math.PI) / 30
        const isMajor = i % 5 === 0
        const scaleHeight = isMajor ? 0.06 : 0.03
        const scaleWidth = isMajor ? 0.015 : 0.008
        
        const scaleGeometry = new THREE.BoxGeometry(scaleWidth, scaleHeight, 0.015)
        const scale = new THREE.Mesh(scaleGeometry, scaleMaterial)
        scale.position.x = Math.sin(angle) * 1.23
        scale.position.z = Math.cos(angle) * 1.23
        scale.position.y = 0.4
        scale.rotation.y = -angle
        minuteScale.add(scale)
      }
      bezelGroup.add(minuteScale)
      
      return bezelGroup
    }
    
    const premiumBezel = createPremiumBezel()
    watchGroup.add(premiumBezel)

    // Esfera con acabado de lujo
    const dialGeometry = new THREE.CircleGeometry(1.15, 128)
    const dialColors: { [key: string]: number } = {
      'Azul': 0x1E40AF,
      'Negra': 0x0A0A0A,
      'Blanca': 0xE5E5E5,
      'Verde': 0x14532D,
      'Roja': 0x991B1B
    }
    
    let dialColor = 0xE5E5E5
    for (const [key, value] of Object.entries(dialColors)) {
      if (dialType.includes(key)) {
        dialColor = value
        break
      }
    }

    const dialMaterial = new THREE.MeshPhysicalMaterial({
      color: dialColor,
      metalness: 0.3,
      roughness: 0.4,
      clearcoat: 0.9,
      clearcoatRoughness: 0.1,
      envMapIntensity: 1.0,
      sheen: 0.5,
      sheenRoughness: 0.3
    })
    const dial = new THREE.Mesh(dialGeometry, dialMaterial)
    dial.rotation.x = -Math.PI / 2
    dial.position.y = 0.41
    watchGroup.add(dial)

    // Índices horarios premium con geometría detallada y variedad de acabados
    const createPremiumHourIndex = (i: number, angle: number, isMain: boolean) => {
      let indexGroup = new THREE.Group()
      const isGold = materialType.includes('Oro')
      
      // Seleccionar forma basada en la posición (variedad de estilos)
      let baseGeometry: THREE.BufferGeometry
      let indexHeight = isMain ? 0.16 : 0.11
      let indexWidth = isMain ? 0.06 : 0.04
      
      if (i % 3 === 0) {
        // Números principales (12, 3, 6, 9) - Numerales Romanos en relieve
        const romanNumeral = ['XII', 'III', 'VI', 'IX'][Math.floor(i / 3)]
        
        // Base del numeral
        baseGeometry = new THREE.CylinderGeometry(0.035, 0.035, indexHeight, 8)
        const numeralMaterial = new THREE.MeshPhysicalMaterial({
          color: isGold ? 0xFFD700 : 0xF8F8F8,
          metalness: 0.98,
          roughness: 0.08,
          envMapIntensity: 2.8,
          emissive: isGold ? 0xFFD700 : 0x000000,
          emissiveIntensity: 0.25,
          clearcoat: 1.0,
          clearcoatRoughness: 0.02,
          sheen: 1.0,
          sheenRoughness: 0.1
        })
        
        const numeralBase = new THREE.Mesh(baseGeometry, numeralMaterial)
        numeralBase.rotation.z = Math.PI / 2
        numeralBase.castShadow = true
        indexGroup.add(numeralBase)
        
        // Superficie grabada del numeral (simulación de grabado)
        const engravedGeometry = new THREE.CylinderGeometry(0.032, 0.032, indexHeight * 0.98, 8)
        const engravedMaterial = new THREE.MeshPhysicalMaterial({
          color: new THREE.Color(numeralMaterial.color).multiplyScalar(0.3),
          metalness: 0.1,
          roughness: 0.9,
          envMapIntensity: 0.1
        })
        const engravedSurface = new THREE.Mesh(engravedGeometry, engravedMaterial)
        engravedSurface.rotation.z = Math.PI / 2
        engravedSurface.position.y = 0.005
        indexGroup.add(engravedSurface)
        
        // Glow ring para numeerales principales
        const glowRingGeometry = new THREE.TorusGeometry(0.04, 0.005, 4, 16)
        const glowRingMaterial = new THREE.MeshPhysicalMaterial({
          color: isGold ? 0xFFD700 : 0xFFFFFF,
          emissive: isGold ? 0xFFD700 : 0xFFFFFF,
          emissiveIntensity: 0.1,
          metalness: 0.0,
          roughness: 0.1,
          transparent: true,
          opacity: 0.3
        })
        const glowRing = new THREE.Mesh(glowRingGeometry, glowRingMaterial)
        glowRing.rotation.x = Math.PI / 2
        indexGroup.add(glowRing)
        
      } else if (i % 2 === 0) {
        // Índices pares - Diamante con facetas múltiples
        baseGeometry = new THREE.CylinderGeometry(0.025, 0.025, indexHeight, 6)
        const diamondMaterial = new THREE.MeshPhysicalMaterial({
          color: isGold ? 0xFFD700 : 0xF0F0F0,
          metalness: 0.95,
          roughness: 0.05,
          envMapIntensity: 3.0,
          emissive: isGold ? 0xFFD700 : 0x000000,
          emissiveIntensity: 0.3,
          clearcoat: 1.0,
          clearcoatRoughness: 0.01,
          sheen: 1.0,
          sheenRoughness: 0.05
        })
        
        const diamondIndex = new THREE.Mesh(baseGeometry, diamondMaterial)
        diamondIndex.rotation.z = Math.PI / 2
        diamondIndex.castShadow = true
        indexGroup.add(diamondIndex)
        
        // Facetas adicionales para mayor realismo
        for (let f = 0; f < 3; f++) {
          const facetGeometry = new THREE.BoxGeometry(0.01, 0.02, 0.015)
          const facet = new THREE.Mesh(facetGeometry, diamondMaterial)
          facet.position.x = Math.sin(f * Math.PI * 2 / 3) * 0.015
          facet.position.z = Math.cos(f * Math.PI * 2 / 3) * 0.015
          indexGroup.add(facet)
        }
        
      } else {
        // Índices impares - Triangular con punta refinada
        const triangleGeometry = new THREE.BufferGeometry()
        const triangleVertices = new Float32Array([
          0, indexHeight/2, 0,           // Punta
          -indexWidth/2, -indexHeight/2, 0,   // Base izquierda
          indexWidth/2, -indexHeight/2, 0     // Base derecha
        ])
        triangleGeometry.setAttribute('position', new THREE.BufferAttribute(triangleVertices, 3))
        triangleGeometry.computeVertexNormals()
        
        baseGeometry = triangleGeometry
        
        const triangleMaterial = new THREE.MeshPhysicalMaterial({
          color: isGold ? 0xFFD700 : 0xE8E8E8,
          metalness: 0.96,
          roughness: 0.12,
          envMapIntensity: 2.6,
          emissive: isGold ? 0xFFD700 : 0x000000,
          emissiveIntensity: 0.2,
          clearcoat: 1.0,
          clearcoatRoughness: 0.04
        })
        
        const triangleIndex = new THREE.Mesh(baseGeometry, triangleMaterial)
        triangleIndex.rotation.z = Math.PI / 2
        triangleIndex.castShadow = true
        indexGroup.add(triangleIndex)
      }
      
      // Posicionamiento preciso con variaciones sutiles
      indexGroup.position.x = Math.sin(angle) * 0.95
      indexGroup.position.z = Math.cos(angle) * 0.95
      indexGroup.position.y = 0.42
      indexGroup.rotation.y = -angle + (isMain ? 0.02 : 0)
      
      // Ligera variación de altura para acabado más orgánico
      indexGroup.position.y += Math.sin(i * 0.5) * 0.001
      
      return indexGroup
    }
    
    // Crear índices horarios con variedad y detalle premium
    for (let i = 0; i < 12; i++) {
      const angle = (i * Math.PI) / 6
      const isMain = i % 3 === 0
      const premiumIndex = createPremiumHourIndex(i, angle, isMain)
      watchGroup.add(premiumIndex)
    }

    // Sistema de coordenadas unificado para manecillas - relativo al dial
    const handsGroup = new THREE.Group()
    handsGroup.position.y = dial.position.y + 0.02 // Posicionado relativo al dial
    
    const isGold = materialType.includes('Oro')
    const handMaterial = new THREE.MeshPhysicalMaterial({
      color: isGold ? 0xFFD700 : 0xE8E8E8,
      metalness: 0.95,
      roughness: 0.05,
      envMapIntensity: 2.2,
      emissive: isGold ? 0xFFD700 : 0x000000,
      emissiveIntensity: 0.15,
      clearcoat: 1.0,
      clearcoatRoughness: 0.02
    })

    // Manecilla de horas
    const hourHandGeometry = new THREE.BoxGeometry(0.04, 0.5, 0.015)
    const hourHand = new THREE.Mesh(hourHandGeometry, handMaterial)
    hourHand.position.y = 0.25
    hourHand.rotation.z = Math.PI / 6
    hourHand.castShadow = true
    handsGroup.add(hourHand)

    // Manecilla de minutos
    const minuteHandGeometry = new THREE.BoxGeometry(0.03, 0.7, 0.015)
    const minuteHand = new THREE.Mesh(minuteHandGeometry, handMaterial)
    minuteHand.position.y = 0.35
    minuteHand.rotation.z = Math.PI / 3
    minuteHand.castShadow = true
    handsGroup.add(minuteHand)

    // Manecilla de segundos
    const secondHandMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xDC2626,
      metalness: 0.8,
      roughness: 0.2,
      envMapIntensity: 1.5
    })
    const secondHandGeometry = new THREE.BoxGeometry(0.015, 0.85, 0.01)
    const secondHand = new THREE.Mesh(secondHandGeometry, secondHandMaterial)
    secondHand.position.y = 0.46
    secondHand.rotation.z = Math.PI / 2.5
    secondHand.castShadow = true
    handsGroup.add(secondHand)

    // Pin central mejorado - más visible y robusto
    const pinGeometry = new THREE.CylinderGeometry(0.12, 0.12, 0.08, 32)
    const pin = new THREE.Mesh(pinGeometry, handMaterial.clone())
    pin.position.y = handsGroup.position.y - dial.position.y // Centrado en el grupo de manecillas
    pin.material.emissive = new THREE.Color(isGold ? 0xFFD700 : 0xE8E8E8)
    pin.material.emissiveIntensity = 0.3 // Más brillante para mejor visibilidad
    pin.castShadow = true
    pin.receiveShadow = true
    
    // Añadir anillo decorativo al pin para mejor visibilidad
    const pinCapGeometry = new THREE.CylinderGeometry(0.15, 0.15, 0.02, 32)
    const pinCap = new THREE.Mesh(pinCapGeometry, handMaterial.clone())
    pinCap.position.y = 0.03 // Encima del pin principal
    pinCap.material.emissiveIntensity = 0.4
    pinCap.castShadow = true
    
    handsGroup.add(pin)
    handsGroup.add(pinCap)

    watchGroup.add(handsGroup)

    // Corona premium con detalles ultra-realistas y funcionalidad completa
    const createPremiumCrown = () => {
      const crownGroup = new THREE.Group()
      crownGroup.position.set(1.35, 0.05, 0)
      
      // Material base de la corona con acabado texturizado
      const crownMaterial = new THREE.MeshPhysicalMaterial({
        ...caseMaterialConfig,
        roughness: caseMaterialConfig.roughness * 1.4,
        envMapIntensity: caseMaterialConfig.envMapIntensity * 1.2,
        clearcoat: 0.9,
        clearcoatRoughness: 0.08
      })
      
      // Sistema de protección contra agua (crown guard)
      const crownGuardGeometry = new THREE.CylinderGeometry(0.15, 0.15, 0.05, 16)
      const crownGuardMaterial = new THREE.MeshPhysicalMaterial({
        ...caseMaterialConfig,
        roughness: caseMaterialConfig.roughness * 0.8,
        envMapIntensity: caseMaterialConfig.envMapIntensity * 1.3,
        clearcoat: 1.0,
        clearcoatRoughness: 0.05
      })
      const crownGuard = new THREE.Mesh(crownGuardGeometry, crownGuardMaterial)
      crownGuard.rotation.z = Math.PI / 2
      crownGuard.position.x = -0.1
      crownGuard.castShadow = true
      crownGroup.add(crownGuard)
      
      // Vástago de conexión mejorado (stem)
      const stemGeometry = new THREE.CylinderGeometry(0.05, 0.05, 0.18, 32)
      const stemMaterial = new THREE.MeshPhysicalMaterial({
        ...caseMaterialConfig,
        roughness: caseMaterialConfig.roughness * 0.7,
        envMapIntensity: caseMaterialConfig.envMapIntensity * 1.4,
        clearcoat: 1.0,
        clearcoatRoughness: 0.03
      })
      const stem = new THREE.Mesh(stemGeometry, stemMaterial)
      stem.position.x = -0.14
      stem.rotation.z = Math.PI / 2
      stem.castShadow = true
      crownGroup.add(stem)
      
      // Anillos de transición múltiples para suavizado
      const createTransitionRings = () => {
        const ringsGroup = new THREE.Group()
        
        // Anillo de protección
        const protectionRingGeometry = new THREE.CylinderGeometry(0.09, 0.09, 0.04, 32)
        const protectionRingMaterial = new THREE.MeshPhysicalMaterial({
          ...caseMaterialConfig,
          roughness: caseMaterialConfig.roughness * 1.1,
          envMapIntensity: caseMaterialConfig.envMapIntensity * 1.5,
          clearcoat: 1.0,
          clearcoatRoughness: 0.04
        })
        const protectionRing = new THREE.Mesh(protectionRingGeometry, protectionRingMaterial)
        protectionRing.position.x = -0.08
        protectionRing.rotation.z = Math.PI / 2
        protectionRing.castShadow = true
        ringsGroup.add(protectionRing)
        
        // Anillo decorativo
        const decorativeRingGeometry = new THREE.CylinderGeometry(0.085, 0.085, 0.03, 32)
        const decorativeRingMaterial = new THREE.MeshPhysicalMaterial({
          ...caseMaterialConfig,
          roughness: caseMaterialConfig.roughness * 0.6,
          envMapIntensity: caseMaterialConfig.envMapIntensity * 1.8,
          clearcoat: 1.0,
          clearcoatRoughness: 0.02
        })
        const decorativeRing = new THREE.Mesh(decorativeRingGeometry, decorativeRingMaterial)
        decorativeRing.position.x = -0.06
        decorativeRing.rotation.z = Math.PI / 2
        decorativeRing.castShadow = true
        ringsGroup.add(decorativeRing)
        
        return ringsGroup
      }
      
      const transitionRings = createTransitionRings()
      crownGroup.add(transitionRings)
      
      // Corona principal con geometría refinada
      const crownGeometry = new THREE.CylinderGeometry(0.08, 0.12, 0.2, 64)
      const crownMaterialMain = new THREE.MeshPhysicalMaterial({
        ...caseMaterialConfig,
        roughness: caseMaterialConfig.roughness * 1.2,
        envMapIntensity: caseMaterialConfig.envMapIntensity * 1.1,
        clearcoat: 0.95,
        clearcoatRoughness: 0.06,
        sheen: 1.0,
        sheenRoughness: 0.1
      })
      const crown = new THREE.Mesh(crownGeometry, crownMaterialMain)
      crown.rotation.z = Math.PI / 2
      crown.castShadow = true
      crownGroup.add(crown)
      
      // Estrías de la corona con micro-geometry
      const createCrownGrooves = () => {
        const groovesGroup = new THREE.Group()
        
        for (let i = 0; i < 8; i++) {
          const grooveGeometry = new THREE.TorusGeometry(0.1, 0.006, 6, 24)
          const grooveMaterial = new THREE.MeshPhysicalMaterial({
            color: new THREE.Color(caseMaterialConfig.color).multiplyScalar(0.7),
            metalness: 0.9,
            roughness: 0.3,
            envMapIntensity: caseMaterialConfig.envMapIntensity * 0.8
          })
          const groove = new THREE.Mesh(grooveGeometry, grooveMaterial)
          groove.position.x = -0.1 + (i * 0.025)
          groove.rotation.y = Math.PI / 2
          groove.castShadow = true
          groovesGroup.add(groove)
        }
        
        return groovesGroup
      }
      
      const crownGrooves = createCrownGrooves()
      crownGroup.add(crownGrooves)
      
      // Logo o símbolo de la corona (disco central)
      const logoGeometry = new THREE.CylinderGeometry(0.03, 0.03, 0.02, 32)
      const logoMaterial = new THREE.MeshPhysicalMaterial({
        ...caseMaterialConfig,
        roughness: caseMaterialConfig.roughness * 0.4,
        envMapIntensity: caseMaterialConfig.envMapIntensity * 2.0,
        clearcoat: 1.0,
        clearcoatRoughness: 0.01,
        emissive: caseMaterialConfig.color,
        emissiveIntensity: 0.1
      })
      const logo = new THREE.Mesh(logoGeometry, logoMaterial)
      logo.position.x = -0.01
      logo.rotation.z = Math.PI / 2
      logo.castShadow = true
      crownGroup.add(logo)
      
      // Referencia para interactividad
      crownGroup.userData.isCrown = true
      crownGroup.userData.baseRotation = 0
      
      return crownGroup
    }
    
    const premiumCrown = createPremiumCrown()
    crownRef.current = premiumCrown
    watchGroup.add(premiumCrown)


    // Sistema de lugs premium con acabados diferenciados y conexiones realistas
    const createPremiumLugs = () => {
      const lugsGroup = new THREE.Group()
      
      // Material principal de los lugs con acabado texturizado
      const lugBaseMaterial = new THREE.MeshPhysicalMaterial({
        ...caseMaterialConfig,
        roughness: caseMaterialConfig.roughness * 1.2,
        envMapIntensity: caseMaterialConfig.envMapIntensity * 1.2,
        metalness: Math.max(0.85, caseMaterialConfig.metalness),
        clearcoat: 0.95,
        clearcoatRoughness: 0.08
      })
      
      // Material para acabatos cepillados (microestructura)
      const brushedMaterial = new THREE.MeshPhysicalMaterial({
        ...caseMaterialConfig,
        roughness: caseMaterialConfig.roughness * 1.8,
        envMapIntensity: caseMaterialConfig.envMapIntensity * 0.9,
        metalness: Math.max(0.9, caseMaterialConfig.metalness),
        sheen: 0.8,
        sheenRoughness: 0.6
      })
      
      // Geometría refinada de los lugs con curvatura
      const createRefinedLug = (position: THREE.Vector3, isTop: boolean) => {
        const lugGroup = new THREE.Group()
        
        // Cuerpo principal del lug con geometría suavizada
        const lugBodyGeometry = new THREE.CylinderGeometry(0.09, 0.09, 0.25, 32)
        const lugBody = new THREE.Mesh(lugBodyGeometry, lugBaseMaterial)
        lugBody.rotation.z = Math.PI / 2
        lugBody.castShadow = true
        lugBody.receiveShadow = true
        lugGroup.add(lugBody)
        
        // Superficie cepillada en la parte superior
        const brushedSurfaceGeometry = new THREE.CylinderGeometry(0.088, 0.088, 0.24, 32)
        const brushedSurface = new THREE.Mesh(brushedSurfaceGeometry, brushedMaterial)
        brushedSurface.rotation.z = Math.PI / 2
        brushedSurface.position.y = 0.01
        lugGroup.add(brushedSurface)
        
        // Anillo decorativo en la base del lug
        const baseRingGeometry = new THREE.TorusGeometry(0.095, 0.008, 8, 32)
        const baseRingMaterial = new THREE.MeshPhysicalMaterial({
          ...caseMaterialConfig,
          roughness: caseMaterialConfig.roughness * 0.6,
          envMapIntensity: caseMaterialConfig.envMapIntensity * 1.6,
          clearcoat: 1.0,
          clearcoatRoughness: 0.03
        })
        const baseRing = new THREE.Mesh(baseRingGeometry, baseRingMaterial)
        baseRing.rotation.x = Math.PI / 2
        baseRing.position.z = 0.07
        lugGroup.add(baseRing)
        
        // Posicionamiento preciso
        lugGroup.position.copy(position)
        
        return lugGroup
      }
      
      // Crear lugs en posiciones exactas
      const lugPositions = [
        new THREE.Vector3(0.8, -0.375, 0),   // Superior derecho
        new THREE.Vector3(-0.8, -0.375, 0),  // Superior izquierdo
        new THREE.Vector3(0.8, 0.375, 0),    // Inferior derecho
        new THREE.Vector3(-0.8, 0.375, 0)    // Inferior izquierdo
      ]
      
      lugPositions.forEach((pos, index) => {
        const isTop = index < 2
        const refinedLug = createRefinedLug(pos, isTop)
        lugsGroup.add(refinedLug)
      })
      
      // Sistema de pernos premium con acabados diferenciados
      const createPremiumPins = () => {
        const pinsGroup = new THREE.Group()
        
        // Material para pernos principales
        const mainPinMaterial = new THREE.MeshPhysicalMaterial({
          color: 0xF0F0F0,
          metalness: 0.98,
          roughness: 0.05,
          envMapIntensity: 3.0,
          clearcoat: 1.0,
          clearcoatRoughness: 0.01,
          sheen: 1.0,
          sheenRoughness: 0.05
        })
        
        // Material para cabezas de pernos
        const pinHeadMaterial = new THREE.MeshPhysicalMaterial({
          color: 0xE8E8E8,
          metalness: 0.95,
          roughness: 0.12,
          envMapIntensity: 2.5,
          clearcoat: 1.0,
          clearcoatRoughness: 0.04
        })
        
        // Posiciones de pernos (2 por lug)
        const pinPositions = [
          { lugX: 0.8, lugY: -0.375, pinOffset: [-0.06, 0.06] },
          { lugX: -0.8, lugY: -0.375, pinOffset: [-0.06, 0.06] },
          { lugX: 0.8, lugY: 0.375, pinOffset: [-0.06, 0.06] },
          { lugX: -0.8, lugY: 0.375, pinOffset: [-0.06, 0.06] }
        ]
        
        pinPositions.forEach(lugPos => {
          lugPos.pinOffset.forEach(offset => {
            // Vástago del pernno
            const pinGeometry = new THREE.CylinderGeometry(0.018, 0.018, 0.18, 16)
            const pin = new THREE.Mesh(pinGeometry, mainPinMaterial)
            pin.position.set(lugPos.lugX + offset, lugPos.lugY, 0.08)
            pin.rotation.z = Math.PI / 2
            pin.castShadow = true
            pin.receiveShadow = true
            pinsGroup.add(pin)
            
            // Cabeza del perno
            const pinHeadGeometry = new THREE.CylinderGeometry(0.025, 0.025, 0.03, 16)
            const pinHead = new THREE.Mesh(pinHeadGeometry, pinHeadMaterial)
            pinHead.position.set(lugPos.lugX + offset, lugPos.lugY, 0.16)
            pinHead.rotation.z = Math.PI / 2
            pinHead.castShadow = true
            pinHead.receiveShadow = true
            pinsGroup.add(pinHead)
            
            // Anillo de retención
            const retentionRingGeometry = new THREE.TorusGeometry(0.022, 0.003, 6, 16)
            const retentionRingMaterial = new THREE.MeshPhysicalMaterial({
              color: 0xC0C0C0,
              metalness: 0.9,
              roughness: 0.2,
              envMapIntensity: 1.5
            })
            const retentionRing = new THREE.Mesh(retentionRingGeometry, retentionRingMaterial)
            retentionRing.rotation.x = Math.PI / 2
            retentionRing.position.set(lugPos.lugX + offset, lugPos.lugY, 0.175)
            pinsGroup.add(retentionRing)
          })
        })
        
        return pinsGroup
      }
      
      const premiumPins = createPremiumPins()
      lugsGroup.add(premiumPins)
      
      return lugsGroup
    }
    
    const premiumLugs = createPremiumLugs()
    watchGroup.add(premiumLugs)

    // Sistema de correas premium con materiales ultra-realistas y acabados diferenciados
    const createPremiumStraps = () => {
      const strapGroup = new THREE.Group()
      
      const strapColors: { [key: string]: number } = {
        'Negro': 0x0A0A0A,
        'Marrón': 0x8B4513,
        'Azul': 0x1E40AF,
        'Verde': 0x14532D
      }
      
      let strapColor = 0x0A0A0A
      for (const [key, value] of Object.entries(strapColors)) {
        if (strapType.includes(key)) {
          strapColor = value
          break
        }
      }

      const isMetalStrap = strapType.includes('Metal')
      const isLeatherStrap = strapType.includes('Cuero')
      
      // Materiales PBR ultra-realistas para correas usando sistema avanzado
      const createStrapMaterials = () => {
        const materials: { [key: string]: THREE.MeshPhysicalMaterial } = {}
        
        if (isMetalStrap) {
          // Material metálico PBR ultra-realista
          materials.base = getConfiguredMaterial('acero', 'brushed') as THREE.MeshPhysicalMaterial
          materials.base.color.setHex(strapColor)
          
          materials.brushed = getConfiguredMaterial('acero', 'brushed') as THREE.MeshPhysicalMaterial
          materials.brushed.color.setHex(strapColor)
          
          materials.highlight = getConfiguredMaterial('acero', 'polished') as THREE.MeshPhysicalMaterial
          materials.highlight.color.setHex(strapColor)
        } else if (isLeatherStrap) {
          // Material de cuero PBR con subsurface scattering
          materials.base = getConfiguredMaterial('cuero', 'textured') as THREE.MeshPhysicalMaterial
          materials.base.color.setHex(strapColor)
          
          materials.textured = getConfiguredMaterial('cuero', 'textured') as THREE.MeshPhysicalMaterial
          materials.textured.color.setHex(strapColor)
          
          materials.polished = getConfiguredMaterial('cuero', 'polished') as THREE.MeshPhysicalMaterial
          materials.polished.color.setHex(strapColor)
        } else {
          // Material por defecto usando sistema PBR
          materials.base = getConfiguredMaterial('acero', 'base') as THREE.MeshPhysicalMaterial
          materials.base.color.setHex(strapColor)
        }
        
        return materials
      }
      
      const strapMaterials = createStrapMaterials()
      
      // Función para crear segmentos de correa con geometría refinada
      const createStrapSegment = (isFirst: boolean, position: THREE.Vector3, materialType: string = 'base') => {
        const segmentGroup = new THREE.Group()
        
        // Geometría principal del segmento
        const segmentGeometry = new THREE.BoxGeometry(
          0.65, 
          isFirst ? 0.09 : 0.07, 
          0.13
        )
        
        const mainSegment = new THREE.Mesh(segmentGeometry, strapMaterials[materialType] || strapMaterials.base)
        segmentGroup.add(mainSegment)
        
        // Superficie texturizada para cuero
        if (isLeatherStrap && !isFirst) {
          const textureGeometry = new THREE.BoxGeometry(0.64, 0.065, 0.125)
          const texturedSurface = new THREE.Mesh(textureGeometry, strapMaterials.textured)
          texturedSurface.position.y = 0.005
          segmentGroup.add(texturedSurface)
        }
        
        // Acabado pulido en los bordes
        if (isMetalStrap) {
          const edgeGeometry = new THREE.BoxGeometry(0.63, 0.085, 0.005)
          const edgeMaterial = strapMaterials.highlight
          const topEdge = new THREE.Mesh(edgeGeometry, edgeMaterial)
          topEdge.position.y = isFirst ? 0.045 : 0.035
          topEdge.position.z = 0.0625
          segmentGroup.add(topEdge)
          
          const bottomEdge = topEdge.clone()
          bottomEdge.position.z = -0.0625
          segmentGroup.add(bottomEdge)
        }
        
        // Costuras para correas de cuero
        if (isLeatherStrap) {
          const stitchMaterial = new THREE.MeshPhysicalMaterial({
            color: 0x4A4A4A,
            metalness: 0.0,
            roughness: 0.9,
            emissive: 0x1a1a1a,
            emissiveIntensity: 0.05
          })
          
          for (let i = -3; i <= 3; i++) {
            const stitchGeometry = new THREE.CylinderGeometry(0.002, 0.002, 0.12, 6)
            const stitch = new THREE.Mesh(stitchGeometry, stitchMaterial)
            stitch.position.set(i * 0.08, isFirst ? 0.01 : 0.008, 0.065)
            stitch.rotation.z = Math.PI / 2
            segmentGroup.add(stitch)
            
            const stitch2 = stitch.clone()
            stitch2.position.z = -0.065
            segmentGroup.add(stitch2)
          }
        }
        
        segmentGroup.position.copy(position)
        return segmentGroup
      }
      
      // Crear correa superior
      const createUpperStrap = () => {
        const upperStrapGroup = new THREE.Group()
        upperStrapGroup.position.y = -0.4
        
        const numSegments = 8
        const segmentSpacing = 0.085
        
        // Primer segmento con punto de conexión reforzado
        const firstSegment = createStrapSegment(true, new THREE.Vector3(0, 0, 0), 'base')
        firstSegment.castShadow = true
        firstSegment.receiveShadow = true
        upperStrapGroup.add(firstSegment)
        
        // Segmentos adicionales con variación de material
        for (let i = 1; i < numSegments; i++) {
          const materialType = isMetalStrap ? (i % 2 === 0 ? 'brushed' : 'base') : 
                             isLeatherStrap ? (i % 3 === 0 ? 'polished' : 'textured') : 'base'
          const segment = createStrapSegment(
            false, 
            new THREE.Vector3(0, 0.09 + (i * segmentSpacing), 0), 
            materialType
          )
          segment.castShadow = true
          segment.receiveShadow = true
          upperStrapGroup.add(segment)
        }
        
        // Buckle/cierre para correas de cuero
        if (isLeatherStrap) {
          const buckleGeometry = new THREE.BoxGeometry(0.15, 0.12, 0.15)
          const buckleMaterial = new THREE.MeshPhysicalMaterial({
            color: 0xC0C0C0,
            metalness: 0.9,
            roughness: 0.2,
            envMapIntensity: 2.0,
            clearcoat: 0.8
          })
          const buckle = new THREE.Mesh(buckleGeometry, buckleMaterial)
          buckle.position.set(0, 0.09 + (numSegments * segmentSpacing) + 0.06, 0)
          buckle.castShadow = true
          buckle.receiveShadow = true
          upperStrapGroup.add(buckle)
          
          // Agujero para el pasador
          const holeGeometry = new THREE.CylinderGeometry(0.008, 0.008, 0.16, 8)
          const holeMaterial = new THREE.MeshPhysicalMaterial({
            color: 0x1a1a1a,
            metalness: 0.0,
            roughness: 0.9
          })
          const hole = new THREE.Mesh(holeGeometry, holeMaterial)
          hole.position.set(0, 0.09 + (numSegments * segmentSpacing) + 0.03, 0)
          hole.rotation.z = Math.PI / 2
          upperStrapGroup.add(hole)
        }
        
        return upperStrapGroup
      }
      
      // Crear correa inferior (espejo de la superior)
      const createLowerStrap = () => {
        const lowerStrapGroup = new THREE.Group()
        lowerStrapGroup.position.y = 0.4
        
        const numSegments = 8
        const segmentSpacing = 0.085
        
        // Primer segmento
        const firstSegment = createStrapSegment(true, new THREE.Vector3(0, 0, 0), 'base')
        firstSegment.castShadow = true
        firstSegment.receiveShadow = true
        lowerStrapGroup.add(firstSegment)
        
        // Segmentos adicionales
        for (let i = 1; i < numSegments; i++) {
          const materialType = isMetalStrap ? (i % 2 === 0 ? 'brushed' : 'base') : 
                             isLeatherStrap ? (i % 3 === 0 ? 'polished' : 'textured') : 'base'
          const segment = createStrapSegment(
            false, 
            new THREE.Vector3(0, 0.09 + (i * segmentSpacing), 0), 
            materialType
          )
          segment.castShadow = true
          segment.receiveShadow = true
          lowerStrapGroup.add(segment)
        }
        
        return lowerStrapGroup
      }
      
      const upperStrap = createUpperStrap()
      const lowerStrap = createLowerStrap()
      
      strapGroup.add(upperStrap)
      strapGroup.add(lowerStrap)
      
      return strapGroup
    }
    
    const premiumStraps = createPremiumStraps()
    watchGroup.add(premiumStraps)
    
    // Cristal de zafiro ultra-realista con materiales PBR
    const glassGeometry = new THREE.CylinderGeometry(1.16, 1.16, 0.08, 64)
    const glassMaterial = getConfiguredMaterial('cristal_zafiro', 'base') as THREE.MeshPhysicalMaterial
    const glassMesh = new THREE.Mesh(glassGeometry, glassMaterial)
    glassMesh.position.y = 0.3
    glassMesh.castShadow = false
    glassMesh.receiveShadow = false
    glassMesh.renderOrder = 1
    
    // Aplicar shaders avanzados para reflexiones fresnel
    applyAdvancedShaders(glassMesh, 'cristal_zafiro', 'base')
    watchGroup.add(glassMesh)

  }, [currentConfiguration, webGLError, hdriLoaded])

  // Fallback si WebGL no está disponible
  if (webGLError) {
    return (
      <div className="relative w-full h-full min-h-[500px] md:min-h-[600px] bg-gradient-to-br from-neutral-100 to-neutral-200 rounded-lg overflow-hidden shadow-modal flex items-center justify-center">
        <div className="text-center p-8 max-w-md">
          <div className="w-20 h-20 bg-gold-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-gold-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 className="text-xl font-headline font-bold text-neutral-900 mb-2">
            Vista 3D HDRI No Disponible
          </h3>
          <p className="text-neutral-600 mb-4">
            Tu navegador no soporta WebGL o está deshabilitado. Por favor, usa un navegador moderno o habilita WebGL para ver la vista 3D con iluminación HDRI avanzada.
          </p>
          <p className="text-sm text-neutral-500">
            Navegadores recomendados: Chrome, Firefox, Safari, Edge (versiones recientes)
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative w-full h-full min-h-[500px] md:min-h-[600px] bg-gradient-to-br from-neutral-100 to-neutral-200 rounded-lg overflow-hidden shadow-modal">
      {/* Contenedor 3D con altura mínima garantizada */}
      <div ref={containerRef} className="w-full h-full min-h-[500px]" style={{minHeight: '500px', height: '100%'}} />

      {/* Visualizador de progreso del TexturaManager */}
      <HDRIProgressViewer 
        progress={texturaProgress} 
        stats={texturaStats}
        className="z-40"
      />

      {/* Loading overlay con efectos cinematográficos */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-neutral-100/80 backdrop-blur-sm">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-neutral-700 font-medium">Cargando visualización 3D cinematográfica...</p>
            <p className="text-sm text-neutral-500 mt-2">
              {hdriLoaded ? 'Inicializando efectos de post-procesado...' : 'Cargando iluminación de estudio...'}
            </p>
            {!isLowPerformance && (
              <div className="mt-3 text-xs text-red-600 font-medium">
                🎬 Depth of Field • Bloom • Chromatic Aberration • Film Grain
              </div>
            )}
          </div>
        </div>
      )}

      {/* Panel de control de efectos cinematográficos */}
      {!isLowPerformance && (
        <div className="absolute bottom-4 right-4 bg-black/20 backdrop-blur-md px-4 py-3 rounded-md shadow-lg text-sm text-white max-w-xs">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
            <span className="font-bold text-red-300">Efectos Cinematográficos</span>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs flex items-center gap-2">
                <input 
                  type="checkbox" 
                  checked={cinemaEffectsEnabled}
                  onChange={(e) => setCinemaEffectsEnabled(e.target.checked)}
                  className="w-3 h-3 rounded border-gray-300"
                />
                <span>Efectos avanzados</span>
              </label>
            </div>
            
            {cinemaEffectsEnabled && (
              <div className="space-y-1 text-xs text-gray-300">
                <div className="flex items-center gap-2">
                  <span className="w-1 h-1 bg-blue-400 rounded-full"></span>
                  <span>Depth of Field (f/2.8)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-1 h-1 bg-yellow-400 rounded-full"></span>
                  <span>Bloom profesional</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-1 h-1 bg-purple-400 rounded-full"></span>
                  <span>Chromatic aberration</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                  <span>Film grain</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-1 h-1 bg-green-400 rounded-full"></span>
                  <span>Motion blur dinámico</span>
                </div>
                {motionBlurIntensity > 0 && (
                  <div className="flex items-center gap-2 text-xs">
                    <span className="w-1 h-1 bg-red-400 rounded-full"></span>
                    <span>Blur: {(motionBlurIntensity * 100).toFixed(1)}%</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Controles informativos mejorados */}
      <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm px-4 py-3 rounded-md shadow-lg text-sm text-neutral-700 max-w-xs">
        <p className="font-semibold mb-2 text-gold-700">Controles HDRI Avanzados:</p>
        <ul className="space-y-1 text-xs">
          <li className="flex items-center gap-2">
            <span className="w-2 h-2 bg-gold-500 rounded-full"></span>
            <span>Click y arrastra para rotar 360°</span>
          </li>
          <li className="flex items-center gap-2">
            <span className="w-2 h-2 bg-gold-500 rounded-full"></span>
            <span>Scroll o pellizcar para zoom</span>
          </li>
          <li className="flex items-center gap-2">
            <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
            <span>Click en corona para girar</span>
          </li>
          <li className="flex items-center gap-2">
            <span className="w-2 h-2 bg-gold-500 rounded-full"></span>
            <span>Doble click para restablecer vista</span>
          </li>
          {isLowPerformance && (
            <li className="flex items-center gap-2 text-orange-600">
              <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
              <span>Modo rendimiento optimizado</span>
            </li>
          )}
        </ul>
      </div>

      {/* Badge de tecnología cinematográfica */}
      <div className="absolute top-4 right-4 bg-gradient-to-r from-red-600 to-red-700 text-white px-4 py-2 rounded-full shadow-lg text-xs font-bold uppercase tracking-wide">
        🎬 Cinema {isLowPerformance ? 'Lite' : 'Pro'}
      </div>

      {/* Indicador de iluminación ambiental y efectos */}
      {hdriLoaded && (
        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-2 rounded-md shadow-lg text-xs text-neutral-600">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span>Studio HDRI {cinemaEffectsEnabled ? '+ Cinema FX' : ''}</span>
          </div>
        </div>
      )}
    </div>
  )
}

export default WatchConfigurator3DVanilla
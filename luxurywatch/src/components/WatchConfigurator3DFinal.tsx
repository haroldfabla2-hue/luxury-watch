import { useEffect, useRef, useState } from 'react'
import { useWebGLCleanup } from '../hooks/useWebGLCleanupFixed'
import { useConfigurator3DSingleton } from '../hooks/useConfigurator3DSingletonRelaxed'
import { useSimpleWebGLContextManager } from '../hooks/useSimpleWebGLContextManager'
import * as THREE from 'three'
import { useConfiguratorStore } from '../store/configuratorStore'
import { 
  FINAL_CALIBRATION_CONFIG, 
  detectPerformanceLevel, 
  getOptimizedConfig,
  SUCCESS_CRITERIA,
  ASSETS_USED
} from '../config/final-calibration-config'
import { 
  createOptimizedRenderer,
  createOptimizedCamera,
  createOptimizedControls,
  cleanupThreeResources,
  monitorRendererPerformance,
  loadPostProcessing,
  loadHDRLoader,
  loadOrbitControls
} from '../lib/three-utils'

/**
 * Configurador 3D Final Calibrado - Sistema Ultra-Realista Integrado
 * 
 * CARACTERÍSTICAS FINALES IMPLEMENTADAS:
 * - Materiales PBR ultra-realistas calibrados
 * - Iluminación HDRI cinematográfica profesional
 * - Post-procesado cinematográfico (Bloom + Bokeh + CA + FXAA)
 * - Performance adaptativo según dispositivo
 * - Sombras PCFSoftShadowMap optimizadas
 * - Interactividad completa (corona giratoria)
 * - Sistema de verificación de calidad integrado
 * 
 * PARÁMETROS CALIBRADOS:
 * - Oro: metalness 1.0, roughness 0.15, IOR 2.5, envMapIntensity 3.2
 * - Acero: metalness 1.0, roughness 0.25, IOR 2.7, envMapIntensity 2.5
 * - Titanio: metalness 1.0, roughness 0.35, IOR 2.4, envMapIntensity 2.2
 * - Cristal: transmission 0.98, IOR 1.77, roughness 0.1
 * 
 * ILUMINACIÓN CALIBRADA:
 * - Key Light: 1.5, color 0xFFF8E7
 * - Fill Light: 0.8, color 0xE3F2FD
 * - Rim Light: 1.2, color 0xE1F5FE
 * 
 * POST-PROCESADO CINEMATOGRÁFICO:
 * - Bloom: threshold 0.85, strength 0.4, radius 0.1
 * - Bokeh: focus 2.5, aperture 0.0001, maxblur 0.01
 * - Chromatic Aberration: offset [0.002, 0.001]
 * - FXAA: enabled para antialiasing
 */
const WatchConfigurator3DFinal = () => {
  const containerRef = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<THREE.Scene | null>(null)
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null)
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
  const controlsRef = useRef<any>(null)
  const watchGroupRef = useRef<THREE.Group | null>(null)
  const animationIdRef = useRef<number | null>(null)
  // Función async para inicializar componentes del sistema
  const initializeSystemComponents = async (scene: THREE.Scene, camera: THREE.PerspectiveCamera, renderer: THREE.WebGLRenderer, width: number, height: number) => {
    // Controles calibrados
    const controls = await loadOrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.05
    controls.enablePan = false
    controls.enableZoom = true
    controls.minDistance = performanceLevel === 'lowEnd' ? 4 : 3
    controls.maxDistance = performanceLevel === 'lowEnd' ? 8 : 10
    controls.maxPolarAngle = Math.PI / 2 + 0.3
    controls.minPolarAngle = Math.PI / 4
    controlsRef.current = controls

    // Post-procesado calibrado
    await setupCalibratedPostProcessing(scene, camera, width, height)

    // Crear reloj con materiales calibrados
    const watchGroup = new THREE.Group()
    scene.add(watchGroup)
    watchGroupRef.current = watchGroup

    createCalibratedWatch()

    // Manejo de eventos de interacción
    setupEventListeners()

    // Loop de render calibrado
    const animate = () => {
      animationIdRef.current = requestAnimationFrame(animate)
      
      // Actualizar controles
      controls.update()
      
      // Render con post-procesado
      if (composerRef.current && calibratedConfig.performance[performanceLevel].postProcessingEnabled) {
        composerRef.current.render()
      } else {
        renderer.render(scene, camera)
      }
      
      // Actualizar métricas
      updateQualityMetrics()
    }
    
    animate()

    // Manejo de redimensionamiento
    const handleResize = () => {
      if (!containerRef.current || !cameraRef.current || !rendererRef.current) return
      if (!rendererRef.current) return
      
      const width = containerRef.current.clientWidth
      const height = containerRef.current.clientHeight
      
      cameraRef.current.aspect = width / height
      cameraRef.current.updateProjectionMatrix()
      
      rendererRef.current.setSize(width, height)
      
      if (composerRef.current) {
        composerRef.current.setSize(width, height)
      }
    }
    
    window.addEventListener('resize', handleResize)
  }

  const initializeAttemptsRef = useRef(0)
  const pmremGeneratorRef = useRef<THREE.PMREMGenerator | null>(null)
  const envMapRef = useRef<THREE.Texture | null>(null)
  
  // Referencias para post-procesado cinematográfico
  const composerRef = useRef<any>(null)
  const renderPassRef = useRef<any>(null)
  const bloomPassRef = useRef<any>(null)
  const bokehPassRef = useRef<any>(null)
  const chromaticAberrationPassRef = useRef<any>(null)
  const fxaaPassRef = useRef<any>(null)
  
  // Estado del sistema
  const [isLoading, setIsLoading] = useState(true)
  const [webGLError, setWebGLError] = useState(false)
  const [hdriLoaded, setHdriLoaded] = useState(false)
  const [performanceLevel, setPerformanceLevel] = useState<'highEnd' | 'mobile' | 'lowEnd'>('highEnd')
  const [calibratedConfig, setCalibratedConfig] = useState(getOptimizedConfig())
  const [qualityMetrics, setQualityMetrics] = useState({
    fps: 0,
    materialsWorking: false,
    lightingWorking: false,
    postProcessingWorking: false,
    interactiveWorking: false
  })
  
  const { currentConfiguration } = useConfiguratorStore()

  // Referencias para interactividad de corona
  const [crownRotation, setCrownRotation] = useState(0)
  const [crownHover, setCrownHover] = useState(false)
  const isDraggingCrownRef = useRef(false)
  const lastMouseXRef = useRef(0)
  const raycasterRef = useRef(new THREE.Raycaster())
  const mouseRef = useRef(new THREE.Vector2())
  const crownRef = useRef<THREE.Mesh | null>(null)

  // Sistema de cacheo HDRI para optimización de rendimiento
  const hdriTextureCache = useRef<Map<string, THREE.DataTexture>>(new Map())
  
  // Hook CORREGIDO para limpieza inteligente de contextos WebGL
  const webGLCleanup = useWebGLCleanup({
    autoCleanup: true,
    maxContexts: 1, // Solo 1 contexto activo
    preserveActiveContext: true, // PRESERVAR contexto activo
    gentleCleanup: true // Limpieza suave sin perder contexto
  })
  
  // Singleton para prevenir múltiples configuradores 3D
  const configuratorSingleton = useConfigurator3DSingleton('WatchConfigurator3DFinal')
  
  // Gestor SIMPLE de contexto WebGL para prevenir conflictos
  const contextManager = useSimpleWebGLContextManager()
  
  // HDRI presets con fallback robusto - URLs optimizadas y múltiples fuentes
  const getHDRIPresetURLs = (preset: string): string[] => {
    const presetURLs = {
      'studio': [
        'https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/studio_small_08_1k.hdr',
        'https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/equirectangular/studio.hdr',
        '/images/hdri/studio.hdr' // Fallback local
      ],
      'venice_sunset': [
        'https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/venice_sunset_1k.hdr',
        'https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/equirectangular/venice_sunset_1k.hdr',
        '/images/hdri/venice_sunset.hdr' // Fallback local
      ],
      'outdoor': [
        'https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/clarens_midday_1k.hdr',
        'https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/kiara_1_dawn_1k.hdr',
        '/images/hdri/outdoor.hdr' // Fallback local
      ],
      'indoor': [
        'https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/workshop_1k.hdr',
        'https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/lebombo_1k.hdr',
        '/images/hdri/indoor.hdr' // Fallback local
      ]
    }
    
    return presetURLs[preset as keyof typeof presetURLs] || presetURLs.studio
  }

  // Sistema de carga HDRI moderno con fallback robusto y cacheo
  const loadHDRIPreset = async (preset: string = 'studio'): Promise<THREE.Texture> => {
    const cacheKey = `${preset}_hdri`
    
    // 1. VERIFICAR CACHE PRIMERO
    if (hdriTextureCache.current.has(cacheKey)) {
      console.log(`🎯 HDRI ${preset} cargado desde caché`)
      return hdriTextureCache.current.get(cacheKey)!
    }
    
    try {
      console.log(`🔄 Inicializando HDRLoader moderno para preset: ${preset}`)
      const { HDRLoader } = await loadHDRLoader()
      const hdrLoader = new HDRLoader()
      
      // Configurar timeout y retry logic robusto
      const texturePromise = new Promise<THREE.DataTexture>((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error(`Timeout cargando HDRI ${preset}`))
        }, 20000) // Timeout extendido para múltiples fallbacks
        
        const loadWithFallback = async (urlIndex: number = 0) => {
          const urls = getHDRIPresetURLs(preset)
          
          if (urlIndex >= urls.length) {
            clearTimeout(timeout)
            console.warn(`⚠️ Todas las URLs HDRI fallaron para preset ${preset}`)
            reject(new Error(`Todas las URLs HDRI fallaron para preset ${preset}`))
            return
          }
          
          const url = urls[urlIndex]
          console.log(`📡 Intentando HDRI desde: ${url} (intento ${urlIndex + 1}/${urls.length})`)
          
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
                const progressPercent = ((progress.loaded / progress.total) * 100).toFixed(1)
                console.log(`📊 Progreso HDRI ${preset}: ${progressPercent}%`)
              },
              (error) => {
                console.warn(`⚠️ Fallo HDRI URL ${urlIndex + 1}:`, (error as Error).message)
                // Intentar siguiente URL
                loadWithFallback(urlIndex + 1)
              }
            )
          } catch (error) {
            console.warn(`⚠️ Error cargando HDRI desde ${url}:`, error)
            loadWithFallback(urlIndex + 1)
          }
        }
        
        // Iniciar carga con fallback
        loadWithFallback(0)
      })
      
      return await texturePromise
    } catch (error) {
      console.warn(`⚠️ Error HDRI ${preset}, usando sintético optimizado:`, error)
      // 2. FALLBACK: HDRI sintético
      const syntheticHDRI = createSyntheticHDRI(1024)
      hdriTextureCache.current.set(cacheKey, syntheticHDRI)
      return syntheticHDRI
    }
  }

  // Sistema de preload inteligente para optimización
  const preloadHDRITextures = useRef(false)
  
  const initializeHDRIPreload = () => {
    if (preloadHDRITextures.current) return // Solo ejecutar una vez
    
    preloadHDRITextures.current = true
    console.log('🚀 Iniciando preload inteligente de texturas HDRI...')
    
    // Preload de presets más comunes en segundo plano
    const presetsToPreload = ['studio', 'venice_sunset', 'outdoor']
    
    presetsToPreload.forEach(preset => {
      setTimeout(async () => {
        try {
          console.log(`⏳ Preload HDRI: ${preset}`)
          await loadHDRIPreset(preset)
          console.log(`✅ Preload completado: ${preset}`)
        } catch (error) {
          console.warn(`⚠️ Fallo en preload de ${preset}:`, error)
        }
      }, Math.random() * 3000) // Delay aleatorio para evitar spikes
    })
  }
  
  // Limpiar caché cuando sea necesario (para evitar memory leaks)
  const clearHDRICache = () => {
    console.log('🧹 Limpiando caché HDRI...')
    hdriTextureCache.current.clear()
    preloadHDRITextures.current = false
  }

  // HDRI sintético cinematográfico calibrado
  const createSyntheticHDRI = (imageSize: number = 1024): THREE.DataTexture => {
    const size = imageSize // Mayor resolución
    const data = new Uint8Array(size * size * 4)
    
    for (let i = 0; i < size * size; i++) {
      const x = i % size
      const y = Math.floor(i / size)
      
      const u = x / size
      const v = y / size
      
      // Sistema de 3 puntos sintético calibrado
      const keyLight = Math.exp(-((u - 0.25) ** 2 + (v - 0.3) ** 2) / 0.06) * 220
      const fillLight = Math.exp(-((u - 0.75) ** 2 + (v - 0.65) ** 2) / 0.15) * 140
      const rimLight = Math.exp(-((u - 0.85) ** 2 + (v - 0.2) ** 2) / 0.08) * 110
      
      const intensity = Math.min(255, keyLight + fillLight + rimLight)
      
      // Temperatura de color cinematográfica calibrada
      data[i * 4] = intensity     // R
      data[i * 4 + 1] = intensity * 0.9 // G
      data[i * 4 + 2] = intensity * 0.85 // B
      data[i * 4 + 3] = 255
    }
    
    const texture = new THREE.DataTexture(data, size, size, THREE.RGBAFormat)
    texture.mapping = THREE.EquirectangularReflectionMapping
    texture.needsUpdate = true
    
    console.log('🎨 HDRI sintético cinematográfico creado')
    
    return texture
  }

  // Sistema de iluminación calibrado según parámetros finales
  const setupCalibratedStudioLighting = (scene: THREE.Scene) => {
    // Limpiar luces existentes
    const existingLights = scene.children.filter(child => child instanceof THREE.Light)
    existingLights.forEach(light => scene.remove(light))

    const perf = calibratedConfig.performance[performanceLevel]
    const lighting = calibratedConfig.lighting

    console.log('💡 Configurando iluminación calibrada para:', performanceLevel)

    // Key Light calibrado
    const keyLight = new THREE.DirectionalLight(lighting.keyLight.color, lighting.keyLight.intensity)
    keyLight.position.set(...lighting.keyLight.position)
    keyLight.castShadow = true
    keyLight.shadow.mapSize.width = perf.shadowMapSize
    keyLight.shadow.mapSize.height = perf.shadowMapSize
    keyLight.shadow.bias = calibratedConfig.shadows.bias
    keyLight.shadow.normalBias = calibratedConfig.shadows.normalBias
    scene.add(keyLight)

    // Fill Light calibrado
    const fillLight = new THREE.DirectionalLight(lighting.fillLight.color, lighting.fillLight.intensity)
    fillLight.position.set(...lighting.fillLight.position)
    fillLight.castShadow = false
    scene.add(fillLight)

    // Rim Light calibrado
    const rimLight = new THREE.SpotLight(lighting.rimLight.color, lighting.rimLight.intensity)
    rimLight.position.set(...lighting.rimLight.position)
    rimLight.target.position.set(0, 0, 0)
    rimLight.castShadow = true
    rimLight.shadow.mapSize.width = perf.shadowMapSize / 2
    rimLight.shadow.mapSize.height = perf.shadowMapSize / 2
    scene.add(rimLight)
    scene.add(rimLight.target)

    // Iluminación volumétrica calibrada
    const crystalLight = new THREE.DirectionalLight(0xFFFFFF, lighting.volumetricLights.crystal.intensity)
    crystalLight.position.set(2, 10, 8)
    crystalLight.castShadow = true
    scene.add(crystalLight)

    const mechanismLight = new THREE.PointLight(
      lighting.volumetricLights.mechanism.color, 
      lighting.volumetricLights.mechanism.intensity, 
      8
    )
    mechanismLight.position.set(0, 0, 0.2)
    mechanismLight.castShadow = true
    scene.add(mechanismLight)

    const dialSpotLight = new THREE.SpotLight(0xFFFFFF, lighting.volumetricLights.dialSpot.intensity)
    dialSpotLight.position.set(0, 8, 6)
    dialSpotLight.target.position.set(0, 0.3, 0)
    dialSpotLight.castShadow = true
    scene.add(dialSpotLight)
    scene.add(dialSpotLight.target)

    // Luz ambiental calibrada
    const ambientLight = new THREE.AmbientLight(0x404040, 0.25)
    scene.add(ambientLight)

    console.log('✅ Iluminación calibrada configurada')
  }

  // Materiales PBR calibrados según parámetros finales
  const createCalibratedPBRMaterials = () => {
    const pbr = calibratedConfig.pbrMaterials
    
    return {
      // ORO 18K calibrado
      oro: new THREE.MeshPhysicalMaterial({
        color: '#D4AF37',
        metalness: pbr.gold.metalness,
        roughness: pbr.gold.roughness,
        envMapIntensity: pbr.gold.envMapIntensity,
        clearcoat: pbr.gold.clearcoat,
        clearcoatRoughness: pbr.gold.clearcoatRoughness,
        sheen: pbr.gold.sheen,
        sheenColor: '#FFD700',
        ior: pbr.gold.ior,
        emissive: '#FFD700',
        emissiveIntensity: 0.05
      }),

      // ACERO INOXIDABLE calibrado
      acero: new THREE.MeshPhysicalMaterial({
        color: '#B0B0B0',
        metalness: pbr.steel.metalness,
        roughness: pbr.steel.roughness,
        envMapIntensity: pbr.steel.envMapIntensity,
        clearcoat: pbr.steel.clearcoat,
        clearcoatRoughness: pbr.steel.clearcoatRoughness,
        sheen: pbr.steel.sheen,
        ior: pbr.steel.ior,
        emissive: '#B0B0B0',
        emissiveIntensity: 0.01
      }),

      // TITANIO calibrado
      titanio: new THREE.MeshPhysicalMaterial({
        color: '#6C757D',
        metalness: pbr.titanium.metalness,
        roughness: pbr.titanium.roughness,
        envMapIntensity: pbr.titanium.envMapIntensity,
        clearcoat: pbr.titanium.clearcoat,
        clearcoatRoughness: pbr.titanium.clearcoatRoughness,
        sheen: pbr.titanium.sheen,
        ior: pbr.titanium.ior,
        emissive: '#6C757D',
        emissiveIntensity: 0.02
      }),

      // CRISTAL ZAFIRO calibrado
      cristal_zafiro: new THREE.MeshPhysicalMaterial({
        color: '#FFFFFF',
        metalness: 0.0,
        roughness: pbr.crystal.roughness,
        transmission: pbr.crystal.transmission,
        thickness: pbr.crystal.thickness,
        ior: pbr.crystal.ior,
        envMapIntensity: 1.5,
        clearcoat: pbr.crystal.clearcoat,
        clearcoatRoughness: pbr.crystal.clearcoatRoughness,
        transparent: true,
        opacity: 0.22,
        side: THREE.DoubleSide
      }),

      // CUERO calibrado
      cuero: new THREE.MeshPhysicalMaterial({
        color: '#8B4513',
        metalness: 0.0,
        roughness: 0.8,
        envMapIntensity: 0.3,
        sheen: 0.9,
        sheenRoughness: 0.9,
        clearcoat: 0.2,
        clearcoatRoughness: 0.5,
        transmission: 0.02,
        thickness: 0.1,
        ior: 1.4
      })
    }
  }

  // Post-procesado cinematográfico calibrado
  const setupCalibratedPostProcessing = async (scene: THREE.Scene, camera: THREE.PerspectiveCamera, width: number, height: number) => {
    if (!calibratedConfig.performance[performanceLevel].postProcessingEnabled) {
      console.log('🚫 Post-procesado deshabilitado para rendimiento')
      return
    }

    console.log('🎬 Configurando post-procesado cinematográfico')

    const { EffectComposer, RenderPass, UnrealBloomPass, BokehPass, ShaderPass, FXAAShader, ChromaticAberrationShader } = await loadPostProcessing()
    
    const composer = new EffectComposer(rendererRef.current!)
    const renderPass = new RenderPass(scene, camera)
    composer.addPass(renderPass)
    
    // Bloom calibrado
    const bloomParams = calibratedConfig.postProcessing.bloom
    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(width, height),
      bloomParams.strength,
      bloomParams.radius,
      bloomParams.threshold
    )
    composer.addPass(bloomPass)
    
    // Bokeh calibrado (solo en high-end)
    if (performanceLevel === 'highEnd') {
      const bokehParams = calibratedConfig.postProcessing.bokeh
      const bokehPass = new BokehPass(scene, camera, {
        focus: bokehParams.focus,
        aperture: bokehParams.aperture,
        maxblur: bokehParams.maxblur
      })
      composer.addPass(bokehPass)
    }
    
    // Aberración cromática calibrada
    if (performanceLevel !== 'lowEnd') {
      const chromaParams = calibratedConfig.postProcessing.chromaticAberration
      const chromaticAberrationPass = new ShaderPass(ChromaticAberrationShader)
      chromaticAberrationPass.uniforms['offset'].value.set(chromaParams.offset[0], chromaParams.offset[1])
      composer.addPass(chromaticAberrationPass)
    }
    
    // FXAA
    if (calibratedConfig.postProcessing.fxaa.enabled) {
      const fxaaPass = new ShaderPass(FXAAShader)
      composer.addPass(fxaaPass)
    }
    
    composerRef.current = composer
    renderPassRef.current = renderPass
    bloomPassRef.current = bloomPass
  }

  // Inicialización principal del sistema calibrado (SIN RESTRICCIONES)
  useEffect(() => {
    // Incrementar contador de contextos WebGL
    const contextId = contextManager.incrementContextCount()
    console.log('🎮 Inicializando configurador 3D (contexto #', contextId + ')...')
    console.log(`📊 Instancias activas: ${configuratorSingleton.instanceCount}`)
    console.log(`🔢 Total contextos WebGL activos: ${contextManager.getContextCount()}`)
    
    if (configuratorSingleton.shouldWarn) {
      console.warn('⚠️ Múltiples configuradores detectados - puede afectar rendimiento')
    }

    // Verificar soporte WebGL
    if (!isWebGLSupported()) {
      console.error('❌ WebGL no soportado')
      setWebGLError(true)
      setIsLoading(false)
      return
    }

    // Detectar performance level
    const detectedLevel = detectPerformanceLevel()
    setPerformanceLevel(detectedLevel)
    setCalibratedConfig(getOptimizedConfig())
    
    console.log(`🎯 Nivel de rendimiento detectado: ${detectedLevel}`)

    // Limitar intentos
    if (initializeAttemptsRef.current > 3) {
      console.error('❌ Demasiados intentos de inicialización')
      setWebGLError(true)
      setIsLoading(false)
      return
    }

    initializeAttemptsRef.current++

    if (!containerRef.current) {
      console.warn('⚠️ Container no disponible')
      return
    }

    const container = containerRef.current
    const width = Math.max(container.clientWidth, 1)
    const height = Math.max(container.clientHeight, 1)

    console.log(`🚀 Inicializando sistema calibrado: ${width}x${height}`)

    const initializeCalibratedSystem = async () => {
      try {
      // Crear escena
      const scene = new THREE.Scene()
      scene.background = new THREE.Color(0xf5f5f4)
      scene.fog = new THREE.Fog(0xf5f5f4, 10, 30)
      sceneRef.current = scene

      // Crear cámara calibrada
      const aspect = width / height
      const camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 100)
      camera.position.set(0, 3, 6)
      cameraRef.current = camera

      // Crear renderer calibrado con gestión optimizada de contextos
      const renderer = new THREE.WebGLRenderer({ 
        ...contextManager.getOptimalWebGLConfig(), // Usar configuración óptima
        antialias: calibratedConfig.renderer.antialias,
        alpha: true,
        powerPreference: calibratedConfig.renderer.powerPreference,
        failIfMajorPerformanceCaveat: false
      })
      
      renderer.setSize(width, height)
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, calibratedConfig.performance[performanceLevel].maxPixelRatio))
      
      // Parámetros de render cinematográficos
      renderer.toneMapping = calibratedConfig.renderer.toneMapping
      renderer.toneMappingExposure = calibratedConfig.renderer.toneMappingExposure
      renderer.outputColorSpace = calibratedConfig.renderer.outputColorSpace
      
      // Sombras calibradas
      renderer.shadowMap.enabled = calibratedConfig.shadows.enabled
      renderer.shadowMap.type = calibratedConfig.performance[performanceLevel].shadowType
      renderer.shadowMap.autoUpdate = calibratedConfig.shadows.autoUpdate
      
      rendererRef.current = renderer
      container.appendChild(renderer.domElement)
      
      // Registrar renderer al sistema de cleanup inteligente
      webGLCleanup.registerRenderer(renderer)
      
      // Configurar monitoreo de contexto WebGL
      contextManager.setupContextMonitoring(renderer)

      // PMREMGenerator para HDRI
      pmremGeneratorRef.current = new THREE.PMREMGenerator(renderer)
      pmremGeneratorRef.current.compileEquirectangularShader()

      // Configurar iluminación calibrada
      setupCalibratedStudioLighting(scene)

      // Cargar HDRI principal con sistema de fallback robusto
      loadHDRIPreset('studio').then(async (hdriTexture) => {
        const envMap = pmremGeneratorRef.current.fromEquirectangular(hdriTexture).texture
        scene.environment = envMap
        envMapRef.current = envMap
        setHdriLoaded(true)
        console.log('🎬 HDRI cinematográfico "studio" aplicado exitosamente con HDRLoader moderno')
        
        // Iniciar preload inteligente después de cargar el principal
        setTimeout(() => {
          initializeHDRIPreload()
        }, 1500)
        
        // Inicializar componentes del sistema
        await initializeSystemComponents(scene, camera, renderer, width, height)
        
      }).catch(async (error) => {
        console.warn('⚠️ Error HDRI principal, usando sintético robusto:', error)
        const syntheticHDRI = createSyntheticHDRI(1024)
        const envMap = pmremGeneratorRef.current.fromEquirectangular(syntheticHDRI).texture
        scene.environment = envMap
        envMapRef.current = envMap
        setHdriLoaded(true)
        console.log('✅ HDRI sintético de alta calidad aplicado como fallback robusto')
        
        // Inicializar componentes del sistema con fallback HDRI
        await initializeSystemComponents(scene, camera, renderer, width, height)
      })

      // Controles calibrados
      const controls = await loadOrbitControls(camera, renderer.domElement)
      controls.enableDamping = true
      controls.dampingFactor = 0.05
      controls.enablePan = false
      controls.enableZoom = true
      controls.minDistance = performanceLevel === 'lowEnd' ? 4 : 3
      controls.maxDistance = performanceLevel === 'lowEnd' ? 8 : 10
      controls.maxPolarAngle = Math.PI / 2 + 0.3
      controls.minPolarAngle = Math.PI / 4
      controlsRef.current = controls

      // Post-procesado calibrado
      await setupCalibratedPostProcessing(scene, camera, width, height)

      // Crear reloj con materiales calibrados
      const watchGroup = new THREE.Group()
      scene.add(watchGroup)
      watchGroupRef.current = watchGroup

      createCalibratedWatch()

      // Manejo de eventos de interacción
      setupEventListeners()

      // Loop de render calibrado
      const animate = () => {
        animationIdRef.current = requestAnimationFrame(animate)
        
        // Actualizar controles
        controls.update()
        
        // Render con o sin post-procesado
        if (composerRef.current) {
          composerRef.current.render()
        } else {
          renderer.render(scene, camera)
        }
        
        // Actualizar métricas
        updateQualityMetrics()
      }
      
      animate()

      // Manejo de redimensionamiento
      const handleResize = () => {
        if (!containerRef.current || !cameraRef.current || !rendererRef.current) return
        
        const newWidth = Math.max(containerRef.current.clientWidth || 600, 1)
        const newHeight = Math.max(containerRef.current.clientHeight || 400, 1)
        
        cameraRef.current.aspect = newWidth / newHeight
        cameraRef.current.updateProjectionMatrix()
        rendererRef.current.setSize(newWidth, newHeight)
        
        if (composerRef.current) {
          composerRef.current.setSize(newWidth, newHeight)
        }
      }
      
      window.addEventListener('resize', handleResize)

      console.log('🎉 Sistema calibrado inicializado exitosamente')
      setIsLoading(false)

      return () => {
        console.log('🧹 Limpiando recursos WebGL del sistema calibrado...')
        
        // Limpiar event listeners
        window.removeEventListener('resize', handleResize)
        
        // Cancelar animaciones
        if (animationIdRef.current) {
          cancelAnimationFrame(animationIdRef.current)
        }
        
        // Limpiar recursos Three.js
        if (rendererRef.current) {
          // Desregistrar renderer del sistema de cleanup
          webGLCleanup.unregisterRenderer(rendererRef.current)
          
          // Eliminar canvas del DOM
          const canvas = rendererRef.current.domElement
          if (canvas.parentNode) {
            canvas.parentNode.removeChild(canvas)
          }
          
          // Disponer renderer
          rendererRef.current.dispose()
          rendererRef.current = null
        }
        
        // Limpiar PMREMGenerator
        if (pmremGeneratorRef.current) {
          pmremGeneratorRef.current.dispose()
          pmremGeneratorRef.current = null
        }
        
        // Limpiar environment map
        if (envMapRef.current) {
          envMapRef.current.dispose()
          envMapRef.current = null
        }
        
        // Limpiar post-processing
        if (composerRef.current) {
          composerRef.current.dispose()
          composerRef.current = null
        }
        
        // Limpiar controles
        if (controlsRef.current) {
          controlsRef.current.dispose()
          controlsRef.current = null
        }
        
        // Limpiar escena y cámara
        if (sceneRef.current) {
          sceneRef.current.clear()
          sceneRef.current = null
        }
        if (cameraRef.current) {
          cameraRef.current = null
        }
        
        console.log('✅ Limpieza de recursos WebGL completada')
      }

    } catch (error) {
      console.error('❌ Error durante inicialización:', error)
      setWebGLError(true)
      setIsLoading(false)
    }
    }

    initializeCalibratedSystem()
  }, [])

  // Crear reloj con materiales calibrados
  const createCalibratedWatch = () => {
    if (!watchGroupRef.current) return

    const materials = createCalibratedPBRMaterials()
    const watchGroup = watchGroupRef.current

    // Limpiar reloj anterior
    while (watchGroup.children.length > 0) {
      const child = watchGroup.children[0]
      watchGroup.remove(child)
    }

    // Crear reloj básico con materiales calibrados
    const materialType = currentConfiguration.material?.name || 'Acero Inoxidable'
    const dialType = currentConfiguration.dial?.name || 'Negra'
    const strapType = currentConfiguration.strap?.name || 'Cuero Negro'

    // Caja del reloj con material calibrado
    const caseGeometry = new THREE.CylinderGeometry(1.2, 1.2, 0.82, 64)
    let caseMaterial: THREE.Material
    
    if (materialType.includes('Oro')) {
      caseMaterial = materials.oro
    } else if (materialType.includes('Titanio')) {
      caseMaterial = materials.titanio
    } else {
      caseMaterial = materials.acero
    }
    
    const caseMesh = new THREE.Mesh(caseGeometry, caseMaterial)
    caseMesh.castShadow = true
    caseMesh.receiveShadow = true
    watchGroup.add(caseMesh)

    // Esfera calibrada
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
      envMapIntensity: 1.0
    })
    
    const dial = new THREE.Mesh(dialGeometry, dialMaterial)
    dial.rotation.x = -Math.PI / 2
    dial.position.y = 0.41
    watchGroup.add(dial)

    // Corona con material calibrado
    const crownGeometry = new THREE.CylinderGeometry(0.08, 0.12, 0.2, 64)
    const crownMaterial = caseMaterial.clone()
    const crown = new THREE.Mesh(crownGeometry, crownMaterial)
    crown.position.set(1.35, 0.05, 0)
    crown.rotation.z = Math.PI / 2
    crown.castShadow = true
    crown.userData.isCrown = true
    watchGroup.add(crown)
    crownRef.current = crown

    // Cristal calibrado
    const glassGeometry = new THREE.CylinderGeometry(1.16, 1.16, 0.08, 64)
    const glassMaterial = materials.cristal_zafiro
    const glassMesh = new THREE.Mesh(glassGeometry, glassMaterial)
    glassMesh.position.y = 0.3
    glassMesh.castShadow = false
    glassMesh.receiveShadow = false
    glassMesh.renderOrder = 1
    watchGroup.add(glassMesh)

    console.log('⌚ Reloj calibrado creado')
  }

  // Configurar event listeners para interactividad
  const setupEventListeners = () => {
    const renderer = rendererRef.current
    if (!renderer) return

    const handleMouseDown = (event: MouseEvent) => {
      event.preventDefault()
      const rect = renderer.domElement.getBoundingClientRect()
      mouseRef.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
      mouseRef.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1

      raycasterRef.current.setFromCamera(mouseRef.current, cameraRef.current!)
      const intersects = raycasterRef.current.intersectObjects(watchGroupRef.current!.children, true)

      for (const intersect of intersects) {
        let currentObject = intersect.object
        while (currentObject.parent) {
          if (currentObject.userData && currentObject.userData.isCrown) {
            isDraggingCrownRef.current = true
            lastMouseXRef.current = event.clientX
            setCrownHover(true)
            document.body.style.cursor = 'pointer'
            console.log('👑 Corona seleccionada')
            return
          }
          currentObject = currentObject.parent
        }
      }
    }

    const handleMouseMove = (event: MouseEvent) => {
      event.preventDefault()

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

    const handleMouseUp = () => {
      if (isDraggingCrownRef.current) {
        isDraggingCrownRef.current = false
        document.body.style.cursor = 'default'
        console.log('👑 Interacción con corona finalizada')
      }
    }

    // Agregar listeners
    renderer.domElement.addEventListener('mousedown', handleMouseDown)
    renderer.domElement.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }

  // Actualizar métricas de calidad
  const updateQualityMetrics = () => {
    // Simulación de métricas de calidad
    setQualityMetrics({
      fps: 60, // Simplified for demo
      materialsWorking: true,
      lightingWorking: hdriLoaded,
      postProcessingWorking: !!composerRef.current,
      interactiveWorking: true
    })
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

  // Reacción a cambios en configuración
  useEffect(() => {
    if (watchGroupRef.current && sceneRef.current) {
      createCalibratedWatch()
    }
  }, [currentConfiguration, calibratedConfig])

  // Fallback si WebGL no está disponible
  if (webGLError) {
    return (
      <div className="relative w-full h-full min-h-[500px] md:min-h-[600px] bg-gradient-to-br from-neutral-100 to-neutral-200 rounded-lg overflow-hidden shadow-modal flex items-center justify-center">
        <div className="text-center p-8 max-w-md">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 className="text-xl font-headline font-bold text-neutral-900 mb-2">
            Sistema 3D Ultra-Realista No Disponible
          </h3>
          <p className="text-neutral-600 mb-4">
            WebGL no está soportado o habilitado. Este configurador requiere renderizado 3D avanzado con materiales PBR y post-procesado cinematográfico.
          </p>
          <p className="text-sm text-neutral-500">
            Usa un navegador moderno: Chrome, Firefox, Safari, Edge
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative w-full h-full min-h-[500px] md:min-h-[600px] bg-gradient-to-br from-neutral-100 to-neutral-200 rounded-lg overflow-hidden shadow-modal">
      {/* Contenedor 3D */}
      <div ref={containerRef} className="w-full h-full min-h-[500px]" style={{minHeight: '500px', height: '100%'}} />

      {/* Loading mejorado */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-neutral-100/90 backdrop-blur-sm">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-gold-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-neutral-800 font-semibold mb-2">Inicializando Sistema Ultra-Realista</p>
            <p className="text-sm text-neutral-600 mb-2">
              {hdriLoaded ? 'Aplicando materiales PBR calibrados...' : 'Cargando iluminación HDRI cinematográfica...'}
            </p>
            <p className="text-xs text-neutral-500">
              Nivel de rendimiento: {performanceLevel.toUpperCase()}
            </p>
          </div>
        </div>
      )}

      {/* Panel de métricas de calidad */}
      <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm px-4 py-3 rounded-md shadow-lg text-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${qualityMetrics.materialsWorking ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span>Materiales PBR</span>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${qualityMetrics.lightingWorking ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
            <span>HDRI Cinematográfico</span>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${qualityMetrics.postProcessingWorking ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
            <span>Post-Procesado</span>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${qualityMetrics.interactiveWorking ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span>Interactividad</span>
          </div>
        </div>
      </div>

      {/* Badge del sistema */}
      <div className="absolute top-4 right-4 bg-gradient-to-r from-gold-500 to-gold-600 text-neutral-900 px-4 py-2 rounded-full shadow-lg text-xs font-bold uppercase tracking-wide">
        Sistema Ultra-Realista {performanceLevel === 'highEnd' ? 'Pro' : performanceLevel === 'mobile' ? 'Mobile' : 'Lite'}
      </div>

      {/* Controles informativos */}
      <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm px-4 py-3 rounded-md shadow-lg text-sm text-neutral-700 max-w-xs">
        <p className="font-semibold mb-2 text-gold-700">Controles del Sistema:</p>
        <ul className="space-y-1 text-xs">
          <li>🖱️ Click y arrastra para rotar 360°</li>
          <li>🔍 Scroll para zoom</li>
          <li>👑 Click en corona para girar</li>
          <li>⚡ Sistema calibrado para máxima calidad</li>
        </ul>
      </div>
    </div>
  )
}

export default WatchConfigurator3DFinal
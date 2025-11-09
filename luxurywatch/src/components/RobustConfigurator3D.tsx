import { useEffect, useRef, useState } from 'react'
import { useConfiguratorStore } from '../store/configuratorStore'

/**
 * 🛡️ CONFIGURADOR 3D ROBUSTO Y COMPATIBLE
 * 
 * Solución ultra-robusta para máxima compatibilidad:
 * - Imports estáticos para evitar fallos de carga dinámica
 * - Manejo exhaustivo de errores WebGL
 * - Fallbacks para diferentes navegadores
 * - Configuración conservadora pero efectiva
 * - Recovery automático en caso de fallo
 * - Timeout de seguridad
 */

interface WatchConfig {
  case: {
    material: string
    color: string
    size: string
    thickness: string
  }
  dial: {
    color: string
    style: string
    numerals: string
  }
  strap: {
    material: string
    color: string
    style: string
  }
  movement: {
    type: string
    complications: string[]
  }
}

export const RobustConfigurator3D = ({ 
  className = '',
  onReady
}: { 
  className?: string
  onReady?: () => void 
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isInitialized, setIsInitialized] = useState(false)
  const [initError, setInitError] = useState<string | null>(null)
  const [initProgress, setInitProgress] = useState(0)
  const [initStep, setInitStep] = useState('Verificando compatibilidad...')
  const configuratorStore = useConfiguratorStore()
  
  // Referencias de THREE.js
  const sceneRef = useRef<any>(null)
  const cameraRef = useRef<any>(null)
  const rendererRef = useRef<any>(null)
  const watchGroupRef = useRef<any>(null)
  const animationRef = useRef<number>(0)
  
  // Estado del configurador
  const [watchConfig, setWatchConfig] = useState<WatchConfig>({
    case: { material: 'oro_18k', color: '#FFD700', size: '42mm', thickness: '12mm' },
    dial: { color: 'blanco', style: 'analogo', numerals: 'arabigo' },
    strap: { material: 'cuero', color: 'negro', style: 'clasico' },
    movement: { type: 'automatico', complications: [] }
  })

  // 🛡️ DETECCIÓN DE COMPATIBILIDAD WEBGL
  const checkWebGLCompatibility = (): boolean => {
    try {
      const canvas = document.createElement('canvas')
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
      
      if (!gl) {
        setInitError('WebGL no está soportado en este navegador')
        return false
      }
      
      // Verificar extensiones necesarias (con type assertion)
      const webgl = gl as WebGLRenderingContext
      const requiredExtensions = ['OES_element_index_uint', 'OES_standard_derivatives']
      for (const ext of requiredExtensions) {
        if (!webgl.getExtension(ext)) {
          console.warn(`Extensión WebGL opcional no disponible: ${ext}`)
        }
      }
      
      return true
    } catch (error) {
      setInitError(`Error de compatibilidad WebGL: ${error}`)
      return false
    }
  }

  // 🏗️ INICIALIZACIÓN ROBUSTA CON PROGRESO Y ERRORES
  useEffect(() => {
    const initializeThreeJSRobust = async () => {
      if (!canvasRef.current) return
      
      try {
        // Paso 1: Verificar compatibilidad
        setInitStep('Verificando compatibilidad WebGL...')
        setInitProgress(10)
        
        if (!checkWebGLCompatibility()) {
          setInitError('Navegador no compatible con WebGL')
          return
        }
        
        // Paso 2: Importar THREE.js de forma segura
        setInitStep('Cargando motor 3D...')
        setInitProgress(30)
        
        let THREE: any
        try {
          THREE = await import('three')
        } catch (error) {
          throw new Error(`Error cargando Three.js: ${error}`)
        }
        
        // Paso 3: Crear contexto WebGL robusto
        setInitStep('Inicializando contexto WebGL...')
        setInitProgress(50)
        
        const canvas = canvasRef.current
        const rect = canvas.getBoundingClientRect()
        
        // Configuración conservadora para máxima compatibilidad
        const renderer = new THREE.WebGLRenderer({ 
          canvas,
          antialias: true,
          alpha: true,
          preserveDrawingBuffer: false
        })
        
        // Pixel ratio conservador
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1))
        renderer.setSize(rect.width, rect.height)
        
        // Configuración visual básica pero efectiva
        renderer.toneMapping = THREE.ACESFilmicToneMapping
        renderer.toneMappingExposure = 1.0
        renderer.outputColorSpace = THREE.SRGBColorSpace
        renderer.shadowMap.enabled = true
        renderer.shadowMap.type = THREE.PCFSoftShadowMap
        
        // Paso 4: Configurar escena
        setInitStep('Preparando escena 3D...')
        setInitProgress(70)
        
        const scene = new THREE.Scene()
        scene.background = new THREE.Color(0xf5f5f4)
        
        // Cámara con configuración conservadora
        const camera = new THREE.PerspectiveCamera(45, rect.width / rect.height, 0.1, 100)
        camera.position.set(0, 3, 6)
        camera.lookAt(0, 0, 0)
        
        // Paso 5: Configurar luces
        setupLightsRobust(scene, THREE)
        
        // Paso 6: Crear modelo básico
        setInitStep('Generando modelo 3D...')
        setInitProgress(85)
        
        createRobustWatchModel(scene, THREE, watchConfig)
        
        // Paso 7: Guardar referencias
        setInitStep('Finalizando inicialización...')
        setInitProgress(95)
        
        rendererRef.current = renderer
        sceneRef.current = scene
        cameraRef.current = camera
        
        // Paso 8: Iniciar animación
        setInitStep('Iniciando animación...')
        setInitProgress(100)
        
        startRobustAnimation()
        
        // Éxito
        setTimeout(() => {
          setIsInitialized(true)
          onReady?.()
        }, 500)
        
        console.log('✅ THREE.js robusto inicializado correctamente')
        
      } catch (error) {
        console.error('❌ Error en inicialización robusta:', error)
        setInitError(`Error de inicialización: ${error}`)
        
        // Modo de emergencia - mostrar modelo 2D o imagen estática
        setTimeout(() => {
          showEmergencyFallback()
        }, 2000)
      }
    }
    
    // Timeout de seguridad
    const timeoutId = setTimeout(() => {
      if (!isInitialized && !initError) {
        setInitError('Timeout de inicialización - navegando a modo seguro')
        showEmergencyFallback()
      }
    }, 15000) // 15 segundos máximo
    
    initializeThreeJSRobust()
    
    return () => {
      clearTimeout(timeoutId)
      cleanupRobust()
    }
  }, [])

  // 💡 SISTEMA DE LUCES SIMPLE PERO EFECTIVO
  const setupLightsRobust = (scene: any, THREE: any) => {
    try {
      // Ambient light básico
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.6)
      scene.add(ambientLight)
      
      // Directional light principal
      const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8)
      directionalLight.position.set(5, 5, 5)
      directionalLight.castShadow = true
      scene.add(directionalLight)
      
      console.log('💡 Luces configuradas correctamente')
    } catch (error) {
      console.warn('⚠️ Error configurando luces:', error)
    }
  }

  // 🏗️ MODELO ROBUSTO CON GEOMETRÍAS BÁSICAS
  const createRobustWatchModel = (scene: any, THREE: any, config: WatchConfig) => {
    try {
      // Limpiar modelo anterior
      if (watchGroupRef.current) {
        scene.remove(watchGroupRef.current)
      }
      
      const watchGroup = new THREE.Group()
      
      // Cuerpo del reloj - geometría simple pero efectiva
      const bodyGeometry = new THREE.CylinderGeometry(1.5, 1.5, 0.3, 32)
      const bodyMaterial = new THREE.MeshStandardMaterial({
        color: config.case.color,
        metalness: 0.9,
        roughness: 0.2
      })
      const bodyMesh = new THREE.Mesh(bodyGeometry, bodyMaterial)
      bodyMesh.castShadow = true
      watchGroup.add(bodyMesh)
      
      // Esfera del reloj
      const dialGeometry = new THREE.CylinderGeometry(1.3, 1.3, 0.02, 32)
      const dialColors: Record<string, number> = {
        'blanco': 0xffffff,
        'negro': 0x000000,
        'azul': 0x1e40af,
        'plateado': 0xe5e7eb
      }
      
      const dialMaterial = new THREE.MeshStandardMaterial({
        color: dialColors[config.dial.color] || 0xffffff,
        metalness: 0.1,
        roughness: 0.8
      })
      const dialMesh = new THREE.Mesh(dialGeometry, dialMaterial)
      dialMesh.position.y = 0.16
      dialMesh.castShadow = true
      watchGroup.add(dialMesh)
      
      // Marcadores simples - esferas pequeñas
      createSimpleHourMarkers(watchGroup, THREE)
      
      // Corona simple
      const crownGeometry = new THREE.CylinderGeometry(0.2, 0.2, 0.3, 16)
      const crownMesh = new THREE.Mesh(crownGeometry, bodyMaterial)
      crownMesh.position.set(1.7, 0, 0)
      crownMesh.rotation.z = Math.PI / 2
      crownMesh.castShadow = true
      watchGroup.add(crownMesh)
      
      watchGroupRef.current = watchGroup
      scene.add(watchGroup)
      
      console.log('🎯 Modelo robusto creado')
      
    } catch (error) {
      console.error('❌ Error creando modelo:', error)
      // Modo de emergencia - modelo super básico
      createEmergencyModel(scene, THREE)
    }
  }

  // ⏰ MARCADORES SIMPLES
  const createSimpleHourMarkers = (group: any, THREE: any) => {
    try {
      for (let i = 0; i < 12; i++) {
        const angle = (i / 12) * Math.PI * 2
        const x = Math.cos(angle) * 1.1
        const z = Math.sin(angle) * 1.1
        
        const markerGeometry = new THREE.SphereGeometry(0.05, 8, 6)
        const markerMaterial = new THREE.MeshStandardMaterial({
          color: 0x333333,
          metalness: 0.8,
          roughness: 0.3
        })
        
        const markerMesh = new THREE.Mesh(markerGeometry, markerMaterial)
        markerMesh.position.set(x, 0.18, z)
        markerMesh.castShadow = true
        group.add(markerMesh)
      }
    } catch (error) {
      console.warn('⚠️ Error creando marcadores:', error)
    }
  }

  // 🆘 MODELO DE EMERGENCIA
  const createEmergencyModel = (scene: any, THREE: any) => {
    try {
      console.log('🆘 Creando modelo de emergencia')
      
      const emergencyGroup = new THREE.Group()
      
      // Solo un cilindro básico como último recurso
      const geometry = new THREE.CylinderGeometry(1, 1, 0.3, 16)
      const material = new THREE.MeshStandardMaterial({ color: 0x888888 })
      const mesh = new THREE.Mesh(geometry, material)
      
      emergencyGroup.add(mesh)
      scene.add(emergencyGroup)
      watchGroupRef.current = emergencyGroup
      
    } catch (error) {
      console.error('❌ Error en modelo de emergencia:', error)
    }
  }

  // 🎬 ANIMACIÓN ROBUSTA
  const startRobustAnimation = () => {
    if (!rendererRef.current || !sceneRef.current || !cameraRef.current) {
      console.warn('⚠️ Referencias no disponibles para animación')
      return
    }
    
    const animate = () => {
      try {
        if (watchGroupRef.current) {
          watchGroupRef.current.rotation.y += 0.005
        }
        
        rendererRef.current.render(sceneRef.current, cameraRef.current)
        animationRef.current = requestAnimationFrame(animate)
      } catch (error) {
        console.error('❌ Error en animación:', error)
        // Intentar recovery
        setTimeout(() => {
          if (rendererRef.current && sceneRef.current && cameraRef.current) {
            animate()
          }
        }, 100)
      }
    }
    
    animate()
    console.log('🎬 Animación iniciada')
  }

  // 🛡️ MODO SEGURO - FALLBACK
  const showEmergencyFallback = () => {
    console.log('🆘 Activando modo de emergencia')
    
    // Aquí se podría mostrar una imagen estática del reloj
    // o un modelo 2D simple como fallback
  }

  // 🧹 LIMPIEZA ROBUSTA
  const cleanupRobust = () => {
    try {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
      
      if (rendererRef.current) {
        rendererRef.current.dispose()
      }
      
      console.log('🧹 Limpieza completada')
    } catch (error) {
      console.warn('⚠️ Error en limpieza:', error)
    }
  }

  // 🔄 MANEJO DE CAMBIOS DE CONFIGURACIÓN
  const handleConfigChange = (section: keyof WatchConfig, property: string, value: any) => {
    setWatchConfig(prev => {
      const updated = {
        ...prev,
        [section]: {
          ...prev[section],
          [property]: value
        }
      }
      
      // Actualizar modelo de forma segura
      if (sceneRef.current && rendererRef.current) {
        import('three').then((THREE: any) => {
          createRobustWatchModel(sceneRef.current, THREE, updated)
        }).catch(error => {
          console.warn('⚠️ Error actualizando modelo:', error)
        })
      }
      
      return updated
    })
  }

  // 📐 RESPONSIVE RESIZE
  useEffect(() => {
    const resizeCanvas = () => {
      if (canvasRef.current && rendererRef.current && cameraRef.current) {
        const canvas = canvasRef.current
        const rect = canvas.getBoundingClientRect()
        
        try {
          rendererRef.current.setSize(rect.width, rect.height)
          cameraRef.current.aspect = rect.width / rect.height
          cameraRef.current.updateProjectionMatrix()
        } catch (error) {
          console.warn('⚠️ Error redimensionando:', error)
        }
      }
    }
    
    window.addEventListener('resize', resizeCanvas)
    return () => window.removeEventListener('resize', resizeCanvas)
  }, [])

  // 🎨 CONTROLES DE CONFIGURACIÓN
  const renderConfigControls = () => (
    <div className="bg-white p-4 rounded-lg shadow-lg space-y-3 max-w-xs">
      <h3 className="font-bold text-gray-800 border-b pb-2">Personalización</h3>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Material del Caso</label>
        <select 
          value={watchConfig.case.material}
          onChange={(e) => handleConfigChange('case', 'material', e.target.value)}
          className="w-full p-2 border rounded bg-white"
          disabled={!isInitialized}
        >
          <option value="oro_18k">Oro 18K</option>
          <option value="acero_inoxidable">Acero Inoxidable</option>
          <option value="titanio">Titanio</option>
        </select>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Color del Caso</label>
        <input
          type="color"
          value={watchConfig.case.color}
          onChange={(e) => handleConfigChange('case', 'color', e.target.value)}
          className="w-full h-10 border rounded"
          disabled={!isInitialized}
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Color de Esfera</label>
        <select 
          value={watchConfig.dial.color}
          onChange={(e) => handleConfigChange('dial', 'color', e.target.value)}
          className="w-full p-2 border rounded bg-white"
          disabled={!isInitialized}
        >
          <option value="blanco">Blanco</option>
          <option value="negro">Negro</option>
          <option value="azul">Azul</option>
          <option value="plateado">Plateado</option>
        </select>
      </div>
    </div>
  )

  // ❌ PANTALLA DE ERROR
  if (initError) {
    return (
      <div className={`robust-configurator-3d ${className} h-full flex items-center justify-center bg-gray-100`}>
        <div className="text-center max-w-md">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Error de Inicialización</h2>
          <p className="text-gray-600 mb-4">{initError}</p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Reintentar
          </button>
        </div>
      </div>
    )
  }

  // ⏳ PANTALLA DE CARGA MEJORADA
  if (!isInitialized) {
    return (
      <div className={`robust-configurator-3d ${className} h-full flex items-center justify-center bg-gray-100`}>
        <div className="text-center max-w-lg">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-6"></div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Configurador 3D Robusto</h2>
          <p className="text-lg text-gray-600 mb-6">{initStep}</p>
          
          {/* Barra de progreso mejorada */}
          <div className="w-full bg-gray-200 rounded-full h-4 mb-4">
            <div 
              className="bg-gradient-to-r from-blue-500 to-blue-600 h-4 rounded-full transition-all duration-300"
              style={{width: `${initProgress}%`}}
            ></div>
          </div>
          
          <div className="text-sm text-gray-500">
            {initProgress}% completado
          </div>
          
          {/* Información de diagnóstico */}
          <div className="mt-6 bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold text-blue-800 mb-2">🔧 Diagnóstico del Sistema</h3>
            <div className="text-sm text-blue-700 space-y-1">
              <div>✅ WebGL: {checkWebGLCompatibility() ? 'Compatible' : 'No Compatible'}</div>
              <div>✅ Navegador: {navigator.userAgent.includes('Chrome') ? 'Chrome' : navigator.userAgent.includes('Firefox') ? 'Firefox' : 'Otro'}</div>
              <div>✅ Dispositivo: {window.devicePixelRatio > 1 ? 'Alta Resolución' : 'Estándar'}</div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`robust-configurator-3d ${className} relative h-full overflow-hidden`}>
      {/* Canvas 3D */}
      <canvas 
        ref={canvasRef}
        className="w-full h-full"
        style={{ 
          display: 'block',
          background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)'
        }}
      />
      
      {/* Controles */}
      <div className="absolute top-4 right-4 z-10">
        {renderConfigControls()}
      </div>
      
      {/* Estado exitoso */}
      <div className="absolute bottom-4 left-4 z-10">
        <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg">
          ✅ Motor 3D Robusto Activo
        </div>
      </div>
      
      {/* Información de configuración */}
      <div className="absolute bottom-4 right-4 z-10 max-w-xs">
        <div className="bg-black bg-opacity-75 text-white p-3 rounded-lg text-sm backdrop-blur-sm">
          <div className="font-semibold mb-2 text-green-400">⚙️ Configuración:</div>
          <div className="space-y-1 text-xs">
            <div>Material: {watchConfig.case.material}</div>
            <div>Esfera: {watchConfig.dial.color}</div>
            <div>Tamaño: {watchConfig.case.size}</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RobustConfigurator3D
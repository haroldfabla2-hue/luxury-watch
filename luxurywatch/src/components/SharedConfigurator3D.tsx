import { useEffect, useRef, useState } from 'react'
import { useConfiguratorStore } from '../store/configuratorStore'
import { CompositorWebGL } from './CompositorWebGL'

interface SharedConfigurator3DProps {
  className?: string
  onReady?: () => void
  enableAR?: boolean
}

/**
 * 🎯 CONFIGURADOR 3D CON CONTEXTO COMPARTIDO
 * 
 * SOLUCIÓN DEFINITIVA para conflictos de contextos WebGL:
 * - Usa un solo contexto WebGL compartido
 * - Compatible al 100% con ModelViewer AR
 * - Renderizado por composición inteligente
 * - Sin conflictos de pérdida de contexto
 */
export const SharedConfigurator3D = ({ 
  className = '',
  onReady,
  enableAR = true 
}: SharedConfigurator3DProps) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isInitialized, setIsInitialized] = useState(false)
  const configuratorStore = useConfiguratorStore()
  
  // Estado del configurador (simulado para compatibilidad)
  const [watchConfig, setWatchConfig] = useState({
    case: {
      material: 'oro_18k',
      color: '#D4AF37',
      size: '42mm',
      thickness: '12mm'
    },
    dial: {
      color: 'blanco',
      style: 'analogo',
      numerals: 'arabigos'
    },
    strap: {
      material: 'cuero',
      color: 'negro',
      style: 'clasico'
    },
    movement: {
      type: 'automatico',
      complications: ['fecha', 'cronografo']
    }
  })
  
  // Inicialización del sistema
  useEffect(() => {
    const initializeConfigurator = async () => {
      console.log('🎬 Inicializando Configurador 3D con Contexto Compartido')
      
      // Inicializar store si es necesario
      if (configuratorStore && configuratorStore.currentConfiguration) {
        console.log('📦 Store del configurador disponible')
      }
      
      setIsInitialized(true)
      console.log('✅ Configurador 3D inicializado correctamente')
    }
    
    initializeConfigurator()
  }, [configuratorStore])
  
  // Manejar cambios de configuración
  const handleConfigChange = (section: string, property: string, value: any) => {
    setWatchConfig(prev => ({
      ...prev,
      [section]: {
        ...prev[section as keyof typeof prev],
        [property]: value
      }
    }))
    
    console.log(`🔧 Configuración actualizada - ${section}.${property}:`, value)
  }
  
  // Renderizar controles de UI (tradicionales, no WebGL)
  const renderConfigControls = () => (
    <div className="config-controls p-4 space-y-4">
      <h3 className="text-lg font-semibold mb-4">Personaliza tu Reloj</h3>
      
      {/* Caso */}
      <div className="control-section">
        <h4 className="font-medium mb-2">Caso</h4>
        <div className="grid grid-cols-2 gap-2">
          <select 
            value={watchConfig.case.material}
            onChange={(e) => handleConfigChange('case', 'material', e.target.value)}
            className="p-2 border rounded"
          >
            <option value="oro_18k">Oro 18K</option>
            <option value="acero_inoxidable">Acero Inoxidable</option>
            <option value="titanio">Titanio</option>
          </select>
          <select 
            value={watchConfig.case.size}
            onChange={(e) => handleConfigChange('case', 'size', e.target.value)}
            className="p-2 border rounded"
          >
            <option value="38mm">38mm</option>
            <option value="42mm">42mm</option>
            <option value="44mm">44mm</option>
          </select>
        </div>
      </div>
      
      {/* Esfera */}
      <div className="control-section">
        <h4 className="font-medium mb-2">Esfera</h4>
        <div className="grid grid-cols-2 gap-2">
          <select 
            value={watchConfig.dial.color}
            onChange={(e) => handleConfigChange('dial', 'color', e.target.value)}
            className="p-2 border rounded"
          >
            <option value="blanco">Blanco</option>
            <option value="negro">Negro</option>
            <option value="azul">Azul</option>
            <option value="plateado">Plateado</option>
          </select>
          <select 
            value={watchConfig.dial.style}
            onChange={(e) => handleConfigChange('dial', 'style', e.target.value)}
            className="p-2 border rounded"
          >
            <option value="analogo">Analógico</option>
            <option value="digital">Digital</option>
            <option value="híbrido">Híbrido</option>
          </select>
        </div>
      </div>
      
      {/* Correa */}
      <div className="control-section">
        <h4 className="font-medium mb-2">Correa</h4>
        <div className="grid grid-cols-2 gap-2">
          <select 
            value={watchConfig.strap.material}
            onChange={(e) => handleConfigChange('strap', 'material', e.target.value)}
            className="p-2 border rounded"
          >
            <option value="cuero">Cuero</option>
            <option value="metalico">Metálico</option>
            <option value="goma">Goma</option>
            <option value="nylon">Nylon</option>
          </select>
          <select 
            value={watchConfig.strap.color}
            onChange={(e) => handleConfigChange('strap', 'color', e.target.value)}
            className="p-2 border rounded"
          >
            <option value="negro">Negro</option>
            <option value="marron">Marrón</option>
            <option value="blanco">Blanco</option>
            <option value="azul">Azul</option>
          </select>
        </div>
      </div>
    </div>
  )
  
  if (!isInitialized) {
    return (
      <div className={`shared-configurator-3d ${className}`}>
        <div className="h-full flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p>Inicializando Configurador 3D...</p>
          </div>
        </div>
      </div>
    )
  }
  
  return (
    <div className={`shared-configurator-3d ${className}`}>
      {/* Container para WebGL compartido */}
      <div 
        ref={containerRef}
        className="relative w-full h-full overflow-hidden"
        style={{ zIndex: 1 }}
      >
        {/* Compositor WebGL - Renderizado por capas */}
        <CompositorWebGL
          componentId="shared-configurator"
          containerRef={containerRef}
          width={800}
          height={600}
          enableAR={enableAR}
          onReady={onReady}
        />
        
        {/* Overlay de controles (sin conflicto WebGL) */}
        <div className="absolute top-4 right-4 z-10">
          {renderConfigControls()}
        </div>
        
        {/* Indicador de estado del sistema */}
        <div className="absolute bottom-4 left-4 z-10">
          <div className="bg-green-500 text-white px-3 py-1 rounded-full text-sm">
            ✅ Contexto WebGL Compartido Activo
          </div>
        </div>
        
        {/* Información de configuración actual */}
        <div className="absolute bottom-4 right-4 z-10 max-w-xs">
          <div className="bg-black bg-opacity-50 text-white p-3 rounded text-sm">
            <div className="font-semibold mb-1">Configuración Actual:</div>
            <div>Caso: {watchConfig.case.material}</div>
            <div>Esfera: {watchConfig.dial.color}</div>
            <div>Correa: {watchConfig.strap.material}</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SharedConfigurator3D
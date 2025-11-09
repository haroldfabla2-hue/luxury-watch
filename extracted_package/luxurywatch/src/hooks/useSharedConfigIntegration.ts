import { useCallback, useEffect, useState } from 'react'
import { useConfiguratorStore } from '../store/configuratorStore'

interface SharedConfigState {
  caseMaterial: string
  caseColor: string
  caseSize: string
  dialColor: string
  dialStyle: string
  strapMaterial: string
  strapColor: string
  movementType: string
}

/**
 * 🎯 HOOK DE INTEGRACIÓN CON CONTEXTO COMPARTIDO
 * 
 * Conecta el sistema de contexto compartido con el store del configurador
 * Sincroniza configuraciones entre el UI tradicional y el renderizado 3D
 */
export const useSharedConfigIntegration = () => {
  const [sharedConfig, setSharedConfig] = useState<SharedConfigState>({
    caseMaterial: 'oro_18k',
    caseColor: '#D4AF37',
    caseSize: '42mm',
    dialColor: 'blanco',
    dialStyle: 'analogo',
    strapMaterial: 'cuero',
    strapColor: 'negro',
    movementType: 'automatico'
  })
  
  const [isConfigSynced, setIsConfigSynced] = useState(false)
  const configuratorStore = useConfiguratorStore()
  
  // Sincronizar configuración del store con la configuración compartida
  const syncFromStore = useCallback(() => {
    if (!configuratorStore || !configuratorStore.currentConfiguration) return
    
    const config = configuratorStore.currentConfiguration as any
    
    setSharedConfig(prev => ({
      ...prev,
      caseMaterial: config.case?.material || prev.caseMaterial,
      caseColor: config.case?.color || prev.caseColor,
      caseSize: config.case?.size || prev.caseSize,
      dialColor: config.dial?.color || prev.dialColor,
      dialStyle: config.dial?.style || prev.dialStyle,
      strapMaterial: config.strap?.material || prev.strapMaterial,
      strapColor: config.strap?.color || prev.strapColor,
      movementType: config.movement?.type || prev.movementType
    }))
    
    console.log('🔄 Configuración sincronizada desde store')
  }, [configuratorStore])
  
  // Aplicar cambios a la configuración compartida
  const updateSharedConfig = useCallback((section: string, property: string, value: any) => {
    setSharedConfig(prev => {
      const newConfig = { ...prev }
      
      // Manejar propiedades específicas
      if (section === 'case') {
        if (property === 'material') {
          newConfig.caseMaterial = value
          // Mapear material a color por defecto
          const materialColors: Record<string, string> = {
            'oro_18k': '#D4AF37',
            'acero_inoxidable': '#C0C0C0',
            'titanio': '#808080'
          }
          newConfig.caseColor = materialColors[value] || newConfig.caseColor
        } else if (property === 'color') {
          newConfig.caseColor = value
        } else if (property === 'size') {
          newConfig.caseSize = value
        }
      } else if (section === 'dial') {
        if (property === 'color') {
          newConfig.dialColor = value
        } else if (property === 'style') {
          newConfig.dialStyle = value
        }
      } else if (section === 'strap') {
        if (property === 'material') {
          newConfig.strapMaterial = value
        } else if (property === 'color') {
          newConfig.strapColor = value
        }
      }
      
      return newConfig
    })
    
    // También actualizar el store si existe
    if (configuratorStore) {
      const updatedConfig = {
        ...configuratorStore.currentConfiguration,
        [section]: {
          ...configuratorStore.currentConfiguration?.[section as keyof typeof configuratorStore.currentConfiguration],
          [property]: value
        }
      }
      
      // Actualizar store (si tiene el método adecuado)
      if ('setCurrentConfiguration' in configuratorStore) {
        ;(configuratorStore as any).setCurrentConfiguration(updatedConfig)
      }
    }
    
    console.log(`🔧 Configuración compartida actualizada: ${section}.${property} = ${value}`)
  }, [configuratorStore])
  
  // Obtener configuración para renderizado 3D
  const get3DConfig = useCallback(() => {
    return {
      materials: {
        case: {
          metalness: sharedConfig.caseMaterial === 'oro_18k' ? 1.0 : 
                     sharedConfig.caseMaterial === 'acero_inoxidable' ? 1.0 : 0.9,
          roughness: sharedConfig.caseMaterial === 'oro_18k' ? 0.15 : 
                     sharedConfig.caseMaterial === 'acero_inoxidable' ? 0.25 : 0.35,
          color: sharedConfig.caseColor,
          ior: sharedConfig.caseMaterial === 'oro_18k' ? 2.5 : 
               sharedConfig.caseMaterial === 'acero_inoxidable' ? 2.7 : 2.4
        },
        dial: {
          color: sharedConfig.dialColor,
          style: sharedConfig.dialStyle
        },
        strap: {
          material: sharedConfig.strapMaterial,
          color: sharedConfig.strapColor
        }
      },
      dimensions: {
        caseSize: sharedConfig.caseSize
      }
    }
  }, [sharedConfig])
  
  // Resetear configuración
  const resetSharedConfig = useCallback(() => {
    setSharedConfig({
      caseMaterial: 'oro_18k',
      caseColor: '#D4AF37',
      caseSize: '42mm',
      dialColor: 'blanco',
      dialStyle: 'analogo',
      strapMaterial: 'cuero',
      strapColor: 'negro',
      movementType: 'automatico'
    })
    
    console.log('🔄 Configuración compartida reseteada')
  }, [])
  
  // Inicialización
  useEffect(() => {
    if (configuratorStore) {
      syncFromStore()
      setIsConfigSynced(true)
    }
  }, [configuratorStore, syncFromStore])
  
  return {
    sharedConfig,
    updateSharedConfig,
    get3DConfig,
    resetSharedConfig,
    isConfigSynced,
    syncFromStore
  }
}

export default useSharedConfigIntegration
/**
 * SELECTOR GRANULAR DE ELEMENTOS DEL RELOJ
 * 
 * Permite cambiar elementos individuales (correa, case, etc.) con vista previa IA
 * 
 * Características:
 * - Cambio granular sin afectar el resto
 * - Vista previa con IA antes de aplicar
 * - Opciones de configuración completa disponibles
 * - Transiciones suaves entre cambios
 */

import { useState, useEffect, useRef } from 'react'
import { Check, Loader2, Sparkles, X, Palette, Settings, Box, Watch, Hand, Link, Eye, Zap } from 'lucide-react'
import { GranularAIChangeService, type GranularChangeRequest } from '../lib/granularAIChangeService'
import { EnhancedGranularAIService, type ElementSpecificRequest } from '../lib/enhancedGranularAIService'
import { useConfiguratorStore, Material, WatchCase, WatchDial, WatchHands, WatchStrap } from '../store/configuratorStore'
import ModernButton from './Modern/ModernButton'
import { ActionButton, SelectionButton } from './Modern/ModernButton'
import ModernCard from './Modern/ModernCard'
import { ConfigElementCard, PreviewCard, StatusCard } from './Modern/ModernCard'
import { ModernAccordion, ModernStatus, AnimatedContainer, HoverEffects } from './Modern/AnimationSystem'

interface GranularElementSelectorProps {
  elementType: 'strap' | 'case' | 'material' | 'dial' | 'hands'
  currentElement: Material | WatchCase | WatchDial | WatchHands | WatchStrap | null
  allOptions: (Material | WatchCase | WatchDial | WatchHands | WatchStrap)[]
  onElementChange: (newElement: Material | WatchCase | WatchDial | WatchHands | WatchStrap) => void
  className?: string
  compact?: boolean
}

export default function GranularElementSelector({
  elementType,
  currentElement,
  allOptions,
  onElementChange,
  className = '',
  compact = false
}: GranularElementSelectorProps) {
  const [selectedElement, setSelectedElement] = useState<Material | WatchCase | WatchDial | WatchHands | WatchStrap | null>(currentElement)
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const [previewFallbackInfo, setPreviewFallbackInfo] = useState<{
    icon?: string
    description?: string
    colorIndicator?: string
  } | null>(null)
  const [isGeneratingPreview, setIsGeneratingPreview] = useState(false)
  const [previewMode, setPreviewMode] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showAllOptions, setShowAllOptions] = useState(false)
  
  const { currentConfiguration } = useConfiguratorStore()
  const timeoutRef = useRef<NodeJS.Timeout>()

  // Elementos UI según tipo
  const elementConfig = {
    strap: {
      icon: Link,
      title: 'Correa',
      color: '#8B4513',
      description: 'Cambiar solo la correa, mantener el resto del reloj igual'
    },
    case: {
      icon: Box,
      title: 'Caja',
      color: '#C0C0C0',
      description: 'Cambiar solo la forma de la caja, mantener todo lo demás igual'
    },
    material: {
      icon: Palette,
      title: 'Material',
      color: '#FFD700',
      description: 'Cambiar solo el material del reloj, mantener diseño igual'
    },
    dial: {
      icon: Watch,
      title: 'Esfera',
      color: '#1E3A8A',
      description: 'Cambiar solo el color de la esfera, mantener todo lo demás igual'
    },
    hands: {
      icon: Hand,
      title: 'Manecillas',
      color: '#374151',
      description: 'Cambiar solo el estilo de las manecillas, mantener el resto igual'
    }
  }

  const config = elementConfig[elementType]
  const IconComponent = config.icon

  // Generar vista previa cuando se selecciona elemento
  useEffect(() => {
    if (selectedElement && selectedElement.id !== currentElement?.id && !previewMode) {
      // Cancelar timeout anterior
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      
      // Generar vista previa con delay para evitar spam
      timeoutRef.current = setTimeout(() => {
        generatePreview()
      }, 500)
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [selectedElement])

  const generatePreview = async () => {
    if (!selectedElement || !currentConfiguration) return

    setIsGeneratingPreview(true)
    setError(null)

    try {
      // Crear request optimizado para IA mejorada
      const enhancedRequest: ElementSpecificRequest = {
        elementType,
        elementDetails: {
          name: selectedElement.name,
          description: selectedElement.description,
          color: (selectedElement as any).color || (selectedElement as any).color_hex,
          style: (selectedElement as any).style,
          material_type: (selectedElement as any).material_type,
          price: parseFloat((selectedElement as any).price || '0')
        },
        baseConfiguration: {
          material: currentConfiguration.material?.name || 'Acero',
          caseType: currentConfiguration.case?.name || 'Round',
          dialColor: currentConfiguration.dial?.name || 'Azul',
          strapType: currentConfiguration.strap?.name || 'Cuero',
          style: currentConfiguration.hands?.style || 'Clásico',
          description: `Reloj con ${elementType} modificado`
        },
        previewMode: 'individual'
      }

      // Usar servicio de IA mejorado
      const result = await EnhancedGranularAIService.generateElementPreview(enhancedRequest)

      if (result.success) {
        if (result.imageUrl) {
          // Resultado con imagen de IA
          setPreviewImage(result.imageUrl)
          setPreviewMode(true)
          
          // Log de optimización
          if (result.metadata?.generationTime) {
            console.log(`Vista previa de IA generada en ${result.metadata.generationTime}ms`)
          }
        } else if (result.metadata?.fallbackMode) {
          // Resultado de fallback (sin imagen, solo información visual)
          setPreviewImage(null)
          setPreviewMode(true)
          setPreviewFallbackInfo({
            icon: result.metadata.elementIcon,
            description: result.metadata.visualDescription,
            colorIndicator: result.metadata.colorIndicator
          })
          
          console.log('🎨 Vista previa de fallback activada (IA no disponible)')
          console.log('📋 Preview details:', {
            icon: result.metadata.elementIcon,
            description: result.metadata.visualDescription,
            color: result.metadata.colorIndicator
          })
        }
      } else {
        // Fallback al servicio original si el mejorado falla
        console.warn('Servicio IA mejorado falló, usando fallback...')
        const fallbackResult = await GranularAIChangeService.generateGranularPreview({
          elementType,
          elementDetails: enhancedRequest.elementDetails,
          baseConfiguration: {
            name: 'Configuración Actual',
            material: enhancedRequest.baseConfiguration.material,
            caseType: enhancedRequest.baseConfiguration.caseType,
            dialColor: enhancedRequest.baseConfiguration.dialColor,
            strapType: enhancedRequest.baseConfiguration.strapType,
            style: enhancedRequest.baseConfiguration.style as 'classic' | 'sport' | 'luxury' | 'modern' | 'elegant',
            description: enhancedRequest.baseConfiguration.description,
            price: 0,
            imageUrl: '',
            popularity: 95,
            id: 'fallback',
            handType: 'classic',
            keywords: ['configuracion', 'actual', 'personalizada']
          }
        })
        
        if (fallbackResult.success && fallbackResult.imageUrl) {
          setPreviewImage(fallbackResult.imageUrl)
          setPreviewMode(true)
        } else {
          throw new Error(fallbackResult.error || 'Error en vista previa')
        }
      }
    } catch (err) {
      console.error('Error generando vista previa:', err)
      setError(err instanceof Error ? err.message : 'Error generando vista previa')
    } finally {
      setIsGeneratingPreview(false)
    }
  }

  const applyChange = () => {
    if (selectedElement) {
      onElementChange(selectedElement)
      setPreviewMode(false)
      setPreviewImage(null)
      setPreviewFallbackInfo(null)
      setError(null)
    }
  }

  const cancelChange = () => {
    setSelectedElement(currentElement)
    setPreviewMode(false)
    setPreviewImage(null)
    setPreviewFallbackInfo(null)
    setError(null)
  }

  const resetPreview = () => {
    setPreviewMode(false)
    setPreviewImage(null)
    setPreviewFallbackInfo(null)
    setError(null)
  }

  return (
    <AnimatedContainer animation="fadeIn" className={`space-y-4 ${className}`}>
      {/* Header del selector mejorado */}
      <ModernCard hover="lift" className="overflow-hidden">
        <div className="p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: config.color + '20' }}>
              <HoverEffects effect="glow" className="w-full h-full rounded-xl flex items-center justify-center">
                <IconComponent className="w-6 h-6" style={{ color: config.color }} />
              </HoverEffects>
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-neutral-900 mb-1">{config.title}</h3>
              <p className="text-sm text-neutral-600">{config.description}</p>
            </div>
            <ModernButton
              variant="secondary"
              size="sm"
              onClick={() => setShowAllOptions(!showAllOptions)}
              icon={showAllOptions ? <Eye className="w-4 h-4" /> : <Settings className="w-4 h-4" />}
            >
              {showAllOptions ? 'Ocultar' : 'Ver'} Todas ({allOptions.length})
            </ModernButton>
          </div>

          {/* Elemento actual */}
          {currentElement && (
            <div className="bg-gradient-to-r from-gold-50 to-transparent border border-gold-200 rounded-xl p-4">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full border-2 border-white shadow-lg" 
                     style={{ backgroundColor: (currentElement as any).color || (currentElement as any).color_hex }} />
                <div className="flex-1">
                  <span className="font-semibold text-neutral-900 block">{currentElement.name}</span>
                  <p className="text-sm text-neutral-600 line-clamp-1">{currentElement.description}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Check className="w-4 h-4 text-green-500" />
                    <span className="text-xs font-medium text-green-700">Actual</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-lg font-bold text-gold-600">
                    {parseFloat((currentElement as any).price || '0').toLocaleString('es-ES')} €
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </ModernCard>

      {/* Opciones disponibles mejoradas */}
      <AnimatedContainer animation="slideUp" delay={200}>
        <ModernAccordion
          title={`Cambiar ${config.title}`}
          icon={config.title.charAt(0).toUpperCase()}
          defaultOpen={false}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            {allOptions.map((option, index) => (
              <AnimatedContainer key={option.id} animation="scale" delay={index * 50}>
                <SelectionButton
                  selected={selectedElement?.id === option.id}
                  price={parseFloat((option as any).price || '0').toLocaleString('es-ES') + ' €'}
                  name={option.name}
                  description={option.description}
                  color={config.color}
                  onClick={() => setSelectedElement(option)}
                  className="transition-all duration-300 hover:scale-105"
                />
              </AnimatedContainer>
            ))}
          </div>
        </ModernAccordion>
      </AnimatedContainer>

      {/* Vista previa mejorada con IA o Fallback */}
      {(previewImage || previewFallbackInfo) && (
        <AnimatedContainer animation="fadeIn">
          <PreviewCard
            image={previewImage}
            title={previewImage ? 'Vista Previa IA' : 'Vista Previa Visual'}
            subtitle={`Cambio: ${selectedElement?.name}`}
            fallbackMode={!previewImage}
            description={previewFallbackInfo?.description}
          >
            <div className="mt-4 space-y-3">
              {/* Estado de la vista previa */}
              <StatusCard
                status={previewImage ? 'success' : 'pending'}
                title={`Vista previa ${previewImage ? 'IA generada' : 'visual'}`}
                description={`Solo se modifica el ${config.title.toLowerCase()}, manteniendo el resto exactamente igual`}
                value={selectedElement ? parseFloat((selectedElement as any).price || '0').toLocaleString('es-ES') + ' €' : undefined}
              />
              
              {/* Botones de acción */}
              <div className="flex gap-3">
                <ActionButton
                  action="apply"
                  onClick={applyChange}
                  className="flex-1"
                >
                  Aplicar Cambio
                </ActionButton>
                <ActionButton
                  action="cancel"
                  onClick={cancelChange}
                  className="flex-1"
                >
                  Cancelar
                </ActionButton>
              </div>
            </div>
          </PreviewCard>
        </AnimatedContainer>
      )}

      {/* Estado de carga mejorado */}
      {isGeneratingPreview && (
        <AnimatedContainer animation="fadeIn">
          <StatusCard
            status="loading"
            title="Generando vista previa..."
            description={`Analizando cambio de ${config.title.toLowerCase()}`}
          />
        </AnimatedContainer>
      )}

      {/* Error mejorado */}
      {error && (
        <AnimatedContainer animation="fadeIn">
          <ModernStatus
            status="error"
            title="Error en vista previa"
            description={error}
            dismissible
            onDismiss={() => setError(null)}
          />
        </AnimatedContainer>
      )}
    </AnimatedContainer>
  )
}
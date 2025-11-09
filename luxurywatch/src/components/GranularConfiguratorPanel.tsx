/**
 * PANEL DE CONFIGURACIÓN GRANULAR
 * 
 * Panel que permite cambiar elementos individuales del reloj con vista previa IA
 * 
 * Características:
 * - Cambio granular de cada elemento
 * - Vista previa IA antes de aplicar
 * - Configuración inteligente
 * - Interfaz intuitiva y fluida
 */

import { useState, useEffect } from 'react'
import { Sparkles, Settings, RotateCcw, CheckCircle, AlertCircle, Link, Box, Palette, Watch, Hand } from 'lucide-react'
import { useConfiguratorStore } from '../store/configuratorStore'
import GranularElementSelector from './GranularElementSelector'
import ModernButton from './Modern/ModernButton'
import { ActionButton } from './Modern/ModernButton'
import ModernCard from './Modern/ModernCard'
import { ConfigElementCard, StatusCard } from './Modern/ModernCard'
import { ModernAccordion, AnimatedContainer, HoverEffects, ModernProgress } from './Modern/AnimationSystem'

interface GranularConfiguratorPanelProps {
  onConfigurationChange?: (config: any) => void
  className?: string
  compact?: boolean
}

export default function GranularConfiguratorPanel({
  onConfigurationChange,
  className = '',
  compact = false
}: GranularConfiguratorPanelProps) {
  const {
    currentConfiguration,
    materials,
    cases,
    dials,
    hands,
    straps,
    setMaterial,
    setCase,
    setDial,
    setHands,
    setStrap,
    getTotalPrice
  } = useConfiguratorStore()

  const [activeElement, setActiveElement] = useState<string | null>(null)
  const [appliedChanges, setAppliedChanges] = useState<Set<string>>(new Set())
  const [isProcessing, setIsProcessing] = useState(false)
  const [showSummary, setShowSummary] = useState(false)

  // Contar cambios aplicados
  useEffect(() => {
    const changes = new Set<string>()
    if (currentConfiguration.material) changes.add('material')
    if (currentConfiguration.case) changes.add('case')
    if (currentConfiguration.dial) changes.add('dial')
    if (currentConfiguration.hands) changes.add('hands')
    if (currentConfiguration.strap) changes.add('strap')
    setAppliedChanges(changes)
  }, [currentConfiguration])

  // Notificar cambios
  useEffect(() => {
    if (onConfigurationChange) {
      onConfigurationChange(currentConfiguration)
    }
  }, [currentConfiguration, onConfigurationChange])

  const elements = [
    {
      key: 'strap',
      title: 'Correa',
      icon: 'link',
      current: currentConfiguration.strap,
      allOptions: straps,
      handler: setStrap,
      color: '#8B4513'
    },
    {
      key: 'case',
      title: 'Caja',
      icon: 'box',
      current: currentConfiguration.case,
      allOptions: cases,
      handler: setCase,
      color: '#C0C0C0'
    },
    {
      key: 'material',
      title: 'Material',
      icon: 'palette',
      current: currentConfiguration.material,
      allOptions: materials,
      handler: setMaterial,
      color: '#FFD700'
    },
    {
      key: 'dial',
      title: 'Esfera',
      icon: 'watch',
      current: currentConfiguration.dial,
      allOptions: dials,
      handler: setDial,
      color: '#1E3A8A'
    },
    {
      key: 'hands',
      title: 'Manecillas',
      icon: 'hand',
      current: currentConfiguration.hands,
      allOptions: hands,
      handler: setHands,
      color: '#374151'
    }
  ]

  const handleElementChange = async (elementKey: string, newElement: any) => {
    setIsProcessing(true)
    
    try {
      // Aplicar el cambio específico
      const element = elements.find(e => e.key === elementKey)
      if (element) {
        element.handler(newElement)
        
        // Simular tiempo de procesamiento para experiencia fluida
        await new Promise(resolve => setTimeout(resolve, 300))
      }
    } finally {
      setIsProcessing(false)
    }
  }

  const resetConfiguration = () => {
    // Resetear configuración
    setMaterial(null as any)
    setCase(null as any)
    setDial(null as any)
    setHands(null as any)
    setStrap(null as any)
  }

  const completedElements = appliedChanges.size
  const totalElements = elements.length
  const progressPercentage = (completedElements / totalElements) * 100

  // Iconos modernos para cada elemento
  const iconComponents = {
    link: Link,
    box: Box,
    palette: Palette,
    watch: Watch,
    hand: Hand
  }

  if (compact) {
    return (
      <AnimatedContainer animation="fadeIn">
        <div className={`space-y-4 ${className}`}>
          <div className="flex items-center gap-3 mb-4">
            <HoverEffects effect="glow">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
            </HoverEffects>
            <h3 className="font-bold text-xl text-neutral-900">Cambios Individuales</h3>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            {elements.map((element, index) => {
              const IconComponent = iconComponents[element.icon as keyof typeof iconComponents] || Settings
              return (
                <AnimatedContainer key={element.key} animation="scale" delay={index * 100}>
                  <ConfigElementCard
                    title={element.title}
                    subtitle={element.current?.name || 'No seleccionado'}
                    icon={<IconComponent className="w-6 h-6" />}
                    color={element.color}
                    selected={appliedChanges.has(element.key)}
                    price={element.current ? parseFloat((element.current as any).price || '0') + ' €' : undefined}
                    onClick={() => setActiveElement(activeElement === element.key ? null : element.key)}
                    className="transition-all duration-300 hover:scale-105"
                  />
                </AnimatedContainer>
              )
            })}
          </div>

          {/* Panel expandido para elemento activo */}
          {activeElement && (
            <div className="mt-4 border-t border-neutral-200 pt-4">
              {elements
                .filter(element => element.key === activeElement)
                .map(element => (
                  <GranularElementSelector
                    key={element.key}
                    elementType={element.key as any}
                    currentElement={element.current}
                    allOptions={element.allOptions}
                    onElementChange={(newElement) => handleElementChange(element.key, newElement)}
                    compact={true}
                  />
                ))
              }
            </div>
          )}
        </div>
      </AnimatedContainer>
    )
  }

  return (
    <AnimatedContainer animation="fadeIn" className={`space-y-6 ${className}`}>
      {/* Header con resumen mejorado */}
      <HoverEffects effect="glow">
        <div className="bg-gradient-to-br from-[#D4AF37] to-[#B8860B] rounded-2xl p-8 text-white shadow-modern-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                <Settings className="w-8 h-8" />
              </div>
              <div>
                <h2 className="text-3xl font-bold mb-1">Configuración Granular</h2>
                <p className="text-sm opacity-90">
                  Cambia elementos individuales con vista previa IA
                </p>
              </div>
            </div>
            
            <div className="text-right">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle className="w-6 h-6" />
                <span className="font-bold text-lg">
                  {completedElements}/{totalElements} elementos
                </span>
              </div>
              <p className="text-3xl font-bold">
                {getTotalPrice().toLocaleString('es-ES')} €
              </p>
            </div>
          </div>

          {/* Barra de progreso mejorada */}
          <div className="mt-6">
            <div className="flex justify-between text-sm opacity-90 mb-2">
              <span>Progreso de configuración</span>
              <span>{Math.round(progressPercentage)}% completado</span>
            </div>
            <ModernProgress 
              value={progressPercentage} 
              max={100} 
              color="#FFFFFF" 
              size="lg"
              showText={false}
            />
          </div>
        </div>
      </HoverEffects>

      {/* Selectores granulares mejorados */}
      <div className="space-y-4">
        {elements.map((element, index) => {
          const IconComponent = iconComponents[element.icon as keyof typeof iconComponents] || Settings
          const isActive = activeElement === element.key
          
          return (
            <AnimatedContainer key={element.key} animation="slideUp" delay={index * 150}>
              <ModernAccordion
                title={element.title}
                icon={element.title.charAt(0).toUpperCase()}
                defaultOpen={false}
              >
                <div className="pt-4">
                  {/* Información del elemento actual */}
                  {element.current && (
                    <div className="mb-4 p-4 bg-gradient-to-r from-gold-50 to-transparent border border-gold-200 rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-bold" 
                             style={{ backgroundColor: element.color }}>
                          <IconComponent className="w-4 h-4" />
                        </div>
                        <div className="flex-1">
                          <span className="font-semibold text-neutral-900 block">{element.current.name}</span>
                          <p className="text-sm text-neutral-600">{element.current.description}</p>
                        </div>
                        <div className="text-right">
                          <span className="font-bold text-gold-600">
                            {parseFloat((element.current as any).price || '0').toLocaleString('es-ES')} €
                          </span>
                          {appliedChanges.has(element.key) && (
                            <div className="flex items-center gap-1 mt-1">
                              <CheckCircle className="w-4 h-4 text-green-500" />
                              <span className="text-xs font-medium text-green-700">Configurado</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Selector granular */}
                  <GranularElementSelector
                    elementType={element.key as any}
                    currentElement={element.current}
                    allOptions={element.allOptions}
                    onElementChange={(newElement) => handleElementChange(element.key, newElement)}
                  />
                </div>
              </ModernAccordion>
            </AnimatedContainer>
          )
        })}
      </div>

      {/* Resumen y acciones mejoradas */}
      <AnimatedContainer animation="fadeIn" delay={500}>
        <StatusCard
          status="pending"
          title="Resumen de Configuración"
          description={`Has configurado ${completedElements} de ${totalElements} elementos`}
          value={getTotalPrice().toLocaleString('es-ES') + ' €'}
        >
          <div className="mt-4 p-4 bg-neutral-50 rounded-xl">
            <h4 className="font-semibold text-neutral-900 mb-3">Elementos configurados:</h4>
            <div className="space-y-2">
              {elements.map(element => (
                <div key={element.key} className="flex items-center justify-between py-1">
                  <span className="text-sm text-neutral-700">{element.title}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-neutral-900">
                      {element.current ? element.current.name : 'No seleccionado'}
                    </span>
                    {appliedChanges.has(element.key) && (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="flex gap-3 mt-6">
            <ActionButton
              action="reset"
              onClick={resetConfiguration}
              className="flex-1"
            >
              <RotateCcw className="w-4 h-4" />
              Resetear Todo
            </ActionButton>
            
            <ActionButton
              action="confirm"
              onClick={() => setShowSummary(!showSummary)}
              className="flex-1"
            >
              <Sparkles className="w-4 h-4" />
              {showSummary ? 'Ocultar' : 'Ver'} Resumen
            </ActionButton>
          </div>
        </StatusCard>
      </AnimatedContainer>

      {/* Estado de procesamiento mejorado */}
      {isProcessing && (
        <AnimatedContainer animation="fadeIn">
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-8 shadow-2xl max-w-sm w-full mx-4">
              <div className="text-center">
                <div className="w-16 h-16 bg-gold-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <div className="w-8 h-8 border-2 border-gold-600 border-t-transparent rounded-full animate-spin" />
                </div>
                <h3 className="text-lg font-semibold text-neutral-900 mb-2">Aplicando cambios...</h3>
                <p className="text-sm text-neutral-600">Actualizando configuración</p>
                <div className="mt-4">
                  <ModernProgress value={75} max={100} color="#D4AF37" showText={false} />
                </div>
              </div>
            </div>
          </div>
        </AnimatedContainer>
      )}
    </AnimatedContainer>
  )
}
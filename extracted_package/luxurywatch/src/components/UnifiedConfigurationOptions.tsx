/**
 * COMPONENTE UNIFICADO DE OPCIONES DE PERSONALIZACIÓN
 * 
 * Proporciona las mismas opciones de personalización para los 3 configuradores:
 * - IA Configurador
 * - Ultra Rápido
 * - CONFIGURADOR 3D
 * 
 * Características:
 * - Materiales (Oro, Acero, Titanio, Cerámica, etc.)
 * - Cajas (Round, Square, Cushion, etc.)
 * - Esferas (Azul, Negra, Blanca, Verde, Roja, etc.)
 * - Manecillas (Classic, Sport, Modern, Elegant, etc.)
 * - Correas (Cuero, Metal, Caucho, Malla, etc.)
 * 
 * Todos los configuradores comparten la misma base de datos y opciones.
 * Solo cambia la visualización (IA/2D vs 3D).
 */

import { useEffect, useState } from 'react'
import { Check, Loader2, Settings, Sparkles } from 'lucide-react'
import { useConfiguratorStore, Material, WatchCase, WatchDial, WatchHands, WatchStrap } from '../store/configuratorStore'
import { supabase } from '../lib/supabaseClient'
import GranularConfiguratorPanel from './GranularConfiguratorPanel'
import {
  HARDCODED_MATERIALS,
  HARDCODED_CASES,
  HARDCODED_DIALS,
  HARDCODED_HANDS,
  HARDCODED_STRAPS
} from '../data/hardcodedWatchOptions'

interface UnifiedConfigurationOptionsProps {
  onConfigurationChange?: (config: {
    material: Material | null
    case: WatchCase | null
    dial: WatchDial | null
    hands: WatchHands | null
    strap: WatchStrap | null
  }) => void
  compact?: boolean // Vista compacta para espacios reducidos
  className?: string
}

export default function UnifiedConfigurationOptions({
  onConfigurationChange,
  compact = false,
  className = ''
}: UnifiedConfigurationOptionsProps) {
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
    setMaterials,
    setCases,
    setDials,
    setHandsOptions,
    setStraps
  } = useConfiguratorStore()

  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [granularMode, setGranularMode] = useState(false)

  // Cargar opciones desde base de datos
  useEffect(() => {
    loadConfigurationOptions()
  }, [])

  // Notificar cambios de configuración
  useEffect(() => {
    if (onConfigurationChange) {
      onConfigurationChange(currentConfiguration)
    }
  }, [currentConfiguration, onConfigurationChange])

  const loadConfigurationOptions = async () => {
    try {
      setIsLoading(true)
      setError(null)

      // ESTRATEGIA: Intentar cargar desde Supabase, usar hardcoded como fallback
      let materialsData: Material[] = []
      let casesData: WatchCase[] = []
      let dialsData: WatchDial[] = []
      let handsData: WatchHands[] = []
      let strapsData: WatchStrap[] = []

      try {
        // Intentar cargar desde Supabase con manejo silencioso de errores
        const [materialsRes, casesRes, dialsRes, handsRes, strapsRes] = await Promise.allSettled([
          supabase.from('materials').select('*').order('price'),
          supabase.from('cases').select('*').order('price'),
          supabase.from('dials').select('*').order('price'),
          supabase.from('hands').select('*').order('price'),
          supabase.from('straps').select('*').order('price')
        ])

        // Verificar si todas las consultas fueron exitosas
        const allSuccessful = [materialsRes, casesRes, dialsRes, handsRes, strapsRes]
          .every(result => result.status === 'fulfilled' && 
                     !result.value.error && 
                     result.value.data && 
                     result.value.data.length > 0)

        if (allSuccessful) {
          // Usar datos de Supabase
          materialsData = materialsRes.status === 'fulfilled' ? materialsRes.value.data || [] : []
          casesData = casesRes.status === 'fulfilled' ? casesRes.value.data || [] : []
          dialsData = dialsRes.status === 'fulfilled' ? dialsRes.value.data || [] : []
          handsData = handsRes.status === 'fulfilled' ? handsRes.value.data || [] : []
          strapsData = strapsRes.status === 'fulfilled' ? strapsRes.value.data || [] : []
          
          console.log('✅ Datos cargados desde Supabase')
        } else {
          // Usar datos hardcoded como fallback
          console.log('ℹ️ Usando datos hardcodeados (tablas Supabase no disponibles)')
          materialsData = HARDCODED_MATERIALS
          casesData = HARDCODED_CASES
          dialsData = HARDCODED_DIALS
          handsData = HARDCODED_HANDS
          strapsData = HARDCODED_STRAPS
        }
      } catch (supabaseError) {
        // Si Supabase falla completamente, usar hardcoded silenciosamente
        console.log('ℹ️ Usando datos hardcodeados (error de conexión)')
        materialsData = HARDCODED_MATERIALS
        casesData = HARDCODED_CASES
        dialsData = HARDCODED_DIALS
        handsData = HARDCODED_HANDS
        strapsData = HARDCODED_STRAPS
      }

      // Actualizar store
      setMaterials(materialsData)
      setCases(casesData)
      setDials(dialsData)
      setHandsOptions(handsData)
      setStraps(strapsData)

      // Seleccionar opciones por defecto si no hay configuración actual
      if (!currentConfiguration.material && materialsData.length > 0) {
        setMaterial(materialsData[0])
      }
      if (!currentConfiguration.case && casesData.length > 0) {
        setCase(casesData[0])
      }
      if (!currentConfiguration.dial && dialsData.length > 0) {
        setDial(dialsData[0])
      }
      if (!currentConfiguration.hands && handsData.length > 0) {
        setHands(handsData[0])
      }
      if (!currentConfiguration.strap && strapsData.length > 0) {
        setStrap(strapsData[0])
      }

      setIsLoading(false)
    } catch (err) {
      console.error('Error cargando opciones de configuración:', err)
      setError('Error al cargar opciones. Por favor, recarga la página.')
      setIsLoading(false)
    }
  }

  // Loading state
  if (isLoading) {
    return (
      <div className={`bg-white rounded-2xl p-6 shadow-lg ${className}`}>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-[#D4AF37]" />
          <span className="ml-3 text-neutral-600">Cargando opciones de personalización...</span>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className={`bg-white rounded-2xl p-6 shadow-lg ${className}`}>
        <div className="text-center py-8">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={loadConfigurationOptions}
            className="px-6 py-3 bg-[#D4AF37] text-white rounded-xl font-medium hover:opacity-90 transition-opacity"
          >
            Reintentar
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Selector de Modo */}
      <div className="bg-gradient-to-r from-[#D4AF37] to-[#B8860B] rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Settings className="w-8 h-8" />
            <div>
              <h2 className="text-2xl font-bold">Opciones de Personalización</h2>
              <p className="text-sm opacity-90">Elige cómo quieres personalizar tu reloj</p>
            </div>
          </div>
          
          <div className="flex bg-white/20 rounded-xl p-1">
            <button
              onClick={() => setGranularMode(false)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                !granularMode 
                  ? 'bg-white text-[#D4AF37]' 
                  : 'text-white hover:bg-white/10'
              }`}
            >
              Rápido
            </button>
            <button
              onClick={() => setGranularMode(true)}
              className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                granularMode 
                  ? 'bg-white text-[#D4AF37]' 
                  : 'text-white hover:bg-white/10'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              IA Granular
            </button>
          </div>
        </div>
      </div>

      {/* Modo Granular con IA */}
      {granularMode && (
        <div className="animate-in fade-in duration-500">
          <GranularConfiguratorPanel 
            onConfigurationChange={onConfigurationChange}
            compact={compact}
          />
        </div>
      )}

      {/* Modo Rápido (Original) */}
      {!granularMode && (
        <div className="space-y-6">
          {/* Materiales */}
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <h3 className="text-lg font-bold text-neutral-900 mb-4">Material</h3>
        <div className={`grid ${compact ? 'grid-cols-2' : 'grid-cols-2 md:grid-cols-3'} gap-3`}>
          {materials.map((material) => (
            <button
              key={material.id}
              onClick={() => setMaterial(material)}
              className={`relative p-4 rounded-xl border-2 transition-all text-left ${
                currentConfiguration.material?.id === material.id
                  ? 'border-[#D4AF37] bg-[#D4AF37]/5'
                  : 'border-neutral-200 hover:border-neutral-300'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <div
                      className="w-6 h-6 rounded-full border-2 border-white shadow"
                      style={{ backgroundColor: material.color_hex }}
                    />
                    <span className="font-bold text-sm text-neutral-900">{material.name}</span>
                  </div>
                  <p className="text-xs text-neutral-600 line-clamp-2">{material.description}</p>
                  <p className="text-sm font-bold text-[#D4AF37] mt-2">{parseFloat(material.price).toLocaleString('es-ES')} €</p>
                </div>
                {currentConfiguration.material?.id === material.id && (
                  <div className="w-6 h-6 bg-[#D4AF37] rounded-full flex items-center justify-center flex-shrink-0">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Cajas */}
      <div className="bg-white rounded-2xl p-6 shadow-lg">
        <h3 className="text-lg font-bold text-neutral-900 mb-4">Caja</h3>
        <div className={`grid ${compact ? 'grid-cols-2' : 'grid-cols-2 md:grid-cols-3'} gap-3`}>
          {cases.map((watchCase) => (
            <button
              key={watchCase.id}
              onClick={() => setCase(watchCase)}
              className={`relative p-4 rounded-xl border-2 transition-all text-left ${
                currentConfiguration.case?.id === watchCase.id
                  ? 'border-[#D4AF37] bg-[#D4AF37]/5'
                  : 'border-neutral-200 hover:border-neutral-300'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <span className="font-bold text-sm text-neutral-900 block mb-1">{watchCase.name}</span>
                  <p className="text-xs text-neutral-600 line-clamp-2">{watchCase.description}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs text-neutral-500">{watchCase.shape}</span>
                    <span className="text-xs text-neutral-500">•</span>
                    <span className="text-xs text-neutral-500">{watchCase.size_mm}</span>
                  </div>
                  <p className="text-sm font-bold text-[#D4AF37] mt-2">{parseFloat(watchCase.price).toLocaleString('es-ES')} €</p>
                </div>
                {currentConfiguration.case?.id === watchCase.id && (
                  <div className="w-6 h-6 bg-[#D4AF37] rounded-full flex items-center justify-center flex-shrink-0">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Esferas */}
      <div className="bg-white rounded-2xl p-6 shadow-lg">
        <h3 className="text-lg font-bold text-neutral-900 mb-4">Esfera</h3>
        <div className={`grid ${compact ? 'grid-cols-2' : 'grid-cols-2 md:grid-cols-3'} gap-3`}>
          {dials.map((dial) => (
            <button
              key={dial.id}
              onClick={() => setDial(dial)}
              className={`relative p-4 rounded-xl border-2 transition-all text-left ${
                currentConfiguration.dial?.id === dial.id
                  ? 'border-[#D4AF37] bg-[#D4AF37]/5'
                  : 'border-neutral-200 hover:border-neutral-300'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <div
                      className="w-6 h-6 rounded-full border-2 border-white shadow"
                      style={{ backgroundColor: dial.color_hex }}
                    />
                    <span className="font-bold text-sm text-neutral-900">{dial.name}</span>
                  </div>
                  <p className="text-xs text-neutral-600 line-clamp-2">{dial.description}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs text-neutral-500">{dial.style_category}</span>
                    <span className="text-xs text-neutral-500">•</span>
                    <span className="text-xs text-neutral-500">{dial.pattern_type}</span>
                  </div>
                  <p className="text-sm font-bold text-[#D4AF37] mt-2">{parseFloat(dial.price).toLocaleString('es-ES')} €</p>
                </div>
                {currentConfiguration.dial?.id === dial.id && (
                  <div className="w-6 h-6 bg-[#D4AF37] rounded-full flex items-center justify-center flex-shrink-0">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Manecillas */}
      <div className="bg-white rounded-2xl p-6 shadow-lg">
        <h3 className="text-lg font-bold text-neutral-900 mb-4">Manecillas</h3>
        <div className={`grid ${compact ? 'grid-cols-2' : 'grid-cols-2 md:grid-cols-3'} gap-3`}>
          {hands.map((hand) => (
            <button
              key={hand.id}
              onClick={() => setHands(hand)}
              className={`relative p-4 rounded-xl border-2 transition-all text-left ${
                currentConfiguration.hands?.id === hand.id
                  ? 'border-[#D4AF37] bg-[#D4AF37]/5'
                  : 'border-neutral-200 hover:border-neutral-300'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <span className="font-bold text-sm text-neutral-900 block mb-1">{hand.name}</span>
                  <p className="text-xs text-neutral-600 line-clamp-2">{hand.description}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs text-neutral-500">{hand.style}</span>
                    <span className="text-xs text-neutral-500">•</span>
                    <span className="text-xs text-neutral-500">{hand.material_type}</span>
                  </div>
                  <p className="text-sm font-bold text-[#D4AF37] mt-2">{parseFloat(hand.price).toLocaleString('es-ES')} €</p>
                </div>
                {currentConfiguration.hands?.id === hand.id && (
                  <div className="w-6 h-6 bg-[#D4AF37] rounded-full flex items-center justify-center flex-shrink-0">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Correas */}
      <div className="bg-white rounded-2xl p-6 shadow-lg">
        <h3 className="text-lg font-bold text-neutral-900 mb-4">Correa</h3>
        <div className={`grid ${compact ? 'grid-cols-2' : 'grid-cols-2 md:grid-cols-3'} gap-3`}>
          {straps.map((strap) => (
            <button
              key={strap.id}
              onClick={() => setStrap(strap)}
              className={`relative p-4 rounded-xl border-2 transition-all text-left ${
                currentConfiguration.strap?.id === strap.id
                  ? 'border-[#D4AF37] bg-[#D4AF37]/5'
                  : 'border-neutral-200 hover:border-neutral-300'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <span className="font-bold text-sm text-neutral-900 block mb-1">{strap.name}</span>
                  <p className="text-xs text-neutral-600 line-clamp-2">{strap.description}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs text-neutral-500">{strap.material_type}</span>
                    <span className="text-xs text-neutral-500">•</span>
                    <span className="text-xs text-neutral-500">{strap.style}</span>
                  </div>
                  <p className="text-sm font-bold text-[#D4AF37] mt-2">{parseFloat(strap.price).toLocaleString('es-ES')} €</p>
                </div>
                {currentConfiguration.strap?.id === strap.id && (
                  <div className="w-6 h-6 bg-[#D4AF37] rounded-full flex items-center justify-center flex-shrink-0">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

          {/* Resumen de Precio Total */}
          <div className="bg-gradient-to-br from-[#D4AF37] to-[#B8860B] rounded-2xl p-6 shadow-lg text-white">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold mb-1">Precio Total</h3>
                <p className="text-sm opacity-90">Configuración personalizada</p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold">
                  {useConfiguratorStore.getState().getTotalPrice().toLocaleString('es-ES')} €
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

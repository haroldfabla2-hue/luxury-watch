/**
 * CONFIGURADOR HÍBRIDO CON IA - GOOGLE GEMINI 2.0 FLASH
 * 
 * Sistema revolucionario que combina:
 * 1. Biblioteca pre-hecha (100+ configuraciones populares) - Carga instantánea
 * 2. IA tiempo real (Google Gemini 2.0 Flash) - Generación fotorrealista
 * 3. Configurador 3D (Three.js) - Fallback interactivo
 * 
 * PRIORIZACIÓN INTELIGENTE:
 * - Si descripción coincide con biblioteca → Carga instantánea
 * - Si es estilo único/personalizado → Genera con IA
 * - Si ambos fallan → Usa configurador 3D interactivo
 */

import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Sparkles, Loader2, Box, Image as ImageIcon, Settings } from 'lucide-react'
import { 
  generateWatchWithCache, 
  parseNaturalDescription,
  type WatchGenerationRequest,
  type WatchGenerationResult 
} from '../lib/geminiAIService'
import {
  searchPopularConfigurations,
  getTopPopularConfigurations,
  type PopularConfiguration
} from '../data/popularWatchConfigurations'
import { useConfiguratorStore } from '../store/configuratorStore'
import UnifiedConfigurationOptions from './UnifiedConfigurationOptions'

type RenderMethod = 'library' | 'ai' | '3d' | 'idle'

interface AIWatchConfiguratorProps {
  onConfigurationSelect?: (config: any) => void
}

export default function AIWatchConfigurator({ onConfigurationSelect }: AIWatchConfiguratorProps) {
  const navigate = useNavigate()
  const configuratorStore = useConfiguratorStore()
  
  // Estado principal
  const [description, setDescription] = useState('')
  const [renderMethod, setRenderMethod] = useState<RenderMethod>('idle')
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedImage, setGeneratedImage] = useState<WatchGenerationResult | null>(null)
  const [selectedPopularConfig, setSelectedPopularConfig] = useState<PopularConfiguration | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false)
  
  // Sugerencias populares
  const [popularConfigs, setPopularConfigs] = useState<PopularConfiguration[]>([])
  const [searchResults, setSearchResults] = useState<PopularConfiguration[]>([])
  
  // Cargar configuraciones populares al inicio
  useEffect(() => {
    const top = getTopPopularConfigurations(12)
    setPopularConfigs(top)
  }, [])
  
  // Búsqueda en tiempo real
  useEffect(() => {
    if (description.trim().length > 2) {
      const results = searchPopularConfigurations(description)
      setSearchResults(results.slice(0, 6))
    } else {
      setSearchResults([])
    }
  }, [description])
  
  /**
   * SISTEMA DE DECISIÓN INTELIGENTE
   * Decide automáticamente qué método usar
   */
  const handleGenerateOrSearch = async () => {
    if (!description.trim()) {
      setError('Por favor describe el reloj que deseas')
      return
    }
    
    setError(null)
    setIsGenerating(true)
    setGeneratedImage(null)
    setSelectedPopularConfig(null)
    
    try {
      // PRIORIDAD 1: Buscar en biblioteca pre-hecha
      const popularMatches = searchPopularConfigurations(description)
      
      if (popularMatches.length > 0 && popularMatches[0].popularity > 80) {
        console.log('[Sistema Híbrido] Usando biblioteca pre-hecha (carga instantánea)')
        setRenderMethod('library')
        setSelectedPopularConfig(popularMatches[0])
        
        // Notificar selección
        if (onConfigurationSelect) {
          onConfigurationSelect({
            method: 'library',
            config: popularMatches[0]
          })
        }
        
        setIsGenerating(false)
        return
      }
      
      // PRIORIDAD 2: Generar con IA (Gemini 2.0 Flash)
      console.log('[Sistema Híbrido] Generando con IA - Gemini 2.0 Flash')
      setRenderMethod('ai')
      
      const parsedRequest = parseNaturalDescription(description)
      const result = await generateWatchWithCache(parsedRequest)
      
      if (result.success) {
        setGeneratedImage(result)
        
        // Notificar generación exitosa
        if (onConfigurationSelect) {
          onConfigurationSelect({
            method: 'ai',
            result
          })
        }
      } else {
        // PRIORIDAD 3: Fallback a configurador 3D
        console.log('[Sistema Híbrido] Fallback a configurador 3D interactivo')
        setRenderMethod('3d')
        setError('Modo IA no disponible. Usando configurador 3D interactivo.')
      }
      
    } catch (err) {
      console.error('[Sistema Híbrido] Error:', err)
      setRenderMethod('3d')
      setError('Error al generar. Usa el configurador 3D interactivo.')
    } finally {
      setIsGenerating(false)
    }
  }
  
  /**
   * Seleccionar configuración popular directamente
   */
  const handleSelectPopularConfig = (config: PopularConfiguration) => {
    setSelectedPopularConfig(config)
    setRenderMethod('library')
    setDescription(config.description)
    setGeneratedImage(null)
    setError(null)
    
    if (onConfigurationSelect) {
      onConfigurationSelect({
        method: 'library',
        config
      })
    }
  }
  
  /**
   * Limpiar y reiniciar
   */
  const handleReset = () => {
    setDescription('')
    setRenderMethod('idle')
    setGeneratedImage(null)
    setSelectedPopularConfig(null)
    setError(null)
    setSearchResults([])
  }
  
  /**
   * Navegar al configurador 3D con configuración pre-cargada
   * OPTIMIZADO: Redirige al configurador optimizado (renders pre-procesados)
   */
  const handleCustomizeMore = async (config: PopularConfiguration) => {
    try {
      // Cargar datos desde la base de datos basados en la configuración popular
      const { materials, cases, dials, straps } = configuratorStore
      
      // Mapear configuración popular a configuración del store
      // Buscar elementos que coincidan con las características
      const matchedMaterial = materials.find(m => 
        m.material_type.toLowerCase().includes(config.material.toLowerCase())
      )
      
      const matchedCase = cases.find(c => 
        c.shape.toLowerCase().includes(config.caseType.toLowerCase()) ||
        c.name.toLowerCase().includes(config.caseType.toLowerCase())
      )
      
      const matchedDial = dials.find(d => 
        d.color_hex.toLowerCase().includes(config.dialColor.toLowerCase()) ||
        d.style_category.toLowerCase().includes(config.style.toLowerCase())
      )
      
      const matchedStrap = straps.find(s => 
        s.material_type.toLowerCase().includes(config.strapType.toLowerCase()) ||
        s.style.toLowerCase().includes(config.strapType.toLowerCase())
      )
      
      // Actualizar store con configuración
      if (matchedMaterial) configuratorStore.setMaterial(matchedMaterial)
      if (matchedCase) configuratorStore.setCase(matchedCase)
      if (matchedDial) configuratorStore.setDial(matchedDial)
      if (matchedStrap) configuratorStore.setStrap(matchedStrap)
      
      // OPTIMIZADO: Navegar al configurador optimizado (renders pre-procesados)
      // Esto proporciona una experiencia más rápida y estable
      navigate('/configurador-optimizado')
    } catch (error) {
      console.error('Error al cargar configuración:', error)
      // Si hay error, navegar de todas formas al configurador optimizado
      navigate('/configurador-optimizado')
    }
  }
  
  return (
    <div className="w-full max-w-7xl mx-auto p-6 space-y-8">
      {/* Header con título y explicación */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3">
          <Sparkles className="w-10 h-10 text-[#D4AF37]" />
          <h1 className="text-4xl font-bold bg-gradient-to-r from-[#D4AF37] to-[#B8860B] bg-clip-text text-transparent">
            Configurador IA Premium
          </h1>
        </div>
        <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
          Describe el reloj de tus sueños en lenguaje natural y déjanos crear el render perfecto para ti
        </p>
        <div className="flex items-center justify-center gap-6 text-sm text-neutral-500">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span>Biblioteca Pre-generada</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-purple-500"></div>
            <span>IA Gemini 2.0</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
            <span>3D Interactivo</span>
          </div>
        </div>
      </div>
      
      {/* Barra de búsqueda principal */}
      <div className="max-w-3xl mx-auto">
        <div className="relative">
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleGenerateOrSearch()}
            placeholder='Ej: "Quiero un reloj elegante dorado moderno" o "Reloj deportivo acero azul"'
            className="w-full px-6 py-4 pr-32 text-lg rounded-2xl border-2 border-neutral-200 focus:border-[#D4AF37] focus:outline-none transition-colors"
            disabled={isGenerating}
          />
          <button
            onClick={handleGenerateOrSearch}
            disabled={isGenerating || !description.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 px-6 py-2 bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-white rounded-xl font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Generando...</span>
              </>
            ) : (
              <>
                <Search className="w-5 h-5" />
                <span>Crear</span>
              </>
            )}
          </button>
        </div>
        
        {/* Sugerencias de búsqueda en tiempo real */}
        {searchResults.length > 0 && renderMethod === 'idle' && (
          <div className="mt-2 p-3 bg-white rounded-xl border border-neutral-200 shadow-lg">
            <p className="text-sm font-medium text-neutral-600 mb-2">Configuraciones populares que coinciden:</p>
            <div className="space-y-1">
              {searchResults.map(config => (
                <button
                  key={config?.id || config.name || `search-${Math.random()}`}
                  onClick={() => handleSelectPopularConfig(config)}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-neutral-50 transition-colors flex items-center gap-3"
                >
                  <ImageIcon className="w-4 h-4 text-neutral-400" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-neutral-800">{config.name}</p>
                    <p className="text-xs text-neutral-500">{config.description}</p>
                  </div>
                  <span className="text-xs font-medium text-[#D4AF37]">
                    {config.price.toLocaleString('es-ES')} €
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
        
        {/* Error message */}
        {error && (
          <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
            {error}
          </div>
        )}
      </div>
      
      {/* Área de resultados */}
      <div className="max-w-5xl mx-auto">
        {/* MÉTODO 1: Biblioteca Pre-generada */}
        {renderMethod === 'library' && selectedPopularConfig && (
          <div className="space-y-4 animate-in fade-in duration-500">
            <div className="flex items-center gap-2 text-sm font-medium text-green-600">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
              <span>Cargado desde biblioteca (instantáneo)</span>
            </div>
            
            <div className="bg-gradient-to-br from-neutral-50 to-neutral-100 rounded-2xl p-8 shadow-xl">
              <div className="grid md:grid-cols-2 gap-8">
                {/* Imagen */}
                <div className="aspect-square rounded-xl overflow-hidden bg-white shadow-lg">
                  <img
                    src={selectedPopularConfig.imageUrl}
                    alt={selectedPopularConfig.name}
                    className="w-full h-full object-contain"
                  />
                </div>
                
                {/* Detalles */}
                <div className="flex flex-col justify-center space-y-4">
                  <h2 className="text-3xl font-bold text-neutral-900">{selectedPopularConfig.name}</h2>
                  <p className="text-neutral-600">{selectedPopularConfig.description}</p>
                  
                  <div className="space-y-2 pt-4">
                    <DetailRow label="Material" value={selectedPopularConfig.material} />
                    <DetailRow label="Caja" value={selectedPopularConfig.caseType} />
                    <DetailRow label="Esfera" value={selectedPopularConfig.dialColor} />
                    <DetailRow label="Correa" value={selectedPopularConfig.strapType} />
                    <DetailRow label="Estilo" value={selectedPopularConfig.style} />
                  </div>
                  
                  <div className="pt-4 border-t border-neutral-300">
                    <p className="text-3xl font-bold text-[#D4AF37]">
                      {selectedPopularConfig.price.toLocaleString('es-ES')} €
                    </p>
                  </div>
                  
                  <div className="flex gap-3 pt-4">
                    <button 
                      onClick={() => handleCustomizeMore(selectedPopularConfig)}
                      className="flex-1 px-6 py-3 bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-white rounded-xl font-medium hover:opacity-90 transition-opacity"
                    >
                      Personalizar más
                    </button>
                    <button 
                      onClick={handleReset}
                      className="px-6 py-3 border-2 border-neutral-300 rounded-xl font-medium hover:bg-neutral-50 transition-colors"
                    >
                      Nueva búsqueda
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* MÉTODO 2: IA Generada (Gemini 2.0 Flash) */}
        {renderMethod === 'ai' && generatedImage && generatedImage.success && (
          <div className="space-y-4 animate-in fade-in duration-500">
            <div className="flex items-center gap-2 text-sm font-medium text-purple-600">
              <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse"></div>
              <span>Generado con IA - Google Gemini 2.0 Flash</span>
            </div>
            
            <div className="bg-gradient-to-br from-purple-50 to-neutral-100 rounded-2xl p-8 shadow-xl">
              <div className="grid md:grid-cols-2 gap-8">
                {/* Imagen generada */}
                <div className="aspect-square rounded-xl overflow-hidden bg-white shadow-lg">
                  <img
                    src={generatedImage.imageUrl}
                    alt="Reloj generado por IA"
                    className="w-full h-full object-contain"
                  />
                </div>
                
                {/* Detalles de generación */}
                <div className="flex flex-col justify-center space-y-4">
                  <h2 className="text-3xl font-bold text-neutral-900">Tu Reloj Único</h2>
                  <p className="text-neutral-600">{description}</p>
                  
                  <div className="space-y-2 pt-4">
                    <DetailRow label="Material" value={generatedImage.metadata.material} />
                    <DetailRow label="Estilo" value={generatedImage.metadata.style} />
                    <DetailRow label="Color esfera" value={generatedImage.metadata.dialColor} />
                    <DetailRow 
                      label="Generado" 
                      value={new Date(generatedImage.metadata.timestamp).toLocaleString('es-ES')} 
                    />
                  </div>
                  
                  <div className="p-3 bg-purple-100 rounded-xl text-sm text-purple-900">
                    <p className="font-medium mb-1">Prompt usado:</p>
                    <p className="text-xs opacity-80">{generatedImage.prompt}</p>
                  </div>
                  
                  <div className="flex gap-3 pt-4">
                    <button className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl font-medium hover:opacity-90 transition-opacity">
                      Guardar configuración
                    </button>
                    <button 
                      onClick={handleReset}
                      className="px-6 py-3 border-2 border-neutral-300 rounded-xl font-medium hover:bg-neutral-50 transition-colors"
                    >
                      Nueva búsqueda
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* MÉTODO 3: Fallback a 3D */}
        {renderMethod === '3d' && (
          <div className="space-y-4 animate-in fade-in duration-500">
            <div className="flex items-center gap-2 text-sm font-medium text-blue-600">
              <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
              <span>Usando configurador 3D interactivo</span>
            </div>
            
            <div className="bg-gradient-to-br from-blue-50 to-neutral-100 rounded-2xl p-8 shadow-xl text-center">
              <Box className="w-16 h-16 mx-auto mb-4 text-blue-600" />
              <h3 className="text-2xl font-bold text-neutral-900 mb-2">Modo 3D Interactivo</h3>
              <p className="text-neutral-600 mb-6">
                Redirigiendo al configurador 3D completo donde podrás personalizar cada detalle...
              </p>
              <button 
                onClick={() => window.location.href = '/configurador'}
                className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-medium hover:opacity-90 transition-opacity"
              >
                Ir al Configurador 3D
              </button>
            </div>
          </div>
        )}
        
        {/* Estado inicial: Mostrar configuraciones populares */}
        {renderMethod === 'idle' && !isGenerating && (
          <div className="space-y-6 animate-in fade-in duration-500">
            <h2 className="text-2xl font-bold text-neutral-900 text-center">
              Configuraciones Más Populares
            </h2>
            
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {popularConfigs.map(config => (
                <button
                  key={config?.id || config.name || `popular-${Math.random()}`}
                  onClick={() => handleSelectPopularConfig(config)}
                  className="group bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
                >
                  <div className="aspect-square bg-gradient-to-br from-neutral-100 to-neutral-200 relative overflow-hidden">
                    <img
                      src={config.imageUrl}
                      alt={config.name}
                      className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute top-3 right-3 px-2 py-1 bg-[#D4AF37] text-white text-xs font-bold rounded">
                      {config.popularity}%
                    </div>
                  </div>
                  <div className="p-4 text-left">
                    <h3 className="font-bold text-neutral-900 mb-1">{config.name}</h3>
                    <p className="text-sm text-neutral-600 mb-2 line-clamp-2">{config.description}</p>
                    <p className="text-lg font-bold text-[#D4AF37]">
                      {config.price.toLocaleString('es-ES')} €
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
      
      {/* Opciones Avanzadas de Personalización - UNIFICADAS */}
      <div className="max-w-7xl mx-auto mt-12">
        <div className="text-center mb-6">
          <button
            onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
            className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-white rounded-2xl font-bold text-lg hover:opacity-90 transition-all shadow-xl hover:shadow-2xl"
          >
            <Settings className="w-6 h-6" />
            <span>{showAdvancedOptions ? 'Ocultar' : 'Mostrar'} Opciones de Personalización Completas</span>
          </button>
          <p className="text-sm text-neutral-500 mt-2">
            Las mismas opciones que en el Configurador 3D y Ultra Rápido
          </p>
        </div>
        
        {showAdvancedOptions && (
          <div className="animate-in fade-in duration-500">
            <UnifiedConfigurationOptions 
              onConfigurationChange={(config) => {
                console.log('Configuración actualizada:', config)
              }}
            />
          </div>
        )}
      </div>
    </div>
  )
}

// Componente auxiliar para filas de detalles
function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center py-2 border-b border-neutral-200">
      <span className="text-sm font-medium text-neutral-500">{label}</span>
      <span className="text-sm font-bold text-neutral-900 capitalize">{value}</span>
    </div>
  )
}

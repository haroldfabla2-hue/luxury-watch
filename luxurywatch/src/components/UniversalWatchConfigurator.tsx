/**
 * ORQUESTADOR UNIVERSAL DE CONFIGURADOR 3D
 * 
 * Decide automáticamente qué nivel de renderizado usar:
 * - Nivel 1: WebGL Premium (GPU disponible, alta performance)
 * - Nivel 2: Canvas 2D Fallback (sin WebGL o performance media)
 * - Nivel 3: SSR Fallback (sin WebGL y performance baja)
 * 
 * Características:
 * - Detección automática de capacidades
 * - Progressive enhancement
 * - UI consistente entre niveles
 * - Optimización por dispositivo
 * 
 * Basado en investigación: docs/alternativas_3d_sin_gpu.md
 */

import { useEffect, useState } from 'react'
import { checkDeviceCapabilities, logDeviceCapabilities, type DeviceCapabilities } from '../utils/webglDetection'
import WatchConfigurator3DVanilla from './WatchConfigurator3DVanilla'
import WatchCanvas2DFallback from './WatchCanvas2DFallback'
import WatchSSRFallback from './WatchSSRFallback'

type RenderLevel = 'webgl' | 'canvas2d' | 'ssr'

interface UniversalConfiguratorProps {
  forceLevel?: RenderLevel
  onLevelDetected?: (level: RenderLevel, capabilities: DeviceCapabilities) => void
}

const UniversalWatchConfigurator = ({ forceLevel, onLevelDetected }: UniversalConfiguratorProps) => {
  const [renderLevel, setRenderLevel] = useState<RenderLevel | null>(null)
  const [capabilities, setCapabilities] = useState<DeviceCapabilities | null>(null)
  const [isDetecting, setIsDetecting] = useState(true)

  useEffect(() => {
    const detectAndSelectLevel = async () => {
      setIsDetecting(true)

      // Detectar capacidades del dispositivo
      const deviceCapabilities = checkDeviceCapabilities()
      setCapabilities(deviceCapabilities)

      // Log de diagnóstico
      logDeviceCapabilities(deviceCapabilities)

      // Decidir nivel de renderizado
      let selectedLevel: RenderLevel

      if (forceLevel) {
        // Si se fuerza un nivel, usarlo
        selectedLevel = forceLevel
        console.log(`🎯 Nivel forzado: ${forceLevel.toUpperCase()}`)
      } else {
        // Lógica automática de selección de nivel
        if (deviceCapabilities.webgl && deviceCapabilities.performance !== 'low') {
          // Nivel 1: WebGL Premium
          selectedLevel = 'webgl'
          console.log('✅ Seleccionado: WebGL Premium (GPU disponible, buena performance)')
        } else if (!deviceCapabilities.webgl && deviceCapabilities.performance !== 'low') {
          // Nivel 2: Canvas 2D Fallback
          selectedLevel = 'canvas2d'
          console.log('✅ Seleccionado: Canvas 2D Fallback (sin WebGL, performance aceptable)')
        } else {
          // Nivel 3: SSR Fallback
          selectedLevel = 'ssr'
          console.log('✅ Seleccionado: SSR Fallback (performance baja o sin WebGL)')
        }
      }

      setRenderLevel(selectedLevel)
      setIsDetecting(false)

      // Notificar nivel detectado
      if (onLevelDetected) {
        onLevelDetected(selectedLevel, deviceCapabilities)
      }

      // Log resumen
      console.group('📊 Resumen de Configuración Universal')
      console.log('Nivel seleccionado:', selectedLevel.toUpperCase())
      console.log('WebGL disponible:', deviceCapabilities.webgl ? 'SÍ' : 'NO')
      console.log('WebGL2 disponible:', deviceCapabilities.webgl2 ? 'SÍ' : 'NO')
      console.log('Performance:', deviceCapabilities.performance.toUpperCase())
      console.log('Calidad:', deviceCapabilities.qualityLevel.toUpperCase())
      console.log('Es móvil:', deviceCapabilities.isMobile ? 'SÍ' : 'NO')
      console.groupEnd()
    }

    detectAndSelectLevel()
  }, [forceLevel])

  // Pantalla de detección
  if (isDetecting || !renderLevel) {
    return (
      <div className="relative w-full h-full min-h-[500px] md:min-h-[600px] bg-gradient-to-br from-neutral-100 to-neutral-200 rounded-lg overflow-hidden shadow-modal flex items-center justify-center">
        <div className="text-center p-8">
          <div className="w-20 h-20 border-4 border-gold-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h3 className="text-xl font-headline font-bold text-neutral-900 mb-2">
            Detectando Capacidades
          </h3>
          <p className="text-neutral-600 mb-2">
            Optimizando experiencia para tu dispositivo...
          </p>
          <p className="text-sm text-neutral-500">
            Analizando GPU, performance y compatibilidad
          </p>
        </div>
      </div>
    )
  }

  // Renderizar según nivel seleccionado
  return (
    <>
      {renderLevel === 'webgl' && <WatchConfigurator3DVanilla />}
      {renderLevel === 'canvas2d' && <WatchCanvas2DFallback />}
      {renderLevel === 'ssr' && <WatchSSRFallback />}

      {/* Indicador de nivel activo (solo visible en desarrollo) */}
      {process.env.NODE_ENV === 'development' && capabilities && (
        <div className="fixed bottom-20 right-4 bg-black/80 text-white px-4 py-3 rounded-lg shadow-xl text-xs font-mono max-w-xs z-50">
          <div className="font-bold mb-2 text-gold-400">🔧 Dev Info:</div>
          <div className="space-y-1">
            <div>
              Nivel: <span className="text-green-400 font-bold">{renderLevel.toUpperCase()}</span>
            </div>
            <div>
              WebGL: {capabilities.webgl ? '✅' : '❌'} | 
              WebGL2: {capabilities.webgl2 ? '✅' : '❌'}
            </div>
            <div>
              Performance: <span className="text-yellow-400">{capabilities.performance.toUpperCase()}</span>
            </div>
            <div>
              Calidad: <span className="text-blue-400">{capabilities.qualityLevel.toUpperCase()}</span>
            </div>
            <div>
              Móvil: {capabilities.isMobile ? 'SÍ' : 'NO'}
            </div>
            <div className="text-xs text-gray-400 mt-2">
              Max Texture: {capabilities.maxTextureSize}px
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default UniversalWatchConfigurator

/**
 * Componente de visualización del progreso de carga del TexturaManager
 * Muestra el estado de carga de texturas HDRI con UI optimizada
 */

import React, { useState, useEffect } from 'react'
import { type LoadingProgress } from '../lib/TexturaManager'

interface LoadingProgressProps {
  progress: LoadingProgress
  stats?: any
  className?: string
}

const HDRIProgressViewer: React.FC<LoadingProgressProps> = ({ 
  progress, 
  stats, 
  className = '' 
}) => {
  const [showDetails, setShowDetails] = useState(false)
  
  const getPhaseDisplay = (phase: LoadingProgress['phase']) => {
    const phaseMap = {
      'downloading': { label: 'Descargando', icon: '📡', color: 'text-blue-600' },
      'processing': { label: 'Procesando', icon: '⚙️', color: 'text-yellow-600' },
      'compressing': { label: 'Comprimiendo', icon: '🗜️', color: 'text-purple-600' },
      'ready': { label: 'Listo', icon: '✅', color: 'text-green-600' }
    }
    return phaseMap[phase] || { label: phase, icon: '⏳', color: 'text-gray-600' }
  }
  
  const phaseInfo = getPhaseDisplay(progress.phase)
  
  // Solo mostrar si hay progreso que mostrar
  if (progress.total === 0 || (progress.loaded === 0 && progress.phase === 'downloading')) {
    return null
  }
  
  return (
    <div className={`fixed top-4 right-4 bg-white/95 backdrop-blur-sm rounded-lg shadow-lg p-4 max-w-sm z-50 ${className}`}>
      <div className="flex items-center gap-2 mb-3">
        <span className="text-2xl">🎨</span>
        <div>
          <h3 className="font-semibold text-gray-900">TexturaManager</h3>
          <p className="text-sm text-gray-600">Cargando texturas HDRI</p>
        </div>
      </div>
      
      {/* Barra de progreso principal */}
      <div className="mb-3">
        <div className="flex justify-between text-sm mb-1">
          <span className={`font-medium ${phaseInfo.color}`}>
            {phaseInfo.icon} {phaseInfo.label}
          </span>
          <span className="text-gray-500">
            {Math.round(progress.percentage)}%
          </span>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all duration-300 ${
              progress.phase === 'ready' ? 'bg-green-500' : 'bg-blue-500'
            }`}
            style={{ width: `${progress.percentage}%` }}
          />
        </div>
      </div>
      
      {/* Información actual */}
      {progress.currentTexture && (
        <div className="mb-3">
          <p className="text-xs text-gray-600 truncate">
            <span className="font-medium">Actual:</span> {progress.currentTexture}
          </p>
        </div>
      )}
      
      {/* Detalles expandibles */}
      <button
        onClick={() => setShowDetails(!showDetails)}
        className="text-xs text-blue-600 hover:text-blue-800 transition-colors mb-2"
      >
        {showDetails ? '▼' : '▶'} Detalles técnicos
      </button>
      
      {showDetails && stats && (
        <div className="text-xs text-gray-600 space-y-1 mb-3 pt-2 border-t border-gray-200">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <span className="font-medium">Cache hits:</span>
              <div className="text-green-600 font-mono">
                {Math.round(stats.cacheHitRate * 100)}%
              </div>
            </div>
            <div>
              <span className="font-medium">Memoria:</span>
              <div className="text-purple-600 font-mono">
                {Math.round(stats.memoryUsage / 1024 / 1024)}MB
              </div>
            </div>
            <div>
              <span className="font-medium">Texturas:</span>
              <div className="text-blue-600 font-mono">
                {stats.cacheSize}
              </div>
            </div>
            <div>
              <span className="font-medium">Nivel:</span>
              <div className="text-orange-600 font-mono uppercase">
                {stats.performanceProfile?.level}
              </div>
            </div>
          </div>
          
          {stats.averageLoadTime && (
            <div className="pt-1 border-t border-gray-100">
              <span className="font-medium">Tiempo promedio:</span>
              <span className="text-cyan-600 font-mono ml-1">
                {stats.averageLoadTime.toFixed(1)}ms
              </span>
            </div>
          )}
        </div>
      )}
      
      {/* Mensaje de éxito */}
      {progress.phase === 'ready' && (
        <div className="text-xs text-green-700 bg-green-50 px-2 py-1 rounded">
          ✅ Texturas HDRI cargadas exitosamente
        </div>
      )}
    </div>
  )
}

export default HDRIProgressViewer

// Hook para usar el TexturaManager
import { texturaManager } from '../lib/TexturaManager'

export const useTexturaManager = () => {
  const [progress, setProgress] = useState<LoadingProgress>({
    total: 0,
    loaded: 0,
    percentage: 0,
    phase: 'downloading'
  })
  
  const [stats, setStats] = useState<any>(null)
  
  useEffect(() => {
    const unsubscribe = texturaManager.onProgress(setProgress)
    
    // Obtener estadísticas iniciales
    const updateStats = () => {
      setStats(texturaManager.getStats())
    }
    
    updateStats()
    
    // Actualizar estadísticas cada segundo
    const statsInterval = setInterval(updateStats, 1000)
    
    return () => {
      unsubscribe()
      clearInterval(statsInterval)
    }
  }, [])
  
  return { progress, stats }
}
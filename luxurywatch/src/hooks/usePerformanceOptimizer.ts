import { useEffect, useState, useRef, useCallback } from 'react'

interface PerformanceConfig {
  targetFPS: number
  minFPS: number
  checkInterval: number // ms
  adaptiveQuality: boolean
}

interface PerformanceMetrics {
  currentFPS: number
  frameTime: number
  isOptimizing: boolean
  qualityLevel: 'high' | 'medium' | 'low'
}

/**
 * Hook para optimización automática de rendimiento basada en FPS real
 * Ajusta la calidad dinámicamente para mantener FPS objetivo
 */
export const usePerformanceOptimizer = (config: PerformanceConfig) => {
  const {
    targetFPS = 60,
    minFPS = 30,
    checkInterval = 2000,
    adaptiveQuality = true
  } = config

  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    currentFPS: targetFPS,
    frameTime: 1000 / targetFPS,
    isOptimizing: false,
    qualityLevel: 'high'
  })

  const frameCountRef = useRef(0)
  const lastTimeRef = useRef(performance.now())
  const fpsHistoryRef = useRef<number[]>([])
  const qualityTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const updateFPS = useCallback(() => {
    const now = performance.now()
    const deltaTime = now - lastTimeRef.current
    lastTimeRef.current = now

    const currentFPS = 1000 / deltaTime
    frameCountRef.current++

    // Mantener historial de FPS para análisis
    fpsHistoryRef.current.push(currentFPS)
    if (fpsHistoryRef.current.length > 60) { // Últimos 60 frames
      fpsHistoryRef.current.shift()
    }

    // Calcular FPS promedio
    const avgFPS = fpsHistoryRef.current.reduce((a, b) => a + b, 0) / fpsHistoryRef.current.length

    setMetrics(prev => ({
      ...prev,
      currentFPS: Math.round(avgFPS * 10) / 10,
      frameTime: deltaTime
    }))

    // Optimización adaptativa
    if (adaptiveQuality && frameCountRef.current % (checkInterval / (1000 / targetFPS)) === 0) {
      optimizeQuality(avgFPS)
    }
  }, [adaptiveQuality, checkInterval, targetFPS])

  const optimizeQuality = useCallback((currentFPS: number) => {
    if (!adaptiveQuality) return

    const fpsHistory = fpsHistoryRef.current
    if (fpsHistory.length < 30) return // Necesita más datos

    const lowFPSCount = fpsHistory.filter(fps => fps < minFPS).length
    const highFPSCount = fpsHistory.filter(fps => fps >= targetFPS).length
    const totalFrames = fpsHistory.length

    const lowFPSPercentage = lowFPSCount / totalFrames
    const highFPSPercentage = highFPSCount / totalFrames

    let newQualityLevel: 'high' | 'medium' | 'low' = metrics.qualityLevel

    // Reducir calidad si FPS está consistentemente bajo
    if (lowFPSPercentage > 0.6 && metrics.qualityLevel === 'high') {
      newQualityLevel = 'medium'
      console.log('🔄 Reduciendo calidad a "medium" por bajo FPS')
    } else if (lowFPSPercentage > 0.6 && metrics.qualityLevel === 'medium') {
      newQualityLevel = 'low'
      console.log('🔄 Reduciendo calidad a "low" por bajo FPS')
    }
    // Aumentar calidad si FPS está consistentemente alto
    else if (highFPSPercentage > 0.8 && metrics.qualityLevel === 'low') {
      newQualityLevel = 'medium'
      console.log('⬆️ Aumentando calidad a "medium" por buen FPS')
    } else if (highFPSPercentage > 0.8 && metrics.qualityLevel === 'medium') {
      newQualityLevel = 'high'
      console.log('⬆️ Aumentando calidad a "high" por buen FPS')
    }

    // Aplicar cambios solo si hay diferencia
    if (newQualityLevel !== metrics.qualityLevel) {
      setMetrics(prev => ({
        ...prev,
        qualityLevel: newQualityLevel,
        isOptimizing: true
      }))

      // Reset isOptimizing después de un tiempo
      if (qualityTimeoutRef.current) {
        clearTimeout(qualityTimeoutRef.current)
      }
      qualityTimeoutRef.current = setTimeout(() => {
        setMetrics(prev => ({ ...prev, isOptimizing: false }))
      }, 3000)
    }
  }, [metrics.qualityLevel, adaptiveQuality, minFPS, targetFPS])

  const getOptimizedConfig = useCallback(() => {
    const baseConfig = {
      pixelRatio: window.devicePixelRatio,
      antialias: true,
      shadows: true,
      postProcessing: true,
      hdrQuality: 'high' as const,
      textureQuality: 'high' as const
    }

    switch (metrics.qualityLevel) {
      case 'high':
        return {
          ...baseConfig,
          pixelRatio: Math.min(window.devicePixelRatio, 2),
          antialias: true,
          shadows: true,
          postProcessing: true,
          hdrQuality: 'high' as const,
          textureQuality: 'high' as const
        }

      case 'medium':
        return {
          ...baseConfig,
          pixelRatio: Math.min(window.devicePixelRatio, 1.5),
          antialias: true,
          shadows: true,
          postProcessing: true,
          hdrQuality: 'medium' as const,
          textureQuality: 'medium' as const
        }

      case 'low':
        return {
          ...baseConfig,
          pixelRatio: Math.min(window.devicePixelRatio, 1),
          antialias: false,
          shadows: false,
          postProcessing: false,
          hdrQuality: 'low' as const,
          textureQuality: 'low' as const
        }

      default:
        return baseConfig
    }
  }, [metrics.qualityLevel])

  const forceQualityLevel = useCallback((level: 'high' | 'medium' | 'low') => {
    setMetrics(prev => ({
      ...prev,
      qualityLevel: level,
      isOptimizing: true
    }))

    if (qualityTimeoutRef.current) {
      clearTimeout(qualityTimeoutRef.current)
    }
    qualityTimeoutRef.current = setTimeout(() => {
      setMetrics(prev => ({ ...prev, isOptimizing: false }))
    }, 2000)

    console.log(`🎯 Calidad forzada a "${level}"`)
  }, [])

  // Cleanup
  useEffect(() => {
    return () => {
      if (qualityTimeoutRef.current) {
        clearTimeout(qualityTimeoutRef.current)
      }
    }
  }, [])

  return {
    metrics,
    updateFPS,
    getOptimizedConfig,
    forceQualityLevel,
    isLowPerformance: metrics.currentFPS < minFPS,
    isHighPerformance: metrics.currentFPS >= targetFPS
  }
}
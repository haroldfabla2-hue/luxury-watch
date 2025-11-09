import { useEffect, useState, useCallback } from 'react'

interface PreloadedImage {
  src: string
  loaded: boolean
  error: boolean
  element?: HTMLImageElement
}

interface UsePreloadedImagesReturn {
  images: Map<string, PreloadedImage>
  isLoading: boolean
  loadImage: (src: string) => Promise<void>
  preloadImages: (sources: string[]) => Promise<void>
  getImage: (src: string) => HTMLImageElement | undefined
}

/**
 * Hook para precargar y gestionar imágenes de forma eficiente
 */
export function usePreloadedImages(initialSources: string[] = []): UsePreloadedImagesReturn {
  const [images, setImages] = useState<Map<string, PreloadedImage>>(new Map())
  const [isLoading, setIsLoading] = useState(false)

  /**
   * Carga una imagen individual
   */
  const loadImage = useCallback((src: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      // Si ya está cargada, resolver inmediatamente
      const existing = images.get(src)
      if (existing?.loaded) {
        resolve()
        return
      }

      // Marcar como en proceso de carga
      setImages(prev => new Map(prev).set(src, {
        src,
        loaded: false,
        error: false
      }))

      // Crear elemento de imagen
      const img = new Image()
      
      img.onload = () => {
        setImages(prev => {
          const updated = new Map(prev)
          updated.set(src, {
            src,
            loaded: true,
            error: false,
            element: img
          })
          return updated
        })
        resolve()
      }

      img.onerror = () => {
        setImages(prev => {
          const updated = new Map(prev)
          updated.set(src, {
            src,
            loaded: false,
            error: true
          })
          return updated
        })
        reject(new Error(`Failed to load image: ${src}`))
      }

      img.src = src
    })
  }, [images])

  /**
   * Precarga múltiples imágenes en paralelo
   */
  const preloadImages = useCallback(async (sources: string[]): Promise<void> => {
    if (sources.length === 0) return

    setIsLoading(true)

    try {
      // Filtrar las que ya están cargadas
      const toLoad = sources.filter(src => {
        const existing = images.get(src)
        return !existing?.loaded
      })

      if (toLoad.length === 0) {
        setIsLoading(false)
        return
      }

      // Cargar todas en paralelo
      await Promise.allSettled(toLoad.map(src => loadImage(src)))
    } finally {
      setIsLoading(false)
    }
  }, [images, loadImage])

  /**
   * Obtiene el elemento de imagen si está cargado
   */
  const getImage = useCallback((src: string): HTMLImageElement | undefined => {
    const img = images.get(src)
    return img?.loaded ? img.element : undefined
  }, [images])

  /**
   * Precargar imágenes iniciales al montar
   */
  useEffect(() => {
    if (initialSources.length > 0) {
      preloadImages(initialSources)
    }
  }, []) // Solo ejecutar una vez al montar

  return {
    images,
    isLoading,
    loadImage,
    preloadImages,
    getImage
  }
}

/**
 * Hook simplificado para precargar una sola imagen
 */
export function usePreloadedImage(src: string | undefined) {
  const [loaded, setLoaded] = useState(false)
  const [error, setError] = useState(false)
  const [element, setElement] = useState<HTMLImageElement>()

  useEffect(() => {
    if (!src) return

    setLoaded(false)
    setError(false)

    const img = new Image()

    img.onload = () => {
      setElement(img)
      setLoaded(true)
    }

    img.onerror = () => {
      setError(true)
    }

    img.src = src

    return () => {
      img.onload = null
      img.onerror = null
    }
  }, [src])

  return { loaded, error, element }
}

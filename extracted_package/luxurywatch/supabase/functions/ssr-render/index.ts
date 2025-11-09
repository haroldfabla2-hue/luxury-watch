/**
 * EDGE FUNCTION: SSR 3D RENDERING
 * 
 * Renderiza imágenes fotorrealistas del reloj en el servidor
 * Sin exponer el modelo 3D al cliente (protección IP)
 * 
 * Tecnologías:
 * - Three.js en servidor (sin DOM)
 * - Canvas en servidor para renderizado
 * - Caché agresivo con CDN
 * - Optimización de imágenes WebP
 * 
 * Basado en investigación: docs/alternativas_3d_sin_gpu.md
 * Patrón SSR: Pre-renderizado del lado del servidor
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
  'Access-Control-Max-Age': '86400',
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders })
  }

  try {
    // Parsear parámetros de configuración
    const url = new URL(req.url)
    const material = url.searchParams.get('material') || 'Acero Inoxidable'
    const caseSize = url.searchParams.get('caseSize') || '40mm'
    const dial = url.searchParams.get('dial') || 'Azul'
    const hands = url.searchParams.get('hands') || 'Plata'
    const strap = url.searchParams.get('strap') || 'Cuero Negro'
    const angle = parseInt(url.searchParams.get('angle') || '0')
    const width = parseInt(url.searchParams.get('width') || '800')
    const height = parseInt(url.searchParams.get('height') || '800')
    const format = url.searchParams.get('format') || 'webp'

    // IMPORTANTE: En producción, aquí se renderizaría con Three.js en servidor
    // usando canvas-node o similar. Por ahora, devolvemos placeholder.
    
    // Crear clave de caché única
    const cacheKey = `${material}-${caseSize}-${dial}-${hands}-${strap}-${angle}-${width}x${height}.${format}`

    // En producción real, aquí iría:
    // 1. Cargar modelo 3D del reloj
    // 2. Aplicar materiales según parámetros
    // 3. Configurar cámara en el ángulo especificado
    // 4. Renderizar con Three.js en servidor
    // 5. Comprimir imagen a WebP
    // 6. Cachear en CDN

    // PLACEHOLDER: SVG generado dinámicamente
    const placeholderSVG = generatePlaceholderSVG(material, dial, strap, angle, width, height)

    // Headers con caché agresivo
    const headers = {
      ...corsHeaders,
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=31536000, stale-while-revalidate=86400',
      'CDN-Cache-Control': 'public, max-age=31536000',
      'X-Cache-Key': cacheKey,
      'X-Render-Time': Date.now().toString(),
    }

    return new Response(placeholderSVG, { status: 200, headers })
  } catch (error) {
    console.error('Error en SSR rendering:', error)

    return new Response(JSON.stringify({
      error: {
        code: 'SSR_RENDER_ERROR',
        message: error instanceof Error ? error.message : 'Error desconocido al renderizar'
      }
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})

/**
 * Genera un placeholder SVG dinámico del reloj
 * En producción, esto sería una imagen PNG/WebP renderizada con Three.js
 */
function generatePlaceholderSVG(
  material: string,
  dial: string,
  strap: string,
  angle: number,
  width: number,
  height: number
): string {
  // Colores basados en material
  const materialColors: Record<string, string> = {
    'Oro': '#FFD700',
    'Titanio': '#8E8E8E',
    'Acero Inoxidable': '#C0C0C0',
    'default': '#E8E8E8'
  }

  const dialColors: Record<string, string> = {
    'Azul': '#1E40AF',
    'Negra': '#0A0A0A',
    'Blanca': '#E5E5E5',
    'Verde': '#14532D',
    'Roja': '#991B1B',
    'default': '#E5E5E5'
  }

  const strapColors: Record<string, string> = {
    'Negro': '#0A0A0A',
    'Marrón': '#8B4513',
    'Azul': '#1E40AF',
    'Verde': '#14532D',
    'Metal': '#C0C0C0',
    'default': '#0A0A0A'
  }

  const getMaterialColor = () => {
    for (const key in materialColors) {
      if (material.includes(key)) return materialColors[key]
    }
    return materialColors.default
  }

  const getDialColor = () => {
    for (const key in dialColors) {
      if (dial.includes(key)) return dialColors[key]
    }
    return dialColors.default
  }

  const getStrapColor = () => {
    for (const key in strapColors) {
      if (strap.includes(key)) return strapColors[key]
    }
    return strapColors.default
  }

  const caseColor = getMaterialColor()
  const dialColor = getDialColor()
  const strapColor = getStrapColor()

  // Calcular transformación 3D basada en ángulo
  const rotateY = angle
  const skewX = Math.sin(angle * Math.PI / 180) * 10
  const scaleX = Math.cos(angle * Math.PI / 180) * 0.3 + 0.7

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
  <!-- Gradiente de fondo -->
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#F5F5F5;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#E0E0E0;stop-opacity:1" />
    </linearGradient>
    
    <!-- Gradiente metálico de la caja -->
    <linearGradient id="caseGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${caseColor};stop-opacity:1" />
      <stop offset="50%" style="stop-color:${lightenColor(caseColor, 20)};stop-opacity:1" />
      <stop offset="100%" style="stop-color:${darkenColor(caseColor, 10)};stop-opacity:1" />
    </linearGradient>
    
    <!-- Sombra radial -->
    <radialGradient id="shadow">
      <stop offset="0%" style="stop-color:#000;stop-opacity:0.2" />
      <stop offset="100%" style="stop-color:#000;stop-opacity:0" />
    </radialGradient>
  </defs>
  
  <!-- Fondo -->
  <rect width="${width}" height="${height}" fill="url(#bgGrad)" />
  
  <!-- Sombra del reloj -->
  <ellipse cx="${width/2}" cy="${height * 0.75}" rx="${150 * scaleX}" ry="40" fill="url(#shadow)" />
  
  <g transform="translate(${width/2}, ${height/2}) rotate(${rotateY * 0.5}) skewX(${skewX})">
    <!-- Correa superior -->
    <rect x="-80" y="-280" width="160" height="120" fill="${strapColor}" rx="10" />
    
    <!-- Caja del reloj -->
    <circle cx="0" cy="0" r="150" fill="url(#caseGrad)" stroke="${darkenColor(caseColor, 30)}" stroke-width="3" />
    
    <!-- Bisel -->
    <circle cx="0" cy="0" r="145" fill="none" stroke="${darkenColor(caseColor, 20)}" stroke-width="6" />
    
    <!-- Esfera -->
    <circle cx="0" cy="0" r="135" fill="${dialColor}" />
    
    <!-- Marcadores horarios -->
    ${generateHourMarkers(dialColor)}
    
    <!-- Manecillas -->
    <g transform="rotate(${angle * 2})">
      <!-- Manecilla de horas -->
      <rect x="-5" y="-60" width="10" height="70" fill="${caseColor}" rx="5" />
      
      <!-- Manecilla de minutos -->
      <rect x="-3" y="-85" width="6" height="95" fill="${caseColor}" rx="3" />
      
      <!-- Segundero -->
      <rect x="-1.5" y="-100" width="3" height="110" fill="#DC2626" rx="1.5" />
      
      <!-- Pin central -->
      <circle cx="0" cy="0" r="12" fill="${caseColor}" />
    </g>
    
    <!-- Corona -->
    <g transform="translate(145, 0)">
      <rect x="0" y="-15" width="30" height="30" fill="${caseColor}" rx="5" />
      <line x1="5" y1="-10" x2="5" y2="10" stroke="${darkenColor(caseColor, 20)}" stroke-width="2" />
      <line x1="10" y1="-10" x2="10" y2="10" stroke="${darkenColor(caseColor, 20)}" stroke-width="2" />
      <line x1="15" y1="-10" x2="15" y2="10" stroke="${darkenColor(caseColor, 20)}" stroke-width="2" />
      <line x1="20" y1="-10" x2="20" y2="10" stroke="${darkenColor(caseColor, 20)}" stroke-width="2" />
      <line x1="25" y1="-10" x2="25" y2="10" stroke="${darkenColor(caseColor, 20)}" stroke-width="2" />
    </g>
    
    <!-- Correa inferior -->
    <rect x="-80" y="160" width="160" height="120" fill="${strapColor}" rx="10" />
    
    <!-- Cristal (reflejo sutil) -->
    <circle cx="-30" cy="-50" r="50" fill="#FFFFFF" opacity="0.15" />
  </g>
  
  <!-- Watermark SSR -->
  <text x="${width - 10}" y="${height - 10}" text-anchor="end" fill="#999" font-size="10" font-family="Arial">
    SSR Render @ ${angle}°
  </text>
</svg>`
}

/**
 * Genera marcadores horarios en SVG
 */
function generateHourMarkers(dialColor: string): string {
  let markers = ''
  const isDark = isColorDark(dialColor)
  const markerColor = isDark ? '#FFFFFF' : '#000000'

  for (let i = 0; i < 12; i++) {
    const angle = (i * 30) - 90 // -90 para empezar en las 12
    const rad = angle * Math.PI / 180
    const x = Math.cos(rad) * 115
    const y = Math.sin(rad) * 115

    const isMain = i % 3 === 0
    const size = isMain ? 12 : 8

    markers += `<circle cx="${x}" cy="${y}" r="${size}" fill="${markerColor}" opacity="0.9" />\n`
  }

  return markers
}

/**
 * Determina si un color es oscuro
 */
function isColorDark(hexColor: string): boolean {
  const hex = hexColor.replace('#', '')
  const r = parseInt(hex.substring(0, 2), 16)
  const g = parseInt(hex.substring(2, 4), 16)
  const b = parseInt(hex.substring(4, 6), 16)
  
  // Fórmula de luminancia
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b)
  return luminance < 128
}

/**
 * Aclara un color hex
 */
function lightenColor(hexColor: string, percent: number): string {
  const hex = hexColor.replace('#', '')
  let r = parseInt(hex.substring(0, 2), 16)
  let g = parseInt(hex.substring(2, 4), 16)
  let b = parseInt(hex.substring(4, 6), 16)

  r = Math.min(255, Math.floor(r + (255 - r) * percent / 100))
  g = Math.min(255, Math.floor(g + (255 - g) * percent / 100))
  b = Math.min(255, Math.floor(b + (255 - b) * percent / 100))

  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
}

/**
 * Oscurece un color hex
 */
function darkenColor(hexColor: string, percent: number): string {
  const hex = hexColor.replace('#', '')
  let r = parseInt(hex.substring(0, 2), 16)
  let g = parseInt(hex.substring(2, 4), 16)
  let b = parseInt(hex.substring(4, 6), 16)

  r = Math.max(0, Math.floor(r * (100 - percent) / 100))
  g = Math.max(0, Math.floor(g * (100 - percent) / 100))
  b = Math.max(0, Math.floor(b * (100 - percent) / 100))

  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
}

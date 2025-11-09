/**
 * MODELO 3D MEJORADO ULTRA-PREMIUM CON DETALLES FINOS
 * Versión fotorrealista con geometrías avanzadas
 */

import * as THREE from 'three'

interface WatchConfiguration {
  case?: { color_hex?: string; shape?: string }
  dial?: { color_hex?: string; pattern_type?: string }
  hands?: { color?: string; style?: string }
  material?: { color_hex?: string; metalness?: number; roughness?: number }
  strap?: { color?: string; material_type?: string }
}

/**
 * Crea modelo 3D ultra-detallado del reloj
 */
export const createPhotorealisticWatchModel = (
  THREE: any, 
  config: WatchConfiguration,
  qualityLevel: 'ultra' | 'high' | 'medium' | 'low' = 'high'
): THREE.Group => {
  const group = new THREE.Group()
  
  // Configuración de calidad
  const segments = qualityLevel === 'ultra' ? 128 : qualityLevel === 'high' ? 64 : 32
  
  // Materiales base con PBR mejorado
  const caseMaterial = new THREE.MeshStandardMaterial({
    color: config.case?.color_hex || config.material?.color_hex || '#FFD700',
    metalness: config.material?.metalness || 0.95,
    roughness: config.material?.roughness || 0.15,
    envMapIntensity: 1.5
  })
  
  const dialMaterial = new THREE.MeshStandardMaterial({
    color: config.dial?.color_hex || '#FFFFFF',
    metalness: 0.1,
    roughness: 0.8,
    envMapIntensity: 0.5
  })
  
  // 1. CUERPO PRINCIPAL DEL RELOJ (mejorado)
  const bodyGeometry = new THREE.CylinderGeometry(1.5, 1.5, 0.35, segments)
  const body = new THREE.Mesh(bodyGeometry, caseMaterial)
  body.castShadow = true
  body.receiveShadow = true
  group.add(body)
  
  // 2. BISEL CON DETALLES (mejorado)
  const bezelGeometry = new THREE.TorusGeometry(1.52, 0.12, 32, segments)
  const bezel = new THREE.Mesh(bezelGeometry, caseMaterial)
  bezel.rotation.x = Math.PI / 2
  bezel.position.y = 0.18
  bezel.castShadow = true
  group.add(bezel)
  
  // 2.1 Grabado en bisel (detalles finos)
  for (let i = 0; i < 60; i++) {
    const angle = (i / 60) * Math.PI * 2
    const notchGeometry = new THREE.BoxGeometry(0.02, 0.03, 0.05)
    const notch = new THREE.Mesh(notchGeometry, caseMaterial)
    notch.position.set(
      Math.cos(angle) * 1.58,
      0.18,
      Math.sin(angle) * 1.58
    )
    notch.rotation.y = -angle
    group.add(notch)
  }
  
  // 3. ESFERA CON PATRÓN (mejorado)
  const dialGeometry = new THREE.CylinderGeometry(1.32, 1.32, 0.03, segments)
  const dial = new THREE.Mesh(dialGeometry, dialMaterial)
  dial.position.y = 0.19
  dial.castShadow = true
  dial.receiveShadow = true
  group.add(dial)
  
  // 3.1 Patrón sunburst en esfera (efecto radial)
  if (config.dial?.pattern_type === 'sunburst' || !config.dial?.pattern_type) {
    const sunburstLines = 120
    for (let i = 0; i < sunburstLines; i++) {
      const angle = (i / sunburstLines) * Math.PI * 2
      const lineGeometry = new THREE.BoxGeometry(0.005, 0.005, 1.2)
      const lineMaterial = new THREE.MeshStandardMaterial({
        color: dialMaterial.color,
        metalness: 0.3,
        roughness: 0.7,
        opacity: 0.3,
        transparent: true
      })
      const line = new THREE.Mesh(lineGeometry, lineMaterial)
      line.position.y = 0.195
      line.rotation.y = angle
      group.add(line)
    }
  }
  
  // 4. MARCADORES DE HORA DETALLADOS (mejorado)
  for (let i = 0; i < 12; i++) {
    const angle = (i / 12) * Math.PI * 2
    const x = Math.cos(angle) * 1.15
    const z = Math.sin(angle) * 1.15
    
    // Marcadores principales (12, 3, 6, 9) más grandes
    const isMainMarker = i % 3 === 0
    const markerGeometry = isMainMarker 
      ? new THREE.BoxGeometry(0.08, 0.04, 0.15)
      : new THREE.BoxGeometry(0.05, 0.03, 0.1)
    
    const markerMaterial = new THREE.MeshStandardMaterial({
      color: 0xFFD700,
      metalness: 0.95,
      roughness: 0.1,
      emissive: 0x222200,
      emissiveIntensity: 0.2
    })
    
    const marker = new THREE.Mesh(markerGeometry, markerMaterial)
    marker.position.set(x, 0.2, z)
    marker.rotation.y = -angle
    marker.castShadow = true
    group.add(marker)
    
    // Puntos luminosos en marcadores (detalle premium)
    if (isMainMarker) {
      const dotGeometry = new THREE.SphereGeometry(0.02, 16, 16)
      const dotMaterial = new THREE.MeshStandardMaterial({
        color: 0x00FF00,
        emissive: 0x00FF00,
        emissiveIntensity: 0.8,
        metalness: 0,
        roughness: 0.3
      })
      const dot = new THREE.Mesh(dotGeometry, dotMaterial)
      dot.position.set(x, 0.21, z)
      group.add(dot)
    }
  }
  
  // 5. MANECILLAS CON DETALLES (mejorado)
  const handMaterial = new THREE.MeshStandardMaterial({
    color: config.hands?.color || '#333333',
    metalness: 0.95,
    roughness: 0.15,
    emissive: 0x111111,
    emissiveIntensity: 0.1
  })
  
  // 5.1 Manecilla de hora (forma dauphine)
  const hourHandShape = new THREE.Shape()
  hourHandShape.moveTo(0, 0)
  hourHandShape.lineTo(0.03, 0.05)
  hourHandShape.lineTo(0.02, 0.6)
  hourHandShape.lineTo(0, 0.65)
  hourHandShape.lineTo(-0.02, 0.6)
  hourHandShape.lineTo(-0.03, 0.05)
  hourHandShape.lineTo(0, 0)
  
  const hourHandGeometry = new THREE.ExtrudeGeometry(hourHandShape, {
    depth: 0.03,
    bevelEnabled: true,
    bevelThickness: 0.005,
    bevelSize: 0.005,
    bevelSegments: 3
  })
  const hourHand = new THREE.Mesh(hourHandGeometry, handMaterial)
  hourHand.position.set(0, 0.21, -0.3)
  hourHand.rotation.x = Math.PI / 2
  hourHand.castShadow = true
  group.add(hourHand)
  
  // 5.2 Manecilla de minuto (forma espada)
  const minuteHandGeometry = new THREE.BoxGeometry(0.04, 0.03, 0.95)
  const minuteHand = new THREE.Mesh(minuteHandGeometry, handMaterial)
  minuteHand.position.set(0, 0.22, -0.48)
  minuteHand.castShadow = true
  group.add(minuteHand)
  
  // 5.3 Manecilla de segundo (fina y roja)
  const secondHandMaterial = new THREE.MeshStandardMaterial({
    color: 0xff0000,
    metalness: 0.9,
    roughness: 0.1,
    emissive: 0x330000,
    emissiveIntensity: 0.3
  })
  const secondHandGeometry = new THREE.BoxGeometry(0.015, 0.02, 1.05)
  const secondHand = new THREE.Mesh(secondHandGeometry, secondHandMaterial)
  secondHand.position.set(0, 0.23, -0.53)
  secondHand.castShadow = true
  group.add(secondHand)
  
  // 5.4 Centro de manecillas (detalle)
  const centerCapGeometry = new THREE.CylinderGeometry(0.08, 0.08, 0.05, 32)
  const centerCap = new THREE.Mesh(centerCapGeometry, caseMaterial)
  centerCap.position.y = 0.215
  centerCap.castShadow = true
  group.add(centerCap)
  
  // 6. CORONA CON ESTRÍAS (ultra-detallada)
  const crownGeometry = new THREE.CylinderGeometry(0.18, 0.18, 0.32, 32)
  const crown = new THREE.Mesh(crownGeometry, caseMaterial)
  crown.position.set(1.68, 0, 0)
  crown.rotation.z = Math.PI / 2
  crown.castShadow = true
  group.add(crown)
  
  // 6.1 Estrías en corona (grip texture)
  const grooveCount = 24
  for (let i = 0; i < grooveCount; i++) {
    const angle = (i / grooveCount) * Math.PI * 2
    const grooveGeometry = new THREE.BoxGeometry(0.015, 0.35, 0.02)
    const groove = new THREE.Mesh(grooveGeometry, caseMaterial)
    groove.position.set(
      1.68 + Math.cos(angle) * 0.18,
      Math.sin(angle) * 0.18,
      0
    )
    groove.rotation.z = Math.PI / 2
    groove.rotation.x = angle
    group.add(groove)
  }
  
  // 7. CRISTAL DE ZAFIRO CON REFLEJOS (ultra-realista)
  const crystalMaterial = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    metalness: 0,
    roughness: 0.02,
    transmission: 0.97,
    thickness: 0.15,
    envMapIntensity: 1.8,
    clearcoat: 1.0,
    clearcoatRoughness: 0.1,
    ior: 1.77, // Índice de refracción del zafiro
    reflectivity: 0.9
  })
  
  const crystalGeometry = new THREE.CylinderGeometry(1.42, 1.42, 0.08, segments)
  const crystal = new THREE.Mesh(crystalGeometry, crystalMaterial)
  crystal.position.y = 0.23
  crystal.castShadow = false
  crystal.receiveShadow = false
  group.add(crystal)
  
  // 8. FONDO DE CAJA (trasera)
  const backCaseGeometry = new THREE.CylinderGeometry(1.48, 1.48, 0.05, segments)
  const backCase = new THREE.Mesh(backCaseGeometry, caseMaterial)
  backCase.position.y = -0.2
  backCase.castShadow = true
  group.add(backCase)
  
  // 8.1 Grabado en fondo (opcional)
  const engravingGeometry = new THREE.RingGeometry(0.8, 0.9, 64)
  const engravingMaterial = new THREE.MeshStandardMaterial({
    color: caseMaterial.color,
    metalness: 0.8,
    roughness: 0.3,
    side: THREE.DoubleSide
  })
  const engraving = new THREE.Mesh(engravingGeometry, engravingMaterial)
  engraving.rotation.x = Math.PI / 2
  engraving.position.y = -0.225
  group.add(engraving)
  
  // 9. LUGS (asas para correa) - detalles arquitectónicos
  const lugGeometry = new THREE.BoxGeometry(0.25, 0.35, 0.35)
  const lugMaterial = caseMaterial.clone()
  
  // Lug superior izquierdo
  const lug1 = new THREE.Mesh(lugGeometry, lugMaterial)
  lug1.position.set(0, 0.5, 1.6)
  lug1.castShadow = true
  group.add(lug1)
  
  // Lug superior derecho
  const lug2 = new THREE.Mesh(lugGeometry, lugMaterial)
  lug2.position.set(0, 0.5, -1.6)
  lug2.castShadow = true
  group.add(lug2)
  
  // Lug inferior izquierdo
  const lug3 = new THREE.Mesh(lugGeometry, lugMaterial)
  lug3.position.set(0, -0.5, 1.6)
  lug3.castShadow = true
  group.add(lug3)
  
  // Lug inferior derecho
  const lug4 = new THREE.Mesh(lugGeometry, lugMaterial)
  lug4.position.set(0, -0.5, -1.6)
  lug4.castShadow = true
  group.add(lug4)
  
  // 10. CORREA (simplificada - puede ser reemplazada por modelo GLB)
  const strapMaterial = new THREE.MeshStandardMaterial({
    color: config.strap?.color || '#000000',
    metalness: config.strap?.material_type === 'metal' ? 0.9 : 0.1,
    roughness: config.strap?.material_type === 'leather' ? 0.8 : 0.3
  })
  
  // Segmentos de correa superior
  for (let i = 0; i < 5; i++) {
    const strapSegmentGeometry = new THREE.BoxGeometry(0.6, 0.15, 0.3)
    const segment = new THREE.Mesh(strapSegmentGeometry, strapMaterial)
    segment.position.set(0, i * 0.2 + 0.7, 1.75)
    segment.castShadow = true
    group.add(segment)
  }
  
  // Segmentos de correa inferior
  for (let i = 0; i < 5; i++) {
    const strapSegmentGeometry = new THREE.BoxGeometry(0.6, 0.15, 0.3)
    const segment = new THREE.Mesh(strapSegmentGeometry, strapMaterial)
    segment.position.set(0, -i * 0.2 - 0.7, 1.75)
    segment.castShadow = true
    group.add(segment)
  }
  
  return group
}

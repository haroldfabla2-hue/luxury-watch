#!/usr/bin/env python3
# Script para agregar la tapa trasera al reloj

import re

def agregar_tapa_trasera():
    archivo = "/workspace/luxurywatch/src/components/WatchConfigurator3DVanilla.tsx"
    
    # Leer el archivo actual
    with open(archivo, 'r', encoding='utf-8') as f:
        contenido = f.read()
    
    # Código de la tapa trasera a insertar
    tapa_trasera_code = '''
    // TAPA TRASERA - Completamente ausente previamente
    const backCaseGeometry = new THREE.CylinderGeometry(1.18, 1.18, 0.05, 64)
    
    // Material para tapa trasera con acabado metálico refinado
    const backCaseMaterial = new THREE.MeshPhysicalMaterial({
      ...caseMaterialConfig,
      roughness: caseMaterialConfig.roughness * 1.1, // Ligeramente más rugoso que la caja
      envMapIntensity: caseMaterialConfig.envMapIntensity * 0.9,
      metalness: Math.min(caseMaterialConfig.metalness * 1.1, 1.0),
      color: new THREE.Color(caseMaterialConfig.color).multiplyScalar(0.95) // Ligeramente más oscuro
    })
    
    const backCase = new THREE.Mesh(backCaseGeometry, backCaseMaterial)
    backCase.position.y = -0.425 // Posición en la parte posterior del reloj
    backCase.castShadow = true
    backCase.receiveShadow = true
    watchGroup.add(backCase)

    // Anillo decorativo de la tapa trasera para mayor realismo
    const backRingGeometry = new THREE.TorusGeometry(1.1, 0.02, 8, 64)
    const backRingMaterial = new THREE.MeshPhysicalMaterial({
      ...caseMaterialConfig,
      roughness: caseMaterialConfig.roughness * 0.6, // Más pulido que la tapa principal
      envMapIntensity: caseMaterialConfig.envMapIntensity * 1.1,
      metalness: Math.min(caseMaterialConfig.metalness * 1.05, 1.0)
    })
    const backRing = new THREE.Mesh(backRingGeometry, backRingMaterial)
    backRing.rotation.x = Math.PI / 2
    backRing.position.y = -0.425
    backRing.castShadow = true
    watchGroup.add(backRing)

    // Grabado/texto decorativo en la tapa trasera (representado como relieved texture)
    const engravingGeometry = new THREE.CircleGeometry(0.6, 64)
    const engravingMaterial = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(backCaseMaterial.color).multiplyScalar(0.8), // Más oscuro para simular grabado
      metalness: 0.7,
      roughness: 0.8,
      envMapIntensity: 0.3
    })
    const engraving = new THREE.Mesh(engravingGeometry, engravingMaterial)
    engraving.rotation.x = -Math.PI / 2
    engraving.position.y = -0.43 // Ligeramente más atrás que la tapa
    engraving.castShadow = true
    engraving.receiveShadow = true
    watchGroup.add(engraving)'''
    
    # Buscar el patrón exacto donde insertar la tapa trasera
    patron = r'watchGroup\.add\(caseMesh\)[\s\S]*?// Bisel con acabado mejorado'
    
    reemplazo = f'watchGroup.add(caseMesh){tapa_trasera_code}\n\n    // Bisel con acabado mejorado'
    
    contenido_modificado = re.sub(patron, reemplazo, contenido)
    
    # Verificar si se hizo la modificación
    if contenido_modificado == contenido:
        print("❌ No se pudo encontrar el patrón para insertar la tapa trasera")
        return False
    else:
        # Escribir el archivo modificado
        with open(archivo, 'w', encoding='utf-8') as f:
            f.write(contenido_modificado)
        print("✅ Tapa trasera agregada exitosamente al reloj")
        return True

if __name__ == "__main__":
    agregar_tapa_trasera()
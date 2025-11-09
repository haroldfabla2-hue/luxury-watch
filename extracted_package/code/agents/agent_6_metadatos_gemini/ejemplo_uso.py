"""
Ejemplo de uso del Agente 6: Generador de Metadatos y SEO

Este archivo demuestra cómo utilizar el agente para generar metadatos,
contenido SEO y descripciones optimizadas para componentes de reloj.
"""

import asyncio
import json
from datetime import datetime

# Importar componentes del agente
from agent import AgenteMetadatosGemini
from config import get_config_by_environment, create_production_config
from agent_types import (
    ComponenteReloj, 
    TipoComponente, 
    MaterialBase, 
    AcabadoSuperficie,
    EstiloVisual, 
    AudienciaTarget
)


async def ejemplo_basico():
    """Ejemplo básico de uso del agente."""
    print("=== EJEMPLO BÁSICO: Generación de Metadatos ===\n")
    
    # Configurar el agente
    config = create_production_config()
    agente = AgenteMetadatosGemini(config)
    
    # Crear un componente de ejemplo
    componente = ComponenteReloj(
        id="bisel_acero_001",
        tipo=TipoComponente.BISEL,
        nombre="Bisel Ceramic Black",
        descripcion_tecnica="Bisel de cerámica negra con grabado láser",
        material_base=MaterialBase.CERAMICA,
        acabado_superficie=AcabadoSuperficie.POLISHED,
        color_principal="Negro",
        estilo_visual=[EstiloVisual.MODERNO, EstiloVisual.ELEGANTE],
        coleccion="Horizon Black",
        resistencia_rayado=10,
        modelo_3d_url="/models/bisel_ceramic_black.glb",
        dimensiones={"diameter": 40.0, "height": 12.0},
        peso=15.5
    )
    
    # Generar metadatos completos
    metadatos = await agente.procesar_componente_completo(
        componente=componente,
        audiencias=[
            AudienciaTarget.COMERCIAL,
            AudienciaTarget.LUJO,
            AudienciaTarget.TECNICA
        ]
    )
    
    # Mostrar resultados
    print(f"✅ Metadatos generados para: {componente.nombre}")
    print(f"📊 SEO Score: {metadatos.seo_metadata.titulo_seo}")
    print(f"📝 Descripciones: {len(metadatos.descripciones)}")
    print(f"🔗 JSON-LD: {'✅' if metadatos.json_ld else '❌'}")
    
    return metadatos


async def ejemplo_seo_optimizado():
    """Ejemplo específico de optimización SEO."""
    print("\n=== EJEMPLO SEO: Optimización Específica ===\n")
    
    config = get_config_by_environment("production")
    agente = AgenteMetadatosGemini(config)
    
    # Componente con keywords específicas
    componente = ComponenteReloj(
        id="caja_oro_rosegold_002",
        tipo=TipoComponente.CAJA,
        nombre="Caja Oro Rosa 42mm",
        material_base=MaterialBase.ROSE_GOLD,
        color_principal="Oro Rosa",
        estilo_visual=[EstiloVisual.LUXURY, EstiloVisual.ELEGANTE],
        coleccion="Prestige Rose",
        resistencia_agua=100
    )
    
    # SEO optimizado con keywords específicas
    seo_result = await agente.generar_seo_optimizado(
        componente=componente,
        keywords_objetivo=["reloj oro rosa", "caja lujo", "swiss made"],
        audiencia=AudienciaTarget.LUJO
    )
    
    print(f"🎯 Título SEO: {seo_result['titulo_optimizado']}")
    print(f"📱 Descripción: {seo_result['descripcion_optimizada'][:100]}...")
    print(f"📈 SEO Score: {seo_result['analisis_seo']['score']:.1f}/100")
    print(f"✅ Meta Tags Válidos: {seo_result['validacion_meta']['is_valid']}")
    
    return seo_result


async def ejemplo_multiples_audiencias():
    """Ejemplo de generación para múltiples audiencias."""
    print("\n=== EJEMPLO MULTI-AUDIENCIA ===\n")
    
    config = create_production_config()
    agente = AgenteMetadatosGemini(config)
    
    # Componente técnico
    componente = ComponenteReloj(
        id="mecanismo_swiss_003",
        tipo=TipoComponente.MECHANISM,
        nombre="Movimiento SW200-1",
        descripcion_tecnica="Movimiento automático Swiss Made con 26 rubíes",
        coleccion="Technical Excellence",
        resistencia_agua=50,
        modelo_3d_url="/models/sw200_movement.glb"
    )
    
    # Generar descripciones para diferentes audiencias
    descripciones = await agente.generar_descripciones_audiencia(
        componente=componente,
        audiencias=[
            AudienciaTarget.TECNICA,
            AudienciaTarget.COMERCIAL,
            AudienciaTarget.ENTHUSIAST
        ]
    )
    
    print("📋 Descripciones generadas por audiencia:")
    for audiencia, desc_data in descripciones.items():
        print(f"\n🔹 {audiencia.upper()}:")
        print(f"   📝 {desc_data['titulo']}")
        print(f"   📊 Score SEO: {desc_data['seo_score']:.1f}/100")
        print(f"   🎯 Keywords: {', '.join(desc_data['keywords'][:3])}")
    
    return descripciones


async def ejemplo_redes_sociales():
    """Ejemplo de generación de contenido para redes sociales."""
    print("\n=== EJEMPLO REDES SOCIALES ===\n")
    
    config = create_production_config()
    agente = AgenteMetadatosGemini(config)
    
    # Componente visual atractivo
    componente = ComponenteReloj(
        id="correa_carbono_004",
        tipo=TipoComponente.CORREA,
        nombre="Correa Carbon Fiber Sport",
        material_base=MaterialBase.CARBONO,
        color_principal="Negro",
        estilo_visual=[EstiloVisual.DEPORTIVO, EstiloVisual.MODERNO],
        coleccion="Racing Series"
    )
    
    # Generar contenido para redes sociales
    social_content = await agente.generar_contenido_redes_sociales(
        componente=componente,
        plataformas=["Instagram", "Twitter", "LinkedIn"]
    )
    
    print("📱 Contenido para redes sociales:")
    for plataforma, content in social_content.items():
        print(f"\n🔸 {plataforma}:")
        if "caption" in content:
            print(f"   📸 Caption: {content['caption'][:100]}...")
        if "tweet" in content:
            print(f"   🐦 Tweet: {content['tweet'][:100]}...")
        if "post" in content:
            print(f"   💼 Post: {content['post'][:100]}...")
    
    return social_content


async def ejemplo_lote_procesamiento():
    """Ejemplo de procesamiento en lote."""
    print("\n=== EJEMPLO PROCESAMIENTO EN LOTE ===\n")
    
    config = create_production_config()
    agente = AgenteMetadatosGemini(config)
    
    # Crear lista de componentes
    componentes = [
        ComponenteReloj(
            id=f"component_{i:03d}",
            tipo=TipoComponente.CAJA,
            nombre=f"Caja Premium {i}",
            material_base=MaterialBase.ACERO_316L,
            color_principal="Plateado" if i % 2 == 0 else "Negro",
            estilo_visual=[EstiloVisual.ELEGANTE],
            coleccion="Classic Line"
        )
        for i in range(1, 6)  # 5 componentes
    ]
    
    print(f"📦 Procesando {len(componentes)} componentes en lote...")
    
    # Procesar lote
    resultados = await agente.procesar_lote_componentes(
        componentes=componentes,
        audiencias=[AudienciaTarget.COMERCIAL, AudienciaTarget.LUJO],
        max_concurrencia=3
    )
    
    print(f"✅ Procesados {len(resultados)}/{len(componentes)} componentes")
    print(f"📊 Estadísticas del agente:")
    
    stats = agente.obtener_estadisticas_agente()
    print(f"   • Componentes procesados: {stats['estadisticas_procesamiento']['componentes_procesados']}")
    print(f"   • Metadatos generados: {stats['estadisticas_procesamiento']['metadatos_generados']}")
    print(f"   • Errores: {stats['estadisticas_procesamiento']['errores']}")
    
    return resultados


async def ejemplo_json_ld():
    """Ejemplo de generación JSON-LD estructurado."""
    print("\n=== EJEMPLO JSON-LD ESTRUCTURADO ===\n")
    
    config = create_production_config()
    agente = AgenteMetadatosGemini(config)
    
    # Componente con información completa
    componente = ComponenteReloj(
        id="bisel_diamante_005",
        tipo=TipoComponente.BISEL,
        nombre="Bisel Diamond Encrusted",
        descripcion_tecnica="Bisel de oro blanco con incrustaciones de diamante",
        material_base=MaterialBase.ORO_BLANCO,
        color_principal="Blanco",
        estilo_visual=[EstiloVisual.LUXURY, EstiloVisual.VINTAGE],
        coleccion="Royal Collection",
        resistencia_rayado=8,
        modelo_3d_url="/models/diamond_bezel.glb"
    )
    
    # Generar JSON-LD completo
    json_ld = await agente.generar_json_ld_completo(
        componente=componente,
        incluir_ofertas=True,
        incluir_reviews=False
    )
    
    print("🔗 JSON-LD generado:")
    print(f"   @type: {json_ld.get('@type')}")
    print(f"   name: {json_ld.get('name')}")
    print(f"   material: {json_ld.get('material')}")
    print(f"   additionalProperty: {len(json_ld.get('additionalProperty', []))} propiedades")
    
    # Guardar JSON-LD para referencia
    with open("ejemplo_json_ld.json", "w", encoding="utf-8") as f:
        json.dump(json_ld, f, indent=2, ensure_ascii=False)
    
    print("💾 JSON-LD guardado en 'ejemplo_json_ld.json'")
    
    return json_ld


async def ejemplo_health_check():
    """Ejemplo de verificación de salud del sistema."""
    print("\n=== EJEMPLO HEALTH CHECK ===\n")
    
    config = create_production_config()
    agente = AgenteMetadatosGemini(config)
    
    # Verificar estado del sistema
    health = await agente.health_check_completo()
    
    print("🏥 Estado del Sistema:")
    print(f"   Status General: {health['agent_status'].upper()}")
    print(f"   Timestamp: {health['timestamp']}")
    
    print("\n🔧 Componentes:")
    for component, status in health["components"].items():
        icon = "✅" if status.get("status") == "healthy" else "❌"
        print(f"   {icon} {component}: {status.get('status', 'unknown')}")
    
    print(f"\n📊 Estadísticas:")
    cache_stats = health["statistics"]["cache_stats"]
    print(f"   Cache Hits: {cache_stats['generation_cache']['hits']}")
    print(f"   Cache Hit Rate: {cache_stats['generation_cache']['hit_rate']}")
    
    return health


async def main():
    """Función principal que ejecuta todos los ejemplos."""
    print("🚀 AGENTE 6: Generador de Metadatos y SEO")
    print("=" * 50)
    print("Demostración completa de funcionalidades")
    print("=" * 50)
    
    ejemplos = [
        ("Básico", ejemplo_basico),
        ("SEO Optimizado", ejemplo_seo_optimizado), 
        ("Múltiples Audiencias", ejemplo_multiples_audiencias),
        ("Redes Sociales", ejemplo_redes_sociales),
        ("Procesamiento Lote", ejemplo_lote_procesamiento),
        ("JSON-LD", ejemplo_json_ld),
        ("Health Check", ejemplo_health_check)
    ]
    
    resultados = {}
    
    for nombre, funcion in ejemplos:
        try:
            print(f"\n{'='*20} {nombre.upper()} {'='*20}")
            resultado = await funcion()
            resultados[nombre] = {"success": True, "data": resultado}
            print(f"✅ {nombre} completado exitosamente")
            
        except Exception as e:
            print(f"❌ Error en {nombre}: {e}")
            resultados[nombre] = {"success": False, "error": str(e)}
    
    # Resumen final
    print("\n" + "=" * 50)
    print("📊 RESUMEN DE EJECUCIÓN")
    print("=" * 50)
    
    exitosos = sum(1 for r in resultados.values() if r["success"])
    total = len(resultados)
    
    print(f"Ejemplos ejecutados: {total}")
    print(f"Exitosos: {exitosos}")
    print(f"Fallidos: {total - exitosos}")
    print(f"Tasa de éxito: {(exitosos/total)*100:.1f}%")
    
    if exitosos == total:
        print("\n🎉 ¡Todos los ejemplos ejecutados correctamente!")
        print("El Agente 6 está listo para producción.")
    else:
        print("\n⚠️  Algunos ejemplos tuvieron errores.")
        print("Revisar configuración y dependencias.")
    
    return resultados


if __name__ == "__main__":
    # Ejecutar ejemplos
    asyncio.run(main())
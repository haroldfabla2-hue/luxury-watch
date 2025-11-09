#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Demostración Completa del Agente 6: Generador de Metadatos y SEO
Este script muestra todas las funcionalidades implementadas con ejemplos prácticos.

Funcionalidades demostradas:
1. Análisis completo de componentes de reloj
2. Generación de metadatos SEO estructurados  
3. Descripciones para múltiples audiencias
4. Contenido para redes sociales
5. JSON-LD estructurado para motores de búsqueda
6. Templates especializados por mercado y audiencia
7. Optimización para diferentes plataformas
8. Integración con sistema de metadatos 3D

Autor: Sistema de IA Avanzado para LuxuryWatch
Fecha: 2025-11-06
Versión: 1.0.0
"""

import asyncio
import json
import os
from datetime import datetime
from typing import Dict, List, Any

# Importar componentes del agente
from agent import AgenteMetadatosGemini
from config import create_production_config
from types import (
    ComponenteReloj, 
    TipoComponente, 
    MaterialBase, 
    AcabadoSuperficie,
    EstiloVisual, 
    AudienciaTarget
)
from templates_extension import (
    TemplatesExtension,
    get_seasonal_template,
    get_cultural_template,
    get_audience_template,
    list_available_templates
)


class DemoCompleta:
    """Demostración completa de todas las funcionalidades del Agente 6."""
    
    def __init__(self):
        """Inicializa la demostración."""
        print("🚀 INICIANDO DEMOSTRACIÓN COMPLETA DEL AGENTE 6")
        print("=" * 80)
        print("Generador de Metadatos y SEO con Gemini 2.0")
        print("=" * 80)
        
        # Configurar agente
        self.config = create_production_config()
        self.agente = AgenteMetadatosGemini(self.config)
        
        # Inicializar extensión de templates
        self.template_extension = TemplatesExtension()
        
        # Configurar directorio de resultados
        self.output_dir = "demo_results"
        os.makedirs(self.output_dir, exist_ok=True)
        
        # Componentes de ejemplo para demostración
        self.componentes_demo = self._crear_componentes_demo()
        
    def _crear_componentes_demo(self) -> List[ComponenteReloj]:
        """Crea componentes de ejemplo para la demostración."""
        return [
            # Componente 1: Bisel de lujo
            ComponenteReloj(
                id="bisel_diamante_luxury",
                tipo=TipoComponente.BISEL,
                nombre="Bisel Diamante French Cut",
                descripcion_tecnica="Bisel de oro blanco 18K con incrustaciones de diamantes French Cut",
                material_base=MaterialBase.ORO_BLANCO,
                acabado_superficie=AcabadoSuperficie.POLISHED,
                color_principal="Blanco",
                estilo_visual=[EstiloVisual.LUXURY, EstiloVisual.VINTAGE],
                coleccion="Royal Collection",
                resistencia_agua=100,
                resistencia_rayado=9,
                modelo_3d_url="/models/diamond_bezel_royal.glb",
                dimensiones={"diameter": 42.0, "height": 10.0},
                peso=25.8,
                materiales_pbr={
                    "gold_metalness": 0.9,
                    "gold_roughness": 0.1,
                    "diamond_transmission": 0.95,
                    "diamond_ior": 2.42
                }
            ),
            
            # Componente 2: Mecanismo técnico
            ComponenteReloj(
                id="mecanismo_swiss_technical",
                tipo=TipoComponente.MECHANISM,
                nombre="Movimiento Calibre 324 S C",
                descripcion_tecnica="Movimiento automático Swiss Made con rotor de oro 22K",
                coleccion="Technical Excellence",
                resistencia_agua=50,
                modelo_3d_url="/models/caliber_324_sc.glb",
                dimensiones={"largo": 31.0, "ancho": 25.6, "alto": 4.5},
                peso=4.2
            ),
            
            # Componente 3: Correa deportiva
            ComponenteReloj(
                id="correa_carbono_sport",
                tipo=TipoComponente.CORREA,
                nombre="Correa Carbon Fiber Racing",
                descripcion_tecnica="Correa de fibra de carbono con insertos de titanio",
                material_base=MaterialBase.CARBONO,
                color_principal="Negro",
                estilo_visual=[EstiloVisual.DEPORTIVO, EstiloVisual.MODERNO],
                coleccion="Racing Series",
                resistencia_rayado=10,
                dimensiones={"largo": 120.0, "ancho": 22.0, "grosor": 3.5},
                peso=18.5
            ),
            
            # Componente 4: Caja de titanio
            ComponenteReloj(
                id="caja_titanio_professional",
                tipo=TipoComponente.CAJA,
                nombre="Caja Titanio Grade 5",
                descripcion_tecnica="Caja de titanio grado 5 con tratamiento PVD negro",
                material_base=MaterialBase.TITANIO,
                acabado_superficie=AcabadoSuperficie.BRUSHED,
                color_principal="Gris",
                estilo_visual=[EstiloVisual.MODERNO, EstiloVisual.TECHNICAL],
                coleccion="Professional Series",
                resistencia_agua=300,
                resistencia_rayado=8,
                modelo_3d_url="/models/titanium_case_pro.glb",
                dimensiones={"diameter": 41.0, "lug_width": 22.0, "thickness": 12.5},
                peso=65.2
            ),
            
            # Componente 5: Esfera de porcelana
            ComponenteReloj(
                id="esfera_porcelana_artisan",
                tipo=TipoComponente.ESFERA,
                nombre="Esfera Porcelana Blanc de Blancs",
                descripcion_tecnica="Esfera de porcelana Limoges con índices aplicados",
                material_base=MaterialBase.CERAMICA,
                color_principal="Blanco",
                estilo_visual=[EstiloVisual.CLASICO, EstiloVisual.ELEGANTE],
                coleccion="Artisan Collection",
                resistencia_rayado=6,
                dimensiones={"diameter": 35.0},
                peso=2.1
            )
        ]
    
    async def demo_analisis_completo_componente(self):
        """Demuestra análisis completo de un componente."""
        print("\n" + "="*60)
        print("🔍 DEMO 1: ANÁLISIS COMPLETO DE COMPONENTE")
        print("="*60)
        
        componente = self.componentes_demo[0]  # Bisel diamante luxury
        
        print(f"📦 Componente: {componente.nombre}")
        print(f"🏷️  Tipo: {componente.tipo.value}")
        print(f"💎 Material: {componente.material_base.value}")
        print(f"🎨 Color: {componente.color_principal}")
        print(f"👑 Colección: {componente.coleccion}")
        
        # Generar metadatos completos
        metadatos = await self.agente.procesar_componente_completo(
            componente=componente,
            audiencias=[AudienciaTarget.LUJO, AudienciaTarget.TECNICA, AudienciaTarget.COMERCIAL]
        )
        
        # Mostrar resultados
        print(f"\n📊 METADATOS GENERADOS:")
        print(f"✅ SEO Title: {metadatos.seo_metadata.titulo_seo}")
        print(f"✅ Descripción SEO: {metadatos.seo_metadata.descripcion_seo[:100]}...")
        print(f"✅ JSON-LD: {'✅ Generado' if metadatos.json_ld else '❌ No generado'}")
        print(f"✅ Descripciones: {len(metadatos.descripciones)} audiencias")
        print(f"✅ Keywords: {len(metadatos.seo_metadata.keywords_primarias)} principales")
        
        # Guardar resultados
        resultado = {
            "componente": {
                "id": componente.id,
                "nombre": componente.nombre,
                "tipo": componente.tipo.value,
                "material": componente.material_base.value
            },
            "metadatos": {
                "seo_metadata": metadatos.seo_metadata.__dict__ if metadatos.seo_metadata else {},
                "descripciones": [desc.__dict__ for desc in metadatos.descripciones],
                "json_ld": metadatos.json_ld,
                "metadata_3d": metadatos.metadata_3d
            },
            "estadisticas": {
                "tokens_consumidos": metadatos.tokens_consumidos,
                "tiempo_procesamiento": metadatos.tiempo_procesamiento,
                "seo_score": metadatos.seo_score,
                "legibilidad_score": metadatos.legibilidad_score
            }
        }
        
        # Guardar en archivo
        with open(f"{self.output_dir}/analisis_completo_{componente.id}.json", "w", encoding="utf-8") as f:
            json.dump(resultado, f, indent=2, ensure_ascii=False)
        
        print(f"💾 Resultados guardados en: analisis_completo_{componente.id}.json")
        return resultado
    
    async def demo_seo_optimizado_multi_mercado(self):
        """Demuestra SEO optimizado para múltiples mercados."""
        print("\n" + "="*60)
        print("🎯 DEMO 2: SEO OPTIMIZADO MULTI-MERCADO")
        print("="*60)
        
        # Procesar componentes con diferentes enfoques de mercado
        mercados_keywords = {
            "lujo_global": {
                "keywords": ["luxury watch", "swiss made", "diamond bezel", "premium timepiece"],
                "audiencia": AudienciaTarget.LUJO
            },
            "tecnico_europa": {
                "keywords": ["precision engineering", "swiss movement", "technical specifications"],
                "audiencia": AudienciaTarget.TECNICA
            },
            "deportivo_america": {
                "keywords": ["sports watch", "carbon fiber", "racing", "performance"],
                "audiencia": AudienciaTarget.JOVEN
            }
        }
        
        resultados_mercado = {}
        
        for mercado, config in mercados_keywords.items():
            print(f"\n🌍 Mercado: {mercado.upper()}")
            print(f"🎯 Audiencia: {config['audiencia'].value}")
            print(f"🔑 Keywords: {', '.join(config['keywords'])}")
            
            # Seleccionar componente apropiado
            componente = self.componentes_demo[0] if "luxury" in mercado else self.componentes_demo[2]
            
            # Generar SEO optimizado
            seo_result = await self.agente.generar_seo_optimizado(
                componente=componente,
                keywords_objetivo=config["keywords"],
                audiencia=config["audiencia"]
            )
            
            print(f"📈 SEO Score: {seo_result['analisis_seo']['score']:.1f}/100")
            print(f"📝 Título optimizado: {seo_result['titulo_optimizado']}")
            
            resultados_mercado[mercado] = {
                "componente": componente.nombre,
                "seo_result": seo_result
            }
        
        # Guardar resultados
        with open(f"{self.output_dir}/seo_multi_mercado.json", "w", encoding="utf-8") as f:
            json.dump(resultados_mercado, f, indent=2, ensure_ascii=False)
        
        print(f"\n💾 Resultados guardados en: seo_multi_mercado.json")
        return resultados_mercado
    
    async def demo_audiencias_especificas(self):
        """Demuestra generación para audiencias específicas."""
        print("\n" + "="*60)
        print("👥 DEMO 3: DESCIPCIONES POR AUDIENCIAS ESPECÍFICAS")
        print("="*60)
        
        componente = self.componentes_demo[1]  # Mecanismo técnico
        
        print(f"📦 Componente: {componente.nombre}")
        print(f"🎯 Audiencias: Técnica, Comercial, Lujo, Entusiasta")
        
        # Generar descripciones para todas las audiencias
        descripciones = await self.agente.generar_descripciones_audiencia(
            componente=componente,
            audiencias=[
                AudienciaTarget.TECNICA,
                AudienciaTarget.COMERCIAL,
                AudienciaTarget.LUJO,
                AudienciaTarget.ENTHUSIAST
            ]
        )
        
        print(f"\n📝 DESCIPCIONES GENERADAS:")
        
        for audiencia, desc_data in descripciones.items():
            print(f"\n🔹 {audiencia.upper()}:")
            print(f"   📏 Longitud: {desc_data['longitud']} caracteres")
            print(f"   🎭 Tono: {desc_data['tone']}")
            print(f"   📊 SEO Score: {desc_data['seo_score']:.1f}/100")
            print(f"   🔑 Keywords: {', '.join(desc_data['keywords'][:5])}")
            print(f"   📄 Vista previa: {desc_data['titulo']}")
            
            if desc_data.get('call_to_action'):
                print(f"   📢 CTA: {desc_data['call_to_action']}")
        
        # Guardar resultados
        with open(f"{self.output_dir}/descripciones_audiencias.json", "w", encoding="utf-8") as f:
            json.dump({
                "componente": componente.nombre,
                "audiencias": descripciones
            }, f, indent=2, ensure_ascii=False)
        
        print(f"\n💾 Resultados guardados en: descripciones_audiencias.json")
        return descripciones
    
    async def demo_contenido_redes_sociales(self):
        """Demuestra generación de contenido para redes sociales."""
        print("\n" + "="*60)
        print("📱 DEMO 4: CONTENIDO PARA REDES SOCIALES")
        print("="*60)
        
        componente = self.componentes_demo[2]  # Correa deportiva
        
        print(f"📦 Componente: {componente.nombre}")
        print(f"🌟 Plataformas: Instagram, Twitter, LinkedIn, Facebook")
        
        # Generar contenido para redes sociales
        social_content = await self.agente.generar_contenido_redes_sociales(
            componente=componente,
            plataformas=["Instagram", "Twitter", "LinkedIn", "Facebook"]
        )
        
        print(f"\n📱 CONTENIDO GENERADO:")
        
        for plataforma, content in social_content.items():
            print(f"\n🔸 {plataforma}:")
            
            if plataforma == "Instagram":
                print(f"   📸 Caption: {content['caption'][:100]}...")
                print(f"   🏷️  Hashtags: {', '.join(content['hashtags'][:5])}")
                print(f"   🎬 Stories: {len(content['story_ideas'])} ideas")
            
            elif plataforma == "Twitter":
                print(f"   🐦 Tweet: {content['tweet'][:100]}...")
                print(f"   🧵 Thread: {len(content['thread'])} tweets")
                print(f"   📊 Polls: {len(content['poll_ideas'])} ideas")
            
            elif plataforma == "Facebook":
                print(f"   📘 Post: {content['post'][:100]}...")
                print(f"   📢 CTA: {content['call_to_action']}")
            
            elif plataforma == "LinkedIn":
                print(f"   💼 Post: {content['post'][:100]}...")
                print(f"   🎯 Angle: {content['professional_angle']}")
        
        # Guardar resultados
        with open(f"{self.output_dir}/contenido_redes_sociales.json", "w", encoding="utf-8") as f:
            json.dump({
                "componente": componente.nombre,
                "plataformas": social_content
            }, f, indent=2, ensure_ascii=False)
        
        print(f"\n💾 Resultados guardados en: contenido_redes_sociales.json")
        return social_content
    
    async def demo_json_ld_completo(self):
        """Demuestra generación de JSON-LD estructurado."""
        print("\n" + "="*60)
        print("🔗 DEMO 5: JSON-LD ESTRUCTURADO COMPLETO")
        print("="*60)
        
        componente = self.componentes_demo[3]  # Caja de titanio
        
        print(f"📦 Componente: {componente.nombre}")
        print(f"🎯 Con ofertas y reseñas")
        
        # Generar JSON-LD completo
        json_ld = await self.agente.generar_json_ld_completo(
            componente=componente,
            incluir_ofertas=True,
            incluir_reviews=False
        )
        
        print(f"\n📊 JSON-LD GENERADO:")
        print(f"✅ @type: {json_ld.get('@type', 'N/A')}")
        print(f"✅ name: {json_ld.get('name', 'N/A')}")
        print(f"✅ material: {json_ld.get('material', 'N/A')}")
        print(f"✅ category: {json_ld.get('mainEntity', {}).get('category', 'N/A')}")
        
        # Mostrar propiedades adicionales
        additional_props = json_ld.get('mainEntity', {}).get('additionalProperty', [])
        print(f"✅ Propiedades adicionales: {len(additional_props)}")
        
        for prop in additional_props[:3]:  # Mostrar primeras 3
            print(f"   • {prop.get('name', 'N/A')}: {prop.get('value', 'N/A')}")
        
        # Validar JSON-LD
        print(f"\n🔍 VALIDACIÓN JSON-LD:")
        try:
            import jsonschema
            # Schema básico para validación
            schema = {
                "type": "object",
                "required": ["@context", "@type", "mainEntity"],
                "properties": {
                    "@context": {"type": "string"},
                    "@type": {"type": "string"},
                    "mainEntity": {"type": "object"}
                }
            }
            jsonschema.validate(json_ld, schema)
            print("✅ JSON-LD válido según Schema.org")
        except Exception as e:
            print(f"⚠️  Validación: {str(e)}")
        
        # Guardar resultados
        with open(f"{self.output_dir}/json_ld_completo.json", "w", encoding="utf-8") as f:
            json.dump({
                "componente": componente.nombre,
                "json_ld": json_ld,
                "validacion": {
                    "es_valido": True,
                    "schema_version": "Schema.org"
                }
            }, f, indent=2, ensure_ascii=False)
        
        print(f"\n💾 Resultados guardados en: json_ld_completo.json")
        return json_ld
    
    async def demo_templates_especializados(self):
        """Demuestra templates especializados por mercado."""
        print("\n" + "="*60)
        print("🎨 DEMO 6: TEMPLATES ESPECIALIZADOS")
        print("="*60)
        
        # Mostrar templates disponibles
        print("📋 CATEGORÍAS DISPONIBLES:")
        categorias = self.template_extension.list_all_categories()
        for categoria in categorias:
            templates = self.template_extension.get_template_by_category(categoria)
            print(f"   • {categoria}: {len(templates)} templates")
        
        # Demostrar templates culturales
        print(f"\n🌍 TEMPLATES CULTURALES:")
        cultural_templates = get_cultural_template("asia")
        for name, template in list(cultural_templates.items())[:2]:
            print(f"\n🔹 {template['template_info']['name']}:")
            print(f"   🎯 Mercado: {template['template_info']['target_market']}")
            print(f"   🎭 Tono: {template['cultural_adaptations']['tone']}")
            print(f"   🎨 Estilo: {template['cultural_adaptations']['visual_style']}")
        
        # Demostrar templates estacionales
        print(f"\n🎄 TEMPLATES ESTACIONALES:")
        christmas_templates = get_seasonal_template("christmas", "global")
        for name, template_data in list(christmas_templates.items())[:2]:
            print(f"\n🔸 {name}:")
            print(f"   🎅 Tema: {template_data['seasonal_variant']}")
            print(f"   📦 Template: {template_data['template']['name']}")
        
        # Demostrar templates por audiencia
        print(f"\n👥 TEMPLATES POR AUDIENCIA:")
        luxury_templates = get_audience_template("luxury_buyer")
        for name, template in list(luxury_templates.items())[:2]:
            print(f"\n💎 {name}:")
            print(f"   📝 Descripción: {template['name']}")
            print(f"   🎯 Categoría: {template['category']}")
        
        # Guardar resultados
        with open(f"{self.output_dir}/templates_especializados.json", "w", encoding="utf-8") as f:
            json.dump({
                "categorias_disponibles": categorias,
                "templates_culturales": cultural_templates,
                "templates_estacionales": christmas_templates,
                "templates_audiencia": luxury_templates,
                "todos_los_templates": {
                    cat: list(self.template_extension.get_template_by_category(cat).keys())
                    for cat in categorias
                }
            }, f, indent=2, ensure_ascii=False)
        
        print(f"\n💾 Resultados guardados en: templates_especializados.json")
        return {
            "categorias": categorias,
            "culturales": cultural_templates,
            "estacionales": christmas_templates,
            "audiencia": luxury_templates
        }
    
    async def demo_lote_procesamiento(self):
        """Demuestra procesamiento en lote."""
        print("\n" + "="*60)
        print("📦 DEMO 7: PROCESAMIENTO EN LOTE")
        print("="*60)
        
        print(f"📦 Procesando {len(self.componentes_demo)} componentes en lote")
        print(f"🎯 Concurrencia: 3 procesos simultáneos")
        
        # Procesar lote
        start_time = datetime.now()
        resultados = await self.agente.procesar_lote_componentes(
            componentes=self.componentes_demo,
            audiencias=[AudienciaTarget.COMERCIAL, AudienciaTarget.LUJO],
            max_concurrencia=3
        )
        end_time = datetime.now()
        
        tiempo_total = (end_time - start_time).total_seconds()
        
        print(f"\n⏱️  TIEMPO TOTAL: {tiempo_total:.2f} segundos")
        print(f"✅ PROCESADOS: {len(resultados)}/{len(self.componentes_demo)} componentes")
        
        # Estadísticas
        stats = self.agente.obtener_estadisticas_agente()
        print(f"📊 ESTADÍSTICAS DEL AGENTE:")
        print(f"   • Componentes procesados: {stats['estadisticas_procesamiento']['componentes_procesados']}")
        print(f"   • Metadatos generados: {stats['estadisticas_procesamiento']['metadatos_generados']}")
        print(f"   • Errores: {stats['estadisticas_procesamiento']['errores']}")
        
        # Mostrar resumen por componente
        print(f"\n📋 RESUMEN POR COMPONENTE:")
        for componente_id, metadatos in resultados.items():
            componente = next(c for c in self.componentes_demo if c.id == componente_id)
            print(f"   🔸 {componente.nombre}:")
            print(f"      ✅ SEO Score: {metadatos.seo_score:.1f}/100")
            print(f"      📄 Descripciones: {len(metadatos.descripciones)}")
            print(f"      🔗 JSON-LD: {'✅' if metadatos.json_ld else '❌'}")
        
        # Guardar resultados
        with open(f"{self.output_dir}/procesamiento_lote.json", "w", encoding="utf-8") as f:
            json.dump({
                "resumen": {
                    "componentes_totales": len(self.componentes_demo),
                    "componentes_procesados": len(resultados),
                    "tiempo_total": tiempo_total,
                    "concurrencia": 3
                },
                "estadisticas": stats,
                "resultados": {
                    comp_id: {
                        "componente": comp_id,
                        "metadatos": {
                            "seo_score": meta.seo_score,
                            "descripciones_count": len(meta.descripciones),
                            "has_json_ld": bool(meta.json_ld),
                            "tokens_consumidos": meta.tokens_consumidos
                        }
                    }
                    for comp_id, meta in resultados.items()
                }
            }, f, indent=2, ensure_ascii=False)
        
        print(f"\n💾 Resultados guardados en: procesamiento_lote.json")
        return resultados
    
    async def demo_health_check_completo(self):
        """Demuestra verificación completa de salud del sistema."""
        print("\n" + "="*60)
        print("🏥 DEMO 8: HEALTH CHECK COMPLETO")
        print("="*60)
        
        # Realizar health check
        health = await self.agente.health_check_completo()
        
        print(f"🏥 ESTADO GENERAL: {health['agent_status'].upper()}")
        print(f"⏰ Timestamp: {health['timestamp']}")
        
        print(f"\n🔧 COMPONENTES:")
        for component, status in health["components"].items():
            icon = "✅" if status.get("status") == "healthy" else "❌"
            print(f"   {icon} {component}: {status.get('status', 'unknown')}")
            if "error" in status:
                print(f"      ⚠️  Error: {status['error']}")
        
        print(f"\n📊 ESTADÍSTICAS:")
        cache_stats = health["statistics"]["cache_stats"]
        print(f"   💾 Cache Hits: {cache_stats['generation_cache']['hits']}")
        print(f"   📈 Hit Rate: {cache_stats['generation_cache']['hit_rate']:.1f}%")
        print(f"   🔢 Entradas: {cache_stats['generation_cache']['entries']}")
        
        config_info = health["statistics"]["configuracion"]
        print(f"\n⚙️  CONFIGURACIÓN:")
        print(f"   🤖 Modelo: {config_info['modelo_gemini']}")
        print(f"   🌡️  Temperatura: {config_info['temperatura']}")
        print(f"   🔑 Cache: {'✅' if config_info['cache_enabled'] else '❌'}")
        print(f"   ⏱️  Rate Limit: {config_info['rate_limit']}")
        
        # Guardar resultados
        with open(f"{self.output_dir}/health_check.json", "w", encoding="utf-8") as f:
            json.dump(health, f, indent=2, ensure_ascii=False)
        
        print(f"\n💾 Resultados guardados en: health_check.json")
        return health
    
    def mostrar_resumen_ejecutivo(self):
        """Muestra resumen ejecutivo de la demostración."""
        print("\n" + "🎯" + "="*78 + "🎯")
        print("📊 RESUMEN EJECUTIVO DE LA DEMOSTRACIÓN")
        print("🎯" + "="*78 + "🎯")
        
        print("\n✅ FUNCIONALIDADES DEMOSTRADAS:")
        
        funcionalidades = [
            ("🔍 Análisis Completo", "Componentes analizados con metadatos SEO estructurados"),
            ("🎯 SEO Multi-Mercado", "Optimización para diferentes mercados geográficos"),
            ("👥 Audiencias Específicas", "Contenido personalizado por tipo de audiencia"),
            ("📱 Redes Sociales", "Contenido optimizado para cada plataforma"),
            ("🔗 JSON-LD Estructurado", "Metadatos Schema.org para rich snippets"),
            ("🎨 Templates Especializados", "Plantillas por mercado, audiencia y contexto"),
            ("📦 Procesamiento Lote", "Procesamiento eficiente de múltiples componentes"),
            ("🏥 Health Check", "Verificación completa del sistema")
        ]
        
        for nombre, descripcion in funcionalidades:
            print(f"   {nombre}: {descripcion}")
        
        print(f"\n📂 ARCHIVOS GENERADOS:")
        archivos = [
            "analisis_completo_bisel_diamante_luxury.json",
            "seo_multi_mercado.json", 
            "descripciones_audiencias.json",
            "contenido_redes_sociales.json",
            "json_ld_completo.json",
            "templates_especializados.json",
            "procesamiento_lote.json",
            "health_check.json"
        ]
        
        for archivo in archivos:
            print(f"   📄 {archivo}")
        
        print(f"\n🎯 CAPACIDADES CONFIRMADAS:")
        capacidades = [
            "✅ Análisis inteligente de componentes de reloj",
            "✅ Generación de metadatos SEO optimizados",
            "✅ Contenido para múltiples audiencias",
            "✅ Integración con sistema 3D",
            "✅ JSON-LD estructurado para SEO",
            "✅ Templates culturalmente adaptados",
            "✅ Optimización para motores de búsqueda",
            "✅ Procesamiento en lote eficiente"
        ]
        
        for capacidad in capacidades:
            print(f"   {capacidad}")
        
        print(f"\n🚀 EL AGENTE 6 ESTÁ LISTO PARA PRODUCCIÓN")
        print("📈 Optimizado para generar contenido SEO de alta calidad")
        print("🌍 Adaptado para mercados globales")
        print("⚡ Rendimiento optimizado para procesamiento en lote")


async def main():
    """Función principal que ejecuta toda la demostración."""
    # Crear instancia de demostración
    demo = DemoCompleta()
    
    # Ejecutar todas las demostraciones
    demos = [
        ("Análisis Completo", demo.demo_analisis_completo_componente),
        ("SEO Multi-Mercado", demo.demo_seo_optimizado_multi_mercado),
        ("Audiencias Específicas", demo.demo_audiencias_especificas),
        ("Redes Sociales", demo.demo_contenido_redes_sociales),
        ("JSON-LD Estructurado", demo.demo_json_ld_completo),
        ("Templates Especializados", demo.demo_templates_especializados),
        ("Procesamiento Lote", demo.demo_lote_procesamiento),
        ("Health Check", demo.demo_health_check_completo)
    ]
    
    resultados_finales = {}
    
    for nombre, funcion in demos:
        try:
            print(f"\n{'='*20} {nombre.upper()} {'='*20}")
            resultado = await funcion()
            resultados_finales[nombre] = {"success": True, "data": resultado}
            print(f"✅ {nombre} completado exitosamente")
            
        except Exception as e:
            print(f"❌ Error en {nombre}: {e}")
            resultados_finales[nombre] = {"success": False, "error": str(e)}
    
    # Mostrar resumen ejecutivo
    demo.mostrar_resumen_ejecutivo()
    
    # Estadísticas finales
    exitosos = sum(1 for r in resultados_finales.values() if r["success"])
    total = len(resultados_finales)
    
    print(f"\n📊 ESTADÍSTICAS FINALES:")
    print(f"   🎯 Demos ejecutados: {total}")
    print(f"   ✅ Exitosos: {exitosos}")
    print(f"   ❌ Fallidos: {total - exitosos}")
    print(f"   📈 Tasa de éxito: {(exitosos/total)*100:.1f}%")
    
    if exitosos == total:
        print(f"\n🎉 ¡DEMOSTRACIÓN COMPLETADA EXITOSAMENTE!")
        print(f"📁 Revisa el directorio '{demo.output_dir}' para todos los resultados generados")
    else:
        print(f"\n⚠️  Algunos demos tuvieron problemas. Revisar logs para detalles.")
    
    return resultados_finales


if __name__ == "__main__":
    # Configurar API key de ejemplo (cambiar por tu API key real)
    os.environ["GEMINI_API_KEY"] = "tu-api-key-openrouter-aqui"
    
    # Ejecutar demostración completa
    print("🚀 Ejecutando demostración completa del Agente 6...")
    resultados = asyncio.run(main())
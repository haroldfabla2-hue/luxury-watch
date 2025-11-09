#!/usr/bin/env python3
"""
Script principal del Agente 1: Analista de Calidad de Imágenes
Ejecuta el agente standalone o integrado con sistema de colas
"""

import argparse
import asyncio
import sys
import os
from pathlib import Path

# Agregar src al path
sys.path.append(str(Path(__file__).parent / "src"))
sys.path.append(str(Path(__file__).parent / "api"))

from config import AgentConfig, get_config
from src.image_quality_analyzer import ImageQualityAnalyzer
from src.queue_integration import create_queue_integrated_agent, handle_queue_task
from api.api_server import run_server

def main():
    parser = argparse.ArgumentParser(description="Agente 1: Analista de Calidad de Imágenes")
    parser.add_argument("--mode", choices=["api", "queue", "standalone"], 
                       default="api", help="Modo de ejecución")
    parser.add_argument("--config", choices=["default", "premium", "bulk"],
                       default="default", help="Configuración a usar")
    parser.add_argument("--host", default="0.0.0.0", help="Host para API")
    parser.add_argument("--port", type=int, default=8081, help="Puerto para API")
    parser.add_argument("--debug", action="store_true", help="Modo debug")
    
    # Opciones para modo standalone
    parser.add_argument("--image", help="Imagen a analizar en modo standalone")
    parser.add_argument("--batch", help="Archivo con lista de imágenes para análisis por lotes")
    
    # Opciones para integración con colas
    parser.add_argument("--queue-config", help="Configuración JSON para tarea de cola")
    
    args = parser.parse_args()
    
    # Cargar configuración
    config = get_config(args.config)
    if args.debug:
        config.api_debug = True
        config.log_level = "DEBUG"
    
    # Ejecutar según modo
    if args.mode == "api":
        run_api_server(config, args.host, args.port)
    elif args.mode == "queue":
        run_queue_integration(config)
    elif args.mode == "standalone":
        run_standalone_analysis(config, args)
    else:
        print(f"Modo no reconocido: {args.mode}")
        sys.exit(1)

def run_api_server(config: AgentConfig, host: str, port: int):
    """Ejecuta servidor API"""
    print(f"Iniciando servidor API en {host}:{port}")
    print(f"Configuración: {config.agent_id}")
    
    run_server(config, host, port)

def run_queue_integration(config: AgentConfig):
    """Ejecuta integración con sistema de colas"""
    try:
        agent = create_queue_integrated_agent(config)
        print(f"Agente integrado con sistema de colas: {config.agent_id}")
        print("Esperando tareas del sistema de colas...")
        
        # Mantener vivo para recibir tareas
        asyncio.run(agent.queue_integration.handle_task({
            "task_type": "health_check",
            "test": True
        }))
        
    except Exception as e:
        print(f"Error en integración con colas: {e}")
        print("Asegúrese de que el sistema de orquestación esté disponible")

def run_standalone_analysis(config: AgentConfig, args):
    """Ejecuta análisis standalone"""
    analyzer = ImageQualityAnalyzer(config)
    
    async def analyze_single():
        if not args.image:
            print("Debe especificar --image para análisis standalone")
            return
        
        print(f"Analizando imagen: {args.image}")
        
        from src.image_quality_analyzer import QualityAnalysisRequest
        
        request = QualityAnalysisRequest(
            image_path=args.image,
            analysis_options={
                "include_detailed_metrics": True,
                "include_histogram": True,
                "include_recommendations": True
            }
        )
        
        result = await analyzer.analyze_image(request)
        
        # Mostrar resultados
        print(f"\n=== RESULTADOS DE ANÁLISIS ===")
        print(f"Imagen: {result.image_path}")
        print(f"Score general: {result.overall_score:.1f}/100 ({result.overall_level.value})")
        print(f"Tiempo de procesamiento: {result.processing_time:.2f}s")
        
        print(f"\n=== MÉTRICAS DETALLADAS ===")
        print(f"BRISQUE: {result.brisque_score:.1f} ({result.brisque_quality_level.value})")
        print(f"Nitidez (Laplaciano): {result.sharpness_variance:.1f} ({result.sharpness_level.value})")
        print(f"Exposición: {result.exposure_balance_score:.1f} ({result.exposure_level.value})")
        print(f"Resolución: {result.width}x{result.height} = {result.total_pixels/1000000:.1f}MP ({result.resolution_level.value})")
        print(f"Aspect Ratio: {result.aspect_ratio:.2f} ({result.aspect_ratio_level.value})")
        
        if result.issues_detected:
            print(f"\n=== PROBLEMAS DETECTADOS ===")
            for issue in result.issues_detected:
                print(f"• {issue}")
        
        if result.recommendations:
            print(f"\n=== RECOMENDACIONES ===")
            for rec in result.recommendations:
                print(f"• {rec}")
    
    async def analyze_batch():
        if not args.batch:
            print("Debe especificar --batch para análisis por lotes")
            return
        
        with open(args.batch, 'r') as f:
            image_paths = [line.strip() for line in f if line.strip()]
        
        print(f"Analizando {len(image_paths)} imágenes en lote...")
        
        requests = [QualityAnalysisRequest(image_path=path) for path in image_paths]
        results = await analyzer.analyze_batch(requests)
        
        print(f"\n=== RESULTADOS ANÁLISIS POR LOTES ===")
        print(f"Total: {len(results)} imágenes")
        
        excellent = sum(1 for r in results if r.overall_level.value == "excellent")
        good = sum(1 for r in results if r.overall_level.value == "good")
        fair = sum(1 for r in results if r.overall_level.value == "fair")
        poor = sum(1 for r in results if r.overall_level.value == "poor")
        rejected = sum(1 for r in results if r.overall_level.value == "rejected")
        
        print(f"Excelente: {excellent}")
        print(f"Buena: {good}")
        print(f"Regular: {fair}")
        print(f"Deficiente: {poor}")
        print(f"Rechazada: {rejected}")
        
        avg_score = sum(r.overall_score for r in results) / len(results)
        print(f"Score promedio: {avg_score:.1f}/100")
    
    # Ejecutar análisis apropiado
    if args.batch:
        asyncio.run(analyze_batch())
    else:
        asyncio.run(analyze_single())

if __name__ == "__main__":
    main()
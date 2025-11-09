#!/usr/bin/env python3
"""
Agente 4: Validador de Calidad 3D
================================

Agente especializado en validación de calidad de modelos 3D utilizando Open3D y métricas avanzadas.
Verifica integridad geométrica, calidad de texturas, compatibilidad de formato y genera reportes detallados.

Funcionalidades principales:
- Verificación de integridad geométrica (agujeros, topología, normales)
- Cálculo de métricas de calidad (SSIM, LPIPS, PSNR)
- Validación de texturas y mapeado UV
- Verificación de formato glTF/GLB
- Generación de reportes HTML visuales
- Detección de problemas comunes
- Recomendaciones de corrección automática
"""

import os
import sys
import json
import logging
from pathlib import Path
from typing import Dict, List, Tuple, Optional, Any
from datetime import datetime

# Agregar path del proyecto al sys.path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from validador_geometrico import ValidadorGeometrico
from validador_texturas import ValidadorTexturas
from validador_formato import ValidadorFormato
from generador_reportes import GeneradorReportes
from metricas_calidad import MetricasCalidad
from detector_problemas import DetectorProblemas
from corrector_automatico import CorrectorAutomatico

class Validador3DPrincipal:
    """
    Clase principal del validador de calidad 3D.
    Orquesta todos los validadores especializados y genera reportes completos.
    """
    
    def __init__(self, config: Optional[Dict] = None):
        """
        Inicializa el validador principal.
        
        Args:
            config: Configuración opcional del validador
        """
        self.config = config or self._default_config()
        self.logger = self._setup_logging()
        
        # Inicializar validadores especializados
        self.validador_geometrico = ValidadorGeometrico(self.config.get('geometrico', {}))
        self.validador_texturas = ValidadorTexturas(self.config.get('texturas', {}))
        self.validador_formato = ValidadorFormato(self.config.get('formato', {}))
        self.metricas_calidad = MetricasCalidad(self.config.get('metricas', {}))
        self.detector_problemas = DetectorProblemas(self.config.get('problemas', {}))
        self.corrector_automatico = CorrectorAutomatico(self.config.get('corrector', {}))
        self.generador_reportes = GeneradorReportes(self.config.get('reportes', {}))
        
        self.resultados = {
            'timestamp': datetime.now().isoformat(),
            'archivo_entrada': None,
            'tipo_archivo': None,
            'validadores': {},
            'problemas_detectados': [],
            'puntuacion_calidad': 0.0,
            'recomendaciones': [],
            'corregible_automaticamente': False
        }
        
        self.logger.info("Validador 3D inicializado correctamente")
    
    def _default_config(self) -> Dict:
        """Configuración por defecto del validador."""
        return {
            'geometrico': {
                'tolerancia_agujeros': 0.01,
                'normal_threshold': 0.1,
                'min_triangulos': 100
            },
            'texturas': {
                'resolucion_minima': 512,
                'formatos_soportados': ['.png', '.jpg', '.jpeg'],
                'ratio_aspect_max': 4.0
            },
            'metricas': {
                'ssim_threshold': 0.8,
                'psnr_threshold': 20.0,
                'lpips_threshold': 0.3
            },
            'problemas': {
                'severidad_minima': 0.3
            },
            'reportes': {
                'formato': 'html',
                'incluir_visualizaciones': True,
                'template_path': 'templates/reporte_template.html'
            },
            'corrector': {
                'auto_correct': False,
                'backup_original': True
            }
        }
    
    def _setup_logging(self) -> logging.Logger:
        """Configura el sistema de logging."""
        logger = logging.getLogger('Validador3D')
        logger.setLevel(logging.INFO)
        
        if not logger.handlers:
            handler = logging.StreamHandler()
            formatter = logging.Formatter(
                '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
            )
            handler.setFormatter(formatter)
            logger.addHandler(handler)
        
        return logger
    
    def validar_archivo(self, ruta_archivo: str) -> Dict:
        """
        Valida un archivo 3D completo.
        
        Args:
            ruta_archivo: Ruta al archivo 3D a validar
            
        Returns:
            Dict: Resultados completos de la validación
        """
        try:
            self.logger.info(f"Iniciando validación de: {ruta_archivo}")
            self.resultados['archivo_entrada'] = ruta_archivo
            
            # Verificar que el archivo existe
            if not os.path.exists(ruta_archivo):
                raise FileNotFoundError(f"Archivo no encontrado: {ruta_archivo}")
            
            # Determinar tipo de archivo
            extension = Path(ruta_archivo).suffix.lower()
            self.resultados['tipo_archivo'] = extension
            
            # 1. Validar formato y compatibilidad
            self.logger.info("Validando formato del archivo...")
            self.resultados['validadores']['formato'] = self.validador_formato.validar(ruta_archivo)
            
            # 2. Validar geometría si es compatible
            if extension in ['.gltf', '.glb', '.obj', '.ply']:
                self.logger.info("Validando integridad geométrica...")
                self.resultados['validadores']['geometrico'] = self.validador_geometrico.validar(ruta_archivo)
            
            # 3. Validar texturas si existen
            if extension in ['.gltf', '.glb']:
                self.logger.info("Validando texturas...")
                self.resultados['validadores']['texturas'] = self.validador_texturas.validar(ruta_archivo)
            
            # 4. Calcular métricas de calidad si hay imágenes de referencia
            self.logger.info("Calculando métricas de calidad...")
            self.resultados['validadores']['metricas'] = self.metricas_calidad.calcular(ruta_archivo)
            
            # 5. Detectar problemas
            self.logger.info("Detectando problemas...")
            problemas = self.detector_problemas.detectar(self.resultados['validadores'])
            self.resultados['problemas_detectados'] = problemas
            
            # 6. Calcular puntuación de calidad
            self.resultados['puntuacion_calidad'] = self._calcular_puntuacion_general()
            
            # 7. Generar recomendaciones
            self.resultados['recomendaciones'] = self._generar_recomendaciones()
            
            # 8. Verificar si es corregible automáticamente
            self.resultados['corregible_automaticamente'] = self._verificar_correccion_automatica()
            
            self.logger.info("Validación completada")
            return self.resultados
            
        except Exception as e:
            self.logger.error(f"Error durante la validación: {str(e)}")
            self.resultados['error'] = str(e)
            return self.resultados
    
    def _calcular_puntuacion_general(self) -> float:
        """Calcula una puntuación general de calidad basada en todos los validadores."""
        puntuaciones = []
        
        for validador, resultados in self.resultados['validadores'].items():
            if isinstance(resultados, dict) and 'puntuacion' in resultados:
                puntuaciones.append(resultados['puntuacion'])
        
        if puntuaciones:
            return sum(puntuaciones) / len(puntuaciones)
        return 0.0
    
    def _generar_recomendaciones(self) -> List[str]:
        """Genera recomendaciones basadas en los problemas detectados."""
        recomendaciones = []
        
        for problema in self.resultados['problemas_detectados']:
            if problema['tipo'] == 'geometrico':
                if problema['problema'] == 'agujeros_detectados':
                    recomendaciones.append("Sellado automático de agujeros recomendado")
                elif problema['problema'] == 'normales_invertidas':
                    recomendaciones.append("Recalcular normales de vértices")
                elif problema['problema'] == 'topologia_problematica':
                    recomendaciones.append("Optimizar topología de malla")
            
            elif problema['tipo'] == 'texturas':
                if problema['problema'] == 'resolucion_baja':
                    recomendaciones.append("Aumentar resolución de texturas")
                elif problema['problema'] == 'mapeado_uv_incorrecto':
                    recomendaciones.append("Reparar mapeado UV")
                elif problema['problema'] == 'compresion_excesiva':
                    recomendaciones.append("Optimizar compresión de texturas")
            
            elif problema['tipo'] == 'formato':
                recomendaciones.append(f"Convertir a formato optimizado: {problema.get('recomendacion', '')}")
        
        return list(set(recomendaciones))  # Eliminar duplicados
    
    def _verificar_correccion_automatica(self) -> bool:
        """Verifica si los problemas detectados pueden ser corregidos automáticamente."""
        problemas_correcibles = [
            'agujeros_detectados',
            'normales_invertidas',
            'mapeado_uv_incorrecto',
            'compresion_excesiva'
        ]
        
        for problema in self.resultados['problemas_detectados']:
            if problema.get('problema') in problemas_correcibles:
                return True
        return False
    
    def corregir_automaticamente(self, ruta_archivo: str, directorio_salida: str = None) -> Dict:
        """
        Aplica correcciones automáticas a los problemas detectados.
        
        Args:
            ruta_archivo: Archivo a corregir
            directorio_salida: Directorio donde guardar el archivo corregido
            
        Returns:
            Dict: Resultados de la corrección
        """
        if not self.resultados.get('corregible_automaticamente'):
            return {'exito': False, 'mensaje': 'No hay problemas corregibles automáticamente'}
        
        if not self.config.get('corrector', {}).get('auto_correct', False):
            return {'exito': False, 'mensaje': 'Corrección automática deshabilitada'}
        
        self.logger.info("Iniciando corrección automática...")
        
        try:
            directorio_salida = directorio_salida or os.path.dirname(ruta_archivo)
            os.makedirs(directorio_salida, exist_ok=True)
            
            resultado = self.corrector_automatico.corregir(
                ruta_archivo, 
                directorio_salida, 
                self.resultados['problemas_detectados']
            )
            
            self.logger.info("Corrección automática completada")
            return resultado
            
        except Exception as e:
            self.logger.error(f"Error durante corrección automática: {str(e)}")
            return {'exito': False, 'mensaje': str(e)}
    
    def generar_reporte_html(self, archivo_salida: str = None) -> str:
        """
        Genera un reporte HTML visual con los resultados.
        
        Args:
            archivo_salida: Ruta donde guardar el reporte HTML
            
        Returns:
            str: Ruta del reporte generado
        """
        if archivo_salida is None:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            archivo_salida = f"reporte_calidad_{timestamp}.html"
        
        self.logger.info(f"Generando reporte HTML: {archivo_salida}")
        
        ruta_reporte = self.generador_reportes.generar_html(
            self.resultados, 
            archivo_salida
        )
        
        self.logger.info(f"Reporte generado exitosamente: {ruta_reporte}")
        return ruta_reporte
    
    def generar_reporte_json(self, archivo_salida: str = None) -> str:
        """
        Genera un reporte JSON detallado.
        
        Args:
            archivo_salida: Ruta donde guardar el reporte JSON
            
        Returns:
            str: Ruta del reporte generado
        """
        if archivo_salida is None:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            archivo_salida = f"reporte_calidad_{timestamp}.json"
        
        try:
            with open(archivo_salida, 'w', encoding='utf-8') as f:
                json.dump(self.resultados, f, indent=2, ensure_ascii=False)
            
            self.logger.info(f"Reporte JSON generado: {archivo_salida}")
            return archivo_salida
            
        except Exception as e:
            self.logger.error(f"Error generando reporte JSON: {str(e)}")
            return ""
    
    def obtener_resumen(self) -> Dict:
        """Obtiene un resumen ejecutivo de la validación."""
        return {
            'archivo': self.resultados['archivo_entrada'],
            'tipo': self.resultados['tipo_archivo'],
            'puntuacion_calidad': self.resultados['puntuacion_calidad'],
            'problemas_detectados': len(self.resultados['problemas_detectados']),
            'corregible_automaticamente': self.resultados['corregible_automaticamente'],
            'recomendaciones': self.resultados['recomendaciones'][:3]  # Top 3
        }

def main():
    """Función principal para uso desde línea de comandos."""
    import argparse
    
    parser = argparse.ArgumentParser(description='Validador de Calidad 3D')
    parser.add_argument('archivo', help='Archivo 3D a validar')
    parser.add_argument('--output', '-o', help='Directorio de salida para reportes')
    parser.add_argument('--auto-correct', action='store_true', help='Aplicar correcciones automáticas')
    parser.add_argument('--json', action='store_true', help='Generar también reporte JSON')
    parser.add_argument('--verbose', '-v', action='store_true', help='Salida verbose')
    
    args = parser.parse_args()
    
    # Configurar logging
    log_level = logging.DEBUG if args.verbose else logging.INFO
    logging.basicConfig(level=log_level)
    
    # Crear validador
    config = {
        'corrector': {
            'auto_correct': args.auto_correct
        }
    }
    
    validador = Validador3DPrincipal(config)
    
    # Validar archivo
    resultados = validador.validar_archivo(args.archivo)
    
    # Mostrar resumen
    resumen = validador.obtener_resumen()
    print(f"\n=== RESUMEN DE VALIDACIÓN ===")
    print(f"Archivo: {resumen['archivo']}")
    print(f"Puntuación: {resumen['puntuacion_calidad']:.2f}/10")
    print(f"Problemas: {resumen['problemas_detectados']}")
    print(f"Corregible automáticamente: {resumen['corregible_automaticamente']}")
    
    # Generar reportes
    directorio_salida = args.output or '.'
    reporte_html = validador.generar_reporte_html(
        os.path.join(directorio_salida, f"reporte_{Path(args.archivo).stem}.html")
    )
    
    if args.json:
        reporte_json = validador.generar_reporte_json(
            os.path.join(directorio_salida, f"reporte_{Path(args.archivo).stem}.json")
        )
    
    # Aplicar correcciones si se solicita
    if args.auto_correct and resultados.get('corregible_automaticamente'):
        resultado_correccion = validador.corregir_automaticamente(args.archivo, directorio_salida)
        print(f"Corrección automática: {resultado_correccion.get('mensaje', 'N/A')}")

if __name__ == "__main__":
    main()
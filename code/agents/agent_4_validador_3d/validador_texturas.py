#!/usr/bin/env python3
"""
Validador de Texturas
====================

Módulo especializado en la validación de calidad de texturas y mapeado UV.
Analiza resolución, formato, compresión, artifacts y calidad de mapeado.
"""

import os
import numpy as np
import cv2
from pathlib import Path
from typing import Dict, List, Tuple, Optional, Any
import logging
import json
from PIL import Image, ImageFilter
import math

class ValidadorTexturas:
    """
    Validador de calidad de texturas y mapeado UV para modelos 3D.
    """
    
    def __init__(self, config: Dict = None):
        """
        Inicializa el validador de texturas.
        
        Args:
            config: Configuración del validador
        """
        self.config = config or {}
        self.logger = logging.getLogger('ValidadorTexturas')
        
        # Parámetros de configuración
        self.resolucion_minima = self.config.get('resolucion_minima', 512)
        self.formatos_soportados = self.config.get('formatos_soportados', ['.png', '.jpg', '.jpeg', '.tga', '.bmp'])
        self.ratio_aspect_max = self.config.get('ratio_aspect_max', 4.0)
        self.compresion_maxima = self.config.get('compresion_maxima', 85)  # Para JPEG
        self.tamaño_archivo_max = self.config.get('tamaño_archivo_max', 10 * 1024 * 1024)  # 10MB
        
        self.resultados = {
            'puntuacion': 0.0,
            'texturas_encontradas': [],
            'problemas_texturas': [],
            'analisis_uv': {},
            'calidad_compresion': {},
            'resoluciones': {},
            'formatos': {},
            'mapeado_uv': {},
            'artifacts_detectados': [],
            'estadisticas': {},
            'recomendaciones': []
        }
    
    def validar(self, ruta_archivo: str) -> Dict:
        """
        Valida las texturas asociadas a un modelo 3D.
        
        Args:
            ruta_archivo: Ruta al archivo 3D
            
        Returns:
            Dict: Resultados de la validación de texturas
        """
        try:
            self.logger.info(f"Validando texturas de: {ruta_archivo}")
            
            # Determinar tipo de archivo y extraer texturas
            texturas = self._extraer_texturas(ruta_archivo)
            if not texturas:
                self.resultados['problemas_texturas'].append("No se encontraron texturas")
                self._calcular_puntuacion()
                return self.resultados
            
            self.resultados['texturas_encontradas'] = texturas
            
            # Validar cada textura
            for textura in texturas:
                self._validar_textura_individual(textura)
            
            # Validar mapeado UV
            self._validar_mapeado_uv(ruta_archivo)
            
            # Analizar consistencia entre texturas
            self._analizar_consistencia_texturas(texturas)
            
            # Detectar artifacts comunes
            self._detectar_artifacts(texturas)
            
            # Calcular estadísticas generales
            self._calcular_estadisticas_generales(texturas)
            
            # Generar recomendaciones
            self._generar_recomendaciones()
            
            # Calcular puntuación final
            self._calcular_puntuacion()
            
            self.logger.info(f"Validación de texturas completada. Puntuación: {self.resultados['puntuacion']:.2f}")
            return self.resultados
            
        except Exception as e:
            self.logger.error(f"Error en validación de texturas: {str(e)}")
            self.resultados['error'] = str(e)
            return self.resultados
    
    def _extraer_texturas(self, ruta_archivo: str) -> List[str]:
        """
        Extrae las rutas de texturas de un archivo 3D.
        
        Args:
            ruta_archivo: Ruta al archivo 3D
            
        Returns:
            List[str]: Lista de rutas de texturas encontradas
        """
        texturas = []
        directorio_base = os.path.dirname(ruta_archivo)
        extension = Path(ruta_archivo).suffix.lower()
        
        try:
            if extension in ['.gltf', '.glb']:
                texturas = self._extraer_texturas_gltf(ruta_archivo)
            elif extension == '.obj':
                texturas = self._extraer_texturas_obj(ruta_archivo, directorio_base)
            else:
                # Buscar texturas en el mismo directorio
                texturas = self._buscar_texturas_directorio(directorio_base)
            
            return [t for t in texturas if os.path.exists(t)]
            
        except Exception as e:
            self.logger.error(f"Error extrayendo texturas: {str(e)}")
            return []
    
    def _extraer_texturas_gltf(self, ruta_archivo: str) -> List[str]:
        """Extrae texturas de archivo GLTF/GLB."""
        try:
            # Implementación básica para GLTF
            # En una implementación completa, se parsearía el archivo GLTF
            directorio = os.path.dirname(ruta_archivo)
            return self._buscar_texturas_directorio(directorio)
            
        except Exception as e:
            self.logger.error(f"Error extrayendo texturas GLTF: {str(e)}")
            return []
    
    def _extraer_texturas_obj(self, ruta_archivo: str, directorio_base: str) -> List[str]:
        """Extrae referencias de texturas de archivo OBJ."""
        try:
            texturas = []
            
            with open(ruta_archivo, 'r', encoding='utf-8') as f:
                for linea in f:
                    linea = linea.strip()
                    if linea.startswith('map_') or linea.startswith('mtllib'):
                        # Extraer nombre de textura
                        partes = linea.split()
                        if len(partes) > 1:
                            nombre_textura = partes[-1]
                            ruta_completa = os.path.join(directorio_base, nombre_textura)
                            texturas.append(ruta_completa)
            
            return texturas
            
        except Exception as e:
            self.logger.error(f"Error extrayendo texturas OBJ: {str(e)}")
            return []
    
    def _buscar_texturas_directorio(self, directorio: str) -> List[str]:
        """Busca texturas en un directorio."""
        texturas = []
        
        for extension in self.formatos_soportados:
            patron = f"**/*{extension}"
            texturas_glob = list(Path(directorio).glob(patron))
            texturas.extend([str(t) for t in texturas_glob])
        
        return texturas
    
    def _validar_textura_individual(self, ruta_textura: str):
        """Valida una textura individual."""
        try:
            problema_encontrado = False
            
            # Verificar que el archivo existe
            if not os.path.exists(ruta_textura):
                self.resultados['problemas_texturas'].append(f"Textura no encontrada: {ruta_textura}")
                return
            
            # Obtener información básica del archivo
            tamaño_archivo = os.path.getsize(ruta_textura)
            extension = Path(ruta_textura).suffix.lower()
            
            # Verificar tamaño del archivo
            if tamaño_archivo > self.tamaño_archivo_max:
                self.resultados['problemas_texturas'].append(f"Archivo muy grande: {ruta_textura} ({tamaño_archivo / (1024*1024):.1f}MB)")
                problema_encontrado = True
            
            # Cargar y analizar imagen
            try:
                with Image.open(ruta_textura) as img:
                    ancho, alto = img.size
                    modo = img.mode
                    
                    # Registrar resolución
                    if ruta_textura not in self.resultados['resoluciones']:
                        self.resultados['resoluciones'][ruta_textura] = {}
                    self.resultados['resoluciones'][ruta_textura]['ancho'] = ancho
                    self.resultados['resoluciones'][ruta_textura]['alto'] = alto
                    self.resultados['resoluciones'][ruta_textura]['resolucion_total'] = ancho * alto
                    
                    # Verificar resolución mínima
                    resolucion_min = min(ancho, alto)
                    if resolucion_min < self.resolucion_minima:
                        self.resultados['problemas_texturas'].append(
                            f"Resolución baja: {ruta_textura} ({ancho}x{alto})"
                        )
                        problema_encontrado = True
                    
                    # Verificar ratio de aspecto
                    ratio_aspect = max(ancho, alto) / min(ancho, alto)
                    if ratio_aspect > self.ratio_aspect_max:
                        self.resultados['problemas_texturas'].append(
                            f"Ratio de aspecto extremo: {ruta_textura} ({ratio_aspect:.2f}:1)"
                        )
                    
                    # Registrar formato
                    if ruta_textura not in self.resultados['formatos']:
                        self.resultados['formatos'][ruta_textura] = {}
                    self.resultados['formatos'][ruta_textura]['extension'] = extension
                    self.resultados['formatos'][ruta_textura]['modo_pil'] = modo
                    self.resultados['formatos'][ruta_textura]['tamaño_archivo'] = tamaño_archivo
                    
                    # Análisis de calidad específico por formato
                    if extension == '.jpg' or extension == '.jpeg':
                        self._analizar_calidad_jpeg(ruta_textura, img)
                    elif extension == '.png':
                        self._analizar_calidad_png(ruta_textura, img)
                    
                    # Análisis de contenido
                    self._analizar_contenido_textura(img, ruta_textura)
                    
            except Exception as e:
                self.resultados['problemas_texturas'].append(f"Error procesando textura: {ruta_textura} - {str(e)}")
                problema_encontrado = True
            
            # Registrar problemas
            if problema_encontrado:
                self.resultados['problemas_texturas'].append(f"Problemas detectados en: {ruta_textura}")
                
        except Exception as e:
            self.logger.error(f"Error validando textura individual: {str(e)}")
    
    def _analizar_calidad_jpeg(self, ruta_textura: str, img: Image.Image):
        """Analiza la calidad de compresión JPEG."""
        try:
            # Detectar blocking artifacts
            img_array = np.array(img.convert('RGB'))
            
            # Análisis de bloques 8x8 (típicos de JPEG)
            altura, ancho = img_array.shape[:2]
            blocking_score = 0
            
            for y in range(0, altura-8, 8):
                for x in range(0, ancho-8, 8):
                    bloque = img_array[y:y+8, x:x+8]
                    # Calcular varianza dentro del bloque
                    varianza = np.var(bloque)
                    if varianza < 10:  # Bloque muy uniforme, posible artifact
                        blocking_score += 1
            
            porcentaje_blocking = (blocking_score / (altura//8 * ancho//8)) * 100
            
            # Registrar análisis
            if ruta_textura not in self.resultados['calidad_compresion']:
                self.resultados['calidad_compresion'][ruta_textura] = {}
            
            self.resultados['calidad_compresion'][ruta_textura]['blocking_artifacts'] = porcentaje_blocking
            
            if porcentaje_blocking > 20:
                self.resultados['artifacts_detectados'].append(f"Blocking artifacts en JPEG: {ruta_textura}")
                
        except Exception as e:
            self.logger.error(f"Error analizando calidad JPEG: {str(e)}")
    
    def _analizar_calidad_png(self, ruta_textura: str, img: Image.Image):
        """Analiza la calidad de imagen PNG."""
        try:
            # Verificar si tiene canal alpha
            tiene_alpha = img.mode in ('RGBA', 'LA') or 'transparency' in img.info
            
            # Verificar optimización
            if ruta_textura not in self.resultados['calidad_compresion']:
                self.resultados['calidad_compresion'][ruta_textura] = {}
            
            self.resultados['calidad_compresion'][ruta_textura]['tiene_alpha'] = tiene_alpha
            
            # Detectar banding (gradientes escalonados)
            self._detectar_banding(img, ruta_textura)
            
        except Exception as e:
            self.logger.error(f"Error analizando calidad PNG: {str(e)}")
    
    def _detectar_banding(self, img: Image.Image, ruta_textura: str):
        """Detecta banding en gradientes."""
        try:
            img_array = np.array(img.convert('RGB'))
            
            # Análisis de histogramas para detectar banding
            histograma_r = np.histogram(img_array[:,:,0], bins=256, range=(0, 256))[0]
            histograma_g = np.histogram(img_array[:,:,1], bins=256, range=(0, 256))[0]
            histograma_b = np.histogram(img_array[:,:,2], bins=256, range=(0, 256))[0]
            
            # Contar picos y valles en histogramas (indica banding)
            def contar_transiciones_sharp(hist):
                transiciones = 0
                for i in range(1, len(hist)-1):
                    if abs(hist[i-1] - hist[i]) > 100 and abs(hist[i] - hist[i+1]) > 100:
                        transiciones += 1
                return transiciones
            
            transiciones_r = contar_transiciones_sharp(histograma_r)
            transiciones_g = contar_transiciones_sharp(histograma_g)
            transiciones_b = contar_transiciones_sharp(histograma_b)
            
            transiciones_totales = transiciones_r + transiciones_g + transiciones_b
            
            if transiciones_totales > 50:  # Umbral empírico
                self.resultados['artifacts_detectados'].append(f"Banding detectado en: {ruta_textura}")
            
            # Registrar análisis
            if ruta_textura not in self.resultados['calidad_compresion']:
                self.resultados['calidad_compresion'][ruta_textura] = {}
            
            self.resultados['calidad_compresion'][ruta_textura]['banding_score'] = transiciones_totales
            
        except Exception as e:
            self.logger.error(f"Error detectando banding: {str(e)}")
    
    def _analizar_contenido_textura(self, img: Image.Image, ruta_textura: str):
        """Analiza el contenido de la textura."""
        try:
            img_array = np.array(img.convert('RGB'))
            
            # Análisis de varianza (uniformidad)
            varianza_global = np.var(img_array)
            
            # Análisis de entropía
            def calcular_entropia(img_array):
                histograma = np.histogram(img_array.flatten(), bins=256, range=(0, 256))[0]
                histograma_norm = histograma / np.sum(histograma)
                entropia = -np.sum(histograma_norm * np.log2(histograma_norm + 1e-10))
                return entropia
            
            entropia = calcular_entropia(img_array)
            
            # Detectar texturas muy uniformes (posibles problemas)
            if varianza_global < 100:
                self.resultados['artifacts_detectados'].append(f"Textura muy uniforme: {ruta_textura}")
            
            # Registrar análisis
            if ruta_textura not in self.resultados['calidad_compresion']:
                self.resultados['calidad_compresion'][ruta_textura] = {}
            
            self.resultados['calidad_compresion'][ruta_textura]['varianza'] = varianza_global
            self.resultados['calidad_compresion'][ruta_textura]['entropia'] = entropia
            
        except Exception as e:
            self.logger.error(f"Error analizando contenido: {str(e)}")
    
    def _validar_mapeado_uv(self, ruta_archivo: str):
        """Valida el mapeado UV del modelo."""
        try:
            # Esta función requeriría análisis más profundo del archivo 3D
            # Implementación básica
            self.resultados['mapeado_uv'] = {
                'valido': True,
                'problemas_detectados': [],
                'cobertura_uv': 0.0,  # Porcentaje de superficie cubierta
                'overlap_uv': 0.0     # Porcentaje de overlap en UV
            }
            
            # Detectar problemas comunes de UV (implementación básica)
            # En una implementación completa, se analizaría el archivo 3D directamente
            
        except Exception as e:
            self.logger.error(f"Error validando mapeado UV: {str(e)}")
            self.resultados['mapeado_uv'] = {
                'valido': False,
                'problemas_detectados': [str(e)]
            }
    
    def _analizar_consistencia_texturas(self, texturas: List[str]):
        """Analiza la consistencia entre texturas."""
        try:
            if len(texturas) < 2:
                return
            
            resoluciones = []
            tamaños_archivo = []
            formatos = []
            
            for textura in texturas:
                if textura in self.resultados['resoluciones']:
                    res = self.resultados['resoluciones'][textura]
                    resoluciones.append((res['ancho'], res['alto']))
                
                if textura in self.resultados['formatos']:
                    formato = self.resultados['formatos'][textura]['extension']
                    formatos.append(formato)
            
            # Verificar consistencia de resoluciones
            if resoluciones:
                anchos = [r[0] for r in resoluciones]
                altos = [r[1] for r in resoluciones]
                
                # Verificar si las resoluciones son consistentes (potencia de 2)
                inconsistencias_resolucion = 0
                for ancho, alto in resoluciones:
                    if not (ancho & (ancho - 1) == 0) or not (alto & (alto - 1) == 0):
                        inconsistencias_resolucion += 1
                
                if inconsistencias_resolucion > len(resoluciones) * 0.5:
                    self.resultados['problemas_texturas'].append("Resoluciones inconsistentes entre texturas")
            
            # Verificar consistencia de formatos
            if len(set(formatos)) > 1:
                self.resultados['problemas_texturas'].append("Formatos de textura mixtos")
            
        except Exception as e:
            self.logger.error(f"Error analizando consistencia: {str(e)}")
    
    def _detectar_artifacts(self, texturas: List[str]):
        """Detecta artifacts comunes en texturas."""
        try:
            for textura in texturas:
                if textura in self.resultados['calidad_compresion']:
                    cal = self.resultados['calidad_compresion'][textura]
                    
                    # Verificar blocking artifacts
                    if 'blocking_artifacts' in cal and cal['blocking_artifacts'] > 25:
                        self.resultados['artifacts_detectados'].append(f"Exceso de blocking artifacts en {textura}")
                    
                    # Verificar banding
                    if 'banding_score' in cal and cal['banding_score'] > 70:
                        self.resultados['artifacts_detectados'].append(f"Exceso de banding en {textura}")
                    
                    # Verificar varianza muy baja
                    if 'varianza' in cal and cal['varianza'] < 50:
                        self.resultados['artifacts_detectados'].append(f"Textura con baja varianza: {textura}")
                    
                    # Verificar entropía muy baja (puede indicar pérdida de detalle)
                    if 'entropia' in cal and cal['entropia'] < 3.0:
                        self.resultados['artifacts_detectados'].append(f"Baja entropía (pérdida de detalle): {textura}")
            
        except Exception as e:
            self.logger.error(f"Error detectando artifacts: {str(e)}")
    
    def _calcular_estadisticas_generales(self, texturas: List[str]):
        """Calcula estadísticas generales de las texturas."""
        try:
            total_texturas = len(texturas)
            resoluciones_totales = []
            tamaños_totales = []
            formatos_count = {}
            
            for textura in texturas:
                # Recopilar resoluciones
                if textura in self.resultados['resoluciones']:
                    res = self.resultados['resoluciones'][textura]
                    resoluciones_totales.append(res['resolucion_total'])
                
                # Recopilar tamaños
                if textura in self.resultados['formatos']:
                    tamaño = self.resultados['formatos'][textura]['tamaño_archivo']
                    tamaños_totales.append(tamaño)
                
                # Contar formatos
                if textura in self.resultados['formatos']:
                    formato = self.resultados['formatos'][textura]['extension']
                    formatos_count[formato] = formatos_count.get(formato, 0) + 1
            
            self.resultados['estadisticas'] = {
                'total_texturas': total_texturas,
                'resolucion_promedio': np.mean(resoluciones_totales) if resoluciones_totales else 0,
                'resolucion_maxima': max(resoluciones_totales) if resoluciones_totales else 0,
                'tamaño_total_archivos': sum(tamaños_totales) if tamaños_totales else 0,
                'formatos_distribucion': formatos_count,
                'promedio_entropia': np.mean([
                    self.resultados['calidad_compresion'][t].get('entropia', 0)
                    for t in texturas
                    if t in self.resultados['calidad_compresion']
                ]) if texturas else 0
            }
            
        except Exception as e:
            self.logger.error(f"Error calculando estadísticas generales: {str(e)}")
    
    def _generar_recomendaciones(self):
        """Genera recomendaciones basadas en el análisis."""
        recomendaciones = []
        
        # Recomendaciones basadas en resoluciones
        for textura, res in self.resultados['resoluciones'].items():
            if min(res['ancho'], res['alto']) < self.resolucion_minima:
                recomendaciones.append(f"Aumentar resolución de {textura} a al menos {self.resolucion_minima}x")
        
        # Recomendaciones basadas en artifacts
        for artifact in self.resultados['artifacts_detectados']:
            if 'blocking' in artifact.lower():
                recomendaciones.append("Reducir compresión JPEG para eliminar blocking artifacts")
            elif 'banding' in artifact.lower():
                recomendaciones.append("Usar formatos sin compresión o reducir compresión para eliminar banding")
            elif 'uniforme' in artifact.lower():
                recomendaciones.append("Revisar calidad de textura, posible pérdida de contenido")
        
        # Recomendaciones basadas en problemas
        for problema in self.resultados['problemas_texturas']:
            if 'baja' in problema.lower():
                recomendaciones.append("Optimizar resolución de texturas para mejor calidad")
            elif 'grande' in problema.lower():
                recomendaciones.append("Comprimir texturas para reducir tamaño de archivo")
            elif 'extremo' in problema.lower():
                recomendaciones.append("Corregir ratio de aspecto de texturas")
        
        self.resultados['recomendaciones'] = list(set(recomendaciones))  # Eliminar duplicados
    
    def _calcular_puntuacion(self):
        """Calcula puntuación de calidad de texturas."""
        puntuacion = 10.0  # Puntuación máxima
        
        # Penalizaciones por problemas
        penalizaciones = []
        
        # Penalización por número de problemas
        penalizaciones.append(len(self.resultados['problemas_texturas']) * 0.3)
        
        # Penalización por artifacts detectados
        penalizaciones.append(len(self.resultados['artifacts_detectados']) * 0.5)
        
        # Penalización por texturas con baja resolución
        texturas_baja_res = 0
        for textura, res in self.resultados['resoluciones'].items():
            if min(res['ancho'], res['alto']) < self.resolucion_minima:
                texturas_baja_res += 1
        
        if self.resultados['estadisticas'].get('total_texturas', 0) > 0:
            porcentaje_baja_res = texturas_baja_res / self.resultados['estadisticas']['total_texturas']
            penalizaciones.append(porcentaje_baja_res * 3.0)
        
        # Penalización por inconsistencia de formatos
        if len(self.resultados['estadisticas'].get('formatos_distribucion', {})) > 2:
            penalizaciones.append(1.0)
        
        # Calcular puntuación final
        puntuacion_final = max(0.0, puntuacion - sum(penalizaciones))
        self.resultados['puntuacion'] = round(puntuacion_final, 2)
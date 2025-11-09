#!/usr/bin/env python3
"""
Métricas de Calidad
==================

Módulo para cálculo de métricas de calidad de imagen entre modelos 3D renderizados
y imágenes de referencia. Incluye SSIM, LPIPS, PSNR y otras métricas avanzadas.
"""

import numpy as np
import cv2
from pathlib import Path
from typing import Dict, List, Tuple, Optional, Any, Union
import logging
import os
from scipy import ndimage
from skimage.metrics import structural_similarity as ssim
import math

# Imports opcionales para métricas avanzadas
try:
    import torch
    import torchvision.transforms as transforms
    from lpips import LPIPS
    TORCH_AVAILABLE = True
except ImportError:
    TORCH_AVAILABLE = False
    logging.warning("PyTorch/LPIPS no disponible. Algunas métricas avanzadas estarán deshabilitadas.")

try:
    from PIL import Image, ImageFilter
    PIL_AVAILABLE = True
except ImportError:
    PIL_AVAILABLE = False
    logging.warning("PIL no disponible. Funcionalidad limitada.")

class MetricasCalidad:
    """
    Calculadora de métricas de calidad de imagen para validación 3D.
    """
    
    def __init__(self, config: Dict = None):
        """
        Inicializa la calculadora de métricas.
        
        Args:
            config: Configuración de métricas
        """
        self.config = config or {}
        self.logger = logging.getLogger('MetricasCalidad')
        
        # Configuración de umbrales
        self.ssim_threshold = self.config.get('ssim_threshold', 0.8)
        self.psnr_threshold = self.config.get('psnr_threshold', 20.0)
        self.lpips_threshold = self.config.get('lpips_threshold', 0.3)
        
        # Configuración de procesamiento
        self.resize_to = self.config.get('resize_to', (512, 512))
        self.normalize = self.config.get('normalize', True)
        
        # Inicializar LPIPS si está disponible
        self.lpips_model = None
        if TORCH_AVAILABLE:
            try:
                self.lpips_model = LPIPS(net='vgg')
                self.logger.info("Modelo LPIPS inicializado")
            except Exception as e:
                self.logger.warning(f"No se pudo inicializar LPIPS: {e}")
        
        self.resultados = {
            'puntuacion': 0.0,
            'metricas': {},
            'comparaciones': [],
            'estadisticas': {},
            'problemas_deteccion': [],
            'recomendaciones': [],
            'rendimiento': {}
        }
    
    def calcular(self, ruta_archivo: str, imagenes_referencia: List[str] = None) -> Dict:
        """
        Calcula métricas de calidad comparando con imágenes de referencia.
        
        Args:
            ruta_archivo: Ruta al archivo 3D o directorio con renders
            imagenes_referencia: Lista de imágenes de referencia (opcional)
            
        Returns:
            Dict: Resultados de métricas de calidad
        """
        try:
            self.logger.info(f"Calculando métricas de calidad para: {ruta_archivo}")
            
            # Detectar si es un archivo 3D o directorio de imágenes
            if os.path.isfile(ruta_archivo):
                # Es un archivo 3D, generar imágenes para comparar
                imagenes_generadas = self._generar_imagenes_render(ruta_archivo)
            else:
                # Es un directorio, buscar imágenes
                imagenes_generadas = self._buscar_imagenes_directorio(ruta_archivo)
            
            if not imagenes_generadas:
                self.resultados['problemas_deteccion'].append("No se encontraron imágenes generadas para comparar")
                self._calcular_puntuacion()
                return self.resultados
            
            # Usar imágenes de referencia proporcionadas o buscar en el directorio
            if imagenes_referencia is None:
                directorio_ref = os.path.dirname(ruta_archivo)
                imagenes_referencia = self._buscar_imagenes_directorio(directorio_ref, patron="*ref*")
            
            if not imagenes_referencia:
                self.resultados['problemas_deteccion'].append("No se encontraron imágenes de referencia")
                # Generar métricas básicas sin referencia
                self._calcular_metricas_basicas(imagenes_generadas)
            else:
                # Realizar comparaciones par a par
                self._realizar_comparaciones(imagenes_generadas, imagenes_referencia)
            
            # Calcular estadísticas generales
            self._calcular_estadisticas_generales()
            
            # Generar recomendaciones
            self._generar_recomendaciones()
            
            # Calcular puntuación final
            self._calcular_puntuacion()
            
            self.logger.info(f"Cálculo de métricas completado. Puntuación: {self.resultados['puntuacion']:.2f}")
            return self.resultados
            
        except Exception as e:
            self.logger.error(f"Error calculando métricas: {str(e)}")
            self.resultados['error'] = str(e)
            return self.resultados
    
    def _generar_imagenes_render(self, ruta_archivo: str) -> List[str]:
        """
        Genera imágenes de renderizado para un archivo 3D.
        (Implementación básica - en una aplicación real usaría un motor de renderizado)
        """
        try:
            # Esta es una implementación simplificada
            # En una aplicación real, se usaría Open3D, Blender, o similar
            
            directorio_temp = os.path.join(os.path.dirname(ruta_archivo), "renders_temp")
            os.makedirs(directorio_temp, exist_ok=True)
            
            # Simular la generación de imágenes
            # En implementación real, se renderizarían múltiples vistas
            imagenes_simuladas = []
            
            # Por ahora, buscar si ya existen renders
            for ext in ['.png', '.jpg', '.jpeg']:
                patron = f"{Path(ruta_archivo).stem}_*_render{ext}"
                imagenes = list(Path(directorio_temp).glob(patron))
                imagenes.extend(list(Path(directorio_temp).glob(patron.lower())))
                imagenes_simuladas.extend([str(img) for img in imagenes])
            
            return imagenes_simuladas
            
        except Exception as e:
            self.logger.error(f"Error generando renders: {str(e)}")
            return []
    
    def _buscar_imagenes_directorio(self, directorio: str, patron: str = "*") -> List[str]:
        """Busca imágenes en un directorio."""
        try:
            imagenes = []
            extensiones = ['.png', '.jpg', '.jpeg', '.tiff', '.bmp']
            
            for extension in extensiones:
                if patron == "*":
                    patron_completo = f"*{extension}"
                else:
                    patron_completo = f"{patron}{extension}"
                
                imagenes_dir = list(Path(directorio).glob(patron_completo))
                imagenes.extend([str(img) for img in imagenes_dir])
            
            return imagenes
            
        except Exception as e:
            self.logger.error(f"Error buscando imágenes: {str(e)}")
            return []
    
    def _realizar_comparaciones(self, imagenes_generadas: List[str], imagenes_referencia: List[str]):
        """Realiza comparaciones entre imágenes generadas y de referencia."""
        try:
            # Combinar y emparejar imágenes
            pares_comparacion = self._emparejar_imagenes(imagenes_generadas, imagenes_referencia)
            
            for i, (img_gen, img_ref) in enumerate(pares_comparacion):
                self.logger.info(f"Comparando par {i+1}/{len(pares_comparacion)}")
                
                # Cargar imágenes
                imagen_generada = self._cargar_y_procesar_imagen(img_gen)
                imagen_referencia = self._cargar_y_procesar_imagen(img_ref)
                
                if imagen_generada is None or imagen_referencia is None:
                    continue
                
                # Redimensionar si es necesario
                imagen_generada, imagen_referencia = self._redimensionar_par(imagen_generada, imagen_referencia)
                
                # Calcular métricas
                metricas_par = self._calcular_metricas_par(imagen_generada, imagen_referencia)
                
                # Añadir información del par
                metricas_par.update({
                    'imagen_generada': img_gen,
                    'imagen_referencia': img_ref,
                    'indice_comparacion': i
                })
                
                self.resultados['comparaciones'].append(metricas_par)
            
            # Calcular métricas agregadas
            self._calcular_metricas_agregadas()
            
        except Exception as e:
            self.logger.error(f"Error en comparaciones: {str(e)}")
    
    def _emparejar_imagenes(self, imagenes_generadas: List[str], imagenes_referencia: List[str]) -> List[Tuple[str, str]]:
        """Empareja imágenes generadas con sus referencias correspondientes."""
        pares = []
        
        # Método 1: Emparejamiento por nombre
        for img_gen in imagenes_generadas:
            nombre_gen = Path(img_gen).stem
            
            # Buscar referencia con nombre similar
            for img_ref in imagenes_referencia:
                nombre_ref = Path(img_ref).stem
                
                # Buscar coincidencias en el nombre
                if nombre_gen in nombre_ref or nombre_ref in nombre_gen:
                    pares.append((img_gen, img_ref))
                    break
        
        # Método 2: Emparejamiento por índice si no se encontraron suficientes
        if len(pares) < min(len(imagenes_generadas), len(imagenes_referencia)):
            for i in range(min(len(imagenes_generadas), len(imagenes_referencia))):
                if i >= len(pares):  # Solo añadir si no está ya
                    pares.append((imagenes_generadas[i], imagenes_referencia[i]))
        
        return pares
    
    def _cargar_y_procesar_imagen(self, ruta_imagen: str) -> Optional[np.ndarray]:
        """Carga y procesa una imagen para análisis."""
        try:
            if not PIL_AVAILABLE:
                # Usar OpenCV como alternativa
                imagen = cv2.imread(ruta_imagen)
                if imagen is not None:
                    imagen = cv2.cvtColor(imagen, cv2.COLOR_BGR2RGB)
                return imagen
            
            # Usar PIL para mejor control
            with Image.open(ruta_imagen) as img:
                # Convertir a RGB si es necesario
                if img.mode != 'RGB':
                    img = img.convert('RGB')
                
                # Convertir a array numpy
                imagen = np.array(img)
                
                return imagen
                
        except Exception as e:
            self.logger.error(f"Error cargando imagen {ruta_imagen}: {str(e)}")
            return None
    
    def _redimensionar_par(self, img1: np.ndarray, img2: np.ndarray) -> Tuple[np.ndarray, np.ndarray]:
        """Redimensiona un par de imágenes al mismo tamaño."""
        try:
            # Usar el tamaño objetivo si está configurado
            if self.resize_to:
                h, w = self.resize_to
                img1 = cv2.resize(img1, (w, h))
                img2 = cv2.resize(img2, (w, h))
            else:
                # Usar el tamaño mínimo
                h1, w1 = img1.shape[:2]
                h2, w2 = img2.shape[:2]
                h = min(h1, h2)
                w = min(w1, w2)
                
                img1 = cv2.resize(img1, (w, h))
                img2 = cv2.resize(img2, (w, h))
            
            return img1, img2
            
        except Exception as e:
            self.logger.error(f"Error redimensionando imágenes: {str(e)}")
            return img1, img2
    
    def _calcular_metricas_par(self, img1: np.ndarray, img2: np.ndarray) -> Dict:
        """Calcula todas las métricas para un par de imágenes."""
        try:
            metricas = {}
            
            # 1. PSNR (Peak Signal-to-Noise Ratio)
            metricas['psnr'] = self._calcular_psnr(img1, img2)
            
            # 2. SSIM (Structural Similarity Index)
            metricas['ssim'] = self._calcular_ssim(img1, img2)
            
            # 3. MSE (Mean Squared Error)
            metricas['mse'] = self._calcular_mse(img1, img2)
            
            # 4. MAE (Mean Absolute Error)
            metricas['mae'] = self._calcular_mae(img1, img2)
            
            # 5. LPIPS (Learned Perceptual Image Patch Similarity)
            if TORCH_AVAILABLE and self.lpips_model is not None:
                metricas['lpips'] = self._calcular_lpips(img1, img2)
            else:
                metricas['lpips'] = None
                self.resultados['problemas_deteccion'].append("LPIPS no disponible")
            
            # 6. Correlación de Pearson
            metricas['correlacion'] = self._calcular_correlacion(img1, img2)
            
            # 7. SSIM por canales
            metricas['ssim_rgb'] = self._calcular_ssim_por_canal(img1, img2)
            
            # 8. Histograma de diferencias
            metricas['histograma_diferencias'] = self._calcular_histograma_diferencias(img1, img2)
            
            return metricas
            
        except Exception as e:
            self.logger.error(f"Error calculando métricas del par: {str(e)}")
            return {}
    
    def _calcular_psnr(self, img1: np.ndarray, img2: np.ndarray) -> float:
        """Calcula PSNR (Peak Signal-to-Noise Ratio)."""
        try:
            # Convertir a float para cálculos precisos
            img1 = img1.astype(np.float64)
            img2 = img2.astype(np.float64)
            
            # Calcular MSE
            mse = np.mean((img1 - img2) ** 2)
            
            if mse == 0:
                return float('inf')  # Imágenes idénticas
            
            # Calcular PSNR
            max_val = 255.0
            psnr = 20 * np.log10(max_val / np.sqrt(mse))
            
            return round(psnr, 4)
            
        except Exception as e:
            self.logger.error(f"Error calculando PSNR: {str(e)}")
            return 0.0
    
    def _calcular_ssim(self, img1: np.ndarray, img2: np.ndarray) -> float:
        """Calcula SSIM (Structural Similarity Index)."""
        try:
            # SSIM de scikit-image funciona con arrays 2D o 3D
            if len(img1.shape) == 3 and img1.shape[2] == 3:
                # Convertir a escala de grises para SSIM general
                img1_gray = cv2.cvtColor(img1.astype(np.uint8), cv2.COLOR_RGB2GRAY)
                img2_gray = cv2.cvtColor(img2.astype(np.uint8), cv2.COLOR_RGB2GRAY)
                
                # Calcular SSIM con ventana gaussian
                ssim_value = ssim(img1_gray, img2_gray, 
                                data_range=img2_gray.max() - img2_gray.min(),
                                gaussian_weights=True,
                                sigma=1.5,
                                use_sample_covariance=False)
            else:
                # Ya está en escala de grises
                ssim_value = ssim(img1, img2, 
                                data_range=img2.max() - img2.min(),
                                gaussian_weights=True,
                                sigma=1.5)
            
            return round(ssim_value, 6)
            
        except Exception as e:
            self.logger.error(f"Error calculando SSIM: {str(e)}")
            return 0.0
    
    def _calcular_mse(self, img1: np.ndarray, img2: np.ndarray) -> float:
        """Calcula MSE (Mean Squared Error)."""
        try:
            mse = np.mean((img1.astype(np.float64) - img2.astype(np.float64)) ** 2)
            return round(mse, 4)
        except Exception as e:
            self.logger.error(f"Error calculando MSE: {str(e)}")
            return float('inf')
    
    def _calcular_mae(self, img1: np.ndarray, img2: np.ndarray) -> float:
        """Calcula MAE (Mean Absolute Error)."""
        try:
            mae = np.mean(np.abs(img1.astype(np.float64) - img2.astype(np.float64)))
            return round(mae, 4)
        except Exception as e:
            self.logger.error(f"Error calculando MAE: {str(e)}")
            return float('inf')
    
    def _calcular_lpips(self, img1: np.ndarray, img2: np.ndarray) -> Optional[float]:
        """Calcula LPIPS (Learned Perceptual Image Patch Similarity)."""
        try:
            if not TORCH_AVAILABLE or self.lpips_model is None:
                return None
            
            # Normalizar imágenes a rango [0, 1]
            img1_norm = img1.astype(np.float32) / 255.0
            img2_norm = img2.astype(np.float32) / 255.0
            
            # Convertir a tensor y reorder dims (H, W, C) -> (C, H, W)
            tensor1 = torch.from_numpy(img1_norm).permute(2, 0, 1).unsqueeze(0)
            tensor2 = torch.from_numpy(img2_norm).permute(2, 0, 1).unsqueeze(0)
            
            # Calcular LPIPS
            with torch.no_grad():
                lpips_value = self.lpips_model(tensor1, tensor2)
            
            return round(lpips_value.item(), 6)
            
        except Exception as e:
            self.logger.error(f"Error calculando LPIPS: {str(e)}")
            return None
    
    def _calcular_correlacion(self, img1: np.ndarray, img2: np.ndarray) -> float:
        """Calcula correlación de Pearson entre imágenes."""
        try:
            # Aplanar imágenes
            img1_flat = img1.reshape(-1)
            img2_flat = img2.reshape(-1)
            
            # Calcular correlación
            correlacion = np.corrcoef(img1_flat, img2_flat)[0, 1]
            
            # Manejar casos especiales
            if np.isnan(correlacion):
                correlacion = 1.0 if np.array_equal(img1_flat, img2_flat) else 0.0
            
            return round(correlacion, 6)
            
        except Exception as e:
            self.logger.error(f"Error calculando correlación: {str(e)}")
            return 0.0
    
    def _calcular_ssim_por_canal(self, img1: np.ndarray, img2: np.ndarray) -> Dict[str, float]:
        """Calcula SSIM por canal de color."""
        try:
            ssim_canal = {}
            
            for i, canal in enumerate(['R', 'G', 'B']):
                if img1.shape[2] > i:
                    canal1 = img1[:, :, i]
                    canal2 = img2[:, :, i]
                    
                    ssim_value = ssim(canal1, canal2, 
                                    data_range=canal2.max() - canal2.min())
                    ssim_canal[canal] = round(ssim_value, 6)
            
            return ssim_canal
            
        except Exception as e:
            self.logger.error(f"Error calculando SSIM por canal: {str(e)}")
            return {}
    
    def _calcular_histograma_diferencias(self, img1: np.ndarray, img2: np.ndarray) -> Dict:
        """Calcula histograma de diferencias entre imágenes."""
        try:
            # Calcular diferencia absoluta
            diff = np.abs(img1.astype(np.int16) - img2.astype(np.int16))
            
            # Histograma para escala de grises
            diff_gray = cv2.cvtColor(diff, cv2.COLOR_RGB2GRAY)
            hist_diff = cv2.calcHist([diff_gray], [0], None, [256], [0, 256])
            
            # Estadísticas de diferencias
            stats = {
                'media_diferencia': float(np.mean(diff)),
                'maxima_diferencia': int(np.max(diff)),
                'percentil_95': float(np.percentile(diff, 95)),
                'pixeis_identicos': int(np.sum(diff == 0)),
                'total_pixeles': int(diff.size)
            }
            
            return {
                'estadisticas': stats,
                'histograma': hist_diff.flatten().tolist()
            }
            
        except Exception as e:
            self.logger.error(f"Error calculando histograma: {str(e)}")
            return {}
    
    def _calcular_metricas_basicas(self, imagenes: List[str]):
        """Calcula métricas básicas cuando no hay imágenes de referencia."""
        try:
            self.logger.info("Calculando métricas básicas sin referencia")
            
            for i, img_path in enumerate(imagenes):
                imagen = self._cargar_y_procesar_imagen(img_path)
                if imagen is None:
                    continue
                
                # Calcular métricas intrínsecas
                metricas_basicas = {
                    'imagen': img_path,
                    'indice': i,
                    'contraste': self._calcular_contraste(imagen),
                    'nitidez': self._calcular_nitidez(imagen),
                    'brillo_promedio': float(np.mean(imagen)),
                    'saturacion_promedio': self._calcular_saturacion_promedio(imagen),
                    'complejidad': self._calcular_complejidad(imagen)
                }
                
                self.resultados['comparaciones'].append(metricas_basicas)
            
        except Exception as e:
            self.logger.error(f"Error calculando métricas básicas: {str(e)}")
    
    def _calcular_contraste(self, imagen: np.ndarray) -> float:
        """Calcula el contraste de una imagen."""
        try:
            if len(imagen.shape) == 3:
                imagen_gray = cv2.cvtColor(imagen, cv2.COLOR_RGB2GRAY)
            else:
                imagen_gray = imagen
            
            return float(np.std(imagen_gray))
            
        except Exception:
            return 0.0
    
    def _calcular_nitidez(self, imagen: np.ndarray) -> float:
        """Calcula la nitidez de una imagen usando el operador Laplacian."""
        try:
            if len(imagen.shape) == 3:
                imagen_gray = cv2.cvtColor(imagen, cv2.COLOR_RGB2GRAY)
            else:
                imagen_gray = imagen
            
            laplacian = cv2.Laplacian(imagen_gray, cv2.CV_64F)
            return float(np.var(laplacian))
            
        except Exception:
            return 0.0
    
    def _calcular_saturacion_promedio(self, imagen: np.ndarray) -> float:
        """Calcula la saturación promedio de la imagen."""
        try:
            hsv = cv2.cvtColor(imagen, cv2.COLOR_RGB2HSV)
            saturacion = hsv[:, :, 1]
            return float(np.mean(saturacion) / 255.0)  # Normalizar a [0, 1]
            
        except Exception:
            return 0.0
    
    def _calcular_complejidad(self, imagen: np.ndarray) -> float:
        """Calcula la complejidad de la imagen usando entropía."""
        try:
            if len(imagen.shape) == 3:
                imagen_gray = cv2.cvtColor(imagen, cv2.COLOR_RGB2GRAY)
            else:
                imagen_gray = imagen
            
            histograma = cv2.calcHist([imagen_gray], [0], None, [256], [0, 256])
            histograma = histograma.flatten()
            histograma = histograma / np.sum(histograma)  # Normalizar
            
            # Calcular entropía
            entropia = -np.sum(histograma * np.log2(histograma + 1e-10))
            
            return round(entropia, 4)
            
        except Exception:
            return 0.0
    
    def _calcular_metricas_agregadas(self):
        """Calcula métricas agregadas de todas las comparaciones."""
        try:
            if not self.resultados['comparaciones']:
                return
            
            metricas_valores = {}
            
            # Recopilar valores de métricas numéricas
            for comparacion in self.resultados['comparaciones']:
                for metrica, valor in comparacion.items():
                    if isinstance(valor, (int, float)) and metrica != 'indice_comparacion':
                        if metrica not in metricas_valores:
                            metricas_valores[metrica] = []
                        metricas_valores[metrica].append(valor)
            
            # Calcular estadísticas agregadas
            metricas_agregadas = {}
            for metrica, valores in metricas_valores.items():
                if valores:
                    metricas_agregadas[metrica] = {
                        'promedio': round(np.mean(valores), 6),
                        'mediana': round(np.median(valores), 6),
                        'minimo': round(np.min(valores), 6),
                        'maximo': round(np.max(valores), 6),
                        'desviacion_estandar': round(np.std(valores), 6)
                    }
            
            self.resultados['metricas'] = metricas_agregadas
            
        except Exception as e:
            self.logger.error(f"Error calculando métricas agregadas: {str(e)}")
    
    def _calcular_estadisticas_generales(self):
        """Calcula estadísticas generales de la evaluación."""
        try:
            num_comparaciones = len(self.resultados['comparaciones'])
            
            self.resultados['estadisticas'] = {
                'num_comparaciones': num_comparaciones,
                'metricas_disponibles': list(self.resultados['metricas'].keys()) if self.resultados['metricas'] else [],
                'evaluacion_completa': num_comparaciones > 0,
                'problemas_encontrados': len(self.resultados['problemas_deteccion'])
            }
            
        except Exception as e:
            self.logger.error(f"Error calculando estadísticas generales: {str(e)}")
    
    def _generar_recomendaciones(self):
        """Genera recomendaciones basadas en las métricas calculadas."""
        recomendaciones = []
        
        # Análisis de PSNR
        if 'psnr' in self.resultados.get('metricas', {}):
            psnr_stats = self.resultados['metricas']['psnr']
            if psnr_stats['promedio'] < self.psnr_threshold:
                recomendaciones.append("Mejorar calidad de renderizado (PSNR bajo)")
        
        # Análisis de SSIM
        if 'ssim' in self.resultados.get('metricas', {}):
            ssim_stats = self.resultados['metricas']['ssim']
            if ssim_stats['promedio'] < self.ssim_threshold:
                recomendaciones.append("Mejorar similitud estructural (SSIM bajo)")
        
        # Análisis de LPIPS
        if 'lpips' in self.resultados.get('metricas', {}):
            lpips_stats = self.resultados['metricas']['lpips']
            if lpips_stats['promedio'] > self.lpips_threshold:
                recomendaciones.append("Reducir diferencias perceptuales (LPIPS alto)")
        
        # Análisis de consistencia
        if len(self.resultados['comparaciones']) > 1:
            # Verificar variabilidad entre renders
            if 'ssim' in self.resultados.get('metricas', {}):
                std_ssim = self.resultados['metricas']['ssim']['desviacion_estandar']
                if std_ssim > 0.1:
                    recomendaciones.append("Mejorar consistencia entre diferentes vistas")
        
        # Recomendaciones específicas por problemas
        for problema in self.resultados.get('problemas_deteccion', []):
            if 'LPIPS' in problema:
                recomendaciones.append("Considerar usar imágenes de referencia de mayor calidad")
            elif 'referencia' in problema.lower():
                recomendaciones.append("Proporcionar imágenes de referencia para evaluación completa")
        
        self.resultados['recomendaciones'] = list(set(recomendaciones))
    
    def _calcular_puntuacion(self):
        """Calcula puntuación basada en las métricas calculadas."""
        puntuacion = 10.0  # Puntuación máxima
        
        # Penalizaciones por problemas
        penalizaciones = []
        
        # Penalización por problemas de detección
        penalizaciones.append(len(self.resultados.get('problemas_deteccion', [])) * 0.3)
        
        # Penalización por métricas debajo de umbrales
        if self.resultados.get('metricas', {}):
            # PSNR
            if 'psnr' in self.resultados['metricas']:
                psnr_promedio = self.resultados['metricas']['psnr']['promedio']
                if psnr_promedio < self.psnr_threshold:
                    deficit_psnr = (self.psnr_threshold - psnr_promedio) / self.psnr_threshold
                    penalizaciones.append(deficit_psnr * 2.0)
            
            # SSIM
            if 'ssim' in self.resultados['metricas']:
                ssim_promedio = self.resultados['metricas']['ssim']['promedio']
                if ssim_promedio < self.ssim_threshold:
                    deficit_ssim = (self.ssim_threshold - ssim_promedio) / self.ssim_threshold
                    penalizaciones.append(deficit_ssim * 3.0)
            
            # LPIPS
            if 'lpips' in self.resultados['metricas']:
                lpips_promedio = self.resultados['metricas']['lpips']['promedio']
                if lpips_promedio is not None and lpips_promedio > self.lpips_threshold:
                    deficit_lpips = (lpips_promedio - self.lpips_threshold) / self.lpips_threshold
                    penalizaciones.append(deficit_lpips * 2.0)
        
        # Calcular puntuación final
        puntuacion_final = max(0.0, puntuacion - sum(penalizaciones))
        self.resultados['puntuacion'] = round(puntuacion_final, 2)
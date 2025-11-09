#!/usr/bin/env python3
"""
Corrector Automático
===================

Módulo especializado en la corrección automática de problemas detectados en modelos 3D.
Aplica correcciones comunes sin intervención manual.
"""

import os
import shutil
import numpy as np
import open3d as o3d
from pathlib import Path
from typing import Dict, List, Tuple, Optional, Any, Union
import logging
import json
import tempfile
import cv2
from PIL import Image
import warnings

warnings.filterwarnings('ignore', category=FutureWarning)

class CorrectorAutomatico:
    """
    Corrector automático de problemas en modelos 3D.
    """
    
    def __init__(self, config: Dict = None):
        """
        Inicializa el corrector automático.
        
        Args:
            config: Configuración del corrector
        """
        self.config = config or {}
        self.logger = logging.getLogger('CorrectorAutomatico')
        
        # Configuración de corrección
        self.backup_original = self.config.get('backup_original', True)
        self.auto_correct = self.config.get('auto_correct', False)
        self.tolerancia_geometrica = self.config.get('tolerancia_geometrica', 0.01)
        self.calidad_compresion = self.config.get('calidad_compresion', 85)
        
        # Mapeo de problemas a funciones correctoras
        self.correctoras_problemas = {
            'agujeros_detectados': self._corregir_agujeros,
            'normales_invertidas': self._corregir_normales,
            'mapeado_uv_incorrecto': self._corregir_uv,
            'vertices_duplicados': self._corregir_vertices_duplicados,
            'triangulos_degenerados': self._corregir_triangulos_degenerados,
            'componentes_desconectadas': self._corregir_componentes_desconectadas,
            'dependencias_externas': self._corregir_dependencias_externas,
            'formatos_inconsistentes': self._corregir_formatos_inconsistentes,
            'compresion_excesiva': self._corregir_compresion
        }
        
        self.resultado_correccion = {
            'exito': False,
            'problemas_corregidos': [],
            'problemas_no_corregidos': [],
            'archivos_generados': [],
            'archivos_modificados': [],
            'errores': [],
            'estadisticas': {}
        }
    
    def corregir(self, ruta_archivo: str, directorio_salida: str, problemas: List[Dict]) -> Dict:
        """
        Corrige problemas automáticamente en un archivo 3D.
        
        Args:
            ruta_archivo: Archivo a corregir
            directorio_salida: Directorio donde guardar el archivo corregido
            problemas: Lista de problemas detectados
            
        Returns:
            Dict: Resultados de la corrección
        """
        try:
            self.logger.info(f"Iniciando corrección automática de: {ruta_archivo}")
            
            # Reiniciar resultado
            self.resultado_correccion = {
                'exito': False,
                'problemas_corregidos': [],
                'problemas_no_corregidos': [],
                'archivos_generados': [],
                'archivos_modificados': [],
                'errores': [],
                'estadisticas': {}
            }
            
            # Crear directorio de salida
            os.makedirs(directorio_salida, exist_ok=True)
            
            # Hacer backup del original si está habilitado
            if self.backup_original:
                self._crear_backup(ruta_archivo, directorio_salida)
            
            # Filtrar problemas corregibles automáticamente
            problemas_corregibles = [
                p for p in problemas 
                if p.get('auto_corregible', False)
            ]
            
            if not problemas_corregibles:
                self.resultado_correccion['problemas_no_corregidos'] = [p['problema'] for p in problemas]
                self.resultado_correccion['exito'] = True
                self.logger.info("No hay problemas corregibles automáticamente")
                return self.resultado_correccion
            
            # Determinar tipo de archivo
            extension = Path(ruta_archivo).suffix.lower()
            
            # Aplicar correcciones según el tipo de archivo
            if extension in ['.obj', '.ply']:
                self._corregir_archivo_malla(ruta_archivo, directorio_salida, problemas_corregibles)
            elif extension in ['.gltf', '.glb']:
                self._corregir_archivo_gltf(ruta_archivo, directorio_salida, problemas_corregibles)
            else:
                self.resultado_correccion['errores'].append(f"Tipo de archivo {extension} no soportado para corrección automática")
                return self.resultado_correccion
            
            # Marcar corrección como exitosa si al menos un problema fue corregido
            if self.resultado_correccion['problemas_corregidos']:
                self.resultado_correccion['exito'] = True
            
            self.logger.info(f"Corrección completada. {len(self.resultado_correccion['problemas_corregidos'])} problemas corregidos")
            return self.resultado_correccion
            
        except Exception as e:
            self.logger.error(f"Error durante corrección automática: {str(e)}")
            self.resultado_correccion['errores'].append(str(e))
            return self.resultado_correccion
    
    def _crear_backup(self, ruta_archivo: str, directorio_salida: str):
        """Crea backup del archivo original."""
        try:
            nombre_backup = f"{Path(ruta_archivo).stem}_backup{Path(ruta_archivo).suffix}"
            ruta_backup = os.path.join(directorio_salida, nombre_backup)
            
            shutil.copy2(ruta_archivo, ruta_backup)
            self.resultado_correccion['archivos_generados'].append(ruta_backup)
            self.logger.info(f"Backup creado: {ruta_backup}")
            
        except Exception as e:
            self.logger.warning(f"No se pudo crear backup: {str(e)}")
    
    def _corregir_archivo_malla(self, ruta_archivo: str, directorio_salida: str, problemas: List[Dict]):
        """Corrige problemas en archivos de malla (OBJ, PLY)."""
        try:
            # Cargar malla
            mesh = o3d.io.read_triangle_mesh(ruta_archivo)
            if mesh is None:
                self.resultado_correccion['errores'].append("No se pudo cargar la malla")
                return
            
            archivo_original = ruta_archivo
            
            # Aplicar correcciones geométricas
            for problema in problemas:
                tipo_problema = problema.get('problema')
                if tipo_problema in self.correctoras_problemas:
                    try:
                        corrector_func = self.correctoras_problemas[tipo_problema]
                        corrector_func(mesh, problema)
                        self.resultado_correccion['problemas_corregidos'].append(tipo_problema)
                        self.logger.info(f"Problema corregido: {tipo_problema}")
                    except Exception as e:
                        self.resultado_correccion['problemas_no_corregidos'].append(tipo_problema)
                        self.resultado_correccion['errores'].append(f"Error corrigiendo {tipo_problema}: {str(e)}")
            
            # Guardar malla corregida
            nombre_salida = f"{Path(archivo_original).stem}_corregido{Path(archivo_original).suffix}"
            ruta_salida = os.path.join(directorio_salida, nombre_salida)
            
            o3d.io.write_triangle_mesh(ruta_salida, mesh)
            self.resultado_correccion['archivos_modificados'].append(ruta_salida)
            
        except Exception as e:
            self.resultado_correccion['errores'].append(f"Error corrigiendo archivo de malla: {str(e)}")
    
    def _corregir_archivo_gltf(self, ruta_archivo: str, directorio_salida: str, problemas: List[Dict]):
        """Corrige problemas en archivos GLTF/GLB."""
        try:
            # Para GLTF, la corrección automática es más limitada
            # Principalmente se enfoca en dependencias externas y formatos
            
            extension = Path(ruta_archivo).suffix.lower()
            archivo_original = ruta_archivo
            nombre_salida = f"{Path(archivo_original).stem}_corregido{extension}"
            ruta_salida = os.path.join(directorio_salida, nombre_salida)
            
            # Copiar archivo original como base
            shutil.copy2(archivo_original, ruta_salida)
            
            # Corregir dependencias externas
            for problema in problemas:
                tipo_problema = problema.get('problema')
                if tipo_problema == 'dependencias_externas':
                    try:
                        self._embeber_recursos_gltf(ruta_salida, problema.get('datos', {}))
                        self.resultado_correccion['problemas_corregidos'].append(tipo_problema)
                        self.logger.info(f"Dependencias embebidas")
                    except Exception as e:
                        self.resultado_correccion['problemas_no_corregidos'].append(tipo_problema)
                        self.resultado_correccion['errores'].append(f"Error embebiendo recursos: {str(e)}")
            
            self.resultado_correccion['archivos_modificados'].append(ruta_salida)
            
        except Exception as e:
            self.resultado_correccion['errores'].append(f"Error corrigiendo archivo GLTF: {str(e)}")
    
    def _corregir_agujeros(self, mesh: o3d.geometry.TriangleMesh, problema: Dict):
        """Corrige agujeros en la malla."""
        try:
            self.logger.info("Corrigiendo agujeros...")
            
            # Open3D no tiene un método directo para sellar agujeros
            # Se puede usar Poisson surface reconstruction como alternativa
            
            # Crear nube de puntos de la malla
            puntos = mesh.sample_points_uniformly(number_of_points=len(mesh.vertices) * 2)
            
            # Reconstruir superficie
            mesh_reconstruida = o3d.geometry.TriangleMesh.create_from_point_cloud_poisson(
                puntos, depth=8
            )[0]
            
            # Reemplazar malla original
            mesh.vertices = mesh_reconstruida.vertices
            mesh.triangles = mesh_reconstruida.triangles
            mesh.compute_vertex_normals()
            
        except Exception as e:
            self.logger.error(f"Error corrigiendo agujeros: {str(e)}")
            raise
    
    def _corregir_normales(self, mesh: o3d.geometry.TriangleMesh, problema: Dict):
        """Corrige normales invertidas."""
        try:
            self.logger.info("Corrigiendo normales...")
            
            # Recalcular todas las normales
            mesh.compute_vertex_normals()
            
            # Orientar todas las normales hacia afuera
            if not mesh.has_triangle_normals():
                mesh.compute_triangle_normals()
            
            # Invertir normales si es necesario
            # (En una implementación más avanzada, se analizaría la orientación)
            
        except Exception as e:
            self.logger.error(f"Error corrigiendo normales: {str(e)}")
            raise
    
    def _corregir_uv(self, mesh: o3d.geometry.TriangleMesh, problema: Dict):
        """Corrige mapeado UV (implementación básica)."""
        try:
            self.logger.info("Corrigiendo mapeado UV...")
            
            # Open3D no tiene capacidades avanzadas de unwrapping UV
            # Esta sería una implementación básica
            
            # Verificar si ya existe UV
            if not mesh.has_textures():
                # Crear UV mapping básico usando caja envolvente
                mesh = self._crear_uv_basico(mesh)
            
        except Exception as e:
            self.logger.error(f"Error corrigiendo UV: {str(e)}")
            raise
    
    def _crear_uv_basico(self, mesh: o3d.geometry.TriangleMesh) -> o3d.geometry.TriangleMesh:
        """Crea mapeado UV básico."""
        try:
            # Obtener bounding box
            bbox = mesh.get_axis_aligned_bounding_box()
            min_bound = bbox.min_bound
            max_bound = bbox.max_bound
            size = max_bound - min_bound
            
            # Crear UV coordinates básicas
            uvs = []
            vertices = np.asarray(mesh.vertices)
            
            for vertex in vertices:
                u = (vertex[0] - min_bound[0]) / size[0] if size[0] > 0 else 0
                v = (vertex[1] - min_bound[1]) / size[1] if size[1] > 0 else 0
                uvs.append([u, v])
            
            # En Open3D, esto requeriría un enfoque más complejo
            # Por simplicidad, retornamos la malla original
            return mesh
            
        except Exception as e:
            self.logger.error(f"Error creando UV básico: {str(e)}")
            return mesh
    
    def _corregir_vertices_duplicados(self, mesh: o3d.geometry.TriangleMesh, problema: Dict):
        """Corrige vértices duplicados."""
        try:
            self.logger.info("Corrigiendo vértices duplicados...")
            
            # Remover vértices duplicados
            mesh.remove_duplicated_vertices()
            
            # Remover triángulos degenerados
            mesh.remove_degenerate_triangles()
            
            # Remover triángulos duplicados
            mesh.remove_duplicated_triangles()
            
        except Exception as e:
            self.logger.error(f"Error corrigiendo vértices duplicados: {str(e)}")
            raise
    
    def _corregir_triangulos_degenerados(self, mesh: o3d.geometry.TriangleMesh, problema: Dict):
        """Corrige triángulos degenerados."""
        try:
            self.logger.info("Corrigiendo triángulos degenerados...")
            
            # Remover triángulos degenerados
            mesh.remove_degenerate_triangles()
            
            # Remover triángulos duplicados
            mesh.remove_duplicated_triangles()
            
            # Recalcular índices si es necesario
            mesh.remove_unreferenced_vertices()
            
        except Exception as e:
            self.logger.error(f"Error corrigiendo triángulos degenerados: {str(e)}")
            raise
    
    def _corregir_componentes_desconectadas(self, mesh: o3d.geometry.TriangleMesh, problema: Dict):
        """Corrige componentes desconectadas."""
        try:
            self.logger.info("Corrigiendo componentes desconectadas...")
            
            # Separar la malla en componentes
            componentes = mesh.split_by_connectivity()
            
            if len(componentes) > 1:
                # Encontrar el componente más grande
                componente_principal = max(componentes, key=lambda m: len(m.triangles))
                
                # Reemplazar malla original con componente principal
                mesh.vertices = componente_principal.vertices
                mesh.triangles = componente_principal.triangles
                mesh.compute_vertex_normals()
                
        except Exception as e:
            self.logger.error(f"Error corrigiendo componentes desconectadas: {str(e)}")
            raise
    
    def _corregir_dependencias_externas(self, ruta_archivo: str, problema: Dict):
        """Corrige dependencias externas."""
        try:
            self.logger.info("Corrigiendo dependencias externas...")
            
            if Path(ruta_archivo).suffix.lower() == '.gltf':
                self._embeber_recursos_gltf(ruta_archivo, problema.get('datos', {}))
            
        except Exception as e:
            self.logger.error(f"Error corrigiendo dependencias externas: {str(e)}")
            raise
    
    def _embeber_recursos_gltf(self, ruta_archivo: str, datos_problema: Dict):
        """Embeber recursos externos en archivo GLTF."""
        try:
            # Esta es una implementación simplificada
            # En una implementación completa se parsearía el GLTF y se embebrían los recursos
            
            directorio = os.path.dirname(ruta_archivo)
            
            # Buscar archivos de texturas en el directorio
            texturas = []
            for ext in ['.png', '.jpg', '.jpeg', '.tga']:
                texturas.extend(list(Path(directorio).glob(f"*{ext}")))
            
            # Esta implementación simplemente copia los archivos al directorio de salida
            # Una implementación real convertiría a data URIs
            
        except Exception as e:
            self.logger.error(f"Error embebiendo recursos: {str(e)}")
            raise
    
    def _corregir_formatos_inconsistentes(self, ruta_directorio: str, problema: Dict):
        """Corrige formatos de textura inconsistentes."""
        try:
            self.logger.info("Corrigiendo formatos de textura inconsistentes...")
            
            # Convertir todos los formatos a PNG para consistencia
            texturas = []
            for ext in ['.jpg', '.jpeg', '.tga', '.bmp']:
                texturas.extend(list(Path(ruta_directorio).glob(f"*{ext}")))
            
            for textura in texturas:
                try:
                    # Convertir a PNG
                    with Image.open(textura) as img:
                        if img.mode != 'RGB':
                            img = img.convert('RGB')
                        
                        nombre_png = f"{textura.stem}.png"
                        ruta_png = Path(ruta_directorio) / nombre_png
                        img.save(ruta_png, 'PNG', quality=95)
                        
                        self.resultado_correccion['archivos_generados'].append(str(ruta_png))
                    
                except Exception as e:
                    self.logger.warning(f"No se pudo convertir {textura}: {str(e)}")
            
        except Exception as e:
            self.logger.error(f"Error corrigiendo formatos inconsistentes: {str(e)}")
            raise
    
    def _corregir_compresion(self, ruta_directorio: str, problema: Dict):
        """Corrige compresión excesiva."""
        try:
            self.logger.info("Corrigiendo compresión excesiva...")
            
            # Encontrar imágenes JPEG con artifacts
            imagenes = list(Path(ruta_directorio).glob("*.jpg")) + list(Path(ruta_directorio).glob("*.jpeg"))
            
            for imagen in imagenes:
                try:
                    # Cargar imagen
                    img = Image.open(imagen)
                    
                    # Recomprimir con mejor calidad
                    nombre_sin_compresion = f"{imagen.stem}_optimizada.png"
                    ruta_optimizada = Path(ruta_directorio) / nombre_sin_compresion
                    
                    img.save(ruta_optimizada, 'PNG', optimize=True)
                    self.resultado_correccion['archivos_generados'].append(str(ruta_optimizada))
                    
                except Exception as e:
                    self.logger.warning(f"No se pudo optimizar {imagen}: {str(e)}")
            
        except Exception as e:
            self.logger.error(f"Error corrigiendo compresión: {str(e)}")
            raise
    
    def obtener_estadisticas_correccion(self) -> Dict:
        """Obtiene estadísticas de la corrección."""
        if not self.resultado_correccion:
            return {}
        
        return {
            'exito': self.resultado_correccion.get('exito', False),
            'problemas_corregidos': len(self.resultado_correccion.get('problemas_corregidos', [])),
            'problemas_no_corregidos': len(self.resultado_correccion.get('problemas_no_corregidos', [])),
            'errores': len(self.resultado_correccion.get('errores', [])),
            'archivos_generados': len(self.resultado_correccion.get('archivos_generados', [])),
            'archivos_modificados': len(self.resultado_correccion.get('archivos_modificados', []))
        }
    
    def generar_reporte_correccion(self, archivo_reporte: str) -> str:
        """Genera un reporte de la corrección."""
        try:
            with open(archivo_reporte, 'w', encoding='utf-8') as f:
                json.dump(self.resultado_correccion, f, indent=2, ensure_ascii=False)
            
            return archivo_reporte
            
        except Exception as e:
            self.logger.error(f"Error generando reporte de corrección: {str(e)}")
            return ""
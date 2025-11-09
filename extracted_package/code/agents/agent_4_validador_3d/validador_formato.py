#!/usr/bin/env python3
"""
Validador de Formato
===================

Módulo especializado en la validación de formato y compatibilidad de archivos 3D.
Enfocado en glTF/GLB, pero soporta múltiples formatos de modelado 3D.
"""

import os
import json
import struct
from pathlib import Path
from typing import Dict, List, Tuple, Optional, Any, Union
import logging
import zipfile
import tempfile

class ValidadorFormato:
    """
    Validador de formato y compatibilidad para archivos 3D.
    """
    
    def __init__(self, config: Dict = None):
        """
        Inicializa el validador de formato.
        
        Args:
            config: Configuración del validador
        """
        self.config = config or {}
        self.logger = logging.getLogger('ValidadorFormato')
        
        # Formatos soportados
        self.formatos_soportados = {
            '.gltf': self._validar_gltf,
            '.glb': self._validar_glb,
            '.obj': self._validar_obj,
            '.ply': self._validar_ply,
            '.stl': self._validar_stl,
            '.dae': self._validar_dae
        }
        
        # Configuración de validación
        self.tamaño_maximo = self.config.get('tamaño_maximo', 100 * 1024 * 1024)  # 100MB
        self.version_gltf_minima = self.config.get('version_gltf_minima', '1.0')
        self.version_gltf_maxima = self.config.get('version_gltf_maxima', '2.0')
        
        self.resultados = {
            'puntuacion': 0.0,
            'formato_detectado': None,
            'version': None,
            'compatibilidad': {},
            'validacion_estructura': {},
            'dependencias': [],
            'optimizaciones': {},
            'problemas_formato': [],
            'caracteristicas': {},
            'recomendaciones': []
        }
    
    def validar(self, ruta_archivo: str) -> Dict:
        """
        Valida el formato y compatibilidad de un archivo 3D.
        
        Args:
            ruta_archivo: Ruta al archivo 3D
            
        Returns:
            Dict: Resultados de la validación de formato
        """
        try:
            self.logger.info(f"Validando formato de: {ruta_archivo}")
            
            # Verificar que el archivo existe
            if not os.path.exists(ruta_archivo):
                self.resultados['problemas_formato'].append("Archivo no encontrado")
                self._calcular_puntuacion()
                return self.resultados
            
            # Verificar tamaño del archivo
            tamaño_archivo = os.path.getsize(ruta_archivo)
            if tamaño_archivo == 0:
                self.resultados['problemas_formato'].append("Archivo vacío")
                self._calcular_puntuacion()
                return self.resultados
            
            if tamaño_archivo > self.tamaño_maximo:
                self.resultados['problemas_formato'].append(f"Archivo demasiado grande: {tamaño_archivo / (1024*1024):.1f}MB")
            
            # Detectar formato
            extension = Path(ruta_archivo).suffix.lower()
            self.resultados['formato_detectado'] = extension
            
            if extension not in self.formatos_soportados:
                self.resultados['problemas_formato'].append(f"Formato no soportado: {extension}")
                self._calcular_puntuacion()
                return self.resultados
            
            # Validar según el formato específico
            validador_formato = self.formatos_soportados[extension]
            validador_formato(ruta_archivo)
            
            # Análisis común para todos los formatos
            self._analizar_caracteristicas_comunes(ruta_archivo)
            
            # Verificar compatibilidad web/browser
            self._verificar_compatibilidad_web()
            
            # Generar recomendaciones
            self._generar_recomendaciones()
            
            # Calcular puntuación
            self._calcular_puntuacion()
            
            self.logger.info(f"Validación de formato completada. Puntuación: {self.resultados['puntuacion']:.2f}")
            return self.resultados
            
        except Exception as e:
            self.logger.error(f"Error en validación de formato: {str(e)}")
            self.resultados['error'] = str(e)
            return self.resultados
    
    def _validar_gltf(self, ruta_archivo: str):
        """Valida archivo GLTF."""
        try:
            with open(ruta_archivo, 'r', encoding='utf-8') as f:
                gltf_data = json.load(f)
            
            self.resultados['version'] = gltf_data.get('asset', {}).get('version', 'desconocida')
            
            # Validar estructura básica
            campos_requeridos = ['asset', 'scene', 'scenes', 'nodes', 'meshes']
            for campo in campos_requeridos:
                if campo not in gltf_data:
                    self.resultados['problemas_formato'].append(f"Campo requerido faltante: {campo}")
            
            # Validar asset
            if 'asset' in gltf_data:
                asset = gltf_data['asset']
                version = asset.get('version', 'desconocida')
                
                # Verificar versión
                if not self._verificar_version_gltf(version):
                    self.resultados['problemas_formato'].append(f"Versión GLTF no compatible: {version}")
            
            # Analizar escenas
            if 'scenes' in gltf_data:
                escenas = gltf_data['scenes']
                if len(escenas) == 0:
                    self.resultados['problemas_formato'].append("No hay escenas definidas")
                else:
                    # Verificar que la escena por defecto existe
                    scene_por_defecto = gltf_data.get('scene')
                    if scene_por_defecto is not None and scene_por_defecto >= len(escenas):
                        self.resultados['problemas_formato'].append("Índice de escena por defecto inválido")
            
            # Analizar meshes
            if 'meshes' in gltf_data:
                meshes = gltf_data['meshes']
                for i, mesh in enumerate(meshes):
                    if 'primitives' not in mesh:
                        self.resultados['problemas_formato'].append(f"Mesh {i} sin primitivas")
                    else:
                        # Validar primitivas
                        for j, primitiva in enumerate(mesh['primitives']):
                            if 'attributes' not in primitiva:
                                self.resultados['problemas_formato'].append(f"Primitiva {j} del mesh {i} sin atributos")
            
            # Analizar materials
            if 'materials' in gltf_data:
                materials = gltf_data['materials']
                for i, material in enumerate(materials):
                    if 'name' not in material:
                        self.resultados['problemas_formato'].append(f"Material {i} sin nombre")
            
            # Verificar buffers y recursos externos
            if 'buffers' in gltf_data:
                buffers = gltf_data['buffers']
                directorio_base = os.path.dirname(ruta_archivo)
                
                for i, buffer in enumerate(buffers):
                    uri = buffer.get('uri')
                    if uri and not uri.startswith('data:'):
                        # Buffer externo
                        ruta_buffer = os.path.join(directorio_base, uri)
                        if not os.path.exists(ruta_buffer):
                            self.resultados['problemas_formato'].append(f"Buffer externo no encontrado: {uri}")
                        else:
                            self.resultados['dependencias'].append(uri)
            
            # Verificar images y textures
            if 'images' in gltf_data:
                images = gltf_data['images']
                directorio_base = os.path.dirname(ruta_archivo)
                
                for i, image in enumerate(images):
                    uri = image.get('uri')
                    if uri and not uri.startswith('data:'):
                        # Imagen externa
                        ruta_imagen = os.path.join(directorio_base, uri)
                        if not os.path.exists(ruta_imagen):
                            self.resultados['problemas_formato'].append(f"Imagen externa no encontrada: {uri}")
                        else:
                            self.resultados['dependencias'].append(uri)
            
            # Análisis de optimización GLTF
            self._analizar_optimizacion_gltf(gltf_data)
            
            self.resultados['caracteristicas']['tipo'] = 'gltf'
            self.resultados['caracteristicas']['num_meshes'] = len(gltf_data.get('meshes', []))
            self.resultados['caracteristicas']['num_materials'] = len(gltf_data.get('materials', []))
            self.resultados['caracteristicas']['num_textures'] = len(gltf_data.get('textures', []))
            self.resultados['caracteristicas']['num_images'] = len(gltf_data.get('images', []))
            self.resultados['caracteristicas']['num_nodes'] = len(gltf_data.get('nodes', []))
            self.resultados['caracteristicas']['num_scenes'] = len(gltf_data.get('scenes', []))
            
        except json.JSONDecodeError as e:
            self.resultados['problemas_formato'].append(f"Error parseando JSON GLTF: {str(e)}")
        except Exception as e:
            self.resultados['problemas_formato'].append(f"Error validando GLTF: {str(e)}")
    
    def _validar_glb(self, ruta_archivo: str):
        """Valida archivo GLB."""
        try:
            with open(ruta_archivo, 'rb') as f:
                # Leer header GLB
                magic = f.read(4)
                version = struct.unpack('<I', f.read(4))[0]
                length = struct.unpack('<I', f.read(4))[0]
            
            # Verificar magic number
            if magic != b'glTF':
                self.resultados['problemas_formato'].append("Magic number inválido para GLB")
                return
            
            self.resultados['version'] = str(version)
            
            # Verificar versión soportada
            if version not in [1, 2]:
                self.resultados['problemas_formato'].append(f"Versión GLB no soportada: {version}")
            
            # Leer chunks
            chunks_procesados = 0
            while f.tell() < length:
                # Leer chunk header
                chunk_length = struct.unpack('<I', f.read(4))[0]
                chunk_type = f.read(4)
                
                if chunk_type == b'JSON':
                    # Chunk JSON
                    json_data = f.read(chunk_length)
                    try:
                        gltf_data = json.loads(json_data.decode('utf-8'))
                        
                        # Validar contenido JSON
                        campos_requeridos = ['asset', 'scene', 'scenes', 'nodes', 'meshes']
                        for campo in campos_requeridos:
                            if campo not in gltf_data:
                                self.resultados['problemas_formato'].append(f"Campo requerido faltante en GLB: {campo}")
                        
                        # Análisis de contenido
                        self._analizar_contenido_glb(gltf_data)
                        
                    except json.JSONDecodeError:
                        self.resultados['problemas_formato'].append("JSON corrupto en chunk GLB")
                
                elif chunk_type == b'BIN\0':
                    # Chunk binario
                    bin_data = f.read(chunk_length)
                    self._analizar_chunk_binario(bin_data)
                
                else:
                    # Chunk desconocido, skip
                    f.seek(chunk_length, 1)
                
                chunks_procesados += 1
            
            # Verificar que se procesaron al menos JSON y BIN
            if chunks_procesados < 2:
                self.resultados['problemas_formato'].append("GLB incompleto: faltan chunks requeridos")
            
            self.resultados['caracteristicas']['tipo'] = 'glb'
            self.resultados['caracteristicas']['version'] = version
            self.resultados['caracteristicas']['auto_contenido'] = True  # GLB es self-contained
            
        except Exception as e:
            self.resultados['problemas_formato'].append(f"Error validando GLB: {str(e)}")
    
    def _validar_obj(self, ruta_archivo: str):
        """Valida archivo OBJ."""
        try:
            vertices_count = 0
            faces_count = 0
            has_normals = False
            has_uvs = False
            material_file = None
            
            with open(ruta_archivo, 'r', encoding='utf-8') as f:
                for linea in f:
                    linea = linea.strip()
                    if not linea or linea.startswith('#'):
                        continue
                    
                    if linea.startswith('v '):
                        vertices_count += 1
                    elif linea.startswith('f '):
                        faces_count += 1
                    elif linea.startswith('vn '):
                        has_normals = True
                    elif linea.startswith('vt '):
                        has_uvs = True
                    elif linea.startswith('mtllib '):
                        material_file = linea.split()[1]
            
            # Verificaciones básicas
            if vertices_count == 0:
                self.resultados['problemas_formato'].append("No se encontraron vértices")
            
            if faces_count == 0:
                self.resultados['problemas_formato'].append("No se encontraron caras")
            
            # Verificar archivo de materiales
            if material_file:
                directorio_base = os.path.dirname(ruta_archivo)
                ruta_material = os.path.join(directorio_base, material_file)
                if not os.path.exists(ruta_material):
                    self.resultados['problemas_formato'].append(f"Archivo de materiales no encontrado: {material_file}")
                else:
                    self.resultados['dependencias'].append(material_file)
            
            self.resultados['caracteristicas'] = {
                'tipo': 'obj',
                'vertices': vertices_count,
                'faces': faces_count,
                'has_normals': has_normals,
                'has_uvs': has_uvs,
                'material_file': material_file is not None
            }
            
        except Exception as e:
            self.resultados['problemas_formato'].append(f"Error validando OBJ: {str(e)}")
    
    def _validar_ply(self, ruta_archivo: str):
        """Valida archivo PLY."""
        try:
            with open(ruta_archivo, 'r') as f:
                # Leer header
                if f.readline().strip() != 'ply':
                    self.resultados['problemas_formato'].append("Header PLY inválido")
                    return
                
                formato = f.readline().strip()
                if 'ascii' not in formato and 'binary' not in formato:
                    self.resultados['problemas_formato'].append("Formato PLY no reconocido")
                    return
                
                es_binario = 'binary' in formato
                
                # Leer propiedades
                vertices_count = 0
                faces_count = 0
                propiedades = []
                
                linea = f.readline().strip()
                while linea != 'end_header':
                    if linea.startswith('element vertex'):
                        vertices_count = int(linea.split()[2])
                    elif linea.startswith('element face'):
                        faces_count = int(linea.split()[2])
                    elif linea.startswith('property'):
                        propiedades.append(linea)
                    
                    linea = f.readline().strip()
                
                # Verificaciones básicas
                if vertices_count == 0:
                    self.resultados['problemas_formato'].append("No se encontraron vértices en PLY")
                
                if faces_count == 0:
                    self.resultados['problemas_formato'].append("No se encontraron caras en PLY")
            
            self.resultados['caracteristicas'] = {
                'tipo': 'ply',
                'formato': 'binary' if es_binario else 'ascii',
                'vertices': vertices_count,
                'faces': faces_count,
                'propiedades': len(propiedades)
            }
            
        except Exception as e:
            self.resultados['problemas_formato'].append(f"Error validando PLY: {str(e)}")
    
    def _validar_stl(self, ruta_archivo: str):
        """Valida archivo STL."""
        try:
            with open(ruta_archivo, 'rb') as f:
                # Verificar si es ASCII o binario
                header = f.read(80)
                
                # Intentar leer como ASCII
                f.seek(0)
                try:
                    primera_linea = f.readline().decode('ascii').strip()
                    if primera_linea.startswith('solid'):
                        # Es ASCII STL
                        triangulos_ascii = 0
                        for linea in f:
                            linea = linea.decode('ascii', errors='ignore').strip()
                            if linea.startswith('endsolid'):
                                break
                            elif linea.startswith('facet normal'):
                                triangulos_ascii += 1
                        
                        self.resultados['caracteristicas'] = {
                            'tipo': 'stl',
                            'formato': 'ascii',
                            'triangles': triangulos_ascii
                        }
                        return
                
                except UnicodeDecodeError:
                    pass
                
                # Es binario STL
                f.seek(80)
                triangulos_count = struct.unpack('<I', f.read(4))[0]
                
                # Verificar tamaño de archivo
                tamaño_esperado = 84 + (triangulos_count * 50)
                tamaño_real = os.path.getsize(ruta_archivo)
                
                if tamaño_real != tamaño_esperado:
                    self.resultados['problemas_formato'].append(f"Tamaño STL inconsistente: esperado {tamaño_esperado}, real {tamaño_real}")
                
                self.resultados['caracteristicas'] = {
                    'tipo': 'stl',
                    'formato': 'binary',
                    'triangles': triangulos_count
                }
                
        except Exception as e:
            self.resultados['problemas_formato'].append(f"Error validando STL: {str(e)}")
    
    def _validar_dae(self, ruta_archivo: str):
        """Valida archivo DAE (Collada)."""
        try:
            # Verificación básica de XML
            with open(ruta_archivo, 'r', encoding='utf-8') as f:
                contenido = f.read(1024)  # Leer primeros 1KB
                
                if not contenido.startswith('<?xml'):
                    self.resultados['problemas_formato'].append("Header XML inválido en DAE")
                
                if 'COLLADA' not in contenido:
                    self.resultados['problemas_formato'].append("Namespace COLLADA no encontrado")
            
            self.resultados['caracteristicas'] = {
                'tipo': 'dae',
                'formato': 'xml'
            }
            
        except Exception as e:
            self.resultados['problemas_formato'].append(f"Error validando DAE: {str(e)}")
    
    def _verificar_version_gltf(self, version: str) -> bool:
        """Verifica si la versión GLTF es compatible."""
        try:
            # Parsear versión
            version_nums = [int(x) for x in version.split('.')]
            
            min_nums = [int(x) for x in self.version_gltf_minima.split('.')]
            max_nums = [int(x) for x in self.version_gltf_maxima.split('.')]
            
            return (version_nums >= min_nums) and (version_nums <= max_nums)
            
        except (ValueError, IndexError):
            return False
    
    def _analizar_contenido_glb(self, gltf_data: Dict):
        """Analiza el contenido de un archivo GLB."""
        try:
            # Contar elementos
            elementos = {
                'meshes': len(gltf_data.get('meshes', [])),
                'materials': len(gltf_data.get('materials', [])),
                'textures': len(gltf_data.get('textures', [])),
                'images': len(gltf_data.get('images', [])),
                'nodes': len(gltf_data.get('nodes', [])),
                'scenes': len(gltf_data.get('scenes', [])),
                'cameras': len(gltf_data.get('cameras', [])),
                'lights': len(gltf_data.get('lights', []))
            }
            
            # Verificar características específicas
            tiene_animaciones = 'animations' in gltf_data and len(gltf_data['animations']) > 0
            tiene_skins = 'skins' in gltf_data and len(gltf_data['skins']) > 0
            tiene_extras = 'extras' in gltf_data
            
            self.resultados['caracteristicas']['animaciones'] = tiene_animaciones
            self.resultados['caracteristicas']['skins'] = tiene_skins
            self.resultados['caracteristicas']['extras'] = tiene_extras
            self.resultados['caracteristicas']['elementos'] = elementos
            
        except Exception as e:
            self.logger.error(f"Error analizando contenido GLB: {str(e)}")
    
    def _analizar_chunk_binario(self, bin_data: bytes):
        """Analiza el chunk binario de un archivo GLB."""
        try:
            # Análisis básico del chunk binario
            tamaño = len(bin_data)
            
            self.resultados['caracteristicas']['tamaño_binario'] = tamaño
            
            # Detectar tipos de datos comunes
            if b'BIN' in bin_data[:10]:
                self.resultados['problemas_formato'].append("Posible corrupción en chunk binario")
            
        except Exception as e:
            self.logger.error(f"Error analizando chunk binario: {str(e)}")
    
    def _analisis_optimizacion_gltf(self, gltf_data: Dict):
        """Analiza optimizaciones posibles en GLTF."""
        try:
            optimizaciones = []
            
            # Verificar uso de índices
            meshes = gltf_data.get('meshes', [])
            for i, mesh in enumerate(meshes):
                for j, primitiva in enumerate(mesh.get('primitives', [])):
                    if 'indices' not in primitiva:
                        # Mesh sin índices, puede optimizarse
                        optimizaciones.append(f"Mesh {i}, primitiva {j} sin índices")
            
            # Verificar buffers externos vs embebidos
            buffers = gltf_data.get('buffers', [])
            buffers_externos = sum(1 for b in buffers if not b.get('uri', '').startswith('data:'))
            
            if buffers_externos > 0:
                self.resultados['optimizaciones']['embeber_buffers'] = True
            
            # Verificar imágenes externas
            images = gltf_data.get('images', [])
            imagenes_externas = sum(1 for img in images if not img.get('uri', '').startswith('data:'))
            
            if imagenes_externas > 0:
                self.resultados['optimizaciones']['embeber_imagenes'] = True
            
            # Verificar compresión
            if 'extensions' in gltf_data and 'KHR_texture_compression_basisu' in gltf_data['extensions']:
                optimizaciones.append("Compresión de texturas disponible")
            
            self.resultados['optimizaciones']['detector'] = optimizaciones
            
        except Exception as e:
            self.logger.error(f"Error analizando optimización GLTF: {str(e)}")
    
    def _analizar_caracteristicas_comunes(self, ruta_archivo: str):
        """Analiza características comunes de cualquier formato."""
        try:
            tamaño_archivo = os.path.getsize(ruta_archivo)
            
            # Información básica
            info_basica = {
                'tamaño_archivo': tamaño_archivo,
                'tamaño_mb': round(tamaño_archivo / (1024*1024), 2),
                'nombre_archivo': os.path.basename(ruta_archivo),
                'directorio': os.path.dirname(ruta_archivo)
            }
            
            self.resultados['caracteristicas'].update(info_basica)
            
        except Exception as e:
            self.logger.error(f"Error analizando características comunes: {str(e)}")
    
    def _verificar_compatibilidad_web(self):
        """Verifica compatibilidad para uso web."""
        try:
            compatibilidad = {
                'web_gl': True,
                'three_js': True,
                'babylon_js': True,
                'aframe': True,
                'model_viewer': True
            }
            
            # Restricciones por formato
            formato = self.resultados.get('caracteristicas', {}).get('tipo')
            
            if formato in ['obj', 'ply', 'stl', 'dae']:
                compatibilidad['model_viewer'] = False
            
            self.resultados['compatibilidad'] = compatibilidad
            
        except Exception as e:
            self.logger.error(f"Error verificando compatibilidad web: {str(e)}")
    
    def _generar_recomendaciones(self):
        """Genera recomendaciones específicas del formato."""
        recomendaciones = []
        
        # Recomendaciones basadas en formato detectado
        tipo = self.resultados.get('caracteristicas', {}).get('tipo')
        
        if tipo == 'gltf':
            if self.resultados['dependencias']:
                recomendaciones.append("Considerar usar GLB en lugar de GLTF para evitar dependencias externas")
            
            optimizaciones = self.resultados.get('optimizaciones', {})
            if optimizaciones.get('embeber_buffers'):
                recomendaciones.append("Embeber buffers para reducir número de archivos")
            
            if optimizaciones.get('embeber_imagenes'):
                recomendaciones.append("Embeber imágenes para portabilidad")
        
        elif tipo == 'obj':
            if self.resultados['caracteristicas'].get('material_file'):
                recomendaciones.append("Verificar que el archivo .mtl esté en la misma ubicación")
            
            if not self.resultados['caracteristicas'].get('has_uvs'):
                recomendaciones.append("Agregar coordenadas UV para texturas")
            
            if not self.resultados['caracteristicas'].get('has_normals'):
                recomendaciones.append("Agregar normales para mejor iluminación")
        
        elif tipo in ['stl', 'ply']:
            recomendaciones.append("Considerar convertir a GLTF para mejor compatibilidad web")
        
        # Recomendaciones basadas en problemas
        for problema in self.resultados['problemas_formato']:
            if 'no encontrado' in problema:
                recomendaciones.append("Verificar que todos los archivos dependientes estén presentes")
            elif 'grande' in problema:
                recomendaciones.append("Optimizar geometría o usar compresión para reducir tamaño")
            elif 'incompatible' in problema:
                recomendaciones.append("Convertir a un formato más reciente y compatible")
        
        # Recomendaciones generales
        if self.resultados['caracteristicas'].get('tamaño_archivo', 0) > 10 * 1024 * 1024:
            recomendaciones.append("Archivo muy grande, considerar optimización o compresión")
        
        self.resultados['recomendaciones'] = list(set(recomendaciones))
    
    def _calcular_puntuacion(self):
        """Calcula puntuación de calidad del formato."""
        puntuacion = 10.0  # Puntuación máxima
        
        # Penalizaciones por problemas
        penalizaciones = []
        
        # Penalización por problemas de formato
        penalizaciones.append(len(self.resultados['problemas_formato']) * 0.5)
        
        # Penalización por dependencias externas (solo para GLTF)
        if self.resultados.get('caracteristicas', {}).get('tipo') == 'gltf':
            penalizaciones.append(len(self.resultados.get('dependencias', [])) * 0.2)
        
        # Penalización por problemas de compatibilidad
        if not self.resultados.get('compatibilidad', {}).get('web_gl', True):
            penalizaciones.append(2.0)
        
        # Bonificación por optimizaciones detectadas
        bonificaciones = []
        if self.resultados.get('optimizaciones', {}).get('compresion', False):
            bonificaciones.append(0.5)
        
        # Calcular puntuación final
        puntuacion_final = max(0.0, puntuacion - sum(penalizaciones) + sum(bonificaciones))
        self.resultados['puntuacion'] = round(puntuacion_final, 2)
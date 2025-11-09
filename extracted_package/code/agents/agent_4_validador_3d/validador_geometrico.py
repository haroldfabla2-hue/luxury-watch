#!/usr/bin/env python3
"""
Validador Geométrico
===================

Módulo especializado en la validación de integridad geométrica de modelos 3D.
Detecta agujeros, problemas de topología, normales invertidas y otros problemas geométricos.
"""

import numpy as np
import open3d as o3d
from pathlib import Path
from typing import Dict, List, Tuple, Optional, Any
import logging
import warnings

warnings.filterwarnings('ignore', category=FutureWarning)

class ValidadorGeometrico:
    """
    Validador de integridad geométrica para modelos 3D.
    Utiliza Open3D para análisis geométrico profundo.
    """
    
    def __init__(self, config: Dict = None):
        """
        Inicializa el validador geométrico.
        
        Args:
            config: Configuración del validador
        """
        self.config = config or {}
        self.logger = logging.getLogger('ValidadorGeometrico')
        
        # Parámetros de configuración
        self.tolerancia_agujeros = self.config.get('tolerancia_agujeros', 0.01)
        self.normal_threshold = self.config.get('normal_threshold', 0.1)
        self.min_triangulos = self.config.get('min_triangulos', 100)
        self.max_degenerados = self.config.get('max_degenerados', 100)
        
        self.resultados = {
            'puntuacion': 0.0,
            'agujeros_detectados': 0,
            'normales_invertidas': 0,
            'triangulos_degenerados': 0,
            'componentes_desconectadas': 0,
            'vertice_duplicados': 0,
            'problemas_topologicos': [],
            'estadisticas': {},
            'analisis_detallado': {}
        }
    
    def validar(self, ruta_archivo: str) -> Dict:
        """
        Valida la integridad geométrica de un archivo 3D.
        
        Args:
            ruta_archivo: Ruta al archivo 3D
            
        Returns:
            Dict: Resultados de la validación geométrica
        """
        try:
            self.logger.info(f"Validando geometría de: {ruta_archivo}")
            
            # Cargar modelo 3D
            mesh = self._cargar_modelo(ruta_archivo)
            if mesh is None:
                self.resultados['error'] = "No se pudo cargar el modelo"
                return self.resultados
            
            # Verificar que sea una malla válida
            if not self._es_malla_valida(mesh):
                self.resultados['error'] = "El archivo no contiene una malla válida"
                return self.resultados
            
            # Realizar validaciones específicas
            self._detectar_agujeros(mesh)
            self._validar_normales(mesh)
            self._detectar_triangulos_degenerados(mesh)
            self._analizar_conectividad(mesh)
            self._detectar_vertices_duplicados(mesh)
            self._analizar_topologia(mesh)
            
            # Calcular estadísticas
            self._calcular_estadisticas(mesh)
            
            # Calcular puntuación final
            self._calcular_puntuacion()
            
            self.logger.info(f"Validación geométrica completada. Puntuación: {self.resultados['puntuacion']:.2f}")
            return self.resultados
            
        except Exception as e:
            self.logger.error(f"Error en validación geométrica: {str(e)}")
            self.resultados['error'] = str(e)
            return self.resultados
    
    def _cargar_modelo(self, ruta_archivo: str) -> Optional[o3d.geometry.TriangleMesh]:
        """
        Carga un modelo 3D según su formato.
        
        Args:
            ruta_archivo: Ruta al archivo 3D
            
        Returns:
            TriangleMesh: Malla cargada o None si hay error
        """
        extension = Path(ruta_archivo).suffix.lower()
        
        try:
            if extension == '.obj':
                mesh = o3d.io.read_triangle_mesh(ruta_archivo)
            elif extension == '.ply':
                mesh = o3d.io.read_triangle_mesh(ruta_archivo)
            elif extension == '.gltf':
                mesh = self._cargar_gltf(ruta_archivo)
            elif extension == '.glb':
                mesh = self._cargar_glb(ruta_archivo)
            else:
                self.logger.warning(f"Formato no soportado: {extension}")
                return None
            
            return mesh
            
        except Exception as e:
            self.logger.error(f"Error cargando modelo: {str(e)}")
            return None
    
    def _cargar_gltf(self, ruta_archivo: str) -> Optional[o3d.geometry.TriangleMesh]:
        """Carga archivo GLTF."""
        try:
            import pygltflib
            # Implementación básica para GLTF
            return o3d.io.read_triangle_mesh(ruta_archivo)
        except ImportError:
            self.logger.warning("pygltflib no disponible, intentando lectura directa")
            return o3d.io.read_triangle_mesh(ruta_archivo)
    
    def _cargar_glb(self, ruta_archivo: str) -> Optional[o3d.geometry.TriangleMesh]:
        """Carga archivo GLB."""
        try:
            return o3d.io.read_triangle_mesh(ruta_archivo)
        except Exception as e:
            self.logger.error(f"Error cargando GLB: {str(e)}")
            return None
    
    def _es_malla_valida(self, mesh: o3d.geometry.TriangleMesh) -> bool:
        """Verifica si la malla es válida para validación."""
        if mesh is None:
            return False
        
        if len(mesh.triangles) == 0:
            return False
        
        if len(mesh.vertices) < self.min_triangulos:
            return False
        
        return True
    
    def _detectar_agujeros(self, mesh: o3d.geometry.TriangleMesh):
        """Detecta agujeros en la malla."""
        try:
            # Obtener bordes de la malla
            edges = mesh.get_edge_list()
            triangles = np.asarray(mesh.triangles)
            
            # Contar aristas únicas
            aristas = set()
            for tri in triangles:
                for i in range(3):
                    v1, v2 = tri[i], tri[(i + 1) % 3]
                    arista = tuple(sorted([v1, v2]))
                    aristas.add(arista)
            
            # Obtener aristas de los triángulos
            aristas_triangulo = set()
            for tri in triangles:
                for i in range(3):
                    v1, v2 = tri[i], tri[(i + 1) % 3]
                    arista = tuple(sorted([v1, v2]))
                    aristas_triangulo.add(arista)
            
            # Aristas que no pertenecen a dos triángulos (bordes)
            bordes = aristas - aristas_triangulo
            
            # Análisis de agujeros basado en bordes
            self.resultados['agujeros_detectados'] = len(bordes) // 3  # Estimación
            
            # Información adicional
            self.resultados['analisis_detallado']['bordes_detectados'] = len(bordes)
            
        except Exception as e:
            self.logger.error(f"Error detectando agujeros: {str(e)}")
    
    def _validar_normales(self, mesh: o3d.geometry.TriangleMesh):
        """Valida las normales de la malla."""
        try:
            # Calcular normales si no existen
            if not mesh.has_vertex_normals():
                mesh.compute_vertex_normals()
            
            # Verificar orientación de normales
            triangulos = np.asarray(mesh.triangles)
            vertices = np.asarray(mesh.vertices)
            normales = np.asarray(mesh.vertex_normals)
            
            normales_invertidas = 0
            
            for tri in triangulos:
                # Vértices del triángulo
                v1, v2, v3 = vertices[tri]
                
                # Normal del triángulo
                edge1 = v2 - v1
                edge2 = v3 - v1
                normal_triangulo = np.cross(edge1, edge2)
                normal_triangulo = normal_triangulo / np.linalg.norm(normal_triangulo)
                
                # Verificar orientación de normales de vértices
                for i, vert_idx in enumerate(tri):
                    normal_vert = normales[vert_idx]
                    if len(normal_vert) > 0:
                        # Comparar con normal del triángulo
                        dot_product = np.dot(normal_vert, normal_triangulo)
                        if dot_product < 0:  # Normal invertida
                            normales_invertidas += 1
                            break
            
            self.resultados['normales_invertidas'] = normales_invertidas
            total_vertices = len(vertices)
            porcentaje_invertidas = (normales_invertidas / total_vertices) * 100 if total_vertices > 0 else 0
            self.resultados['analisis_detallado']['porcentaje_normales_invertidas'] = porcentaje_invertidas
            
        except Exception as e:
            self.logger.error(f"Error validando normales: {str(e)}")
    
    def _detectar_triangulos_degenerados(self, mesh: o3d.geometry.TriangleMesh):
        """Detecta triángulos degenerados."""
        try:
            triangulos = np.asarray(mesh.triangles)
            vertices = np.asarray(mesh.vertices)
            
            triangulos_degenerados = 0
            area_minima = float('inf')
            
            for tri in triangulos:
                v1, v2, v3 = vertices[tri]
                
                # Calcular área del triángulo
                edge1 = v2 - v1
                edge2 = v3 - v1
                area = 0.5 * np.linalg.norm(np.cross(edge1, edge2))
                
                if area < self.tolerancia_agujeros:
                    triangulos_degenerados += 1
                
                area_minima = min(area_minima, area)
            
            self.resultados['triangulos_degenerados'] = triangulos_degenerados
            self.resultados['analisis_detallado']['area_minima_triangulo'] = area_minima
            
        except Exception as e:
            self.logger.error(f"Error detectando triángulos degenerados: {str(e)}")
    
    def _analizar_conectividad(self, mesh: o3d.geometry.TriangleMesh):
        """Analiza la conectividad de la malla."""
        try:
            # Crear grafo de conectividad
            adjacency_list = mesh.adjacency_list
            vertices_visitados = set()
            componentes = 0
            
            for vertice_inicial in range(len(mesh.vertices)):
                if vertice_inicial not in vertices_visitados:
                    # Búsqueda DFS
                    stack = [vertice_inicial]
                    while stack:
                        v = stack.pop()
                        if v not in vertices_visitados:
                            vertices_visitados.add(v)
                            for neighbor in adjacency_list[v]:
                                if neighbor not in vertices_visitados:
                                    stack.append(neighbor)
                    componentes += 1
            
            self.resultados['componentes_desconectadas'] = componentes - 1  # -1 porque el componente principal no cuenta
            
        except Exception as e:
            self.logger.error(f"Error analizando conectividad: {str(e)}")
    
    def _detectar_vertices_duplicados(self, mesh: o3d.geometry.TriangleMesh):
        """Detecta vértices duplicados."""
        try:
            vertices = np.asarray(mesh.vertices)
            tolerancia = self.tolerancia_agujeros
            
            # Agrupar vértices similares
            vertices_unicos = []
            indices_duplicados = set()
            
            for i, vertice in enumerate(vertices):
                if i not in indices_duplicados:
                    # Buscar vértices similares
                    for j, otro_vertice in enumerate(vertices[i+1:], start=i+1):
                        if j not in indices_duplicados:
                            distancia = np.linalg.norm(vertice - otro_vertice)
                            if distancia < tolerancia:
                                indices_duplicados.add(j)
                    
                    vertices_unicos.append(vertice)
            
            self.resultados['vertice_duplicados'] = len(indices_duplicados)
            
        except Exception as e:
            self.logger.error(f"Error detectando vértices duplicados: {str(e)}")
    
    def _analizar_topologia(self, mesh: o3d.geometry.TriangleMesh):
        """Análisis detallado de topología."""
        try:
            # Característica de Euler para superficies cerradoas
            V = len(mesh.vertices)
            E = len(mesh.get_edge_list())
            F = len(mesh.triangles)
            
            caracteristica_euler = V - E + F
            
            # Análisis de varianza de ángulos
            triangulos = np.asarray(mesh.triangles)
            vertices = np.asarray(mesh.vertices)
            
            angulos = []
            for tri in triangulos:
                v1, v2, v3 = vertices[tri]
                
                # Ángulos del triángulo
                a = np.linalg.norm(v2 - v3)
                b = np.linalg.norm(v1 - v3)
                c = np.linalg.norm(v1 - v2)
                
                # Ley de cosenos para ángulos
                try:
                    angle_a = np.arccos((b*b + c*c - a*a) / (2*b*c))
                    angle_b = np.arccos((a*a + c*c - b*b) / (2*a*c))
                    angle_c = np.arccos((a*a + b*b - c*c) / (2*a*b))
                    
                    angulos.extend([angle_a, angle_b, angle_c])
                except:
                    continue
            
            if angulos:
                angulos_rad = np.array(angulos)
                angulos_deg = np.degrees(angulos_rad)
                varianza_angulos = np.var(angulos_deg)
                
                self.resultados['problemas_topologicos'] = []
                
                # Problemas potenciales basados en análisis
                if caracteristica_euler != 2:  # Para esfera
                    self.resultados['problemas_topologicos'].append("Característica de Euler anómala")
                
                if varianza_angulos > 100:  # Alta varianza indica topología irregular
                    self.resultados['problemas_topologicos'].append("Alta varianza en ángulos")
                
                self.resultados['analisis_detallado']['caracteristica_euler'] = caracteristica_euler
                self.resultados['analisis_detallado']['varianza_angulos'] = varianza_angulos
                self.resultados['analisis_detallado']['angulo_promedio'] = np.mean(angulos_deg)
            
        except Exception as e:
            self.logger.error(f"Error analizando topología: {str(e)}")
    
    def _calcular_estadisticas(self, mesh: o3d.geometry.TriangleMesh):
        """Calcula estadísticas generales de la malla."""
        try:
            vertices = np.asarray(mesh.vertices)
            triangulos = np.asarray(mesh.triangles)
            
            # Estadísticas básicas
            self.resultados['estadisticas'] = {
                'num_vertices': len(vertices),
                'num_triangulos': len(triangulos),
                'ratio_triangulos_vertices': len(triangulos) / len(vertices) if len(vertices) > 0 else 0,
                'volumen_aproximado': self._calcular_volumen_aproximado(mesh),
                'area_superficie': mesh.get_surface_area(),
                'radius_medio': self._calcular_radius_medio(vertices),
                'densidad_triangulos': self._calcular_densidad_triangulos(mesh)
            }
            
        except Exception as e:
            self.logger.error(f"Error calculando estadísticas: {str(e)}")
    
    def _calcular_volumen_aproximado(self, mesh: o3d.geometry.TriangleMesh) -> float:
        """Calcula volumen aproximado de la malla."""
        try:
            # Método aproximado usando bounding box
            vertices = np.asarray(mesh.vertices)
            bounds = mesh.get_axis_aligned_bounding_box()
            
            extents = bounds.get_extent()
            volumen = extents[0] * extents[1] * extents[2]
            
            return volumen
            
        except Exception:
            return 0.0
    
    def _calcular_radius_medio(self, vertices: np.ndarray) -> float:
        """Calcula el radio medio desde el centroide."""
        try:
            if len(vertices) == 0:
                return 0.0
            
            centroide = np.mean(vertices, axis=0)
            distancias = np.linalg.norm(vertices - centroide, axis=1)
            
            return np.mean(distancias)
            
        except Exception:
            return 0.0
    
    def _calcular_densidad_triangulos(self, mesh: o3d.geometry.TriangleMesh) -> float:
        """Calcula densidad de triángulos."""
        try:
            area_total = mesh.get_surface_area()
            triangulos = len(mesh.triangles)
            
            if area_total > 0:
                return triangulos / area_total
            return 0.0
            
        except Exception:
            return 0.0
    
    def _calcular_puntuacion(self):
        """Calcula puntuación de calidad geométrica."""
        puntuacion = 10.0  # Puntuación máxima
        
        # Penalizaciones por problemas
        penalizaciones = []
        
        # Agujeros detectados
        if self.resultados['agujeros_detectados'] > 0:
            penalizacion = min(self.resultados['agujeros_detectados'] * 0.5, 3.0)
            penalizaciones.append(penalizacion)
        
        # Normales invertidas
        total_vertices = self.resultados['estadisticas'].get('num_vertices', 1)
        porcentaje_invertidas = (self.resultados['normales_invertidas'] / total_vertices) * 100
        if porcentaje_invertidas > 5:
            penalizacion = min(porcentaje_invertidas * 0.02, 2.0)
            penalizaciones.append(penalizacion)
        
        # Triángulos degenerados
        if self.resultados['triangulos_degenerados'] > 0:
            penalizacion = min(self.resultados['triangulos_degenerados'] * 0.1, 1.5)
            penalizaciones.append(penalizacion)
        
        # Componentes desconectadas
        if self.resultados['componentes_desconectadas'] > 0:
            penalizacion = min(self.resultados['componentes_desconectadas'] * 0.3, 2.0)
            penalizaciones.append(penalizacion)
        
        # Vértices duplicados
        if self.resultados['vertice_duplicados'] > 0:
            penalizacion = min(self.resultados['vertice_duplicados'] * 0.05, 1.0)
            penalizaciones.append(penalizacion)
        
        # Problemas topológicos
        penalizaciones.append(len(self.resultados['problemas_topologicos']) * 0.2)
        
        # Calcular puntuación final
        puntuacion_final = max(0.0, puntuacion - sum(penalizaciones))
        self.resultados['puntuacion'] = round(puntuacion_final, 2)
    
    def obtener_recomendaciones(self) -> List[str]:
        """Obtiene recomendaciones específicas basadas en los problemas detectados."""
        recomendaciones = []
        
        if self.resultados['agujeros_detectados'] > 0:
            recomendaciones.append(f"Sellar {self.resultados['agujeros_detectados']} agujeros detectados")
        
        if self.resultados['normales_invertidas'] > 0:
            recomendaciones.append("Recalcular normales de vértices")
        
        if self.resultados['triangulos_degenerados'] > 0:
            recomendaciones.append(f"Eliminar {self.resultados['triangulos_degenerados']} triángulos degenerados")
        
        if self.resultados['componentes_desconectadas'] > 0:
            recomendaciones.append(f"Unificar {self.resultados['componentes_desconectadas']} componentes desconectadas")
        
        if self.resultados['vertice_duplicados'] > 0:
            recomendaciones.append(f"Remover {self.resultados['vertice_duplicados']} vértices duplicados")
        
        return recomendaciones
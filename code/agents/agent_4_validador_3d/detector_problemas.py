#!/usr/bin/env python3
"""
Detector de Problemas
====================

Módulo especializado en la detección automática de problemas comunes en modelos 3D.
Identifica issues de geometría, texturas, materiales, animación y compatibilidad.
"""

import numpy as np
import open3d as o3d
from pathlib import Path
from typing import Dict, List, Tuple, Optional, Any
import logging
import json
import cv2
from PIL import Image
import warnings

warnings.filterwarnings('ignore', category=FutureWarning)

class DetectorProblemas:
    """
    Detector automático de problemas en modelos 3D.
    """
    
    def __init__(self, config: Dict = None):
        """
        Inicializa el detector de problemas.
        
        Args:
            config: Configuración del detector
        """
        self.config = config or {}
        self.logger = logging.getLogger('DetectorProblemas')
        
        # Configuración de severidad
        self.severidad_minima = self.config.get('severidad_minima', 0.3)
        self.tolerancia_geometrica = self.config.get('tolerancia_geometrica', 0.01)
        self.umbral_normales = self.config.get('umbral_normales', 0.1)
        
        # Definición de tipos de problemas
        self.tipos_problemas = {
            'geometrico': {
                'agujeros_detectados': self._detectar_agujeros,
                'normales_invertidas': self._detectar_normales_invertidas,
                'triangulos_degenerados': self._detectar_triangulos_degenerados,
                'vertice_duplicados': self._detectar_vertices_duplicados,
                'componentes_desconectadas': self._detectar_componentes_desconectadas,
                'topologia_problematica': self._detectar_problemas_topologia
            },
            'texturas': {
                'resolucion_baja': self._detectar_resolucion_baja,
                'mapeado_uv_incorrecto': self._detectar_problemas_uv,
                'compresion_excesiva': self._detectar_compresion_excesiva,
                'formatos_inconsistentes': self._detectar_formatos_inconsistentes,
                'texturas_faltantes': self._detectar_texturas_faltantes
            },
            'materiales': {
                'materiales_sin_usar': self._detectar_materiales_sin_usar,
                'propiedades_invalidas': self._detectar_propiedades_invalidas,
                'texturas_faltantes_material': self._detectar_texturas_faltantes_material
            },
            'rendimiento': {
                'demasiados_poligonos': self._detectar_exceso_poligonos,
                'Jerarquia_compleja': self._detectar_jerarquia_compleja,
                'animaciones_innecesarias': self._detectar_animaciones_innecesarias
            },
            'compatibilidad': {
                'formato_obsoleto': self._detectar_formato_obsoleto,
                'caracteristicas_no_soportadas': self._detectar_caracteristicas_no_soportadas,
                'dependencias_externas': self._detectar_dependencias_externas
            }
        }
        
        self.problemas_detectados = []
    
    def detectar(self, resultados_validadores: Dict) -> List[Dict]:
        """
        Detecta problemas basándose en los resultados de los validadores.
        
        Args:
            resultados_validadores: Resultados de todos los validadores
            
        Returns:
            List[Dict]: Lista de problemas detectados
        """
        try:
            self.logger.info("Iniciando detección de problemas")
            
            self.problemas_detectados = []
            
            # Procesar cada tipo de validador
            for tipo_validador, validador_resultados in resultados_validadores.items():
                if tipo_validador in self.tipos_problemas:
                    problemas_tipo = self.tipos_problemas[tipo_validador]
                    
                    for nombre_problema, detector_func in problemas_tipo.items():
                        try:
                            problema = detector_func(validador_resultados)
                            if problema:
                                self.problemas_detectados.append(problema)
                        except Exception as e:
                            self.logger.error(f"Error detectando {nombre_problema}: {str(e)}")
            
            # Detectar problemas cross-validator (que requieren múltiples validadores)
            self._detectar_problemas_cross_validator(resultados_validadores)
            
            # Filtrar problemas por severidad
            self.problemas_detectados = [
                p for p in self.problemas_detectados 
                if p.get('severidad', 0) >= self.severidad_minima
            ]
            
            # Ordenar por severidad descendente
            self.problemas_detectados.sort(key=lambda x: x.get('severidad', 0), reverse=True)
            
            self.logger.info(f"Detección completada. {len(self.problemas_detectados)} problemas encontrados")
            return self.problemas_detectados
            
        except Exception as e:
            self.logger.error(f"Error general en detección de problemas: {str(e)}")
            return []
    
    def _detectar_agujeros(self, resultados_geometrico: Dict) -> Optional[Dict]:
        """Detecta agujeros en la malla."""
        try:
            if not isinstance(resultados_geometrico, dict):
                return None
            
            agujeros = resultados_geometrico.get('agujeros_detectados', 0)
            if agujeros > 0:
                severidad = min(agujeros * 0.1, 1.0)  # Escalar severidad
                
                return {
                    'tipo': 'geometrico',
                    'problema': 'agujeros_detectados',
                    'descripcion': f'Se detectaron {agujeros} agujeros en la malla',
                    'severidad': severidad,
                    'ubicacion': 'geometria',
                    'impacto': 'medium',
                    'solucion': 'Sellar agujeros usando herramientas de modelado 3D',
                    'auto_corregible': True,
                    'datos': {'num_agujeros': agujeros}
                }
            return None
            
        except Exception as e:
            self.logger.error(f"Error detectando agujeros: {str(e)}")
            return None
    
    def _detectar_normales_invertidas(self, resultados_geometrico: Dict) -> Optional[Dict]:
        """Detecta normales invertidas."""
        try:
            if not isinstance(resultados_geometrico, dict):
                return None
            
            normales_invertidas = resultados_geometrico.get('normales_invertidas', 0)
            total_vertices = resultados_geometrico.get('estadisticas', {}).get('num_vertices', 1)
            
            if total_vertices > 0:
                porcentaje_invertidas = (normales_invertidas / total_vertices) * 100
                
                if porcentaje_invertidas > 5:  # Más del 5% de normales invertidas
                    severidad = min(porcentaje_invertidas / 100, 1.0)
                    
                    return {
                        'tipo': 'geometrico',
                        'problema': 'normales_invertidas',
                        'descripcion': f'{porcentaje_invertidas:.1f}% de normales están invertidas',
                        'severidad': severidad,
                        'ubicacion': 'normales_vertices',
                        'impacto': 'low' if porcentaje_invertidas < 20 else 'medium',
                        'solucion': 'Recalcular normales o usar función "Recalculate Outside"',
                        'auto_corregible': True,
                        'datos': {
                            'normales_invertidas': normales_invertidas,
                            'total_vertices': total_vertices,
                            'porcentaje': porcentaje_invertidas
                        }
                    }
            return None
            
        except Exception as e:
            self.logger.error(f"Error detectando normales invertidas: {str(e)}")
            return None
    
    def _detectar_triangulos_degenerados(self, resultados_geometrico: Dict) -> Optional[Dict]:
        """Detecta triángulos degenerados."""
        try:
            if not isinstance(resultados_geometrico, dict):
                return None
            
            triangulos_degenerados = resultados_geometrico.get('triangulos_degenerados', 0)
            total_triangulos = resultados_geometrico.get('estadisticas', {}).get('num_triangulos', 1)
            
            if total_triangulos > 0:
                porcentaje_degenerados = (triangulos_degenerados / total_triangulos) * 100
                
                if triangulos_degenerados > 0:
                    severidad = min(triangulos_degenerados / 100, 1.0)  # Escalar
                    
                    return {
                        'tipo': 'geometrico',
                        'problema': 'triangulos_degenerados',
                        'descripcion': f'{triangulos_degenerados} triángulos degenerados ({porcentaje_degenerados:.1f}%)',
                        'severidad': severidad,
                        'ubicacion': 'topologia',
                        'impacto': 'medium',
                        'solucion': 'Eliminar triángulos degenerados y remallar',
                        'auto_corregible': True,
                        'datos': {
                            'triangulos_degenerados': triangulos_degenerados,
                            'total_triangulos': total_triangulos,
                            'porcentaje': porcentaje_degenerados
                        }
                    }
            return None
            
        except Exception as e:
            self.logger.error(f"Error detectando triángulos degenerados: {str(e)}")
            return None
    
    def _detectar_vertices_duplicados(self, resultados_geometrico: Dict) -> Optional[Dict]:
        """Detecta vértices duplicados."""
        try:
            if not isinstance(resultados_geometrico, dict):
                return None
            
            vertices_duplicados = resultados_geometrico.get('vertice_duplicados', 0)
            
            if vertices_duplicados > 10:  # Threshold más alto
                severidad = min(vertices_duplicados / 1000, 0.8)  # Escalar
                
                return {
                    'tipo': 'geometrico',
                    'problema': 'vertice_duplicados',
                    'descripcion': f'{vertices_duplicados} vértices duplicados detectados',
                    'severidad': severidad,
                    'ubicacion': 'geometria',
                    'impacto': 'low',
                    'solucion': 'Ejecutar función "Remove Doubles" o "Merge Vertices"',
                    'auto_corregible': True,
                    'datos': {'vertices_duplicados': vertices_duplicados}
                }
            return None
            
        except Exception as e:
            self.logger.error(f"Error detectando vértices duplicados: {str(e)}")
            return None
    
    def _detectar_componentes_desconectadas(self, resultados_geometrico: Dict) -> Optional[Dict]:
        """Detecta componentes desconectadas."""
        try:
            if not isinstance(resultados_geometrico, dict):
                return None
            
            componentes = resultados_geometrico.get('componentes_desconectadas', 0)
            
            if componentes > 1:
                severidad = min(componentes / 10, 0.9)  # Escalar
                
                return {
                    'tipo': 'geometrico',
                    'problema': 'componentes_desconectadas',
                    'descripcion': f'{componentes} componentes desconectadas encontradas',
                    'severidad': severidad,
                    'ubicacion': 'conectividad',
                    'impacto': 'medium',
                    'solucion': 'Unificar componentes o verificar intención del diseño',
                    'auto_corregible': False,
                    'datos': {'componentes_desconectadas': componentes}
                }
            return None
            
        except Exception as e:
            self.logger.error(f"Error detectando componentes desconectadas: {str(e)}")
            return None
    
    def _detectar_problemas_topologia(self, resultados_geometrico: Dict) -> Optional[Dict]:
        """Detecta problemas de topología."""
        try:
            if not isinstance(resultados_geometrico, dict):
                return None
            
            problemas = resultados_geometrico.get('problemas_topologicos', [])
            
            if problemas:
                # Determinar severidad basada en el tipo de problemas
                severidad_criticos = sum(1 for p in problemas if 'euler' in p.lower())
                severidad_normales = len(problemas) - severidad_criticos
                
                severidad = min((severidad_criticos * 0.8 + severidad_normales * 0.3) / len(problemas), 1.0)
                
                return {
                    'tipo': 'geometrico',
                    'problema': 'topologia_problematica',
                    'descripcion': f'Problemas de topología detectados: {", ".join(problemas)}',
                    'severidad': severidad,
                    'ubicacion': 'topologia',
                    'impacto': 'medium',
                    'solucion': 'Revisar y corregir estructura topológica',
                    'auto_corregible': False,
                    'datos': {'problemas_topologicos': problemas}
                }
            return None
            
        except Exception as e:
            self.logger.error(f"Error detectando problemas de topología: {str(e)}")
            return None
    
    def _detectar_resolucion_baja(self, resultados_texturas: Dict) -> Optional[Dict]:
        """Detecta texturas con resolución baja."""
        try:
            if not isinstance(resultados_texturas, dict):
                return None
            
            resoluciones = resultados_texturas.get('resoluciones', {})
            texturas_baja_res = []
            
            for textura, res in resoluciones.items():
                if isinstance(res, dict):
                    ancho = res.get('ancho', 0)
                    alto = res.get('alto', 0)
                    if min(ancho, alto) < 512:  # Resolución mínima recomendada
                        texturas_baja_res.append(textura)
            
            if texturas_baja_res:
                severidad = min(len(texturas_baja_res) / 10, 1.0)
                
                return {
                    'tipo': 'texturas',
                    'problema': 'resolucion_baja',
                    'descripcion': f'{len(texturas_baja_res)} texturas con resolución inferior a 512x512',
                    'severidad': severidad,
                    'ubicacion': 'texturas',
                    'impacto': 'medium',
                    'solucion': 'Aumentar resolución de texturas o usar texturas de mayor calidad',
                    'auto_corregible': False,
                    'datos': {
                        'texturas_baja_res': len(texturas_baja_res),
                        'archivos': texturas_baja_res
                    }
                }
            return None
            
        except Exception as e:
            self.logger.error(f"Error detectando resolución baja: {str(e)}")
            return None
    
    def _detectar_problemas_uv(self, resultados_texturas: Dict) -> Optional[Dict]:
        """Detecta problemas en mapeado UV."""
        try:
            if not isinstance(resultados_texturas, dict):
                return None
            
            mapeado_uv = resultados_texturas.get('mapeado_uv', {})
            
            if isinstance(mapeado_uv, dict) and not mapeado_uv.get('valido', True):
                problemas_uv = mapeado_uv.get('problemas_detectados', [])
                
                if problemas_uv:
                    return {
                        'tipo': 'texturas',
                        'problema': 'mapeado_uv_incorrecto',
                        'descripcion': f'Problemas en mapeado UV: {", ".join(problemas_uv)}',
                        'severidad': 0.7,
                        'ubicacion': 'uv_mapping',
                        'impacto': 'high',
                        'solucion': 'Corregir mapeado UV y verificar unwrapping',
                        'auto_corregible': True,
                        'datos': {'problemas_uv': problemas_uv}
                    }
            return None
            
        except Exception as e:
            self.logger.error(f"Error detectando problemas UV: {str(e)}")
            return None
    
    def _detectar_compresion_excesiva(self, resultados_texturas: Dict) -> Optional[Dict]:
        """Detecta compresión excesiva en texturas."""
        try:
            if not isinstance(resultados_texturas, dict):
                return None
            
            artifacts = resultados_texturas.get('artifacts_detectados', [])
            compression_artifacts = [a for a in artifacts if 'blocking' in a.lower() or 'banding' in a.lower()]
            
            if compression_artifacts:
                severidad = min(len(compression_artifacts) / 5, 1.0)
                
                return {
                    'tipo': 'texturas',
                    'problema': 'compresion_excesiva',
                    'descripcion': f'Artifacts de compresión detectados: {", ".join(compression_artifacts)}',
                    'severidad': severidad,
                    'ubicacion': 'texturas_compresion',
                    'impacto': 'low' if len(compression_artifacts) < 3 else 'medium',
                    'solucion': 'Reducir compresión JPEG o usar formatos sin pérdida',
                    'auto_corregible': False,
                    'datos': {'artifacts_compresion': compression_artifacts}
                }
            return None
            
        except Exception as e:
            self.logger.error(f"Error detectando compresión excesiva: {str(e)}")
            return None
    
    def _detectar_formatos_inconsistentes(self, resultados_texturas: Dict) -> Optional[Dict]:
        """Detecta formatos de textura inconsistentes."""
        try:
            if not isinstance(resultados_texturas, dict):
                return None
            
            formatos = resultados_texturas.get('formatos', {})
            if isinstance(formatos, dict):
                extensiones = [f.get('extension', '') for f in formatos.values()]
                extensiones_unicas = set(extensiones)
                
                if len(extensiones_unicas) > 2:
                    return {
                        'tipo': 'texturas',
                        'problema': 'formatos_inconsistentes',
                        'descripcion': f'Formatos de textura mixtos: {", ".join(extensiones_unicas)}',
                        'severidad': 0.4,
                        'ubicacion': 'formato_texturas',
                        'impacto': 'low',
                        'solucion': 'Unificar formatos de textura para consistencia',
                        'auto_corregible': False,
                        'datos': {'formatos_detectados': list(extensiones_unicas)}
                    }
            return None
            
        except Exception as e:
            self.logger.error(f"Error detectando formatos inconsistentes: {str(e)}")
            return None
    
    def _detectar_texturas_faltantes(self, resultados_texturas: Dict) -> Optional[Dict]:
        """Detecta texturas faltantes."""
        try:
            if not isinstance(resultados_texturas, dict):
                return None
            
            problemas = resultados_texturas.get('problemas_texturas', [])
            texturas_no_encontradas = [p for p in problemas if 'no encontrada' in p.lower()]
            
            if texturas_no_encontradas:
                severidad = min(len(texturas_no_encontradas) / 5, 1.0)
                
                return {
                    'tipo': 'texturas',
                    'problema': 'texturas_faltantes',
                    'descripcion': f'{len(texturas_no_encontradas)} texturas de referencia no encontradas',
                    'severidad': severidad,
                    'ubicacion': 'texturas_referencias',
                    'impacto': 'high',
                    'solucion': 'Verificar rutas de texturas y asegurar que los archivos estén disponibles',
                    'auto_corregible': False,
                    'datos': {'texturas_faltantes': len(texturas_no_encontradas)}
                }
            return None
            
        except Exception as e:
            self.logger.error(f"Error detectando texturas faltantes: {str(e)}")
            return None
    
    def _detectar_materiales_sin_usar(self, resultados_formato: Dict) -> Optional[Dict]:
        """Detecta materiales no utilizados."""
        try:
            if not isinstance(resultados_formato, dict):
                return None
            
            caracteristicas = resultados_formato.get('caracteristicas', {})
            num_materials = caracteristicas.get('num_materials', 0)
            
            if num_materials > 10:  # Muchas materiales pueden indicar algunos no utilizados
                severidad = min((num_materials - 5) / 20, 0.6)  # Escalar
                
                return {
                    'tipo': 'materiales',
                    'problema': 'materiales_sin_usar',
                    'descripcion': f'Número alto de materiales ({num_materials}) puede incluir materiales sin usar',
                    'severidad': severidad,
                    'ubicacion': 'materiales',
                    'impacto': 'low',
                    'solucion': 'Revisar y limpiar materiales no utilizados',
                    'auto_corregible': False,
                    'datos': {'num_materials': num_materials}
                }
            return None
            
        except Exception as e:
            self.logger.error(f"Error detectando materiales sin usar: {str(e)}")
            return None
    
    def _detectar_propiedades_invalidas(self, resultados_formato: Dict) -> Optional[Dict]:
        """Detecta propiedades inválidas en materiales."""
        try:
            if not isinstance(resultados_formato, dict):
                return None
            
            problemas_formato = resultados_formato.get('problemas_formato', [])
            propiedades_invalidas = [p for p in problemas_formato if 'material' in p.lower()]
            
            if propiedades_invalidas:
                severidad = min(len(propiedades_invalidas) / 5, 1.0)
                
                return {
                    'tipo': 'materiales',
                    'problema': 'propiedades_invalidas',
                    'descripcion': f'Propiedades de material inválidas: {", ".join(propiedades_invalidas)}',
                    'severidad': severidad,
                    'ubicacion': 'propiedades_material',
                    'impacto': 'medium',
                    'solucion': 'Corregir propiedades de material y verificar sintaxis',
                    'auto_corregible': False,
                    'datos': {'problemas_propiedades': propiedades_invalidas}
                }
            return None
            
        except Exception as e:
            self.logger.error(f"Error detectando propiedades inválidas: {str(e)}")
            return None
    
    def _detectar_texturas_faltantes_material(self, resultados_formato: Dict) -> Optional[Dict]:
        """Detecta texturas faltantes para materiales."""
        try:
            if not isinstance(resultados_formato, dict):
                return None
            
            dependencias = resultados_formato.get('dependencias', [])
            
            # Buscar archivos de imagen en dependencias
            texturas_dependientes = [d for d in dependencias if Path(d).suffix.lower() in ['.png', '.jpg', '.jpeg', '.tga']]
            
            if texturas_dependientes:
                # Verificar si faltan texturas críticas (diffuse, normal, etc.)
                texturas_criticas = [t for t in texturas_dependientes if any(keyword in Path(t).name.lower() 
                                              for keyword in ['diffuse', 'albedo', 'normal', 'bump'])]
                
                if len(texturas_criticas) == 0 and len(texturas_dependientes) > 0:
                    return {
                        'tipo': 'materiales',
                        'problema': 'texturas_faltantes_material',
                        'descripcion': 'Faltan texturas críticas para materiales (diffuse, normal, etc.)',
                        'severidad': 0.6,
                        'ubicacion': 'texturas_material',
                        'impacto': 'medium',
                        'solucion': 'Añadir texturas esenciales para materiales',
                        'auto_corregible': False,
                        'datos': {'dependencias_texturas': texturas_dependientes}
                    }
            return None
            
        except Exception as e:
            self.logger.error(f"Error detectando texturas faltantes de material: {str(e)}")
            return None
    
    def _detectar_exceso_poligonos(self, resultados_formato: Dict) -> Optional[Dict]:
        """Detecta exceso de polígonos."""
        try:
            if not isinstance(resultados_formato, dict):
                return None
            
            caracteristicas = resultados_formato.get('caracteristicas', {})
            num_meshes = caracteristicas.get('num_meshes', 0)
            num_vertices = resultados_formato.get('validadores', {}).get('geometrico', {}).get('estadisticas', {}).get('num_vertices', 0)
            
            if num_vertices > 100000:  # Más de 100k vértices
                severidad = min((num_vertices - 50000) / 500000, 1.0)
                
                return {
                    'tipo': 'rendimiento',
                    'problema': 'demasiados_poligonos',
                    'descripcion': f'Alto número de vértices ({num_vertices:,}) puede afectar rendimiento',
                    'severidad': severidad,
                    'ubicacion': 'geometria',
                    'impacto': 'high',
                    'solucion': 'Aplicar nivel de detalle (LOD) o simplificar geometría',
                    'auto_corregible': False,
                    'datos': {'num_vertices': num_vertices, 'num_meshes': num_meshes}
                }
            return None
            
        except Exception as e:
            self.logger.error(f"Error detectando exceso de polígonos: {str(e)}")
            return None
    
    def _detectar_jerarquia_compleja(self, resultados_formato: Dict) -> Optional[Dict]:
        """Detecta jerarquía de nodos muy compleja."""
        try:
            if not isinstance(resultados_formato, dict):
                return None
            
            caracteristicas = resultados_formato.get('caracteristicas', {})
            num_nodes = caracteristicas.get('num_nodes', 0)
            
            if num_nodes > 1000:  # Más de 1000 nodos
                severidad = min((num_nodes - 500) / 2000, 0.8)
                
                return {
                    'tipo': 'rendimiento',
                    'problema': 'jerarquia_compleja',
                    'descripcion': f'Jerarquía muy compleja con {num_nodes} nodos',
                    'severidad': severidad,
                    'ubicacion': 'jerarquia',
                    'impacto': 'medium',
                    'solucion': 'Simplificar jerarquía o agrupar objetos relacionados',
                    'auto_corregible': False,
                    'datos': {'num_nodes': num_nodes}
                }
            return None
            
        except Exception as e:
            self.logger.error(f"Error detectando jerarquía compleja: {str(e)}")
            return None
    
    def _detectar_animaciones_innecesarias(self, resultados_formato: Dict) -> Optional[Dict]:
        """Detecta animaciones innecesarias."""
        try:
            if not isinstance(resultados_formato, dict):
                return None
            
            caracteristicas = resultados_formato.get('caracteristicas', {})
            tiene_animaciones = caracteristicas.get('animaciones', False)
            
            if tiene_animaciones:
                return {
                    'tipo': 'rendimiento',
                    'problema': 'animaciones_innecesarias',
                    'descripcion': 'El modelo contiene animaciones que pueden no ser necesarias para todos los usos',
                    'severidad': 0.3,
                    'ubicacion': 'animaciones',
                    'impacto': 'low',
                    'solucion': 'Considerar crear versiones con y sin animaciones',
                    'auto_corregible': False,
                    'datos': {'tiene_animaciones': True}
                }
            return None
            
        except Exception as e:
            self.logger.error(f"Error detectando animaciones innecesarias: {str(e)}")
            return None
    
    def _detectar_formato_obsoleto(self, resultados_formato: Dict) -> Optional[Dict]:
        """Detecta formatos obsoletos."""
        try:
            if not isinstance(resultados_formato, dict):
                return None
            
            tipo = resultados_formato.get('caracteristicas', {}).get('tipo', '')
            
            formatos_obsoletos = ['dae', 'stl', 'ply']
            
            if tipo in formatos_obsoletos:
                return {
                    'tipo': 'compatibilidad',
                    'problema': 'formato_obsoleto',
                    'descripcion': f'Formato {tipo.upper()} es menos compatible con engines modernos',
                    'severidad': 0.6,
                    'ubicacion': 'formato_archivo',
                    'impacto': 'medium',
                    'solucion': 'Convertir a GLTF o GLB para mejor compatibilidad',
                    'auto_corregible': False,
                    'datos': {'formato_actual': tipo}
                }
            return None
            
        except Exception as e:
            self.logger.error(f"Error detectando formato obsoleto: {str(e)}")
            return None
    
    def _detectar_caracteristicas_no_soportadas(self, resultados_formato: Dict) -> Optional[Dict]:
        """Detecta características no soportadas por plataformas web."""
        try:
            if not isinstance(resultados_formato, dict):
                return None
            
            compatibilidad = resultados_formato.get('compatibilidad', {})
            problemas_compatibilidad = []
            
            for plataforma, compatible in compatibilidad.items():
                if not compatible:
                    problemas_compatibilidad.append(plataforma)
            
            if problemas_compatibilidad:
                return {
                    'tipo': 'compatibilidad',
                    'problema': 'caracteristicas_no_soportadas',
                    'descripcion': f'No compatible con: {", ".join(problemas_compatibilidad)}',
                    'severidad': 0.8,
                    'ubicacion': 'compatibilidad',
                    'impacto': 'high',
                    'solucion': 'Simplificar modelo o usar formatos más compatibles',
                    'auto_corregible': False,
                    'datos': {'plataformas_incompatibles': problemas_compatibilidad}
                }
            return None
            
        except Exception as e:
            self.logger.error(f"Error detectando características no soportadas: {str(e)}")
            return None
    
    def _detectar_dependencias_externas(self, resultados_formato: Dict) -> Optional[Dict]:
        """Detecta dependencias externas problemáticas."""
        try:
            if not isinstance(resultados_formato, dict):
                return None
            
            dependencias = resultados_formato.get('dependencias', [])
            
            if len(dependencias) > 5:  # Muchas dependencias externas
                severidad = min(len(dependencias) / 20, 0.7)
                
                return {
                    'tipo': 'compatibilidad',
                    'problema': 'dependencias_externas',
                    'descripcion': f'{len(dependencias)} dependencias externas pueden causar problemas de portabilidad',
                    'severidad': severidad,
                    'ubicacion': 'dependencias',
                    'impacto': 'medium',
                    'solucion': 'Embeber recursos o reducir dependencias externas',
                    'auto_corregible': True,
                    'datos': {'num_dependencias': len(dependencias), 'dependencias': dependencias}
                }
            return None
            
        except Exception as e:
            self.logger.error(f"Error detectando dependencias externas: {str(e)}")
            return None
    
    def _detectar_problemas_cross_validator(self, resultados_validadores: Dict):
        """Detecta problemas que requieren análisis de múltiples validadores."""
        try:
            # Problema 1: Inconsistencia entre geometría y texturas
            if 'geometrico' in resultados_validadores and 'texturas' in resultados_validadores:
                geometrico = resultados_validadores['geometrico']
                texturas = resultados_validadores['texturas']
                
                # Verificar si hay geometría detallada pero texturas de baja calidad
                num_triangulos = geometrico.get('estadisticas', {}).get('num_triangulos', 0)
                texturas_problemas = len(texturas.get('problemas_texturas', []))
                
                if num_triangulos > 10000 and texturas_problemas > 2:
                    self.problemas_detectados.append({
                        'tipo': 'calidad',
                        'problema': 'inconsistencia_detalle_calidad',
                        'descripcion': 'Geometría detallada con texturas de baja calidad',
                        'severidad': 0.5,
                        'ubicacion': 'consistencia',
                        'impacto': 'medium',
                        'solucion': 'Equilibrar nivel de detalle entre geometría y texturas',
                        'auto_corregible': False,
                        'datos': {
                            'num_triangulos': num_triangulos,
                            'problemas_texturas': texturas_problemas
                        }
                    })
            
            # Problema 2: Alto uso de memoria con problemas de formato
            if 'formato' in resultados_validadores:
                formato = resultados_validadores['formato']
                tamaño_mb = formato.get('caracteristicas', {}).get('tamaño_mb', 0)
                problemas_formato = len(formato.get('problemas_formato', []))
                
                if tamaño_mb > 50 and problemas_formato > 0:
                    self.problemas_detectados.append({
                        'tipo': 'rendimiento',
                        'problema': 'archivo_pesado_con_problemas',
                        'descripcion': f'Archivo grande ({tamaño_mb}MB) con problemas de formato',
                        'severidad': 0.7,
                        'ubicacion': 'optimizacion',
                        'impacto': 'high',
                        'solucion': 'Optimizar y corregir problemas de formato para reducir tamaño',
                        'auto_corregible': True,
                        'datos': {
                            'tamaño_mb': tamaño_mb,
                            'problemas_formato': problemas_formato
                        }
                    })
            
        except Exception as e:
            self.logger.error(f"Error detectando problemas cross-validator: {str(e)}")
    
    def obtener_resumen_problemas(self) -> Dict:
        """Obtiene un resumen de los problemas detectados."""
        if not self.problemas_detectados:
            return {'total': 0, 'por_tipo': {}, 'por_severidad': {}, 'auto_corregibles': 0}
        
        resumen = {
            'total': len(self.problemas_detectados),
            'por_tipo': {},
            'por_severidad': {'alta': 0, 'media': 0, 'baja': 0},
            'auto_corregibles': 0
        }
        
        for problema in self.problemas_detectados:
            # Contar por tipo
            tipo = problema.get('tipo', 'desconocido')
            resumen['por_tipo'][tipo] = resumen['por_tipo'].get(tipo, 0) + 1
            
            # Clasificar por severidad
            severidad = problema.get('severidad', 0)
            if severidad >= 0.7:
                resumen['por_severidad']['alta'] += 1
            elif severidad >= 0.4:
                resumen['por_severidad']['media'] += 1
            else:
                resumen['por_severidad']['baja'] += 1
            
            # Contar auto-corregibles
            if problema.get('auto_corregible', False):
                resumen['auto_corregibles'] += 1
        
        return resumen
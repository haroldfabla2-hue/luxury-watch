#!/usr/bin/env python3
"""
Configuración del Validador 3D
=============================

Archivo de configuración para el Agente 4: Validador de Calidad 3D.
Define parámetros, umbrales y configuraciones para todos los componentes.
"""

# Configuración principal del validador
CONFIG_VALIDADOR_3D = {
    # Configuración general
    'general': {
        'nivel_log': 'INFO',  # DEBUG, INFO, WARNING, ERROR
        'tema_reportes': 'moderno',  # moderno, clasico, minimalista
        'idioma': 'es',  # es, en, fr
        'formato_fecha': '%d/%m/%Y %H:%M:%S',
        'zona_horaria': 'local'
    },
    
    # Configuración del validador geométrico
    'geometrico': {
        'tolerancia_agujeros': 0.01,
        'normal_threshold': 0.1,
        'min_triangulos': 100,
        'max_degenerados': 100,
        'metodo_deteccion_agujeros': 'topologico',  # topologico, volumetrico
        'metodo_validacion_normales': 'dot_product',  # dot_product, orientacion
        'precision_float': 1e-6,
        'usar_optimizaciones': True,
        'exportar_estadisticas': True
    },
    
    # Configuración del validador de texturas
    'texturas': {
        'resolucion_minima': 512,
        'resolucion_recomendada': 1024,
        'formatos_soportados': ['.png', '.jpg', '.jpeg', '.tga', '.bmp', '.tiff'],
        'formatos_sin_perdida': ['.png', '.tiff', '.tga'],
        'formatos_con_perdida': ['.jpg', '.jpeg'],
        'ratio_aspect_max': 4.0,
        'compresion_maxima': 85,  # Para JPEG
        'tamaño_archivo_max': 10 * 1024 * 1024,  # 10MB
        'tamaño_recomendado_max': 2 * 1024 * 1024,  # 2MB
        'detectar_banding': True,
        'detectar_blocking': True,
        'detectar_compresion_excesiva': True,
        'analisis_entropia': True,
        'metodo_banding': 'histograma',  # histograma, gradiente
        'umbral_blocking': 25,
        'umbral_banding': 70
    },
    
    # Configuración del validador de formato
    'formato': {
        'tamaño_maximo': 100 * 1024 * 1024,  # 100MB
        'tamaño_recomendado': 50 * 1024 * 1024,  # 50MB
        'version_gltf_minima': '1.0',
        'version_gltf_maxima': '2.0',
        'formatos_soportados': ['.gltf', '.glb', '.obj', '.ply', '.stl', '.dae'],
        'formatos_optimizados_web': ['.gltf', '.glb'],
        'formatos_obsoletos': ['.dae', '.stl', '.ply'],
        'max_dependencias_externas': 5,
        'embeber_recursos': False,
        'verificar_compatibilidad_web': True,
        'detectar_formato_obsoleto': True,
        'analizar_optimizaciones': True
    },
    
    # Configuración de métricas de calidad
    'metricas': {
        'ssim_threshold': 0.8,
        'psnr_threshold': 20.0,
        'lpips_threshold': 0.3,
        'resize_to': (512, 512),
        'normalizar_imagenes': True,
        'metodo_ssim': 'gaussiano',  # gaussiano, ventana, global
        'ventana_ssim': 11,
        'sigma_ssim': 1.5,
        'modelo_lpips': 'vgg',  # vgg, alex, squeeze
        'calcular_lpips': True,
        'calcular_correlacion': True,
        'calcular_entropia': True,
        'metodo_correlacion': 'pearson',  # pearson, spearman
        'imagenes_referencia_auto': True,
        'patron_imagenes_referencia': '*ref*'
    },
    
    # Configuración del detector de problemas
    'problemas': {
        'severidad_minima': 0.3,
        'severidad_alta': 0.7,
        'severidad_media': 0.4,
        'tolerancia_geometrica': 0.01,
        'umbral_normales': 0.1,
        'umbral_agujeros': 0.01,
        'umbral_triangulos_degenerados': 0.1,
        'umbral_vertices_duplicados': 10,
        'umbral_componentes_desconectadas': 1,
        'umbral_resolucion_texturas': 512,
        'umbral_poligonos': 100000,
        'umbral_nodos_jerarquia': 1000,
        'detectar_problemas_cross_validator': True,
        'clasificacion_automatica': True
    },
    
    # Configuración del corrector automático
    'corrector': {
        'auto_correct': False,
        'backup_original': True,
        'directorio_backups': 'backups/',
        'tolerancia_geometrica': 0.01,
        'calidad_compresion': 85,
        'formato_conversion': 'png',  # png, jpg
        'profundidad_poisson': 8,
        'metodo_seleccion_componente': 'mayor',  # mayor, menor, centroide
        'corregir_agujeros': True,
        'corregir_normales': True,
        'corregir_vertices_duplicados': True,
        'corregir_triangulos_degenerados': True,
        'embeber_recursos': False,
        'convertir_formatos': False,
        'optimizar_compresion': False
    },
    
    # Configuración del generador de reportes
    'reportes': {
        'formato': 'html',  # html, json, pdf
        'incluir_visualizaciones': True,
        'incluir_estadisticas': True,
        'incluir_recomendaciones': True,
        'incluir_detalles_tecnicos': True,
        'css_incorporado': True,
        'javascript_incorporado': True,
        'dpi_visualizaciones': 150,
        'tamano_figura_small': (8, 6),
        'tamano_figura_medium': (10, 8),
        'tamano_figura_large': (12, 10),
        'colores_personalizados': {
            'excelente': '#2E8B57',
            'bueno': '#32CD32',
            'aceptable': '#FFD700',
            'problematico': '#FF4500',
            'critico': '#DC143C'
        },
        'template_personalizado': None,
        'guardar_imagenes_separadas': False,
        'generar_json_resumen': True,
        'incluir_timestamp': True
    },
    
    # Configuración de rendimiento
    'rendimiento': {
        'parallel_processing': False,
        'max_workers': 4,
        'cache_habilitado': False,
        'cache_ttl': 3600,  # 1 hora
        'optimizacion_memoria': True,
        'chunk_size': 1000,
        'timeout_validacion': 300,  # 5 minutos
        'timeout_correccion': 600,  # 10 minutos
        'usar_gpu': False,  # Si PyTorch está disponible
        'preprocesamiento_cache': False
    },
    
    # Configuración de salida
    'salida': {
        'directorio_reportes': './reportes/',
        'directorio_correcciones': './corregidos/',
        'directorio_logs': './logs/',
        'prefijo_archivos': 'validador_3d_',
        'incluir_timestamp_nombres': True,
        'formato_nombre': '{prefijo}_{timestamp}_{archivo}',
        'comprimir_reportes': False,
        'eliminar_temporales': True,
        'nivel_verbosidad': 'normal'  # minimal, normal, verbose, debug
    },
    
    # Configuración de integración
    'integracion': {
        'api_webhook': None,
        'notificaciones_email': False,
        'configuracion_email': {
            'smtp_server': None,
            'smtp_port': 587,
            'usuario': None,
            'password': None,
            'destinatarios': []
        },
        'integraciones': {
            'jira': False,
            'slack': False,
            'discord': False
        },
        'base_datos': {
            'habilitado': False,
            'tipo': 'sqlite',  # sqlite, mysql, postgresql
            'connection_string': None
        }
    },
    
    # Configuración avanzada
    'avanzado': {
        'experimental_features': False,
        'debug_mode': False,
        'profiling_enabled': False,
        'save_intermediate_results': False,
        'custom_validators': [],
        'plugin_system': False,
        'machine_learning_models': False,
        'neural_network_analysis': False,
        'ai_suggestions': False
    }
}

# Configuraciones predefinidas por tipo de proyecto
CONFIG_PRESETS = {
    'web_optimizado': {
        'geometrico': {
            'min_triangulos': 50000,
            'tolerancia_agujeros': 0.005
        },
        'texturas': {
            'resolucion_minima': 256,
            'resolucion_recomendada': 512,
            'tamaño_archivo_max': 2 * 1024 * 1024
        },
        'formato': {
            'formatos_soportados': ['.gltf', '.glb'],
            'embeber_recursos': True
        },
        'problemas': {
            'umbral_poligonos': 50000,
            'umbral_resolucion_texturas': 256
        },
        'corrector': {
            'auto_correct': True,
            'embeber_recursos': True
        }
    },
    
    'alta_calidad': {
        'geometrico': {
            'min_triangulos': 10,
            'tolerancia_agujeros': 0.001
        },
        'texturas': {
            'resolucion_minima': 1024,
            'resolucion_recomendada': 2048,
            'tamaño_archivo_max': 20 * 1024 * 1024
        },
        'problemas': {
            'severidad_minima': 0.1,
            'umbral_resolucion_texturas': 1024
        },
        'metricas': {
            'ssim_threshold': 0.9,
            'psnr_threshold': 25.0,
            'lpips_threshold': 0.2
        }
    },
    
    'vr_ar': {
        'geometrico': {
            'min_triangulos': 5000,
            'tolerancia_agujeros': 0.002
        },
        'texturas': {
            'resolucion_minima': 1024,
            'tamaño_archivo_max': 5 * 1024 * 1024
        },
        'formato': {
            'formatos_soportados': ['.gltf', '.glb'],
            'embeber_recursos': True
        },
        'problemas': {
            'umbral_poligonos': 20000
        }
    },
    
    'juegos_moviles': {
        'geometrico': {
            'min_triangulos': 20000,
            'tolerancia_agujeros': 0.005
        },
        'texturas': {
            'resolucion_minima': 256,
            'tamaño_archivo_max': 1 * 1024 * 1024
        },
        'problemas': {
            'umbral_poligonos': 30000,
            'umbral_resolucion_texturas': 256
        },
        'corrector': {
            'auto_correct': True
        }
    },
    
    'visualizacion_cientifica': {
        'geometrico': {
            'min_triangulos': 1,
            'tolerancia_agujeros': 0.0
        },
        'texturas': {
            'resolucion_minima': 512,
            'formatos_con_perdida': []  # Sin compresión con pérdida
        },
        'metricas': {
            'ssim_threshold': 0.95,
            'psnr_threshold': 30.0,
            'lpips_threshold': 0.1
        }
    }
}

def cargar_configuracion(preset: str = None, config_personalizado: dict = None) -> dict:
    """
    Carga la configuración del validador.
    
    Args:
        preset: Nombre del preset predefinido
        config_personalizado: Configuración personalizada adicional
        
    Returns:
        dict: Configuración completa
    """
    config = CONFIG_VALIDADOR_3D.copy()
    
    # Aplicar preset si se especifica
    if preset and preset in CONFIG_PRESETS:
        preset_config = CONFIG_PRESETS[preset]
        config = _merge_config(config, preset_config)
    
    # Aplicar configuración personalizada
    if config_personalizado:
        config = _merge_config(config, config_personalizado)
    
    return config

def _merge_config(base: dict, overlay: dict) -> dict:
    """
    Combina dos configuraciones de manera recursiva.
    
    Args:
        base: Configuración base
        overlay: Configuración que sobrescribe
        
    Returns:
        dict: Configuración combinada
    """
    result = base.copy()
    
    for key, value in overlay.items():
        if key in result and isinstance(result[key], dict) and isinstance(value, dict):
            result[key] = _merge_config(result[key], value)
        else:
            result[key] = value
    
    return result

def validar_configuracion(config: dict) -> tuple[bool, list]:
    """
    Valida la configuración proporcionada.
    
    Args:
        config: Configuración a validar
        
    Returns:
        tuple: (es_valida, lista_errores)
    """
    errores = []
    
    # Validaciones básicas
    if 'geometrico' not in config:
        errores.append("Sección 'geometrico' requerida")
    
    if 'texturas' not in config:
        errores.append("Sección 'texturas' requerida")
    
    if 'formato' not in config:
        errores.append("Sección 'formato' requerida")
    
    # Validar tipos de datos
    try:
        # Configuración geométrica
        geo_config = config.get('geometrico', {})
        if not isinstance(geo_config.get('tolerancia_agujeros', 0), (int, float)):
            errores.append("tolerancia_agujeros debe ser numérica")
        
        # Configuración de texturas
        tex_config = config.get('texturas', {})
        if not isinstance(tex_config.get('resolucion_minima', 0), int):
            errores.append("resolucion_minima debe ser entera")
        
        # Configuración de formato
        fmt_config = config.get('formato', {})
        if not isinstance(fmt_config.get('tamaño_maximo', 0), int):
            errores.append("tamaño_maximo debe ser entero")
    
    except Exception as e:
        errores.append(f"Error validando tipos de datos: {str(e)}")
    
    return len(errores) == 0, errores

def guardar_configuracion(config: dict, archivo: str):
    """
    Guarda la configuración en un archivo JSON.
    
    Args:
        config: Configuración a guardar
        archivo: Ruta del archivo
    """
    import json
    import os
    
    os.makedirs(os.path.dirname(archivo), exist_ok=True)
    
    with open(archivo, 'w', encoding='utf-8') as f:
        json.dump(config, f, indent=2, ensure_ascii=False)

def cargar_configuracion_archivo(archivo: str) -> dict:
    """
    Carga configuración desde un archivo JSON.
    
    Args:
        archivo: Ruta del archivo de configuración
        
    Returns:
        dict: Configuración cargada
    """
    import json
    
    with open(archivo, 'r', encoding='utf-8') as f:
        config = json.load(f)
    
    return config

# Funciones de utilidad para configuración
def obtener_configuracion_ejemplo() -> dict:
    """Retorna un ejemplo de configuración."""
    return {
        'geometrico': {
            'tolerancia_agujeros': 0.01,
            'normal_threshold': 0.1
        },
        'texturas': {
            'resolucion_minima': 512,
            'formatos_soportados': ['.png', '.jpg', '.jpeg']
        },
        'corrector': {
            'auto_correct': False,
            'backup_original': True
        }
    }

def configurar_para_web() -> dict:
    """Retorna configuración optimizada para web."""
    return cargar_configuracion('web_optimizado')

def configurar_para_alta_calidad() -> dict:
    """Retorna configuración para alta calidad."""
    return cargar_configuracion('alta_calidad')

def configurar_para_vr_ar() -> dict:
    """Retorna configuración para VR/AR."""
    return cargar_configuracion('vr_ar')

def configurar_para_juegos() -> dict:
    """Retorna configuración para juegos móviles."""
    return cargar_configuracion('juegos_moviles')

def configurar_para_cientifico() -> dict:
    """Retorna configuración para visualización científica."""
    return cargar_configuracion('visualizacion_cientifica')

if __name__ == "__main__":
    # Ejemplo de uso
    print("=== Configuración del Validador 3D ===")
    
    # Cargar configuración por defecto
    config_default = cargar_configuracion()
    print(f"Configuración por defecto cargada con {len(config_default)} secciones")
    
    # Cargar preset para web
    config_web = configurar_para_web()
    print(f"Configuración web cargada")
    
    # Validar configuración
    es_valida, errores = validar_configuracion(config_default)
    if es_valida:
        print("✅ Configuración válida")
    else:
        print("❌ Errores en configuración:")
        for error in errores:
            print(f"  - {error}")
    
    # Mostrar presets disponibles
    print(f"\nPresets disponibles: {list(CONFIG_PRESETS.keys())}")
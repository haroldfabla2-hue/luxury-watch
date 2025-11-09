"""
Agente 3: Selector de Técnica 2D-3D
Decide automáticamente entre COLMAP local, OpenRouter, o híbrido basado en evaluación de factores
"""

import asyncio
import json
import time
import psutil
import os
from typing import Dict, List, Optional, Any, Tuple
from datetime import datetime, timedelta
from dataclasses import dataclass, asdict
from enum import Enum
import logging
from pathlib import Path

from loguru import logger
import numpy as np
from PIL import Image

# Importar componentes del sistema de orquestación
try:
    from agent_manager import Agent, AgentConfig, AgentType
    from task_queue import TaskQueue, TaskPriority, Task
except ImportError:
    logger.warning("No se pudo importar el sistema de orquestación, usando implementación independiente")


class MetodoProcesamiento(Enum):
    """Métodos de procesamiento 2D-3D disponibles"""
    COLMAP_LOCAL = "colmap_local"
    OPENROUTER_API = "openrouter_api"
    HIBRIDO = "hibrido"


class EstadoProcesamiento(Enum):
    """Estados del procesamiento"""
    PENDIENTE = "pendiente"
    EVALUANDO = "evaluando"
    PROCESANDO = "procesando"
    COMPLETADO = "completado"
    FALLIDO = "fallido"
    FALLBACK = "fallback"


@dataclass
class FactoresEvaluacion:
    """Factores para evaluación de técnica"""
    num_imagenes: int
    calidad_imagenes: float  # 0.0 - 1.0
    complejidad_objeto: float  # 0.0 - 1.0
    recursos_servidor: Dict[str, float]  # CPU, RAM, Disco disponibles
    tiempo_requerido: float  # minutos estimados
    presupuesto: float  # $ máximo permitido
    prioridad: int  # 1-5
    deadline: Optional[datetime] = None


@dataclass
class DecisionTecnica:
    """Decisión de técnica a usar"""
    metodo_seleccionado: MetodoProcesamiento
    confianza: float  # 0.0 - 1.0
    razones: List[str]
    recursos_estimados: Dict[str, float]
    tiempo_estimado: float
    costo_estimado: float
    prioridad_factores: Dict[str, float]
    alternativas: List[Dict[str, Any]]


@dataclass
class MetricasProcesamiento:
    """Métricas de procesamiento por método"""
    tiempo_total: float = 0.0
    uso_cpu_promedio: float = 0.0
    uso_ram_promedio: float = 0.0
    calidad_resultado: float = 0.0
    costo_real: float = 0.0
    exitos: int = 0
    fallos: int = 0
    tiempo_promedio: float = 0.0


class EvaluadorFactores:
    """Evalúa factores para selección de técnica"""
    
    def __init__(self):
        self.pesos_factores = {
            "num_imagenes": 0.25,
            "calidad_imagenes": 0.30,
            "complejidad_objeto": 0.20,
            "recursos_servidor": 0.15,
            "tiempo_requerido": 0.10
        }
    
    def evaluar_imagenes(self, imagenes: List[str]) -> Tuple[int, float]:
        """Evalúa las imágenes recibidas"""
        num_imagenes = len(imagenes)
        calidad_total = 0.0
        
        for img_path in imagenes:
            try:
                img = Image.open(img_path)
                # Evaluar calidad basada en resolución y formato
                width, height = img.size
                resolution_score = min((width * height) / (1920 * 1080), 1.0)
                
                # Evaluar formato
                format_score = 1.0 if img.format in ['JPEG', 'PNG', 'TIFF'] else 0.7
                
                # Evaluar nitidez (simplificado)
                sharpness_score = 0.8  # Placeholder - se puede mejorar con análisis real
                
                img_quality = (resolution_score * 0.4 + format_score * 0.3 + sharpness_score * 0.3)
                calidad_total += img_quality
                
            except Exception as e:
                logger.warning(f"Error evaluando imagen {img_path}: {e}")
                calidad_total += 0.5  # Calidad baja por defecto
        
        calidad_promedio = calidad_total / num_imagenes if num_imagenes > 0 else 0.0
        
        return num_imagenes, calidad_promedio
    
    def evaluar_recursos_servidor(self) -> Dict[str, float]:
        """Evalúa recursos disponibles del servidor"""
        return {
            "cpu_disponible": psutil.cpu_percent(interval=1) / 100.0,
            "ram_disponible": (psutil.virtual_memory().available / psutil.virtual_memory().total),
            "disco_disponible": psutil.disk_usage('/').free / psutil.disk_usage('/').total,
            "vcpus": psutil.cpu_count() / 8.0  # Normalizado a 8 vCPUs max
        }
    
    def evaluar_complejidad_objeto(self, objetos: List[Dict]) -> float:
        """Evalúa la complejidad del objeto 3D a procesar"""
        if not objetos:
            return 0.5  # Complejidad media por defecto
        
        complejidad_total = 0.0
        
        for obj in objetos:
            # Factores de complejidad
            num_puntos = obj.get('num_puntos', 1000)
            num_triangulos = obj.get('num_triangulos', 2000)
            materiales_complejos = obj.get('materiales_complejos', 1)
            animaciones = obj.get('animaciones', 0)
            
            # Calcular complejidad basada en métricas
            complejidad = (
                min(num_puntos / 10000, 1.0) * 0.3 +
                min(num_triangulos / 20000, 1.0) * 0.3 +
                min(materiales_complejos / 5, 1.0) * 0.2 +
                min(animaciones / 3, 1.0) * 0.2
            )
            
            complejidad_total += complejidad
        
        return complejidad_total / len(objetos)
    
    def generar_evaluacion(self, 
                          imagenes: List[str], 
                          objetos: List[Dict],
                          presupuesto: float = 100.0,
                          prioridad: int = 3,
                          deadline: Optional[datetime] = None) -> FactoresEvaluacion:
        """Genera evaluación completa de factores"""
        
        # Evaluar imágenes
        num_imagenes, calidad_imagenes = self.evaluar_imagenes(imagenes)
        
        # Evaluar recursos del servidor
        recursos_servidor = self.evaluar_recursos_servidor()
        
        # Evaluar complejidad del objeto
        complejidad_objeto = self.evaluar_complejidad_objeto(objetos)
        
        # Estimar tiempo requerido basado en factores
        tiempo_estimado = self._estimar_tiempo(num_imagenes, complejidad_objeto, recursos_servidor)
        
        return FactoresEvaluacion(
            num_imagenes=num_imagenes,
            calidad_imagenes=calidad_imagenes,
            complejidad_objeto=complejidad_objeto,
            recursos_servidor=recursos_servidor,
            tiempo_requerido=tiempo_estimado,
            presupuesto=presupuesto,
            prioridad=prioridad,
            deadline=deadline
        )
    
    def _estimar_tiempo(self, num_imagenes: int, complejidad: float, recursos: Dict[str, float]) -> float:
        """Estima tiempo de procesamiento en minutos"""
        # Tiempo base por imagen
        tiempo_por_imagen = 2.0  # minutos
        
        # Factor de complejidad
        factor_complejidad = 1.0 + complejidad
        
        # Factor de recursos disponibles
        factor_recursos = (recursos['cpu_disponible'] * 0.4 + 
                          recursos['ram_disponible'] * 0.4 + 
                          recursos['disco_disponible'] * 0.2)
        factor_recursos = max(0.5, factor_recursos)  # Mínimo 0.5
        
        tiempo_total = (num_imagenes * tiempo_por_imagen * factor_complejidad) / factor_recursos
        
        return max(tiempo_total, 1.0)  # Mínimo 1 minuto


class SelectorTecnica:
    """Selecciona la técnica óptima de procesamiento 2D-3D"""
    
    def __init__(self):
        self.evaluador = EvaluadorFactores()
        self.historico_decisiones = []
        
        # Configuraciones de métodos
        self.config_metodos = {
            MetodoProcesamiento.COLMAP_LOCAL: {
                "costo_por_imagen": 0.0,  # Gratis
                "tiempo_por_imagen": 3.0,  # minutos
                "calidad_base": 0.85,
                "recursos_cpu": 0.8,
                "recursos_ram": 0.6,
                "confiabilidad": 0.9
            },
            MetodoProcesamiento.OPENROUTER_API: {
                "costo_por_imagen": 0.15,  # $0.15 por imagen
                "tiempo_por_imagen": 1.5,  # minutos
                "calidad_base": 0.95,
                "recursos_cpu": 0.1,
                "recursos_ram": 0.1,
                "confiabilidad": 0.85
            },
            MetodoProcesamiento.HIBRIDO: {
                "costo_por_imagen": 0.05,  # $0.05 por imagen
                "tiempo_por_imagen": 2.0,  # minutos
                "calidad_base": 0.92,
                "recursos_cpu": 0.5,
                "recursos_ram": 0.4,
                "confiabilidad": 0.88
            }
        }
    
    def seleccionar_tecnica(self, factores: FactoresEvaluacion) -> DecisionTecnica:
        """Selecciona la técnica óptima basada en factores de evaluación"""
        
        puntuaciones = {}
        razones = {}
        
        # Evaluar cada método
        for metodo in MetodoProcesamiento:
            puntuacion, razon = self._evaluar_metodo(metodo, factores)
            puntuaciones[metodo] = puntuacion
            razones[metodo] = razon
        
        # Seleccionar el método con mayor puntuación
        metodo_seleccionado = max(puntuaciones, key=puntuaciones.get)
        confianza = puntuaciones[metodo_seleccionado]
        
        # Generar alternativas
        alternativas = []
        for metodo, puntuacion in sorted(puntuaciones.items(), key=lambda x: x[1], reverse=True)[1:3]:
            alternativas.append({
                "metodo": metodo.value,
                "puntuacion": puntuacion,
                "razones": razones[metodo]
            })
        
        # Estimar recursos y costos
        config_seleccionada = self.config_metodos[metodo_seleccionado]
        recursos_estimados = self._calcular_recursos_estimados(metodo_seleccionado, factores)
        tiempo_estimado = config_seleccionada["tiempo_por_imagen"] * factores.num_imagenes
        costo_estimado = config_seleccionada["costo_por_imagen"] * factores.num_imagenes
        
        # Determinar prioridades de factores
        prioridad_factores = self._calcular_prioridad_factores(factores)
        
        decision = DecisionTecnica(
            metodo_seleccionado=metodo_seleccionado,
            confianza=confianza,
            razones=razones[metodo_seleccionado],
            recursos_estimados=recursos_estimados,
            tiempo_estimado=tiempo_estimado,
            costo_estimado=costo_estimado,
            prioridad_factores=prioridad_factores,
            alternativas=alternativas
        )
        
        # Guardar en historial
        self.historico_decisiones.append({
            "timestamp": datetime.now(),
            "factores": asdict(factores),
            "decision": asdict(decision)
        })
        
        return decision
    
    def _evaluar_metodo(self, metodo: MetodoProcesamiento, factores: FactoresEvaluacion) -> Tuple[float, List[str]]:
        """Evalúa un método específico"""
        
        config = self.config_metodos[metodo]
        razones = []
        puntuacion = 0.0
        
        # Factor de costo
        costo_total = config["costo_por_imagen"] * factores.num_imagenes
        if costo_total <= factores.presupuesto:
            factor_costo = min(1.0, (factores.presupuesto - costo_total) / factores.presupuesto + 0.1)
            puntuacion += factor_costo * 0.25
            razones.append(f"Costo dentro del presupuesto (${costo_total:.2f})")
        else:
            factor_costo = 0.0
            razones.append(f"Costo excede presupuesto (${costo_total:.2f} > ${factores.presupuesto:.2f})")
        
        # Factor de tiempo
        tiempo_estimado = config["tiempo_por_imagen"] * factores.num_imagenes
        if factores.deadline:
            if tiempo_estimado <= (factores.deadline - datetime.now()).total_seconds() / 60:
                factor_tiempo = 1.0
                razones.append("Tiempo cumple con deadline")
            else:
                factor_tiempo = 0.5
                razones.append("Tiempo podría exceder deadline")
        else:
            factor_tiempo = min(1.0, factores.tiempo_requerido / tiempo_estimado)
            razones.append(f"Tiempo estimado: {tiempo_estimado:.1f} minutos")
        
        puntuacion += factor_tiempo * 0.20
        
        # Factor de recursos del servidor
        recursos_cpu_needed = config["recursos_cpu"]
        recursos_ram_needed = config["recursos_ram"]
        
        if (factores.recursos_servidor["cpu_disponible"] >= recursos_cpu_needed and 
            factores.recursos_servidor["ram_disponible"] >= recursos_ram_needed):
            factor_recursos = 1.0
            razones.append("Recursos del servidor suficientes")
        else:
            factor_recursos = 0.6
            razones.append("Recursos del servidor limitados")
        
        puntuacion += factor_recursos * 0.15
        
        # Factor de calidad
        factor_calidad = config["calidad_base"] * factores.calidad_imagenes
        puntuacion += factor_calidad * 0.30
        razones.append(f"Calidad esperada: {factor_calidad:.2f}")
        
        # Factor de confiabilidad
        puntuacion += config["confiabilidad"] * 0.10
        razones.append(f"Confiabilidad: {config['confiabilidad']:.2f}")
        
        return puntuacion, razones
    
    def _calcular_recursos_estimados(self, metodo: MetodoProcesamiento, factores: FactoresEvaluacion) -> Dict[str, float]:
        """Calcula recursos estimados para un método"""
        config = self.config_metodos[metodo]
        
        return {
            "cpu_uso": config["recursos_cpu"] * 100,
            "ram_uso": config["recursos_ram"] * 100,
            "disco_uso": min(50.0, factores.num_imagenes * 2.0),  # MB por imagen
            "tiempo_procesamiento": config["tiempo_por_imagen"] * factores.num_imagenes
        }
    
    def _calcular_prioridad_factores(self, factores: FactoresEvaluacion) -> Dict[str, float]:
        """Calcula la prioridad de cada factor"""
        prioridades = {}
        
        # Ajustar pesos basado en contexto
        if factores.num_imagenes > 50:
            prioridades["num_imagenes"] = 0.4
        elif factores.num_imagenes < 10:
            prioridades["num_imagenes"] = 0.15
        
        if factores.calidad_imagenes < 0.7:
            prioridades["calidad_imagenes"] = 0.4
        elif factores.calidad_imagenes > 0.9:
            prioridades["calidad_imagenes"] = 0.2
        
        if factores.complejidad_objeto > 0.7:
            prioridades["complejidad_objeto"] = 0.35
        
        if (factores.recursos_servidor["cpu_disponible"] < 0.5 or 
            factores.recursos_servidor["ram_disponible"] < 0.5):
            prioridades["recursos_servidor"] = 0.3
        
        if factores.prioridad >= 4:
            prioridades["tiempo_requerido"] = 0.3
        
        # Normalizar prioridades
        total_peso = sum(prioridades.values())
        if total_peso > 0:
            prioridades = {k: v/total_peso for k, v in prioridades.items()}
        
        return prioridades


class GestorColas:
    """Gestiona colas de procesamiento para cada método"""
    
    def __init__(self, task_queue):
        self.task_queue = task_queue
        self.colas_metodos = {
            MetodoProcesamiento.COLMAP_LOCAL: asyncio.Queue(),
            MetodoProcesamiento.OPENROUTER_API: asyncio.Queue(),
            MetodoProcesamiento.HIBRIDO: asyncio.Queue()
        }
        self.procesadores_activos = {}
        self.estadisticas = {
            MetodoProcesamiento.COLMAP_LOCAL: MetricasProcesamiento(),
            MetodoProcesamiento.OPENROUTER_API: MetricasProcesamiento(),
            MetodoProcesamiento.HIBRIDO: MetricasProcesamiento()
        }
    
    async def encolar_tarea(self, metodo: MetodoProcesamiento, tarea: Dict[str, Any]) -> str:
        """Encola una tarea para un método específico"""
        tarea_id = f"{metodo.value}_{int(time.time())}_{np.random.randint(1000, 9999)}"
        
        tarea_completa = {
            "task_id": tarea_id,
            "metodo": metodo,
            "payload": tarea,
            "estado": EstadoProcesamiento.PENDIENTE,
            "creado_en": datetime.now(),
            "intentado_con": []
        }
        
        await self.colas_metodos[metodo].put(tarea_completa)
        logger.info(f"Tarea {tarea_id} encolada en {metodo.value}")
        
        return tarea_id
    
    async def obtener_siguiente_tarea(self, metodo: MetodoProcesamiento) -> Optional[Dict[str, Any]]:
        """Obtiene la siguiente tarea de una cola específica"""
        try:
            tarea = await asyncio.wait_for(self.colas_metodos[metodo].get(), timeout=1.0)
            return tarea
        except asyncio.TimeoutError:
            return None
    
    async def procesar_tarea(self, metodo: MetodoProcesamiento, tarea: Dict[str, Any]) -> Dict[str, Any]:
        """Procesa una tarea usando el método especificado"""
        inicio = time.time()
        
        try:
            # Actualizar estado
            tarea["estado"] = EstadoProcesamiento.PROCESANDO
            tarea["iniciado_en"] = datetime.now()
            
            # Procesar según el método
            if metodo == MetodoProcesamiento.COLMAP_LOCAL:
                resultado = await self._procesar_colmap_local(tarea)
            elif metodo == MetodoProcesamiento.OPENROUTER_API:
                resultado = await self._procesar_openrouter_api(tarea)
            elif metodo == MetodoProcesamiento.HIBRIDO:
                resultado = await self._procesar_hibrido(tarea)
            else:
                raise ValueError(f"Método no soportado: {metodo}")
            
            # Calcular métricas
            tiempo_total = time.time() - inicio
            self._actualizar_metricas(metodo, tiempo_total, True)
            
            # Actualizar estado final
            tarea["estado"] = EstadoProcesamiento.COMPLETADO
            tarea["completado_en"] = datetime.now()
            tarea["resultado"] = resultado
            
            logger.info(f"Tarea {tarea['task_id']} completada en {tiempo_total:.2f}s con {metodo.value}")
            
            return tarea
            
        except Exception as e:
            # Calcular métricas de fallo
            tiempo_total = time.time() - inicio
            self._actualizar_metricas(metodo, tiempo_total, False)
            
            # Actualizar estado de fallo
            tarea["estado"] = EstadoProcesamiento.FALLIDO
            tarea["error"] = str(e)
            tarea["fallido_en"] = datetime.now()
            
            logger.error(f"Error procesando tarea {tarea['task_id']}: {e}")
            
            return tarea
    
    async def _procesar_colmap_local(self, tarea: Dict[str, Any]) -> Dict[str, Any]:
        """Procesa tarea con COLMAP local"""
        # Simular procesamiento COLMAP
        imagenes = tarea["payload"].get("imagenes", [])
        tiempo_base = len(imagenes) * 0.5  # 30 segundos por imagen
        
        await asyncio.sleep(tiempo_base)
        
        return {
            "metodo": "COLMAP_LOCAL",
            "resultado": "Modelo 3D generado exitosamente",
            "archivos_generados": ["modelo.obj", "textura.jpg"],
            "calidad": 0.85,
            "tiempo_procesamiento": tiempo_base
        }
    
    async def _procesar_openrouter_api(self, tarea: Dict[str, Any]) -> Dict[str, Any]:
        """Procesa tarea con OpenRouter API"""
        # Simular procesamiento con API
        imagenes = tarea["payload"].get("imagenes", [])
        tiempo_base = len(imagenes) * 0.2  # 12 segundos por imagen
        
        await asyncio.sleep(tiempo_base)
        
        return {
            "metodo": "OPENROUTER_API",
            "resultado": "Modelo 3D premium generado",
            "archivos_generados": ["modelo_premium.obj", "textura_hd.jpg", "mapa_normal.png"],
            "calidad": 0.95,
            "tiempo_procesamiento": tiempo_base,
            "costo": len(imagenes) * 0.15
        }
    
    async def _procesar_hibrido(self, tarea: Dict[str, Any]) -> Dict[str, Any]:
        """Procesa tarea con método híbrido"""
        # Simular procesamiento híbrido (combinado)
        imagenes = tarea["payload"].get("imagenes", [])
        tiempo_base = len(imagenes) * 0.3  # 18 segundos por imagen
        
        await asyncio.sleep(tiempo_base)
        
        return {
            "metodo": "HIBRIDO",
            "resultado": "Modelo 3D híbrido optimizado",
            "archivos_generados": ["modelo_hybrid.obj", "textura_optimized.jpg"],
            "calidad": 0.92,
            "tiempo_procesamiento": tiempo_base,
            "costo": len(imagenes) * 0.05
        }
    
    def _actualizar_metricas(self, metodo: MetodoProcesamiento, tiempo: float, exitoso: bool):
        """Actualiza métricas de procesamiento"""
        metricas = self.estadisticas[metodo]
        
        metricas.tiempo_total += tiempo
        if exitoso:
            metricas.exitos += 1
        else:
            metricas.fallos += 1
        
        metricas.tiempo_promedio = metricas.tiempo_total / (metricas.exitos + metricas.fallos)


class MonitoreoRecursos:
    """Monitorea uso de recursos del sistema"""
    
    def __init__(self):
        self.estadisticas = {
            "cpu_uso": [],
            "ram_uso": [],
            "tiempo_respuesta": []
        }
        self.alertas = []
        self.umbral_cpu = 80.0  # %
        self.umbral_ram = 85.0  # %
    
    async def monitorear(self, duracion: int = 60) -> Dict[str, Any]:
        """Monitorea recursos por un período especificado"""
        inicio = time.time()
        
        while time.time() - inicio < duracion:
            # Capturar métricas
            cpu_uso = psutil.cpu_percent(interval=1)
            ram_uso = psutil.virtual_memory().percent
            
            self.estadisticas["cpu_uso"].append(cpu_uso)
            self.estadisticas["ram_uso"].append(ram_uso)
            
            # Verificar umbrales
            if cpu_uso > self.umbral_cpu:
                self.alertas.append({
                    "tipo": "CPU_HIGH",
                    "valor": cpu_uso,
                    "timestamp": datetime.now(),
                    "mensaje": f"Uso de CPU alto: {cpu_uso}%"
                })
            
            if ram_uso > self.umbral_ram:
                self.alertas.append({
                    "tipo": "RAM_HIGH",
                    "valor": ram_uso,
                    "timestamp": datetime.now(),
                    "mensaje": f"Uso de RAM alto: {ram_uso}%"
                })
            
            await asyncio.sleep(5)  # Monitorear cada 5 segundos
        
        return self._generar_reporte()
    
    def _generar_reporte(self) -> Dict[str, Any]:
        """Genera reporte de monitoreo"""
        cpu_stats = self.estadisticas["cpu_uso"]
        ram_stats = self.estadisticas["ram_uso"]
        
        return {
            "cpu_promedio": np.mean(cpu_stats) if cpu_stats else 0.0,
            "cpu_maximo": np.max(cpu_stats) if cpu_stats else 0.0,
            "ram_promedio": np.mean(ram_stats) if ram_stats else 0.0,
            "ram_maximo": np.max(ram_stats) if ram_stats else 0.0,
            "total_alertas": len(self.alertas),
            "alertas_recientes": self.alertas[-10:] if self.alertas else [],
            "duracion_monitoreo": len(cpu_stats) * 5  # segundos
        }


class SelectorTecnicaAgent:
    """Agente principal para selección de técnica 2D-3D"""
    
    def __init__(self, config: Dict[str, Any]):
        self.config = config
        self.evaluador = EvaluadorFactores()
        self.selector = SelectorTecnica()
        self.gestor_colas = None
        self.monitoreo = MonitoreoRecursos()
        
        # Estados
        self.activo = False
        self.tareas_activas = {}
        self.log_decisiones = []
        
        # Configuración del agente
        self.max_concurrencia = config.get("max_concurrencia", 3)
        self.timeout_default = config.get("timeout_default", 300)  # 5 minutos
        self.reintentos_fallback = config.get("reintentos_fallback", 2)
    
    async def inicializar(self, task_queue=None):
        """Inicializa el agente"""
        try:
            self.gestor_colas = GestorColas(task_queue)
            self.activo = True
            
            # Iniciar monitoreo de recursos
            asyncio.create_task(self._monitoreo_periodico())
            
            logger.info("Agente Selector de Técnica 2D-3D inicializado correctamente")
            
        except Exception as e:
            logger.error(f"Error inicializando agente: {e}")
            raise
    
    async def procesar_imagenes_2d_3d(self, 
                                     imagenes: List[str],
                                     objetos: List[Dict] = None,
                                     presupuesto: float = 100.0,
                                     prioridad: int = 3,
                                     deadline: Optional[datetime] = None,
                                     metodo_forzado: Optional[MetodoProcesamiento] = None) -> Dict[str, Any]:
        """Procesa imágenes 2D a 3D usando la técnica seleccionada"""
        
        inicio_total = time.time()
        
        try:
            # 1. Evaluar factores
            logger.info("Evaluando factores para selección de técnica...")
            factores = self.evaluador.generar_evaluacion(
                imagenes=imagenes,
                objetos=objetos or [],
                presupuesto=presupuesto,
                prioridad=prioridad,
                deadline=deadline
            )
            
            # 2. Seleccionar técnica
            if metodo_forzado:
                decision = DecisionTecnica(
                    metodo_seleccionado=metodo_forzado,
                    confianza=1.0,
                    razones=["Método forzado por configuración"],
                    recursos_estimados={},
                    tiempo_estimado=0.0,
                    costo_estimado=0.0,
                    prioridad_factores={},
                    alternativas=[]
                )
                logger.info(f"Método forzado: {metodo_forzado.value}")
            else:
                decision = self.selector.seleccionar_tecnica(factores)
                logger.info(f"Técnica seleccionada: {decision.metodo_seleccionado.value} (confianza: {decision.confianza:.2f})")
            
            # 3. Log de decisión
            self._log_decision(factores, decision)
            
            # 4. Crear tarea de procesamiento
            tarea_data = {
                "imagenes": imagenes,
                "objetos": objetos,
                "configuracion": self.config.get("procesamiento", {}),
                "factores_evaluacion": asdict(factores),
                "decision_tecnica": asdict(decision)
            }
            
            # 5. Encolar tarea
            tarea_id = await self.gestor_colas.encolar_tarea(decision.metodo_seleccionado, tarea_data)
            
            # 6. Procesar con fallback
            resultado = await self._procesar_con_fallback(decision.metodo_seleccionado, tarea_data, decision.confianza)
            
            tiempo_total = time.time() - inicio_total
            
            # 7. Retornar resultado
            return {
                "task_id": tarea_id,
                "exito": resultado.get("completado", False),
                "metodo_utilizado": decision.metodo_seleccionado.value,
                "confianza_seleccion": decision.confianza,
                "factores": asdict(factores),
                "decision": asdict(decision),
                "resultado": resultado,
                "tiempo_total": tiempo_total,
                "timestamp": datetime.now().isoformat()
            }
            
        except Exception as e:
            tiempo_total = time.time() - inicio_total
            logger.error(f"Error en procesamiento 2D-3D: {e}")
            
            return {
                "task_id": f"error_{int(time.time())}",
                "exito": False,
                "error": str(e),
                "tiempo_total": tiempo_total,
                "timestamp": datetime.now().isoformat()
            }
    
    async def _procesar_con_fallback(self, 
                                   metodo_principal: MetodoProcesamiento, 
                                   tarea_data: Dict[str, Any],
                                   confianza_principal: float) -> Dict[str, Any]:
        """Procesa con fallback automático si el método principal falla"""
        
        metodos_fallback = self._obtener_metodos_fallback(metodo_principal)
        
        for metodo in metodos_fallback:
            try:
                logger.info(f"Intentando procesamiento con {metodo.value}")
                
                # Encolar tarea para método de fallback
                tarea_id = await self.gestor_colas.encolar_tarea(metodo, tarea_data)
                
                # Obtener tarea de la cola
                tarea = await self.gestor_colas.obtener_siguiente_tarea(metodo)
                
                if tarea:
                    # Procesar tarea
                    resultado = await self.gestor_colas.procesar_tarea(metodo, tarea)
                    
                    if resultado.get("estado") == EstadoProcesamiento.COMPLETADO:
                        resultado["metodo_original"] = metodo_principal.value
                        resultado["metodo_fallback"] = metodo.value
                        resultado["fallback_usado"] = True
                        return resultado
                
            except Exception as e:
                logger.warning(f"Fallo en método {metodo.value}: {e}")
                continue
        
        # Si todos los métodos fallan
        return {
            "completado": False,
            "error": "Todos los métodos de procesamiento fallaron",
            "metodos_intentados": [m.value for m in metodos_fallback]
        }
    
    def _obtener_metodos_fallback(self, metodo_principal: MetodoProcesamiento) -> List[MetodoProcesamiento]:
        """Obtiene la lista de métodos de fallback ordenados por prioridad"""
        
        if metodo_principal == MetodoProcesamiento.OPENROUTER_API:
            return [MetodoProcesamiento.HIBRIDO, MetodoProcesamiento.COLMAP_LOCAL]
        elif metodo_principal == MetodoProcesamiento.HIBRIDO:
            return [MetodoProcesamiento.COLMAP_LOCAL, MetodoProcesamiento.OPENROUTER_API]
        else:  # COLMAP_LOCAL
            return [MetodoProcesamiento.HIBRIDO, MetodoProcesamiento.OPENROUTER_API]
    
    def _log_decision(self, factores: FactoresEvaluacion, decision: DecisionTecnica):
        """Registra la decisión en logs"""
        
        entrada_log = {
            "timestamp": datetime.now().isoformat(),
            "factores": asdict(factores),
            "decision": asdict(decision),
            "servidor_recursos": {
                "cpu_disponible": factores.recursos_servidor.get("cpu_disponible", 0),
                "ram_disponible": factores.recursos_servidor.get("ram_disponible", 0),
                "vcpus": psutil.cpu_count()
            }
        }
        
        self.log_decisiones.append(entrada_log)
        
        # Mantener solo las últimas 100 decisiones
        if len(self.log_decisiones) > 100:
            self.log_decisiones = self.log_decisiones[-100:]
        
        # Log detallado
        logger.info(f"Decisión registrada: {decision.metodo_seleccionado.value}")
        for razon in decision.razones:
            logger.info(f"  - {razon}")
    
    async def _monitoreo_periodico(self):
        """Monitoreo periódico de recursos"""
        while self.activo:
            try:
                reporte = await self.monitoreo.monitorear(duracion=30)
                
                if reporte["alertas_recientes"]:
                    for alerta in reporte["alertas_recientes"]:
                        logger.warning(f"Alerta de recursos: {alerta['mensaje']}")
                
                # Si los recursos están muy altos, sugerir cambio de método
                if (reporte["cpu_promedio"] > 80 or reporte["ram_promedio"] > 85):
                    logger.info("Recursos del servidor altos, considerando métodos menos intensivos")
                
                await asyncio.sleep(60)  # Monitoreo cada minuto
                
            except Exception as e:
                logger.error(f"Error en monitoreo periódico: {e}")
                await asyncio.sleep(60)
    
    async def obtener_estadisticas(self) -> Dict[str, Any]:
        """Obtiene estadísticas del agente"""
        
        if not self.gestor_colas:
            return {"error": "Agente no inicializado"}
        
        estadisticas_por_metodo = {}
        for metodo, metricas in self.gestor_colas.estadisticas.items():
            estadisticas_por_metodo[metodo.value] = asdict(metricas)
        
        return {
            "agente_activo": self.activo,
            "tareas_activas": len(self.tareas_activas),
            "total_decisiones": len(self.log_decisiones),
            "estadisticas_por_metodo": estadisticas_por_metodo,
            "monitoreo_recursos": await self.monitoreo.monitorear(duracion=10),
            "configuracion": self.config
        }
    
    async def cerrar(self):
        """Cierra el agente de forma segura"""
        logger.info("Cerrando Agente Selector de Técnica 2D-3D...")
        
        self.activo = False
        
        # Esperar a que terminen las tareas activas
        while self.tareas_activas:
            await asyncio.sleep(1)
        
        logger.info("Agente Selector de Técnica 2D-3D cerrado")


# Función de conveniencia para crear agente
def crear_agente_selector_tecnica(config_path: str = None) -> SelectorTecnicaAgent:
    """Crea e inicializa el agente selector de técnica"""
    
    # Configuración por defecto
    config_default = {
        "max_concurrencia": 3,
        "timeout_default": 300,
        "reintentos_fallback": 2,
        "procesamiento": {
            "calidad_minima": 0.7,
            "tiempo_maximo": 1800,  # 30 minutos
            "memoria_limite": "4GB"
        },
        "monitoreo": {
            "intervalo": 60,
            "umbrales": {
                "cpu": 80.0,
                "ram": 85.0
            }
        }
    }
    
    # Cargar configuración personalizada si existe
    if config_path and os.path.exists(config_path):
        try:
            with open(config_path, 'r', encoding='utf-8') as f:
                config_personalizada = json.load(f)
                config_default.update(config_personalizada)
        except Exception as e:
            logger.warning(f"Error cargando configuración personalizada: {e}")
    
    return SelectorTecnicaAgent(config_default)
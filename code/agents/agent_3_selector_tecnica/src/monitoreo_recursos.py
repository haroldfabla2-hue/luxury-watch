"""
Módulo de monitoreo de recursos para el Agente Selector de Técnica 2D-3D
Proporciona monitoreo detallado de CPU, RAM, disco y métricas de rendimiento
"""

import asyncio
import time
import psutil
import json
import threading
from typing import Dict, List, Optional, Any, Callable
from datetime import datetime, timedelta
from dataclasses import dataclass, asdict
from enum import Enum
from pathlib import Path
import logging
from collections import deque, defaultdict
import statistics

from loguru import logger


class TipoMetrica(Enum):
    """Tipos de métricas monitoreadas"""
    CPU_USO = "cpu_uso"
    RAM_USO = "ram_uso"
    DISCO_USO = "disco_uso"
    TIEMPO_RESPUESTA = "tiempo_respuesta"
    THROUGHPUT = "throughput"
    ERRORES = "errores"
    COLA_PENDIENTES = "cola_pendientes"
    RECURSOS_METODO = "recursos_metodo"


class NivelAlerta(Enum):
    """Niveles de alerta"""
    INFO = "info"
    WARNING = "warning"
    ERROR = "error"
    CRITICAL = "critical"


@dataclass
class MetricaRecurso:
    """Estructura para métricas de recursos"""
    timestamp: datetime
    valor: float
    unidad: str
    metodo: Optional[str] = None
    tipo: Optional[TipoMetrica] = None


@dataclass
class AlertaRecursos:
    """Estructura para alertas de recursos"""
    id: str
    tipo: TipoMetrica
    nivel: NivelAlerta
    mensaje: str
    valor_actual: float
    umbral: float
    timestamp: datetime
    metodo_afectado: Optional[str] = None
    resolved: bool = False
    resuelta_en: Optional[datetime] = None


class RecopiladorMetricas:
    """Recopila métricas del sistema en tiempo real"""
    
    def __init__(self, interval: float = 5.0):
        self.interval = interval
        self.recopilando = False
        self.metricas_historicas = defaultdict(lambda: deque(maxlen=1000))
        self.metricas_tiempo_real = {}
        self.lock = threading.Lock()
        
        # Configuración de umbrales
        self.umbrales = {
            TipoMetrica.CPU_USO: {
                "warning": 70.0,
                "error": 85.0,
                "critical": 95.0
            },
            TipoMetrica.RAM_USO: {
                "warning": 75.0,
                "error": 85.0,
                "critical": 95.0
            },
            TipoMetrica.DISCO_USO: {
                "warning": 80.0,
                "error": 90.0,
                "critical": 95.0
            }
        }
    
    def iniciar_recopilacion(self):
        """Inicia la recopilación de métricas"""
        
        if self.recopilando:
            return
        
        self.recopilando = True
        self.thread_recopilacion = threading.Thread(target=self._recopilar_loop, daemon=True)
        self.thread_recopilacion.start()
        
        logger.info("Recopilador de métricas iniciado")
    
    def detener_recopilacion(self):
        """Detiene la recopilación de métricas"""
        
        self.recopilando = False
        if hasattr(self, 'thread_recopilacion'):
            self.thread_recopilacion.join(timeout=5)
        
        logger.info("Recopilador de métricas detenido")
    
    def _recopilar_loop(self):
        """Loop principal de recopilación"""
        
        while self.recopilando:
            try:
                timestamp = datetime.now()
                
                # Recopilar métricas del sistema
                cpu_uso = psutil.cpu_percent(interval=None)
                ram_uso = psutil.virtual_memory().percent
                disco_uso = psutil.disk_usage('/').percent
                
                # Almacenar métricas
                with self.lock:
                    self.metricas_historicas[TipoMetrica.CPU_USO].append(
                        MetricaRecurso(timestamp, cpu_uso, "%")
                    )
                    self.metricas_historicas[TipoMetrica.RAM_USO].append(
                        MetricaRecurso(timestamp, ram_uso, "%")
                    )
                    self.metricas_historicas[TipoMetrica.DISCO_USO].append(
                        MetricaRecurso(timestamp, disco_uso, "%")
                    )
                    
                    # Actualizar métricas en tiempo real
                    self.metricas_tiempo_real.update({
                        "cpu_uso": cpu_uso,
                        "ram_uso": ram_uso,
                        "disco_uso": disco_uso,
                        "timestamp": timestamp.isoformat()
                    })
                
                time.sleep(self.interval)
                
            except Exception as e:
                logger.error(f"Error en recopilación de métricas: {e}")
                time.sleep(self.interval)
    
    def obtener_metricas_actuales(self) -> Dict[str, Any]:
        """Obtiene las métricas actuales del sistema"""
        
        with self.lock:
            return self.metricas_tiempo_real.copy()
    
    def obtener_historial_metricas(self, 
                                  tipo: TipoMetrica, 
                                  minutos: int = 60) -> List[MetricaRecurso]:
        """Obtiene el historial de métricas para un tipo específico"""
        
        cutoff_time = datetime.now() - timedelta(minutes=minutos)
        
        with self.lock:
            metricas_filtradas = [
                m for m in self.metricas_historicas[tipo]
                if m.timestamp >= cutoff_time
            ]
            return metricas_filtradas.copy()
    
    def calcular_estadisticas(self, tipo: TipoMetrica, minutos: int = 60) -> Dict[str, float]:
        """Calcula estadísticas de las métricas"""
        
        metricas = self.obtener_historial_metricas(tipo, minutos)
        
        if not metricas:
            return {}
        
        valores = [m.valor for m in metricas]
        
        return {
            "promedio": statistics.mean(valores),
            "mediana": statistics.median(valores),
            "minimo": min(valores),
            "maximo": max(valores),
            "desviacion_estandar": statistics.stdev(valores) if len(valores) > 1 else 0.0,
            "percentil_95": self._calcular_percentil(valores, 95),
            "percentil_99": self._calcular_percentil(valores, 99),
            "total_muestras": len(valores)
        }
    
    def _calcular_percentil(self, valores: List[float], percentil: int) -> float:
        """Calcula un percentil específico"""
        
        if not valores:
            return 0.0
        
        valores_ordenados = sorted(valores)
        index = int(len(valores_ordenados) * (percentil / 100))
        return valores_ordenados[min(index, len(valores_ordenados) - 1)]


class GeneradorAlertas:
    """Genera alertas basadas en métricas y umbrales"""
    
    def __init__(self, recopilador: RecopiladorMetricas):
        self.recopilador = recopilador
        self.alertas_activas = {}
        self.historial_alertas = deque(maxlen=10000)
        self.callbacks_alerta = []
        self.alert_cooldown = {}  # Para evitar spam de alertas
        
    def agregar_callback(self, callback: Callable[[AlertaRecursos], None]):
        """Agrega un callback para cuando se generen alertas"""
        self.callbacks_alerta.append(callback)
    
    def verificar_alertas(self):
        """Verifica las métricas actuales y genera alertas si es necesario"""
        
        metricas_actuales = self.recopilador.obtener_metricas_actuales()
        
        # Verificar CPU
        if "cpu_uso" in metricas_actuales:
            self._verificar_metrica(
                TipoMetrica.CPU_USO,
                metricas_actuales["cpu_uso"],
                "Uso de CPU"
            )
        
        # Verificar RAM
        if "ram_uso" in metricas_actuales:
            self._verificar_metrica(
                TipoMetrica.RAM_USO,
                metricas_actuales["ram_uso"],
                "Uso de RAM"
            )
        
        # Verificar Disco
        if "disco_uso" in metricas_actuales:
            self._verificar_metrica(
                TipoMetrica.DISCO_USO,
                metricas_actuales["disco_uso"],
                "Uso de Disco"
            )
    
    def _verificar_metrica(self, 
                          tipo: TipoMetrica, 
                          valor_actual: float, 
                          nombre_metrica: str):
        """Verifica una métrica específica contra los umbrales"""
        
        umbrales = self.recopilador.umbrales.get(tipo, {})
        
        # Verificar niveles de alerta
        for nivel, umbral in umbrales.items():
            if valor_actual >= umbral:
                # Verificar cooldown para evitar spam
                cooldown_key = f"{tipo.value}_{nivel}"
                ahora = time.time()
                
                if (cooldown_key not in self.alert_cooldown or 
                    ahora - self.alert_cooldown[cooldown_key] > 300):  # 5 minutos
                    
                    # Generar alerta
                    alerta = self._crear_alerta(tipo, nivel, valor_actual, umbral, nombre_metrica)
                    
                    # Almacenar alerta
                    self.alertas_activas[alerta.id] = alerta
                    self.historial_alertas.append(alerta)
                    self.alert_cooldown[cooldown_key] = ahora
                    
                    # Notificar callbacks
                    for callback in self.callbacks_alerta:
                        try:
                            callback(alerta)
                        except Exception as e:
                            logger.error(f"Error en callback de alerta: {e}")
                    
                    logger.warning(f"Alerta generada: {alerta.mensaje}")
                
                break  # Solo una alerta por métrica
    
    def _crear_alerta(self, 
                     tipo: TipoMetrica, 
                     nivel: str, 
                     valor_actual: float, 
                     umbral: float, 
                     nombre_metrica: str) -> AlertaRecursos:
        """Crea una nueva alerta"""
        
        return AlertaRecursos(
            id=f"{tipo.value}_{nivel}_{int(time.time())}",
            tipo=tipo,
            nivel=NivelAlerta(nivel),
            mensaje=f"{nombre_metrica} en {valor_actual:.1f}% (umbral: {umbral}%)",
            valor_actual=valor_actual,
            umbral=umbral,
            timestamp=datetime.now()
        )
    
    def resolver_alerta(self, alerta_id: str):
        """Marca una alerta como resuelta"""
        
        if alerta_id in self.alertas_activas:
            alerta = self.alertas_activas[alerta_id]
            alerta.resolved = True
            alerta.resuelta_en = datetime.now()
            
            # Mover a historial y remover de activas
            del self.alertas_activas[alerta_id]
            
            logger.info(f"Alerta resuelta: {alerta_id}")
    
    def obtener_alertas_activas(self) -> List[AlertaRecursos]:
        """Obtiene todas las alertas activas"""
        return list(self.alertas_activas.values())
    
    def obtener_historial_alertas(self, horas: int = 24) -> List[AlertaRecursos]:
        """Obtiene el historial de alertas"""
        
        cutoff_time = datetime.now() - timedelta(hours=horas)
        
        return [
            alerta for alerta in self.historial_alertas
            if alerta.timestamp >= cutoff_time
        ]


class MonitorRecursosAvanzado:
    """Monitor avanzado de recursos con múltiples capacidades"""
    
    def __init__(self, config: Dict[str, Any]):
        self.config = config
        self.recopilador = RecopiladorMetricas(
            interval=config.get("intervalo_monitoreo", 5.0)
        )
        self.generador_alertas = GeneradorAlertas(self.recopilador)
        
        # Estados del monitor
        self.monitoreando = False
        self.task_monitoreo = None
        
        # Métricas específicas del agente
        self.metricas_agente = {
            "tareas_procesadas": 0,
            "tareas_exitosas": 0,
            "tareas_fallidas": 0,
            "tiempo_promedio_procesamiento": 0.0,
            "uso_recursos_por_metodo": defaultdict(list),
            "decisiones_por_metodo": defaultdict(int)
        }
        
        # Configurar callbacks de alertas
        self.generador_alertas.agregar_callback(self._manejar_alerta)
        
        # Archivo de logs
        self.archivo_log = Path(config.get("archivo_log", "logs/monitoreo_recursos.log"))
        self.archivo_log.parent.mkdir(exist_ok=True)
    
    def iniciar_monitoreo(self):
        """Inicia el monitoreo completo"""
        
        if self.monitoreando:
            return
        
        self.monitoreando = True
        
        # Iniciar recopilación de métricas
        self.recopilador.iniciar_recopilacion()
        
        # Iniciar tarea de verificación de alertas
        self.task_monitoreo = asyncio.create_task(self._monitoreo_loop())
        
        logger.info("Monitor de recursos avanzado iniciado")
    
    def detener_monitoreo(self):
        """Detiene el monitoreo completo"""
        
        self.monitoreando = False
        
        # Detener recopilación
        self.recopilador.detener_recopilacion()
        
        # Cancelar tarea de monitoreo
        if self.task_monitoreo:
            self.task_monitoreo.cancel()
            self.task_monitoreo = None
        
        logger.info("Monitor de recursos avanzado detenido")
    
    async def _monitoreo_loop(self):
        """Loop principal de monitoreo"""
        
        while self.monitoreando:
            try:
                # Verificar alertas
                self.generador_alertas.verificar_alertas()
                
                # Log de métricas cada minuto
                await self._log_metricas_periodicas()
                
                await asyncio.sleep(30)  # Verificar cada 30 segundos
                
            except asyncio.CancelledError:
                break
            except Exception as e:
                logger.error(f"Error en loop de monitoreo: {e}")
                await asyncio.sleep(60)
    
    async def _log_metricas_periodicas(self):
        """Log de métricas cada minuto"""
        
        try:
            metricas = self.recopilador.obtener_metricas_actuales()
            
            if metricas:
                mensaje = (
                    f"Métricas del sistema - "
                    f"CPU: {metricas.get('cpu_uso', 0):.1f}%, "
                    f"RAM: {metricas.get('ram_uso', 0):.1f}%, "
                    f"Disco: {metricas.get('disco_uso', 0):.1f}%"
                )
                
                logger.info(mensaje)
                
                # Log al archivo
                with open(self.archivo_log, 'a') as f:
                    f.write(f"{datetime.now().isoformat()} - {mensaje}\n")
        
        except Exception as e:
            logger.error(f"Error en log de métricas: {e}")
    
    def _manejar_alerta(self, alerta: AlertaRecursos):
        """Maneja una alerta generada"""
        
        # Log detallado de la alerta
        logger.warning(f"🚨 ALERTA: {alerta.mensaje}")
        
        # Posibles acciones automatizadas
        if alerta.nivel == NivelAlerta.CRITICAL:
            self._accionar_alerta_critica(alerta)
    
    def _accionar_alerta_critica(self, alerta: AlertaRecursos):
        """Acciones automatizadas para alertas críticas"""
        
        if alerta.tipo == TipoMetrica.CPU_USO:
            logger.critical("🚨 CRÍTICO: CPU sobrecargado - Considerando reducción de carga")
            # Aquí se podría implementar reducción automática de tareas
        
        elif alerta.tipo == TipoMetrica.RAM_USO:
            logger.critical("🚨 CRÍTICO: RAM sobrecargada - Iniciando limpieza de memoria")
            # Aquí se podría forzar garbage collection
        
        elif alerta.tipo == TipoMetrica.DISCO_USO:
            logger.critical("🚨 CRÍTICO: Disco lleno - Limpiando archivos temporales")
            # Aquí se podría limpiar archivos temporales
    
    def registrar_procesamiento_tarea(self, 
                                     metodo: str, 
                                     exito: bool, 
                                     tiempo_procesamiento: float,
                                     recursos_usados: Dict[str, float]):
        """Registra el procesamiento de una tarea para métricas"""
        
        self.metricas_agente["tareas_procesadas"] += 1
        
        if exito:
            self.metricas_agente["tareas_exitosas"] += 1
        else:
            self.metricas_agente["tareas_fallidas"] += 1
        
        # Actualizar tiempo promedio
        total_tareas = self.metricas_agente["tareas_procesadas"]
        tiempo_actual = self.metricas_agente["tiempo_promedio_procesamiento"]
        
        nuevo_promedio = (tiempo_actual * (total_tareas - 1) + tiempo_procesamiento) / total_tareas
        self.metricas_agente["tiempo_promedio_procesamiento"] = nuevo_promedio
        
        # Registrar recursos por método
        for recurso, valor in recursos_usados.items():
            self.metricas_agente["uso_recursos_por_metodo"][f"{metodo}_{recurso}"].append(valor)
        
        # Contar decisiones por método
        self.metricas_agente["decisiones_por_metodo"][metodo] += 1
    
    def registrar_decision_metodo(self, metodo: str, factores: Dict[str, Any]):
        """Registra una decisión de método"""
        self.metricas_agente["decisiones_por_metodo"][metodo] += 1
    
    def generar_reporte_completo(self) -> Dict[str, Any]:
        """Genera un reporte completo del monitoreo"""
        
        metricas_actuales = self.recopilador.obtener_metricas_actuales()
        
        # Estadísticas del sistema
        estadisticas_sistema = {}
        for tipo in TipoMetrica:
            try:
                stats = self.recopilador.calcular_estadisticas(tipo, minutos=60)
                if stats:
                    estadisticas_sistema[tipo.value] = stats
            except Exception as e:
                logger.warning(f"Error calculando estadísticas para {tipo.value}: {e}")
        
        # Alertas
        alertas_activas = self.generador_alertas.obtener_alertas_activas()
        historial_alertas = self.generador_alertas.obtener_historial_alertas(horas=24)
        
        # Métricas del agente
        metricas_agente = self.metricas_agente.copy()
        
        return {
            "timestamp": datetime.now().isoformat(),
            "sistema": {
                "metricas_actuales": metricas_actuales,
                "estadisticas_hora": estadisticas_sistema,
                "uptime": time.time() - psutil.boot_time()
            },
            "alertas": {
                "activas": len(alertas_activas),
                "recientes": [asdict(a) for a in historial_alertas[-10:]]
            },
            "agente": {
                "metricas": metricas_agente,
                "tasa_exito": (
                    metricas_agente["tareas_exitosas"] / 
                    max(metricas_agente["tareas_procesadas"], 1)
                ) * 100
            },
            "recomendaciones": self._generar_recomendaciones(metricas_actuales)
        }
    
    def _generar_recomendaciones(self, metricas_actuales: Dict[str, float]) -> List[str]:
        """Genera recomendaciones basadas en las métricas actuales"""
        
        recomendaciones = []
        
        if metricas_actuales.get("cpu_uso", 0) > 80:
            recomendaciones.append("CPU alto - Considerar reducir concurrencia de tareas")
        
        if metricas_actuales.get("ram_uso", 0) > 80:
            recomendaciones.append("RAM alto - Revisar tareas en proceso y limpiar memoria")
        
        if metricas_actuales.get("disco_uso", 0) > 85:
            recomendaciones.append("Disco lleno - Limpiar archivos temporales y cache")
        
        if not recomendaciones:
            recomendaciones.append("Sistema funcionando correctamente")
        
        return recomendaciones


# Función de conveniencia
def crear_monitor_recursos(config_path: Optional[str] = None) -> MonitorRecursosAvanzado:
    """Crea un monitor de recursos con configuración"""
    
    config_default = {
        "intervalo_monitoreo": 5.0,
        "archivo_log": "logs/monitoreo_recursos.log",
        "max_alertas_memoria": 1000
    }
    
    if config_path:
        try:
            with open(config_path, 'r') as f:
                config_personalizada = json.load(f)
                config_default.update(config_personalizada)
        except Exception as e:
            logger.warning(f"Error cargando configuración de monitoreo: {e}")
    
    return MonitorRecursosAvanzado(config_default)
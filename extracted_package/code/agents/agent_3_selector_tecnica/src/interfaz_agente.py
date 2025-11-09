"""
Interfaz del Agente Selector de Técnica 2D-3D
Proporciona una API simple para interactuar con el agente
"""

import asyncio
import json
import logging
from typing import Dict, List, Optional, Any, Union
from datetime import datetime, timedelta
from pathlib import Path

from .selector_tecnica_agent import (
    SelectorTecnicaAgent, 
    MetodoProcesamiento, 
    FactoresEvaluacion,
    DecisionTecnica,
    crear_agente_selector_tecnica
)

# Configurar logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class InterfazAgenteSelector:
    """Interfaz principal para interactuar con el agente selector de técnica"""
    
    def __init__(self, config_path: Optional[str] = None):
        self.agent = None
        self.config_path = config_path
        self.session_active = False
        
    async def inicializar(self) -> bool:
        """Inicializa el agente selector de técnica"""
        try:
            logger.info("Inicializando Interfaz del Agente Selector de Técnica...")
            
            # Crear agente con configuración
            self.agent = crear_agente_selector_tecnica(self.config_path)
            
            # Inicializar agente
            await self.agent.inicializar()
            
            self.session_active = True
            
            logger.info("Interfaz del Agente Selector de Técnica inicializada correctamente")
            return True
            
        except Exception as e:
            logger.error(f"Error inicializando interfaz del agente: {e}")
            return False
    
    async def procesar_2d_a_3d(self, 
                              imagenes: Union[str, List[str]],
                              objetos: Optional[List[Dict]] = None,
                              presupuesto: float = 100.0,
                              prioridad: int = 3,
                              deadline: Optional[Union[str, datetime]] = None,
                              metodo_forzado: Optional[str] = None,
                              configuracion_personalizada: Optional[Dict] = None) -> Dict[str, Any]:
        """
        Procesa imágenes 2D a 3D usando la técnica seleccionada automáticamente
        
        Args:
            imagenes: Ruta a archivo de imagen o lista de rutas de imágenes
            objetos: Lista de objetos 3D a procesar (opcional)
            presupuesto: Presupuesto máximo en USD (default: 100.0)
            prioridad: Prioridad de 1-5 (default: 3)
            deadline: Deadline como string ISO o datetime (opcional)
            metodo_forzado: Forzar método específico ('colmap_local', 'openrouter_api', 'hibrido')
            configuracion_personalizada: Configuración personalizada para el procesamiento
            
        Returns:
            Dict con resultado del procesamiento
        """
        
        if not self.session_active:
            raise RuntimeError("La sesión del agente no está activa. Llama a inicializar() primero.")
        
        try:
            # Normalizar imagenes a lista
            lista_imagenes = self._normalizar_imagenes(imagenes)
            
            # Validar imágenes
            if not lista_imagenes:
                raise ValueError("No se proporcionaron imágenes válidas para procesar")
            
            # Validar objetos
            lista_objetos = objetos or []
            
            # Normalizar deadline
            deadline_datetime = self._normalizar_deadline(deadline)
            
            # Normalizar método forzado
            metodo_enum = self._normalizar_metodo_forzado(metodo_forzado)
            
            # Aplicar configuración personalizada si se proporciona
            if configuracion_personalizada and self.agent:
                self.agent.config.update(configuracion_personalizada)
            
            logger.info(f"Iniciando procesamiento 2D-3D con {len(lista_imagenes)} imágenes")
            
            # Procesar con el agente
            resultado = await self.agent.procesar_imagenes_2d_3d(
                imagenes=lista_imagenes,
                objetos=lista_objetos,
                presupuesto=presupuesto,
                prioridad=prioridad,
                deadline=deadline_datetime,
                metodo_forzado=metodo_enum
            )
            
            logger.info(f"Procesamiento completado: {resultado.get('exito', False)}")
            
            return resultado
            
        except Exception as e:
            logger.error(f"Error en procesamiento 2D-3D: {e}")
            raise
    
    async def evaluar_sin_procesar(self, 
                                  imagenes: Union[str, List[str]],
                                  objetos: Optional[List[Dict]] = None,
                                  presupuesto: float = 100.0,
                                  prioridad: int = 3,
                                  deadline: Optional[Union[str, datetime]] = None) -> Dict[str, Any]:
        """
        Solo evalúa qué técnica usar sin procesar
        
        Args:
            imagenes: Ruta a archivo de imagen o lista de rutas de imágenes
            objetos: Lista de objetos 3D a procesar (opcional)
            presupuesto: Presupuesto máximo en USD
            prioridad: Prioridad de 1-5
            deadline: Deadline como string ISO o datetime (opcional)
            
        Returns:
            Dict con evaluación de factores y decisión recomendada
        """
        
        if not self.session_active or not self.agent:
            raise RuntimeError("La sesión del agente no está activa")
        
        try:
            # Normalizar entradas
            lista_imagenes = self._normalizar_imagenes(imagenes)
            lista_objetos = objetos or []
            deadline_datetime = self._normalizar_deadline(deadline)
            
            # Evaluar factores
            factores = self.agent.evaluador.generar_evaluacion(
                imagenes=lista_imagenes,
                objetos=lista_objetos,
                presupuesto=presupuesto,
                prioridad=prioridad,
                deadline=deadline_datetime
            )
            
            # Seleccionar técnica
            decision = self.agent.selector.seleccionar_tecnica(factores)
            
            return {
                "factores_evaluacion": {
                    "num_imagenes": factores.num_imagenes,
                    "calidad_imagenes": factores.calidad_imagenes,
                    "complejidad_objeto": factores.complejidad_objeto,
                    "recursos_servidor": factores.recursos_servidor,
                    "tiempo_requerido": factores.tiempo_requerido,
                    "presupuesto": factores.presupuesto,
                    "prioridad": factores.prioridad,
                    "deadline": factores.deadline.isoformat() if factores.deadline else None
                },
                "decision_recomendada": {
                    "metodo_seleccionado": decision.metodo_seleccionado.value,
                    "confianza": decision.confianza,
                    "razones": decision.razones,
                    "recursos_estimados": decision.recursos_estimados,
                    "tiempo_estimado": decision.tiempo_estimado,
                    "costo_estimado": decision.costo_estimado,
                    "prioridad_factores": decision.prioridad_factores,
                    "alternativas": decision.alternativas
                },
                "timestamp": datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error en evaluación: {e}")
            raise
    
    async def obtener_estadisticas(self) -> Dict[str, Any]:
        """Obtiene estadísticas detalladas del agente"""
        
        if not self.session_active or not self.agent:
            raise RuntimeError("La sesión del agente no está activa")
        
        try:
            return await self.agent.obtener_estadisticas()
            
        except Exception as e:
            logger.error(f"Error obteniendo estadísticas: {e}")
            raise
    
    async def procesar_lote(self, 
                           trabajos: List[Dict[str, Any]], 
                           concurrencia: int = 3) -> List[Dict[str, Any]]:
        """
        Procesa múltiples trabajos en lote
        
        Args:
            trabajos: Lista de trabajos con parámetros de procesamiento
            concurrencia: Número máximo de trabajos simultáneos
            
        Returns:
            Lista de resultados de procesamiento
        """
        
        if not self.session_active:
            raise RuntimeError("La sesión del agente no está activa")
        
        semaphore = asyncio.Semaphore(concurrencia)
        
        async def procesar_trabajo(trabajo):
            async with semaphore:
                return await self.procesar_2d_a_3d(**trabajo)
        
        logger.info(f"Procesando lote de {len(trabajos)} trabajos con concurrencia {concurrencia}")
        
        resultados = await asyncio.gather(*[procesar_trabajo(trabajo) for trabajo in trabajos], 
                                         return_exceptions=True)
        
        # Procesar resultados y excepciones
        resultados_procesados = []
        for i, resultado in enumerate(resultados):
            if isinstance(resultado, Exception):
                resultados_procesados.append({
                    "trabajo_id": i,
                    "exito": False,
                    "error": str(resultado),
                    "timestamp": datetime.now().isoformat()
                })
            else:
                resultado["trabajo_id"] = i
                resultados_procesados.append(resultado)
        
        return resultados_procesados
    
    async def simular_recursos(self, 
                              metodo: str,
                              num_imagenes: int,
                              calidad_estimada: float = 0.8) -> Dict[str, Any]:
        """
        Simula el uso de recursos para un método específico
        
        Args:
            metodo: Método a simular ('colmap_local', 'openrouter_api', 'hibrido')
            num_imagenes: Número de imágenes a procesar
            calidad_estimada: Calidad estimada de las imágenes (0.0-1.0)
            
        Returns:
            Dict con simulación de recursos
        """
        
        metodo_enum = self._normalizar_metodo_forzado(metodo)
        
        # Obtener configuración del método
        config = self.agent.selector.config_metodos[metodo_enum]
        
        # Calcular estimaciones
        tiempo_total = config["tiempo_por_imagen"] * num_imagenes
        costo_total = config["costo_por_imagen"] * num_imagenes
        calidad_esperada = config["calidad_base"] * calidad_estimada
        
        recursos_estimados = {
            "cpu_uso_promedio": config["recursos_cpu"] * 100,
            "ram_uso_promedio": config["recursos_ram"] * 100,
            "disco_temporal_estimado": min(200, num_imagenes * 2),
            "tiempo_procesamiento_estimado": tiempo_total,
            "calidad_resultado_estimada": calidad_esperada,
            "costo_total_estimado": costo_total,
            "confiabilidad": config["confiabilidad"]
        }
        
        return {
            "metodo": metodo,
            "num_imagenes": num_imagenes,
            "calidad_estimada": calidad_estimada,
            "recursos_estimados": recursos_estimados,
            "timestamp": datetime.now().isoformat()
        }
    
    async def comparar_metodos(self, 
                              imagenes: Union[str, List[str]],
                              presupuesto: float = 100.0) -> Dict[str, Any]:
        """
        Compara los tres métodos para las mismas imágenes
        
        Args:
            imagenes: Imágenes a evaluar
            presupuesto: Presupuesto máximo
            
        Returns:
            Dict con comparación detallada de métodos
        """
        
        lista_imagenes = self._normalizar_imagenes(imagenes)
        resultados = {}
        
        # Evaluar factores una sola vez
        factores = self.agent.evaluador.generar_evaluacion(
            imagenes=lista_imagenes,
            objetos=[],
            presupuesto=presupuesto
        )
        
        # Evaluar cada método
        for metodo in MetodoProcesamiento:
            try:
                # Crear decisión para este método específico
                from .selector_tecnica_agent import DecisionTecnica
                
                config = self.agent.selector.config_metodos[metodo]
                tiempo_estimado = config["tiempo_por_imagen"] * factores.num_imagenes
                costo_estimado = config["costo_por_imagen"] * factores.num_imagenes
                
                # Verificar si cumple presupuesto
                cumple_presupuesto = costo_estimado <= presupuesto
                
                # Simular recursos
                recursos = {
                    "cpu_uso": config["recursos_cpu"] * 100,
                    "ram_uso": config["recursos_ram"] * 100,
                    "disco_uso": min(200, factores.num_imagenes * 2),
                    "tiempo_procesamiento": tiempo_estimado
                }
                
                # Calcular puntuación (simplificada)
                puntuacion = 0.0
                if cumple_presupuesto:
                    puntuacion += 0.4
                puntuacion += config["calidad_base"] * 0.3
                puntuacion += config["confiabilidad"] * 0.2
                puntuacion += (1.0 - (tiempo_estimado / 600)) * 0.1  # Normalizar tiempo
                
                resultados[metodo.value] = {
                    "disponible": config["disponible"],
                    "cumple_presupuesto": cumple_presupuesto,
                    "tiempo_estimado": tiempo_estimado,
                    "costo_estimado": costo_estimado,
                    "calidad_esperada": config["calidad_base"],
                    "recursos_necesarios": recursos,
                    "confiabilidad": config["confiabilidad"],
                    "puntuacion": puntuacion,
                    "recomendado": puntuacion > 0.7
                }
                
            except Exception as e:
                resultados[metodo.value] = {
                    "disponible": False,
                    "error": str(e)
                }
        
        return {
            "factores_evaluacion": {
                "num_imagenes": factores.num_imagenes,
                "calidad_imagenes": factores.calidad_imagenes,
                "presupuesto": presupuesto,
                "recursos_servidor": factores.recursos_servidor
            },
            "comparacion_metodos": resultados,
            "metodo_recomendado": max(resultados.items(), key=lambda x: x[1].get("puntuacion", 0))[0],
            "timestamp": datetime.now().isoformat()
        }
    
    async def cerrar(self):
        """Cierra la sesión del agente"""
        
        if self.agent:
            await self.agent.cerrar()
            self.agent = None
        
        self.session_active = False
        logger.info("Interfaz del Agente Selector de Técnica cerrada")
    
    def _normalizar_imagenes(self, imagenes: Union[str, List[str]]) -> List[str]:
        """Normaliza la entrada de imágenes a una lista"""
        
        if isinstance(imagenes, str):
            return [imagenes]
        elif isinstance(imagenes, list):
            return imagenes
        else:
            raise ValueError(f"Tipo de imagen no soportado: {type(imagenes)}")
    
    def _normalizar_deadline(self, deadline: Optional[Union[str, datetime]]) -> Optional[datetime]:
        """Normaliza el deadline a datetime"""
        
        if deadline is None:
            return None
        elif isinstance(deadline, datetime):
            return deadline
        elif isinstance(deadline, str):
            try:
                return datetime.fromisoformat(deadline.replace('Z', '+00:00'))
            except ValueError:
                raise ValueError(f"Formato de deadline inválido: {deadline}")
        else:
            raise ValueError(f"Tipo de deadline no soportado: {type(deadline)}")
    
    def _normalizar_metodo_forzado(self, metodo: Optional[str]) -> Optional[MetodoProcesamiento]:
        """Normaliza el método forzado a enum"""
        
        if metodo is None:
            return None
        
        metodos_validos = {
            "colmap_local": MetodoProcesamiento.COLMAP_LOCAL,
            "openrouter_api": MetodoProcesamiento.OPENROUTER_API,
            "hibrido": MetodoProcesamiento.HIBRIDO
        }
        
        metodo_normalizado = metodo.lower().replace(" ", "_").replace("-", "_")
        
        if metodo_normalizado not in metodos_validos:
            raise ValueError(f"Método no válido: {metodo}. Válidos: {list(metodos_validos.keys())}")
        
        return metodos_validos[metodo_normalizado]


# Funciones de conveniencia
async def crear_interfaz_simple(config_path: Optional[str] = None) -> InterfazAgenteSelector:
    """Crea una interfaz simple del agente"""
    
    interfaz = InterfazAgenteSelector(config_path)
    await interfaz.inicializar()
    return interfaz


async def procesar_rapido(imagenes: Union[str, List[str]], 
                         presupuesto: float = 100.0) -> Dict[str, Any]:
    """Procesamiento rápido con configuración por defecto"""
    
    interfaz = await crear_interfaz_simple()
    try:
        resultado = await interfaz.procesar_2d_a_3d(imagenes, presupuesto=presupuesto)
        return resultado
    finally:
        await interfaz.cerrar()


# Ejemplo de uso
if __name__ == "__main__":
    async def ejemplo_uso():
        """Ejemplo de uso del agente"""
        
        # Crear interfaz
        interfaz = await crear_interfaz_simple()
        
        try:
            # Ejemplo 1: Evaluación simple
            print("=== Ejemplo 1: Evaluación ===")
            evaluacion = await interfaz.evaluar_sin_procesar(
                imagenes=["imagen1.jpg", "imagen2.jpg"],
                presupuesto=50.0,
                prioridad=4
            )
            print(json.dumps(evaluacion, indent=2, default=str))
            
            # Ejemplo 2: Comparación de métodos
            print("\n=== Ejemplo 2: Comparación ===")
            comparacion = await interfaz.comparar_metodos(
                imagenes=["imagen1.jpg", "imagen2.jpg", "imagen3.jpg"],
                presupuesto=100.0
            )
            print(json.dumps(comparacion, indent=2, default=str))
            
            # Ejemplo 3: Procesamiento completo
            print("\n=== Ejemplo 3: Procesamiento ===")
            resultado = await interfaz.procesar_2d_a_3d(
                imagenes=["imagen1.jpg", "imagen2.jpg"],
                presupuesto=75.0,
                prioridad=3
            )
            print(json.dumps(resultado, indent=2, default=str))
            
        finally:
            await interfaz.cerrar()
    
    # Ejecutar ejemplo
    asyncio.run(ejemplo_uso())
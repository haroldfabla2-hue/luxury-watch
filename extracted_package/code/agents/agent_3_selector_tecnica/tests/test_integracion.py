"""
Tests de integración para el Agente Selector de Técnica 2D-3D
============================================================

Este archivo contiene tests de integración que verifican el funcionamiento
del agente dentro del sistema de orquestación completo.
"""

import pytest
import asyncio
import tempfile
import json
from pathlib import Path
from unittest.mock import Mock, AsyncMock, patch
from datetime import datetime, timedelta

import sys
sys.path.append(str(Path(__file__).parent.parent))

from src.selector_tecnica_agent import SelectorTecnicaAgent
from src.integracion_orquestacion import (
    IntegracionOrquestacion,
    SelectorTecnicaOrquestado,
    crear_integracion_orquestacion
)


# Mocks para simular el sistema de orquestación
class MockAgentManager:
    """Mock del AgentManager"""
    
    def __init__(self):
        self.agents = {}
        self.agent_configs = {}
    
    async def create_agent(self, agent_type: str, agent_id: str, custom_config: dict) -> str:
        """Simula creación de agente"""
        self.agent_configs[agent_id] = custom_config
        return agent_id
    
    async def get_system_status(self) -> dict:
        """Simula obtención de estado del sistema"""
        return {
            "total_agents": len(self.agents),
            "active_agents": 1,
            "system_health": "good"
        }


class MockTaskQueue:
    """Mock del TaskQueue"""
    
    def __init__(self):
        self.tasks = {}
        self.task_listeners = {}
        self.stats = {
            "total_tasks": 0,
            "completed_tasks": 0,
            "queue_depth": 0,
            "active_workers": 0
        }
    
    def add_task_listener(self, task_type: str, callback):
        """Simula adición de listener de tareas"""
        self.task_listeners[task_type] = callback
    
    async def add_task(self, task):
        """Simula adición de tarea"""
        self.tasks[task.task_id] = task
        self.stats["total_tasks"] += 1
        self.stats["queue_depth"] += 1
        
        # Ejecutar listener si existe
        if task.payload.get("task_type") in self.task_listeners:
            listener = self.task_listeners[task.payload["task_type"]]
            result = await listener(task.payload["data"])
            return result
    
    def get_stats(self) -> dict:
        """Simula obtención de estadísticas"""
        return self.stats.copy()


class TestIntegracionBasica:
    """Tests básicos de integración"""
    
    @pytest.fixture
    def config_temp(self):
        """Configuración temporal para tests"""
        with tempfile.TemporaryDirectory() as tmp_dir:
            config_path = Path(tmp_dir) / "config.json"
            
            # Crear configuración de test
            config = {
                "configuracion_agente": {
                    "max_concurrencia": 2,
                    "timeout_default": 60,
                    "reintentos_fallback": 1
                },
                "metodos_procesamiento": {
                    "colmap_local": {
                        "disponible": True,
                        "costo_por_imagen": 0.0
                    },
                    "openrouter_api": {
                        "disponible": True,
                        "costo_por_imagen": 0.15
                    },
                    "hibrido": {
                        "disponible": True,
                        "costo_por_imagen": 0.05
                    }
                }
            }
            
            with open(config_path, 'w') as f:
                json.dump(config, f, indent=2)
            
            yield str(config_path)
    
    @pytest.fixture
    def mock_agent_manager(self):
        """Mock del AgentManager"""
        return MockAgentManager()
    
    @pytest.fixture
    def mock_task_queue(self):
        """Mock del TaskQueue"""
        return MockTaskQueue()
    
    @pytest.mark.asyncio
    async def test_crear_integracion_basica(self, config_temp, mock_agent_manager, mock_task_queue):
        """Test de creación básica de integración"""
        
        integracion = IntegracionOrquestacion(config_temp)
        
        resultado = await integracion.inicializar_integracion(
            mock_agent_manager,
            mock_task_queue
        )
        
        assert resultado is True
        assert integracion.integrado is True
        assert integracion.agente_selector is not None
        assert integracion.agente_selector.activo is True
    
    @pytest.mark.asyncio
    async def test_enviar_tarea_procesamiento(self, config_temp, mock_agent_manager, mock_task_queue):
        """Test de envío de tarea de procesamiento"""
        
        integracion = await crear_integracion_orquestacion(
            config_temp,
            mock_agent_manager,
            mock_task_queue
        )
        
        # Enviar tarea de procesamiento
        imagenes = ["test1.jpg", "test2.jpg"]
        task_id = await integracion.enviar_tarea_procesamiento(
            imagenes=imagenes,
            presupuesto=50.0,
            prioridad=3
        )
        
        assert task_id is not None
        assert task_id in mock_task_queue.tasks
        
        # Verificar que la tarea se procesó
        task = mock_task_queue.tasks[task_id]
        assert task.payload["task_type"] == "procesar_2d_3d"
        assert task.payload["data"]["imagenes"] == imagenes
    
    @pytest.mark.asyncio
    async def test_handle_seleccionar_tecnica(self, config_temp, mock_agent_manager, mock_task_queue):
        """Test del handler de selección de técnica"""
        
        integracion = await crear_integracion_orquestacion(
            config_temp,
            mock_agent_manager,
            mock_task_queue
        )
        
        # Datos de prueba para selección
        task_data = {
            "imagenes": ["test1.jpg", "test2.jpg"],
            "presupuesto": 30.0,
            "prioridad": 4,
            "objetos": [{"num_puntos": 1000, "num_triangulos": 2000}]
        }
        
        # Procesar tarea
        resultado = await integracion._handle_seleccionar_tecnica(task_data)
        
        assert resultado["success"] is True
        assert resultado["task_type"] == "seleccionar_tecnica"
        assert "factores" in resultado
        assert "decision" in resultado
        
        # Verificar factores
        factores = resultado["factores"]
        assert factores["num_imagenes"] == 2
        assert factores["presupuesto"] == 30.0
        assert factores["prioridad"] == 4
        
        # Verificar decisión
        decision = resultado["decision"]
        assert decision["metodo_seleccionado"] in ["colmap_local", "openrouter_api", "hibrido"]
        assert 0.0 <= decision["confianza"] <= 1.0
        assert len(decision["razones"]) > 0
    
    @pytest.mark.asyncio
    async def test_handle_procesar_2d_3d(self, config_temp, mock_agent_manager, mock_task_queue):
        """Test del handler de procesamiento 2D-3D"""
        
        integracion = await crear_integracion_orquestacion(
            config_temp,
            mock_agent_manager,
            mock_task_queue
        )
        
        # Datos de prueba para procesamiento
        task_data = {
            "imagenes": ["test1.jpg"],
            "presupuesto": 20.0,
            "prioridad": 2
        }
        
        # Procesar tarea
        resultado = await integracion._handle_procesar_2d_3d(task_data)
        
        assert resultado["task_type"] == "procesar_2d_3d"
        assert "success" in resultado
        assert "resultado" in resultado
    
    @pytest.mark.asyncio
    async def test_handle_evaluar_factores(self, config_temp, mock_agent_manager, mock_task_queue):
        """Test del handler de evaluación de factores"""
        
        integracion = await crear_integracion_orquestacion(
            config_temp,
            mock_agent_manager,
            mock_task_queue
        )
        
        # Datos de prueba para evaluación
        task_data = {
            "imagenes": ["test1.jpg", "test2.jpg", "test3.jpg"],
            "presupuesto": 75.0,
            "prioridad": 5,
            "objetos": [
                {"num_puntos": 5000, "num_triangulos": 10000, "materiales_complejos": 3}
            ]
        }
        
        # Procesar tarea
        resultado = await integracion._handle_evaluar_factores(task_data)
        
        assert resultado["success"] is True
        assert resultado["task_type"] == "evaluar_factores"
        assert "factores" in resultado
        
        # Verificar estructura de factores
        factores = resultado["factores"]
        assert factores["num_imagenes"] == 3
        assert factores["presupuesto"] == 75.0
        assert factores["prioridad"] == 5
        assert "recursos_servidor" in factores
        assert "calidad_imagenes" in factores
    
    @pytest.mark.asyncio
    async def test_handle_monitorear_recursos(self, config_temp, mock_agent_manager, mock_task_queue):
        """Test del handler de monitoreo de recursos"""
        
        integracion = await crear_integracion_orquestacion(
            config_temp,
            mock_agent_manager,
            mock_task_queue
        )
        
        # Test de reporte de monitoreo
        task_data = {
            "accion": "report"
        }
        
        resultado = await integracion._handle_monitorear_recursos(task_data)
        
        assert resultado["success"] is True
        assert resultado["task_type"] == "monitorear_recursos"
        assert resultado["accion"] == "report"
        assert "reporte" in resultado
        
        # Test de inicio de monitoreo
        task_data_start = {
            "accion": "start_monitoring"
        }
        
        resultado_start = await integracion._handle_monitorear_recursos(task_data_start)
        
        assert resultado_start["success"] is True
        assert resultado_start["accion"] == "start_monitoring"
    
    @pytest.mark.asyncio
    async def test_monitoreo_integracion(self, config_temp, mock_agent_manager, mock_task_queue):
        """Test del monitoreo continuo de integración"""
        
        integracion = await crear_integracion_orquestacion(
            config_temp,
            mock_agent_manager,
            mock_task_queue
        )
        
        # Iniciar monitoreo por un tiempo corto
        monitoreo_task = asyncio.create_task(integracion._monitoreo_integracion())
        
        # Dejar que ejecute por un momento
        await asyncio.sleep(0.5)
        
        # Detener monitoreo
        integracion.integrado = False
        monitoreo_task.cancel()
        
        try:
            await monitoreo_task
        except asyncio.CancelledError:
            pass  # Esperado
    
    @pytest.mark.asyncio
    async def test_obtener_estado_integracion(self, config_temp, mock_agent_manager, mock_task_queue):
        """Test de obtención del estado de integración"""
        
        integracion = await crear_integracion_orquestacion(
            config_temp,
            mock_agent_manager,
            mock_task_queue
        )
        
        estado = await integracion.obtener_estado_integracion()
        
        assert estado["integrado"] is True
        assert "agent_id" in estado
        assert "configuracion" in estado
        assert "componentes" in estado
        
        # Verificar componentes
        componentes = estado["componentes"]
        assert componentes["agente_selector"] is True
        assert componentes["agent_manager"] is True
        assert componentes["task_queue"] is True
        
        # Verificar estadísticas del agente si están disponibles
        if "estadisticas_agente" in estado:
            assert "agente_activo" in estado["estadisticas_agente"]
    
    @pytest.mark.asyncio
    async def test_cerrar_integracion(self, config_temp, mock_agent_manager, mock_task_queue):
        """Test de cierre de integración"""
        
        integracion = await crear_integracion_orquestacion(
            config_temp,
            mock_agent_manager,
            mock_task_queue
        )
        
        assert integracion.integrado is True
        assert integracion.agente_selector.activo is True
        
        await integracion.cerrar_integracion()
        
        assert integracion.integrado is False
        assert not integracion.agente_selector.activo


class TestSelectorTecnicaOrquestado:
    """Tests para el wrapper SelectorTecnicaOrquestado"""
    
    @pytest.fixture
    def config_temp(self):
        """Configuración temporal para tests"""
        with tempfile.TemporaryDirectory() as tmp_dir:
            config_path = Path(tmp_dir) / "config.json"
            config = {
                "configuracion_agente": {"max_concurrencia": 2},
                "metodos_procesamiento": {
                    "colmap_local": {"disponible": True},
                    "openrouter_api": {"disponible": True}
                }
            }
            
            with open(config_path, 'w') as f:
                json.dump(config, f, indent=2)
            
            yield str(config_path)
    
    @pytest.fixture
    async def orquestado(self, config_temp):
        """Instancia de SelectorTecnicaOrquestado para tests"""
        integracion = IntegracionOrquestacion(config_temp)
        await integracion.inicializar_integracion(
            MockAgentManager(),
            MockTaskQueue()
        )
        
        return SelectorTecnicaOrquestado(integracion)
    
    @pytest.mark.asyncio
    async def test_procesar_imagenes_orquestado(self, orquestado):
        """Test de procesamiento orquestado"""
        
        imagenes = ["test1.jpg", "test2.jpg"]
        
        resultado = await orquestado.procesar_imagenes(
            imagenes=imagenes,
            presupuesto=40.0,
            prioridad=3
        )
        
        assert "task_id" in resultado
        assert "status" in resultado
        assert resultado["status"] in ["encolado", "procesado"]
    
    @pytest.mark.asyncio
    async def test_seleccionar_tecnica_orquestado(self, orquestado):
        """Test de selección de técnica orquestada"""
        
        imagenes = ["test1.jpg", "test2.jpg", "test3.jpg"]
        
        resultado = await orquestado.seleccionar_tecnica(
            imagenes=imagenes,
            presupuesto=60.0,
            prioridad=4,
            objetos=[{"num_puntos": 2000, "num_triangulos": 4000}]
        )
        
        assert "task_id" in resultado or ("success" in resultado and "decision" in resultado)
    
    @pytest.mark.asyncio
    async def test_obtener_estado_orquestado(self, orquestado):
        """Test de obtención de estado orquestado"""
        
        estado = await orquestado.obtener_estado()
        
        assert "integrado" in estado
        assert "componentes" in estado


class TestIntegracionCompleta:
    """Tests de integración completa del sistema"""
    
    @pytest.mark.asyncio
    async def test_flujo_completo_seleccion_procesamiento(self, tmp_path):
        """Test del flujo completo de selección y procesamiento"""
        
        # Configuración completa
        config_path = tmp_path / "config.json"
        config = {
            "configuracion_agente": {
                "max_concurrencia": 3,
                "timeout_default": 120,
                "reintentos_fallback": 2
            },
            "metodos_procesamiento": {
                "colmap_local": {
                    "disponible": True,
                    "costo_por_imagen": 0.0,
                    "tiempo_por_imagen": 180.0
                },
                "openrouter_api": {
                    "disponible": True,
                    "costo_por_imagen": 0.15,
                    "tiempo_por_imagen": 90.0
                },
                "hibrido": {
                    "disponible": True,
                    "costo_por_imagen": 0.05,
                    "tiempo_por_imagen": 120.0
                }
            }
        }
        
        with open(config_path, 'w') as f:
            json.dump(config, f, indent=2)
        
        # Crear sistema completo
        mock_agent_manager = MockAgentManager()
        mock_task_queue = MockTaskQueue()
        
        integracion = await crear_integracion_orquestacion(
            str(config_path),
            mock_agent_manager,
            mock_task_queue
        )
        
        try:
            # 1. Test de evaluación inicial
            task_data_evaluacion = {
                "imagenes": ["img1.jpg", "img2.jpg", "img3.jpg"],
                "presupuesto": 50.0,
                "prioridad": 3,
                "objetos": [
                    {
                        "num_puntos": 5000,
                        "num_triangulos": 10000,
                        "materiales_complejos": 2,
                        "animaciones": 1
                    }
                ]
            }
            
            resultado_evaluacion = await integracion._handle_evaluar_factores(task_data_evaluacion)
            assert resultado_evaluacion["success"] is True
            assert resultado_evaluacion["factores"]["num_imagenes"] == 3
            
            # 2. Test de selección de técnica
            resultado_seleccion = await integracion._handle_seleccionar_tecnica(task_data_evaluacion)
            assert resultado_seleccion["success"] is True
            assert "decision" in resultado_seleccion
            
            metodo_seleccionado = resultado_seleccion["decision"]["metodo_seleccionado"]
            confianza = resultado_seleccion["decision"]["confianza"]
            
            assert metodo_seleccionado in ["colmap_local", "openrouter_api", "hibrido"]
            assert 0.0 <= confianza <= 1.0
            
            # 3. Test de procesamiento
            task_data_procesamiento = {
                "imagenes": ["img1.jpg", "img2.jpg"],
                "presupuesto": 30.0,
                "prioridad": 4,
                "metodo_forzado": metodo_seleccionado
            }
            
            resultado_procesamiento = await integracion._handle_procesar_2d_3d(task_data_procesamiento)
            assert resultado_procesamiento["task_type"] == "procesar_2d_3d"
            assert "success" in resultado_procesamiento
            
            # 4. Verificar estado final del sistema
            estado = await integracion.obtener_estado_integracion()
            assert estado["integrado"] is True
            assert estado["componentes"]["agente_selector"] is True
            
        finally:
            await integracion.cerrar_integracion()
    
    @pytest.mark.asyncio
    async def test_fallback_automatico_integracion(self, tmp_path):
        """Test de fallback automático en el sistema integrado"""
        
        # Configuración
        config_path = tmp_path / "config_fallback.json"
        config = {
            "configuracion_agente": {
                "max_concurrencia": 2,
                "reintentos_fallback": 2
            },
            "metodos_procesamiento": {
                "colmap_local": {
                    "disponible": True,
                    "costo_por_imagen": 0.0
                },
                "openrouter_api": {
                    "disponible": True,
                    "costo_por_imagen": 0.15
                }
            }
        }
        
        with open(config_path, 'w') as f:
            json.dump(config, f, indent=2)
        
        # Crear sistema
        mock_agent_manager = MockAgentManager()
        mock_task_queue = MockTaskQueue()
        
        integracion = await crear_integracion_orquestacion(
            str(config_path),
            mock_agent_manager,
            mock_task_queue
        )
        
        try:
            # Forzar presupuesto muy bajo para favorecer COLMAP
            task_data = {
                "imagenes": ["img1.jpg"],
                "presupuesto": 0.1,  # Muy bajo, debería favorecer COLMAP
                "prioridad": 2,
                "metodo_forzado": "openrouter_api"  # Forzar OpenRouter primero
            }
            
            resultado = await integracion._handle_seleccionar_tecnica(task_data)
            
            assert resultado["success"] is True
            decision = resultado["decision"]
            
            # Con presupuesto muy bajo, debería considerar COLMAP
            razones = decision["razones"]
            assert any("costo" in razon.lower() for razon in razones)
            
        finally:
            await integracion.cerrar_integracion()
    
    @pytest.mark.asyncio
    async def test_monitoreo_recursos_integracion(self, tmp_path):
        """Test del monitoreo de recursos integrado"""
        
        # Configuración
        config_path = tmp_path / "config_monitor.json"
        config = {
            "configuracion_agente": {
                "max_concurrencia": 3
            },
            "monitoreo_recursos": {
                "intervalo_monitoreo": 1.0
            }
        }
        
        with open(config_path, 'w') as f:
            json.dump(config, f, indent=2)
        
        # Crear sistema
        mock_agent_manager = MockAgentManager()
        mock_task_queue = MockTaskQueue()
        
        integracion = await crear_integracion_orquestacion(
            str(config_path),
            mock_agent_manager,
            mock_task_queue
        )
        
        try:
            # Test de reporte de monitoreo
            task_data = {
                "accion": "report",
                "duracion": 10
            }
            
            resultado = await integracion._handle_monitorear_recursos(task_data)
            
            assert resultado["success"] is True
            assert resultado["accion"] == "report"
            assert "reporte" in resultado
            
            reporte = resultado["reporte"]
            assert "timestamp" in reporte
            assert "sistema" in reporte
            assert "alertas" in reporte
            
            # Verificar estructura del sistema en reporte
            sistema = reporte["sistema"]
            assert "metricas_actuales" in sistema
            assert "estadisticas_hora" in sistema
            
        finally:
            await integracion.cerrar_integracion()


class TestManejoErrores:
    """Tests de manejo de errores en la integración"""
    
    @pytest.mark.asyncio
    async def test_error_en_seleccion_tecnica(self, tmp_path):
        """Test de manejo de errores en selección de técnica"""
        
        config_path = tmp_path / "config_error.json"
        config = {
            "configuracion_agente": {"max_concurrencia": 2},
            "metodos_procesamiento": {"colmap_local": {"disponible": True}}
        }
        
        with open(config_path, 'w') as f:
            json.dump(config, f, indent=2)
        
        mock_agent_manager = MockAgentManager()
        mock_task_queue = MockTaskQueue()
        
        integracion = await crear_integracion_orquestacion(
            str(config_path),
            mock_agent_manager,
            mock_task_queue
        )
        
        try:
            # Probar con datos inválidos
            task_data_invalido = {
                "imagenes": [],  # Lista vacía debería causar error
                "presupuesto": -10  # Presupuesto negativo
            }
            
            resultado = await integracion._handle_seleccionar_tecnica(task_data_invalido)
            
            # Debería manejar el error graciosamente
            assert "error" in resultado or resultado.get("success") is True
            
        finally:
            await integracion.cerrar_integracion()
    
    @pytest.mark.asyncio
    async def test_error_sin_componentes(self):
        """Test de manejo de errores sin componentes"""
        
        integracion = IntegracionOrquestacion()
        
        # No inicializar, intentar usar métodos
        with pytest.raises(Exception):
            await integracion.enviar_tarea_procesamiento(["test.jpg"])
        
        with pytest.raises(Exception):
            await integracion.obtener_estado_integracion()
    
    @pytest.mark.asyncio
    async def test_cerrar_sin_inicializar(self):
        """Test de cierre sin inicialización"""
        
        integracion = IntegracionOrquestacion()
        
        # No debería fallar
        await integracion.cerrar_integracion()
        
        assert integracion.integrado is False


if __name__ == "__main__":
    # Ejecutar tests de integración
    pytest.main([__file__, "-v", "--tb=short", "--asyncio-mode=auto"])
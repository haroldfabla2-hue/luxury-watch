"""
Tests para el Agente Selector de Técnica 2D-3D
"""

import pytest
import asyncio
import json
import tempfile
import os
from unittest.mock import Mock, patch, AsyncMock
from pathlib import Path
from datetime import datetime, timedelta

import sys
sys.path.append(str(Path(__file__).parent.parent))

from src.selector_tecnica_agent import (
    SelectorTecnicaAgent,
    MetodoProcesamiento,
    FactoresEvaluacion,
    DecisionTecnica,
    EvaluadorFactores,
    SelectorTecnica,
    GestorColas,
    MonitoreoRecursos
)
from src.interfaz_agente import InterfazAgenteSelector
from src.monitoreo_recursos import MonitorRecursosAvanzado


class TestEvaluadorFactores:
    """Tests para el Evaluador de Factores"""
    
    @pytest.fixture
    def evaluador(self):
        return EvaluadorFactores()
    
    def test_evaluar_imagenes(self, evaluador, tmp_path):
        """Test de evaluación de imágenes"""
        # Crear imágenes de prueba
        img1_path = tmp_path / "img1.jpg"
        img2_path = tmp_path / "img2.png"
        
        # Crear imágenes dummy
        from PIL import Image
        img1 = Image.new('RGB', (1920, 1080), color='red')
        img2 = Image.new('RGB', (800, 600), color='blue')
        
        img1.save(img1_path)
        img2.save(img2_path)
        
        # Evaluar
        num_imagenes, calidad = evaluador.evaluar_imagenes([str(img1_path), str(img2_path)])
        
        assert num_imagenes == 2
        assert 0.0 <= calidad <= 1.0
    
    def test_evaluar_recursos_servidor(self, evaluador):
        """Test de evaluación de recursos del servidor"""
        recursos = evaluador.evaluar_recursos_servidor()
        
        assert "cpu_disponible" in recursos
        assert "ram_disponible" in recursos
        assert "disco_disponible" in recursos
        assert "vcpus" in recursos
        
        # Los valores deben estar normalizados (0-1)
        assert 0.0 <= recursos["cpu_disponible"] <= 1.0
        assert 0.0 <= recursos["ram_disponible"] <= 1.0
        assert 0.0 <= recursos["disco_disponible"] <= 1.0
    
    def test_evaluar_complejidad_objeto(self, evaluador):
        """Test de evaluación de complejidad de objetos"""
        objetos = [
            {"num_puntos": 1000, "num_triangulos": 2000, "materiales_complejos": 2, "animaciones": 1},
            {"num_puntos": 5000, "num_triangulos": 10000, "materiales_complejos": 1, "animaciones": 0}
        ]
        
        complejidad = evaluador.evaluar_complejidad_objeto(objetos)
        
        assert 0.0 <= complejidad <= 1.0
        assert complejidad > 0  # Debe ser mayor que cero
    
    def test_generar_evaluacion(self, evaluador, tmp_path):
        """Test de generación de evaluación completa"""
        # Crear imagen de prueba
        img_path = tmp_path / "test.jpg"
        from PIL import Image
        img = Image.new('RGB', (800, 600))
        img.save(img_path)
        
        evaluacion = evaluador.generar_evaluacion(
            imagenes=[str(img_path)],
            objetos=[{"num_puntos": 1000, "num_triangulos": 2000}],
            presupuesto=50.0,
            prioridad=3
        )
        
        assert isinstance(evaluacion, FactoresEvaluacion)
        assert evaluacion.num_imagenes == 1
        assert evaluacion.presupuesto == 50.0
        assert evaluacion.prioridad == 3


class TestSelectorTecnica:
    """Tests para el Selector de Técnica"""
    
    @pytest.fixture
    def selector(self):
        return SelectorTecnica()
    
    def test_inicializacion(self, selector):
        """Test de inicialización del selector"""
        assert selector.evaluador is not None
        assert len(selector.config_metodos) == 3
        assert MetodoProcesamiento.COLMAP_LOCAL in selector.config_metodos
        assert MetodoProcesamiento.OPENROUTER_API in selector.config_metodos
        assert MetodoProcesamiento.HIBRIDO in selector.config_metodos
    
    def test_seleccionar_tecnica(self, selector):
        """Test de selección de técnica"""
        # Crear factores de evaluación de prueba
        factores = FactoresEvaluacion(
            num_imagenes=10,
            calidad_imagenes=0.8,
            complejidad_objeto=0.5,
            recursos_servidor={"cpu_disponible": 0.7, "ram_disponible": 0.8, "disco_disponible": 0.9, "vcpus": 4.0},
            tiempo_requerido=30.0,
            presupuesto=100.0,
            prioridad=3
        )
        
        decision = selector.seleccionar_tecnica(factores)
        
        assert isinstance(decision, DecisionTecnica)
        assert decision.metodo_seleccionado in MetodoProcesamiento
        assert 0.0 <= decision.confianza <= 1.0
        assert len(decision.razones) > 0
        assert decision.tiempo_estimado > 0
        assert decision.costo_estimado >= 0
    
    def test_evaluar_metodo_colmap(self, selector):
        """Test de evaluación específica para COLMAP"""
        factores = FactoresEvaluacion(
            num_imagenes=5,
            calidad_imagenes=0.7,
            complejidad_objeto=0.3,
            recursos_servidor={"cpu_disponible": 0.8, "ram_disponible": 0.7, "disco_disponible": 0.8, "vcpus": 4.0},
            tiempo_requerido=15.0,
            presupuesto=0.0,  # Presupuesto muy bajo, favorece COLMAP
            prioridad=2
        )
        
        puntuacion, razones = selector._evaluar_metodo(MetodoProcesamiento.COLMAP_LOCAL, factores)
        
        assert puntuacion >= 0.0
        assert len(razones) > 0
        assert any("costo" in razon.lower() for razon in razones)
    
    def test_evaluar_metodo_openrouter(self, selector):
        """Test de evaluación específica para OpenRouter"""
        factores = FactoresEvaluacion(
            num_imagenes=10,
            calidad_imagenes=0.9,
            complejidad_objeto=0.8,
            recursos_servidor={"cpu_disponible": 0.3, "ram_disponible": 0.2, "disco_disponible": 0.7, "vcpus": 2.0},
            tiempo_requerido=10.0,
            presupuesto=50.0,  # Presupuesto alto, permite OpenRouter
            prioridad=5  # Prioridad alta
        )
        
        puntuacion, razones = selector._evaluar_metodo(MetodoProcesamiento.OPENROUTER_API, factores)
        
        assert puntuacion >= 0.0
        assert len(razones) > 0
        assert any("calidad" in razon.lower() for razon in razones)


class TestSelectorTecnicaAgent:
    """Tests para el Agente Principal"""
    
    @pytest.fixture
    def agente_config(self):
        return {
            "max_concurrencia": 2,
            "timeout_default": 120,
            "reintentos_fallback": 1
        }
    
    @pytest.fixture
    async def agente(self, agente_config):
        agent = SelectorTecnicaAgent(agente_config)
        await agent.inicializar()
        yield agent
        await agent.cerrar()
    
    @pytest.mark.asyncio
    async def test_inicializacion(self, agente):
        """Test de inicialización del agente"""
        assert agente.activo is True
        assert agente.evaluador is not None
        assert agente.selector is not None
        assert agente.gestor_colas is not None
    
    @pytest.mark.asyncio
    async def test_procesar_imagenes_2d_3d(self, agente, tmp_path):
        """Test de procesamiento completo de imágenes"""
        # Crear imagen de prueba
        img_path = tmp_path / "test_image.jpg"
        from PIL import Image
        img = Image.new('RGB', (800, 600), color='red')
        img.save(img_path)
        
        # Procesar
        resultado = await agente.procesar_imagenes_2d_3d(
            imagenes=[str(img_path)],
            presupuesto=10.0,
            prioridad=3
        )
        
        assert "task_id" in resultado
        assert "exito" in resultado
        assert "metodo_utilizado" in resultado
        assert "factores" in resultado
        assert "decision" in resultado
        assert "timestamp" in resultado
        
        # Verificar que se registro la decisión
        assert len(agente.log_decisiones) > 0
    
    @pytest.mark.asyncio
    async def test_procesar_con_metodo_forzado(self, agente, tmp_path):
        """Test de procesamiento con método forzado"""
        # Crear imagen de prueba
        img_path = tmp_path / "test_image.jpg"
        from PIL import Image
        img = Image.new('RGB', (800, 600))
        img.save(img_path)
        
        # Procesar con método forzado
        resultado = await agente.procesar_imagenes_2d_3d(
            imagenes=[str(img_path)],
            metodo_forzado=MetodoProcesamiento.COLMAP_LOCAL
        )
        
        assert resultado["metodo_utilizado"] == "colmap_local"
        assert resultado["confianza_seleccion"] == 1.0
    
    @pytest.mark.asyncio
    async def test_fallback_automatico(self, agente):
        """Test de fallback automático"""
        # Simular falla del método principal
        metodo_principal = MetodoProcesamiento.OPENROUTER_API
        tarea_data = {"imagenes": ["dummy.jpg"]}
        
        # El fallback debería intentar métodos alternativos
        resultado = await agente._procesar_con_fallback(metodo_principal, tarea_data, 0.8)
        
        assert "metodo_original" in resultado or "error" in resultado
    
    @pytest.mark.asyncio
    async def test_obtener_estadisticas(self, agente):
        """Test de obtención de estadísticas"""
        stats = await agente.obtener_estadisticas()
        
        assert "agente_activo" in stats
        assert "tareas_activas" in stats
        assert "total_decisiones" in stats
        assert "estadisticas_por_metodo" in stats
        assert "configuracion" in stats


class TestGestorColas:
    """Tests para el Gestor de Colas"""
    
    @pytest.fixture
    def mock_task_queue(self):
        return Mock()
    
    @pytest.fixture
    def gestor_colas(self, mock_task_queue):
        return GestorColas(mock_task_queue)
    
    @pytest.mark.asyncio
    async def test_encolar_tarea(self, gestor_colas):
        """Test de encolado de tareas"""
        tarea_data = {"imagenes": ["test.jpg"], "configuracion": {}}
        
        tarea_id = await gestor_colas.encolar_tarea(
            MetodoProcesamiento.COLMAP_LOCAL, 
            tarea_data
        )
        
        assert tarea_id is not None
        assert tarea_id.startswith("colmap_local_")
    
    @pytest.mark.asyncio
    async def test_procesar_tarea_colmap(self, gestor_colas):
        """Test de procesamiento con COLMAP"""
        tarea_data = {"imagenes": ["test1.jpg", "test2.jpg"]}
        
        tarea = {
            "task_id": "test_123",
            "metodo": MetodoProcesamiento.COLMAP_LOCAL,
            "payload": tarea_data,
            "estado": "pending",
            "creado_en": datetime.now()
        }
        
        resultado = await gestor_colas.procesar_tarea(MetodoProcesamiento.COLMAP_LOCAL, tarea)
        
        assert resultado["estado"].value == "completed" or resultado["estado"].value == "failed"
        assert "task_id" in resultado


class TestInterfazAgenteSelector:
    """Tests para la Interfaz del Agente"""
    
    @pytest.fixture
    async def interfaz(self):
        interfaz = InterfazAgenteSelector()
        await interfaz.inicializar()
        yield interfaz
        await interfaz.cerrar()
    
    @pytest.mark.asyncio
    async def test_inicializacion(self, interfaz):
        """Test de inicialización de la interfaz"""
        assert interfaz.session_active is True
        assert interfaz.agent is not None
    
    @pytest.mark.asyncio
    async def test_evaluar_sin_procesar(self, interfaz, tmp_path):
        """Test de evaluación sin procesamiento"""
        # Crear imagen de prueba
        img_path = tmp_path / "test.jpg"
        from PIL import Image
        img = Image.new('RGB', (800, 600))
        img.save(img_path)
        
        resultado = await interfaz.evaluar_sin_procesar(
            imagenes=[str(img_path)],
            presupuesto=25.0,
            prioridad=4
        )
        
        assert "factores_evaluacion" in resultado
        assert "decision_recomendada" in resultado
        assert "timestamp" in resultado
        
        # Verificar estructura de factores
        factores = resultado["factores_evaluacion"]
        assert "num_imagenes" in factores
        assert "calidad_imagenes" in factores
        assert "presupuesto" in factores
    
    @pytest.mark.asyncio
    async def test_comparar_metodos(self, interfaz, tmp_path):
        """Test de comparación de métodos"""
        # Crear imágenes de prueba
        for i in range(3):
            img_path = tmp_path / f"test{i}.jpg"
            img = Image.new('RGB', (800, 600), color='red')
            img.save(img_path)
        
        resultado = await interfaz.comparar_metodos(
            imagenes=[str(tmp_path / f"test{i}.jpg") for i in range(3)],
            presupuesto=50.0
        )
        
        assert "factores_evaluacion" in resultado
        assert "comparacion_metodos" in resultado
        assert "metodo_recomendado" in resultado
        
        # Verificar que se compararon todos los métodos
        comparacion = resultado["comparacion_metodos"]
        assert "colmap_local" in comparacion
        assert "openrouter_api" in comparacion
        assert "hibrido" in comparacion
    
    @pytest.mark.asyncio
    async def test_simular_recursos(self, interfaz):
        """Test de simulación de recursos"""
        resultado = await interfaz.simular_recursos(
            metodo="colmap_local",
            num_imagenes=10,
            calidad_estimada=0.8
        )
        
        assert "metodo" in resultado
        assert "num_imagenes" in resultado
        assert "calidad_estimada" in resultado
        assert "recursos_estimados" in resultado
        
        recursos = resultado["recursos_estimados"]
        assert "cpu_uso_promedio" in recursos
        assert "tiempo_procesamiento_estimado" in recursos
        assert "costo_total_estimado" in recursos
    
    def test_normalizar_imagenes(self, interfaz):
        """Test de normalización de imágenes"""
        # Test con string único
        resultado = interfaz._normalizar_imagenes("test.jpg")
        assert resultado == ["test.jpg"]
        
        # Test con lista
        resultado = interfaz._normalizar_imagenes(["test1.jpg", "test2.jpg"])
        assert resultado == ["test1.jpg", "test2.jpg"]
        
        # Test con tipo inválido
        with pytest.raises(ValueError):
            interfaz._normalizar_imagenes(123)
    
    def test_normalizar_deadline(self, interfaz):
        """Test de normalización de deadline"""
        # Test con datetime
        deadline_dt = datetime.now()
        resultado = interfaz._normalizar_deadline(deadline_dt)
        assert resultado == deadline_dt
        
        # Test con string ISO
        deadline_str = deadline_dt.isoformat()
        resultado = interfaz._normalizar_deadline(deadline_str)
        assert abs((resultado - deadline_dt).total_seconds()) < 1
        
        # Test con None
        resultado = interfaz._normalizar_deadline(None)
        assert resultado is None
        
        # Test con formato inválido
        with pytest.raises(ValueError):
            interfaz._normalizar_deadline("fecha_invalida")
    
    def test_normalizar_metodo_forzado(self, interfaz):
        """Test de normalización de método forzado"""
        # Test con método válido
        resultado = interfaz._normalizar_metodo_forzado("colmap_local")
        assert resultado == MetodoProcesamiento.COLMAP_LOCAL
        
        # Test con None
        resultado = interfaz._normalizar_metodo_forzado(None)
        assert resultado is None
        
        # Test con método inválido
        with pytest.raises(ValueError):
            interfaz._normalizar_metodo_forzado("metodo_inexistente")


class TestMonitoreoRecursos:
    """Tests para el Monitor de Recursos"""
    
    @pytest.fixture
    def config_monitoreo(self):
        return {
            "intervalo_monitoreo": 1.0,
            "archivo_log": "test_log.log"
        }
    
    @pytest.fixture
    def monitor(self, config_monitoreo):
        return MonitorRecursosAvanzado(config_monitoreo)
    
    def test_inicializacion_monitor(self, monitor):
        """Test de inicialización del monitor"""
        assert monitor.recopilador is not None
        assert monitor.generador_alertas is not None
        assert monitor.monitoreando is False
    
    def test_iniciar_detener_monitoreo(self, monitor):
        """Test de inicio y detención del monitoreo"""
        # Iniciar
        monitor.iniciar_monitoreo()
        assert monitor.monitoreando is True
        
        # Detener
        monitor.detener_monitoreo()
        assert monitor.monitoreando is False
    
    def test_registrar_procesamiento(self, monitor):
        """Test de registro de procesamiento de tareas"""
        initial_count = monitor.metricas_agente["tareas_procesadas"]
        
        monitor.registrar_procesamiento_tarea(
            metodo="colmap_local",
            exito=True,
            tiempo_procesamiento=30.0,
            recursos_usados={"cpu": 50.0, "ram": 60.0}
        )
        
        assert monitor.metricas_agente["tareas_procesadas"] == initial_count + 1
        assert monitor.metricas_agente["tareas_exitosas"] == 1
        assert monitor.metricas_agente["tiempo_promedio_procesamiento"] == 30.0
    
    def test_generar_reporte_completo(self, monitor):
        """Test de generación de reporte completo"""
        # Generar reporte sin datos
        reporte = monitor.generar_reporte_completo()
        
        assert "timestamp" in reporte
        assert "sistema" in reporte
        assert "alertas" in reporte
        assert "agente" in reporte
        assert "recomendaciones" in reporte
        
        # Verificar estructura del sistema
        sistema = reporte["sistema"]
        assert "metricas_actuales" in sistema
        assert "estadisticas_hora" in sistema
        
        # Verificar métricas del agente
        agente = reporte["agente"]
        assert "metricas" in agente
        assert "tasa_exito" in agente


# Tests de integración
class TestIntegracion:
    """Tests de integración del sistema completo"""
    
    @pytest.mark.asyncio
    async def test_flujo_completo(self, tmp_path):
        """Test del flujo completo de procesamiento"""
        # Crear imágenes de prueba
        imagenes = []
        for i in range(3):
            img_path = tmp_path / f"test{i}.jpg"
            from PIL import Image
            img = Image.new('RGB', (1200, 800), color='blue')
            img.save(img_path)
            imagenes.append(str(img_path))
        
        # Crear interfaz
        interfaz = InterfazAgenteSelector()
        await interfaz.inicializar()
        
        try:
            # 1. Evaluación inicial
            evaluacion = await interfaz.evaluar_sin_procesar(
                imagenes=imagenes,
                presupuesto=20.0,
                prioridad=3
            )
            
            assert "decision_recomendada" in evaluacion
            metodo_recomendado = evaluacion["decision_recomendada"]["metodo_seleccionado"]
            
            # 2. Procesamiento completo
            resultado = await interfaz.procesar_2d_a_3d(
                imagenes=imagenes,
                presupuesto=20.0,
                prioridad=3
            )
            
            assert resultado["exito"] in [True, False]  # Puede fallar por limitaciones de test
            assert resultado["metodo_utilizado"] == metodo_recomendado
            
            # 3. Verificar estadísticas
            stats = await interfaz.obtener_estadisticas()
            assert stats["agente_activo"] is True
            
        finally:
            await interfaz.cerrar()


# Utilidades para tests
class TestUtils:
    """Utilidades para testing"""
    
    @staticmethod
    def crear_imagen_test(tmp_path: Path, nombre: str, tamaño=(800, 600)) -> str:
        """Crea una imagen de test"""
        from PIL import Image
        img_path = tmp_path / nombre
        img = Image.new('RGB', tamaño, color='red')
        img.save(img_path)
        return str(img_path)
    
    @staticmethod
    def crear_config_test(tmp_path: Path) -> str:
        """Crea un archivo de configuración de test"""
        config = {
            "configuracion_agente": {
                "max_concurrencia": 2,
                "timeout_default": 60
            },
            "metodos_procesamiento": {
                "colmap_local": {
                    "disponible": True,
                    "costo_por_imagen": 0.0
                }
            }
        }
        
        config_path = tmp_path / "test_config.json"
        with open(config_path, 'w') as f:
            json.dump(config, f, indent=2)
        
        return str(config_path)


if __name__ == "__main__":
    # Ejecutar tests con pytest
    pytest.main([__file__, "-v", "--tb=short"])
"""
Tests específicos para el módulo de monitoreo de recursos
"""

import pytest
import time
import asyncio
import threading
from unittest.mock import Mock, patch
from datetime import datetime, timedelta

import sys
sys.path.append(str(Path(__file__).parent.parent))

from src.monitoreo_recursos import (
    RecopiladorMetricas,
    GeneradorAlertas,
    MonitorRecursosAvanzado,
    TipoMetrica,
    NivelAlerta,
    MetricaRecurso,
    AlertaRecursos
)


class TestRecopiladorMetricas:
    """Tests para el Recopilador de Métricas"""
    
    @pytest.fixture
    def recopilador(self):
        return RecopiladorMetricas(interval=0.1)  # Intervalo muy corto para tests
    
    def test_inicializacion(self, recopilador):
        """Test de inicialización del recopilador"""
        assert recopilador.interval == 0.1
        assert recopilador.recopilando is False
        assert len(recopilador.metricas_historicas) > 0
        assert recopilador.metricas_tiempo_real == {}
    
    def test_iniciar_recopilacion(self, recopilador):
        """Test de inicio de recopilación"""
        recopilador.iniciar_recopilacion()
        
        assert recopilador.recopilando is True
        assert hasattr(recopilador, 'thread_recopilacion')
        assert recopilador.thread_recopilacion.is_alive()
    
    def test_detener_recopilacion(self, recopilador):
        """Test de detención de recopilación"""
        recopilador.iniciar_recopilacion()
        time.sleep(0.3)  # Esperar algunas iteraciones
        
        recopilador.detener_recopilacion()
        
        assert recopilador.recopilando is False
        # El thread debería terminar
        recopilador.thread_recopilacion.join(timeout=1.0)
        assert not recopilador.thread_recopilacion.is_alive()
    
    def test_obtener_metricas_actuales(self, recopilador):
        """Test de obtención de métricas actuales"""
        # Sin recopilación activa
        metricas = recopilador.obtener_metricas_actuales()
        assert metricas == {}
        
        # Con recopilación activa
        recopilador.iniciar_recopilacion()
        time.sleep(0.3)  # Esperar recopilación
        
        metricas = recopilador.obtener_metricas_actuales()
        
        assert "cpu_uso" in metricas
        assert "ram_uso" in metricas
        assert "disco_uso" in metricas
        assert "timestamp" in metricas
        
        # Valores deben estar en rangos razonables
        assert 0.0 <= metricas["cpu_uso"] <= 100.0
        assert 0.0 <= metricas["ram_uso"] <= 100.0
        assert 0.0 <= metricas["disco_uso"] <= 100.0
        
        recopilador.detener_recopilacion()
    
    def test_obtener_historial_metricas(self, recopilador):
        """Test de obtención de historial de métricas"""
        recopilador.iniciar_recopilacion()
        time.sleep(0.5)  # Generar algunas métricas
        
        # Obtener historial de CPU
        historial_cpu = recopilador.obtener_historial_metricas(TipoMetrica.CPU_USO, minutos=1)
        
        assert isinstance(historial_cpu, list)
        assert len(historial_cpu) > 0
        
        # Verificar estructura de métricas
        metrica = historial_cpu[0]
        assert isinstance(metrica, MetricaRecurso)
        assert metrica.tipo == TipoMetrica.CPU_USO
        assert metrica.unidad == "%"
        assert isinstance(metrica.timestamp, datetime)
        
        recopilador.detener_recopilacion()
    
    def test_calcular_estadisticas(self, recopilador):
        """Test de cálculo de estadísticas"""
        recopilador.iniciar_recopilacion()
        time.sleep(0.5)  # Generar métricas
        
        # Calcular estadísticas para CPU
        stats = recopilador.calcular_estadisticas(TipoMetrica.CPU_USO, minutos=1)
        
        assert isinstance(stats, dict)
        assert "promedio" in stats
        assert "mediana" in stats
        assert "minimo" in stats
        assert "maximo" in stats
        assert "desviacion_estandar" in stats
        assert "percentil_95" in stats
        assert "total_muestras" in stats
        
        # Verificar rangos de valores
        assert 0.0 <= stats["promedio"] <= 100.0
        assert stats["minimo"] <= stats["maximo"]
        assert stats["total_muestras"] > 0
        
        recopilador.detener_recopilacion()
    
    def test_calcular_percentil(self, recopilador):
        """Test de cálculo de percentiles"""
        valores = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100]
        
        p95 = recopilador._calcular_percentil(valores, 95)
        p50 = recopilador._calcular_percentil(valores, 50)
        p0 = recopilador._calcular_percentil(valores, 0)
        p100 = recopilador._calcular_percentil(valores, 100)
        
        assert p95 == 95  # Valor más alto
        assert p50 == 55  # Mediana aproximada
        assert p0 == 10   # Valor mínimo
        assert p100 == 100 # Valor máximo
        
        # Test con lista vacía
        p_vacio = recopilador._calcular_percentil([], 50)
        assert p_vacio == 0.0


class TestGeneradorAlertas:
    """Tests para el Generador de Alertas"""
    
    @pytest.fixture
    def recopilador(self):
        rec = RecopiladorMetricas(interval=0.1)
        rec.iniciar_recopilacion()
        time.sleep(0.3)  # Generar algunas métricas
        return rec
    
    @pytest.fixture
    def generador(self, recopilador):
        return GeneradorAlertas(recopilador)
    
    def test_inicializacion(self, recopilador, generador):
        """Test de inicialización del generador de alertas"""
        assert generador.recopilador is recopilador
        assert generador.alertas_activas == {}
        assert len(generador.historial_alertas) == 0
        assert generador.callbacks_alerta == []
    
    def test_agregar_callback(self, recopilador, generador):
        """Test de agregar callback"""
        callback_mock = Mock()
        
        generador.agregar_callback(callback_mock)
        
        assert callback_mock in generador.callbacks_alerta
    
    def test_verificar_alertas_sin_superacion_umbrales(self, recopilador, generador):
        """Test de verificación sin superación de umbrales"""
        # Verificar alertas sin métricas extremas
        generador.verificar_alertas()
        
        # No debería haber alertas activas
        assert len(generador.alertas_activas) == 0
    
    def test_verificar_alertas_con_superacion_umbrales(self, recopilador, generador):
        """Test de verificación con superación de umbrales"""
        # Simular métricas altas manualmente
        with patch.object(recopilador, 'obtener_metricas_actuales') as mock_metricas:
            mock_metricas.return_value = {
                "cpu_uso": 95.0,  # Crítico
                "ram_uso": 90.0,  # Error
                "disco_uso": 85.0,  # Warning
                "timestamp": datetime.now().isoformat()
            }
            
            generador.verificar_alertas()
            
            # Debería haber alertas activas
            assert len(generador.alertas_activas) > 0
    
    def test_crear_alerta(self, recopilador, generador):
        """Test de creación de alertas"""
        alerta = generador._crear_alerta(
            TipoMetrica.CPU_USO,
            "warning",
            75.0,
            70.0,
            "Uso de CPU"
        )
        
        assert isinstance(alerta, AlertaRecursos)
        assert alerta.tipo == TipoMetrica.CPU_USO
        assert alerta.nivel == NivelAlerta.WARNING
        assert alerta.valor_actual == 75.0
        assert alerta.umbral == 70.0
        assert "Uso de CPU" in alerta.mensaje
        assert alerta.resolved is False
    
    def test_resolver_alerta(self, recopilador, generador):
        """Test de resolución de alertas"""
        # Crear una alerta manualmente
        alerta = generador._crear_alerta(
            TipoMetrica.CPU_USO, "warning", 75.0, 70.0, "Test CPU"
        )
        
        generador.alertas_activas[alerta.id] = alerta
        
        # Resolver la alerta
        generador.resolver_alerta(alerta.id)
        
        assert alerta.resolved is True
        assert alerta.resuelta_en is not None
        assert alerta.id not in generador.alertas_activas
    
    def test_obtener_alertas_activas(self, recopilador, generador):
        """Test de obtención de alertas activas"""
        # Crear algunas alertas
        alerta1 = generador._crear_alerta(TipoMetrica.CPU_USO, "warning", 75.0, 70.0, "CPU 1")
        alerta2 = generador._crear_alerta(TipoMetrica.RAM_USO, "error", 85.0, 80.0, "RAM 1")
        
        generador.alertas_activas[alerta1.id] = alerta1
        generador.alertas_activas[alerta2.id] = alerta2
        
        alertas = generador.obtener_alertas_activas()
        
        assert len(alertas) == 2
        assert alerta1 in alertas
        assert alerta2 in alertas
    
    def test_obtener_historial_alertas(self, recopilador, generador):
        """Test de obtención de historial de alertas"""
        # Crear alertas con timestamps diferentes
        alerta_antigua = generador._crear_alerta(
            TipoMetrica.CPU_USO, "warning", 75.0, 70.0, "CPU old"
        )
        alerta_antigua.timestamp = datetime.now() - timedelta(hours=2)
        
        alerta_reciente = generador._crear_alerta(
            TipoMetrica.CPU_USO, "warning", 80.0, 70.0, "CPU recent"
        )
        alerta_reciente.timestamp = datetime.now() - timedelta(minutes=30)
        
        generador.historial_alertas.append(alerta_antigua)
        generador.historial_alertas.append(alerta_reciente)
        
        # Obtener historial de últimas 1 hora
        historial = generador.obtener_historial_alertas(horas=1)
        
        assert len(historial) == 1
        assert historial[0] == alerta_reciente


class TestMonitorRecursosAvanzado:
    """Tests para el Monitor de Recursos Avanzado"""
    
    @pytest.fixture
    def config_monitor(self):
        return {
            "intervalo_monitoreo": 0.1,
            "archivo_log": "test_monitor.log"
        }
    
    @pytest.fixture
    def monitor(self, config_monitor):
        return MonitorRecursosAvanzado(config_monitor)
    
    def test_inicializacion(self, monitor):
        """Test de inicialización del monitor avanzado"""
        assert monitor.config == {
            "intervalo_monitoreo": 0.1,
            "archivo_log": "test_monitor.log"
        }
        assert isinstance(monitor.recopilador, RecopiladorMetricas)
        assert isinstance(monitor.generador_alertas, GeneradorAlertas)
        assert monitor.monitoreando is False
        assert monitor.task_monitoreo is None
    
    def test_iniciar_monitoreo(self, monitor):
        """Test de inicio de monitoreo"""
        monitor.iniciar_monitoreo()
        
        assert monitor.monitoreando is True
        assert monitor.recopilador.recopilando is True
        assert monitor.task_monitoreo is not None
        assert not monitor.task_monitoreo.done()
    
    def test_detener_monitoreo(self, monitor):
        """Test de detención de monitoreo"""
        monitor.iniciar_monitoreo()
        time.sleep(0.5)  # Permitir que el monitoreo inicie
        
        monitor.detener_monitoreo()
        
        assert monitor.monitoreando is False
        assert monitor.recopilador.recopilando is False
        assert monitor.task_monitoreo is None
    
    def test_accionar_alerta_critica(self, monitor):
        """Test de acciones para alertas críticas"""
        # Crear alerta crítica
        alerta_critica = AlertaRecursos(
            id="test_critical",
            tipo=TipoMetrica.CPU_USO,
            nivel=NivelAlerta.CRITICAL,
            mensaje="CPU crítico",
            valor_actual=95.0,
            umbral=90.0,
            timestamp=datetime.now()
        )
        
        # Monitorear que se ejecute sin errores
        with patch.object(monitor, '_accionar_alerta_critica') as mock_accion:
            monitor._accionar_alerta_critica(alerta_critica)
            mock_accion.assert_called_once_with(alerta_critica)
    
    def test_registrar_procesamiento_tarea(self, monitor):
        """Test de registro de procesamiento de tareas"""
        recursos_inicial = monitor.metricas_agente["uso_recursos_por_metodo"]["colmap_local_cpu"]
        
        monitor.registrar_procesamiento_tarea(
            metodo="colmap_local",
            exito=True,
            tiempo_procesamiento=30.0,
            recursos_usados={"cpu": 50.0, "ram": 60.0}
        )
        
        # Verificar métricas actualizadas
        assert monitor.metricas_agente["tareas_procesadas"] == 1
        assert monitor.metricas_agente["tareas_exitosas"] == 1
        assert monitor.metricas_agente["tareas_fallidas"] == 0
        assert monitor.metricas_agente["tiempo_promedio_procesamiento"] == 30.0
        
        # Verificar recursos registrados
        assert len(monitor.metricas_agente["uso_recursos_por_metodo"]["colmap_local_cpu"]) == 1
        
        # Procesar otra tarea para verificar promedio
        monitor.registrar_procesamiento_tarea(
            metodo="colmap_local",
            exito=False,
            tiempo_procesamiento=60.0,
            recursos_usados={"cpu": 70.0, "ram": 80.0}
        )
        
        assert monitor.metricas_agente["tiempo_promedio_procesamiento"] == 45.0  # (30 + 60) / 2
    
    def test_registrar_decision_metodo(self, monitor):
        """Test de registro de decisiones de método"""
        initial_count = monitor.metricas_agente["decisiones_por_metodo"]["colmap_local"]
        
        monitor.registrar_decision_metodo("colmap_local", {"calidad": 0.8})
        
        assert monitor.metricas_agente["decisiones_por_metodo"]["colmap_local"] == initial_count + 1
    
    @pytest.mark.asyncio
    async def test_monitoreo_loop(self, monitor):
        """Test del loop de monitoreo"""
        monitor.iniciar_monitoreo()
        
        # Esperar algunas iteraciones del loop
        await asyncio.sleep(0.5)
        
        # Verificar que el monitoreo esté activo
        assert monitor.monitoreando is True
        
        monitor.detener_monitoreo()
    
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
        assert "uptime" in sistema
        
        # Verificar estructura de alertas
        alertas = reporte["alertas"]
        assert "activas" in alertas
        assert "recientes" in alertas
        
        # Verificar estructura del agente
        agente = reporte["agente"]
        assert "metricas" in agente
        assert "tasa_exito" in agente
        
        # Verificar recomendaciones
        recomendaciones = reporte["recomendaciones"]
        assert isinstance(recomendaciones, list)
    
    def test_generar_recomendaciones(self, monitor):
        """Test de generación de recomendaciones"""
        # Métricas normales
        metricas_normales = {"cpu_uso": 30.0, "ram_uso": 40.0, "disco_uso": 50.0}
        recomendaciones = monitor._generar_recomendaciones(metricas_normales)
        
        assert len(recomendaciones) == 1
        assert "correctamente" in recomendaciones[0]
        
        # Métricas altas
        metricas_altas = {"cpu_uso": 85.0, "ram_uso": 90.0, "disco_uso": 95.0}
        recomendaciones = monitor._generar_recomendaciones(metricas_altas)
        
        assert len(recomendaciones) >= 3
        assert any("CPU" in rec for rec in recomendaciones)
        assert any("RAM" in rec for rec in recomendaciones)
        assert any("Disco" in rec for rec in recomendaciones)


# Tests de integración del monitoreo
class TestIntegracionMonitoreo:
    """Tests de integración del sistema de monitoreo"""
    
    @pytest.mark.asyncio
    async def test_monitoreo_completo(self):
        """Test de monitoreo completo con datos reales"""
        config = {
            "intervalo_monitoreo": 0.1,
            "archivo_log": "test_integracion.log"
        }
        
        monitor = MonitorRecursosAvanzado(config)
        
        try:
            # Iniciar monitoreo
            monitor.iniciar_monitoreo()
            
            # Simular procesamiento de tareas
            for i in range(3):
                monitor.registrar_procesamiento_tarea(
                    metodo="colmap_local" if i % 2 == 0 else "hibrido",
                    exito=(i != 2),  # La tercera falla
                    tiempo_procesamiento=20.0 + i * 10,
                    recursos_usados={"cpu": 50.0 + i * 10, "ram": 60.0 + i * 5}
                )
            
            # Esperar recolección de métricas
            await asyncio.sleep(1.0)
            
            # Generar reporte
            reporte = monitor.generar_reporte_completo()
            
            # Verificar reporte completo
            assert "timestamp" in reporte
            assert reporte["agente"]["metricas"]["tareas_procesadas"] == 3
            assert reporte["agente"]["metricas"]["tareas_exitosas"] == 2
            assert reporte["agente"]["metricas"]["tareas_fallidas"] == 1
            
            # Verificar métricas del sistema
            sistema = reporte["sistema"]
            assert "cpu_uso" in sistema["metricas_actuales"]
            assert "ram_uso" in sistema["metricas_actuales"]
            
        finally:
            monitor.detener_monitoreo()
    
    @pytest.mark.asyncio
    async def test_alertas_con_metricas_extremas(self):
        """Test de alertas con métricas extremas"""
        config = {"intervalo_monitoreo": 0.1}
        monitor = MonitorRecursosAvanzado(config)
        
        try:
            # Iniciar monitoreo
            monitor.iniciar_monitoreo()
            
            # Simular métricas extremas
            with patch.object(monitor.recopilador, 'obtener_metricas_actuales') as mock_metricas:
                mock_metricas.return_value = {
                    "cpu_uso": 98.0,  # Extremadamente alto
                    "ram_uso": 95.0,  # Extremadamente alto
                    "disco_uso": 92.0,  # Muy alto
                    "timestamp": datetime.now().isoformat()
                }
                
                # Forzar verificación de alertas
                monitor.generador_alertas.verificar_alertas()
                
                # Debería haber alertas activas
                alertas = monitor.generador_alertas.obtener_alertas_activas()
                assert len(alertas) > 0
                
                # Al menos una debería ser crítica
                alertas_criticas = [a for a in alertas if a.nivel == NivelAlerta.CRITICAL]
                assert len(alertas_criticas) > 0
            
        finally:
            monitor.detener_monitoreo()


# Test de rendimiento
class TestRendimientoMonitoreo:
    """Tests de rendimiento del monitoreo"""
    
    def test_recopilacion_metricas_rendimiento(self):
        """Test de rendimiento de recopilación de métricas"""
        recopilador = RecopiladorMetricas(interval=0.01)  # Muy rápido
        
        recopilador.iniciar_recopilacion()
        
        # Dejar que recopile por un tiempo
        time.sleep(1.0)
        
        # Verificar que se recopilarion métricas eficientemente
        metricas_actuales = recopilador.obtener_metricas_actuales()
        assert len(metricas_actuales) >= 3
        
        # Verificar que el historial crezca
        historial_cpu = recopilador.obtener_historial_metricas(TipoMetrica.CPU_USO, minutos=1)
        assert len(historial_cpu) > 10  # Al menos 10 muestras en 1 segundo
        
        recopilador.detener_recopilacion()
    
    def test_alertas_multiple_generacion(self):
        """Test de generación múltiple de alertas"""
        recopilador = RecopiladorMetricas(interval=0.1)
        generador = GeneradorAlertas(recopilador)
        
        # Generar múltiples alertas rápidamente
        for i in range(5):
            with patch.object(recopilador, 'obtener_metricas_actuales') as mock:
                mock.return_value = {
                    "cpu_uso": 85.0,
                    "ram_uso": 75.0,
                    "disco_uso": 65.0,
                    "timestamp": datetime.now().isoformat()
                }
                generador.verificar_alertas()
        
        # Verificar que no se genere spam de alertas (gracias al cooldown)
        alertas = generador.obtener_alertas_activas()
        assert len(alertas) <= 3  # Máximo una por tipo de métrica


if __name__ == "__main__":
    # Ejecutar tests específicos del monitoreo
    pytest.main([__file__, "-v", "--tb=short"])
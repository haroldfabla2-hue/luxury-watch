"""
Tests para el Agente 1: Analista de Calidad de Imágenes
Pruebas unitarias y de integración
"""

import pytest
import asyncio
import numpy as np
import cv2
import tempfile
import os
from pathlib import Path
from unittest.mock import AsyncMock, patch

# Importar módulos del agente
import sys
sys.path.append(str(Path(__file__).parent / "src"))
sys.path.append(str(Path(__file__).parent / "api"))

from config import AgentConfig, QualityThresholds, QualityWeights
from src.image_quality_analyzer import ImageQualityAnalyzer, QualityAnalysisRequest
from src.quality_metrics import BRISQUEMetric, SharpnessMetric, ExposureMetric, ResolutionMetric, AspectRatioMetric

class TestImageQualityAnalyzer:
    """Tests para ImageQualityAnalyzer"""
    
    @pytest.fixture
    def config(self):
        """Configuración de test"""
        return AgentConfig(
            agent_id="test_qa_analyzer",
            max_concurrent_analyses=2,
            analysis_timeout=10
        )
    
    @pytest.fixture
    def analyzer(self, config):
        """Analyzer instance para tests"""
        return ImageQualityAnalyzer(config)
    
    @pytest.fixture
    def sample_image(self):
        """Genera imagen de muestra para tests"""
        # Crear imagen de prueba con algunas características conocidas
        image = np.zeros((800, 600, 3), dtype=np.uint8)
        
        # Agregar contenido para hacer más realista
        # Fondo gris
        image[:, :] = [128, 128, 128]
        
        # Agregar algunos elementos
        cv2.rectangle(image, (100, 100), (200, 200), (255, 255, 255), -1)
        cv2.circle(image, (400, 300), 50, (0, 255, 0), -1)
        
        return image
    
    @pytest.fixture
    def blurry_image(self):
        """Genera imagen borrosa para tests"""
        image = np.zeros((800, 600, 3), dtype=np.uint8)
        image[:, :] = [128, 128, 128]
        
        # Aplicar blur para hacer imagen borrosa
        blurred = cv2.GaussianBlur(image, (21, 21), 0)
        return blurred
    
    @pytest.fixture
    def overexposed_image(self):
        """Genera imagen sobreexpuesta"""
        image = np.ones((800, 600, 3), dtype=np.uint8) * 250  # Muy brillante
        return image
    
    def test_analyzer_initialization(self, analyzer):
        """Test inicialización del analyzer"""
        assert analyzer.config.agent_id == "test_qa_analyzer"
        assert len(analyzer.metrics) == 5
        assert 'brisque' in analyzer.metrics
        assert 'sharpness' in analyzer.metrics
        assert 'exposure' in analyzer.metrics
        assert 'resolution' in analyzer.metrics
        assert 'aspect_ratio' in analyzer.metrics
    
    @pytest.mark.asyncio
    async def test_analyze_image_success(self, analyzer, sample_image):
        """Test análisis exitoso de imagen"""
        # Crear archivo temporal
        with tempfile.NamedTemporaryFile(suffix='.jpg', delete=False) as tmp_file:
            cv2.imwrite(tmp_file.name, sample_image)
            tmp_path = tmp_file.name
        
        try:
            request = QualityAnalysisRequest(
                image_path=tmp_path,
                analysis_options={"include_detailed_metrics": True}
            )
            
            result = await analyzer.analyze_image(request)
            
            # Verificaciones básicas
            assert result.image_path == tmp_path
            assert result.overall_score >= 0
            assert result.overall_score <= 100
            assert result.processing_time > 0
            assert result.overall_level.value in ["excellent", "good", "fair", "poor", "rejected"]
            
            # Verificar métricas individuales
            assert result.brisque_score >= 0
            assert result.sharpness_variance >= 0
            assert result.exposure_balance_score >= 0
            assert result.resolution_score >= 0
            assert result.aspect_ratio_score >= 0
            
            # Verificar información de imagen
            assert result.width == 600
            assert result.height == 800
            assert result.total_pixels == 480000
            
        finally:
            os.unlink(tmp_path)
    
    @pytest.mark.asyncio
    async def test_analyze_image_data(self, analyzer, sample_image):
        """Test análisis desde datos en memoria"""
        # Convertir imagen a bytes
        _, encoded_img = cv2.imencode('.jpg', sample_image)
        image_data = encoded_img.tobytes()
        
        request = QualityAnalysisRequest(
            image_data=image_data,
            analysis_options={"include_detailed_metrics": True}
        )
        
        result = await analyzer.analyze_image(request)
        
        assert result.image_path == "<memory>"
        assert result.overall_score >= 0
        assert result.processing_time > 0
    
    @pytest.mark.asyncio
    async def test_analyze_blurry_image(self, analyzer, blurry_image):
        """Test detección de imagen borrosa"""
        with tempfile.NamedTemporaryFile(suffix='.jpg', delete=False) as tmp_file:
            cv2.imwrite(tmp_file.name, blurry_image)
            tmp_path = tmp_file.name
        
        try:
            request = QualityAnalysisRequest(image_path=tmp_path)
            result = await analyzer.analyze_image(request)
            
            # Imagen borrosa debería tener score bajo de nitidez
            assert result.sharpness_level.value in ["poor", "rejected"]
            
            # Verificar que se detectaron problemas de desenfoque
            has_blur_issues = any("desenfoque" in issue.lower() for issue in result.issues_detected)
            assert has_blur_issues or result.sharpness_score < 60
            
        finally:
            os.unlink(tmp_path)
    
    @pytest.mark.asyncio
    async def test_analyze_overexposed_image(self, analyzer, overexposed_image):
        """Test detección de sobreexposición"""
        with tempfile.NamedTemporaryFile(suffix='.jpg', delete=False) as tmp_file:
            cv2.imwrite(tmp_file.name, overexposed_image)
            tmp_path = tmp_file.name
        
        try:
            request = QualityAnalysisRequest(image_path=tmp_path)
            result = await analyzer.analyze_image(request)
            
            # Imagen sobreexpuesta debería tener problemas de exposición
            assert result.exposure_level.value in ["poor", "rejected"]
            
            # Verificar que se detectaron problemas de exposición
            has_exposure_issues = any(
                "expuesta" in issue.lower() or "sobreexpuesta" in issue.lower() 
                for issue in result.issues_detected
            )
            assert has_exposure_issues or result.exposure_balance_score < 60
            
        finally:
            os.unlink(tmp_path)
    
    @pytest.mark.asyncio
    async def test_batch_analysis(self, analyzer, sample_image):
        """Test análisis por lotes"""
        # Crear múltiples imágenes
        images = []
        for i in range(3):
            img = sample_image.copy()
            cv2.putText(img, f"Image {i}", (50, 50), cv2.FONT_HERSHEY_SIMPLEX, 1, (255, 255, 255), 2)
            
            with tempfile.NamedTemporaryFile(suffix=f'_{i}.jpg', delete=False) as tmp_file:
                cv2.imwrite(tmp_file.name, img)
                images.append(tmp_file.name)
        
        try:
            requests = [QualityAnalysisRequest(image_path=img) for img in images]
            results = await analyzer.analyze_batch(requests)
            
            assert len(results) == 3
            for result in results:
                assert result.overall_score >= 0
                assert result.overall_score <= 100
                assert result.processing_time > 0
        finally:
            for img_path in images:
                if os.path.exists(img_path):
                    os.unlink(img_path)
    
    @pytest.mark.asyncio
    async def test_performance_stats(self, analyzer, sample_image):
        """Test estadísticas de rendimiento"""
        # Realizar varios análisis
        with tempfile.NamedTemporaryFile(suffix='.jpg', delete=False) as tmp_file:
            cv2.imwrite(tmp_file.name, sample_image)
            tmp_path = tmp_file.name
        
        try:
            request = QualityAnalysisRequest(image_path=tmp_path)
            
            # Ejecutar análisis múltiples veces
            for _ in range(3):
                await analyzer.analyze_image(request)
            
            stats = analyzer.get_performance_stats()
            
            assert stats['total_analyses'] == 3
            assert stats['average_processing_time'] > 0
            assert stats['total_processing_time'] > 0
            assert stats['cache_size'] >= 0
            
        finally:
            os.unlink(tmp_path)
    
    def test_cache_functionality(self, analyzer, sample_image):
        """Test funcionalidad de cache"""
        # Verificar cache inicial
        assert len(analyzer.analysis_cache) == 0
        
        # El cache se llena durante análisis, verificar que se puede limpiar
        analyzer.clear_cache()
        assert len(analyzer.analysis_cache) == 0

class TestQualityMetrics:
    """Tests para métricas individuales"""
    
    @pytest.fixture
    def thresholds(self):
        """Umbrales para tests"""
        return QualityThresholds()
    
    @pytest.fixture
    def sample_image(self):
        """Imagen de muestra"""
        return np.zeros((400, 300, 3), dtype=np.uint8)
    
    @pytest.mark.asyncio
    async def test_brisque_metric(self, thresholds, sample_image):
        """Test métrica BRISQUE"""
        metric = BRISQUEMetric(thresholds)
        result = await metric.calculate(sample_image)
        
        assert result.metric_name == "BRISQUE"
        assert result.value >= 0
        assert result.score >= 0
        assert result.level.value in ["excellent", "good", "fair", "poor", "rejected"]
        assert isinstance(result.issues, list)
        assert isinstance(result.recommendations, list)
    
    @pytest.mark.asyncio
    async def test_sharpness_metric(self, thresholds, sample_image):
        """Test métrica de nitidez"""
        metric = SharpnessMetric(thresholds)
        result = await metric.calculate(sample_image)
        
        assert result.metric_name == "Sharpness"
        assert result.value >= 0  # Varianza Laplaciana
        assert result.score >= 0
        assert result.level.value in ["excellent", "good", "fair", "poor", "rejected"]
        
        # Verificar metadata
        assert "laplacian_variance" in result.metadata
        assert result.metadata["laplacian_variance"] == result.value
    
    @pytest.mark.asyncio
    async def test_exposure_metric(self, thresholds, sample_image):
        """Test métrica de exposición"""
        metric = ExposureMetric(thresholds)
        result = await metric.calculate(sample_image)
        
        assert result.metric_name == "Exposure"
        assert result.value >= 0
        assert result.score >= 0
        assert result.level.value in ["excellent", "good", "fair", "poor", "rejected"]
        
        # Verificar metadata
        assert "histogram" in result.metadata
        assert "mean_brightness" in result.metadata
    
    @pytest.mark.asyncio
    async def test_resolution_metric(self, thresholds):
        """Test métrica de resolución"""
        metric = ResolutionMetric(thresholds)
        
        image_info = {
            'width': 800,
            'height': 600,
            'file_size': 1024000,
            'format': '.jpg'
        }
        
        result = await metric.calculate(image_info)
        
        assert result.metric_name == "Resolution"
        assert result.value == 480000  # 800 * 600
        assert result.score >= 0
        assert result.level.value in ["excellent", "good", "fair", "poor", "rejected"]
        
        # Verificar metadata
        assert result.metadata['width'] == 800
        assert result.metadata['height'] == 600
        assert result.metadata['megapixels'] == 0.48
    
    @pytest.mark.asyncio
    async def test_aspect_ratio_metric(self, thresholds):
        """Test métrica de aspect ratio"""
        metric = AspectRatioMetric(thresholds)
        
        image_info = {
            'width': 1920,
            'height': 1080,
            'file_size': 1024000,
            'format': '.jpg'
        }
        
        result = await metric.calculate(image_info)
        
        assert result.metric_name == "Aspect Ratio"
        assert abs(result.value - 1.78) < 0.01  # 1920/1080 ≈ 1.78
        assert result.score >= 0
        assert result.level.value in ["excellent", "good", "fair", "poor", "rejected"]
        
        # Verificar metadata
        assert result.metadata['aspect_ratio'] == result.value
        assert 'closest_common_ratio' in result.metadata

class TestConfig:
    """Tests para configuración"""
    
    def test_default_config(self):
        """Test configuración por defecto"""
        config = AgentConfig()
        
        assert config.agent_id is not None
        assert len(config.supported_formats) > 0
        assert config.max_image_size > 0
        assert config.max_concurrent_analyses > 0
    
    def test_quality_thresholds(self):
        """Test umbrales de calidad"""
        thresholds = QualityThresholds()
        
        assert thresholds.min_width > 0
        assert thresholds.min_height > 0
        assert thresholds.brisque_excellent < thresholds.brisque_good
        assert thresholds.laplacian_excellent > thresholds.laplacian_good
    
    def test_get_config(self):
        """Test función get_config"""
        from config import get_config
        
        default_config = get_config("default")
        assert default_config.agent_id == "agent_1_qa_imagenes"
        
        premium_config = get_config("premium")
        assert premium_config.agent_id == "agent_1_qa_imagenes_premium"
        
        bulk_config = get_config("bulk")
        assert bulk_config.agent_id == "agent_1_qa_imagenes_bulk"

class TestErrorHandling:
    """Tests para manejo de errores"""
    
    @pytest.fixture
    def analyzer(self):
        """Analyzer para tests de error"""
        return ImageQualityAnalyzer(AgentConfig())
    
    @pytest.mark.asyncio
    async def test_invalid_image_path(self, analyzer):
        """Test con ruta de imagen inválida"""
        request = QualityAnalysisRequest(image_path="/path/que/no/existe.jpg")
        
        with pytest.raises(FileNotFoundError):
            await analyzer.analyze_image(request)
    
    @pytest.mark.asyncio
    async def test_empty_request(self, analyzer):
        """Test con solicitud vacía"""
        request = QualityAnalysisRequest()
        
        with pytest.raises(ValueError):
            await analyzer.analyze_image(request)
    
    def test_health_check(self, analyzer):
        """Test verificación de salud"""
        import asyncio
        
        async def run_health_check():
            health = await analyzer.health_check()
            assert health['status'] == 'healthy'
            assert health['agent_id'] == analyzer.config.agent_id
            assert 'metrics_available' in health
            assert 'performance_stats' in health
        
        asyncio.run(run_health_check())

if __name__ == "__main__":
    # Ejecutar tests si se llama directamente
    pytest.main([__file__, "-v"])
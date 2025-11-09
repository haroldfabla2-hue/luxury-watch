#!/usr/bin/env python3
"""
Generador de Reportes
====================

Módulo especializado en la generación de reportes HTML visuales y detallados
de la validación de calidad 3D.
"""

import os
import json
from pathlib import Path
from typing import Dict, List, Optional, Any
import logging
from datetime import datetime
import base64
from io import BytesIO

# Imports para visualizaciones
try:
    import matplotlib.pyplot as plt
    import matplotlib.patches as patches
    import seaborn as sns
    import numpy as np
    MATPLOTLIB_AVAILABLE = True
except ImportError:
    MATPLOTLIB_AVAILABLE = False
    logging.warning("Matplotlib no disponible. Visualizaciones limitadas.")

try:
    from PIL import Image
    PIL_AVAILABLE = True
except ImportError:
    PIL_AVAILABLE = False
    logging.warning("PIL no disponible. Procesamiento de imágenes limitado.")

class GeneradorReportes:
    """
    Generador de reportes HTML para validación de calidad 3D.
    """
    
    def __init__(self, config: Dict = None):
        """
        Inicializa el generador de reportes.
        
        Args:
            config: Configuración del generador
        """
        self.config = config or {}
        self.logger = logging.getLogger('GeneradorReportes')
        
        # Configuración de reportes
        self.incluir_visualizaciones = self.config.get('incluir_visualizaciones', True)
        self.template_path = self.config.get('template_path', 'templates/reporte_template.html')
        self.css_incorporado = self.config.get('css_incorporado', True)
        self.javascript_incorporado = self.config.get('javascript_incorporado', True)
        
        # Estilos y temas
        self.color_excelente = '#2E8B57'  # Verde
        self.color_bueno = '#32CD32'      # Verde claro
        self.color_aceptable = '#FFD700'  # Amarillo
        self.color_problematico = '#FF4500'  # Naranja
        self.color_critico = '#DC143C'    # Rojo
        
    def generar_html(self, resultados: Dict, archivo_salida: str) -> str:
        """
        Genera un reporte HTML completo.
        
        Args:
            resultados: Resultados de la validación
            archivo_salida: Ruta donde guardar el reporte
            
        Returns:
            str: Ruta del reporte generado
        """
        try:
            self.logger.info(f"Generando reporte HTML: {archivo_salida}")
            
            # Crear directorio si no existe
            os.makedirs(os.path.dirname(archivo_salida), exist_ok=True)
            
            # Generar visualizaciones si está habilitado
            visualizaciones = {}
            if self.incluir_visualizaciones and MATPLOTLIB_AVAILABLE:
                visualizaciones = self._generar_visualizaciones(resultados)
            
            # Generar HTML
            html_content = self._generar_html_content(resultados, visualizaciones)
            
            # Escribir archivo
            with open(archivo_salida, 'w', encoding='utf-8') as f:
                f.write(html_content)
            
            self.logger.info(f"Reporte HTML generado exitosamente: {archivo_salida}")
            return archivo_salida
            
        except Exception as e:
            self.logger.error(f"Error generando reporte HTML: {str(e)}")
            return ""
    
    def _generar_html_content(self, resultados: Dict, visualizaciones: Dict) -> str:
        """Genera el contenido HTML del reporte."""
        try:
            # Obtener datos principales
            timestamp = resultados.get('timestamp', datetime.now().isoformat())
            archivo = resultados.get('archivo_entrada', 'Desconocido')
            puntuacion_general = resultados.get('puntuacion_calidad', 0.0)
            problemas = resultados.get('problemas_detectados', [])
            
            # Generar CSS
            css_content = self._generar_css() if self.css_incorporado else self._generar_enlace_css()
            
            # Generar JavaScript
            js_content = self._generar_javascript() if self.javascript_incorporado else self._generar_enlace_javascript()
            
            # Crear HTML
            html = f"""
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reporte de Validación 3D - {Path(archivo).name}</title>
    {css_content}
</head>
<body>
    <div class="container">
        <!-- Header -->
        <header class="header">
            <div class="header-content">
                <h1>🔍 Reporte de Validación de Calidad 3D</h1>
                <div class="header-info">
                    <span class="file-name">📁 {Path(archivo).name}</span>
                    <span class="timestamp">📅 {datetime.fromisoformat(timestamp).strftime('%d/%m/%Y %H:%M:%S')}</span>
                </div>
            </div>
        </header>

        <!-- Resumen Ejecutivo -->
        <section class="summary">
            <h2>📊 Resumen Ejecutivo</h2>
            <div class="score-container">
                <div class="score-circle" style="--score-color: {self._get_color_puntuacion(puntuacion_general)};">
                    <div class="score-value">{puntuacion_general:.1f}</div>
                    <div class="score-label">/ 10</div>
                </div>
                <div class="score-info">
                    <h3>Calificación General</h3>
                    <p class="score-description">{self._get_descripcion_puntuacion(puntuacion_general)}</p>
                    <div class="score-details">
                        <span class="status-badge {self._get_clase_puntuacion(puntuacion_general)}">
                            {self._get_texto_puntuacion(puntuacion_general)}
                        </span>
                    </div>
                </div>
            </div>
        </section>

        <!-- Puntuaciones por Validador -->
        <section class="validators">
            <h2>⚙️ Puntuaciones por Componente</h2>
            <div class="validators-grid">
                {self._generar_grid_validadores(resultados.get('validadores', {}))}
            </div>
        </section>

        <!-- Problemas Detectados -->
        <section class="problems">
            <h2>⚠️ Problemas Detectados</h2>
            {self._generar_seccion_problemas(problemas)}
        </section>

        <!-- Análisis Detallado -->
        <section class="detailed-analysis">
            <h2>🔬 Análisis Detallado</h2>
            {self._generar_analisis_detallado(resultados)}
        </section>

        <!-- Visualizaciones -->
        {self._generar_seccion_visualizaciones(visualizaciones)}

        <!-- Recomendaciones -->
        <section class="recommendations">
            <h2>💡 Recomendaciones</h2>
            {self._generar_seccion_recomendaciones(resultados.get('recomendaciones', []))}
        </section>

        <!-- Detalles Técnicos -->
        <section class="technical-details">
            <h2>🔧 Detalles Técnicos</h2>
            <div class="technical-content">
                {self._generar_detalles_tecnicos(resultados)}
            </div>
        </section>

        <!-- Footer -->
        <footer class="footer">
            <div class="footer-content">
                <p>Generado por Agente 4: Validador de Calidad 3D</p>
                <p>Validación automatizada de modelos 3D con métricas avanzadas</p>
            </div>
        </footer>
    </div>

    {js_content}
</body>
</html>
"""
            
            return html
            
        except Exception as e:
            self.logger.error(f"Error generando contenido HTML: {str(e)}")
            return f"<html><body><h1>Error generando reporte: {str(e)}</h1></body></html>"
    
    def _generar_css(self) -> str:
        """Genera CSS incorporado."""
        return """
<style>
:root {
    --primary-color: #2c3e50;
    --secondary-color: #3498db;
    --success-color: #27ae60;
    --warning-color: #f39c12;
    --danger-color: #e74c3c;
    --light-bg: #f8f9fa;
    --border-color: #e0e0e0;
    --shadow: 0 2px 10px rgba(0,0,0,0.1);
    --radius: 8px;
    --font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: var(--font-family);
    line-height: 1.6;
    color: var(--primary-color);
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    min-height: 100vh;
}

.container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
}

/* Header */
.header {
    background: white;
    border-radius: var(--radius);
    padding: 30px;
    margin-bottom: 30px;
    box-shadow: var(--shadow);
}

.header-content h1 {
    color: var(--primary-color);
    margin-bottom: 15px;
    font-size: 2.5em;
    text-align: center;
}

.header-info {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 15px;
}

.file-name, .timestamp {
    background: var(--light-bg);
    padding: 8px 16px;
    border-radius: 20px;
    font-weight: 500;
    border: 1px solid var(--border-color);
}

/* Summary */
.summary {
    background: white;
    border-radius: var(--radius);
    padding: 30px;
    margin-bottom: 30px;
    box-shadow: var(--shadow);
}

.score-container {
    display: flex;
    align-items: center;
    gap: 40px;
    flex-wrap: wrap;
}

.score-circle {
    width: 150px;
    height: 150px;
    border-radius: 50%;
    background: conic-gradient(var(--score-color) 0deg, var(--score-color) calc(var(--score) * 36deg), #e0e0e0 calc(var(--score) * 36deg));
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
}

.score-circle::before {
    content: '';
    position: absolute;
    width: 120px;
    height: 120px;
    background: white;
    border-radius: 50%;
}

.score-value {
    position: relative;
    font-size: 2.5em;
    font-weight: bold;
    color: var(--score-color);
}

.score-label {
    position: relative;
    font-size: 0.9em;
    color: #666;
    margin-top: -10px;
}

.score-info h3 {
    color: var(--primary-color);
    margin-bottom: 10px;
    font-size: 1.5em;
}

.score-description {
    color: #666;
    margin-bottom: 15px;
    font-size: 1.1em;
}

.status-badge {
    padding: 8px 16px;
    border-radius: 20px;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.status-excelente {
    background: var(--success-color);
    color: white;
}

.status-bueno {
    background: #32CD32;
    color: white;
}

.status-aceptable {
    background: var(--warning-color);
    color: white;
}

.status-problematico {
    background: var(--danger-color);
    color: white;
}

/* Validators */
.validators {
    background: white;
    border-radius: var(--radius);
    padding: 30px;
    margin-bottom: 30px;
    box-shadow: var(--shadow);
}

.validators-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 20px;
    margin-top: 20px;
}

.validator-card {
    border: 1px solid var(--border-color);
    border-radius: var(--radius);
    padding: 20px;
    background: var(--light-bg);
    transition: transform 0.2s;
}

.validator-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 15px rgba(0,0,0,0.1);
}

.validator-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 15px;
}

.validator-name {
    font-weight: 600;
    color: var(--primary-color);
}

.validator-score {
    font-size: 1.2em;
    font-weight: bold;
    padding: 4px 12px;
    border-radius: 15px;
    background: white;
}

.validator-details {
    color: #666;
    font-size: 0.9em;
    line-height: 1.4;
}

/* Problems */
.problems {
    background: white;
    border-radius: var(--radius);
    padding: 30px;
    margin-bottom: 30px;
    box-shadow: var(--shadow);
}

.problems-list {
    margin-top: 20px;
}

.problem-item {
    border-left: 4px solid var(--danger-color);
    background: #fef9f9;
    padding: 15px;
    margin-bottom: 15px;
    border-radius: 0 var(--radius) var(--radius) 0;
}

.problem-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
}

.problem-title {
    font-weight: 600;
    color: var(--primary-color);
}

.severity-badge {
    padding: 4px 8px;
    border-radius: 12px;
    font-size: 0.8em;
    font-weight: 500;
    text-transform: uppercase;
}

.severity-high {
    background: var(--danger-color);
    color: white;
}

.severity-medium {
    background: var(--warning-color);
    color: white;
}

.severity-low {
    background: #95a5a6;
    color: white;
}

.problem-description {
    color: #666;
    margin-bottom: 8px;
}

.problem-solution {
    color: var(--secondary-color);
    font-size: 0.9em;
    font-style: italic;
}

/* Recommendations */
.recommendations {
    background: white;
    border-radius: var(--radius);
    padding: 30px;
    margin-bottom: 30px;
    box-shadow: var(--shadow);
}

.recommendations-list {
    list-style: none;
    margin-top: 20px;
}

.recommendation-item {
    background: #f8f9ff;
    border: 1px solid #e0e7ff;
    padding: 15px;
    margin-bottom: 10px;
    border-radius: var(--radius);
    border-left: 4px solid var(--secondary-color);
}

.recommendation-item::before {
    content: "💡 ";
    margin-right: 8px;
}

/* Visualizations */
.visualizations {
    background: white;
    border-radius: var(--radius);
    padding: 30px;
    margin-bottom: 30px;
    box-shadow: var(--shadow);
}

.viz-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
    gap: 30px;
    margin-top: 20px;
}

.viz-container {
    text-align: center;
    border: 1px solid var(--border-color);
    border-radius: var(--radius);
    padding: 20px;
    background: var(--light-bg);
}

.viz-title {
    margin-bottom: 15px;
    color: var(--primary-color);
    font-weight: 600;
}

.viz-image {
    max-width: 100%;
    height: auto;
    border-radius: var(--radius);
    box-shadow: var(--shadow);
}

/* Technical Details */
.technical-details {
    background: white;
    border-radius: var(--radius);
    padding: 30px;
    margin-bottom: 30px;
    box-shadow: var(--shadow);
}

.technical-content {
    font-family: 'Courier New', monospace;
    background: #f8f9fa;
    padding: 20px;
    border-radius: var(--radius);
    border: 1px solid var(--border-color);
    overflow-x: auto;
}

/* Footer */
.footer {
    background: rgba(255, 255, 255, 0.9);
    border-radius: var(--radius);
    padding: 20px;
    text-align: center;
    margin-top: 30px;
}

.footer-content p {
    color: #666;
    margin: 5px 0;
}

/* Responsive */
@media (max-width: 768px) {
    .container {
        padding: 10px;
    }
    
    .header-content h1 {
        font-size: 2em;
    }
    
    .score-container {
        flex-direction: column;
        text-align: center;
    }
    
    .validators-grid {
        grid-template-columns: 1fr;
    }
    
    .viz-grid {
        grid-template-columns: 1fr;
    }
}

/* Animations */
@keyframes fadeIn {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
}

section {
    animation: fadeIn 0.6s ease-out;
}

/* Charts container */
.chart-container {
    margin: 20px 0;
    text-align: center;
}

.no-visualizations {
    text-align: center;
    color: #666;
    font-style: italic;
    padding: 40px;
}
</style>
"""
    
    def _generar_enlace_css(self) -> str:
        """Genera enlace a archivo CSS externo."""
        return '<link rel="stylesheet" href="styles.css">'
    
    def _generar_javascript(self) -> str:
        """Genera JavaScript incorporado."""
        return """
<script>
document.addEventListener('DOMContentLoaded', function() {
    // Animaciones de entrada
    const sections = document.querySelectorAll('section');
    sections.forEach((section, index) => {
        setTimeout(() => {
            section.style.opacity = '0';
            section.style.transform = 'translateY(20px)';
            section.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
            
            setTimeout(() => {
                section.style.opacity = '1';
                section.style.transform = 'translateY(0)';
            }, 100);
        }, index * 100);
    });
    
    // Tooltips para elementos técnicos
    const tooltips = document.querySelectorAll('[data-tooltip]');
    tooltips.forEach(element => {
        element.addEventListener('mouseenter', function(e) {
            const tooltip = document.createElement('div');
            tooltip.className = 'tooltip';
            tooltip.textContent = this.getAttribute('data-tooltip');
            tooltip.style.cssText = `
                position: absolute;
                background: #333;
                color: white;
                padding: 8px 12px;
                border-radius: 4px;
                font-size: 12px;
                z-index: 1000;
                pointer-events: none;
                max-width: 200px;
            `;
            document.body.appendChild(tooltip);
            
            const rect = this.getBoundingClientRect();
            tooltip.style.left = rect.left + 'px';
            tooltip.style.top = (rect.bottom + 5) + 'px';
            
            this._tooltip = tooltip;
        });
        
        element.addEventListener('mouseleave', function() {
            if (this._tooltip) {
                document.body.removeChild(this._tooltip);
                this._tooltip = null;
            }
        });
    });
    
    // Función para expandir/colapsar detalles
    const expandableElements = document.querySelectorAll('.expandable');
    expandableElements.forEach(element => {
        const header = element.querySelector('.expand-header');
        const content = element.querySelector('.expand-content');
        
        if (header && content) {
            header.style.cursor = 'pointer';
            header.addEventListener('click', function() {
                if (content.style.display === 'none') {
                    content.style.display = 'block';
                    header.querySelector('.expand-icon').textContent = '▼';
                } else {
                    content.style.display = 'none';
                    header.querySelector('.expand-icon').textContent = '▶';
                }
            });
        }
    });
    
    // Función para copiar al portapapeles
    const copyButtons = document.querySelectorAll('[data-copy]');
    copyButtons.forEach(button => {
        button.addEventListener('click', function() {
            const text = this.getAttribute('data-copy');
            navigator.clipboard.writeText(text).then(() => {
                const originalText = this.textContent;
                this.textContent = '¡Copiado!';
                setTimeout(() => {
                    this.textContent = originalText;
                }, 2000);
            });
        });
    });
});
</script>
"""
    
    def _generar_enlace_javascript(self) -> str:
        """Genera enlace a archivo JavaScript externo."""
        return '<script src="script.js"></script>'
    
    def _generar_grid_validadores(self, validadores: Dict) -> str:
        """Genera el grid de validadores."""
        if not validadores:
            return '<p>No hay datos de validadores disponibles</p>'
        
        html = ""
        for nombre, datos in validadores.items():
            puntuacion = datos.get('puntuacion', 0.0)
            color = self._get_color_puntuacion(puntuacion)
            clase = self._get_clase_puntuacion(puntuacion)
            
            html += f"""
            <div class="validator-card">
                <div class="validator-header">
                    <span class="validator-name">{nombre.title()}</span>
                    <span class="validator-score" style="color: {color};">{puntuacion:.1f}</span>
                </div>
                <div class="validator-details">
                    {self._generar_detalles_validador(datos)}
                </div>
            </div>
            """
        
        return html
    
    def _generar_detalles_validador(self, datos: Dict) -> str:
        """Genera detalles específicos de cada validador."""
        detalles = []
        
        # Detalles genéricos
        if 'num_vertices' in datos.get('estadisticas', {}):
            vertices = datos['estadisticas']['num_vertices']
            detalles.append(f"Vértices: {vertices:,}")
        
        if 'num_triangulos' in datos.get('estadisticas', {}):
            triangulos = datos['estadisticas']['num_triangulos']
            detalles.append(f"Triángulos: {triangulos:,}")
        
        if 'total_texturas' in datos.get('estadisticas', {}):
            texturas = datos['estadisticas']['total_texturas']
            detalles.append(f"Texturas: {texturas}")
        
        return "<br>".join(detalles) if detalles else "Sin detalles adicionales"
    
    def _generar_seccion_problemas(self, problemas: List[Dict]) -> str:
        """Genera la sección de problemas."""
        if not problemas:
            return """
            <div class="no-problems">
                <h3>✅ ¡Excelente!</h3>
                <p>No se detectaron problemas significativos en el modelo.</p>
            </div>
            """
        
        html = '<div class="problems-list">'
        
        for problema in problemas:
            tipo = problema.get('tipo', 'desconocido')
            nombre = problema.get('problema', 'problema_desconocido')
            descripcion = problema.get('descripcion', '')
            severidad = problema.get('severidad', 0.5)
            solucion = problema.get('solucion', '')
            
            clase_severidad = self._get_clase_severidad(severidad)
            texto_severidad = self._get_texto_severidad(severidad)
            
            html += f"""
            <div class="problem-item">
                <div class="problem-header">
                    <span class="problem-title">{nombre.replace('_', ' ').title()}</span>
                    <span class="severity-badge {clase_severidad}">{texto_severidad}</span>
                </div>
                <div class="problem-description">{descripcion}</div>
                <div class="problem-solution">💡 Solución: {solucion}</div>
            </div>
            """
        
        html += '</div>'
        return html
    
    def _generar_analisis_detallado(self, resultados: Dict) -> str:
        """Genera la sección de análisis detallado."""
        html = ""
        
        # Análisis geométrico
        if 'geometrico' in resultados.get('validadores', {}):
            geo = resultados['validadores']['geometrico']
            html += self._generar_expandible(
                "Análisis Geométrico", 
                self._generar_datos_geometricos(geo)
            )
        
        # Análisis de texturas
        if 'texturas' in resultados.get('validadores', {}):
            tex = resultados['validadores']['texturas']
            html += self._generar_expandible(
                "Análisis de Texturas", 
                self._generar_datos_texturas(tex)
            )
        
        # Análisis de formato
        if 'formato' in resultados.get('validadores', {}):
            fmt = resultados['validadores']['formato']
            html += self._generar_expandible(
                "Análisis de Formato", 
                self._generar_datos_formato(fmt)
            )
        
        # Análisis de métricas
        if 'metricas' in resultados.get('validadores', {}):
            met = resultados['validadores']['metricas']
            html += self._generar_expandible(
                "Análisis de Métricas", 
                self._generar_datos_metricas(met)
            )
        
        return html
    
    def _generar_expandible(self, titulo: str, contenido: str) -> str:
        """Genera una sección expandible."""
        return f"""
        <div class="expandable">
            <div class="expand-header" style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin-bottom: 10px; cursor: pointer;">
                <span style="font-weight: 600; color: var(--primary-color);">{titulo}</span>
                <span class="expand-icon" style="float: right;">▶</span>
            </div>
            <div class="expand-content" style="display: none; padding: 15px; background: white; border: 1px solid #e0e0e0; border-radius: 8px;">
                {contenido}
            </div>
        </div>
        """
    
    def _generar_datos_geometricos(self, datos: Dict) -> str:
        """Genera datos geométricos para análisis detallado."""
        stats = datos.get('estadisticas', {})
        html = "<div style='font-family: monospace;'>"
        
        html += f"<strong>Vértices:</strong> {stats.get('num_vertices', 'N/A'):,}<br>"
        html += f"<strong>Triángulos:</strong> {stats.get('num_triangulos', 'N/A'):,}<br>"
        html += f"<strong>Volumen:</strong> {stats.get('volumen_aproximado', 0):.2f}<br>"
        html += f"<strong>Área Superficie:</strong> {stats.get('area_superficie', 0):.2f}<br>"
        html += f"<strong>Densidad Triángulos:</strong> {stats.get('densidad_triangulos', 0):.4f}<br>"
        
        html += "</div>"
        return html
    
    def _generar_datos_texturas(self, datos: Dict) -> str:
        """Genera datos de texturas para análisis detallado."""
        stats = datos.get('estadisticas', {})
        html = "<div style='font-family: monospace;'>"
        
        html += f"<strong>Total Texturas:</strong> {stats.get('total_texturas', 'N/A')}<br>"
        html += f"<strong>Resolución Promedio:</strong> {stats.get('resolucion_promedio', 0):,.0f}<br>"
        html += f"<strong>Tamaño Total:</strong> {stats.get('tamaño_total_archivos', 0) / (1024*1024):.1f} MB<br>"
        
        formatos = stats.get('formatos_distribucion', {})
        if formatos:
            html += "<strong>Formatos:</strong><br>"
            for fmt, count in formatos.items():
                html += f"&nbsp;&nbsp;{fmt}: {count}<br>"
        
        html += "</div>"
        return html
    
    def _generar_datos_formato(self, datos: Dict) -> str:
        """Genera datos de formato para análisis detallado."""
        chars = datos.get('caracteristicas', {})
        html = "<div style='font-family: monospace;'>"
        
        html += f"<strong>Tipo:</strong> {chars.get('tipo', 'N/A').upper()}<br>"
        html += f"<strong>Tamaño:</strong> {chars.get('tamaño_mb', 0):.1f} MB<br>"
        html += f"<strong>Meshes:</strong> {chars.get('num_meshes', 0)}<br>"
        html += f"<strong>Materiales:</strong> {chars.get('num_materials', 0)}<br>"
        html += f"<strong>Dependencias:</strong> {len(datos.get('dependencias', []))}<br>"
        
        html += "</div>"
        return html
    
    def _generar_datos_metricas(self, datos: Dict) -> str:
        """Genera datos de métricas para análisis detallado."""
        metricas = datos.get('metricas', {})
        html = "<div style='font-family: monospace;'>"
        
        for metrica, valores in metricas.items():
            if isinstance(valores, dict):
                promedio = valores.get('promedio', 'N/A')
                if isinstance(promedio, (int, float)):
                    html += f"<strong>{metrica.upper()}:</strong> {promedio:.4f}<br>"
                else:
                    html += f"<strong>{metrica.upper()}:</strong> {promedio}<br>"
        
        html += "</div>"
        return html
    
    def _generar_seccion_visualizaciones(self, visualizaciones: Dict) -> str:
        """Genera la sección de visualizaciones."""
        if not visualizaciones:
            return '<section class="visualizations"><div class="no-visualizations">No hay visualizaciones disponibles</div></section>'
        
        html = '<section class="visualizations">'
        html += '<h2>📈 Visualizaciones</h2>'
        html += '<div class="viz-grid">'
        
        for nombre, imagen_base64 in visualizaciones.items():
            html += f"""
            <div class="viz-container">
                <h3 class="viz-title">{nombre.replace('_', ' ').title()}</h3>
                <img src="data:image/png;base64,{imagen_base64}" alt="{nombre}" class="viz-image">
            </div>
            """
        
        html += '</div></section>'
        return html
    
    def _generar_seccion_recomendaciones(self, recomendaciones: List[str]) -> str:
        """Genera la sección de recomendaciones."""
        if not recomendaciones:
            return '<p>No hay recomendaciones específicas.</p>'
        
        html = '<ul class="recommendations-list">'
        for recomendacion in recomendaciones:
            html += f'<li class="recommendation-item">{recomendacion}</li>'
        html += '</ul>'
        
        return html
    
    def _generar_detalles_tecnicos(self, resultados: Dict) -> str:
        """Genera los detalles técnicos."""
        return f"""
        <pre style="white-space: pre-wrap; word-wrap: break-word;">
{json.dumps(resultados, indent=2, ensure_ascii=False)}
        </pre>
        """
    
    def _generar_visualizaciones(self, resultados: Dict) -> Dict[str, str]:
        """Genera visualizaciones usando matplotlib."""
        if not MATPLOTLIB_AVAILABLE:
            return {}
        
        visualizaciones = {}
        
        try:
            # Configurar matplotlib para backend sin GUI
            plt.switch_backend('Agg')
            plt.style.use('seaborn-v0_8')
            
            # 1. Gráfico de puntuaciones por validador
            self._generar_grafico_puntuaciones(resultados, visualizaciones)
            
            # 2. Gráfico de problemas por tipo
            self._generar_grafico_problemas(resultados, visualizaciones)
            
            # 3. Gráfico de métricas
            self._generar_grafico_metricas(resultados, visualizaciones)
            
            # 4. Gauge de puntuación general
            self._generar_gauge_puntuacion(resultados, visualizaciones)
            
        except Exception as e:
            self.logger.error(f"Error generando visualizaciones: {str(e)}")
        
        return visualizaciones
    
    def _generar_grafico_puntuaciones(self, resultados: Dict, visualizaciones: Dict):
        """Genera gráfico de puntuaciones por validador."""
        try:
            validadores = resultados.get('validadores', {})
            nombres = []
            puntuaciones = []
            
            for nombre, datos in validadores.items():
                nombres.append(nombre.replace('_', ' ').title())
                puntuaciones.append(datos.get('puntuacion', 0.0))
            
            if not nombres:
                return
            
            fig, ax = plt.subplots(figsize=(10, 6))
            colores = [self._get_color_puntuacion(p) for p in puntuaciones]
            
            bars = ax.bar(nombres, puntuaciones, color=colores, alpha=0.8)
            
            # Añadir valores en las barras
            for bar, puntuacion in zip(bars, puntuaciones):
                height = bar.get_height()
                ax.text(bar.get_x() + bar.get_width()/2., height + 0.1,
                       f'{puntuacion:.1f}', ha='center', va='bottom', fontweight='bold')
            
            ax.set_title('Puntuaciones por Validador', fontsize=16, fontweight='bold', pad=20)
            ax.set_ylabel('Puntuación (0-10)', fontsize=12)
            ax.set_ylim(0, 10)
            ax.grid(axis='y', alpha=0.3)
            
            plt.xticks(rotation=45, ha='right')
            plt.tight_layout()
            
            # Convertir a base64
            buffer = BytesIO()
            plt.savefig(buffer, format='png', dpi=150, bbox_inches='tight')
            buffer.seek(0)
            visualizaciones['puntuaciones_validadores'] = base64.b64encode(buffer.getvalue()).decode()
            plt.close()
            
        except Exception as e:
            self.logger.error(f"Error generando gráfico de puntuaciones: {str(e)}")
    
    def _generar_grafico_problemas(self, resultados: Dict, visualizaciones: Dict):
        """Genera gráfico de problemas por tipo."""
        try:
            problemas = resultados.get('problemas_detectados', [])
            
            if not problemas:
                return
            
            # Contar problemas por tipo
            tipos_problemas = {}
            for problema in problemas:
                tipo = problema.get('tipo', 'desconocido')
                tipos_problemas[tipo] = tipos_problemas.get(tipo, 0) + 1
            
            if not tipos_problemas:
                return
            
            fig, ax = plt.subplots(figsize=(8, 8))
            
            # Crear gráfico de pastel
            colores = ['#e74c3c', '#f39c12', '#f1c40f', '#3498db', '#9b59b6']
            wedges, texts, autotexts = ax.pie(
                tipos_problemas.values(), 
                labels=tipos_problemas.keys(),
                autopct='%1.1f%%',
                colors=colores[:len(tipos_problemas)],
                startangle=90,
                explode=[0.05] * len(tipos_problemas)
            )
            
            ax.set_title('Distribución de Problemas por Tipo', fontsize=16, fontweight='bold', pad=20)
            
            # Mejorar legibilidad
            for autotext in autotexts:
                autotext.set_color('white')
                autotext.set_fontweight('bold')
            
            plt.tight_layout()
            
            # Convertir a base64
            buffer = BytesIO()
            plt.savefig(buffer, format='png', dpi=150, bbox_inches='tight')
            buffer.seek(0)
            visualizaciones['distribucion_problemas'] = base64.b64encode(buffer.getvalue()).decode()
            plt.close()
            
        except Exception as e:
            self.logger.error(f"Error generando gráfico de problemas: {str(e)}")
    
    def _generar_grafico_metricas(self, resultados: Dict, visualizaciones: Dict):
        """Genera gráfico de métricas de calidad."""
        try:
            validadores = resultados.get('validadores', {})
            metricas_data = {}
            
            for nombre, datos in validadores.items():
                if 'metricas' in datos:
                    metricas = datos['metricas']
                    if isinstance(metricas, dict):
                        for metrica, valores in metricas.items():
                            if isinstance(valores, dict) and 'promedio' in valores:
                                key = f"{nombre}_{metrica}"
                                metricas_data[key] = valores['promedio']
            
            if not metricas_data:
                return
            
            fig, ax = plt.subplots(figsize=(12, 8))
            
            # Seleccionar solo las primeras 10 métricas para no sobrecargar
            items = list(metricas_data.items())[:10]
            nombres = [item[0] for item in items]
            valores = [item[1] for item in items]
            
            # Crear gráfico de barras horizontal
            y_pos = np.arange(len(nombres))
            bars = ax.barh(y_pos, valores, color='skyblue', alpha=0.8)
            
            # Añadir valores en las barras
            for i, (bar, valor) in enumerate(zip(bars, valores)):
                width = bar.get_width()
                ax.text(width + max(valores) * 0.01, bar.get_y() + bar.get_height()/2.,
                       f'{valor:.3f}', ha='left', va='center', fontweight='bold')
            
            ax.set_yticks(y_pos)
            ax.set_yticklabels([n.replace('_', ' ').title() for n in nombres])
            ax.set_xlabel('Valor', fontsize=12)
            ax.set_title('Métricas de Calidad Detalladas', fontsize=16, fontweight='bold', pad=20)
            ax.grid(axis='x', alpha=0.3)
            
            plt.tight_layout()
            
            # Convertir a base64
            buffer = BytesIO()
            plt.savefig(buffer, format='png', dpi=150, bbox_inches='tight')
            buffer.seek(0)
            visualizaciones['metricas_detalladas'] = base64.b64encode(buffer.getvalue()).decode()
            plt.close()
            
        except Exception as e:
            self.logger.error(f"Error generando gráfico de métricas: {str(e)}")
    
    def _generar_gauge_puntuacion(self, resultados: Dict, visualizaciones: Dict):
        """Genera gauge de puntuación general."""
        try:
            puntuacion = resultados.get('puntuacion_calidad', 0.0)
            
            fig, ax = plt.subplots(figsize=(10, 8), subplot_kw=dict(projection='polar'))
            
            # Convertir puntuación a ángulo (0-180 grados)
            angle = (puntuacion / 10.0) * np.pi
            
            # Crear arco de gauge
            theta = np.linspace(0, np.pi, 100)
            r = np.ones_like(theta)
            
            # Colores por puntuación
            if puntuacion >= 8:
                color = self.color_excelente
            elif puntuacion >= 6:
                color = self.color_bueno
            elif puntuacion >= 4:
                color = self.color_aceptable
            else:
                color = self.color_problematico
            
            ax.plot(theta, r, color='lightgray', linewidth=20, alpha=0.3)
            
            # Arco de puntuación
            theta_score = np.linspace(0, angle, int(angle * 50))
            ax.plot(theta_score, r, color=color, linewidth=20)
            
            # Aguja
            ax.plot([0, angle], [0, 1], color='black', linewidth=3)
            
            # Centro
            ax.scatter(0, 0, s=100, color='black')
            
            # Etiquetas
            ax.set_ylim(0, 1.2)
            ax.set_rticks([])
            ax.set_thetagrids([0, 45, 90, 135, 180], ['10', '8', '6', '4', '2'])
            ax.set_title(f'Puntuación General: {puntuacion:.1f}/10', 
                        fontsize=20, fontweight='bold', pad=30)
            
            plt.tight_layout()
            
            # Convertir a base64
            buffer = BytesIO()
            plt.savefig(buffer, format='png', dpi=150, bbox_inches='tight')
            buffer.seek(0)
            visualizaciones['gauge_puntuacion'] = base64.b64encode(buffer.getvalue()).decode()
            plt.close()
            
        except Exception as e:
            self.logger.error(f"Error generando gauge de puntuación: {str(e)}")
    
    def _get_color_puntuacion(self, puntuacion: float) -> str:
        """Obtiene color basado en puntuación."""
        if puntuacion >= 8:
            return self.color_excelente
        elif puntuacion >= 6:
            return self.color_bueno
        elif puntuacion >= 4:
            return self.color_aceptable
        else:
            return self.color_problematico
    
    def _get_clase_puntuacion(self, puntuacion: float) -> str:
        """Obtiene clase CSS basada en puntuación."""
        if puntuacion >= 8:
            return 'status-excelente'
        elif puntuacion >= 6:
            return 'status-bueno'
        elif puntuacion >= 4:
            return 'status-aceptable'
        else:
            return 'status-problematico
    
    def _get_texto_puntuacion(self, puntuacion: float) -> str:
        """Obtiene texto descriptivo de la puntuación."""
        if puntuacion >= 8:
            return 'Excelente'
        elif puntuacion >= 6:
            return 'Bueno'
        elif puntuacion >= 4:
            return 'Aceptable'
        else:
            return 'Problemático'
    
    def _get_descripcion_puntuacion(self, puntuacion: float) -> str:
        """Obtiene descripción detallada de la puntuación."""
        if puntuacion >= 8:
            return "El modelo presenta excelente calidad con mínimos problemas."
        elif puntuacion >= 6:
            return "El modelo tiene buena calidad con algunos aspectos mejorables."
        elif puntuacion >= 4:
            return "El modelo es aceptable pero requiere mejoras importantes."
        else:
            return "El modelo presenta problemas significativos que requieren atención."
    
    def _get_clase_severidad(self, severidad: float) -> str:
        """Obtiene clase CSS basada en severidad."""
        if severidad >= 0.7:
            return 'severity-high'
        elif severidad >= 0.4:
            return 'severity-medium'
        else:
            return 'severity-low'
    
    def _get_texto_severidad(self, severidad: float) -> str:
        """Obtiene texto de severidad."""
        if severidad >= 0.7:
            return 'Alta'
        elif severidad >= 0.4:
            return 'Media'
        else:
            return 'Baja'
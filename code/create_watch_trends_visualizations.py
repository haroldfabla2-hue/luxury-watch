#!/usr/bin/env python3
"""
Generación de visualizaciones para el informe de tendencias de relojes personalizados 2025
"""

import matplotlib.pyplot as plt
import seaborn as sns
import numpy as np
import pandas as pd
import warnings

def setup_matplotlib_for_plotting():
    """
    Setup matplotlib and seaborn for plotting with proper configuration.
    Call this function before creating any plots to ensure proper rendering.
    """
    warnings.filterwarnings('default')  # Show all warnings
    
    # Configure matplotlib for non-interactive mode
    plt.switch_backend("Agg")
    
    # Set chart style
    plt.style.use("seaborn-v0_8")
    sns.set_palette("husl")
    
    # Configure platform-appropriate fonts for cross-platform compatibility
    plt.rcParams["font.sans-serif"] = ["Noto Sans CJK SC", "WenQuanYi Zen Hei", "PingFang SC", "Arial Unicode MS", "Hiragino Sans GB"]
    plt.rcParams["axes.unicode_minus"] = False

def create_dial_colors_chart():
    """Crear gráfico de cuotas de mercado de colores de esferas"""
    setup_matplotlib_for_plotting()
    
    # Datos basados en Bezel Report 2024
    colors = ['Negro', 'Azul', 'Plata', 'Blanco', 'Verde']
    market_share = [38, 15, 15, 10, 5]
    other = 100 - sum(market_share)
    colors.append('Otros')
    market_share.append(other)
    
    # Colores específicos para cada tipo de dial
    color_map = {
        'Negro': '#2C2C2C',
        'Azul': '#1E3A8A', 
        'Plata': '#9CA3AF',
        'Blanco': '#F8F9FA',
        'Verde': '#16A34A',
        'Otros': '#E5E7EB'
    }
    
    pie_colors = [color_map[c] for c in colors]
    
    fig, ax = plt.subplots(figsize=(10, 8))
    
    wedges, texts, autotexts = ax.pie(market_share, labels=colors, autopct='%1.1f%%', 
                                     colors=pie_colors, startangle=90)
    
    ax.set_title('Cuotas de Mercado de Colores de Esferas 2025\n(Based on Bezel Report 2024)', 
                 fontsize=16, fontweight='bold', pad=20)
    
    # Mejorar legibilidad
    for autotext in autotexts:
        autotext.set_color('white')
        autotext.set_fontweight('bold')
    
    plt.tight_layout()
    plt.savefig('/workspace/docs/tendencias/dial_colors_market_share.png', 
                dpi=300, bbox_inches='tight')
    plt.close()

def create_materials_trend_chart():
    """Crear gráfico de tendencias de materiales"""
    setup_matplotlib_for_plotting()
    
    # Datos de tendencias de materiales
    materials = ['Oro Amarillo/\nRosa', 'Cerámica', 'Titanio', 'Acero\nInoxidable', 
                'Materiales\nExtremos', 'Metales\nReciclados']
    trend_scores = [90, 85, 80, 70, 65, 75]  # Puntuación basada en análisis de fuentes
    
    fig, ax = plt.subplots(figsize=(12, 8))
    
    bars = ax.bar(materials, trend_scores, color=['#FFD700', '#4F46E5', '#6B7280', 
                                                '#9CA3AF', '#8B5CF6', '#10B981'])
    
    ax.set_ylabel('Puntuación de Tendencia (0-100)', fontsize=12)
    ax.set_title('Materiales Trending en Relojes Personalizados 2025', 
                 fontsize=16, fontweight='bold', pad=20)
    ax.set_ylim(0, 100)
    
    # Añadir valores en las barras
    for bar, score in zip(bars, trend_scores):
        height = bar.get_height()
        ax.text(bar.get_x() + bar.get_width()/2., height + 1,
                f'{score}', ha='center', va='bottom', fontweight='bold')
    
    plt.xticks(rotation=45, ha='right')
    plt.tight_layout()
    plt.savefig('/workspace/docs/tendencias/materials_trends_2025.png', 
                dpi=300, bbox_inches='tight')
    plt.close()

def create_strap_popularity_chart():
    """Crear gráfico de popularidad de correas/bracelets"""
    setup_matplotlib_for_plotting()
    
    # Datos de popularidad de correas
    strap_types = ['Malla Acero', 'Cuero Tonos\nTierra', 'Silicona\nVibrante', 
                  'Cuero Negro\nClásico', 'Nylon\nNATO', 'Otros']
    popularity = [35, 30, 20, 10, 3, 2]
    
    fig, ax = plt.subplots(figsize=(10, 8))
    
    # Colores para cada tipo de correa
    colors = ['#374151', '#A16207', '#DC2626', '#000000', '#059669', '#6B7280']
    
    bars = ax.barh(strap_types, popularity, color=colors)
    
    ax.set_xlabel('Popularidad (%)', fontsize=12)
    ax.set_title('Tendencias de Correas y Bracelets 2025', 
                 fontsize=16, fontweight='bold', pad=20)
    
    # Añadir valores en las barras
    for bar, pop in zip(bars, popularity):
        width = bar.get_width()
        ax.text(width + 0.5, bar.get_y() + bar.get_height()/2.,
                f'{pop}%', ha='left', va='center', fontweight='bold')
    
    plt.tight_layout()
    plt.savefig('/workspace/docs/tendencias/strap_trends_2025.png', 
                dpi=300, bbox_inches='tight')
    plt.close()

def create_case_styles_trend():
    """Crear gráfico de tendencias de estilos de cajas"""
    setup_matplotlib_for_plotting()
    
    # Datos de estilos de cajas
    case_styles = ['Cajas\nAsimétricas', 'Cajas\nCojín', 'Cajas\nRedondas\nClásicas', 
                  'Cajas\nCuadradas', 'Cajas\ntonneau']
    trend_2025 = [25, 35, 20, 15, 5]
    
    fig, ax = plt.subplots(figsize=(10, 8))
    
    bars = ax.bar(case_styles, trend_2025, color=['#8B5CF6', '#10B981', '#F59E0B', 
                                                '#EF4444', '#6B7280'])
    
    ax.set_ylabel('Adopción (%)', fontsize=12)
    ax.set_title('Tendencias de Estilos de Cajas 2025', 
                 fontsize=16, fontweight='bold', pad=20)
    
    # Añadir valores en las barras
    for bar, trend in zip(bars, trend_2025):
        height = bar.get_height()
        ax.text(bar.get_x() + bar.get_width()/2., height + 0.5,
                f'{trend}%', ha='center', va='bottom', fontweight='bold')
    
    plt.xticks(rotation=45, ha='right')
    plt.tight_layout()
    plt.savefig('/workspace/docs/tendencias/case_styles_trends_2025.png', 
                dpi=300, bbox_inches='tight')
    plt.close()

def create_functionality_demand_chart():
    """Crear gráfico de funcionalidades más demandadas"""
    setup_matplotlib_for_plotting()
    
    # Datos de funcionalidades
    functionalities = ['Personalización\nAvanzada', 'Integración\nHíbrida', 'Correas\nIntercambiables', 
                      'Resistencia\nAgua', 'Brazaletes\nMalla', 'Sensores\nSalud']
    demand = [45, 40, 35, 30, 25, 20]
    
    fig, ax = plt.subplots(figsize=(12, 8))
    
    bars = ax.barh(functionalities, demand, color=['#F59E0B', '#10B981', '#3B82F6', 
                                                '#EF4444', '#8B5CF6', '#EC4899'])
    
    ax.set_xlabel('Nivel de Demanda (%)', fontsize=12)
    ax.set_title('Funcionalidades Más Demandadas en Relojes Personalizados 2025', 
                 fontsize=16, fontweight='bold', pad=20)
    
    # Añadir valores en las barras
    for bar, demand_level in zip(bars, demand):
        width = bar.get_width()
        ax.text(width + 0.5, bar.get_y() + bar.get_height()/2.,
                f'{demand_level}%', ha='left', va='center', fontweight='bold')
    
    plt.tight_layout()
    plt.savefig('/workspace/docs/tendencias/functionality_demand_2025.png', 
                dpi=300, bbox_inches='tight')
    plt.close()

def create_size_preference_chart():
    """Crear gráfico de preferencias de tamaño de cajas"""
    setup_matplotlib_for_plotting()
    
    # Datos de preferencias de tamaño
    sizes = ['36-38mm', '39-40mm', '41-42mm', '43-44mm', '45mm+']
    preference_2025 = [35, 30, 20, 10, 5]
    
    fig, ax = plt.subplots(figsize=(10, 8))
    
    bars = ax.bar(sizes, preference_2025, color=['#10B981', '#3B82F6', '#F59E0B', 
                                               '#EF4444', '#6B7280'])
    
    ax.set_ylabel('Preferencia (%)', fontsize=12)
    ax.set_title('Preferencias de Tamaño de Cajas 2025', 
                 fontsize=16, fontweight='bold', pad=20)
    ax.set_ylim(0, 40)
    
    # Añadir valores en las barras
    for bar, pref in zip(bars, preference_2025):
        height = bar.get_height()
        ax.text(bar.get_x() + bar.get_width()/2., height + 0.5,
                f'{pref}%', ha='center', va='bottom', fontweight='bold')
    
    plt.xticks(rotation=45, ha='right')
    plt.tight_layout()
    plt.savefig('/workspace/docs/tendencias/size_preferences_2025.png', 
                dpi=300, bbox_inches='tight')
    plt.close()

def main():
    """Generar todas las visualizaciones"""
    print("Generando visualizaciones para el informe de tendencias de relojes 2025...")
    
    # Crear todas las visualizaciones
    create_dial_colors_chart()
    print("✓ Gráfico de cuotas de mercado de colores creado")
    
    create_materials_trend_chart()
    print("✓ Gráfico de tendencias de materiales creado")
    
    create_strap_popularity_chart()
    print("✓ Gráfico de popularidad de correas creado")
    
    create_case_styles_trend()
    print("✓ Gráfico de tendencias de estilos de cajas creado")
    
    create_functionality_demand_chart()
    print("✓ Gráfico de funcionalidades demandadas creado")
    
    create_size_preference_chart()
    print("✓ Gráfico de preferencias de tamaño creado")
    
    print("\nTodas las visualizaciones han sido generadas exitosamente en /workspace/docs/tendencias/")

if __name__ == "__main__":
    main()

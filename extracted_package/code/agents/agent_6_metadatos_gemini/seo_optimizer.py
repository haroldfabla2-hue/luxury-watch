"""
Optimizador SEO para el Agente 6 de Metadatos.

Proporciona herramientas específicas para optimizar contenido para motores de búsqueda,
análisis de keywords, validación de meta tags y generación de contenido SEO-friendly.
"""

import re
import math
import logging
from typing import Dict, List, Optional, Any, Tuple
from collections import Counter
from dataclasses import dataclass
from .types import ConfiguracionAgente


@dataclass
class SEOAnalysis:
    """Resultado del análisis SEO."""
    score: float
    title_length: int
    description_length: int
    keyword_density: Dict[str, float]
    readability_score: float
    issues: List[str]
    recommendations: List[str]
    improvements_applied: List[str]


@dataclass
class KeywordAnalysis:
    """Análisis detallado de keywords."""
    keyword: str
    density: float
    frequency: int
    positions: List[int]
    is_primary: bool
    suggestions: List[str]


@dataclass
class MetaTagValidation:
    """Validación de meta tags."""
    is_valid: bool
    errors: List[str]
    warnings: List[str]
    recommendations: List[str]


class SEOOptimizer:
    """
    Optimizador SEO especializado para contenido de componentes de reloj.
    
    Proporciona:
    - Análisis de keywords y densidad
    - Optimización de meta tags
    - Mejora de legibilidad
    - Validación de estructura SEO
    - Sugerencias de mejora
    """
    
    def __init__(self, config: ConfiguracionAgente):
        """
        Inicializa el optimizador SEO.
        
        Args:
            config: Configuración del agente
        """
        self.config = config
        self.logger = logging.getLogger(__name__)
        
        # Configuración SEO
        self.target_density = config.target_keywords_density  # % objetivo
        self.min_title_length = 30
        self.max_title_length = 60
        self.min_description_length = 120
        self.max_description_length = 155
        self.min_seo_score = config.min_seo_score
        
        # Palabras comunes a filtrar en análisis
        self.stop_words = {
            "el", "la", "de", "que", "y", "a", "en", "un", "es", "se", "no", "te", "lo", 
            "le", "da", "su", "por", "son", "con", "para", "al", "del", "los", "las",
            "the", "and", "or", "but", "in", "on", "at", "to", "for", "of", "with",
            "by", "is", "are", "was", "were", "be", "been", "have", "has", "had",
            "do", "does", "did", "will", "would", "could", "should", "may", "might"
        }
        
        # Keywords de la industria relojera
        self.industry_keywords = {
            "reloj": ["watch", "timepiece", "time", "horology"],
            "materiales": ["steel", "gold", "titanium", "ceramic", "carbon"],
            "mecanismo": ["movement", "mechanism", "caliber", "movement"],
            "lujo": ["luxury", "premium", "exclusive", "heritage", "craftsmanship"],
            "precision": ["precision", "accurate", "swiss", "quality"],
            "diseño": ["design", "aesthetic", "style", "fashion"],
            "tecnología": ["technology", "innovation", "advanced", "cutting-edge"]
        }
    
    def analyze_content_seo(
        self, 
        content: str, 
        keywords: List[str],
        title: str = "",
        description: str = ""
    ) -> SEOAnalysis:
        """
        Analiza el SEO de un contenido.
        
        Args:
            content: Contenido a analizar
            keywords: Keywords objetivo
            title: Título de la página
            description: Meta descripción
            
        Returns:
            SEOAnalysis con resultados completos
        """
        # Limpiar y normalizar texto
        clean_content = self._clean_text(content)
        words = clean_content.split()
        total_words = len(words)
        
        if total_words == 0:
            return SEOAnalysis(
                score=0.0,
                title_length=len(title),
                description_length=len(description),
                keyword_density={},
                readability_score=0.0,
                issues=["Contenido vacío"],
                recommendations=["Añadir contenido relevante"]
            )
        
        # Análisis de densidad de keywords
        keyword_density = self._analyze_keyword_density(content, keywords)
        
        # Análisis de legibilidad
        readability_score = self._calculate_readability(content)
        
        # Análisis de título y descripción
        title_length = len(title)
        description_length = len(description)
        
        # Cálculo del score SEO
        seo_score = self._calculate_seo_score(
            title_length, description_length, keyword_density, readability_score
        )
        
        # Identificar problemas
        issues = self._identify_seo_issues(
            title_length, description_length, keyword_density, readability_score
        )
        
        # Generar recomendaciones
        recommendations = self._generate_seo_recommendations(
            title_length, description_length, keyword_density, issues
        )
        
        return SEOAnalysis(
            score=seo_score,
            title_length=title_length,
            description_length=description_length,
            keyword_density=keyword_density,
            readability_score=readability_score,
            issues=issues,
            recommendations=recommendations,
            improvements_applied=[]
        )
    
    def optimize_title(
        self, 
        title: str, 
        primary_keywords: List[str],
        brand: str = "LuxuryWatch"
    ) -> str:
        """
        Optimiza un título para SEO.
        
        Args:
            title: Título original
            primary_keywords: Keywords principales
            brand: Marca para añadir
            
        Returns:
            Título optimizado
        """
        # Extraer palabras clave del título actual
        current_words = self._clean_text(title).split()
        
        # Añadir keywords principales si no están presentes
        optimized_title = title
        for keyword in primary_keywords[:2]:  # Máximo 2 keywords adicionales
            if keyword.lower() not in title.lower():
                if len(optimized_title) < self.max_title_length - len(keyword) - 3:
                    optimized_title += f" | {keyword}"
        
        # Añadir marca si no está presente
        if brand.lower() not in optimized_title.lower():
            if len(optimized_title) < self.max_title_length - len(brand) - 3:
                optimized_title += f" | {brand}"
        
        # Truncar si es necesario
        if len(optimized_title) > self.max_title_length:
            optimized_title = optimized_title[:self.max_title_length-3] + "..."
        
        return optimized_title
    
    def optimize_description(
        self, 
        description: str, 
        keywords: List[str],
        call_to_action: str = "Descubre más"
    ) -> str:
        """
        Optimiza una meta descripción para SEO.
        
        Args:
            description: Descripción original
            keywords: Keywords a incluir
            call_to_action: Llamada a la acción
            
        Returns:
            Descripción optimizada
        """
        # Extraer texto limpio
        clean_desc = self._clean_text(description)
        
        # Asegurar que las keywords principales estén presentes
        optimized_desc = clean_desc
        for keyword in keywords[:3]:  # Máximo 3 keywords
            if keyword.lower() not in clean_desc.lower():
                if len(optimized_desc) < self.max_description_length - len(keyword) - 2:
                    optimized_desc += f" {keyword}"
        
        # Añadir call-to-action si hay espacio
        if len(optimized_desc) < self.max_description_length - len(call_to_action) - 2:
            optimized_desc += f". {call_to_action}."
        
        # Truncar si excede límite
        if len(optimized_desc) > self.max_description_length:
            optimized_desc = optimized_desc[:self.max_description_length-3] + "..."
        
        return optimized_desc
    
    def generate_meta_tags(
        self, 
        title: str, 
        description: str, 
        keywords: List[str],
        canonical_url: str = "",
        og_image: str = ""
    ) -> Dict[str, str]:
        """
        Genera meta tags completos para SEO.
        
        Args:
            title: Título optimizado
            description: Descripción optimizada
            keywords: Lista de keywords
            canonical_url: URL canónica
            og_image: Imagen para Open Graph
            
        Returns:
            Diccionario con meta tags
        """
        meta_tags = {
            "title": title,
            "description": description,
            "keywords": ", ".join(keywords),
            "robots": "index, follow",
            "author": "LuxuryWatch Configurator",
            "viewport": "width=device-width, initial-scale=1.0",
            "format-detection": "telephone=no"
        }
        
        # Open Graph tags
        meta_tags.update({
            "og:title": title,
            "og:description": description,
            "og:type": "product",
            "og:site_name": "LuxuryWatch",
            "og:locale": "es_ES"
        })
        
        if og_image:
            meta_tags["og:image"] = og_image
        
        # Twitter Card tags
        meta_tags.update({
            "twitter:card": "summary_large_image",
            "twitter:title": title,
            "twitter:description": description
        })
        
        if og_image:
            meta_tags["twitter:image"] = og_image
        
        # Canonical URL
        if canonical_url:
            meta_tags["canonical"] = canonical_url
        
        return meta_tags
    
    def validate_meta_tags(self, meta_tags: Dict[str, str]) -> MetaTagValidation:
        """
        Valida meta tags para SEO.
        
        Args:
            meta_tags: Meta tags a validar
            
        Returns:
            MetaTagValidation con resultados
        """
        errors = []
        warnings = []
        recommendations = []
        
        # Validar título
        title = meta_tags.get("title", "")
        if not title:
            errors.append("Título faltante")
        elif len(title) < self.min_title_length:
            warnings.append(f"Título muy corto ({len(title)} chars, mínimo {self.min_title_length})")
        elif len(title) > self.max_title_length:
            warnings.append(f"Título muy largo ({len(title)} chars, máximo {self.max_title_length})")
        
        # Validar descripción
        description = meta_tags.get("description", "")
        if not description:
            errors.append("Meta descripción faltante")
        elif len(description) < self.min_description_length:
            warnings.append(f"Descripción muy corta ({len(description)} chars, mínimo {self.min_description_length})")
        elif len(description) > self.max_description_length:
            warnings.append(f"Descripción muy larga ({len(description)} chars, máximo {self.max_description_length})")
        
        # Validar keywords
        keywords = meta_tags.get("keywords", "")
        if not keywords:
            warnings.append("Keywords faltantes")
        else:
            keyword_list = [k.strip() for k in keywords.split(",")]
            if len(keyword_list) < 3:
                warnings.append("Muy pocas keywords (recomendado: 5-10)")
            elif len(keyword_list) > 20:
                warnings.append("Demasiadas keywords (recomendado: máximo 15)")
        
        # Validar Open Graph
        if not meta_tags.get("og:title"):
            recommendations.append("Añadir og:title para redes sociales")
        if not meta_tags.get("og:description"):
            recommendations.append("Añadir og:description para redes sociales")
        if not meta_tags.get("og:image"):
            recommendations.append("Añadir og:image para mejor engagement en redes")
        
        # Validar Twitter Cards
        if not meta_tags.get("twitter:card"):
            recommendations.append("Añadir twitter:card para Twitter")
        
        is_valid = len(errors) == 0
        
        return MetaTagValidation(
            is_valid=is_valid,
            errors=errors,
            warnings=warnings,
            recommendations=recommendations
        )
    
    def improve_content_seo(
        self, 
        content: str, 
        keywords: List[str],
        target_density: float = None
    ) -> Tuple[str, SEOAnalysis]:
        """
        Mejora el SEO de un contenido.
        
        Args:
            content: Contenido original
            keywords: Keywords objetivo
            target_density: Densidad objetivo (por defecto: config)
            
        Returns:
            Tuple con (contenido_mejorado, analisis)
        """
        if target_density is None:
            target_density = self.target_density
        
        # Analizar contenido actual
        analysis = self.analyze_content_seo(content, keywords)
        improved_content = content
        improvements_applied = []
        
        # Optimizar densidad de keywords
        improved_content = self._optimize_keyword_density(improved_content, keywords, target_density)
        if improved_content != content:
            improvements_applied.append("Optimizada densidad de keywords")
        
        # Mejorar estructura de párrafos
        improved_content = self._improve_paragraph_structure(improved_content)
        improvements_applied.append("Mejorada estructura de párrafos")
        
        # Optimizar encabezados
        improved_content = self._optimize_headings(improved_content, keywords)
        improvements_applied.append("Optimizados encabezados")
        
        # Recalcular análisis
        final_analysis = self.analyze_content_seo(improved_content, keywords)
        final_analysis.improvements_applied = improvements_applied
        
        return improved_content, final_analysis
    
    def _clean_text(self, text: str) -> str:
        """Limpia y normaliza texto."""
        if not text:
            return ""
        
        # Convertir a minúsculas y limpiar
        text = text.lower()
        
        # Remover caracteres especiales pero mantener espacios
        text = re.sub(r'[^\w\s]', ' ', text)
        
        # Normalizar espacios
        text = re.sub(r'\s+', ' ', text)
        
        return text.strip()
    
    def _analyze_keyword_density(
        self, 
        content: str, 
        keywords: List[str]
    ) -> Dict[str, float]:
        """Analiza la densidad de keywords en el contenido."""
        clean_content = self._clean_text(content)
        words = clean_content.split()
        total_words = len(words)
        
        if total_words == 0:
            return {}
        
        keyword_density = {}
        
        for keyword in keywords:
            clean_keyword = self._clean_text(keyword)
            keyword_words = clean_keyword.split()
            
            if len(keyword_words) == 1:
                # Keyword de una palabra
                frequency = clean_content.count(clean_keyword)
            else:
                # Keyword de múltiples palabras
                frequency = clean_content.count(clean_keyword)
            
            density = (frequency / total_words) * 100
            keyword_density[keyword] = round(density, 2)
        
        return keyword_density
    
    def _calculate_readability(self, content: str) -> float:
        """
        Calcula score de legibilidad simplificado.
        En un sistema real usaríamos índices como Flesch-Kincaid.
        """
        if not content:
            return 0.0
        
        sentences = len(re.split(r'[.!?]+', content))
        words = len(content.split())
        syllables = self._count_syllables(content)
        
        if sentences == 0 or words == 0:
            return 0.0
        
        # Fórmula simplificada de legibilidad
        # 206.835 - 1.015*(words/sentences) - 84.6*(syllables/words)
        readability = 206.835 - (1.015 * (words / sentences)) - (84.6 * (syllables / words))
        
        # Normalizar a escala 0-100
        return max(0, min(100, readability + 50))
    
    def _count_syllables(self, text: str) -> int:
        """Cuenta sílabas de forma aproximada."""
        vowels = "aeiouyáéíóú"
        words = text.lower().split()
        total_syllables = 0
        
        for word in words:
            word = re.sub(r'[^a-záéíóúü]', '', word)
            if not word:
                continue
            
            syllables_in_word = 0
            prev_was_vowel = False
            
            for char in word:
                is_vowel = char in vowels
                if is_vowel and not prev_was_vowel:
                    syllables_in_word += 1
                prev_was_vowel = is_vowel
            
            # Cada palabra tiene al menos una sílaba
            if syllables_in_word == 0:
                syllables_in_word = 1
            
            total_syllables += syllables_in_word
        
        return total_syllables
    
    def _calculate_seo_score(
        self, 
        title_length: int, 
        description_length: int,
        keyword_density: Dict[str, float], 
        readability: float
    ) -> float:
        """Calcula score SEO general."""
        score = 100.0
        
        # Penalizar longitudes inadecuadas
        if title_length < self.min_title_length:
            score -= (self.min_title_length - title_length) * 2
        elif title_length > self.max_title_length:
            score -= (title_length - self.max_title_length) * 1.5
        
        if description_length < self.min_description_length:
            score -= (self.min_description_length - description_length) * 1
        elif description_length > self.max_description_length:
            score -= (description_length - self.max_description_length) * 0.5
        
        # Evaluar densidad de keywords
        for keyword, density in keyword_density.items():
            if density < 0.5:
                score -= 5  # Keyword muy baja
            elif density > 5.0:
                score -= 10  # Keyword stuffing
            elif 1.0 <= density <= 3.0:
                score += 2  # Densidad óptima
        
        # Evaluar legibilidad
        if readability < 50:
            score -= 15
        elif readability >= 70:
            score += 5
        
        return max(0, min(100, score))
    
    def _identify_seo_issues(
        self, 
        title_length: int, 
        description_length: int,
        keyword_density: Dict[str, float], 
        readability: float
    ) -> List[str]:
        """Identifica problemas SEO."""
        issues = []
        
        if title_length < self.min_title_length:
            issues.append(f"Título muy corto ({title_length}/{self.min_title_length} chars)")
        elif title_length > self.max_title_length:
            issues.append(f"Título muy largo ({title_length}/{self.max_title_length} chars)")
        
        if description_length < self.min_description_length:
            issues.append(f"Descripción muy corta ({description_length}/{self.min_description_length} chars)")
        elif description_length > self.max_description_length:
            issues.append(f"Descripción muy larga ({description_length}/{self.max_description_length} chars)")
        
        for keyword, density in keyword_density.items():
            if density < 0.5:
                issues.append(f"Keyword '{keyword}' con densidad muy baja ({density}%)")
            elif density > 5.0:
                issues.append(f"Keyword '{keyword}' con posible keyword stuffing ({density}%)")
        
        if readability < 50:
            issues.append(f"Legibilidad muy baja ({readability}/100)")
        
        return issues
    
    def _generate_seo_recommendations(
        self, 
        title_length: int, 
        description_length: int,
        keyword_density: Dict[str, float], 
        issues: List[str]
    ) -> List[str]:
        """Genera recomendaciones SEO."""
        recommendations = []
        
        if title_length < self.min_title_length:
            recommendations.append("Ampliar título con keywords relevantes")
        elif title_length > self.max_title_length:
            recommendations.append("Reducir título manteniendo keywords principales")
        
        if description_length < self.min_description_length:
            recommendations.append("Ampliar descripción con más detalles y keywords")
        elif description_length > self.max_description_length:
            recommendations.append("Condensar descripción manteniendo información clave")
        
        low_density_keywords = [k for k, v in keyword_density.items() if v < 0.5]
        if low_density_keywords:
            recommendations.append(f"Aumentar frecuencia de: {', '.join(low_density_keywords)}")
        
        high_density_keywords = [k for k, v in keyword_density.items() if v > 5.0]
        if high_density_keywords:
            recommendations.append(f"Reducir densidad de: {', '.join(high_density_keywords)}")
        
        # Recomendaciones generales
        recommendations.extend([
            "Añadir estructura con encabezados H1, H2, H3",
            "Incluir imagen con alt text descriptivo",
            "Añadir enlaces internos relevantes",
            "Optimizar velocidad de carga de la página"
        ])
        
        return recommendations
    
    def _optimize_keyword_density(
        self, 
        content: str, 
        keywords: List[str], 
        target_density: float
    ) -> str:
        """Optimiza la densidad de keywords."""
        words = content.split()
        target_frequency = {}
        
        # Calcular frecuencia objetivo
        total_words = len(words)
        for keyword in keywords:
            target_freq = (target_density / 100) * total_words
            target_frequency[keyword] = max(1, int(target_freq))
        
        # Analizar frecuencia actual
        for keyword, target_freq in target_frequency.items():
            current_freq = content.lower().count(keyword.lower())
            
            if current_freq < target_freq:
                # Necesitamos añadir la keyword
                words_to_add = target_freq - current_freq
                # Insertar en posiciones estratégicas (inicio de párrafos, etc.)
                for i in range(min(words_to_add, 3)):  # Máximo 3 inserciones
                    if i < len(words):
                        words.insert(i * 10, keyword)  # Cada 10 palabras
        
        return " ".join(words)
    
    def _improve_paragraph_structure(self, content: str) -> str:
        """Mejora la estructura de párrafos."""
        # Dividir en párrafos
        paragraphs = content.split('\n\n')
        improved_paragraphs = []
        
        for para in paragraphs:
            para = para.strip()
            if not para:
                continue
            
            # Asegurar que los párrafos no sean muy largos
            words = para.split()
            if len(words) > 150:
                # Dividir párrafo largo
                mid_point = len(words) // 2
                sentence_endings = ['.', '!', '?', ';']
                
                # Buscar punto de división natural
                split_point = mid_point
                for i in range(mid_point - 10, mid_point + 10):
                    if i < len(words) and any(words[i].endswith(ending) for ending in sentence_endings):
                        split_point = i + 1
                        break
                
                para1 = " ".join(words[:split_point])
                para2 = " ".join(words[split_point:])
                
                improved_paragraphs.extend([para1, para2])
            else:
                improved_paragraphs.append(para)
        
        return "\n\n".join(improved_paragraphs)
    
    def _optimize_headings(self, content: str, keywords: List[str]) -> str:
        """Optimiza la estructura de encabezados."""
        lines = content.split('\n')
        optimized_lines = []
        
        for line in lines:
            line = line.strip()
            
            # Detectar posibles títulos (líneas cortas sin puntuación final)
            if (len(line) < 100 and 
                not line.endswith(('.', '!', '?', ';', ':')) and 
                len(line.split()) > 2 and 
                len(line.split()) < 15):
                
                # Convertir a título con H2 si no es el primero
                if optimized_lines and not optimized_lines[-1].startswith('#'):
                    optimized_lines.append(f"## {line}")
                    continue
            
            optimized_lines.append(line)
        
        return '\n'.join(optimized_lines)
    
    def generate_sitemap_urls(self, productos: List[Dict[str, Any]]) -> List[str]:
        """Genera URLs para sitemap basadas en productos."""
        urls = []
        
        for producto in productos:
            # Generar URL SEO-friendly
            nombre = producto.get('nombre', '')
            tipo = producto.get('tipo', '')
            
            # Crear slug
            slug = self._create_seo_slug(f"{nombre} {tipo}")
            url = f"/productos/{slug}"
            
            urls.append({
                "loc": url,
                "lastmod": datetime.now().isoformat(),
                "changefreq": "monthly",
                "priority": "0.8"
            })
        
        return urls
    
    def _create_seo_slug(self, text: str) -> str:
        """Crea un slug SEO-friendly."""
        # Convertir a minúsculas y reemplazar espacios con guiones
        slug = text.lower()
        slug = re.sub(r'[^a-z0-9\s-]', '', slug)
        slug = re.sub(r'\s+', '-', slug)
        slug = re.sub(r'-+', '-', slug)
        return slug.strip('-')
    
    def export_seo_report(
        self, 
        analysis: SEOAnalysis,
        meta_validation: MetaTagValidation,
        original_content: str,
        optimized_content: str
    ) -> Dict[str, Any]:
        """Exporta reporte completo de SEO."""
        return {
            "analysis": {
                "score": analysis.score,
                "title_length": analysis.title_length,
                "description_length": analysis.description_length,
                "keyword_density": analysis.keyword_density,
                "readability_score": analysis.readability_score,
                "issues": analysis.issues,
                "recommendations": analysis.recommendations,
                "improvements_applied": analysis.improvements_applied
            },
            "meta_validation": {
                "is_valid": meta_validation.is_valid,
                "errors": meta_validation.errors,
                "warnings": meta_validation.warnings,
                "recommendations": meta_validation.recommendations
            },
            "content_comparison": {
                "original_length": len(original_content),
                "optimized_length": len(optimized_content),
                "improvement": len(optimized_content) - len(original_content)
            },
            "seo_score": {
                "before": self._calculate_seo_score(
                    analysis.title_length,
                    analysis.description_length,
                    {},  # Sin keywords para versión original
                    self._calculate_readability(original_content)
                ),
                "after": analysis.score
            },
            "timestamp": datetime.now().isoformat()
        }
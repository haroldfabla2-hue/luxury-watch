"""
Normalizador de Materiales para el Agente 6 de Metadatos.

Clasifica, normaliza y enriquece información de materiales, acabados
y características técnicas de componentes de reloj para garantizar
consistencia en metadatos y SEO.
"""

import re
import logging
from typing import Dict, List, Optional, Set, Tuple, Any
from dataclasses import dataclass
from .types import (
    MaterialBase, 
    AcabadoSuperficie, 
    TipoComponente,
    EstiloVisual
)


@dataclass
class MaterialProperty:
    """Propiedad técnica de un material."""
    nombre: str
    valor: Any
    unidad: Optional[str] = None
    rango: Optional[Tuple[float, float]] = None
    descripcion: Optional[str] = None


@dataclass
class MaterialInfo:
    """Información completa de un material."""
    nombre_normalizado: str
    nombre_visual: str
    tipo: MaterialBase
    propiedades: List[MaterialProperty]
    acabados_compatibles: List[AcabadoSuperficie]
    estilos_compatibles: List[EstiloVisual]
    keywords_seo: List[str]
    synonyms: List[str]
    precio_relativo: int  # 1-10, donde 10 es el más caro
    exclusividad: int  # 1-10, donde 10 es más exclusivo
    mantenimiento: str  # "bajo", "medio", "alto"
    durabilidad: int  # 1-10
    resistencia_rayado: int  # 1-10
    peso_relativo: float  # Relativo al acero 316L
    color_natural: str
    propiedades_unicas: List[str]
    mercados_objetivo: List[str]  # ["lujo", "deportivo", "profesional"]


class MaterialNormalizer:
    """
    Normalizador de materiales y acabados para componentes de reloj.
    
    Proporciona:
    - Normalización de nombres de materiales
    - Clasificación automática de acabados
    - Enriquecimiento con propiedades técnicas
    - Generación de keywords SEO
    - Mapeo de sinónimos y variantes
    """
    
    def __init__(self):
        """Inicializa el normalizador con base de datos de materiales."""
        self.logger = logging.getLogger(__name__)
        
        # Base de datos de materiales predefinidos
        self.materiales_db = self._build_materials_database()
        
        # Mapeos de sinónimos
        self.synonyms_map = self._build_synonyms_map()
        
        # Patrones regex para detección
        self.material_patterns = self._build_material_patterns()
        self.finish_patterns = self._build_finish_patterns()
        
        # Keywords base por categoría
        self.base_keywords = self._build_base_keywords()
    
    def _build_materials_database(self) -> Dict[str, MaterialInfo]:
        """Construye la base de datos de materiales."""
        return {
            "acero_316l": MaterialInfo(
                nombre_normalizado="Acero Inoxidable 316L",
                nombre_visual="Acero",
                tipo=MaterialBase.ACERO_316L,
                propiedades=[
                    MaterialProperty("composicion", "Fe-Cr-Ni-Mo", descripcion="Hierro, cromo, níquel, molibdeno"),
                    MaterialProperty("dureza", 170, "HRC", (150, 190), "Dureza Rockwell C"),
                    MaterialProperty("resistencia_corrosion", 9, "rating", (8, 10), "Excelente resistencia")
                ],
                acabados_compatibles=[AcabadoSuperficie.BRUSHED, AcabadoSuperficie.POLISHED, 
                                    AcabadoSuperficie.MIRROR, AcabadoSuperficie.SANDBLASTED],
                estilos_compatibles=[EstiloVisual.CLASICO, EstiloVisual.MODERNO, 
                                  EstiloVisual.DEPORTIVO, EstiloVisual.ELEGANTE],
                keywords_seo=["acero inoxidable", "steel 316L", "resistente corrosion", 
                            "acero quirúrgico", "material premium"],
                synonyms=["steel", "acero", "316L", "stainless steel"],
                precio_relativo=3,
                exclusividad=2,
                mantenimiento="medio",
                durabilidad=9,
                resistencia_rayado=7,
                peso_relativo=1.0,
                color_natural="plateado",
                propiedades_unicas=["biocompatible", "hipoalergénico", "reciclable"],
                mercados_objetivo=["profesional", "deportivo", "clásico"]
            ),
            
            "acero_904l": MaterialInfo(
                nombre_normalizado="Acero Inoxidable 904L",
                nombre_visual="Acero Premium",
                tipo=MaterialBase.ACERO_904L,
                propiedades=[
                    MaterialProperty("composicion", "Fe-Cr-Ni-Cu", descripcion="Hierro, cromo, níquel, cobre"),
                    MaterialProperty("dureza", 185, "HRC", (170, 200), "Dureza Rockwell C superior"),
                    MaterialProperty("resistencia_corrosion", 10, "rating", (9, 10), "Máxima resistencia")
                ],
                acabados_compatibles=[AcabadoSuperficie.BRUSHED, AcabadoSuperficie.POLISHED, 
                                    AcabadoSuperficie.MIRROR],
                estilos_compatibles=[EstiloVisual.LUXURY, EstiloVisual.ELEGANTE, 
                                  EstiloVisual.MODERNO],
                keywords_seo=["acero 904L", "steel 904L", "acero premium", "rolex steel", 
                            "luxury steel"],
                synonyms=["904L", "super steel", "premium steel", "rolex steel"],
                precio_relativo=6,
                exclusividad=5,
                mantenimiento="bajo",
                durabilidad=10,
                resistencia_rayado=8,
                peso_relativo=1.0,
                color_natural="plateado intenso",
                propiedades_unicas=["mayor pureza", "brillo superior", "resistencia extrema"],
                mercados_objetivo=["lujo", "premium", "coleccionista"]
            ),
            
            "oro_18k": MaterialInfo(
                nombre_normalizado="Oro 18 Quilates",
                nombre_visual="Oro",
                tipo=MaterialBase.ORO_18K,
                propiedades=[
                    MaterialProperty("pureza", 75, "%", (74, 76), "18 quilates = 75% oro puro"),
                    MaterialProperty("dureza", 125, "HRC", (110, 140), "Dureza adecuada para joyería"),
                    MaterialProperty("densidad", 15.5, "g/cm³", (15.0, 16.0))
                ],
                acabados_compatibles=[AcabadoSuperficie.POLISHED, AcabadoSuperficie.MIRROR, 
                                    AcabadoSuperficie.GUILLOCHE],
                estilos_compatibles=[EstiloVisual.LUXURY, EstiloVisual.ELEGANTE, 
                                  EstiloVisual.CLASSIC, EstiloVisual.VINTAGE],
                keywords_seo=["oro 18k", "gold 18k", "oro puro", "jewelry gold", "luxury gold"],
                synonyms=["18k", "gold", "oro", "750", "gold 750"],
                precio_relativo=10,
                exclusividad=10,
                mantenimiento="medio",
                durabilidad=8,
                resistencia_rayado=3,
                peso_relativo=1.7,
                color_natural="dorado",
                propiedades_unicas=["lujo supremo", "valor inversión", "tradición relojera"],
                mercados_objetivo=["lujo", "coleccionista", "tradicional"]
            ),
            
            "titanio": MaterialInfo(
                nombre_normalizado="Titanio Grado 5",
                nombre_visual="Titanio",
                tipo=MaterialBase.TITANIO,
                propiedades=[
                    MaterialProperty("composicion", "Ti-Al-V", descripcion="Titanio, aluminio, vanadio"),
                    MaterialProperty("dureza", 350, "HV", (320, 380), "Dureza Vickers"),
                    MaterialProperty("densidad", 4.4, "g/cm³", (4.3, 4.5), "Muy ligero")
                ],
                acabados_compatibles=[AcabadoSuperficie.BRUSHED, AcabadoSuperficie.POLISHED, 
                                    AcabadoSuperficie.SANDBLASTED],
                estilos_compatibles=[EstiloVisual.MODERNO, EstiloVisual.DEPORTIVO, 
                                  EstiloVisual.TECHNICAL, EstiloVisual.AVANT_GARDE],
                keywords_seo=["titanio", "titanium", "titanio grado 5", "lightweight", 
                            "aerospace titanium"],
                synonyms=["Ti", "grade 5 titanium", "Ti-6Al-4V"],
                precio_relativo=7,
                exclusividad=6,
                mantenimiento="bajo",
                durabilidad=9,
                resistencia_rayado=8,
                peso_relativo=0.45,
                color_natural="gris metálico",
                propiedades_unicas=["ultraligero", "biocompatible", "resistente corrosión"],
                mercados_objetivo=["deportivo", "profesional", "tech"]
            ),
            
            "ceramica": MaterialInfo(
                nombre_normalizado="Cerámica Avanzada",
                nombre_visual="Cerámica",
                tipo=MaterialBase.CERAMICA,
                propiedades=[
                    MaterialProperty("dureza", 1800, "HV", (1700, 1900), "Dureza Vickers extrema"),
                    MaterialProperty("resistencia_rayado", 10, "rating", (9, 10), "Inrayable"),
                    MaterialProperty("peso", 3.9, "g/cm³", (3.8, 4.0), "Densidad muy baja")
                ],
                acabados_compatibles=[AcabadoSuperficie.POLISHED, AcabadoSuperficie.MIRROR],
                estilos_compatibles=[EstiloVisual.MODERNO, EstiloVisual.AVANT_GARDE, 
                                  EstiloVisual.MINIMALISTA],
                keywords_seo=["ceramica", "ceramic", "ceramica avanzada", "scratch resistant", 
                            "high tech ceramic"],
                synonyms=["ceramic", "advanced ceramic", "high-tech ceramic"],
                precio_relativo=8,
                exclusividad=7,
                mantenimiento="muy bajo",
                durabilidad=10,
                resistencia_rayado=10,
                peso_relativo=0.35,
                color_natural="negro/blanco",
                propiedades_unicas=["inrayable", "anti-alérgico", "color permanente"],
                mercados_objetivo=["tech", "moderno", "avant-garde"]
            ),
            
            "carbono": MaterialInfo(
                nombre_normalizado="Fibra de Carbono",
                nombre_visual="Carbono",
                tipo=MaterialBase.CARBONO,
                propiedades=[
                    MaterialProperty("resistencia_tension", 3500, "MPa", (3000, 4000)),
                    MaterialProperty("peso", 1.6, "g/cm³", (1.5, 1.7), "Muy ligero y resistente"),
                    MaterialProperty("modulo_elasticidad", 230, "GPa")
                ],
                acabados_compatibles=[AcabadoSuperficie.BRUSHED, AcabadoSuperficie.POLISHED],
                estilos_compatibles=[EstiloVisual.DEPORTIVO, EstiloVisual.TECHNICAL, 
                                  EstiloVisual.AVANT_GARDE],
                keywords_seo=["carbono", "carbon fiber", "fibra carbono", "lightweight carbon", 
                            "racing carbon"],
                synonyms=["carbon fiber", "CF", "carbon fibre"],
                precio_relativo=9,
                exclusividad=8,
                mantenimiento="bajo",
                durabilidad=9,
                resistencia_rayado=7,
                peso_relativo=0.25,
                color_natural="negro trama",
                propiedades_unicas=["ultra ligero", "máxima resistencia", "patrón único"],
                mercados_objetivo=["racing", "tech", "deportivo"]
            ),
            
            "cuero": MaterialInfo(
                nombre_normalizado="Cuero Natural",
                nombre_visual="Cuero",
                tipo=MaterialBase.CUERO,
                propiedades=[
                    MaterialProperty("espesor", 3.5, "mm", (3.0, 4.0)),
                    MaterialProperty("flexibilidad", 8, "rating", (7, 10)),
                    MaterialProperty("durabilidad", 7, "rating", (6, 8), "Con mantenimiento adecuado")
                ],
                acabados_compatibles=[AcabadoSuperficie.BRUSHED],
                estilos_compatibles=[EstiloVisual.CLASSIC, EstiloVisual.ELEGANTE, 
                                  EstiloVisual.VINTAGE, EstiloVisual.LUXURY],
                keywords_seo=["cuero", "leather", "cuero natural", "italian leather", 
                            "premium leather"],
                synonyms=["leather", "natural leather", "genuine leather"],
                precio_relativo=4,
                exclusividad=4,
                mantenimiento="alto",
                durabilidad=6,
                resistencia_rayado=4,
                peso_relativo=0.15,
                color_natural="marrón",
                propiedades_unicas=["patina única", "comfort superior", "tradicional"],
                mercados_objetivo=["clásico", "elegante", "tradicional"]
            )
        }
    
    def _build_synonyms_map(self) -> Dict[str, str]:
        """Construye mapeo de sinónimos a nombres normalizados."""
        synonyms = {}
        for key, material in self.materiales_db.items():
            for synonym in material.synonyms:
                synonyms[synonym.lower()] = key
        
        # Sinónimos adicionales comunes
        additional_synonyms = {
            # Acero
            "steel": "acero_316l",
            "stainless": "acero_316l", 
            "acero": "acero_316l",
            "surgical steel": "acero_316l",
            "acero quirúrgico": "acero_316l",
            
            # Oro
            "gold": "oro_18k",
            "oro": "oro_18k",
            "18k": "oro_18k",
            "750": "oro_18k",
            "pure gold": "oro_18k",
            "oro puro": "oro_18k",
            
            # Titanio
            "ti": "titanio",
            "grade 5": "titanio",
            "ti-6al-4v": "titanio",
            
            # Cerámica
            "ceramic": "ceramica",
            "high-tech ceramic": "ceramica",
            "advanced ceramic": "ceramica",
            
            # Carbono
            "carbon fiber": "carbono",
            "cf": "carbono",
            "fibra de carbono": "carbono",
            
            # Cuero
            "leather": "cuero",
            "natural leather": "cuero",
            "cuero natural": "cuero"
        }
        
        synonyms.update(additional_synonyms)
        return synonyms
    
    def _build_material_patterns(self) -> List[Tuple[str, str]]:
        """Construye patrones regex para detectar materiales."""
        return [
            (r"\b(acero\s+316L?|steel\s+316L?|acero\s+inoxidable\s+316L?)\b", "acero_316l"),
            (r"\b(acero\s+904L?|steel\s+904L?|904L)\b", "acero_904l"),
            (r"\b(oro\s+18k|oro\s+18\s+quilates|gold\s+18k|18K|750)\b", "oro_18k"),
            (r"\b(titanio|ti(?:\s*-?\s*6al-?\s*4v)?|grade\s+5\s+titanium)\b", "titanio"),
            (r"\b(cer[áa]mica(?:\s+avanzada)?|ceramic|high[-\s]?tech\s+ceramic)\b", "ceramica"),
            (r"\b(carbono|fibra\s+de\s+carbono|carbon\s+fiber|cf)\b", "carbono"),
            (r"\b(cuero|leather|cuero\s+natural|italian\s+leather)\b", "cuero")
        ]
    
    def _build_finish_patterns(self) -> List[Tuple[str, AcabadoSuperficie]]:
        """Construye patrones regex para detectar acabados."""
        return [
            (r"\b(cepillad[oa]|brushed|satinado)\b", AcabadoSuperficie.BRUSHED),
            (r"\b(pulid[oa]|polished|lustrado)\b", AcabadoSuperficie.POLISHED),
            (r"\b(espejo|mirror|glossy|brillante)\b", AcabadoSuperficie.MIRROR),
            (r"\b(granallad[oa]|sandblasted|chorro\s+arena)\b", AcabadoSuperficie.SANDBLASTED),
            (r"\b(guilloch[ée]|guilloche|motivo\s+decorativo)\b", AcabadoSuperficie.GUILLOCHE),
            (r"\b(perlage|perla|swiss\s+perlage)\b", AcabadoSuperficie.PERLAGE),
            (r"\b(rayos\s+sol|sunburst|rayos\s+radiales)\b", AcabadoSuperficie.SUNBURST),
            (r"\b(grabado\s+l[aá]ser|laser\s+etched|grabado\s+mec[aá]nico)\b", AcabadoSuperficie.LASER_ETCHED)
        ]
    
    def _build_base_keywords(self) -> Dict[str, List[str]]:
        """Construye keywords base por categoría."""
        return {
            "materiales_premium": [
                "material premium", "luxury materials", "high-end", "exclusive",
                "premium quality", "superior materials", "luxury grade"
            ],
            "tecnicos": [
                "precision", "technical excellence", "engineering", "innovation",
                "cutting-edge", "advanced technology", "superior performance"
            ],
            "durabilidad": [
                "durable", "long-lasting", "resistant", "reliable", "robust",
                "time-tested", "proven quality", "enduring"
            ],
            "exclusividad": [
                "exclusive", "limited edition", "unique", "rare", "collectible",
                "signature", "heritage", "prestigious"
            ],
            "comfort": [
                "comfortable", "ergonomic", "lightweight", "hypoallergenic",
                "skin-friendly", "breathable", "flexible"
            ]
        }
    
    def normalize_material(self, material_input: str) -> Optional[MaterialInfo]:
        """
        Normaliza un material a su forma estándar.
        
        Args:
            material_input: Material en texto libre
            
        Returns:
            MaterialInfo normalizado o None si no se encuentra
        """
        if not material_input:
            return None
            
        material_lower = material_input.lower().strip()
        
        # Buscar por sinónimos exactos
        if material_lower in self.synonyms_map:
            normalized_key = self.synonyms_map[material_lower]
            return self.materiales_db.get(normalized_key)
        
        # Buscar por patrones regex
        for pattern, material_key in self.material_patterns:
            if re.search(pattern, material_lower, re.IGNORECASE):
                return self.materiales_db.get(material_key)
        
        # Búsqueda por similitud (simple)
        for key, material_info in self.materiales_db.items():
            if material_input.lower() in [syn.lower() for syn in material_info.synonyms]:
                return material_info
        
        self.logger.warning(f"Material no reconocido: {material_input}")
        return None
    
    def detect_finish(self, finish_input: str) -> Optional[AcabadoSuperficie]:
        """
        Detecta y normaliza un acabado de superficie.
        
        Args:
            finish_input: Acabado en texto libre
            
        Returns:
            AcabadoSuperficie normalizado o None
        """
        if not finish_input:
            return None
            
        finish_lower = finish_input.lower().strip()
        
        for pattern, finish_type in self.finish_patterns:
            if re.search(pattern, finish_lower, re.IGNORECASE):
                return finish_type
        
        self.logger.warning(f"Acabado no reconocido: {finish_input}")
        return None
    
    def generate_seo_keywords(
        self, 
        material: MaterialInfo, 
        componente: TipoComponente,
        style: Optional[EstiloVisual] = None,
        extra_terms: Optional[List[str]] = None
    ) -> List[str]:
        """
        Genera keywords SEO específicas para un material y componente.
        
        Args:
            material: Información del material
            componente: Tipo de componente
            style: Estilo visual opcional
            extra_terms: Términos adicionales
            
        Returns:
            Lista de keywords SEO
        """
        keywords = set(material.keywords_seo)
        
        # Añadir términos específicos del componente
        componente_keywords = {
            TipoComponente.CAJA: ["watch case", "caja reloj", "case", "housing"],
            TipoComponente.BISEL: ["bezel", "bisel", "bezel ring", "lunette"],
            TipoComponente.CORREA: ["strap", "correa", "watch strap", "band"],
            TipoComponente.ESFERA: ["dial", "esfera", "face", "watch face"],
            TipoComponente.CORONA: ["crown", "corona", "winding crown"],
            TipoComponente.CRISTAL: ["crystal", "cristal", "watch crystal", "glass"]
        }
        
        if componente in componente_keywords:
            keywords.update(componente_keywords[componente])
        
        # Añadir keywords por mercado objetivo
        for market in material.mercados_objetivo:
            market_keywords = {
                "lujo": ["luxury", "lujo", "premium", "exclusive"],
                "deportivo": ["sport", "deportivo", "athletic", "active"],
                "profesional": ["professional", "profesional", "business", "corporate"],
                "tech": ["technology", "tech", "innovation", "digital"],
                "clásico": ["classic", "clásico", "traditional", "timeless"],
                "moderno": ["modern", "moderno", "contemporary", "contemporary"],
                "racing": ["racing", "motorsport", "performance", "speed"]
            }
            
            if market in market_keywords:
                keywords.update(market_keywords[market])
        
        # Añadir términos adicionales
        if extra_terms:
            keywords.update(extra_terms)
        
        # Añadir keywords técnicos del material
        for prop in material.propiedades:
            if prop.descripcion:
                # Extraer palabras clave de la descripción
                tech_words = re.findall(r'\b\w{4,}\b', prop.descripcion.lower())
                keywords.update(tech_words)
        
        return list(keywords)
    
    def enrich_material_properties(
        self, 
        material: MaterialInfo,
        component_data: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Enriquece las propiedades del material con datos adicionales.
        
        Args:
            material: Información base del material
            component_data: Datos adicionales del componente
            
        Returns:
            Propiedades enriquecidas
        """
        enriched = {
            "material_base": material.nombre_normalizado,
            "tipo_material": material.tipo.value,
            "acabados_compatibles": [a.value for a in material.acabados_compatibles],
            "estilos_compatibles": [s.value for s in material.estilos_compatibles],
            "propiedades_tecnicas": {},
            "caracteristicas_premium": material.propiedades_unicas,
            "mantenimiento_requerido": material.mantenimiento,
            "durabilidad_rating": material.durabilidad,
            "resistencia_rayado": material.resistencia_rayado,
            "peso_relativo": material.peso_relativo,
            "color_natural": material.color_natural,
            "precio_segment": self._get_price_segment(material.precio_relativo),
            "exclusividad_level": material.exclusividad,
            "keywords_generadas": material.keywords_seo,
            "mercados_objetivo": material.mercados_objetivo
        }
        
        # Convertir propiedades técnicas
        for prop in material.propiedades:
            prop_key = prop.nombre.replace(" ", "_").lower()
            if prop.valor is not None:
                if prop.unidad:
                    enriched["propiedades_tecnicas"][prop_key] = {
                        "valor": prop.valor,
                        "unidad": prop.unidad,
                        "descripcion": prop.descripcion
                    }
                    if prop.rango:
                        enriched["propiedades_tecnicas"][prop_key]["rango"] = prop.rango
                else:
                    enriched["propiedades_tecnicas"][prop_key] = {
                        "valor": prop.valor,
                        "descripcion": prop.descripcion
                    }
        
        # Añadir datos del componente si están disponibles
        if component_data:
            enriched.update(component_data)
        
        return enriched
    
    def _get_price_segment(self, precio_relativo: int) -> str:
        """Determina el segmento de precio basado en el valor relativo."""
        if precio_relativo <= 3:
            return "económico"
        elif precio_relativo <= 6:
            return "medio"
        elif precio_relativo <= 8:
            return "premium"
        else:
            return "lujo"
    
    def get_compatible_finishes(self, material: MaterialInfo) -> List[AcabadoSuperficie]:
        """Obtiene acabados compatibles con un material."""
        return material.acabados_compatibles
    
    def get_compatible_styles(self, material: MaterialInfo) -> List[EstiloVisual]:
        """Obtiene estilos compatibles con un material."""
        return material.estilos_compatibles
    
    def generate_material_description(
        self, 
        material: MaterialInfo, 
        audience: str = "comercial"
    ) -> str:
        """
        Genera descripción de material adaptada a audiencia.
        
        Args:
            material: Información del material
            audience: Audiencia target
            
        Returns:
            Descripción generada
        """
        descriptions = {
            "tecnica": f"""
El {material.nombre_normalizado} destaca por sus excepcionales propiedades técnicas: 
{', '.join([prop.descripcion for prop in material.propiedades[:2] if prop.descripcion])}. 
Su durabilidad de {material.durabilidad}/10 y resistencia al rayado de {material.resistencia_rayado}/10 
lo posicionan como una elección superior para aplicaciones exigentes.
            """.strip(),
            
            "comercial": f"""
Crafted in {material.nombre_normalizado}, este componente combina {material.color_natural} 
con excepcionales características de {', '.join(material.mercados_objetivo[:2])}. 
Su mantenimiento {material.mantenimiento} y durabilidad superior lo hacen ideal para el uso diario.
            """.strip(),
            
            "lujo": f"""
Empleando exclusivamente {material.nombre_normalizado}, este componente representa la 
cúspide de la artesanía relojera. Con una exclusividad de {material.exclusividad}/10, 
{', '.join(material.propiedades_unicas[:2])} lo distinguen en el mercado del lujo.
            """.strip()
        }
        
        return descriptions.get(audience, descriptions["comercial"])
    
    def analyze_material_combinations(
        self, 
        materials: List[str]
    ) -> Dict[str, Any]:
        """
        Analiza combinaciones de materiales para generar insights.
        
        Args:
            materials: Lista de materiales a analizar
            
        Returns:
            Análisis de la combinación
        """
        normalized_materials = []
        for material_str in materials:
            material = self.normalize_material(material_str)
            if material:
                normalized_materials.append(material)
        
        if not normalized_materials:
            return {"error": "No se pudieron normalizar los materiales"}
        
        # Análisis de compatibilidad
        compatible_finishes = set()
        compatible_styles = set()
        total_price = 0
        max_exclusivity = 0
        
        for material in normalized_materials:
            compatible_finishes.update(material.acabados_compatibles)
            compatible_styles.update(material.estilos_compatibles)
            total_price += material.precio_relativo
            max_exclusivity = max(max_exclusivity, material.exclusividad)
        
        avg_price = total_price / len(normalized_materials)
        price_segment = self._get_price_segment(int(avg_price))
        
        return {
            "materiales_normalizados": [m.nombre_normalizado for m in normalized_materials],
            "acabados_compatibles": [f.value for f in compatible_finishes],
            "estilos_compatibles": [s.value for s in compatible_styles],
            "precio_promedio": avg_price,
            "segmento_precio": price_segment,
            "exclusividad_maxima": max_exclusivity,
            "combinacion_balanceada": len(set(m.tipo for m in normalized_materials)) > 1,
            "recomendaciones": self._generate_combination_recommendations(normalized_materials)
        }
    
    def _generate_combination_recommendations(
        self, 
        materials: List[MaterialInfo]
    ) -> List[str]:
        """Genera recomendaciones para la combinación de materiales."""
        recommendations = []
        
        # Análisis de contraste
        pesos = [m.peso_relativo for m in materials]
        if max(pesos) / min(pesos) > 2:
            recommendations.append("Excelente contraste de peso para efecto visual")
        
        # Análisis de durabilidad
        durabilidades = [m.durabilidad for m in materials]
        if min(durabilidades) >= 7:
            recommendations.append("Combinación altamente duradera")
        
        # Análisis de mantenimiento
        mantenimientos = [m.mantenimiento for m in materials]
        if len(set(mantenimientos)) == 1:
            recommendations.append("Mantenimiento uniforme en toda la combinación")
        
        return recommendations
    
    def export_material_taxonomy(self) -> Dict[str, Any]:
        """Exporta la taxonomía completa de materiales."""
        taxonomy = {
            "materiales": {},
            "acabados": {},
            "patrones_detectados": {
                "materiales": self.material_patterns,
                "acabados": self.finish_patterns
            },
            "sinonimos": self.synonyms_map
        }
        
        # Exportar materiales
        for key, material in self.materiales_db.items():
            taxonomy["materiales"][key] = {
                "nombre": material.nombre_normalizado,
                "tipo": material.tipo.value,
                "acabados": [a.value for a in material.acabados_compatibles],
                "estilos": [s.value for s in material.estilos_compatibles],
                "precio_relativo": material.precio_relativo,
                "exclusividad": material.exclusividad
            }
        
        # Exportar acabados
        for finish in AcabadoSuperficie:
            taxonomy["acabados"][finish.value] = {
                "nombre": finish.name.replace("_", " ").title(),
                "compatible_con": []
            }
        
        return taxonomy
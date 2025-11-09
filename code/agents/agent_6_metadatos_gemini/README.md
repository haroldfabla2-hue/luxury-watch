# Agente 6: Generador de Metadatos y SEO con Gemini 2.0

## 🎯 Descripción General

El **Agente 6** es un sistema avanzado de generación de metadatos y contenido SEO especializado en componentes de relojes de lujo. Utiliza **Gemini 2.0** via OpenRouter para generar contenido inteligente, optimizado para motores de búsqueda y adaptado a diferentes audiencias.

### ✨ Características Principales

- 🧠 **Inteligencia Artificial**: Integración completa con Gemini 2.0 Experimental
- 📝 **Generación de Contenido**: Descripciones atractivas en lenguaje natural
- 🔍 **Optimización SEO**: Metadatos estructurados y keywords optimizadas  
- 👥 **Multi-Audiencia**: Contenido específico para diferentes segmentos
- 🔗 **JSON-LD**: Metadatos estructurados según Schema.org
- 📱 **Redes Sociales**: Contenido optimizado para plataformas sociales
- ⚡ **Procesamiento Lote**: Capacidad de procesar múltiples componentes
- 🎨 **Templates**: Sistema flexible de plantillas de contenido

## 🏗️ Arquitectura del Sistema

```
┌─────────────────────────────────────────────────────────────┐
│                 Agente 6: Metadatos y SEO                   │
├─────────────────────────────────────────────────────────────┤
│  🔄 Orquestador Principal (Agent.py)                        │
├─────────────────────────────────────────────────────────────┤
│  🧠 Gemini Client     📊 Metadata Generator    🎨 Templates │
│     (gemini_client.py)    (metadata_generator.py)   (content)│
├─────────────────────────────────────────────────────────────┤
│  🧪 Material Normalizer    🎯 SEO Optimizer    📋 Types     │
│     (material_normalizer)     (seo_optimizer)     (types)   │
└─────────────────────────────────────────────────────────────┘
```

## 📦 Instalación y Configuración

### Prerrequisitos

- Python 3.8+
- API Key de Gemini via OpenRouter
- Conexión a internet

### Instalación Rápida

```bash
# Clonar o copiar el agente
cp -r agent_6_metadatos_gemini /tu/proyecto/

# Instalar dependencias
cd agent_6_metadatos_gemini
pip install -r requirements.txt
```

### Configuración de API

```python
from config import create_production_config
import os

# Configurar API key
os.environ["GEMINI_API_KEY"] = "tu-api-key-openrouter"

# Obtener configuración de producción
config = create_production_config()
```

## 🚀 Uso Rápido

### Ejemplo Básico

```python
import asyncio
from agent import AgenteMetadatosGemini
from config import create_production_config
from types import ComponenteReloj, TipoComponente, MaterialBase

async def main():
    # Configurar agente
    config = create_production_config()
    agente = AgenteMetadatosGemini(config)
    
    # Crear componente
    componente = ComponenteReloj(
        id="bisel_001",
        tipo=TipoComponente.BISEL,
        nombre="Bisel Cerámica Negra",
        material_base=MaterialBase.CERAMICA,
        color_principal="Negro"
    )
    
    # Generar metadatos
    metadatos = await agente.procesar_componente_completo(componente)
    
    print(f"SEO Title: {metadatos.seo_metadata.titulo_seo}")
    print(f"Descripciones: {len(metadatos.descripciones)}")

asyncio.run(main())
```

### Ejemplo SEO Específico

```python
# SEO optimizado con keywords específicas
seo_result = await agente.generar_seo_optimizado(
    componente=componente,
    keywords_objetivo=["reloj lujo", "ceramica", "swiss made"],
    audiencia=AudienciaTarget.LUJO
)

print(f"Título optimizado: {seo_result['titulo_optimizado']}")
print(f"SEO Score: {seo_result['analisis_seo']['score']:.1f}/100")
```

## 📊 Funcionalidades Detalladas

### 1. Generación de Metadatos Completos

```python
metadatos = await agente.procesar_componente_completo(
    componente=componente,
    audiencias=[
        AudienciaTarget.COMERCIAL,
        AudienciaTarget.LUJO, 
        AudienciaTarget.TECNICA
    ]
)

# Acceso a resultados
print(metadatos.seo_metadata.titulo_seo)
print(metadatos.seo_metadata.descripcion_seo)
print(metadatos.json_ld)  # JSON-LD estructurado
```

### 2. Contenido para Múltiples Audiencias

```python
descripciones = await agente.generar_descripciones_audiencia(
    componente=componente,
    audiencias=[
        AudienciaTarget.TECNICA,
        AudienciaTarget.COMERCIAL,
        AudienciaTarget.LUJO,
        AudienciaTarget.JOVEN
    ]
)

# Acceso por audiencia
print(descripciones["comercial"]["contenido_completo"])
print(descripciones["lujo"]["call_to_action"])
```

### 3. Contenido para Redes Sociales

```python
social_content = await agente.generar_contenido_redes_sociales(
    componente=componente,
    plataformas=["Instagram", "Twitter", "LinkedIn"]
)

# Contenido específico por plataforma
instagram_caption = social_content["Instagram"]["caption"]
twitter_thread = social_content["Twitter"]["thread"]
linkedin_post = social_content["LinkedIn"]["post"]
```

### 4. Procesamiento en Lote

```python
# Procesar múltiples componentes
componentes = [comp1, comp2, comp3, comp4, comp5]

resultados = await agente.procesar_lote_componentes(
    componentes=componentes,
    max_concurrencia=3
)

print(f"Procesados: {len(resultados)}/{len(componentes)}")
```

### 5. JSON-LD Estructurado

```python
json_ld = await agente.generar_json_ld_completo(
    componente=componente,
    incluir_ofertas=True,
    incluir_reviews=True
)

# JSON-LD listo para Schema.org
print(json.dumps(json_ld, indent=2))
```

## 🎨 Configuración Avanzada

### Configuraciones Predefinidas

```python
from config import (
    create_development_config,
    create_production_config, 
    create_testing_config,
    create_performance_config
)

# Para desarrollo
config = create_development_config()

# Para producción
config = create_production_config()

# Para testing
config = create_testing_config()

# Para máximo rendimiento
config = create_performance_config()
```

### Configuración Personalizada

```python
from config import ConfiguracionAgente
from types import ConfiguracionAgente

config = ConfiguracionAgente(
    gemini_api_key="tu-api-key",
    modelo_default="gemini-pro-exp",
    temperatura=0.7,
    max_tokens=2048,
    target_keywords_density=2.5,
    min_seo_score=70.0,
    enable_cache=True,
    cache_ttl_hours=24,
    requests_per_minute=60,
    log_level="INFO"
)
```

### Configuraciones por Audiencia

```python
from config import get_config_for_audience
from types import AudienciaTarget

# Configuración específica para lujo
config_lujo = get_config_for_audience(AudienciaTarget.LUJO)

# Configuración específica para contenido técnico
config_tecnico = get_config_for_audience(AudienciaTarget.TECNICA)
```

## 📋 Tipos de Componentes Soportados

```python
from types import TipoComponente, MaterialBase, AcabadoSuperficie, EstiloVisual

# Tipos de componentes
TIPOS_COMPONENTES = [
    TipoComponente.CAJA,           # Caja del reloj
    TipoComponente.BISEL,          # Bisel
    TipoComponente.ESFERA,         # Esfera/Dial
    TipoComponente.CORREA,         # Correa
    TipoComponente.CORONA,         # Corona
    TipoComponente.CRISTAL,        # Cristal
    TipoComponente.MANECILLAS,     # Manecillas
    TipoComponente.INDICES,        # Índices
    TipoComponente.MECHANISM,      # Mecanismo
    TipoComponente.PLACA_BASE,     # Placa base
    TipoComponente.RUBIES,         # Rubíes
    TipoComponente.RESORTE,        # Resorte
    TipoComponente.ENGRANAJES      # Engranajes
]

# Materiales soportados
MATERIALES = [
    MaterialBase.ACERO_316L,       # Acero inoxidable 316L
    MaterialBase.ACERO_904L,       # Acero premium 904L
    MaterialBase.ORO_18K,          # Oro 18 quilates
    MaterialBase.ORO_ROJO,         # Oro rojo
    MaterialBase.ORO_BLANCO,       # Oro blanco
    MaterialBase.PLATINO,          # Platino
    MaterialBase.TITANIO,          # Titanio
    MaterialBase.CERAMICA,         # Cerámica avanzada
    MaterialBase.CARBONO,          # Fibra de carbono
    MaterialBase.CUERO,            # Cuero natural
    MaterialBase.CAUCHO,           # Caucho
    MaterialBase.ACERO_DLC,        # Acero DLC
    MaterialBase.PVD,              # PVD
    MaterialBase.ROSE_GOLD         # Rose gold
]

# Acabados de superficie
ACABADOS = [
    AcabadoSuperficie.BRUSHED,        # Cepillado
    AcabadoSuperficie.POLISHED,       # Pulido
    AcabadoSuperficie.MIRROR,         # Espejo
    AcabadoSuperficie.SANDBLASTED,    # Granallado
    AcabadoSuperficie.GUILLOCHE,      # Guilloché
    AcabadoSuperficie.PERLAGE,        # Perlage
    AcabadoSuperficie.SUNBURST,       # Rayos de sol
    AcabadoSuperficie.LASER_ETCHED    # Grabado láser
]

# Estilos visuales
ESTILOS = [
    EstiloVisual.CLASICO,         # Clásico
    EstiloVisual.MODERNO,         # Moderno
    EstiloVisual.VINTAGE,         # Vintage
    EstiloVisual.DEPORTIVO,       # Deportivo
    EstiloVisual.ELEGANTE,        # Elegante
    EstiloVisual.AVANT_GARDE,     # Avant-garde
    EstiloVisual.MINIMALISTA,     # Minimalista
    EstiloVisual.LUXURY,          # Lujo
    EstiloVisual.TECHNICAL        # Técnico
]
```

## 👥 Audiencias Soportadas

```python
from types import AudienciaTarget

# Audiencias disponibles
AUDIENCIAS = {
    AudienciaTarget.TECNICA: {
        "descripcion": "Coleccionistas y técnicos",
        "enfoque": "Especificaciones técnicas y precisión",
        "tono": "Técnico y detallado"
    },
    AudienciaTarget.COMERCIAL: {
        "descripcion": "Compradores generales",
        "enfoque": "Beneficios y valor comercial",
        "tono": "Persuasivo y accesible"
    },
    AudienciaTarget.LUJO: {
        "descripcion": "Mercado premium",
        "enfoque": "Exclusividad y herencia",
        "tono": "Sofisticado y elegante"
    },
    AudienciaTarget.JOVEN: {
        "descripcion": "Millennials/Gen Z",
        "enfoque": "Tendencia y estilo moderno",
        "tono": "Dinámico y fresco"
    },
    AudienciaTarget.PROFESIONAL: {
        "descripcion": "Ejecutivos",
        "enfoque": "Profesionalismo y elegancia",
        "tono": "Soberbio y refinado"
    },
    AudienciaTarget.ENTHUSIAST: {
        "descripcion": "Aficionados",
        "enfoque": "Pasión y conocimiento profundo",
        "tono": "Entusiasta e informativo"
    }
}
```

## 🔧 API Reference

### Clase Principal: AgenteMetadatosGemini

#### Métodos Principales

```python
class AgenteMetadatosGemini:
    def __init__(self, config: ConfiguracionAgente)
    
    async def procesar_componente_completo(
        self, 
        componente: ComponenteReloj,
        audiencias: List[AudienciaTarget] = None,
        forzar_regeneracion: bool = False
    ) -> MetadatosGenerados
    
    async def procesar_lote_componentes(
        self, 
        componentes: List[ComponenteReloj],
        audiencias: List[AudienciaTarget] = None,
        max_concurrencia: int = 5
    ) -> Dict[str, MetadatosGenerados]
    
    async def generar_seo_optimizado(
        self, 
        componente: ComponenteReloj,
        keywords_objetivo: List[str] = None,
        audiencia: AudienciaTarget = AudienciaTarget.COMERCIAL
    ) -> Dict[str, Any]
    
    async def generar_descripciones_audiencia(
        self, 
        componente: ComponenteReloj,
        audiencias: List[AudienciaTarget] = None
    ) -> Dict[str, Dict[str, Any]]
    
    async def generar_contenido_redes_sociales(
        self, 
        componente: ComponenteReloj,
        plataformas: List[str] = None
    ) -> Dict[str, Dict[str, str]]
    
    async def generar_json_ld_completo(
        self, 
        componente: ComponenteReloj,
        incluir_ofertas: bool = False,
        incluir_reviews: bool = False
    ) -> Dict[str, Any]
    
    def obtener_estadisticas_agente(self) -> Dict[str, Any]
    
    async def health_check_completo(self) -> Dict[str, Any]
```

### Estructuras de Datos Principales

#### ComponenteReloj

```python
@dataclass
class ComponenteReloj:
    id: str                          # ID único
    tipo: TipoComponente             # Tipo de componente
    nombre: str                      # Nombre del componente
    descripcion_tecnica: str = None  # Descripción técnica
    
    # Características físicas
    material_base: MaterialBase = None
    acabado_superficie: AcabadoSuperficie = None
    color_principal: str = None
    dimensiones: Dict[str, float] = field(default_factory=dict)
    peso: float = None
    
    # Características visuales
    colores_secundarios: List[str] = field(default_factory=list)
    textura: str = None
    patron: str = None
    
    # Características funcionales
    resistencia_agua: int = None
    resistencia_rayado: int = None
    facilidad_mantenimiento: str = None
    
    # Estilo y categorización
    estilo_visual: List[EstiloVisual] = field(default_factory=list)
    coleccion: str = None
    referencia: str = None
    
    # Datos 3D
    modelo_3d_url: str = None
    texturas_alta_res: List[str] = field(default_factory=list)
    materiales_pbr: Dict[str, Any] = field(default_factory=dict)
```

#### MetadatosGenerados

```python
@dataclass
class MetadatosGenerados:
    componente_id: str
    timestamp: datetime = field(default_factory=datetime.now)
    
    # Metadatos SEO
    seo_metadata: Optional[MetadatosSEO] = None
    
    # Descripciones por audiencia
    descripciones: List[DescripcionAudiencia] = field(default_factory=list)
    
    # Estructura JSON-LD
    json_ld: Dict[str, Any] = field(default_factory=dict)
    
    # Metadatos 3D
    metadata_3d: Dict[str, Any] = field(default_factory=dict)
    
    # Información adicional
    taxonomias: Dict[str, List[str]] = field(default_factory=dict)
    variantes_producto: List[Dict[str, Any]] = field(default_factory=list)
    relacionados: List[str] = field(default_factory=list)
    
    # Métricas y analytics
    palabras_clave_densidad: Dict[str, int] = field(default_factory=dict)
    legibilidad_score: Optional[float] = None
    seo_score: Optional[float] = None
    
    # Control de calidad
    version_gemini: str = "2.0"
    modelo_utilizado: str = "gemini-pro-exp"
    tokens_consumidos: int = 0
    tiempo_procesamiento: float = 0.0
    warnings: List[str] = field(default_factory=list)
    errores: List[str] = field(default_factory=list)
```

## 🎛️ Configuración del Sistema

### Variables de Entorno

```bash
# API Configuration
GEMINI_API_KEY=tu-api-key-openrouter
AGENT_ENV=production  # development, production, testing, performance

# Cache Configuration
REDIS_URL=redis://localhost:6379
CACHE_TTL_HOURS=24
ENABLE_CACHE=true

# Logging Configuration
LOG_LEVEL=INFO
ENABLE_VERBOSE_LOGGING=false

# Rate Limiting
REQUESTS_PER_MINUTE=60
REQUESTS_PER_HOUR=1000
```

### Configuración de OpenRouter

1. Obtén tu API key en [OpenRouter](https://openrouter.ai/)
2. Configura el modelo `gemini-pro-exp`
3. Establece los límites de rate según tu plan

```python
# Ejemplo de configuración OpenRouter
config = ConfiguracionAgente(
    gemini_api_key="sk-or-v1-tu-api-key",
    modelo_default="gemini-pro-exp",
    requests_per_minute=60,  # Según tu plan OpenRouter
    requests_per_hour=1000
)
```

## 📈 Monitoreo y Métricas

### Estadísticas del Agente

```python
stats = agente.obtener_estadisticas_agente()

print(f"Componentes procesados: {stats['estadisticas_procesamiento']['componentes_procesados']}")
print(f"Metadatos generados: {stats['estadisticas_procesamiento']['metadatos_generados']}")
print(f"Errores: {stats['estadisticas_procesamiento']['errores']}")
print(f"Tiempo total: {stats['estadisticas_procesamiento']['tiempo_total_procesamiento']:.2f}s")
```

### Health Check Completo

```python
health = await agente.health_check_completo()

print(f"Status General: {health['agent_status']}")

for component, status in health["components"].items():
    print(f"{component}: {status['status']}")
```

### Cache Statistics

```python
cache_stats = agente.metadata_generator.get_cache_stats()

print(f"Cache Hit Rate: {cache_stats['generation_cache']['hit_rate']}")
print(f"Cache Size: {cache_stats['generation_cache']['entries']}")
```

## 🔍 Optimización y Mejores Prácticas

### 1. Optimización de Performance

```python
# Usar configuración de performance para lotes grandes
from config import create_performance_config

config = create_performance_config()
agente = AgenteMetadatosGemini(config)

# Procesar en lotes con concurrencia controlada
resultados = await agente.procesar_lote_componentes(
    componentes=lista_componentes,
    max_concurrencia=5  # Ajustar según recursos
)
```

### 2. Gestión de Cache

```python
# Habilitar cache para componentes similares
config = create_production_config()
config.enable_cache = True
config.cache_ttl_hours = 24  # Cache de 24 horas

# Limpiar cache manualmente si es necesario
agente.metadata_generator.gemini_client.clear_cache()
```

### 3. Rate Limiting

```python
# Configurar rate limiting conservador
config = ConfiguracionAgente(
    requests_per_minute=30,  # Conservador para estabilidad
    requests_per_hour=500
)

# Monitorear rate limiting
cache_stats = agente.metadata_generator.gemini_client.get_cache_stats()
```

### 4. Manejo de Errores

```python
try:
    metadatos = await agente.procesar_componente_completo(componente)
except Exception as e:
    print(f"Error: {e}")
    
    # Verificar estado del sistema
    health = await agente.health_check_completo()
    
    if health["agent_status"] != "healthy":
        print("Sistema no saludable, revisar configuración")
```

## 🧪 Testing

### Ejecutar Tests

```bash
# Instalar dependencias de testing
pip install pytest pytest-asyncio factory-boy

# Ejecutar tests
pytest tests/ -v

# Tests con coverage
pytest tests/ --cov=agent_6_metadatos_gemini --cov-report=html
```

### Tests de Ejemplo

```python
import pytest
from agent import AgenteMetadatosGemini
from config import create_testing_config
from types import ComponenteReloj, TipoComponente

@pytest.mark.asyncio
async def test_basic_metadata_generation():
    config = create_testing_config()
    agente = AgenteMetadatosGemini(config)
    
    componente = ComponenteReloj(
        id="test_001",
        tipo=TipoComponente.CAJA,
        nombre="Test Caja"
    )
    
    metadatos = await agente.procesar_componente_completo(componente)
    
    assert metadatos.seo_metadata is not None
    assert metadatos.seo_metadata.titulo_seo is not None
    assert len(metadatos.descripciones) > 0

@pytest.mark.asyncio
async def test_health_check():
    config = create_testing_config()
    agente = AgenteMetadatosGemini(config)
    
    health = await agente.health_check_completo()
    
    assert "agent_status" in health
    assert "components" in health
```

## 🚀 Deployment

### Docker

```dockerfile
FROM python:3.9-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .

CMD ["python", "ejemplo_uso.py"]
```

### Environment Variables para Producción

```bash
export GEMINI_API_KEY="sk-or-v1-production-key"
export AGENT_ENV="production"
export LOG_LEVEL="INFO"
export ENABLE_CACHE="true"
export REDIS_URL="redis://production-redis:6379"
```

### Integración con Sistema Principal

```python
# Integrar con sistema principal
from agent_6_metadatos_gemini import AgenteMetadatosGemini
from agent_6_metadatos_gemini.config import create_production_config

# En tu sistema principal
async def generar_metadatos_componente(componente_data):
    config = create_production_config()
    agente = AgenteMetadatosGemini(config)
    
    metadatos = await agente.procesar_componente_completo(
        componente=componente_data
    )
    
    return metadatos
```

## 📊 Casos de Uso

### 1. Catálogo de Productos Online

```python
# Generar metadatos para cada producto del catálogo
for producto in catalogo:
    metadatos = await agente.procesar_componente_completo(producto)
    
    # Guardar en base de datos
    await db.guardar_metadatos(producto.id, metadatos)
    
    # Generar sitemap
    urls.append(generar_url_seo(metadatos.seo_metadata))
```

### 2. Campañas de Marketing

```python
# Generar contenido para campaña
contenido_redes = await agente.generar_contenido_redes_sociales(
    componente=producto_destacado,
    plataformas=["Instagram", "Twitter", "Facebook"]
)

# Publicar en redes sociales
await redes_sociales.publicar_contenido(contenido_redes)
```

### 3. Optimización SEO

```python
# Optimizar SEO existente
seo_optimizado = await agente.generar_seo_optimizado(
    componente=producto,
    keywords_objetivo=["reloj lujo", "swiss made", "premium"],
    audiencia=AudienciaTarget.LUJO
)

# Actualizar meta tags en CMS
await cms.actualizar_meta_tags(producto.id, seo_optimizado['meta_tags'])
```

### 4. Integración con E-commerce

```python
# Generar JSON-LD para rich snippets
json_ld = await agente.generar_json_ld_completo(
    componente=producto,
    incluir_ofertas=True,
    incluir_reviews=True
)

# Añadir a página de producto
await ecommerce.añadir_json_ld(producto.id, json_ld)
```

## 🔧 Troubleshooting

### Problemas Comunes

#### 1. Error de API Key

```
Error: Invalid API key
```

**Solución:**
```python
# Verificar API key
print(f"API Key configurada: {bool(config.gemini_api_key)}")

# Verificar en OpenRouter
curl -H "Authorization: Bearer TU-API-KEY" \
     https://openrouter.ai/api/v1/models
```

#### 2. Rate Limiting

```
Error: Rate limit exceeded
```

**Solución:**
```python
# Reducir requests por minuto
config.requests_per_minute = 30

# Implementar delays entre requests
await asyncio.sleep(2)  # Delay de 2 segundos
```

#### 3. Cache Issues

```
Error: Cache miss o datos obsoletos
```

**Solución:**
```python
# Limpiar cache
agente.metadata_generator.gemini_client.clear_cache()

# O forzar regeneración
metadatos = await agente.procesar_componente_completo(
    componente, forzar_regeneracion=True
)
```

### Logs y Debugging

```python
# Habilitar logging detallado
config = create_development_config()
config.log_level = "DEBUG"
config.enable_verbose_logging = True

# Logs estructurados
import structlog
structlog.configure(
    processors=[
        structlog.processors.JSONRenderer()
    ]
)
```

## 📚 Recursos Adicionales

### Documentación de APIs

- [OpenRouter API](https://openrouter.ai/docs)
- [Gemini 2.0 Documentation](https://ai.google.dev/gemini-api)
- [Schema.org](https://schema.org/)

### Herramientas Recomendadas

- **SEO Testing**: Google Search Console, SEMrush
- **Content Analysis**: Yoast SEO, Ahrefs
- **Performance**: GTmetrix, PageSpeed Insights
- **Schema Testing**: Google Rich Results Test

### Comunidades

- [SEO Community](https://www.reddit.com/r/seo/)
- [Web Development Discord](https://discord.gg/webdev)
- [AI/ML Communities](https://www.reddit.com/r/MachineLearning/)

## 🤝 Contribuir

### Guías de Contribución

1. Fork el proyecto
2. Crear feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit cambios (`git commit -m 'Add AmazingFeature'`)
4. Push al branch (`git push origin feature/AmazingFeature`)
5. Abrir Pull Request

### Código de Conducta

- Seguir PEP 8 para Python
- Escribir tests para nuevas funcionalidades
- Documentar APIs públicas
- Mantener backwards compatibility

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver `LICENSE` para más detalles.

## 📞 Soporte

Para soporte técnico:

- **Email**: soporte@luxurywatch.com
- **Issues**: [GitHub Issues](https://github.com/tu-repo/issues)
- **Documentation**: [Wiki del Proyecto](https://github.com/tu-repo/wiki)

## 🎉 Agradecimientos

- **OpenRouter** por la API de Gemini 2.0
- **Google** por el modelo Gemini
- **Comunidad Open Source** por las herramientas y librerías
- **Equipo LuxuryWatch** por el contexto y casos de uso

---

**Agente 6: Generador de Metadatos y SEO v1.0.0**  
*Transformando componentes de reloj en contenido SEO optimizado con IA*
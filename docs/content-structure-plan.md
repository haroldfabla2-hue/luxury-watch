# Content Structure Plan - LuxuryWatch

## 1. Material Inventory

### Content Files
- `docs/estrategias_marketing.md` (~11,000 words, 15 sections: SEO, content marketing, social media, influencer marketing, personalización, campañas ROI, métricas, implementación)
- `docs/tendencias/tendencias_diseño.md` (~15,000 words, 17 sections: resumen, estilos de cajas, esferas, paletas color, materiales, correas, funcionalidades, recomendaciones)
- `docs/competidores/competidores_premium.md` (~8,000 words, 8 analyses: Formex, MR PORTER, Hodinkee, WatchBox, Bamford, Blaken, RGM, UNDONE)
- `docs/tecnologia/tecnologias_3d.md` (~16,000 words, 10 sections: configuradores 3D, Three.js, Babylon.js, AR, plataformas SaaS, ROI)
- `docs/competidores/plan_investigacion_relojes_premium.md`
- `docs/marketing/research_plan_relojes_lujo.md`
- `docs/proveedores/apis_proveedores.md`
- `docs/proveedores/research_plan_apis_relojes.md`
- `docs/tecnologia/research_plan_3d_configurators.md`
- `docs/tendencias/research_plan_relojes_2025.md`

### Visual Assets
- `imgs/` (15 files):
  - **Configuradores 3D** (3 files): configuradores_3d_1.png, configuradores_3d_4.jpg, configuradores_3d_6.png
  - **Tendencias 2025** (3 files): tendencias_2025_2.jpg, tendencias_2025_6.jpg, tendencias_2025_8.jpg
  - **Esferas personalizadas** (3 files): esferas_personalizadas_0.jpg, esferas_personalizadas_2.jpg, esferas_personalizadas_4.jpeg
  - **Colecciones premium** (3 files): colecciones_premium_0.webp, colecciones_premium_2.jpg, colecciones_premium_5.jpg
  - **Componentes relojes** (3 files): componentes_relojes_0.jpg, componentes_relojes_5.jpg, componentes_relojes_9.jpg

### Data Files
- `docs/tendencias/` (5 PNG charts):
  - case_styles_trends_2025.png (Estilos de caja)
  - dial_colors_market_share.png (Cuotas de color de esferas)
  - functionality_demand_2025.png (Funcionalidades demandadas)
  - materials_trends_2025.png (Tendencias de materiales)
  - size_preferences_2025.png (Preferencias de tamaño)
  - strap_trends_2025.png (Tendencias de correas)

## 2. Website Structure

**Type:** SPA (Single-Page Application)

**Reasoning:** 
- Audiencia cohesiva (18-35 premium/fashionable + entusiastas de relojes)
- Objetivo único y claro: presentar plataforma de personalización premium y generar conversiones (interés/registro)
- Narrativa lineal: Lujo → Personalización → Materiales → Tecnología → CTA
- Contenido visual-intensivo con flujo de scroll inmersivo
- ~6 secciones principales con alto impacto visual
- Experiencia de storytelling que conecta materiales físicos con diseño digital

## 3. Section Breakdown (SPA)

**Purpose:** Presentar LuxuryWatch como plataforma premium de configuración de relojes personalizados con tecnología 3D de vanguardia

**Content Mapping:**

| Section | Component Pattern | Data File Path | Content to Extract | Visual Asset (Content ONLY) |
|---------|------------------|-------------|-------------------|------------------------------|
| **1. Hero (Luxury Immersion)** | Hero Pattern | `docs/competidores/competidores_premium.md` L1-50 | Propuesta de valor única: configuración 3D, personalización premium, marketplace diseñadores | `imgs/configuradores_3d_1.png` |
| **2. Value Proposition (¿Por qué LuxuryWatch?)** | 4-Column Feature Grid | `docs/competidores/competidores_premium.md` L51-92 (oportunidades) + `docs/tendencias/tendencias_diseño.md` L39-50 | 4 diferenciadores clave extraídos de análisis competitivo: Configurador 3D tiempo real, AR móvil, Marketplace diseñadores, IA personalizada | - |
| **3. Materials Showcase (Materiales Premium)** | Material Card Grid (3 cols) | `docs/tendencias/tendencias_diseño.md` L193-213 (Tabla 7: Matriz de materiales) | Para cada material (Oro, Cerámica, Titanio): propiedades, percepción valor, casos uso | `imgs/componentes_relojes_0.jpg`, `imgs/componentes_relojes_5.jpg`, `imgs/componentes_relojes_9.jpg` |
| **4. Customization Process (Personalización)** | Timeline / Process Steps (4 pasos) | `docs/tendencias/tendencias_diseño.md` L157-188 (Paletas color) + L112-156 (Esferas) + L215-233 (Correas) | 4 pasos personalizacion: 1. Selecciona caja/tamaño (36-40mm tendencia), 2. Elige esfera/color (negro/azul/menta), 3. Material (oro/cerámica/titanio), 4. Correa (cuero/malla/silicona) | `imgs/esferas_personalizadas_0.jpg`, `imgs/esferas_personalizadas_2.jpg`, `imgs/esferas_personalizadas_4.jpeg` |
| **5. Technology Showcase (Tecnología 3D + AR)** | 2-Column Split (Demo + Benefits) | `docs/tecnologia/tecnologias_3d.md` L1-33 (resumen ejecutivo + ROI) | Beneficios configurador 3D: +40% conversión, -30% devoluciones, AOV incrementado. Tecnologías: Three.js/R3F, AR iOS/Android | `imgs/configuradores_3d_4.jpg`, `imgs/configuradores_3d_6.png` |
| **6. Trends & Inspiration (Tendencias 2025)** | Card Grid + Data Visualization | `docs/tendencias/tendencias_diseño.md` L7-19 (síntesis hallazgos) | Tendencias clave 2025: Tamaños 36-40mm, materiales (oro/cerámica/titanio), colores (negro/azul/verde menta), funcionalidades (GMT/cronógrafo/lunar) | Inline: `docs/tendencias/*.png` (charts) |
| **7. Competitive Edge (Ventaja Competitiva)** | Comparison Table | `docs/competidores/competidores_premium.md` L26-41 (Tabla 1) + L78-92 (Tabla 2) | Comparativa vs competidores: Formex, UNDONE, Bamford, Hodinkee. Destacar diferenciadores de LuxuryWatch | - |
| **8. CTA Final (Call to Action)** | CTA Block | - | Texto CTA: "Comienza tu diseño único" / "Únete a la lista de espera" / "Agenda demo exclusiva" | - |

## 4. Content Analysis

### Information Density
**Medium-High**
- Contenido total investigado: ~50,000+ words
- Material visual: 15 imágenes + 6 charts
- Para SPA: Extraer ~2,500-3,000 words clave (5% del total)
- Foco en mensajes de alto impacto y datos visuales

### Content Balance
**Visual-Focused con datos estratégicos**
- **Imágenes**: 15 content images (configuradores, tendencias, esferas, componentes) (50%)
- **Data/Charts**: 6 charts de tendencias 2025 (materiales, colores, funcionalidades) (20%)
- **Text**: ~2,500-3,000 words extraídos estratégicamente (30%)
- **Content Type**: Visual-driven + Data storytelling + Copy premium conciso

### Content Hierarchy by Section

**Hero (15% content weight):**
- Headline impact: "Diseña el reloj de tus sueños"
- Subheadline: Propuesta valor única (configurador 3D, materiales premium)
- Visual: Configurador 3D demo
- CTA primario: "Comenzar diseño"

**Value Proposition (10% content weight):**
- 4 diferenciadores (50-75 words cada uno)
- Iconografía premium
- Beneficios cuantificables

**Materials Showcase (20% content weight):**
- 3 materiales principales (Oro, Cerámica, Titanio)
- Props técnicas + percepción valor
- Imágenes componentes reales

**Customization Process (20% content weight):**
- 4 pasos con copy descriptivo
- Imágenes esferas personalizadas
- Destacar opciones tendencia 2025

**Technology Showcase (15% content weight):**
- ROI configurador 3D (+40% conv, -30% devoluciones)
- Demo visual AR
- Stack tecnológico (Three.js, AR móvil)

**Trends & Inspiration (15% content weight):**
- Charts visuales (colores, materiales, funcionalidades)
- Síntesis tendencias 2025
- Inspiración visual

**Competitive Edge (5% content weight):**
- Tabla comparativa concisa
- Diferenciadores clave vs 3-4 competidores

**CTA Final (5% content weight):**
- CTA impacto + benefits recap
- Form/botón acción

## 5. Design Direction Alignment

**Luxury & Sophisticated Requirements:**
- ✅ Paleta de colores conectada con materiales físicos:
  - **Oro**: #B8860B (Dark Goldenrod) - Warm metallic
  - **Cerámica**: #1A1D20 (Deep charcoal) - Technical elegance
  - **Titanio**: #8B9AA6 (Silver Blue) - Precision metal
  - **Neutrals**: Warm whites (#FAFAF8, #F5F4F0) - Premium backgrounds
  
- ✅ Lujo desde el primer pixel:
  - Hero 600-800px con configurador 3D inmersivo
  - Spacing generoso: 96-128px entre secciones
  - Cards 48-64px padding
  - Typography: Playfair Display (headlines) + Lato (body)
  - Subtle animations 400-600ms
  
- ✅ Materiales físicos como storytelling:
  - Cada material (oro/cerámica/titanio) tiene sección dedicada
  - Imágenes componentes reales
  - Propiedades técnicas + percepción valor
  - Gradientes metálicos sutiles (oro/plata/bronce) SOLO en CTAs

## 6. Content Extraction Strategy

### Priority Content Sources

**High Priority (Must Extract):**
1. `tendencias_diseño.md` → Materiales (L193-213), Colores (L157-188), Tendencias síntesis (L7-19)
2. `competidores_premium.md` → Diferenciadores (L26-92), Oportunidades LuxuryWatch (L51-92)
3. `tecnologias_3d.md` → ROI configurador (L1-33), Beneficios AR (L5-26)

**Medium Priority (Selective Extract):**
4. `estrategias_marketing.md` → USP personalización (L160-180)
5. Charts → Todos los PNG de tendencias (inline en sección Trends)

**Low Priority (Context Only):**
6. Research plans → Background context, no copiar directamente

### Copy Tone & Voice
- **Luxury**: Elegante, sofisticado, aspiracional
- **Technical Precision**: Datos concretos (36-40mm, +40% conversión)
- **Material Storytelling**: Conectar propiedades físicas con emociones
- **Restrained**: Menos es más, espacios generosos, copy conciso
- **Authentic**: Evitar superlativos excesivos, datos reales

## 7. Visual Asset Classification

### Content Images (✅ SPECIFIED in plan)
- **Product/Process**: Configuradores 3D (3 images)
- **Product Details**: Esferas personalizadas (3 images)
- **Technical**: Componentes relojes (3 images)
- **Inspiration**: Colecciones premium (3 images) - usado en sección Trends
- **Data Visualization**: Charts PNG (6 images) - inline en sección Trends

### Decorative Images (❌ NOT specified - Design Spec defines)
- Hero background atmosphere
- Section dividers/textures
- Abstract material patterns
- Gradient overlays
- Ambient lighting effects

## 8. Technical Notes

### Content Extraction Guidelines
- Extract ONLY content (text, data, product images)
- Preserve numerical data accuracy (36-40mm, +40%, etc.)
- Maintain technical terminology (COSC, DLC, PVD, etc.)
- Translate to Spanish while keeping brand terms in English
- Reference source file + line numbers for traceability

### Image Usage Guidelines
- **Content images**: Use filenames as specified in Visual Asset column
- **Charts**: Reference by filename (e.g., `dial_colors_market_share.png`)
- **Components**: Used to illustrate materials and craftsmanship
- **Configurators**: Demo of 3D technology and interface

### Responsive Content Strategy
- Hero: Full configurator desktop, simplified mobile
- Material cards: 3→2→1 columns by breakpoint
- Process timeline: Horizontal→Vertical stack
- Charts: Maintain readability, consider simplified mobile versions
- All copy: Scan optimized, 60-75 char/line max

---

**Document Version**: 1.0  
**Created**: 2025-11-04  
**Status**: Ready for Design Specification phase

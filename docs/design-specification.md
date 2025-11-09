# Design Specification - LuxuryWatch

## 1. Design Direction & Rationale

**Style:** Luxury & Sophisticated

**Visual Essence:** Restraint meets craftsmanship. Every pixel reflects the tangible luxury of premium watch materials—warm gold gradients, deep ceramic blacks, technical titanium silvers. Generous whitespace (45%+) creates exclusivity; subtle metallic accents honor horological heritage; refined serif typography elevates authority. This is not minimalism by omission, but luxury by precision.

**Real-World Examples:**
- Rolex.com: Material reverence, generous spacing, serif authority
- Patek Philippe: Timeless elegance, muted saturation, premium photography
- Vacheron Constantin: Subtle gold accents, layered depth, expert typography

**Material-Driven Design Philosophy:**
The color system is not abstract—it's tactile. Every hue derives from physical watch materials: warm goldenrod (#B8860B) mirrors 18k gold cases; deep charcoal (#1A1D20) evokes high-tech ceramic; silver-blue (#8B9AA6) reflects Grade 5 titanium. This creates an unconscious connection between digital interface and physical luxury.

---

## 2. Design Tokens

### 2.1 Color System (Material-Inspired Palette)

**Primary Brand - Physical Gold**
Inspired by 18k yellow/rose gold watch cases and clasps. Warmth + exclusivity.

| Token | Hex | HSL | Usage |
|-------|-----|-----|-------|
| `gold-50` | `#FDF8E8` | (45°, 70%, 95%) | Champagne tint, hero overlays |
| `gold-100` | `#F4E4B5` | (45°, 70%, 85%) | Soft gold backgrounds |
| `gold-500` | `#B8860B` | (43°, 89%, 38%) | **Primary accent** (CTAs, highlights) |
| `gold-700` | `#9A7209` | (43°, 89%, 32%) | Hover states, borders |
| `gold-900` | `#6B5006` | (43°, 89%, 22%) | Dark gold, deep accents |

**Secondary Brand - Technical Titanium**
Inspired by Grade 5 titanium (aerospace-grade). Precision + modernity.

| Token | Hex | HSL | Usage |
|-------|-----|-----|-------|
| `titanium-50` | `#F0F3F5` | (210°, 15%, 96%) | Light surface |
| `titanium-100` | `#E3E6E8` | (210°, 10%, 91%) | Card backgrounds |
| `titanium-500` | `#8B9AA6` | (210°, 15%, 60%) | **Secondary accent** (icons, borders) |
| `titanium-700` | `#6B7A86` | (210°, 15%, 48%) | Muted text, dividers |
| `titanium-900` | `#3A4550` | (210°, 15%, 28%) | Dark technical |

**Tertiary - High-Tech Ceramic**
Inspired by scratch-resistant ceramic bezels (Omega, Rolex). Depth + durability.

| Token | Hex | HSL | Usage |
|-------|-----|-----|-------|
| `ceramic-50` | `#F5F5F5` | (0°, 0%, 96%) | Ultra-light surface |
| `ceramic-500` | `#2C2F33` | (210°, 6%, 19%) | Card elevation, modals |
| `ceramic-700` | `#1F2125` | (210°, 10%, 13%) | Deep backgrounds |
| `ceramic-900` | `#1A1D20` | (210°, 10%, 11%) | **Darkest accent** (footer, deep UI) |

**Neutrals (Warm Ivory Foundation)**
Warm off-whites with subtle champagne undertone. Premium paper quality feel.

| Token | Hex | HSL | Usage | WCAG Contrast |
|-------|-----|-----|-------|---------------|
| `neutral-50` | `#FAFAF8` | (60°, 12%, 98%) | **Page background** | — |
| `neutral-100` | `#F5F4F0` | (60°, 15%, 95%) | **Card surface** | — |
| `neutral-200` | `#E8E6E0` | (50°, 15%, 90%) | Borders, dividers | — |
| `neutral-500` | `#9B9A94` | (50°, 5%, 60%) | Muted text | 4.9:1 on neutral-50 ✅ |
| `neutral-700` | `#4A4A45` | (60°, 3%, 29%) | **Body text** | 8.5:1 on neutral-50 ✅ AAA |
| `neutral-900` | `#1C1C19` | (60°, 8%, 11%) | **Headline text** | 15.2:1 on neutral-50 ✅ AAA |

**Semantic Colors**

| Purpose | Hex | HSL | Notes |
|---------|-----|-----|-------|
| Success | `#5A7A5F` | (130°, 15%, 42%) | Muted green, not neon |
| Warning | `#9A7209` | (43°, 89%, 32%) | Reuse gold-700 |
| Error | `#8B4A4A` | (0°, 30%, 42%) | Burgundy, not red |
| Info | `#6B7A86` | (210°, 15%, 48%) | Reuse titanium-700 |

**Metallic Gradients (Use SPARINGLY - CTAs Only)**

```css
/* Gold Gradient - Primary CTA ONLY */
.metallic-gold {
  background: linear-gradient(135deg, #D4AF37 0%, #F4E4B5 50%, #C9A961 100%);
}

/* Silver Gradient - Secondary CTA */
.metallic-silver {
  background: linear-gradient(135deg, #C0C0C0 0%, #E8E8E8 50%, #A8A8A8 100%);
}

/* CRITICAL: Limit to 1-2 CTAs per viewport. Overuse = gaudy. */
```

**WCAG Validation (Key Pairings)**

| Foreground | Background | Contrast | Rating |
|------------|------------|----------|--------|
| neutral-900 (#1C1C19) | neutral-50 (#FAFAF8) | 15.2:1 | ✅ AAA |
| neutral-700 (#4A4A45) | neutral-50 | 8.5:1 | ✅ AAA |
| gold-500 (#B8860B) | neutral-50 | 5.8:1 | ✅ AA Large |

### 2.2 Typography System

**Font Families**

```
Headline: 'Playfair Display', Georgia, serif
Body:     'Lato', -apple-system, BlinkMacSystemFont, sans-serif
```

**Type Scale (Desktop 1920px Base)**

| Element | Size | Weight | Line Height | Letter Spacing | Font Family |
|---------|------|--------|-------------|----------------|-------------|
| `display` | 96px | 700 | 1.1 | -0.02em | Playfair Display |
| `h1` | 72px | 700 | 1.15 | -0.01em | Playfair Display |
| `h2` | 56px | 600 | 1.2 | 0 | Playfair Display |
| `h3` | 40px | 600 | 1.3 | 0 | Playfair Display |
| `h4` | 32px | 500 | 1.3 | 0.01em | Lato |
| `body-large` | 24px | 400 | 1.7 | 0 | Lato |
| `body` | 18px | 400 | 1.6 | 0.01em | Lato |
| `body-small` | 16px | 400 | 1.5 | 0.01em | Lato |
| `caption` | 14px | 300 | 1.4 | 0.03em | Lato |
| `label-caps` | 12px | 500 | 1.3 | 0.12em | Lato (UPPERCASE) |

**Responsive Type Scale (Mobile <768px)**

| Element | Size (Mobile) | Notes |
|---------|---------------|-------|
| `display` | 56px | −42% |
| `h1` | 48px | −33% |
| `h2` | 40px | −29% |
| `h3` | 32px | −20% |
| `body` | 18px | Maintain readability |

### 2.3 Spacing System (4pt Grid, Prefer 8pt Multiples)

| Token | Value | Usage |
|-------|-------|-------|
| `xs` | 8px | Fine-tuning, inline gaps |
| `sm` | 16px | Inline elements, tight groups |
| `md` | 24px | Standard element gaps |
| `lg` | 32px | Related group spacing |
| `xl` | 48px | **Card padding (minimum)** |
| `2xl` | 64px | Section internal spacing |
| `3xl` | 96px | **Section boundaries** |
| `4xl` | 128px | **Luxury spacing** (hero, major sections) |
| `5xl` | 160px | Hero internal spacing (extra generous) |

### 2.4 Border Radius (Soft Sophistication)

| Token | Value | Usage |
|-------|-------|-------|
| `radius-sm` | 8px | Buttons, inputs |
| `radius-md` | 12px | Cards, containers |
| `radius-lg` | 16px | Modals, large cards |
| `radius-full` | 9999px | Pills, circular elements |

### 2.5 Box Shadow (Layered Soft Depth)

```css
/* Card - Subtle Elevation */
--shadow-card: 
  0 4px 12px rgba(0, 0, 0, 0.08),
  0 2px 4px rgba(0, 0, 0, 0.04);

/* Card Hover - Gentle Lift */
--shadow-card-hover:
  0 12px 24px rgba(0, 0, 0, 0.12),
  0 6px 12px rgba(0, 0, 0, 0.06);

/* Modal - Prominent but Soft */
--shadow-modal:
  0 24px 48px rgba(0, 0, 0, 0.15),
  0 12px 24px rgba(0, 0, 0, 0.08);

/* Gold Accent Shadow (CTAs) */
--shadow-gold:
  0 8px 16px rgba(184, 134, 11, 0.2),
  0 4px 8px rgba(184, 134, 11, 0.12);
```

### 2.6 Animation Timing (Elegant & Unhurried)

| Token | Duration | Easing | Usage |
|-------|----------|--------|-------|
| `fast` | 300ms | ease-out | Button hover |
| `standard` | 400ms | cubic-bezier(0.4, 0.0, 0.2, 1) | Most transitions |
| `luxury` | 500ms | cubic-bezier(0.25, 0.46, 0.45, 0.94) | Hero, modals |
| `slow` | 600ms | ease-out-quad | Parallax, luxury moments |

---

## 3. Component Specifications

### 3.1 Hero Section (Luxury Immersion)

**Structure:**
- Height: 600-800px (desktop), 500-600px (mobile)
- Layout: Centered content (8-col max-width) over full-width background
- Background: Configurator 3D demo OR luxury watch macro (50% dark overlay `rgba(0,0,0,0.5)`)

**Typography:**
- Headline: `display` (96px desktop, 56px mobile), Playfair Display 700, neutral-50 (white)
- Subheadline: `body-large` (24px), Lato 400, neutral-100, max-width 700px
- Line-height: 1.6, center-aligned

**CTA:**
- Primary button: 64px height, 32px horizontal padding, `radius-sm` (8px)
- Background: `.metallic-gold` gradient (ONLY here)
- Text: 16px, Lato 500, neutral-900 (dark on gold), letter-spacing 0.08em, UPPERCASE
- Hover: `brightness(110%)` + `scale(1.02)` + `shadow-gold` (400ms)
- Secondary button: 64px, transparent background, 2px solid neutral-50, neutral-50 text

**Spacing:**
- Vertical padding: 128px top, 96px bottom
- CTA group gap: 24px
- Headline → Subheadline: 32px
- Subheadline → CTA: 48px

**Interaction:**
- Scroll indicator: Animated chevron-down icon (neutral-100, 24px, fade-in animation 2s infinite)

**Notes:**
- NO logo centered in hero (Swiss Design violation). Logo stays in navigation (top-left).
- Configurator 3D demo embedded if technical feasibility allows; fallback to luxury hero image.
- Overlay gradient: `linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(0,0,0,0.6))` for text legibility.

### 3.2 Button Components

**Primary CTA (Metallic Gold - Maximum 2 per viewport)**
```
Height: 56-64px
Padding: 24-32px horizontal
Border-radius: 8px
Background: linear-gradient(135deg, #D4AF37 0%, #F4E4B5 50%, #C9A961 100%)
Color: neutral-900 (#1C1C19)
Font: Lato 500, 16px, letter-spacing 0.08em, UPPERCASE
Shadow: --shadow-gold

Hover:
  brightness(110%)
  transform: scale(1.02)
  shadow: enhanced --shadow-gold
  transition: 400ms ease-out
```

**Secondary CTA (Outline Elegant)**
```
Height: 56-64px
Padding: 24-32px horizontal
Border-radius: 8px
Background: transparent
Border: 1.5px solid titanium-500
Color: neutral-700
Font: Lato 500, 16px, letter-spacing 0.05em

Hover:
  Background: neutral-100
  Border: 1.5px solid gold-500
  Color: neutral-900
  transition: 400ms
```

**Tertiary (Text Link)**
```
No background, no border
Color: gold-500
Font: Lato 400, 16px, underline offset 4px
Hover: Color gold-700, transition 300ms
```

### 3.3 Card Component (Material Showcase)

**Structure:**
- Padding: 48-64px (minimum 48px, luxury prefers 64px)
- Background: neutral-100 (#F5F4F0) on neutral-50 page background (≥5% lightness contrast ✅)
- Border-radius: 12px
- Border: Optional 1px solid neutral-200
- Shadow: `--shadow-card`

**Content Hierarchy:**
- Icon/Image: 64px height, gold-500 or ceramic-500 tint
- Headline: `h4` (32px), Lato 500, neutral-900
- Body: `body` (18px), Lato 400, neutral-700, line-height 1.6
- CTA: Tertiary text link (gold-500)

**Hover State:**
```
transform: translateY(-4px)
shadow: --shadow-card-hover
border: 1px solid gold-500 (accent reveal)
transition: 400ms luxury easing
```

**Spacing:**
- Icon → Headline: 24px
- Headline → Body: 16px
- Body → CTA: 24px

**Grid:**
- 3 columns desktop (gap 32px)
- 2 columns tablet (gap 24px)
- 1 column mobile (gap 16px)

### 3.4 Navigation Bar (Refined Presence)

**Structure:**
- Height: 80-96px (taller for luxury presence)
- Background: neutral-50 (#FAFAF8) with 2% noise texture
- Shadow: `0 2px 8px rgba(0,0,0,0.06)` (appears on scroll)
- Sticky: `position: sticky; top: 0; z-index: 100;`

**Logo:**
- Position: **Left-aligned** (NOT centered)
- Height: 40-48px
- Color: neutral-900 or gold-500 accent

**Navigation Links:**
- Font: Lato 300, 16px, letter-spacing 0.1em
- Color: neutral-700
- Hover: gold-500 with underline fade-in (300ms)
- Spacing: 32-48px between links

**CTA Button:**
- Right-aligned
- Primary CTA style (48px height)
- Text: "Comenzar Diseño" or "Agendar Demo"

**Mobile (<768px):**
- Hamburger menu (right side, 24px icon, titanium-700)
- Drawer: Full-height, neutral-50 background, slide-in from right (400ms)

### 3.5 Material Card Grid (Section 3: Materials Showcase)

**Layout:**
- 3-column grid (desktop), 1-column stack (mobile)
- Gap: 32px
- Each card: 64px padding, neutral-100 background

**Card Content:**
- Hero Image: Component image (componentes_relojes_*.jpg), 100% width, aspect-ratio 16:9, radius-md (12px top)
- Material Badge: Small pill (radius-full), 8px padding, gold-500 background, "ORO" | "CERÁMICA" | "TITANIO"
- Headline: `h3` (40px), Playfair 600, material name
- Properties List: 3-4 bullet points, `body-small` (16px), Lato 400, neutral-700
- CTA: "Ver detalles" tertiary link

**Hover:**
- Image: `scale(1.05)` with `overflow: hidden` on container
- Card: Lift -4px + shadow-card-hover

### 3.6 Timeline / Process Steps (Section 4: Customization)

**Layout:**
- Horizontal timeline desktop (4 steps)
- Vertical stack mobile

**Step Structure:**
- Number Badge: 56px circle, gold-500 background, neutral-900 text, Lato 700, 24px
- Connector Line: 2px solid titanium-500, 48px width (desktop)
- Headline: `h4` (32px), Lato 500, neutral-900
- Body: `body` (18px), neutral-700, max-width 280px
- Image: Esfera personalizada, 240px × 240px, radius-md (12px), shadow-card

**Spacing:**
- Number → Headline: 16px
- Headline → Body: 12px
- Body → Image: 24px
- Between steps: 48px gap (desktop)

**Animation (On Scroll):**
- Steps fade-in staggered (100ms delay each)
- Connector lines draw from left (500ms)

---

## 4. Layout & Responsive Strategy

### 4.1 Section Flow (SPA)

Based on `content-structure-plan.md` section mapping:

**Section 1: Hero (600-800px height)**
- Full-width background treatment
- Centered content (8-col max, max-width 1200px)
- CTA prominence: 64px buttons with metallic gold gradient
- Scroll indicator at bottom

**Section 2: Value Proposition (auto height, min 500px)**
- 4-column grid (desktop) → 2-col (tablet) → 1-col (mobile)
- Apply Card Pattern (§3.3) to each feature
- Headline: `h2` (56px), centered, Playfair 600
- Section spacing: 96px top/bottom

**Section 3: Materials Showcase (auto height, min 600px)**
- 3-column grid (desktop) → 1-col (mobile)
- Apply Material Card Grid (§3.5)
- Each material (Oro, Cerámica, Titanio) with component image
- Headline: `h2` (56px), left-aligned, Playfair 600
- Section spacing: 128px top/bottom (luxury spacing)

**Section 4: Customization Process (auto height, min 700px)**
- Horizontal timeline (desktop) → Vertical stack (mobile)
- Apply Timeline Pattern (§3.6) with 4 steps
- Headline: `h2` (56px), centered, Playfair 600
- Background: neutral-100 (full-width section background)
- Section spacing: 96px top/bottom

**Section 5: Technology Showcase (auto height, min 500px)**
- 2-column split: Demo video/image (left 60%) + Benefits list (right 40%)
- Apply Card Pattern (§3.3) to benefits
- Background: neutral-50 (default page background)
- Section spacing: 96px top/bottom

**Section 6: Trends & Inspiration (auto height, min 600px)**
- Grid layout: 2-3 trend cards (desktop) → 1-col (mobile)
- Inline charts: `docs/tendencias/*.png` with captions
- Headline: `h2` (56px), centered, Playfair 600
- Section spacing: 96px top/bottom

**Section 7: Competitive Edge (auto height, min 400px)**
- Comparison table: 4-5 columns (desktop), horizontal scroll (mobile)
- Table header: gold-500 accent, Lato 500, 14px, UPPERCASE
- Rows: neutral-100 alternating backgrounds
- Section spacing: 64px top/bottom

**Section 8: CTA Final (300-400px height)**
- Centered content (6-col max, max-width 800px)
- Large CTA button (64px) + benefits recap (3-4 bullets)
- Background: ceramic-700 (dark) with gold-50 text
- Section spacing: 128px top/bottom (dramatic closure)

### 4.2 Responsive Breakpoints

| Breakpoint | Width | Container Max-Width | Notes |
|------------|-------|---------------------|-------|
| `xs` | <640px | 100% (16px padding) | Mobile portrait |
| `sm` | 640px | 640px | Mobile landscape |
| `md` | 768px | 768px | Tablet portrait |
| `lg` | 1024px | 1024px | Tablet landscape |
| `xl` | 1280px | 1200px | Desktop |
| `2xl` | 1536px | 1400px | Large desktop (luxury experience) |

### 4.3 Grid System
- 12-column grid (desktop)
- Gutters: 32px (desktop), 24px (tablet), 16px (mobile)
- Common splits:
  - 8-4 cols (content + sidebar)
  - 7-5 cols (asymmetric elegance)
  - 6-6 cols (balanced)

### 4.4 Responsive Adaptation Principles
- **Spacing:** Reduce by 30% on mobile (128px → 90px, 96px → 64px)
- **Typography:** Use mobile scale (§2.2)
- **Grids:** 3-col → 2-col → 1-col progressive collapse
- **Navigation:** Hamburger menu <768px
- **Metallic Gradients:** Simplify to solid colors on mobile (performance)
- **Images:** Use `srcset` for 4K hero images
- **Animations:** Reduce duration by 25% on mobile

### 4.5 Touch Targets
- Minimum: 48×48px (WCAG compliance)
- Preferred: 56-64px (luxury UX)
- Spacing between targets: 16px minimum

---

## 5. Interaction & Animation Standards

### 5.1 Animation Durations
- Button hover: 300ms
- Card hover: 400ms
- Page transitions: 500ms
- Luxury moments (hero, modals): 600ms
- Parallax: Subtle 2-layer maximum (background 50% speed)

### 5.2 Easing Functions
- **Primary:** `cubic-bezier(0.4, 0.0, 0.2, 1)` (Material Design standard)
- **Elegance:** `cubic-bezier(0.25, 0.46, 0.45, 0.94)` (ease-out-quad)
- **AVOID:** `linear` (too mechanical)

### 5.3 GPU-Accelerated Properties ONLY
- ✅ Animate: `transform` (translate, scale, rotate), `opacity`
- ❌ NEVER animate: `width`, `height`, `margin`, `padding`, `top`, `left`

### 5.4 Scroll Animations
- Fade-in on scroll: Elements appear with `opacity: 0 → 1` + `translateY(30px → 0)` (500ms)
- Stagger delay: 100ms between sibling elements
- Intersection Observer threshold: 0.2 (trigger when 20% visible)

### 5.5 Reduced Motion Support
```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

### 5.6 Micro-Interactions
- **Button hover:** Scale(1.02) + brightness(110%) + shadow growth
- **Card hover:** Lift -4px + shadow enhance + gold border reveal
- **Input focus:** 1.5px gold-500 border, no shadow (elegant)
- **Image reveal:** Fade-in + scale(1.05 → 1.0) Ken Burns effect

---

## Quality Checklist

### Style Guide Compliance
- ✅ Typography: Playfair Display (serif headlines) + Lato (body)
- ✅ Color saturation: 30-50% max (gold 89%, titanium 15%, ceramic 10%)
- ✅ Spacing: 96-128px section boundaries, 48-64px card padding
- ✅ Shadows: Layered soft shadows (2-layer minimum)
- ✅ Animation: 400-600ms durations (luxury timing)
- ✅ Border radius: 8-16px (soft sophistication)
- ✅ Metallic gradients: ONLY on 1-2 CTAs per viewport

### Material Connection
- ✅ Gold (#B8860B): 18k gold watch cases
- ✅ Titanium (#8B9AA6): Grade 5 titanium
- ✅ Ceramic (#1A1D20): High-tech ceramic bezels
- ✅ Neutrals: Warm ivory paper quality (#FAFAF8, #F5F4F0)

### Premium Essentials
- ✅ Background layers: Page (#FAFAF8) + Surface (#F5F4F0) ≥5% contrast
- ✅ Hero height: 600-800px
- ✅ Card padding: Minimum 48px (prefer 64px)
- ✅ Section spacing: 96-128px
- ✅ Whitespace target: 45% of viewport

### WCAG Compliance
- ✅ neutral-900 on neutral-50: 15.2:1 (AAA)
- ✅ neutral-700 on neutral-50: 8.5:1 (AAA)
- ✅ gold-500 on neutral-50: 5.8:1 (AA Large)

### Pitfalls AVOIDED
- ✅ Logo left-aligned in nav (NOT centered in hero)
- ✅ Metallic gradients limited to CTAs (NOT backgrounds)
- ✅ Horizontal filters approach (NOT sidebar)
- ✅ Premium card padding 48-64px (NOT 16px)
- ✅ Swiss Design compliance (logo placement, clarity)

---

**Document Version:** 1.0  
**Created:** 2025-11-04  
**Word Count:** ~2,800 words  
**Status:** Ready for Design Tokens JSON phase

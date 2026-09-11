---
name: Botanical Romance
colors:
  surface: '#fff8f7'
  surface-dim: '#e6d7d5'
  surface-bright: '#fff8f7'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#fff0ef'
  surface-container: '#faeae9'
  surface-container-high: '#f5e5e3'
  surface-container-highest: '#efdfdd'
  on-surface: '#221a19'
  on-surface-variant: '#544341'
  inverse-surface: '#372e2d'
  inverse-on-surface: '#fdedeb'
  outline: '#877270'
  outline-variant: '#dac1bf'
  surface-tint: '#954742'
  primary: '#2a0002'
  on-primary: '#ffffff'
  primary-container: '#4a0e0e'
  on-primary-container: '#cc726d'
  inverse-primary: '#ffb3ad'
  secondary: '#745b0f'
  on-secondary: '#ffffff'
  secondary-container: '#ffdc85'
  on-secondary-container: '#795f14'
  tertiary: '#001021'
  on-tertiary: '#ffffff'
  tertiary-container: '#002643'
  on-tertiary-container: '#708eb0'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffdad7'
  primary-fixed-dim: '#ffb3ad'
  on-primary-fixed: '#3d0506'
  on-primary-fixed-variant: '#77302d'
  secondary-fixed: '#ffdf92'
  secondary-fixed-dim: '#e4c36e'
  on-secondary-fixed: '#241a00'
  on-secondary-fixed-variant: '#594400'
  tertiary-fixed: '#d0e4ff'
  tertiary-fixed-dim: '#abc9ee'
  on-tertiary-fixed: '#001d35'
  on-tertiary-fixed-variant: '#2a4968'
  background: '#fff8f7'
  on-background: '#221a19'
  surface-variant: '#efdfdd'
typography:
  display-lg:
    fontFamily: Playfair Display
    fontSize: 48px
    fontWeight: '700'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Playfair Display
    fontSize: 36px
    fontWeight: '700'
    lineHeight: '1.2'
  headline-md:
    fontFamily: Playfair Display
    fontSize: 32px
    fontWeight: '600'
    lineHeight: '1.3'
  headline-sm:
    fontFamily: Playfair Display
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.4'
  body-lg:
    fontFamily: Montserrat
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Montserrat
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  label-caps:
    fontFamily: Montserrat
    fontSize: 12px
    fontWeight: '600'
    lineHeight: '1.0'
    letterSpacing: 0.1em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  unit: 8px
  container-max: 1200px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 40px
  section-padding: 80px
---

## Brand & Style

The design system is centered on a **Sophisticated Romantic** aesthetic, blending the timeless elegance of a high-end floral boutique with a modern, editorial sensibility. The target audience seeks luxury, emotional connection, and an artisanal "boutique" experience when gifting.

The visual style utilizes **Editorial Minimalism** with **Skeuomorphic Accents**. Layouts should feel breathable and intentional, reminiscent of a luxury fashion magazine. To honor the brand's identity, subtle vector butterfly motifs are used as floating, low-opacity background elements (opacity 5-10%) to create depth without cluttering the interface. Gold accents are used sparingly to signify premium quality, while the deep burgundy provides a grounded, passionate foundation.

## Colors

The palette is anchored by **Deep Burgundy**, used for primary actions and high-level branding to evoke passion and luxury. **Gold** serves as a sophisticated secondary tone, reserved for highlights, borders, and interactive states to indicate "boutique" quality.

The background uses a warm **Cream/Off-white** rather than pure white to maintain a soft, organic feel. Text is rendered in **Dark Charcoal** to ensure high readability while appearing softer and more integrated than pure black. Use the "Soft Gold" variant for subtle dividers and "Neutral Muted" for secondary surface areas like input backgrounds.

## Typography

This design system employs a classic high-contrast pairing. **Playfair Display** provides the editorial authority for all headings, utilizing its high-contrast strokes to convey elegance. For body copy, **Montserrat** offers a clean, geometric counterpoint that ensures clarity in product descriptions and functional UI elements.

- **Headlines:** Should use generous line heights and tight letter-spacing for large sizes.
- **Body:** Montserrat should be set with slightly increased line spacing (1.6) to enhance the "airy" boutique feel.
- **Labels:** Use `label-caps` for category tags, overlines, and small metadata to add a structured, professional touch.

## Layout & Spacing

The layout follows a **Fixed Grid** philosophy on desktop to maintain the "framed" look of a boutique gallery, centered within a 1200px container. 

- **Desktop:** 12-column grid with 24px gutters. Use large vertical margins (`section-padding`) between content blocks to emphasize the premium nature of the brand.
- **Mobile:** 4-column grid with 16px gutters.
- **Rhythm:** All spacing (padding, margins) must be multiples of the 8px base unit. Product grids should utilize "masonry" or staggered heights occasionally to mimic a natural floral arrangement.

## Elevation & Depth

Hierarchy is established through **Tonal Layering** and **Soft Ambient Shadows**. 

1.  **Base Layer:** The Cream (#FFFBF5) background.
2.  **Surface Layer:** Product cards and modals use a pure white surface with a very soft, diffused shadow (15% opacity Burgundy-tinted grey) to create a "lifted" paper effect.
3.  **Accents:** Buttons and active elements use **Gold** outlines or solid fills to draw the eye.
4.  **Butterfly Elements:** These are placed at the lowest Z-index above the background, treated with a slight Gaussian blur to suggest depth of field.

## Shapes

The design system uses **Soft** geometry. Sharp corners are avoided to maintain the romantic feel, but excessive rounding is also avoided to keep the brand feeling "High-End" rather than "Playful." 

- **Standard Elements:** 4px (0.25rem) corner radius for buttons and input fields.
- **Featured Elements:** Product images may use 8px (0.5rem) radius to soften the visual impact of the photography.
- **Interactive States:** Use thin 1px gold borders for hover states on cards and buttons.

## Components

### Navigation & Footer
- **Top Bar:** Fixed position, transparent background that transitions to semi-opaque Cream on scroll. The logo is centered; the cart icon and user profile are tucked to the right using the Gold secondary color.
- **Footer:** Deep Burgundy background with Cream text. The slogan "Flowers For You LLC..." should be centered in `body-md`, styled with italicized Playfair Display for emphasis.

### Buttons & Inputs
- **Primary CTA:** Solid Deep Burgundy fill, white Montserrat text, 1px Gold border. On hover, the Gold border thickens slightly.
- **Secondary/Ghost:** 1px Gold border with Deep Burgundy text.
- **Text Fields:** Minimalist design—bottom border only (Gold) or light cream fill with 4px radius.

### Product Cards
- **Visuals:** High-quality floral photography with 8px radius.
- **Content:** Product name in `headline-sm`, price in `body-lg` (Gold color), and a small "Add to Cart" button.
- **Interaction:** On hover, the card should lift slightly with a shadow and show a subtle butterfly icon near the price.

### Section Headers
- **Layout:** Centered `headline-md` in Deep Burgundy.
- **Sub-captions:** `label-caps` in Gold, placed above the main header as a "kicker" or category label.
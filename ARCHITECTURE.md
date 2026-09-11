# Arquitectura Técnica - Floristería Fullstack

## 3. Sistema de Diseño: Magenta Flora Modern
Basado en una estética de "lujo editorial" y boutique moderna.

### Paleta de Colores
- **Primario:** `#D81B60` (Magenta Vibrante) - Para acciones y branding.
- **Superficie:** `#F9F9F9` (Gris Ultra Claro) - Para fondos limpios.
- **Texto:** `#1A1C1C` (Carbono) - Máxima legibilidad.
- **Acento Neutral:** `#FDF2F7` (Rosa Lavado) - Para capas sutiles.

### Tipografía
- **Headings:** `Manrope` (Geométrico y profesional).
- **Body:** `Plus Jakarta Sans` (Suave y legible).

### Identidad Visual
- **Bordes:** Redondeado estándar de `0.5rem` (8px).
- **Elevación:** Sombras suaves y difusas (`0px 4px 20px rgba(0,0,0,0.04)`).
- **Espaciado:** Basado en una escala de `8px`.


### Tabla: `Product` (Arreglos Florales)
| Campo | Tipo | Descripción |
| :--- | :--- | :--- |
| `id` | UUID | Identificador único. |
| `name` | String | Nombre del arreglo (ej: "Ramo de Rosas Rojas"). |
| `slug` | String | URL amigable (SEO). |
| `description`| Text | Descripción detallada. |
| `price` | Decimal | Precio actual. |
| `images` | String[] | URLs de imágenes en Cloudinary/S3. |
| `stock` | Int | Cantidad disponible. |
| `categoryId` | UUID | Relación con categorías. |
| `occasionId` | UUID | Relación con ocasiones (San Valentín, Aniversario, etc). |
| `seoTitle` | String | Meta título específico. |
| `seoDesc` | String | Meta descripción específica. |
| `createdAt` | DateTime | Fecha de creación. |

### Tabla: `Post` (Blog)
| Campo | Tipo | Descripción |
| :--- | :--- | :--- |
| `id` | UUID | Identificador único. |
| `title` | String | Título del artículo. |
| `slug` | String | URL amigable. |
| `content` | HTML/Markdown | Contenido del post. |
| `excerpt` | Text | Resumen para listados (SEO). |
| `mainImage` | String | Imagen destacada. |
| `authorId` | UUID | Relación con tabla User. |
| `published` | Boolean | Estado de publicación. |
| `createdAt` | DateTime | Fecha de creación. |

---

## 2. Estructura de Directorios (Next.js App Router)

```text
/flowers
├── app/                    # App Router (SSR/SSG por defecto)
│   ├── (shop)/             # Grupo de rutas para la tienda
│   │   ├── catalog/        # /catalog/[category]
│   │   ├── product/        # /product/[slug] (SSG dinámico)
│   │   ├── cart/           # Página de checkout
│   │   └── page.tsx        # Home Page
│   ├── (cms)/admin         # Panel de administración protegido
│   │   ├── products/       # Gestión de arreglos
│   │   └── blog/           # Gestión de posts
│   ├── api/                # Endpoints de API (Backend logic)
│   └── layout.tsx          # Layout global (Metadata base)
├── components/             # Componentes reutilizables
│   ├── ui/                 # Componentes básicos (Button, Input)
│   ├── shop/               # Componentes específicos de e-commerce
│   │   ├── Cart/           # Carrito interactivo
│   │   └── WhatsAppButton/ # Botón de conversión
│   ├── admin/              # Componentes del CMS
│   └── shared/             # Header, Footer, Menu
├── lib/                    # Utilidades y configuración
│   ├── prisma.ts           # Cliente de DB
│   ├── seo-utils.ts        # Helpers para JSON-LD
│   └── store/              # Estado global (Zustand/Context)
├── types/                  # Definiciones de TypeScript
└── public/                 # Activos estáticos
```

---

## 4. Arquitectura de Navegación y UI

El sitio sigue un patrón de e-commerce moderno con enfoque en conversión.

### Estructura de Navegación Principal (Menu)
1.  **Catálogo:** Acceso a todos los arreglos con filtros por tipo de flor (Rosas, Girasoles, Orquídeas).
2.  **Ocasiones:** Rutas dinámicas optimizadas para búsqueda (ej: `/ocasiones/san-valentin`, `/ocasiones/aniversarios`).
3.  **Blog:** Centro de contenido para marketing de atracción (ej: "Cómo cuidar tus rosas").
4.  **Contacto:** Formulario y acceso directo a WhatsApp/Google Maps.

### Landing Page (Home) - Componentes Clave
-   **Hero Section:** Propuesta de valor clara + Call to Action (CTA) al catálogo.
-   **Featured Categories:** Acceso rápido a las ocasiones más populares.
-   **Best Sellers Grid:** Productos con SSR para carga inmediata.
-   **Trust Signals:** Testimonios, sellos de seguridad y tiempos de entrega.
-   **SEO Footer:** Enlaces a categorías y regiones de entrega para mejorar el interlinking.

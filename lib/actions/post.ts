"use server";

import dbConnect from "@/lib/db";
import { Post, IPost } from "@/lib/models/Post";
import { revalidatePath } from "next/cache";

const SEED_POSTS: Partial<IPost>[] = [
  {
    title: "Guía de Flores en Houston: Los Mejores Arreglos para Aniversario y Amor",
    slug: "guia-flores-aniversario-houston",
    excerpt: "Descubre cómo elegir el arreglo floral perfecto para celebrar aniversarios y ocasiones románticas en Houston, Texas con entrega el mismo día.",
    mainImage: "https://images.unsplash.com/photo-1563241527-3004b7be0ffd?w=1200&auto=format&fit=crop&q=80",
    published: true,
    createdAt: new Date("2026-02-14T10:00:00Z"),
    content: `## Celebrar el Amor con la Elegancia de Bonbon Flowers

En **Bonbon Flowers Houston**, entendemos que cada aniversario y fecha romántica cuenta una historia única. Encontrar el ramo adecuado no se trata solo de elegir flores bonitas, sino de transmitir emociones genuinas que queden grabadas en el corazón de esa persona especial.

### 🌹 Los Arreglos Más Solicitados para Aniversarios

1. **Ramos Buchones de Rosas Rojas:** Un clásico imponente que representa la pasión eterna. Disponibles desde 50 hasta más de 200 rosas premium de tallo largo.
2. **Cajas de Lujo con Rosas & Chocolates:** Presentación sofisticada en cajas redondas o de corazón, combinadas con chocolates finos Ferrero Rocher y toques dorados.
3. **Arreglos Mixtos con Orquídeas y Lirios:** Ideales para quienes buscan un diseño vanguardista, aromático y duradero.

### 🚚 Envíos Express y Entrega el Mismo Día en Houston
Ofrecemos servicio de entrega puntual a domicilio en **Houston, Pearland, Sugar Land, Katy, Cypress y The Woodlands**. Todos nuestros arreglos son confeccionados a mano por floristas expertos minutos antes de su despacho para garantizar frescura absoluta.

> **💡 Consejo de Florista:** Si deseas personalizar tu dedicatoria o añadir globos con helio y peluches gigantes, puedes solicitarlo directamente en nuestra tienda o por WhatsApp.`
  },
  {
    title: "Cómo Cuidar tus Rosas Frescas para que Duren Más Días: Consejos Profesionales",
    slug: "como-cuidar-rosas-frescas-guia",
    excerpt: "Aprende los secretos de los floristas profesionales de Bonbon Flowers para extender la vida y frescura de tus ramos de rosas en casa.",
    mainImage: "https://images.unsplash.com/photo-1518895949257-7621c3c786d7?w=1200&auto=format&fit=crop&q=80",
    published: true,
    createdAt: new Date("2026-02-20T12:00:00Z"),
    content: `## Maximiza la Belleza de tu Ramo Floral

Recibir un arreglo de **Bonbon Flowers** es una experiencia mágica. Para que tus rosas se mantengan firmes, radiantes y fragantes durante más de una semana, sigue estos sencillos cuidados profesionales:

### 1. El Corte en Diagonal es Clave
Antes de colocar las flores en el florero, corta aproximadamente 2 cm del tallo en un ángulo de **45 grados**. Utiliza tijeras afiladas o una navaja limpia. Este corte diagonal permite que los tallos absorban agua con mayor facilidad.

### 2. Agua Limpia y Fresca a Diario
- Cambia el agua del florero cada **24 a 48 horas**.
- Asegúrate de que no queden hojas sumergidas en el agua, ya que aceleran la proliferación de bacterias.

### 3. Ubicación Perfecta
Mantén tu arreglo en un lugar fresco, lejos de la luz solar directa, corrientes de aire acondicionado fuerte o fuentes de calor como electrodomésticos.

### 4. Hidratación en Espuma Floral (Oasis)
Si tu arreglo viene en caja o base con espuma floral, vierte media taza de agua fresca en el centro de la base cada 2 días para mantener la humedad constante.`
  },
  {
    title: "Ramos Buchones y Cajas de Rosas de Lujo: La Gran Tendencia Floral en Texas",
    slug: "ramos-buchones-rosas-lujo-texas",
    excerpt: "Conoce por qué los ramos buchones y las cajas florales personalizadas se han convertido en el regalo favorito en eventos y celebraciones.",
    mainImage: "https://images.unsplash.com/photo-1526047932273-341f2a7631f9?w=1200&auto=format&fit=crop&q=80",
    published: true,
    language: "es",
    createdAt: new Date("2026-03-01T15:00:00Z"),
    content: `## El Arte de Regalar a lo Grande

Los **ramos buchones** han revolucionado la floristería contemporánea en Texas. Su estructura circular perfecta, el volumen imponente de flores seleccionadas y los detalles ornamentales como coronas brillantes, mariposas decorativas y papel coreano satinado los convierten en verdaderas obras de arte.

### ¿Por qué Elegir un Ramo Buchón de Bonbon Flowers?

- **Rosas de Calidad de Exportación:** Cada botón floral es inspeccionado cuidadosamente para garantizar pétalos firmes y apertura uniforme.
- **Presentación Impecable:** Acabados con lazos de seda, perlas y dedicatorias exclusivas.
- **Impacto Visual Inolvidable:** Es el detalle definitivo para cumpleaños, propuestas de matrimonio, graduaciones y celebraciones de quinceañeras.

Descubre nuestra colección completa en nuestro catálogo online o comunícate directamente con nosotros en Houston, TX.`
  },
  {
    title: "Houston Flower Guide: The Best Floral Arrangements for Anniversary & Romance",
    slug: "houston-flower-guide-anniversary-romance",
    excerpt: "Discover how to choose the perfect luxury flower arrangement to celebrate anniversaries and romantic occasions in Houston, Texas with same-day delivery.",
    mainImage: "https://images.unsplash.com/photo-1563241527-3004b7be0ffd?w=1200&auto=format&fit=crop&q=80",
    published: true,
    language: "en",
    createdAt: new Date("2026-02-14T10:00:00Z"),
    content: `## Celebrating Love with Bonbon Flowers Elegance

At **Bonbon Flowers Houston**, we believe every anniversary and romantic date tells an extraordinary story. Selecting the perfect bouquet is not simply about beautiful petals; it is about conveying sincere emotions that remain forever in the heart of that special person.

### 🌹 Most Requested Anniversary Floral Designs

1. **Luxury Red Rose Buchón Bouquets:** An imposing classic symbolizing everlasting passion, available from 50 to 200+ premium long-stem Ecuadorian roses.
2. **Signature Hatboxes with Roses & Fine Chocolates:** Sophisticated presentation in round or heart-shaped boxes, paired with decadent Ferrero Rocher chocolates.
3. **Exotic Mixed Centerpieces with Orchids & Lilies:** Perfect for modern, aromatic, and long-lasting floral statements.

### 🚚 Express Delivery Across the Houston Metropolitan Area
We provide prompt same-day flower delivery across **Houston, Pearland, Sugar Land, Katy, Cypress, and The Woodlands**. Every arrangement is handcrafted by expert florists minutes before dispatch to ensure peak freshness.

> **💡 Florist Tip:** You can customize your silk ribbon with personalized inscriptions, helium balloons, or giant teddy bears directly on our website or via WhatsApp.`
  },
  {
    title: "How to Care for Fresh Roses: Professional Tips for Long-Lasting Beauty",
    slug: "how-to-care-for-fresh-roses-pro-guide",
    excerpt: "Learn the secrets of Bonbon Flowers professional florists to extend the life, fragrance, and vibrant color of your fresh cut roses at home.",
    mainImage: "https://images.unsplash.com/photo-1518895949257-7621c3c786d7?w=1200&auto=format&fit=crop&q=80",
    published: true,
    language: "en",
    createdAt: new Date("2026-02-20T12:00:00Z"),
    content: `## Maximize the Beauty of Your Floral Bouquet

Receiving a bouquet from **Bonbon Flowers Houston** is an unforgettable sensory experience. To keep your luxury roses firm, radiant, and fragrant for over a week, follow these professional florist guidelines:

### 1. The 45-Degree Diagonal Stem Cut
Before placing your flowers into a vase, trim approximately 1 inch off the stems at a **45-degree angle** using sharp garden shears or a clean knife. This diagonal cut maximizes water uptake.

### 2. Clean, Fresh Cold Water Daily
- Refresh the vase water every **24 to 48 hours**.
- Ensure no leaves remain submerged underwater, as decaying foliage accelerates bacterial growth.

### 3. The Ideal Display Location
Keep your arrangement in a cool spot away from direct sunlight, heating vents, or drafty air conditioners.

### 4. Hydrating Floral Foam (Oasis Boxes)
If your bouquet arrives in a luxury hatbox with floral foam, gently pour half a cup of cold water into the center of the base every 2 days to maintain optimal moisture.`
  }
];

export async function getPosts(options?: { publishedOnly?: boolean; limit?: number; language?: string }) {
  try {
    await dbConnect();
    const query: any = {};
    if (options?.publishedOnly) {
      query.published = true;
    }

    if (options?.language) {
      if (options.language === 'en') {
        query.language = 'en';
      } else {
        query.$or = [{ language: 'es' }, { language: { $exists: false } }, { language: null }];
      }
    }

    const limit = options?.limit || 50;
    let posts = await Post.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    if (!posts || posts.length === 0) {
      // Si la colección está vacía o faltan en el idioma, aseguramos los posts semilla
      try {
        await Post.insertMany(SEED_POSTS);
        posts = await Post.find(query).sort({ createdAt: -1 }).limit(limit).lean();
      } catch (seedErr) {
        posts = SEED_POSTS.filter((p: any) => !options?.language || p.language === options.language) as any;
      }
    }

    return { success: true, data: JSON.parse(JSON.stringify(posts || SEED_POSTS)) };
  } catch (error) {
    console.warn("Aviso de BD en getPosts, usando posts semilla:", error);
    const fallback = SEED_POSTS.filter((p: any) => !options?.language || p.language === options.language);
    return { success: true, data: JSON.parse(JSON.stringify(fallback)) };
  }
}

export async function getPostBySlug(slug: string) {
  try {
    await dbConnect();
    let post = await Post.findOne({ slug }).lean();
    if (!post) {
      const fallback = SEED_POSTS.find((p) => p.slug === slug);
      if (fallback) {
        return { success: true, data: JSON.parse(JSON.stringify(fallback)) };
      }
      return { success: false, error: "Post no encontrado" };
    }
    return { success: true, data: JSON.parse(JSON.stringify(post)) };
  } catch (error) {
    console.warn("Aviso de BD en getPostBySlug, usando fallback:", error);
    const fallback = SEED_POSTS.find((p) => p.slug === slug);
    if (fallback) {
      return { success: true, data: JSON.parse(JSON.stringify(fallback)) };
    }
    return { success: false, error: "Error al buscar post" };
  }
}

export async function createPost(data: any) {
  await dbConnect();
  try {
    // Generar slug si no viene
    const slug = (data.slug || data.title || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    const newPost = await Post.create({
      title: data.title,
      slug: slug || `post-${Date.now()}`,
      content: data.content,
      excerpt: data.excerpt || (data.content ? data.content.slice(0, 160) : ""),
      mainImage: data.mainImage || "https://images.unsplash.com/photo-1563241527-3004b7be0ffd?w=1200&auto=format&fit=crop&q=80",
      published: data.published !== false,
      language: data.language || 'es',
      translationOf: data.translationOf || "",
      createdAt: data.createdAt ? new Date(data.createdAt) : new Date(),
    });

    revalidatePath("/nosotros");
    revalidatePath("/en/nosotros");
    revalidatePath("/admin/blog");
    return { success: true, data: JSON.parse(JSON.stringify(newPost)) };
  } catch (error: any) {
    console.error("Error al crear post:", error);
    return { success: false, error: error.message || "Error al crear el post" };
  }
}

export async function updatePost(id: string, data: any) {
  await dbConnect();
  try {
    if (data.title && !data.slug) {
      data.slug = data.title
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
    }

    const updated = await Post.findByIdAndUpdate(id, data, { new: true });
    revalidatePath("/nosotros");
    revalidatePath("/en/nosotros");
    revalidatePath("/admin/blog");
    return { success: true, data: JSON.parse(JSON.stringify(updated)) };
  } catch (error: any) {
    console.error("Error al actualizar post:", error);
    return { success: false, error: error.message || "Error al actualizar post" };
  }
}

export async function deletePost(id: string) {
  await dbConnect();
  try {
    await Post.findByIdAndDelete(id);
    revalidatePath("/nosotros");
    revalidatePath("/en/nosotros");
    revalidatePath("/admin/blog");
    return { success: true };
  } catch (error: any) {
    console.error("Error al eliminar post:", error);
    return { success: false, error: error.message || "Error al eliminar post" };
  }
}

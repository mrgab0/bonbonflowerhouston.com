"use server";

import dbConnect from "@/lib/db";
import { Post, IPost } from "@/lib/models/Post";
import { revalidatePath } from "next/cache";

const SEED_POSTS: Partial<IPost>[] = [
  {
    title: "Guía de Flores en Houston: Los Mejores Arreglos para Aniversario y Amor",
    slug: "guia-flores-aniversario-houston",
    excerpt: "Descubre cómo elegir el arreglo floral perfecto para celebrar aniversarios y ocasiones románticas en Houston y Pasadena, Texas con entrega el mismo día.",
    mainImage: "https://images.unsplash.com/photo-1563241527-3004b7be0ffd?w=1200&auto=format&fit=crop&q=80",
    published: true,
    createdAt: new Date("2026-02-14T10:00:00Z"),
    content: `## Celebrar el Amor con la Elegancia de Gabriela's Flowers

En **Gabriela's Flowers LLC**, entendemos que cada aniversario y fecha romántica cuenta una historia única. Encontrar el ramo adecuado no se trata solo de elegir flores bonitas, sino de transmitir emociones genuinas que queden grabadas en el corazón de esa persona especial.

### 🌹 Los Arreglos Más Solicitados para Aniversarios

1. **Ramos Buchones de Rosas Rojas:** Un clásico imponente que representa la pasión eterna. Disponibles desde 50 hasta más de 200 rosas premium de tallo largo.
2. **Cajas de Lujo con Rosas & Chocolates:** Presentación sofisticada en cajas redondas o de corazón, combinadas con chocolates finos Ferrero Rocher y toques dorados.
3. **Arreglos Mixtos con Orquídeas y Lirios:** Ideales para quienes buscan un diseño vanguardista, aromático y duradero.

### 🚚 Envíos Express y Entrega el Mismo Día en Houston
Ofrecemos servicio de entrega puntual a domicilio en **Houston, Pasadena, Pearland, Sugar Land, Katy y The Woodlands**. Todos nuestros arreglos son confeccionados a mano por floristas expertos minutos antes de su despacho para garantizar frescura absoluta.

> **💡 Consejo de Florista:** Si deseas personalizar tu dedicatoria o añadir globos con helio y peluches gigantes, puedes solicitarlo directamente en nuestra tienda o por WhatsApp.`
  },
  {
    title: "Cómo Cuidar tus Rosas Frescas para que Duren Más Días: Consejos Profesionales",
    slug: "como-cuidar-rosas-frescas-guia",
    excerpt: "Aprende los secretos de los floristas profesionales de Gabriela's Flowers para extender la vida y frescura de tus ramos de rosas en casa.",
    mainImage: "https://images.unsplash.com/photo-1518895949257-7621c3c786d7?w=1200&auto=format&fit=crop&q=80",
    published: true,
    createdAt: new Date("2026-02-20T12:00:00Z"),
    content: `## Maximiza la Belleza de tu Ramo Floral

Recibir un arreglo de **Gabriela's Flowers** es una experiencia mágica. Para que tus rosas se mantengan firmes, radiantes y fragantes durante más de una semana, sigue estos sencillos cuidados profesionales:

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
    createdAt: new Date("2026-03-01T15:00:00Z"),
    content: `## El Arte de Regalar a lo Grande

Los **ramos buchones** han revolucionado la floristería contemporánea en Texas. Su estructura circular perfecta, el volumen imponente de flores seleccionadas y los detalles ornamentales como coronas brillantes, mariposas decorativas y papel coreano satinado los convierten en verdaderas obras de arte.

### ¿Por qué Elegir un Ramo Buchón de Gabriela's Flowers?

- **Rosas de Calidad de Exportación:** Cada botón floral es inspeccionado cuidadosamente para garantizar pétalos firmes y apertura uniforme.
- **Presentación Impecable:** Acabados con lazos de seda, perlas y dedicatorias exclusivas.
- **Impacto Visual Inolvidable:** Es el detalle definitivo para cumpleaños, propuestas de matrimonio, graduaciones y celebraciones de quinceañeras.

Descubre nuestra colección completa en nuestro catálogo online o visítanos en nuestra boutique floral en Pasadena, TX.`
  }
];

export async function getPosts(options?: { publishedOnly?: boolean; limit?: number }) {
  try {
    await dbConnect();
    const query: any = {};
    if (options?.publishedOnly) {
      query.published = true;
    }

    const limit = options?.limit || 50;
    let posts = await Post.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    if (!posts || posts.length === 0) {
      // Si la colección está vacía en BD, insertamos automáticamente los posts semilla
      try {
        await Post.insertMany(SEED_POSTS);
        posts = await Post.find(query).sort({ createdAt: -1 }).limit(limit).lean();
      } catch (seedErr) {
        posts = SEED_POSTS as any;
      }
    }

    return { success: true, data: JSON.parse(JSON.stringify(posts || SEED_POSTS)) };
  } catch (error) {
    console.warn("Aviso de BD en getPosts, usando posts semilla:", error);
    return { success: true, data: JSON.parse(JSON.stringify(SEED_POSTS)) };
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
      createdAt: data.createdAt ? new Date(data.createdAt) : new Date(),
    });

    revalidatePath("/nosotros");
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
    revalidatePath("/admin/blog");
    return { success: true };
  } catch (error: any) {
    console.error("Error al eliminar post:", error);
    return { success: false, error: error.message || "Error al eliminar post" };
  }
}

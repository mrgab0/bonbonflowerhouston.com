import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { getSiteConfig } from '@/lib/actions/siteConfig';
import { Product } from '@/lib/models/Product';

export const runtime = 'nodejs';

const CURATED_FLORAL_IMAGES = [
  { url: "https://images.unsplash.com/photo-1563241527-3004b7be0ffd?w=1200&auto=format&fit=crop&q=80", alt: "Ramo de rosas rosadas y arreglos de lujo en Houston" },
  { url: "https://images.unsplash.com/photo-1518895949257-7621c3c786d7?w=1200&auto=format&fit=crop&q=80", alt: "Caja floral hatbox exclusiva con rosas de exportación" },
  { url: "https://images.unsplash.com/photo-1526047932273-341f2a7631f9?w=1200&auto=format&fit=crop&q=80", alt: "Rosas rojas aterciopeladas para aniversarios y romance" },
  { url: "https://images.unsplash.com/photo-1561181286-d3fee7d55364?w=1200&auto=format&fit=crop&q=80", alt: "Arreglo en tonos pasteles y flores frescas de temporada" },
  { url: "https://images.unsplash.com/photo-1582794543139-8ac9cb0f7b11?w=1200&auto=format&fit=crop&q=80", alt: "Ramo buchón monumental con envoltura coreana de lujo" },
  { url: "https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=1200&auto=format&fit=crop&q=80", alt: "Diseño floral primaveral con orquídeas y flores exóticas" },
  { url: "https://images.unsplash.com/photo-1508610048659-a06b669e3321?w=1200&auto=format&fit=crop&q=80", alt: "Flores finas seleccionadas a mano en boutique de Houston" }
];

export async function POST(req: Request) {
  try {
    const { topic, keywords = '', language = 'es' } = await req.json();

    if (!topic || typeof topic !== 'string' || topic.trim().length === 0) {
      return NextResponse.json({ 
        error: "Por favor ingresa un tema o idea para el post." 
      }, { status: 400 });
    }

    await dbConnect();
    const [{ data: siteConfig }, storeProducts] = await Promise.all([
      getSiteConfig(),
      Product.find({ isActive: { $ne: false } }).select('name slug images').limit(8).lean()
    ]);

    const apiKey = (
      siteConfig?.geminiApiKey ||
      process.env.GEMINI_API_KEY ||
      process.env.GOOGLE_API_KEY ||
      process.env.GOOGLE_GENERATIVE_AI_API_KEY
    )?.trim();

    if (!apiKey) {
      return NextResponse.json({
        error: "No se encontró la clave de Google Gemini. Puedes ingresarla directamente en el panel de Administración en /admin/configuracion (pestaña Chatbot / IA) o como variable GEMINI_API_KEY en Vercel."
      }, { status: 400 });
    }

    const isEn = language === 'en';

    // Construir galería con imágenes editoriales de alta calidad y fotos de productos reales
    const availableImages: Array<{ url: string; alt: string }> = [...CURATED_FLORAL_IMAGES];
    if (storeProducts && Array.isArray(storeProducts)) {
      storeProducts.forEach((p: any) => {
        if (p.images && p.images.length > 0 && p.images[0]) {
          availableImages.push({
            url: p.images[0],
            alt: `${p.name} - Bonbon Flowers Houston`
          });
        }
      });
    }

    const shuffled = [...availableImages].sort(() => 0.5 - Math.random());
    const coverImage = shuffled[0]?.url || CURATED_FLORAL_IMAGES[0].url;
    const contentImg1 = shuffled[1] || CURATED_FLORAL_IMAGES[1];
    const contentImg2 = shuffled[2] || CURATED_FLORAL_IMAGES[2];
    const contentImg3 = shuffled[3] || CURATED_FLORAL_IMAGES[3];

    const systemPrompt = `Eres el redactor jefe y especialista en SEO de contenidos para "Bonbon Flowers Houston", una prestigiosa boutique floral de lujo ubicada en Houston, Texas (bonbonflowershouston.com).
Tu objetivo es generar artículos de blog cautivadores, elegantes, informativos y altamente optimizados para los algoritmos de búsqueda de Google (SEO local en Houston y SEO floral e-commerce).

Información del negocio para incluir naturalmente en el post:
- Nombre: Bonbon Flowers Houston
- Especialidad: Rosas de lujo, ramos buchones, cajas florales premium, orquídeas, arreglos de aniversario, cumpleaños y fechas románticas.
- Cobertura de Entrega: Houston, Pearland, Sugar Land, Katy, The Woodlands y áreas metropolitanas de Texas.
- Servicios: Entrega el mismo día, flores frescas garantizadas, complementos como chocolates finos, globos y dedicatorias de lujo.

Instrucciones estrictas de estructura y formateo tipográfico:
1. Longitud ideal: Entre 600 y 900 palabras.
2. SUBTÍTULOS OBLIGATORIOS (H2 y H3): Cada nueva sección DEBE comenzar estrictamente con '## ' (ejemplo: '## ¿Cuál es la rosa que se utiliza en la medicina?', '## Principales beneficios medicinales de la rosa'). NUNCA dejes subtítulos o títulos como texto normal sin '## '.
3. MAQUETACIÓN CON IMÁGENES: En el campo "content", DEBES insertar de 2 a 3 imágenes ilustrativas usando Markdown ![Texto descriptivo](URL), ubicándolas estratégicamente entre las secciones del texto:
   - Imagen 1 (en la primera sección o junto a las variedades principales): ![${contentImg1.alt}](${contentImg1.url})
   - Imagen 2 (en la sección media de beneficios o estilos): ![${contentImg2.alt}](${contentImg2.url})
   - Imagen 3 (antes de la conclusión y llamado a la acción): ![${contentImg3.alt}](${contentImg3.url})
4. FORMATO DE PUNTOS Y VARIEDADES:
   - Cuando enumeres variedades o puntos clave (1., 2., 3.): resalta el nombre en negrita y cursiva al inicio (ejemplo: '1. ***Rosa damascena* (Rosa de Damasco):** Es la reina indiscutible de las aplicaciones terapéuticas...').
   - Cuando uses viñetas con guiones (-): inicia siempre con el concepto en negrita (ejemplo: '- **Poder antioxidante superior:** Neutraliza los radicales libres...').
5. CIERRE CON LLAMADO A LA ACCIÓN: La última sección '## Ordena tu experiencia floral en Houston con Bonbon Flowers' debe invitar a visitar la tienda online bonbonflowershouston.com o escribir a WhatsApp (+1 346 739 2730).
6. Debes responder ÚNICAMENTE con un objeto JSON válido, sin bloques de código markdown adicionales fuera del JSON, con la siguiente estructura exacta:
{
  "title": "Título SEO atractivo, elegante y magnético (máximo 70 caracteres)",
  "slug": "slug-amigable-para-url-en-minusculas-con-guiones",
  "excerpt": "Meta descripción resumida de 140 a 160 caracteres perfecta para Google Search.",
  "content": "Contenido completo del artículo en formato Markdown con subtítulos (## y ###), viñetas enriquecidas con negritas, las imágenes ilustrativas indicadas y un llamado a la acción al final.",
  "tags": ["Tag1", "Tag2", "Tag3"],
  "suggestedImage": "${coverImage}"
}
7. IMPORTANTE: Cierra estrictamente todas las comillas dobles y la llave final del objeto JSON.

Idioma del artículo: ${isEn ? "Inglés (English)" : "Español"}.`;

    const userPrompt = `Genera un post de blog completo y optimizado para SEO sobre el siguiente tema: "${topic.trim()}".
${keywords ? `Palabras clave secundarias a incluir: "${keywords.trim()}".` : ''}`;

    // Modelos oficiales de Google AI Studio con soporte en Free Tier (ordenados por velocidad y estabilidad)
    const modelsToTry = [
      'gemini-flash-latest',
      'gemini-3.5-flash-lite',
      'gemini-3.1-flash-lite',
      'gemini-3.8-flash',
      'gemini-3.6-flash',
      'gemini-2.5-flash-lite',
      'gemini-2.0-flash-lite'
    ];
    let rawAiText = "";
    let lastError: any = null;

    for (const model of modelsToTry) {
      try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
            systemInstruction: {
              parts: [{ text: systemPrompt }]
            },
            generationConfig: {
              temperature: 0.7,
              topP: 0.95,
              maxOutputTokens: 8192,
              responseMimeType: "application/json"
            }
          })
        });

        if (response.ok) {
          const data = await response.json();
          if (data.candidates && data.candidates.length > 0 && data.candidates[0].content?.parts?.length > 0) {
            rawAiText = data.candidates[0].content.parts[0].text;
            break;
          }
        } else {
          const errText = await response.text();
          console.warn(`Generación con modelo ${model} falló:`, errText);
          lastError = errText;
        }
      } catch (err) {
        console.warn(`Error de red al llamar a ${model}:`, err);
        lastError = err;
      }
    }

    if (!rawAiText) {
      return NextResponse.json({ 
        error: "No se pudo generar el post con la IA. Por favor intenta de nuevo en unos momentos." 
      }, { status: 502 });
    }

    // Parseo resiliente de JSON para evitar "Unterminated string" ante cualquier corte imprevisto
    const postData = parseAiJsonSafely(rawAiText, coverImage);

    return NextResponse.json({ success: true, post: postData });

  } catch (error: any) {
    console.error("Error en API de generación de blog:", error);
    return NextResponse.json({ 
      error: error.message || "Error al procesar la solicitud de generación con IA." 
    }, { status: 500 });
  }
}

// Función auxiliar de parseo con auto-reparación
function parseAiJsonSafely(rawText: string, fallbackImage: string) {
  let cleanJson = rawText.trim();
  if (cleanJson.startsWith('```json')) {
    cleanJson = cleanJson.replace(/^```json\s*/, '').replace(/\s*```$/, '');
  } else if (cleanJson.startsWith('```')) {
    cleanJson = cleanJson.replace(/^```\s*/, '').replace(/\s*```$/, '');
  }

  // 1. Intento estándar de parseo
  try {
    return JSON.parse(cleanJson);
  } catch (initialErr) {
    console.warn("Parseo inicial falló, reparando estructura JSON...", initialErr);
  }

  // 2. Intento de reparación de cierres cortados
  try {
    let repaired = cleanJson;
    if (repaired.endsWith('\\')) repaired = repaired.slice(0, -1);

    const quoteMatches = repaired.match(/(?<!\\)"/g) || [];
    if (quoteMatches.length % 2 !== 0) {
      repaired += '"';
    }

    const openBrackets = (repaired.match(/\[/g) || []).length;
    const closeBrackets = (repaired.match(/\]/g) || []).length;
    for (let i = 0; i < openBrackets - closeBrackets; i++) repaired += ']';

    const openBraces = (repaired.match(/\{/g) || []).length;
    const closeBraces = (repaired.match(/\}/g) || []).length;
    for (let i = 0; i < openBraces - closeBraces; i++) repaired += '}';

    return JSON.parse(repaired);
  } catch (repairedErr) {
    console.warn("Parseo reparado falló, intentando extracción con expresiones regulares...", repairedErr);
  }

  // 3. Fallback inteligente: extracción por expresiones regulares
  const titleMatch = cleanJson.match(/"title"\s*:\s*"([^"]+)"/);
  const slugMatch = cleanJson.match(/"slug"\s*:\s*"([^"]+)"/);
  const excerptMatch = cleanJson.match(/"excerpt"\s*:\s*"([^"]+)"/);
  const contentMatch = cleanJson.match(/"content"\s*:\s*"([\s\S]*?)(?:",\s*"(?:tags|suggestedImage)"|"\s*\}|$)/);

  if (titleMatch || contentMatch) {
    const rawContent = contentMatch ? contentMatch[1] : cleanJson;
    const unescapedContent = rawContent
      .replace(/\\n/g, '\n')
      .replace(/\\"/g, '"')
      .replace(/\\t/g, '\t')
      .replace(/\\\\/g, '\\');

    return {
      title: titleMatch ? titleMatch[1] : "Arreglos Florales Exclusivos en Houston",
      slug: slugMatch ? slugMatch[1] : `guia-floral-houston-${Date.now()}`,
      excerpt: excerptMatch ? excerptMatch[1] : "Guía y recomendaciones de flores finas para ocasiones especiales en Houston, Texas.",
      content: unescapedContent,
      tags: ["Flores Houston", "Rosas de Lujo", "Regalos Especiales"],
      suggestedImage: fallbackImage
    };
  }

  throw new Error("No se pudo interpretar el formato del artículo generado por la IA. Por favor intenta generar de nuevo.");
}

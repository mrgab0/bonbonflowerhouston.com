import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { getSiteConfig } from '@/lib/actions/siteConfig';

export const runtime = 'nodejs';

const CURATED_FLORAL_IMAGES = [
  "https://images.unsplash.com/photo-1563241527-3004b7be0ffd?w=1200&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1518895949257-7621c3c786d7?w=1200&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1526047932273-341f2a7631f9?w=1200&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1561181286-d3fee7d55364?w=1200&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1582794543139-8ac9cb0f7b11?w=1200&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=1200&auto=format&fit=crop&q=80"
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
    const { data: siteConfig } = await getSiteConfig();

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
    const randomFallbackImage = CURATED_FLORAL_IMAGES[Math.floor(Math.random() * CURATED_FLORAL_IMAGES.length)];

    const systemPrompt = `Eres el redactor jefe y especialista en SEO de contenidos para "Bonbon Flowers Houston", una prestigiosa boutique floral de lujo ubicada en Houston, Texas (bonbonflowershouston.com).
Tu objetivo es generar artículos de blog cautivadores, elegantes, informativos y altamente optimizados para los algoritmos de búsqueda de Google (SEO local en Houston y SEO floral e-commerce).

Información del negocio para incluir naturalmente en el post:
- Nombre: Bonbon Flowers Houston
- Especialidad: Rosas de lujo, ramos buchones, cajas florales premium, orquídeas, arreglos de aniversario, cumpleaños y fechas románticas.
- Cobertura de Entrega: Houston, Pearland, Sugar Land, Katy, The Woodlands y áreas metropolitanas de Texas.
- Servicios: Entrega el mismo día, flores frescas garantizadas, complementos como chocolates finos, globos y dedicatorias de lujo.

Instrucciones estrictas de formato y longitud:
1. Longitud ideal: Entre 550 y 850 palabras.
2. Debes responder ÚNICAMENTE con un objeto JSON válido, sin bloques de código markdown adicionales fuera del JSON, con la siguiente estructura exacta:
{
  "title": "Título SEO atractivo, elegante y magnético (máximo 70 caracteres)",
  "slug": "slug-amigable-para-url-en-minusculas-con-guiones",
  "excerpt": "Meta descripción resumida de 140 a 160 caracteres perfecta para Google Search.",
  "content": "Contenido completo del artículo en formato Markdown. Debe incluir subtítulos (## y ###), listas con viñetas, consejos de cuidado o selección, y una sección final con llamado a la acción para ordenar flores en la tienda online o vía WhatsApp (+1 346 739 2730).",
  "tags": ["Tag1", "Tag2", "Tag3"],
  "suggestedImage": "${randomFallbackImage}"
}
3. IMPORTANTE: Cierra estrictamente todas las comillas dobles y la llave final del objeto JSON.

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
    const postData = parseAiJsonSafely(rawAiText, randomFallbackImage);

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

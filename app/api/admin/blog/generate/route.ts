import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
    const { topic, keywords = '', language = 'es' } = await req.json();

    if (!topic || typeof topic !== 'string' || topic.trim().length === 0) {
      return NextResponse.json({ 
        error: "Por favor ingresa un tema o idea para el post." 
      }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({
        error: "No se encontró la clave GEMINI_API_KEY en las variables de entorno."
      }, { status: 500 });
    }

    const isEn = language === 'en';

    const systemPrompt = `Eres el redactor jefe y especialista en SEO de contenidos para "Gabriela's Flowers LLC", una prestigiosa boutique floral de lujo ubicada en Houston y Pasadena, Texas.
Tu objetivo es generar artículos de blog cautivadores, elegantes, informativos y altamente optimizados para los algoritmos de búsqueda de Google (SEO local en Houston y SEO floral e-commerce).

Información del negocio para incluir naturalmente en el post:
- Nombre: Gabriela's Flowers LLC
- Especialidad: Rosas de lujo, ramos buchones, cajas florales premium, orquídeas, arreglos de aniversario, cumpleaños y fechas románticas.
- Cobertura de Entrega: Houston, Pasadena, Pearland, Sugar Land, Katy, The Woodlands y áreas metropolitanas de Texas.
- Servicios: Entrega el mismo día, flores frescas garantizadas, complementos como chocolates finos, globos y dedicatorias de lujo.

Instrucciones estrictas de formato:
Debes responder ÚNICAMENTE con un objeto JSON válido, sin bloques de código markdown adicionales fuera del JSON, con la siguiente estructura exacta:
{
  "title": "Título SEO atractivo, elegante y magnético (máximo 70 caracteres)",
  "slug": "slug-amigable-para-url-en-minusculas-con-guiones",
  "excerpt": "Meta descripción resumida de 140 a 160 caracteres perfecta para Google Search.",
  "content": "Contenido completo del artículo en formato Markdown. Debe incluir subtítulos (## y ###), listas con viñetas, consejos de cuidado o selección, y una sección final con llamado a la acción para ordenar flores en la tienda online o vía WhatsApp (+1 832 391-1835).",
  "tags": ["Tag1", "Tag2", "Tag3"],
  "suggestedImage": "https://images.unsplash.com/photo-1563241527-3004b7be0ffd?w=1200&auto=format&fit=crop&q=80"
}

Idioma del artículo: ${isEn ? "Inglés (English)" : "Español"}.`;

    const userPrompt = `Genera un post de blog completo y optimizado para SEO sobre el siguiente tema: "${topic.trim()}".
${keywords ? `Palabras clave secundarias a incluir: "${keywords.trim()}".` : ''}`;

    const modelsToTry = ['gemini-2.5-flash', 'gemini-2.5-flash-lite', 'gemini-flash-latest', 'gemini-3.7-flash'];
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
              maxOutputTokens: 2000,
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

    // Limpiar posibles bloques ```json ... ``` que Gemini pueda devolver
    let cleanJson = rawAiText.trim();
    if (cleanJson.startsWith('```json')) {
      cleanJson = cleanJson.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (cleanJson.startsWith('```')) {
      cleanJson = cleanJson.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }

    const postData = JSON.parse(cleanJson);

    return NextResponse.json({ success: true, post: postData });

  } catch (error: any) {
    console.error("Error en API de generación de blog:", error);
    return NextResponse.json({ 
      error: error.message || "Error al procesar la solicitud de generación con IA." 
    }, { status: 500 });
  }
}

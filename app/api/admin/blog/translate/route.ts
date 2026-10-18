import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { Post } from '@/lib/models/Post';
import { createPost } from '@/lib/actions/post';
import { getSiteConfig } from '@/lib/actions/siteConfig';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
    const { postId, postData, targetLanguage = 'en' } = await req.json();

    await dbConnect();

    let sourcePost: any = null;
    if (postId) {
      sourcePost = await Post.findById(postId).lean();
    }
    if (!sourcePost && postData) {
      sourcePost = postData;
    }

    if (!sourcePost || !sourcePost.title || !sourcePost.content) {
      return NextResponse.json({
        error: "No se proporcionó un artículo válido para traducir."
      }, { status: 400 });
    }

    const { data: siteConfig } = await getSiteConfig();
    const apiKey = (
      siteConfig?.geminiApiKey ||
      process.env.GEMINI_API_KEY ||
      process.env.GOOGLE_API_KEY ||
      process.env.GOOGLE_GENERATIVE_AI_API_KEY
    )?.trim();

    if (!apiKey) {
      return NextResponse.json({
        error: "No se encontró la clave de Google Gemini para traducir. Configúrala en /admin/configuracion."
      }, { status: 400 });
    }

    const isTargetEn = targetLanguage === 'en';
    const systemPrompt = `You are a master bilingual copywriter and luxury floral SEO specialist for "Bonbon Flowers Houston" (bonbonflowershouston.com) in Houston, Texas.
Your job is to translate and elevate the provided blog post into natural, sophisticated ${isTargetEn ? "American English (Texas luxury market)" : "Mexican/Latin American Spanish"}.

Rules:
1. Preserve the luxury, emotional, and boutique tone of Bonbon Flowers Houston.
2. PRESERVE ALL MARKDOWN STRUCTURE:
   - Subheadings (## and ###) must be preserved and translated.
   - Preserved numbered items (1., 2., 3.) and bullet lists (-).
   - PRESERVE EXACT IMAGE URLS in ![alt text](url) markdown tags, but translate the alt text.
   - Mention Houston, TX, Pearland, Sugar Land, Katy, and same-day delivery naturally.
3. Generate a clean URL slug in ${isTargetEn ? "English" : "Spanish"} with lowercase letters and hyphens (e.g., 'the-rose-in-medicine-healing-secrets-and-elegance').
4. The output must be PURE JSON without markdown backticks:
{
  "title": "SEO title in target language (under 70 chars)",
  "slug": "url-friendly-slug-in-target-language",
  "excerpt": "Engaging meta description between 140-160 characters",
  "content": "Full translated markdown content preserving all images, headings, and lists",
  "tags": ["Tag1", "Tag2", "Tag3"]
}`;

    const userPrompt = `Translate this floral boutique blog post into ${isTargetEn ? "English" : "Spanish"}:

TITLE:
${sourcePost.title}

EXCERPT:
${sourcePost.excerpt || ""}

CONTENT:
${sourcePost.content}`;

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
            systemInstruction: { parts: [{ text: systemPrompt }] },
            generationConfig: {
              temperature: 0.3,
              topP: 0.9,
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
          lastError = await response.text();
        }
      } catch (err) {
        lastError = err;
      }
    }

    if (!rawAiText) {
      return NextResponse.json({
        error: `Error al traducir con la IA de Google: ${lastError || "Sin respuesta válida"}`
      }, { status: 502 });
    }

    let parsed: any;
    try {
      let cleaned = rawAiText.trim();
      if (cleaned.startsWith('```json')) cleaned = cleaned.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      else if (cleaned.startsWith('```')) cleaned = cleaned.replace(/^```\s*/, '').replace(/\s*```$/, '');
      parsed = JSON.parse(cleaned);
    } catch (parseErr) {
      return NextResponse.json({
        error: "Error al interpretar la respuesta traducida de la IA.",
        raw: rawAiText
      }, { status: 500 });
    }

    // Guardar el nuevo post traducido
    const createResult = await createPost({
      title: parsed.title,
      slug: parsed.slug,
      excerpt: parsed.excerpt,
      content: parsed.content,
      mainImage: sourcePost.mainImage || "https://images.unsplash.com/photo-1563241527-3004b7be0ffd?w=1200&auto=format&fit=crop&q=80",
      published: true,
      language: targetLanguage,
      translationOf: sourcePost._id ? String(sourcePost._id) : ""
    });

    if (!createResult.success) {
      return NextResponse.json({
        error: createResult.error || "Error al guardar el post traducido en la base de datos."
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      post: createResult.data,
      message: `¡Post traducido al ${isTargetEn ? "Inglés" : "Español"} y publicado con éxito!`
    });
  } catch (error: any) {
    console.error("Error en /api/admin/blog/translate:", error);
    return NextResponse.json({
      error: error.message || "Error interno del servidor al traducir."
    }, { status: 500 });
  }
}

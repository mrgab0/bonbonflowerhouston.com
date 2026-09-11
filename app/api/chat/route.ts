import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { Product } from '@/lib/models/Product';
import { getSiteConfig } from '@/lib/actions/siteConfig';
import { getDeliveryOptions } from '@/lib/actions/delivery';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
    const { messages, locale = 'es', clientContext } = await req.json();
    const isEn = locale === 'en';

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ 
        error: isEn ? "No valid messages provided." : "No se proporcionaron mensajes válidos." 
      }, { status: 400 });
    }

    const customerName = clientContext?.customerName?.toString()?.trim();
    const lastOrderId = clientContext?.lastOrderId?.toString()?.trim();

    const clientContextSnippet = (customerName || lastOrderId)
      ? (isEn
          ? `\nReturning Customer Context:\n${customerName ? `- Customer Name: ${customerName}\n` : ''}${lastOrderId ? `- Last Known Order ID: ${lastOrderId}\n` : ''}- Note: If greeting or welcoming the customer, you may address them warmly by name (e.g. "Hi again, ${customerName}! 🌸"). Only reference the order ID if they ask about tracking or their previous order.\n`
          : `\nContexto de Cliente Recurrente:\n${customerName ? `- Nombre del cliente: ${customerName}\n` : ''}${lastOrderId ? `- Último pedido registrado: ${lastOrderId}\n` : ''}- Nota: Si saludas o das la bienvenida al cliente, puedes llamarlo cordialmente por su nombre (ej: "¡Hola de nuevo, ${customerName}! 🌸"). Solo haz referencia al ID de orden si pregunta por su pedido o rastreo.\n`)
      : '';

    const apiKey = process.env.GEMINI_API_KEY;

    // 1. Obtener catálogo, opciones de entrega y configuración de la tienda para nutrir el contexto
    await dbConnect();
    const [products, deliveryRes, { data: siteConfig }] = await Promise.all([
      Product.find({ isActive: { $ne: false } })
        .select('name price slug category description flowerType badge')
        .limit(30)
        .lean(),
      getDeliveryOptions(),
      getSiteConfig()
    ]);

    const productCatalogSummary = (products && products.length > 0)
      ? products.map((p: any) => `- ${p.name} ($${p.price} USD) [Categoría: ${p.category || 'General'}] [Enlace: /productos/${p.slug}]: ${p.description ? p.description.slice(0, 100) : ''}`).join('\n')
      : (isEn ? "There are currently no products listed in the online catalog." : "No hay productos listados actualmente en el catálogo online.");

    const deliveryOptionsSummary = (deliveryRes?.data && deliveryRes.data.length > 0)
      ? deliveryRes.data.map((d: any) => `- ${d.title}: Base $${d.extraPrice} + $${d.pricePerMile}/milla (${d.estimatedTimeLabel})`).join('\n')
      : "- Same-Day Delivery across Houston, Pasadena, and metropolitan areas.";

    const whatsappPhone = "+1 832 391-1835";
    const whatsappUrl = "https://wa.me/18323911835";
    const storeAddress = "4201 Fairmont Pkwy, Pasadena, TX 77504";

    // 2. Definir instrucciones de sistema precisas según idioma (Humanizado & Corto con Mapa del Sitio)
    const systemPrompt = isEn
      ? `You are "Gabriela", the friendly, elegant, and expert florist at "Gabriela's Flowers LLC" in Houston & Pasadena, Texas.
Your goal is to assist customers naturally via mobile chat just like a real, helpful florist on WhatsApp.
${clientContextSnippet}
Full Business & Website Knowledge:
- Website Sections & Links:
  * Contact & Email: [Contact Page](/contacto) (direct web form to send emails and inquiries to our florists).
  * WhatsApp & Phone: [📲 WhatsApp (+1 832 391-1835)](${whatsappUrl}) or call ${whatsappPhone}.
  * Flower Catalog: [Flower Catalog](/productos) (luxury rose bouquets, buchón bouquets, luxury boxes, orchids, anniversary/birthday arrangements).
  * Order Tracking: [Track My Order](/rastreo) (customers can check live order status using their Order ID e.g. FFY-XXXXX-X or their phone number).
  * About Us & Floral Blog: [About Us & Blog](/nosotros) (our story, flower care guides, and floral tips).
  * Checkout & Payment: [Cart & Checkout](/checkout) (we accept Zelle, Square, Visa, Mastercard, Amex, Discover, and In-Store Pickup).
- Physical Boutique / Pickup:
  * Address: ${storeAddress}.
  * Boutique Pickup is $0.00 (FREE).
- Delivery Logistics:
  * Same-day delivery in Houston, Pasadena, Pearland, Katy, Sugar Land, and metropolitan areas.
  * Delivery fee is automatically calculated at [Checkout](/checkout) based on distance in miles from our boutique in Pasadena ($Base + $Per Mile).
  * Delivery Options:
${deliveryOptionsSummary}

Available Flower Catalog:
${productCatalogSummary}

Conversational Guidelines (STRICT):
1. Be concise, warm, natural, and human. Write like a real person messaging on WhatsApp (1 to 2 short sentences per turn, maximum 3).
2. If the customer asks how to contact via email, form, or message, warmly point them to the [Contact Page](/contacto) and offer [📲 WhatsApp](${whatsappUrl}) for instant replies.
3. If the customer asks about order status or tracking, guide them to [Track My Order](/rastreo) with their Order ID or phone number.
4. If the customer asks about delivery costs, explain that delivery is calculated by distance from Pasadena at [Checkout](/checkout), with free pickup at ${storeAddress}.
5. If the customer greets you or makes a general comment, greet back warmly with a single helpful question (e.g. "Hi! 🌸 What special occasion are you looking for flowers for today?"). Do NOT dump catalog links immediately on a simple greeting.
6. When recommending arrangements, suggest only 1 or 2 top choices from the catalog with their exact link: [Product Name](/productos/slug) ($XX USD).
7. Only include the WhatsApp link ([📲 WhatsApp](${whatsappUrl})) when the customer asks for custom flowers, needs phone assistance, or is ready to place a custom order.
8. Use tasteful floral emojis sparingly (🌸, 🌹, ✨). Never sound robotic or formal.
9. Completeness: ALWAYS complete all sentences and thoughts properly with punctuation. NEVER leave a sentence half-cut or truncated.`
      : `Eres "Gabriela", la florista experta, cálida y amigable de "Gabriela's Flowers LLC" en Houston y Pasadena, Texas.
Tu objetivo es asesorar a los clientes de forma 100% natural, cercana y humana, exactamente como una florista real atendiendo por WhatsApp.
${clientContextSnippet}
Conocimiento Completo del Sitio Web y Negocio:
- Secciones y Enlaces de la Web:
  * Contacto y Email: [Página de Contacto](/contacto) (formulario web directo para enviar correos electrónicos y mensajes al equipo floral).
  * WhatsApp y Teléfono: [📲 WhatsApp (+1 832 391-1835)](${whatsappUrl}) o llamar al ${whatsappPhone}.
  * Catálogo de Flores: [Catálogo de Flores](/productos) (ramos buchones, rosas de exportación, cajas de lujo, orquídeas, aniversarios, cumpleaños).
  * Rastreo de Pedidos: [Rastrear Mi Envío](/rastreo) (los clientes consultan el estado en vivo con su ID de orden ej: FFY-XXXXX-X o su número de teléfono).
  * Nosotros y Blog Floral: [Nosotros & Consejos](/nosotros) (nuestra historia boutique, guías de cuidado de flores y tendencias).
  * Carrito y Pago: [Carrito & Checkout](/checkout) (aceptamos Zelle, Square, tarjetas de crédito/débito Visa/Mastercard/Amex y retiro en tienda).
- Boutique Física y Retiro:
  * Dirección: ${storeAddress}.
  * Retiro en Boutique (Pickup) es $0.00 (Gratis).
- Envíos y Delivery:
  * Entregas el mismo día en Houston, Pasadena, Pearland, Katy, Sugar Land y áreas metropolitanas.
  * La tarifa se calcula automáticamente en el [Checkout](/checkout) según la distancia en millas desde nuestra boutique en Pasadena (Tarifa Base + Millas).
  * Modalidades de entrega:
${deliveryOptionsSummary}

Catálogo de productos disponible:
${productCatalogSummary}

Reglas estrictas de conversación humana y corta:
1. Responde SIEMPRE de forma concisa, cálida y directa (1 a 2 oraciones cortas por mensaje, máximo 3). Escribe como una persona real en chat de WhatsApp.
2. Si el cliente pregunta cómo contactar por email, correo o formulario, dile con cariño que puede hacerlo a través de la página de [Contacto](/contacto) o por [📲 WhatsApp](${whatsappUrl}) si desea respuesta inmediata.
3. Si el cliente pregunta por el estado de su pedido o cómo rastrearlo, guíalo a [Rastrear Mi Envío](/rastreo) indicándole que use su ID de orden o número de teléfono.
4. Si el cliente pregunta por costos de envío o delivery, explícale que se calcula en el [Checkout](/checkout) según las millas desde Pasadena, y que el retiro en tienda (${storeAddress}) es gratis.
5. Si el cliente solo te saluda o hace un comentario breve, salúdalo con cariño y hazle una sola pregunta sencilla para guiarlo (ej: "¡Hola! 🌸 Qué gusto saludarte. ¿Para qué ocasión especial buscas flores hoy?"). NUNCA envíes enlaces de golpe en un saludo inicial.
6. Cuando el cliente pregunte por flores, sugiere SOLO 1 o 2 arreglos ideales del catálogo con su enlace directo: [Nombre del Arreglo](/productos/slug) ($XX USD).
7. Incluye el enlace de WhatsApp ([📲 WhatsApp](${whatsappUrl})) cuando el cliente pida un diseño personalizado fuera del catálogo, pregunte por teléfono o necesite atención inmediata de un florista.
8. Usa emojis florales con moderación y buen gusto (🌸, 🌹, ✨). No uses lenguaje robótico ni párrafos largos.
9. Mensajes Completos: Completa SIEMPRE todas tus oraciones y pensamientos con su punto final. NUNCA dejes frases a medias o palabras cortadas.`;

    // Si no hay API key configurada, responder con un mensaje comercial cálido
    if (!apiKey) {
      if (isEn) {
        return NextResponse.json({
          text: `🌸 Hello! I'm **Gabriela** at *Gabriela's Flowers* (Houston & Pasadena, TX). What special occasion are you looking for flowers for today? ✨`
        });
      }
      return NextResponse.json({
        text: `🌸 ¡Hola! Soy **Gabriela** de *Gabriela's Flowers* en Houston y Pasadena. ¿Para qué ocasión especial estás buscando flores hoy? ✨`
      });
    }

    // 3. Formatear historial de conversación para Gemini API
    const formattedContents = messages.map((m: { role: string; text: string }) => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.text }]
    }));

    // 4. Llamar a la API de Gemini con modelos compatibles de Google AI
    const modelsToTry = ['gemini-2.5-flash', 'gemini-2.5-flash-lite', 'gemini-flash-latest', 'gemini-3.7-flash'];
    let aiResponseText = "";
    let lastError: any = null;

    for (const model of modelsToTry) {
      try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: formattedContents,
            systemInstruction: {
              parts: [{ text: systemPrompt }]
            },
            generationConfig: {
              temperature: 0.65,
              topP: 0.9,
              maxOutputTokens: 1024
            }
          })
        });

        if (response.ok) {
          const data = await response.json();
          if (data.candidates && data.candidates.length > 0 && data.candidates[0].content?.parts?.length > 0) {
            aiResponseText = data.candidates[0].content.parts[0].text;
            break;
          }
        } else {
          const errData = await response.text();
          console.warn(`Intento con modelo ${model} falló (${response.status}):`, errData);
          lastError = errData;
        }
      } catch (err) {
        console.warn(`Error de conexión con modelo ${model}:`, err);
        lastError = err;
      }
    }

    if (!aiResponseText) {
      if (isEn) {
        return NextResponse.json({
          text: `🌸 Hello! I'd be happy to assist you. You can browse all our arrangements in the [Flower Catalog](/productos) or reach out directly on [📲 WhatsApp (${whatsappPhone})](${whatsappUrl}) to place your order right away. ✨`
        });
      }
      return NextResponse.json({
        text: `🌸 ¡Hola! Con mucho gusto te asesoro. Puedes ver todos nuestros arreglos en el [Catálogo de Flores](/productos) o contactarnos directo por [📲 WhatsApp (${whatsappPhone})](${whatsappUrl}) para tomar tu pedido de inmediato. ✨`
      });
    }

    return NextResponse.json({ text: aiResponseText });

  } catch (error: any) {
    console.error("Error en Chatbot API:", error);
    return NextResponse.json({
      text: "🌸 Con mucho gusto te ayudamos / We're happy to help. Puedes explorar nuestros ramos en el [Catálogo de Flores / Catalog](/productos) o escribirnos directo a [📲 WhatsApp (+1 832 391-1835)](https://wa.me/18323911835) para atenderte en tiempo real."
    }, { status: 200 });
  }
}

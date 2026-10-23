import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import { EmailMessage } from "@/lib/models/EmailMessage";
import { getCorporateEmailConfig } from "@/lib/email";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";

/**
 * Helper para extraer correo limpio de un string tipo "Juan Pérez <juan@gmail.com>"
 */
function parseEmailAddress(raw: string): { name: string; email: string } {
  if (!raw) return { name: "", email: "" };
  const match = raw.match(/^(?:"?([^"]*)"?\s)?(?:<?(.+@[^>]+)>?)$/);
  if (match) {
    return {
      name: (match[1] || "").trim(),
      email: (match[2] || "").trim().toLowerCase(),
    };
  }
  return { name: "", email: raw.trim().toLowerCase() };
}

/**
 * POST /api/webhooks/resend
 * Recibe eventos de Resend (incluyendo email.received de correos entrantes)
 * y los almacena directamente en la bandeja de entrada del Webmail (/admin/correos).
 */
export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const payload = await req.json();

    const eventType = payload.type || payload.event || "email.received";
    const data = payload.data || payload;

    // Solo procesamos correos entrantes (inbound)
    if (eventType === "email.received" || eventType === "inbound") {
      const emailId = data.email_id || data.id;
      let fromRaw = data.from || "";
      let toRaw = Array.isArray(data.to) ? data.to : [data.to || "contacto@bonbonflowershouston.com"];
      let subject = data.subject || "Sin Asunto";
      let bodyHtml = data.html || "";
      let bodyText = data.text || "";

      // Si el webhook de Resend solo envió metadatos pero no el cuerpo completo,
      // consultamos la API de Resend para descargar el HTML/texto del correo.
      if (!bodyHtml && !bodyText && emailId) {
        try {
          const config = await getCorporateEmailConfig();
          const apiKey = config.resendApiKey || process.env.RESEND_API_KEY;
          if (apiKey) {
            const res = await fetch(`https://api.resend.com/emails/${emailId}`, {
              headers: { Authorization: `Bearer ${apiKey}` },
            });
            if (res.ok) {
              const fullEmail = await res.json();
              if (fullEmail.html) bodyHtml = fullEmail.html;
              if (fullEmail.text) bodyText = fullEmail.text;
              if (fullEmail.from) fromRaw = fullEmail.from;
              if (fullEmail.to) toRaw = Array.isArray(fullEmail.to) ? fullEmail.to : [fullEmail.to];
              if (fullEmail.subject) subject = fullEmail.subject;
            }
          }
        } catch (fetchErr) {
          console.warn("No se pudo obtener el cuerpo detallado desde Resend API:", fetchErr);
        }
      }

      const { name: senderName, email: senderEmail } = parseEmailAddress(fromRaw);

      // Determinar cuál es el buzón corporativo destinatario
      const primaryRecipient = toRaw[0] || "contacto@bonbonflowershouston.com";
      const { email: mailboxEmail } = parseEmailAddress(primaryRecipient);

      // Si no hay HTML pero hay texto plano, convertir a párrafos limpios
      if (!bodyHtml && bodyText) {
        bodyHtml = bodyText
          .split("\n\n")
          .map((p: string) => `<p>${p.replace(/\n/g, "<br>")}</p>`)
          .join("");
      }

      // Evitar duplicados por resendMessageId
      const existing = emailId ? await EmailMessage.findOne({ resendMessageId: emailId }) : null;

      if (!existing) {
        await EmailMessage.create({
          direction: "inbound",
          type: "incoming_reply",
          from: fromRaw || senderEmail,
          to: toRaw,
          subject: subject,
          bodyText: bodyText,
          bodyHtml: bodyHtml || "<p><em>(Sin contenido de texto)</em></p>",
          status: "received",
          isRead: false,
          mailboxEmail: mailboxEmail || "contacto@bonbonflowershouston.com",
          customerName: senderName || undefined,
          customerEmail: senderEmail || undefined,
          resendMessageId: emailId || undefined,
          createdAt: new Date(),
        });

        try {
          revalidatePath("/admin/correos");
        } catch (e) {}

        return NextResponse.json({
          success: true,
          message: "Correo entrante recibido y almacenado en Webmail.",
        });
      }

      return NextResponse.json({ success: true, message: "Correo ya existente." });
    }

    return NextResponse.json({ success: true, ignored: true, eventType });
  } catch (error: any) {
    console.error("Error en webhook de Resend:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

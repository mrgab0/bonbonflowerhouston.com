"use server";

import dbConnect from "@/lib/db";
import { Customer } from "@/lib/models/Customer";
import { NewsletterLead } from "@/lib/models/NewsletterLead";
import { AbandonedCart } from "@/lib/models/AbandonedCart";
import { EmailMessage } from "@/lib/models/EmailMessage";
import {
  sendEmail,
  sendBatchEmails,
  getCorporateEmailConfig,
  wrapInBonbonEmailTemplate,
} from "@/lib/email";
import { revalidatePath } from "next/cache";

export type MarketingAudience =
  | "all_customers"
  | "newsletter_leads"
  | "abandoned_carts"
  | "all_contacts";

export async function getAudienceCountsAction() {
  try {
    await dbConnect();
    const customersCount = await Customer.countDocuments({ email: { $exists: true, $ne: "" } });
    const leadsCount = await NewsletterLead.countDocuments({ status: "subscribed" });
    const abandonedCount = await AbandonedCart.countDocuments({ customerEmail: { $exists: true, $ne: "" } });

    // Correos únicos totales
    const custEmails = await Customer.distinct("email");
    const leadEmails = await NewsletterLead.distinct("email", { status: "subscribed" });
    const cartEmails = await AbandonedCart.distinct("customerEmail");
    const allUnique = new Set([...custEmails, ...leadEmails, ...cartEmails]);

    return {
      success: true,
      data: {
        all_customers: customersCount,
        newsletter_leads: leadsCount,
        abandoned_carts: abandonedCount,
        all_contacts: allUnique.size,
      },
    };
  } catch (err: any) {
    return {
      success: false,
      data: { all_customers: 0, newsletter_leads: 0, abandoned_carts: 0, all_contacts: 0 },
    };
  }
}

export async function sendMarketingCampaignAction(data: {
  audience: MarketingAudience;
  subject: string;
  preheader?: string;
  bodyHtml: string;
  ctaText?: string;
  ctaUrl?: string;
  isTest?: boolean;
  testEmail?: string;
}) {
  try {
    if (!data.subject?.trim()) {
      return { success: false, error: "El asunto de la campaña es obligatorio." };
    }
    if (!data.bodyHtml?.trim()) {
      return { success: false, error: "El contenido del correo no puede estar vacío." };
    }

    await dbConnect();
    const emailCfg = await getCorporateEmailConfig();

    // 1. MODO DE PRUEBA: Enviar solo al correo especificado
    if (data.isTest) {
      const recipient = data.testEmail?.trim() || emailCfg.adminEmails[0];
      if (!recipient) {
        return { success: false, error: "Ingresa un correo para la prueba." };
      }

      const wrappedHtml = wrapInBonbonEmailTemplate({
        title: `[TEST] ${data.subject.trim()}`,
        preheader: data.preheader || data.subject.trim(),
        bodyHtml: `
          <div style="background-color: #FEF3C7; border: 1px solid #F59E0B; padding: 10px 14px; border-radius: 8px; font-size: 11px; color: #92400E; margin-bottom: 20px;">
            ⚠️ <strong>ENVÍO DE PRUEBA:</strong> Este es un simulacro de previsualización para el administrador antes del despacho masivo.
          </div>
          ${data.bodyHtml}
        `,
        ctaText: data.ctaText,
        ctaUrl: data.ctaUrl,
        showContactFooter: true,
      });

      const res = await sendEmail({
        to: recipient,
        subject: `[PRUEBA] ${data.subject.trim()}`,
        html: wrappedHtml,
        replyTo: emailCfg.replyTo,
      });

      return {
        success: res.success,
        message: res.success
          ? `Correo de prueba enviado con éxito a ${recipient}`
          : res.error || "Error al enviar prueba.",
      };
    }

    // 2. MODO MASIVO: Obtener lista de destinatarios según audiencia
    let targetEmails: string[] = [];

    if (data.audience === "all_customers") {
      targetEmails = await Customer.distinct("email");
    } else if (data.audience === "newsletter_leads") {
      targetEmails = await NewsletterLead.distinct("email", { status: "subscribed" });
    } else if (data.audience === "abandoned_carts") {
      targetEmails = await AbandonedCart.distinct("customerEmail");
    } else if (data.audience === "all_contacts") {
      const custEmails = await Customer.distinct("email");
      const leadEmails = await NewsletterLead.distinct("email", { status: "subscribed" });
      const cartEmails = await AbandonedCart.distinct("customerEmail");
      targetEmails = Array.from(new Set([...custEmails, ...leadEmails, ...cartEmails]));
    }

    const cleanRecipients = targetEmails
      .map((e) => e?.toLowerCase().trim())
      .filter((e) => e && e.includes("@"));

    if (cleanRecipients.length === 0) {
      return { success: false, error: "No se encontraron contactos en la audiencia seleccionada." };
    }

    const wrappedHtml = wrapInBonbonEmailTemplate({
      title: data.subject.trim(),
      preheader: data.preheader || data.subject.trim(),
      bodyHtml: data.bodyHtml,
      ctaText: data.ctaText,
      ctaUrl: data.ctaUrl,
      showContactFooter: true,
    });

    const batchPayload = cleanRecipients.map((recipient) => ({
      to: [recipient],
      subject: data.subject.trim(),
      html: wrappedHtml,
      from: emailCfg.senderFormatted,
      replyTo: emailCfg.replyTo,
    }));

    const batchRes = await sendBatchEmails(batchPayload);

    // Registrar en MongoDB
    await EmailMessage.create({
      direction: "outbound",
      type: "marketing_campaign",
      from: emailCfg.senderFormatted,
      to: [`[Audiencia: ${data.audience} - ${batchRes.sentCount} destinatarios]`],
      replyTo: emailCfg.replyTo,
      subject: data.subject.trim(),
      bodyHtml: wrappedHtml,
      status: batchRes.success ? "sent" : "failed",
      isRead: true,
      metadata: {
        audience: data.audience,
        totalRecipients: cleanRecipients.length,
        sentCount: batchRes.sentCount,
        errors: batchRes.errors,
      },
      createdAt: new Date(),
    });

    revalidatePath("/admin/correos");

    return {
      success: batchRes.success,
      sentCount: batchRes.sentCount,
      totalTargeted: cleanRecipients.length,
      message: `Campaña despachada con éxito a ${batchRes.sentCount} contactos.`,
    };
  } catch (err: any) {
    console.error("Error al enviar campaña masiva:", err);
    return { success: false, error: err?.message || "Error al procesar campaña." };
  }
}

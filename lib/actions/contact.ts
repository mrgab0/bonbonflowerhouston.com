"use server";

import nodemailer from "nodemailer";

function getTransporter() {
  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || "587");
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    throw new Error("Missing SMTP credentials (SMTP_HOST, SMTP_USER, SMTP_PASS)");
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });
}

export async function sendContactEmail(formData: {
  name: string;
  email: string;
  phone?: string;
  message: string;
}) {
  try {
    const transporter = getTransporter();
    const sender = process.env.SMTP_FROM || process.env.SMTP_USER || "flowersforyou403@gmail.com";
    const recipientEmails = (process.env.ADMIN_EMAIL || process.env.SMTP_USER || "flowersforyou403@gmail.com")
      .split(",")
      .map(e => e.trim())
      .filter(Boolean);

    const emailContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 12px; overflow: hidden;">
        <div style="background-color: #FF97A4; color: white; padding: 20px; text-align: center;">
          <h1 style="margin: 0; font-size: 22px;">🌸 Nuevo Mensaje de Contacto</h1>
        </div>
        <div style="padding: 25px; background-color: #ffffff;">
          <h3 style="color: #1A1C1C; margin-top: 0; border-bottom: 2px solid #FF97A4; padding-bottom: 5px;">Detalles del Cliente:</h3>
          <p style="margin: 8px 0;"><strong>Nombre:</strong> ${formData.name}</p>
          <p style="margin: 8px 0;"><strong>Correo:</strong> ${formData.email}</p>
          <p style="margin: 8px 0;"><strong>Teléfono / WhatsApp:</strong> ${formData.phone || "No especificado"}</p>
          
          <h3 style="color: #1A1C1C; margin-top: 20px; border-bottom: 2px solid #FF97A4; padding-bottom: 5px;">Mensaje / Consulta:</h3>
          <div style="padding: 15px; background-color: #fdf2f7; border-left: 4px solid #FF97A4; border-radius: 4px; color: #333; line-height: 1.6;">
            ${formData.message.replace(/\n/g, '<br>')}
          </div>
        </div>
        <div style="background-color: #1A1C1C; color: white; padding: 15px; text-align: center; font-size: 12px;">
          <p style="margin: 0;">Gabriela's Flowers LLC - Boutique Digital</p>
        </div>
      </div>
    `;

    await transporter.sendMail({
      from: sender,
      to: recipientEmails.join(", "),
      replyTo: formData.email,
      subject: `🌸 Consulta de Contacto: ${formData.name}`,
      html: emailContent,
    });

    return { success: true };
  } catch (error) {
    console.error("Error enviando correo de contacto SMTP:", error);
    return { success: false, error: "Error enviando correo. Verifique credenciales SMTP." };
  }
}

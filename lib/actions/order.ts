"use server";

import dbConnect from "@/lib/db";
import { Order } from "@/lib/models/Order";
import { EmailMessage } from "@/lib/models/EmailMessage";
import { verify2FACodeAction } from "@/lib/actions/admin2fa";
import {
  sendEmail,
  getCorporateEmailConfig,
  wrapInBonbonEmailTemplate,
} from "@/lib/email";
import { markCartAsRecoveredAction } from "@/lib/actions/abandonedCart";

export async function createOrder(orderData: any, existingOrderId?: string) {
  await dbConnect();
  let savedOrder: any;
  let originalOrder: any = null;
  let isConsolidatedWithin2Hours = false;
  let minutesElapsed = 0;

  if (existingOrderId) {
    originalOrder = await Order.findOne({ orderId: existingOrderId });
    
    if (originalOrder && originalOrder.createdAt) {
      const diffMs = Date.now() - new Date(originalOrder.createdAt).getTime();
      minutesElapsed = Math.floor(diffMs / (1000 * 60));
      const hoursElapsed = diffMs / (1000 * 60 * 60);

      const statusLower = (originalOrder.status || "").toLowerCase();
      // Solo agrupar si han pasado menos de 2 horas Y el pedido no ha sido enviado aún
      const isNotDispatched = !statusLower.includes("camino") && !statusLower.includes("entregado") && !statusLower.includes("retirado");

      if (hoursElapsed <= 2 && isNotDispatched) {
        isConsolidatedWithin2Hours = true;
      }
    }
  }

  if (isConsolidatedWithin2Hours && originalOrder && existingOrderId) {
    const parts = existingOrderId.split('-');
    const baseId = `${parts[0]}-${parts[1]}`;
    const currentVersion = parseInt(parts[2]) || 1;
    const newVersion = currentVersion + 1;
    const newOrderId = `${baseId}-${newVersion}`;

    savedOrder = await Order.create({
      ...orderData,
      orderId: newOrderId,
      // Se guardan ÚNICAMENTE los ítems y total de ESTA nueva transacción (Factura Limpia)
      items: orderData.items,
      total: orderData.total,
      createdAt: new Date(),
    });
  }

  if (!savedOrder) {
    savedOrder = new Order({
      ...orderData,
      orderId: `BNBNFH-${String(Math.floor(10000 + Math.random() * 90000))}-1`,
      items: orderData.items,
      total: orderData.total,
      createdAt: new Date(),
    });
    await savedOrder.save();
  }

  // Incrementar contador de uso de cupón si aplica
  if (orderData.couponCode) {
    try {
      const { Coupon } = await import("@/lib/models/Coupon");
      await Coupon.findOneAndUpdate(
        { code: orderData.couponCode.toUpperCase() },
        { $inc: { usedCount: 1 } }
      );
    } catch (err) {
      console.error("Error incrementando contador de uso de cupón:", err);
    }
  }

  // 1. Notificación Oficial de Pedido por Email vía Resend
  try {
    const emailCfg = await getCorporateEmailConfig();
    const recipients: string[] = [];

    if (savedOrder.customerEmail && savedOrder.customerEmail.trim()) {
      recipients.push(savedOrder.customerEmail.trim());
    }

    // Copia a administradores
    const bccAdmins = emailCfg.adminEmails.filter((adm) => !recipients.includes(adm));

    if (recipients.length > 0 || bccAdmins.length > 0) {
      const orderTotal = savedOrder.total || 0;
      const deliveryFee = savedOrder.deliveryFee || 0;
      const discountAmount = savedOrder.discountAmount || 0;
      const taxAmount = savedOrder.taxAmount || 0;
      const itemsSubtotal = (savedOrder.items || []).reduce(
        (acc: number, item: any) => acc + item.price * item.quantity,
        0
      );

      const cleanPhoneDigits = (savedOrder.customerPhone || "").replace(/\D/g, "");
      const waLink = cleanPhoneDigits
        ? `https://wa.me/${cleanPhoneDigits.length === 10 ? "1" + cleanPhoneDigits : cleanPhoneDigits}`
        : "https://wa.me/13467392730";

      const receiptBodyHtml = `
        <h2 style="color: #163422; font-family: Georgia, serif; font-size: 20px; margin-top: 0;">¡Comprobante de Pedido / Receipt! 🌸</h2>

        ${
          isConsolidatedWithin2Hours && originalOrder
            ? `
          <div style="margin-bottom: 20px; padding: 14px; background-color: #F0FDF4; border-left: 4px solid #163422; border-radius: 8px;">
            <strong style="color: #163422; font-size: 13px;">📦 Nota de Envío Agrupado / Consolidado (< 2 horas):</strong><br>
            <span style="font-size: 12px; color: #1F2937; display: block; margin-top: 4px;">
              Esta compra fue realizada <strong>${minutesElapsed} min</strong> después de tu pedido previo (<strong>#${originalOrder.orderId}</strong>). Como tu primer pedido aún está en diseño en boutique, nuestros repartidores agruparán ambos paquetes en la misma ruta de entrega a tu ubicación.
            </span>
          </div>
        `
            : ""
        }

        <div style="background-color: #F8FAF9; padding: 16px; border-radius: 12px; margin-bottom: 24px; border: 1px solid #E5E7EB;">
          <p style="margin: 4px 0;"><strong>ID Pedido:</strong> <span style="font-family: monospace; color: #163422; font-weight: bold;">${savedOrder.orderId}</span></p>
          <p style="margin: 4px 0;"><strong>Cliente:</strong> ${savedOrder.customerName}</p>
          <p style="margin: 4px 0;"><strong>Correo Electrónico:</strong> ${savedOrder.customerEmail || "No especificado"}</p>
          <p style="margin: 4px 0;"><strong>Teléfono / WhatsApp:</strong> ${savedOrder.customerPhone}</p>
          <p style="margin: 4px 0;"><strong>Opción de Entrega:</strong> ${savedOrder.deliveryMethod || orderData.deliveryMethod || "Envío a Domicilio"}</p>
          <p style="margin: 4px 0;"><strong>Dirección de Entrega:</strong> ${savedOrder.address}</p>
          ${savedOrder.distanceMiles ? `<p style="margin: 4px 0; color: #163422; font-weight: bold;"><strong>📍 Distancia desde Boutique:</strong> ${savedOrder.distanceMiles} Millas</p>` : ""}

          ${
            savedOrder.cardMessage
              ? `
            <div style="margin-top: 12px; padding: 12px; background-color: #FFFBEB; border-left: 4px solid #D4AF37; border-radius: 6px;">
              <strong style="color: #92400E; font-size: 12px;">💌 Tarjeta de Dedicatoria Impresa Incluida:</strong><br>
              <em style="color: #1F2937; font-size: 13px; display: block; margin-top: 4px;">"${savedOrder.cardMessage}"</em>
            </div>
          `
              : ""
          }

          ${
            savedOrder.googleMapsUrl
              ? `
            <div style="margin-top: 12px;">
              <a href="${savedOrder.googleMapsUrl}" target="_blank" style="background-color: #163422; color: #FFFFFF; padding: 10px 18px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 12px; display: inline-block;">
                🗺️ Abrir Ubicación en Google Maps (GPS)
              </a>
            </div>
          `
              : ""
          }
        </div>

        <h3 style="color: #163422; border-bottom: 2px solid #C5A059; padding-bottom: 6px; font-size: 15px;">Detalle de Productos & Adicionales:</h3>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
          ${savedOrder.items
            .map(
              (item: any) => `
            <tr>
              <td style="padding: 10px 4px; border-bottom: 1px solid #EAEAEA;">
                <strong style="color: #163422;">${item.name}</strong><br>
                <small style="color: #64748B;">Cantidad: ${item.quantity}</small>
                ${
                  item.addons && item.addons.length > 0
                    ? `
                  <div style="margin-top: 6px; padding: 8px; background: #F8FAF9; border-left: 3px solid #163422; border-radius: 4px;">
                    <strong style="color: #163422; font-size: 11px;">Adicionales Seleccionados:</strong><br>
                    ${item.addons
                      .map(
                        (a: any) => `
                      <div style="font-size: 11px; margin-top: 2px; color: #374151;">
                        ✨ <strong>${a.name || a.value}</strong> ${a.price ? `(+$${a.price.toFixed(2)})` : ""}
                        ${a.customText ? `<div style="color: #163422; font-style: italic; font-weight: bold; margin-left: 8px;">💬 Dedicatoria: "${a.customText}"</div>` : ""}
                      </div>
                    `
                      )
                      .join("")}
                  </div>
                `
                    : ""
                }
              </td>
              <td style="padding: 10px 4px; border-bottom: 1px solid #EAEAEA; text-align: right; font-weight: bold; vertical-align: top; color: #163422;">
                $${(item.price * item.quantity).toFixed(2)} USD
              </td>
            </tr>
          `
            )
            .join("")}
        </table>

        <div style="background-color: #F8FAF9; padding: 16px; border-radius: 12px; margin-bottom: 20px; font-size: 13px; border: 1px solid #E5E7EB;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
            <span>Subtotal Arreglos & Adicionales:</span>
            <strong>$${itemsSubtotal.toFixed(2)} USD</strong>
          </div>
          ${
            savedOrder.couponCode
              ? `
            <div style="display: flex; justify-content: space-between; color: #16A34A; margin-bottom: 6px;">
              <span>Descuento Cupón (${savedOrder.couponCode}):</span>
              <strong>-$${discountAmount.toFixed(2)} USD</strong>
            </div>
          `
              : ""
          }
          <div style="display: flex; justify-content: space-between; margin-bottom: 6px; color: #163422;">
            <span>🏛️ Impuestos de Ley / Sales Tax (8.25%):</span>
            <strong>+$${taxAmount.toFixed(2)} USD</strong>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
            <span>Costo de Envío:</span>
            <strong style="color: #163422;">${deliveryFee > 0 ? `+$${deliveryFee.toFixed(2)} USD` : "Gratis / Incluido"}</strong>
          </div>
          <div style="border-top: 1px solid #D1D5DB; padding-top: 10px; margin-top: 10px; display: flex; justify-content: space-between; font-size: 16px;">
            <strong style="color: #163422;">TOTAL PAGADO:</strong>
            <strong style="color: #163422; font-size: 18px;">$${orderTotal.toFixed(2)} USD</strong>
          </div>
        </div>

        <div style="padding: 14px; background: #F8FAF9; border-radius: 10px; margin-bottom: 20px; font-size: 12px;">
          <p style="margin: 3px 0;"><strong>Método de Pago:</strong> ${savedOrder.paymentMethod}</p>
          <p style="margin: 3px 0;"><strong>Referencia de Transacción:</strong> ${savedOrder.paymentRef}</p>
        </div>

        <div style="text-align: center; margin-top: 24px;">
          <a href="${waLink}" target="_blank" style="background-color: #25D366; color: white; padding: 12px 26px; text-decoration: none; border-radius: 9999px; font-weight: bold; display: inline-block; font-size: 13px; box-shadow: 0 4px 12px rgba(37, 211, 102, 0.3);">
            Contactar por WhatsApp 💬
          </a>
        </div>
      `;

      const subject = `🌸 Confirmación de Pedido: #${savedOrder.orderId} • Bonbon Flowers Houston`;

      const wrappedHtml = wrapInBonbonEmailTemplate({
        title: subject,
        preheader: `Tu pedido #${savedOrder.orderId} por $${orderTotal.toFixed(2)} USD ha sido confirmado con éxito.`,
        bodyHtml: receiptBodyHtml,
        showContactFooter: true,
      });

      const sendTarget = recipients.length > 0 ? recipients : bccAdmins;
      const sendRes = await sendEmail({
        to: sendTarget,
        bcc: recipients.length > 0 && bccAdmins.length > 0 ? bccAdmins : undefined,
        subject,
        html: wrappedHtml,
        replyTo: emailCfg.replyTo,
      });

      // Registrar en EmailMessage para visualización en el Panel /admin/correos
      await EmailMessage.create({
        direction: "outbound",
        type: "order_receipt",
        from: sendRes.sender || emailCfg.senderFormatted,
        to: sendTarget,
        replyTo: emailCfg.replyTo,
        subject,
        bodyHtml: wrappedHtml,
        status: sendRes.success ? "sent" : "failed",
        isRead: true,
        customerName: savedOrder.customerName || "",
        customerPhone: savedOrder.customerPhone || "",
        customerEmail: savedOrder.customerEmail || "",
        orderId: savedOrder.orderId,
        resendMessageId: sendRes.messageId || "",
        bccAdmins: true,
        createdAt: new Date(),
      });

      console.log(`[Order Receipt] Notificación de orden ${savedOrder.orderId} enviada con éxito vía Resend.`);
    }
  } catch (emailError) {
    console.error("Error enviando recibo de orden vía Resend:", emailError);
  }

  // 2. Si vino de un carrito abandonado, marcarlo como recuperado
  if (orderData?.cartToken) {
    try {
      await markCartAsRecoveredAction(orderData.cartToken, savedOrder.orderId);
    } catch (cartErr) {
      console.error("Error marcando carrito como recuperado:", cartErr);
    }
  }

  return { success: true, orderId: savedOrder.orderId };
}

export async function getOrderById(orderIdOrPhone: string) {
  try {
    await dbConnect();
    const query = orderIdOrPhone.trim();

    const order = await Order.findOne({
      $or: [
        { orderId: query },
        { customerPhone: { $regex: query, $options: "i" } },
        { customerName: { $regex: query, $options: "i" } }
      ]
    }).lean();

    if (!order) {
      return { success: false, error: "Pedido no encontrado." };
    }

    return { success: true, data: JSON.parse(JSON.stringify(order)) };
  } catch (error) {
    console.error("Error al buscar pedido:", error);
    return { success: false, error: "Error al buscar el pedido." };
  }
}

export async function updateOrderStatusAction(orderId: string, status: string) {
  try {
    await dbConnect();
    const updated = await Order.findOneAndUpdate(
      { orderId },
      { status },
      { new: true }
    );
    if (!updated) {
      return { success: false, error: "Pedido no encontrado." };
    }
    return { success: true, data: JSON.parse(JSON.stringify(updated)) };
  } catch (error) {
    console.error("Error actualizando estado del pedido:", error);
    return { success: false, error: "Error al actualizar el estado del pedido." };
  }
}

export async function updateOrderWith2FAAction(
  orderId: string,
  updateData: any,
  twoFactorCode: string
) {
  try {
    await dbConnect();

    // 1. Verificar 2FA
    const vRes = await verify2FACodeAction(twoFactorCode);
    if (!vRes.success) {
      return { success: false, error: vRes.error || "Código 2FA incorrecto." };
    }

    // 2. Actualizar datos de la orden
    const updated = await Order.findOneAndUpdate(
      { orderId },
      { $set: updateData },
      { new: true }
    );

    if (!updated) {
      return { success: false, error: "No se encontró la orden a modificar." };
    }

    return { success: true, data: JSON.parse(JSON.stringify(updated)) };
  } catch (error: any) {
    console.error("Error al actualizar la orden con 2FA:", error);
    return { success: false, error: "Error de servidor al guardar los cambios de la orden." };
  }
}

export async function getAllOrdersAction() {
  try {
    await dbConnect();
    const orders = await Order.find({}).sort({ createdAt: -1 }).limit(100).lean();
    return { success: true, data: JSON.parse(JSON.stringify(orders)) };
  } catch (error) {
    console.error("Error obteniendo lista de órdenes:", error);
    return { success: false, error: "No se pudieron obtener las órdenes." };
  }
}


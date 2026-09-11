"use server";

import dbConnect from "@/lib/db";
import { PaymentConfig } from "@/lib/models/PaymentConfig";
import { revalidatePath } from "next/cache";

const DEFAULT_PAYMENT_CONFIGS: Record<string, any> = {
  zelle: {
    methodId: "zelle",
    title: "Zelle",
    holderName: "Gabriela's Flowers LLC",
    accountDetail: "pagos@gabrielasflowers.com",
    qrImage: "",
    instructions: "1. Abre la aplicación de tu banco o Zelle.\n2. Presiona 'Copiar Datos' arriba para copiar nuestro correo o teléfono oficial.\n3. Realiza la transferencia por el monto total de tu pedido.\n4. Ingresa el número de referencia de la transferencia abajo y confirma tu pedido.",
    linkUrl: "",
    isActive: true,
  },
  cashapp: {
    methodId: "cashapp",
    title: "CashApp",
    holderName: "Gabriela's Flowers LLC",
    accountDetail: "$GabrielasFlowers",
    qrImage: "",
    instructions: "1. Abre tu aplicación de CashApp.\n2. Presiona 'Copiar Datos' arriba para obtener nuestro $Cashtag oficial.\n3. Realiza el envío del pago por el total del pedido.\n4. Pega el código de confirmación o ID de transacción abajo.",
    linkUrl: "",
    isActive: true,
  },
  paypal: {
    methodId: "paypal",
    title: "PayPal",
    holderName: "Gabriela's Flowers LLC",
    accountDetail: "paypal@flowersforyou.com",
    qrImage: "",
    instructions: "1. Copia nuestro correo o haz clic en 'Pagar vía PayPal' para abrir tu app.\n2. Envía el pago por el monto exacto del arreglo.\n3. Ingresa tu número de transacción o correo de PayPal abajo.",
    linkUrl: "https://paypal.me/flowersforyou",
    isActive: true,
  },
  square: {
    methodId: "square",
    title: "Square (Tarjeta)",
    holderName: "Pasarela Segura Square",
    accountDetail: "Pago con Tarjeta de Crédito / Débito",
    qrImage: "",
    instructions: "1. Haz clic en el botón 'Pagar vía Square' para abrir la pasarela encriptada oficial de Square.\n2. Ingresa los datos de tu tarjeta Visa, Mastercard o AMEX de forma 100% segura.\n3. Copia tu número de recibo o confirmación y pégalo abajo.",
    linkUrl: "https://square.link/u/boutiqueflowers",
    isActive: true,
  },
  efectivo: {
    methodId: "efectivo",
    title: "Efectivo",
    holderName: "Boutique Principal",
    accountDetail: "Pago en Efectivo (Cash)",
    qrImage: "",
    instructions: "1. Al entregar tu pedido a domicilio o cuando retires en nuestra boutique, realizarás el pago directo en efectivo exacto.\n2. No requieres número de referencia. ¡Haz clic en 'Confirmar Pedido' para procesar tu orden!",
    linkUrl: "",
    isActive: true,
  },
};

export async function getDefaultPaymentConfigs() {
  return JSON.parse(JSON.stringify(DEFAULT_PAYMENT_CONFIGS));
}

export async function getPaymentConfigs() {
  await dbConnect();
  try {
    const dbConfigs = await PaymentConfig.find({}).lean();
    const map: Record<string, any> = JSON.parse(JSON.stringify(DEFAULT_PAYMENT_CONFIGS));

    dbConfigs.forEach((cfg: any) => {
      map[cfg.methodId] = JSON.parse(JSON.stringify(cfg));
    });

    return { success: true, data: map };
  } catch (error) {
    console.error("Error al obtener configuraciones de pago:", error);
    return { success: true, data: JSON.parse(JSON.stringify(DEFAULT_PAYMENT_CONFIGS)) };
  }
}

export async function updatePaymentConfig(methodId: string, formData: FormData) {
  await dbConnect();
  try {
    const holderName = formData.get("holderName") as string || "";
    const accountDetail = formData.get("accountDetail") as string || "";
    const qrImage = formData.get("qrImage") as string || "";
    const instructions = formData.get("instructions") as string || "";
    const linkUrl = formData.get("linkUrl") as string || "";
    const title = formData.get("title") as string || DEFAULT_PAYMENT_CONFIGS[methodId]?.title || methodId;

    const isActiveInput = formData.get("isActive");
    const updateData: any = {
      methodId,
      title,
      holderName,
      accountDetail,
      qrImage,
      instructions,
      linkUrl,
      updatedAt: new Date(),
    };

    if (isActiveInput !== null) {
      updateData.isActive = isActiveInput === "true";
    }

    await PaymentConfig.findOneAndUpdate(
      { methodId },
      updateData,
      { upsert: true, new: true }
    );

    revalidatePath("/admin/pagos");
    revalidatePath("/checkout");
    revalidatePath("/es/checkout");
    revalidatePath("/en/checkout");
    return { success: true };
  } catch (error) {
    console.error("Error al actualizar datos de pago:", error);
    return { success: false, error: "No se pudieron actualizar los datos de pago." };
  }
}

export async function togglePaymentActive(methodId: string, isActive: boolean) {
  await dbConnect();
  try {
    await PaymentConfig.findOneAndUpdate(
      { methodId },
      { isActive, updatedAt: new Date() },
      { upsert: true, new: true }
    );

    revalidatePath("/admin/pagos");
    revalidatePath("/checkout");
    revalidatePath("/es/checkout");
    revalidatePath("/en/checkout");
    return { success: true };
  } catch (error) {
    console.error("Error al pausar/publicar método de pago:", error);
    return { success: false, error: "No se pudo cambiar el estado del método de pago." };
  }
}

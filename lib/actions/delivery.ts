"use server";

import dbConnect from "@/lib/db";
import { DeliveryOptionModel } from "@/lib/models/DeliveryOption";
import { DEFAULT_DELIVERY_OPTIONS } from "@/lib/deliveryOptions";
import { revalidatePath } from "next/cache";

export async function getDeliveryOptions() {
  try {
    await dbConnect();
    let options = await DeliveryOptionModel.find({}).sort({ order: 1 }).lean();

    // Si aún no existen en la BD, los inicializamos con los 7 valores por defecto
    if (!options || options.length === 0) {
      const seeded = DEFAULT_DELIVERY_OPTIONS.map((opt, idx) => ({
        title: opt.title,
        description: opt.description,
        estimatedTimeMinutes: opt.estimatedTimeMinutes,
        estimatedTimeLabel: opt.estimatedTimeLabel,
        extraPrice: opt.extraPrice,
        pricePerMile: opt.pricePerMile,
        badge: opt.badge,
        iconName: opt.iconName,
        isActive: opt.isActive,
        order: idx,
      }));

      await DeliveryOptionModel.insertMany(seeded);
      options = await DeliveryOptionModel.find({}).sort({ order: 1 }).lean();
    }

    return { success: true, data: JSON.parse(JSON.stringify(options)) };
  } catch (error) {
    console.error("Error al obtener opciones de entrega:", error);
    return { success: false, data: DEFAULT_DELIVERY_OPTIONS };
  }
}

export async function updateDeliveryOption(id: string, formData: FormData) {
  try {
    await dbConnect();
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const estimatedTimeLabel = formData.get("estimatedTimeLabel") as string;
    const estimatedTimeMinutes = parseInt(formData.get("estimatedTimeMinutes") as string) || 60;
    const extraPrice = parseFloat(formData.get("extraPrice") as string) || 0;
    const pricePerMile = parseFloat(formData.get("pricePerMile") as string) || 0;
    const badge = formData.get("badge") as string || "";

    await DeliveryOptionModel.findByIdAndUpdate(id, {
      title,
      description,
      estimatedTimeLabel,
      estimatedTimeMinutes,
      extraPrice,
      pricePerMile,
      badge,
    });

    revalidatePath("/admin/entregas");
    revalidatePath("/checkout");
    return { success: true };
  } catch (error) {
    console.error("Error al actualizar opción de entrega:", error);
    return { success: false, error: "Error al actualizar la opción" };
  }
}

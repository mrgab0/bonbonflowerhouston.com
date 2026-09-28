"use server";

import dbConnect from "@/lib/db";
import { Addon } from "@/lib/models/Addon";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function getAddons() {
  await dbConnect();
  try {
    const addons = await Addon.find({ isActive: { $ne: false } }).sort({ order: 1, createdAt: -1 }).lean();
    return { success: true, data: JSON.parse(JSON.stringify(addons)) };
  } catch (error) {
    console.error("Error obteniendo adicionales:", error);
    return { success: false, error: "Failed to fetch addons" };
  }
}

export async function getAllAddonsAdmin() {
  await dbConnect();
  try {
    const addons = await Addon.find({}).sort({ category: 1, order: 1, createdAt: -1 }).lean();
    return { success: true, data: JSON.parse(JSON.stringify(addons)) };
  } catch (error) {
    console.error("Error obteniendo adicionales admin:", error);
    return { success: false, error: "Failed to fetch admin addons" };
  }
}

export async function getAddonById(id: string) {
  await dbConnect();
  try {
    const addon = await Addon.findById(id).lean();
    if (!addon) return { success: false, error: "Adicional no encontrado" };
    return { success: true, data: JSON.parse(JSON.stringify(addon)) };
  } catch (error) {
    return { success: false, error: "Error al cargar adicional" };
  }
}

export async function createAddon(formData: FormData) {
  await dbConnect();
  try {
    const name = formData.get("name") as string;
    const price = parseFloat(formData.get("price") as string) || 0;
    const category = formData.get("category") as string || "Chocolates";
    const image = formData.get("image") as string || "";
    const description = formData.get("description") as string || "";

    await Addon.create({ name, price, category, image, description, isActive: true });
    revalidatePath("/admin/adicionales");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Error al crear adicional" };
  }
}

export async function updateAddon(id: string, formData: FormData) {
  await dbConnect();
  try {
    const name = formData.get("name") as string;
    const price = parseFloat(formData.get("price") as string) || 0;
    const category = formData.get("category") as string || "Chocolates";
    const image = formData.get("image") as string || "";
    const description = formData.get("description") as string || "";

    await Addon.findByIdAndUpdate(id, { name, price, category, image, description });
    revalidatePath("/admin/adicionales");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Error al actualizar adicional" };
  }
}

export async function updateAddonFormAction(formData: FormData): Promise<void> {
  const id = formData.get("id") as string;
  if (!id) return;
  await updateAddon(id, formData);
  redirect("/admin/adicionales");
}

export async function toggleAddonStatus(id: string, isActive: boolean) {
  await dbConnect();
  try {
    await Addon.findByIdAndUpdate(id, { isActive });
    revalidatePath("/admin/adicionales");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Error al cambiar estado del adicional" };
  }
}

export async function deleteAddon(id: string) {
  await dbConnect();
  try {
    await Addon.findByIdAndDelete(id);
    revalidatePath("/admin/adicionales");
    revalidatePath("/admin/productos");
    return { success: true };
  } catch (error) {
    return { success: false, error: "No se pudo eliminar el adicional" };
  }
}

export async function createBulkAddons(
  addonsData: Array<{
    name: string;
    price: number;
    category: string;
    description?: string;
    image?: string;
    type?: "checkbox" | "text" | "select";
    options?: string[];
  }>,
  publishImmediately: boolean = false
) {
  try {
    await dbConnect();
    if (!addonsData || !Array.isArray(addonsData) || addonsData.length === 0) {
      return { success: false, error: "No hay adicionales para guardar." };
    }

    const batchCreatedAt = new Date();
    const preparedAddons = addonsData.map((item) => ({
      name: item.name.trim() || "Adicional Sin Nombre",
      price: typeof item.price === "number" && !isNaN(item.price) ? item.price : 0,
      category: item.category?.trim() || "Otros",
      description: item.description?.trim() || "",
      image: item.image || "",
      type: item.type || "checkbox",
      options: item.options || [],
      isActive: publishImmediately,
      createdAt: batchCreatedAt,
      order: 0
    }));

    const inserted = await Addon.insertMany(preparedAddons);
    revalidatePath("/admin/adicionales");
    revalidatePath("/admin/productos");
    return { success: true, count: inserted.length };
  } catch (error) {
    console.error("Error en carga masiva de adicionales:", error);
    return { success: false, error: error instanceof Error ? error.message : "Error al procesar la carga en masa." };
  }
}

export async function updateBulkAddonBatch(
  addonIds: string[],
  updates: {
    category?: string;
    price?: number;
    type?: "checkbox" | "text" | "select";
    description?: string;
  }
) {
  try {
    await dbConnect();
    if (!addonIds || addonIds.length === 0) {
      return { success: false, error: "No se seleccionaron adicionales para actualizar." };
    }

    const updateFields: any = {};
    if (updates.category !== undefined && updates.category.trim() !== "") updateFields.category = updates.category.trim();
    if (updates.price !== undefined && updates.price >= 0) updateFields.price = updates.price;
    if (updates.type !== undefined) updateFields.type = updates.type;
    if (updates.description !== undefined && updates.description.trim() !== "") updateFields.description = updates.description.trim();

    await Addon.updateMany(
      { _id: { $in: addonIds } },
      { $set: updateFields }
    );

    revalidatePath("/admin/adicionales");
    revalidatePath("/admin/productos");
    return { success: true, count: addonIds.length };
  } catch (error) {
    console.error("Error al actualizar lote de adicionales:", error);
    return { success: false, error: "Error al aplicar cambios masivos." };
  }
}

export async function publishBulkAddonBatch(addonIds: string[]) {
  try {
    await dbConnect();
    if (!addonIds || addonIds.length === 0) {
      return { success: false, error: "No se seleccionaron adicionales para publicar." };
    }

    await Addon.updateMany(
      { _id: { $in: addonIds } },
      { $set: { isActive: true } }
    );

    revalidatePath("/admin/adicionales");
    revalidatePath("/admin/productos");
    return { success: true, count: addonIds.length };
  } catch (error) {
    console.error("Error al publicar lote de adicionales:", error);
    return { success: false, error: "Error al publicar lote." };
  }
}


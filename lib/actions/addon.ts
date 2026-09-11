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

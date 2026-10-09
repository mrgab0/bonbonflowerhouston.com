"use server";

import dbConnect from "@/lib/db";
import { DynamicQR } from "@/lib/models/DynamicQR";
import { revalidatePath } from "next/cache";

export interface DynamicQRItem {
  id: string;
  code: string;
  title: string;
  destinationUrl: string;
  type: 'url' | 'whatsapp' | 'social' | 'custom';
  description?: string;
  designConfig?: {
    stylePreset?: string;
    fgColor?: string;
    bgColor?: string;
    eyeColor?: string;
    includeLogo?: boolean;
    logoUrl?: string;
    logoSize?: number;
  };
  scanCount: number;
  lastScannedAt?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

function generateRandomCode(): string {
  const chars = "abcdefghjkmnpqrstuvwxyz23456789";
  let result = "";
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export async function getDynamicQrsAction(): Promise<DynamicQRItem[]> {
  await dbConnect();
  try {
    const list = await DynamicQR.find().sort({ createdAt: -1 }).lean();
    return list.map((item: any) => ({
      id: item._id.toString(),
      code: item.code,
      title: item.title,
      destinationUrl: item.destinationUrl,
      type: item.type || 'url',
      description: item.description || '',
      designConfig: item.designConfig || {},
      scanCount: item.scanCount || 0,
      lastScannedAt: item.lastScannedAt ? new Date(item.lastScannedAt).toISOString() : null,
      isActive: item.isActive !== false,
      createdAt: new Date(item.createdAt).toISOString(),
      updatedAt: new Date(item.updatedAt).toISOString(),
    }));
  } catch (error) {
    console.error("Error fetching dynamic QRs:", error);
    return [];
  }
}

export async function createDynamicQrAction(data: {
  code?: string;
  title: string;
  destinationUrl: string;
  type?: 'url' | 'whatsapp' | 'social' | 'custom';
  description?: string;
  designConfig?: any;
}): Promise<{ success: boolean; qr?: DynamicQRItem; error?: string }> {
  await dbConnect();
  try {
    let finalCode = (data.code || "").trim().toLowerCase();
    
    // Si no hay código o contiene caracteres no válidos, generar uno seguro
    if (!finalCode) {
      finalCode = generateRandomCode();
    } else {
      // Normalizar slug
      finalCode = finalCode.replace(/[^a-z0-9_-]/g, "");
      if (!finalCode) finalCode = generateRandomCode();
    }

    // Verificar colisión
    const existing = await DynamicQR.findOne({ code: finalCode });
    if (existing) {
      return { success: false, error: `El código "${finalCode}" ya está en uso. Por favor elige otro o déjalo vacío para autogenerar.` };
    }

    // Asegurar protocolo en destinationUrl
    let dest = data.destinationUrl.trim();
    if (!dest.startsWith("http://") && !dest.startsWith("https://") && !dest.startsWith("wa.me/")) {
      dest = "https://" + dest;
    }

    const newQr = await DynamicQR.create({
      code: finalCode,
      title: data.title.trim(),
      destinationUrl: dest,
      type: data.type || 'url',
      description: data.description || '',
      designConfig: data.designConfig || {},
      scanCount: 0,
      isActive: true,
    });

    revalidatePath("/admin/qr");
    return {
      success: true,
      qr: {
        id: newQr._id.toString(),
        code: newQr.code,
        title: newQr.title,
        destinationUrl: newQr.destinationUrl,
        type: newQr.type,
        description: newQr.description,
        designConfig: newQr.designConfig,
        scanCount: newQr.scanCount,
        lastScannedAt: null,
        isActive: newQr.isActive,
        createdAt: newQr.createdAt.toISOString(),
        updatedAt: newQr.updatedAt.toISOString(),
      },
    };
  } catch (error: any) {
    console.error("Error creating dynamic QR:", error);
    return { success: false, error: error?.message || "Error al crear el código QR dinámico." };
  }
}

export async function updateDynamicQrAction(
  id: string,
  data: {
    title?: string;
    destinationUrl?: string;
    description?: string;
    isActive?: boolean;
    designConfig?: any;
  }
): Promise<{ success: boolean; error?: string }> {
  await dbConnect();
  try {
    const updatePayload: any = {};
    if (data.title !== undefined) updatePayload.title = data.title.trim();
    if (data.destinationUrl !== undefined) {
      let dest = data.destinationUrl.trim();
      if (!dest.startsWith("http://") && !dest.startsWith("https://") && !dest.startsWith("wa.me/")) {
        dest = "https://" + dest;
      }
      updatePayload.destinationUrl = dest;
    }
    if (data.description !== undefined) updatePayload.description = data.description;
    if (data.isActive !== undefined) updatePayload.isActive = data.isActive;
    if (data.designConfig !== undefined) updatePayload.designConfig = data.designConfig;

    await DynamicQR.findByIdAndUpdate(id, updatePayload);
    revalidatePath("/admin/qr");
    return { success: true };
  } catch (error: any) {
    console.error("Error updating dynamic QR:", error);
    return { success: false, error: error?.message || "Error al actualizar." };
  }
}

export async function deleteDynamicQrAction(id: string): Promise<{ success: boolean; error?: string }> {
  await dbConnect();
  try {
    await DynamicQR.findByIdAndDelete(id);
    revalidatePath("/admin/qr");
    return { success: true };
  } catch (error: any) {
    console.error("Error deleting dynamic QR:", error);
    return { success: false, error: error?.message || "Error al eliminar." };
  }
}

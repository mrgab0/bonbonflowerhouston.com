"use server";

import dbConnect from "@/lib/db";
import { SiteConfig, IDoorDashConfig } from "@/lib/models/SiteConfig";
import { revalidatePath } from "next/cache";
import fs from "fs";
import path from "path";

export const DEFAULT_DOORDASH_CONFIG: IDoorDashConfig = {
  verificationFileName: "",
  verificationFileContent: "",
  scriptHtml: "",
  scriptEnabled: false,
  developerId: "",
  keyId: "",
  signingSecret: "",
  storeId: "",
  pickupInstructions: "Recoger arreglo floral en el mostrador. Manipular en posición vertical dentro del vehículo.",
  leadTimeMinutes: 30,
  environment: "production",
  autoDispatchEnabled: false,
};

export async function getDoorDashConfigAction(): Promise<{
  success: boolean;
  config: IDoorDashConfig;
  error?: string;
}> {
  try {
    await dbConnect();
    const siteConfig: any = await SiteConfig.findOne({ key: "global" }).lean();
    const config: IDoorDashConfig = {
      ...DEFAULT_DOORDASH_CONFIG,
      ...(siteConfig?.doordashConfig || {}),
    };
    return { success: true, config };
  } catch (error: any) {
    console.error("Error al obtener DoorDash config:", error);
    return { success: false, config: DEFAULT_DOORDASH_CONFIG, error: error?.message };
  }
}

export async function updateDoorDashConfigAction(
  data: Partial<IDoorDashConfig>
): Promise<{
  success: boolean;
  config?: IDoorDashConfig;
  error?: string;
}> {
  try {
    await dbConnect();
    const current: any = await SiteConfig.findOne({ key: "global" });
    const currentConfig = current?.doordashConfig || DEFAULT_DOORDASH_CONFIG;

    const merged: IDoorDashConfig = {
      ...DEFAULT_DOORDASH_CONFIG,
      ...currentConfig,
      ...data,
    };

    // Si hay un archivo de verificación con nombre y contenido, escribirlo en public/
    if (merged.verificationFileName && merged.verificationFileContent) {
      try {
        const safeName = path.basename(merged.verificationFileName.trim());
        if (safeName && (safeName.endsWith(".html") || safeName.endsWith(".txt"))) {
          const publicPath = path.join(process.cwd(), "public", safeName);
          fs.writeFileSync(publicPath, merged.verificationFileContent, "utf-8");
        }
      } catch (fsErr) {
        console.warn("Aviso: no se pudo escribir en public/ (normal en serverless read-only):", fsErr);
      }
    }

    await SiteConfig.findOneAndUpdate(
      { key: "global" },
      { $set: { doordashConfig: merged, updatedAt: new Date() } },
      { upsert: true }
    );

    revalidatePath("/");
    revalidatePath("/admin/doordash");

    return { success: true, config: merged };
  } catch (error: any) {
    console.error("Error al actualizar DoorDash config:", error);
    return { success: false, error: error?.message || "Error al guardar configuración de DoorDash." };
  }
}

export async function uploadDoorDashVerificationFileAction(
  fileName: string,
  content: string
): Promise<{
  success: boolean;
  fileUrl?: string;
  error?: string;
}> {
  try {
    if (!fileName || !content) {
      return { success: false, error: "Nombre de archivo o contenido inválido." };
    }

    const safeName = path.basename(fileName.trim());
    if (!safeName.endsWith(".html") && !safeName.endsWith(".txt")) {
      return { success: false, error: "El archivo debe ser de extensión .html o .txt requerido por DoorDash." };
    }

    await dbConnect();

    // Intentar persistir en public/
    try {
      const publicPath = path.join(process.cwd(), "public", safeName);
      fs.writeFileSync(publicPath, content, "utf-8");
    } catch (fsErr) {
      console.warn("Aviso: filesystem read-only en serverless:", fsErr);
    }

    await SiteConfig.findOneAndUpdate(
      { key: "global" },
      {
        $set: {
          "doordashConfig.verificationFileName": safeName,
          "doordashConfig.verificationFileContent": content,
          updatedAt: new Date(),
        },
      },
      { upsert: true }
    );

    revalidatePath("/");
    revalidatePath("/admin/doordash");

    return { success: true, fileUrl: `/${safeName}` };
  } catch (error: any) {
    console.error("Error al subir archivo de verificación DoorDash:", error);
    return { success: false, error: error?.message || "Error al procesar archivo." };
  }
}

export async function removeDoorDashVerificationFileAction(): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    await dbConnect();
    const current: any = await SiteConfig.findOne({ key: "global" }).lean();
    const oldFileName = current?.doordashConfig?.verificationFileName;

    if (oldFileName) {
      try {
        const publicPath = path.join(process.cwd(), "public", path.basename(oldFileName));
        if (fs.existsSync(publicPath)) {
          fs.unlinkSync(publicPath);
        }
      } catch (fsErr) {
        // Ignorar en serverless
      }
    }

    await SiteConfig.findOneAndUpdate(
      { key: "global" },
      {
        $set: {
          "doordashConfig.verificationFileName": "",
          "doordashConfig.verificationFileContent": "",
          updatedAt: new Date(),
        },
      }
    );

    revalidatePath("/");
    revalidatePath("/admin/doordash");

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error?.message || "Error al eliminar archivo." };
  }
}

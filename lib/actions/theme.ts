"use server";

import dbConnect from "@/lib/db";
import { SiteConfig, IThemeConfig } from "@/lib/models/SiteConfig";
import { revalidatePath } from "next/cache";
import { DEFAULT_THEME_CONFIG } from "@/lib/constants/theme";

export async function getThemeConfigAction(): Promise<{
  success: boolean;
  theme: IThemeConfig;
  error?: string;
}> {
  try {
    await dbConnect();
    const config: any = await SiteConfig.findOne({ key: "global" }).lean();
    const theme = {
      ...DEFAULT_THEME_CONFIG,
      ...(config?.themeConfig || {}),
    };
    return { success: true, theme };
  } catch (error: any) {
    console.error("Error al obtener tema visual:", error);
    return { success: false, theme: DEFAULT_THEME_CONFIG, error: error?.message };
  }
}

export async function updateThemeConfigAction(theme: Partial<IThemeConfig>): Promise<{
  success: boolean;
  theme?: IThemeConfig;
  error?: string;
}> {
  try {
    await dbConnect();
    const current: any = await SiteConfig.findOne({ key: "global" });
    const currentTheme = current?.themeConfig || DEFAULT_THEME_CONFIG;

    const mergedTheme: IThemeConfig = {
      ...DEFAULT_THEME_CONFIG,
      ...currentTheme,
      ...theme,
    };

    await SiteConfig.findOneAndUpdate(
      { key: "global" },
      { $set: { themeConfig: mergedTheme, updatedAt: new Date() } },
      { upsert: true }
    );

    revalidatePath("/");
    revalidatePath("/admin/tema");
    revalidatePath("/productos");

    return { success: true, theme: mergedTheme };
  } catch (error: any) {
    console.error("Error al actualizar tema visual:", error);
    return { success: false, error: error?.message || "Error al guardar el tema." };
  }
}

"use server";

import dbConnect from "@/lib/db";
import { SiteConfig, IThemeConfig } from "@/lib/models/SiteConfig";
import { revalidatePath } from "next/cache";

export const DEFAULT_THEME_CONFIG: IThemeConfig = {
  announcementBg: "#33cccc",
  announcementText: "#1c1917",
  headerBg: "#ffffff",
  headerText: "#163422",
  buttonPrimaryBg: "#163422",
  buttonPrimaryText: "#ffffff",
  buttonPrimaryHoverBg: "#1F452E",
  buttonSecondaryBg: "#FF97A4",
  buttonSecondaryText: "#ffffff",
  accentColor: "#C5A059",
  headingColor: "#163422",
  bodyTextColor: "#4A5568",
  scriptTextColor: "#163422",
  footerBg: "#ffffff",
  footerText: "#1c1917",
  footerAccent: "#163422",
  pageBg: "#FDFBF7",
};

export const THEME_PRESETS: Array<{
  id: string;
  name: string;
  description: string;
  badge: string;
  theme: IThemeConfig;
}> = [
  {
    id: "bonbon_signature",
    name: "🌸 Bonbon Signature",
    description: "Paleta oficial de lujo: Verde bosque, detalles en oro, acento rosa y barra turquesa.",
    badge: "Oficial",
    theme: {
      ...DEFAULT_THEME_CONFIG,
    },
  },
  {
    id: "mint_teal_modern",
    name: "💎 Menta & Teal Luminoso",
    description: "Estilo botánico fresco de alta costura con menta radiante y contrastes profundos.",
    badge: "Moderno",
    theme: {
      announcementBg: "#33cccc",
      announcementText: "#0F1210",
      headerBg: "#0F1210",
      headerText: "#5EEAD4",
      buttonPrimaryBg: "#5EEAD4",
      buttonPrimaryText: "#0B0C10",
      buttonPrimaryHoverBg: "#2DD4BF",
      buttonSecondaryBg: "#E6C98B",
      buttonSecondaryText: "#0B0C10",
      accentColor: "#5EEAD4",
      headingColor: "#E6F7F0",
      bodyTextColor: "#B9E6D3",
      scriptTextColor: "#5EEAD4",
      footerBg: "#0B0C10",
      footerText: "#E6F7F0",
      footerAccent: "#5EEAD4",
      pageBg: "#0B0C10",
    },
  },
  {
    id: "rose_romance",
    name: "🌹 Rose Romance & Velvet",
    description: "Inspirado en San Valentín: Borgoña aterciopelado, rosa blush y acentos dorados.",
    badge: "Romance",
    theme: {
      announcementBg: "#FF97A4",
      announcementText: "#2B0002",
      headerBg: "#FFFFFF",
      headerText: "#2B0002",
      buttonPrimaryBg: "#2B0002",
      buttonPrimaryText: "#FFFFFF",
      buttonPrimaryHoverBg: "#4A0004",
      buttonSecondaryBg: "#FF97A4",
      buttonSecondaryText: "#FFFFFF",
      accentColor: "#D4AF37",
      headingColor: "#2B0002",
      bodyTextColor: "#4A5568",
      scriptTextColor: "#2B0002",
      footerBg: "#FFF1F2",
      footerText: "#2B0002",
      footerAccent: "#2B0002",
      pageBg: "#FFFDFD",
    },
  },
  {
    id: "champagne_luxury",
    name: "👑 Champagne Luxury Blanc",
    description: "Minimalismo europeo blanco y oro champán. Máxima sofisticación y pulcritud.",
    badge: "Editorial",
    theme: {
      announcementBg: "#E6C98B",
      announcementText: "#1A1A1A",
      headerBg: "#FFFFFF",
      headerText: "#1A1C1C",
      buttonPrimaryBg: "#1A1C1C",
      buttonPrimaryText: "#FFFFFF",
      buttonPrimaryHoverBg: "#2A2A2A",
      buttonSecondaryBg: "#C5A059",
      buttonSecondaryText: "#1A1C1C",
      accentColor: "#C5A059",
      headingColor: "#1A1C1C",
      bodyTextColor: "#4B5563",
      scriptTextColor: "#C5A059",
      footerBg: "#FFFFFF",
      footerText: "#1A1C1C",
      footerAccent: "#C5A059",
      pageBg: "#FAFAF9",
    },
  },
  {
    id: "midnight_noir",
    name: "🖤 Midnight Noir & Gold",
    description: "Modo nocturno exclusivo con negro azabache, oro brillante y tipografías nítidas.",
    badge: "VIP Dark",
    theme: {
      announcementBg: "#C5A059",
      announcementText: "#0F1210",
      headerBg: "#12131A",
      headerText: "#FFFFFF",
      buttonPrimaryBg: "#C5A059",
      buttonPrimaryText: "#0F1210",
      buttonPrimaryHoverBg: "#d6af66",
      buttonSecondaryBg: "#FF97A4",
      buttonSecondaryText: "#0F1210",
      accentColor: "#E6C98B",
      headingColor: "#FFFFFF",
      bodyTextColor: "#D1D5DB",
      scriptTextColor: "#E6C98B",
      footerBg: "#12131A",
      footerText: "#FFFFFF",
      footerAccent: "#E6C98B",
      pageBg: "#0F1210",
    },
  },
];

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

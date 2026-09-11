"use server";

import dbConnect from "@/lib/db";
import { SiteConfig } from "@/lib/models/SiteConfig";
import { revalidatePath } from "next/cache";

const DEFAULT_SITE_CONFIG = {
  key: "global",
  heroTitle: "Gabriela's Flowers LLC",
  heroSlogan: "Arreglos florales exclusivos y detalles de lujo diseñados para sorprender a quien más amas.",
  heroButtonText: "Explorar Colección",
  footerTitle: "Gabriela's Flowers LLC",
  footerSlogan: "Boutique Digital de Alta Floristería • Entregas a Domicilio",
  footerCopyright: "© 2026 Gabriela's Flowers LLC. Todos los derechos reservados.",
  productColumnsDesktop: 3,
  productColumnsMobile: 2,
  logoUrl: "/logo.jpg",
  brandSlogan: "Boutique Floral Digital • Houston, Texas",
  menuHomeLabel: "Inicio",
  menuCatalogLabel: "Colección",
  menuTrackingLabel: "📦 Rastreo",
  menuAboutLabel: "Nosotros",
  menuContactLabel: "Contacto",
  primaryColor: "#FF97A4",
  enableHeaderSocials: true,
  facebookUrl: "https://facebook.com",
  instagramUrl: "https://instagram.com",
  tiktokUrl: "https://tiktok.com",
  whatsappUrl: "https://wa.me/18323911835",
  enableSocialFeed: true,
  socialFeedTitle: "Síguenos en Instagram & TikTok 📸",
  socialEmbedHtml: "",
  enableReviewsSection: true,
  reviewsTitle: "Lo que dicen nuestros clientes en Houston ⭐⭐⭐⭐⭐",
  reviewsRatingScore: "4.9 / 5.0",
  reviewsCountText: "+180 Opiniones Verificadas",
  trustpilotWidgetHtml: "",
  enableCustomIframe: false,
  customIframeTitle: "Ubicación & Promociones Destacadas",
  customIframeHtml: "",
  enableChatbot: true,
  dialogflowAgentId: "",
  dialogflowProjectId: "",
  dialogflowLocation: "us-central1",
  dialogflowLanguageCode: "es",
  dialogflowChatTitle: "Gabriela's Flowers Virtual Assistant 🌸"
};

export async function getSiteConfig() {
  await dbConnect();
  try {
    let config = await SiteConfig.findOne({ key: "global" }).lean();
    if (!config) {
      config = await SiteConfig.create(DEFAULT_SITE_CONFIG);
    }
    return { success: true, data: JSON.parse(JSON.stringify(config)) };
  } catch (error) {
    console.error("Error al obtener configuración del sitio:", error);
    return { success: true, data: DEFAULT_SITE_CONFIG };
  }
}

export async function updateSiteConfig(formData: FormData) {
  await dbConnect();
  try {
    const existing = await SiteConfig.findOne({ key: "global" }).lean();
    const prev = (existing as any) || DEFAULT_SITE_CONFIG;

    const getValue = (key: string, fallback: any) => {
      const val = formData.get(key);
      if (val !== null && val !== undefined) return val as string;
      return prev[key as keyof typeof prev] ?? fallback;
    };

    const getBool = (key: string, fallback: boolean) => {
      if (formData.has(key)) {
        return formData.get(key) === "true";
      }
      return prev[key as keyof typeof prev] !== undefined ? Boolean(prev[key as keyof typeof prev]) : fallback;
    };

    const heroTitle = getValue("heroTitle", DEFAULT_SITE_CONFIG.heroTitle);
    const heroSlogan = getValue("heroSlogan", DEFAULT_SITE_CONFIG.heroSlogan);
    const heroButtonText = getValue("heroButtonText", DEFAULT_SITE_CONFIG.heroButtonText);
    const footerTitle = getValue("footerTitle", DEFAULT_SITE_CONFIG.footerTitle);
    const footerSlogan = getValue("footerSlogan", DEFAULT_SITE_CONFIG.footerSlogan);
    const footerCopyright = getValue("footerCopyright", DEFAULT_SITE_CONFIG.footerCopyright);

    // Campos de Cuadrícula de Productos
    const productColumnsDesktop = formData.has("productColumnsDesktop")
      ? (parseInt(formData.get("productColumnsDesktop") as string) || 3)
      : (prev.productColumnsDesktop || 3);

    const productColumnsMobile = formData.has("productColumnsMobile")
      ? (parseInt(formData.get("productColumnsMobile") as string) || 2)
      : (prev.productColumnsMobile || 2);

    // Identidad y Menú
    const logoUrl = getValue("logoUrl", "/logo.jpg");
    const brandSlogan = getValue("brandSlogan", DEFAULT_SITE_CONFIG.brandSlogan);
    const menuHomeLabel = getValue("menuHomeLabel", DEFAULT_SITE_CONFIG.menuHomeLabel);
    const menuCatalogLabel = getValue("menuCatalogLabel", DEFAULT_SITE_CONFIG.menuCatalogLabel);
    const menuTrackingLabel = getValue("menuTrackingLabel", DEFAULT_SITE_CONFIG.menuTrackingLabel);
    const menuAboutLabel = getValue("menuAboutLabel", DEFAULT_SITE_CONFIG.menuAboutLabel);
    const menuContactLabel = getValue("menuContactLabel", DEFAULT_SITE_CONFIG.menuContactLabel);
    const primaryColor = getValue("primaryColor", "#FF97A4");

    // Redes Sociales en Cabecera (Toggle ON/OFF)
    const enableHeaderSocials = getBool("enableHeaderSocials", true);
    const facebookUrl = getValue("facebookUrl", "");
    const instagramUrl = getValue("instagramUrl", "");
    const tiktokUrl = getValue("tiktokUrl", "");
    const whatsappUrl = getValue("whatsappUrl", "");

    // Módulo Social de Instagram/TikTok (Toggle ON/OFF)
    const enableSocialFeed = getBool("enableSocialFeed", true);
    const socialFeedTitle = getValue("socialFeedTitle", DEFAULT_SITE_CONFIG.socialFeedTitle);
    const socialEmbedHtml = getValue("socialEmbedHtml", "");

    // Módulo de Reseñas / Opiniones & Trustpilot (Toggle ON/OFF)
    const enableReviewsSection = getBool("enableReviewsSection", true);
    const reviewsTitle = getValue("reviewsTitle", DEFAULT_SITE_CONFIG.reviewsTitle);
    const reviewsRatingScore = getValue("reviewsRatingScore", DEFAULT_SITE_CONFIG.reviewsRatingScore);
    const reviewsCountText = getValue("reviewsCountText", DEFAULT_SITE_CONFIG.reviewsCountText);
    const trustpilotWidgetHtml = getValue("trustpilotWidgetHtml", "");

    // Módulo de iFrames / Widgets (Toggle ON/OFF)
    const enableCustomIframe = getBool("enableCustomIframe", false);
    const customIframeTitle = getValue("customIframeTitle", DEFAULT_SITE_CONFIG.customIframeTitle);
    const customIframeHtml = getValue("customIframeHtml", "");

    // Módulo de Chatbot Dialogflow CX (Toggle ON/OFF)
    const enableChatbot = getBool("enableChatbot", true);
    const dialogflowAgentId = getValue("dialogflowAgentId", "");
    const dialogflowProjectId = getValue("dialogflowProjectId", "");
    const dialogflowLocation = getValue("dialogflowLocation", "us-central1");
    const dialogflowLanguageCode = getValue("dialogflowLanguageCode", "es");
    const dialogflowChatTitle = getValue("dialogflowChatTitle", "Gabriela's Flowers Virtual Assistant 🌸");

    await SiteConfig.findOneAndUpdate(
      { key: "global" },
      {
        heroTitle,
        heroSlogan,
        heroButtonText,
        footerTitle,
        footerSlogan,
        footerCopyright,
        productColumnsDesktop,
        productColumnsMobile,
        logoUrl,
        brandSlogan,
        menuHomeLabel,
        menuCatalogLabel,
        menuTrackingLabel,
        menuAboutLabel,
        menuContactLabel,
        primaryColor,
        enableHeaderSocials,
        facebookUrl,
        instagramUrl,
        tiktokUrl,
        whatsappUrl,
        enableSocialFeed,
        socialFeedTitle,
        socialEmbedHtml,
        enableReviewsSection,
        reviewsTitle,
        reviewsRatingScore,
        reviewsCountText,
        trustpilotWidgetHtml,
        enableCustomIframe,
        customIframeTitle,
        customIframeHtml,
        enableChatbot,
        dialogflowAgentId,
        dialogflowProjectId,
        dialogflowLocation,
        dialogflowLanguageCode,
        dialogflowChatTitle,
        updatedAt: new Date()
      },
      { upsert: true, new: true }
    );

    revalidatePath("/", "layout");
    revalidatePath("/admin/configuracion");
    return { success: true };
  } catch (error) {
    console.error("Error al actualizar configuración del sitio:", error);
    return { success: false, error: "No se pudo guardar la configuración modular." };
  }
}

export async function updateSeoConfig(formData: FormData) {
  await dbConnect();
  try {
    const seoTitle = formData.get("seoTitle") as string || "";
    const seoDescription = formData.get("seoDescription") as string || "";
    const seoKeywords = formData.get("seoKeywords") as string || "";
    const ogImage = formData.get("ogImage") as string || "";
    const googleSiteVerification = formData.get("googleSiteVerification") as string || "";
    const bingSiteVerification = formData.get("bingSiteVerification") as string || "";
    const googleAnalyticsId = formData.get("googleAnalyticsId") as string || "";
    const businessName = formData.get("businessName") as string || "";
    const businessPhone = formData.get("businessPhone") as string || "";
    const businessAddress = formData.get("businessAddress") as string || "";
    const businessCity = formData.get("businessCity") as string || "";

    await SiteConfig.findOneAndUpdate(
      { key: "global" },
      {
        seoTitle,
        seoDescription,
        seoKeywords,
        ogImage,
        googleSiteVerification,
        bingSiteVerification,
        googleAnalyticsId,
        businessName,
        businessPhone,
        businessAddress,
        businessCity,
        updatedAt: new Date()
      },
      { upsert: true, new: true }
    );

    revalidatePath("/", "layout");
    revalidatePath("/admin/seo");
    return { success: true };
  } catch (error) {
    console.error("Error al actualizar configuración SEO:", error);
    return { success: false, error: "No se pudieron guardar las configuraciones de SEO." };
  }
}

import mongoose, { Schema, Document } from "mongoose";

export interface ISiteConfig extends Document {
  key: string; // "global"
  heroTitle: string;
  heroSlogan: string;
  heroButtonText: string;
  footerTitle: string;
  footerSlogan: string;
  footerCopyright: string;

  // Personalización del Home & Cuadrícula de Productos
  productColumnsDesktop?: number; // 3, 4, o 5 columnas
  productColumnsMobile?: number;  // 1 o 2 columnas

  // Identidad de Marca y Menú de Navegación
  logoUrl?: string;
  brandSlogan?: string;
  menuHomeLabel?: string;
  menuCatalogLabel?: string;
  menuTrackingLabel?: string;
  menuAboutLabel?: string;
  menuContactLabel?: string;
  primaryColor?: string;

  // Redes Sociales en Cabecera
  enableHeaderSocials?: boolean;
  facebookUrl?: string;
  instagramUrl?: string;
  tiktokUrl?: string;
  whatsappUrl?: string;

  // Módulo Social de Instagram / TikTok (Pre-Footer)
  enableSocialFeed?: boolean;
  socialFeedTitle?: string;
  socialEmbedHtml?: string;

  // Módulo de Reseñas / Opiniones & Trustpilot (Pre-Footer)
  enableReviewsSection?: boolean;
  reviewsTitle?: string;
  reviewsRatingScore?: string;
  reviewsCountText?: string;
  trustpilotWidgetHtml?: string;

  // Módulo de iFrames / Widgets Personalizados
  enableCustomIframe?: boolean;
  customIframeTitle?: string;
  customIframeHtml?: string;

  // Módulo de Chatbot Inteligente Dialogflow CX
  enableChatbot?: boolean;
  dialogflowAgentId?: string;
  dialogflowProjectId?: string;
  dialogflowLocation?: string;
  dialogflowLanguageCode?: string;
  dialogflowChatTitle?: string;

  // Campos de 2FA (Seguridad de Dos Factores)
  twoFactorMode?: "none" | "pin" | "totp";
  twoFactorPin?: string;
  twoFactorSecret?: string;

  // Código OTP de rescate por email de emergencia
  rescueOtpCode?: string;
  rescueOtpExpiresAt?: Date;

  // Campos de Optimización SEO y Google Maps
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
  ogImage?: string;
  googleSiteVerification?: string;
  bingSiteVerification?: string;
  googleAnalyticsId?: string;
  businessName?: string;
  businessPhone?: string;
  businessAddress?: string;
  businessCity?: string;

  updatedAt: Date;
}

const SiteConfigSchema: Schema = new Schema({
  key: { type: String, required: true, unique: true, default: "global" },
  heroTitle: { type: String, default: "Gabriela's Flowers LLC" },
  heroSlogan: { type: String, default: "Arreglos florales exclusivos y detalles de lujo diseñados para sorprender a quien más amas." },
  heroButtonText: { type: String, default: "Explorar Colección" },
  footerTitle: { type: String, default: "Gabriela's Flowers LLC" },
  footerSlogan: { type: String, default: "Boutique Digital de Alta Floristería • Entregas a Domicilio" },
  footerCopyright: { type: String, default: "© 2026 Gabriela's Flowers LLC. Todos los derechos reservados." },

  // Personalización del Home & Cuadrícula (Por defecto 3 columnas en escritorio = Preservación 100%)
  productColumnsDesktop: { type: Number, default: 3 },
  productColumnsMobile: { type: Number, default: 2 },

  // Identidad de Marca y Menú
  logoUrl: { type: String, default: "/logo.jpg" },
  brandSlogan: { type: String, default: "Boutique Floral Digital • Houston, Texas" },
  menuHomeLabel: { type: String, default: "Inicio" },
  menuCatalogLabel: { type: String, default: "Colección" },
  menuTrackingLabel: { type: String, default: "📦 Rastreo" },
  menuAboutLabel: { type: String, default: "Nosotros" },
  menuContactLabel: { type: String, default: "Contacto" },
  primaryColor: { type: String, default: "#FF97A4" },

  // Redes Sociales en Cabecera
  enableHeaderSocials: { type: Boolean, default: true },
  facebookUrl: { type: String, default: "https://facebook.com" },
  instagramUrl: { type: String, default: "https://instagram.com" },
  tiktokUrl: { type: String, default: "https://tiktok.com" },
  whatsappUrl: { type: String, default: "https://wa.me/18323911835" },

  // Módulo Social Pre-Footer (Incrustados Instagram/TikTok)
  enableSocialFeed: { type: Boolean, default: true },
  socialFeedTitle: { type: String, default: "Síguenos en Instagram & TikTok 📸" },
  socialEmbedHtml: { type: String, default: "" },

  // Módulo de Reseñas / Opiniones & Trustpilot (Pre-Footer)
  enableReviewsSection: { type: Boolean, default: true },
  reviewsTitle: { type: String, default: "Lo que dicen nuestros clientes en Houston ⭐⭐⭐⭐⭐" },
  reviewsRatingScore: { type: String, default: "4.9 / 5.0" },
  reviewsCountText: { type: String, default: "+180 Opiniones Verificadas" },
  trustpilotWidgetHtml: { type: String, default: "" },

  // Módulo de iFrames Personalizados
  enableCustomIframe: { type: Boolean, default: false },
  customIframeTitle: { type: String, default: "Ubicación & Promociones Destacadas" },
  customIframeHtml: { type: String, default: "" },

  // Módulo de Chatbot Inteligente Dialogflow CX
  enableChatbot: { type: Boolean, default: true },
  dialogflowAgentId: { type: String, default: "" },
  dialogflowProjectId: { type: String, default: "" },
  dialogflowLocation: { type: String, default: "us-central1" },
  dialogflowLanguageCode: { type: String, default: "es" },
  dialogflowChatTitle: { type: String, default: "Gabriela's Flowers Virtual Assistant 🌸" },

  twoFactorMode: { type: String, default: "none" },
  twoFactorPin: { type: String, default: "" },
  twoFactorSecret: { type: String, default: "" },

  rescueOtpCode: { type: String, default: "" },
  rescueOtpExpiresAt: { type: Date, default: null },

  // Campos SEO por defecto
  seoTitle: { type: String, default: "Gabriela's Flowers LLC | Boutique Digital de Alta Floristería" },
  seoDescription: { type: String, default: "Floristería exclusiva con arreglos florales de lujo, rosas y detalles personalizados a domicilio con entrega express." },
  seoKeywords: { type: String, default: "floristeria, flores a domicilio, arreglos florales, rosas, ramos de flores, regalos" },
  ogImage: { type: String, default: "https://images.unsplash.com/photo-1563241527-3004b7be0ffd?w=1200" },
  googleSiteVerification: { type: String, default: "" },
  bingSiteVerification: { type: String, default: "" },
  googleAnalyticsId: { type: String, default: "" },
  businessName: { type: String, default: "Gabriela's Flowers LLC" },
  businessPhone: { type: String, default: "+1 (800) 555-3569" },
  businessAddress: { type: String, default: "4201 Fairmont Pkwy" },
  businessCity: { type: String, default: "Pasadena, TX 77504" },

  updatedAt: { type: Date, default: Date.now }
});

export const SiteConfig = mongoose.models.SiteConfig || mongoose.model<ISiteConfig>("SiteConfig", SiteConfigSchema);

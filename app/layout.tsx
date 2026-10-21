import type { Metadata, Viewport } from "next";
import "./globals.css";
import { CartProvider } from "@/components/shop/Cart/CartContext";
import { NextIntlClientProvider } from 'next-intl';
import esMessages from '@/messages/es.json';
import { ThemeProvider } from "@/components/ThemeProvider";
import { InstallPrompt } from "@/components/pwa/InstallPrompt";
import { AnalyticsTracker } from "@/components/analytics/AnalyticsTracker";
import Script from "next/script";
import dynamic from "next/dynamic";
import { getThemeConfigAction } from "@/lib/actions/theme";

const CookieConsent = dynamic(() => import("@/components/CookieConsent").then((m) => m.CookieConsent));
const PedidoFlotante = dynamic(() => import("@/components/shop/PedidoFlotante").then((m) => m.PedidoFlotante));
const ShoppingCartComponent = dynamic(() => import("@/components/shop/Cart/ShoppingCart").then((m) => m.ShoppingCartComponent));
const ChatbotModal = dynamic(() => import("@/components/shop/Chatbot/ChatbotModal").then((m) => m.ChatbotModal));
const LeadCaptureFloatingWidget = dynamic(() => import("@/components/shop/LeadCaptureFloatingWidget").then((m) => m.LeadCaptureFloatingWidget));

import { Playfair_Display, Montserrat, Plus_Jakarta_Sans, Manrope, Great_Vibes } from "next/font/google";

const greatVibes = Great_Vibes({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-great-vibes",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "700"],
  style: ["normal", "italic"],
  variable: "--font-playfair",
  display: "swap",
});

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-montserrat",
  display: "swap",
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["500", "700"],
  variable: "--font-plus-jakarta",
  display: "swap",
});

const manrope = Manrope({
  subsets: ["latin"],
  weight: ["500", "700"],
  variable: "--font-manrope",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Bonbon Flowers Houston",
  description: "Boutique floral de lujo en Houston, TX con envíos a domicilio",
  manifest: "/manifest.json",
  icons: {
    icon: "https://bonbonflowershouston.com/logo.png",
    apple: "https://bonbonflowershouston.com/logo.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#FFFFFF",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const themeRes = await getThemeConfigAction();
  const theme = themeRes.theme;

  return (
    <html lang="es" className={`${playfair.variable} ${montserrat.variable} ${plusJakarta.variable} ${manrope.variable} ${greatVibes.variable}`} suppressHydrationWarning>
      <head>
        <link rel="icon" href="https://bonbonflowershouston.com/logo.png" />
        <link rel="preconnect" href="https://ik.imagekit.io" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://images.unsplash.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://ik.imagekit.io" />
        <link rel="dns-prefetch" href="https://images.unsplash.com" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="trustpilot-one-time-domain-verification-id" content="e993157a-ecc6-48b6-985d-bca8eebb5fb2" />

        {/* Variables dinámicas del Editor de Tema para la Home y Componentes */}
        <style
          id="dynamic-theme-vars"
          dangerouslySetInnerHTML={{
            __html: `
              :root {
                --theme-announcement-bg: ${theme.announcementBg || "#33cccc"};
                --theme-announcement-text: ${theme.announcementText || "#1c1917"};
                --theme-header-bg: ${theme.headerBg || "#ffffff"};
                --theme-header-text: ${theme.headerText || "#163422"};
                --theme-btn-primary-bg: ${theme.buttonPrimaryBg || "#163422"};
                --theme-btn-primary-text: ${theme.buttonPrimaryText || "#ffffff"};
                --theme-btn-primary-hover: ${theme.buttonPrimaryHoverBg || "#1F452E"};
                --theme-btn-secondary-bg: ${theme.buttonSecondaryBg || "#FF97A4"};
                --theme-btn-secondary-text: ${theme.buttonSecondaryText || "#ffffff"};
                --theme-accent: ${theme.accentColor || "#C5A059"};
                --theme-heading: ${theme.headingColor || "#163422"};
                --theme-body: ${theme.bodyTextColor || "#4A5568"};
                --theme-script: ${theme.scriptTextColor || "#163422"};
                --theme-footer-bg: ${theme.footerBg || "#ffffff"};
                --theme-footer-text: ${theme.footerText || "#1c1917"};
                --theme-footer-accent: ${theme.footerAccent || "#163422"};
                --theme-page-bg: ${theme.pageBg || "#FDFBF7"};
                --theme-card-bg: ${theme.cardBg || "#ffffff"};
                --theme-card-border: ${theme.cardBorder || "#f3f4f6"};
                --theme-price-color: ${theme.priceColor || "#163422"};
                --theme-badge-bg: ${theme.badgeBg || "#FF97A4"};
                --theme-badge-text: ${theme.badgeText || "#ffffff"};
              }

              /* Tipografía Cursiva en Home y Hero */
              .font-script-custom:not(.preserve-color) {
                color: var(--theme-script, #163422) !important;
              }

              /* Botones Primarios de Conversión */
              .theme-btn-primary,
              button.bg-\\[\\#163422\\],
              a.bg-\\[\\#163422\\] {
                background-color: var(--theme-btn-primary-bg, #163422) !important;
                color: var(--theme-btn-primary-text, #ffffff) !important;
              }
              button.bg-\\[\\#163422\\]:hover,
              a.bg-\\[\\#163422\\]:hover {
                background-color: var(--theme-btn-primary-hover, #1F452E) !important;
              }

              /* Botones e Insignias Secundarias */
              .theme-btn-secondary,
              button.bg-\\[\\#FF97A4\\],
              a.bg-\\[\\#FF97A4\\],
              span.bg-\\[\\#FF97A4\\] {
                background-color: var(--theme-btn-secondary-bg, #FF97A4) !important;
                color: var(--theme-btn-secondary-text, #ffffff) !important;
              }
            `,
          }}
        />
        
        {/* Script Oficial Permanente de Integración e Invitaciones de Trustpilot */}
        <Script
          id="trustpilot-invite-script"
          strategy="lazyOnload"
          dangerouslySetInnerHTML={{
            __html: `
              (function(w,d,s,r,n){w.TrustpilotObject=n;w[n]=w[n]||function(){(w[n].q=w[n].q||[]).push(arguments)};
              a=d.createElement(s);a.async=1;a.src=r;a.type='text/java'+s;f=d.getElementsByTagName(s)[0];
              f.parentNode.insertBefore(a,f)})(window,document,'script', 'https://invitejs.trustpilot.com/tp.min.js', 'tp');
              tp('register', 'Mj2BoVbFWujG5sRE');
            `,
          }}
        />
      </head>
      <body className="font-sans antialiased">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <NextIntlClientProvider locale="es" messages={esMessages}>
            <CartProvider>
              <PedidoFlotante />
              <ShoppingCartComponent />
              <LeadCaptureFloatingWidget />
              {children}
              <ChatbotModal />
              <CookieConsent />
              <AnalyticsTracker />
              <InstallPrompt />
            </CartProvider>
          </NextIntlClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

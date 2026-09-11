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

const CookieConsent = dynamic(() => import("@/components/CookieConsent").then((m) => m.CookieConsent));
const PedidoFlotante = dynamic(() => import("@/components/shop/PedidoFlotante").then((m) => m.PedidoFlotante));
const ShoppingCartComponent = dynamic(() => import("@/components/shop/Cart/ShoppingCart").then((m) => m.ShoppingCartComponent));
const ChatbotModal = dynamic(() => import("@/components/shop/Chatbot/ChatbotModal").then((m) => m.ChatbotModal));

import { Playfair_Display, Montserrat, Plus_Jakarta_Sans, Manrope } from "next/font/google";

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
  title: "Gabriela's Flowers LLC",
  description: "Boutique floral de lujo con envíos a domicilio",
  manifest: "/manifest.json",
  icons: {
    icon: "/logo.jpg",
    apple: "/logo.jpg",
  },
};

export const viewport: Viewport = {
  themeColor: "#be185d",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={`${playfair.variable} ${montserrat.variable} ${plusJakarta.variable} ${manrope.variable}`} suppressHydrationWarning>
      <head>
        <link rel="icon" href="/logo.jpg" />
        <link rel="preconnect" href="https://ik.imagekit.io" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://images.unsplash.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://ik.imagekit.io" />
        <link rel="dns-prefetch" href="https://images.unsplash.com" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="trustpilot-one-time-domain-verification-id" content="e993157a-ecc6-48b6-985d-bca8eebb5fb2" />
        
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

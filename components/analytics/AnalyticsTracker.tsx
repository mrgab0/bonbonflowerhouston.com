"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { logAnalyticsEventAction } from "@/lib/actions/analytics";

export function AnalyticsTracker() {
  const pathname = usePathname();

  useEffect(() => {
    // Evitar registrar accesos al panel de administración o rutas de API
    if (pathname.startsWith("/admin") || pathname.startsWith("/api")) {
      return;
    }

    const device = window.innerWidth <= 768 ? "mobile" : "desktop";

    // Detectar fuente de tráfico por el referrer
    let referrer = "direct";
    const ref = document.referrer.toLowerCase();
    if (ref.includes("google")) referrer = "google";
    else if (ref.includes("instagram")) referrer = "instagram";
    else if (ref.includes("whatsapp") || ref.includes("wa.me")) referrer = "whatsapp";
    else if (ref.includes("facebook") || ref.includes("fb")) referrer = "facebook";
    else if (ref.length > 0) referrer = "otro";

    // Tipo de evento
    let type: "visit" | "product_view" = "visit";
    let productName = "";

    if (pathname.startsWith("/productos/")) {
      type = "product_view";
      const slugParts = pathname.split("/");
      productName = slugParts[slugParts.length - 1].replace(/-/g, " ");
    }

    // Registrar de forma diferida en tiempo de ocio del CPU para evitar TBT
    const track = () => {
      logAnalyticsEventAction({
        type,
        path: pathname,
        productName,
        referrer,
        device
      });
    };

    if (typeof window !== "undefined" && "requestIdleCallback" in window) {
      (window as any).requestIdleCallback(track, { timeout: 2000 });
    } else {
      setTimeout(track, 1200);
    }
  }, [pathname]);

  return null;
}

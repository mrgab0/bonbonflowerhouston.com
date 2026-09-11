"use server";

import dbConnect from "@/lib/db";
import { AnalyticsEvent } from "@/lib/models/AnalyticsEvent";
import { revalidatePath } from "next/cache";

export async function logAnalyticsEventAction(data: {
  type: "visit" | "product_view" | "cart_add" | "cart_abandon" | "checkout_start" | "purchase";
  path: string;
  productId?: string;
  productName?: string;
  price?: number;
  referrer?: string;
  device?: "mobile" | "desktop" | "tablet";
  customerName?: string;
  customerPhone?: string;
  cartItems?: Array<{
    productId: string;
    name: string;
    price: number;
    image?: string;
  }>;
}) {
  try {
    await dbConnect();
    await AnalyticsEvent.create({
      type: data.type,
      path: data.path,
      productId: data.productId || "",
      productName: data.productName || "",
      price: data.price || 0,
      referrer: data.referrer || "direct",
      device: data.device || "desktop",
      customerName: data.customerName || "",
      customerPhone: data.customerPhone || "",
      cartItems: data.cartItems || [],
      createdAt: new Date()
    });
    return { success: true };
  } catch (error) {
    console.error("Error al registrar evento de analítica:", error);
    return { success: false };
  }
}

export async function getAnalyticsSummaryAction(days: number = 7) {
  try {
    await dbConnect();

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // 1. Total de Visitas y Vistas de Producto
    const visits = await AnalyticsEvent.countDocuments({
      type: "visit",
      createdAt: { $gte: startDate }
    });

    const productViewsCount = await AnalyticsEvent.countDocuments({
      type: "product_view",
      createdAt: { $gte: startDate }
    });

    // 2. Fuentes de Tráfico (Google, Instagram, WhatsApp, Directo)
    const trafficSourcesRaw = await AnalyticsEvent.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      { $group: { _id: "$referrer", count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    const trafficSources = trafficSourcesRaw.map((item) => ({
      source: item._id || "Directo",
      count: item.count
    }));

    // 3. Distribución por Dispositivo
    const devicesRaw = await AnalyticsEvent.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      { $group: { _id: "$device", count: { $sum: 1 } } }
    ]);

    const devices = devicesRaw.map((item) => ({
      device: item._id || "desktop",
      count: item.count
    }));

    // 4. Productos Más Vistos
    const topProductsRaw = await AnalyticsEvent.aggregate([
      { $match: { type: "product_view", createdAt: { $gte: startDate } } },
      { $group: { _id: "$productName", count: { $sum: 1 }, price: { $first: "$price" } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    const topProducts = topProductsRaw.map((p) => ({
      name: p._id || "Producto sin nombre",
      views: p.count,
      price: p.price || 0
    }));

    // 5. Lista de Carritos Abandonados Recientes
    const abandonedCartsRaw = await AnalyticsEvent.find({
      type: "cart_abandon",
      createdAt: { $gte: startDate }
    })
      .sort({ createdAt: -1 })
      .limit(15)
      .lean();

    const abandonedCarts = JSON.parse(JSON.stringify(abandonedCartsRaw));

    // Valor Total Estimado de Carritos Abandonados
    const totalAbandonedValue = abandonedCarts.reduce((acc: number, cart: any) => {
      const itemsSum = (cart.cartItems || []).reduce((sum: number, item: any) => sum + (item.price || 0), 0);
      return acc + (itemsSum > 0 ? itemsSum : (cart.price || 0));
    }, 0);

    return {
      success: true,
      data: {
        totalVisits: visits,
        totalProductViews: productViewsCount,
        trafficSources,
        devices,
        topProducts,
        abandonedCarts,
        totalAbandonedValue,
        abandonedCount: abandonedCarts.length
      }
    };
  } catch (error) {
    console.error("Error al generar resumen de analíticas:", error);
    return {
      success: false,
      error: "No se pudieron cargar las estadísticas."
    };
  }
}

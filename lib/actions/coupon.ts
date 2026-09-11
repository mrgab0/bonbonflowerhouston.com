"use server";

import dbConnect from "@/lib/db";
import { Coupon } from "@/lib/models/Coupon";
import { Order } from "@/lib/models/Order";
import { revalidatePath } from "next/cache";

export async function validateCoupon(code: string, subtotal: number = 0) {
  await dbConnect();
  try {
    const cleanCode = code.trim().toUpperCase();
    const coupon: any = await Coupon.findOne({ code: cleanCode, isActive: true }).lean();

    if (!coupon) {
      return { success: false, error: "El código de cupón no existe o ha expirado." };
    }

    if (coupon.maxUses > 0 && coupon.usedCount >= coupon.maxUses) {
      return { success: false, error: "Este cupón ha alcanzado el límite máximo de usos." };
    }

    if (coupon.minPurchase && subtotal < coupon.minPurchase) {
      return {
        success: false,
        error: `Este cupón requiere una compra mínima de $${coupon.minPurchase.toFixed(2)} USD.`,
      };
    }

    return {
      success: true,
      coupon: {
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        maxUses: coupon.maxUses,
        usedCount: coupon.usedCount,
      },
    };
  } catch (error) {
    console.error("Error al validar cupón:", error);
    return { success: false, error: "Error al validar el cupón." };
  }
}

export async function checkAutoLaunchCoupon() {
  await dbConnect();
  try {
    // 1. Contamos el total de órdenes completadas hasta ahora en MongoDB
    const totalOrders = await Order.countDocuments({});

    // 2. Buscamos si hay un cupón de lanzamiento automático configurado (o por defecto si hay < 10 órdenes)
    const autoCoupon: any = await Coupon.findOne({ isAutoLaunch: true, isActive: true }).lean();

    if (autoCoupon) {
      if (autoCoupon.maxUses > 0 && autoCoupon.usedCount >= autoCoupon.maxUses) {
        return { success: false, isAutoAvailable: false };
      }

      return {
        success: true,
        isAutoAvailable: true,
        orderIndex: totalOrders + 1,
        maxUses: autoCoupon.maxUses,
        coupon: {
          code: autoCoupon.code,
          discountType: autoCoupon.discountType,
          discountValue: autoCoupon.discountValue,
          isAutoLaunch: true,
        },
      };
    }

    // Si no hay cupón configurado aún, por defecto aplicamos la regla de "Primeros 10 Clientes" si totalOrders < 10
    if (totalOrders < 10) {
      return {
        success: true,
        isAutoAvailable: true,
        orderIndex: totalOrders + 1,
        maxUses: 10,
        coupon: {
          code: "PRIMEROS10",
          discountType: "percentage",
          discountValue: 10, // 10% de descuento automático de inauguración
          isAutoLaunch: true,
        },
      };
    }

    return { success: false, isAutoAvailable: false };
  } catch (error) {
    console.error("Error al verificar cupón automático de lanzamiento:", error);
    return { success: false, isAutoAvailable: false };
  }
}

export async function getCouponsAdmin() {
  await dbConnect();
  try {
    const coupons = await Coupon.find({}).sort({ createdAt: -1 }).lean();
    return { success: true, data: JSON.parse(JSON.stringify(coupons)) };
  } catch (error) {
    return { success: false, error: "Error al obtener cupones." };
  }
}

export async function createCoupon(formData: FormData) {
  await dbConnect();
  try {
    const code = (formData.get("code") as string || "").toUpperCase().trim();
    const discountType = (formData.get("discountType") as string) || "percentage";
    const discountValue = parseFloat(formData.get("discountValue") as string) || 0;
    const maxUses = parseInt(formData.get("maxUses") as string) || 10;
    const minPurchase = parseFloat(formData.get("minPurchase") as string) || 0;
    const isAutoLaunch = formData.get("isAutoLaunch") === "true";

    if (!code) return { success: false, error: "El código de cupón es obligatorio." };

    await Coupon.create({
      code,
      discountType,
      discountValue,
      maxUses,
      minPurchase,
      isAutoLaunch,
      isActive: true,
    });

    revalidatePath("/admin/cupones");
    return { success: true };
  } catch (error: any) {
    console.error("Error al crear cupón:", error);
    if (error.code === 11000) {
      return { success: false, error: "Ya existe un cupón con ese código exacto." };
    }
    return { success: false, error: "Error al crear el cupón." };
  }
}

export async function toggleCouponStatus(id: string, isActive: boolean) {
  await dbConnect();
  try {
    await Coupon.findByIdAndUpdate(id, { isActive });
    revalidatePath("/admin/cupones");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Error al actualizar estado del cupón." };
  }
}

export async function deleteCoupon(id: string) {
  await dbConnect();
  try {
    await Coupon.findByIdAndDelete(id);
    revalidatePath("/admin/cupones");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Error al eliminar cupón." };
  }
}

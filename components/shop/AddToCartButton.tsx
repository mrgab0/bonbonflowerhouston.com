"use client";

import { useCart } from "@/components/shop/Cart/CartContext";
import { useTranslations } from "next-intl";

export const AddToCartButton = ({ product }: { product: any }) => {
  const { addToCart } = useCart();
  const t = useTranslations("ProductDetail");

  return (
    <button 
      onClick={() => addToCart({ 
        id: product._id.toString(), 
        name: product.name, 
        price: product.price, 
        image: product.images[0],
        addons: product.selectedAddons
      })}
      className="bg-[#FF97A4] text-white px-10 py-4 rounded-full font-bold text-lg hover:bg-[#B0004A] transition-all shadow-lg shadow-[#FF97A4]/20 hover:scale-105 active:scale-95"
    >
      {t('addToCart')}
    </button>
  );
};

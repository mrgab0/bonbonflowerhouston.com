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
      className="w-full sm:w-auto bg-[#163422] hover:bg-[#1B2E22] dark:bg-[#5EEAD4] dark:hover:bg-[#2DD4BF] text-white dark:text-stone-950 px-10 py-4 rounded-full font-bold text-lg transition-all shadow-lg shadow-[#163422]/20 dark:shadow-[#5EEAD4]/20 hover:scale-105 active:scale-95 text-center flex items-center justify-center gap-2"
    >
      {t('addToCart')}
    </button>
  );
};

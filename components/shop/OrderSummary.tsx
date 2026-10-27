"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

interface OrderItem {
  id?: string;
  name: string;
  price: number;
  quantity: number;
}

export const OrderSummary = ({
  items = [],
  lang = "es",
}: {
  items: OrderItem[];
  lang?: "es" | "en";
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const isEn = lang === "en";

  return (
    <div className="mb-6">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full p-4 bg-gray-50 dark:bg-stone-900 rounded-xl text-sm font-bold text-gray-700 dark:text-stone-300 hover:bg-gray-100 dark:hover:bg-stone-800 transition-all border border-gray-100 dark:border-stone-800"
      >
        <span>{isEn ? "Review your items" : "Revisar tus productos"}</span>
        {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
      </button>

      {isOpen && (
        <div className="mt-2 p-4 border border-gray-100 dark:border-stone-800 rounded-xl space-y-2 text-left bg-white dark:bg-stone-950">
          {items.map((item, index) => (
            <div key={`${item.id || item.name}-${index}`} className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">
                {item.quantity}x {item.name}
              </span>
              <span className="font-bold text-stone-900 dark:text-white">
                ${(item.price * item.quantity).toFixed(2)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

export const OrderSummary = ({ items }: { items: OrderItem[] }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="mb-6">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full p-4 bg-gray-50 rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-100 transition-all"
      >
        Revisar tus productos
        {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
      </button>
      
      {isOpen && (
        <div className="mt-2 p-4 border rounded-xl space-y-2 text-left">
          {items.map((item, index) => (
            <div key={`${item.id}-${index}`} className="flex justify-between text-sm">
              <span className="text-gray-600">{item.quantity}x {item.name}</span>
              <span className="font-bold">${(item.price * item.quantity).toFixed(2)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Truck } from "lucide-react";
import { usePathname } from "next/navigation";

export const PedidoFlotante = () => {
  const pathname = usePathname();
  const [hasOrder, setHasOrder] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);

  useEffect(() => {
    if (pathname?.startsWith("/admin")) return;
    const savedOrderId = localStorage.getItem("lastOrderId");
    if (savedOrderId) {
      setHasOrder(true);
      setOrderId(savedOrderId);
    }
  }, []);

  if (pathname?.startsWith("/admin") || !hasOrder) return null;

  return (
    <Link 
      href={`/checkout/confirmacion?orderId=${orderId}`}
      className="fixed top-20 left-4 z-[100] flex items-center gap-2 bg-[#1A1C1C] text-white px-4 py-2 rounded-full shadow-lg hover:bg-black transition-all animate-bounce"
    >
      <Truck size={16} className="text-[#FF97A4]" />
      <span className="text-xs font-bold uppercase tracking-widest">Pedido en camino</span>
    </Link>
  );
};

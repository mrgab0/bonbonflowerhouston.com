import { Order } from "@/lib/models/Order";
import dbConnect from "@/lib/db";
import Link from "next/link";
import { CheckCircle2, MessageCircle, Home } from "lucide-react";
import { OrderSummary } from "@/components/shop/OrderSummary";

export default async function ConfirmacionPage({
  searchParams,
}: {
  searchParams: Promise<{ orderId: string }>;
}) {
  const { orderId } = await searchParams;
  await dbConnect();
  
  const orderDoc = await Order.findOne({ orderId }).lean();
  const order = orderDoc ? JSON.parse(JSON.stringify(orderDoc)) : null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F9F9F9] p-6">
      <div className="bg-white p-12 rounded-2xl shadow-xl border border-gray-100 text-center animate-in zoom-in-95 duration-500 max-w-lg w-full">
        <div className="bg-green-100 p-4 rounded-full text-green-600 mb-6 animate-bounce mx-auto w-20">
          <CheckCircle2 size={48} />
        </div>
        <h2 className="text-3xl font-bold text-[#1A1C1C] mb-2">¡Compra Finalizada! 🌹</h2>
        <p className="text-gray-500 mb-6">
          Pronto recibirás tu pedido. Gracias por elegir Gabriela's Flowers LLC.
        </p>
        
        <div className="bg-gray-50 p-4 rounded-xl mb-8">
            <p className="text-sm text-gray-500 uppercase tracking-widest font-bold">Número de Pedido</p>
            <p className="text-2xl font-mono font-bold text-[#D81B60]">{orderId}</p>
        </div>

        {order && <OrderSummary items={order.items} />}

        <div className="flex flex-col gap-4">
          <a 
            href={`https://wa.me/18323911835?text=Hola!%20He%20finalizado%20mi%20pedido%20${orderId}.%20Quisiera%20confirmar%20los%20detalles.`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 bg-green-500 text-white px-6 py-3 rounded-xl font-bold hover:bg-green-600 transition-all"
          >
            <MessageCircle size={20} /> Contactar por WhatsApp
          </a>
          <Link 
            href="/"
            className="flex items-center justify-center gap-2 bg-[#1A1C1C] text-white px-6 py-3 rounded-xl font-bold hover:bg-black transition-all"
          >
            <Home size={20} /> Volver al Inicio
          </Link>
        </div>
      </div>
    </div>
  );
}

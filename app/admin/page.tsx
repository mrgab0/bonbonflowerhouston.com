import { LoginButton } from "@/components/LoginButton";
import Link from "next/link";
import { 
  ShoppingBag, 
  Package, 
  Activity, 
  Image as ImageIcon, 
  Sparkles, 
  Truck, 
  Ticket, 
  CreditCard, 
  Search, 
  Settings 
} from "lucide-react";

export default function AdminPage() {
  const clayBase = "group relative p-6 rounded-2xl font-bold text-center transition-all duration-500 flex flex-col items-center justify-center gap-4 text-white shadow-[inset_-4px_-4px_8px_rgba(0,0,0,0.2),inset_4px_4px_8px_rgba(255,255,255,0.3),4px_4px_16px_rgba(0,0,0,0.1)] dark:shadow-[inset_-4px_-4px_8px_rgba(0,0,0,0.6),inset_4px_4px_8px_rgba(255,255,255,0.08),6px_6px_20px_rgba(0,0,0,0.5)] hover:shadow-[inset_-6px_-6px_12px_rgba(0,0,0,0.25),inset_6px_6px_12px_rgba(255,255,255,0.4),8px_8px_24px_rgba(0,0,0,0.15)] dark:hover:shadow-[inset_-6px_-6px_12px_rgba(0,0,0,0.7),inset_6px_6px_12px_rgba(255,255,255,0.12),8px_8px_28px_rgba(0,0,0,0.6)] hover:-translate-y-2 border border-white/10 dark:border-white/5 dark:!bg-[#161822]";
  const iconBase = "w-12 h-12 transition-transform duration-500";

  return (
    <div className="bg-white/50 dark:bg-[#0F1015] p-8 rounded-[3rem] border border-white/40 dark:border-gray-800 shadow-[inset_0_0_20px_rgba(255,255,255,0.5)] dark:shadow-none space-y-8 backdrop-blur-xl admin-panel-container">
      <div className="text-center md:text-left mb-6">
        <h2 className="text-3xl font-black text-white tracking-tight">Bienvenido al Panel Administrador</h2>
        <p className="text-sm font-semibold text-pink-100 dark:text-gray-400 mt-2">Gestiona los pedidos, envíos, productos, banners, estadísticas, ofertas y SEO de tu floristería de forma interactiva.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <Link href="/admin/ordenes" className={`${clayBase} bg-pink-600`}>
          <ShoppingBag className={`${iconBase} group-hover:scale-125 group-hover:-rotate-12 group-hover:drop-shadow-lg`} strokeWidth={1.5} />
          <span className="text-sm tracking-wide">Gestor de Órdenes & Despacho</span>
        </Link>
        
        <Link href="/admin/productos" className={`${clayBase} bg-blue-600`}>
          <Package className={`${iconBase} group-hover:-translate-y-2 group-hover:scale-110 group-hover:drop-shadow-lg`} strokeWidth={1.5} />
          <span className="text-sm tracking-wide">Gestionar Productos</span>
        </Link>
        
        <Link href="/admin/estadisticas" className={`${clayBase} bg-indigo-600`}>
          {/* Animación especial para Estadísticas */}
          <div className="relative w-12 h-12 flex items-center justify-center">
            <Activity className="w-12 h-12 group-hover:scale-110 transition-transform text-white/40 absolute" strokeWidth={1} />
            <Activity className="w-12 h-12 group-hover:scale-110 transition-transform drop-shadow-md text-white" strokeWidth={2} style={{ strokeDasharray: 100, strokeDashoffset: 100, animation: 'dash 2s ease-in-out infinite' }} />
            <style>{`@keyframes dash { to { stroke-dashoffset: 0; } }`}</style>
          </div>
          <span className="text-sm tracking-wide">Estadísticas & Carritos</span>
        </Link>
        
        <Link href="/admin/sliders" className={`${clayBase} bg-[#FF97A4]`}>
          <ImageIcon className={`${iconBase} group-hover:scale-110 group-hover:rotate-6 group-hover:drop-shadow-lg`} strokeWidth={1.5} />
          <span className="text-sm tracking-wide text-white">Gestionar Banners</span>
        </Link>
        
        <Link href="/admin/adicionales" className={`${clayBase} bg-purple-600`}>
          <Sparkles className={`${iconBase} group-hover:scale-125 group-hover:rotate-180 group-hover:drop-shadow-[0_0_15px_rgba(255,255,255,0.8)]`} strokeWidth={1.5} />
          <span className="text-sm tracking-wide">Gestionar Adicionales</span>
        </Link>
        
        <Link href="/admin/entregas" className={`${clayBase} bg-emerald-500`}>
          <Truck className={`${iconBase} group-hover:translate-x-3 group-hover:drop-shadow-lg`} strokeWidth={1.5} />
          <span className="text-sm tracking-wide">Opciones de Entrega</span>
        </Link>
        
        <Link href="/admin/cupones" className={`${clayBase} bg-amber-500`}>
          <Ticket className={`${iconBase} group-hover:scale-110 group-hover:-rotate-12 group-hover:drop-shadow-lg`} strokeWidth={1.5} />
          <span className="text-sm tracking-wide">Cupones de Descuento</span>
        </Link>
        
        <Link href="/admin/pagos" className={`${clayBase} bg-cyan-600`}>
          <CreditCard className={`${iconBase} group-hover:scale-110 group-hover:-translate-y-1 group-hover:drop-shadow-lg`} strokeWidth={1.5} />
          <span className="text-sm tracking-wide">Cuentas de Pago & QR</span>
        </Link>
        
        <Link href="/admin/seo" className={`${clayBase} bg-teal-600`}>
          <Search className={`${iconBase} group-hover:scale-125 group-hover:rotate-12 group-hover:drop-shadow-lg`} strokeWidth={1.5} />
          <span className="text-sm tracking-wide">Optimización SEO</span>
        </Link>
        
        <Link href="/admin/configuracion" className={`${clayBase} bg-slate-800`}>
          <Settings className={`${iconBase} group-hover:rotate-180 group-hover:drop-shadow-lg`} strokeWidth={1.5} />
          <span className="text-sm tracking-wide text-white">Configuración (2FA & Lemas)</span>
        </Link>
      </div>

      <div className="border-t pt-8 border-gray-200 dark:border-gray-800/50 mt-8">
        <LoginButton />
      </div>
    </div>
  );
}

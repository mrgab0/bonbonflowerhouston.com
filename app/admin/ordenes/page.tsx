"use client";

import { useEffect, useState } from "react";
import { getAllOrdersAction, updateOrderStatusAction, updateOrderWith2FAAction } from "@/lib/actions/order";
import {
  Package, Truck, CheckCircle2, Clock, MapPin, User, MessageCircle, RefreshCw,
  ArrowLeft, Search, Filter, Store, ExternalLink, Calendar, MessageSquare, Heart,
  Edit3, Printer, Lock, X, Save, DollarSign, Globe, Plus, Trash2, ShieldCheck, FileText,
  Receipt, ArrowUpDown
} from "lucide-react";
import Link from "next/link";

export default function AdminOrdenesPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filtros y Búsqueda
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "price-desc" | "price-asc">("newest");
  const [dateFilter, setDateFilter] = useState<"all" | "today" | "7days" | "custom">("all");
  const [customDateVal, setCustomDateVal] = useState("");

  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Estados para Edición + 2FA
  const [editingOrder, setEditingOrder] = useState<any | null>(null);
  const [twoFactorModalOpen, setTwoFactorModalOpen] = useState(false);
  const [twoFactorCode, setTwoFactorCode] = useState("");
  const [submitting2FA, setSubmitting2FA] = useState(false);
  const [twoFactorError, setTwoFactorError] = useState<string | null>(null);

  // Estado para Modal e Impresión de Factura (A4 o Ticket 80mm Star TSP100)
  const [invoiceOrder, setInvoiceOrder] = useState<any | null>(null);
  const [invoiceLang, setInvoiceLang] = useState<"es" | "en">("es");
  const [invoiceFormat, setInvoiceFormat] = useState<"a4" | "ticket80">("a4");

  useEffect(() => {
    loadOrders();
  }, []);

  async function loadOrders() {
    setLoading(true);
    const res = await getAllOrdersAction();
    if (res.success && res.data) {
      setOrders(res.data);
    }
    setLoading(false);
  }

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    setUpdatingId(orderId);
    const res = await updateOrderStatusAction(orderId, newStatus);
    if (res.success) {
      setOrders((prev) =>
        prev.map((o) => (o.orderId === orderId ? { ...o, status: newStatus } : o))
      );
    } else {
      alert("No se pudo actualizar el estado de la orden.");
    }
    setUpdatingId(null);
  };

  const createWhatsAppNotifyUrl = (order: any) => {
    const phone = (order.customerPhone || "").replace(/\D/g, "");
    const siteUrl = typeof window !== "undefined" ? window.location.origin : "https://bonbonflowershouston.com";
    const trackUrl = `${siteUrl}/rastreo`;
    const statusText = order.status || "En Proceso";

    const msg = `¡Hola ${order.customerName}! 🌹 Te notificamos de Bonbon Flowers Houston que tu pedido *${order.orderId}* ha sido actualizado a estado: *${statusText}* ✨\n\nPuedes rastrear el avance en tiempo real aquí: ${trackUrl}`;

    return phone ? `https://wa.me/${phone}?text=${encodeURIComponent(msg)}` : `https://wa.me/?text=${encodeURIComponent(msg)}`;
  };

  // Lógica de Filtrado y Ordenamiento
  const processedOrders = orders
    .filter((order) => {
      // 1. Buscador por ID, Nombre o Teléfono
      const matchesSearch =
        order.orderId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customerPhone?.toLowerCase().includes(searchTerm.toLowerCase());

      if (!matchesSearch) return false;

      // 2. Filtro por Estado
      if (selectedFilter !== "all") {
        const status = (order.status || "").toLowerCase();
        if (selectedFilter === "espera" && !(status.includes("espera") || status.includes("diseño") || status.includes("confirmado"))) return false;
        if (selectedFilter === "camino" && !(status.includes("camino") || status.includes("listo"))) return false;
        if (selectedFilter === "entregado" && !(status.includes("entregado") || status.includes("retirado"))) return false;
      }

      // 3. Filtro por Fecha
      if (dateFilter !== "all") {
        const orderDate = new Date(order.createdAt);
        const today = new Date();

        if (dateFilter === "today") {
          const isToday =
            orderDate.getDate() === today.getDate() &&
            orderDate.getMonth() === today.getMonth() &&
            orderDate.getFullYear() === today.getFullYear();
          if (!isToday) return false;
        } else if (dateFilter === "7days") {
          const diffTime = Math.abs(today.getTime() - orderDate.getTime());
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          if (diffDays > 7) return false;
        } else if (dateFilter === "custom" && customDateVal) {
          const customDate = new Date(customDateVal + "T00:00:00");
          const isSameDay =
            orderDate.getDate() === customDate.getDate() &&
            orderDate.getMonth() === customDate.getMonth() &&
            orderDate.getFullYear() === customDate.getFullYear();
          if (!isSameDay) return false;
        }
      }

      return true;
    })
    .sort((a, b) => {
      if (sortBy === "newest") {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      if (sortBy === "oldest") {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }
      if (sortBy === "price-desc") {
        return (b.total || 0) - (a.total || 0);
      }
      if (sortBy === "price-asc") {
        return (a.total || 0) - (b.total || 0);
      }
      return 0;
    });

  // Manejadores para Modal de Edición 2FA
  const handleOpenEdit = (order: any) => {
    // Clonar la orden para edición
    setEditingOrder(JSON.parse(JSON.stringify(order)));
  };

  const handleEditItemChange = (index: number, field: string, value: any) => {
    if (!editingOrder) return;
    const updatedItems = [...editingOrder.items];
    updatedItems[index] = { ...updatedItems[index], [field]: value };

    // Recalcular subtotal de ítems
    const newItemsTotal = updatedItems.reduce(
      (acc, item) => acc + (parseFloat(item.price) || 0) * (parseInt(item.quantity) || 1),
      0
    );
    const updatedTotal = newItemsTotal + (parseFloat(editingOrder.deliveryFee) || 0) + (parseFloat(editingOrder.taxAmount) || 0);

    setEditingOrder({
      ...editingOrder,
      items: updatedItems,
      total: parseFloat(updatedTotal.toFixed(2)),
    });
  };

  const handlePrompt2FA = async () => {
    if (!editingOrder) return;
    setSubmitting2FA(true);
    setTwoFactorError(null);

    // Guardado directo sin pedir código 2FA
    const res = await updateOrderWith2FAAction(editingOrder.orderId, editingOrder, "BYPASS");

    if (res.success && res.data) {
      setOrders((prev) => prev.map((o) => (o.orderId === editingOrder.orderId ? res.data : o)));
      setTwoFactorModalOpen(false);
      setEditingOrder(null);
      alert("✅ ¡Venta modificada exitosamente!");
    } else {
      alert("❌ " + (res.error || "No se pudieron aplicar los cambios."));
    }
    setSubmitting2FA(false);
  };

  const handleConfirm2FAAndSave = async () => {
    if (!editingOrder || !twoFactorCode.trim()) {
      setTwoFactorError("Ingresa tu código de seguridad 2FA (TOTP o PIN).");
      return;
    }

    setSubmitting2FA(true);
    setTwoFactorError(null);

    const res = await updateOrderWith2FAAction(editingOrder.orderId, editingOrder, twoFactorCode.trim());

    if (res.success && res.data) {
      setOrders((prev) => prev.map((o) => (o.orderId === editingOrder.orderId ? res.data : o)));
      setTwoFactorModalOpen(false);
      setEditingOrder(null);
      alert("✅ ¡Venta modificada exitosamente!");
    } else {
      setTwoFactorError(res.error || "No se pudieron aplicar los cambios. Verifica tu código 2FA.");
    }
    setSubmitting2FA(false);
  };

  // Manejador de Impresión
  const handlePrintInvoice = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-gray-500 font-bold animate-pulse flex flex-col items-center justify-center gap-3">
        <RefreshCw className="animate-spin text-[#FF97A4]" size={28} />
        <span>Cargando Módulo de Despacho & Órdenes...</span>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-16">
      {/* Estilos CSS para Impresión Limpia de Factura (A4 / Carta o Ticket 80mm Star TSP100) */}
      <style jsx global>{`
        @media print {
          @page {
            size: ${invoiceFormat === "ticket80" ? "80mm auto" : "portrait letter"};
            margin: ${invoiceFormat === "ticket80" ? "0mm" : "10mm"};
          }
          body * {
            visibility: hidden;
          }
          #invoice-print-area, #invoice-print-area * {
            visibility: visible;
          }
          #invoice-print-area {
            position: absolute;
            left: 0;
            top: 0;
            width: ${invoiceFormat === "ticket80" ? "72mm !important" : "100% !important"};
            max-width: ${invoiceFormat === "ticket80" ? "72mm !important" : "none !important"};
            background: white !important;
            color: black !important;
            padding: ${invoiceFormat === "ticket80" ? "2mm 2mm !important" : "20px !important"};
            margin: 0 auto !important;
            box-shadow: none !important;
            border: none !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      {/* Encabezado Principal */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-[#12131A] p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm no-print">
        <div className="flex items-center gap-3.5">
          <div className="p-3 bg-pink-50 dark:bg-pink-950/60 text-[#FF97A4] rounded-2xl border border-pink-100 dark:border-pink-900/50">
            <Package size={26} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#1A1C1C] dark:text-white flex items-center gap-2">
              Gestor de Órdenes & Despacho
            </h1>
            <p className="text-xs text-gray-400">Controla, filtra, modifica y emite facturas impresas para tus clientes</p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
          <button
            onClick={loadOrders}
            className="p-2.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-2xl transition-colors"
            title="Recargar Pedidos"
          >
            <RefreshCw size={16} />
          </button>

          <Link
            href="/admin"
            className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 px-4 py-2 rounded-2xl font-bold text-xs hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors flex items-center gap-1.5"
          >
            <ArrowLeft size={14} /> Volver al Admin
          </Link>
        </div>
      </div>

      {/* Banner de Impresora Térmica Star Micronics TSP143III (80mm) */}
      <div className="bg-gradient-to-r from-emerald-950 via-[#163422] to-stone-900 border border-emerald-800/50 text-white p-4 sm:p-5 rounded-3xl shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4 no-print">
        <div className="flex items-center gap-3.5">
          <div className="p-3 bg-emerald-500/20 text-emerald-300 rounded-2xl border border-emerald-500/30">
            <Receipt size={24} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-extrabold uppercase tracking-wide text-white">
                Star Micronics TSP100III (TSP143IIILAN)
              </h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/30 text-emerald-200 border border-emerald-400/40">
                80mm Térmico LAN
              </span>
            </div>
            <p className="text-xs text-stone-300 mt-0.5">
              Formato de ticket adaptado a 72mm imprimibles con corte de guillotina. Impresión dual (A4 y 80mm) y despacho automático en red local.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          <a
            href="/api/pos/printer"
            target="_blank"
            className="bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1 border border-white/10"
            title="Ver órdenes pendientes de impresión en la API"
          >
            <Globe size={13} />
            <span>API POS</span>
          </a>
        </div>
      </div>

      {/* Buscador, Filtros y Ordenamiento */}
      <div className="bg-white dark:bg-[#12131A] p-5 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm space-y-4 no-print">
        {/* Fila 1: Buscador */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-3 text-gray-400" size={16} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por ID de Pedido (ej. FFY-...), Nombre del Cliente o Teléfono..."
            className="w-full pl-10 pr-4 py-2.5 border rounded-2xl text-xs font-medium dark:bg-gray-900 dark:border-gray-800 focus:outline-none focus:ring-2 focus:ring-[#FF97A4]"
          />
        </div>

        {/* Fila 2: Filtros de Estado, Fecha y Orden de Precio */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Estados */}
          <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-2xl font-bold flex-wrap">
            <button
              onClick={() => setSelectedFilter("all")}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                selectedFilter === "all" ? "bg-white dark:bg-gray-900 text-[#FF97A4] shadow-sm" : "text-gray-500"
              }`}
            >
              Todos ({orders.length})
            </button>
            <button
              onClick={() => setSelectedFilter("espera")}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                selectedFilter === "espera" ? "bg-white dark:bg-gray-900 text-[#FF97A4] shadow-sm" : "text-gray-500"
              }`}
            >
              En Preparación
            </button>
            <button
              onClick={() => setSelectedFilter("camino")}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                selectedFilter === "camino" ? "bg-white dark:bg-gray-900 text-[#FF97A4] shadow-sm" : "text-gray-500"
              }`}
            >
              En Camino / Listo
            </button>
            <button
              onClick={() => setSelectedFilter("entregado")}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                selectedFilter === "entregado" ? "bg-white dark:bg-gray-900 text-[#FF97A4] shadow-sm" : "text-gray-500"
              }`}
            >
              Entregados
            </button>
          </div>

          {/* Filtros de Fecha & Rango */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 px-3 py-1.5 rounded-2xl font-semibold text-gray-700 dark:text-gray-300">
              <Calendar size={14} className="text-[#FF97A4]" />
              <select
                value={dateFilter}
                onChange={(e: any) => setDateFilter(e.target.value)}
                className="bg-transparent focus:outline-none text-xs cursor-pointer font-bold"
              >
                <option value="all">Todas las fechas</option>
                <option value="today">Ventas de Hoy</option>
                <option value="7days">Últimos 7 días</option>
                <option value="custom">Fecha Específica</option>
              </select>

              {dateFilter === "custom" && (
                <input
                  type="date"
                  value={customDateVal}
                  onChange={(e) => setCustomDateVal(e.target.value)}
                  className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-2 py-0.5 text-xs text-gray-800 dark:text-gray-100"
                />
              )}
            </div>

            {/* Ordenamiento por Fecha / Precio */}
            <div className="flex items-center gap-1.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 px-3 py-1.5 rounded-2xl font-semibold text-gray-700 dark:text-gray-300">
              <ArrowUpDown size={14} className="text-[#FF97A4]" />
              <select
                value={sortBy}
                onChange={(e: any) => setSortBy(e.target.value)}
                className="bg-transparent focus:outline-none text-xs cursor-pointer font-bold"
              >
                <option value="newest">Más Recientes</option>
                <option value="oldest">Más Antiguas</option>
                <option value="price-desc">Precio: Mayor a Menor</option>
                <option value="price-asc">Precio: Menor a Mayor</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Lista de Órdenes */}
      <div className="space-y-4 no-print">
        {processedOrders.length > 0 ? (
          processedOrders.map((order) => {
            const isPickup = (order.deliveryMethod || "").toLowerCase().includes("pickup") || (order.deliveryMethod || "").toLowerCase().includes("retiro");

            return (
              <div
                key={order._id || order.orderId}
                className="bg-white dark:bg-[#12131A] p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm space-y-4 transition-all hover:border-gray-200 dark:hover:border-gray-700"
              >
                {/* Fila 1: Datos Principales, Acciones de Impresión y Edición 2FA */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 border-b pb-4 border-gray-100 dark:border-gray-800">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-sm text-[#1A1C1C] dark:text-white bg-pink-50 dark:bg-pink-950/60 px-2.5 py-0.5 rounded-lg border border-pink-200 dark:border-pink-900/50">
                        {order.orderId}
                      </span>
                      <span className="text-xs text-gray-400 font-medium flex items-center gap-1">
                        <Calendar size={12} />
                        {new Date(order.createdAt).toLocaleString("es-MX", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-xs pt-1">
                      <span className="font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1">
                        <User size={13} className="text-[#FF97A4]" />
                        {order.customerName}
                      </span>
                      <span className="text-gray-400 font-mono">{order.customerPhone}</span>
                      {order.customerEmail && (
                        <span className="text-gray-400 font-sans hidden sm:inline">({order.customerEmail})</span>
                      )}
                    </div>
                  </div>

                  {/* Acciones: Editar (2FA), Impresión Factura, Cambio de Estado y WhatsApp */}
                  <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-between md:justify-end">
                    {/* Selector de Estado */}
                    <select
                      value={order.status || (isPickup ? "En diseño" : "Confirmado")}
                      onChange={(e) => handleStatusChange(order.orderId, e.target.value)}
                      disabled={updatingId === order.orderId}
                      className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl px-3 py-1.5 text-xs font-bold text-[#1A1C1C] dark:text-white focus:ring-2 focus:ring-[#FF97A4] focus:outline-none"
                    >
                      <option value="Confirmado">🕒 Confirmado</option>
                      <option value="En diseño">🌸 En diseño floral</option>
                      <option value="En espera de despacho">📦 En espera de despacho</option>
                      <option value="En camino">🚚 En camino a ubicación</option>
                      <option value="Listo para retirar">🏪 Listo para retirar en boutique</option>
                      <option value="Entregado">✅ Entregado exitosamente</option>
                      <option value="Retirado">✅ Retirado por cliente</option>
                    </select>

                    {/* Botón Modificar Venta (2FA) */}
                    <button
                      onClick={() => handleOpenEdit(order)}
                      className="bg-amber-500 hover:bg-amber-600 text-white px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1 shadow-sm transition-all"
                      title="Editar Venta (Requiere 2FA)"
                    >
                      <Edit3 size={13} />
                      <span>Modificar</span>
                    </button>

                    {/* Botón Imprimir Factura A4 */}
                    <button
                      onClick={() => {
                        setInvoiceFormat("a4");
                        setInvoiceOrder(order);
                      }}
                      className="bg-slate-800 hover:bg-slate-900 text-white px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1 shadow-sm transition-all"
                      title="Imprimir Factura A4 para Cliente"
                    >
                      <Printer size={13} />
                      <span>Factura A4</span>
                    </button>

                    {/* Botón Imprimir Ticket 80mm Star TSP100 */}
                    <button
                      onClick={() => {
                        setInvoiceFormat("ticket80");
                        setInvoiceOrder(order);
                      }}
                      className="bg-pink-600 hover:bg-pink-700 text-white px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1 shadow-sm transition-all"
                      title="Imprimir Ticket Térmico 80mm (Star Micronics TSP143III)"
                    >
                      <Receipt size={13} />
                      <span>Ticket 80mm</span>
                    </button>

                    {/* Botón WhatsApp */}
                    <a
                      href={createWhatsAppNotifyUrl(order)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1 shadow-sm transition-all"
                    >
                      <MessageCircle size={13} />
                      <span>WhatsApp</span>
                    </a>
                  </div>
                </div>

                {/* Fila 2: Dirección, Dedicatoria y Arreglos Florales */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  {/* Dirección / GPS / Tarjeta de Dedicatoria */}
                  <div className="p-3.5 bg-gray-50 dark:bg-gray-900/60 rounded-2xl space-y-2 border border-gray-100 dark:border-gray-800">
                    <span className="text-[10px] font-bold uppercase text-gray-400 tracking-wider block">
                      {isPickup ? "Método: Retiro en Boutique" : "Dirección de Entrega:"}
                    </span>
                    <p className="font-bold text-gray-800 dark:text-gray-200 flex items-start gap-1">
                      {isPickup ? <Store size={14} className="text-purple-500 flex-shrink-0 mt-0.5" /> : <MapPin size={14} className="text-[#FF97A4] flex-shrink-0 mt-0.5" />}
                      <span>{order.address}</span>
                    </p>

                    {order.googleMapsUrl && (
                      <a
                        href={order.googleMapsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline pt-1"
                      >
                        <ExternalLink size={12} />
                        <span>Abrir en Google Maps GPS</span>
                      </a>
                    )}

                    {order.cardMessage && (
                      <div className="bg-pink-50 dark:bg-pink-950/40 p-2.5 rounded-xl border border-pink-200 dark:border-pink-900/50 text-[11px] space-y-0.5 mt-2">
                        <span className="font-extrabold text-[#FF97A4] flex items-center gap-1">
                          <Heart size={12} className="fill-[#FF97A4]" /> Tarjeta de Dedicatoria Impresa:
                        </span>
                        <p className="font-semibold text-gray-800 dark:text-gray-200 italic">
                          "{order.cardMessage}"
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Arreglos de la Orden con Adicionales y Tax Resaltado */}
                  <div className="p-3.5 bg-gray-50 dark:bg-gray-900/60 rounded-2xl space-y-2 border border-gray-100 dark:border-gray-800">
                    <div className="flex justify-between items-center text-[10px] font-bold uppercase text-gray-400 tracking-wider">
                      <span>Arreglos Florales ({order.items?.length || 0})</span>
                      <div className="text-right">
                        <span className="text-emerald-600 dark:text-emerald-400 font-extrabold text-xs block">${(order.total || 0).toFixed(2)} USD</span>
                        {order.taxAmount ? (
                          <span className="text-[9px] text-purple-600 dark:text-purple-400 font-semibold block">
                            (Sales Tax: +${order.taxAmount.toFixed(2)})
                          </span>
                        ) : null}
                      </div>
                    </div>
                    
                    <div className="space-y-2 font-medium text-gray-700 dark:text-gray-300">
                      {(order.items || []).map((item: any, i: number) => (
                        <div key={i} className="space-y-1 border-b border-gray-200/50 dark:border-gray-800/50 pb-2 last:border-b-0 last:pb-0">
                          <div className="flex justify-between font-bold text-gray-900 dark:text-white">
                            <span>• {item.name} (x{item.quantity})</span>
                            <span>${(item.price * item.quantity).toFixed(2)}</span>
                          </div>

                          {item.addons && item.addons.length > 0 && (
                            <div className="pl-3 space-y-1 mt-1">
                              {item.addons.map((add: any, idx: number) => (
                                <div key={idx} className="bg-pink-50 dark:bg-pink-950/40 p-2 rounded-xl border border-pink-200 dark:border-pink-900/50 text-[11px]">
                                  <span className="font-extrabold text-[#FF97A4] block">
                                    ✨ {add.name || add.value} {add.price ? `(+$${add.price.toFixed(2)})` : ''}
                                  </span>
                                  {add.customText && (
                                    <div className="mt-1 bg-white dark:bg-gray-900 p-2 rounded-lg border border-pink-200 dark:border-pink-900/50 text-gray-800 dark:text-gray-200 font-semibold flex items-start gap-1">
                                      <MessageSquare size={12} className="text-[#FF97A4] flex-shrink-0 mt-0.5" />
                                      <span>Texto / Impresión: <strong className="text-[#FF97A4]">"{add.customText}"</strong></span>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="p-12 text-center bg-white dark:bg-[#12131A] rounded-3xl border border-dashed border-gray-200 dark:border-gray-800 space-y-2">
            <Package className="mx-auto text-gray-400" size={32} />
            <p className="text-sm font-bold text-gray-700 dark:text-gray-300">No se encontraron órdenes registradas con este filtro.</p>
            <p className="text-xs text-gray-400">Intenta cambiar la palabra de búsqueda o el rango de fechas.</p>
          </div>
        )}
      </div>

      {/* ========================================================= */}
      {/* MODAL 1: EDICIÓN DE VENTA (SOLICITA 2FA)                  */}
      {/* ========================================================= */}
      {editingOrder && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto no-print">
          <div className="bg-white dark:bg-[#1A1C23] max-w-2xl w-full rounded-3xl p-6 space-y-5 border border-gray-200 dark:border-gray-800 shadow-2xl my-8">
            <div className="flex justify-between items-center border-b pb-4 border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-amber-50 dark:bg-amber-950/60 text-amber-500 rounded-xl">
                  <Edit3 size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-gray-900 dark:text-white">
                    Modificar Venta <span className="font-mono text-[#FF97A4]">#{editingOrder.orderId}</span>
                  </h3>
                  <p className="text-xs text-gray-400">Las modificaciones requieren código de seguridad 2FA al guardar.</p>
                </div>
              </div>

              <button
                onClick={() => setEditingOrder(null)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1.5 rounded-xl"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {/* Cliente & Contacto */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-gray-700 dark:text-gray-300 block mb-1">Nombre del Cliente:</label>
                  <input
                    type="text"
                    value={editingOrder.customerName || ""}
                    onChange={(e) => setEditingOrder({ ...editingOrder, customerName: e.target.value })}
                    className="w-full p-2.5 border rounded-xl dark:bg-gray-900 dark:border-gray-800 font-semibold"
                  />
                </div>

                <div>
                  <label className="font-bold text-gray-700 dark:text-gray-300 block mb-1">Teléfono / WhatsApp:</label>
                  <input
                    type="text"
                    value={editingOrder.customerPhone || ""}
                    onChange={(e) => setEditingOrder({ ...editingOrder, customerPhone: e.target.value })}
                    className="w-full p-2.5 border rounded-xl dark:bg-gray-900 dark:border-gray-800 font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-gray-700 dark:text-gray-300 block mb-1">Correo Electrónico:</label>
                <input
                  type="email"
                  value={editingOrder.customerEmail || ""}
                  onChange={(e) => setEditingOrder({ ...editingOrder, customerEmail: e.target.value })}
                  className="w-full p-2.5 border rounded-xl dark:bg-gray-900 dark:border-gray-800 font-semibold"
                />
              </div>

              <div>
                <label className="font-bold text-gray-700 dark:text-gray-300 block mb-1">Dirección de Entrega:</label>
                <textarea
                  rows={2}
                  value={editingOrder.address || ""}
                  onChange={(e) => setEditingOrder({ ...editingOrder, address: e.target.value })}
                  className="w-full p-2.5 border rounded-xl dark:bg-gray-900 dark:border-gray-800 font-semibold"
                />
              </div>

              <div>
                <label className="font-bold text-gray-700 dark:text-gray-300 block mb-1">Tarjeta de Dedicatoria Impresa:</label>
                <textarea
                  rows={2}
                  value={editingOrder.cardMessage || ""}
                  onChange={(e) => setEditingOrder({ ...editingOrder, cardMessage: e.target.value })}
                  className="w-full p-2.5 border rounded-xl dark:bg-gray-900 dark:border-gray-800 font-semibold italic text-pink-600 dark:text-pink-400"
                />
              </div>

              {/* Lista de Ítems */}
              <div className="border-t pt-3 border-gray-100 dark:border-gray-800">
                <label className="font-bold text-gray-800 dark:text-gray-200 block mb-2">Ítems de la Venta:</label>
                <div className="space-y-2">
                  {(editingOrder.items || []).map((item: any, idx: number) => (
                    <div key={idx} className="flex items-center gap-2 bg-gray-50 dark:bg-gray-900 p-2 rounded-xl border border-gray-200 dark:border-gray-800">
                      <input
                        type="text"
                        value={item.name || ""}
                        onChange={(e) => handleEditItemChange(idx, "name", e.target.value)}
                        placeholder="Nombre de Arreglo"
                        className="flex-1 p-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700 text-xs font-semibold"
                      />
                      <div className="w-20">
                        <input
                          type="number"
                          step="0.01"
                          value={item.price || 0}
                          onChange={(e) => handleEditItemChange(idx, "price", parseFloat(e.target.value) || 0)}
                          placeholder="Precio"
                          className="w-full p-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700 text-xs font-semibold"
                        />
                      </div>
                      <div className="w-16">
                        <input
                          type="number"
                          min="1"
                          value={item.quantity || 1}
                          onChange={(e) => handleEditItemChange(idx, "quantity", parseInt(e.target.value) || 1)}
                          placeholder="Cant"
                          className="w-full p-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700 text-xs font-semibold text-center"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Totales y Tax */}
              <div className="grid grid-cols-3 gap-3 border-t pt-3 border-gray-100 dark:border-gray-800">
                <div>
                  <label className="font-bold text-gray-700 dark:text-gray-300 block mb-1">Costo Envío ($):</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editingOrder.deliveryFee || 0}
                    onChange={(e) => {
                      const fee = parseFloat(e.target.value) || 0;
                      setEditingOrder({ ...editingOrder, deliveryFee: fee });
                    }}
                    className="w-full p-2.5 border rounded-xl dark:bg-gray-900 dark:border-gray-800 font-semibold"
                  />
                </div>

                <div>
                  <label className="font-bold text-gray-700 dark:text-gray-300 block mb-1">Sales Tax ($):</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editingOrder.taxAmount || 0}
                    onChange={(e) => {
                      const tax = parseFloat(e.target.value) || 0;
                      setEditingOrder({ ...editingOrder, taxAmount: tax });
                    }}
                    className="w-full p-2.5 border rounded-xl dark:bg-gray-900 dark:border-gray-800 font-semibold text-purple-600 dark:text-purple-400"
                  />
                </div>

                <div>
                  <label className="font-bold text-gray-700 dark:text-gray-300 block mb-1">Total Final ($):</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editingOrder.total || 0}
                    onChange={(e) => {
                      const tot = parseFloat(e.target.value) || 0;
                      setEditingOrder({ ...editingOrder, total: tot });
                    }}
                    className="w-full p-2.5 border rounded-xl dark:bg-gray-900 dark:border-gray-800 font-extrabold text-emerald-600 dark:text-emerald-400"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 border-t pt-4 border-gray-100 dark:border-gray-800">
              <button
                type="button"
                onClick={() => setEditingOrder(null)}
                className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl font-bold hover:bg-gray-200 transition-colors"
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={handlePrompt2FA}
                className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-bold flex items-center gap-1.5 shadow-md transition-all"
              >
                <Lock size={15} />
                <span>Continuar a Validación 2FA</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2FA DE SEGURIDAD PARA GUARDAR EDICIÓN */}
      {twoFactorModalOpen && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 z-50 no-print">
          <div className="bg-white dark:bg-[#1A1C23] max-w-md w-full rounded-3xl p-6 space-y-5 border border-amber-200 dark:border-amber-900/50 shadow-2xl text-center">
            <div className="mx-auto w-12 h-12 bg-amber-100 dark:bg-amber-950/80 text-amber-500 rounded-2xl flex items-center justify-center border border-amber-200 dark:border-amber-800">
              <ShieldCheck size={26} />
            </div>

            <div>
              <h3 className="font-bold text-lg text-gray-900 dark:text-white">Confirmación de Seguridad 2FA</h3>
              <p className="text-xs text-gray-400 mt-1">
                Ingresa el código de 6 dígitos de tu App Autenticadora o tu PIN de seguridad para autorizar la modificación de la venta.
              </p>
            </div>

            <div>
              <input
                type="text"
                maxLength={6}
                value={twoFactorCode}
                onChange={(e) => setTwoFactorCode(e.target.value)}
                placeholder="000000"
                className="w-48 text-center text-2xl font-mono tracking-widest p-3 border-2 border-amber-300 dark:border-amber-700 rounded-2xl dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-500 font-bold"
              />
            </div>

            {twoFactorError && (
              <div className="p-3 bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-300 rounded-xl text-xs font-semibold">
                ⚠️ {twoFactorError}
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setTwoFactorModalOpen(false)}
                className="flex-1 py-2.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl font-bold"
              >
                Cancelar
              </button>

              <button
                type="button"
                disabled={submitting2FA}
                onClick={handleConfirm2FAAndSave}
                className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold flex items-center justify-center gap-1.5 shadow-md transition-all"
              >
                {submitting2FA ? <RefreshCw className="animate-spin" size={16} /> : <Save size={16} />}
                <span>{submitting2FA ? "Verificando..." : "Confirmar & Guardar"}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 2: VISUALIZACIÓN E IMPRESIÓN DE FACTURA (ES/EN)    */}
      {/* ========================================================= */}
      {invoiceOrder && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className={`bg-white dark:bg-[#1A1C23] ${invoiceFormat === "ticket80" ? "max-w-md" : "max-w-3xl"} w-full rounded-3xl p-6 space-y-5 border border-gray-200 dark:border-gray-800 shadow-2xl my-8 transition-all`}>
            {/* Cabecera del Modal (No se imprime) */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b pb-4 border-gray-100 dark:border-gray-800 no-print">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-xl">
                  {invoiceFormat === "ticket80" ? <Receipt size={20} className="text-pink-600" /> : <FileText size={20} />}
                </div>
                <div>
                  <h3 className="font-bold text-base sm:text-lg text-gray-900 dark:text-white">
                    {invoiceFormat === "ticket80" ? "Ticket Térmico POS (80mm)" : "Imprimir Factura / Invoice"}
                  </h3>
                  <p className="text-xs text-gray-400">
                    {invoiceFormat === "ticket80" ? "Optimizado para Star Micronics TSP143IIILAN" : "Formato estándar para cliente o archivo"}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {/* Selector Formato */}
                <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl text-xs font-bold">
                  <button
                    onClick={() => setInvoiceFormat("a4")}
                    className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 ${
                      invoiceFormat === "a4" ? "bg-white dark:bg-gray-900 text-[#163422] dark:text-emerald-400 shadow-sm" : "text-gray-500"
                    }`}
                  >
                    <FileText size={12} />
                    <span>A4</span>
                  </button>
                  <button
                    onClick={() => setInvoiceFormat("ticket80")}
                    className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 ${
                      invoiceFormat === "ticket80" ? "bg-white dark:bg-gray-900 text-pink-600 shadow-sm" : "text-gray-500"
                    }`}
                  >
                    <Receipt size={12} />
                    <span>80mm</span>
                  </button>
                </div>

                {/* Selector Idioma */}
                <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl text-xs font-bold">
                  <button
                    onClick={() => setInvoiceLang("es")}
                    className={`px-2.5 py-1 rounded-lg transition-all ${
                      invoiceLang === "es" ? "bg-white dark:bg-gray-900 text-[#FF97A4] shadow-sm" : "text-gray-500"
                    }`}
                  >
                    ES
                  </button>
                  <button
                    onClick={() => setInvoiceLang("en")}
                    className={`px-2.5 py-1 rounded-lg transition-all ${
                      invoiceLang === "en" ? "bg-white dark:bg-gray-900 text-[#FF97A4] shadow-sm" : "text-gray-500"
                    }`}
                  >
                    EN
                  </button>
                </div>

                <button
                  onClick={handlePrintInvoice}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all"
                >
                  <Printer size={14} />
                  <span>{invoiceLang === "es" ? "Imprimir" : "Print"}</span>
                </button>

                <button
                  onClick={() => setInvoiceOrder(null)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1 rounded-lg"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {invoiceFormat === "a4" ? (
              /* ÁREA IMPRIMIBLE DE LA FACTURA A4 */
              <div id="invoice-print-area" className="bg-white text-gray-900 p-6 rounded-2xl border border-gray-200 space-y-6 text-xs">
                {/* Encabezado Oficial Boutique */}
                <div className="flex justify-between items-start border-b-2 border-pink-200 pb-5">
                  <div>
                    <h1 className="text-2xl font-serif font-extrabold text-[#1A1C1C] tracking-tight">Bonbon Flowers Houston</h1>
                    <p className="text-[11px] font-bold uppercase tracking-wider text-[#FF97A4]">High Floral Design Boutique</p>
                    <p className="text-gray-500 text-[11px] mt-1">Houston, Texas & Metropolitan Areas</p>
                    <p className="text-gray-500 text-[11px]">Tel / WhatsApp: +1 (346) 739-2730</p>
                  </div>

                  <div className="text-right space-y-1">
                    <div className="inline-block bg-pink-50 border border-pink-200 px-3 py-1 rounded-xl text-pink-600 font-mono font-bold text-sm">
                      {invoiceLang === "es" ? "FACTURA #" : "INVOICE #"} {invoiceOrder.orderId}
                    </div>
                    <p className="text-gray-500 font-medium text-[11px]">
                      {invoiceLang === "es" ? "Fecha:" : "Date:"} {new Date(invoiceOrder.createdAt).toLocaleDateString(invoiceLang === "es" ? "es-MX" : "en-US", { year: "numeric", month: "long", day: "numeric" })}
                    </p>
                    <p className="text-gray-500 font-medium text-[11px]">
                      {invoiceLang === "es" ? "Estado:" : "Status:"} <strong className="text-gray-800">{invoiceOrder.status || "Confirmed"}</strong>
                    </p>
                  </div>
                </div>

                {/* Información del Cliente & Envíos */}
                <div className="grid grid-cols-2 gap-6 bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <div>
                    <h4 className="font-bold uppercase text-[10px] tracking-wider text-gray-400 mb-1">
                      {invoiceLang === "es" ? "DATOS DEL CLIENTE" : "CUSTOMER DETAILS"}
                    </h4>
                    <p className="font-bold text-gray-800 text-sm">{invoiceOrder.customerName}</p>
                    <p className="text-gray-600 font-mono mt-0.5">{invoiceOrder.customerPhone}</p>
                    {invoiceOrder.customerEmail && <p className="text-gray-600">{invoiceOrder.customerEmail}</p>}
                  </div>

                  <div>
                    <h4 className="font-bold uppercase text-[10px] tracking-wider text-gray-400 mb-1">
                      {invoiceLang === "es" ? "DIRECCIÓN DE ENTREGA" : "DELIVERY ADDRESS"}
                    </h4>
                    <p className="font-bold text-gray-800">{invoiceOrder.address}</p>
                    <p className="text-gray-500 mt-1">
                      {invoiceLang === "es" ? "Método:" : "Method:"} <strong className="text-gray-700">{invoiceOrder.deliveryMethod || "Standard Delivery"}</strong>
                    </p>
                  </div>
                </div>

                {/* Tarjeta de Dedicatoria (si existe) */}
                {invoiceOrder.cardMessage && (
                  <div className="bg-pink-50/60 p-3 rounded-xl border border-pink-200">
                    <h4 className="font-bold uppercase text-[10px] tracking-wider text-pink-600 mb-0.5">
                      {invoiceLang === "es" ? "💌 TARJETA DE DEDICATORIA IMPRESA" : "💌 PRINTED CARD MESSAGE"}
                    </h4>
                    <p className="italic font-semibold text-gray-800">"{invoiceOrder.cardMessage}"</p>
                  </div>
                )}

                {/* Tabla de Productos */}
                <div>
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b-2 border-gray-200 bg-gray-100 text-gray-600 uppercase text-[10px] font-bold text-left">
                        <th className="py-2 px-3">{invoiceLang === "es" ? "Descripción de Arreglo / Ítem" : "Item Description"}</th>
                        <th className="py-2 px-3 text-center">{invoiceLang === "es" ? "Cant." : "Qty"}</th>
                        <th className="py-2 px-3 text-right">{invoiceLang === "es" ? "Precio Unit." : "Unit Price"}</th>
                        <th className="py-2 px-3 text-right">{invoiceLang === "es" ? "Subtotal" : "Subtotal"}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 font-medium">
                      {(invoiceOrder.items || []).map((item: any, idx: number) => (
                        <tr key={idx}>
                          <td className="py-2.5 px-3">
                            <strong className="text-gray-900">{item.name}</strong>
                            {item.addons && item.addons.length > 0 && (
                              <div className="pl-2 mt-1 space-y-0.5 text-[11px] text-pink-600 font-semibold">
                                {item.addons.map((a: any, i: number) => (
                                  <div key={i}>
                                    + {a.name || a.value} {a.price ? `(+$${a.price.toFixed(2)})` : ''}
                                    {a.customText && <span className="italic block text-gray-700 pl-2">"{a.customText}"</span>}
                                  </div>
                                ))}
                              </div>
                            )}
                          </td>
                          <td className="py-2.5 px-3 text-center font-bold">{item.quantity}</td>
                          <td className="py-2.5 px-3 text-right">${(item.price || 0).toFixed(2)}</td>
                          <td className="py-2.5 px-3 text-right font-bold text-gray-900">
                            ${((item.price || 0) * (item.quantity || 1)).toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Desglose Financiero */}
                <div className="flex justify-end pt-2">
                  <div className="w-64 space-y-1.5 text-xs bg-gray-50 p-3.5 rounded-xl border border-gray-200">
                    <div className="flex justify-between text-gray-600">
                      <span>{invoiceLang === "es" ? "Subtotal Ítems:" : "Items Subtotal:"}</span>
                      <span className="font-bold">${((invoiceOrder.items || []).reduce((acc: number, it: any) => acc + (it.price * it.quantity), 0)).toFixed(2)}</span>
                    </div>

                    {invoiceOrder.discountAmount ? (
                      <div className="flex justify-between text-emerald-600 font-semibold">
                        <span>{invoiceLang === "es" ? "Descuento:" : "Discount:"}</span>
                        <span>-${invoiceOrder.discountAmount.toFixed(2)}</span>
                      </div>
                    ) : null}

                    <div className="flex justify-between text-purple-700 font-semibold">
                      <span>{invoiceLang === "es" ? "Sales Tax (8.25%):" : "Sales Tax (8.25%):"}</span>
                      <span>+${(invoiceOrder.taxAmount || 0).toFixed(2)}</span>
                    </div>

                    <div className="flex justify-between text-gray-600">
                      <span>{invoiceLang === "es" ? "Envío / Delivery:" : "Delivery Fee:"}</span>
                      <span>{(invoiceOrder.deliveryFee || 0) > 0 ? `+$${invoiceOrder.deliveryFee.toFixed(2)}` : (invoiceLang === "es" ? "Gratis" : "Free")}</span>
                    </div>

                    <div className="border-top border-gray-300 pt-2 flex justify-between text-sm font-extrabold text-gray-900">
                      <span>{invoiceLang === "es" ? "TOTAL FINAL:" : "TOTAL DUE:"}</span>
                      <span className="text-emerald-700">${(invoiceOrder.total || 0).toFixed(2)} USD</span>
                    </div>
                  </div>
                </div>

                {/* Pie de Página de Factura */}
                <div className="border-t pt-4 text-center text-[10px] text-gray-400 space-y-1">
                  <p className="font-bold text-gray-600">
                    {invoiceLang === "es"
                      ? "¡Gracias por elegir a Bonbon Flowers Houston para regalar sonrisas!"
                      : "Thank you for choosing Bonbon Flowers Houston for your special moments!"}
                  </p>
                  <p>Bonbon Flowers Houston • Houston, Texas • bonbonflowershouston.com</p>
                </div>
              </div>
            ) : (
              /* FORMATO TICKET TÉRMICO 80mm STAR MICRONICS TSP143III */
              <div
                id="invoice-print-area"
                className="bg-white text-black p-4 rounded-xl border border-gray-300 max-w-[76mm] mx-auto font-mono text-[11px] leading-tight select-text shadow-sm space-y-3"
              >
                {/* Encabezado Star Micronics 80mm */}
                <div className="text-center pb-2 border-b border-dashed border-gray-400 space-y-0.5">
                  <p className="font-extrabold text-sm uppercase tracking-wide">Bonbon Flowers</p>
                  <p className="font-bold text-xs uppercase tracking-wider">HOUSTON</p>
                  <p className="text-[10px] text-gray-700">High Floral Design Boutique</p>
                  <p className="text-[10px] text-gray-700">Houston, Texas & Metro Areas</p>
                  <p className="text-[10px] font-bold text-gray-900">Tel/WhatsApp: +1 (346) 739-2730</p>
                </div>

                {/* Datos de Orden */}
                <div className="py-2 border-b border-dashed border-gray-400 space-y-1">
                  <div className="flex justify-between font-bold text-xs">
                    <span>{invoiceLang === "es" ? "ORDEN:" : "ORDER:"}</span>
                    <span className="bg-gray-100 px-1.5 py-0.5 rounded text-black font-extrabold">{invoiceOrder.orderId}</span>
                  </div>
                  <div className="flex justify-between text-[10px] text-gray-600">
                    <span>{invoiceLang === "es" ? "FECHA:" : "DATE:"}</span>
                    <span>{new Date(invoiceOrder.createdAt).toLocaleDateString(invoiceLang === "es" ? "es-MX" : "en-US", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
                  </div>
                  <div className="flex justify-between text-[10px] text-gray-600">
                    <span>{invoiceLang === "es" ? "ESTADO:" : "STATUS:"}</span>
                    <span className="font-bold text-black uppercase">{invoiceOrder.status || "Confirmado"}</span>
                  </div>
                </div>

                {/* Cliente y Entrega */}
                <div className="py-2 border-b border-dashed border-gray-400 space-y-1 text-[11px]">
                  <p className="font-bold uppercase text-[10px] text-gray-500">
                    {invoiceLang === "es" ? "DATOS DE ENTREGA:" : "DELIVERY INFO:"}
                  </p>
                  <p className="font-bold text-black">{invoiceOrder.customerName}</p>
                  <p className="text-black font-semibold">Tel: {invoiceOrder.customerPhone}</p>
                  <p className="text-gray-800 break-words mt-0.5"><span className="font-bold">Dir:</span> {invoiceOrder.address}</p>
                  <p className="text-[10px] text-gray-600"><span className="font-bold">Método:</span> {invoiceOrder.deliveryMethod || "Envío Estándar"}</p>
                </div>

                {/* Tarjeta de Dedicatoria Impresa (CRÍTICO PARA FLORERÍA) */}
                {invoiceOrder.cardMessage && (
                  <div className="my-2 p-2 bg-gray-50 border border-dashed border-gray-400 rounded space-y-0.5">
                    <p className="font-bold text-[10px] uppercase text-black">
                      💌 {invoiceLang === "es" ? "TARJETA DE REGALO:" : "GIFT CARD MESSAGE:"}
                    </p>
                    <p className="italic font-bold text-black break-words">
                      "{invoiceOrder.cardMessage}"
                    </p>
                  </div>
                )}

                {/* Items */}
                <div className="py-2 border-b border-dashed border-gray-400">
                  <div className="flex justify-between font-bold text-[10px] uppercase pb-1 border-b border-gray-300">
                    <span>{invoiceLang === "es" ? "DESCRIPCIÓN" : "ITEM"}</span>
                    <span>{invoiceLang === "es" ? "TOTAL" : "TOTAL"}</span>
                  </div>
                  <div className="divide-y divide-gray-100 pt-1">
                    {(invoiceOrder.items || []).map((item: any, idx: number) => (
                      <div key={idx} className="py-1">
                        <div className="flex justify-between items-start font-bold">
                          <span className="pr-1">{item.quantity}x {item.name}</span>
                          <span className="whitespace-nowrap">${((item.price || 0) * (item.quantity || 1)).toFixed(2)}</span>
                        </div>
                        {item.addons && item.addons.length > 0 && (
                          <div className="pl-2 text-[10px] text-gray-700 space-y-0.5">
                            {item.addons.map((a: any, i: number) => (
                              <div key={i}>
                                + {a.name || a.value} {a.price ? `(+$${a.price.toFixed(2)})` : ''}
                                {a.customText && <div className="italic text-black pl-1">"{a.customText}"</div>}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Totales */}
                <div className="py-2 space-y-1 text-[11px] border-b border-dashed border-gray-400">
                  <div className="flex justify-between text-gray-700">
                    <span>{invoiceLang === "es" ? "Subtotal:" : "Subtotal:"}</span>
                    <span>${((invoiceOrder.items || []).reduce((acc: number, it: any) => acc + (it.price * it.quantity), 0)).toFixed(2)}</span>
                  </div>
                  {invoiceOrder.discountAmount ? (
                    <div className="flex justify-between text-gray-800">
                      <span>{invoiceLang === "es" ? "Descuento:" : "Discount:"}</span>
                      <span>-${invoiceOrder.discountAmount.toFixed(2)}</span>
                    </div>
                  ) : null}
                  <div className="flex justify-between text-gray-700">
                    <span>Sales Tax (8.25%):</span>
                    <span>+${(invoiceOrder.taxAmount || 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-700">
                    <span>{invoiceLang === "es" ? "Envío:" : "Delivery:"}</span>
                    <span>{(invoiceOrder.deliveryFee || 0) > 0 ? `+$${invoiceOrder.deliveryFee.toFixed(2)}` : (invoiceLang === "es" ? "Gratis" : "Free")}</span>
                  </div>
                  <div className="flex justify-between font-black text-sm pt-1 border-t border-gray-400 text-black">
                    <span>TOTAL:</span>
                    <span>${(invoiceOrder.total || 0).toFixed(2)} USD</span>
                  </div>
                </div>

                {/* Pie de Recibo */}
                <div className="text-center pt-3 pb-1 space-y-1 text-[10px] text-gray-600">
                  <p className="font-bold text-black uppercase">
                    {invoiceLang === "es" ? "¡Gracias por su compra!" : "Thank you for your business!"}
                  </p>
                  <p>www.bonbonflowershouston.com</p>
                  <p className="text-[9px] text-gray-400">Star Micronics TSP100III - 80mm</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}


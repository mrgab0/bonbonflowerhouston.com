"use client";

import { useCart } from "@/components/shop/Cart/CartContext";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { createOrder } from "@/lib/actions/order";
import { ShopHeader } from "@/components/shop/ShopHeader";
import { DEFAULT_DELIVERY_OPTIONS, DeliveryOption } from "@/lib/deliveryOptions";
import { getDeliveryOptions } from "@/lib/actions/delivery";
import { validateCoupon, checkAutoLaunchCoupon } from "@/lib/actions/coupon";
import { getPaymentConfigs } from "@/lib/actions/paymentConfig";
import { Zap, Rocket, Truck, Sun, Clock, Moon, Store, ShieldCheck, CheckCircle2, Ticket, Sparkles, Tag, AlertCircle, Copy, ExternalLink, QrCode } from "lucide-react";

const PaymentLogos = {
  zelle: <svg viewBox="0 0 38 24" width="38" height="24" className="w-8 h-auto"><path d="M0 0h38v24H0z" fill="#6d2277"/><path d="M10 5h18v3l-10 8h10v5H10v-3l10-8H10z" fill="#fff"/></svg>,
  paypal: <svg viewBox="0 0 38 24" width="38" height="24" className="w-8 h-auto"><path d="M0 0h38v24H0z" fill="#003087"/><path d="M10 5h18v14H10z" fill="#009cde"/></svg>,
  gpay: <svg viewBox="0 0 38 24" width="38" height="24" className="w-8 h-auto"><rect width="38" height="24" fill="#4285F4"/><path d="M10 12h18v2H10z" fill="#fff"/></svg>,
  venmo: <svg viewBox="0 0 38 24" width="38" height="24" className="w-8 h-auto"><rect width="38" height="24" fill="#3D95CE"/></svg>,
  efectivo: <svg viewBox="0 0 38 24" width="38" height="24" className="w-8 h-auto"><rect width="38" height="24" fill="#22C55E"/></svg>
};

const iconMap: Record<string, any> = {
  Zap: Zap,
  Rocket: Rocket,
  Truck: Truck,
  Sun: Sun,
  Clock: Clock,
  Moon: Moon,
  Store: Store,
};

export default function CheckoutPage() {
  const { cartItems, clearCart } = useCart();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState("");
  const [deliveryOptionsList, setDeliveryOptionsList] = useState<DeliveryOption[]>(DEFAULT_DELIVERY_OPTIONS);
  const [selectedDelivery, setSelectedDelivery] = useState<DeliveryOption>(DEFAULT_DELIVERY_OPTIONS[2]);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");

  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<any | null>(null);
  const [couponError, setCouponError] = useState("");
  const [couponSuccess, setCouponSuccess] = useState("");

  const [paymentConfigs, setPaymentConfigs] = useState<Record<string, any>>({});
  const [copiedText, setCopiedText] = useState("");

  useEffect(() => {
    async function loadOptionsAndCoupon() {
      const { data } = await getDeliveryOptions();
      if (data && data.length > 0) {
        setDeliveryOptionsList(data);
        setSelectedDelivery(data[2] || data[0]);
      }

      const payRes = await getPaymentConfigs();
      if (payRes.success && payRes.data) {
        setPaymentConfigs(payRes.data);
      }

      const autoRes = await checkAutoLaunchCoupon();
      if (autoRes.success && autoRes.isAutoAvailable && autoRes.coupon) {
        setAppliedCoupon(autoRes.coupon);
        setCouponSuccess(`🎁 ¡Felicidades! Eres el cliente #${autoRes.orderIndex} de inauguración. Cupón del ${autoRes.coupon.discountValue}% OFF aplicado automáticamente.`);
      }
    }
    loadOptionsAndCoupon();

    const savedName = localStorage.getItem("customerName") || "";
    const savedPhone = localStorage.getItem("customerPhone") || "";
    const savedAddress = localStorage.getItem("customerAddress") || "";
    
    setName(savedName);
    setPhone(savedPhone);
    setAddress(savedAddress);
  }, []);

  const handleCopyText = (text: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    setTimeout(() => setCopiedText(""), 3000);
  };

  const subtotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const deliveryFee = selectedDelivery ? selectedDelivery.extraPrice : 0;

  let discountAmount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.discountType === "percentage") {
      discountAmount = (subtotal * appliedCoupon.discountValue) / 100;
    } else {
      discountAmount = appliedCoupon.discountValue;
    }
  }

  const taxableSubtotal = Math.max(0, subtotal - discountAmount);
  const taxAmount = Math.round(taxableSubtotal * 0.0825 * 100) / 100;
  const finalTotal = taxableSubtotal + taxAmount + deliveryFee;

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError("");
    setCouponSuccess("");

    if (!couponInput.trim()) return;

    const res = await validateCoupon(couponInput, subtotal);
    if (res.success && res.coupon) {
      setAppliedCoupon(res.coupon);
      setCouponSuccess(`¡Cupón "${res.coupon.code}" aplicado con éxito!`);
      setCouponInput("");
    } else {
      setCouponError(res.error || "Código de cupón inválido.");
    }
  };

  const paymentMethods = [
    { id: "zelle", label: "Zelle" },
    { id: "paypal", label: "PayPal" },
    { id: "gpay", label: "Google Pay" },
    { id: "venmo", label: "Venmo" },
    { id: "efectivo", label: "Efectivo" },
  ];

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const data = new FormData(e.currentTarget);
    const orderData = {
      customerName: data.get("name")?.toString() || "",
      customerPhone: data.get("phone")?.toString() || "",
      address: data.get("address")?.toString() || "",
      deliveryMethod: `${selectedDelivery.title} (${selectedDelivery.estimatedTimeLabel})`,
      deliveryFee: deliveryFee,
      couponCode: appliedCoupon ? appliedCoupon.code : "",
      discountAmount: discountAmount,
      taxAmount: taxAmount,
      paymentMethod: data.get("paymentMethod")?.toString() || "",
      paymentRef: data.get("paymentRef")?.toString() || "N/A",
      items: cartItems,
      total: finalTotal
    };

    const existingOrderId = localStorage.getItem("lastOrderId") || undefined;
    const result = await createOrder(orderData, existingOrderId);
    
    if (result.success) {
      clearCart();
      localStorage.setItem("lastOrderId", result.orderId);
      localStorage.setItem("customerName", orderData.customerName);
      localStorage.setItem("customerPhone", orderData.customerPhone);
      localStorage.setItem("customerAddress", orderData.address);

      router.push(`/checkout/confirmacion?orderId=${result.orderId}`);
    } else {
      alert("Error al procesar pedido");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F9F9F9] dark:bg-[#0B0C10] text-stone-900 dark:text-[#E6F7F0] flex flex-col transition-colors duration-300">
      <ShopHeader />

      <main className="flex-1 py-10 md:py-16">
        <div className="container mx-auto px-4 md:px-6 max-w-6xl space-y-8">
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-gray-200 dark:border-stone-800 pb-6 gap-2">
            <div>
              <h1 className="text-3xl md:text-4xl font-serif font-black text-stone-900 dark:text-white">Finalizar Pedido</h1>
              <p className="text-xs text-gray-400 dark:text-stone-400">Selecciona tu método de entrega y completa tus datos</p>
            </div>
            <span className="bg-green-50 dark:bg-emerald-950/60 text-green-700 dark:text-emerald-300 text-xs font-bold px-3.5 py-1.5 rounded-full border border-green-200 dark:border-emerald-800/60 flex items-center gap-1.5">
              <ShieldCheck size={16} /> Pago Seguro Encriptado
            </span>
          </div>
          
          <div className="grid md:grid-cols-12 gap-8">
            <div className="md:col-span-7 bg-white dark:bg-[#12131A] p-6 md:p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-stone-800 space-y-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                  <h2 className="text-sm font-bold uppercase tracking-wider text-gray-500 border-b pb-2">
                    1. Información del Cliente
                  </h2>
                  <div className="space-y-3">
                    <input 
                      name="name" 
                      value={name} 
                      onChange={(e) => setName(e.target.value)} 
                      placeholder="Nombre y Apellido Completo *" 
                      className="w-full p-3.5 border border-gray-300 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF97A4] font-medium text-gray-900 dark:text-white bg-white dark:bg-gray-900 placeholder:text-gray-400" 
                      required 
                    />
                    <input 
                      name="phone" 
                      value={phone} 
                      onChange={(e) => setPhone(e.target.value)} 
                      placeholder="Teléfono / WhatsApp de Contacto *" 
                      className="w-full p-3.5 border border-gray-300 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF97A4] font-medium text-gray-900 dark:text-white bg-white dark:bg-gray-900 placeholder:text-gray-400" 
                      required 
                    />
                    <textarea 
                      name="address" 
                      value={address} 
                      onChange={(e) => setAddress(e.target.value)} 
                      placeholder="Dirección Exacta de Entrega (o escribir 'Retiro en Tienda') *" 
                      className="w-full p-3.5 border border-gray-300 dark:border-gray-700 rounded-xl h-20 focus:outline-none focus:ring-2 focus:ring-[#FF97A4] font-medium text-gray-900 dark:text-white bg-white dark:bg-gray-900 placeholder:text-gray-400" 
                      required 
                    />
                  </div>
                </div>

                <div className="space-y-4 pt-2">
                  <div className="flex justify-between items-center border-b pb-2">
                    <h2 className="text-sm font-bold uppercase tracking-wider text-gray-500">
                      2. Opción y Horario de Entrega
                    </h2>
                    <span className="text-xs font-bold text-[#FF97A4]">{deliveryOptionsList.length} opciones disponibles</span>
                  </div>

                  <div className="grid grid-cols-1 gap-2.5 max-h-[380px] overflow-y-auto pr-1">
                    {deliveryOptionsList.map((option, index) => {
                      const IconComponent = iconMap[option.iconName] || Truck;
                      const isSelected = (selectedDelivery.id && selectedDelivery.id === option.id) || selectedDelivery.title === option.title;

                      return (
                        <label
                          key={option.id || (option as any)._id || `delivery-${index}`}
                          onClick={() => setSelectedDelivery(option)}
                          className={`relative flex items-center justify-between p-4 border-2 rounded-2xl cursor-pointer transition-all ${
                            isSelected
                              ? "border-[#FF97A4] bg-[#FF97A4]/5 shadow-sm"
                              : "border-gray-100 dark:border-stone-800 hover:border-gray-200 dark:hover:border-stone-700 bg-white dark:bg-[#181922]"
                          }`}
                        >
                          <div className="flex items-center gap-3.5">
                            <div className={`p-2.5 rounded-xl ${isSelected ? "bg-[#FF97A4] text-white" : "bg-gray-100 dark:bg-stone-800 text-gray-500 dark:text-stone-300"}`}>
                              <IconComponent size={20} />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-sm text-[#1A1C1C] dark:text-white">{option.title}</span>
                                {option.badge && (
                                  <span className="bg-[#163422] text-white text-[9px] font-black px-2.5 py-0.5 rounded-full uppercase shadow-sm border border-[#D4AF37]/50">
                                    {option.badge}
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-gray-400 mt-0.5">{option.description}</p>
                              <span className="text-[11px] font-bold text-gray-500 dark:text-stone-400 block mt-1">
                                ⏱️ Tiempo estimado: <strong className="text-gray-800 dark:text-stone-200">{option.estimatedTimeLabel}</strong>
                              </span>
                            </div>
                          </div>

                          <div className="text-right flex-shrink-0 ml-3">
                            <span className={`text-sm font-extrabold block ${option.extraPrice > 0 ? "text-[#FF97A4]" : "text-green-600"}`}>
                              {option.extraPrice > 0 ? `+$${option.extraPrice.toFixed(2)} USD` : "Gratis"}
                            </span>
                            {isSelected && (
                              <CheckCircle2 size={18} className="text-[#FF97A4] ml-auto mt-1" />
                            )}
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-4 pt-2">
                  <h2 className="text-sm font-bold uppercase tracking-wider text-gray-500 border-b pb-2">
                    3. Método de Pago
                  </h2>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {paymentMethods.map((method) => (
                      <label 
                        key={method.id} 
                        className={`relative flex flex-col items-center p-3.5 border-2 rounded-2xl cursor-pointer transition-all ${
                          selectedPayment === method.id
                            ? 'border-[#FF97A4] bg-[#FF97A4]/5 shadow-sm'
                            : 'border-gray-100 dark:border-stone-800 hover:border-gray-200 dark:hover:border-stone-700 bg-white dark:bg-[#181922]'
                        }`}
                      >
                        <input 
                          type="radio" 
                          name="paymentMethod" 
                          value={method.id} 
                          className="peer sr-only" 
                          required 
                          onChange={() => setSelectedPayment(method.id)}
                        />
                        <div className="mb-1.5">
                          {PaymentLogos[method.id as keyof typeof PaymentLogos]}
                        </div>
                        <span className="text-xs font-bold text-gray-700 dark:text-stone-300 uppercase">{method.label}</span>
                      </label>
                    ))}
                  </div>

                  {selectedPayment && (
                    <div className="bg-gray-50 dark:bg-[#181922] p-5 rounded-2xl border border-gray-200 dark:border-stone-800 space-y-4 animate-in fade-in duration-300">
                      {(() => {
                        const cfg = paymentConfigs[selectedPayment] || {};
                        const detailToCopy = cfg.accountDetail || cfg.linkUrl || "";

                        return (
                          <div className="space-y-4">
                            <div className="flex justify-between items-start">
                              <div>
                                <span className="font-bold text-xs text-gray-400 dark:text-stone-400 uppercase tracking-wider block">
                                  Instrucciones de Pago ({cfg.title || selectedPayment})
                                </span>
                                {cfg.holderName && (
                                  <span className="font-bold text-sm text-[#1A1C1C] dark:text-white block mt-0.5">
                                    Titular: {cfg.holderName}
                                  </span>
                                )}
                              </div>

                              {detailToCopy && (
                                <button
                                  type="button"
                                  onClick={() => handleCopyText(detailToCopy)}
                                  className="bg-white dark:bg-stone-800 border dark:border-stone-700 text-gray-700 dark:text-stone-200 hover:text-[#FF97A4] hover:border-[#FF97A4] px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
                                >
                                  <Copy size={13} />
                                  <span>{copiedText === detailToCopy ? "¡Copiado! ✓" : "Copiar Datos"}</span>
                                </button>
                              )}
                            </div>

                            {cfg.qrImage && (
                              <div className="flex flex-col items-center justify-center p-3 bg-white dark:bg-stone-900 rounded-2xl border dark:border-stone-700 w-fit mx-auto shadow-sm">
                                <img src={cfg.qrImage} alt={`QR ${cfg.title}`} className="w-44 h-44 object-contain rounded-xl" />
                                <span className="text-[10px] text-gray-400 dark:text-stone-400 font-bold mt-1.5 flex items-center gap-1">
                                  <QrCode size={12} /> Escanea con la App de {cfg.title}
                                </span>
                              </div>
                            )}

                            {cfg.linkUrl && (
                              <div className="text-center pt-1">
                                <a
                                  href={cfg.linkUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-2 bg-[#1A1C1C] dark:bg-[#5EEAD4] text-white dark:text-stone-950 px-5 py-2.5 rounded-full text-xs font-bold hover:bg-[#FF97A4] dark:hover:bg-[#2DD4BF] transition-colors shadow-sm"
                                >
                                  <span>Pagar vía {cfg.title}</span>
                                  <ExternalLink size={14} />
                                </a>
                              </div>
                            )}

                            {cfg.accountDetail && (
                              <div className="bg-white dark:bg-stone-900 p-3 rounded-xl border dark:border-stone-700 text-center font-mono font-extrabold text-sm text-[#1A1C1C] dark:text-white">
                                {cfg.accountDetail}
                              </div>
                            )}
                            
                            {/* Nota o Instrucciones Paso a Paso */}
                            {cfg.instructions && (
                              <div className="text-xs text-gray-700 dark:text-stone-300 bg-white dark:bg-stone-900 p-3.5 rounded-xl border border-gray-100 dark:border-stone-800 space-y-1 shadow-sm">
                                <span className="font-bold text-gray-500 dark:text-stone-400 uppercase text-[10px] tracking-wider block mb-1">
                                  📌 Paso a paso para pagar:
                                </span>
                                {cfg.instructions.split('\n').map((line: string, i: number) => (
                                  <p key={i} className="font-medium text-gray-700 dark:text-stone-300 leading-relaxed">
                                    {line}
                                  </p>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })()}
                    </div>
                  )}

                  <input 
                    name="paymentRef" 
                    placeholder={selectedPayment === 'efectivo' ? "No requerido para pago en efectivo" : "Número o Código de Referencia de Pago *"} 
                    className="w-full p-3.5 border border-gray-300 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#FF97A4] font-medium text-gray-900 dark:text-white bg-white dark:bg-gray-900 placeholder:text-gray-400" 
                    disabled={selectedPayment === 'efectivo'}
                    required={selectedPayment !== 'efectivo'}
                  />
                </div>

                <button 
                  type="submit" 
                  disabled={loading || cartItems.length === 0} 
                  className="w-full bg-[#163422] hover:bg-[#1B2E22] dark:bg-[#5EEAD4] dark:hover:bg-[#2DD4BF] text-white dark:text-stone-950 py-4 rounded-full font-bold transition-all shadow-lg shadow-[#163422]/20 dark:shadow-[#5EEAD4]/20 disabled:bg-gray-300 dark:disabled:bg-gray-800 disabled:text-gray-500 text-base flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99]"
                >
                  {loading ? "Procesando Orden..." : `Confirmar Pedido - $${finalTotal.toFixed(2)} USD`}
                </button>
              </form>
            </div>

            <div className="md:col-span-5 bg-white dark:bg-[#12131A] p-6 md:p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-stone-800 h-fit space-y-6">
              <h2 className="text-xl font-serif font-black text-[#1A1C1C] dark:text-white border-b border-gray-100 dark:border-stone-800 pb-3">Resumen de Tu Pedido</h2>
              
              <div className="space-y-4 max-h-[250px] overflow-y-auto pr-1">
                {cartItems.map((item) => (
                  <div key={`${item.id}-${JSON.stringify(item.addons)}`} className="flex justify-between items-center text-sm border-b pb-3 border-gray-50 dark:border-stone-800">
                    <div className="flex items-center gap-3">
                      {item.image && (
                        <img src={item.image} alt={item.name} className="w-12 h-12 rounded-xl object-cover border border-gray-200 dark:border-stone-700" />
                      )}
                      <div>
                        <span className="font-bold text-[#1A1C1C] dark:text-white block">{item.name}</span>
                        <span className="text-xs text-gray-400 dark:text-stone-400 font-medium">Cant: {item.quantity}</span>
                      </div>
                    </div>
                    <span className="font-bold text-gray-800 dark:text-stone-200">${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t border-gray-100 dark:border-stone-800 space-y-3">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                  <Ticket size={14} className="text-[#FF97A4]" /> ¿Tienes un Cupón de Descuento?
                </label>

                {couponSuccess && (
                  <div className="bg-green-50 text-green-700 text-xs p-3 rounded-xl border border-green-200 flex items-start gap-2">
                    <Sparkles size={16} className="text-green-600 flex-shrink-0 mt-0.5" />
                    <span>{couponSuccess}</span>
                  </div>
                )}

                {couponError && (
                  <div className="bg-red-50 text-red-700 text-xs p-3 rounded-xl border border-red-200 flex items-center gap-2">
                    <AlertCircle size={16} className="text-red-500 flex-shrink-0" />
                    <span>{couponError}</span>
                  </div>
                )}

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value)}
                    placeholder="Ej: INAUGURACION, BIENVENIDA"
                    className="flex-1 p-2.5 border border-gray-300 dark:border-gray-700 rounded-xl text-xs uppercase font-bold focus:outline-none focus:ring-2 focus:ring-[#FF97A4] text-gray-900 dark:text-white bg-white dark:bg-gray-900 placeholder:text-gray-400"
                  />
                  <button
                    type="button"
                    onClick={handleApplyCoupon}
                    className="bg-[#1A1C1C] dark:bg-stone-800 text-white px-4 py-2.5 rounded-xl text-xs font-bold hover:bg-[#FF97A4] dark:hover:bg-[#FF97A4] transition-colors"
                  >
                    Aplicar
                  </button>
                </div>
              </div>

              <div className="space-y-2.5 pt-4 border-t border-gray-100 dark:border-stone-800 text-sm">
                <div className="flex justify-between text-gray-600 dark:text-stone-300 font-medium">
                  <span>Subtotal Arreglos & Adicionales</span>
                  <span className="font-bold text-gray-800 dark:text-white">${subtotal.toFixed(2)}</span>
                </div>

                {appliedCoupon && (
                  <div className="flex justify-between text-green-600 dark:text-emerald-400 font-bold">
                    <span className="flex items-center gap-1">
                      <Tag size={14} /> Descuento Cupón ({appliedCoupon.code})
                    </span>
                    <span>-${discountAmount.toFixed(2)} USD</span>
                  </div>
                )}

                <div className="flex justify-between text-purple-700 dark:text-purple-300 font-medium bg-purple-50 dark:bg-purple-950/40 p-2.5 rounded-xl border border-purple-100 dark:border-purple-900/50">
                  <span className="font-bold flex items-center gap-1 text-xs">
                    🏛️ Impuestos de Ley (Sales Tax 8.25%)
                  </span>
                  <span className="font-extrabold text-purple-800 dark:text-purple-200">+${taxAmount.toFixed(2)} USD</span>
                </div>
                
                <div className="flex justify-between text-gray-600 dark:text-stone-300 font-medium">
                  <span>Entrega ({selectedDelivery.title})</span>
                  <span className="font-bold text-[#FF97A4]">
                    {deliveryFee > 0 ? `+$${deliveryFee.toFixed(2)}` : "GRATIS"}
                  </span>
                </div>

                <div className="border-t border-gray-200 dark:border-stone-800 pt-3 flex justify-between font-extrabold text-xl text-[#1A1C1C] dark:text-white">
                  <span>Total Final</span>
                  <span className="text-[#FF97A4]">${finalTotal.toFixed(2)} USD</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}

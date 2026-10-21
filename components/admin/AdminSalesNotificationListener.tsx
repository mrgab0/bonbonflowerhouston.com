"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import {
  Bell,
  Volume2,
  VolumeX,
  Sparkles,
  Receipt,
  FileText,
  Printer,
  ShoppingBag,
  ExternalLink,
  Check,
} from "lucide-react";
import Link from "next/link";
import {
  printTicket80mmDirect,
  printInvoiceA4Direct,
  isAutoPrintEnabled,
  setAutoPrintEnabled,
  getPosTestOrder,
  listenToPosPrintEvents,
  POSOrderData,
} from "@/lib/posPrinterClient";

export function AdminSalesNotificationListener() {
  const [activeAlertOrder, setActiveAlertOrder] = useState<POSOrderData | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [autoPrint, setAutoPrint] = useState(true);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>("default");
  const [isAlarmPlaying, setIsAlarmPlaying] = useState(false);
  const [isPrintingDirect, setIsPrintingDirect] = useState(false);

  const lastSeenOrderIdRef = useRef<string | null>(null);
  const isInitializedRef = useRef<boolean>(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const alarmIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Inicializar estado de Auto-Impresión desde localStorage
  useEffect(() => {
    setAutoPrint(isAutoPrintEnabled());

    const handleAutoPrintToggle = (e: Event) => {
      const custom = e as CustomEvent;
      if (typeof custom.detail?.enabled === "boolean") {
        setAutoPrint(custom.detail.enabled);
      }
    };

    window.addEventListener("bonbon:pos-autoprint-toggled", handleAutoPrintToggle);
    return () => {
      window.removeEventListener("bonbon:pos-autoprint-toggled", handleAutoPrintToggle);
    };
  }, []);

  // Suscribirse a eventos de impresión en JavaScript emitidos desde cualquier componente
  useEffect(() => {
    const unsubscribe = listenToPosPrintEvents(async ({ order, format, lang }) => {
      setIsPrintingDirect(true);
      try {
        if (format === "a4") {
          await printInvoiceA4Direct(order, lang);
        } else {
          await printTicket80mmDirect(order, lang);
        }
      } finally {
        setIsPrintingDirect(false);
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // Solicitar o consultar permisos de Notificaciones del Navegador
  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      setNotificationPermission(Notification.permission);
    }
  }, []);

  const requestNotificationPermission = async () => {
    if (typeof window !== "undefined" && "Notification" in window) {
      try {
        const perm = await Notification.requestPermission();
        setNotificationPermission(perm);
      } catch (e) {
        console.warn("No se pudo solicitar permiso de notificaciones:", e);
      }
    }
  };

  // Obtener o inicializar AudioContext
  const getAudioContext = useCallback(() => {
    if (!audioContextRef.current && typeof window !== "undefined") {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        audioContextRef.current = new AudioCtx();
      }
    }
    if (audioContextRef.current && audioContextRef.current.state === "suspended") {
      audioContextRef.current.resume();
    }
    return audioContextRef.current;
  }, []);

  // Sintetizador de Sonido de Caja Registradora + Alarma Fuerte ("Empieza a sonar duro")
  const playCashRegisterChime = useCallback(() => {
    try {
      const ctx = getAudioContext();
      if (!ctx) return;

      const now = ctx.currentTime;
      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(0.85, now);
      masterGain.connect(ctx.destination);

      // 1. Acorde Arpegiado Ascendente de Caja Registradora ("Ka-Ching!")
      const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51, 1567.98];
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const noteGain = ctx.createGain();
        osc.type = idx === notes.length - 1 ? "sawtooth" : "sine";
        osc.frequency.setValueAtTime(freq, now + idx * 0.08);

        const startTime = now + idx * 0.08;
        const duration = 0.45;

        noteGain.gain.setValueAtTime(0, startTime);
        noteGain.gain.linearRampToValueAtTime(0.35, startTime + 0.02);
        noteGain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

        osc.connect(noteGain);
        noteGain.connect(masterGain);

        osc.start(startTime);
        osc.stop(startTime + duration);
      });

      // 2. Tono de Alerta Penetrante (Bip de Notificación Urgente)
      const alertTimes = [0.65, 0.95, 1.25];
      alertTimes.forEach((tOffset, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(i % 2 === 0 ? 880 : 1200, now + tOffset);

        gain.gain.setValueAtTime(0, now + tOffset);
        gain.gain.linearRampToValueAtTime(0.4, now + tOffset + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + tOffset + 0.2);

        osc.connect(gain);
        gain.connect(masterGain);

        osc.start(now + tOffset);
        osc.stop(now + tOffset + 0.22);
      });
    } catch (e) {
      console.warn("Error reproduciendo audio Web Audio:", e);
    }
  }, [getAudioContext]);

  // Iniciar Bucle Continuo de Alarma Sonora
  const startAlarmLoop = useCallback(() => {
    if (!soundEnabled) return;
    setIsAlarmPlaying(true);
    playCashRegisterChime();

    if (alarmIntervalRef.current) clearInterval(alarmIntervalRef.current);
    alarmIntervalRef.current = setInterval(() => {
      playCashRegisterChime();
    }, 2200);
  }, [soundEnabled, playCashRegisterChime]);

  // Detener la Alarma Sonora
  const stopAlarmLoop = useCallback(() => {
    setIsAlarmPlaying(false);
    if (alarmIntervalRef.current) {
      clearInterval(alarmIntervalRef.current);
      alarmIntervalRef.current = null;
    }
  }, []);

  // Disparar Notificación Push del Navegador
  const triggerPushNotification = useCallback((order: POSOrderData) => {
    if (typeof window === "undefined" || !("Notification" in window)) return;

    if (Notification.permission === "granted") {
      try {
        const notif = new Notification("🚨 ¡VENDISTE! NUEVA VENTA CONFIRMADA 🎉", {
          body: `Orden #${order.orderId} • $${order.total.toFixed(2)} USD\nCliente: ${order.customerName}`,
          icon: "https://bonbonflowershouston.com/logo.png",
          tag: `order-${order.orderId}`,
          requireInteraction: true,
        });

        notif.onclick = () => {
          window.focus();
          window.location.href = "/admin/ordenes";
          notif.close();
        };
      } catch (e) {
        console.warn("Error lanzando Notification API:", e);
      }
    }
  }, []);

  // Polling de Detección de Ventas cada 4.5 segundos
  useEffect(() => {
    let timer: NodeJS.Timeout;

    const checkLatestSales = async () => {
      try {
        const res = await fetch("/api/admin/sales-alert", { cache: "no-store" });
        if (!res.ok) return;

        const data = await res.json();
        if (data.success && data.latestOrder) {
          const order: POSOrderData = data.latestOrder;

          // Primera carga: Guardar el ID existente sin alertar para no sonar con órdenes viejas
          if (!isInitializedRef.current) {
            isInitializedRef.current = true;
            lastSeenOrderIdRef.current = order.orderId;
            return;
          }

          // Si llega una orden NUEVA:
          if (lastSeenOrderIdRef.current && order.orderId !== lastSeenOrderIdRef.current) {
            lastSeenOrderIdRef.current = order.orderId;
            setActiveAlertOrder(order);
            startAlarmLoop();
            triggerPushNotification(order);

            // Auto-impresión 100% nativa en JavaScript para Star Micronics 80mm
            if (isAutoPrintEnabled()) {
              printTicket80mmDirect(order);
            }
          }
        }
      } catch (e) {
        // Silencioso ante fluctuaciones de conexión
      }
    };

    checkLatestSales();
    timer = setInterval(checkLatestSales, 4500);

    return () => {
      clearInterval(timer);
      stopAlarmLoop();
    };
  }, [startAlarmLoop, stopAlarmLoop, triggerPushNotification]);

  // Botón manual para probar la alarma sonora
  const handleTestSound = () => {
    getAudioContext();
    startAlarmLoop();
    setTimeout(() => {
      stopAlarmLoop();
    }, 4500);
  };

  // Botón para probar la impresora Star Micronics 80mm en 1 clic
  const handleTestPrintStar = async () => {
    setIsPrintingDirect(true);
    try {
      await printTicket80mmDirect(getPosTestOrder());
    } finally {
      setIsPrintingDirect(false);
    }
  };

  // Conmutar Auto-impresión
  const toggleAutoPrint = () => {
    const nextVal = !autoPrint;
    setAutoPrint(nextVal);
    setAutoPrintEnabled(nextVal);
  };

  return (
    <>
      {/* Botones Flotantes / Indicadores de Estado en Admin (Inferior Izquierda) */}
      <div className="fixed bottom-4 left-4 z-40 flex flex-wrap items-center gap-2 no-print">
        {/* Botón Alarma */}
        <button
          type="button"
          onClick={handleTestSound}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border shadow-lg transition-all ${
            isAlarmPlaying
              ? "bg-red-600 text-white animate-pulse border-red-700"
              : "bg-white/95 dark:bg-[#181922]/95 text-gray-800 dark:text-gray-200 border-gray-200 dark:border-gray-800 hover:border-[#FF97A4]"
          }`}
          title="Probar sonido de alarma de ventas"
        >
          {isAlarmPlaying ? (
            <>
              <Volume2 size={13} className="animate-bounce" />
              <span>¡Sonando Alarma!</span>
            </>
          ) : (
            <>
              <Bell size={13} className="text-[#FF97A4]" />
              <span className="hidden sm:inline">Probar Alarma</span>
            </>
          )}
        </button>

        {/* Toggle Auto-Impresión Star Micronics */}
        <button
          type="button"
          onClick={toggleAutoPrint}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border shadow-lg transition-all ${
            autoPrint
              ? "bg-emerald-600 text-white border-emerald-700"
              : "bg-white/95 dark:bg-[#181922]/95 text-gray-500 border-gray-200 dark:border-gray-800"
          }`}
          title="Activa o desactiva la impresión automática de tickets al registrarse una venta"
        >
          <Printer size={13} />
          <span>Auto-Print: {autoPrint ? "ON" : "OFF"}</span>
        </button>

        {/* Probar Impresión Star TSP100 80mm en 1 Clic */}
        <button
          type="button"
          onClick={handleTestPrintStar}
          disabled={isPrintingDirect}
          className="bg-white/95 dark:bg-[#181922]/95 text-stone-800 dark:text-stone-200 border border-gray-200 dark:border-gray-800 hover:border-emerald-500 px-3 py-1.5 rounded-xl text-xs font-bold shadow-lg transition-all flex items-center gap-1.5"
          title="Probar envío directo de ticket 80mm a la Star Micronics (100% JavaScript)"
        >
          <Receipt size={13} className="text-emerald-500" />
          <span className="hidden md:inline">Test Star 80mm</span>
        </button>

        {notificationPermission !== "granted" && (
          <button
            type="button"
            onClick={requestNotificationPermission}
            className="bg-amber-500 hover:bg-amber-600 text-white px-3 py-1.5 rounded-xl text-xs font-bold shadow-md transition-all flex items-center gap-1"
            title="Habilitar notificaciones Push en tu navegador para enterarte de ventas"
          >
            <Sparkles size={12} />
            <span className="hidden sm:inline">Activar Push</span>
          </button>
        )}
      </div>

      {/* MODAL / BANNER DE NUEVA VENTA EN TIEMPO REAL */}
      {activeAlertOrder && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200 no-print">
          <div className="bg-white dark:bg-[#12131A] border-4 border-amber-400 dark:border-[#5EEAD4] max-w-lg w-full rounded-3xl p-6 sm:p-8 space-y-6 shadow-[0px_20px_60px_rgba(245,158,11,0.5)] animate-in zoom-in-95 duration-300 relative text-center">
            {/* Insignia Parpadeante de Nueva Venta */}
            <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-amber-500 to-rose-500 text-white mx-auto flex items-center justify-center shadow-lg animate-bounce">
              <ShoppingBag size={32} />
            </div>

            <div className="space-y-1">
              <span className="text-[11px] font-black uppercase tracking-[0.25em] text-amber-600 dark:text-[#5EEAD4] block">
                ¡VENDISTE! • NUEVA VENTA CONFIRMADA
              </span>
              <h2 className="text-2xl sm:text-3xl font-serif font-black text-gray-900 dark:text-white leading-tight">
                ${activeAlertOrder.total.toFixed(2)} USD
              </h2>
              <p className="text-xs font-bold text-gray-500 dark:text-gray-400">
                Orden #{activeAlertOrder.orderId}
              </p>
            </div>

            {/* Datos del Cliente y Productos */}
            <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-800 text-left space-y-2 text-xs">
              <div className="flex justify-between items-center border-b pb-2 border-gray-200 dark:border-gray-800">
                <span className="font-bold text-gray-700 dark:text-gray-300">Cliente:</span>
                <span className="font-extrabold text-gray-900 dark:text-white">{activeAlertOrder.customerName}</span>
              </div>
              {activeAlertOrder.customerPhone && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Teléfono:</span>
                  <span className="font-mono font-bold text-gray-800 dark:text-gray-200">{activeAlertOrder.customerPhone}</span>
                </div>
              )}
              {activeAlertOrder.address && (
                <div className="text-[11px] text-gray-600 dark:text-gray-400">
                  <span className="font-bold text-gray-700 dark:text-gray-300">Entrega: </span>
                  <span>{activeAlertOrder.address}</span>
                </div>
              )}
              {activeAlertOrder.items && activeAlertOrder.items.length > 0 && (
                <div className="pt-1 text-[11px] text-gray-600 dark:text-gray-400">
                  <span className="font-bold text-gray-800 dark:text-gray-200 block mb-0.5">Arreglo:</span>
                  <span>{activeAlertOrder.items[0].quantity}x {activeAlertOrder.items[0].name}</span>
                </div>
              )}
            </div>

            {/* Switch de Auto-Impresión dentro del Modal */}
            <div className="flex items-center justify-center gap-2 text-xs font-semibold text-gray-700 dark:text-gray-300 py-1">
              <input
                id="modal-autoprint-checkbox"
                type="checkbox"
                checked={autoPrint}
                onChange={toggleAutoPrint}
                className="rounded text-pink-600 focus:ring-pink-500 w-4 h-4 cursor-pointer"
              />
              <label htmlFor="modal-autoprint-checkbox" className="cursor-pointer">
                Auto-imprimir ticket Star 80mm al detectar venta
              </label>
            </div>

            {/* Acciones de Impresión y Desactivación de Alarma */}
            <div className="space-y-2.5 pt-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    printTicket80mmDirect(activeAlertOrder);
                  }}
                  className="bg-pink-600 hover:bg-pink-700 text-white py-3 px-4 rounded-2xl font-black text-xs flex items-center justify-center gap-1.5 shadow-md transition-all hover:scale-102 cursor-pointer"
                  title="Disparar impresión de ticket Star 80mm de inmediato en este equipo"
                >
                  <Receipt size={16} />
                  <span>Imprimir Ticket (80mm)</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    printInvoiceA4Direct(activeAlertOrder);
                  }}
                  className="bg-slate-800 hover:bg-black text-white py-3 px-4 rounded-2xl font-black text-xs flex items-center justify-center gap-1.5 shadow-md transition-all hover:scale-102 cursor-pointer"
                  title="Disparar impresión de Factura A4 de inmediato en este equipo"
                >
                  <FileText size={16} />
                  <span>Imprimir Factura A4</span>
                </button>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    stopAlarmLoop();
                    setActiveAlertOrder(null);
                  }}
                  className="w-full py-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-2xl font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                >
                  <VolumeX size={15} />
                  <span>Silenciar Alarma y Cerrar</span>
                </button>

                <Link
                  href="/admin/ordenes"
                  onClick={() => {
                    stopAlarmLoop();
                    setActiveAlertOrder(null);
                  }}
                  className="w-full sm:w-auto whitespace-nowrap py-2.5 px-4 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 rounded-2xl font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                >
                  <span>Ver en Despacho</span>
                  <ExternalLink size={13} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

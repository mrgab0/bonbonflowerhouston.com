"use client";

import React, { useState, useEffect } from "react";
import {
  Bell,
  BellRing,
  Smartphone,
  CheckCircle2,
  AlertCircle,
  Share,
  PlusSquare,
  Sparkles,
  Loader2,
  Send,
  Volume2,
} from "lucide-react";

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function AdminWebPushManager() {
  const [isSupported, setIsSupported] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [testing, setTesting] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: "success" | "error" | "info"; text: string } | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const hasSw = "serviceWorker" in navigator;
    const hasPush = "PushManager" in window;
    const hasNotif = "Notification" in window;

    setIsSupported(hasSw && hasPush && hasNotif);

    if (hasNotif) {
      setPermission(Notification.permission);
    }

    // Detección de dispositivo iOS (iPhone / iPad)
    const ua = window.navigator.userAgent;
    const iosDevice = /iPhone|iPad|iPod/i.test(ua);
    setIsIos(iosDevice);

    // Detección de modo PWA instalada en pantalla de inicio
    const standaloneMode =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true;
    setIsStandalone(standaloneMode);

    // Comprobar si ya existe suscripción activa en este navegador
    if (hasSw && hasPush) {
      navigator.serviceWorker.ready.then((reg) => {
        reg.pushManager.getSubscription().then((sub) => {
          setIsSubscribed(!!sub);
        });
      });
    }
  }, []);

  // Activar Notificaciones Web Push
  async function handleSubscribe() {
    setLoading(true);
    setStatusMsg(null);

    try {
      if (!isSupported) {
        throw new Error("Tu navegador actual no soporta notificaciones Web Push.");
      }

      // 1. Solicitar permiso al usuario
      const perm = await Notification.requestPermission();
      setPermission(perm);

      if (perm !== "granted") {
        throw new Error(
          perm === "denied"
            ? "Permiso denegado. Para recibir alertas, habilita las notificaciones en la configuración de Safari / iPhone."
            : "No se otorgaron permisos de notificación."
        );
      }

      // 2. Obtener la clave pública VAPID del servidor
      const keyRes = await fetch("/api/admin/push/vapid-key");
      const keyData = await keyRes.json();
      if (!keyData.success || !keyData.publicKey) {
        throw new Error(keyData.error || "No se pudo obtener la clave VAPID de la tienda.");
      }

      // 3. Registrar o reutilizar el Service Worker
      const reg = await navigator.serviceWorker.register("/sw.js");
      await navigator.serviceWorker.ready;

      // 4. Suscribir al PushManager del navegador
      const convertedVapidKey = urlBase64ToUint8Array(keyData.publicKey);
      let sub = await reg.pushManager.getSubscription();

      if (!sub) {
        sub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: convertedVapidKey,
        });
      }

      // 5. Enviar credencial al backend para guardarla en MongoDB
      const saveRes = await fetch("/api/admin/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subscription: sub.toJSON(),
          userAgent: window.navigator.userAgent,
        }),
      });

      const saveData = await saveRes.json();
      if (!saveData.success) {
        throw new Error(saveData.error || "Error al registrar la suscripción en el servidor.");
      }

      setIsSubscribed(true);
      setStatusMsg({
        type: "success",
        text: "¡Notificaciones activadas con éxito! Ahora recibirás alertas en tiempo real en este teléfono.",
      });

      // 6. Lanzar notificación de prueba de bienvenida automática
      handleSendTest(sub);
    } catch (err: any) {
      console.error("Error al activar notificaciones:", err);
      setStatusMsg({
        type: "error",
        text: err.message || "No se pudieron activar las notificaciones.",
      });
    } finally {
      setLoading(false);
    }
  }

  // Enviar prueba de alerta directa al teléfono
  async function handleSendTest(customSub?: PushSubscription | null) {
    setTesting(true);
    setStatusMsg(null);

    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = customSub || (await reg.pushManager.getSubscription());

      if (!sub) {
        throw new Error("No hay una suscripción activa en este dispositivo.");
      }

      const res = await fetch("/api/admin/push/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subscription: sub.toJSON() }),
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || "No se pudo enviar la alerta de prueba.");
      }

      setStatusMsg({
        type: "success",
        text: "¡Alerta de prueba enviada! Revisa el banner de notificación en tu teléfono.",
      });
    } catch (err: any) {
      setStatusMsg({
        type: "error",
        text: err.message || "Error al enviar la prueba.",
      });
    } finally {
      setTesting(false);
    }
  }

  return (
    <div className="bg-white dark:bg-stone-900 border border-pink-100 dark:border-pink-950/40 rounded-2xl p-5 sm:p-6 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100 dark:border-stone-800">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-pink-50 dark:bg-pink-950/50 flex items-center justify-center text-[#E6007F] shrink-0 border border-pink-200/60 dark:border-pink-900/40">
            <BellRing className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
              Alertas de Ventas en Teléfono
              {isSubscribed && (
                <span className="text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 px-2.5 py-0.5 rounded-full inline-flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                  Activas
                </span>
              )}
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Notificaciones instantáneas en iPhone y Android incluso con la pantalla bloqueada.
            </p>
          </div>
        </div>

        {/* Botón de Prueba Rápida si ya está suscrito */}
        {isSubscribed && (
          <button
            onClick={() => handleSendTest()}
            disabled={testing}
            className="inline-flex items-center justify-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-gray-800 dark:text-gray-200 transition-colors shrink-0 disabled:opacity-50"
          >
            {testing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
            Probar Alerta en este Teléfono
          </button>
        )}
      </div>

      {/* Mensaje de retroalimentación */}
      {statusMsg && (
        <div
          className={`mt-4 p-3.5 rounded-xl text-xs flex items-start gap-2.5 ${
            statusMsg.type === "success"
              ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-800"
              : statusMsg.type === "error"
              ? "bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-200 border border-rose-200 dark:border-rose-800"
              : "bg-blue-50 dark:bg-blue-950/40 text-blue-800 dark:text-blue-200 border border-blue-200 dark:border-blue-800"
          }`}
        >
          {statusMsg.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
          )}
          <span>{statusMsg.text}</span>
        </div>
      )}

      {/* Guía especial paso a paso para iPhone en navegador Safari */}
      {isIos && !isStandalone && !isSubscribed && (
        <div className="mt-4 p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/40 text-amber-900 dark:text-amber-200">
          <div className="flex items-center gap-2 font-bold text-xs mb-2">
            <Smartphone className="w-4 h-4 text-amber-700 dark:text-amber-400" />
            Paso necesario para recibir alertas con el iPhone bloqueado (iOS 16.4+):
          </div>
          <ol className="text-xs space-y-1.5 list-decimal list-inside text-amber-800/90 dark:text-amber-300/90">
            <li>
              En Safari, toca el botón <strong>Compartir</strong> (<Share className="w-3.5 h-3.5 inline text-amber-700 dark:text-amber-400" /> con flecha hacia arriba).
            </li>
            <li>
              Desliza hacia abajo y presiona <strong>"Agregar a la pantalla de inicio"</strong> (<PlusSquare className="w-3.5 h-3.5 inline text-amber-700 dark:text-amber-400" />).
            </li>
            <li>
              Abre el ícono de <strong>Bonbon Flowers</strong> desde tu pantalla de inicio y presiona el botón de abajo.
            </li>
          </ol>
        </div>
      )}

      {/* Acción Principal */}
      <div className="mt-5 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#E6007F]"></span>
          Logo oficial y sonido de timbre incluidos en cada alerta.
        </div>

        {!isSubscribed ? (
          <button
            onClick={handleSubscribe}
            disabled={loading}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#E6007F] hover:bg-[#c7006e] text-white font-semibold text-xs transition-all shadow-sm hover:shadow active:scale-95 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Configurando...
              </>
            ) : (
              <>
                <Bell className="w-4 h-4" />
                Activar Alertas de Ventas en este Teléfono
              </>
            )}
          </button>
        ) : (
          <div className="text-xs font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4" />
            Este dispositivo está listo para sonar en cada nueva venta.
          </div>
        )}
      </div>
    </div>
  );
}

"use client";

import React, { useState, useMemo } from "react";
import {
  Globe,
  MessageCircle,
  Phone,
  FileText,
  Wifi,
  Sparkles,
  Palette,
  Image as ImageIcon,
  CheckCircle2,
  Upload,
  RefreshCw,
} from "lucide-react";
import {
  QrCanvasPreview,
  QrDesignConfig,
  QrStylePreset,
} from "./QrCanvasPreview";

export function StaticQrEditor() {
  // Payload Type State
  const [dataType, setDataType] = useState<"url" | "whatsapp" | "phone" | "text" | "wifi">("url");

  // Specific data fields
  const [url, setUrl] = useState("https://bonbonflowerhouston.com");
  
  // WhatsApp fields
  const [waCountry, setWaCountry] = useState("1"); // USA +1
  const [waPhone, setWaPhone] = useState("8329987823");
  const [waMessage, setWaMessage] = useState("¡Hola Bonbon Flowers! Deseo ordenar un arreglo floral.");

  // Phone direct call
  const [phoneNum, setPhoneNum] = useState("+1 (832) 998-7823");

  // Plain Text / Flower card message
  const [plainText, setPlainText] = useState("Con todo mi amor y cariño para ti. De: Tu Admirador Secreto 🌹");

  // WiFi credentials
  const [wifiSsid, setWifiSsid] = useState("BonbonFlowers_Guest");
  const [wifiPassword, setWifiPassword] = useState("");
  const [wifiEncryption, setWifiEncryption] = useState<"WPA" | "WEP" | "nopass">("WPA");

  // Design Configuration
  const [designConfig, setDesignConfig] = useState<QrDesignConfig>({
    stylePreset: "floral",
    fgColor: "#163422", // Deep emerald
    bgColor: "#FFFFFF",
    eyeColor: "#FF97A4", // Bonbon signature pink
    includeLogo: true, // PALOMITA ACTIVADA POR DEFECTO
    logoUrl: "/logo.png",
    logoSize: 22,
    margin: 3,
  });

  const [customLogoFile, setCustomLogoFile] = useState<string | null>(null);

  // Compute final QR payload string
  const qrValue = useMemo(() => {
    switch (dataType) {
      case "whatsapp": {
        const cleanPhone = (waCountry + waPhone).replace(/[^0-9]/g, "");
        const encodedMsg = encodeURIComponent(waMessage);
        return `https://wa.me/${cleanPhone}${encodedMsg ? `?text=${encodedMsg}` : ""}`;
      }
      case "phone": {
        const cleanPhone = phoneNum.replace(/[^0-9+]/g, "");
        return `tel:${cleanPhone}`;
      }
      case "text": {
        return plainText || "Bonbon Flowers Houston";
      }
      case "wifi": {
        return `WIFI:S:${wifiSsid};T:${wifiEncryption};P:${wifiPassword};;`;
      }
      case "url":
      default: {
        let clean = url.trim();
        if (!clean) return "https://bonbonflowerhouston.com";
        if (!clean.startsWith("http://") && !clean.startsWith("https://")) {
          clean = "https://" + clean;
        }
        return clean;
      }
    }
  }, [dataType, url, waCountry, waPhone, waMessage, phoneNum, plainText, wifiSsid, wifiPassword, wifiEncryption]);

  // Handle Preset Selection
  const applyPreset = (preset: QrStylePreset) => {
    if (preset === "floral") {
      setDesignConfig((prev) => ({
        ...prev,
        stylePreset: "floral",
        fgColor: "#163422",
        bgColor: "#FFF5F7",
        eyeColor: "#FF97A4",
      }));
    } else if (preset === "luxury") {
      setDesignConfig((prev) => ({
        ...prev,
        stylePreset: "luxury",
        fgColor: "#163422",
        bgColor: "#FFFFFF",
        eyeColor: "#D4AF37",
      }));
    } else if (preset === "modern") {
      setDesignConfig((prev) => ({
        ...prev,
        stylePreset: "modern",
        fgColor: "#0F172A",
        bgColor: "#FFFFFF",
        eyeColor: "#0F172A",
      }));
    } else if (preset === "classic") {
      setDesignConfig((prev) => ({
        ...prev,
        stylePreset: "classic",
        fgColor: "#000000",
        bgColor: "#FFFFFF",
        eyeColor: "#000000",
      }));
    }
  };

  // Handle custom logo file upload
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setCustomLogoFile(dataUrl);
      setDesignConfig((prev) => ({
        ...prev,
        includeLogo: true,
        logoUrl: dataUrl,
      }));
    };
    reader.readAsDataURL(file);
  };

  const resetToOfficialLogo = () => {
    setCustomLogoFile(null);
    setDesignConfig((prev) => ({
      ...prev,
      includeLogo: true,
      logoUrl: "/logo.png",
    }));
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* Left Column: Form & Customizer (7 cols) */}
      <div className="lg:col-span-7 space-y-6">
        {/* Step 1: Payload Type Selector */}
        <div className="bg-white dark:bg-[#16181F] p-6 rounded-2xl shadow-sm border border-gray-200/80 dark:border-gray-800">
          <label className="block text-xs font-bold uppercase tracking-wider text-[#B0004A] dark:text-pink-400 mb-3 flex items-center gap-1.5">
            <Globe className="w-4 h-4" /> 1. ¿Qué información deseas codificar?
          </label>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mb-4">
            <button
              type="button"
              onClick={() => setDataType("url")}
              className={`py-2.5 px-3 rounded-xl text-xs font-bold flex flex-col items-center gap-1 transition-all ${
                dataType === "url"
                  ? "bg-[#163422] text-white shadow-md"
                  : "bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100"
              }`}
            >
              <Globe className="w-4 h-4" />
              Página Web
            </button>

            <button
              type="button"
              onClick={() => setDataType("whatsapp")}
              className={`py-2.5 px-3 rounded-xl text-xs font-bold flex flex-col items-center gap-1 transition-all ${
                dataType === "whatsapp"
                  ? "bg-emerald-700 text-white shadow-md"
                  : "bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100"
              }`}
            >
              <MessageCircle className="w-4 h-4 text-emerald-300" />
              WhatsApp
            </button>

            <button
              type="button"
              onClick={() => setDataType("phone")}
              className={`py-2.5 px-3 rounded-xl text-xs font-bold flex flex-col items-center gap-1 transition-all ${
                dataType === "phone"
                  ? "bg-[#163422] text-white shadow-md"
                  : "bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100"
              }`}
            >
              <Phone className="w-4 h-4" />
              Llamada
            </button>

            <button
              type="button"
              onClick={() => setDataType("text")}
              className={`py-2.5 px-3 rounded-xl text-xs font-bold flex flex-col items-center gap-1 transition-all ${
                dataType === "text"
                  ? "bg-[#163422] text-white shadow-md"
                  : "bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100"
              }`}
            >
              <FileText className="w-4 h-4" />
              Dedicatoria
            </button>

            <button
              type="button"
              onClick={() => setDataType("wifi")}
              className={`py-2.5 px-3 rounded-xl text-xs font-bold flex flex-col items-center gap-1 transition-all ${
                dataType === "wifi"
                  ? "bg-[#163422] text-white shadow-md"
                  : "bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100"
              }`}
            >
              <Wifi className="w-4 h-4" />
              Red WiFi
            </button>
          </div>

          {/* Dynamic Input based on dataType */}
          <div className="space-y-4 pt-2">
            {dataType === "url" && (
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Enlace de destino (URL):
                </label>
                <input
                  type="text"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://bonbonflowerhouston.com/productos"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF97A4]"
                />

                {/* Quick suggestions */}
                <div className="flex flex-wrap gap-1.5 mt-2.5">
                  <span className="text-[11px] text-gray-400 self-center">Sugerencias rápidas:</span>
                  {[
                    { label: "Tienda", val: "https://bonbonflowerhouston.com" },
                    { label: "Catálogo", val: "https://bonbonflowerhouston.com/productos" },
                    { label: "Instagram", val: "https://instagram.com/bonbonflowershouston" },
                  ].map((sug) => (
                    <button
                      key={sug.label}
                      type="button"
                      onClick={() => setUrl(sug.val)}
                      className="px-2 py-0.5 text-xs bg-gray-100 dark:bg-gray-800 hover:bg-pink-100 dark:hover:bg-pink-950 text-gray-700 dark:text-gray-300 hover:text-[#B0004A] rounded-lg transition-all"
                    >
                      {sug.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {dataType === "whatsapp" && (
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Código País:
                    </label>
                    <input
                      type="text"
                      value={waCountry}
                      onChange={(e) => setWaCountry(e.target.value)}
                      placeholder="1 (USA)"
                      className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF97A4]"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Teléfono WhatsApp:
                    </label>
                    <input
                      type="text"
                      value={waPhone}
                      onChange={(e) => setWaPhone(e.target.value)}
                      placeholder="8329987823"
                      className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF97A4]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Mensaje inicial predeterminado:
                  </label>
                  <textarea
                    rows={2}
                    value={waMessage}
                    onChange={(e) => setWaMessage(e.target.value)}
                    placeholder="¡Hola! Me gustaría hacer un pedido personalizado..."
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF97A4]"
                  />
                </div>
              </div>
            )}

            {dataType === "phone" && (
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Número de teléfono para llamada directa:
                </label>
                <input
                  type="text"
                  value={phoneNum}
                  onChange={(e) => setPhoneNum(e.target.value)}
                  placeholder="+1 (832) 998-7823"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF97A4]"
                />
              </div>
            )}

            {dataType === "text" && (
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Texto o mensaje de la tarjeta floral:
                </label>
                <textarea
                  rows={3}
                  value={plainText}
                  onChange={(e) => setPlainText(e.target.value)}
                  placeholder="Escribe el mensaje o dedicatoria aquí..."
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF97A4]"
                />
              </div>
            )}

            {dataType === "wifi" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Nombre de Red (SSID):
                  </label>
                  <input
                    type="text"
                    value={wifiSsid}
                    onChange={(e) => setWifiSsid(e.target.value)}
                    placeholder="Nombre del WiFi"
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF97A4]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Contraseña:
                  </label>
                  <input
                    type="text"
                    value={wifiPassword}
                    onChange={(e) => setWifiPassword(e.target.value)}
                    placeholder="Contraseña del WiFi"
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF97A4]"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Step 2: Model & Style Presets */}
        <div className="bg-white dark:bg-[#16181F] p-6 rounded-2xl shadow-sm border border-gray-200/80 dark:border-gray-800">
          <label className="block text-xs font-bold uppercase tracking-wider text-[#B0004A] dark:text-pink-400 mb-3 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4" /> 2. Modelos de QR Estéticos (No comunes)
          </label>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              {
                id: "floral" as QrStylePreset,
                name: "Romántico Floral",
                desc: "Puntos suaves & tonos rosados",
                border: "border-pink-300 hover:border-[#FF97A4]",
                badge: "Recomendado",
              },
              {
                id: "luxury" as QrStylePreset,
                name: "Boutique Esmeralda",
                desc: "Verde bosque & acentos oro",
                border: "border-emerald-300 hover:border-[#163422]",
                badge: "Luxury",
              },
              {
                id: "modern" as QrStylePreset,
                name: "Minimalista Squircle",
                desc: "Esquinas suaves y modernas",
                border: "border-gray-300 hover:border-gray-800",
                badge: "Moderno",
              },
              {
                id: "classic" as QrStylePreset,
                name: "Clásico Precisión",
                desc: "Para impresión mini y cintas",
                border: "border-gray-200 hover:border-gray-600",
                badge: "Imprenta",
              },
            ].map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => applyPreset(preset.id)}
                className={`p-3 rounded-2xl border-2 text-left transition-all relative ${
                  designConfig.stylePreset === preset.id
                    ? "border-[#B0004A] bg-pink-50/50 dark:bg-pink-950/20 shadow-sm"
                    : `${preset.border} bg-white dark:bg-gray-900/60`
                }`}
              >
                {designConfig.stylePreset === preset.id && (
                  <CheckCircle2 className="w-4 h-4 text-[#B0004A] absolute top-2 right-2" />
                )}
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
                  {preset.badge}
                </span>
                <h4 className="font-bold text-xs sm:text-sm text-gray-900 dark:text-gray-100 mt-2">
                  {preset.name}
                </h4>
                <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                  {preset.desc}
                </p>
              </button>
            ))}
          </div>

          {/* Color Palettes Customizer */}
          <div className="mt-5 pt-4 border-t border-gray-100 dark:border-gray-800">
            <span className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-1.5">
              <Palette className="w-3.5 h-3.5 text-gray-500" /> Personalizar Colores:
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">
                  Color del QR (Módulos):
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={designConfig.fgColor}
                    onChange={(e) =>
                      setDesignConfig((prev) => ({ ...prev, fgColor: e.target.value }))
                    }
                    className="w-9 h-9 rounded-lg border border-gray-200 cursor-pointer p-0.5"
                  />
                  <input
                    type="text"
                    value={designConfig.fgColor}
                    onChange={(e) =>
                      setDesignConfig((prev) => ({ ...prev, fgColor: e.target.value }))
                    }
                    className="flex-1 px-2.5 py-1.5 text-xs rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 uppercase font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">
                  Color de Fondo:
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={designConfig.bgColor}
                    onChange={(e) =>
                      setDesignConfig((prev) => ({ ...prev, bgColor: e.target.value }))
                    }
                    className="w-9 h-9 rounded-lg border border-gray-200 cursor-pointer p-0.5"
                  />
                  <input
                    type="text"
                    value={designConfig.bgColor}
                    onChange={(e) =>
                      setDesignConfig((prev) => ({ ...prev, bgColor: e.target.value }))
                    }
                    className="flex-1 px-2.5 py-1.5 text-xs rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 uppercase font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">
                  Color de las Esquinas (Ojos):
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={designConfig.eyeColor}
                    onChange={(e) =>
                      setDesignConfig((prev) => ({ ...prev, eyeColor: e.target.value }))
                    }
                    className="w-9 h-9 rounded-lg border border-gray-200 cursor-pointer p-0.5"
                  />
                  <input
                    type="text"
                    value={designConfig.eyeColor}
                    onChange={(e) =>
                      setDesignConfig((prev) => ({ ...prev, eyeColor: e.target.value }))
                    }
                    className="flex-1 px-2.5 py-1.5 text-xs rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 uppercase font-mono"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Step 3: Logo & Center Image Customizer */}
        <div className="bg-white dark:bg-[#16181F] p-6 rounded-2xl shadow-sm border border-gray-200/80 dark:border-gray-800">
          <label className="block text-xs font-bold uppercase tracking-wider text-[#B0004A] dark:text-pink-400 mb-3 flex items-center gap-1.5">
            <ImageIcon className="w-4 h-4" /> 3. Logotipo & Foto Central
          </label>

          {/* The requested checkbox / palomita - Default checked */}
          <div className="p-4 rounded-xl bg-pink-50/60 dark:bg-pink-950/20 border border-pink-200/80 dark:border-pink-900/40 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="includeLogoCheck"
                checked={designConfig.includeLogo}
                onChange={(e) =>
                  setDesignConfig((prev) => ({
                    ...prev,
                    includeLogo: e.target.checked,
                  }))
                }
                className="w-5 h-5 rounded text-[#B0004A] focus:ring-[#FF97A4] border-gray-300 cursor-pointer accent-[#B0004A]"
              />
              <label htmlFor="includeLogoCheck" className="cursor-pointer select-none">
                <span className="font-bold text-sm text-gray-900 dark:text-gray-100 block">
                  Incluir Logo Oficial de Bonbon Flowers
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  Añade el logo central enmarcado para un acabado de marca profesional.
                </span>
              </label>
            </div>

            <div className="w-10 h-10 rounded-full border border-pink-200 dark:border-pink-900/60 overflow-hidden bg-white p-0.5 shadow-sm flex items-center justify-center">
              <img
                src={designConfig.logoUrl || "/logo.png"}
                alt="Logo Preview"
                className="w-full h-full object-contain rounded-full"
              />
            </div>
          </div>

          {/* Logo options when checked */}
          {designConfig.includeLogo && (
            <div className="mt-4 space-y-4 pt-2">
              {/* Logo size slider */}
              <div>
                <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
                  <span>Tamaño del Logo:</span>
                  <span className="font-semibold">{designConfig.logoSize}%</span>
                </div>
                <input
                  type="range"
                  min="16"
                  max="28"
                  value={designConfig.logoSize}
                  onChange={(e) =>
                    setDesignConfig((prev) => ({
                      ...prev,
                      logoSize: Number(e.target.value),
                    }))
                  }
                  className="w-full accent-[#B0004A] cursor-pointer"
                />
              </div>

              {/* Upload alternative logo or reset */}
              <div className="flex items-center gap-3">
                <label className="cursor-pointer py-2 px-3 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all">
                  <Upload className="w-3.5 h-3.5 text-gray-500" />
                  Subir logo/foto alternativa
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                  />
                </label>

                {customLogoFile && (
                  <button
                    type="button"
                    onClick={resetToOfficialLogo}
                    className="py-2 px-3 text-xs text-rose-600 hover:text-rose-700 font-semibold flex items-center gap-1 transition-all"
                  >
                    <RefreshCw className="w-3 h-3" />
                    Restaurar logo oficial
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right Column: Live Interactive Canvas Preview (5 cols) */}
      <div className="lg:col-span-5 sticky top-6">
        <div className="bg-white dark:bg-[#16181F] p-6 rounded-2xl shadow-sm border border-gray-200/80 dark:border-gray-800">
          <div className="text-center mb-4">
            <h3 className="font-bold text-gray-900 dark:text-gray-100 text-base">
              Vista Previa en Vivo
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Escanea con tu cámara para probarlo inmediatamente
            </p>
          </div>

          <QrCanvasPreview
            value={qrValue}
            config={designConfig}
            title={dataType === "whatsapp" ? "Bonbon-Flowers-WhatsApp" : "Bonbon-Flowers-QR"}
            onConfigChange={(newCfg) => setDesignConfig((prev) => ({ ...prev, ...newCfg }))}
          />

          <div className="mt-5 p-3 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-800 text-[11px] text-gray-500 dark:text-gray-400 text-center">
            💡 <strong>Nota del QR Estático:</strong> Los datos se graban de forma permanente e inalterable en el código. No requiere base de datos.
          </div>
        </div>
      </div>
    </div>
  );
}

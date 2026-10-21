"use client";

import React, { useState, useTransition } from "react";
import {
  Palette,
  Sparkles,
  Save,
  RotateCcw,
  Check,
  Eye,
  Smartphone,
  Monitor,
  ShoppingBag,
  Heart,
  ChevronRight,
  Truck,
  Clock,
  MapPin,
  ExternalLink,
  Layers,
  Undo2,
} from "lucide-react";
import { IThemeConfig } from "@/lib/models/SiteConfig";
import {
  DEFAULT_THEME_CONFIG,
  THEME_PRESETS,
  updateThemeConfigAction,
} from "@/lib/actions/theme";

interface ThemeEditorClientProps {
  initialTheme: IThemeConfig;
}

export function ThemeEditorClient({ initialTheme }: ThemeEditorClientProps) {
  const [theme, setTheme] = useState<IThemeConfig>({
    ...DEFAULT_THEME_CONFIG,
    ...initialTheme,
  });
  const [activeTab, setActiveTab] = useState<"general" | "header" | "buttons" | "typography" | "footer">("general");
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "mobile">("desktop");
  const [isPending, startTransition] = useTransition();
  const [saveStatus, setSaveStatus] = useState<{ type: "success" | "error" | null; message: string }>({
    type: null,
    message: "",
  });

  const handleColorChange = (key: keyof IThemeConfig, value: string) => {
    setTheme((prev) => ({
      ...prev,
      [key]: value,
    }));
    setSaveStatus({ type: null, message: "" });
  };

  const handleApplyPreset = (presetTheme: IThemeConfig) => {
    setTheme({
      ...DEFAULT_THEME_CONFIG,
      ...presetTheme,
    });
    setSaveStatus({
      type: "success",
      message: "¡Plantilla aplicada en la vista previa! Recuerda presionar Guardar Cambios.",
    });
  };

  const handleReset = () => {
    if (confirm("¿Deseas restaurar la paleta de colores oficial original de Bonbon Flowers?")) {
      setTheme({ ...DEFAULT_THEME_CONFIG });
      setSaveStatus({
        type: "success",
        message: "Valores restablecidos a la paleta oficial por defecto.",
      });
    }
  };

  const handleSave = () => {
    startTransition(async () => {
      setSaveStatus({ type: null, message: "" });
      const res = await updateThemeConfigAction(theme);
      if (res.success) {
        setSaveStatus({
          type: "success",
          message: "✨ ¡Tema guardado con éxito! Los colores ya están en vivo en la tienda.",
        });
      } else {
        setSaveStatus({
          type: "error",
          message: res.error || "Ocurrió un error al guardar el tema.",
        });
      }
    });
  };

  return (
    <div className="space-y-8">
      {/* Encabezado del Editor */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-[#12131A] p-6 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-pink-600 dark:text-pink-400 mb-1">
            <Palette size={16} />
            <span>Personalización Visual de la Tienda</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-black text-stone-900 dark:text-white">
            Editor de Tema &amp; Colores de la Home
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 mt-1 max-w-2xl">
            Edita los colores de la barra superior de anuncios, cabecera, botones, textos y pie de página en tiempo real.
            Tus cambios se reflejan inmediatamente en la tienda para tus clientes.
          </p>
        </div>

        {/* Acciones principales de guardado */}
        <div className="flex items-center gap-3 self-start md:self-auto flex-wrap">
          <button
            type="button"
            onClick={handleReset}
            disabled={isPending}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-900 text-stone-700 dark:text-stone-300 hover:bg-stone-100 text-xs font-bold transition-all shadow-sm active:scale-95"
            title="Restaurar a los colores originales"
          >
            <RotateCcw size={14} />
            <span>Restaurar Oficial</span>
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={isPending}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#163422] hover:bg-[#1F452E] text-white text-xs font-extrabold transition-all shadow-md active:scale-95 disabled:opacity-50"
          >
            {isPending ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                <span>Guardando...</span>
              </>
            ) : (
              <>
                <Save size={16} />
                <span>Guardar Cambios</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Banner de Feedback / Alertas */}
      {saveStatus.type && (
        <div
          className={`p-4 rounded-2xl text-xs font-bold flex items-center justify-between border ${
            saveStatus.type === "success"
              ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900"
              : "bg-rose-50 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border-rose-200 dark:border-rose-900"
          }`}
        >
          <div className="flex items-center gap-2">
            {saveStatus.type === "success" ? <Check size={16} /> : <Sparkles size={16} />}
            <span>{saveStatus.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setSaveStatus({ type: null, message: "" })}
            className="text-stone-400 hover:text-stone-600 dark:hover:text-white"
          >
            ✕
          </button>
        </div>
      )}

      {/* SECCIÓN 1: PALETAS PREDISEÑADAS DE 1-CLIC */}
      <div className="bg-white dark:bg-[#12131A] p-6 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles size={18} className="text-amber-500" />
            <h2 className="text-sm font-black uppercase tracking-wider text-stone-900 dark:text-white">
              Colecciones &amp; Paletas de Lujo Recomendadas
            </h2>
          </div>
          <span className="text-[11px] text-stone-500 font-medium hidden sm:inline">
            Selecciona una para aplicar al instante
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
          {THEME_PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => handleApplyPreset(preset.theme)}
              className="text-left p-3.5 rounded-2xl border border-stone-200 dark:border-stone-800 hover:border-[#163422] dark:hover:border-[#5EEAD4] bg-stone-50/60 dark:bg-stone-900/60 hover:bg-stone-50 transition-all group flex flex-col justify-between space-y-3 relative overflow-hidden"
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-black text-stone-900 dark:text-white group-hover:text-pink-600 transition-colors">
                    {preset.name}
                  </span>
                  <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-300">
                    {preset.badge}
                  </span>
                </div>
                <p className="text-[11px] text-stone-500 dark:text-stone-400 line-clamp-2 leading-relaxed">
                  {preset.description}
                </p>
              </div>

              {/* Muestras de color del preset */}
              <div className="flex items-center gap-1.5 pt-1 border-t border-stone-200/60 dark:border-stone-800">
                <span
                  className="w-5 h-5 rounded-full border border-black/10 shadow-xs"
                  style={{ backgroundColor: preset.theme.buttonPrimaryBg }}
                  title="Botón Primario"
                />
                <span
                  className="w-5 h-5 rounded-full border border-black/10 shadow-xs"
                  style={{ backgroundColor: preset.theme.announcementBg }}
                  title="Barra de Anuncios"
                />
                <span
                  className="w-5 h-5 rounded-full border border-black/10 shadow-xs"
                  style={{ backgroundColor: preset.theme.buttonSecondaryBg }}
                  title="Botón Secundario"
                />
                <span
                  className="w-5 h-5 rounded-full border border-black/10 shadow-xs"
                  style={{ backgroundColor: preset.theme.accentColor }}
                  title="Acento Dorado"
                />
                <span
                  className="w-5 h-5 rounded-full border border-black/10 shadow-xs"
                  style={{ backgroundColor: preset.theme.headerBg }}
                  title="Cabecera"
                />
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* SECCIÓN 2: CONTROLES DEL EDITOR Y LIENZO EN VIVO (SPLIT VIEW) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* COLUMNA IZQUIERDA: CONTROLES POR CATEGORÍA (5 COLUMNAS) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Navegación por Pestañas */}
          <div className="flex items-center gap-1 p-1 bg-stone-200/80 dark:bg-stone-800/80 rounded-2xl overflow-x-auto text-xs font-bold">
            <button
              type="button"
              onClick={() => setActiveTab("general")}
              className={`px-3 py-2 rounded-xl transition-all whitespace-nowrap ${
                activeTab === "general"
                  ? "bg-white dark:bg-stone-900 text-stone-900 dark:text-white shadow-xs"
                  : "text-stone-600 dark:text-stone-400 hover:text-stone-900"
              }`}
            >
              Anuncios &amp; Fondo
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("header")}
              className={`px-3 py-2 rounded-xl transition-all whitespace-nowrap ${
                activeTab === "header"
                  ? "bg-white dark:bg-stone-900 text-stone-900 dark:text-white shadow-xs"
                  : "text-stone-600 dark:text-stone-400 hover:text-stone-900"
              }`}
            >
              Cabecera (Header)
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("buttons")}
              className={`px-3 py-2 rounded-xl transition-all whitespace-nowrap ${
                activeTab === "buttons"
                  ? "bg-white dark:bg-stone-900 text-stone-900 dark:text-white shadow-xs"
                  : "text-stone-600 dark:text-stone-400 hover:text-stone-900"
              }`}
            >
              Botones &amp; Acentos
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("typography")}
              className={`px-3 py-2 rounded-xl transition-all whitespace-nowrap ${
                activeTab === "typography"
                  ? "bg-white dark:bg-stone-900 text-stone-900 dark:text-white shadow-xs"
                  : "text-stone-600 dark:text-stone-400 hover:text-stone-900"
              }`}
            >
              Tipografía
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("footer")}
              className={`px-3 py-2 rounded-xl transition-all whitespace-nowrap ${
                activeTab === "footer"
                  ? "bg-white dark:bg-stone-900 text-stone-900 dark:text-white shadow-xs"
                  : "text-stone-600 dark:text-stone-400 hover:text-stone-900"
              }`}
            >
              Pie de Página
            </button>
          </div>

          {/* Formulario de Colores */}
          <div className="bg-white dark:bg-[#12131A] p-6 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-sm space-y-5">
            {/* PESTAÑA: ANUNCIOS & FONDO */}
            {activeTab === "general" && (
              <div className="space-y-4">
                <div className="border-b border-stone-100 dark:border-stone-800 pb-3">
                  <h3 className="text-sm font-black text-stone-900 dark:text-white">
                    Barra de Anuncios Superior (Trust Bar)
                  </h3>
                  <p className="text-[11px] text-stone-500">
                    La franja de arriba con "SAME DAY DELIVERY HOUSTON" y la llamada a la acción telefónica.
                  </p>
                </div>

                <ColorPickerRow
                  label="Color de Fondo de la Barra"
                  help="Color principal de la franja superior"
                  value={theme.announcementBg || "#33cccc"}
                  onChange={(val) => handleColorChange("announcementBg", val)}
                />

                <ColorPickerRow
                  label="Color del Texto de la Barra"
                  help="Texto de envíos y números telefónicos"
                  value={theme.announcementText || "#1c1917"}
                  onChange={(val) => handleColorChange("announcementText", val)}
                />

                <div className="border-t border-stone-100 dark:border-stone-800 pt-3">
                  <h3 className="text-sm font-black text-stone-900 dark:text-white mb-1">
                    Fondo General del Sitio Web
                  </h3>
                  <p className="text-[11px] text-stone-500 mb-3">
                    Color de fondo sutil detrás de los productos y secciones.
                  </p>
                  <ColorPickerRow
                    label="Fondo de Página"
                    help="Ej. #FDFBF7 para blanco crema editorial"
                    value={theme.pageBg || "#FDFBF7"}
                    onChange={(val) => handleColorChange("pageBg", val)}
                  />
                </div>
              </div>
            )}

            {/* PESTAÑA: CABECERA (HEADER) */}
            {activeTab === "header" && (
              <div className="space-y-4">
                <div className="border-b border-stone-100 dark:border-stone-800 pb-3">
                  <h3 className="text-sm font-black text-stone-900 dark:text-white">
                    Barra de Navegación / Header
                  </h3>
                  <p className="text-[11px] text-stone-500">
                    Contenedor del logotipo, menú principal (Catálogo, Rastreo, Nosotros) y botones de carrito.
                  </p>
                </div>

                <ColorPickerRow
                  label="Fondo de la Cabecera"
                  help="Fondo del menú fijo"
                  value={theme.headerBg || "#ffffff"}
                  onChange={(val) => handleColorChange("headerBg", val)}
                />

                <ColorPickerRow
                  label="Color del Texto & Logotipo"
                  help="Texto de los enlaces de navegación"
                  value={theme.headerText || "#163422"}
                  onChange={(val) => handleColorChange("headerText", val)}
                />
              </div>
            )}

            {/* PESTAÑA: BOTONES & ACENTOS */}
            {activeTab === "buttons" && (
              <div className="space-y-4">
                <div className="border-b border-stone-100 dark:border-stone-800 pb-3">
                  <h3 className="text-sm font-black text-stone-900 dark:text-white">
                    Botones de Conversión (Llamada a la Acción)
                  </h3>
                  <p className="text-[11px] text-stone-500">
                    Colores para "Comprar Ahora", "Añadir al Carrito" y botones interactivos.
                  </p>
                </div>

                <ColorPickerRow
                  label="Botón Primario (Fondo)"
                  help="El botón más importante de compra"
                  value={theme.buttonPrimaryBg || "#163422"}
                  onChange={(val) => handleColorChange("buttonPrimaryBg", val)}
                />

                <ColorPickerRow
                  label="Botón Primario (Texto)"
                  help="Texto dentro del botón de compra"
                  value={theme.buttonPrimaryText || "#ffffff"}
                  onChange={(val) => handleColorChange("buttonPrimaryText", val)}
                />

                <ColorPickerRow
                  label="Botón Primario al Pasar el Cursor (Hover)"
                  help="Color cuando el cliente coloca el cursor encima"
                  value={theme.buttonPrimaryHoverBg || "#1F452E"}
                  onChange={(val) => handleColorChange("buttonPrimaryHoverBg", val)}
                />

                <div className="border-t border-stone-100 dark:border-stone-800 pt-3">
                  <h3 className="text-sm font-black text-stone-900 dark:text-white mb-1">
                    Botón Secundario &amp; Acentos
                  </h3>
                  <p className="text-[11px] text-stone-500 mb-3">
                    Insignias, ofertas, cupones y detalles dorados de lujo.
                  </p>

                  <div className="space-y-3">
                    <ColorPickerRow
                      label="Botón Secundario (Fondo Rosa)"
                      help="Utilizado en badges y botones alternativos"
                      value={theme.buttonSecondaryBg || "#FF97A4"}
                      onChange={(val) => handleColorChange("buttonSecondaryBg", val)}
                    />

                    <ColorPickerRow
                      label="Botón Secundario (Texto)"
                      help="Texto sobre el botón rosa"
                      value={theme.buttonSecondaryText || "#ffffff"}
                      onChange={(val) => handleColorChange("buttonSecondaryText", val)}
                    />

                    <ColorPickerRow
                      label="Color de Acento Dorado / Oro"
                      help="Bordes, estrellas, insignias de prestigio"
                      value={theme.accentColor || "#C5A059"}
                      onChange={(val) => handleColorChange("accentColor", val)}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* PESTAÑA: TIPOGRAFÍA */}
            {activeTab === "typography" && (
              <div className="space-y-4">
                <div className="border-b border-stone-100 dark:border-stone-800 pb-3">
                  <h3 className="text-sm font-black text-stone-900 dark:text-white">
                    Colores de Tipografía &amp; Textos
                  </h3>
                  <p className="text-[11px] text-stone-500">
                    Personaliza los títulos editoriales, textos de párrafo y la frase en letra cursiva.
                  </p>
                </div>

                <ColorPickerRow
                  label="Títulos Principales (Headings)"
                  help="Tipografía Playfair Display de títulos grandes"
                  value={theme.headingColor || "#163422"}
                  onChange={(val) => handleColorChange("headingColor", val)}
                />

                <ColorPickerRow
                  label="Texto General de Lectura (Cuerpo)"
                  help="Descripciones de flores, párrafos y notas"
                  value={theme.bodyTextColor || "#4A5568"}
                  onChange={(val) => handleColorChange("bodyTextColor", val)}
                />

                <ColorPickerRow
                  label="Texto Cursivo Especial ('feel loved ♡')"
                  help="Tipografía Great Vibes en banners y hero"
                  value={theme.scriptTextColor || "#163422"}
                  onChange={(val) => handleColorChange("scriptTextColor", val)}
                />
              </div>
            )}

            {/* PESTAÑA: PIE DE PÁGINA */}
            {activeTab === "footer" && (
              <div className="space-y-4">
                <div className="border-b border-stone-100 dark:border-stone-800 pb-3">
                  <h3 className="text-sm font-black text-stone-900 dark:text-white">
                    Pie de Página (Footer)
                  </h3>
                  <p className="text-[11px] text-stone-500">
                    Área inferior con los horarios de entrega, enlaces legales y redes sociales.
                  </p>
                </div>

                <ColorPickerRow
                  label="Fondo del Footer"
                  help="Color de fondo de toda la sección inferior"
                  value={theme.footerBg || "#ffffff"}
                  onChange={(val) => handleColorChange("footerBg", val)}
                />

                <ColorPickerRow
                  label="Color del Texto del Footer"
                  help="Horarios de atención y enlaces"
                  value={theme.footerText || "#1c1917"}
                  onChange={(val) => handleColorChange("footerText", val)}
                />

                <ColorPickerRow
                  label="Color de Acentos del Footer"
                  help="Títulos de sección y detalles destacados"
                  value={theme.footerAccent || "#163422"}
                  onChange={(val) => handleColorChange("footerAccent", val)}
                />
              </div>
            )}
          </div>
        </div>

        {/* COLUMNA DERECHA: LIENZO DE PREVISUALIZACIÓN EN VIVO (7 COLUMNAS) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between bg-white dark:bg-[#12131A] px-5 py-3 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-sm">
            <div className="flex items-center gap-2">
              <Eye size={16} className="text-pink-600" />
              <span className="text-xs font-black uppercase tracking-wider text-stone-900 dark:text-white">
                Lienzo de Previsualización en Vivo
              </span>
            </div>

            {/* Alternador Desktop / Mobile */}
            <div className="flex items-center gap-1 bg-stone-100 dark:bg-stone-900 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setPreviewDevice("desktop")}
                className={`p-1.5 rounded-lg text-xs flex items-center gap-1 transition-all ${
                  previewDevice === "desktop"
                    ? "bg-white dark:bg-stone-800 text-stone-900 dark:text-white shadow-xs font-bold"
                    : "text-stone-500 hover:text-stone-800"
                }`}
                title="Vista Escritorio"
              >
                <Monitor size={14} />
                <span className="hidden sm:inline">Desktop</span>
              </button>
              <button
                type="button"
                onClick={() => setPreviewDevice("mobile")}
                className={`p-1.5 rounded-lg text-xs flex items-center gap-1 transition-all ${
                  previewDevice === "mobile"
                    ? "bg-white dark:bg-stone-800 text-stone-900 dark:text-white shadow-xs font-bold"
                    : "text-stone-500 hover:text-stone-800"
                }`}
                title="Vista Móvil"
              >
                <Smartphone size={14} />
                <span className="hidden sm:inline">Móvil</span>
              </button>
            </div>
          </div>

          {/* Lienzo del Mockup */}
          <div
            className={`mx-auto transition-all duration-300 rounded-3xl overflow-hidden border-2 border-stone-300 dark:border-stone-800 shadow-2xl ${
              previewDevice === "mobile" ? "max-w-sm" : "w-full"
            }`}
            style={{ backgroundColor: theme.pageBg || "#FDFBF7" }}
          >
            {/* 1. MOCKUP BARRA DE ANUNCIOS */}
            <div
              className="py-1.5 px-3 text-[11px] font-bold tracking-wider uppercase text-center flex items-center justify-center gap-2 border-b border-black/10"
              style={{
                backgroundColor: theme.announcementBg || "#33cccc",
                color: theme.announcementText || "#1c1917",
              }}
            >
              <Truck size={12} />
              <span>SAME DAY DELIVERY HOUSTON • (346) 739-2730</span>
            </div>

            {/* Trust bar complementaria */}
            <div
              className="py-1.5 px-3 text-[10px] font-serif font-bold text-center flex justify-around items-center opacity-90 border-b border-black/10"
              style={{
                backgroundColor: theme.announcementBg || "#33cccc",
                color: theme.announcementText || "#1c1917",
              }}
            >
              <span className="flex items-center gap-1">
                <Clock size={11} />
                <span className="font-script-custom text-xs italic tracking-normal font-normal">
                  Order before 1 PM for same-day delivery
                </span>
              </span>
              <span className="hidden sm:inline">•</span>
              <span className="hidden sm:flex items-center gap-1">
                <MapPin size={11} />
                <span>HOUSTON METROPLEX</span>
              </span>
            </div>

            {/* 2. MOCKUP CABECERA (HEADER) */}
            <div
              className="px-4 py-3 flex items-center justify-between border-b border-black/10 transition-colors shadow-xs"
              style={{
                backgroundColor: theme.headerBg || "#ffffff",
                color: theme.headerText || "#163422",
              }}
            >
              <div className="flex items-center gap-2">
                <div
                  className="w-8 h-8 rounded-full border flex items-center justify-center font-serif font-bold text-xs shadow-xs"
                  style={{ borderColor: theme.accentColor || "#C5A059" }}
                >
                  🌸
                </div>
                <div>
                  <span
                    className="font-serif font-black text-sm block tracking-tight leading-none"
                    style={{ color: theme.headingColor || "#163422" }}
                  >
                    Bonbon Flowers
                  </span>
                  <span className="text-[8px] uppercase tracking-widest text-stone-500 block">
                    Houston, TX
                  </span>
                </div>
              </div>

              {/* Enlaces de Menú */}
              <div className="hidden sm:flex items-center gap-3 text-[11px] font-bold uppercase tracking-wider">
                <span className="hover:opacity-80 cursor-pointer">Catálogo</span>
                <span className="hover:opacity-80 cursor-pointer">Rastreo</span>
                <span className="hover:opacity-80 cursor-pointer">Nosotros</span>
              </div>

              {/* Botón de Carrito del Header */}
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs shadow-sm cursor-pointer"
                style={{ backgroundColor: theme.buttonPrimaryBg || "#163422" }}
              >
                <ShoppingBag size={14} />
              </div>
            </div>

            {/* 3. MOCKUP HERO & PRODUCTO EN VIVO */}
            <div className="p-5 sm:p-7 space-y-6">
              {/* Título Hero de Muestra */}
              <div className="text-center space-y-2">
                <span
                  className="font-script-custom text-3xl sm:text-4xl italic block"
                  style={{ color: theme.scriptTextColor || "#163422" }}
                >
                  feel loved ♡
                </span>
                <h2
                  className="text-xl sm:text-2xl font-serif font-black tracking-tight"
                  style={{ color: theme.headingColor || "#163422" }}
                >
                  Diseños Florales Exclusivos de Lujo
                </h2>
                <p
                  className="text-xs sm:text-sm max-w-md mx-auto"
                  style={{ color: theme.bodyTextColor || "#4A5568" }}
                >
                  Elaborados artesanalmente en Houston con flores frescas importadas.
                </p>
              </div>

              {/* Tarjeta de Producto de Muestra */}
              <div className="max-w-sm mx-auto bg-white dark:bg-stone-900 rounded-2xl overflow-hidden border border-stone-200 dark:border-stone-800 shadow-md">
                <div className="relative aspect-[4/3] bg-stone-100">
                  <img
                    src="https://images.unsplash.com/photo-1582794543139-8ac9cb0f7b11?w=800&auto=format&fit=crop&q=80"
                    alt="Ramo Buchón 100 Rosas"
                    className="w-full h-full object-cover"
                  />
                  {/* Badge Secundario Rosa */}
                  <span
                    className="absolute top-2.5 left-2.5 text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full shadow-sm"
                    style={{
                      backgroundColor: theme.buttonSecondaryBg || "#FF97A4",
                      color: theme.buttonSecondaryText || "#ffffff",
                    }}
                  >
                    Bestseller Houston
                  </span>
                  {/* Badge de Acento Dorado */}
                  <span
                    className="absolute top-2.5 right-2.5 text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/95 text-stone-900 shadow-xs border"
                    style={{ borderColor: theme.accentColor || "#C5A059" }}
                  >
                    ★ 5.0
                  </span>
                </div>

                <div className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4
                        className="text-sm font-black font-serif"
                        style={{ color: theme.headingColor || "#163422" }}
                      >
                        Ramo Buchón 100 Rosas Rojas
                      </h4>
                      <p
                        className="text-[11px]"
                        style={{ color: theme.bodyTextColor || "#4A5568" }}
                      >
                        Corona imperial y mariposas doradas 3D
                      </p>
                    </div>
                    <span
                      className="text-sm font-black font-serif"
                      style={{ color: theme.headingColor || "#163422" }}
                    >
                      $290.00
                    </span>
                  </div>

                  {/* Botones de Muestra */}
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <button
                      type="button"
                      className="w-full py-2 px-3 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5"
                      style={{
                        backgroundColor: theme.buttonSecondaryBg || "#FF97A4",
                        color: theme.buttonSecondaryText || "#ffffff",
                      }}
                    >
                      <Heart size={13} />
                      <span>Favorito</span>
                    </button>
                    <button
                      type="button"
                      className="w-full py-2 px-3 rounded-xl text-xs font-black transition-all shadow-md flex items-center justify-center gap-1.5"
                      style={{
                        backgroundColor: theme.buttonPrimaryBg || "#163422",
                        color: theme.buttonPrimaryText || "#ffffff",
                      }}
                    >
                      <ShoppingBag size={13} />
                      <span>Ordenar</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* 4. MOCKUP FOOTER */}
            <div
              className="p-5 border-t border-black/10 space-y-3 text-[11px]"
              style={{
                backgroundColor: theme.footerBg || "#ffffff",
                color: theme.footerText || "#1c1917",
              }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h5
                    className="font-serif font-black uppercase tracking-wider text-xs"
                    style={{ color: theme.footerAccent || "#163422" }}
                  >
                    Bonbon Flowers Houston
                  </h5>
                  <p className="opacity-80 text-[10px]">Lunes a Sábado • Entrega el mismo día</p>
                </div>
                <span
                  className="font-script-custom text-lg italic"
                  style={{ color: theme.footerAccent || "#163422" }}
                >
                  thank you ♡
                </span>
              </div>
              <p className="text-[9px] opacity-60 text-center pt-2 border-t border-black/5">
                © {new Date().getFullYear()} Bonbon Flowers Houston. Todos los derechos reservados.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Subcomponente de fila de selección de color
function ColorPickerRow({
  label,
  help,
  value,
  onChange,
}: {
  label: string;
  help: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3 p-3 rounded-2xl bg-stone-50 dark:bg-stone-900/60 border border-stone-200/80 dark:border-stone-800">
      <div className="min-w-0 flex-1">
        <label className="text-xs font-black text-stone-900 dark:text-white block truncate">
          {label}
        </label>
        <span className="text-[11px] text-stone-500 dark:text-stone-400 block truncate">
          {help}
        </span>
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        <span className="text-[11px] font-mono font-bold text-stone-600 dark:text-stone-300 uppercase px-2 py-1 rounded-lg bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700">
          {value}
        </span>
        <div className="relative w-8 h-8 rounded-xl overflow-hidden border border-stone-300 dark:border-stone-700 shadow-xs cursor-pointer">
          <input
            type="color"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            title={`Elegir ${label}`}
          />
          <div
            className="w-full h-full pointer-events-none"
            style={{ backgroundColor: value }}
          />
        </div>
      </div>
    </div>
  );
}

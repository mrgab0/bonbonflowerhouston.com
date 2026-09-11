"use client";

import { useEffect, useState } from "react";
import { getSiteConfig, updateSeoConfig } from "@/lib/actions/siteConfig";
import { Search, Globe, Share2, MapPin, CheckCircle2, ArrowLeft, Save, Sparkles, ExternalLink, ShieldCheck, Eye } from "lucide-react";
import Link from "next/link";

export default function AdminSeoPage() {
  const [config, setConfig] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Estados locales para la previsualización en tiempo real
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [keywords, setKeywords] = useState("");
  const [ogImage, setOgImage] = useState("");
  const [googleVerification, setGoogleVerification] = useState("");
  const [bingVerification, setBingVerification] = useState("");
  const [analyticsId, setAnalyticsId] = useState("");

  const [businessName, setBusinessName] = useState("");
  const [businessPhone, setBusinessPhone] = useState("");
  const [businessAddress, setBusinessAddress] = useState("");
  const [businessCity, setBusinessCity] = useState("");

  useEffect(() => {
    loadConfig();
  }, []);

  async function loadConfig() {
    setLoading(true);
    const { data } = await getSiteConfig();
    if (data) {
      setConfig(data);
      setTitle(data.seoTitle || "Gabriela's Flowers LLC | Boutique Digital de Alta Floristería");
      setDescription(data.seoDescription || "Floristería exclusiva con arreglos florales de lujo, rosas y detalles personalizados a domicilio con entrega express.");
      setKeywords(data.seoKeywords || "floristeria, flores a domicilio, arreglos florales, rosas, ramos de flores, regalos");
      setOgImage(data.ogImage || "https://images.unsplash.com/photo-1563241527-3004b7be0ffd?w=1200");
      setGoogleVerification(data.googleSiteVerification || "");
      setBingVerification(data.bingSiteVerification || "");
      setAnalyticsId(data.googleAnalyticsId || "");
      setBusinessName(data.businessName || "Gabriela's Flowers LLC");
      setBusinessPhone(data.businessPhone || "+1 (800) 555-3569");
      setBusinessAddress(data.businessAddress || "Av. Principal Floristería #123");
      setBusinessCity(data.businessCity || "Ciudad de México");
    }
    setLoading(false);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    const formData = new FormData(e.currentTarget);
    const result = await updateSeoConfig(formData);
    setSaving(false);

    if (result.success) {
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3500);
      loadConfig();
    } else {
      alert("Error al actualizar la configuración de SEO.");
    }
  }

  if (loading) {
    return (
      <div className="p-12 text-center text-gray-500 font-bold animate-pulse">
        Cargando Panel de Optimización SEO...
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-16">
      {/* Encabezado Principal */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-[#12131A] p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm">
        <div className="flex items-center gap-3.5">
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 rounded-2xl border border-emerald-100 dark:border-emerald-900/50">
            <Search size={26} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#1A1C1C] dark:text-white flex items-center gap-2">
              Optimización SEO & Buscadores
              <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                CMS Activo
              </span>
            </h1>
            <p className="text-xs text-gray-400">Gestiona etiquetas Meta, Google Maps, Schema.org, Sitemap y previsualización social</p>
          </div>
        </div>

        <Link
          href="/admin"
          className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 px-5 py-2.5 rounded-full font-bold text-xs hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors flex items-center gap-2"
        >
          <ArrowLeft size={14} /> Volver al Panel
        </Link>
      </div>

      {/* Tarjeta de Estado de Archivos SEO Autogenerados */}
      <div className="bg-gradient-to-r from-emerald-900/90 to-teal-900/90 text-white p-6 rounded-3xl shadow-md border border-emerald-800/50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Sparkles className="text-emerald-300" size={18} />
            <h3 className="font-bold text-base">Archivos SEO Automatizados en Tiempo Real</h3>
          </div>
          <p className="text-xs text-emerald-200">
            Tu sitio actualiza automáticamente la estructura de rutas para Google cada vez que agregas un nuevo producto.
          </p>
        </div>

        <div className="flex flex-wrap gap-2.5">
          <a
            href="/sitemap.xml"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border border-white/20"
          >
            <Globe size={14} /> Ver Sitemap.xml <ExternalLink size={12} />
          </a>
          <a
            href="/robots.txt"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border border-white/20"
          >
            <ShieldCheck size={14} /> Ver Robots.txt <ExternalLink size={12} />
          </a>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Columna Izquierda: Formularios de Edición */}
          <div className="lg:col-span-7 space-y-6">
            {/* Sección 1: Metadatos Globales */}
            <div className="bg-white dark:bg-[#12131A] p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm space-y-4">
              <div className="flex items-center gap-2 border-b pb-3 border-gray-100 dark:border-gray-800">
                <Globe size={18} className="text-emerald-600 dark:text-emerald-400" />
                <h2 className="font-bold text-sm text-[#1A1C1C] dark:text-white">1. Etiquetas Meta Globales (SEO Principal)</h2>
              </div>

              <div className="space-y-3.5">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                    Meta Título Global (Title Tag)
                  </label>
                  <input
                    name="seoTitle"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Ej: Gabriela's Flowers LLC | Boutique Digital de Alta Floristería"
                    className="p-3 border rounded-2xl text-xs font-bold text-[#1A1C1C] dark:text-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                  <span className="text-[10px] text-gray-400 text-right">{title.length} / 60 caracteres (Recomendado)</span>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                    Meta Descripción Global (Description Tag)
                  </label>
                  <textarea
                    name="seoDescription"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Resumen atractivo que aparecerá en los resultados de Google..."
                    className="p-3 border rounded-2xl text-xs h-20 font-medium text-gray-800 dark:text-gray-200 dark:bg-gray-900 border-gray-200 dark:border-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                  <span className="text-[10px] text-gray-400 text-right">{description.length} / 160 caracteres (Recomendado)</span>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                    Palabras Clave (Keywords separadas por coma)
                  </label>
                  <input
                    name="seoKeywords"
                    value={keywords}
                    onChange={(e) => setKeywords(e.target.value)}
                    placeholder="Ej: floristeria, flores a domicilio, arreglos florales, rosas"
                    className="p-3 border rounded-2xl text-xs font-medium text-gray-800 dark:text-gray-200 dark:bg-gray-900 border-gray-200 dark:border-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                    URL Imagen de Portada Social (OpenGraph Image)
                  </label>
                  <input
                    name="ogImage"
                    value={ogImage}
                    onChange={(e) => setOgImage(e.target.value)}
                    placeholder="https://..."
                    className="p-3 border rounded-2xl text-xs font-mono text-gray-800 dark:text-gray-200 dark:bg-gray-900 border-gray-200 dark:border-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>
            </div>

            {/* Sección 2: Datos de Negocio Local (Google Maps & Schema) */}
            <div className="bg-white dark:bg-[#12131A] p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm space-y-4">
              <div className="flex items-center gap-2 border-b pb-3 border-gray-100 dark:border-gray-800">
                <MapPin size={18} className="text-emerald-600 dark:text-emerald-400" />
                <h2 className="font-bold text-sm text-[#1A1C1C] dark:text-white">2. Datos de Negocio Local (Google Maps & Schema.org)</h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-gray-700 dark:text-gray-300">Nombre de la Floristería</label>
                  <input
                    name="businessName"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    className="p-3 border rounded-2xl text-xs font-bold dark:bg-gray-900 border-gray-200 dark:border-gray-800"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-gray-700 dark:text-gray-300">Teléfono Móvil / WhatsApp</label>
                  <input
                    name="businessPhone"
                    value={businessPhone}
                    onChange={(e) => setBusinessPhone(e.target.value)}
                    className="p-3 border rounded-2xl text-xs font-bold dark:bg-gray-900 border-gray-200 dark:border-gray-800"
                  />
                </div>

                <div className="flex flex-col gap-1 sm:col-span-2">
                  <label className="text-xs font-bold text-gray-700 dark:text-gray-300">Dirección Física</label>
                  <input
                    name="businessAddress"
                    value={businessAddress}
                    onChange={(e) => setBusinessAddress(e.target.value)}
                    className="p-3 border rounded-2xl text-xs font-medium dark:bg-gray-900 border-gray-200 dark:border-gray-800"
                  />
                </div>
              </div>
            </div>

            {/* Sección 3: Códigos de Verificación */}
            <div className="bg-white dark:bg-[#12131A] p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm space-y-4">
              <div className="flex items-center gap-2 border-b pb-3 border-gray-100 dark:border-gray-800">
                <ShieldCheck size={18} className="text-emerald-600 dark:text-emerald-400" />
                <h2 className="font-bold text-sm text-[#1A1C1C] dark:text-white">3. Códigos de Verificación de Motores de Búsqueda</h2>
              </div>

              <div className="space-y-3">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-gray-700 dark:text-gray-300">Google Search Console Verification Tag</label>
                  <input
                    name="googleSiteVerification"
                    value={googleVerification}
                    onChange={(e) => setGoogleVerification(e.target.value)}
                    placeholder="Ej: google-site-verification=..."
                    className="p-3 border rounded-2xl text-xs font-mono dark:bg-gray-900 border-gray-200 dark:border-gray-800"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-gray-700 dark:text-gray-300">Google Analytics (Measurement ID)</label>
                  <input
                    name="googleAnalyticsId"
                    value={analyticsId}
                    onChange={(e) => setAnalyticsId(e.target.value)}
                    placeholder="Ej: G-XXXXXXXXXX"
                    className="p-3 border rounded-2xl text-xs font-mono dark:bg-gray-900 border-gray-200 dark:border-gray-800"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Columna Derecha: Tarjetas de Previsualización en Tiempo Real */}
          <div className="lg:col-span-5 space-y-6">
            <div className="sticky top-20 space-y-6">
              {/* Tarjeta 1: Simulación Google Search */}
              <div className="bg-white dark:bg-[#12131A] p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  <Eye size={14} className="text-emerald-600" /> Previsualización en Google (SERP)
                </div>

                <div className="p-4 bg-gray-50 dark:bg-gray-900/80 rounded-2xl border border-gray-200 dark:border-gray-800 space-y-1">
                  <div className="flex items-center gap-2 text-[11px] text-gray-600 dark:text-gray-400">
                    <span className="w-4 h-4 rounded-full bg-pink-100 text-[#FF97A4] flex items-center justify-center font-bold text-[9px]">F</span>
                    <span>https://flowersforyou.com</span>
                  </div>
                  <h3 className="text-sm font-bold text-blue-700 dark:text-blue-400 hover:underline cursor-pointer leading-snug">
                    {title || "Gabriela's Flowers LLC | Boutique Digital de Alta Floristería"}
                  </h3>
                  <p className="text-xs text-gray-600 dark:text-gray-300 line-clamp-2 leading-relaxed">
                    {description || "Floristería exclusiva con arreglos florales de lujo, rosas y detalles personalizados a domicilio con entrega express."}
                  </p>
                </div>
              </div>

              {/* Tarjeta 2: Simulación WhatsApp / Redes Sociales */}
              <div className="bg-white dark:bg-[#12131A] p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  <Share2 size={14} className="text-emerald-600" /> Previsualización al compartir en WhatsApp
                </div>

                <div className="p-3 bg-emerald-950/90 text-white rounded-2xl border border-emerald-800 max-w-sm space-y-2">
                  {ogImage && (
                    <div className="w-full h-36 rounded-xl overflow-hidden bg-gray-800">
                      <img src={ogImage} alt="OpenGraph Preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div className="px-1 space-y-0.5">
                    <span className="text-[10px] text-emerald-400 font-bold uppercase block">FLOWERSFORYOU.COM</span>
                    <h4 className="text-xs font-bold text-white leading-snug line-clamp-1">{title}</h4>
                    <p className="text-[11px] text-emerald-200/80 line-clamp-2 leading-tight">{description}</p>
                  </div>
                </div>
              </div>

              {/* Botón Flotante de Guardar */}
              <div className="bg-white dark:bg-[#12131A] p-4 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm flex items-center justify-between">
                {savedSuccess ? (
                  <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                    <CheckCircle2 size={16} /> ¡Configuración SEO guardada!
                  </span>
                ) : (
                  <span className="text-xs text-gray-400">Actualiza las Meta Tags en vivo</span>
                )}

                <button
                  type="submit"
                  disabled={saving}
                  className="bg-emerald-600 text-white px-7 py-3 rounded-full text-xs font-bold hover:bg-emerald-700 transition-colors shadow-md disabled:bg-gray-400 flex items-center gap-2"
                >
                  <Save size={16} />
                  {saving ? "Guardando..." : "Guardar SEO"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Link2,
  Plus,
  Search,
  Sparkles,
  ExternalLink,
  Copy,
  Check,
  Edit2,
  Trash2,
  BarChart2,
  CheckCircle2,
  RefreshCw,
  Image as ImageIcon,
  Palette,
  Upload,
  Calendar,
  Eye,
  AlertCircle,
} from "lucide-react";
import {
  DynamicQRItem,
  getDynamicQrsAction,
  createDynamicQrAction,
  updateDynamicQrAction,
  deleteDynamicQrAction,
} from "@/lib/actions/qrActions";
import {
  QrCanvasPreview,
  QrDesignConfig,
  QrStylePreset,
} from "./QrCanvasPreview";

export function DynamicQrEditor() {
  const [items, setItems] = useState<DynamicQRItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Form mode: "create" or "edit"
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form inputs
  const [title, setTitle] = useState("");
  const [customCode, setCustomCode] = useState("");
  const [destinationUrl, setDestinationUrl] = useState("https://bonbonflowerhouston.com/productos");
  const [description, setDescription] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Selected item for previewing in canvas
  const [selectedForPreview, setSelectedForPreview] = useState<DynamicQRItem | null>(null);

  // Design config
  const [designConfig, setDesignConfig] = useState<QrDesignConfig>({
    stylePreset: "luxury", // Luxury as default for dynamic
    fgColor: "#163422",
    bgColor: "#FFFFFF",
    eyeColor: "#D4AF37",
    includeLogo: true, // PALOMITA ACTIVADA POR DEFECTO
    logoUrl: "/logo.png",
    logoSize: 22,
    margin: 3,
  });

  const [customLogoFile, setCustomLogoFile] = useState<string | null>(null);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const data = await getDynamicQrsAction();
      setItems(data);
      if (data.length > 0 && !selectedForPreview) {
        setSelectedForPreview(data[0]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  // Compute live redirect URL for the QR currently being created/previewed
  const currentDomain = typeof window !== "undefined" ? window.location.origin : "https://bonbonflowerhouston.com";
  
  const livePreviewUrl = useMemo(() => {
    if (selectedForPreview) {
      return `${currentDomain}/q/${selectedForPreview.code}`;
    }
    const code = customCode.trim().toLowerCase() || "ejemplo";
    return `${currentDomain}/q/${code}`;
  }, [selectedForPreview, customCode, currentDomain]);

  const handleCreateOrUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsSaving(true);

    try {
      if (isEditing && editingId) {
        const res = await updateDynamicQrAction(editingId, {
          title,
          destinationUrl,
          description,
          designConfig,
        });
        if (!res.success) {
          setErrorMsg(res.error || "Error al actualizar.");
        } else {
          setIsEditing(false);
          setEditingId(null);
          resetForm();
          await fetchItems();
        }
      } else {
        const res = await createDynamicQrAction({
          title,
          code: customCode,
          destinationUrl,
          description,
          designConfig,
        });
        if (!res.success) {
          setErrorMsg(res.error || "Error al crear QR dinámico.");
        } else {
          resetForm();
          await fetchItems();
          if (res.qr) {
            setSelectedForPreview(res.qr);
          }
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Error inesperado");
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditItem = (item: DynamicQRItem) => {
    setIsEditing(true);
    setEditingId(item.id);
    setTitle(item.title);
    setCustomCode(item.code);
    setDestinationUrl(item.destinationUrl);
    setDescription(item.description || "");
    if (item.designConfig) {
      setDesignConfig((prev) => ({
        ...prev,
        ...item.designConfig,
        stylePreset: (item.designConfig?.stylePreset as QrStylePreset) || prev.stylePreset,
      }));
    }
    setSelectedForPreview(item);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDeleteItem = async (id: string) => {
    if (!confirm("¿Seguro que deseas eliminar este código QR dinámico? Dejará de funcionar de inmediato.")) return;
    await deleteDynamicQrAction(id);
    if (selectedForPreview?.id === id) {
      setSelectedForPreview(null);
    }
    await fetchItems();
  };

  const handleToggleStatus = async (item: DynamicQRItem) => {
    await updateDynamicQrAction(item.id, { isActive: !item.isActive });
    await fetchItems();
  };

  const handleCopyLink = (code: string, id: string) => {
    const link = `${currentDomain}/q/${code}`;
    navigator.clipboard.writeText(link);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const resetForm = () => {
    setTitle("");
    setCustomCode("");
    setDestinationUrl("https://bonbonflowerhouston.com/productos");
    setDescription("");
    setIsEditing(false);
    setEditingId(null);
    setErrorMsg(null);
  };

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

  const filteredItems = items.filter(
    (item) =>
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.code.toLowerCase().includes(search.toLowerCase()) ||
      item.destinationUrl.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-10">
      {/* Upper Grid: Creator Form & Live Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Form: Create / Edit Dynamic QR */}
        <div className="lg:col-span-7">
          <form
            onSubmit={handleCreateOrUpdate}
            className="bg-white dark:bg-[#16181F] p-6 rounded-2xl shadow-sm border border-gray-200/80 dark:border-gray-800 space-y-6"
          >
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-4">
              <div>
                <h3 className="font-bold text-lg text-gray-900 dark:text-gray-100 flex items-center gap-2">
                  <Link2 className="w-5 h-5 text-[#B0004A]" />
                  {isEditing ? "Editar QR Dinámico" : "Crear Nuevo QR Dinámico"}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  El destino puede cambiarse en cualquier momento sin reimprimir el código.
                </p>
              </div>

              {isEditing && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-3 py-1.5 text-xs text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 rounded-lg transition-all"
                >
                  Cancelar Edición
                </button>
              )}
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Title & Custom Code */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Nombre descriptivo: *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ej: Tarjeta Ramo Rosas San Valentín"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF97A4]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Código o Slug personalizado:
                </label>
                <div className="flex items-center">
                  <span className="px-3 py-2.5 bg-gray-100 dark:bg-gray-800 text-gray-500 text-xs rounded-l-xl border border-r-0 border-gray-200 dark:border-gray-700">
                    /q/
                  </span>
                  <input
                    type="text"
                    disabled={isEditing}
                    value={customCode}
                    onChange={(e) => setCustomCode(e.target.value)}
                    placeholder="rosas-madres (o vacío para autogenerar)"
                    className="w-full px-3 py-2.5 rounded-r-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF97A4] disabled:opacity-50"
                  />
                </div>
              </div>
            </div>

            {/* Destination URL */}
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                Enlace de Destino (Editable en el futuro): *
              </label>
              <input
                type="text"
                required
                value={destinationUrl}
                onChange={(e) => setDestinationUrl(e.target.value)}
                placeholder="https://bonbonflowerhouston.com/productos/ramo-rosas"
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF97A4]"
              />
              <p className="text-[11px] text-gray-400 mt-1">
                Puedes apuntar a tu tienda, un video de agradecimiento, encuesta o WhatsApp.
              </p>
            </div>

            {/* Style Presets */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#B0004A] dark:text-pink-400 mb-2 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> Modelo Visual del Código:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {[
                  { id: "luxury" as QrStylePreset, name: "Boutique Esmeralda", desc: "Luxury" },
                  { id: "floral" as QrStylePreset, name: "Romántico Floral", desc: "Dots & Rosas" },
                  { id: "modern" as QrStylePreset, name: "Minimalista Squircle", desc: "Moderno" },
                  { id: "classic" as QrStylePreset, name: "Clásico Imprenta", desc: "Alta Precisión" },
                ].map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => applyPreset(preset.id)}
                    className={`p-2.5 rounded-xl border-2 text-left transition-all ${
                      designConfig.stylePreset === preset.id
                        ? "border-[#B0004A] bg-pink-50/50 dark:bg-pink-950/20"
                        : "border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/40"
                    }`}
                  >
                    <div className="text-xs font-bold text-gray-900 dark:text-gray-100">
                      {preset.name}
                    </div>
                    <div className="text-[10px] text-gray-500">{preset.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Logo Options - Default checked checkbox */}
            <div className="p-3.5 rounded-xl bg-pink-50/60 dark:bg-pink-950/20 border border-pink-200/80 dark:border-pink-900/40 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="includeLogoDyn"
                  checked={designConfig.includeLogo}
                  onChange={(e) =>
                    setDesignConfig((prev) => ({
                      ...prev,
                      includeLogo: e.target.checked,
                    }))
                  }
                  className="w-5 h-5 rounded text-[#B0004A] focus:ring-[#FF97A4] border-gray-300 cursor-pointer accent-[#B0004A]"
                />
                <label htmlFor="includeLogoDyn" className="cursor-pointer select-none">
                  <span className="font-bold text-xs sm:text-sm text-gray-900 dark:text-gray-100 block">
                    Incluir Logo Oficial de Bonbon Flowers
                  </span>
                  <span className="text-[11px] text-gray-500 dark:text-gray-400">
                    Añade el logo corporativo centrado y protegido.
                  </span>
                </label>
              </div>

              <div className="w-9 h-9 rounded-full border border-pink-200 dark:border-pink-900/60 overflow-hidden bg-white p-0.5 shadow-sm flex items-center justify-center">
                <img
                  src={designConfig.logoUrl || "/logo.png"}
                  alt="Logo"
                  className="w-full h-full object-contain rounded-full"
                />
              </div>
            </div>

            {/* Submit button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSaving}
                className="w-full py-3 px-6 bg-[#B0004A] hover:bg-[#8F003C] text-white font-bold rounded-xl text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
              >
                {isSaving ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" /> Guardando...
                  </>
                ) : isEditing ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" /> Guardar Cambios del QR
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" /> Crear Código QR Dinámico
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Right Preview */}
        <div className="lg:col-span-5 sticky top-6">
          <div className="bg-white dark:bg-[#16181F] p-6 rounded-2xl shadow-sm border border-gray-200/80 dark:border-gray-800">
            <div className="text-center mb-4">
              <h3 className="font-bold text-gray-900 dark:text-gray-100 text-base">
                {selectedForPreview ? selectedForPreview.title : "Vista Previa Dinámica"}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 font-mono">
                {livePreviewUrl}
              </p>
            </div>

            <QrCanvasPreview
              value={livePreviewUrl}
              config={designConfig}
              title={selectedForPreview ? selectedForPreview.title : "bonbon-qr-dinamico"}
              onConfigChange={(newCfg) => setDesignConfig((prev) => ({ ...prev, ...newCfg }))}
            />

            <div className="mt-5 p-3 rounded-xl bg-pink-50/40 dark:bg-pink-950/20 border border-pink-100 dark:border-pink-900/30 text-[11px] text-gray-600 dark:text-gray-300 text-center">
              ✨ <strong>QR Rastreado:</strong> Cada escaneo suma en las estadísticas y te permite cambiar a dónde viaja el cliente en cualquier momento.
            </div>
          </div>
        </div>
      </div>

      {/* Lower Section: Dynamic QRs Management Table */}
      <div className="bg-white dark:bg-[#16181F] rounded-2xl shadow-sm border border-gray-200/80 dark:border-gray-800 overflow-hidden">
        <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h3 className="font-bold text-lg text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <BarChart2 className="w-5 h-5 text-[#B0004A]" />
              Códigos Dinámicos Registrados ({items.length})
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Gestiona los enlaces de redirección y consulta cuántas veces han sido escaneados.
            </p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nombre o enlace..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-[#FF97A4]"
            />
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center text-gray-400 text-xs flex items-center justify-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin text-[#B0004A]" /> Cargando QRs dinámicos...
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="p-12 text-center text-gray-400 text-sm">
            {items.length === 0
              ? "Aún no has creado ningún QR dinámico. Usa el formulario de arriba para generar el primero."
              : "No se encontraron códigos con ese criterio de búsqueda."}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 font-semibold uppercase text-[10px] tracking-wider">
                  <th className="py-3 px-4">Nombre & Código</th>
                  <th className="py-3 px-4">Destino Actual</th>
                  <th className="py-3 px-4 text-center">Escaneos</th>
                  <th className="py-3 px-4 text-center">Estado</th>
                  <th className="py-3 px-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {filteredItems.map((item) => {
                  const shortUrl = `${currentDomain}/q/${item.code}`;
                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-gray-50/70 dark:hover:bg-gray-800/30 transition-colors"
                    >
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-gray-900 dark:text-gray-100 text-sm">
                          {item.title}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="font-mono text-[11px] text-[#B0004A] bg-pink-50 dark:bg-pink-950/40 px-2 py-0.5 rounded font-semibold">
                            /q/{item.code}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCopyLink(item.code, item.id)}
                            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-0.5"
                            title="Copiar URL corta"
                          >
                            {copiedId === item.id ? (
                              <Check className="w-3.5 h-3.5 text-emerald-500" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 max-w-xs truncate">
                        <a
                          href={item.destinationUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 truncate"
                        >
                          <span className="truncate">{item.destinationUrl}</span>
                          <ExternalLink className="w-3 h-3 flex-shrink-0" />
                        </a>
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300">
                          {item.scanCount} scans
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(item)}
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase transition-all ${
                            item.isActive
                              ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                              : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                          }`}
                        >
                          {item.isActive ? "Activo" : "Pausado"}
                        </button>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedForPreview(item);
                              if (item.designConfig) {
                                setDesignConfig((prev) => ({
                                  ...prev,
                                  ...item.designConfig,
                                  stylePreset: (item.designConfig?.stylePreset as QrStylePreset) || prev.stylePreset,
                                }));
                              }
                            }}
                            className="p-1.5 text-gray-500 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all"
                            title="Ver en previsualizador"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleEditItem(item)}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded-lg transition-all"
                            title="Editar destino y datos"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteItem(item.id)}
                            className="p-1.5 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-all"
                            title="Eliminar QR"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

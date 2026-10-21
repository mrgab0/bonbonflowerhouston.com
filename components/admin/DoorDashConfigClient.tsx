"use client";

import React, { useState, useTransition } from "react";
import {
  Truck,
  Upload,
  FileCode,
  Code2,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Save,
  PhoneCall,
  Clock,
  MapPin,
  Sparkles,
  ShieldCheck,
  Trash2,
  Copy,
  Check,
  Eye,
  Key,
} from "lucide-react";
import { IDoorDashConfig } from "@/lib/models/SiteConfig";
import {
  updateDoorDashConfigAction,
  uploadDoorDashVerificationFileAction,
  removeDoorDashVerificationFileAction,
} from "@/lib/actions/doordash";

interface DoorDashConfigClientProps {
  initialConfig: IDoorDashConfig;
}

export function DoorDashConfigClient({ initialConfig }: DoorDashConfigClientProps) {
  const [config, setConfig] = useState<IDoorDashConfig>(initialConfig);
  const [isPending, startTransition] = useTransition();
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: "success" | "error" | null;
    message: string;
  }>({ type: null, message: "" });

  // Manejo de archivo local
  const [uploadFileName, setUploadFileName] = useState(config.verificationFileName || "doordash-verification.html");
  const [uploadFileContent, setUploadFileContent] = useState(config.verificationFileContent || "");
  const [isReadingFile, setIsReadingFile] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadFileName(file.name);
    setIsReadingFile(true);

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setUploadFileContent(text || "");
      setIsReadingFile(false);
      setStatusMessage({
        type: "success",
        message: `Archivo "${file.name}" cargado en memoria. Recuerda presionar "Guardar Archivo de Verificación".`,
      });
    };
    reader.onerror = () => {
      setIsReadingFile(false);
      setStatusMessage({ type: "error", message: "Error al leer el archivo seleccionado." });
    };
    reader.readAsText(file);
  };

  const handleSaveVerificationFile = () => {
    if (!uploadFileName.trim()) {
      setStatusMessage({ type: "error", message: "Debes especificar un nombre de archivo (ej. doordash-verification.html)." });
      return;
    }
    if (!uploadFileContent.trim()) {
      setStatusMessage({ type: "error", message: "El contenido del archivo no puede estar vacío." });
      return;
    }

    startTransition(async () => {
      setStatusMessage({ type: null, message: "" });
      const res = await uploadDoorDashVerificationFileAction(uploadFileName.trim(), uploadFileContent);
      if (res.success) {
        setConfig((prev) => ({
          ...prev,
          verificationFileName: uploadFileName.trim(),
          verificationFileContent: uploadFileContent,
        }));
        setStatusMessage({
          type: "success",
          message: `✅ ¡Archivo "${uploadFileName.trim()}" guardado y publicado en la raíz del sitio con éxito!`,
        });
      } else {
        setStatusMessage({ type: "error", message: res.error || "Error al subir el archivo." });
      }
    });
  };

  const handleDeleteVerificationFile = () => {
    if (!confirm("¿Deseas eliminar el archivo de verificación de DoorDash del sitio?")) return;

    startTransition(async () => {
      const res = await removeDoorDashVerificationFileAction();
      if (res.success) {
        setConfig((prev) => ({
          ...prev,
          verificationFileName: "",
          verificationFileContent: "",
        }));
        setUploadFileName("doordash-verification.html");
        setUploadFileContent("");
        setStatusMessage({ type: "success", message: "Archivo de verificación eliminado." });
      } else {
        setStatusMessage({ type: "error", message: res.error || "No se pudo eliminar el archivo." });
      }
    });
  };

  const handleSaveAllConfig = () => {
    startTransition(async () => {
      setStatusMessage({ type: null, message: "" });
      const res = await updateDoorDashConfigAction(config);
      if (res.success) {
        setStatusMessage({
          type: "success",
          message: "✨ ¡Configuración de DoorDash Drive guardada y aplicada exitosamente!",
        });
      } else {
        setStatusMessage({ type: "error", message: res.error || "Error al guardar la configuración." });
      }
    });
  };

  const publicVerificationUrl = config.verificationFileName
    ? `https://bonbonflowershouston.com/${config.verificationFileName}`
    : "";

  const copyToClipboard = () => {
    if (!publicVerificationUrl) return;
    navigator.clipboard.writeText(publicVerificationUrl);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2500);
  };

  return (
    <div className="space-y-8">
      {/* Header Principal del Módulo DoorDash */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-[#12131A] p-6 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-red-600 via-rose-500 to-amber-500 text-white flex items-center justify-center shadow-lg shadow-red-500/25 flex-shrink-0">
            <Truck size={28} />
          </div>
          <div>
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-red-600 dark:text-red-400 mb-1">
              <span>Logística &amp; Encomiendas de Última Milla</span>
              <span className="px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-300 text-[10px]">
                OFICIAL
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif font-black text-stone-900 dark:text-white">
              DoorDash Drive &amp; Verificación de Dominio
            </h1>
            <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 mt-1 max-w-2xl">
              Gestiona el archivo de verificación HTML que DoorDash solicita para validar la propiedad de tu tienda,
              inserta su script oficial y prepara los datos para la llamada telefónica con tu asesora.
            </p>
          </div>
        </div>

        {/* Botón Guardar Global */}
        <button
          type="button"
          onClick={handleSaveAllConfig}
          disabled={isPending}
          className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-[#E00000] hover:bg-[#B30000] text-white text-xs font-extrabold transition-all shadow-md active:scale-95 disabled:opacity-50 self-start md:self-auto cursor-pointer"
        >
          {isPending ? (
            <>
              <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              <span>Guardando...</span>
            </>
          ) : (
            <>
              <Save size={16} />
              <span>Guardar Todo</span>
            </>
          )}
        </button>
      </div>

      {/* Banner de Feedback / Alertas */}
      {statusMessage.type && (
        <div
          className={`p-4 rounded-2xl text-xs font-bold flex items-center justify-between border ${
            statusMessage.type === "success"
              ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900"
              : "bg-rose-50 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border-rose-200 dark:border-rose-900"
          }`}
        >
          <div className="flex items-center gap-2">
            {statusMessage.type === "success" ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
            <span>{statusMessage.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setStatusMessage({ type: null, message: "" })}
            className="text-stone-400 hover:text-stone-600 dark:hover:text-white"
          >
            ✕
          </button>
        </div>
      )}

      {/* TARJETA 1: GUÍA PARA LA LLAMADA TELEFÓNICA DE DOORDASH (PARA LA JEFA) */}
      <div className="bg-gradient-to-br from-amber-50/80 via-white to-red-50/40 dark:from-stone-900 dark:via-[#12131A] dark:to-stone-900 p-6 rounded-3xl border border-amber-200/80 dark:border-amber-900/50 shadow-sm space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-amber-500 text-white shadow-md">
            <PhoneCall size={22} />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-black text-stone-900 dark:text-white">
              📞 Checklist para la Llamada de DoorDash (Guía para la Jefa)
            </h2>
            <p className="text-xs text-stone-600 dark:text-stone-300">
              Ten a la mano estas respuestas cuando el equipo de soporte de DoorDash se comunique contigo:
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          <div className="p-4 rounded-2xl bg-white/90 dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700 space-y-1.5 shadow-xs">
            <div className="flex items-center gap-2 text-xs font-black text-stone-900 dark:text-white">
              <MapPin size={15} className="text-red-500" />
              <span>1. Dirección de Recogida (Pickup)</span>
            </div>
            <p className="text-xs text-stone-600 dark:text-stone-300">
              Dirección oficial de la boutique en Houston, TX. Indícales la puerta o mostrador de atención.
            </p>
            <p className="text-[11px] font-bold text-stone-500 dark:text-stone-400 pt-1">
              Teléfono: <span className="text-stone-900 dark:text-white font-mono">(346) 739-2730</span>
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white/90 dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700 space-y-1.5 shadow-xs">
            <div className="flex items-center gap-2 text-xs font-black text-stone-900 dark:text-white">
              <Clock size={15} className="text-amber-500" />
              <span>2. Tiempo de Preparación (Lead Time)</span>
            </div>
            <p className="text-xs text-stone-600 dark:text-stone-300">
              ¿Cuánto tardas en armar el arreglo antes de que llegue el repartidor?
            </p>
            <p className="text-[11px] font-bold text-amber-600 dark:text-amber-400 pt-1">
              Recomendado: 30 a 45 minutos (o entregas programadas).
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white/90 dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700 space-y-1.5 shadow-xs">
            <div className="flex items-center gap-2 text-xs font-black text-stone-900 dark:text-white">
              <ShieldCheck size={15} className="text-emerald-500" />
              <span>3. Manejo de Producto Delicado</span>
            </div>
            <p className="text-xs text-stone-600 dark:text-stone-300">
              Exige que los Dashers lleven los ramos en posición vertical con aire acondicionado (flores naturales hidratadas).
            </p>
            <p className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 pt-1">
              Incluye instrucciones especiales en el sistema.
            </p>
          </div>
        </div>
      </div>

      {/* SECCIÓN 2: SUBIDA Y HOSPEDAJE DEL ARCHIVO HTML DE VERIFICACIÓN DE DOORDASH */}
      <div className="bg-white dark:bg-[#12131A] p-6 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-sm space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-2 border-b border-stone-100 dark:border-stone-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400">
              <FileCode size={20} />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-stone-900 dark:text-white">
                1. Archivo HTML de Verificación de Dominio DoorDash
              </h2>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                DoorDash suele pedir que subas un archivo HTML o TXT con un código único a la raíz de tu dominio (ej. <code className="text-pink-600 font-mono">doordash-verification.html</code>).
              </p>
            </div>
          </div>

          {config.verificationFileName && (
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                <CheckCircle2 size={13} /> Activo en tu web
              </span>
              <button
                type="button"
                onClick={handleDeleteVerificationFile}
                disabled={isPending}
                className="p-1.5 rounded-lg text-stone-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                title="Eliminar archivo"
              >
                <Trash2 size={16} />
              </button>
            </div>
          )}
        </div>

        {/* Si el archivo ya está subido, mostrar enlace público */}
        {config.verificationFileName && (
          <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="min-w-0">
              <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400 block">
                URL Pública accesible para DoorDash
              </span>
              <a
                href={`/${config.verificationFileName}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs sm:text-sm font-mono font-bold text-red-600 hover:underline truncate block"
              >
                {publicVerificationUrl}
              </a>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                type="button"
                onClick={copyToClipboard}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-200 border border-stone-200 dark:border-stone-700 text-xs font-bold hover:bg-stone-100 transition-all shadow-xs"
              >
                {copiedUrl ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} />}
                <span>{copiedUrl ? "Copiada" : "Copiar URL"}</span>
              </button>
              <a
                href={`/${config.verificationFileName}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-red-600 text-white text-xs font-bold hover:bg-red-700 transition-all shadow-xs"
              >
                <Eye size={13} />
                <span>Probar Enlace ↗</span>
              </a>
            </div>
          </div>
        )}

        {/* Formulario de Carga del Archivo */}
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            {/* Nombre del Archivo */}
            <div className="md:col-span-5 space-y-1.5">
              <label className="text-xs font-black text-stone-900 dark:text-white block">
                Nombre del Archivo Requerido por DoorDash
              </label>
              <input
                type="text"
                value={uploadFileName}
                onChange={(e) => setUploadFileName(e.target.value)}
                placeholder="ej. doordash-verification.html"
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-xs font-mono font-bold text-stone-900 dark:text-white focus:outline-none focus:border-red-500"
              />
              <span className="text-[11px] text-stone-500 block">
                Normalmente DoorDash te dará un nombre exacto como <code className="text-red-500">doordash-verification.html</code> o con un código.
              </span>
            </div>

            {/* Input de Subida de Archivo */}
            <div className="md:col-span-7 space-y-1.5">
              <label className="text-xs font-black text-stone-900 dark:text-white block">
                Subir Archivo desde tu Computadora o Celular
              </label>
              <label className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border-2 border-dashed border-stone-300 dark:border-stone-700 hover:border-red-500 dark:hover:border-red-500 bg-stone-50 dark:bg-stone-900/60 cursor-pointer transition-all">
                <Upload size={16} className="text-red-500" />
                <span className="text-xs font-bold text-stone-700 dark:text-stone-300">
                  {isReadingFile ? "Leyendo archivo..." : "Seleccionar archivo .html o .txt"}
                </span>
                <input
                  type="file"
                  accept=".html,.txt"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
              <span className="text-[11px] text-stone-500 block">
                Sube el archivo que te envió DoorDash o pega su contenido en el recuadro de abajo.
              </span>
            </div>
          </div>

          {/* Editor de Contenido del Archivo */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black text-stone-900 dark:text-white block">
                Contenido del Archivo HTML / Texto
              </label>
              <span className="text-[11px] text-stone-400">
                {uploadFileContent.length} caracteres
              </span>
            </div>
            <textarea
              rows={5}
              value={uploadFileContent}
              onChange={(e) => setUploadFileContent(e.target.value)}
              placeholder="<html><head><meta name='doordash-site-verification' content='...' /></head><body>...</body></html>"
              className="w-full p-3.5 rounded-2xl border border-stone-300 dark:border-stone-700 bg-stone-900 text-emerald-400 font-mono text-xs focus:outline-none focus:border-red-500 transition-all leading-relaxed"
            />
          </div>

          {/* Botón de acción para el archivo */}
          <div className="flex justify-end pt-1">
            <button
              type="button"
              onClick={handleSaveVerificationFile}
              disabled={isPending || isReadingFile}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-all shadow-md active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              <Save size={14} />
              <span>Guardar Archivo de Verificación</span>
            </button>
          </div>
        </div>
      </div>

      {/* SECCIÓN 3: SCRIPT DE INTEGRACIÓN & WIDGET OFICIAL DE DOORDASH */}
      <div className="bg-white dark:bg-[#12131A] p-6 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-sm space-y-5">
        <div className="flex items-center justify-between flex-wrap gap-2 border-b border-stone-100 dark:border-stone-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
              <Code2 size={20} />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-stone-900 dark:text-white">
                2. Script Oficial de DoorDash (Pixel / Widget / Storefront)
              </h2>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Si DoorDash te pide pegar una etiqueta <code className="text-pink-600 font-mono">&lt;script&gt;</code> en la tienda, pégalo aquí y actívalo con un solo clic.
              </p>
            </div>
          </div>

          {/* Toggle Activar Script */}
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <span className="text-xs font-bold text-stone-700 dark:text-stone-300">
              {config.scriptEnabled ? "Script Activado" : "Script Pausado"}
            </span>
            <div className="relative inline-flex items-center">
              <input
                type="checkbox"
                checked={!!config.scriptEnabled}
                onChange={(e) => setConfig((prev) => ({ ...prev, scriptEnabled: e.target.checked }))}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-stone-300 dark:bg-stone-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
            </div>
          </label>
        </div>

        <div className="space-y-3">
          <textarea
            rows={5}
            value={config.scriptHtml || ""}
            onChange={(e) => setConfig((prev) => ({ ...prev, scriptHtml: e.target.value }))}
            placeholder="<script src='https://cdn.doordash.com/...' async></script>"
            className="w-full p-3.5 rounded-2xl border border-stone-300 dark:border-stone-700 bg-stone-900 text-amber-300 font-mono text-xs focus:outline-none focus:border-red-500 transition-all leading-relaxed"
          />
          <p className="text-[11px] text-stone-500 leading-relaxed">
            💡 Cuando el interruptor está activado, este código se inyecta de forma segura en la cabecera (<code className="font-mono">&lt;head&gt;</code>) de toda la tienda para que DoorDash pueda detectar las visitas y pedidos.
          </p>
        </div>
      </div>

      {/* SECCIÓN 4: PARÁMETROS OPERATIVOS & DOORDASH DRIVE API (OPCIONAL / AVANZADO) */}
      <div className="bg-white dark:bg-[#12131A] p-6 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-sm space-y-5">
        <div className="flex items-center gap-2.5 border-b border-stone-100 dark:border-stone-800 pb-4">
          <div className="p-2 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400">
            <Key size={20} />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-black text-stone-900 dark:text-white">
              3. Parámetros Operativos &amp; Credenciales DoorDash Drive API
            </h2>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              Datos para cotización automática de encomiendas y despacho de repartidores cuando el asesor te asigne las credenciales.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-stone-700 dark:text-stone-300 block">
              Instrucciones para el Repartidor (Dasher Pickup Notes)
            </label>
            <input
              type="text"
              value={config.pickupInstructions || ""}
              onChange={(e) => setConfig((prev) => ({ ...prev, pickupInstructions: e.target.value }))}
              placeholder="Recoger arreglo en mostrador. Llevar vertical."
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-xs font-medium text-stone-900 dark:text-white focus:outline-none focus:border-red-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-stone-700 dark:text-stone-300 block">
              Tiempo de Preparación (Minutos)
            </label>
            <input
              type="number"
              min={10}
              max={180}
              value={config.leadTimeMinutes || 30}
              onChange={(e) => setConfig((prev) => ({ ...prev, leadTimeMinutes: parseInt(e.target.value, 10) || 30 }))}
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-xs font-medium text-stone-900 dark:text-white focus:outline-none focus:border-red-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-stone-700 dark:text-stone-300 block">
              Developer ID (DoorDash Developer Portal)
            </label>
            <input
              type="text"
              value={config.developerId || ""}
              onChange={(e) => setConfig((prev) => ({ ...prev, developerId: e.target.value }))}
              placeholder="ej. a8b4c2..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-xs font-mono text-stone-900 dark:text-white focus:outline-none focus:border-red-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-stone-700 dark:text-stone-300 block">
              Key ID
            </label>
            <input
              type="text"
              value={config.keyId || ""}
              onChange={(e) => setConfig((prev) => ({ ...prev, keyId: e.target.value }))}
              placeholder="ej. dd-key-..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-xs font-mono text-stone-900 dark:text-white focus:outline-none focus:border-red-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-stone-700 dark:text-stone-300 block">
              Signing Secret
            </label>
            <input
              type="password"
              value={config.signingSecret || ""}
              onChange={(e) => setConfig((prev) => ({ ...prev, signingSecret: e.target.value }))}
              placeholder="••••••••••••••••"
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-xs font-mono text-stone-900 dark:text-white focus:outline-none focus:border-red-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-stone-700 dark:text-stone-300 block">
              External Store ID (DoorDash Merchant ID)
            </label>
            <input
              type="text"
              value={config.storeId || ""}
              onChange={(e) => setConfig((prev) => ({ ...prev, storeId: e.target.value }))}
              placeholder="ej. bonbon-flowers-houston-1"
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-xs font-mono text-stone-900 dark:text-white focus:outline-none focus:border-red-500"
            />
          </div>
        </div>

        <div className="flex justify-end pt-3">
          <button
            type="button"
            onClick={handleSaveAllConfig}
            disabled={isPending}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-stone-900 hover:bg-black dark:bg-stone-800 dark:hover:bg-stone-700 text-white text-xs font-bold transition-all shadow-md active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            <Save size={14} />
            <span>Guardar Credenciales &amp; Parámetros</span>
          </button>
        </div>
      </div>
    </div>
  );
}

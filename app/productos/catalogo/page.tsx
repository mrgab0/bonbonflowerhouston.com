import React from "react";
import Link from "next/link";
import dbConnect from "@/lib/db";
import { Product } from "@/lib/models/Product";
import { Addon } from "@/lib/models/Addon";
import { filterUniqueVariantProducts } from "@/lib/utils/variantFilter";
import { CatalogPrintToolbar } from "./CatalogPrintToolbar";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function CatalogoEditorialPdfPage({ searchParams }: PageProps) {
  const resolvedParams = await searchParams;

  // Parámetros de configuración
  const idsParam = typeof resolvedParams.ids === "string" ? resolvedParams.ids : "";
  const includeAddons = resolvedParams.addons !== "false";
  const addonIdsParam = typeof resolvedParams.addonIds === "string" ? resolvedParams.addonIds : "";
  const showPrices = resolvedParams.prices !== "false";
  const includeQr = resolvedParams.qr !== "false";
  const lang = resolvedParams.lang === "es" ? "es" : "en";
  const layout = resolvedParams.layout === "compact" ? "compact" : "editorial";
  const contactPhone = typeof resolvedParams.phone === "string" ? resolvedParams.phone : "(346) 739-2730";
  const catalogTitle = typeof resolvedParams.title === "string" ? resolvedParams.title : (
    lang === "es" ? "Bonbon Flowers Houston — Colección de Alta Costura Floral" : "Bonbon Flowers Houston — Luxury Floral Collection"
  );
  const catalogSubtitle = typeof resolvedParams.subtitle === "string" ? resolvedParams.subtitle : (
    lang === "es"
      ? "Arreglos monumentales y detalles couture confeccionados a mano en Houston, TX"
      : "Handcrafted Couture Floral Arrangements & Concierge Gifts in Houston, TX"
  );

  // Cargar Productos desde MongoDB
  await dbConnect();

  let query: any = { isDeleted: { $ne: true }, isActive: { $ne: false } };
  if (idsParam) {
    const idsList = idsParam.split(",").map((s) => s.trim()).filter(Boolean);
    if (idsList.length > 0) {
      query._id = { $in: idsList };
    }
  }

  const rawProducts = await Product.find(query).sort({ category: 1, createdAt: -1 }).lean();
  const plainProducts = JSON.parse(JSON.stringify(rawProducts));

  // EXCLUSIÓN ESTRICTA DE HIJOS (VARIANTES SECUNDARIAS)
  const products: any[] = filterUniqueVariantProducts<any>(plainProducts);

  // Cargar Adicionales si se solicitan
  let addons: any[] = [];
  if (includeAddons) {
    let addonQuery: any = { isDeleted: { $ne: true } };
    if (addonIdsParam) {
      const addonIdsList = addonIdsParam.split(",").map((s) => s.trim()).filter(Boolean);
      if (addonIdsList.length > 0) {
        addonQuery._id = { $in: addonIdsList };
      }
    }
    const rawAddons = await Addon.find(addonQuery).sort({ category: 1 }).lean();
    addons = JSON.parse(JSON.stringify(rawAddons));
  }

  // Agrupar productos por categoría
  const productsByCategory: { [key: string]: any[] } = {};
  for (const prod of products) {
    const cat = prod.category || (lang === "es" ? "Boutique" : "Luxury Bouquet");
    if (!productsByCategory[cat]) {
      productsByCategory[cat] = [];
    }
    productsByCategory[cat].push(prod);
  }

  const cleanPhone = contactPhone.replace(/[^\d+]/g, "");

  return (
    <div className="bg-stone-100 min-h-screen text-stone-900 font-sans print:bg-white print:text-black">
      {/* Estilos de Impresión CSS A4 Haute Couture */}
      <style>{`
        @page {
          size: letter portrait;
          margin: 10mm 12mm 12mm 12mm;
        }
        @media print {
          body {
            background-color: #ffffff !important;
            color: #111111 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .no-print {
            display: none !important;
          }
          .page-break-after {
            page-break-after: always;
            break-after: page;
          }
          .avoid-break {
            page-break-inside: avoid;
            break-inside: avoid;
          }
          .print-shadow-none {
            box-shadow: none !important;
          }
        }
      `}</style>

      {/* Toolbar Flotante no imprimible */}
      <CatalogPrintToolbar
        totalProducts={products.length}
        totalAddons={addons.length}
        lang={lang}
      />

      {/* CONTENEDOR PRINCIPAL DEL LOOKBOOK A4 */}
      <div className="max-w-[850px] mx-auto py-8 sm:py-12 px-4 sm:px-0 print:py-0 print:px-0 print:max-w-none">

        {/* ============================================================ */}
        {/* PÁGINA 1: PORTADA EDITORIAL DE ALTA COSTURA                  */}
        {/* ============================================================ */}
        <section className="bg-white rounded-3xl p-10 sm:p-16 border border-stone-200/80 shadow-xl mb-10 print:rounded-none print:border-none print:shadow-none print:p-8 min-h-[960px] flex flex-col justify-between page-break-after avoid-break">
          {/* Header Superior de Portada */}
          <div className="border-b-2 border-stone-900 pb-8 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-[0.35em] text-[#C5A059] block mb-1">
                HOUSTON, TEXAS • ATELIER FLORAL
              </span>
              <h1 className="text-3xl sm:text-5xl font-serif font-black tracking-tight text-[#163422]">
                BONBON FLOWERS
              </h1>
              <span className="text-xs font-mono uppercase tracking-[0.25em] text-stone-500 block mt-1">
                HAUTE COUTURE BOTANICAL LOOKBOOK
              </span>
            </div>

            <div className="text-right sm:text-right">
              <span className="text-xs font-serif italic text-stone-600 block">
                {lang === "es" ? "Edición Oficial 2026" : "Official 2026 Edition"}
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-stone-900 block mt-0.5">
                {products.length} {lang === "es" ? "Arreglos de Colección" : "Curated Designs"}
              </span>
            </div>
          </div>

          {/* Bloque Central de Portada */}
          <div className="my-auto py-12 text-center space-y-6">
            <div className="inline-block px-4 py-1.5 rounded-full border border-[#C5A059] bg-[#C5A059]/10 text-[#C5A059] text-[11px] font-bold tracking-[0.2em] uppercase">
              {lang === "es" ? "CATÁLOGO DE PRODUCTOS EXCLUSIVOS" : "EXCLUSIVE FLORAL PORTFOLIO"}
            </div>

            <h2 className="text-4xl sm:text-6xl font-serif font-normal text-stone-900 leading-[1.1] max-w-2xl mx-auto">
              {catalogTitle}
            </h2>

            <div className="w-16 h-0.5 bg-[#C5A059] mx-auto my-4" />

            <p className="text-sm sm:text-base font-serif italic text-stone-600 max-w-xl mx-auto leading-relaxed">
              "{catalogSubtitle}"
            </p>

            {/* Datos de Contacto y Concierge */}
            <div className="pt-6 flex flex-wrap justify-center items-center gap-6 text-xs text-stone-700 font-medium">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-[#163422]">📞 Concierge:</span>
                <a href={`tel:${cleanPhone}`} className="hover:underline font-bold text-stone-900">
                  {contactPhone}
                </a>
              </div>
              <span>•</span>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-[#163422]">🌐 Web:</span>
                <span className="font-bold text-stone-900">bonbonflowershouston.com</span>
              </div>
              <span>•</span>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-[#163422]">📍 Houston, TX:</span>
                <span>Same-Day White-Glove Delivery</span>
              </div>
            </div>
          </div>

          {/* Pie de Portada */}
          <div className="border-t border-stone-200 pt-6 flex justify-between items-center text-[10px] text-stone-400 font-mono uppercase tracking-widest">
            <span>Bonbon Flowers Atelier LLC</span>
            <span>Houston Metro Area</span>
          </div>
        </section>


        {/* ============================================================ */}
        {/* PÁGINAS DE PRODUCTOS POR CATEGORÍA                           */}
        {/* ============================================================ */}
        {Object.entries(productsByCategory).map(([categoryName, prodsInCategory]) => (
          <section
            key={categoryName}
            className="bg-white rounded-3xl p-8 sm:p-12 border border-stone-200/80 shadow-xl mb-10 print:rounded-none print:border-none print:shadow-none print:p-6 page-break-after"
          >
            {/* Cabecera de Colección / Categoría */}
            <div className="border-b-2 border-[#163422] pb-4 mb-8 flex justify-between items-end">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#C5A059] block">
                  {lang === "es" ? "COLECCIÓN FLORAL" : "FLORAL COLLECTION"}
                </span>
                <h3 className="text-2xl sm:text-3xl font-serif font-bold text-[#163422] tracking-tight">
                  {categoryName}
                </h3>
              </div>
              <span className="text-xs font-bold text-stone-500 font-mono">
                {prodsInCategory.length} {lang === "es" ? "diseños" : "pieces"}
              </span>
            </div>

            {/* Grid de Productos (Editorial: 2 por página | Compacto: 4 por página) */}
            <div
              className={
                layout === "compact"
                  ? "grid grid-cols-2 gap-6"
                  : "grid grid-cols-1 sm:grid-cols-2 gap-8"
              }
            >
              {prodsInCategory.map((product) => {
                const mainImage = product.images?.[0] || "";
                const productUrl = `https://www.bonbonflowershouston.com/productos/${product.slug}`;
                const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=140x140&margin=3&data=${encodeURIComponent(productUrl)}`;

                return (
                  <div
                    key={product._id}
                    className="border border-stone-200 rounded-2xl p-4 bg-[#FAFAF9] flex flex-col justify-between avoid-break print:bg-white print:border-stone-300"
                  >
                    <div>
                      {/* Imagen Cuadrada de Alta Resolución */}
                      <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-white mb-4 border border-stone-100 flex items-center justify-center">
                        {mainImage ? (
                          <img
                            src={mainImage}
                            alt={product.name}
                            loading="eager"
                            decoding="sync"
                            className="w-full h-full object-contain p-2"
                          />
                        ) : (
                          <div className="text-stone-300 text-xs">Sin imagen</div>
                        )}

                        {/* Badge destacada si existe */}
                        {product.badge && (
                          <span className="absolute bottom-2.5 right-2.5 bg-[#163422] text-white text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border border-[#D4AF37]">
                            {product.badge}
                          </span>
                        )}
                      </div>

                      {/* Título & Flores */}
                      <h4 className="font-serif font-bold text-base sm:text-lg text-stone-900 leading-snug line-clamp-2">
                        {product.name}
                      </h4>

                      <div className="flex items-center gap-2 mt-1 mb-2 text-xs text-stone-500">
                        {product.flowerCount ? (
                          <span className="font-semibold text-[#163422]">
                            🌹 {product.flowerCount} {lang === "es" ? "Rosas Naturales" : "Fresh Roses"}
                          </span>
                        ) : null}
                        {product.bouquetType ? (
                          <span>• {product.bouquetType}</span>
                        ) : null}
                      </div>

                      {/* Breve descripción */}
                      {product.description && (
                        <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed mb-3">
                          {product.description}
                        </p>
                      )}
                    </div>

                    {/* Footer de Tarjeta con Precio y Código QR */}
                    <div className="border-t border-stone-200/80 pt-3 flex items-center justify-between gap-3 mt-auto">
                      <div>
                        {showPrices && (
                          <>
                            <span className="text-[9px] font-mono uppercase tracking-wider text-stone-400 block">
                              {lang === "es" ? "PRECIO BOUTIQUE" : "INVESTMENT"}
                            </span>
                            <span className="text-lg font-serif font-bold text-[#163422]">
                              ${product.price.toFixed(2)} <span className="text-xs font-sans text-stone-500">USD</span>
                            </span>
                          </>
                        )}
                        <span className="text-[10px] text-stone-500 block mt-0.5">
                          SKU: {product.sku || "BOUTIQUE"}
                        </span>
                      </div>

                      {includeQr && (
                        <div className="flex items-center gap-2 shrink-0 bg-white p-1 rounded-lg border border-stone-200">
                          <img
                            src={qrUrl}
                            alt={`QR ${product.name}`}
                            loading="eager"
                            decoding="sync"
                            className="w-12 h-12 rounded"
                            crossOrigin="anonymous"
                          />
                          <div className="text-[8px] font-mono uppercase tracking-wider text-stone-600 leading-tight">
                            <span>{lang === "es" ? "ESCANEAR" : "SCAN"}</span>
                            <br />
                            <strong className="text-[#163422]">{lang === "es" ? "PEDIR" : "ORDER"}</strong>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        ))}


        {/* ============================================================ */}
        {/* PÁGINA ADICIONALES: REGALOS Y DETALLES CONCIERGE             */}
        {/* ============================================================ */}
        {includeAddons && addons.length > 0 && (
          <section className="bg-white rounded-3xl p-8 sm:p-12 border border-stone-200/80 shadow-xl mb-10 print:rounded-none print:border-none print:shadow-none print:p-6 page-break-after">
            <div className="border-b-2 border-purple-900 pb-4 mb-8 flex justify-between items-end">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-purple-700 block">
                  {lang === "es" ? "COMPLEMENTOS DE LUJO" : "CONCIERGE FINISHING TOUCHES"}
                </span>
                <h3 className="text-2xl sm:text-3xl font-serif font-bold text-purple-950 tracking-tight">
                  {lang === "es" ? "Adicionales & Regalos de Autor" : "Curated Gifts & Add-ons"}
                </h3>
              </div>
              <span className="text-xs font-bold text-stone-500 font-mono">
                {addons.length} {lang === "es" ? "complementos" : "items"}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-5">
              {addons.map((addon) => {
                const addonImg = addon.images?.[0] || "";
                return (
                  <div
                    key={addon._id}
                    className="border border-purple-100 rounded-2xl p-3.5 bg-purple-50/30 flex flex-col justify-between avoid-break print:bg-white print:border-stone-200"
                  >
                    <div>
                      <div className="aspect-square w-full rounded-xl overflow-hidden bg-white mb-2.5 border border-purple-100/80 flex items-center justify-center">
                        {addonImg ? (
                          <img
                            src={addonImg}
                            alt={addon.name}
                            loading="eager"
                            decoding="sync"
                            className="w-full h-full object-contain p-2"
                          />
                        ) : (
                          <div className="text-stone-300 text-xs">Sin imagen</div>
                        )}
                      </div>

                      <span className="text-[9px] uppercase tracking-wider text-purple-700 font-bold block truncate">
                        {addon.category || "Concierge"}
                      </span>
                      <h4 className="font-serif font-bold text-xs sm:text-sm text-stone-900 truncate">
                        {addon.name}
                      </h4>
                    </div>

                    <div className="border-t border-purple-100/80 pt-2 mt-2 flex justify-between items-center text-xs">
                      <span className="text-[10px] text-stone-500">{lang === "es" ? "Añadible" : "Optional"}</span>
                      {showPrices && (
                        <span className="font-bold text-purple-900">
                          +${addon.price?.toFixed(2)} USD
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}


        {/* ============================================================ */}
        {/* PÁGINA FINAL: CONTRAPORTADA DE SERVICIO SAME-DAY HOUSTON     */}
        {/* ============================================================ */}
        <section className="bg-[#163422] text-white rounded-3xl p-10 sm:p-16 shadow-xl mb-10 print:rounded-none print:shadow-none print:p-8 min-h-[960px] flex flex-col justify-between avoid-break">
          {/* Header Superior Contraportada */}
          <div className="border-b border-white/20 pb-8 flex justify-between items-center">
            <span className="text-xs font-mono uppercase tracking-[0.3em] text-[#C5A059]">
              BONBON FLOWERS CONCIERGE
            </span>
            <span className="text-xs text-white/60">Houston, Texas</span>
          </div>

          {/* Bloque Central de Guía para Pedidos */}
          <div className="my-auto py-12 space-y-8 max-w-xl mx-auto text-center">
            <h3 className="text-3xl sm:text-5xl font-serif font-normal leading-tight">
              {lang === "es" ? "¿Cómo Realizar tu Pedido?" : "How to Place Your Order"}
            </h3>

            <p className="text-sm font-serif italic text-white/80 leading-relaxed">
              {lang === "es"
                ? "Cada arreglo floral se elabora bajo pedido con rosas ecuatorianas de exportación e inspección rigurosa antes del despacho."
                : "Each floral composition is handcrafted to order using hand-selected Ecuadorian roses, inspected for flawless presentation."}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4 text-left">
              <div className="bg-white/10 p-5 rounded-2xl border border-white/10">
                <span className="text-2xl font-serif font-bold text-[#C5A059] block mb-1">01</span>
                <h4 className="text-xs font-bold uppercase tracking-wider mb-1">
                  {lang === "es" ? "Escanear QR" : "Scan QR"}
                </h4>
                <p className="text-[11px] text-white/70 leading-relaxed">
                  {lang === "es"
                    ? "Apunta con la cámara de tu teléfono al código QR del arreglo para ir directo a la compra."
                    : "Point your smartphone camera at any product QR code to order directly online."}
                </p>
              </div>

              <div className="bg-white/10 p-5 rounded-2xl border border-white/10">
                <span className="text-2xl font-serif font-bold text-[#C5A059] block mb-1">02</span>
                <h4 className="text-xs font-bold uppercase tracking-wider mb-1">
                  {lang === "es" ? "Llamada Directa" : "Direct Call"}
                </h4>
                <p className="text-[11px] text-white/70 leading-relaxed">
                  {lang === "es"
                    ? `Llámanos al ${contactPhone} para pedidos corporativos o personalizados.`
                    : `Call us at ${contactPhone} for custom inquiries or corporate gifting.`}
                </p>
              </div>

              <div className="bg-white/10 p-5 rounded-2xl border border-white/10">
                <span className="text-2xl font-serif font-bold text-[#C5A059] block mb-1">03</span>
                <h4 className="text-xs font-bold uppercase tracking-wider mb-1">
                  {lang === "es" ? "Same-Day Delivery" : "Same-Day Delivery"}
                </h4>
                <p className="text-[11px] text-white/70 leading-relaxed">
                  {lang === "es"
                    ? "Ordena antes de la 1:00 PM para entrega el mismo día en todo Houston y metroplex."
                    : "Order before 1:00 PM for same-day delivery throughout the Houston metro area."}
                </p>
              </div>
            </div>
          </div>

          {/* Footer de Contraportada */}
          <div className="border-t border-white/20 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-white/60">
            <div>
              <strong className="text-white block font-serif text-sm">Bonbon Flowers Atelier</strong>
              <span>Houston, TX • www.bonbonflowershouston.com</span>
            </div>
            <div className="text-right">
              <span className="block font-bold text-[#C5A059]">{contactPhone}</span>
              <span className="text-[10px]">Atención de Lunes a Sábado</span>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}

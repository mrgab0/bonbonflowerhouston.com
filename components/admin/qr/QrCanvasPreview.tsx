"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import QRCode from "qrcode";
import { Download, Copy, Printer, Check, Sparkles, Image as ImageIcon } from "lucide-react";

export type QrStylePreset = "floral" | "luxury" | "modern" | "classic";

export interface QrDesignConfig {
  stylePreset: QrStylePreset;
  fgColor: string;
  bgColor: string;
  eyeColor: string;
  includeLogo: boolean;
  logoUrl: string;
  logoSize: number; // percentage (15 to 30)
  margin: number;
}

interface QrCanvasPreviewProps {
  value: string;
  config: QrDesignConfig;
  title?: string;
  onConfigChange?: (newConfig: Partial<QrDesignConfig>) => void;
}

export function QrCanvasPreview({
  value,
  config,
  title = "Código QR",
  onConfigChange,
}: QrCanvasPreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [copied, setCopied] = useState(false);
  const [downloadRes, setDownloadRes] = useState<number>(1024);
  const [isRendering, setIsRendering] = useState(false);

  // Helper to check if a module belongs to any of the 3 finder patterns (eyes)
  const isFinderPattern = (r: number, c: number, size: number) => {
    if (r < 7 && c < 7) return true; // Top-left
    if (r < 7 && c >= size - 7) return true; // Top-right
    if (r >= size - 7 && c < 7) return true; // Bottom-left
    return false;
  };

  // Helper to check if module is inside center logo area
  const isLogoArea = (r: number, c: number, size: number, logoModules: number) => {
    if (!config.includeLogo) return false;
    const center = size / 2;
    const half = logoModules / 2;
    return (
      r >= center - half &&
      r <= center + half &&
      c >= center - half &&
      c <= center + half
    );
  };

  const renderQrToCanvas = useCallback(
    async (targetCanvas: HTMLCanvasElement, exportWidth: number) => {
      if (!value) return;

      const ctx = targetCanvas.getContext("2d");
      if (!ctx) return;

      let qrData;
      try {
        qrData = QRCode.create(value, {
          errorCorrectionLevel: "H", // 30% recovery allows logo overlays
        });
      } catch (err) {
        console.error("QR Generation error:", err);
        return;
      }

      const modules = qrData.modules;
      const size = modules.size;
      const marginModules = config.margin || 3;
      const totalGridSize = size + marginModules * 2;

      targetCanvas.width = exportWidth;
      targetCanvas.height = exportWidth;

      const cellSize = exportWidth / totalGridSize;
      const offset = marginModules * cellSize;

      // 1. Draw Background
      ctx.fillStyle = config.bgColor || "#FFFFFF";
      ctx.fillRect(0, 0, exportWidth, exportWidth);

      // 2. Pre-calculate center logo area
      const logoModules = config.includeLogo
        ? Math.max(5, Math.floor(size * (config.logoSize / 100)))
        : 0;

      // 3. Draw Body Modules (Skipping Finder patterns & logo area)
      ctx.fillStyle = config.fgColor || "#163422";

      for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
          if (isFinderPattern(r, c, size)) continue;
          if (isLogoArea(r, c, size, logoModules)) continue;

          const isDark = modules.get(r, c);
          if (!isDark) continue;

          const x = offset + c * cellSize;
          const y = offset + r * cellSize;

          if (config.stylePreset === "floral") {
            // Romantic Floral Dots
            ctx.beginPath();
            ctx.arc(
              x + cellSize / 2,
              y + cellSize / 2,
              cellSize * 0.44,
              0,
              Math.PI * 2
            );
            ctx.fill();
          } else if (config.stylePreset === "modern") {
            // Squircle / Smooth Rounded
            ctx.beginPath();
            const radius = cellSize * 0.35;
            ctx.roundRect
              ? ctx.roundRect(x, y, cellSize * 0.95, cellSize * 0.95, radius)
              : ctx.rect(x, y, cellSize, cellSize);
            ctx.fill();
          } else if (config.stylePreset === "luxury") {
            // Boutique Luxury Pills/Gems
            ctx.beginPath();
            ctx.arc(
              x + cellSize / 2,
              y + cellSize / 2,
              cellSize * 0.42,
              0,
              Math.PI * 2
            );
            ctx.fill();
          } else {
            // Classic Sharp Squares
            ctx.fillRect(x, y, cellSize, cellSize);
          }
        }
      }

      // 4. Draw Custom Finder Patterns (Eyes)
      const drawEye = (startRow: number, startCol: number) => {
        const eyeX = offset + startCol * cellSize;
        const eyeY = offset + startRow * cellSize;
        const eyeW = 7 * cellSize;

        ctx.fillStyle = config.eyeColor || config.fgColor || "#163422";

        if (config.stylePreset === "floral") {
          // Rounded flower eye
          const outerRadius = cellSize * 2;
          ctx.beginPath();
          if (ctx.roundRect) {
            ctx.roundRect(eyeX, eyeY, eyeW, eyeW, outerRadius);
          } else {
            ctx.rect(eyeX, eyeY, eyeW, eyeW);
          }
          ctx.fill();

          // Inner white gap
          ctx.fillStyle = config.bgColor || "#FFFFFF";
          ctx.beginPath();
          if (ctx.roundRect) {
            ctx.roundRect(
              eyeX + cellSize,
              eyeY + cellSize,
              5 * cellSize,
              5 * cellSize,
              outerRadius * 0.7
            );
          } else {
            ctx.rect(eyeX + cellSize, eyeY + cellSize, 5 * cellSize, 5 * cellSize);
          }
          ctx.fill();

          // Center pink/brand pupil
          ctx.fillStyle = config.eyeColor || "#FF97A4";
          ctx.beginPath();
          ctx.arc(
            eyeX + 3.5 * cellSize,
            eyeY + 3.5 * cellSize,
            1.5 * cellSize,
            0,
            Math.PI * 2
          );
          ctx.fill();
        } else if (config.stylePreset === "luxury") {
          // Concentric circular jewel eye
          const cx = eyeX + 3.5 * cellSize;
          const cy = eyeY + 3.5 * cellSize;

          // Outer circle
          ctx.beginPath();
          ctx.arc(cx, cy, 3.5 * cellSize, 0, Math.PI * 2);
          ctx.fill();

          // Inner white ring
          ctx.fillStyle = config.bgColor || "#FFFFFF";
          ctx.beginPath();
          ctx.arc(cx, cy, 2.5 * cellSize, 0, Math.PI * 2);
          ctx.fill();

          // Center Gold / Eye color pupil
          ctx.fillStyle = config.eyeColor || "#D4AF37";
          ctx.beginPath();
          ctx.arc(cx, cy, 1.5 * cellSize, 0, Math.PI * 2);
          ctx.fill();
        } else if (config.stylePreset === "modern") {
          // Modern squircle eye
          const outerR = cellSize * 1.5;
          ctx.beginPath();
          if (ctx.roundRect) {
            ctx.roundRect(eyeX, eyeY, eyeW, eyeW, outerR);
          } else {
            ctx.rect(eyeX, eyeY, eyeW, eyeW);
          }
          ctx.fill();

          // Inner gap
          ctx.fillStyle = config.bgColor || "#FFFFFF";
          ctx.beginPath();
          if (ctx.roundRect) {
            ctx.roundRect(
              eyeX + cellSize,
              eyeY + cellSize,
              5 * cellSize,
              5 * cellSize,
              outerR * 0.7
            );
          } else {
            ctx.rect(eyeX + cellSize, eyeY + cellSize, 5 * cellSize, 5 * cellSize);
          }
          ctx.fill();

          // Center pupil
          ctx.fillStyle = config.eyeColor || config.fgColor;
          ctx.beginPath();
          if (ctx.roundRect) {
            ctx.roundRect(
              eyeX + 2 * cellSize,
              eyeY + 2 * cellSize,
              3 * cellSize,
              3 * cellSize,
              outerR * 0.5
            );
          } else {
            ctx.rect(eyeX + 2 * cellSize, eyeY + 2 * cellSize, 3 * cellSize, 3 * cellSize);
          }
          ctx.fill();
        } else {
          // Classic sharp eye
          ctx.fillRect(eyeX, eyeY, eyeW, eyeW);
          ctx.fillStyle = config.bgColor || "#FFFFFF";
          ctx.fillRect(eyeX + cellSize, eyeY + cellSize, 5 * cellSize, 5 * cellSize);
          ctx.fillStyle = config.eyeColor || config.fgColor;
          ctx.fillRect(eyeX + 2 * cellSize, eyeY + 2 * cellSize, 3 * cellSize, 3 * cellSize);
        }
      };

      drawEye(0, 0); // Top-left
      drawEye(0, size - 7); // Top-right
      drawEye(size - 7, 0); // Bottom-left

      // 5. Draw Center Logo if enabled
      if (config.includeLogo && config.logoUrl) {
        await new Promise<void>((resolve) => {
          const img = new Image();
          img.crossOrigin = "anonymous";
          img.onload = () => {
            const logoW = (logoModules + 0.5) * cellSize;
            const logoH = logoW;
            const logoX = exportWidth / 2 - logoW / 2;
            const logoY = exportWidth / 2 - logoH / 2;

            // Draw white background backing for logo
            ctx.save();
            ctx.fillStyle = config.bgColor || "#FFFFFF";
            ctx.shadowColor = "rgba(0, 0, 0, 0.12)";
            ctx.shadowBlur = exportWidth * 0.015;

            const bgPad = cellSize * 0.3;
            const bgRadius =
              config.stylePreset === "luxury" || config.stylePreset === "floral"
                ? (logoW + bgPad * 2) / 2
                : cellSize * 1.5;

            ctx.beginPath();
            if (
              config.stylePreset === "luxury" ||
              config.stylePreset === "floral"
            ) {
              ctx.arc(
                exportWidth / 2,
                exportWidth / 2,
                (logoW + bgPad * 2) / 2,
                0,
                Math.PI * 2
              );
            } else if (ctx.roundRect) {
              ctx.roundRect(
                logoX - bgPad,
                logoY - bgPad,
                logoW + bgPad * 2,
                logoH + bgPad * 2,
                bgRadius
              );
            } else {
              ctx.rect(logoX - bgPad, logoY - bgPad, logoW + bgPad * 2, logoH + bgPad * 2);
            }
            ctx.fill();
            ctx.restore();

            // Clip & Draw Logo image
            ctx.save();
            ctx.beginPath();
            if (
              config.stylePreset === "luxury" ||
              config.stylePreset === "floral"
            ) {
              ctx.arc(
                exportWidth / 2,
                exportWidth / 2,
                logoW / 2,
                0,
                Math.PI * 2
              );
            } else if (ctx.roundRect) {
              ctx.roundRect(logoX, logoY, logoW, logoH, bgRadius * 0.8);
            } else {
              ctx.rect(logoX, logoY, logoW, logoH);
            }
            ctx.clip();
            ctx.drawImage(img, logoX, logoY, logoW, logoH);
            ctx.restore();

            resolve();
          };
          img.onerror = () => {
            console.warn("Could not load logo image:", config.logoUrl);
            resolve();
          };
          img.src = config.logoUrl;
        });
      }
    },
    [value, config]
  );

  useEffect(() => {
    if (!canvasRef.current) return;
    setIsRendering(true);
    renderQrToCanvas(canvasRef.current, 512).finally(() => {
      setIsRendering(false);
    });
  }, [renderQrToCanvas]);

  // Handle PNG Download
  const handleDownloadPng = async () => {
    const offscreen = document.createElement("canvas");
    await renderQrToCanvas(offscreen, downloadRes);

    const safeTitle = (title || "bonbon-qr")
      .toLowerCase()
      .replace(/[^a-z0-9_-]/g, "-");
    const link = document.createElement("a");
    link.download = `${safeTitle}-${downloadRes}px.png`;
    link.href = offscreen.toDataURL("image/png");
    link.click();
  };

  // Handle SVG Vector Download
  const handleDownloadSvg = () => {
    try {
      const qrData = QRCode.create(value, { errorCorrectionLevel: "H" });
      const modules = qrData.modules;
      const size = modules.size;
      const margin = config.margin || 3;
      const totalSize = size + margin * 2;
      const cellSize = 10;
      const svgDim = totalSize * cellSize;
      const offset = margin * cellSize;

      let rects = "";
      for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
          if (modules.get(r, c)) {
            const x = offset + c * cellSize;
            const y = offset + r * cellSize;
            rects += `<rect x="${x}" y="${y}" width="${cellSize}" height="${cellSize}" fill="${config.fgColor}" />\n`;
          }
        }
      }

      const svgContent = `<?xml version="1.0" standalone="no"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${svgDim}" height="${svgDim}" viewBox="0 0 ${svgDim} ${svgDim}">
  <rect width="100%" height="100%" fill="${config.bgColor}"/>
  ${rects}
</svg>`;

      const blob = new Blob([svgContent], { type: "image/svg+xml;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      const safeTitle = (title || "bonbon-qr")
        .toLowerCase()
        .replace(/[^a-z0-9_-]/g, "-");
      link.download = `${safeTitle}.svg`;
      link.href = url;
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("SVG generation failed:", err);
    }
  };

  // Copy PNG to Clipboard
  const handleCopyToClipboard = async () => {
    if (!canvasRef.current) return;
    try {
      canvasRef.current.toBlob(async (blob) => {
        if (!blob) return;
        await navigator.clipboard.write([
          new ClipboardItem({ "image/png": blob }),
        ]);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    } catch (err) {
      console.error("Failed to copy image:", err);
    }
  };

  // Direct Print
  const handlePrint = () => {
    if (!canvasRef.current) return;
    const dataUrl = canvasRef.current.toDataURL("image/png");
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    printWindow.document.write(`
      <html>
        <head>
          <title>${title}</title>
          <style>
            body { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; font-family: sans-serif; margin: 0; }
            img { max-width: 320px; border: 1px solid #eee; border-radius: 12px; }
            h2 { margin-bottom: 8px; color: #163422; }
            p { color: #666; font-size: 14px; margin-top: 4px; }
          </style>
        </head>
        <body>
          <h2>${title}</h2>
          <img src="${dataUrl}" />
          <p>Bonbon Flowers - Houston, TX</p>
          <script>window.onload = function() { window.print(); window.close(); }</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Canvas Card */}
      <div className="relative p-6 bg-white dark:bg-[#1A1D24] rounded-2xl shadow-xl border border-pink-100 dark:border-gray-800 flex flex-col items-center">
        {/* Decorative Badge */}
        <div className="absolute -top-3.5 px-3 py-1 bg-gradient-to-r from-[#FF97A4] to-[#B0004A] text-white text-xs font-bold rounded-full shadow-md flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5" />
          {config.stylePreset === "floral" && "Romántico Floral"}
          {config.stylePreset === "luxury" && "Boutique Esmeralda"}
          {config.stylePreset === "modern" && "Minimalista Moderno"}
          {config.stylePreset === "classic" && "Clásico Precisión"}
        </div>

        <div className="w-[280px] h-[280px] sm:w-[320px] sm:h-[320px] rounded-xl overflow-hidden shadow-inner bg-gray-50 dark:bg-black/40 flex items-center justify-center p-2">
          <canvas
            ref={canvasRef}
            className="w-full h-full object-contain drop-shadow-sm transition-transform duration-300 hover:scale-[1.02]"
          />
        </div>

        {/* Scan instruction */}
        <p className="mt-3 text-xs text-center text-gray-500 dark:text-gray-400 font-medium">
          {config.includeLogo ? "✨ Optimizado con Logo Oficial (Error Recovery High)" : "📱 Listo para escanear"}
        </p>
      </div>

      {/* Export & Actions Toolbar */}
      <div className="w-full max-w-sm flex flex-col gap-3">
        {/* Resolution selector + PNG Download */}
        <div className="flex items-center gap-2">
          <select
            value={downloadRes}
            onChange={(e) => setDownloadRes(Number(e.target.value))}
            className="px-3 py-2 text-xs font-semibold rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-[#FF97A4]"
            title="Resolución de exportación"
          >
            <option value={512}>512px (Web)</option>
            <option value={1024}>1024px (HD)</option>
            <option value={2048}>2048px (Imprenta)</option>
          </select>

          <button
            onClick={handleDownloadPng}
            disabled={isRendering}
            className="flex-1 py-2.5 px-4 bg-[#163422] hover:bg-[#1f4930] text-white rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all"
          >
            <Download className="w-4 h-4 text-[#FF97A4]" />
            Descargar PNG
          </button>
        </div>

        {/* Secondary buttons */}
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={handleDownloadSvg}
            className="py-2 px-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
            title="Descargar en formato vectorial SVG"
          >
            <Download className="w-3.5 h-3.5 text-gray-500" />
            SVG
          </button>

          <button
            onClick={handleCopyToClipboard}
            className="py-2 px-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
            title="Copiar imagen al portapapeles"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-500" />
                <span className="text-emerald-600 dark:text-emerald-400">¡Listo!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-gray-500" />
                Copiar
              </>
            )}
          </button>

          <button
            onClick={handlePrint}
            className="py-2 px-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
            title="Imprimir tarjeta rápida"
          >
            <Printer className="w-3.5 h-3.5 text-gray-500" />
            Imprimir
          </button>
        </div>
      </div>
    </div>
  );
}

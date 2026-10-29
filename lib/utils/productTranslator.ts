/**
 * Traductor Literal Ultrarrápido en Memoria (0 ms) para Descripciones Florales
 * y Características de Producto.
 *
 * Ejecuta en memoria RAM del servidor sin peticiones a APIs externas.
 */

const EXACT_PHRASE_TRANSLATIONS: Record<string, string> = {
  // Arreglos y Flores
  "rosas rojas premium de exportación": "Premium export-grade red roses",
  "rosas rojas de exportación": "Export-grade red roses",
  "rosas rojas": "Red roses",
  "rosas rosadas": "Pink roses",
  "rosas blancas": "White roses",
  "rosas amarillas": "Yellow roses",
  "rosas ecuatorianas seleccionadas a mano": "Hand-selected Ecuadorian roses",
  "flores 100% naturales de corte fresco": "100% natural fresh-cut flowers",
  "flores 100% frescas de corte diario": "100% fresh flowers with daily cut",
  "diseño exclusivo de alta costura": "Exclusive haute couture design",
  "diseño exclusivo elaborado por floristas maestros": "Exclusive design handcrafted by master florists",
  "bouquets monumentales y cajas couture": "Monumental bouquets and couture boxes",

  // Empaques y Presentaciones
  "caja cilíndrica de lujo con lazo de satén": "Luxury hatbox with satin ribbon",
  "caja cilíndrica de lujo": "Luxury hatbox",
  "caja de terciopelo couture": "Couture velvet box",
  "envoltorio coreano impermeable de alta costura": "Haute couture waterproof Korean wrapping",
  "papel de seda francés y listón importado": "French tissue paper and imported ribbon",
  "ramo de alta costura": "Haute couture bouquet",
  "base de cerámica importada": "Imported ceramic base",
  "florero de vidrio soplado": "Hand-blown glass vase",

  // Cuidados y Extras
  "tarjeta caligrafiada con dedicatoria personalizada": "Handwritten gift card with custom message",
  "tarjeta de regalo personalizada incluida": "Complimentary custom gift card included",
  "sobre lacrado con dedicatoria de lujo": "Sealed envelope with luxury dedication",
  "follaje fino de temporada y preservación en agua fresca": "Fine seasonal foliage and fresh water preservation",
  "follaje fino y preservación en agua fresca": "Fine foliage and fresh water preservation",
  "alimento floral y guía de cuidado para máxima duración": "Floral food and care guide for maximum longevity",
  "hidratación garantizada durante el traslado": "Guaranteed hydration during transit",

  // Logística y Entrega
  "entrega el mismo día en houston y área metropolitana": "Same-day delivery in Houston and metropolitan area",
  "entrega en vehículos climatizados con chofer de guante blanco": "Delivery in climate-controlled vehicles with white-glove driver",
  "confirmación fotográfica al momento de la entrega": "Photo confirmation upon delivery",
  "atención personalizada vía whatsapp": "Personalized support via WhatsApp",
};

const WORD_REPLACEMENTS: [RegExp, string][] = [
  [/\b(\d+)\s+rosas\s+rojas\b/gi, "$1 Red Roses"],
  [/\b(\d+)\s+rosas\s+frescas\b/gi, "$1 Fresh Roses"],
  [/\b(\d+)\s+rosas\b/gi, "$1 Roses"],
  [/\b(\d+)\s+tallos\b/gi, "$1 Stems"],
  [/\bmismo\s+d[ií]a\b/gi, "Same Day"],
  [/\bentrega\s+a\s+domicilio\b/gi, "Home Delivery"],
  [/\bárea\s+metropolitana\b/gi, "Metropolitan Area"],
  [/\bgratis\b/gi, "Free"],
  [/\bincluid[oa]\b/gi, "Included"],
  [/\balta\s+costura\b/gi, "Haute Couture"],
];

const FEATURE_LABEL_TRANSLATIONS: Record<string, string> = {
  "duración": "Longevity",
  "duracion": "Longevity",
  "origen": "Origin",
  "cuidados": "Care Instructions",
  "apertura": "Bloom Stage",
  "presentación": "Presentation",
  "presentacion": "Presentation",
  "flores en total": "Total Flowers",
  "entrega": "Delivery",
  "garantía": "Guarantee",
  "garantia": "Guarantee",
  "incluye": "Includes",
  "tamaño": "Dimensions",
  "tamano": "Dimensions",
  "aroma": "Fragrance",
  "calidad": "Quality",
};

/**
 * Traduce una etiqueta técnica de viñeta (feature label)
 */
export function translateFeatureLabel(label: string, isSpanish: boolean = false): string {
  if (isSpanish || !label) return label;
  const key = label.trim().toLowerCase();
  return FEATURE_LABEL_TRANSLATIONS[key] || label;
}

/**
 * Traduce una sola línea o frase floral literal
 */
export function translateFloralSentence(line: string, isSpanish: boolean = false): string {
  if (isSpanish || !line) return line;

  const trimmed = line.trim();
  const lower = trimmed.toLowerCase();

  // 1. Verificación directa en el mapa de frases exactas
  if (EXACT_PHRASE_TRANSLATIONS[lower]) {
    return EXACT_PHRASE_TRANSLATIONS[lower];
  }

  // 2. Reemplazos de palabras y cantidades estándar
  let result = trimmed;
  for (const [regex, replacement] of WORD_REPLACEMENTS) {
    result = result.replace(regex, replacement);
  }

  return result;
}

/**
 * Traduce una descripción completa de producto línea por línea
 */
export function translateProductDescription(description?: string, isSpanish: boolean = false): string {
  if (isSpanish || !description) return description || "";

  return description
    .split("\n")
    .map((line) => translateFloralSentence(line, isSpanish))
    .join("\n");
}

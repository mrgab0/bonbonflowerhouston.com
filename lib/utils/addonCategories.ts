/**
 * Utilidades para normalización y categorización estricta de Adicionales Concierge
 * (Peluches, Chocolates, Globos con Helio, Coronas, etc.)
 */

export const ADDON_CATEGORIES_ORDER = [
  "Chocolates & Dulces",
  "Peluches",
  "Globos con Helio",
  "Coronas & Joyería",
  "Personalización & Lazos",
  "Otros Adicionales",
] as const;

export function normalizeAddonCategory(addon: { name?: string; category?: string }): string {
  if (!addon) return "Otros Adicionales";
  const name = (addon.name || "").toLowerCase();
  const rawCat = (addon.category || "").toLowerCase();

  // 1. Globos con Helio (debe verificarse primero porque existen globos como 'Helium Balloons Teddy Brown Bear')
  if (
    name.includes("balloon") ||
    name.includes("globo") ||
    name.includes("helium") ||
    name.includes("helio") ||
    rawCat.includes("globo")
  ) {
    return "Globos con Helio";
  }

  // 2. Chocolates & Dulces
  if (
    name.includes("ferrero") ||
    name.includes("chocolate") ||
    name.includes("rocher") ||
    name.includes("dulce") ||
    name.includes("candy") ||
    name.includes("bombón") ||
    name.includes("bombon") ||
    rawCat.includes("chocolate") ||
    rawCat.includes("dulce")
  ) {
    return "Chocolates & Dulces";
  }

  // 3. Peluches
  if (
    name.includes("teddy") ||
    name.includes("peluche") ||
    name.includes("bear") ||
    name.includes("oso") ||
    rawCat.includes("peluche")
  ) {
    return "Peluches";
  }

  // 4. Coronas & Joyería
  if (
    name.includes("crown") ||
    name.includes("corona") ||
    name.includes("tiara") ||
    name.includes("tiadem") ||
    rawCat.includes("corona")
  ) {
    return "Coronas & Joyería";
  }

  // 5. Personalización & Lazos
  if (
    name.includes("liston") ||
    name.includes("listón") ||
    name.includes("tarjeta") ||
    name.includes("mensaje") ||
    name.includes("dedicatoria") ||
    name.includes("ribbon") ||
    rawCat.includes("tarjeta") ||
    rawCat.includes("personaliz") ||
    rawCat.includes("lazo")
  ) {
    return "Personalización & Lazos";
  }

  return addon.category && addon.category !== "Otros" ? addon.category : "Otros Adicionales";
}

export function normalizeAddon<T extends { name?: string; category?: string }>(addon: T): T {
  if (!addon) return addon;
  return {
    ...addon,
    category: normalizeAddonCategory(addon),
  };
}

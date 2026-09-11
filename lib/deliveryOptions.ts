export interface DeliveryOption {
  id: string;
  title: string;
  description: string;
  estimatedTimeMinutes: number; // Para calculo o orden
  estimatedTimeLabel: string;
  extraPrice: number; // Precio adicional base en $ USD
  pricePerMile: number; // Costo por milla en $ USD
  badge?: string;
  iconName: string;
  isActive: boolean;
}

export const DEFAULT_DELIVERY_OPTIONS: DeliveryOption[] = [
  {
    id: "vip_30min",
    title: "Entrega Express VIP ⚡",
    description: "Entrega prioritaria directa en menos de 30 a 45 minutos.",
    estimatedTimeMinutes: 30,
    estimatedTimeLabel: "30 - 45 Minutos",
    extraPrice: 15.00,
    pricePerMile: 3.00,
    badge: "Ultra Rápido ⚡",
    iconName: "Zap",
    isActive: true,
  },
  {
    id: "express_60min",
    title: "Entrega Rápida Prioritaria 🚀",
    description: "Despacho prioritario en 1 hora aproximadamente.",
    estimatedTimeMinutes: 60,
    estimatedTimeLabel: "1 Hora",
    extraPrice: 10.00,
    pricePerMile: 2.00,
    badge: "Recomendado 🔥",
    iconName: "Rocket",
    isActive: true,
  },
  {
    id: "standard_3h",
    title: "Entrega Estándar 🚚",
    description: "Envío regular garantizado en un rango de 3 horas.",
    estimatedTimeMinutes: 180,
    estimatedTimeLabel: "3 Horas",
    extraPrice: 5.00,
    pricePerMile: 1.25,
    badge: "Popular",
    iconName: "Truck",
    isActive: true,
  },
  {
    id: "scheduled_morning",
    title: "Entrega Programada (Mañana) ☀️",
    description: "Entrega agendada en turno mañana (8:00 AM - 12:00 PM).",
    estimatedTimeMinutes: 720,
    estimatedTimeLabel: "Turno Mañana (8am - 12pm)",
    extraPrice: 0.00,
    pricePerMile: 1.00,
    badge: "Económico 🌿",
    iconName: "Sun",
    isActive: true,
  },
  {
    id: "scheduled_afternoon",
    title: "Entrega Programada (Tarde) 🌆",
    description: "Entrega agendada en turno tarde (1:00 PM - 6:00 PM).",
    estimatedTimeMinutes: 1080,
    estimatedTimeLabel: "Turno Tarde (1pm - 6pm)",
    extraPrice: 0.00,
    pricePerMile: 1.00,
    badge: "Estándar Gratis",
    iconName: "Clock",
    isActive: true,
  },
  {
    id: "night_surprise",
    title: "Entrega Nocturna / Sorpresa 🌙",
    description: "Despacho especial nocturno para sorpresas (8:00 PM - 10:00 PM).",
    estimatedTimeMinutes: 1200,
    estimatedTimeLabel: "Nocturno (8pm - 10pm)",
    extraPrice: 12.00,
    pricePerMile: 2.50,
    badge: "Especial 🎁",
    iconName: "Moon",
    isActive: true,
  },
  {
    id: "pickup",
    title: "Retiro en Tienda Boutique 🏬",
    description: "Retira personalmente en nuestra sede boutique sin costo adicional.",
    estimatedTimeMinutes: 0,
    estimatedTimeLabel: "Retiro Inmediato",
    extraPrice: 0.00,
    pricePerMile: 0.00,
    badge: "Sin Costo de Envío",
    iconName: "Store",
    isActive: true,
  },
];

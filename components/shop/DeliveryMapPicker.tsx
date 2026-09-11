"use client";

import { useState, useEffect, useRef } from "react";
import { MapPin, Navigation, Search, CheckCircle2, AlertCircle, Compass } from "lucide-react";

interface DeliveryMapPickerProps {
  initialAddress: string;
  storeLat?: number;
  storeLng?: number;
  onLocationChange: (data: {
    address: string;
    lat: number;
    lng: number;
    distanceMiles: number;
    googleMapsUrl: string;
  }) => void;
}

// Coordenadas del punto de partida de la boutique matriz (4201 Fairmont Pkwy, Pasadena, TX 77504)
const DEFAULT_STORE_LAT = 29.6521;
const DEFAULT_STORE_LNG = -95.1706;

// Cálculo de Distancia Haversine corregida por factor terrestre de carretera (x 1.25)
function calculateHaversineMiles(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 3958.8; // Radio terrestre en millas
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const straightMiles = R * c;

  // Factor de curvatura de carretera (vías urbanas/autopistas ~1.25 de recorrido real)
  return Math.round(straightMiles * 1.25 * 10) / 10;
}

export function DeliveryMapPicker({
  initialAddress,
  storeLat = DEFAULT_STORE_LAT,
  storeLng = DEFAULT_STORE_LNG,
  onLocationChange,
}: DeliveryMapPickerProps) {
  const [addressInput, setAddressInput] = useState(initialAddress || "");
  const [lat, setLat] = useState<number>(DEFAULT_STORE_LAT + 0.05);
  const [lng, setLng] = useState<number>(DEFAULT_STORE_LNG + 0.05);
  
  const [searching, setSearching] = useState(false);
  const [geocodedSuccess, setGeocodedSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [distanceMiles, setDistanceMiles] = useState<number>(0);
  const lastGeocodedRef = useRef<string>("");

  useEffect(() => {
    if (initialAddress && initialAddress !== addressInput) {
      setAddressInput(initialAddress);
      geocodeAddress(initialAddress);
    }
  }, [initialAddress]);

  // Geocodificación Automática Debounced mientras el cliente escribe o pega la dirección
  useEffect(() => {
    if (!addressInput || addressInput.trim().length < 5) return;
    if (addressInput.trim() === lastGeocodedRef.current) return;

    const timer = setTimeout(() => {
      geocodeAddress(addressInput);
    }, 800);

    return () => clearTimeout(timer);
  }, [addressInput]);

  const updateParent = (newAddress: string, newLat: number, newLng: number) => {
    const miles = calculateHaversineMiles(storeLat, storeLng, newLat, newLng);
    setDistanceMiles(miles);
    const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${newLat},${newLng}`;

    onLocationChange({
      address: newAddress,
      lat: newLat,
      lng: newLng,
      distanceMiles: miles,
      googleMapsUrl,
    });
  };

  // Geocoding multinivel con fallbacks inteligentes para Houston, TX y Zip Codes
  const geocodeAddress = async (queryText?: string) => {
    const rawText = queryText || addressInput;
    if (!rawText || !rawText.trim()) return;

    const cleanInput = rawText
      .replace(/EE\.?\s*UU\.?/gi, "USA")
      .replace(/EEUU/gi, "USA")
      .trim();

    lastGeocodedRef.current = rawText.trim();
    setSearching(true);
    setErrorMsg("");
    setGeocodedSuccess(false);

    // Preparar variaciones de búsqueda de más específica a más general
    const searchQueries: string[] = [];

    // Variación 1: Dirección completa con Houston, TX
    if (!cleanInput.toLowerCase().includes("houston")) {
      searchQueries.push(`${cleanInput}, Houston, TX, USA`);
    } else {
      searchQueries.push(`${cleanInput}, USA`);
    }

    // Variación 2: Sin número de casa si el número no figura aún en OpenStreetMap (ej: "Kyler Oaks Pl, 77043, Houston, TX")
    const withoutHouseNum = cleanInput.replace(/^\d+\s+/, "");
    if (withoutHouseNum !== cleanInput) {
      searchQueries.push(`${withoutHouseNum}, Houston, TX, USA`);
    }

    // Variación 3: Extraer Código Postal ZIP si está presente (ej: "77043, Houston, TX")
    const zipMatch = cleanInput.match(/\b(77\d{3})\b/);
    if (zipMatch) {
      searchQueries.push(`${zipMatch[1]}, Houston, TX, USA`);
    }

    try {
      const viewboxStr = `${storeLng - 1.2},${storeLat + 1.2},${storeLng + 1.2},${storeLat - 1.2}`;
      let foundData: any = null;

      for (const query of searchQueries) {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
            query
          )}&limit=1&viewbox=${viewboxStr}`,
          {
            headers: {
              "Accept-Language": "es,en",
            },
          }
        );
        const data = await res.json();
        if (data && data.length > 0) {
          foundData = data[0];
          break;
        }
      }

      if (foundData) {
        let foundLat = parseFloat(foundData.lat);
        let foundLng = parseFloat(foundData.lon);
        let miles = calculateHaversineMiles(storeLat, storeLng, foundLat, foundLng);

        // Si la distancia supera 120 millas por desvío fuera de Houston, forzar delimitación estricta
        if (miles > 120) {
          const strictRes = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
              cleanInput + ", Houston, TX"
            )}&limit=1&viewbox=${viewboxStr}&bounded=1`,
            {
              headers: { "Accept-Language": "es,en" },
            }
          );
          const strictData = await strictRes.json();
          if (strictData && strictData.length > 0) {
            foundLat = parseFloat(strictData[0].lat);
            foundLng = parseFloat(strictData[0].lon);
            miles = calculateHaversineMiles(storeLat, storeLng, foundLat, foundLng);
          }
        }

        setLat(foundLat);
        setLng(foundLng);
        setGeocodedSuccess(true);
        updateParent(rawText, foundLat, foundLng);
      } else {
        // Si no se pudo ubicar en el mapa, establecer una estimación aproximada por defecto en el área metropolitana
        setErrorMsg("No encontramos la dirección exacta en el GPS. Por favor revisa el texto o usa 'Usar Mi Ubicación Actual'.");
        updateParent(rawText, storeLat, storeLng);
      }
    } catch (err) {
      console.error("Error geocodificando dirección:", err);
      updateParent(rawText, storeLat, storeLng);
    } finally {
      setSearching(false);
    }
  };

  // Detectar ubicación GPS actual del dispositivo del cliente
  const handleUseCurrentGPS = () => {
    if (!navigator.geolocation) {
      setErrorMsg("Tu navegador no soporta geolocalización GPS.");
      return;
    }

    setSearching(true);
    setErrorMsg("");

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const userLat = pos.coords.latitude;
        const userLng = pos.coords.longitude;
        setLat(userLat);
        setLng(userLng);

        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${userLat}&lon=${userLng}`
          );
          const data = await res.json();
          const gpsAddr = data.display_name || `Ubicación GPS (${userLat.toFixed(4)}, ${userLng.toFixed(4)})`;
          setAddressInput(gpsAddr);
          setGeocodedSuccess(true);
          updateParent(gpsAddr, userLat, userLng);
        } catch {
          const fallback = `Ubicación GPS (${userLat.toFixed(4)}, ${userLng.toFixed(4)})`;
          setAddressInput(fallback);
          updateParent(fallback, userLat, userLng);
        } finally {
          setSearching(false);
        }
      },
      (err) => {
        setSearching(false);
        setErrorMsg("No se pudo obtener el GPS. Por favor escribe tu dirección.");
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const mapIframeUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${lng - 0.03}%2C${lat - 0.03}%2C${lng + 0.03}%2C${lat + 0.03}&layer=mapnik&marker=${lat}%2C${lng}`;

  return (
    <div className="space-y-4 bg-gray-50/70 dark:bg-gray-900/50 p-5 rounded-2xl border border-gray-200 dark:border-gray-800">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b pb-3 border-gray-200 dark:border-gray-800">
        <label className="text-xs font-extrabold uppercase tracking-wider text-gray-900 dark:text-white flex items-center gap-1.5">
          <MapPin size={16} className="text-[#FF97A4]" /> Dirección y Ubicación en Mapa para Entrega
        </label>
        
        <button
          type="button"
          onClick={handleUseCurrentGPS}
          disabled={searching}
          className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1.5"
        >
          <Navigation size={13} />
          {searching ? "Detectando GPS..." : "Usar Mi Ubicación Actual (GPS)"}
        </button>
      </div>

      {/* Campo de texto de Dirección con Geocodificación Automática */}
      <div className="space-y-1.5">
        <div className="relative">
          <input
            type="text"
            name="address"
            value={addressInput}
            onChange={(e) => {
              setAddressInput(e.target.value);
            }}
            onBlur={() => geocodeAddress()}
            placeholder="Ej: 10827 Kyler Oaks Pl, Houston, TX 77043"
            className="w-full p-3.5 pr-24 border border-gray-300 dark:border-gray-700 rounded-2xl text-sm font-semibold text-gray-900 dark:text-white bg-white dark:bg-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FF97A4]"
            required
          />
          <button
            type="button"
            onClick={() => geocodeAddress()}
            disabled={searching}
            className="absolute right-2 top-2 bottom-2 px-3 bg-[#1A1C1C] text-white rounded-xl text-xs font-bold hover:bg-black transition-colors flex items-center gap-1"
          >
            <Search size={14} />
            {searching ? "Buscando..." : "Ubicar GPS"}
          </button>
        </div>

        {geocodedSuccess && (
          <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-900/50 text-[11px] font-bold text-emerald-800 dark:text-emerald-300 flex items-center justify-between">
            <span className="flex items-center gap-1">
              <CheckCircle2 size={14} className="text-emerald-600" /> Dirección localizada en mapa de Houston
            </span>
            <span className="bg-emerald-600 text-white px-2.5 py-0.5 rounded-full text-[10px]">
              📍 {distanceMiles} Millas desde Boutique
            </span>
          </div>
        )}

        {errorMsg && (
          <p className="text-[11px] font-bold text-red-500 flex items-center gap-1 pt-0.5">
            <AlertCircle size={13} /> {errorMsg}
          </p>
        )}
      </div>

      {/* Visor de Mapa Interactivo con Marcador de Entrega */}
      <div className="space-y-2">
        <div className="relative rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-800 shadow-sm h-48 bg-gray-100">
          <iframe
            title="Mapa de Entrega"
            width="100%"
            height="100%"
            frameBorder="0"
            scrolling="no"
            src={mapIframeUrl}
            className="w-full h-full"
          ></iframe>

          {/* Badge flotante de millas sobre el mapa */}
          <div className="absolute top-3 right-3 bg-white/95 dark:bg-gray-900/95 text-gray-900 dark:text-white backdrop-blur-md px-3 py-1.5 rounded-full border border-gray-200 dark:border-gray-700 shadow-md flex items-center gap-1.5 text-xs font-black">
            <Compass size={14} className="text-[#FF97A4]" />
            <span>{distanceMiles > 0 ? `📍 ${distanceMiles} Millas desde Boutique` : "📍 Escribe la dirección para calcular millas"}</span>
          </div>
        </div>

        <p className="text-[11px] font-semibold text-gray-700 dark:text-gray-200 italic">
          💡 Las millas calculadas se aplican automáticamente al costo de entrega según la opción elegida.
        </p>
      </div>
    </div>
  );
}

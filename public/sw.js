const CACHE_NAME = "bonbonflowers-v3";
const STATIC_ASSETS = [
  "/manifest.json",
  "/logo.png",
  "/logo-brand.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

// Network-first para navegación HTML y cache-first para assets estáticos
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  const url = new URL(event.request.url);
  // No cachear llamadas dinámicas de API ni del panel administrativo
  if (url.pathname.startsWith("/api") || url.pathname.startsWith("/admin")) {
    return;
  }

  // 1. Para navegación entre páginas: Siempre Network-First (fresco de Vercel)
  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response && response.status === 200) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseClone);
            });
          }
          return response;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  // 2. Para assets estáticos: Cache con revalidación
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request).then((response) => {
        if (response && response.status === 200 && response.type === "basic") {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return response;
      });
    })
  );
});

// ==========================================
// 🔔 EVENTO WEB PUSH (ALERTA DE VENTAS)
// Funciona en iPhone (iOS 16.4+) y Android incluso con pantalla bloqueada
// ==========================================
self.addEventListener("push", (event) => {
  let data = {};
  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data = { body: event.data.text() };
    }
  }

  const title = data.title || "🌸 ¡Nueva Venta en Bonbon Flowers!";
  const options = {
    body: data.body || "Se ha recibido una nueva orden en la tienda.",
    icon: "/logo.png", // Logotipo oficial Bonbon Flowers
    badge: "/logo.png",
    image: data.image || undefined,
    tag: data.tag || `sale-${Date.now()}`,
    data: data.url || "/admin/ordenes",
    requireInteraction: true,
    vibrate: [300, 150, 300, 150, 300],
    actions: [
      { action: "view", title: "Ver Pedido 🛍️" }
    ]
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// Al pulsar sobre la notificación en el teléfono
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const targetUrl = event.notification.data || "/admin/ordenes";

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((windowClients) => {
      for (const client of windowClients) {
        if (client.url.includes("/admin") && "focus" in client) {
          client.navigate(targetUrl);
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});

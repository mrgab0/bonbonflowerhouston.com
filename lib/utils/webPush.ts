import * as crypto from "crypto";
import dbConnect from "@/lib/db";
import { SiteConfig } from "@/lib/models/SiteConfig";
import { PushSubscription } from "@/lib/models/PushSubscription";

export interface VapidKeys {
  publicKey: string; // Base64URL 87 chars P-256
  privateKey: string; // Base64URL 43 chars
}

export interface WebPushPayload {
  title: string;
  body: string;
  url?: string;
  icon?: string;
  badge?: string;
  tag?: string;
  orderId?: string;
}

/**
 * Obtiene las llaves VAPID existentes o genera unas nuevas permanentes
 */
export async function getOrGenerateVapidKeys(): Promise<VapidKeys> {
  // 1. Variables de entorno (si están definidas)
  if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
    return {
      publicKey: process.env.VAPID_PUBLIC_KEY.trim(),
      privateKey: process.env.VAPID_PRIVATE_KEY.trim(),
    };
  }

  // 2. Base de datos SiteConfig
  await dbConnect();
  const config: any = await SiteConfig.findOne({ key: "global" }).lean();
  if (config?.vapidPublicKey && config?.vapidPrivateKey) {
    return {
      publicKey: config.vapidPublicKey,
      privateKey: config.vapidPrivateKey,
    };
  }

  // 3. Generación automática y almacenamiento permanente
  const ecdh = crypto.createECDH("prime256v1");
  ecdh.generateKeys();
  const publicKey = ecdh.getPublicKey("base64url");
  const privateKey = ecdh.getPrivateKey("base64url");

  await SiteConfig.findOneAndUpdate(
    { key: "global" },
    {
      $set: {
        vapidPublicKey: publicKey,
        vapidPrivateKey: privateKey,
        updatedAt: new Date(),
      },
    },
    { upsert: true }
  );

  return { publicKey, privateKey };
}

/**
 * Cifra la carga útil usando RFC 8291 (AES-128-GCM con ECDH en P-256)
 */
function encryptWebPushPayload(
  payloadText: string,
  clientP256dhBase64: string,
  clientAuthBase64: string
): Buffer {
  const clientPublicKey = Buffer.from(clientP256dhBase64, "base64url");
  const clientAuth = Buffer.from(clientAuthBase64, "base64url");

  const serverEcdh = crypto.createECDH("prime256v1");
  const serverPublicKey = serverEcdh.generateKeys(); // 65 bytes
  const sharedSecret = serverEcdh.computeSecret(clientPublicKey);

  const salt = crypto.randomBytes(16);

  // 1. HKDF info para PRK
  const keyInfo = Buffer.concat([
    Buffer.from("WebPush: info\0", "utf8"),
    clientPublicKey,
    serverPublicKey,
  ]);
  const ikm = Buffer.from(crypto.hkdfSync("sha256", sharedSecret, clientAuth, keyInfo, 32));

  // 2. Clave CEK y Nonce
  const cekInfo = Buffer.from("Content-Encoding: aes128gcm\0", "utf8");
  const cek = Buffer.from(crypto.hkdfSync("sha256", ikm, salt, cekInfo, 16));

  const nonceInfo = Buffer.from("Content-Encoding: nonce\0", "utf8");
  const nonce = Buffer.from(crypto.hkdfSync("sha256", ikm, salt, nonceInfo, 12));

  // 3. Cifrado AES-128-GCM con padding de fin de registro (0x02)
  const plaintext = Buffer.concat([Buffer.from(payloadText, "utf8"), Buffer.from([2])]);
  const cipher = crypto.createCipheriv("aes-128-gcm", cek, nonce);
  const ciphertext = Buffer.concat([cipher.update(plaintext), cipher.final()]);
  const tag = cipher.getAuthTag();

  // 4. Cabecera binaria RFC 8291
  const rs = Buffer.alloc(4);
  rs.writeUInt32BE(4096, 0);
  const idlen = Buffer.from([serverPublicKey.length]);

  return Buffer.concat([salt, rs, idlen, serverPublicKey, ciphertext, tag]);
}

/**
 * Genera el JWT VAPID (RFC 8292) para autorizar el envío ante Apple APNs y Google FCM
 */
function createVapidJwt(endpoint: string, privateKeyBase64url: string, publicKeyBase64url: string): string {
  const url = new URL(endpoint);
  const audience = `${url.protocol}//${url.host}`;
  const subject = "mailto:orders@bonbonflowershouston.com";

  // Reconstruir la clave privada JWK a formato nativo CryptoKey
  const pubBuf = Buffer.from(publicKeyBase64url, "base64url");
  const x = pubBuf.subarray(1, 33).toString("base64url");
  const y = pubBuf.subarray(33, 65).toString("base64url");

  const jwk = {
    kty: "EC",
    crv: "P-256",
    d: privateKeyBase64url,
    x,
    y,
  };

  const keyObject = crypto.createPrivateKey({ key: jwk, format: "jwk" });

  const header = Buffer.from(JSON.stringify({ typ: "JWT", alg: "ES256" })).toString("base64url");
  const now = Math.floor(Date.now() / 1000);
  const payload = Buffer.from(
    JSON.stringify({
      aud: audience,
      exp: now + 12 * 3600,
      sub: subject,
    })
  ).toString("base64url");

  const unsignedToken = `${header}.${payload}`;
  const signature = crypto
    .sign("SHA256", Buffer.from(unsignedToken), {
      key: keyObject,
      dsaEncoding: "ieee-p1363",
    })
    .toString("base64url");

  return `${unsignedToken}.${signature}`;
}

/**
 * Envía una notificación Web Push a un suscriptor específico
 */
export async function sendSingleWebPush(
  subscription: { endpoint: string; keys: { p256dh: string; auth: string } },
  payload: WebPushPayload
): Promise<boolean> {
  try {
    const vapid = await getOrGenerateVapidKeys();
    const jwt = createVapidJwt(subscription.endpoint, vapid.privateKey, vapid.publicKey);

    // Asegurar que siempre viaje con el logo oficial de Bonbon Flowers
    const finalPayload: WebPushPayload = {
      ...payload,
      icon: payload.icon || "https://bonbonflowershouston.com/logo.png",
      badge: payload.badge || "https://bonbonflowershouston.com/logo.png",
    };

    const payloadJson = JSON.stringify(finalPayload);
    const encryptedBody = encryptWebPushPayload(
      payloadJson,
      subscription.keys.p256dh,
      subscription.keys.auth
    );

    const res = await fetch(subscription.endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/octet-stream",
        "Content-Encoding": "aes128gcm",
        TTL: "86400",
        Urgency: "high",
        Authorization: `vapid t=${jwt}, k=${vapid.publicKey}`,
      },
      body: encryptedBody as any,
    });

    if (res.status === 410 || res.status === 404) {
      // La suscripción expiró o fue eliminada por el usuario en su teléfono
      await dbConnect();
      await PushSubscription.deleteOne({ endpoint: subscription.endpoint });
      return false;
    }

    return res.ok;
  } catch (error) {
    console.error("Error enviando Web Push:", error);
    return false;
  }
}

/**
 * Transmite la alerta de nueva venta a todos los administradores suscritos (iPhone / Android / Desktop)
 */
export async function broadcastSalesAlertToAdmins(orderData: any) {
  try {
    await dbConnect();
    const subscriptions = await PushSubscription.find({ role: "admin" }).lean();
    if (!subscriptions || subscriptions.length === 0) return;

    const itemsDesc = (orderData?.items || [])
      .map((item: any) => `${item.quantity}x ${item.name}`)
      .join(", ");

    const total = Number(orderData?.total || 0).toFixed(2);
    const customer = orderData?.customerName || "Cliente";
    const orderId = orderData?.orderId || "Nueva Orden";

    const payload: WebPushPayload = {
      title: "🌸 ¡Nueva Venta en Bonbon Flowers!",
      body: `Orden #${orderId} • $${total} USD\nCliente: ${customer}\n${itemsDesc.slice(0, 90)}`,
      url: `/admin/ordenes`,
      icon: "https://bonbonflowershouston.com/logo.png",
      badge: "https://bonbonflowershouston.com/logo.png",
      tag: `order-${orderId}`,
      orderId,
    };

    await Promise.allSettled(
      subscriptions.map((sub: any) =>
        sendSingleWebPush(
          {
            endpoint: sub.endpoint,
            keys: {
              p256dh: sub.keys.p256dh,
              auth: sub.keys.auth,
            },
          },
          payload
        )
      )
    );
  } catch (error) {
    console.error("Error transmitiendo Web Push a administradores:", error);
  }
}

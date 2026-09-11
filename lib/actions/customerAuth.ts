"use server";

import dbConnect from "@/lib/db";
import { Customer } from "@/lib/models/Customer";
import {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse
} from "@simplewebauthn/server";

const RP_NAME = "Gabriela's Flowers LLC";

function resolveRpID(domainFromClient?: string) {
  if (domainFromClient && domainFromClient.trim()) {
    // Extraer solo el hostname sin puerto ni protocolo
    return domainFromClient.replace(/https?:\/\//, "").split(":")[0].split("/")[0];
  }
  if (process.env.VERCEL_URL) {
    return process.env.VERCEL_URL.replace(/https?:\/\//, "").split(":")[0].split("/")[0];
  }
  return "localhost";
}

function resolveOrigin(domainFromClient?: string) {
  if (domainFromClient && domainFromClient.trim()) {
    const cleanDomain = domainFromClient.replace(/\/$/, "");
    return cleanDomain.startsWith("http") ? cleanDomain : `https://${cleanDomain}`;
  }
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL.replace(/https?:\/\//, "")}`;
  }
  return "http://localhost:3000";
}

export async function generatePasskeyRegistrationOptionsAction(email: string, clientHostname?: string) {
  try {
    await dbConnect();
    const cleanEmail = email.toLowerCase().trim();

    let customer = await Customer.findOne({ email: cleanEmail });
    if (!customer) {
      customer = await Customer.create({ email: cleanEmail, passkeys: [] });
    }

    const rpID = resolveRpID(clientHostname);

    const options = await generateRegistrationOptions({
      rpName: RP_NAME,
      rpID: rpID,
      userID: Buffer.from(customer._id.toString()) as any,
      userName: cleanEmail,
      userDisplayName: customer.name || cleanEmail,
      attestationType: "none",
      excludeCredentials: customer.passkeys.map((pk: any) => ({
        id: pk.credentialID,
        type: "public-key"
      })),
      authenticatorSelection: {
        residentKey: "preferred",
        userVerification: "preferred",
        authenticatorAttachment: "platform" // Forzar sensor de huella/FaceID físico del dispositivo
      }
    });

    customer.currentChallenge = options.challenge;
    await customer.save();

    return { success: true, options, rpID };
  } catch (error) {
    console.error("Error generando opciones de registro WebAuthn:", error);
    return { success: false, error: "No se pudieron preparar las opciones biométricas." };
  }
}

export async function verifyPasskeyRegistrationAction(email: string, responseBody: any, clientHostname?: string) {
  try {
    await dbConnect();
    const cleanEmail = email.toLowerCase().trim();
    const customer = await Customer.findOne({ email: cleanEmail });

    if (!customer || !customer.currentChallenge) {
      return { success: false, error: "Sesión de verificación biométrica expira." };
    }

    const rpID = resolveRpID(clientHostname);
    const origin = resolveOrigin(clientHostname);

    const verification = await verifyRegistrationResponse({
      response: responseBody,
      expectedChallenge: customer.currentChallenge,
      expectedOrigin: origin,
      expectedRPID: rpID
    });

    if (verification.verified && verification.registrationInfo) {
      const regInfo = verification.registrationInfo;

      const credentialID = typeof regInfo.credentialID === "string" 
        ? regInfo.credentialID 
        : Buffer.from(regInfo.credentialID).toString("base64");

      const publicKey = typeof regInfo.credentialPublicKey === "string"
        ? regInfo.credentialPublicKey
        : Buffer.from(regInfo.credentialPublicKey).toString("base64");

      customer.passkeys.push({
        credentialID: credentialID,
        publicKey: publicKey,
        counter: regInfo.counter,
        deviceType: regInfo.credentialDeviceType || "singleDevice",
        backedUp: regInfo.credentialBackedUp || false,
        transports: responseBody.response?.transports || ["internal"],
        createdAt: new Date()
      });

      customer.currentChallenge = "";
      await customer.save();

      return {
        success: true,
        customer: {
          email: customer.email,
          name: customer.name,
          phone: customer.phone,
          address: customer.address
        }
      };
    }

    return { success: false, error: "La huella/biometría no pudo ser validada." };
  } catch (error) {
    console.error("Error verificando registro WebAuthn:", error);
    return { success: false, error: "Fallo en la validación de huella." };
  }
}

export async function generatePasskeyAuthenticationOptionsAction(email: string, clientHostname?: string) {
  try {
    await dbConnect();
    const cleanEmail = email.toLowerCase().trim();
    const customer = await Customer.findOne({ email: cleanEmail });

    if (!customer || !customer.passkeys || customer.passkeys.length === 0) {
      return {
        success: false,
        error: "No tienes una huella o Face ID registrado en esta cuenta. Toca 'Registrar Mi Huella' para configurarla.",
        needRegistration: true
      };
    }

    const rpID = resolveRpID(clientHostname);

    const options = await generateAuthenticationOptions({
      rpID: rpID,
      allowCredentials: customer.passkeys.map((pk: any) => ({
        id: pk.credentialID,
        type: "public-key",
        transports: pk.transports || ["internal"]
      })),
      userVerification: "preferred"
    });

    customer.currentChallenge = options.challenge;
    await customer.save();

    return { success: true, options, rpID };
  } catch (error) {
    console.error("Error generando opciones de autenticación WebAuthn:", error);
    return { success: false, error: "Error al preparar inicio por huella." };
  }
}

export async function verifyPasskeyAuthenticationAction(email: string, responseBody: any, clientHostname?: string) {
  try {
    await dbConnect();
    const cleanEmail = email.toLowerCase().trim();
    const customer = await Customer.findOne({ email: cleanEmail });

    if (!customer || !customer.currentChallenge) {
      return { success: false, error: "Desafío de autenticación no válido." };
    }

    const passkey = customer.passkeys.find((pk: any) => pk.credentialID === responseBody.id);
    if (!passkey) {
      return { success: false, error: "Credencial biométrica no encontrada en este dispositivo." };
    }

    const rpID = resolveRpID(clientHostname);
    const origin = resolveOrigin(clientHostname);

    const opts: any = {
      response: responseBody,
      expectedChallenge: customer.currentChallenge,
      expectedOrigin: origin,
      expectedRPID: rpID,
      credential: {
        id: passkey.credentialID,
        publicKey: new Uint8Array(Buffer.from(passkey.publicKey, "base64")),
        counter: passkey.counter
      }
    };

    const verification = await verifyAuthenticationResponse(opts);

    if (verification.verified) {
      passkey.counter = verification.authenticationInfo.newCounter;
      customer.currentChallenge = "";
      await customer.save();

      return {
        success: true,
        customer: {
          email: customer.email,
          name: customer.name,
          phone: customer.phone,
          address: customer.address
        }
      };
    }

    return { success: false, error: "Verificación de huella / Face ID fallida." };
  } catch (error) {
    console.error("Error autenticando con Passkey:", error);
    return { success: false, error: "No se pudo autenticar la huella." };
  }
}

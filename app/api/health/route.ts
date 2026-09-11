import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import mongoose from "mongoose";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  const startTime = Date.now();
  let dbStatus = "disconnected";
  let dbLatency = 0;

  try {
    const dbStart = Date.now();
    await dbConnect();
    
    // Verificar si mongoose está conectado y responder con un ping rápido
    if (mongoose.connection.readyState === 1 && mongoose.connection.db) {
      await mongoose.connection.db.admin().ping();
      dbStatus = "connected";
      dbLatency = Date.now() - dbStart;
    } else {
      dbStatus = "connecting_or_error";
    }
  } catch (error: any) {
    console.error("Health Check DB Error:", error);
    dbStatus = `error: ${error.message || "failed to connect"}`;
  }

  const isHealthy = dbStatus === "connected";
  const totalLatency = Date.now() - startTime;

  const healthData = {
    status: isHealthy ? "healthy" : "unhealthy",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "production",
    services: {
      webServer: {
        status: "up",
        platform: "Vercel / Next.js",
        latencyMs: totalLatency,
      },
      database: {
        provider: "MongoDB Atlas",
        status: dbStatus,
        latencyMs: dbLatency,
      }
    }
  };

  return NextResponse.json(healthData, {
    status: isHealthy ? 200 : 503,
    headers: {
      "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
      "Content-Type": "application/json",
      "X-Robots-Tag": "noindex, nofollow"
    }
  });
}

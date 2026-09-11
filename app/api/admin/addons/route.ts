import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import { Addon } from "@/lib/models/Addon";

export async function GET() {
  try {
    await dbConnect();
    const addons = await Addon.find({}).sort({ category: 1, createdAt: -1 }).lean();
    return NextResponse.json({ addons: JSON.parse(JSON.stringify(addons)) });
  } catch (error) {
    console.error("Error obteniendo adicionales admin:", error);
    return NextResponse.json({ error: "Error al obtener adicionales" }, { status: 500 });
  }
}

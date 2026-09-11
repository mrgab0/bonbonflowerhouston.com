import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import { Product } from "@/lib/models/Product";

export async function GET() {
  try {
    await dbConnect();
    const products = await Product.find({}).sort({ createdAt: -1 }).lean();
    return NextResponse.json({ products: JSON.parse(JSON.stringify(products)) });
  } catch (error) {
    console.error("Error obteniendo productos:", error);
    return NextResponse.json({ error: "Error al obtener productos" }, { status: 500 });
  }
}

"use server";

import dbConnect from "@/lib/db";
import { Product, slugify } from "@/lib/models/Product";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

// --- PRODUCT ACTIONS ---

export async function createProduct(formData: FormData) {
  try {
    await dbConnect();
    const name = formData.get("name") as string;
    const price = parseFloat(formData.get("price") as string);
    const category = formData.get("category") as string;
    const description = formData.get("description") as string;
    const images = (formData.getAll("images") as string[]).filter((img) => img && typeof img === 'string' && img.trim() !== "");
    const stock = parseInt(formData.get("stock") as string) || 0;
    const sku = formData.get("sku") as string || "";
    
    // Nuevos campos
    const flowerCount = parseInt(formData.get("flowerCount") as string) || 0;
    const bouquetType = formData.get("bouquetType") as string || "";
    const badge = formData.get("badge") as string || "";
    const addonsRaw = formData.getAll("addons") as string[];
    const addons = addonsRaw.filter((a) => a && typeof a === 'string' && a.trim() !== "");

    // Procesar características
    const featureLabels = formData.getAll("featureLabels") as string[];
    const featureValues = formData.getAll("featureValues") as string[];
    const features = featureLabels
      .map((label, index) => ({ label, value: featureValues[index] }))
      .filter(f => f.label && f.value);

    // Evitar colisiones de Slug
    const baseSlug = slugify(name);
    const existingProduct = await Product.findOne({ slug: baseSlug });
    const slug = existingProduct
      ? slugify(`${name}-${Math.floor(Math.random() * 1000)}`)
      : baseSlug;

    const newProduct = new Product({
      name,
      price,
      category,
      description,
      images,
      stock,
      sku,
      flowerCount,
      bouquetType,
      badge,
      addons,
      features,
      slug,
      isActive: true,
    });

    const saved = await newProduct.save();
    revalidatePath("/admin/productos");
    revalidatePath("/");
    return { success: true, id: saved._id.toString() };
  } catch (error) {
    console.error("Error al crear:", error);
    return { success: false, error: error instanceof Error ? error.message : "No se pudo guardar el producto" };
  }
}

export async function createBulkProducts(
  productsData: Array<{
    name: string;
    price: number;
    category: string;
    description?: string;
    images: string[];
    stock?: number;
    sku?: string;
    badge?: string;
    flowerCount?: number;
    bouquetType?: string;
    addons?: string[];
  }>,
  publishImmediately: boolean = false
) {
  try {
    await dbConnect();
    
    if (!productsData || !Array.isArray(productsData) || productsData.length === 0) {
      return { success: false, error: "No hay productos para guardar." };
    }

    const batchCreatedAt = new Date();

    const preparedProducts = await Promise.all(productsData.map(async (item) => {
      const name = item.name.trim() || "Producto Sin Nombre";
      const baseSlug = slugify(name);
      const randomSuffix = Math.floor(Math.random() * 10000);
      const existingProduct = await Product.findOne({ slug: baseSlug });
      const slug = existingProduct
        ? slugify(`${name}-${randomSuffix}`)
        : baseSlug;

      const cleanedNameAlpha = name.replace(/[^a-zA-Z0-9]/g, "").substring(0, 4).toUpperCase();
      const generatedSku = `SKU-${cleanedNameAlpha || 'PROD'}-${randomSuffix}`;
      const sku = item.sku && item.sku.trim() !== "" ? item.sku.trim() : generatedSku;

      return {
        name,
        price: typeof item.price === 'number' && !isNaN(item.price) ? item.price : 0,
        category: item.category?.trim() || "General",
        description: item.description?.trim() || `Hermoso arreglo de ${name} elaborado con flores frescas de la más alta calidad en Gabriela's Flowers.`,
        images: item.images && item.images.length > 0 ? item.images : ["https://images.unsplash.com/photo-1563241527-3004b7be0ffd?w=800"],
        stock: typeof item.stock === 'number' && !isNaN(item.stock) ? item.stock : 10,
        sku,
        slug,
        flowerCount: item.flowerCount || 0,
        bouquetType: item.bouquetType || "",
        badge: item.badge || "",
        addons: item.addons || [],
        isActive: publishImmediately,
        createdAt: batchCreatedAt
      };
    }));

    const inserted = await Product.insertMany(preparedProducts);
    revalidatePath("/admin/productos");
    revalidatePath("/");
    return { success: true, count: inserted.length };
  } catch (error) {
    console.error("Error en carga masiva de productos:", error);
    return { success: false, error: error instanceof Error ? error.message : "Error al procesar la carga en masa." };
  }
}

export async function updateBulkBatch(
  productIds: string[],
  updates: {
    category?: string;
    flowerCount?: number;
    bouquetType?: string;
    price?: number;
    stock?: number;
    badge?: string;
    description?: string;
    addons?: string[];
  }
) {
  try {
    await dbConnect();
    if (!productIds || productIds.length === 0) {
      return { success: false, error: "No se seleccionaron productos para actualizar." };
    }

    const updateFields: any = {};
    if (updates.category !== undefined && updates.category.trim() !== "") updateFields.category = updates.category.trim();
    if (updates.flowerCount !== undefined && updates.flowerCount >= 0) updateFields.flowerCount = updates.flowerCount;
    if (updates.bouquetType !== undefined && updates.bouquetType.trim() !== "") updateFields.bouquetType = updates.bouquetType.trim();
    if (updates.price !== undefined && updates.price >= 0) updateFields.price = updates.price;
    if (updates.stock !== undefined && updates.stock >= 0) updateFields.stock = updates.stock;
    if (updates.badge !== undefined) updateFields.badge = updates.badge;
    if (updates.description !== undefined && updates.description.trim() !== "") updateFields.description = updates.description.trim();
    if (updates.addons !== undefined) updateFields.addons = updates.addons;

    await Product.updateMany(
      { _id: { $in: productIds } },
      { $set: updateFields }
    );

    revalidatePath("/admin/productos");
    revalidatePath("/");
    return { success: true, count: productIds.length };
  } catch (error) {
    console.error("Error al actualizar lote en masa:", error);
    return { success: false, error: "Error al aplicar cambios masivos." };
  }
}

export async function publishBulkBatch(productIds: string[]) {
  try {
    await dbConnect();
    if (!productIds || productIds.length === 0) {
      return { success: false, error: "No se seleccionaron productos para publicar." };
    }

    await Product.updateMany(
      { _id: { $in: productIds } },
      { $set: { isActive: true } }
    );

    revalidatePath("/admin/productos");
    revalidatePath("/");
    return { success: true, count: productIds.length };
  } catch (error) {
    console.error("Error al publicar lote de productos:", error);
    return { success: false, error: "Error al activar productos en tienda." };
  }
}

export async function fetchAddonsList() {
  try {
    await dbConnect();
    const { Addon } = await import("@/lib/models/Addon");
    const addons = await Addon.find({ isActive: true }).lean();
    return { success: true, addons: JSON.parse(JSON.stringify(addons)) };
  } catch (error) {
    console.error("Error al cargar adicionales:", error);
    return { success: false, addons: [] };
  }
}



export async function updateProduct(id: string, formData: FormData) {
  try {
    await dbConnect();
    const name = formData.get("name") as string;
    const price = parseFloat(formData.get("price") as string);
    const category = formData.get("category") as string;
    const description = formData.get("description") as string;
    const images = (formData.getAll("images") as string[]).filter((img) => img && typeof img === 'string' && img.trim() !== "");
    const stock = parseInt(formData.get("stock") as string) || 0;
    const sku = formData.get("sku") as string || "";
    
    // Nuevos campos
    const flowerCount = parseInt(formData.get("flowerCount") as string) || 0;
    const bouquetType = formData.get("bouquetType") as string || "";
    const badge = formData.get("badge") as string || "";
    const addonsRaw = formData.getAll("addons") as string[];
    const addons = addonsRaw.filter((a) => a && typeof a === 'string' && a.trim() !== "");

    // Procesar características
    const featureLabels = formData.getAll("featureLabels") as string[];
    const featureValues = formData.getAll("featureValues") as string[];
    const features = featureLabels
      .map((label, index) => ({ label, value: featureValues[index] }))
      .filter(f => f.label && f.value);

    // Evitar colisiones de Slug si cambia el nombre
    const baseSlug = slugify(name);
    const existingProduct = await Product.findOne({ slug: baseSlug, _id: { $ne: id } });
    const slug = existingProduct
      ? slugify(`${name}-${Math.floor(Math.random() * 1000)}`)
      : baseSlug;

    const updated = await Product.findByIdAndUpdate(
      id,
      {
        name,
        price,
        category,
        description,
        images,
        stock,
        sku,
        flowerCount,
        bouquetType,
        badge,
        addons,
        features,
        slug,
      },
      { new: true }
    );

    revalidatePath("/admin/productos");
    revalidatePath("/");
    return { success: true, id: updated?._id.toString() };
  } catch (error) {
    console.error("Error al editar producto:", error);
    return { success: false, error: error instanceof Error ? error.message : "No se pudo actualizar el producto" };
  }
}

export async function updateProductFormAction(formData: FormData): Promise<void> {
  const id = formData.get("id") as string;
  if (!id) return;
  const res = await updateProduct(id, formData);
  if (res.success) {
    redirect("/admin/productos");
  }
}

export async function getProductById(id: string) {
  try {
    await dbConnect();
    const product = await Product.findById(id).lean();
    if (!product) return { success: false, error: "Producto no encontrado" };
    return { success: true, data: JSON.parse(JSON.stringify(product)) };
  } catch (error) {
    return { success: false, error: "Error al cargar producto" };
  }
}

export async function toggleProductStatus(id: string, isActive: boolean) {
  try {
    await dbConnect();
    await Product.findByIdAndUpdate(id, { isActive });
    revalidatePath("/", "layout");
    revalidatePath("/admin/productos");
    return { success: true };
  } catch (error) {
    console.error("Error al cambiar estado del producto:", error);
    return { success: false, error: "Error al actualizar estado del producto" };
  }
}

export async function deleteProduct(id: string) {
  try {
    await dbConnect();
    await Product.findByIdAndDelete(id);
    revalidatePath("/", "layout");
    revalidatePath("/admin/productos");
    return { success: true };
  } catch (error) {
    console.error("Error al eliminar producto:", error);
    return { success: false, error: "No se pudo eliminar el producto" };
  }
}

/**
 * Filtra la lista de productos para evitar duplicados en la página de inicio.
 * Si un Producto A tiene seleccionados los Productos B y C como variantes en el administrador,
 * los productos B y C se ocultan de la portada y sólo se muestra el Producto A.
 */
export function filterUniqueVariantProducts<T extends { _id: any; variants?: any[] }>(products: T[]): T[] {
  if (!Array.isArray(products) || products.length === 0) {
    return [];
  }

  // 1. Recopilar todos los IDs de productos que han sido designados como variantes por cualquier otro producto
  const variantChildIds = new Set<string>();

  for (const p of products) {
    if (Array.isArray(p.variants) && p.variants.length > 0) {
      for (const v of p.variants) {
        const vId = (v?._id ? v._id : v).toString();
        if (vId && vId !== p._id.toString()) {
          variantChildIds.add(vId);
        }
      }
    }
  }

  // Si ningún producto tiene variantes seleccionadas, devolvemos la lista original sin alteraciones
  if (variantChildIds.size === 0) {
    return products;
  }

  // 2. Filtrar excluyendo los productos que son variantes secundarias
  const visibleProducts = products.filter((p) => {
    const pId = p._id.toString();
    return !variantChildIds.has(pId);
  });

  // Respaldo de seguridad en caso de que existiera un ciclo cerrado donde todos fueran hijos de todos
  return visibleProducts.length > 0 ? visibleProducts : products;
}

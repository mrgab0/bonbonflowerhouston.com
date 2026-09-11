import { IProduct as Product } from "@/lib/models/Product";

/**
 * Genera el script JSON-LD para un producto floral (Google Shopping & Rich Snippets).
 */
export function getProductSchema(product: Product, siteUrl: string = "https://flowersforyou.com") {
  const schema = {
    "@context": "https://schema.org/",
    "@type": "Product",
    "name": product.name,
    "image": product.images || [],
    "description": product.description,
    "sku": product._id ? product._id.toString() : product.slug,
    "offers": {
      "@type": "Offer",
      "url": `${siteUrl}/productos/${product.slug}`,
      "priceCurrency": "USD",
      "price": product.price,
      "itemCondition": "https://schema.org/NewCondition",
      "availability": product.stock > 0 
        ? "https://schema.org/InStock" 
        : "https://schema.org/OutOfStock",
      "seller": {
        "@type": "FlowerShop",
        "name": "Gabriela's Flowers LLC"
      }
    }
  };

  return JSON.stringify(schema);
}

/**
 * Genera el marcado JSON-LD de Negocio Local / Floristería para Google Maps.
 */
export function getLocalBusinessSchema(config: any, siteUrl: string = "https://flowersforyou.com") {
  const schema = {
    "@context": "https://schema.org",
    "@type": "FlowerShop",
    "name": config?.businessName || "Gabriela's Flowers LLC",
    "image": config?.ogImage || `${siteUrl}/logo.jpg`,
    "@id": siteUrl,
    "url": siteUrl,
    "telephone": config?.businessPhone || "+1 (800) 555-3569",
    "priceRange": "$$",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": config?.businessAddress || "Av. Principal Floristería #123",
      "addressLocality": config?.businessCity || "Ciudad de México",
      "addressCountry": "MX"
    },
    "openingHoursSpecification": {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday"
      ],
      "opens": "08:00",
      "closes": "20:00"
    }
  };

  return JSON.stringify(schema);
}

/**
 * Genera el esquema de Migas de Pan (Breadcrumbs) para Google SERP.
 */
export function getBreadcrumbSchema(items: { name: string; url: string }[]) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": item.url
    }))
  };

  return JSON.stringify(schema);
}

/**
 * Helper para generar Metadata dinámica en Next.js
 */
export function constructMetadata({
  title,
  description,
  image,
  slug = ""
}: {
  title: string;
  description: string;
  image?: string;
  slug?: string;
}) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://flowersforyou.com";
  const fullUrl = slug ? `${siteUrl}/${slug}` : siteUrl;

  return {
    title: `${title} | Gabriela's Flowers LLC`,
    description,
    openGraph: {
      title,
      description,
      url: fullUrl,
      images: image ? [{ url: image }] : [],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: image ? [image] : [],
    },
  };
}

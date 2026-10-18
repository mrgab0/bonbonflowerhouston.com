import { redirect } from "next/navigation";

export default async function LocalizedProductoFallbackPage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  redirect(`/${locale}/productos/${slug}`);
}

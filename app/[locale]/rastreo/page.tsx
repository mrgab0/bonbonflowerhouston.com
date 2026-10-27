import RastreoPedidoPage from "@/app/rastreo/page";
import { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isEn = locale === "en";

  return {
    title: isEn
      ? "Track My Order | Bonbon Flowers Houston"
      : "Rastrear Mi Envío | Bonbon Flowers Houston",
    description: isEn
      ? "Check the live preparation and delivery status of your luxury floral bouquet in Houston, TX."
      : "Consulta el estado en vivo de tu arreglo floral con tu ID de orden o teléfono.",
  };
}

export default async function LocalizedRastreoPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return <RastreoPedidoPage initialLocale={locale} />;
}

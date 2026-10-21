import { ThemeEditorClient } from "@/components/admin/ThemeEditorClient";
import { getThemeConfigAction } from "@/lib/actions/theme";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Editor de Tema & Colores | Bonbon Flowers Admin",
  description: "Personaliza los colores de la barra de anuncios, cabecera, botones, textos y pie de página de la boutique.",
};

export default async function AdminTemaPage() {
  const res = await getThemeConfigAction();

  return (
    <div className="space-y-6">
      <ThemeEditorClient initialTheme={res.theme} />
    </div>
  );
}

import AdminLoginPage from "./login/page";
import { verifyAdminSession, logoutAdminAction } from "@/lib/adminAuth";
import { AdminShell } from "@/components/admin/AdminShell";
import dbConnect from "@/lib/db";
import { SiteConfig } from "@/lib/models/SiteConfig";

export const runtime = 'nodejs';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Asegura la desactivación de 2FA en la base de datos
  try {
    await dbConnect();
    await SiteConfig.findOneAndUpdate({ key: "global" }, { $set: { twoFactorMode: "none" } });
  } catch (e) {
    // Silencioso en caso de timeout
  }

  const isAuthenticated = await verifyAdminSession();

  // Si NO está autenticado, protege strictly todas las páginas de /admin y muestra el Login
  if (!isAuthenticated) {
    return <AdminLoginPage />;
  }

  return (
    <AdminShell logoutAction={logoutAdminAction}>
      {children}
    </AdminShell>
  );
}

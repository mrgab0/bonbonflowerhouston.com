import AdminLoginPage from "./login/page";
import { verifyAdminSession, logoutAdminAction } from "@/lib/adminAuth";
import { AdminShell } from "@/components/admin/AdminShell";

export const runtime = 'nodejs';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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

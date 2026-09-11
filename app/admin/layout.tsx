import AdminLoginPage from "./login/page";
import { verifyAdminSession, logoutAdminAction } from "@/lib/adminAuth";
import { AdminNavbar } from "@/components/admin/AdminNavbar";

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
    <div className="min-h-screen bg-gray-100 dark:bg-[#0F1015] flex flex-col text-gray-900 dark:text-gray-100 transition-colors duration-300">
      <AdminNavbar logoutAction={logoutAdminAction} />
      <main className="container mx-auto p-4 sm:p-6 flex-1">{children}</main>
    </div>
  );
}

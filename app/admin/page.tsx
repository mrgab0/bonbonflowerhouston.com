import { LoginButton } from "@/components/LoginButton";
import { AdminDashboard } from "@/components/admin/AdminDashboard";
import { AdminWebPushManager } from "@/components/admin/AdminWebPushManager";

export default function AdminPage() {
  return (
    <div className="space-y-6">
      <AdminWebPushManager />
      <AdminDashboard />
      <div className="border-t pt-6 border-gray-200 dark:border-gray-800/60 flex justify-end">
        <LoginButton />
      </div>
    </div>
  );
}


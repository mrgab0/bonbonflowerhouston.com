import { LoginButton } from "@/components/LoginButton";
import { AdminDashboard } from "@/components/admin/AdminDashboard";

export default function AdminPage() {
  return (
    <div className="space-y-8">
      <AdminDashboard />
      <div className="border-t pt-6 border-gray-200 dark:border-gray-800/60 flex justify-end">
        <LoginButton />
      </div>
    </div>
  );
}


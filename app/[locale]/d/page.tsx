import { LoginButton } from "@/components/LoginButton";

export default function AdminLogin() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F9F9F9]">
      <div className="bg-white p-12 rounded-2xl shadow-xl border border-gray-100 text-center">
        <h1 className="text-2xl font-bold mb-6">Acceso Administrativo</h1>
        <LoginButton />
      </div>
    </div>
  );
}

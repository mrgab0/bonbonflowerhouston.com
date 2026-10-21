import { DoorDashConfigClient } from "@/components/admin/DoorDashConfigClient";
import { getDoorDashConfigAction } from "@/lib/actions/doordash";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "DoorDash Drive & Encomiendas | Bonbon Flowers Admin",
  description: "Verificación de dominio, script oficial de DoorDash y configuración para despacho de repartidores.",
};

export default async function AdminDoorDashPage() {
  const res = await getDoorDashConfigAction();

  return (
    <div className="space-y-6">
      <DoorDashConfigClient initialConfig={res.config} />
    </div>
  );
}

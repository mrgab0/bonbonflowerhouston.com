import { redirect } from "next/navigation";

export default function AdminChatbotRedirectPage() {
  redirect("/admin/configuracion?tab=chatbot");
}

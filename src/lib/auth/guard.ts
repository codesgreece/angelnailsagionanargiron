import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth/session";

export async function requireAdminPage() {
  const user = await getSessionUser();
  if (!user) redirect("/admin/login");
  return user;
}

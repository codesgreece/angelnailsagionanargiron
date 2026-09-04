import { getSessionUser } from "@/lib/auth/session";
import { AdminSidebar } from "@/components/admin/sidebar";
import { ToastHost } from "@/components/admin/toast";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser();

  return (
    <div className="min-h-screen bg-[#0F0F12] text-white">
      <ToastHost />
      {user ? (
        <>
          <AdminSidebar userName={user.name || user.email} />
          <div className="lg:pl-64">
            <div className="mx-auto max-w-6xl px-4 py-8 pt-14 lg:px-8 lg:pt-8">{children}</div>
          </div>
        </>
      ) : (
        children
      )}
    </div>
  );
}

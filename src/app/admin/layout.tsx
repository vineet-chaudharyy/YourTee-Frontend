import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { AdminShell } from "@/components/admin/AdminShell";

export const metadata = { title: "Admin" };

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Defense in depth (middleware also guards /admin)
  const admin = await requireAdmin();
  if (!admin) redirect("/login?redirect=/admin");

  return (
    <AdminShell admin={{ name: admin.name, email: admin.email }}>
      {children}
    </AdminShell>
  );
}

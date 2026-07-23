"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

type Row = {
  id: string;
  name: string;
  email: string;
  role: "user" | "admin";
  designs: number;
  createdAt: string;
};

export default function AdminUsers() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/users")
      .then((r) => r.json())
      .then((d) => setRows(d.users ?? []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <p className="eyebrow">Community</p>
      <h1 className="mt-2 font-serif text-4xl font-light">Users</h1>
      <p className="mt-2 text-sm text-muted">{rows.length} registered accounts</p>

      <div className="mt-8 overflow-x-auto border border-ink/10 bg-card">
        <table className="w-full min-w-[640px] text-sm">
          <thead>
            <tr className="border-b border-ink/10 text-left text-[10px] uppercase tracking-luxe text-muted">
              <th className="px-5 py-4">Name</th>
              <th className="px-5 py-4">Email</th>
              <th className="px-5 py-4">Role</th>
              <th className="px-5 py-4">Designs</th>
              <th className="px-5 py-4">Joined</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={5} className="px-5 py-8 text-center text-muted">
                  Loading…
                </td>
              </tr>
            )}
            {!loading && rows.length === 0 && (
              <tr>
                <td colSpan={5} className="px-5 py-8 text-center text-muted">
                  No users yet.
                </td>
              </tr>
            )}
            {rows.map((u) => (
              <tr key={u.id} className="border-b border-ink/5 last:border-0">
                <td className="px-5 py-4 font-medium">{u.name}</td>
                <td className="px-5 py-4 text-muted">{u.email}</td>
                <td className="px-5 py-4">
                  <span
                    className={cn(
                      "px-2.5 py-1 text-[10px] uppercase tracking-wider",
                      u.role === "admin"
                        ? "bg-gold/15 text-gold"
                        : "bg-ink/5 text-muted"
                    )}
                  >
                    {u.role}
                  </span>
                </td>
                <td className="px-5 py-4">{u.designs}</td>
                <td className="px-5 py-4 text-muted">
                  {new Date(u.createdAt).toLocaleDateString("en-IN")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

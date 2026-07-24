import type { ReactNode } from "react";
import { AdminNav } from "@/app/admin/_components/AdminNav";

export const dynamic = "force-dynamic"; // painel nunca é cacheado

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-mist">
      <AdminNav />
      <main className="mx-auto max-w-6xl px-6 py-8">{children}</main>
    </div>
  );
}

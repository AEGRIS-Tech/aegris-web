import Link from "next/link";
import { redirect } from "next/navigation";

import { requireAdminAccess } from "@/lib/auth/admin-access";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createServerSupabaseClient();

  const access = await requireAdminAccess(supabase);

  if (!access.ok) {
    if (access.status === 401) {
      redirect("/login");
    }

    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="flex min-h-screen">
        <aside className="hidden w-72 shrink-0 border-r border-slate-800 bg-slate-950 lg:flex lg:flex-col">
          <div className="border-b border-slate-800 px-7 py-7">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-400">
              AEGRIS
            </p>

            <h1 className="mt-2 text-xl font-semibold">
              Control Center
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Interní administrace
            </p>
          </div>

          <nav className="flex-1 space-y-2 p-4">
            <Link
              href="/admin"
              className="block rounded-xl px-4 py-3 text-sm text-slate-400 transition hover:bg-slate-900 hover:text-white"
            >
              Přehled
            </Link>

            <Link
              href="/admin/customers"
              className="block rounded-xl px-4 py-3 text-sm text-slate-400 transition hover:bg-slate-900 hover:text-white"
            >
              Zákazníci
            </Link>

            <Link
              href="/admin/demo"
              className="block rounded-xl px-4 py-3 text-sm text-slate-400 transition hover:bg-slate-900 hover:text-white"
            >
              DEMO
            </Link>

            <Link
              href="/admin/projects"
              className="block rounded-xl px-4 py-3 text-sm text-slate-400 transition hover:bg-slate-900 hover:text-white"
            >
              Projekty
            </Link>

            <Link
              href="/admin/analyses"
              className="block rounded-xl px-4 py-3 text-sm text-slate-400 transition hover:bg-slate-900 hover:text-white"
            >
              Analýzy
            </Link>

            <div className="my-4 border-t border-slate-800" />

            <Link
              href="/admin/support"
              className="block rounded-xl px-4 py-3 text-sm text-slate-400 transition hover:bg-slate-900 hover:text-white"
            >
              Support
            </Link>

            <Link
              href="/admin/system"
              className="block rounded-xl px-4 py-3 text-sm text-slate-400 transition hover:bg-slate-900 hover:text-white"
            >
              Systém
            </Link>
          </nav>

          <div className="border-t border-slate-800 p-5">
            <p className="truncate text-sm font-medium text-slate-200">
              {access.user.email}
            </p>

            <div className="mt-2 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />

              <span className="text-xs uppercase tracking-wider text-slate-500">
                Administrator
              </span>
            </div>

            <Link
              href="/dashboard"
              className="mt-4 block text-sm text-slate-400 transition hover:text-white"
            >
              ← Zpět do AEGRIS
            </Link>
          </div>
        </aside>

        <main className="min-w-0 flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}
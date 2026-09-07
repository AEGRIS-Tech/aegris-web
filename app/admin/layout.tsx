import Link from "next/link";
import { redirect } from "next/navigation";

import { requireAdminAccess } from "@/lib/auth/admin-access";
import { createServerSupabaseClient } from "@/lib/supabase/server";

const navigation = [
  { href: "/admin", label: "Přehled", index: "01" },
  { href: "/admin/customers", label: "Zákazníci", index: "02" },
  { href: "/admin/demo", label: "DEMO", index: "03" },
  { href: "/admin/projects", label: "Projekty", index: "04" },
  { href: "/admin/analyses", label: "Analýzy", index: "05" },
  { href: "/admin/support", label: "Support", index: "06" },
  { href: "/admin/system", label: "Systém", index: "07" },
];

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
    <div className="min-h-screen bg-[#05090d] text-slate-100">
      <div className="flex min-h-screen">
        <aside className="hidden w-[284px] shrink-0 border-r border-white/[0.06] bg-[#070c11] lg:flex lg:flex-col">
          <div className="border-b border-white/[0.06] px-6 py-6">
            <div className="text-[10px] font-black uppercase tracking-[0.24em] text-cyan-300">
              AEGRIS
            </div>

            <h1 className="mt-3 text-xl font-black tracking-[-0.03em] text-white">
              Control Center
            </h1>

            <p className="mt-1 text-[10px] uppercase tracking-[0.12em] text-slate-700">
              Interní administrace
            </p>
          </div>

          <nav className="flex-1 px-3 py-4">
            <div className="mb-2 px-3 text-[7px] font-black uppercase tracking-[0.16em] text-slate-700">
              Operations
            </div>

            <div className="space-y-1">
              {navigation.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="group flex items-center gap-3 rounded-xl border border-transparent px-3 py-3 transition hover:border-white/[0.05] hover:bg-white/[0.025]"
                >
                  <span className="w-5 text-[7px] font-black tracking-[0.12em] text-slate-700 transition group-hover:text-cyan-300/60">
                    {item.index}
                  </span>

                  <span className="text-[11px] font-bold text-slate-500 transition group-hover:text-white">
                    {item.label}
                  </span>
                </Link>
              ))}
            </div>
          </nav>

          <div className="border-t border-white/[0.06] p-5">
            <div className="rounded-2xl border border-white/[0.06] bg-[#0a1016] p-4">
              <div className="text-[7px] font-black uppercase tracking-[0.14em] text-slate-700">
                Admin Session
              </div>

              <p className="mt-3 truncate text-[11px] font-bold text-slate-300">
                {access.user.email}
              </p>

              <div className="mt-2 flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />

                <span className="text-[8px] font-black uppercase tracking-[0.12em] text-emerald-300/80">
                  Administrator
                </span>
              </div>

              <Link
                href="/dashboard"
                className="mt-4 inline-flex items-center gap-2 text-[8px] font-black uppercase tracking-[0.1em] text-slate-600 transition hover:text-cyan-300"
              >
                <span>←</span>
                <span>Zpět do AEGRIS</span>
              </Link>
            </div>
          </div>
        </aside>

        <main className="min-w-0 flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}

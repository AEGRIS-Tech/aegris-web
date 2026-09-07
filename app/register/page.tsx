"use client";

import Link from "next/link";
import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent } from "react";

import { supabase } from "@/lib/supabase";

function RegisterContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const inviteToken = searchParams.get("invite")?.trim() ?? "";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  async function register(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (loading) {
      return;
    }

    setErrorMessage("");
    setSuccessMessage("");

    if (password.length < 8) {
      setErrorMessage("Heslo musí mít alespoň 8 znaků.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Hesla se neshodují.");
      return;
    }

    setLoading(true);

    try {
      const normalizedEmail = email.trim().toLowerCase();

      const nextPath = inviteToken
        ? `/auth/accept-organization-invite?token=${encodeURIComponent(
            inviteToken
          )}`
        : "/dashboard";

      const callbackUrl =
        `${window.location.origin}/auth/callback?next=${encodeURIComponent(
          nextPath
        )}`;

      const { data, error } = await supabase.auth.signUp({
        email: normalizedEmail,
        password,
        options: {
          emailRedirectTo: callbackUrl,
        },
      });

      if (error) {
        console.error("REGISTER ERROR:", error);
        setErrorMessage("Účet se nepodařilo vytvořit.");
        return;
      }

      if (data.session) {
        if (inviteToken) {
          router.replace(nextPath);
          router.refresh();
          return;
        }

        setSuccessMessage(
          "Účet byl vytvořen a jste přihlášený."
        );

        router.replace("/dashboard");
        router.refresh();
        return;
      }

      if (inviteToken) {
        setSuccessMessage(
          "Účet byl vytvořen. Zkontrolujte e-mail a potvrďte registraci. Poté budete pokračovat k přijetí pozvánky do organizace."
        );
      } else {
        setSuccessMessage(
          "Účet byl vytvořen. Zkontrolujte e-mail a potvrďte registraci."
        );
      }
    } catch (error) {
      console.error("REGISTER CLIENT ERROR:", error);
      setErrorMessage("Účet se nepodařilo vytvořit.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#05090d] text-slate-100">
      <div className="grid min-h-screen lg:grid-cols-[minmax(0,1.15fr)_minmax(440px,0.85fr)]">
        <section className="relative hidden overflow-hidden border-r border-white/[0.06] bg-[#070c11] lg:flex lg:flex-col">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_22%_18%,rgba(103,232,249,0.08),transparent_28%),radial-gradient(circle_at_78%_74%,rgba(34,211,238,0.05),transparent_24%)]" />

          <div className="relative z-10 flex items-center justify-between border-b border-white/[0.06] px-10 py-7">
            <div>
              <div className="text-xl font-black tracking-[0.2em] text-white">
                AEGRIS
              </div>
              <div className="mt-1 text-[8px] font-bold uppercase tracking-[0.24em] text-cyan-300/70">
                Agronomic Intelligence
              </div>
            </div>

            <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] px-3 py-2 text-[8px] font-black uppercase tracking-[0.16em] text-slate-500">
              New Workspace Access
            </div>
          </div>

          <div className="relative z-10 flex flex-1 items-center px-10 py-12 xl:px-16">
            <div className="max-w-2xl">
              <div className="text-[9px] font-black uppercase tracking-[0.22em] text-cyan-300">
                Controlled Agronomic Workspace
              </div>

              <h1 className="mt-4 max-w-xl text-5xl font-black tracking-[-0.05em] text-white xl:text-6xl">
                Vytvořte účet pro práci s monitoringem a rozhodováním nad pozemky.
              </h1>

              <p className="mt-5 max-w-xl text-sm leading-7 text-slate-500">
                Po registraci získáte přístup k pracovnímu prostředí AEGRIS.
                Pokud přicházíte přes pozvánku, účet se po potvrzení naváže na
                příslušnou organizaci.
              </p>

              <div className="mt-10 grid max-w-xl gap-3 sm:grid-cols-3">
                <FeatureCard
                  label="Monitoring"
                  value="Sentinel-2"
                  detail="Satelitní stav pozemků"
                />
                <FeatureCard
                  label="Decision Engine"
                  value="AEGRIS"
                  detail="Skóre, priorita a doporučení"
                />
                <FeatureCard
                  label="Organization"
                  value="Team Access"
                  detail="Role, členové a pozvánky"
                />
              </div>
            </div>
          </div>

          <div className="relative z-10 border-t border-white/[0.06] px-10 py-5 text-[8px] uppercase tracking-[0.12em] text-slate-700">
            Secure registration · organization access · agronomic workflow
          </div>
        </section>

        <section className="flex min-h-screen items-center justify-center px-5 py-8 sm:px-8 lg:px-12">
          <div className="w-full max-w-[480px]">
            <div className="mb-8 lg:hidden">
              <div className="text-lg font-black tracking-[0.2em] text-white">
                AEGRIS
              </div>
              <div className="mt-1 text-[8px] font-bold uppercase tracking-[0.22em] text-cyan-300/70">
                Agronomic Intelligence
              </div>
            </div>

            <div className="rounded-[26px] border border-white/[0.07] bg-[#0a1016] p-6 shadow-2xl shadow-black/20 sm:p-8">
              <div className="text-[9px] font-black uppercase tracking-[0.2em] text-cyan-300">
                Account Registration
              </div>

              <h2 className="mt-2 text-3xl font-black tracking-[-0.04em] text-white">
                {inviteToken ? "Registrace pozvaného člena" : "Registrace"}
              </h2>

              <p className="mt-2 text-[11px] leading-5 text-slate-500">
                {inviteToken
                  ? "Vytvořte účet a pokračujte k přijetí pozvánky do organizace."
                  : "Vytvořte účet pro vstup do pracovního prostředí AEGRIS."}
              </p>

              {inviteToken && (
                <div className="mt-5 rounded-xl border border-cyan-300/15 bg-cyan-300/[0.04] px-4 py-3 text-[10px] leading-5 text-cyan-100">
                  Byli jste pozváni do organizace v AEGRIS. Po vytvoření a
                  potvrzení účtu bude pozvánka automaticky zpracována.
                </div>
              )}

              <form onSubmit={register} className="mt-7">
                <label
                  htmlFor="email"
                  className="text-[9px] font-black uppercase tracking-[0.12em] text-slate-500"
                >
                  E-mail
                </label>

                <input
                  id="email"
                  type="email"
                  placeholder="vas@email.cz"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  autoComplete="email"
                  required
                  disabled={loading}
                  className="mt-2 w-full rounded-xl border border-white/[0.08] bg-[#071017] px-4 py-3 text-[11px] text-white outline-none transition placeholder:text-slate-700 focus:border-cyan-300/40 disabled:cursor-not-allowed disabled:opacity-50"
                />

                <label
                  htmlFor="password"
                  className="mt-5 block text-[9px] font-black uppercase tracking-[0.12em] text-slate-500"
                >
                  Heslo
                </label>

                <input
                  id="password"
                  type="password"
                  placeholder="Minimálně 8 znaků"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  autoComplete="new-password"
                  required
                  minLength={8}
                  disabled={loading}
                  className="mt-2 w-full rounded-xl border border-white/[0.08] bg-[#071017] px-4 py-3 text-[11px] text-white outline-none transition placeholder:text-slate-700 focus:border-cyan-300/40 disabled:cursor-not-allowed disabled:opacity-50"
                />

                <label
                  htmlFor="confirmPassword"
                  className="mt-5 block text-[9px] font-black uppercase tracking-[0.12em] text-slate-500"
                >
                  Potvrzení hesla
                </label>

                <input
                  id="confirmPassword"
                  type="password"
                  placeholder="Zopakujte heslo"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  autoComplete="new-password"
                  required
                  minLength={8}
                  disabled={loading}
                  className="mt-2 w-full rounded-xl border border-white/[0.08] bg-[#071017] px-4 py-3 text-[11px] text-white outline-none transition placeholder:text-slate-700 focus:border-cyan-300/40 disabled:cursor-not-allowed disabled:opacity-50"
                />

                {errorMessage && (
                  <div className="mt-4 rounded-xl border border-red-400/15 bg-red-400/[0.04] px-4 py-3 text-[10px] leading-5 text-red-300">
                    {errorMessage}
                  </div>
                )}

                {successMessage && (
                  <div className="mt-4 rounded-xl border border-emerald-300/15 bg-emerald-300/[0.04] px-4 py-3 text-[10px] leading-5 text-emerald-300">
                    {successMessage}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="mt-6 w-full rounded-xl bg-cyan-300 px-5 py-3 text-[10px] font-black text-[#061015] transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loading
                    ? "Registruji..."
                    : inviteToken
                      ? "Vytvořit účet a pokračovat"
                      : "Registrovat"}
                </button>
              </form>

              <div className="mt-6 border-t border-white/[0.06] pt-5 text-center text-[10px] text-slate-600">
                Už máte účet?{" "}
                <Link
                  href="/login"
                  className="font-bold text-cyan-300 transition hover:text-cyan-200"
                >
                  Přihlásit se
                </Link>
              </div>
            </div>

            <div className="mt-4 text-center text-[8px] uppercase tracking-[0.12em] text-slate-800">
              AEGRIS · Controlled agronomic workspace
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function RegisterLoadingFallback() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#05090d] px-5 text-slate-100">
      <div className="w-full max-w-[460px] rounded-[26px] border border-white/[0.07] bg-[#0a1016] p-8 text-center shadow-2xl shadow-black/20">
        <div className="text-lg font-black tracking-[0.2em] text-white">
          AEGRIS
        </div>
        <div className="mt-1 text-[8px] font-bold uppercase tracking-[0.22em] text-cyan-300/70">
          Agronomic Intelligence
        </div>
        <p className="mt-6 text-[10px] text-slate-500">
          Načítám registraci...
        </p>
      </div>
    </main>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<RegisterLoadingFallback />}>
      <RegisterContent />
    </Suspense>
  );
}

function FeatureCard({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-4">
      <div className="text-[8px] font-black uppercase tracking-[0.12em] text-slate-700">
        {label}
      </div>
      <div className="mt-2 text-sm font-black text-white">{value}</div>
      <div className="mt-1 text-[8px] leading-4 text-slate-600">{detail}</div>
    </div>
  );
}

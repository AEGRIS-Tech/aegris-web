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
    <main className="flex min-h-screen items-center justify-center bg-slate-950 p-6 text-white">
      <div className="w-full max-w-md rounded-3xl border border-slate-800 bg-slate-900 p-8 shadow-2xl">
        <h1 className="text-center text-4xl font-bold text-cyan-400">
          AEGRIS
        </h1>

        <p className="mt-3 text-center text-slate-400">
          {inviteToken
            ? "Registrace pozvaného člena"
            : "Registrace"}
        </p>

        {inviteToken && (
          <div className="mt-5 rounded-xl border border-cyan-500/30 bg-cyan-500/10 p-4 text-sm leading-6 text-cyan-100">
            Byli jste pozváni do organizace v AEGRIS. Po vytvoření
            a potvrzení účtu bude pozvánka automaticky zpracována.
          </div>
        )}

        <form onSubmit={register} className="mt-8">
          <label
            htmlFor="email"
            className="mb-2 block text-sm font-semibold text-slate-300"
          >
            E-mail
          </label>

          <input
            id="email"
            className="w-full rounded-xl border border-slate-700 bg-slate-800 p-3 text-white outline-none focus:border-cyan-400 disabled:opacity-60"
            type="email"
            placeholder="vas@email.cz"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="email"
            required
            disabled={loading}
          />

          <label
            htmlFor="password"
            className="mb-2 mt-4 block text-sm font-semibold text-slate-300"
          >
            Heslo
          </label>

          <input
            id="password"
            className="w-full rounded-xl border border-slate-700 bg-slate-800 p-3 text-white outline-none focus:border-cyan-400 disabled:opacity-60"
            type="password"
            placeholder="Minimálně 8 znaků"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="new-password"
            required
            minLength={8}
            disabled={loading}
          />

          <label
            htmlFor="confirmPassword"
            className="mb-2 mt-4 block text-sm font-semibold text-slate-300"
          >
            Potvrzení hesla
          </label>

          <input
            id="confirmPassword"
            className="w-full rounded-xl border border-slate-700 bg-slate-800 p-3 text-white outline-none focus:border-cyan-400 disabled:opacity-60"
            type="password"
            placeholder="Zopakujte heslo"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            autoComplete="new-password"
            required
            minLength={8}
            disabled={loading}
          />

          {errorMessage && (
            <div className="mt-5 rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-400">
              {errorMessage}
            </div>
          )}

          {successMessage && (
            <div className="mt-5 rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-4 text-sm text-emerald-300">
              {successMessage}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-6 w-full rounded-xl bg-cyan-500 py-3 font-bold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading
              ? "Registruji..."
              : inviteToken
                ? "Vytvořit účet a pokračovat"
                : "Registrovat"}
          </button>
        </form>

        <Link
          href="/login"
          className="mt-6 block text-center text-sm text-slate-400 hover:text-white"
        >
          Už máte účet? Přihlásit se
        </Link>
      </div>
    </main>
  );
}

function RegisterLoadingFallback() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 p-6 text-white">
      <div className="w-full max-w-md rounded-3xl border border-slate-800 bg-slate-900 p-8 text-center shadow-2xl">
        <div className="text-4xl font-bold text-cyan-400">
          AEGRIS
        </div>

        <p className="mt-4 text-sm text-slate-400">
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
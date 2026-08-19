"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function login() {
    if (loading) return;

    setErrorMessage("");
    setLoading(true);

    try {
      const { data, error } =
        await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

      if (error) {
        console.error("LOGIN ERROR:", error);

        setErrorMessage(
          error.message || "Přihlášení se nepodařilo."
        );

        return;
      }

      if (!data.user || !data.session) {
        setErrorMessage(
          "Přihlášení proběhlo, ale nepodařilo se vytvořit relaci."
        );

        return;
      }

      console.log(
        "AEGRIS LOGIN SUCCESS:",
        data.user.email
      );

      // Ověření, že browser session opravdu existuje.
      const {
        data: sessionData,
        error: sessionError,
      } = await supabase.auth.getSession();

      if (
        sessionError ||
        !sessionData.session
      ) {
        console.error(
          "SESSION ERROR:",
          sessionError
        );

        setErrorMessage(
          "Přihlášení se nepodařilo dokončit."
        );

        return;
      }

      // Přechod na dashboard.
      router.push("/dashboard");
    } catch (error: unknown) {
      console.error(
        "NEOČEKÁVANÁ LOGIN CHYBA:",
        error
      );

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Neočekávaná chyba při přihlášení."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 p-6 text-white">
      <div className="w-full max-w-md rounded-3xl bg-slate-900 p-8 shadow-2xl">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-cyan-400">
            AEGRIS
          </h1>

          <p className="mt-2 text-slate-400">
            Přihlášení do systému
          </p>
        </div>

        <form
          onSubmit={(event) => {
            event.preventDefault();
            login();
          }}
        >
          <div className="mb-4">
            <label
              htmlFor="email"
              className="mb-2 block text-sm font-semibold text-slate-300"
            >
              E-mail
            </label>

            <input
              id="email"
              type="email"
              placeholder="vas@email.cz"
              value={email}
              onChange={(event) =>
                setEmail(event.target.value)
              }
              autoComplete="email"
              required
              className="w-full rounded-xl border border-slate-700 bg-slate-800 p-3 text-white outline-none focus:border-cyan-400"
            />
          </div>

          <div className="mb-6">
            <label
              htmlFor="password"
              className="mb-2 block text-sm font-semibold text-slate-300"
            >
              Heslo
            </label>

            <input
              id="password"
              type="password"
              placeholder="Heslo"
              value={password}
              onChange={(event) =>
                setPassword(event.target.value)
              }
              autoComplete="current-password"
              required
              className="w-full rounded-xl border border-slate-700 bg-slate-800 p-3 text-white outline-none focus:border-cyan-400"
            />
          </div>

          {errorMessage && (
            <div className="mb-5 rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-400">
              {errorMessage}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-cyan-500 py-3 font-bold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading
              ? "Přihlašuji..."
              : "Přihlásit se"}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-slate-500">
          AEGRIS systém
        </div>
      </div>
    </main>
  );
}
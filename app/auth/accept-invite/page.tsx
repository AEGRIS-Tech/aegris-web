"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function AcceptInvitePage() {
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let mounted = true;

    async function initializeInvite() {
      try {
        setErrorMessage("");

        // =====================================================
        // 1. PŘEČTEME TOKENY Z URL FRAGMENTU
        // =====================================================

        const hash = window.location.hash;

        if (hash) {
          const params = new URLSearchParams(
            hash.substring(1)
          );

          const accessToken =
            params.get("access_token");

          const refreshToken =
            params.get("refresh_token");

          const authError =
            params.get("error_description");

          if (authError) {
            console.error(
              "SUPABASE INVITE ERROR:",
              authError
            );

            if (mounted) {
              setErrorMessage(
                "Pozvánka je neplatná nebo již vypršela."
              );
              setLoading(false);
            }

            return;
          }

          // =================================================
          // 2. VYTVOŘÍME SESSION Z TOKENŮ
          // =================================================

          if (accessToken && refreshToken) {
            console.log(
              "AEGRIS: INVITE TOKEN NALEZEN"
            );

            const {
              data,
              error,
            } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            });

            if (error || !data.session) {
              console.error(
                "INVITE SET SESSION ERROR:",
                error
              );

              if (mounted) {
                setErrorMessage(
                  "Pozvánku se nepodařilo ověřit."
                );
                setLoading(false);
              }

              return;
            }

            console.log(
              "AEGRIS: INVITE SESSION VYTVOŘENA",
              data.session.user.email
            );

            // Token už nepotřebujeme v URL.
            window.history.replaceState(
              {},
              document.title,
              window.location.pathname
            );
          }
        }

        // =====================================================
        // 3. OVĚŘÍME, ŽE SESSION EXISTUJE
        // =====================================================

        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (!mounted) return;

        if (error || !session) {
          console.error(
            "INVITE SESSION ERROR:",
            error
          );

          setErrorMessage(
            "Pozvánka je neplatná nebo již vypršela."
          );

          setLoading(false);
          return;
        }

        console.log(
          "AEGRIS: DEMO UŽIVATEL PŘIHLÁŠEN:",
          session.user.email
        );

        setLoading(false);
      } catch (error) {
        console.error(
          "INVITE INITIALIZATION ERROR:",
          error
        );

        if (mounted) {
          setErrorMessage(
            "Pozvánku se nepodařilo ověřit."
          );

          setLoading(false);
        }
      }
    }

    initializeInvite();

    return () => {
      mounted = false;
    };
  }, []);

  async function handleSetPassword() {
    if (saving) return;

    setErrorMessage("");

    if (password.length < 8) {
      setErrorMessage(
        "Heslo musí mít alespoň 8 znaků."
      );
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage(
        "Hesla se neshodují."
      );
      return;
    }

    setSaving(true);

    const { error } =
      await supabase.auth.updateUser({
        password,
      });

    if (error) {
      console.error(
        "SET PASSWORD ERROR:",
        error
      );

      setErrorMessage(
        "Heslo se nepodařilo nastavit."
      );

      setSaving(false);
      return;
    }

    console.log(
      "AEGRIS: HESLO NASTAVENO"
    );

    router.replace("/dashboard");
  }

  // ===========================================================
  // LOADING
  // ===========================================================

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        <div className="text-slate-400">
          Ověřuji pozvánku...
        </div>
      </main>
    );
  }

  // ===========================================================
  // PAGE
  // ===========================================================

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 p-6 text-white">
      <div className="w-full max-w-md rounded-3xl bg-slate-900 p-8 shadow-2xl">

        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-cyan-400">
            AEGRIS
          </h1>

          <p className="mt-3 text-slate-400">
            Dokončení DEMO účtu
          </p>
        </div>

        {errorMessage ? (
          <div className="rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-400">
            {errorMessage}
          </div>
        ) : (
          <>
            <p className="mb-6 text-sm leading-6 text-slate-400">
              Nastavte si heslo pro přístup do vašeho
              AEGRIS DEMO účtu.
            </p>

            <div className="mb-4">
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-semibold text-slate-300"
              >
                Nové heslo
              </label>

              <input
                id="password"
                type="password"
                value={password}
                onChange={(event) =>
                  setPassword(event.target.value)
                }
                autoComplete="new-password"
                placeholder="Minimálně 8 znaků"
                className="w-full rounded-xl border border-slate-700 bg-slate-800 p-3 text-white outline-none focus:border-cyan-400"
              />
            </div>

            <div className="mb-6">
              <label
                htmlFor="confirmPassword"
                className="mb-2 block text-sm font-semibold text-slate-300"
              >
                Potvrzení hesla
              </label>

              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(event) =>
                  setConfirmPassword(event.target.value)
                }
                autoComplete="new-password"
                placeholder="Zopakujte heslo"
                className="w-full rounded-xl border border-slate-700 bg-slate-800 p-3 text-white outline-none focus:border-cyan-400"
              />
            </div>

            <button
              type="button"
              onClick={handleSetPassword}
              disabled={saving}
              className="w-full rounded-xl bg-cyan-500 py-3 font-bold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving
                ? "Nastavuji účet..."
                : "Dokončit DEMO účet"}
            </button>
          </>
        )}
      </div>
    </main>
  );
}
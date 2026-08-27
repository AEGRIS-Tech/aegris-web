"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { supabase } from "@/lib/supabase";

export default function AcceptInvitePage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let active = true;

    async function verifyDemoUser() {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (!active) return;

      if (userError || !user) {
        console.error(
          "DEMO USER VERIFY ERROR:",
          userError
        );

        setErrorMessage(
          "Pozvánka je neplatná nebo již vypršela."
        );

        setLoading(false);
        return;
      }

      const {
        data: profile,
        error: profileError,
      } = await supabase
        .from("profiles")
        .select("account_type")
        .eq("id", user.id)
        .maybeSingle();

      if (!active) return;

      if (profileError) {
        console.error(
          "DEMO PROFILE VERIFY ERROR:",
          profileError
        );

        setErrorMessage(
          "Pozvánku se nepodařilo ověřit."
        );

        setLoading(false);
        return;
      }

      if (
        profile?.account_type !== "demo"
      ) {
        setErrorMessage(
          "Tato stránka je určena pouze pro aktivaci DEMO účtu."
        );

        setLoading(false);
        return;
      }

      setLoading(false);
    }

    void verifyDemoUser();

    return () => {
      active = false;
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

    try {
      /*
       * Autorizační stav ověřujeme znovu těsně před
       * změnou hesla.
       *
       * Nestačí pouze to, že uživatel měl při načtení
       * stránky nějakou session.
       */

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        console.error(
          "DEMO USER CHECK ERROR:",
          userError
        );

        setErrorMessage(
          "Přihlášení z pozvánky se nepodařilo ověřit. Otevřete prosím aktivační odkaz znovu."
        );

        return;
      }

      /*
       * profiles.account_type je autoritativní serverem
       * řízený údaj.
       *
       * Běžný authenticated uživatel má na profiles pouze
       * SELECT vlastního profilu a nemůže account_type měnit.
       */

      const {
        data: profile,
        error: profileError,
      } = await supabase
        .from("profiles")
        .select("account_type")
        .eq("id", user.id)
        .maybeSingle();

      if (profileError) {
        console.error(
          "DEMO PROFILE CHECK ERROR:",
          profileError
        );

        setErrorMessage(
          "DEMO účet se nepodařilo ověřit."
        );

        return;
      }

      if (
        profile?.account_type !== "demo"
      ) {
        setErrorMessage(
          "Tento účet není oprávněn dokončit DEMO aktivaci."
        );

        return;
      }

      const {
        error: updateError,
      } = await supabase.auth.updateUser({
        password,
      });

      if (updateError) {
        console.error(
          "DEMO PASSWORD UPDATE ERROR:",
          updateError
        );

        setErrorMessage(
          "Heslo se nepodařilo nastavit."
        );

        return;
      }

      router.replace("/dashboard");
      router.refresh();
    } catch (error) {
      console.error(
        "DEMO ACCEPT CLIENT ERROR:",
        error
      );

      setErrorMessage(
        "Nepodařilo se dokončit DEMO účet."
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        <div className="text-slate-400">
          Ověřuji DEMO účet...
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 p-6 text-white">
      <div className="w-full max-w-md rounded-3xl border border-slate-800 bg-slate-900 p-8 shadow-2xl">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-cyan-400">
            AEGRIS
          </h1>

          <p className="mt-3 text-slate-400">
            Dokončení DEMO účtu
          </p>
        </div>

        {errorMessage &&
        !password &&
        !confirmPassword ? (
          <div className="rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-400">
            {errorMessage}
          </div>
        ) : (
          <>
            <p className="mb-6 text-sm leading-6 text-slate-400">
              Nastavte si heslo pro přístup do vašeho
              AEGRIS DEMO účtu.
            </p>

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
                setPassword(
                  event.target.value
                )
              }
              autoComplete="new-password"
              placeholder="Minimálně 8 znaků"
              disabled={saving}
              minLength={8}
              className="w-full rounded-xl border border-slate-700 bg-slate-800 p-3 text-white outline-none focus:border-cyan-400 disabled:opacity-50"
            />

            <label
              htmlFor="confirmPassword"
              className="mb-2 mt-4 block text-sm font-semibold text-slate-300"
            >
              Potvrzení hesla
            </label>

            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(event) =>
                setConfirmPassword(
                  event.target.value
                )
              }
              autoComplete="new-password"
              placeholder="Zopakujte heslo"
              disabled={saving}
              minLength={8}
              className="w-full rounded-xl border border-slate-700 bg-slate-800 p-3 text-white outline-none focus:border-cyan-400 disabled:opacity-50"
            />

            {errorMessage && (
              <div className="mt-5 rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-400">
                {errorMessage}
              </div>
            )}

            <button
              type="button"
              onClick={() =>
                void handleSetPassword()
              }
              disabled={saving}
              className="mt-6 w-full rounded-xl bg-cyan-500 py-3 font-bold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-50"
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

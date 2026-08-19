"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";

export default function DemoPage() {
  const [fullName, setFullName] = useState("");
  const [company, setCompany] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (loading) return;

    setErrorMessage("");
    setLoading(true);

    try {
      const response = await fetch("/api/demo", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          full_name: fullName,
          company,
          email,
          phone,
          message,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setErrorMessage(
          result.error ||
            "Žádost se nepodařilo odeslat."
        );
        return;
      }

      setSubmitted(true);
    } catch (error) {
      console.error(
        "CHYBA ODESLÁNÍ DEMO ŽÁDOSTI:",
        error
      );

      setErrorMessage(
        "Nepodařilo se spojit se serverem. Zkuste to prosím později."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-slate-800">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <Link
            href="/"
            className="text-2xl font-bold tracking-tight text-cyan-400"
          >
            AEGRIS
          </Link>

          <Link
            href="/login"
            className="rounded-xl border border-slate-700 bg-slate-900 px-5 py-3 font-semibold transition hover:border-cyan-400"
          >
            Přihlásit se
          </Link>
        </div>
      </header>

      <section className="px-6 py-16 md:py-24">
        <div className="mx-auto max-w-3xl">
          {!submitted ? (
            <>
              <div className="mb-10 text-center">
                <p className="text-sm font-bold uppercase tracking-[0.2em] text-cyan-400">
                  AEGRIS
                </p>

                <h1 className="mt-4 text-4xl font-bold md:text-5xl">
                  Požádat o DEMO
                </h1>

                <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-slate-400">
                  Chcete AEGRIS vidět v praxi?
                  Vyplňte krátký formulář a
                  ozveme se vám s možnostmi
                  předvedení systému.
                </p>
              </div>

              <form
                onSubmit={handleSubmit}
                className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 shadow-2xl md:p-8"
              >
                <div className="grid gap-6 md:grid-cols-2">
                  <div>
                    <label
                      htmlFor="fullName"
                      className="mb-2 block text-sm font-semibold text-slate-300"
                    >
                      Jméno a příjmení *
                    </label>

                    <input
                      id="fullName"
                      type="text"
                      value={fullName}
                      onChange={(event) =>
                        setFullName(event.target.value)
                      }
                      required
                      autoComplete="name"
                      placeholder="Jan Novák"
                      className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-400"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="company"
                      className="mb-2 block text-sm font-semibold text-slate-300"
                    >
                      Firma
                    </label>

                    <input
                      id="company"
                      type="text"
                      value={company}
                      onChange={(event) =>
                        setCompany(event.target.value)
                      }
                      autoComplete="organization"
                      placeholder="Název firmy"
                      className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-400"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="email"
                      className="mb-2 block text-sm font-semibold text-slate-300"
                    >
                      E-mail *
                    </label>

                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(event) =>
                        setEmail(event.target.value)
                      }
                      required
                      autoComplete="email"
                      placeholder="jan@firma.cz"
                      className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-400"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="phone"
                      className="mb-2 block text-sm font-semibold text-slate-300"
                    >
                      Telefon
                    </label>

                    <input
                      id="phone"
                      type="tel"
                      value={phone}
                      onChange={(event) =>
                        setPhone(event.target.value)
                      }
                      autoComplete="tel"
                      placeholder="+420 777 123 456"
                      className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-400"
                    />
                  </div>
                </div>

                <div className="mt-6">
                  <label
                    htmlFor="message"
                    className="mb-2 block text-sm font-semibold text-slate-300"
                  >
                    Co vás zajímá?
                  </label>

                  <textarea
                    id="message"
                    value={message}
                    onChange={(event) =>
                      setMessage(event.target.value)
                    }
                    rows={5}
                    placeholder="Napište nám například, jak AEGRIS plánujete využívat..."
                    className="w-full resize-none rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-400"
                  />
                </div>

                {errorMessage && (
                  <div className="mt-6 rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-400">
                    {errorMessage}
                  </div>
                )}

                <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <Link
                    href="/"
                    className="text-sm font-semibold text-slate-400 transition hover:text-white"
                  >
                    ← Zpět na AEGRIS
                  </Link>

                  <button
                    type="submit"
                    disabled={loading}
                    className="rounded-xl bg-cyan-500 px-7 py-3 font-bold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {loading
                      ? "Odesílám..."
                      : "Odeslat žádost"}
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-10 text-center shadow-2xl">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-cyan-500/10 text-3xl text-cyan-400">
                ✓
              </div>

              <p className="mt-8 text-sm font-bold uppercase tracking-[0.2em] text-cyan-400">
                AEGRIS
              </p>

              <h1 className="mt-4 text-4xl font-bold">
                Děkujeme za váš zájem.
              </h1>

              <p className="mx-auto mt-5 max-w-xl text-lg leading-8 text-slate-400">
                Vaši žádost o DEMO jsme přijali.
                Ozveme se vám s dalšími informacemi.
              </p>

              <Link
                href="/"
                className="mt-8 inline-block rounded-xl bg-cyan-500 px-7 py-3 font-bold text-slate-950 transition hover:bg-cyan-400"
              >
                Zpět na AEGRIS
              </Link>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
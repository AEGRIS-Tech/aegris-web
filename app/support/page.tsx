"use client";

import {
  FormEvent,
  useCallback,
  useEffect,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";

import BackButton from "../components/BackButton";
import { supabase } from "@/lib/supabase";

type SupportTicket = {
  id: number;
  subject: string;
  message: string;
  status: string;
  priority: string;
  created_at: string;
  updated_at: string;
  resolved_at: string | null;
};

function formatDate(value: string | null) {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat("cs-CZ", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function getStatusLabel(status: string) {
  if (status === "open") {
    return "Otevřený";
  }

  if (status === "in_progress") {
    return "Řeší se";
  }

  if (status === "resolved") {
    return "Vyřešený";
  }

  if (status === "closed") {
    return "Uzavřený";
  }

  return status;
}

function getStatusClasses(status: string) {
  if (status === "open") {
    return "border-amber-500/30 bg-amber-500/10 text-amber-300";
  }

  if (status === "in_progress") {
    return "border-cyan-500/30 bg-cyan-500/10 text-cyan-300";
  }

  if (status === "resolved") {
    return "border-emerald-500/30 bg-emerald-500/10 text-emerald-300";
  }

  if (status === "closed") {
    return "border-slate-700 bg-slate-800 text-slate-400";
  }

  return "border-slate-700 bg-slate-800 text-slate-300";
}

export default function SupportPage() {
  const router = useRouter();

  const [user, setUser] =
    useState<User | null>(null);

  const [tickets, setTickets] =
    useState<SupportTicket[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [ticketsLoading, setTicketsLoading] =
    useState(true);

  const [subject, setSubject] =
    useState("");

  const [message, setMessage] =
    useState("");

  const [submitting, setSubmitting] =
    useState(false);

  const [errorMessage, setErrorMessage] =
    useState("");

  const [successMessage, setSuccessMessage] =
    useState("");

  const loadTickets = useCallback(
    async (currentUser: User) => {
      setTicketsLoading(true);

      const { data, error } = await supabase
        .from("support_tickets")
        .select(
          `
            id,
            subject,
            message,
            status,
            priority,
            created_at,
            updated_at,
            resolved_at
          `
        )
        .eq("user_id", currentUser.id)
        .order("created_at", {
          ascending: false,
        });

      if (error) {
        console.error(
          "SUPPORT TICKETS LOAD ERROR:",
          error
        );

        setErrorMessage(
          "Support požadavky se nepodařilo načíst."
        );

        setTicketsLoading(false);
        return;
      }

      setTickets(
        (data ?? []) as SupportTicket[]
      );

      setTicketsLoading(false);
    },
    []
  );

  useEffect(() => {
    let active = true;

    async function initialize() {
      const {
        data: {
          user: currentUser,
        },
      } =
        await supabase.auth.getUser();

      if (!active) {
        return;
      }

      if (!currentUser) {
        router.replace(
          "/login?next=/support"
        );
        return;
      }

      setUser(currentUser);
      setLoading(false);

      await loadTickets(currentUser);
    }

    void initialize();

    return () => {
      active = false;
    };
  }, [loadTickets, router]);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (submitting) {
      return;
    }

    setErrorMessage("");
    setSuccessMessage("");

    const normalizedSubject =
      subject.trim();

    const normalizedMessage =
      message.trim();

    if (
      normalizedSubject.length < 3 ||
      normalizedSubject.length > 160
    ) {
      setErrorMessage(
        "Předmět musí mít 3 až 160 znaků."
      );
      return;
    }

    if (
      normalizedMessage.length < 10 ||
      normalizedMessage.length > 5000
    ) {
      setErrorMessage(
        "Popis problému musí mít 10 až 5000 znaků."
      );
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch(
        "/api/support",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            subject:
              normalizedSubject,
            message:
              normalizedMessage,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setErrorMessage(
          typeof data?.error ===
            "string"
            ? data.error
            : "Support požadavek se nepodařilo odeslat."
        );

        return;
      }

      setSubject("");
      setMessage("");

      setSuccessMessage(
        `Požadavek #${data.ticket.id} byl úspěšně odeslán.`
      );

      if (user) {
        await loadTickets(user);
      }
    } catch (error) {
      console.error(
        "SUPPORT SUBMIT ERROR:",
        error
      );

      setErrorMessage(
        "Support požadavek se nepodařilo odeslat."
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-400">
        Načítám support...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#020617] text-white">
      <div className="mx-auto max-w-[1100px] px-6 py-7">
        <BackButton />

        <div className="mb-8 mt-5">
          <div className="text-xs uppercase tracking-[0.25em] text-cyan-400">
            AEGRIS / SUPPORT
          </div>

          <h1 className="mt-2 text-4xl font-black tracking-tight md:text-5xl">
            Support
          </h1>

          <p className="mt-2 text-slate-500">
            Kontaktujte podporu AEGRIS a sledujte stav svých požadavků.
          </p>
        </div>

        <div className="space-y-6">
          <section className="rounded-3xl border border-slate-800 bg-slate-950/60 p-6">
            <div className="text-xs uppercase tracking-[0.2em] text-cyan-400">
              Nový požadavek
            </div>

            <h2 className="mt-2 text-xl font-bold">
              Kontaktovat podporu
            </h2>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              Popište problém co nejpřesněji. Support požadavek bude
              automaticky propojen s vaším AEGRIS účtem.
            </p>

            <div className="mt-5 rounded-2xl border border-slate-800 bg-slate-900/50 p-4">
              <div className="text-xs uppercase tracking-wide text-slate-500">
                Přihlášený účet
              </div>

              <div className="mt-2 font-semibold">
                {user?.email ?? "—"}
              </div>
            </div>

            <form
              onSubmit={handleSubmit}
              className="mt-6 space-y-5"
            >
              <label className="block">
                <span className="text-sm text-slate-400">
                  Předmět
                </span>

                <input
                  type="text"
                  value={subject}
                  onChange={(event) => {
                    setSubject(
                      event.target.value
                    );
                    setErrorMessage("");
                    setSuccessMessage("");
                  }}
                  maxLength={160}
                  placeholder="Např. problém s analýzou projektu"
                  className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none placeholder:text-slate-600 focus:border-cyan-400"
                />

                <div className="mt-1 text-right text-xs text-slate-600">
                  {subject.length}/160
                </div>
              </label>

              <label className="block">
                <span className="text-sm text-slate-400">
                  Popis problému
                </span>

                <textarea
                  value={message}
                  onChange={(event) => {
                    setMessage(
                      event.target.value
                    );
                    setErrorMessage("");
                    setSuccessMessage("");
                  }}
                  maxLength={5000}
                  rows={7}
                  placeholder="Popište, co se stalo, u kterého projektu a co jste očekávali..."
                  className="mt-2 w-full resize-y rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none placeholder:text-slate-600 focus:border-cyan-400"
                />

                <div className="mt-1 text-right text-xs text-slate-600">
                  {message.length}/5000
                </div>
              </label>

              {errorMessage && (
                <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                  {errorMessage}
                </div>
              )}

              {successMessage && (
                <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
                  {successMessage}
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="rounded-xl bg-cyan-500 px-5 py-3 font-bold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {submitting
                  ? "Odesílám..."
                  : "Odeslat požadavek"}
              </button>
            </form>
          </section>

          <section className="rounded-3xl border border-slate-800 bg-slate-950/60 p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="text-xs uppercase tracking-[0.2em] text-cyan-400">
                  Moje požadavky
                </div>

                <h2 className="mt-2 text-xl font-bold">
                  Historie supportu
                </h2>

                <p className="mt-2 text-sm text-slate-500">
                  Zde uvidíte aktuální stav svých požadavků.
                </p>
              </div>

              <div className="rounded-full border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs font-medium text-slate-300">
                {tickets.length} ticketů
              </div>
            </div>

            {ticketsLoading ? (
              <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-900/50 px-5 py-10 text-center text-sm text-slate-500">
                Načítám požadavky...
              </div>
            ) : tickets.length === 0 ? (
              <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-900/50 px-5 py-10 text-center">
                <div className="font-semibold text-slate-300">
                  Zatím žádné požadavky
                </div>

                <p className="mt-2 text-sm text-slate-500">
                  Jakmile kontaktujete podporu, požadavek se zobrazí zde.
                </p>
              </div>
            ) : (
              <div className="mt-6 space-y-3">
                {tickets.map((ticket) => (
                  <article
                    key={ticket.id}
                    className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5"
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-3">
                          <h3 className="font-semibold text-slate-100">
                            {ticket.subject}
                          </h3>

                          <span
                            className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${getStatusClasses(
                              ticket.status
                            )}`}
                          >
                            {getStatusLabel(
                              ticket.status
                            )}
                          </span>
                        </div>

                        <div className="mt-2 text-xs text-slate-600">
                          Ticket #{ticket.id} ·{" "}
                          {formatDate(
                            ticket.created_at
                          )}
                        </div>
                      </div>

                      <div className="text-xs uppercase tracking-wider text-slate-500">
                        Priorita:{" "}
                        <span className="text-slate-300">
                          {ticket.priority}
                        </span>
                      </div>
                    </div>

                    <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-slate-400">
                      {ticket.message}
                    </p>

                    {ticket.resolved_at && (
                      <div className="mt-4 border-t border-slate-800 pt-4 text-xs text-emerald-400">
                        Vyřešeno{" "}
                        {formatDate(
                          ticket.resolved_at
                        )}
                      </div>
                    )}
                  </article>
                ))}
              </div>
            )}
          </section>

          <div className="rounded-2xl border border-slate-800 bg-slate-950/40 p-5 text-sm text-slate-500">
            <div className="font-semibold text-slate-300">
              AEGRIS Support
            </div>

            <div className="mt-1">
              Agriculture Intelligence · zákaznická podpora
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
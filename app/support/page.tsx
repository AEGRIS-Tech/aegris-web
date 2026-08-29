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

type SupportMessage = {
  id: number;
  ticket_id: number;
  author_user_id: string | null;
  author_role: "customer" | "admin";
  message: string;
  created_at: string;
};

type ConversationState = {
  loading: boolean;
  messages: SupportMessage[];
  reply: string;
  submitting: boolean;
  error: string;
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
  switch (status) {
    case "open":
      return "Otevřený";
    case "in_progress":
      return "V řešení";
    case "resolved":
      return "Vyřešený";
    default:
      return status;
  }
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

  return "border-slate-700 bg-slate-800 text-slate-300";
}

function getPriorityLabel(priority: string) {
  switch (priority) {
    case "low":
      return "Nízká";
    case "normal":
      return "Normální";
    case "high":
      return "Vysoká";
    case "urgent":
      return "Urgentní";
    default:
      return priority;
  }
}

export default function SupportPage() {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);

  const [tickets, setTickets] =
    useState<SupportTicket[]>([]);

  const [loading, setLoading] = useState(true);

  const [ticketsLoading, setTicketsLoading] =
    useState(true);

  const [subject, setSubject] = useState("");

  const [message, setMessage] = useState("");

  const [submitting, setSubmitting] =
    useState(false);

  const [errorMessage, setErrorMessage] =
    useState("");

  const [successMessage, setSuccessMessage] =
    useState("");

  const [openTicketId, setOpenTicketId] =
    useState<number | null>(null);

  const [conversations, setConversations] =
    useState<Record<number, ConversationState>>({});

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

      setTickets((data ?? []) as SupportTicket[]);
      setTicketsLoading(false);
    },
    []
  );

  const loadConversation = useCallback(
    async (ticketId: number) => {
      setConversations((current) => ({
        ...current,
        [ticketId]: {
          loading: true,
          messages:
            current[ticketId]?.messages ?? [],
          reply: current[ticketId]?.reply ?? "",
          submitting: false,
          error: "",
        },
      }));

      try {
        const response = await fetch(
          `/api/support/${ticketId}/messages`,
          {
            method: "GET",
            cache: "no-store",
          }
        );

        const data = await response.json();

        if (!response.ok || !data?.ok) {
          throw new Error(
            typeof data?.error === "string"
              ? data.error
              : "Konverzaci se nepodařilo načíst."
          );
        }

        setConversations((current) => ({
          ...current,
          [ticketId]: {
            loading: false,
            messages:
              (data.messages ?? []) as SupportMessage[],
            reply:
              current[ticketId]?.reply ?? "",
            submitting: false,
            error: "",
          },
        }));
      } catch (error) {
        console.error(
          "SUPPORT CONVERSATION LOAD ERROR:",
          error
        );

        setConversations((current) => ({
          ...current,
          [ticketId]: {
            loading: false,
            messages:
              current[ticketId]?.messages ?? [],
            reply:
              current[ticketId]?.reply ?? "",
            submitting: false,
            error:
              error instanceof Error
                ? error.message
                : "Konverzaci se nepodařilo načíst.",
          },
        }));
      }
    },
    []
  );

  useEffect(() => {
    let active = true;

    async function initialize() {
      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser();

      if (!active) {
        return;
      }

      if (!currentUser) {
        router.replace("/login?next=/support");
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

    const normalizedSubject = subject.trim();
    const normalizedMessage = message.trim();

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
      const response = await fetch("/api/support", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          subject: normalizedSubject,
          message: normalizedMessage,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data?.ok) {
        setErrorMessage(
          typeof data?.error === "string"
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

  async function toggleConversation(ticketId: number) {
    if (openTicketId === ticketId) {
      setOpenTicketId(null);
      return;
    }

    setOpenTicketId(ticketId);
    await loadConversation(ticketId);
  }

  function updateReply(
    ticketId: number,
    value: string
  ) {
    setConversations((current) => ({
      ...current,
      [ticketId]: {
        loading:
          current[ticketId]?.loading ?? false,
        messages:
          current[ticketId]?.messages ?? [],
        reply: value,
        submitting:
          current[ticketId]?.submitting ?? false,
        error: "",
      },
    }));
  }

  async function submitReply(
    event: FormEvent<HTMLFormElement>,
    ticket: SupportTicket
  ) {
    event.preventDefault();

    const conversation =
      conversations[ticket.id];

    if (
      !conversation ||
      conversation.submitting ||
      ticket.status === "resolved"
    ) {
      return;
    }

    const normalizedReply =
      conversation.reply.trim();

    if (
      normalizedReply.length < 1 ||
      normalizedReply.length > 10000
    ) {
      setConversations((current) => ({
        ...current,
        [ticket.id]: {
          ...current[ticket.id],
          error:
            "Odpověď musí obsahovat 1 až 10 000 znaků.",
        },
      }));

      return;
    }

    setConversations((current) => ({
      ...current,
      [ticket.id]: {
        ...current[ticket.id],
        submitting: true,
        error: "",
      },
    }));

    try {
      const response = await fetch(
        `/api/support/${ticket.id}/messages`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message: normalizedReply,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data?.ok) {
        throw new Error(
          typeof data?.error === "string"
            ? data.error
            : "Odpověď se nepodařilo odeslat."
        );
      }

      setConversations((current) => ({
        ...current,
        [ticket.id]: {
          ...current[ticket.id],
          reply: "",
          submitting: false,
          error: "",
        },
      }));

      await loadConversation(ticket.id);

      if (user) {
        await loadTickets(user);
      }
    } catch (error) {
      console.error(
        "SUPPORT REPLY ERROR:",
        error
      );

      setConversations((current) => ({
        ...current,
        [ticket.id]: {
          ...current[ticket.id],
          submitting: false,
          error:
            error instanceof Error
              ? error.message
              : "Odpověď se nepodařilo odeslat.",
        },
      }));
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
            Kontaktujte podporu AEGRIS a sledujte stav
            svých požadavků.
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
              Popište problém co nejpřesněji. Support
              požadavek bude automaticky propojen s vaším
              AEGRIS účtem.
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
                    setSubject(event.target.value);
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
                    setMessage(event.target.value);
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
                  Otevřete ticket a zobrazte kompletní
                  komunikaci s AEGRIS Supportem.
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
                  Jakmile kontaktujete podporu, požadavek se
                  zobrazí zde.
                </p>
              </div>
            ) : (
              <div className="mt-6 space-y-4">
                {tickets.map((ticket) => {
                  const isOpen =
                    openTicketId === ticket.id;

                  const conversation =
                    conversations[ticket.id];

                  const isResolved =
                    ticket.status === "resolved";

                  return (
                    <article
                      key={ticket.id}
                      className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/50"
                    >
                      <button
                        type="button"
                        onClick={() =>
                          void toggleConversation(
                            ticket.id
                          )
                        }
                        className="w-full p-5 text-left transition hover:bg-white/[0.02]"
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

                          <div className="flex items-center gap-4">
                            <div className="text-xs uppercase tracking-wider text-slate-500">
                              Priorita:{" "}
                              <span className="text-slate-300">
                                {getPriorityLabel(
                                  ticket.priority
                                )}
                              </span>
                            </div>

                            <span className="text-sm font-medium text-cyan-400">
                              {isOpen
                                ? "Skrýt"
                                : "Otevřít"}
                            </span>
                          </div>
                        </div>
                      </button>

                      {isOpen && (
                        <div className="border-t border-slate-800 p-5">
                          {conversation?.loading ? (
                            <div className="py-8 text-center text-sm text-slate-500">
                              Načítám konverzaci...
                            </div>
                          ) : (
                            <div className="space-y-4">
                              <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-4">
                                <div className="flex flex-wrap items-center justify-between gap-3">
                                  <div>
                                    <div className="text-sm font-semibold text-slate-200">
                                      Vy
                                    </div>

                                    <div className="mt-1 text-xs text-slate-600">
                                      Původní zpráva
                                    </div>
                                  </div>

                                  <div className="text-xs text-slate-600">
                                    {formatDate(
                                      ticket.created_at
                                    )}
                                  </div>
                                </div>

                                <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-400">
                                  {ticket.message}
                                </p>
                              </div>

                              {conversation?.messages.map(
                                (supportMessage) => {
                                  const isAdmin =
                                    supportMessage.author_role ===
                                    "admin";

                                  return (
                                    <div
                                      key={
                                        supportMessage.id
                                      }
                                      className={
                                        isAdmin
                                          ? "ml-auto max-w-[92%] rounded-xl border border-cyan-500/20 bg-cyan-500/[0.08] p-4"
                                          : "mr-auto max-w-[92%] rounded-xl border border-slate-800 bg-slate-950/50 p-4"
                                      }
                                    >
                                      <div className="flex flex-wrap items-center justify-between gap-3">
                                        <div>
                                          <div
                                            className={
                                              isAdmin
                                                ? "text-sm font-semibold text-cyan-300"
                                                : "text-sm font-semibold text-slate-200"
                                            }
                                          >
                                            {isAdmin
                                              ? "AEGRIS Support"
                                              : "Vy"}
                                          </div>

                                          <div className="mt-1 text-xs text-slate-600">
                                            {isAdmin
                                              ? "Odpověď podpory"
                                              : "Vaše odpověď"}
                                          </div>
                                        </div>

                                        <div className="text-xs text-slate-600">
                                          {formatDate(
                                            supportMessage.created_at
                                          )}
                                        </div>
                                      </div>

                                      <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-300">
                                        {
                                          supportMessage.message
                                        }
                                      </p>
                                    </div>
                                  );
                                }
                              )}

                              {conversation &&
                                conversation.messages
                                  .length === 0 && (
                                  <div className="rounded-xl border border-dashed border-slate-800 px-4 py-5 text-sm text-slate-500">
                                    Zatím zde nejsou žádné
                                    další zprávy.
                                  </div>
                                )}

                              {conversation?.error && (
                                <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                                  {conversation.error}
                                </div>
                              )}

                              {isResolved ? (
                                <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-4 text-sm text-emerald-300">
                                  Tento ticket byl vyřešen{" "}
                                  {formatDate(
                                    ticket.resolved_at
                                  )}
                                  . Další odpovědi jsou
                                  uzamčeny.
                                </div>
                              ) : (
                                <form
                                  onSubmit={(event) =>
                                    void submitReply(
                                      event,
                                      ticket
                                    )
                                  }
                                  className="border-t border-slate-800 pt-5"
                                >
                                  <label className="block">
                                    <span className="text-sm font-medium text-slate-300">
                                      Odpovědět
                                    </span>

                                    <textarea
                                      value={
                                        conversation
                                          ?.reply ?? ""
                                      }
                                      onChange={(
                                        event
                                      ) =>
                                        updateReply(
                                          ticket.id,
                                          event.target
                                            .value
                                        )
                                      }
                                      maxLength={10000}
                                      rows={5}
                                      placeholder="Napište odpověď AEGRIS Supportu..."
                                      className="mt-2 w-full resize-y rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-cyan-400"
                                    />
                                  </label>

                                  <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
                                    <div className="text-xs text-slate-600">
                                      {conversation
                                        ?.reply.length ??
                                        0}{" "}
                                      / 10 000
                                    </div>

                                    <button
                                      type="submit"
                                      disabled={
                                        conversation
                                          ?.submitting ||
                                        !conversation?.reply.trim()
                                      }
                                      className="rounded-xl bg-cyan-500 px-5 py-2.5 text-sm font-bold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                      {conversation
                                        ?.submitting
                                        ? "Odesílám..."
                                        : "Odeslat odpověď"}
                                    </button>
                                  </div>
                                </form>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </article>
                  );
                })}
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
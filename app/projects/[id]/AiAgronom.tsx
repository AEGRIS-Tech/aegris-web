"use client";

import {
  FormEvent,
  ReactNode,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

type AiAgronomProps = {
  projectId: number;
};

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  text: string;
};

type AiAgronomResponse = {
  answer?: string;
  error?: string;
  code?: string;
  meta?: {
    projectId?: number;
    analysisId?: number | null;
    model?: string;
    generatedAt?: string;
    decisionSource?: string;
    dataCompletenessPct?: number | null;
  };
};

const QUICK_QUESTIONS = [
  "Zhodnoť tento pozemek.",
  "Co je teď největší riziko?",
  "Co mám dnes zkontrolovat na poli?",
  "Jak je na tom voda?",
  "Jak je na tom výživa?",
  "Jaká důležitá data chybí?",
];

function createMessageId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

/*
 * Jednoduchý bezpečný Markdown renderer.
 *
 * Záměrně nepoužívá dangerouslySetInnerHTML.
 * Podporuje formát, který používá AI Agronom:
 * - ## nadpis
 * - ### podnadpis
 * - **tučný text**
 * - odrážky
 * - číslované kroky
 * - běžné odstavce
 */
function renderInlineMarkdown(text: string): ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);

  return parts.map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong
          key={`${part}-${index}`}
          className="font-black text-slate-100"
        >
          {part.slice(2, -2)}
        </strong>
      );
    }

    return part;
  });
}

function MarkdownText({ text }: { text: string }) {
  const lines = text.replace(/\r\n/g, "\n").split("\n");

  return (
    <div className="space-y-2.5">
      {lines.map((rawLine, index) => {
        const line = rawLine.trim();

        if (!line) {
          return <div key={`blank-${index}`} className="h-1" />;
        }

        if (line.startsWith("### ")) {
          return (
            <h4
              key={`h3-${index}`}
              className="pt-2 text-sm font-black tracking-tight text-slate-100"
            >
              {renderInlineMarkdown(line.slice(4))}
            </h4>
          );
        }

        if (line.startsWith("## ")) {
          return (
            <h3
              key={`h2-${index}`}
              className="pt-3 text-base font-black tracking-tight text-white first:pt-0"
            >
              {renderInlineMarkdown(line.slice(3))}
            </h3>
          );
        }

        if (/^[-•]\s+/.test(line)) {
          return (
            <div
              key={`bullet-${index}`}
              className="flex gap-2.5 text-sm leading-6 text-slate-300"
            >
              <span className="mt-[9px] h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-400" />
              <div>{renderInlineMarkdown(line.replace(/^[-•]\s+/, ""))}</div>
            </div>
          );
        }

        const numberedMatch = line.match(/^(\d+)[.)]\s+(.*)$/);

        if (numberedMatch) {
          return (
            <div
              key={`number-${index}`}
              className="flex gap-3 text-sm leading-6 text-slate-300"
            >
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-cyan-400/10 px-1.5 text-[10px] font-black text-cyan-300">
                {numberedMatch[1]}
              </span>

              <div className="-mt-0.5">
                {renderInlineMarkdown(numberedMatch[2])}
              </div>
            </div>
          );
        }

        return (
          <p
            key={`paragraph-${index}`}
            className="text-sm leading-6 text-slate-300"
          >
            {renderInlineMarkdown(line)}
          </p>
        );
      })}
    </div>
  );
}

export default function AiAgronom({ projectId }: AiAgronomProps) {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const chatEndRef = useRef<HTMLDivElement | null>(null);

  const canSubmit = useMemo(() => {
    return input.trim().length > 0 && !isLoading;
  }, [input, isLoading]);

  useEffect(() => {
    if (messages.length === 0 && !isLoading) {
      return;
    }

    chatEndRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
    });
  }, [messages, isLoading]);

  async function askAgronom(question: string) {
    const trimmedQuestion = question.trim();

    if (!trimmedQuestion || isLoading) {
      return;
    }

    if (trimmedQuestion.length > 2000) {
      setError("Dotaz může mít maximálně 2000 znaků.");
      return;
    }

    setError(null);
    setIsLoading(true);

    const userMessage: ChatMessage = {
      id: createMessageId(),
      role: "user",
      text: trimmedQuestion,
    };

    setMessages((current) => [...current, userMessage]);
    setInput("");

    try {
      const response = await fetch("/api/ai-agronom", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          projectId,
          message: trimmedQuestion,
        }),
      });

      let data: AiAgronomResponse;

      try {
        data = (await response.json()) as AiAgronomResponse;
      } catch {
        throw new Error(
          "Server AI Agronoma vrátil neplatnou odpověď."
        );
      }

      if (!response.ok) {
        throw new Error(
          data.error ||
            `AI Agronom vrátil chybu serveru (${response.status}).`
        );
      }

      if (!data.answer?.trim()) {
        throw new Error("AI Agronom nevytvořil odpověď.");
      }

      const assistantMessage: ChatMessage = {
        id: createMessageId(),
        role: "assistant",
        text: data.answer.trim(),
      };

      setMessages((current) => [...current, assistantMessage]);
    } catch (caughtError) {
      console.error("AI AGRONOM CLIENT ERROR:", caughtError);

      const message =
        caughtError instanceof Error
          ? caughtError.message
          : "AI Agronom momentálně není dostupný.";

      setError(message);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!canSubmit) {
      return;
    }

    await askAgronom(input);
  }

  return (
    <section className="mt-3 rounded-[28px] border border-slate-800 bg-[#081018] p-5 shadow-2xl shadow-black/10 md:p-7">
      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <span className="inline-flex h-2.5 w-2.5 rounded-full bg-cyan-400" />

              <p className="text-xs font-black uppercase tracking-[0.22em] text-cyan-400">
                AEGRIS Intelligence
              </p>
            </div>

            <h2 className="text-2xl font-black tracking-tight text-white">
              AI Agronom
            </h2>

            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">
              Vysvětluje aktuální stav pozemku z dat AEGRIS,
              Decision Enginu, satelitního monitoringu, počasí,
              půdního kontextu a agronomických dat.
            </p>
          </div>

          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />

            <span className="text-[11px] font-black uppercase tracking-[0.16em] text-emerald-300">
              Připraven
            </span>
          </div>
        </div>

        {messages.length === 0 ? (
          <div className="rounded-2xl border border-slate-800 bg-slate-950/40 p-4 md:p-5">
            <p className="text-sm font-bold text-slate-200">
              Na co se můžete zeptat
            </p>

            <div className="mt-4 flex flex-wrap gap-2">
              {QUICK_QUESTIONS.map((question) => (
                <button
                  key={question}
                  type="button"
                  onClick={() => void askAgronom(question)}
                  disabled={isLoading}
                  className="rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-left text-xs font-semibold text-slate-300 transition hover:border-cyan-500/50 hover:bg-slate-800 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {question}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="max-h-[560px] space-y-4 overflow-y-auto rounded-2xl border border-slate-800 bg-slate-950/40 p-4 pr-2 md:p-5 md:pr-3">
            {messages.map((message) => {
              const isUser = message.role === "user";

              return (
                <div
                  key={message.id}
                  className={`flex ${
                    isUser ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={
                      isUser
                        ? "max-w-[90%] rounded-2xl rounded-br-md border border-cyan-500/20 bg-cyan-500/10 px-4 py-3 text-sm leading-6 text-cyan-50 md:max-w-[75%]"
                        : "max-w-[96%] rounded-2xl rounded-bl-md border border-slate-700 bg-[#101827] px-4 py-4 text-sm leading-6 text-slate-200 md:max-w-[92%] md:px-5 md:py-5"
                    }
                  >
                    {!isUser && (
                      <div className="mb-3 flex items-center gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />

                        <div className="text-[10px] font-black uppercase tracking-[0.18em] text-cyan-400">
                          AI Agronom
                        </div>
                      </div>
                    )}

                    {isUser ? (
                      <div className="whitespace-pre-wrap">
                        {message.text}
                      </div>
                    ) : (
                      <MarkdownText text={message.text} />
                    )}
                  </div>
                </div>
              );
            })}

            {isLoading && (
              <div className="flex justify-start">
                <div className="rounded-2xl rounded-bl-md border border-slate-700 bg-[#101827] px-4 py-3">
                  <div className="flex items-center gap-2.5">
                    <span className="h-2 w-2 animate-pulse rounded-full bg-cyan-400" />

                    <span className="text-xs font-semibold text-slate-400">
                      AI Agronom vyhodnocuje data pozemku…
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>
        )}

        {messages.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {QUICK_QUESTIONS.slice(1).map((question) => (
              <button
                key={question}
                type="button"
                onClick={() => void askAgronom(question)}
                disabled={isLoading}
                className="rounded-lg border border-slate-800 bg-slate-950/40 px-3 py-1.5 text-[11px] font-semibold text-slate-500 transition hover:border-cyan-500/40 hover:text-slate-200 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {question}
              </button>
            ))}
          </div>
        )}

        {error && (
          <div
            role="alert"
            className="rounded-xl border border-red-500/25 bg-red-500/10 px-4 py-3 text-sm text-red-200"
          >
            {error}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-slate-800 bg-slate-950/50 p-3"
        >
          <div className="flex flex-col gap-3 md:flex-row">
            <textarea
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Zeptejte se AI Agronoma na tento pozemek…"
              rows={3}
              maxLength={2000}
              disabled={isLoading}
              className="min-h-[88px] flex-1 resize-none rounded-xl border border-slate-800 bg-[#0b141d] px-4 py-3 text-sm leading-6 text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-500/60 focus:ring-1 focus:ring-cyan-500/20 disabled:cursor-not-allowed disabled:opacity-60"
            />

            <button
              type="submit"
              disabled={!canSubmit}
              className="min-w-[150px] rounded-xl bg-cyan-400 px-5 py-3 text-sm font-black text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:bg-slate-800 disabled:text-slate-500 md:self-stretch"
            >
              {isLoading ? "Vyhodnocuji…" : "Zeptat se"}
            </button>
          </div>

          <div className="mt-2 flex items-center justify-between gap-3 px-1">
            <p className="text-[10px] leading-4 text-slate-600">
              AI Agronom vysvětluje data AEGRIS. Nenahrazuje
              terénní kontrolu ani odborné rozhodnutí agronoma.
            </p>

            <span className="shrink-0 text-[10px] tabular-nums text-slate-600">
              {input.length}/2000
            </span>
          </div>
        </form>
      </div>
    </section>
  );
}
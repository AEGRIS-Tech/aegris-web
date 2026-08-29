"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type DemoRequestActionsProps = {
  requestId: number;
  status: string;
  accountType?: string | null;
  demoExpiresAt?: string | null;
};

type Mode =
  | "approve"
  | "reject"
  | "extend"
  | "terminate"
  | "convert"
  | null;

export default function DemoRequestActions({
  requestId,
  status,
  accountType = null,
  demoExpiresAt = null,
}: DemoRequestActionsProps) {
  const router = useRouter();

  const [mode, setMode] = useState<Mode>(null);

  const [durationPreset, setDurationPreset] =
    useState("14");

  const [customDuration, setCustomDuration] =
    useState("14");

  const [rejectionReason, setRejectionReason] =
    useState("");

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState<string | null>(
    null
  );

  function reset() {
    setMode(null);
    setError(null);
    setRejectionReason("");
    setDurationPreset("14");
    setCustomDuration("14");
  }

  function getDurationDays() {
    const durationDays =
      durationPreset === "custom"
        ? Number(customDuration)
        : Number(durationPreset);

    if (
      !Number.isInteger(durationDays) ||
      durationDays < 1 ||
      durationDays > 365
    ) {
      return null;
    }

    return durationDays;
  }

  async function performAction(
    body: Record<string, unknown>,
    fallbackError: string
  ) {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/admin/demo/${requestId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.ok) {
        throw new Error(
          data.error ?? fallbackError
        );
      }

      reset();
      router.refresh();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : fallbackError
      );
    } finally {
      setLoading(false);
    }
  }

  async function approve() {
    const durationDays = getDurationDays();

    if (!durationDays) {
      setError(
        "Délka DEMO musí být 1 až 365 dní."
      );
      return;
    }

    await performAction(
      {
        action: "approve",
        durationDays,
      },
      "Schválení DEMO se nepodařilo."
    );
  }

  async function reject() {
    if (rejectionReason.length > 2000) {
      setError(
        "Důvod zamítnutí může mít maximálně 2000 znaků."
      );
      return;
    }

    await performAction(
      {
        action: "reject",
        rejectionReason,
      },
      "Zamítnutí DEMO se nepodařilo."
    );
  }

  async function extend() {
    const durationDays = getDurationDays();

    if (!durationDays) {
      setError(
        "Prodloužení musí být 1 až 365 dní."
      );
      return;
    }

    await performAction(
      {
        action: "extend",
        durationDays,
      },
      "Prodloužení DEMO se nepodařilo."
    );
  }

  async function terminate() {
    await performAction(
      {
        action: "terminate",
      },
      "Ukončení DEMO se nepodařilo."
    );
  }

  async function convert() {
    await performAction(
      {
        action: "convert",
      },
      "Převod na aktivního zákazníka se nepodařil."
    );
  }

  function renderDurationForm(
    title: string,
    confirmLabel: string,
    onConfirm: () => void
  ) {
    return (
      <div className="min-w-[230px] space-y-3">
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-400">
            {title}
          </label>

          <select
            value={durationPreset}
            disabled={loading}
            onChange={(event) =>
              setDurationPreset(
                event.target.value
              )
            }
            className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-200 outline-none transition focus:border-cyan-500"
          >
            <option value="7">7 dní</option>
            <option value="14">14 dní</option>
            <option value="30">30 dní</option>
            <option value="custom">
              Vlastní délka
            </option>
          </select>
        </div>

        {durationPreset === "custom" && (
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-400">
              Počet dní
            </label>

            <input
              type="number"
              min={1}
              max={365}
              value={customDuration}
              disabled={loading}
              onChange={(event) =>
                setCustomDuration(
                  event.target.value
                )
              }
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-200 outline-none transition focus:border-cyan-500"
            />
          </div>
        )}

        {error && (
          <p className="text-xs leading-5 text-rose-300">
            {error}
          </p>
        )}

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={loading}
            onClick={onConfirm}
            className="rounded-lg bg-emerald-500 px-3 py-2 text-xs font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading
              ? "Ukládám..."
              : confirmLabel}
          </button>

          <button
            type="button"
            disabled={loading}
            onClick={reset}
            className="rounded-lg border border-slate-700 px-3 py-2 text-xs font-medium text-slate-300 transition hover:bg-slate-800 disabled:opacity-50"
          >
            Zrušit
          </button>
        </div>
      </div>
    );
  }

  if (mode === "approve") {
    return renderDurationForm(
      "Délka DEMO",
      "Potvrdit schválení",
      approve
    );
  }

  if (mode === "extend") {
    return (
      <div className="space-y-2">
        {demoExpiresAt && (
          <p className="text-xs text-slate-500">
            Aktuální expirace:{" "}
            {new Intl.DateTimeFormat(
              "cs-CZ",
              {
                dateStyle: "short",
                timeStyle: "short",
              }
            ).format(
              new Date(demoExpiresAt)
            )}
          </p>
        )}

        {renderDurationForm(
          "Prodloužit o",
          "Potvrdit prodloužení",
          extend
        )}
      </div>
    );
  }

  if (mode === "reject") {
    return (
      <div className="min-w-[240px] space-y-3">
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-400">
            Interní důvod
          </label>

          <textarea
            rows={3}
            maxLength={2000}
            value={rejectionReason}
            disabled={loading}
            placeholder="Volitelné..."
            onChange={(event) =>
              setRejectionReason(
                event.target.value
              )
            }
            className="w-full resize-none rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-200 outline-none transition placeholder:text-slate-600 focus:border-rose-500"
          />
        </div>

        {error && (
          <p className="text-xs leading-5 text-rose-300">
            {error}
          </p>
        )}

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={loading}
            onClick={reject}
            className="rounded-lg bg-rose-500 px-3 py-2 text-xs font-semibold text-white transition hover:bg-rose-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading
              ? "Zamítám..."
              : "Potvrdit zamítnutí"}
          </button>

          <button
            type="button"
            disabled={loading}
            onClick={reset}
            className="rounded-lg border border-slate-700 px-3 py-2 text-xs font-medium text-slate-300 transition hover:bg-slate-800 disabled:opacity-50"
          >
            Zrušit
          </button>
        </div>
      </div>
    );
  }

  if (mode === "terminate") {
    return (
      <div className="min-w-[250px] space-y-3 rounded-xl border border-rose-500/20 bg-rose-500/5 p-3">
        <p className="text-sm font-semibold text-rose-300">
          Opravdu ukončit DEMO?
        </p>

        <p className="text-xs leading-5 text-slate-400">
          Účet okamžitě přejde do stavu
          expired a uživatel ztratí DEMO
          přístup.
        </p>

        {error && (
          <p className="text-xs text-rose-300">
            {error}
          </p>
        )}

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={loading}
            onClick={terminate}
            className="rounded-lg bg-rose-500 px-3 py-2 text-xs font-semibold text-white transition hover:bg-rose-400 disabled:opacity-50"
          >
            {loading
              ? "Ukončuji..."
              : "Ano, ukončit"}
          </button>

          <button
            type="button"
            disabled={loading}
            onClick={reset}
            className="rounded-lg border border-slate-700 px-3 py-2 text-xs font-medium text-slate-300 transition hover:bg-slate-800 disabled:opacity-50"
          >
            Zrušit
          </button>
        </div>
      </div>
    );
  }

  if (mode === "convert") {
    return (
      <div className="min-w-[260px] space-y-3 rounded-xl border border-cyan-500/20 bg-cyan-500/5 p-3">
        <p className="text-sm font-semibold text-cyan-300">
          Převést na zákazníka?
        </p>

        <p className="text-xs leading-5 text-slate-400">
          Účet přejde z DEMO na aktivní
          účet a DEMO expirace bude
          odstraněna.
        </p>

        {error && (
          <p className="text-xs text-rose-300">
            {error}
          </p>
        )}

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={loading}
            onClick={convert}
            className="rounded-lg bg-cyan-400 px-3 py-2 text-xs font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:opacity-50"
          >
            {loading
              ? "Převádím..."
              : "Ano, převést"}
          </button>

          <button
            type="button"
            disabled={loading}
            onClick={reset}
            className="rounded-lg border border-slate-700 px-3 py-2 text-xs font-medium text-slate-300 transition hover:bg-slate-800 disabled:opacity-50"
          >
            Zrušit
          </button>
        </div>
      </div>
    );
  }

  if (status === "new") {
    return (
      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={() => {
            setError(null);
            setMode("approve");
          }}
          className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-xs font-semibold text-emerald-300 transition hover:bg-emerald-500/20"
        >
          Schválit
        </button>

        <button
          type="button"
          onClick={() => {
            setError(null);
            setMode("reject");
          }}
          className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-xs font-semibold text-rose-300 transition hover:bg-rose-500/20"
        >
          Zamítnout
        </button>
      </div>
    );
  }

  if (
    status === "contacted" &&
    accountType === "demo"
  ) {
    return (
      <div className="flex flex-wrap justify-end gap-2">
        <button
          type="button"
          onClick={() => {
            setError(null);
            setMode("extend");
          }}
          className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-xs font-semibold text-emerald-300 transition hover:bg-emerald-500/20"
        >
          Prodloužit
        </button>

        <button
          type="button"
          onClick={() => {
            setError(null);
            setMode("convert");
          }}
          className="rounded-lg border border-cyan-500/30 bg-cyan-500/10 px-3 py-2 text-xs font-semibold text-cyan-300 transition hover:bg-cyan-500/20"
        >
          Převést
        </button>

        <button
          type="button"
          onClick={() => {
            setError(null);
            setMode("terminate");
          }}
          className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-xs font-semibold text-rose-300 transition hover:bg-rose-500/20"
        >
          Ukončit
        </button>
      </div>
    );
  }

  if (
    status === "contacted" &&
    accountType === "active"
  ) {
    return (
      <span className="text-xs font-medium text-emerald-400">
        Aktivní zákazník
      </span>
    );
  }

  if (
    status === "contacted" &&
    accountType === "expired"
  ) {
    return (
      <span className="text-xs font-medium text-rose-400">
        DEMO ukončeno
      </span>
    );
  }

  return (
    <span className="text-sm text-slate-600">
      —
    </span>
  );
}
"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type DemoRequestActionsProps = {
  requestId: number;
  status: string;
};

type Mode = "approve" | "reject" | null;

export default function DemoRequestActions({
  requestId,
  status,
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

  if (status !== "new") {
    return (
      <span className="text-sm text-slate-600">
        —
      </span>
    );
  }

  function reset() {
    setMode(null);
    setError(null);
    setRejectionReason("");
  }

  async function approve() {
    const durationDays =
      durationPreset === "custom"
        ? Number(customDuration)
        : Number(durationPreset);

    if (
      !Number.isInteger(durationDays) ||
      durationDays < 1 ||
      durationDays > 365
    ) {
      setError(
        "Délka DEMO musí být 1 až 365 dní."
      );
      return;
    }

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
          body: JSON.stringify({
            action: "approve",
            durationDays,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.ok) {
        throw new Error(
          data.error ??
            "Schválení DEMO se nepodařilo."
        );
      }

      setMode(null);
      router.refresh();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Schválení DEMO se nepodařilo."
      );
    } finally {
      setLoading(false);
    }
  }

  async function reject() {
    if (rejectionReason.length > 2000) {
      setError(
        "Důvod zamítnutí může mít maximálně 2000 znaků."
      );
      return;
    }

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
          body: JSON.stringify({
            action: "reject",
            rejectionReason,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.ok) {
        throw new Error(
          data.error ??
            "Zamítnutí DEMO se nepodařilo."
        );
      }

      setMode(null);
      router.refresh();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Zamítnutí DEMO se nepodařilo."
      );
    } finally {
      setLoading(false);
    }
  }

  if (mode === "approve") {
    return (
      <div className="min-w-[220px] space-y-3">
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-400">
            Délka DEMO
          </label>

          <select
            value={durationPreset}
            disabled={loading}
            onChange={(event) =>
              setDurationPreset(event.target.value)
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

        <div className="flex gap-2">
          <button
            type="button"
            disabled={loading}
            onClick={approve}
            className="rounded-lg bg-emerald-500 px-3 py-2 text-xs font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading
              ? "Schvaluji..."
              : "Potvrdit"}
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

        <div className="flex gap-2">
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
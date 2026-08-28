"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type SupportStatus = "open" | "in_progress" | "resolved";

type SupportStatusActionsProps = {
  ticketId: number;
  currentStatus: SupportStatus;
};

export default function SupportStatusActions({
  ticketId,
  currentStatus,
}: SupportStatusActionsProps) {
  const router = useRouter();

  const [loadingStatus, setLoadingStatus] =
    useState<SupportStatus | null>(null);

  const [error, setError] = useState<string | null>(null);

  async function updateStatus(nextStatus: SupportStatus) {
    setLoadingStatus(nextStatus);
    setError(null);

    try {
      const response = await fetch(
        `/api/admin/support/${ticketId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status: nextStatus,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.ok) {
        setError(
          data.error ?? "Změnu statusu se nepodařilo uložit."
        );
        return;
      }

      router.refresh();
    } catch (updateError) {
      console.error(
        "AEGRIS SUPPORT STATUS UPDATE FAILED:",
        updateError
      );

      setError(
        "Při změně statusu došlo k neočekávané chybě."
      );
    } finally {
      setLoadingStatus(null);
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {currentStatus === "open" && (
          <button
            type="button"
            disabled={loadingStatus !== null}
            onClick={() => updateStatus("in_progress")}
            className="rounded-lg border border-cyan-500/30 bg-cyan-500/10 px-4 py-2 text-sm font-medium text-cyan-300 transition hover:bg-cyan-500/20 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loadingStatus === "in_progress"
              ? "Ukládám..."
              : "Převzít do řešení"}
          </button>
        )}

        {currentStatus === "in_progress" && (
          <>
            <button
              type="button"
              disabled={loadingStatus !== null}
              onClick={() => updateStatus("open")}
              className="rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-sm font-medium text-slate-300 transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loadingStatus === "open"
                ? "Ukládám..."
                : "Vrátit na otevřený"}
            </button>

            <button
              type="button"
              disabled={loadingStatus !== null}
              onClick={() => updateStatus("resolved")}
              className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-sm font-medium text-emerald-300 transition hover:bg-emerald-500/20 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loadingStatus === "resolved"
                ? "Ukládám..."
                : "Označit jako vyřešený"}
            </button>
          </>
        )}

        {currentStatus === "resolved" && (
          <button
            type="button"
            disabled={loadingStatus !== null}
            onClick={() => updateStatus("in_progress")}
            className="rounded-lg border border-cyan-500/30 bg-cyan-500/10 px-4 py-2 text-sm font-medium text-cyan-300 transition hover:bg-cyan-500/20 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loadingStatus === "in_progress"
              ? "Ukládám..."
              : "Znovu otevřít"}
          </button>
        )}
      </div>

      {error && (
        <p className="text-sm text-rose-400">
          {error}
        </p>
      )}
    </div>
  );
}
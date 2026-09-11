"use client";

import { useEffect, useState } from "react";

type ValidationResult =
  | "confirmed"
  | "partially_confirmed"
  | "not_confirmed";

type ActualCause =
  | "drought_water_stress"
  | "nutrition"
  | "disease"
  | "pest"
  | "crop_damage"
  | "weed"
  | "other"
  | "no_problem";

type FieldValidation = {
  id: number;
  project_id: number;
  analysis_id: number;
  recommendation_id: number | null;
  alert_id: number | null;
  validated_by: string;
  validation_result: ValidationResult;
  actual_cause: ActualCause | null;
  observed_severity: number | null;
  observed_at: string;
  note: string | null;
  prediction_snapshot: unknown | null;
  created_at: string;
  updated_at: string;
};

type Props = {
  projectId: number;
  analysisId: number;
  recommendationId?: number | null;
  alertId?: number | null;
  readOnly?: boolean;
};

const RESULT_OPTIONS: Array<{
  value: ValidationResult;
  label: string;
  symbol: string;
}> = [
  {
    value: "confirmed",
    label: "Potvrzeno",
    symbol: "✓",
  },
  {
    value: "partially_confirmed",
    label: "Částečně potvrzeno",
    symbol: "◐",
  },
  {
    value: "not_confirmed",
    label: "Nepotvrzeno",
    symbol: "✕",
  },
];

const CAUSE_OPTIONS: Array<{
  value: ActualCause;
  label: string;
}> = [
  {
    value: "drought_water_stress",
    label: "Sucho / vodní stres",
  },
  {
    value: "nutrition",
    label: "Výživa",
  },
  {
    value: "disease",
    label: "Choroba",
  },
  {
    value: "pest",
    label: "Škůdce",
  },
  {
    value: "crop_damage",
    label: "Poškození porostu",
  },
  {
    value: "weed",
    label: "Plevel",
  },
  {
    value: "other",
    label: "Jiná příčina",
  },
  {
    value: "no_problem",
    label: "Bez problému",
  },
];

const SEVERITY_OPTIONS = [
  { value: 0, label: "0", description: "Bez problému" },
  { value: 1, label: "1", description: "Velmi nízká" },
  { value: 2, label: "2", description: "Nízká" },
  { value: 3, label: "3", description: "Střední" },
  { value: 4, label: "4", description: "Vysoká" },
  { value: 5, label: "5", description: "Velmi vysoká" },
] as const;

function getTodayDate() {
  const now = new Date();
  const offset = now.getTimezoneOffset();
  const localDate = new Date(now.getTime() - offset * 60_000);

  return localDate.toISOString().slice(0, 10);
}

export default function FieldValidationForm({
  projectId,
  analysisId,
  recommendationId = null,
  alertId = null,
  readOnly = false,
}: Props) {
  const [validationResult, setValidationResult] =
    useState<ValidationResult | null>(null);

  const [actualCause, setActualCause] =
    useState<ActualCause | "">("");

  const [observedSeverity, setObservedSeverity] =
    useState<number | null>(null);

  const [observedAt, setObservedAt] =
    useState(getTodayDate());

  const [note, setNote] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [savedValidation, setSavedValidation] =
    useState<FieldValidation | null>(null);

  const [errorMessage, setErrorMessage] =
    useState<string | null>(null);

  const [successMessage, setSuccessMessage] =
    useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadValidation() {
      setLoading(true);
      setErrorMessage(null);
      setSuccessMessage(null);

      try {
        const response = await fetch(
          `/api/field-validations?analysisId=${analysisId}`,
          {
            method: "GET",
            headers: {
              Accept: "application/json",
            },
            cache: "no-store",
          }
        );

        const payload = await response.json().catch(() => null);

        if (!response.ok) {
          throw new Error(
            payload?.error ||
              "Nepodařilo se načíst terénní ověření."
          );
        }

        if (cancelled) {
          return;
        }

        const validation =
          (payload?.validation as FieldValidation | null) ?? null;

        setSavedValidation(validation);

        if (validation) {
          setValidationResult(validation.validation_result);
          setActualCause(validation.actual_cause ?? "");
          setObservedSeverity(
            typeof validation.observed_severity === "number"
              ? validation.observed_severity
              : null
          );
          setObservedAt(validation.observed_at);
          setNote(validation.note ?? "");
        } else {
          setValidationResult(null);
          setActualCause("");
          setObservedSeverity(null);
          setObservedAt(getTodayDate());
          setNote("");
        }
      } catch (error) {
        if (cancelled) {
          return;
        }

        console.error(
          "FIELD VALIDATION UI LOAD ERROR:",
          error
        );

        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Nepodařilo se načíst terénní ověření."
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadValidation();

    return () => {
      cancelled = true;
    };
  }, [analysisId]);

  async function saveValidation() {
    if (
      readOnly ||
      saving ||
      !validationResult ||
      !observedAt
    ) {
      return;
    }

    setSaving(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const response = await fetch(
        "/api/field-validations",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            projectId,
            analysisId,
            recommendationId,
            alertId,
            validationResult,
            actualCause: actualCause || null,
            observedSeverity,
            observedAt,
            note,
          }),
        }
      );

      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          payload?.error ||
            "Nepodařilo se uložit terénní ověření."
        );
      }

      const validation =
        payload?.validation as FieldValidation;

      setSavedValidation(validation);
      setObservedSeverity(
        typeof validation.observed_severity === "number"
          ? validation.observed_severity
          : null
      );

      setSuccessMessage(
        "Terénní ověření bylo uloženo."
      );
    } catch (error) {
      console.error(
        "FIELD VALIDATION UI SAVE ERROR:",
        error
      );

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Nepodařilo se uložit terénní ověření."
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <section className="mt-3 rounded-[22px] border border-white/[0.07] bg-[#0a1016] p-4">
        <div className="text-[9px] font-black uppercase tracking-[0.2em] text-cyan-300">
          Ověření agronomem
        </div>

        <div className="mt-3 rounded-lg border border-white/[0.07] bg-[#071017] p-4 text-[10px] text-slate-500">
          Načítám terénní ověření…
        </div>
      </section>
    );
  }

  return (
    <section className="mt-3 rounded-[22px] border border-white/[0.07] bg-[#0a1016] p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="text-[9px] font-black uppercase tracking-[0.2em] text-cyan-300">
            Ground Truth
          </div>

          <h2 className="mt-1 text-sm font-black">
            OVĚŘENÍ AGRONOMEM
          </h2>

          <p className="mt-1 max-w-2xl text-[9px] leading-4 text-slate-500">
            Porovnejte výstup AegRIS se skutečným stavem
            porostu při kontrole v terénu.
          </p>
        </div>

        {savedValidation ? (
          <div className="rounded-md border border-emerald-500/25 bg-emerald-500/5 px-2.5 py-1.5 text-[8px] font-black text-emerald-400">
            ✓ OVĚŘENO
          </div>
        ) : (
          <div className="rounded-md border border-amber-500/20 bg-amber-500/5 px-2.5 py-1.5 text-[8px] font-black text-amber-400">
            ČEKÁ NA OVĚŘENÍ
          </div>
        )}
      </div>

      {readOnly && (
        <div className="mt-3 rounded-lg border border-white/[0.07] bg-[#071017] px-3 py-2 text-[9px] text-slate-500">
          Viewer má k terénnímu ověření pouze přístup
          pro čtení.
        </div>
      )}

      <div className="mt-4">
        <div className="text-[8px] font-black uppercase tracking-[0.16em] text-slate-500">
          Potvrdil se stav indikovaný systémem AegRIS?
        </div>

        <div className="mt-2 grid gap-2 md:grid-cols-3">
          {RESULT_OPTIONS.map((option) => {
            const selected =
              validationResult === option.value;

            return (
              <button
                key={option.value}
                type="button"
                disabled={readOnly || saving}
                onClick={() =>
                  setValidationResult(option.value)
                }
                className={`rounded-lg border px-3 py-3 text-left transition ${
                  selected
                    ? option.value === "confirmed"
                      ? "border-emerald-400/50 bg-emerald-500/10 text-emerald-300"
                      : option.value ===
                          "partially_confirmed"
                        ? "border-amber-400/50 bg-amber-500/10 text-amber-300"
                        : "border-red-400/50 bg-red-500/10 text-red-300"
                    : "border-white/[0.07] bg-[#071017] text-slate-400 hover:border-cyan-300/30"
                } disabled:cursor-not-allowed disabled:opacity-60`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg font-black">
                    {option.symbol}
                  </span>

                  <span className="text-[10px] font-black">
                    {option.label}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <div>
          <label
            htmlFor={`field-validation-cause-${analysisId}`}
            className="text-[8px] font-black uppercase tracking-[0.16em] text-slate-500"
          >
            Skutečná příčina
          </label>

          <select
            id={`field-validation-cause-${analysisId}`}
            disabled={readOnly || saving}
            value={actualCause}
            onChange={(event) =>
              setActualCause(
                event.target.value as ActualCause | ""
              )
            }
            className="mt-2 w-full rounded-lg border border-white/[0.07] bg-[#071017] px-3 py-2.5 text-[10px] text-slate-200 outline-none transition focus:border-cyan-300/60 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <option value="">
              Nevybráno
            </option>

            {CAUSE_OPTIONS.map((cause) => (
              <option
                key={cause.value}
                value={cause.value}
              >
                {cause.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor={`field-validation-date-${analysisId}`}
            className="text-[8px] font-black uppercase tracking-[0.16em] text-slate-500"
          >
            Datum terénní kontroly
          </label>

          <input
            id={`field-validation-date-${analysisId}`}
            type="date"
            disabled={readOnly || saving}
            value={observedAt}
            onChange={(event) =>
              setObservedAt(event.target.value)
            }
            className="mt-2 w-full rounded-lg border border-white/[0.07] bg-[#071017] px-3 py-2.5 text-[10px] text-slate-200 outline-none transition focus:border-cyan-300/60 disabled:cursor-not-allowed disabled:opacity-60"
          />
        </div>
      </div>

      <div className="mt-4">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <div className="text-[8px] font-black uppercase tracking-[0.16em] text-slate-500">
              Skutečná závažnost nálezu
            </div>
            <div className="mt-1 text-[8px] leading-4 text-slate-600">
              0 = bez problému · 5 = velmi závažný stav
            </div>
          </div>

          {observedSeverity !== null && (
            <div className="rounded-md border border-cyan-300/20 bg-cyan-300/5 px-2.5 py-1 text-[8px] font-black text-cyan-300">
              ZÁVAŽNOST {observedSeverity}/5
            </div>
          )}
        </div>

        <div className="mt-2 grid grid-cols-3 gap-2 md:grid-cols-6">
          {SEVERITY_OPTIONS.map((option) => {
            const selected =
              observedSeverity === option.value;

            return (
              <button
                key={option.value}
                type="button"
                disabled={readOnly || saving}
                onClick={() =>
                  setObservedSeverity(option.value)
                }
                className={`rounded-lg border px-2 py-3 text-center transition ${
                  selected
                    ? "border-cyan-300/60 bg-cyan-300/10 text-cyan-200"
                    : "border-white/[0.07] bg-[#071017] text-slate-500 hover:border-cyan-300/30 hover:text-slate-300"
                } disabled:cursor-not-allowed disabled:opacity-60`}
              >
                <div className="text-base font-black">
                  {option.label}
                </div>
                <div className="mt-1 text-[7px] leading-3">
                  {option.description}
                </div>
              </button>
            );
          })}
        </div>

        {observedSeverity !== null && (
          <button
            type="button"
            disabled={readOnly || saving}
            onClick={() => setObservedSeverity(null)}
            className="mt-2 text-[8px] font-bold text-slate-600 transition hover:text-slate-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Zrušit volbu závažnosti
          </button>
        )}
      </div>

      <div className="mt-3">
        <label
          htmlFor={`field-validation-note-${analysisId}`}
          className="text-[8px] font-black uppercase tracking-[0.16em] text-slate-500"
        >
          Poznámka agronoma
        </label>

        <textarea
          id={`field-validation-note-${analysisId}`}
          disabled={readOnly || saving}
          value={note}
          maxLength={5000}
          rows={4}
          onChange={(event) =>
            setNote(event.target.value)
          }
          placeholder="Např. projevy stresu v jižní části pozemku, lokálně poškozené rostliny, bez známek choroby…"
          className="mt-2 w-full resize-y rounded-lg border border-white/[0.07] bg-[#071017] px-3 py-2.5 text-[10px] leading-4 text-slate-200 outline-none transition placeholder:text-slate-700 focus:border-cyan-300/60 disabled:cursor-not-allowed disabled:opacity-60"
        />

        <div className="mt-1 text-right text-[8px] text-slate-600">
          {note.length} / 5000
        </div>
      </div>

      {errorMessage && (
        <div className="mt-3 rounded-lg border border-red-500/25 bg-red-500/5 px-3 py-2 text-[9px] font-bold text-red-400">
          {errorMessage}
        </div>
      )}

      {successMessage && (
        <div className="mt-3 rounded-lg border border-emerald-500/25 bg-emerald-500/5 px-3 py-2 text-[9px] font-bold text-emerald-400">
          ✓ {successMessage}
        </div>
      )}

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <div className="text-[8px] leading-4 text-slate-600">
          Analýza #{analysisId}
          {savedValidation && (
            <>
              {" "}
              · poslední úprava{" "}
              {new Date(
                savedValidation.updated_at
              ).toLocaleString("cs-CZ")}
            </>
          )}
        </div>

        {!readOnly && (
          <button
            type="button"
            disabled={
              saving ||
              !validationResult ||
              !observedAt
            }
            onClick={saveValidation}
            className="rounded-lg bg-cyan-300 px-4 py-2.5 text-[9px] font-black text-slate-950 transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving
              ? "Ukládám…"
              : savedValidation
                ? "Uložit změny ověření"
                : "Uložit terénní ověření"}
          </button>
        )}
      </div>
    </section>
  );
}

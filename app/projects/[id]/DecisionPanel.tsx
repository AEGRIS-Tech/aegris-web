"use client";

type DecisionPanelProps = {
  ndvi: number | null;
  trend: "rising" | "falling" | "stable" | "unknown";
  trendDifference: number | null;
  trendPercent: number | null;
  cropName?: string | null;
  cropStage?: string | null;
};

type Decision = {
  priority: "Kritická" | "Vysoká" | "Střední" | "Nízká";
  title: string;
  summary: string;
  actions: string[];
  nextStep: string;
};

/*
 * ============================================================
 * AEGRIS DECISION ENGINE
 * ============================================================
 *
 * Rozhodnutí vychází především z:
 *
 * 1. aktuálního NDVI
 * 2. směru vývoje NDVI
 * 3. velikosti změny NDVI
 * 4. růstové fáze, pokud je dostupná
 *
 * DecisionPanel je praktická interpretační vrstva.
 * Detailní numerické skóre řeší RiskEngine.
 */

function getDecision({
  ndvi,
  trend,
  trendDifference,
  cropName,
  cropStage,
}: DecisionPanelProps): Decision {
  const crop = cropName || "porost";
  const stageText = cropStage ? ` ve fázi ${cropStage}` : "";

  /*
   * ==========================================================
   * BEZ NDVI
   * ==========================================================
   */

  if (ndvi == null) {
    return {
      priority: "Nízká",
      title: "Nedostatek dat",
      summary:
        "Pro projekt zatím není k dispozici aktuální hodnota NDVI, takže AEGRIS nemůže spolehlivě vyhodnotit aktuální stav a jeho vývoj.",
      actions: [
        "Provést nebo načíst nové NDVI měření.",
        "Po získání měření porovnat aktuální hodnotu s historií.",
        "Ověřit skutečný stav porostu přímo v terénu.",
      ],
      nextStep: "Doplnit nové NDVI měření.",
    };
  }

  /*
   * ==========================================================
   * KRITICKÝ STAV
   * ==========================================================
   *
   * NDVI pod 0.20 je samo o sobě kritický signál.
   *
   * Velmi výrazný pokles <= -0.10 může kritický stav
   * podpořit pouze tehdy, pokud je zároveň aktuální NDVI
   * výrazně nízké (< 0.35).
   */

  if (
    ndvi < 0.20 ||
    (ndvi < 0.35 &&
      trend === "falling" &&
      trendDifference != null &&
      trendDifference <= -0.10)
  ) {
    const declineText =
      trendDifference != null
        ? ` Poslední změna NDVI je ${
            trendDifference >= 0 ? "+" : ""
          }${trendDifference.toFixed(3)}.`
        : "";

    return {
      priority: "Kritická",
      title: "Kritický stav porostu",
      summary:
        `Aktuální NDVI ${ndvi.toFixed(
          3
        )} ukazuje na velmi nízkou vegetační aktivitu ${crop}${stageText}.` +
        declineText +
        " Situace vyžaduje prioritní ověření přímo v terénu.",
      actions: [
        "Prioritně zkontrolovat aktuální stav porostu v terénu.",
        "Prověřit vodní stres a dostupnost vody.",
        "Prověřit případné poškození porostu, choroby nebo škůdce.",
        "Provést následné NDVI měření a ověřit další vývoj.",
      ],
      nextStep: "Provést prioritní terénní kontrolu.",
    };
  }

  /*
   * ==========================================================
   * VYSOKÉ RIZIKO
   * ==========================================================
   *
   * NDVI < 0.35 znamená nízkou vegetační aktivitu.
   *
   * Klesající trend při NDVI < 0.50 také znamená zvýšenou
   * pozornost, ale ne automaticky kritický stav.
   */

  if (ndvi < 0.35 || (trend === "falling" && ndvi < 0.50)) {
    const declineText =
      trendDifference != null
        ? ` Za posledních měřeních došlo ke změně ${
            trendDifference >= 0 ? "+" : ""
          }${trendDifference.toFixed(3)}.`
        : "";

    return {
      priority: "Vysoká",
      title: "Klesající aktivita porostu",
      summary:
        `NDVI je ${ndvi.toFixed(
          3
        )} a vývoj porostu vykazuje známky zhoršování.${declineText} ` +
        `AEGRIS doporučuje zvýšenou pozornost u ${crop}${stageText}.`,
      actions: [
        "Prověřit aktuální stav porostu v terénu.",
        "Zkontrolovat vodní režim a dostupnost vláhy.",
        "Prověřit možné teplotní nebo jiné stresové faktory.",
        "Sledovat další NDVI měření a ověřit, zda pokles pokračuje.",
      ],
      nextStep: "Zkontrolovat porost a pokračovat v monitoringu.",
    };
  }

  /*
   * ==========================================================
   * STŘEDNÍ RIZIKO
   * ==========================================================
   */

  if (ndvi < 0.50) {
    return {
      priority: "Střední",
      title: "Snížená aktivita porostu",
      summary:
        `NDVI ${ndvi.toFixed(
          3
        )} ukazuje na sníženou vegetační aktivitu ${crop}${stageText}. ` +
        "Výsledek sám o sobě neznamená nutnost zásahu, ale vyžaduje další sledování.",
      actions: [
        "Pokračovat v pravidelném monitoringu.",
        "Porovnat další NDVI měření s aktuálním stavem.",
        "Při dalším poklesu provést terénní kontrolu.",
      ],
      nextStep: "Pokračovat v monitoringu.",
    };
  }

  /*
   * ==========================================================
   * DOBRÁ AKTIVITA
   * ==========================================================
   */

  if (ndvi < 0.65) {
    return {
      priority: "Nízká",
      title: "Dobrá vegetační aktivita",
      summary:
        `NDVI ${ndvi.toFixed(
          3
        )} odpovídá dobré vegetační aktivitě ${crop}${stageText}. ` +
        "Aktuálně není patrný výrazný signál pro zásah.",
      actions: [
        "Pokračovat v pravidelném monitoringu.",
        "Sledovat vývoj NDVI v čase.",
        "Při výrazné změně trendu provést kontrolní analýzu.",
      ],
      nextStep: "Pokračovat v monitoringu.",
    };
  }

  /*
   * ==========================================================
   * VELMI DOBRÁ AKTIVITA
   * ==========================================================
   */

  return {
    priority: "Nízká",
    title: "Velmi dobrá vegetační aktivita",
    summary:
      `NDVI ${ndvi.toFixed(
        3
      )} ukazuje na velmi dobrou vegetační aktivitu ${crop}${stageText}.`,
    actions: [
      "Pokračovat v pravidelném monitoringu.",
      "Sledovat případnou změnu trendu.",
      "Porovnávat další měření s aktuálním stavem.",
    ],
    nextStep: "Pokračovat v monitoringu.",
  };
}

/*
 * ============================================================
 * PRIORITY STYLES
 * ============================================================
 */

function priorityClass(priority: Decision["priority"]) {
  switch (priority) {
    case "Kritická":
      return "border-red-500/30 bg-red-500/5 text-red-400";

    case "Vysoká":
      return "border-orange-500/30 bg-orange-500/5 text-orange-400";

    case "Střední":
      return "border-amber-500/30 bg-amber-500/5 text-amber-400";

    default:
      return "border-emerald-500/30 bg-emerald-500/5 text-emerald-400";
  }
}

function priorityBadge(priority: Decision["priority"]) {
  switch (priority) {
    case "Kritická":
      return "bg-red-500/10 text-red-400 border-red-500/20";

    case "Vysoká":
      return "bg-orange-500/10 text-orange-400 border-orange-500/20";

    case "Střední":
      return "bg-amber-500/10 text-amber-400 border-amber-500/20";

    default:
      return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
  }
}

/*
 * ============================================================
 * COMPONENT
 * ============================================================
 */

export default function DecisionPanel(props: DecisionPanelProps) {
  const decision = getDecision(props);

  const trendLabel =
    props.trend === "falling"
      ? "Klesající"
      : props.trend === "rising"
        ? "Rostoucí"
        : props.trend === "stable"
          ? "Stabilní"
          : "Nedostatek dat";

  const trendClass =
    props.trend === "falling"
      ? "text-orange-400"
      : props.trend === "rising"
        ? "text-emerald-400"
        : props.trend === "stable"
          ? "text-cyan-400"
          : "text-amber-400";

  const changeClass =
    props.trendDifference == null
      ? "text-slate-300"
      : props.trendDifference < 0
        ? "text-orange-400"
        : props.trendDifference > 0
          ? "text-emerald-400"
          : "text-slate-300";

  return (
    <section className="mt-8 rounded-3xl border border-slate-800 bg-[#080d20] p-6 md:p-8">
      {/* ================================================= */}
      {/* HEADER */}
      {/* ================================================= */}

      <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="text-xs font-bold uppercase tracking-[0.25em] text-cyan-400">
            AEGRIS Decision
          </div>

          <h2 className="mt-2 text-2xl font-black text-white">
            Rozhodovací doporučení
          </h2>

          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">
            AEGRIS převádí aktuální NDVI a jeho vývoj do praktického
            doporučení pro další kontrolu projektu.
          </p>
        </div>

        <div
          className={`rounded-2xl border px-5 py-4 ${priorityClass(
            decision.priority
          )}`}
        >
          <div className="text-[10px] font-bold uppercase tracking-[0.18em] opacity-70">
            Priorita
          </div>

          <div className="mt-1 text-xl font-black">
            {decision.priority}
          </div>
        </div>
      </div>

      {/* ================================================= */}
      {/* MAIN DECISION */}
      {/* ================================================= */}

      <div className="mt-6 rounded-2xl border border-slate-800 bg-[#0b1228] p-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <div className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-400">
              Co se děje
            </div>

            <h3 className="mt-2 text-xl font-black text-white">
              {decision.title}
            </h3>
          </div>

          <span
            className={`w-fit rounded-full border px-3 py-1 text-xs font-bold ${priorityBadge(
              decision.priority
            )}`}
          >
            {decision.priority}
          </span>
        </div>

        <p className="mt-4 text-sm leading-7 text-slate-300">
          {decision.summary}
        </p>
      </div>

      {/* ================================================= */}
      {/* METRICS */}
      {/* ================================================= */}

      <div className="mt-4 grid gap-4 md:grid-cols-3">
        {/* NDVI */}

        <div className="rounded-2xl border border-slate-800 bg-[#0b1228] p-5">
          <div className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
            Aktuální NDVI
          </div>

          <div className="mt-2 text-3xl font-black text-cyan-400">
            {props.ndvi != null ? props.ndvi.toFixed(3) : "N/A"}
          </div>
        </div>

        {/* TREND */}

        <div className="rounded-2xl border border-slate-800 bg-[#0b1228] p-5">
          <div className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
            Trend
          </div>

          <div className={`mt-2 text-xl font-black ${trendClass}`}>
            {trendLabel}
          </div>
        </div>

        {/* CHANGE */}

        <div className="rounded-2xl border border-slate-800 bg-[#0b1228] p-5">
          <div className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
            Změna
          </div>

          <div className={`mt-2 text-xl font-black ${changeClass}`}>
            {props.trendDifference != null
              ? `${
                  props.trendDifference >= 0 ? "+" : ""
                }${props.trendDifference.toFixed(3)}`
              : "N/A"}
          </div>

          {props.trendPercent != null && (
            <div className="mt-1 text-xs text-slate-500">
              {props.trendPercent >= 0 ? "+" : ""}
              {props.trendPercent.toFixed(1)} %
            </div>
          )}
        </div>
      </div>

      {/* ================================================= */}
      {/* ACTIONS */}
      {/* ================================================= */}

      <div className="mt-6">
        <div className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-400">
          Co udělat nyní
        </div>

        <div className="mt-3 grid gap-3 md:grid-cols-2">
          {decision.actions.map((action, index) => (
            <div
              key={`${index}-${action}`}
              className="flex gap-4 rounded-2xl border border-slate-800 bg-[#0b1228] p-4"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-cyan-500/10 text-sm font-black text-cyan-400">
                {index + 1}
              </div>

              <p className="text-sm leading-6 text-slate-300">
                {action}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* ================================================= */}
      {/* NEXT STEP */}
      {/* ================================================= */}

      <div className="mt-6 rounded-2xl border border-cyan-500/20 bg-cyan-500/5 p-5">
        <div className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-400">
          Další krok
        </div>

        <div className="mt-2 text-lg font-bold text-white">
          {decision.nextStep}
        </div>
      </div>

      {/* ================================================= */}
      {/* DISCLAIMER */}
      {/* ================================================= */}

      <p className="mt-5 text-xs leading-5 text-slate-500">
        AEGRIS Decision je orientační rozhodovací podpora založená na
        dostupných datech. Před zásahem je nutné ověřit skutečný stav
        porostu přímo v terénu.
      </p>
    </section>
  );
}
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { requireAccountAccess } from "@/lib/auth/account-access";

export const dynamic = "force-dynamic";

const VALIDATION_RESULTS = [
  "confirmed",
  "partially_confirmed",
  "not_confirmed",
] as const;

const ACTUAL_CAUSES = [
  "drought_water_stress",
  "nutrition",
  "disease",
  "pest",
  "crop_damage",
  "weed",
  "other",
  "no_problem",
] as const;

type ValidationResult = (typeof VALIDATION_RESULTS)[number];
type ActualCause = (typeof ACTUAL_CAUSES)[number];

type FieldValidationPayload = {
  projectId?: unknown;
  analysisId?: unknown;
  recommendationId?: unknown;
  alertId?: unknown;
  validationResult?: unknown;
  actualCause?: unknown;
  observedSeverity?: unknown;
  observedAt?: unknown;
  note?: unknown;
};

type AnalysisSnapshotSource = {
  id: number;
  project_id: number;
  ndvi: number | string | null;
  vegetation: number | null;
  risk: string | null;
  created_at: string;
  period_from: string | null;
  period_to: string | null;
  source_provider: string | null;
  satellite: string | null;
  satellite_product: string | null;
  spatial_resolution_m: number | null;
  analysis_crs: string | null;
  analysis_utm_zone: number | null;
  geometry_pixel_count: number | null;
  valid_pixel_count: number | null;
  valid_geometry_pct: number | string | null;
  accepted_intervals: number | null;
  rejected_intervals: number | null;
  quality_gate_pct: number | string | null;
  median_ndvi: number | string | null;
  p05_ndvi: number | string | null;
  p95_ndvi: number | string | null;
  engine_version: string | null;
  ruleset_version: string | null;
  input_snapshot: unknown;
  decision_snapshot: unknown;
  data_completeness_pct: number | string | null;
};

type ExistingValidationSnapshot = {
  id: number;
  prediction_snapshot: unknown | null;
};

function createSupabase(cookieStore: Awaited<ReturnType<typeof cookies>>) {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // Route handler nemusí vždy povolit změnu cookies.
          }
        },
      },
    }
  );
}

function parsePositiveInteger(value: unknown): number | null {
  if (typeof value === "number") {
    return Number.isInteger(value) && value > 0 ? value : null;
  }

  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);

    return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
  }

  return null;
}

function parseOptionalPositiveInteger(
  value: unknown
): number | null | "invalid" {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const parsed = parsePositiveInteger(value);

  return parsed ?? "invalid";
}

function parseObservedSeverity(
  value: unknown
): number | null | "invalid" {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const parsed =
    typeof value === "number"
      ? value
      : typeof value === "string" && value.trim() !== ""
        ? Number(value)
        : Number.NaN;

  if (!Number.isInteger(parsed) || parsed < 0 || parsed > 5) {
    return "invalid";
  }

  return parsed;
}

function isValidationResult(value: unknown): value is ValidationResult {
  return (
    typeof value === "string" &&
    VALIDATION_RESULTS.includes(value as ValidationResult)
  );
}

function isActualCause(value: unknown): value is ActualCause {
  return (
    typeof value === "string" &&
    ACTUAL_CAUSES.includes(value as ActualCause)
  );
}

function isValidDateOnly(value: unknown): value is string {
  if (
    typeof value !== "string" ||
    !/^\d{4}-\d{2}-\d{2}$/.test(value)
  ) {
    return false;
  }

  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));

  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

export async function GET(request: Request) {
  try {
    const cookieStore = await cookies();
    const supabase = createSupabase(cookieStore);

    const access = await requireAccountAccess(supabase);

    if (!access.ok) {
      return NextResponse.json(
        {
          error: access.message,
          code: access.code,
        },
        { status: access.status }
      );
    }

    const user = access.user;

    const url = new URL(request.url);
    const analysisId = parsePositiveInteger(
      url.searchParams.get("analysisId")
    );

    if (!analysisId) {
      return NextResponse.json(
        { error: "Chybí nebo je neplatné ID analýzy." },
        { status: 400 }
      );
    }

    const { data: validation, error } = await supabase
      .from("field_validations")
      .select(
        [
          "id",
          "project_id",
          "analysis_id",
          "recommendation_id",
          "alert_id",
          "validated_by",
          "validation_result",
          "actual_cause",
          "observed_severity",
          "observed_at",
          "note",
          "prediction_snapshot",
          "created_at",
          "updated_at",
        ].join(",")
      )
      .eq("analysis_id", analysisId)
      .eq("validated_by", user.id)
      .maybeSingle();

    if (error) {
      console.error("FIELD VALIDATION LOAD ERROR:", error);

      return NextResponse.json(
        { error: "Nepodařilo se načíst terénní ověření." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      validation: validation ?? null,
    });
  } catch (error) {
    console.error("FIELD VALIDATION GET ERROR:", error);

    return NextResponse.json(
      { error: "Nepodařilo se načíst terénní ověření." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const supabase = createSupabase(cookieStore);

    const access = await requireAccountAccess(supabase);

    if (!access.ok) {
      return NextResponse.json(
        {
          error: access.message,
          code: access.code,
        },
        { status: access.status }
      );
    }

    const user = access.user;

    let body: FieldValidationPayload;

    try {
      body = (await request.json()) as FieldValidationPayload;
    } catch {
      return NextResponse.json(
        { error: "Neplatná data požadavku." },
        { status: 400 }
      );
    }

    const projectId = parsePositiveInteger(body.projectId);
    const analysisId = parsePositiveInteger(body.analysisId);

    const recommendationId = parseOptionalPositiveInteger(
      body.recommendationId
    );

    const alertId = parseOptionalPositiveInteger(body.alertId);

    const observedSeverity = parseObservedSeverity(
      body.observedSeverity
    );

    if (!projectId) {
      return NextResponse.json(
        { error: "Chybí nebo je neplatné ID projektu." },
        { status: 400 }
      );
    }

    if (!analysisId) {
      return NextResponse.json(
        { error: "Chybí nebo je neplatné ID analýzy." },
        { status: 400 }
      );
    }

    if (recommendationId === "invalid") {
      return NextResponse.json(
        { error: "Neplatné ID doporučení." },
        { status: 400 }
      );
    }

    if (alertId === "invalid") {
      return NextResponse.json(
        { error: "Neplatné ID upozornění." },
        { status: 400 }
      );
    }

    if (observedSeverity === "invalid") {
      return NextResponse.json(
        {
          error:
            "Závažnost terénního nálezu musí být celé číslo od 0 do 5.",
        },
        { status: 400 }
      );
    }

    if (!isValidationResult(body.validationResult)) {
      return NextResponse.json(
        { error: "Neplatný výsledek terénního ověření." },
        { status: 400 }
      );
    }

    let actualCause: ActualCause | null = null;

    if (
      body.actualCause !== null &&
      body.actualCause !== undefined &&
      body.actualCause !== ""
    ) {
      if (!isActualCause(body.actualCause)) {
        return NextResponse.json(
          { error: "Neplatná skutečná příčina." },
          { status: 400 }
        );
      }

      actualCause = body.actualCause;
    }

    if (!isValidDateOnly(body.observedAt)) {
      return NextResponse.json(
        { error: "Neplatné datum terénní kontroly." },
        { status: 400 }
      );
    }

    let note: string | null = null;

    if (body.note !== null && body.note !== undefined) {
      if (typeof body.note !== "string") {
        return NextResponse.json(
          { error: "Poznámka musí být text." },
          { status: 400 }
        );
      }

      const normalizedNote = body.note.trim();

      if (normalizedNote.length > 5000) {
        return NextResponse.json(
          { error: "Poznámka může mít maximálně 5000 znaků." },
          { status: 400 }
        );
      }

      note = normalizedNote || null;
    }

    const { data: project, error: projectError } = await supabase
      .from("projects")
      .select("id, user_id, organization_id")
      .eq("id", projectId)
      .maybeSingle();

    if (projectError) {
      console.error(
        "FIELD VALIDATION PROJECT ACCESS ERROR:",
        projectError
      );

      return NextResponse.json(
        { error: "Nepodařilo se ověřit přístup k projektu." },
        { status: 500 }
      );
    }

    if (!project) {
      return NextResponse.json(
        { error: "Projekt nebyl nalezen nebo k němu nemáte přístup." },
        { status: 404 }
      );
    }

    if (!project.organization_id) {
      console.error(
        "FIELD VALIDATION PROJECT WITHOUT ORGANIZATION:",
        projectId
      );

      return NextResponse.json(
        { error: "Projekt nemá nastavenou organizaci." },
        { status: 500 }
      );
    }

    const { data: membership, error: membershipError } = await supabase
      .from("organization_members")
      .select("role")
      .eq("organization_id", project.organization_id)
      .eq("user_id", user.id)
      .maybeSingle();

    if (membershipError) {
      console.error(
        "FIELD VALIDATION MEMBERSHIP ERROR:",
        membershipError
      );

      return NextResponse.json(
        { error: "Nepodařilo se ověřit oprávnění k hodnocení." },
        { status: 500 }
      );
    }

    if (
      !membership ||
      !["owner", "admin", "member"].includes(membership.role)
    ) {
      return NextResponse.json(
        {
          error:
            "K terénnímu hodnocení nemáte oprávnění. Viewer má pouze přístup pro čtení.",
          code: "INSUFFICIENT_ORGANIZATION_ROLE",
        },
        { status: 403 }
      );
    }

    const { data: analysisData, error: analysisError } = await supabase
      .from("analysis")
      .select(
        [
          "id",
          "project_id",
          "ndvi",
          "vegetation",
          "risk",
          "created_at",
          "period_from",
          "period_to",
          "source_provider",
          "satellite",
          "satellite_product",
          "spatial_resolution_m",
          "analysis_crs",
          "analysis_utm_zone",
          "geometry_pixel_count",
          "valid_pixel_count",
          "valid_geometry_pct",
          "accepted_intervals",
          "rejected_intervals",
          "quality_gate_pct",
          "median_ndvi",
          "p05_ndvi",
          "p95_ndvi",
          "engine_version",
          "ruleset_version",
          "input_snapshot",
          "decision_snapshot",
          "data_completeness_pct",
        ].join(",")
      )
      .eq("id", analysisId)
      .eq("project_id", projectId)
      .maybeSingle();

    if (analysisError) {
      console.error(
        "FIELD VALIDATION ANALYSIS LOOKUP ERROR:",
        analysisError
      );

      return NextResponse.json(
        { error: "Nepodařilo se ověřit analyzovaný záznam." },
        { status: 500 }
      );
    }

    const analysis =
      analysisData as unknown as AnalysisSnapshotSource | null;

    if (!analysis) {
      return NextResponse.json(
        {
          error:
            "Analýza nebyla nalezena nebo nepatří k vybranému projektu.",
        },
        { status: 404 }
      );
    }

    if (recommendationId !== null) {
      const { data: recommendation, error: recommendationError } =
        await supabase
          .from("aegris_recommendations")
          .select("id, project_id, analysis_id")
          .eq("id", recommendationId)
          .eq("project_id", projectId)
          .maybeSingle();

      if (recommendationError) {
        console.error(
          "FIELD VALIDATION RECOMMENDATION LOOKUP ERROR:",
          recommendationError
        );

        return NextResponse.json(
          { error: "Nepodařilo se ověřit doporučení." },
          { status: 500 }
        );
      }

      if (
        !recommendation ||
        (
          recommendation.analysis_id !== null &&
          Number(recommendation.analysis_id) !== analysisId
        )
      ) {
        return NextResponse.json(
          {
            error:
              "Doporučení nepatří k vybranému projektu nebo analýze.",
          },
          { status: 400 }
        );
      }
    }

    if (alertId !== null) {
      const { data: alert, error: alertError } = await supabase
        .from("aegris_alerts")
        .select("id, project_id")
        .eq("id", alertId)
        .eq("project_id", projectId)
        .maybeSingle();

      if (alertError) {
        console.error(
          "FIELD VALIDATION ALERT LOOKUP ERROR:",
          alertError
        );

        return NextResponse.json(
          { error: "Nepodařilo se ověřit upozornění." },
          { status: 500 }
        );
      }

      if (!alert) {
        return NextResponse.json(
          { error: "Upozornění nepatří k vybranému projektu." },
          { status: 400 }
        );
      }
    }

    const {
      data: existingValidationData,
      error: existingValidationError,
    } = await supabase
      .from("field_validations")
      .select("id, prediction_snapshot")
      .eq("analysis_id", analysisId)
      .eq("validated_by", user.id)
      .maybeSingle();

    if (existingValidationError) {
      console.error(
        "FIELD VALIDATION EXISTING LOOKUP ERROR:",
        existingValidationError
      );

      return NextResponse.json(
        { error: "Nepodařilo se ověřit existující terénní ověření." },
        { status: 500 }
      );
    }

    const existingValidation =
      existingValidationData as unknown as ExistingValidationSnapshot | null;

    const predictionSnapshot =
      existingValidation?.prediction_snapshot ??
      {
        schema_version: 1,
        captured_at: new Date().toISOString(),
        project_id: projectId,
        analysis_id: analysisId,
        analysis: {
          created_at: analysis.created_at,
          period_from: analysis.period_from,
          period_to: analysis.period_to,
          source_provider: analysis.source_provider,
          satellite: analysis.satellite,
          satellite_product: analysis.satellite_product,
          spatial_resolution_m: analysis.spatial_resolution_m,
          analysis_crs: analysis.analysis_crs,
          analysis_utm_zone: analysis.analysis_utm_zone,
          geometry_pixel_count: analysis.geometry_pixel_count,
          valid_pixel_count: analysis.valid_pixel_count,
          valid_geometry_pct: analysis.valid_geometry_pct,
          accepted_intervals: analysis.accepted_intervals,
          rejected_intervals: analysis.rejected_intervals,
          quality_gate_pct: analysis.quality_gate_pct,
          ndvi: analysis.ndvi,
          median_ndvi: analysis.median_ndvi,
          p05_ndvi: analysis.p05_ndvi,
          p95_ndvi: analysis.p95_ndvi,
          vegetation: analysis.vegetation,
          risk: analysis.risk,
          data_completeness_pct: analysis.data_completeness_pct,
        },
        engine: {
          engine_version: analysis.engine_version,
          ruleset_version: analysis.ruleset_version,
        },
        input_snapshot: analysis.input_snapshot,
        decision_snapshot: analysis.decision_snapshot,
      };

    const { data: savedValidation, error: saveError } = await supabase
      .from("field_validations")
      .upsert(
        {
          project_id: projectId,
          analysis_id: analysisId,
          recommendation_id: recommendationId,
          alert_id: alertId,
          validated_by: user.id,
          validation_result: body.validationResult,
          actual_cause: actualCause,
          observed_severity: observedSeverity,
          observed_at: body.observedAt,
          note,
          prediction_snapshot: predictionSnapshot,
        },
        {
          onConflict: "analysis_id,validated_by",
        }
      )
      .select(
        [
          "id",
          "project_id",
          "analysis_id",
          "recommendation_id",
          "alert_id",
          "validated_by",
          "validation_result",
          "actual_cause",
          "observed_severity",
          "observed_at",
          "note",
          "prediction_snapshot",
          "created_at",
          "updated_at",
        ].join(",")
      )
      .single();

    if (saveError) {
      console.error("FIELD VALIDATION SAVE ERROR:", saveError);

      return NextResponse.json(
        { error: "Nepodařilo se uložit terénní ověření." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      validation: savedValidation,
    });
  } catch (error) {
    console.error("FIELD VALIDATION POST ERROR:", error);

    return NextResponse.json(
      { error: "Nepodařilo se uložit terénní ověření." },
      { status: 500 }
    );
  }
}

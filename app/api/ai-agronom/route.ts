import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import OpenAI from "openai";
import { requireAccountAccess } from "@/lib/auth/account-access";

export const dynamic = "force-dynamic";

type RequestBody = {
  projectId?: number;
  message?: string;
};

function numericOrNull(value: unknown): number | null {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function limitArray<T>(value: T[] | null | undefined, max: number): T[] {
  return Array.isArray(value) ? value.slice(0, max) : [];
}

export async function POST(request: Request) {
  try {
    /*
     * ---------------------------------------------------------
     * AUTHENTICATION
     * ---------------------------------------------------------
     */

    const cookieStore = await cookies();

    const supabase = createServerClient(
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

    /*
     * ---------------------------------------------------------
     * REQUEST
     * ---------------------------------------------------------
     */

    let body: RequestBody;

    try {
      body = (await request.json()) as RequestBody;
    } catch {
      return NextResponse.json(
        { error: "Neplatný formát požadavku." },
        { status: 400 }
      );
    }

    const projectId = Number(body.projectId);
    const message =
      typeof body.message === "string" ? body.message.trim() : "";

    if (!Number.isInteger(projectId) || projectId <= 0) {
      return NextResponse.json(
        { error: "Neplatné ID projektu." },
        { status: 400 }
      );
    }

    if (!message) {
      return NextResponse.json(
        { error: "Dotaz pro AI Agronoma je prázdný." },
        { status: 400 }
      );
    }

    if (message.length > 2000) {
      return NextResponse.json(
        {
          error:
            "Dotaz je příliš dlouhý. Maximální délka je 2000 znaků.",
        },
        { status: 400 }
      );
    }

    /*
     * ---------------------------------------------------------
     * PROJECT + ORGANIZATION ACCESS
     * ---------------------------------------------------------
     */

    const { data: project, error: projectError } = await supabase
      .from("projects")
      .select(
        `
        id,
        name,
        latitude,
        longitude,
        status,
        created_at,
        organization_id,
        crop_catalog_id,
        variety_catalog_id,
        crop_name,
        crop_variety,
        sowing_date,
        expected_harvest_date,
        area_ha,
        farming_method,
        growth_stage,
        growth_stage_updated_at
        `
      )
      .eq("id", projectId)
      .maybeSingle();

    if (projectError) {
      console.error(
        "AI AGRONOM PROJECT LOAD ERROR:",
        projectError
      );

      return NextResponse.json(
        { error: "Projekt se nepodařilo načíst." },
        { status: 500 }
      );
    }

    if (!project) {
      return NextResponse.json(
        {
          error:
            "Projekt nebyl nalezen nebo k němu nemáte přístup.",
        },
        { status: 404 }
      );
    }

    if (!project.organization_id) {
      console.error(
        "AI AGRONOM PROJECT WITHOUT ORGANIZATION:",
        projectId
      );

      return NextResponse.json(
        { error: "Projekt nemá nastavenou organizaci." },
        { status: 500 }
      );
    }

    const { data: membership, error: membershipError } =
      await supabase
        .from("organization_members")
        .select("role")
        .eq("organization_id", project.organization_id)
        .eq("user_id", user.id)
        .maybeSingle();

    if (membershipError) {
      console.error(
        "AI AGRONOM MEMBERSHIP ERROR:",
        membershipError
      );

      return NextResponse.json(
        { error: "Nepodařilo se ověřit oprávnění k projektu." },
        { status: 500 }
      );
    }

    if (!membership) {
      return NextResponse.json(
        {
          error:
            "K tomuto projektu nemáte oprávnění.",
          code: "INSUFFICIENT_ORGANIZATION_ROLE",
        },
        { status: 403 }
      );
    }

    /*
     * ---------------------------------------------------------
     * CORE AEGRIS CONTEXT
     * ---------------------------------------------------------
     */

    const [
      analysisResult,
      recommendationResult,
      soilResult,
      fertilizationInputResult,
    ] = await Promise.all([
      supabase
        .from("analysis")
        .select("*")
        .eq("project_id", projectId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle(),

      supabase
        .from("aegris_recommendations")
        .select("*")
        .eq("project_id", projectId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle(),

      supabase
        .from("project_soil_profiles")
        .select("*")
        .eq("project_id", projectId)
        .maybeSingle(),

      supabase
        .from("project_fertilization_inputs")
        .select("*")
        .eq("project_id", projectId)
        .maybeSingle(),
    ]);

    if (analysisResult.error) {
      console.error(
        "AI AGRONOM ANALYSIS LOAD ERROR:",
        analysisResult.error
      );
    }

    if (recommendationResult.error) {
      console.error(
        "AI AGRONOM RECOMMENDATION LOAD ERROR:",
        recommendationResult.error
      );
    }

    if (soilResult.error) {
      console.error(
        "AI AGRONOM SOIL LOAD ERROR:",
        soilResult.error
      );
    }

    if (fertilizationInputResult.error) {
      console.error(
        "AI AGRONOM FERTILIZATION INPUT LOAD ERROR:",
        fertilizationInputResult.error
      );
    }

    const analysis = analysisResult.data ?? null;
    const recommendation = recommendationResult.data ?? null;
    const soilProfile = soilResult.data ?? null;
    const fertilizationInputs =
      fertilizationInputResult.data ?? null;

    /*
     * ---------------------------------------------------------
     * CROP CATALOG + PROFILE
     * ---------------------------------------------------------
     */

    let cropCatalogItem: Record<string, unknown> | null = null;
    let varietyCatalogItem: Record<string, unknown> | null = null;
    let cropProfile: Record<string, unknown> | null = null;
    let cropStageProfile: Record<string, unknown> | null = null;

    if (project.crop_catalog_id != null) {
      const { data, error } = await supabase
        .from("crop_catalog")
        .select(
          "id, name, scientific_name, external_code, crop_profile_id, source_system"
        )
        .eq("id", project.crop_catalog_id)
        .maybeSingle();

      if (error) {
        console.error(
          "AI AGRONOM CROP CATALOG ERROR:",
          error
        );
      } else {
        cropCatalogItem = data;
      }
    }

    if (project.variety_catalog_id != null) {
      const { data, error } = await supabase
        .from("variety_catalog")
        .select(
          "id, crop_id, name, external_code, registration_status, registration_status_code"
        )
        .eq("id", project.variety_catalog_id)
        .maybeSingle();

      if (error) {
        console.error(
          "AI AGRONOM VARIETY CATALOG ERROR:",
          error
        );
      } else {
        varietyCatalogItem = data;
      }
    }

    const cropProfileId =
      cropCatalogItem &&
      typeof cropCatalogItem.crop_profile_id === "number"
        ? cropCatalogItem.crop_profile_id
        : null;

    if (cropProfileId != null) {
      const { data, error } = await supabase
        .from("crop_profiles")
        .select("*")
        .eq("id", cropProfileId)
        .maybeSingle();

      if (error) {
        console.error(
          "AI AGRONOM CROP PROFILE ERROR:",
          error
        );
      } else {
        cropProfile = data;
      }

      if (project.growth_stage) {
        const { data: stageData, error: stageError } =
          await supabase
            .from("crop_stage_profiles")
            .select("*")
            .eq("crop_profile_id", cropProfileId)
            .eq("growth_stage", project.growth_stage)
            .maybeSingle();

        if (stageError) {
          console.error(
            "AI AGRONOM CROP STAGE PROFILE ERROR:",
            stageError
          );
        } else {
          cropStageProfile = stageData;
        }
      }
    }

    /*
     * ---------------------------------------------------------
     * NDVI HISTORY
     * ---------------------------------------------------------
     */

    const { data: ndviHistoryData, error: ndviHistoryError } =
      await supabase
        .from("ndvi_history")
        .select(
          "id, period_from, period_to, ndvi, created_at"
        )
        .eq("project_id", projectId)
        .order("period_from", { ascending: false })
        .limit(10);

    if (ndviHistoryError) {
      console.error(
        "AI AGRONOM NDVI HISTORY ERROR:",
        ndviHistoryError
      );
    }

    const ndviHistory = limitArray(
      ndviHistoryData ?? [],
      10
    );

    /*
     * ---------------------------------------------------------
     * NUTRITION REFERENCE DATA
     * ---------------------------------------------------------
     */

    let nutrientRequirements: Record<string, unknown>[] = [];
    let yieldLevels: Record<string, unknown>[] = [];
    let nitrogenSplits: Record<string, unknown>[] = [];

    if (cropProfileId != null) {
      const [
        requirementResult,
        yieldLevelResult,
        nitrogenSplitResult,
      ] = await Promise.all([
        supabase
          .from("crop_nutrient_requirements")
          .select(
            `
            nutrient,
            nutrient_form,
            yield_level,
            soil_supply_class,
            demand_group,
            dose_kg_ha,
            min_dose_kg_ha,
            max_dose_kg_ha,
            recommendation_type,
            source_table,
            source_note
            `
          )
          .eq("crop_profile_id", cropProfileId),

        supabase
          .from("crop_yield_levels")
          .select(
            "yield_level, min_yield_t_ha, max_yield_t_ha, source_table, notes"
          )
          .eq("crop_profile_id", cropProfileId),

        supabase
          .from("crop_nitrogen_splits")
          .select(
            "application_stage, application_order, share_percent, source_table, notes"
          )
          .eq("crop_profile_id", cropProfileId)
          .order("application_order", { ascending: true }),
      ]);

      if (requirementResult.error) {
        console.error(
          "AI AGRONOM NUTRIENT REQUIREMENTS ERROR:",
          requirementResult.error
        );
      } else {
        nutrientRequirements =
          requirementResult.data ?? [];
      }

      if (yieldLevelResult.error) {
        console.error(
          "AI AGRONOM YIELD LEVELS ERROR:",
          yieldLevelResult.error
        );
      } else {
        yieldLevels = yieldLevelResult.data ?? [];
      }

      if (nitrogenSplitResult.error) {
        console.error(
          "AI AGRONOM NITROGEN SPLITS ERROR:",
          nitrogenSplitResult.error
        );
      } else {
        nitrogenSplits =
          nitrogenSplitResult.data ?? [];
      }
    }

    /*
     * ---------------------------------------------------------
     * DETERMINISTIC SNAPSHOT
     * ---------------------------------------------------------
     *
     * AI nikdy neurčuje autoritativní stav projektu.
     * Decision Engine snapshot uložený v analysis je primární.
     * Recommendation je fallback pro starší analýzy.
     * ---------------------------------------------------------
     */

    const decisionSnapshot =
      analysis?.decision_snapshot &&
      typeof analysis.decision_snapshot === "object"
        ? analysis.decision_snapshot
        : null;

    const weatherSnapshot =
      recommendation?.weather_snapshot &&
      typeof recommendation.weather_snapshot === "object"
        ? recommendation.weather_snapshot
        : null;

    const deterministicDecision = {
      level:
        decisionSnapshot?.level ??
        recommendation?.level ??
        null,

      priority:
        decisionSnapshot?.priority ??
        recommendation?.priority ??
        null,

      score:
        numericOrNull(
          decisionSnapshot?.score ??
            recommendation?.score
        ),

      scoreLevel:
        decisionSnapshot?.scoreLevel ?? null,

      summary:
        decisionSnapshot?.summary ??
        recommendation?.summary ??
        null,

      recommendation:
        decisionSnapshot?.recommendation ??
        recommendation?.recommendation ??
        null,

      actions:
        Array.isArray(decisionSnapshot?.actions)
          ? decisionSnapshot.actions
          : Array.isArray(recommendation?.actions)
            ? recommendation.actions
            : [],

      factors:
        Array.isArray(decisionSnapshot?.factors)
          ? decisionSnapshot.factors
          : [],

      diagnoses:
        Array.isArray(decisionSnapshot?.diagnoses)
          ? decisionSnapshot.diagnoses
          : [],

      trend:
        decisionSnapshot?.trend ?? null,

      dataCompletenessPct:
        numericOrNull(
          decisionSnapshot?.dataCompletenessPct ??
            analysis?.data_completeness_pct
        ),

      criticalFactorCount:
        numericOrNull(
          decisionSnapshot?.criticalFactorCount
        ),

      evaluatedFactorCount:
        numericOrNull(
          decisionSnapshot?.evaluatedFactorCount
        ),
    };

    /*
     * ---------------------------------------------------------
     * CONTEXT SENT TO MODEL
     * ---------------------------------------------------------
     */

    const aegrisContext = {
      generatedAt: new Date().toISOString(),

      project: {
        id: project.id,
        name: project.name,
        status: project.status,
        areaHa: numericOrNull(project.area_ha),
        latitude: numericOrNull(project.latitude),
        longitude: numericOrNull(project.longitude),
        cropName: project.crop_name,
        cropVariety: project.crop_variety,
        growthStage: project.growth_stage,
        growthStageUpdatedAt:
          project.growth_stage_updated_at,
        sowingDate: project.sowing_date,
        expectedHarvestDate:
          project.expected_harvest_date,
        farmingMethod: project.farming_method,
      },

      crop: {
        catalog: cropCatalogItem,
        variety: varietyCatalogItem,
        profile: cropProfile,
        stageProfile: cropStageProfile,
      },

      latestAnalysis: analysis
        ? {
            id: analysis.id,
            createdAt: analysis.created_at,

            ndvi: numericOrNull(analysis.ndvi),
            vegetation: numericOrNull(
              analysis.vegetation
            ),
            risk: analysis.risk,

            periodFrom: analysis.period_from ?? null,
            periodTo: analysis.period_to ?? null,

            sourceProvider:
              analysis.source_provider ?? null,
            satellite: analysis.satellite ?? null,
            satelliteProduct:
              analysis.satellite_product ?? null,
            spatialResolutionM: numericOrNull(
              analysis.spatial_resolution_m
            ),

            validGeometryPct: numericOrNull(
              analysis.valid_geometry_pct
            ),
            qualityGatePct: numericOrNull(
              analysis.quality_gate_pct
            ),

            medianNdvi: numericOrNull(
              analysis.median_ndvi
            ),
            p05Ndvi: numericOrNull(
              analysis.p05_ndvi
            ),
            p95Ndvi: numericOrNull(
              analysis.p95_ndvi
            ),
          }
        : null,

      decision: deterministicDecision,

      weatherSnapshot,

      soilProfile,

      ndviHistory,

      nutrition: {
        projectInputs: fertilizationInputs,
        cropYieldLevels: yieldLevels,
        nutrientRequirements:
          nutrientRequirements,
        nitrogenSplits,
      },
    };

    /*
     * ---------------------------------------------------------
     * OPENAI
     * ---------------------------------------------------------
     */

    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      console.error(
        "AI AGRONOM: CHYBÍ OPENAI_API_KEY"
      );

      return NextResponse.json(
        {
          error:
            "AI Agronom není na serveru nakonfigurován.",
          code: "OPENAI_API_KEY_MISSING",
        },
        { status: 500 }
      );
    }

    const openai = new OpenAI({
      apiKey,
    });

    const instructions = `
Jsi AI Agronom systému AEGRIS.

Tvoje úloha je vysvětlovat stav konkrétního zemědělského pozemku
výhradně na základě strukturovaných dat AEGRIS předaných v kontextu.

DŮLEŽITÁ PRAVIDLA:

1. Decision Engine AEGRIS je autoritativní zdroj hodnocení rizika.
   Nikdy svévolně neměň jeho level, prioritu, skóre, faktory ani doporučení.

2. Nevymýšlej žádná měření.
   Pokud hodnota v datech chybí, řekni jasně, že není k dispozici.

3. Rozlišuj mezi:
   - skutečně naměřenými nebo uloženými daty,
   - deterministickým výpočtem AEGRIS,
   - agronomickým vysvětlením.

4. Neprezentuj půdní vlhkost jako skutečně naměřenou,
   pokud taková hodnota v kontextu není.

5. NDVI není samo o sobě diagnóza choroby, škůdce,
   nedostatku živin ani vodního stresu.
   Může být pouze indikací změny vegetačního stavu.

6. Diagnózu choroby nebo škůdce nepotvrzuj bez terénního ověření.

7. Pokud AEGRIS doporučuje terénní kontrolu,
   vysvětli konkrétně co má uživatel na poli zkontrolovat.

8. U výživy a hnojení používej pouze hodnoty,
   které jsou skutečně přítomné v kontextu.
   Nevymýšlej dávky hnojiv.
   Pokud data nestačí k bezpečnému stanovení dávky,
   řekni které vstupy chybí.

9. Nmin uvedený v kontextu nepovažuj automaticky
   za odpočet z dávky dusíku, pokud takový deterministický
   výpočet AEGRIS výslovně není součástí dat.

10. Neuváděj konkrétní přípravek na ochranu rostlin,
    účinnou látku ani dávku POR, pokud tyto informace
    nejsou součástí ověřených dat AEGRIS.

11. Neříkej uživateli, že něco bylo fyzicky provedeno na poli.
    AEGRIS pouze vyhodnocuje dostupná data a doporučuje kontrolu nebo postup.

12. Když jsou data stará, upozorni na datum poslední analýzy
    nebo snapshotu.

13. Pokud uživatel položí otázku mimo dostupná data projektu,
    můžeš stručně vysvětlit obecný agronomický princip,
    ale musíš jasně oddělit obecnou informaci od konkrétního
    hodnocení tohoto pozemku.

14. Odpovídej česky, pokud uživatel výslovně nepoužije jiný jazyk.

15. Odpověď má být praktická, stručná a srozumitelná agronomovi.
    Nepoužívej marketingové fráze.

16. Pokud uživatel napíše například "Zhodnoť pozemek",
    struktura odpovědi má být přibližně:
    - aktuální stav,
    - hlavní riziko nebo důvod upozornění,
    - co ukazují dostupná data,
    - co dnes zkontrolovat na poli,
    - která důležitá data chybí.

17. Nikdy nepředstírej vyšší jistotu, než jakou podporují data AEGRIS.
`;

    const response = await openai.responses.create({
      model: "gpt-5.6-luna",

      reasoning: {
        effort: "low",
      },

      max_output_tokens: 1400,

      instructions,

      input: [
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: `
DOTAZ UŽIVATELE:
${message}

AKTUÁLNÍ STRUKTUROVANÝ KONTEXT AEGRIS:
${JSON.stringify(aegrisContext, null, 2)}
              `.trim(),
            },
          ],
        },
      ],
    });

    const answer = response.output_text?.trim();

    if (!answer) {
      console.error(
        "AI AGRONOM EMPTY RESPONSE:",
        response.id
      );

      return NextResponse.json(
        {
          error:
            "AI Agronom nevytvořil platnou odpověď.",
        },
        { status: 502 }
      );
    }

    /*
     * ---------------------------------------------------------
     * RESPONSE
     * ---------------------------------------------------------
     */

    return NextResponse.json({
      answer,

      meta: {
        projectId,
        analysisId: analysis?.id ?? null,
        model: "gpt-5.6-luna",
        generatedAt: new Date().toISOString(),

        decisionSource: decisionSnapshot
          ? "analysis.decision_snapshot"
          : recommendation
            ? "aegris_recommendations"
            : "none",

        dataCompletenessPct:
          deterministicDecision.dataCompletenessPct,
      },
    });
  } catch (error) {
    console.error(
      "AI AGRONOM ROUTE ERROR:",
      error
    );

    if (
      error instanceof OpenAI.APIError
    ) {
      return NextResponse.json(
        {
          error:
            "AI služba momentálně neodpověděla správně.",
          code: "OPENAI_API_ERROR",
        },
        {
          status:
            error.status &&
            error.status >= 400 &&
            error.status < 600
              ? error.status
              : 502,
        }
      );
    }

    return NextResponse.json(
      {
        error:
          "Při zpracování dotazu AI Agronoma nastala chyba.",
      },
      { status: 500 }
    );
  }
}
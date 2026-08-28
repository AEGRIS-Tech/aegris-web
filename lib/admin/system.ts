import "server-only";

import { supabaseAdmin } from "@/lib/supabaseAdmin";

export type AdminSystemOverview = {
  database: {
    status: "ok" | "error";
    latencyMs: number;
  };

  data: {
    profiles: number;
    projects: number;
    analyses: number;
    demoRequests: number;
    alerts: number;
    recommendations: number;
  };

  analysis: {
    latestAnalysisAt: string | null;
    analysesToday: number;
    analysesLast24Hours: number;
  };

  demo: {
    active: number;
    expired: number;
    expiringSoon: number;
    pendingRequests: number;
  };

  alerts: {
    total: number;
    recent24Hours: number;
  };

  generatedAt: string;
};

async function getCount(
  table: string
): Promise<number> {
  const { count, error } = await supabaseAdmin
    .from(table)
    .select("*", {
      count: "exact",
      head: true,
    });

  if (error) {
    console.error(
      `ADMIN SYSTEM COUNT ERROR [${table}]:`,
      error
    );

    return 0;
  }

  return count ?? 0;
}

export async function getAdminSystemOverview(): Promise<AdminSystemOverview> {
  const startedAt = Date.now();
  const now = new Date();

  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);

  const last24Hours = new Date(
    now.getTime() - 24 * 60 * 60 * 1000
  );

  const threeDaysFromNow = new Date(
    now.getTime() + 3 * 24 * 60 * 60 * 1000
  );

  /*
   * Základní DB health check.
   */
  const databaseCheck = await supabaseAdmin
    .from("profiles")
    .select("id")
    .limit(1);

  const databaseStatus: "ok" | "error" =
    databaseCheck.error ? "error" : "ok";

  if (databaseCheck.error) {
    console.error(
      "ADMIN SYSTEM DATABASE CHECK ERROR:",
      databaseCheck.error
    );
  }

  const databaseLatencyMs =
    Date.now() - startedAt;

  /*
   * Celkové počty.
   */
  const [
    profiles,
    projects,
    analyses,
    demoRequests,
    alerts,
    recommendations,
  ] = await Promise.all([
    getCount("profiles"),
    getCount("projects"),
    getCount("analysis"),
    getCount("demo_requests"),
    getCount("aegris_alerts"),
    getCount("aegris_recommendations"),
  ]);

  /*
   * Poslední analýza.
   */
  const latestAnalysisResult = await supabaseAdmin
    .from("analysis")
    .select("created_at")
    .order("created_at", {
      ascending: false,
    })
    .limit(1)
    .maybeSingle();

  if (latestAnalysisResult.error) {
    console.error(
      "ADMIN SYSTEM LATEST ANALYSIS ERROR:",
      latestAnalysisResult.error
    );
  }

  /*
   * Analýzy dnes.
   */
  const analysesTodayResult =
    await supabaseAdmin
      .from("analysis")
      .select("*", {
        count: "exact",
        head: true,
      })
      .gte(
        "created_at",
        startOfToday.toISOString()
      );

  if (analysesTodayResult.error) {
    console.error(
      "ADMIN SYSTEM ANALYSES TODAY ERROR:",
      analysesTodayResult.error
    );
  }

  /*
   * Analýzy za posledních 24 hodin.
   */
  const analysesLast24HoursResult =
    await supabaseAdmin
      .from("analysis")
      .select("*", {
        count: "exact",
        head: true,
      })
      .gte(
        "created_at",
        last24Hours.toISOString()
      );

  if (analysesLast24HoursResult.error) {
    console.error(
      "ADMIN SYSTEM ANALYSES 24H ERROR:",
      analysesLast24HoursResult.error
    );
  }

  /*
   * Aktivní DEMO.
   */
  const activeDemoResult = await supabaseAdmin
    .from("profiles")
    .select("*", {
      count: "exact",
      head: true,
    })
    .eq("account_type", "demo")
    .gt(
      "demo_expires_at",
      now.toISOString()
    );

  if (activeDemoResult.error) {
    console.error(
      "ADMIN SYSTEM ACTIVE DEMO ERROR:",
      activeDemoResult.error
    );
  }

  /*
   * Expirované DEMO.
   */
  const expiredDemoResult =
    await supabaseAdmin
      .from("profiles")
      .select("*", {
        count: "exact",
        head: true,
      })
      .eq("account_type", "demo")
      .lte(
        "demo_expires_at",
        now.toISOString()
      );

  if (expiredDemoResult.error) {
    console.error(
      "ADMIN SYSTEM EXPIRED DEMO ERROR:",
      expiredDemoResult.error
    );
  }

  /*
   * DEMO expirující během 3 dnů.
   */
  const expiringDemoResult =
    await supabaseAdmin
      .from("profiles")
      .select("*", {
        count: "exact",
        head: true,
      })
      .eq("account_type", "demo")
      .gt(
        "demo_expires_at",
        now.toISOString()
      )
      .lte(
        "demo_expires_at",
        threeDaysFromNow.toISOString()
      );

  if (expiringDemoResult.error) {
    console.error(
      "ADMIN SYSTEM EXPIRING DEMO ERROR:",
      expiringDemoResult.error
    );
  }

  /*
   * DEMO žádosti čekající na dokončení.
   *
   * Zatím počítáme všechny žádosti,
   * které nejsou ve stavu contacted.
   */
  const pendingDemoResult =
    await supabaseAdmin
      .from("demo_requests")
      .select("*", {
        count: "exact",
        head: true,
      })
      .neq("status", "contacted");

  if (pendingDemoResult.error) {
    console.error(
      "ADMIN SYSTEM PENDING DEMO ERROR:",
      pendingDemoResult.error
    );
  }

  /*
   * Alerty za posledních 24 hodin.
   */
  const recentAlertsResult =
    await supabaseAdmin
      .from("aegris_alerts")
      .select("*", {
        count: "exact",
        head: true,
      })
      .gte(
        "created_at",
        last24Hours.toISOString()
      );

  if (recentAlertsResult.error) {
    console.error(
      "ADMIN SYSTEM RECENT ALERTS ERROR:",
      recentAlertsResult.error
    );
  }

  return {
    database: {
      status: databaseStatus,
      latencyMs: databaseLatencyMs,
    },

    data: {
      profiles,
      projects,
      analyses,
      demoRequests,
      alerts,
      recommendations,
    },

    analysis: {
      latestAnalysisAt:
        latestAnalysisResult.data?.created_at ??
        null,

      analysesToday:
        analysesTodayResult.count ?? 0,

      analysesLast24Hours:
        analysesLast24HoursResult.count ?? 0,
    },

    demo: {
      active:
        activeDemoResult.count ?? 0,

      expired:
        expiredDemoResult.count ?? 0,

      expiringSoon:
        expiringDemoResult.count ?? 0,

      pendingRequests:
        pendingDemoResult.count ?? 0,
    },

    alerts: {
      total: alerts,

      recent24Hours:
        recentAlertsResult.count ?? 0,
    },

    generatedAt: now.toISOString(),
  };
}
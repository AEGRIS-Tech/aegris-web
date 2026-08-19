import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

const DEMO_DURATION_DAYS = 14;

export async function POST(request: Request) {
  try {
    // ============================================
    // OCHRANA ENDPOINTU
    // ============================================

    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret) {
      console.error("CHYBA: CRON_SECRET není nastavený.");

      return NextResponse.json(
        {
          error: "Server není správně nakonfigurován.",
        },
        { status: 500 }
      );
    }

    const authorization = request.headers.get("authorization");

    if (authorization !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        {
          error: "Unauthorized",
        },
        { status: 401 }
      );
    }

    // ============================================
    // NAČTENÍ NOVÝCH DEMO ŽÁDOSTÍ
    // ============================================

    const { data: requests, error: requestsError } =
      await supabaseAdmin
        .from("demo_requests")
        .select(
          "id, full_name, company, email, phone, message, user_id, approved_at, created_at"
        )
        .is("user_id", null)
        .is("approved_at", null)
        .order("created_at", {
          ascending: true,
        })
        .limit(10);

    if (requestsError) {
      console.error(
        "CHYBA NAČTENÍ DEMO ŽÁDOSTÍ:",
        requestsError
      );

      return NextResponse.json(
        {
          error: "Nepodařilo se načíst DEMO žádosti.",
        },
        { status: 500 }
      );
    }

    if (!requests || requests.length === 0) {
      return NextResponse.json({
        success: true,
        processed: 0,
        failed: 0,
        total: 0,
        message: "Žádné nové DEMO žádosti.",
      });
    }

    // ============================================
    // ZÁKLADNÍ URL APLIKACE
    // ============================================

    const appUrl =
      process.env.NEXT_PUBLIC_SITE_URL ||
      new URL(request.url).origin;

    const redirectTo =
      `${appUrl}/auth/accept-invite`;

    let processed = 0;
    let failed = 0;

    // ============================================
    // AKTIVACE JEDNOTLIVÝCH DEMO ŽÁDOSTÍ
    // ============================================

    for (const demoRequest of requests) {
      try {
        let userId: string | null = null;

        // ----------------------------------------
        // KONTROLA, ZDA AUTH ÚČET UŽ EXISTUJE
        // ----------------------------------------

        const {
          data: usersData,
          error: usersError,
        } = await supabaseAdmin.auth.admin.listUsers({
          page: 1,
          perPage: 1000,
        });

        if (usersError) {
          console.error(
            `CHYBA NAČTENÍ AUTH UŽIVATELŮ PRO ${demoRequest.email}:`,
            usersError
          );

          failed++;
          continue;
        }

        const existingUser = usersData.users.find(
          (user) =>
            user.email?.toLowerCase() ===
            demoRequest.email.toLowerCase()
        );

        // ----------------------------------------
        // EXISTUJÍCÍ UŽIVATEL
        // ----------------------------------------

        if (existingUser) {
          userId = existingUser.id;

          console.log(
            `AUTH UŽIVATEL UŽ EXISTUJE: ${demoRequest.email} | ${userId}`
          );
        }

        // ----------------------------------------
        // NOVÝ UŽIVATEL → POZVÁNKA
        // ----------------------------------------

        if (!userId) {
          const {
            data: inviteData,
            error: inviteError,
          } =
            await supabaseAdmin.auth.admin.inviteUserByEmail(
              demoRequest.email,
              {
                data: {
                  full_name:
                    demoRequest.full_name,
                  company:
                    demoRequest.company,
                  account_type: "demo",
                },
                redirectTo,
              }
            );

          if (inviteError) {
            console.error(
              `CHYBA POZVÁNKY PRO ${demoRequest.email}:`,
              inviteError
            );

            failed++;
            continue;
          }

          userId =
            inviteData.user?.id ?? null;

          if (!userId) {
            console.error(
              `AUTH UŽIVATEL NEBYL VYTVOŘEN PRO ${demoRequest.email}`
            );

            failed++;
            continue;
          }
        }

        // ----------------------------------------
        // AKTIVACE 14DENNÍHO DEMO
        // ----------------------------------------

        const startedAt = new Date();

        const expiresAt = new Date(
          startedAt.getTime() +
            DEMO_DURATION_DAYS *
              24 *
              60 *
              60 *
              1000
        );

        // ----------------------------------------
        // VYTVOŘENÍ / AKTIVACE PROFILU
        // ----------------------------------------

        const { error: profileError } =
          await supabaseAdmin
            .from("profiles")
            .upsert(
              {
                id: userId,
                account_type: "demo",
                demo_started_at:
                  startedAt.toISOString(),
                demo_expires_at:
                  expiresAt.toISOString(),
              },
              {
                onConflict: "id",
              }
            );

        if (profileError) {
          console.error(
            `CHYBA PROFILU PRO ${demoRequest.email}:`,
            profileError
          );

          failed++;
          continue;
        }

        // ----------------------------------------
        // OZNAČENÍ DEMO ŽÁDOSTI JAKO AKTIVOVANÉ
        // ----------------------------------------

        const { error: updateError } =
          await supabaseAdmin
            .from("demo_requests")
            .update({
              user_id: userId,
              approved_at:
                startedAt.toISOString(),
            })
            .eq("id", demoRequest.id)
            .is("user_id", null)
            .is("approved_at", null);

        if (updateError) {
          console.error(
            `CHYBA AKTUALIZACE DEMO ŽÁDOSTI ${demoRequest.id}:`,
            updateError
          );

          failed++;
          continue;
        }

        processed++;

        console.log(
          `DEMO AKTIVOVÁNO: ${demoRequest.email} | ` +
            `od ${startedAt.toISOString()} | ` +
            `do ${expiresAt.toISOString()}`
        );
      } catch (error) {
        console.error(
          `CHYBA ZPRACOVÁNÍ DEMO ${demoRequest.email}:`,
          error
        );

        failed++;
      }
    }

    return NextResponse.json({
      success: true,
      processed,
      failed,
      total: requests.length,
    });
  } catch (error) {
    console.error(
      "CHYBA DEMO ACTIVATION API:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Nepodařilo se zpracovat DEMO aktivace.",
      },
      { status: 500 }
    );
  }
}
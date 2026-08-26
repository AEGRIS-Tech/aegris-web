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
      console.error(
        "DEMO ACTIVATION: CRON_SECRET není nastavený."
      );

      return NextResponse.json(
        {
          success: false,
          error:
            "Server není správně nakonfigurován.",
        },
        { status: 500 }
      );
    }

    const authorization =
      request.headers.get("authorization");

    if (
      authorization !== `Bearer ${cronSecret}`
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized",
        },
        { status: 401 }
      );
    }

    // ============================================
    // URL APLIKACE
    // ============================================

    const appUrl =
      process.env.NEXT_PUBLIC_SITE_URL ||
      new URL(request.url).origin;

    const redirectTo =
      `${appUrl}/auth/callback?next=${encodeURIComponent("/auth/accept-invite")}`;

    // ============================================
    // NAČTENÍ NOVÝCH DEMO ŽÁDOSTÍ
    // ============================================

    const {
      data: demoRequests,
      error: requestsError,
    } = await supabaseAdmin
      .from("demo_requests")
      .select(
        "id, full_name, company, email, phone, message, status, user_id, approved_at, created_at"
      )
      .eq("status", "new")
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
          success: false,
          error:
            "Nepodařilo se načíst DEMO žádosti.",
        },
        { status: 500 }
      );
    }

    if (
      !demoRequests ||
      demoRequests.length === 0
    ) {
      return NextResponse.json({
        success: true,
        processed: 0,
        failed: 0,
        skipped: 0,
        total: 0,
        message:
          "Žádné nové DEMO žádosti.",
      });
    }

    let processed = 0;
    let failed = 0;
    let skipped = 0;

    // ============================================
    // AUTH UŽIVATELÉ
    // ============================================
    //
    // Načteme je jednou pro celý batch.
    // ============================================

    const {
      data: usersData,
      error: usersError,
    } =
      await supabaseAdmin.auth.admin.listUsers({
        page: 1,
        perPage: 1000,
      });

    if (usersError) {
      console.error(
        "CHYBA NAČTENÍ AUTH UŽIVATELŮ:",
        usersError
      );

      return NextResponse.json(
        {
          success: false,
          error:
            "Nepodařilo se ověřit uživatelské účty.",
        },
        { status: 500 }
      );
    }

    // Mapa obsahuje pouze ID existujících uživatelů.
    // Nemusíme tak zpřísňovat Supabase User typ.
    const authUserIdsByEmail =
      new Map<string, string>();

    for (const user of usersData.users) {
      if (
        typeof user.email !== "string" ||
        !user.email
      ) {
        continue;
      }

      authUserIdsByEmail.set(
        user.email.toLowerCase(),
        user.id
      );
    }

    // ============================================
    // ZPRACOVÁNÍ DEMO ŽÁDOSTÍ
    // ============================================

    for (const demoRequest of demoRequests) {
      try {
        const normalizedEmail =
          demoRequest.email
            .trim()
            .toLowerCase();

        const existingUserId =
          authUserIdsByEmail.get(
            normalizedEmail
          );

        // ========================================
        // EXISTUJÍCÍ AUTH ÚČET
        // ========================================
        //
        // Veřejná DEMO žádost nesmí změnit
        // existující účet na DEMO.
        // ========================================

        if (existingUserId) {
          const {
            error: closeError,
          } = await supabaseAdmin
            .from("demo_requests")
            .update({
              status: "closed",
              user_id: existingUserId,
            })
            .eq("id", demoRequest.id)
            .eq("status", "new")
            .is("user_id", null)
            .is("approved_at", null);

          if (closeError) {
            console.error(
              `CHYBA UZAVŘENÍ DEMO ŽÁDOSTI ${demoRequest.id}:`,
              closeError
            );

            failed++;
            continue;
          }

          skipped++;
          continue;
        }

        // ========================================
        // ČASOVÉ OMEZENÍ DEMO
        // ========================================

        const startedAt = new Date();

        const expiresAt = new Date(
          startedAt.getTime() +
            DEMO_DURATION_DAYS *
              24 *
              60 *
              60 *
              1000
        );

        const startedAtIso =
          startedAt.toISOString();

        const expiresAtIso =
          expiresAt.toISOString();

        // ========================================
        // SUPABASE POZVÁNKA
        // ========================================

        const {
          data: inviteData,
          error: inviteError,
        } =
          await supabaseAdmin.auth.admin
            .inviteUserByEmail(
              normalizedEmail,
              {
                redirectTo,
                data: {
                  full_name:
                    demoRequest.full_name,
                  company:
                    demoRequest.company,
                  account_type: "demo",
                },
              }
            );

        if (
          inviteError ||
          !inviteData.user?.id
        ) {
          console.error(
            `CHYBA DEMO POZVÁNKY PRO ŽÁDOST ${demoRequest.id}:`,
            inviteError
          );

          failed++;
          continue;
        }

        const userId =
          inviteData.user.id;

        // ========================================
        // DEMO PROFIL
        // ========================================

        const {
          error: profileError,
        } = await supabaseAdmin
          .from("profiles")
          .upsert(
            {
              id: userId,
              account_type: "demo",
              demo_started_at:
                startedAtIso,
              demo_expires_at:
                expiresAtIso,
            },
            {
              onConflict: "id",
            }
          );

        if (profileError) {
          console.error(
            `CHYBA DEMO PROFILU PRO ŽÁDOST ${demoRequest.id}:`,
            profileError
          );

          failed++;
          continue;
        }

        // ========================================
        // OZNAČENÍ ŽÁDOSTI
        // ========================================

        const {
          error: updateError,
        } = await supabaseAdmin
          .from("demo_requests")
          .update({
            status: "contacted",
            user_id: userId,
            approved_at:
              startedAtIso,
          })
          .eq("id", demoRequest.id)
          .eq("status", "new")
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

        // Zabráníme duplicitnímu zpracování
        // stejného e-mailu v tomto batchi.
        authUserIdsByEmail.set(
          normalizedEmail,
          userId
        );
      } catch (error) {
        console.error(
          `CHYBA ZPRACOVÁNÍ DEMO ŽÁDOSTI ${demoRequest.id}:`,
          error
        );

        failed++;
      }
    }

    // ============================================
    // VÝSLEDEK
    // ============================================

    return NextResponse.json({
      success: failed === 0,
      processed,
      failed,
      skipped,
      total: demoRequests.length,
    });
  } catch (error) {
    console.error(
      "CHYBA DEMO ACTIVATION API:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          "Nepodařilo se zpracovat DEMO aktivace.",
      },
      { status: 500 }
    );
  }
}
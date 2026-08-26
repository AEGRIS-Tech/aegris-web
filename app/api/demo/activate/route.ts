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
      console.error("CRON_SECRET není nastavený.");

      return NextResponse.json(
        {
          success: false,
          error: "Server není správně nakonfigurován.",
        },
        { status: 500 }
      );
    }

    const authorization = request.headers.get("authorization");

    if (authorization !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        {
          success: false,
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
          success: false,
          error: "Nepodařilo se načíst DEMO žádosti.",
          details: requestsError.message,
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
    // URL APLIKACE
    // ============================================

    const appUrl =
      process.env.NEXT_PUBLIC_SITE_URL ||
      new URL(request.url).origin;

    const redirectTo =
      `${appUrl}/auth/accept-invite`;

    let processed = 0;
    let failed = 0;

    // Odkazy se vrací pouze autorizovanému volajícímu endpointu.
    const activations: Array<{
      id: number;
      email: string;
      userId: string;
      inviteUrl: string;
      expiresAt: string;
    }> = [];

    // ============================================
    // ZPRACOVÁNÍ DEMO ŽÁDOSTÍ
    // ============================================

    for (const demoRequest of requests) {
      try {
        let userId: string | null = null;
        let isNewUser = false;

        // ========================================
        // KONTROLA EXISTUJÍCÍHO AUTH ÚČTU
        // ========================================

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
            `CHYBA NAČTENÍ AUTH UŽIVATELŮ PRO ${demoRequest.email}:`,
            usersError
          );

          failed++;
          continue;
        }

        const existingUser =
          usersData.users.find(
            (user) =>
              user.email?.toLowerCase() ===
              demoRequest.email.toLowerCase()
          );

        // ========================================
        // EXISTUJÍCÍ UŽIVATEL
        // ========================================

        if (existingUser) {
          userId = existingUser.id;
        }

        // ========================================
        // NOVÝ UŽIVATEL
        // ========================================

        if (!userId) {
          const {
            data: userData,
            error: userError,
          } =
            await supabaseAdmin.auth.admin.createUser({
              email: demoRequest.email,
              email_confirm: true,
              user_metadata: {
                full_name: demoRequest.full_name,
                company: demoRequest.company,
                account_type: "demo",
              },
            });

          if (userError) {
            console.error(
              `CHYBA VYTVOŘENÍ ÚČTU PRO ${demoRequest.email}:`,
              userError
            );

            failed++;
            continue;
          }

          userId = userData.user?.id ?? null;
          isNewUser = true;

          if (!userId) {
            console.error(
              `AUTH UŽIVATEL NEBYL VYTVOŘEN PRO ${demoRequest.email}`
            );

            failed++;
            continue;
          }
        }

        // ========================================
        // AKTIVACE 14DENNÍHO DEMO
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

        const startedAtIso = startedAt.toISOString();
        const expiresAtIso = expiresAt.toISOString();

        // ========================================
        // PROFIL
        // ========================================

        const { error: profileError } =
          await supabaseAdmin
            .from("profiles")
            .upsert(
              {
                id: userId,
                account_type: "demo",
                demo_started_at: startedAtIso,
                demo_expires_at: expiresAtIso,
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

        // ========================================
        // VYTVOŘENÍ SUPABASE PŘÍMÉHO ODKAZU
        // ========================================
        //
        // NEPOSÍLÁME E-MAIL.
        //
        // Supabase vytvoří jednorázový odkaz,
        // který vrátíme přímo v JSON odpovědi
        // autorizovanému volajícímu endpointu.
        //
        // U nového účtu použijeme invite.
        // U existujícího účtu použijeme magiclink.
        // ========================================

        const linkType = isNewUser
          ? "invite"
          : "magiclink";

        const {
          data: linkData,
          error: linkError,
        } =
          await supabaseAdmin.auth.admin.generateLink({
            type: linkType,
            email: demoRequest.email,
            options: {
              redirectTo,
            },
          });

        if (linkError) {
          console.error(
            `CHYBA VYTVOŘENÍ PŘÍMÉHO ODKAZU PRO ${demoRequest.email}:`,
            linkError
          );

          failed++;
          continue;
        }

        const inviteUrl =
          linkData.properties?.action_link;

        if (!inviteUrl) {
          console.error(
            `SUPABASE NEVRÁTIL ACTION LINK PRO ${demoRequest.email}`
          );

          failed++;
          continue;
        }

        // ========================================
        // OZNAČENÍ ŽÁDOSTI JAKO AKTIVOVANÉ
        // ========================================

        const { error: updateError } =
          await supabaseAdmin
            .from("demo_requests")
            .update({
              user_id: userId,
              approved_at: startedAtIso,
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

        // ========================================
        // ÚSPĚCH
        // ========================================

        processed++;

        activations.push({
          id: demoRequest.id,
          email: demoRequest.email,
          userId,
          inviteUrl,
          expiresAt: expiresAtIso,
        });
      } catch (error) {
        console.error(
          `CHYBA ZPRACOVÁNÍ DEMO ${demoRequest.email}:`,
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
      total: requests.length,
      activations,
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
        details:
          error instanceof Error
            ? error.message
            : String(error),
      },
      { status: 500 }
    );
  }
}
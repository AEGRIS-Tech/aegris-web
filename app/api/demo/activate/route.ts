import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

const DEMO_DURATION_DAYS = 14;
const DEMO_BATCH_SIZE = 10;
const DEMO_STALE_AFTER_SECONDS = 15 * 60;

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
          error: "Server není správně nakonfigurován.",
        },
        { status: 500 }
      );
    }

    const authorization =
      request.headers.get("authorization");

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
    // URL APLIKACE
    // ============================================

    const appUrl =
      process.env.NEXT_PUBLIC_SITE_URL ||
      new URL(request.url).origin;

    const redirectTo =
  `${appUrl}/auth/accept-invite`;

    // ============================================
    // ATOMICKÝ CLAIM DEMO ŽÁDOSTÍ
    // ============================================

    const {
      data: demoRequests,
      error: requestsError,
    } = await supabaseAdmin.rpc(
      "claim_demo_requests",
      {
        p_batch_size: DEMO_BATCH_SIZE,
        p_stale_after_seconds:
          DEMO_STALE_AFTER_SECONDS,
      }
    );

    if (requestsError) {
      console.error(
        "CHYBA CLAIMU DEMO ŽÁDOSTÍ:",
        requestsError
      );

      return NextResponse.json(
        {
          success: false,
          error:
            "Nepodařilo se převzít DEMO žádosti ke zpracování.",
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
          "Žádné nové DEMO žádosti ke zpracování.",
      });
    }

    let processed = 0;
    let failed = 0;
    let skipped = 0;

    // ============================================
    // POMOCNÉ FUNKCE PRO CLAIM
    // ============================================

    async function releaseClaim(
      requestId: number
    ) {
      const { error } = await supabaseAdmin
        .from("demo_requests")
        .update({
          status: "new",
          processing_started_at: null,
        })
        .eq("id", requestId)
        .eq("status", "processing")
        .is("approved_at", null);

      if (error) {
        console.error(
          `CHYBA UVOLNĚNÍ DEMO CLAIMU ${requestId}:`,
          error
        );
      }

      return error;
    }

    async function closeRequest(
      requestId: number,
      userId: string
    ) {
      const { error } = await supabaseAdmin
        .from("demo_requests")
        .update({
          status: "closed",
          user_id: userId,
          approved_at: null,
          processing_started_at: null,
        })
        .eq("id", requestId)
        .eq("status", "processing")
        .is("approved_at", null);

      return error;
    }

    // ============================================
    // AUTH UŽIVATELÉ
    // ============================================
    //
    // Načteme Auth uživatele po stránkách.
    // Nepředpokládáme, že systém bude mít vždy
    // méně než 1000 uživatelů.
    // ============================================

    const authUsersByEmail =
      new Map<string, any>();

    const AUTH_PAGE_SIZE = 1000;
    let authPage = 1;

    while (true) {
      const {
        data: usersData,
        error: usersError,
      } =
        await supabaseAdmin.auth.admin.listUsers({
          page: authPage,
          perPage: AUTH_PAGE_SIZE,
        });

      if (usersError) {
        console.error(
          "CHYBA NAČTENÍ AUTH UŽIVATELŮ:",
          usersError
        );

        // Claimy ještě nebyly individuálně zpracovány,
        // takže je můžeme bezpečně vrátit do "new".
        for (const demoRequest of demoRequests) {
          await releaseClaim(demoRequest.id);
        }

        return NextResponse.json(
          {
            success: false,
            error:
              "Nepodařilo se ověřit uživatelské účty.",
          },
          { status: 500 }
        );
      }

      for (const user of usersData.users) {
        if (
          typeof user.email !== "string" ||
          !user.email
        ) {
          continue;
        }

        authUsersByEmail.set(
          user.email.toLowerCase(),
          user
        );
      }

      if (
        usersData.users.length <
        AUTH_PAGE_SIZE
      ) {
        break;
      }

      authPage++;
    }

    // ============================================
    // ZPRACOVÁNÍ CLAIMNUTÝCH DEMO ŽÁDOSTÍ
    // ============================================

    for (const demoRequest of demoRequests) {
      try {
        // ========================================
        // VALIDACE E-MAILU
        // ========================================

        if (
          typeof demoRequest.email !==
            "string" ||
          !demoRequest.email.trim()
        ) {
          console.error(
            `DEMO ŽÁDOST ${demoRequest.id}: neplatný e-mail.`
          );

          const { error: closeError } =
            await supabaseAdmin
              .from("demo_requests")
              .update({
                status: "closed",
                processing_started_at: null,
              })
              .eq("id", demoRequest.id)
              .eq("status", "processing")
              .is("approved_at", null);

          if (closeError) {
            console.error(
              `CHYBA UZAVŘENÍ NEPLATNÉ DEMO ŽÁDOSTI ${demoRequest.id}:`,
              closeError
            );

            failed++;
          } else {
            skipped++;
          }

          continue;
        }

        const normalizedEmail =
          demoRequest.email
            .trim()
            .toLowerCase();

        // ========================================
        // URČENÍ AUTH UŽIVATELE
        // ========================================
        //
        // user_id může být vyplněné po předchozím
        // částečně dokončeném běhu.
        // ========================================

        let userId: string | null =
          demoRequest.user_id ?? null;

        const existingAuthUser =
          authUsersByEmail.get(
            normalizedEmail
          );

        // ========================================
        // EXISTUJÍCÍ AUTH ÚČET
        // ========================================
        //
        // Pokud žádost ještě nemá user_id a Auth
        // účet již existuje, musíme rozlišit:
        //
        // 1) účet vytvořený právě touto DEMO žádostí
        //    při předchozím nedokončeném běhu,
        //
        // 2) skutečně existující účet zákazníka,
        //    který veřejná DEMO žádost nesmí změnit.
        // ========================================

        if (
          !userId &&
          existingAuthUser
        ) {
          const metadataRequestId =
            existingAuthUser
              .user_metadata
              ?.demo_request_id;

          const belongsToThisRequest =
            String(metadataRequestId ?? "") ===
            String(demoRequest.id);

          if (belongsToThisRequest) {
            userId =
              existingAuthUser.id;
          } else {
            const closeError =
              await closeRequest(
                demoRequest.id,
                existingAuthUser.id
              );

            if (closeError) {
              console.error(
                `CHYBA UZAVŘENÍ DEMO ŽÁDOSTI ${demoRequest.id}:`,
                closeError
              );

              failed++;
            } else {
              skipped++;
            }

            continue;
          }
        }

        // ========================================
        // VYTVOŘENÍ DEMO AUTH ÚČTU
        // ========================================

        if (!userId) {
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

                    // Umožní rozeznat účet vytvořený
                    // touto konkrétní DEMO žádostí,
                    // pokud worker spadne těsně po
                    // vytvoření Auth uživatele.
                    demo_request_id:
                      String(
                        demoRequest.id
                      ),
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

            // Pozvánka nebyla potvrzeně vytvořena.
            // Claim vrátíme do fronty.
            await releaseClaim(
              demoRequest.id
            );

            failed++;
            continue;
          }

          userId =
            inviteData.user.id;

          authUsersByEmail.set(
            normalizedEmail,
            inviteData.user
          );

          // ======================================
          // ULOŽENÍ USER_ID IHNED PO POZVÁNCE
          // ======================================
          //
          // Toto je důležité pro recovery.
          // Pokud další krok selže, stale claim
          // může pokračovat se stejným uživatelem.
          // ======================================

          const {
            error: linkUserError,
          } = await supabaseAdmin
            .from("demo_requests")
            .update({
              user_id: userId,
            })
            .eq("id", demoRequest.id)
            .eq("status", "processing")
            .is("approved_at", null);

          if (linkUserError) {
            console.error(
              `CHYBA ULOŽENÍ USER_ID PRO DEMO ŽÁDOST ${demoRequest.id}:`,
              linkUserError
            );

            // Claim záměrně ponecháme jako
            // processing. Pokud byl Auth účet
            // skutečně vytvořen, metadata
            // demo_request_id umožní recovery.
            failed++;
            continue;
          }
        }

        // TypeScript guard.
        if (!userId) {
          console.error(
            `DEMO ŽÁDOST ${demoRequest.id}: chybí user_id po vytvoření účtu.`
          );

          failed++;
          continue;
        }

        // ========================================
        // EXISTUJÍCÍ DEMO PROFIL
        // ========================================
        //
        // Pokud předchozí běh vytvořil profil,
        // ale nestihl označit request jako contacted,
        // zachováme původní datum začátku a expirace.
        // Demo se tedy při retry neprodlouží.
        // ========================================

        const {
          data: existingProfile,
          error: profileReadError,
        } = await supabaseAdmin
          .from("profiles")
          .select(
            "account_type, demo_started_at, demo_expires_at"
          )
          .eq("id", userId)
          .maybeSingle();

        if (profileReadError) {
          console.error(
            `CHYBA NAČTENÍ DEMO PROFILU PRO ŽÁDOST ${demoRequest.id}:`,
            profileReadError
          );

          failed++;
          continue;
        }

        let startedAtIso: string;
        let expiresAtIso: string;

        if (
          existingProfile
            ?.account_type === "demo" &&
          existingProfile
            .demo_started_at &&
          existingProfile
            .demo_expires_at
        ) {
          startedAtIso =
            existingProfile
              .demo_started_at;

          expiresAtIso =
            existingProfile
              .demo_expires_at;
        } else {
          const startedAt =
            new Date();

          const expiresAt =
            new Date(
              startedAt.getTime() +
                DEMO_DURATION_DAYS *
                  24 *
                  60 *
                  60 *
                  1000
            );

          startedAtIso =
            startedAt.toISOString();

          expiresAtIso =
            expiresAt.toISOString();
        }

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

          // user_id už je uložené.
          // Claim ponecháme processing a po
          // stale timeoutu může bezpečně pokračovat.
          failed++;
          continue;
        }

        // ========================================
        // DOKONČENÍ DEMO ŽÁDOSTI
        // ========================================

        const {
          data: completedRequest,
          error: updateError,
        } = await supabaseAdmin
          .from("demo_requests")
          .update({
            status: "contacted",
            user_id: userId,
            approved_at:
              startedAtIso,
            processing_started_at:
              null,
          })
          .eq("id", demoRequest.id)
          .eq("status", "processing")
          .eq("user_id", userId)
          .is("approved_at", null)
          .select("id")
          .maybeSingle();

        if (
          updateError ||
          !completedRequest
        ) {
          console.error(
            `CHYBA DOKONČENÍ DEMO ŽÁDOSTI ${demoRequest.id}:`,
            updateError ??
              "Request nebyl aktualizován."
          );

          failed++;
          continue;
        }

        processed++;
      } catch (error) {
        console.error(
          `CHYBA ZPRACOVÁNÍ DEMO ŽÁDOSTI ${demoRequest.id}:`,
          error
        );

        // Záměrně claim automaticky neuvolňujeme.
        // Nevíme, ve které fázi chyba nastala.
        // Stale recovery je bezpečnější než
        // okamžitá duplicitní aktivace.
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
import { createHash } from "node:crypto";

import { NextResponse } from "next/server";

import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";

const MAX_FULL_NAME_LENGTH = 120;
const MAX_COMPANY_LENGTH = 160;
const MAX_EMAIL_LENGTH = 254;
const MAX_PHONE_LENGTH = 50;
const MAX_MESSAGE_LENGTH = 2000;

const DEMO_RATE_LIMIT = 5;
const DEMO_RATE_LIMIT_WINDOW_SECONDS = 60 * 60;

type DemoRateLimitResult = {
  allowed: boolean;
  request_count: number;
  retry_after_seconds: number;
};

function isValidEmail(email: string) {
  return (
    email.length <= MAX_EMAIL_LENGTH &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  );
}

function getClientAddress(request: Request) {
  const forwardedFor =
    request.headers.get("x-forwarded-for");

  if (forwardedFor) {
    const firstAddress =
      forwardedFor
        .split(",")[0]
        ?.trim();

    if (firstAddress) {
      return firstAddress;
    }
  }

  const realIp =
    request.headers
      .get("x-real-ip")
      ?.trim();

  if (realIp) {
    return realIp;
  }

  /*
   * V lokálním vývoji nemusí proxy poslat IP adresu.
   * Všechny takové requesty pak sdílejí jeden limiter.
   */
  return "unknown";
}

function createClientKeyHash(
  request: Request
) {
  const clientAddress =
    getClientAddress(request);

  return createHash("sha256")
    .update(
      `aegris-demo-rate-limit:${clientAddress}`
    )
    .digest("hex");
}

function normalizeRateLimitResult(
  value: unknown
): DemoRateLimitResult | null {
  const result =
    Array.isArray(value)
      ? value[0]
      : value;

  if (
    !result ||
    typeof result !== "object"
  ) {
    return null;
  }

  const row =
    result as Record<string, unknown>;

  if (
    typeof row.allowed !== "boolean"
  ) {
    return null;
  }

  const requestCount =
    Number(row.request_count);

  const retryAfterSeconds =
    Number(row.retry_after_seconds);

  return {
    allowed: row.allowed,

    request_count:
      Number.isFinite(requestCount)
        ? requestCount
        : 0,

    retry_after_seconds:
      Number.isFinite(retryAfterSeconds)
        ? retryAfterSeconds
        : 0,
  };
}

export async function POST(
  request: Request
) {
  try {
    /*
     * =====================================================
     * PUBLIC ENDPOINT RATE LIMIT
     * =====================================================
     *
     * Limiter je uložený v PostgreSQL a používá atomické
     * SELECT ... FOR UPDATE.
     *
     * Do DB neposíláme přímo IP adresu, pouze SHA-256 hash.
     */

    const clientKeyHash =
      createClientKeyHash(request);

    const {
      data: rateLimitData,
      error: rateLimitError,
    } = await supabaseAdmin.rpc(
      "consume_demo_rate_limit",
      {
        p_key_hash: clientKeyHash,
        p_limit: DEMO_RATE_LIMIT,
        p_window_seconds:
          DEMO_RATE_LIMIT_WINDOW_SECONDS,
      }
    );

    if (rateLimitError) {
      console.error(
        "DEMO RATE LIMIT ERROR:",
        rateLimitError
      );

      return NextResponse.json(
        {
          error:
            "Žádost se nepodařilo zpracovat.",
        },
        {
          status: 500,
        }
      );
    }

    const rateLimit =
      normalizeRateLimitResult(
        rateLimitData
      );

    if (!rateLimit) {
      console.error(
        "DEMO RATE LIMIT INVALID RESPONSE:",
        rateLimitData
      );

      return NextResponse.json(
        {
          error:
            "Žádost se nepodařilo zpracovat.",
        },
        {
          status: 500,
        }
      );
    }

    if (!rateLimit.allowed) {
      const retryAfter =
        Math.max(
          rateLimit.retry_after_seconds,
          1
        );

      return NextResponse.json(
        {
          error:
            "Bylo odesláno příliš mnoho DEMO žádostí. Zkuste to prosím později.",
        },
        {
          status: 429,
          headers: {
            "Retry-After":
              String(retryAfter),
          },
        }
      );
    }

    /*
     * =====================================================
     * REQUEST BODY
     * =====================================================
     */

    let body: unknown;

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        {
          error:
            "Neplatný formát požadavku.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      !body ||
      typeof body !== "object" ||
      Array.isArray(body)
    ) {
      return NextResponse.json(
        {
          error:
            "Neplatný formát požadavku.",
        },
        {
          status: 400,
        }
      );
    }

    const input =
      body as Record<
        string,
        unknown
      >;

    const fullName =
      typeof input.full_name ===
      "string"
        ? input.full_name.trim()
        : "";

    const company =
      typeof input.company ===
      "string"
        ? input.company.trim()
        : "";

    const email =
      typeof input.email ===
      "string"
        ? input.email
            .trim()
            .toLowerCase()
        : "";

    const phone =
      typeof input.phone ===
      "string"
        ? input.phone.trim()
        : "";

    const message =
      typeof input.message ===
      "string"
        ? input.message.trim()
        : "";

    /*
     * =====================================================
     * INPUT VALIDATION
     * =====================================================
     */

    if (!fullName || !email) {
      return NextResponse.json(
        {
          error:
            "Jméno a e-mail jsou povinné.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      fullName.length >
      MAX_FULL_NAME_LENGTH
    ) {
      return NextResponse.json(
        {
          error:
            "Jméno je příliš dlouhé.",
        },
        {
          status: 400,
        }
      );
    }

    if (!isValidEmail(email)) {
      return NextResponse.json(
        {
          error:
            "Zadejte platnou e-mailovou adresu.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      company.length >
      MAX_COMPANY_LENGTH
    ) {
      return NextResponse.json(
        {
          error:
            "Název firmy je příliš dlouhý.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      phone.length >
      MAX_PHONE_LENGTH
    ) {
      return NextResponse.json(
        {
          error:
            "Telefonní číslo je příliš dlouhé.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      message.length >
      MAX_MESSAGE_LENGTH
    ) {
      return NextResponse.json(
        {
          error:
            "Zpráva je příliš dlouhá.",
        },
        {
          status: 400,
        }
      );
    }

    /*
     * =====================================================
     * CREATE DEMO REQUEST
     * =====================================================
     *
     * Duplicitní e-mail už nekontrolujeme přes
     * SELECT -> INSERT.
     *
     * Databázový UNIQUE expression index
     * lower(btrim(email)) je autoritativní ochrana proti
     * souběžným requestům.
     */

    const {
      error: insertError,
    } = await supabaseAdmin
      .from("demo_requests")
      .insert({
        full_name: fullName,
        company:
          company || null,
        email,
        phone:
          phone || null,
        message:
          message || null,
        status: "new",
      });

    if (insertError) {
      /*
       * PostgreSQL unique_violation.
       *
       * Sem spadne jak běžná duplicita, tak dva paralelní
       * requesty, které se pokusí vložit stejný e-mail.
       */
      if (
        insertError.code === "23505"
      ) {
        return NextResponse.json(
          {
            error:
              "Pro tento e-mail už byla DEMO žádost evidována.",
          },
          {
            status: 409,
          }
        );
      }

      console.error(
        "CHYBA ULOŽENÍ DEMO ŽÁDOSTI:",
        insertError
      );

      return NextResponse.json(
        {
          error:
            "Žádost se nepodařilo odeslat.",
        },
        {
          status: 500,
        }
      );
    }

    /*
     * =====================================================
     * IMMEDIATE DEMO ACTIVATION
     * =====================================================
     *
     * /api/demo/activate je samostatně chráněný
     * CRON_SECRET.
     */

    const cronSecret =
      process.env.CRON_SECRET;

    if (!cronSecret) {
      console.error(
        "DEMO AKTIVACE NENÍ NAKONFIGUROVÁNA."
      );

      return NextResponse.json(
        {
          success: true,
          message:
            "Vaši žádost jsme přijali. DEMO účet bude zpracován.",
        },
        {
          status: 201,
        }
      );
    }

    const activationUrl =
      new URL(
        "/api/demo/activate",
        request.url
      );

    try {
      const activationResponse =
        await fetch(
          activationUrl.toString(),
          {
            method: "POST",
            headers: {
              Authorization:
                `Bearer ${cronSecret}`,
            },
            cache: "no-store",
          }
        );

      if (
        !activationResponse.ok
      ) {
        console.error(
          "OKAMŽITÁ AKTIVACE DEMO SELHALA:",
          activationResponse.status
        );
      }
    } catch (
      activationError
    ) {
      console.error(
        "OKAMŽITÁ AKTIVACE DEMO SELHALA:",
        activationError
      );
    }

    /*
     * Žádost byla bezpečně uložena.
     *
     * Případné selhání okamžité aktivace nemění stav
     * veřejného requestu - naplánovaný activation endpoint
     * může žádost zpracovat později.
     */

    return NextResponse.json(
      {
        success: true,
        message:
          "Vaši žádost jsme přijali. DEMO účet bude zpracován.",
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error(
      "CHYBA DEMO API:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Nepodařilo se zpracovat žádost.",
      },
      {
        status: 500,
      }
    );
  }
}
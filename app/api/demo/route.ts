import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

const MAX_FULL_NAME_LENGTH = 120;
const MAX_COMPANY_LENGTH = 160;
const MAX_EMAIL_LENGTH = 254;
const MAX_PHONE_LENGTH = 50;
const MAX_MESSAGE_LENGTH = 2000;

function isValidEmail(email: string) {
  return (
    email.length <= MAX_EMAIL_LENGTH &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  );
}

export async function POST(request: Request) {
  try {
    let body: unknown;

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        {
          error: "Neplatný formát požadavku.",
        },
        { status: 400 }
      );
    }

    if (
      !body ||
      typeof body !== "object" ||
      Array.isArray(body)
    ) {
      return NextResponse.json(
        {
          error: "Neplatný formát požadavku.",
        },
        { status: 400 }
      );
    }

    const input = body as Record<string, unknown>;

    const fullName =
      typeof input.full_name === "string"
        ? input.full_name.trim()
        : "";

    const company =
      typeof input.company === "string"
        ? input.company.trim()
        : "";

    const email =
      typeof input.email === "string"
        ? input.email.trim().toLowerCase()
        : "";

    const phone =
      typeof input.phone === "string"
        ? input.phone.trim()
        : "";

    const message =
      typeof input.message === "string"
        ? input.message.trim()
        : "";

    if (!fullName || !email) {
      return NextResponse.json(
        {
          error: "Jméno a e-mail jsou povinné.",
        },
        { status: 400 }
      );
    }

    if (fullName.length > MAX_FULL_NAME_LENGTH) {
      return NextResponse.json(
        {
          error: "Jméno je příliš dlouhé.",
        },
        { status: 400 }
      );
    }

    if (!isValidEmail(email)) {
      return NextResponse.json(
        {
          error: "Zadejte platnou e-mailovou adresu.",
        },
        { status: 400 }
      );
    }

    if (company.length > MAX_COMPANY_LENGTH) {
      return NextResponse.json(
        {
          error: "Název firmy je příliš dlouhý.",
        },
        { status: 400 }
      );
    }

    if (phone.length > MAX_PHONE_LENGTH) {
      return NextResponse.json(
        {
          error: "Telefonní číslo je příliš dlouhé.",
        },
        { status: 400 }
      );
    }

    if (message.length > MAX_MESSAGE_LENGTH) {
      return NextResponse.json(
        {
          error: "Zpráva je příliš dlouhá.",
        },
        { status: 400 }
      );
    }

    // ============================================
    // KONTROLA EXISTUJÍCÍ DEMO ŽÁDOSTI
    // ============================================

    const {
      data: existingRequest,
      error: existingError,
    } = await supabaseAdmin
      .from("demo_requests")
      .select("id")
      .eq("email", email)
      .limit(1)
      .maybeSingle();

    if (existingError) {
      console.error(
        "CHYBA KONTROLY DEMO ŽÁDOSTI:",
        existingError
      );

      return NextResponse.json(
        {
          error: "Žádost se nepodařilo zpracovat.",
        },
        { status: 500 }
      );
    }

    if (existingRequest) {
      return NextResponse.json(
        {
          error:
            "Pro tento e-mail už byla DEMO žádost evidována.",
        },
        { status: 409 }
      );
    }

    // ============================================
    // ULOŽENÍ DEMO ŽÁDOSTI
    // ============================================

    const { error: insertError } =
      await supabaseAdmin
        .from("demo_requests")
        .insert({
          full_name: fullName,
          company: company || null,
          email,
          phone: phone || null,
          message: message || null,
          status: "new",
        });

    if (insertError) {
      console.error(
        "CHYBA ULOŽENÍ DEMO ŽÁDOSTI:",
        insertError
      );

      return NextResponse.json(
        {
          error: "Žádost se nepodařilo odeslat.",
        },
        { status: 500 }
      );
    }

    // ============================================
    // OKAMŽITÁ AKTIVACE DEMO
    // ============================================

    const cronSecret = process.env.CRON_SECRET;

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
        { status: 201 }
      );
    }

    const activationUrl = new URL(
      "/api/demo/activate",
      request.url
    );

    try {
      const activationResponse = await fetch(
        activationUrl.toString(),
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${cronSecret}`,
          },
          cache: "no-store",
        }
      );

      if (!activationResponse.ok) {
        console.error(
          "OKAMŽITÁ AKTIVACE DEMO SELHALA:",
          activationResponse.status
        );
      }
    } catch (activationError) {
      console.error(
        "OKAMŽITÁ AKTIVACE DEMO SELHALA:",
        activationError
      );
    }

    return NextResponse.json(
      {
        success: true,
        message:
          "Vaši žádost jsme přijali. DEMO účet bude zpracován.",
      },
      { status: 201 }
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
      { status: 500 }
    );
  }
}
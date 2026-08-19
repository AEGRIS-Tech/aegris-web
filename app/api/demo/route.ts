import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const fullName =
      typeof body.full_name === "string"
        ? body.full_name.trim()
        : "";

    const company =
      typeof body.company === "string"
        ? body.company.trim()
        : "";

    const email =
      typeof body.email === "string"
        ? body.email.trim().toLowerCase()
        : "";

    const phone =
      typeof body.phone === "string"
        ? body.phone.trim()
        : "";

    const message =
      typeof body.message === "string"
        ? body.message.trim()
        : "";

    if (!fullName || !email) {
      return NextResponse.json(
        {
          error:
            "Jméno a e-mail jsou povinné.",
        },
        { status: 400 }
      );
    }

    // ============================================
    // KONTROLA, ZDA UŽ E-MAIL DEMO NEMĚL
    // ============================================

    const { data: existingRequest, error: existingError } =
      await supabaseAdmin
        .from("demo_requests")
        .select("id, status, user_id")
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
          error:
            "Žádost se nepodařilo zpracovat.",
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
          error:
            "Žádost se nepodařilo odeslat.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message:
          "Vaši žádost jsme přijali. DEMO vám aktivujeme nejpozději do 24 hodin.",
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
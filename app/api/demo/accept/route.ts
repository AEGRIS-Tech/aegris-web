import { NextResponse } from "next/server";
import crypto from "crypto";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

function verifyInviteToken(token: string) {
  const parts = token.split(".");

  if (parts.length !== 2) {
    return null;
  }

  const [payload, signature] = parts;

  const expectedSignature = crypto
    .createHmac(
      "sha256",
      process.env.CRON_SECRET!
    )
    .update(payload)
    .digest("base64url");

  const signaturesMatch =
    crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );

  if (!signaturesMatch) {
    return null;
  }

  try {
    const decoded = JSON.parse(
      Buffer.from(
        payload,
        "base64url"
      ).toString("utf8")
    );

    if (
      !decoded.userId ||
      !decoded.email ||
      !decoded.expiresAt
    ) {
      return null;
    }

    if (
      new Date(decoded.expiresAt) <=
      new Date()
    ) {
      return null;
    }

    return decoded as {
      userId: string;
      email: string;
      expiresAt: string;
    };
  } catch {
    return null;
  }
}

export async function POST(
  request: Request
) {
  try {
    const body = await request.json();

    const token =
      typeof body.token === "string"
        ? body.token
        : "";

    const password =
      typeof body.password === "string"
        ? body.password
        : "";

    if (!token || !password) {
      return NextResponse.json(
        {
          error:
            "Token a heslo jsou povinné.",
        },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        {
          error:
            "Heslo musí mít alespoň 8 znaků.",
        },
        { status: 400 }
      );
    }

    const invite =
      verifyInviteToken(token);

    if (!invite) {
      return NextResponse.json(
        {
          error:
            "Pozvánka je neplatná nebo již vypršela.",
        },
        { status: 400 }
      );
    }

    // ============================================
    // OVĚŘENÍ AUTH UŽIVATELE
    // ============================================

    const {
      data: userData,
      error: userError,
    } =
      await supabaseAdmin.auth.admin.getUserById(
        invite.userId
      );

    if (
      userError ||
      !userData.user
    ) {
      console.error(
        "DEMO USER ERROR:",
        userError
      );

      return NextResponse.json(
        {
          error:
            "DEMO účet nebyl nalezen.",
        },
        { status: 404 }
      );
    }

    const user =
      userData.user;

    if (
      user.email?.toLowerCase() !==
      invite.email.toLowerCase()
    ) {
      return NextResponse.json(
        {
          error:
            "Pozvánka neodpovídá účtu.",
        },
        { status: 400 }
      );
    }

    // ============================================
    // OVĚŘENÍ DEMO PROFILU
    // ============================================

    const {
      data: profile,
      error: profileError,
    } =
      await supabaseAdmin
        .from("profiles")
        .select(
          "account_type, demo_expires_at"
        )
        .eq(
          "id",
          invite.userId
        )
        .maybeSingle();

    if (profileError) {
      console.error(
        "DEMO PROFILE ERROR:",
        profileError
      );

      return NextResponse.json(
        {
          error:
            "Nepodařilo se ověřit DEMO účet.",
        },
        { status: 500 }
      );
    }

    if (
      !profile ||
      profile.account_type !==
        "demo"
    ) {
      return NextResponse.json(
        {
          error:
            "DEMO účet nebyl nalezen.",
        },
        { status: 400 }
      );
    }

    if (
      !profile.demo_expires_at ||
      new Date(
        profile.demo_expires_at
      ) <= new Date()
    ) {
      return NextResponse.json(
        {
          error:
            "Vaše DEMO již vypršelo.",
        },
        { status: 400 }
      );
    }

    // ============================================
    // NASTAVENÍ HESLA
    // ============================================

    const {
      error: updateError,
    } =
      await supabaseAdmin.auth.admin.updateUserById(
        invite.userId,
        {
          password,
        }
      );

    if (updateError) {
      console.error(
        "DEMO PASSWORD ERROR:",
        updateError
      );

      return NextResponse.json(
        {
          error:
            "Heslo se nepodařilo nastavit.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      email: user.email,
      expiresAt:
        profile.demo_expires_at,
    });
  } catch (error) {
    console.error(
      "DEMO ACCEPT ERROR:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Nepodařilo se dokončit DEMO účet.",
      },
      { status: 500 }
    );
  }
}
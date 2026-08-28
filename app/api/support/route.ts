import { NextResponse } from "next/server";

import { requireAccountAccess } from "@/lib/auth/account-access";
import { createServerSupabaseClient } from "@/lib/supabase/server";

type SupportRequestBody = {
  subject?: unknown;
  message?: unknown;
};

function normalizeText(value: unknown) {
  return typeof value === "string"
    ? value.trim()
    : "";
}

export async function POST(request: Request) {
  const supabase =
    await createServerSupabaseClient();

  const access =
    await requireAccountAccess(supabase);

  if (!access.ok) {
    return NextResponse.json(
      {
        error: access.message,
        code: access.code,
      },
      {
        status: access.status,
      }
    );
  }

  let body: SupportRequestBody;

  try {
    body =
      (await request.json()) as SupportRequestBody;
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

  const subject =
    normalizeText(body.subject);

  const message =
    normalizeText(body.message);

  if (
    subject.length < 3 ||
    subject.length > 160
  ) {
    return NextResponse.json(
      {
        error:
          "Předmět musí mít 3 až 160 znaků.",
      },
      {
        status: 400,
      }
    );
  }

  if (
    message.length < 10 ||
    message.length > 5000
  ) {
    return NextResponse.json(
      {
        error:
          "Zpráva musí mít 10 až 5000 znaků.",
      },
      {
        status: 400,
      }
    );
  }

  const email =
    access.user.email?.trim().toLowerCase();

  if (!email) {
    return NextResponse.json(
      {
        error:
          "Účet nemá dostupný e-mail.",
      },
      {
        status: 400,
      }
    );
  }

  const { data, error } =
    await supabase
      .from("support_tickets")
      .insert({
        user_id: access.user.id,
        email,
        subject,
        message,
        status: "open",
        priority: "normal",
      })
      .select(
        `
          id,
          status,
          priority,
          created_at
        `
      )
      .single();

  if (error) {
    console.error(
      "SUPPORT TICKET CREATE ERROR:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Support ticket se nepodařilo vytvořit.",
      },
      {
        status: 500,
      }
    );
  }

  return NextResponse.json(
    {
      ok: true,
      ticket: {
        id: data.id,
        status: data.status,
        priority: data.priority,
        createdAt: data.created_at,
      },
    },
    {
      status: 201,
    }
  );
}
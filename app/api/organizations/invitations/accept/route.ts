import { NextResponse } from "next/server";

import { requireAccountAccess } from "@/lib/auth/account-access";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

type AcceptInvitationBody = {
  token?: unknown;
};

type AcceptInvitationRpcResult =
  | {
      ok: true;
      organization_id: string;
      membership_id: string;
      role: string;
      already_member: boolean;
      invitation_id: string;
    }
  | {
      ok: false;
      code: string;
    };

function getErrorResponse(code: string) {
  switch (code) {
    case "INVITATION_NOT_FOUND":
      return NextResponse.json(
        {
          ok: false,
          code,
          message:
            "Pozvánka neexistuje nebo není platná.",
        },
        {
          status: 404,
        }
      );

    case "INVITATION_NOT_PENDING":
      return NextResponse.json(
        {
          ok: false,
          code,
          message:
            "Tato pozvánka už není aktivní.",
        },
        {
          status: 409,
        }
      );

    case "INVITATION_EXPIRED":
      return NextResponse.json(
        {
          ok: false,
          code,
          message:
            "Platnost pozvánky vypršela.",
        },
        {
          status: 410,
        }
      );

    case "INVITATION_EMAIL_MISMATCH":
      return NextResponse.json(
        {
          ok: false,
          code,
          message:
            "Tato pozvánka je určena pro jiný uživatelský účet.",
        },
        {
          status: 403,
        }
      );

    default:
      return NextResponse.json(
        {
          ok: false,
          code: "INVITATION_ACCEPT_FAILED",
          message:
            "Pozvánku se nepodařilo dokončit.",
        },
        {
          status: 500,
        }
      );
  }
}

export async function POST(request: Request) {
  try {
    const supabase =
      await createServerSupabaseClient();

    /*
     * 1. Přihlášený uživatel + platný AEGRIS účet.
     */
    const access =
      await requireAccountAccess(supabase);

    if (!access.ok) {
      return NextResponse.json(
        {
          ok: false,
          code: access.code,
          message: access.message,
        },
        {
          status: access.status,
        }
      );
    }

    const user = access.user;

    /*
     * 2. Validace request body.
     */
    let body: AcceptInvitationBody;

    try {
      body =
        (await request.json()) as AcceptInvitationBody;
    } catch {
      return NextResponse.json(
        {
          ok: false,
          code: "INVALID_BODY",
          message:
            "Neplatná data požadavku.",
        },
        {
          status: 400,
        }
      );
    }

    if (typeof body.token !== "string") {
      return NextResponse.json(
        {
          ok: false,
          code: "TOKEN_REQUIRED",
          message:
            "Chybí token pozvánky.",
        },
        {
          status: 400,
        }
      );
    }

    const token = body.token.trim();

    if (token.length === 0) {
      return NextResponse.json(
        {
          ok: false,
          code: "TOKEN_INVALID",
          message:
            "Token pozvánky není platný.",
        },
        {
          status: 400,
        }
      );
    }

    /*
     * UUID kontrolu necháváme databázi, ale zachytíme
     * neplatný UUID vstup jako běžný neplatný token.
     */
    if (
      !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
        token
      )
    ) {
      return NextResponse.json(
        {
          ok: false,
          code: "TOKEN_INVALID",
          message:
            "Token pozvánky není platný.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      typeof user.email !== "string" ||
      user.email.trim().length === 0
    ) {
      return NextResponse.json(
        {
          ok: false,
          code: "USER_EMAIL_REQUIRED",
          message:
            "U uživatelského účtu chybí e-mailová adresa.",
        },
        {
          status: 400,
        }
      );
    }

    /*
     * 3. Celé přijetí invitation proběhne uvnitř
     * jediné PostgreSQL transakce.
     *
     * RPC:
     * - zamkne invitation,
     * - ověří pending stav,
     * - ověří expiraci,
     * - ověří e-mail,
     * - vytvoří / načte membership,
     * - nastaví active_organization_id,
     * - označí invitation jako accepted.
     */
    const {
      data,
      error,
    } = await supabaseAdmin.rpc(
      "accept_organization_invitation",
      {
        p_token: token,
        p_user_id: user.id,
        p_user_email: user.email,
      }
    );

    if (error) {
      console.error(
        "ORGANIZATION INVITATION ACCEPT RPC ERROR:",
        error
      );

      /*
       * RPC vyhazuje výjimku například tehdy,
       * pokud neexistuje profil. V takovém případě
       * PostgreSQL rollbackne celou transakci.
       */
      if (
        typeof error.message === "string" &&
        error.message.includes(
          "PROFILE_NOT_FOUND"
        )
      ) {
        return NextResponse.json(
          {
            ok: false,
            code: "PROFILE_NOT_FOUND",
            message:
              "Uživatelský profil se nepodařilo najít.",
          },
          {
            status: 500,
          }
        );
      }

      return NextResponse.json(
        {
          ok: false,
          code: "INVITATION_ACCEPT_FAILED",
          message:
            "Pozvánku se nepodařilo dokončit.",
        },
        {
          status: 500,
        }
      );
    }

    const result =
      data as AcceptInvitationRpcResult | null;

    if (!result) {
      console.error(
        "ORGANIZATION INVITATION ACCEPT RPC EMPTY RESULT"
      );

      return NextResponse.json(
        {
          ok: false,
          code: "INVITATION_ACCEPT_FAILED",
          message:
            "Pozvánku se nepodařilo dokončit.",
        },
        {
          status: 500,
        }
      );
    }

    if (!result.ok) {
      return getErrorResponse(
        result.code
      );
    }

    /*
     * 4. Zachováme veřejný response contract
     * původního endpointu.
     */
    return NextResponse.json(
      {
        ok: true,
        organizationId:
          result.organization_id,
        role: result.role,
        alreadyMember:
          result.already_member,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error(
      "ORGANIZATION INVITATION ACCEPT API ERROR:",
      error
    );

    return NextResponse.json(
      {
        ok: false,
        code: "INTERNAL_ERROR",
        message:
          "Při přijímání pozvánky došlo k neočekávané chybě.",
      },
      {
        status: 500,
      }
    );
  }
}
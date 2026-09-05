import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { requireAccountAccess } from "@/lib/auth/account-access";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const cookieStore = await cookies();

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) => {
                cookieStore.set(name, value, options);
              });
            } catch {
              // Route handler nemusí vždy povolit změnu cookies.
            }
          },
        },
      }
    );

    const access = await requireAccountAccess(supabase);

    if (!access.ok) {
      return NextResponse.json(
        {
          error: access.message,
          code: access.code,
        },
        { status: access.status }
      );
    }

    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!serviceRoleKey) {
      console.error("CHYBÍ SUPABASE_SERVICE_ROLE_KEY");
      return NextResponse.json(
        {
          error:
            "Server nemá nakonfigurovaný Supabase service role key.",
        },
        { status: 500 }
      );
    }

    const serviceSupabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      serviceRoleKey,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    const { data, error } = await serviceSupabase
      .from("crop_catalog")
      .select(
        "id, name, scientific_name, external_code, crop_profile_id"
      )
      .eq("source_system", "UKZUZ_OOS_CIS01D")
      .eq("catalog_kind", "official_species")
      .eq("active", true)
      .eq("source_valid", true)
      .order("name", { ascending: true });

    if (error) {
      console.error(
        "CROP CATALOG API ERROR:",
        error
      );

      return NextResponse.json(
        {
          error:
            "Oficiální katalog plodin se nepodařilo načíst.",
        },
        { status: 500 }
      );
    }

    const items = data ?? [];

    return NextResponse.json(
      {
        items,
        count: items.length,
      },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  } catch (error) {
    console.error("CROP CATALOG ROUTE ERROR:", error);

    return NextResponse.json(
      {
        error:
          "Neočekávaná chyba při načítání katalogu plodin.",
      },
      { status: 500 }
    );
  }
}

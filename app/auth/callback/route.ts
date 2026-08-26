import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

function safeNextPath(value: string | null) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return "/dashboard";
  }

  return value;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const next = safeNextPath(url.searchParams.get("next"));

  if (!code) {
    const loginUrl = new URL("/login", url.origin);
    loginUrl.searchParams.set("error", "auth_callback_missing_code");
    return NextResponse.redirect(loginUrl);
  }

  try {
    const supabase = await createServerSupabaseClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error("AUTH CALLBACK ERROR:", error);
      const loginUrl = new URL("/login", url.origin);
      loginUrl.searchParams.set("error", "auth_callback_failed");
      return NextResponse.redirect(loginUrl);
    }

    return NextResponse.redirect(new URL(next, url.origin));
  } catch (error) {
    console.error("AUTH CALLBACK SERVER ERROR:", error);
    const loginUrl = new URL("/login", url.origin);
    loginUrl.searchParams.set("error", "auth_callback_failed");
    return NextResponse.redirect(loginUrl);
  }
}

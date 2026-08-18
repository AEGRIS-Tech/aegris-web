import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },

        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  console.log("========== AEGRIS PROXY ==========");
  console.log("PATH:", pathname);
  console.log("COOKIE COUNT:", request.cookies.getAll().length);
  console.log("USER:", user?.email ?? "ŽÁDNÝ UŽIVATEL");
  console.log("ERROR:", error?.message ?? "null");
  console.log("===================================");

  const protectedRoutes = [
    "/dashboard",
    "/projects",
  ];

  const isProtectedRoute = protectedRoutes.some(
    (route) =>
      pathname === route ||
      pathname.startsWith(`${route}/`)
  );

  if (isProtectedRoute && !user) {
    const url = request.nextUrl.clone();

    url.pathname = "/login";
    url.searchParams.set("next", pathname);

    console.log(
      "AEGRIS PROXY: NEPŘIHLÁŠENÝ → LOGIN"
    );

    return NextResponse.redirect(url);
  }

  return response;
}
import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    {
      error:
        "Tento starší aktivační endpoint již není používán. Použijte Supabase aktivační odkaz z e-mailu.",
    },
    { status: 410 }
  );
}

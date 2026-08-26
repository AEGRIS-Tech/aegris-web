import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json(
    {
      error:
        "Samostatný statistics endpoint není součástí aktuálního API. Statistiky Sentinel-2 zpracovává /api/analysis.",
    },
    { status: 410 }
  );
}

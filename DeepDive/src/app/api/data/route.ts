import { NextResponse } from "next/server";
import { getData } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    return NextResponse.json(getData());
  } catch (e) {
    console.error("[api/data]", e);
    return NextResponse.json({ error: "failed to load" }, { status: 500 });
  }
}

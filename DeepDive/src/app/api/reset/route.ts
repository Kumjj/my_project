import { NextResponse } from "next/server";
import { resetData } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST() {
  try {
    return NextResponse.json(resetData());
  } catch (e) {
    console.error("[api/reset]", e);
    return NextResponse.json({ error: "failed to reset" }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { seedData } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST() {
  try {
    return NextResponse.json(seedData());
  } catch (e) {
    console.error("[api/seed]", e);
    return NextResponse.json({ error: "failed to seed" }, { status: 500 });
  }
}

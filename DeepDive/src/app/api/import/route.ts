import { NextResponse } from "next/server";
import { replaceAllData } from "@/lib/db";
import { appDataSchema } from "@/lib/schema";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const parsed = appDataSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: "invalid data" }, { status: 400 });
    }
    return NextResponse.json(replaceAllData(parsed.data));
  } catch (e) {
    console.error("[api/import]", e);
    return NextResponse.json({ error: "failed to import" }, { status: 500 });
  }
}

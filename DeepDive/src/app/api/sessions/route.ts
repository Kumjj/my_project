import { NextResponse } from "next/server";
import { commitSession } from "@/lib/db";
import { diveSessionSchema } from "@/lib/schema";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const parsed = diveSessionSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: "invalid session", issues: parsed.error.issues }, { status: 400 });
    }
    return NextResponse.json(commitSession(parsed.data));
  } catch (e) {
    console.error("[api/sessions]", e);
    return NextResponse.json({ error: "failed to save session" }, { status: 500 });
  }
}

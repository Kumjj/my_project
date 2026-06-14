import { NextResponse } from "next/server";
import { z } from "zod";
import { setMeta } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const bodySchema = z.object({
  reducedMotion: z.boolean().nullable().optional(),
  theme: z.enum(["light", "dark", "system"]).optional(),
});

export async function PATCH(req: Request) {
  try {
    const parsed = bodySchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: "invalid meta" }, { status: 400 });
    }
    return NextResponse.json(setMeta(parsed.data));
  } catch (e) {
    console.error("[api/meta]", e);
    return NextResponse.json({ error: "failed to update meta" }, { status: 500 });
  }
}

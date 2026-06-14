import { NextResponse } from "next/server";
import { z } from "zod";
import { addSubject } from "@/lib/db";
import { subjectColorTokenSchema } from "@/lib/schema";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const bodySchema = z.object({
  name: z.string().min(1).max(40),
  colorToken: subjectColorTokenSchema,
});

export async function POST(req: Request) {
  try {
    const parsed = bodySchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: "invalid subject" }, { status: 400 });
    }
    return NextResponse.json(addSubject(parsed.data.name, parsed.data.colorToken));
  } catch (e) {
    console.error("[api/subjects]", e);
    return NextResponse.json({ error: "failed to add subject" }, { status: 500 });
  }
}

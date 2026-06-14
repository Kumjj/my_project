import { NextResponse } from "next/server";
import { removeSubject } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function DELETE(
  _req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await ctx.params;
    return NextResponse.json(removeSubject(id));
  } catch (e) {
    console.error("[api/subjects/:id]", e);
    return NextResponse.json({ error: "failed to delete subject" }, { status: 500 });
  }
}

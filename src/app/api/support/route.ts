import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSessionUser } from "@/lib/auth/session";
import { sendSupportEmail } from "@/lib/auth/mailer";

const BodySchema = z.object({
  subject: z.string().min(3).max(120),
  message: z.string().min(10).max(4000),
});

export async function POST(req: NextRequest) {
  const me = await getSessionUser();
  if (!me) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const parsed = BodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "Invalid payload" }, { status: 400 });
  }

  try {
    const result = await sendSupportEmail({
      fromEmail: me.email,
      subject: parsed.data.subject,
      message: parsed.data.message,
      userId: me.id,
    });
    return NextResponse.json({ ok: true, emailed: result.sent });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

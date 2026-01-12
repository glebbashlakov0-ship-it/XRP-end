import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireApiAdmin } from "@/lib/auth/api";
import { sendSupportReplyEmail } from "@/lib/auth/mailer";

const BodySchema = z.object({
  messageId: z.string().min(1),
  reply: z.string().min(3).max(4000),
});

export async function POST(req: Request) {
  const admin = await requireApiAdmin();
  if (admin instanceof NextResponse) return admin;

  const body = await req.json().catch(() => null);
  const parsed = BodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const message = await prisma.supportMessage.findUnique({
    where: { id: parsed.data.messageId },
    include: { user: { select: { email: true } } },
  });

  if (!message) {
    return NextResponse.json({ error: "Support message not found" }, { status: 404 });
  }

  const subject = message.subject?.trim() ? `Re: ${message.subject}` : "Support reply";
  const toEmail = message.user?.email || message.email;
  let result;
  try {
    result = await sendSupportReplyEmail({
      toEmail,
      subject,
      reply: parsed.data.reply,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to send reply email";
    return NextResponse.json({ error: message }, { status: 502 });
  }

  if (!result.sent) {
    return NextResponse.json({ error: "SMTP is not configured" }, { status: 503 });
  }

  try {
    await prisma.supportMessage.update({
      where: { id: message.id },
      data: { repliedAt: new Date() },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to update support message";
    return NextResponse.json({ error: message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

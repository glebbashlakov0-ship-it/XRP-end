import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireApiUser } from "@/lib/auth/api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const BodySchema = z.object({
  firstName: z.string().trim().min(1).max(60),
  lastName: z.string().trim().min(1).max(60),
  phone: z.string().trim().min(6).max(32),
});

export async function POST(req: Request) {
  const user = await requireApiUser();
  if (user instanceof NextResponse) return user;

  const body = await req.json().catch(() => null);
  const parsed = BodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid profile data" }, { status: 400 });
  }

  const firstName = parsed.data.firstName.trim();
  const lastName = parsed.data.lastName.trim();
  const phone = parsed.data.phone.trim();
  const name = `${firstName} ${lastName}`.trim();

  await prisma.user.update({
    where: { id: user.id },
    data: {
      firstName,
      lastName,
      phone,
      name,
    },
  });

  return NextResponse.json({ ok: true });
}

import { requireUser } from "@/lib/auth/requireUser";
import LkShell from "@/components/lk/LkShell";
import ReferralsClient from "./ReferralsClient";
import { prisma } from "@/lib/prisma";
import { randomToken } from "@/lib/auth/crypto";

async function generateUserReferralCode() {
  for (let i = 0; i < 6; i += 1) {
    const code = `REF-${randomToken(4).toUpperCase()}`;
    const exists = await prisma.userReferralLink.findUnique({ where: { code } });
    if (!exists) return code;
  }
  throw new Error("Unable to generate referral code");
}

function isProfileComplete(user: { firstName: string | null; lastName: string | null; phone: string | null }) {
  return Boolean(user.firstName?.trim() && user.lastName?.trim() && user.phone?.trim());
}

export default async function ReferralsPage() {
  const me = await requireUser();
  const profileComplete = Boolean(me.firstName && me.lastName && me.phone);

  let link = await prisma.userReferralLink.findUnique({ where: { userId: me.id } });
  if (!link) {
    const code = await generateUserReferralCode();
    link = await prisma.userReferralLink.create({
      data: { userId: me.id, code },
    });
  }

  const referrals = await prisma.user.findMany({
    where: { referrerUserId: me.id },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      phone: true,
      createdAt: true,
    },
  });

  const verified = referrals.filter((u) => isProfileComplete(u)).length;
  const pending = Math.max(referrals.length - verified, 0);

  return (
    <LkShell email={me.email} verified={!!me.emailVerifiedAt} profileComplete={profileComplete}>
      <ReferralsClient
        referralCode={link.code}
        totals={{
          total: referrals.length,
          verified,
          pending,
        }}
      />
    </LkShell>
  );
}

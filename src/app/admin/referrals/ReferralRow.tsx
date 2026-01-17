"use client";

import Link from "next/link";
import { useState } from "react";
import ConfirmDeleteButton from "@/components/admin/ConfirmDeleteButton";

type ReferralRowProps = {
  id: string;
  name: string;
  code: string;
  url: string;
  total: number;
  verified: number;
  unverified: number;
  createdAt: string;
  onDelete: () => Promise<void>;
};

export default function ReferralRow({
  id,
  name,
  code,
  url,
  total,
  verified,
  unverified,
  createdAt,
  onDelete,
}: ReferralRowProps) {
  const [copied, setCopied] = useState(false);

  return (
    <div className="grid grid-cols-12 items-center gap-3 px-4 py-4 border-t border-gray-200 text-sm">
      <div className="col-span-3 font-medium text-gray-900">
        <div>{name}</div>
        <div className="mt-1 text-xs text-gray-500">{code}</div>
      </div>
      <div className="col-span-4">
        <input
          readOnly
          value={url}
          className="h-9 w-full rounded-lg border border-gray-200 bg-gray-50 px-3 text-xs text-gray-700"
        />
      </div>
      <div className="col-span-2 text-gray-600 text-xs">
        {total} total / {verified} verified / {unverified} pending
      </div>
      <div className="col-span-2 flex flex-wrap items-center gap-2">
        <button
          type="button"
          className="h-9 px-3 rounded-lg bg-gray-900 text-white text-xs"
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(url);
              setCopied(true);
              setTimeout(() => setCopied(false), 1500);
            } catch {
              setCopied(false);
            }
          }}
        >
          {copied ? "Copied" : "Copy"}
        </button>
        <Link className="text-blue-600 hover:text-blue-800 text-xs" href={`/admin/referrals/${id}`}>
          View
        </Link>
        <ConfirmDeleteButton
          className="h-7 px-2 rounded-md bg-red-600 text-white text-[11px]"
          confirmText="Delete this referral link?"
          action={onDelete}
        />
      </div>
      <div className="col-span-1 text-gray-500 text-xs">{createdAt}</div>
    </div>
  );
}

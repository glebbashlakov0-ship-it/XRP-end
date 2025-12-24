"use client";

import Link from "next/link";
import { useState } from "react";
import { ChevronDown } from "lucide-react";

const items = [
  {
    q: "Account",
    a: "Manage your profile details and keep your account information up to date from the dashboard.",
  },
  {
    q: "How to create an account?",
    a: "Go to the registration page, enter your email, and confirm it to activate your account.",
  },
  {
    q: "How to recover your password?",
    a: "Use the password reset flow on the sign-in page and follow the email instructions.",
  },
  {
    q: "Deposit",
    a: "Open the Deposit page, select a currency, and send funds to your assigned address.",
  },
  {
    q: "Withdraw",
    a: "Open the Withdraw page, enter your address and amount, then submit the request.",
  },
  {
    q: "How to withdraw funds?",
    a: "Provide a valid wallet address and ensure the amount is above the minimum withdrawal.",
  },
  {
    q: "Referral Program",
    a: "Invite users with your referral link and earn commissions from their activity.",
  },
  {
    q: "How does the referral program work?",
    a: "Share your referral link; when new users register, you receive a percentage of their commissions.",
  },
];

export default function FaqClient() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        {items.map((item, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div key={item.q} className="rounded-2xl border border-gray-200 bg-white shadow-sm">
              <button
                className="w-full flex items-center justify-between px-5 py-4 text-left"
                onClick={() => setOpenIndex(isOpen ? null : idx)}
                type="button"
              >
                <span className="font-medium text-gray-900">{item.q}</span>
                <ChevronDown className={`h-4 w-4 text-gray-400 transition ${isOpen ? "rotate-180" : ""}`} />
              </button>
              {isOpen ? (
                <div className="px-5 pb-4 text-sm text-gray-600">
                  {item.a}
                </div>
              ) : null}
            </div>
          );
        })}
      </div>

      <div className="rounded-2xl border border-blue-100 bg-blue-50 px-6 py-6 text-center">
        <div className="text-lg font-semibold text-gray-900">Couldn&apos;t find an answer to your question?</div>
        <div className="mt-2 text-sm text-gray-600">
          Contact our support team, and we&apos;ll help you solve any problem.
        </div>
        <Link
          href="/lk/support"
          className="mt-4 inline-flex h-10 items-center justify-center rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white"
        >
          Ask a Question
        </Link>
      </div>
    </div>
  );
}

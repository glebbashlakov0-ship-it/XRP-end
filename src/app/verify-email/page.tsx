"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

type VerifyEmailState = "loading" | "ok" | "error";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams?.get("token") ?? "";
  const [state, setState] = useState<VerifyEmailState>("loading");
  const [error, setError] = useState<string>("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    (async () => {
      if (!token) {
        setState("error");
        setError("Missing verification token.");
        return;
      }
      const r = await fetch(`/api/auth/verify-email?token=${encodeURIComponent(token)}`);
      const data = await r.json().catch(() => ({}));
      if (!r.ok) {
        setState("error");
        setError(data?.error || "Email verification failed");
      } else {
        setState("ok");
      }
    })();
  }, [token]);

  if (state === "loading") {
    return <div className="min-h-dvh flex items-center justify-center p-6">Verifying link...</div>;
  }

  if (state === "ok") {
    return (
      <div className="min-h-dvh flex items-center justify-center p-6">
        <div className="max-w-md w-full border border-gray-200 rounded-2xl p-6">
          <h1 className="text-2xl font-semibold">Email verified</h1>
          <p className="mt-2 text-gray-600">Your account is active. You can sigh in now.</p>
          <Link className="mt-5 inline-block underline" href="/login">
            Go to sigh in
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-dvh flex items-center justify-center p-6">
      <div className="max-w-md w-full border border-gray-200 rounded-2xl p-6">
        <h1 className="text-2xl font-semibold">Verification error</h1>
        <p className="mt-2 text-gray-600">{error}</p>

        <div className="mt-5 grid gap-3">
          <input
            className="h-11 border border-gray-200 rounded-xl px-3"
            placeholder="Email for resend"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <button
            className="h-11 rounded-full bg-gray-900 text-white"
            onClick={async () => {
              const r = await fetch("/api/auth/resend-verification", {
                method: "POST",
                headers: { "content-type": "application/json" },
                body: JSON.stringify({ email }),
              });
              const d = await r.json().catch(() => ({}));
              if (!r.ok) {
                alert(d?.error || "Could not send email");
              } else {
                alert("Verification email sent.");
              }
            }}
          >
            Send email again
          </button>
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="min-h-dvh flex items-center justify-center p-6">Loading...</div>}>
      <VerifyEmailContent />
    </Suspense>
  );
}

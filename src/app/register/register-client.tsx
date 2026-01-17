"use client";

import { useState } from "react";
import Link from "next/link";

import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Container from "@/components/ui/Container";
import LogoMark from "@/components/ui/LogoMark";

type RegisterClientProps = {
  referralCode: string;
};

export default function RegisterClient({ referralCode }: RegisterClientProps) {
  const [email, setEmail] = useState("");
  const [p1, setP1] = useState("");
  const [p2, setP2] = useState("");
  const [status, setStatus] = useState<"idle" | "sent" | "error">("idle");
  const [error, setError] = useState<string>("");
  const [verifyUrl, setVerifyUrl] = useState<string>("");
  const [emailed, setEmailed] = useState(true);

  const formatError = (value: unknown) => {
    if (!value) return "Registration failed";
    if (typeof value === "string") return value;
    if (typeof value === "object") {
      const maybe = value as { formErrors?: string[]; fieldErrors?: Record<string, string[]> };
      const formError = maybe.formErrors?.find(Boolean);
      if (formError) return formError;
      const fieldError = maybe.fieldErrors && Object.values(maybe.fieldErrors).flat().find(Boolean);
      if (fieldError) return fieldError;
    }
    return "Registration failed";
  };

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setVerifyUrl("");
    setEmailed(true);
    const r = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email, password: p1, confirmPassword: p2, referralCode: referralCode || undefined }),
    });
    const data = await r.json().catch(() => ({}));
    if (!r.ok) {
      setStatus("error");
      setError(formatError(data?.error || data?.message));
      return;
    }
    setVerifyUrl(data?.verifyUrl || "");
    setEmailed(Boolean(data?.emailed ?? true));
    setStatus("sent");
  }

  if (status === "sent") {
    return (
      <div className="min-h-screen bg-white bg-[radial-gradient(circle_at_top,_#e9f2ff,_transparent_55%)]">
        <Container className="py-10 lg:py-16">
          <div className="flex items-center justify-center lg:justify-start">
            <LogoMark />
          </div>

          <div className="mt-10 max-w-2xl">
            <Card className="p-8 shadow-lg shadow-blue-100/60">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Almost done</p>
                  <h1 className="mt-1 text-2xl font-semibold">Confirm your email</h1>
                </div>
                <div className="h-12 w-12 rounded-2xl bg-gray-900 text-white flex items-center justify-center text-lg font-semibold">
                  OK
                </div>
              </div>
              <p className="mt-4 text-gray-600">
                We sent a confirmation link to <b>{email}</b>. Open it to activate your account and
                access your dashboard.
              </p>

              {!emailed && verifyUrl ? (
                <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                  SMTP is not configured, so the email was not sent. Open the confirmation link
                  manually:
                  <br />
                  <a className="break-all font-semibold underline" href={verifyUrl}>
                    {verifyUrl}
                  </a>
                </div>
              ) : null}

              <Button
                className="mt-6 w-full"
                variant="secondary"
                onClick={async () => {
                  const r = await fetch("/api/auth/resend-verification", {
                    method: "POST",
                    headers: { "content-type": "application/json" },
                    body: JSON.stringify({ email }),
                  });
                  const d = await r.json().catch(() => ({}));
                  if (!r.ok) {
                    alert(d?.error || "Resend failed");
                    return;
                  }
                  setVerifyUrl(d?.verifyUrl || verifyUrl);
                  setEmailed(Boolean(d?.emailed ?? true));
                  alert(
                    d?.emailed ?? true
                      ? "Verification email sent again."
                      : "SMTP is not configured. Open the link manually."
                  );
                }}
                type="button"
              >
                Send email again
              </Button>

              <Link href="/login" className="mt-4 inline-flex text-sm text-gray-700 hover:text-gray-900">
                Already have an account? Sign in
              </Link>
            </Card>
          </div>
        </Container>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white bg-[radial-gradient(circle_at_top,_#e9f2ff,_transparent_55%)]">
      <Container className="py-10 lg:py-16">
        <div className="flex items-center justify-center lg:justify-start">
          <LogoMark />
        </div>

        <div className="mt-10 grid gap-10 lg:grid-cols-[1fr,420px] lg:items-center">
          <div className="hidden lg:block space-y-6">
            <p className="inline-flex items-center rounded-full bg-blue-50 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-blue-700">
              XRP Restaking - secure access and email verification
            </p>
            <div className="space-y-3">
              <h1 className="text-4xl font-semibold leading-tight">
                Create an account to get started with XRP Restaking
              </h1>
              <p className="text-gray-600 text-lg leading-relaxed">
                We protect access with email verification and secure password storage. After
                registration, you will receive a link to activate your account.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {[
                "Email verification and secure access",
                "Secure password storage",
                "Account status updates",
                "Transparent activity and audit logs",
              ].map((item) => (
                <div
                  key={item}
                  className="rounded-2xl border border-gray-200 bg-white p-4 text-sm font-medium text-gray-800 shadow-soft transition-transform transition-shadow duration-200 hover:-translate-y-1 hover:shadow-lg"
                >
                  {item}
                </div>
              ))}
            </div>
          </div>

          <Card className="p-7 shadow-lg shadow-blue-100/60">
            <div className="mb-6 space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">Create account</p>
              <h2 className="text-2xl font-semibold text-gray-900">Join XRP Restaking</h2>
              <p className="text-sm text-gray-600">
                Register to access your XRP Restaking dashboard.
              </p>
            </div>

            <form onSubmit={onSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-800" htmlFor="email">
                  Email address
                </label>
                <input
                  id="email"
                  className="h-11 w-full rounded-xl border border-gray-200 bg-white px-4 text-sm shadow-inner focus:border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  type="email"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-800" htmlFor="password">
                  Password
                </label>
                <input
                  id="password"
                  className="h-11 w-full rounded-xl border border-gray-200 bg-white px-4 text-sm shadow-inner focus:border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  placeholder="At least 8 characters"
                  type="password"
                  value={p1}
                  onChange={(e) => setP1(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-800" htmlFor="confirmPassword">
                  Confirm password
                </label>
                <input
                  id="confirmPassword"
                  className="h-11 w-full rounded-xl border border-gray-200 bg-white px-4 text-sm shadow-inner focus:border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  placeholder="Repeat password"
                  type="password"
                  value={p2}
                  onChange={(e) => setP2(e.target.value)}
                  required
                />
              </div>

              {status === "error" ? (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              ) : null}

              <Button className="w-full bg-blue-600 text-white hover:bg-blue-500 focus:ring-blue-500/30" type="submit">
                Create account
              </Button>
            </form>

            <div className="mt-6 text-sm text-gray-600">
              By registering, you agree to the{" "}
              <Link className="underline" href="/terms">Terms of Service</Link> and{" "}
              <Link className="underline" href="/privacy">Privacy Policy</Link>.
            </div>

            <div className="mt-4 text-sm text-gray-600">
              Already have an account?{" "}
              <Link href="/login" className="font-semibold text-gray-900 underline decoration-gray-300 hover:decoration-gray-900">
                Sign in
              </Link>
            </div>
          </Card>
        </div>
      </Container>
    </div>
  );
}

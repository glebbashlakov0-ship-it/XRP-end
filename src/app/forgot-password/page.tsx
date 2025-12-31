"use client";

import { useState } from "react";
import Link from "next/link";

import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Container from "@/components/ui/Container";
import LogoMark from "@/components/ui/LogoMark";

type Status = "idle" | "sending" | "sent" | "error";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");
  const [resetUrl, setResetUrl] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("sending");
    setError("");
    setResetUrl("");

    try {
      const res = await fetch("/api/auth/request-password-reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.ok) {
        setStatus("error");
        setError(data?.error || "Could not send reset email.");
        return;
      }

      setResetUrl(data?.resetUrl || "");
      setStatus("sent");
    } catch {
      setStatus("error");
      setError("Network error");
    }
  };

  return (
    <div className="min-h-screen bg-white bg-[radial-gradient(circle_at_top,_#e9f2ff,_transparent_55%)]">
      <Container className="py-10 lg:py-16">
        <div className="flex items-center justify-center lg:justify-start">
          <LogoMark />
        </div>

        <div className="mt-10 grid gap-10 lg:grid-cols-[1.1fr,420px] lg:items-center">
          <div className="hidden lg:block space-y-6">
            <p className="inline-flex items-center rounded-full bg-blue-50 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-blue-700">
              Password recovery
            </p>
            <div className="space-y-3">
              <h1 className="text-4xl font-semibold leading-tight">Reset your access</h1>
              <p className="text-lg leading-relaxed text-gray-600">
                Enter your email address and we will send a reset link. Use it to set a new password
                and return to your dashboard.
              </p>
            </div>
          </div>

          <Card className="p-7 shadow-lg shadow-blue-100/60">
            <div className="mb-6 space-y-2">
              <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">Forgot password</p>
              <h2 className="text-2xl font-semibold text-gray-900">Restore your access</h2>
              <p className="text-sm text-gray-600">
                We will send a secure reset link to your email.
              </p>
            </div>

            <form className="space-y-4" onSubmit={handleSubmit}>
              {status === "error" && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}
              {status === "sent" && (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                  If the account exists, a reset link has been sent to your email.
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-800" htmlFor="email">
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="h-11 w-full rounded-xl border border-gray-200 bg-white px-4 text-sm shadow-inner focus:border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={status === "sending"}
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-blue-600 text-white hover:bg-blue-500 focus:ring-blue-500/30"
                disabled={status === "sending"}
              >
                {status === "sending" ? "Sending..." : "Send reset link"}
              </Button>

              {resetUrl && (
                <div className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-xs text-blue-700">
                  SMTP is not configured. Open this link to reset:{" "}
                  <a className="underline" href={resetUrl}>
                    {resetUrl}
                  </a>
                </div>
              )}
            </form>

            <div className="mt-6 text-sm text-gray-600">
              Remember your password?{" "}
              <Link className="font-semibold text-gray-900 underline decoration-gray-300 hover:decoration-gray-900" href="/login">
                Sign in
              </Link>
            </div>
          </Card>
        </div>
      </Container>
    </div>
  );
}

"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Container from "@/components/ui/Container";
import LogoMark from "@/components/ui/LogoMark";

function LoginFormContent() {
  const searchParams = useSearchParams();
  const next = searchParams?.get("next") || "/lk";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [verifyNotice, setVerifyNotice] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErr("");
    setVerifyNotice("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok && data?.ok) {
        window.location.href = next;
        return;
      }

      const message = data?.error || data?.message || `Login failed (${res.status})`;
      setErr(message);
      if (String(message).toLowerCase().includes("email not verified")) {
        setVerifyNotice("Need a new verification email? Send it below.");
      }
    } catch {
      setErr("Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white bg-[radial-gradient(circle_at_top,_#e9f2ff,_transparent_55%)]">
      <Container className="py-10 lg:py-16">
        <div className="flex items-center justify-center lg:justify-start">
          <LogoMark />
        </div>

        <div className="mt-10 grid gap-10 lg:grid-cols-[1.15fr,420px] lg:items-center">
          <div className="hidden lg:block space-y-6">
            <p className="inline-flex items-center rounded-full bg-blue-50 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-blue-700">
              XRP Restaking access
            </p>
            <div className="space-y-3">
              <h1 className="text-4xl font-semibold leading-tight">Sign in to your dashboard</h1>
              <p className="text-lg leading-relaxed text-gray-600">
                Use your verified email to access staking controls, payouts, and security settings.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {[
                "Protected sessions and access control",
                "Email verification for activation",
                "Activity logs and transparency",
                "Support on request",
              ].map((item) => (
                <div
                  key={item}
                  className="rounded-2xl border border-gray-200 bg-white p-4 text-sm font-medium text-gray-800 shadow-soft transition-transform transition-shadow duration-200 hover:-translate-y-1 hover:shadow-lg"
                >
                  {item}
                </div>
              ))}
            </div>

            <div className="text-sm text-gray-600">
              No account?{" "}
              <Link href="/register" className="font-semibold text-gray-900 underline decoration-gray-300 hover:decoration-gray-900">
                Create one
              </Link>
            </div>
          </div>

          <Card className="p-7 shadow-lg shadow-blue-100/60">
            <div className="mb-6 space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">Welcome back</p>
              <h2 className="text-2xl font-semibold text-gray-900">Sign in</h2>
              <p className="text-sm text-gray-600">
                Login to your XRP Restaking account.
              </p>
            </div>

            <form className="space-y-4" onSubmit={handleSubmit}>
              {err && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {err}
                </div>
              )}
              {verifyNotice ? (
                <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                  {verifyNotice}
                  <button
                    className="ml-2 underline"
                    type="button"
                    onClick={async () => {
                      const r = await fetch("/api/auth/resend-verification", {
                        method: "POST",
                        headers: { "content-type": "application/json" },
                        body: JSON.stringify({ email }),
                      });
                      const d = await r.json().catch(() => ({}));
                      if (!r.ok) {
                        setErr(d?.error || "Could not send verification email");
                        return;
                      }
                      setVerifyNotice("Verification email sent. Check your inbox.");
                    }}
                  >
                    Resend email
                  </button>
                </div>
              ) : null}

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-800" htmlFor="email">
                  Email address
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
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-800" htmlFor="password">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className="h-11 w-full rounded-xl border border-gray-200 bg-white px-4 text-sm shadow-inner focus:border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                />
              </div>

              <div className="flex items-center justify-between text-sm text-gray-600">
                <label className="inline-flex items-center gap-2">
                  <input type="checkbox" className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500/20" />
                  Remember me
                </label>
                <Link href="/forgot-password" className="font-medium text-gray-900 underline decoration-gray-300 hover:decoration-gray-900">
                  Forgot password?
                </Link>
              </div>

              <Button
                type="submit"
                className="w-full bg-blue-600 text-white hover:bg-blue-500 focus:ring-blue-500/30"
                disabled={loading}
              >
              {loading ? "Signing in..." : "Sign in"}
            </Button>

            <div className="text-center text-sm text-gray-600">
              Don&apos;t have an account?{" "}
              <Link className="font-semibold text-gray-900 underline decoration-gray-300 hover:decoration-gray-900" href="/register">
                Sign up
              </Link>
            </div>

            <input type="hidden" name="next" value={next} />
          </form>

          <div className="mt-6 text-sm text-gray-600">
            By signing in, you agree to the{" "}
            <Link className="underline" href="/terms">Terms of Service</Link> and{" "}
            <Link className="underline" href="/privacy">Privacy Policy</Link>.
          </div>
        </Card>
      </div>
    </Container>
  </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-white text-gray-600">Loading...</div>
      }
    >
      <LoginFormContent />
    </Suspense>
  );
}

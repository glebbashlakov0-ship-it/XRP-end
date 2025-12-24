"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Container from "@/components/ui/Container";

function LoginFormContent() {
  const searchParams = useSearchParams();
  const next = searchParams?.get("next") || "/lk";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErr("");

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

      setErr(data?.error || data?.message || `Login failed (${res.status})`);
    } catch {
      setErr("Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-white to-gray-50">
      <Container className="py-16">
        <div className="grid gap-10 lg:grid-cols-[1fr,400px] lg:items-center">
          <div className="space-y-6">
            <p className="inline-flex items-center rounded-full bg-gray-100 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-gray-700">
              XRP Restaking - secure access
            </p>
            <div className="space-y-3">
              <h1 className="text-4xl font-semibold leading-tight">Sigh in to your account</h1>
              <p className="text-lg leading-relaxed text-gray-600">
                Use the email and password from registration to access your dashboard. If your email
                is not verified, you can resend the confirmation message.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {[
                "Protected sessions and access control",
                "Email verification for activation",
                "Activity logs and transparency",
                "Support on request",
              ].map((item) => (
                <div key={item} className="rounded-2xl border border-gray-200 bg-white p-4 text-sm font-medium text-gray-800 shadow-soft">
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

          <Card className="p-7 shadow-lg shadow-gray-200/50">
            <div className="mb-6 space-y-2">
              <h2 className="text-2xl font-semibold">Sigh in</h2>
              <p className="text-sm text-gray-600">
                Enter your account details to continue.
              </p>
            </div>

            <form className="space-y-4" onSubmit={handleSubmit}>
              {err && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {err}
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
                  className="h-11 w-full rounded-xl border border-gray-200 bg-white px-4 text-sm shadow-inner focus:border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-900/10"
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
                  className="h-11 w-full rounded-xl border border-gray-200 bg-white px-4 text-sm shadow-inner focus:border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-900/10"
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                />
              </div>

              <div className="flex items-center justify-between text-sm text-gray-600">
                <label className="inline-flex items-center gap-2">
                  <input type="checkbox" className="h-4 w-4 rounded border-gray-300 text-gray-900 focus:ring-gray-900/20" />
                  Remember me
                </label>
                <Link href="/forgot-password" className="font-medium text-gray-900 underline decoration-gray-300 hover:decoration-gray-900">
                  Forgot password?
                </Link>
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Sighing in..." : "Sigh in"}
              </Button>

              <input type="hidden" name="next" value={next} />
            </form>

            <div className="mt-6 text-sm text-gray-600">
              By sighing in, you agree to the{" "}
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

"use client";

import { Suspense, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Container from "@/components/ui/Container";
import LogoMark from "@/components/ui/LogoMark";

type Status = "idle" | "saving" | "done" | "error";

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const token = useMemo(() => searchParams?.get("token") || "", [searchParams]);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("saving");
    setError("");

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password, confirmPassword }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.ok) {
        setStatus("error");
        setError(data?.error || "Could not reset password.");
        return;
      }

      setStatus("done");
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
              Secure recovery
            </p>
            <div className="space-y-3">
              <h1 className="text-4xl font-semibold leading-tight">Create a new password</h1>
              <p className="text-lg leading-relaxed text-gray-600">
                Use a strong password you have not used before. After saving, you can sign in again.
              </p>
            </div>
          </div>

          <Card className="p-7 shadow-lg shadow-blue-100/60">
            <div className="mb-6 space-y-2">
              <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">Reset password</p>
              <h2 className="text-2xl font-semibold text-gray-900">Set a new password</h2>
              <p className="text-sm text-gray-600">
                Enter and confirm your new password.
              </p>
            </div>

            {!token && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                Missing reset token. Please use the link from your email.
              </div>
            )}

            {status === "done" ? (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-4 text-sm text-emerald-700">
                Password updated. You can now sign in.
                <div className="mt-4">
                  <Link className="font-semibold text-gray-900 underline decoration-gray-300 hover:decoration-gray-900" href="/login">
                    Go to sign in
                  </Link>
                </div>
              </div>
            ) : (
              <form className="space-y-4" onSubmit={handleSubmit}>
                {status === "error" && (
                  <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error}
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-800" htmlFor="password">
                    New password
                  </label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    required
                    className="h-11 w-full rounded-xl border border-gray-200 bg-white px-4 text-sm shadow-inner focus:border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    placeholder="Create a new password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={status === "saving" || !token}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-800" htmlFor="confirmPassword">
                    Confirm password
                  </label>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    required
                    className="h-11 w-full rounded-xl border border-gray-200 bg-white px-4 text-sm shadow-inner focus:border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    placeholder="Repeat new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={status === "saving" || !token}
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-blue-600 text-white hover:bg-blue-500 focus:ring-blue-500/30"
                  disabled={status === "saving" || !token}
                >
                  {status === "saving" ? "Saving..." : "Update password"}
                </Button>
              </form>
            )}

            <div className="mt-6 text-sm text-gray-600">
              Back to{" "}
              <Link className="font-semibold text-gray-900 underline decoration-gray-300 hover:decoration-gray-900" href="/login">
                sign in
              </Link>
              .
            </div>
          </Card>
        </div>
      </Container>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-white text-gray-600">Loading...</div>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  );
}

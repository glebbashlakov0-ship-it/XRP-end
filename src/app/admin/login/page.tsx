"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import Button from "@/components/ui/Button";

function AdminLoginForm() {
  const searchParams = useSearchParams();
  const next = searchParams?.get("next") || "/admin/users";

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErr("");

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json().catch(() => ({}));
      if (res.ok && data?.ok) {
        window.location.href = next;
        return;
      }

      setErr(data?.error || `Login failed (${res.status})`);
    } catch {
      setErr("Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="w-full max-w-sm border border-gray-300 p-5">
        <form className="space-y-3" onSubmit={handleSubmit}>
          {err && (
            <div className="border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {err}
            </div>
          )}
          <input
            id="username"
            name="username"
            type="text"
            required
            className="h-10 w-full border border-gray-300 px-3 text-sm"
            placeholder="Login"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            disabled={loading}
          />
          <input
            id="password"
            name="password"
            type="password"
            required
            className="h-10 w-full border border-gray-300 px-3 text-sm"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
          />
          <Button
            type="submit"
            className="h-10 w-full bg-black text-white"
            disabled={loading}
          >
            {loading ? "Signing in..." : "Sign in"}
          </Button>
        </form>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-white text-gray-600">Loading...</div>
      }
    >
      <AdminLoginForm />
    </Suspense>
  );
}

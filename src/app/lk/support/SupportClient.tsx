"use client";

import { useState } from "react";

type Status = "idle" | "sending" | "sent" | "error";

export default function SupportClient() {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("sending");
    setError("");

    const r = await fetch("/api/support", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ subject, message }),
    });
    const data = await r.json().catch(() => ({}));
    if (!r.ok) {
      setStatus("error");
      setError(data?.error || "Failed to send request.");
      return;
    }
    if (data?.emailed === false) {
      setStatus("error");
      setError("Email is not configured on the server. Please set SMTP and SUPPORT_EMAIL.");
      return;
    }
    setStatus("sent");
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4 text-sm text-gray-500">
          <div className="font-medium text-blue-600">New Ticket</div>
          <div>My Tickets</div>
        </div>

        <form className="px-6 py-5 space-y-4" onSubmit={onSubmit}>
          <label className="grid gap-2 text-sm text-gray-600">
            <span className="font-medium text-gray-700">Subject</span>
            <input
              className="h-11 rounded-xl border border-gray-200 bg-gray-50 px-3"
              placeholder="How can we help?"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              required
              minLength={3}
            />
          </label>

          <label className="grid gap-2 text-sm text-gray-600">
            <span className="font-medium text-gray-700">Message</span>
            <textarea
              className="min-h-[140px] rounded-xl border border-gray-200 bg-gray-50 px-3 py-2"
              placeholder="Describe your issue in detail"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
              minLength={10}
            />
          </label>

          {status === "error" ? (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          ) : null}

          {status === "sent" ? (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
              Ticket sent. Our team will reply by email.
            </div>
          ) : null}

          <div className="flex justify-end">
            <button
              className="h-10 px-5 rounded-xl bg-blue-600 text-white text-sm font-semibold"
              type="submit"
              disabled={status === "sending"}
            >
              {status === "sending" ? "Sending..." : "Submit"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

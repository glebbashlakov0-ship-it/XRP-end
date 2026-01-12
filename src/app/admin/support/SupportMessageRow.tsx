"use client";

import { useState } from "react";
import Link from "next/link";

type SupportMessageRowProps = {
  id: string;
  userId: string;
  userEmail: string;
  subject: string;
  message: string;
  createdAt: string;
  repliedAt: string | null;
};

export default function SupportMessageRow({
  id,
  userId,
  userEmail,
  subject,
  message,
  createdAt,
  repliedAt,
}: SupportMessageRowProps) {
  const [open, setOpen] = useState(false);
  const [reply, setReply] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const [localRepliedAt, setLocalRepliedAt] = useState<string | null>(repliedAt);

  const statusLabel = status === "error" ? "Error" : status === "sent" || localRepliedAt ? "Sent" : "Pending";

  const handleSend = async () => {
    if (!reply.trim()) return;
    setStatus("sending");
    setError(null);
    try {
      const res = await fetch("/api/admin/support/reply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messageId: id, reply: reply.trim() }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || "Failed to send reply");
      }
      setStatus("sent");
      setLocalRepliedAt(new Date().toISOString());
      setReply("");
      setOpen(false);
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Failed to send reply");
    }
  };

  return (
    <div className="border-t border-gray-200">
      <div className="grid grid-cols-12 px-4 py-4 text-sm">
        <div className="col-span-3 font-medium text-gray-900">
          <Link className="underline decoration-gray-200 hover:decoration-gray-400" href={`/admin/users/${userId}`}>
            {userEmail}
          </Link>
        </div>
        <div className="col-span-3 text-gray-700">{subject}</div>
        <div className="col-span-3 text-gray-600 truncate">{message}</div>
        <div className="col-span-1 text-center text-xs text-gray-600">{statusLabel}</div>
        <div className="col-span-1 text-right text-gray-500">{createdAt}</div>
        <div className="col-span-1 text-right">
          <button
            type="button"
            className="text-xs font-medium text-blue-600 hover:text-blue-800"
            onClick={() => setOpen((prev) => !prev)}
          >
            Reply
          </button>
        </div>
      </div>
      {open ? (
        <div className="px-4 pb-4">
          <div className="rounded-xl border border-gray-200 bg-gray-50 p-3">
            <div className="text-xs text-gray-600">
              Reply to <span className="font-semibold text-gray-900">{userEmail}</span>
            </div>
            <textarea
              className="mt-2 w-full rounded-lg border border-gray-200 bg-white p-2 text-sm"
              rows={4}
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              placeholder="Type your reply..."
            />
            <div className="mt-2 flex items-center gap-3">
              <button
                type="button"
                className="h-9 rounded-lg bg-gray-900 px-4 text-xs font-semibold text-white disabled:opacity-60"
                onClick={handleSend}
                disabled={status === "sending"}
              >
                {status === "sending" ? "Sending..." : "Send reply"}
              </button>
              {status === "sent" ? <span className="text-xs text-emerald-600">Sent</span> : null}
              {status === "error" ? <span className="text-xs text-red-600">{error}</span> : null}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

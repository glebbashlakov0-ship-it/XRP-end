"use client";

import { useTransition } from "react";

type ConfirmDeleteButtonProps = {
  label?: string;
  className?: string;
  confirmText: string;
  action: () => Promise<void>;
};

export default function ConfirmDeleteButton({
  label = "Delete",
  className = "",
  confirmText,
  action,
}: ConfirmDeleteButtonProps) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      className={className}
      onClick={() => {
        if (pending) return;
        if (!window.confirm(confirmText)) return;
        startTransition(() => action());
      }}
      disabled={pending}
    >
      {pending ? "Deleting..." : label}
    </button>
  );
}

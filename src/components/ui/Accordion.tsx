"use client";

import { useMemo, useState } from "react";
import Divider from "./Divider";

type Item = { q: string; a: string };

export default function Accordion({ items, defaultOpenIndex = 0 }: { items: Item[]; defaultOpenIndex?: number }) {
  const safeDefault = useMemo(() => (items.length ? Math.min(defaultOpenIndex, items.length - 1) : -1), [items, defaultOpenIndex]);
  const [open, setOpen] = useState<number>(safeDefault);

  return (
    <div className="divide-y divide-gray-200">
      {items.map((it, idx) => {
        const isOpen = open === idx;
        return (
          <div key={idx} className="py-3">
            <button
              className="w-full text-left flex items-start justify-between gap-6 py-3"
              onClick={() => setOpen(isOpen ? -1 : idx)}
              aria-expanded={isOpen}
            >
              <span className="font-medium text-gray-900">{it.q}</span>
              <span className="text-gray-400">{isOpen ? "-" : "+"}</span>
            </button>
            {isOpen && (
              <div className="pb-3 text-sm text-gray-600 leading-relaxed">
                {it.a}
              </div>
            )}
            <Divider className="mt-3" />
          </div>
        );
      })}
    </div>
  );
}

import Link from "next/link";

const navGroups = [
  {
    label: "Management",
    links: [
      { href: "/admin/users", label: "Users" },
    ],
  },
  {
    label: "Support",
    links: [
      { href: "/admin/support", label: "Support" },
    ],
  },
  {
    label: "Edit",
    links: [
      { href: "/admin/terms", label: "Edit (Terms)" },
      { href: "/admin/privacy", label: "Edit (Privacy)" },
    ],
  },
  {
    label: "Settings",
    links: [
      { href: "/admin/verification", label: "Verification (DEV ONLY)" },
    ],
  },
];

function isActive(current: string | undefined, href: string) {
  if (!current) return false;
  return current === href || current.startsWith(`${href}/`);
}

export default function AdminNav({ current }: { current?: string }) {
  return (
    <aside className="rounded-2xl border border-gray-200 bg-white px-4 py-5">
      {navGroups.map((group, index) => (
        <div key={group.label} className={index === 0 ? "" : "pt-5 mt-5 border-t border-gray-200"}>
          <div className="px-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-gray-400">
            {group.label}
          </div>
          <div className="mt-3 grid gap-1 text-sm">
            {group.links.map((link) => {
              const active = isActive(current, link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`rounded-xl px-3 py-2 transition ${
                    active
                      ? "bg-gray-900 text-white"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </aside>
  );
}

import Link from "next/link";

const links = [
  { href: "/admin/users", label: "Users" },
  { href: "/admin/support", label: "Support" },
  { href: "/admin/verification", label: "Verification (DEV ONLY)" },
];

export default function AdminNav({ current }: { current?: string }) {
  return (
    <div className="flex flex-wrap items-center gap-2 text-sm">
      {links.map((link) => {
        const active = current === link.href;
        return (
          <Link
            key={link.href}
            href={link.href}
            className={`rounded-full px-4 py-2 border transition ${
              active
                ? "bg-gray-900 text-white border-gray-900"
                : "border-gray-200 text-gray-600 hover:bg-gray-50"
            }`}
          >
            {link.label}
          </Link>
        );
      })}
    </div>
  );
}

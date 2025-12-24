import Container from "@/components/ui/Container";
import LogoMark from "@/components/ui/LogoMark";
import { nav } from "@/lib/landingData";
import Link from "next/link";

export default function Header() {
  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur border-b border-gray-200">
      <Container className="h-16 flex items-center justify-between">
        <Link href="/" className="shrink-0">
          <LogoMark />
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-sm text-gray-600">
          {nav.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="hover:text-gray-900 transition"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center rounded-full px-5 h-11 text-sm font-medium bg-gray-900 text-white hover:bg-gray-800 transition"
          >
            Dashboard
          </Link>
        </div>
      </Container>
    </header>
  );
}

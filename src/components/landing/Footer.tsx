import Container from "@/components/ui/Container";
import Divider from "@/components/ui/Divider";
import LogoMark from "@/components/ui/LogoMark";
import { footer } from "@/lib/landingData";

export default function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white">
      <Container className="py-8">
        <div className="grid gap-10 lg:grid-cols-3">
          <div>
            <LogoMark />
            <p className="mt-4 text-sm text-gray-600 leading-relaxed">{footer.about}</p>

            <div className="mt-6 grid gap-2 sm:grid-cols-3">
              {footer.facts.map((f) => (
                <div
                  key={f.label}
                  className="rounded-xl border border-gray-200 px-3 py-2 transition-transform transition-shadow duration-200 hover:-translate-y-1 hover:shadow-lg"
                >
                  <div className="text-[11px] text-gray-500 leading-tight">{f.label}</div>
                  <div className="mt-1 text-xs font-semibold text-gray-900 leading-snug">{f.value}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-2 grid gap-8 md:grid-cols-3">
            {Object.entries(footer.links).map(([group, links]) => (
              <div key={group}>
                <div className="text-sm font-semibold">{group}</div>
                <div className="mt-4 grid gap-3 text-sm text-gray-600">
                  {links.map((l) => (
                    <a key={l.label} href={l.href} className="hover:text-gray-900 transition">
                      {l.label}
                    </a>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <Divider className="my-6" />

        <div className="text-xs text-gray-500">{footer.copyright}</div>
      </Container>
    </footer>
  );
}

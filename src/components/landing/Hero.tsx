import Section from "@/components/ui/Section";
import Button from "@/components/ui/Button";
import { hero } from "@/lib/landingData";
import { ArrowRight } from "lucide-react";

export default function Hero() {
  return (
    <Section className="pt-10 md:pt-16">
      <div className="grid gap-10 md:grid-cols-2 md:items-center">
        <div>
          <h1 className="text-4xl md:text-5xl font-semibold tracking-tight leading-[1.06]">
            {hero.h1}
          </h1>
          <p className="mt-5 text-gray-600 leading-relaxed">
            {hero.sub}
          </p>

          <div className="mt-7 flex flex-wrap gap-3">
            <a href={hero.primaryCta.href}>
              <Button>
                {hero.primaryCta.label} <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </a>
            <a href={hero.secondaryCta.href}>
              <Button variant="secondary">{hero.secondaryCta.label}</Button>
            </a>
          </div>

          <div className="mt-10 grid grid-cols-3 gap-4">
            {hero.highlights.map((h) => (
              <div
                key={h.label}
                className="rounded-2xl border border-gray-200 p-4 transition-transform transition-shadow duration-200 hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="text-xs text-gray-500">{h.label}</div>
                <div className="mt-1 font-semibold">{h.value}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="md:ml-auto flex items-center justify-center">
          <div className="w-full max-w-[520px] aspect-[52/42] rounded-3xl border border-gray-200 bg-gray-50" />
        </div>
      </div>
    </Section>
  );
}

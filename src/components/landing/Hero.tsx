"use client";

import Section from "@/components/ui/Section";
import Button from "@/components/ui/Button";
import { hero } from "@/lib/landingData";
import { ArrowRight } from "lucide-react";
import Image from "next/image";

export default function Hero() {
  const scrollToForm = () => {
    const el = document.getElementById("info-request-form");
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <Section className="pt-10 md:pt-16">
      <div className="grid gap-10 md:grid-cols-2 md:items-center">
        <div className="order-1 md:order-1">
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
            <Button
              type="button"
              onClick={scrollToForm}
              variant="secondary"
              className="shadow-sm hover:-translate-y-0.5 hover:shadow-lg"
            >
              Send Request
            </Button>
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

        <div className="order-2 md:order-2 md:ml-auto flex items-center justify-center">
          <div className="w-full max-w-[680px] aspect-[52/42] mx-auto">
            <Image
              src="/hero.png"
              alt="Hero illustration"
              width={1040}
              height={840}
              className="h-full w-full object-contain"
              priority
            />
          </div>
        </div>
      </div>
    </Section>
  );
}

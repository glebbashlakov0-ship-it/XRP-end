"use client";

import { useRef } from "react";
import Section from "@/components/ui/Section";
import Card from "@/components/ui/Card";
import { testimonials } from "@/lib/landingData";
import Image from "next/image";

export default function Testimonials() {
  const scrollerRef = useRef<HTMLDivElement>(null);

  const scrollByPage = (direction: number) => {
    const node = scrollerRef.current;
    if (!node) return;
    const width = node.clientWidth;
    node.scrollBy({ left: width * direction, behavior: "smooth" });
  };

  return (
    <Section className="bg-gray-50 pt-6">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div className="max-w-3xl">
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight">{testimonials.title}</h2>
          <p className="mt-3 text-gray-700 leading-relaxed">{testimonials.subtitle}</p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => scrollByPage(-1)}
            className="h-10 w-10 rounded-full border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 transition"
            aria-label="Scroll testimonials backward"
          >
            ←
          </button>
          <button
            type="button"
            onClick={() => scrollByPage(1)}
            className="h-10 w-10 rounded-full border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 transition"
            aria-label="Scroll testimonials forward"
          >
            →
          </button>
        </div>
      </div>

      <div
        ref={scrollerRef}
        className="mt-8 flex gap-5 overflow-x-auto pb-3 snap-x snap-mandatory scroll-smooth"
      >
        {testimonials.items.map((item) => (
          <Card
            key={item.name}
            className="shadow-none min-w-[260px] sm:min-w-[320px] md:min-w-[360px] lg:min-w-[420px] snap-start flex flex-col"
          >
            <div className="flex flex-1 flex-col">
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>Review</span>
                <span className="rounded-full border border-gray-200 px-2 py-1 text-[11px] text-gray-600">
                  {item.rating}
                </span>
              </div>
              <p className="mt-4 text-base text-gray-800 leading-relaxed">"{item.text}"</p>
            </div>
            <div className="mt-6 flex items-center gap-3">
              {item.avatar ? (
                <Image
                  src={item.avatar}
                  alt={`${item.name} avatar`}
                  width={48}
                  height={48}
                  className="h-12 w-12 rounded-full object-cover border border-gray-200 bg-gray-50"
                />
              ) : (
                <div className="h-12 w-12 rounded-full border border-gray-200 bg-gray-50 flex items-center justify-center text-xs font-semibold text-gray-700">
                  {item.initials}
                </div>
              )}
              <div>
                <div className="text-sm font-semibold text-gray-900">{item.name}</div>
                <div className="text-xs text-gray-600">{item.role}</div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </Section>
  );
}

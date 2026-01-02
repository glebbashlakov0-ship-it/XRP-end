import Section from "@/components/ui/Section";
import Card from "@/components/ui/Card";
import { restakingSpotlight } from "@/lib/landingData";
import { Play, Quote } from "lucide-react";
import Image from "next/image";

export default function RestakingSpotlight() {
  return (
    <Section className="pb-10">
      <div className="grid gap-12 lg:grid-cols-2 lg:items-start">
        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-4 py-2 text-sm font-semibold text-indigo-700">
            <span className="inline-block h-2 w-2 rounded-full bg-indigo-500" />
            {restakingSpotlight.tag}
          </div>
          <div>
            <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-gray-900">
              {restakingSpotlight.headline}
            </h2>
            <p className="mt-3 text-gray-600 leading-relaxed">{restakingSpotlight.description}</p>
          </div>
          <Card className="shadow-none border-gray-200 bg-gradient-to-br from-white to-indigo-50/60">
            <div className="relative overflow-hidden rounded-2xl border border-gray-200/70 bg-black/5 aspect-video">
              <video
                className="w-full h-full object-cover"
                src={restakingSpotlight.video.src}
                poster={restakingSpotlight.video.poster}
                controls
                preload="metadata"
                playsInline
              />
              <div className="pointer-events-none absolute inset-0 flex flex-wrap gap-2 p-4">
                {restakingSpotlight.video.badges.map((badge) => (
                  <span
                    key={badge}
                    className="inline-flex items-center gap-2 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-gray-800 shadow-sm backdrop-blur"
                  >
                    <Play className="h-3 w-3 text-indigo-600" />
                    {badge}
                  </span>
                ))}
              </div>
            </div>
            <div className="mt-4">
              <div className="text-lg font-semibold text-gray-900">{restakingSpotlight.video.title}</div>
              <p className="mt-1 text-sm text-gray-600 leading-relaxed">{restakingSpotlight.video.caption}</p>
            </div>
          </Card>
        </div>

        <Card className="shadow-none border-gray-200">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-sky-500 to-indigo-600 text-white font-semibold">
              BG
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Quote className="h-6 w-6 text-indigo-500" />
                <span className="text-sm font-semibold uppercase tracking-[0.15em] text-indigo-600">Perspective</span>
              </div>
              <p className="text-lg leading-relaxed text-gray-900 italic">"{restakingSpotlight.quote.text}"</p>
              <div className="flex flex-wrap items-center gap-3">
                <div>
                  <div className="font-semibold text-gray-900">{restakingSpotlight.quote.author}</div>
                  <div className="text-sm text-gray-500">{restakingSpotlight.quote.role}</div>
                </div>
                <a
                  href={restakingSpotlight.quote.instagram}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border border-gray-200 px-3 py-1.5 text-sm font-semibold text-gray-800 transition-colors duration-150 hover:border-indigo-200 hover:text-indigo-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
                >
                  <Image src="/logo-placeholder.svg" alt="Instagram" width={16} height={16} className="opacity-80" />
                  Visit Instagram
                </a>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </Section>
  );
}

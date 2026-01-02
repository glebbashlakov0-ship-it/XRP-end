import Section from "@/components/ui/Section";
import Card from "@/components/ui/Card";
import { restakingSpotlight } from "@/lib/landingData";
import Image from "next/image";

export default function RestakingSpotlight() {
  return (
    <Section className="pb-10">
      <div className="grid gap-12 lg:grid-cols-2 lg:items-start">
        <div className="space-y-6">
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
            </div>
            <div className="mt-4">
              <div className="text-lg font-semibold text-gray-900">{restakingSpotlight.video.title}</div>
              <p className="mt-1 text-sm text-gray-600 leading-relaxed">{restakingSpotlight.video.caption}</p>
            </div>
          </Card>
        </div>

        <div className="flex items-start gap-4 lg:pl-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-sky-500 to-indigo-600 text-white font-semibold">
            BG
          </div>
          <div className="space-y-4">
            <p className="text-lg md:text-xl leading-relaxed text-gray-900 italic">
              "{restakingSpotlight.quote.text}"
            </p>
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
      </div>
    </Section>
  );
}

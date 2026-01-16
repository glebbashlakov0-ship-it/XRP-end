import Card from "@/components/ui/Card";
import Section from "@/components/ui/Section";
import { restakingSpotlight } from "@/lib/landingData";

export default function RestakingSpotlight() {
  return (
    <Section className="pb-10">
      <div className="space-y-8">
        <div className="max-w-4xl">
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-gray-900">
            {restakingSpotlight.headline}
          </h2>
          <p className="mt-3 text-gray-600 leading-relaxed">{restakingSpotlight.description}</p>
        </div>

        <Card className="shadow-none border-gray-200 bg-gradient-to-br from-white to-indigo-50/60 p-0 md:p-0">
          <div className="mx-auto w-full max-w-5xl space-y-8 py-6 md:py-8 lg:py-10">
            <div className="mx-auto w-full max-w-3xl overflow-hidden rounded-3xl border border-gray-200/70 bg-black/5">
              <div className="relative aspect-video bg-black">
                <video
                  className="absolute inset-0 h-full w-full object-cover"
                  src={restakingSpotlight.video.src}
                  poster={restakingSpotlight.video.poster}
                  controls
                  preload="metadata"
                  playsInline
                />
              </div>
              <div className="flex flex-wrap items-center justify-between gap-4 border-t border-gray-200/70 bg-white/70 px-6 py-4 backdrop-blur">
                <div>
                  <div className="text-lg font-semibold text-gray-900">{restakingSpotlight.video.title}</div>
                  <p className="mt-1 text-sm text-gray-600 leading-relaxed">{restakingSpotlight.video.caption}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {restakingSpotlight.video.badges.map((badge) => (
                    <span
                      key={badge}
                      className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 ring-1 ring-inset ring-indigo-100"
                    >
                      {badge}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="mx-auto w-full max-w-3xl border border-gray-200 bg-white/90 px-6 py-5 backdrop-blur md:px-7 md:py-6 rounded-3xl shadow-soft">
              <div className="flex flex-col gap-5 md:flex-row md:items-start">
                <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full bg-gradient-to-br from-sky-500 to-indigo-600">
                  {restakingSpotlight.quote.avatar ? (
                    <img
                      src={restakingSpotlight.quote.avatar}
                      alt={restakingSpotlight.quote.author}
                      className="h-full w-full object-cover"
                      loading="eager"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-lg font-semibold text-white">
                      {restakingSpotlight.quote.author
                        .split(" ")
                        .map((part) => part[0])
                        .join("")
                        .slice(0, 2)
                        .toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="space-y-3">
                  <p className="text-lg md:text-xl leading-relaxed text-gray-900 italic">
                    "{restakingSpotlight.quote.text}"
                  </p>
                  <div className="flex flex-wrap items-center gap-3">
                    <div>
                      <div className="font-semibold text-gray-900">{restakingSpotlight.quote.author}</div>
                      <div className="text-sm text-gray-500">{restakingSpotlight.quote.role}</div>
                    </div>
                    <a
                      href={restakingSpotlight.quote.xUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 rounded-full border border-gray-200 px-3 py-1.5 text-sm font-semibold text-gray-800 transition-colors duration-150 hover:border-indigo-200 hover:text-indigo-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
                    >
                      <span className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-gray-300 text-[10px] font-semibold">
                        X
                      </span>
                      View on X
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </Section>
  );
}

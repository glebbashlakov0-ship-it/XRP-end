import Section from "@/components/ui/Section";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { finalCta } from "@/lib/landingData";
import { ArrowRight } from "lucide-react";

export default function FinalCta() {
  return (
    <Section className="pt-0">
      <Card className="shadow-none bg-white">
        <div className="grid gap-8 md:grid-cols-2 md:items-center">
          <div>
            <h2 className="text-3xl md:text-4xl font-semibold tracking-tight">{finalCta.title}</h2>
            <p className="mt-3 text-gray-600 leading-relaxed">{finalCta.text}</p>
          </div>
          <div className="flex flex-wrap gap-3 md:justify-end">
            <a href={finalCta.primary.href}>
              <Button>
                {finalCta.primary.label} <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </a>
            <a href={finalCta.secondary.href}>
              <Button variant="secondary">{finalCta.secondary.label}</Button>
            </a>
          </div>
        </div>
        <div className="mt-8">
          <div className="text-lg font-semibold">{finalCta.video.title}</div>
          <p className="mt-2 text-sm text-gray-600 leading-relaxed">{finalCta.video.subtitle}</p>
          <div className="mt-5 overflow-hidden rounded-2xl border border-gray-200 bg-black/5">
            <video
              className="w-full h-auto"
              src={finalCta.video.src}
              poster={finalCta.video.poster}
              autoPlay
              loop
              muted
              playsInline
              preload="auto"
            />
          </div>
        </div>
      </Card>
    </Section>
  );
}

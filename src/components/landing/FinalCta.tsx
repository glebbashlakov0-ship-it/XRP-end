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
      </Card>
    </Section>
  );
}

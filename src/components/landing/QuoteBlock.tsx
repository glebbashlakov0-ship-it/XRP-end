import Section from "@/components/ui/Section";
import Card from "@/components/ui/Card";
import { quote } from "@/lib/landingData";

export default function QuoteBlock() {
  return (
    <Section className="bg-white pt-6">
      <Card className="shadow-none">
        <div className="text-6xl leading-none text-gray-200 select-none">“</div>
        <p className="mt-3 text-lg md:text-xl text-gray-800 leading-relaxed">
          {quote.text}
        </p>
        <div className="mt-8 flex items-center justify-between gap-6 flex-wrap">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full border border-gray-200 flex items-center justify-center font-semibold">
              {quote.initials}
            </div>
            <div>
              <div className="font-semibold">{quote.name}</div>
              <div className="text-sm text-gray-600">{quote.role}</div>
            </div>
          </div>

          <a
            href={quote.instagramUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center rounded-full px-5 h-11 text-sm font-medium border border-gray-200 hover:bg-gray-50 transition"
          >
            Visit Instagram
          </a>
        </div>
      </Card>
    </Section>
  );
}

import Section from "@/components/ui/Section";
import Card from "@/components/ui/Card";
import { security } from "@/lib/landingData";

export default function Security() {
  return (
    <Section id="security">
      <div className="max-w-3xl">
        <h2 className="text-3xl md:text-4xl font-semibold tracking-tight">{security.title}</h2>
        <p className="mt-3 text-gray-600 leading-relaxed">{security.subtitle}</p>
      </div>

      <div className="mt-10 grid gap-5 md:grid-cols-2">
        {security.cards.map((c) => (
          <Card key={c.title} className="shadow-none">
            <div className="text-lg font-semibold">{c.title}</div>
            <p className="mt-2 text-sm text-gray-600 leading-relaxed">{c.text}</p>
          </Card>
        ))}
      </div>
    </Section>
  );
}

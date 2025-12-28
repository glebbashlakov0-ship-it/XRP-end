import Section from "@/components/ui/Section";
import Card from "@/components/ui/Card";
import { features } from "@/lib/landingData";

export default function KeyFeatures() {
  return (
    <Section id="features">
      <div className="max-w-3xl">
        <h2 className="text-3xl md:text-4xl font-semibold tracking-tight">{features.title}</h2>
        <p className="mt-3 text-gray-600 leading-relaxed">{features.subtitle}</p>
      </div>

      <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {features.items.map((f) => (
          <Card key={f.title} className="shadow-none">
            <div className="text-lg font-semibold">{f.title}</div>
            <p className="mt-2 text-sm text-gray-600 leading-relaxed">{f.text}</p>
          </Card>
        ))}
      </div>
    </Section>
  );
}

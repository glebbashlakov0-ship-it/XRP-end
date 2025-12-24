import Section from "@/components/ui/Section";
import Card from "@/components/ui/Card";
import { howItWorks } from "@/lib/landingData";

export default function HowItWorks() {
  return (
    <Section id="how-it-works">
      <div className="max-w-3xl">
        <h2 className="text-3xl md:text-4xl font-semibold tracking-tight">{howItWorks.title}</h2>
        <p className="mt-3 text-gray-600 leading-relaxed">{howItWorks.intro}</p>
      </div>

      <div className="mt-10 grid gap-5 md:grid-cols-2">
        {howItWorks.steps.map((s, i) => (
          <Card key={s.title} className="shadow-none">
            <div className="text-xs text-gray-500">Step {i + 1}</div>
            <div className="mt-2 text-xl font-semibold">{s.title}</div>
            <p className="mt-2 text-gray-600 leading-relaxed">{s.text}</p>
          </Card>
        ))}
      </div>
    </Section>
  );
}

import Section from "@/components/ui/Section";
import Card from "@/components/ui/Card";
import { howItWorks } from "@/lib/landingData";
import Image from "next/image";

export default function HowItWorks() {
  return (
    <Section id="how-it-works">
      <div className="max-w-3xl">
        <h2 className="text-3xl md:text-4xl font-semibold tracking-tight">{howItWorks.title}</h2>
        <p className="mt-3 text-gray-600 leading-relaxed">{howItWorks.intro}</p>
      </div>

      <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-4 lg:gap-6">
        {howItWorks.steps.map((s) => (
          <Card key={s.title} className="shadow-none md:aspect-square flex flex-col md:min-h-[320px]">
            <div className="flex items-center gap-3 md:flex-col md:items-start md:gap-0">
              {s.icon ? (
                <Image
                  src={s.icon}
                  alt=""
                  width={128}
                  height={128}
                  className="h-10 w-10 md:h-24 md:w-24 object-contain"
                />
              ) : null}
              <div className="text-lg md:mt-4 md:text-xl font-semibold">{s.title}</div>
            </div>
            <p className="mt-3 text-gray-600 leading-relaxed">{s.text}</p>
          </Card>
        ))}
      </div>
    </Section>
  );
}

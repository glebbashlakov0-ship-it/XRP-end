import Section from "@/components/ui/Section";
import Card from "@/components/ui/Card";
import { trusted } from "@/lib/landingData";
import Image from "next/image";

export default function TrustedBy() {
  return (
    <Section id="trusted" className="bg-gray-50">
      <div className="max-w-3xl">
        <h2 className="text-3xl md:text-4xl font-semibold tracking-tight">{trusted.title}</h2>
        <p className="mt-3 text-gray-700 leading-relaxed">{trusted.subtitle}</p>
      </div>

      <div className="mt-10 flex flex-wrap gap-3">
        {trusted.partners.map((p) => (
          <div
            key={p.name}
            className="px-4 h-11 rounded-full border border-gray-200 bg-white flex items-center gap-2 text-sm font-medium transition-transform transition-shadow duration-200 hover:-translate-y-1 hover:shadow-lg"
          >
            <span className="h-7 w-7 rounded-full border border-gray-200 bg-white flex items-center justify-center overflow-hidden">
              {p.name === "Ledger" ? (
                <span className="text-xs font-semibold text-gray-700">L</span>
              ) : (
                <Image
                  src={p.logo}
                  alt={`${p.name} logo`}
                  width={24}
                  height={24}
                  className="h-5 w-5 object-contain"
                />
              )}
            </span>
            <span>{p.name}</span>
          </div>
        ))}
      </div>

      <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
        {trusted.metrics.map((m) => (
          <Card key={m.label} className="shadow-none">
            <div className="text-xs text-gray-500">{m.label}</div>
            <div className="mt-2 text-3xl font-semibold tracking-tight">{m.value}</div>
          </Card>
        ))}
      </div>

      <div className="mt-10">
        <Card className="shadow-none">
          <div className="text-lg font-semibold">{trusted.assurance.title}</div>
          <p className="mt-2 text-sm text-gray-700 leading-relaxed">{trusted.assurance.text}</p>
        </Card>
      </div>
    </Section>
  );
}

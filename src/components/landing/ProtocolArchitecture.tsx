import Section from "@/components/ui/Section";
import Card from "@/components/ui/Card";
import Divider from "@/components/ui/Divider";
import { protocolArchitecture } from "@/lib/landingData";

export default function ProtocolArchitecture() {
  return (
    <Section className="bg-gray-50">
      <div className="max-w-3xl">
        <h2 className="text-3xl md:text-4xl font-semibold tracking-tight">{protocolArchitecture.title}</h2>
        <p className="mt-3 text-gray-700 leading-relaxed">{protocolArchitecture.subtitle}</p>
      </div>

      <div className="mt-10 grid gap-5 md:grid-cols-3">
        {protocolArchitecture.blocks.map((b) => (
          <Card key={b.title} className="shadow-none">
            <div className="text-lg font-semibold">{b.title}</div>
            <ul className="mt-4 space-y-3 text-sm text-gray-600 leading-relaxed">
              {b.bullets.map((x) => (
                <li key={x} className="flex gap-2">
                  <span className="mt-2 h-1.5 w-1.5 rounded-full bg-gray-300" />
                  <span>{x}</span>
                </li>
              ))}
            </ul>
          </Card>
        ))}
      </div>

      <Divider className="mt-10" />

      <p className="mt-6 text-sm text-gray-600 leading-relaxed max-w-3xl">
        {protocolArchitecture.note}
      </p>
    </Section>
  );
}

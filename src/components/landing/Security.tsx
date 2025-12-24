import Section from "@/components/ui/Section";
import Card from "@/components/ui/Card";
import Divider from "@/components/ui/Divider";
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

      <Divider className="my-10" />

      <div className="max-w-4xl">
        <h3 className="text-xl font-semibold">{security.docs.title}</h3>
        <p className="mt-2 text-sm text-gray-600 leading-relaxed">
          Documentation is designed to support consistent internal review and transparent presentation of security controls.
        </p>

        <div className="mt-6 overflow-hidden rounded-2xl border border-gray-200">
          <div className="grid grid-cols-12 bg-gray-50 px-4 py-3 text-xs font-medium text-gray-600">
            <div className="col-span-5">Document</div>
            <div className="col-span-5">Scope</div>
            <div className="col-span-2 text-right">Cadence</div>
          </div>
          {security.docs.rows.map((r) => (
            <div key={r.name} className="grid grid-cols-12 px-4 py-4 border-t border-gray-200 bg-white text-sm">
              <div className="col-span-5 font-medium text-gray-900">{r.name}</div>
              <div className="col-span-5 text-gray-600">{r.scope}</div>
              <div className="col-span-2 text-right text-gray-600">{r.cadence}</div>
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
}

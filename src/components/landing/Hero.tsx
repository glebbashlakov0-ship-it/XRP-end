import Section from "@/components/ui/Section";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { hero } from "@/lib/landingData";
import { ArrowRight, ShieldCheck, LineChart, Wallet } from "lucide-react";

export default function Hero() {
  return (
    <Section className="pt-10 md:pt-16">
      <div className="grid gap-10 md:grid-cols-2 md:items-center">
        <div>
          <h1 className="text-4xl md:text-5xl font-semibold tracking-tight leading-[1.06]">
            {hero.h1}
          </h1>
          <p className="mt-5 text-gray-600 leading-relaxed">
            {hero.sub}
          </p>

          <div className="mt-7 flex flex-wrap gap-3">
            <a href={hero.primaryCta.href}>
              <Button>
                {hero.primaryCta.label} <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </a>
            <a href={hero.secondaryCta.href}>
              <Button variant="secondary">{hero.secondaryCta.label}</Button>
            </a>
          </div>

          <div className="mt-10 grid grid-cols-3 gap-4">
            {hero.highlights.map((h) => (
              <div key={h.label} className="rounded-2xl border border-gray-200 p-4">
                <div className="text-xs text-gray-500">{h.label}</div>
                <div className="mt-1 font-semibold">{h.value}</div>
              </div>
            ))}
          </div>
        </div>

        <Card className="md:ml-auto">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-500">XRP Restaking</div>
              <div className="mt-1 text-2xl font-semibold tracking-tight">Operational overview</div>
            </div>
            <div className="h-10 w-10 rounded-2xl border border-gray-200 flex items-center justify-center">
              <Wallet className="h-5 w-5 text-gray-700" />
            </div>
          </div>

          <div className="mt-8 grid gap-4">
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-2xl bg-gray-50 border border-gray-200 flex items-center justify-center">
                <ShieldCheck className="h-5 w-5 text-gray-800" />
              </div>
              <div>
                <div className="font-medium">Security-first participation</div>
                <div className="text-sm text-gray-600 leading-relaxed">
                  Layered controls, anomaly monitoring, and audit-friendly activity logs.
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-2xl bg-gray-50 border border-gray-200 flex items-center justify-center">
                <LineChart className="h-5 w-5 text-gray-800" />
              </div>
              <div>
                <div className="font-medium">Clean performance reporting</div>
                <div className="text-sm text-gray-600 leading-relaxed">
                  ROI snapshots, yield trends, and export-ready summaries for reconciliation.
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 rounded-2xl border border-gray-200 p-4 bg-gray-50">
            <div className="text-xs text-gray-500">Status</div>
            <div className="mt-1 font-semibold">Operational controls enabled</div>
            <div className="mt-1 text-sm text-gray-600">2FA • Policy checks • Monitoring • Logs</div>
          </div>
        </Card>
      </div>
    </Section>
  );
}

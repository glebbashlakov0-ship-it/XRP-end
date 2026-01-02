import Section from "@/components/ui/Section";
import Card from "@/components/ui/Card";
import { ArrowUpRight, CheckCircle2 } from "lucide-react";
import { security } from "@/lib/landingData";

export default function Security() {
  return (
    <Section id="security">
      <div className="grid gap-8 lg:grid-cols-[1.1fr,0.9fr] lg:items-start">
        <div className="max-w-3xl">
          <p className="text-sm uppercase tracking-[0.2em] text-indigo-600 font-semibold">{security.eyebrow}</p>
          <h2 className="mt-3 text-3xl md:text-4xl font-semibold tracking-tight">{security.title}</h2>
          <p className="mt-4 text-gray-600 leading-relaxed">{security.subtitle}</p>
        </div>

        <div className="grid gap-5">
          {security.reports.map((report) => (
            <a
              key={report.firm}
              href={report.href}
              className="group focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white rounded-2xl"
              target="_blank"
              rel="noreferrer"
            >
              <Card className="shadow-none border-gray-200 hover:border-indigo-200 hover:bg-indigo-50/60">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-lg font-semibold text-gray-900">{report.firm}</div>
                    <div className="mt-1 text-sm text-gray-500">{report.date}</div>
                    <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-700">
                      <CheckCircle2 className="h-4 w-4" />
                      {report.score}
                    </div>
                    <p className="mt-3 text-sm text-gray-600">Tap to open the latest independent assessment.</p>
                  </div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-50 text-indigo-600 transition-colors duration-150 group-hover:bg-indigo-100">
                    <ArrowUpRight className="h-5 w-5" />
                  </div>
                </div>
              </Card>
            </a>
          ))}
        </div>
      </div>
    </Section>
  );
}

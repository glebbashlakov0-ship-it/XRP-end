import Section from "@/components/ui/Section";
import Card from "@/components/ui/Card";
import { news } from "@/lib/landingData";

export default function News() {
  return (
    <Section id="news" className="bg-gray-50">
      <div className="max-w-3xl">
        <h2 className="text-3xl md:text-4xl font-semibold tracking-tight">{news.title}</h2>
        <p className="mt-3 text-gray-700 leading-relaxed">
          Curated platform updates focused on security controls, reporting, and operational improvements.
        </p>
      </div>

      <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {news.items.map((n) => (
          <Card key={n.title} className="shadow-none">
            <div className="text-xs text-gray-500">{n.date}</div>
            <div className="mt-2 text-lg font-semibold">{n.title}</div>
            <p className="mt-2 text-sm text-gray-700 leading-relaxed">{n.excerpt}</p>
            <a href={n.href} className="mt-5 inline-flex text-sm font-medium text-gray-900 underline underline-offset-4">
              Read more
            </a>
          </Card>
        ))}
      </div>
    </Section>
  );
}

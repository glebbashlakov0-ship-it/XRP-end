import Container from "@/components/ui/Container";
import Link from "next/link";

export default function SecurityPage() {
  return (
    <div className="min-h-dvh bg-white">
      <div className="border-b border-gray-200">
        <Container className="py-5 flex items-center justify-between">
          <div className="font-semibold tracking-tight">XRP Restaking</div>
          <Link className="text-sm text-gray-600 hover:text-gray-900" href="/">
            Back to landing
          </Link>
        </Container>
      </div>

      <Container className="py-12">
        <div className="max-w-3xl">
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">Security</h1>
          <p className="mt-3 text-gray-600 leading-relaxed">
            This page summarizes the platform&apos;s security posture and documentation cadence. Refer to the
            Security section on the landing page for a concise overview.
          </p>
        </div>
      </Container>
    </div>
  );
}

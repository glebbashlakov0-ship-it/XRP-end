import Container from "@/components/ui/Container";
import Divider from "@/components/ui/Divider";
import Link from "next/link";

export default function TermsPage() {
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
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">Terms of Service</h1>
          <p className="mt-3 text-gray-600 leading-relaxed">
            These Terms govern your access to and use of the XRP Restaking website and related services.
          </p>

          <Divider className="my-8" />

          <div className="prose prose-gray max-w-none">
            <h2>1. Informational nature</h2>
            <p>
              Content on this website is provided for informational purposes only and does not constitute financial, investment,
              legal, or tax advice. You are solely responsible for evaluating participation and any associated risks.
            </p>

            <h2>2. No guarantee of returns</h2>
            <p>
              Any performance metrics, APR values, ROI estimates, or yield indicators are illustrative and may change due to
              network conditions, participation parameters, and operational constraints. Past or estimated performance does not
              guarantee future results.
            </p>

            <h2>3. Risk disclosure</h2>
            <p>
              Digital assets are volatile. Participation may involve risks including loss of principal, liquidity constraints,
              network delays, and external factors. You should only participate if you understand the risks and can bear potential losses.
            </p>

            <h2>4. User responsibilities</h2>
            <p>
              You agree to maintain the confidentiality of your credentials, enable appropriate security controls where available,
              and ensure the accuracy of information you provide. You are responsible for all activity conducted under your account.
            </p>

            <h2>5. Prohibited conduct</h2>
            <p>
              You may not use the service for unlawful activities, attempts to compromise security, abusive behavior, or actions that
              interfere with platform operations.
            </p>

            <h2>6. Limitation of liability</h2>
            <p>
              To the maximum extent permitted by law, XRP Restaking and its affiliates are not liable for any indirect, incidental,
              special, consequential, or punitive damages, or any loss of profits, revenue, data, or goodwill arising from your use
              of the service.
            </p>

            <h2>7. Updates</h2>
            <p>
              We may update these Terms periodically. Continued use of the service after an update constitutes acceptance of the updated Terms.
            </p>

            <h2>8. Contact</h2>
            <p>
              For questions regarding these Terms, contact: <a href="mailto:support@xrprestaking.com">support@xrprestaking.com</a>.
            </p>
          </div>
        </div>
      </Container>
    </div>
  );
}

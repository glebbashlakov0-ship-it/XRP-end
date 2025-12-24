import Container from "@/components/ui/Container";
import Divider from "@/components/ui/Divider";
import Link from "next/link";

export default function PrivacyPage() {
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
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">Privacy Policy</h1>
          <p className="mt-3 text-gray-600 leading-relaxed">
            This Policy explains how we collect, use, and protect information when you use XRP Restaking.
          </p>

          <Divider className="my-8" />

          <div className="prose prose-gray max-w-none">
            <h2>1. Data we may collect</h2>
            <ul>
              <li>Account identifiers (e.g., email) and security settings (e.g., 2FA status).</li>
              <li>Operational metadata (e.g., timestamps, device/session signals, activity logs).</li>
              <li>Support communications you send to us.</li>
            </ul>

            <h2>2. How we use information</h2>
            <ul>
              <li>Provide access to the service and maintain account security.</li>
              <li>Monitor for anomalies, prevent abuse, and improve reliability.</li>
              <li>Respond to support requests and operational inquiries.</li>
            </ul>

            <h2>3. Data minimization</h2>
            <p>
              We aim to collect only what is necessary for service operation, security monitoring, and support. We do not request secret phrases.
            </p>

            <h2>4. Retention</h2>
            <p>
              We retain data for as long as needed to provide the service, comply with legal obligations, and support security and audit requirements.
            </p>

            <h2>5. Security</h2>
            <p>
              We use layered technical and organizational measures designed to protect user information, including access controls,
              monitoring, and documented operational procedures.
            </p>

            <h2>6. Contact</h2>
            <p>
              For privacy questions, contact: <a href="mailto:support@xrprestaking.com">support@xrprestaking.com</a>.
            </p>
          </div>
        </div>
      </Container>
    </div>
  );
}

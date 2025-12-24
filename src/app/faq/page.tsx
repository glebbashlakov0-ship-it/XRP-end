import Container from "@/components/ui/Container";
import Card from "@/components/ui/Card";
import Accordion from "@/components/ui/Accordion";
import Divider from "@/components/ui/Divider";
import Link from "next/link";

const faqs = [
  {
    q: "What is XRP staking (restaking) on this platform?",
    a: "XRP Restaking provides a structured participation flow that allows you to allocate XRP under clear terms and view performance metrics in a dashboard. Participation is governed by explicit parameters (amount, duration, and disclosed fees). Performance metrics are provided for transparency and are not a guarantee of future returns."
  },
  {
    q: "How do I start staking XRP?",
    a: "Create an account, secure it with strong authentication, and follow the dashboard flow to set your participation amount and duration. The platform will guide you through confirmation steps and show a status lifecycle so each operation is visible from initiation to completion."
  },
  {
    q: "What security measures protect my funds?",
    a: "Security is implemented through layered controls: account protection (2FA and session safeguards), policy checks for sensitive actions, operational monitoring for anomalies, and activity logs for traceability. The platform is designed so you retain clarity about what actions are being taken and when."
  },
  {
    q: "How can I track my rewards and results?",
    a: "The dashboard provides ROI snapshots, yield trends, and position summaries. You can view period-based estimates, review activity logs, and use reporting outputs designed for reconciliation and internal record-keeping."
  },
  {
    q: "What fees apply?",
    a: "Fees are disclosed in the participation flow and reflected in ROI estimates. The platform fee is applied according to the stated terms and is included in net ROI calculations shown in the calculator and dashboard reporting."
  },
  {
    q: "Can I cancel and withdraw my XRP?",
    a: "Withdrawal follows a defined flow. Once you request withdrawal, the request proceeds through clear statuses. Funds are returned to your wallet according to the participation terms you selected and network conditions at execution time."
  },
  {
    q: "Is my XRP custody transferred to the platform?",
    a: "Participation flows are designed to keep actions explicit and traceable. You should always review the transaction details you approve. XRP Restaking will never request your secret phrase."
  },
  {
    q: "Where can I get additional support?",
    a: "You can contact support via email at support@xrprestaking.com and join the community channel on Telegram. For security matters, include relevant timestamps and transaction identifiers where applicable."
  }
];

export default function FAQPage() {
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
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">FAQ</h1>
          <p className="mt-3 text-gray-600 leading-relaxed">
            Answers to the most common questions about participation, security controls, reporting, and withdrawals.
          </p>

          <Divider className="my-8" />

          <Card>
            <Accordion items={faqs} defaultOpenIndex={0} />
          </Card>
        </div>
      </Container>
    </div>
  );
}

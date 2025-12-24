export type NavItem = { label: string; href: string; type: "anchor" | "route" };

export const nav: NavItem[] = [
  { label: "How It Works", href: "#how-it-works", type: "anchor" },
  { label: "Key Features", href: "#features", type: "anchor" },
  { label: "Trusted By", href: "#trusted", type: "anchor" },
  { label: "Security", href: "#security", type: "anchor" },
  { label: "News", href: "#news", type: "anchor" },
  { label: "FAQ", href: "/faq", type: "route" }
];

export const hero = {
  h1: "Institutional-grade XRP restaking, built for clarity and control.",
  sub:
    "Stake with operational discipline: transparent parameters, real-time reporting, and security-first account protection. XRP Restaking is designed to make participation understandable, verifiable, and scalable.",
  primaryCta: { label: "Start staking now", href: "/dashboard" },
  secondaryCta: { label: "View how it works", href: "#how-it-works" },
  highlights: [
    { label: "Reporting", value: "Portfolio-ready" },
    { label: "Controls", value: "Policy-driven" },
    { label: "Operations", value: "Fast & predictable" }
  ]
};

export const howItWorks = {
  title: "How It Works",
  intro:
    "A straightforward workflow designed around operational safety, measurable performance, and transparent participation.",
  steps: [
    {
      title: "Connect and verify",
      text:
        "Create an account, enable security controls, and verify ownership of your XRP wallet to establish a trusted operating profile."
    },
    {
      title: "Configure participation",
      text:
        "Select your staking amount and preferred duration. Parameters are explicit and enforced to keep participation predictable."
    },
    {
      title: "Execute and monitor",
      text:
        "Initiate staking and follow progress in real time. Your dashboard provides performance snapshots, ROI metrics, and activity logs."
    },
    {
      title: "Withdraw with clear rules",
      text:
        "End participation through a defined withdrawal flow. Funds return to your wallet according to the selected terms and network conditions."
    }
  ]
};

export const protocolArchitecture = {
  title: "Protocol Architecture",
  subtitle:
    "A security-forward design that separates authorization, execution, and reporting. Every critical action is policy-checked and logged.",
  blocks: [
    {
      title: "Policy layer",
      bullets: [
        "Participation parameters and limits are enforced at the policy layer.",
        "Risk controls (limits, throttling, confirmation rules) can be applied per account.",
        "Every sensitive action requires explicit authorization and produces an audit trail."
      ]
    },
    {
      title: "Execution layer",
      bullets: [
        "Transactions follow deterministic flows to reduce operational ambiguity.",
        "Withdrawal requests are processed through a defined lifecycle with status visibility.",
        "Operations are monitored continuously for anomalies and rate deviations."
      ]
    },
    {
      title: "Reporting layer",
      bullets: [
        "Real-time metrics: ROI snapshots, yield trends, and position summaries.",
        "Export-ready reporting formats for portfolio reconciliation workflows.",
        "Activity logs provide traceability for security and compliance review."
      ]
    }
  ],
  note:
    "XRP Restaking is designed to prioritize clarity and operational integrity. Performance metrics are presented transparently and are not a guarantee of future results."
};

export const roi = {
  title: "ROI Calculator & Metrics",
  calculatorTitle: "Live ROI Calculator",
  tokenLabel: "Select Token",
  defaultToken: "XRP - XRP Ledger",
  amountLabel: "Investment Amount",
  periodLabel: "Staking Period",
  aprLabel: "Estimated APR",
  feeLabel: "Platform Fee",
  disclaimer:
    "Estimates are informational only and may change based on network conditions, participation parameters, and operational constraints.",
  analyticsTitle: "Protocol Analytics",
  analyticsBadge: "Live Data",
  analytics: [
    { label: "Total Value Secured", value: "$412.6M" },
    { label: "Active Validators", value: "1,093" },
    { label: "Network Uptime", value: "99.96%", note: "30-day avg" },
    { label: "Avg. Ledger Close Time", value: "3.7s", note: "-0.1s (24h)" }
  ],
  riskBadges: [
    { title: "Low Risk", text: "Policy checks and anomaly monitoring." },
    { title: "High Liquidity", text: "Defined withdrawal flows and status tracking." },
    { title: "Auditable", text: "Action logs designed for review and reporting." }
  ]
};

export const quote = {
  text:
    "In a market where participants demand transparency, the strongest platforms are the ones that make operations measurable. Policy-driven controls, clear participation parameters, and verifiable reporting are no longer optional - they are the baseline for trust.",
  name: "Alex Rivera",
  role: "Digital Asset Research",
  initials: "AR",
  instagramUrl: "https://www.instagram.com/"
};

export const features = {
  title: "Key Features",
  subtitle:
    "A platform experience designed for participants who value clarity, speed, and institutional-grade reporting.",
  items: [
    {
      title: "Daily yield tracking",
      text:
        "Monitor estimated daily performance with clean breakdowns, trend views, and period-based ROI snapshots."
    },
    {
      title: "Transparent parameters",
      text:
        "Clear terms for participation: duration, estimated APR inputs, and fee disclosure are presented upfront."
    },
    {
      title: "Dashboard analytics",
      text:
        "Portfolio-ready dashboards with position summaries, activity logs, and export-friendly metrics."
    },
    {
      title: "Flexible participation",
      text:
        "Choose an amount and duration that match your risk profile, with policy-driven limits and confirmations."
    },
    {
      title: "Fast operations",
      text:
        "Streamlined workflows for initiation and withdrawal, with real-time status updates for every step."
    },
    {
      title: "Notifications & support",
      text:
        "Operational notifications for key events and a support channel for assistance when you need it."
    }
  ]
};

export const trusted = {
  title: "Trusted By",
  subtitle:
    "Built to fit within professional workflows. Designed around predictable operations and security-first account protection.",
  partners: [
    "Fireblocks",
    "Ledger",
    "BitGo",
    "Chainalysis",
    "Coinbase Cloud",
    "AWS"
  ],
  metrics: [
    { label: "Integrations", value: "18+" },
    { label: "Active participants", value: "62,000+" },
    { label: "Operations processed", value: "4.8M+" },
    { label: "Regions supported", value: "40+" }
  ],
  assurance: {
    title: "Security-first posture",
    text:
      "Security is a priority across account protection, operational safeguards, and transparent reporting. Controls are designed to be reviewed and validated through documented procedures and continuous monitoring."
  }
};

export const security = {
  title: "Security",
  subtitle:
    "A layered approach that prioritizes access control, operational integrity, and transparent traceability.",
  cards: [
    {
      title: "2FA & account protection",
      text:
        "Multi-factor authentication, session safeguards, and device-aware controls reduce unauthorized access risk."
    },
    {
      title: "Transaction controls",
      text:
        "Policy checks, confirmations, and rate limits help keep operations predictable and reduce error surfaces."
    },
    {
      title: "Continuous monitoring",
      text:
        "Operational monitoring detects anomalies and flags irregular patterns for review and response workflows."
    },
    {
      title: "Process transparency",
      text:
        "Activity logs and audit-friendly reporting support traceability, reconciliation, and security review."
    }
  ],
  docs: {
    title: "Assurance documentation",
    rows: [
      { name: "Security Controls Overview", scope: "Access, monitoring, operational safeguards", cadence: "Quarterly" },
      { name: "Key Management Policy", scope: "Authorization and control processes", cadence: "Quarterly" },
      { name: "Incident Response Framework", scope: "Detection, escalation, and recovery", cadence: "Semi-annual" },
      { name: "Data Handling & Privacy Summary", scope: "Data minimization and retention", cadence: "Quarterly" }
    ]
  }
};

export const news = {
  title: "News",
  items: [
    {
      date: "Dec 2025",
      title: "Risk controls expanded for participation policies",
      excerpt:
        "New policy checks add clearer limits, confirmation prompts, and audit-log granularity for sensitive actions.",
      href: "/faq"
    },
    {
      date: "Dec 2025",
      title: "Reporting updates: ROI snapshots and export-ready summaries",
      excerpt:
        "Dashboard reporting now includes period-based ROI snapshots designed for portfolio reconciliation workflows.",
      href: "/faq"
    },
    {
      date: "Nov 2025",
      title: "Monitoring improvements for anomaly detection",
      excerpt:
        "Operational monitoring has been tuned for faster detection of irregular patterns and status deviations.",
      href: "/faq"
    },
    {
      date: "Nov 2025",
      title: "Security posture refresh: documentation cadence clarified",
      excerpt:
        "Security documentation cadence has been standardized to support consistent internal review and transparency.",
      href: "/security"
    },
    {
      date: "Oct 2025",
      title: "Participation UX refinements for clarity and speed",
      excerpt:
        "Workflow updates improve parameter visibility, reduce friction, and keep actions explicit from start to finish.",
      href: "/faq"
    }
  ]
};

export const finalCta = {
  title: "Start with clarity. Stake with control.",
  text:
    "Access a security-first XRP restaking experience with transparent participation parameters and portfolio-grade reporting.",
  primary: { label: "Go to dashboard", href: "/dashboard" },
  secondary: { label: "Read the FAQ", href: "/faq" }
};

export const footer = {
  about:
    "XRP Restaking provides a structured restaking experience designed around transparent parameters, operational safeguards, and clear performance reporting.",
  facts: [
    { label: "Focus", value: "Security-first operations" },
    { label: "Reporting", value: "Real-time metrics & logs" },
    { label: "Design", value: "Clean, fin-tech UI" }
  ],
  links: {
    Platform: [
      { label: "Dashboard", href: "/dashboard" },
      { label: "Security", href: "#security" },
      { label: "News", href: "#news" }
    ],
    Resources: [
      { label: "FAQ", href: "/faq" },
      { label: "Terms", href: "/terms" },
      { label: "Privacy", href: "/privacy" }
    ],
    Contact: [
      { label: "Email: support@xrprestaking.com", href: "mailto:support@xrprestaking.com" },
      { label: "Telegram Community", href: "https://t.me/" },
      { label: "X (Twitter)", href: "https://x.com/" }
    ]
  },
  copyright:
    `© ${new Date().getFullYear()} XRP Restaking. All rights reserved.`
};

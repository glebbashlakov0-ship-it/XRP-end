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

export const restakingSpotlight = {
  tag: "Protocol-level XRP restaking",
  headline: "Protocol-level restaking. Endorsed by transparent XRP vision.",
  description:
    "Watch how XRP Restaking combines audited execution, policy-driven controls, and transparent governance to unlock disciplined yield for participants.",
  video: {
    title: "XRP Restaking deep dive",
    caption: "Brad Garlinghouse on why audited restaking and risk policies keep XRP participation durable.",
    src: "/video/video1.mp4",
    poster: "/video/previuw.png",
    badges: ["Audited", "Secure", "Policy-driven"]
  },
  quote: {
    text:
      "With XRP restaking moving into an institutional phase, structured delegation and automated policy checks redefine how we access sustainable yield. Consistent returns are possible when security reviews, anomaly detection, and validator curation operate together.",
    author: "Brad Garlinghouse",
    role: "CEO at Ripple",
    instagram: "https://www.instagram.com/bradgarlinghouse/"
  }
};

export const howItWorks = {
  title: "How It Works",
  intro:
    "A straightforward workflow designed around operational safety, measurable performance, and transparent participation.",
  steps: [
    {
      title: "Connect and verify",
      icon: "/how-it-works/connect.png",
      text:
        "Create an account, enable security controls, and verify ownership of your XRP wallet to establish a trusted operating profile."
    },
    {
      title: "Configure participation",
      icon: "/how-it-works/configure.png",
      text:
        "Select your staking amount and preferred duration. Parameters are explicit and enforced to keep participation predictable."
    },
    {
      title: "Execute and monitor",
      icon: "/how-it-works/monitor.png",
      text:
        "Initiate staking and follow progress in real time. Your dashboard provides performance snapshots, ROI metrics, and activity logs."
    },
    {
      title: "Withdraw with clear rules",
      icon: "/how-it-works/withdraw.png",
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
  defaultToken: "XRP",
  tokens: [
    { label: "XRP", symbol: "XRP" },
    { label: "USDT", symbol: "USDT" },
    { label: "USDC", symbol: "USDC" }
  ],
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

export const testimonials = {
  title: "Participant Reviews",
  subtitle:
    "Feedback from teams using XRP Restaking for transparent reporting and operational control.",
  items: [
    {
      name: " Ryan Mitchell",
      role: "Logistics Manager",
      text:
        "There were some minor withdrawal delays yesterday due to a node update. I was getting worried, but support explained everything in the chat. Everything is working today, and my withdrawal went through instantly. Technical issues happen—it even shows that the project is alive and developing. Good luck with your investments to everyone!",
      avatar: "/testimonials/ryan-mitchell.png",
      initials: "RM",
      rating: "5/5"
    },
    {
      name: " James Wilson",
      role: "Retired School Teacher",
      text:
        "I had never dealt with crypto before; it all seemed too complicated. But here, I just deposited my XRP, and the earnings grow by themselves. I bought my grandson a new phone with the first profit—very pleased. Everything is fair and clear, even for a retiree like me!",
      avatar: "/testimonials/james-wilson.jpg",
      initials: "JW",
      rating: "5/5"
    },
    {
      name: "Kevin Harper",
      role: "Freelance Graphic Designer",
      text:
        "I've been using the service for three months. I've tried other platforms—this one has the highest and most reliable returns. I've moved all my XRP here and recommend it to all my friends.",
      avatar: "/testimonials/kevin-harper.png",
      initials: "KH",
      rating: "5/5"
    },
    {
      name: "Amanda Carter",
      role: "Part-time Bookkeeper",
      text:
        "I was looking for a way to earn some extra money while on maternity leave, to feel more independent. A friend recommended this protocol. I was scared at first, but I started with 500 XRP. Now I see a small plus every day—like a steady little gift for me and my child. I'm so grateful to the creators for this opportunity!",
      avatar: "/testimonials/amanda-carter.png",
      initials: "AC",
      rating: "5/5"
    },
    {
      name: "Brian Foster",
      role: "IT Security Consultant",
      text:
        "As a cybersecurity specialist, I've examined the protocol's architecture. Its unique distributed key control system eliminates the risk of hacking. Their smart contract uses Chainlink oracles, which ensures fair reward distribution. This is one of the few projects where I feel completely secure storing my funds.",
      avatar: "/testimonials/brian-foster.png",
      initials: "BF",
      rating: "5/5"
    },
    {
      name: "Robert Davis",
      role: "Real Estate Agent",
      text:
        "Just logged into the dashboard—TVL has increased by 40% in the last 24 hours. It looks like the big players have figured it out and are moving in. According to the roadmap, the APR for new users will be halved next week. I've just topped up my stake with another 20k XRP while the returns are still this attractive. A gentle nudge for those who are still deciding.",
      avatar: "/testimonials/robert-davis.jpg",
      initials: "RD",
      rating: "5/5"
    }
  ]
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
    { name: "Ledger", logo: "/partners/leger.png" },
    { name: "Trust Wallet", logo: "/partners/trustwallet.jpg" },
    { name: "Ripple", logo: "/partners/ripple.png" },
    { name: "MetaMask", logo: "/partners/metamusk.png" }
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
  eyebrow: "Secure and trusted.",
  title: "Security is top priority",
  subtitle:
    "Security is a core development effort of XRP Restaking: we combine audited execution, policy-driven controls, and continuous monitoring to keep the infrastructure resilient. Here are our audit reports:",
  reports: [
    {
      firm: "OtterSec",
      date: "November, 2024",
      score: "96/100 Rating",
      href: "/reports/ottersec.pdf"
    },
    {
      firm: "Halborn",
      date: "December, 2024",
      score: "99/100 Rating",
      href: "/reports/halborn.pdf"
    }
  ]
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
  video: {
    title: "How to Start",
    subtitle: "Short walkthrough from signup to first stake.",
    src: "/video/video1.mp4",
    poster: "/video/previuw.png"
  },
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
      { label: "Email: support@xrprestaking.com", href: "mailto:support@xrprestaking.com" }
    ]
  },
  copyright:
    `© ${new Date().getFullYear()} XRP Restaking. All rights reserved.`
};

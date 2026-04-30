import type { ExploreArchitectureContent } from "@/lib/explore-architecture.shared";
import { defaultExploreArchitectureContent } from "@/lib/explore-architecture.shared";

export type { ExploreArchitectureContent } from "@/lib/explore-architecture.shared";
export { defaultExploreArchitectureContent } from "@/lib/explore-architecture.shared";

export type SystemsCard = {
  title: string;
  description: string;
  tag: string;
  /** Public path (e.g. /uploads/systems/...) or https URL; empty = no image */
  imageSrc: string;
};

export type ServiceCard = {
  title: string;
  description: string;
  /** Longer copy for the Learn more dialog; use blank lines between paragraphs. */
  learnMore: string;
};

export type ProductCard = {
  title: string;
  description: string;
  label: string;
  /** Thumbnail: /public path or https; empty = gradient placeholder */
  imageSrc: string;
  /** Destination: /path, #anchor, or https */
  href: string;
  /** CTA text (e.g. Visit site, Get access) */
  linkLabel: string;
  /** Spotlight card — e.g. Mr.Software flagship (single featured row) */
  featured: boolean;
  /** Longer copy for Learn more dialog; blank lines between paragraphs */
  learnMore: string;
};

export type CaseStudyCard = {
  title: string;
  category: string;
  problem: string;
  solution: string;
  result: string;
  stat: string;
  statLabel: string;
};

/** Thought leadership / publications (Authority & Insights section). */
export type PublicationCard = {
  title: string;
  category: string;
  /** Visible date line, e.g. "April 15, 2026" */
  dateLabel: string;
  /** e.g. "5 min read" */
  readTime: string;
  /** Cover; empty = text-only card */
  imageSrc: string;
  /** Full article for the read popup; blank lines separate paragraphs */
  articleBody: string;
  /** Optional external/original URL (shown in popup only) */
  href: string;
};

export type TestimonialCard = {
  quote: string;
  author: string;
  role: string;
  /** 1–5; optional for legacy CMS entries */
  rating?: number;
};

export type ProcessStep = {
  text: string;
};

export type FaqItem = {
  question: string;
  answer: string;
};

export type SocialLink = {
  label: string;
  url: string;
  icon: "whatsapp" | "email" | "linkedin" | "instagram" | "youtube" | "github" | "website";
  enabled: boolean;
};

/** Paths under /public (e.g. /images/hero/x.svg) or https URLs. */
export type HeroCarouselSlide = {
  id: string;
  src: string;
  alt: string;
};

/** Trusted-by marquee: show `imageSrc` when set; `name` is alt text and text fallback. */
export type TrustLogoItem = {
  name: string;
  /** Logo file: /uploads/trust/... or https URL */
  imageSrc: string;
};

export type SiteContent = {
  /** Explore Architecture (systems CTA) modal copy & per-track flows */
  exploreArchitecture: ExploreArchitectureContent;
  /** Navbar, footer, and login — `/images/...`, `/uploads/...`, or https URL */
  siteLogoSrc: string;
  heroHeadline: string;
  heroHighlight: string;
  heroTail: string;
  heroBadge: string;
  heroCarouselSlides: HeroCarouselSlide[];
  systemsSectionTag: string;
  systemsSectionTitle: string;
  systemsSectionDescription: string;
  systemsExploreCtaLabel: string;
  systemsCards: SystemsCard[];
  servicesSectionTag: string;
  servicesSectionTitle: string;
  servicesCards: ServiceCard[];
  productsSectionTag: string;
  productsSectionTitle: string;
  /** Optional intro under the products heading */
  productsSectionDescription: string;
  /** Uppercase CTA (e.g. EXPLORE ALL PRODUCTS) — opens the full product catalog modal */
  productsCatalogCtaLabel: string;
  productsCards: ProductCard[];
  caseStudiesSectionTag: string;
  caseStudiesSectionTitle: string;
  caseStudiesSectionDescription: string;
  caseStudiesSectionCtaLabel: string;
  caseStudiesCards: CaseStudyCard[];
  publicationsSectionTag: string;
  publicationsSectionTitle: string;
  publicationsSectionDescription: string;
  /** Uppercase CTA — opens full publications list when there are more than three */
  publicationsCatalogCtaLabel: string;
  publicationsCards: PublicationCard[];
  trustSectionTag: string;
  trustSectionTitle: string;
  /** Partner logos for the marquee. `name` is used for alt text and as fallback if `imageSrc` is empty. */
  trustLogoItems: TrustLogoItem[];
  trustTestimonials: TestimonialCard[];
  processFaqSectionTag: string;
  processFaqSectionTitle: string;
  processFaqSectionDescription: string;
  /** Small caps label above the process checklist card */
  processFaqProcessCardLabel: string;
  /** Small caps label above the FAQ accordion card */
  processFaqFaqCardLabel: string;
  processSteps: ProcessStep[];
  faqItems: FaqItem[];
  /** Homepage #contact intro (tag, headline, subtext) */
  contactSectionTag: string;
  contactSectionTitle: string;
  contactSectionDescription: string;
  contactEmail: string;
  /** Shown in Contact section and footer; use display format (spaces ok). */
  contactPhone: string;
  /** Visible label for the WhatsApp row (link uses `whatsappNumber`). */
  contactWhatsappLabel: string;
  contactNamePlaceholder: string;
  contactEmailPlaceholder: string;
  contactCompanyPlaceholder: string;
  /** Placeholder for visitor phone on the contact form */
  contactLeadPhonePlaceholder: string;
  contactMessagePlaceholder: string;
  /** Primary form button label (idle state). */
  contactSubmitLabel: string;
  /** Small note under the submit button. */
  contactReplyNote: string;
  /**
   * Shown on the public login page “Forgot password” dialog — recovery instructions, internal contacts,
   * or what visitors should do when self‑serve reset is unavailable.
   */
  loginPasswordResetHelp: string;
  socialLinks: SocialLink[];
  aiName: string;
  whatsappNumber: string;
};

export const defaultSiteContent: SiteContent = {
  exploreArchitecture: defaultExploreArchitectureContent,
  siteLogoSrc: "/images/navbar/hero image.svg",
  /** Filled from CMS / admin; kept empty so shipped defaults never override site copy. */
  heroHeadline: "",
  heroHighlight: "",
  heroTail: "",
  heroBadge: "",
  heroCarouselSlides: [
    {
      id: "hero-slide-brand",
      src: "/images/hero/hero image.svg",
      alt: "Yafetpromedia — digital systems and infrastructure",
    },
    {
      id: "hero-slide-partnership",
      src: "/images/contact-illustration.webp",
      alt: "Partnership, delivery, and engineering illustration",
    },
    {
      id: "hero-slide-mark",
      src: "/images/navbar/hero image.svg",
      alt: "Yafetpromedia brand mark",
    },
  ],
  systemsSectionTag: "Ecosystem Architecture",
  systemsSectionTitle: "Integrated infrastructure for modern scale.",
  systemsSectionDescription:
    "We do not only ship code—we deliver full digital solutions: brand systems, post-production, content, and the infrastructure and workflows that run them together.",
  systemsExploreCtaLabel: "Explore Architecture",
  systemsCards: [
    {
      title: "Core Infrastructure",
      description:
        "We design and ship the full stack that sits under your digital presence: data models, services, APIs, and integrations with the tools you already use, plus deployment, backups, and guardrails for security and performance as traffic grows. Alongside that engineering work, we support the rest of the program—visual identity, brand systems, post-production, editing, and content workflows—so delivery does not live in a separate silo from the systems that run it. The outcome is one coherent program: clear ownership, fewer handoffs, and infrastructure you can build on for years, not a one-off handover.",
      tag: "SYS_ARCH",
      imageSrc: "",
    },
    {
      title: "Brand Ecosystems",
      description: "System-based branding that scales infinitely across all platforms.",
      tag: "BRAND_OS",
      imageSrc: "",
    },
    {
      title: "Media Pipelines",
      description: "Automated production pipelines for high-volume content.",
      tag: "MEDIA_NET",
      imageSrc: "",
    },
    {
      title: "Growth Engines",
      description: "Data-driven marketing automation built for extreme scalability.",
      tag: "GROWTH_LOGIC",
      imageSrc: "",
    },
  ],
  servicesSectionTag: "What We Do",
  servicesSectionTitle: "Modern digital systems for real business growth.",
  servicesCards: [
    {
      title: "Website & Product Design",
      description:
        "Conversion-focused websites and interfaces designed to reflect your brand and move visitors to action.",
      learnMore:
        "We treat your site and product UI as part of a larger system: messaging, visual identity, content, and measurable outcomes. Discovery covers your goals, audiences, and constraints so the design matches how you really work.\n\nDeliverables typically include responsive layouts, design systems or style tokens, and handoff-ready specs. We prioritise clarity, speed, and accessibility so every page supports trust and conversion—not just aesthetics.\n\nEngagements can range from a focused landing or marketing site to multi-section products; we align scope, timeline, and success metrics with you up front.",
    },
    {
      title: "Automation & Workflows",
      description:
        "Smart internal systems that automate repetitive operations and keep teams aligned in real time.",
      learnMore:
        "Automation should remove busywork without hiding how work gets done. We map handoffs, approvals, and data touchpoints, then recommend tools and custom glue (integrations, scripts, dashboards) that match your stack and team skills.\n\nCommon patterns include syncing CRMs and forms, scheduling and notifications, internal request queues, and lightweight reporting. Everything is documented so you can operate and extend it over time.\n\nWe stay pragmatic: start with the highest-impact loops, measure results, then iterate—so you see value before expanding scope.",
    },
    {
      title: "Growth Strategy",
      description:
        "Data-backed campaigns, content systems, and funnels built to scale customer acquisition reliably.",
      learnMore:
        "Growth work ties creative, channel, and analytics into one plan. We clarify positioning and funnels, define core metrics, and set up tracking so decisions are based on evidence—not guesswork.\n\nThat can include content calendars, email or social sequences, paid experiments, and landing paths tuned for your market. Content and creative stay consistent with your brand while we test messages and offers in a controlled way.\n\nReporting is honest: we review what moved the numbers, what to double down on, and what to stop—so your spend and effort compound in the right direction.",
    },
    {
      title: "Security & Reliability",
      description:
        "Stable, secure delivery standards with monitoring and performance practices for business-critical systems.",
      learnMore:
        "Security and uptime are part of delivery, not an add-on. We apply sensible baselines: HTTPS, least-privilege access, secrets handling, dependency awareness, and backups or recovery options suited to your risk profile.\n\nFor applications and sites, we care about performance budgets, error visibility, and alert paths so issues surface before customers feel them. Where needed, we coordinate reviews, checklists, and light documentation for your team or auditors.\n\nThe goal is predictable operations: less firefighting, faster recovery, and clear ownership when something needs attention.",
    },
  ],
  productsSectionTag: "Flagship Systems",
  productsSectionTitle: "Software products that power serious operations.",
  productsSectionDescription:
    "From our signature Mr.Software platform to supporting tools for analytics, security, and automation—built for teams that outgrow spreadsheets.",
  productsCatalogCtaLabel: "EXPLORE ALL PRODUCTS",
  productsCards: [
    {
      title: "Mr.Software",
      description:
        "Our flagship: a centralized operating system for your business—dashboards, workflows, and team alignment in one place. Built to scale from growing teams to multi-site orgs, with a focus on clarity, speed, and day-to-day usability.",
      label: "FLAGSHIP",
      imageSrc: "/images/contact-illustration.webp",
      href: "#contact",
      linkLabel: "Request a walkthrough",
      featured: true,
      learnMore:
        "Mr.Software is built for leaders who need one honest picture of operations—not another siloed tool. Dashboards surface the metrics and tasks that matter by role, with permissions that match how your org actually works.\n\nWorkflows connect handoffs, approvals, and notifications so teams spend less time chasing status and more time delivering. We prioritize fast load times, readable layouts, and predictable behavior on mobile and desktop.\n\nImplementation is collaborative: we align on your processes first, then configure Mr.Software to match—so adoption feels natural, not forced. Ask for a walkthrough to see how it could map to your teams.",
    },
    {
      title: "Performance Monitor",
      description: "Live analytics for uptime, speed, and performance with smart alerting.",
      label: "ANALYTICS",
      imageSrc: "",
      href: "#contact",
      linkLabel: "Learn more",
      featured: false,
      learnMore:
        "Performance Monitor gives you live visibility into uptime, latency, and error patterns—so you can spot regressions before customers do. Thresholds and alert channels are tuned to your stack and on-call habits.\n\nDashboards stay uncluttered: trend lines, simple comparisons, and drill-down when you need detail. We help map the right signals to the right owners.\n\nWhether you run a marketing site or internal services, the goal is calmer operations: fewer surprises, faster root-cause conversations.",
    },
    {
      title: "Secure Vault",
      description: "Role-based secure document and data vault for sensitive information.",
      label: "SECURITY",
      imageSrc: "",
      href: "#contact",
      linkLabel: "Learn more",
      featured: false,
      learnMore:
        "Secure Vault is designed for documents and records that should not live in random shared drives. Role-based access, audit-friendly activity, and encryption at rest align with how security and compliance teams expect to work.\n\nYou define who sees what, with groups and expirations where needed. Uploads and previews are handled with performance in mind—no painful lag on day-to-day use.\n\nIt pairs well with wider identity and backup practices; we can outline a realistic rollout for your risk profile.",
    },
    {
      title: "Automation Engine",
      description: "No-code automation flows to reduce manual operations across departments.",
      label: "AUTOMATION",
      imageSrc: "",
      href: "#contact",
      linkLabel: "Learn more",
      featured: false,
      learnMore:
        "Automation Engine turns repetitive steps into reliable flows: form intake, routing, reminders, and handoffs between tools. You stay in control with a clear visual map of each automation and who it affects.\n\nWe start with the highest-friction loops—where copy-paste and email chains slow people down—then measure time saved and iterate.\n\nIntegrations are pragmatic: connect the services you already use, with guardrails so changes are reviewable before they go live.",
    },
  ],
  caseStudiesSectionTag: "Proven Architecture",
  caseStudiesSectionTitle: "Systems that deliver measurable scale.",
  caseStudiesSectionDescription:
    "Explore how our digital ecosystems have transformed enterprise workflows and driven verifiable growth.",
  caseStudiesSectionCtaLabel: "View All Cases",
  caseStudiesCards: [
    {
      title: "National Education System",
      category: "Infrastructure",
      problem: "Fragmented student data and manual administrative processes leading to high error rates.",
      solution: "Implementation of a centralized digital infrastructure with real-time sync across 50+ institutions.",
      result: "40% reduction in admin overhead and 100% data integrity achievement.",
      stat: "50+",
      statLabel: "Institutions",
    },
    {
      title: "Global Logistics Brand",
      category: "Identity & Media",
      problem: "Inconsistent brand representation across 12 countries affecting market authority.",
      solution: "A unified brand identity system and media production pipeline for global marketing.",
      result: "25% increase in brand recognition and centralized asset management.",
      stat: "+25%",
      statLabel: "Growth",
    },
  ],
  publicationsSectionTag: "Thought Leadership",
  publicationsSectionTitle: "Authority & Insights.",
  publicationsSectionDescription:
    "Strategic thinking on digital infrastructure and system-level innovation from our engineering and design teams.",
  publicationsCatalogCtaLabel: "VIEW ALL PUBLICATIONS",
  publicationsCards: [
    {
      title: "Why Infrastructure Matters More Than UI in 2026",
      category: "Architecture",
      dateLabel: "April 15, 2026",
      readTime: "5 min read",
      imageSrc: "",
      articleBody:
        "Pretty interfaces get attention, but infrastructure decides whether your product survives real traffic, real teams, and real compliance pressure.\n\nWe see teams outgrow dashboards that were never tied to a clear data model or permission model. The cost shows up as duplicated work, slow releases, and surprises in production.\n\nInvesting early in architecture—boundaries, observability, and sane workflows—means UI changes stay cheap and safe instead of becoming full rewrites.",
      href: "",
    },
    {
      title: "Building Scalable Digital Identities for Global Brands",
      category: "Branding",
      dateLabel: "April 10, 2026",
      readTime: "4 min read",
      imageSrc: "",
      articleBody:
        "A global brand is not one logo file; it is a system of rules, templates, and approvals that teams can use without bottlenecks.\n\nScalable identity work connects strategy to production: naming, typography, color, motion, and partner-ready assets. The goal is consistency where it matters and flexibility where markets differ.\n\nWhen identity is treated as infrastructure, campaigns move faster and every touchpoint reinforces the same authority.",
      href: "",
    },
    {
      title: "The Future of Integrated Institutional Management",
      category: "Automation",
      dateLabel: "April 02, 2026",
      readTime: "8 min read",
      imageSrc: "",
      articleBody:
        "Institutions do not fail from lack of tools—they fail from fragmented workflows and unclear ownership.\n\nIntegrated management means one accountable map of how work enters, gets approved, and lands in the record systems people trust.\n\nAutomation is the layer that removes pointless handoffs, not the layer that hides how decisions are made. The future belongs to teams that can see both the workflow and the outcome in the same place.",
      href: "",
    },
  ],
  trustSectionTag: "Institutional Trust",
  trustSectionTitle: "Trusted by leading institutions.",
  trustLogoItems: [
    {
      name: "National Tech Institute",
      imageSrc: "/images/trust/partner-placeholder.svg",
    },
    {
      name: "Global Logistics Systems",
      imageSrc: "/images/trust/partner-placeholder.svg",
    },
    {
      name: "Apex Financial Group",
      imageSrc: "/images/trust/partner-placeholder.svg",
    },
    {
      name: "Metro Health Network",
      imageSrc: "/images/trust/partner-placeholder.svg",
    },
    {
      name: "Atlas Education Council",
      imageSrc: "/images/trust/partner-placeholder.svg",
    },
    {
      name: "Prime Industry Labs",
      imageSrc: "/images/trust/partner-placeholder.svg",
    },
  ],
  trustTestimonials: [],
  processFaqSectionTag: "Launch Framework",
  processFaqSectionTitle: "A clear process and transparent answers.",
  processFaqSectionDescription:
    "From first discovery to post-launch optimization, we move with structure and speed.",
  processFaqProcessCardLabel: "Process",
  processFaqFaqCardLabel: "FAQ",
  processSteps: [
    { text: "Discovery call and business goals mapping" },
    { text: "UX, brand direction, and system architecture" },
    { text: "Rapid implementation with weekly checkpoints" },
    { text: "Launch, analytics setup, and optimization cycle" },
  ],
  faqItems: [
    {
      question: "How long does a typical project take?",
      answer: "Most projects launch in 3-8 weeks depending on scope, integrations, and required content.",
    },
    {
      question: "Can you redesign our current website?",
      answer: "Yes. We can modernize your existing site, preserve SEO value, and improve speed and conversion.",
    },
    {
      question: "Do you provide ongoing support after launch?",
      answer: "Yes. We offer monthly support for updates, analytics reviews, and growth-focused improvements.",
    },
  ],
  contactSectionTag: "Contact",
  contactSectionTitle: "Let's build your next growth engine.",
  contactSectionDescription:
    "Tell us what you are building, your timeline, and where you need support. We will come back with a clear plan and next steps.",
  contactEmail: "hello@yafetpromedia.com",
  contactPhone: "+251 991 185 321",
  contactWhatsappLabel: "WhatsApp Chat",
  contactNamePlaceholder: "Your Name",
  contactEmailPlaceholder: "Business Email",
  contactCompanyPlaceholder: "Company",
  contactLeadPhonePlaceholder: "Phone number",
  contactMessagePlaceholder: "Tell us about your project...",
  contactSubmitLabel: "Send",
  contactReplyNote: "We typically reply within one business day.",
  loginPasswordResetHelp: "",
  socialLinks: [
    {
      label: "WhatsApp",
      url: "https://wa.me/251991185321",
      icon: "whatsapp",
      enabled: true,
    },
    {
      label: "Email",
      url: "mailto:hello@yafetpromedia.com",
      icon: "email",
      enabled: true,
    },
    {
      label: "LinkedIn",
      url: "https://www.linkedin.com/company/yafetpromedia",
      icon: "linkedin",
      enabled: true,
    },
    {
      label: "Instagram",
      url: "https://www.instagram.com/yafetpromedia",
      icon: "instagram",
      enabled: true,
    },
    {
      label: "YouTube",
      url: "https://www.youtube.com/@yafetpromedia",
      icon: "youtube",
      enabled: true,
    },
    {
      label: "GitHub",
      url: "https://github.com/yafetpromedia",
      icon: "github",
      enabled: true,
    },
  ],
  aiName: "Yafet AI",
  whatsappNumber: "251991185321",
};

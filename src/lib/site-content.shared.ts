export type SystemsCard = {
  title: string;
  description: string;
  tag: string;
};

export type ServiceCard = {
  title: string;
  description: string;
};

export type ProductCard = {
  title: string;
  description: string;
  label: string;
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

export type TestimonialCard = {
  quote: string;
  author: string;
  role: string;
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

export type SiteContent = {
  heroHeadline: string;
  heroHighlight: string;
  heroTail: string;
  heroBadge: string;
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
  productsCards: ProductCard[];
  caseStudiesSectionTag: string;
  caseStudiesSectionTitle: string;
  caseStudiesSectionDescription: string;
  caseStudiesSectionCtaLabel: string;
  caseStudiesCards: CaseStudyCard[];
  trustSectionTag: string;
  trustSectionTitle: string;
  trustLogoItems: string[];
  trustTestimonials: TestimonialCard[];
  processFaqSectionTag: string;
  processFaqSectionTitle: string;
  processFaqSectionDescription: string;
  processSteps: ProcessStep[];
  faqItems: FaqItem[];
  contactEmail: string;
  contactPhone: string;
  socialLinks: SocialLink[];
  aiName: string;
  whatsappNumber: string;
};

export const defaultSiteContent: SiteContent = {
  heroHeadline: "We build",
  heroHighlight: "systems that scale",
  heroTail: "businesses.",
  heroBadge: "Digital Systems Infrastructure",
  systemsSectionTag: "Ecosystem Architecture",
  systemsSectionTitle: "Integrated infrastructure for modern scale.",
  systemsSectionDescription:
    "We don't just build websites; we engineer the underlying digital ecosystems that drive business operations and brand authority.",
  systemsExploreCtaLabel: "Explore Architecture",
  systemsCards: [
    {
      title: "Core Infrastructure",
      description:
        "Robust, scalable backend systems and architecture that power complex organizational workflows securely.",
      tag: "SYS_ARCH",
    },
    {
      title: "Brand Ecosystems",
      description: "System-based branding that scales infinitely across all platforms.",
      tag: "BRAND_OS",
    },
    {
      title: "Media Pipelines",
      description: "Automated production pipelines for high-volume content.",
      tag: "MEDIA_NET",
    },
    {
      title: "Growth Engines",
      description: "Data-driven marketing automation built for extreme scalability.",
      tag: "GROWTH_LOGIC",
    },
  ],
  servicesSectionTag: "What We Do",
  servicesSectionTitle: "Modern digital systems for real business growth.",
  servicesCards: [
    {
      title: "Website & Product Design",
      description:
        "Conversion-focused websites and interfaces designed to reflect your brand and move visitors to action.",
    },
    {
      title: "Automation & Workflows",
      description:
        "Smart internal systems that automate repetitive operations and keep teams aligned in real time.",
    },
    {
      title: "Growth Strategy",
      description:
        "Data-backed campaigns, content systems, and funnels built to scale customer acquisition reliably.",
    },
    {
      title: "Security & Reliability",
      description:
        "Stable, secure delivery standards with monitoring and performance practices for business-critical systems.",
    },
  ],
  productsSectionTag: "Flagship Systems",
  productsSectionTitle: "Products built for operations at scale.",
  productsCards: [
    {
      title: "Mr.Software Core",
      description: "Centralized operating dashboard for internal teams and business workflows.",
      label: "OPERATIONS",
    },
    {
      title: "Performance Monitor",
      description: "Live analytics for uptime, speed, and performance with smart alerting.",
      label: "ANALYTICS",
    },
    {
      title: "Secure Vault",
      description: "Role-based secure document and data vault for sensitive information.",
      label: "SECURITY",
    },
    {
      title: "Automation Engine",
      description: "No-code automation flows to reduce manual operations across departments.",
      label: "AUTOMATION",
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
  trustSectionTag: "Institutional Trust",
  trustSectionTitle: "Trusted by leading institutions.",
  trustLogoItems: [
    "National Tech Institute",
    "Global Logistics Systems",
    "Apex Financial Group",
    "Metro Health Network",
    "Atlas Education Council",
    "Prime Industry Labs",
  ],
  trustTestimonials: [
    {
      quote:
        "Yafetpromedia didn't just build us a website; they built the engine that runs our entire organization. Their system-level thinking is unparalleled.",
      author: "Dr. Samuel Kebede",
      role: "Director, National Tech Institute",
    },
    {
      quote:
        "The infrastructure they designed for our global brand has simplified our workflow across three continents. Professional, technical, and truly premium.",
      author: "Elena Rodriguez",
      role: "COO, Global Logistics Systems",
    },
  ],
  processFaqSectionTag: "Launch Framework",
  processFaqSectionTitle: "A clear process and transparent answers.",
  processFaqSectionDescription:
    "From first discovery to post-launch optimization, we move with structure and speed.",
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
  contactEmail: "hello@yafetpromedia.com",
  contactPhone: "+251 900 000 000",
  socialLinks: [
    {
      label: "WhatsApp",
      url: "https://wa.me/251900000000",
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
  whatsappNumber: "251900000000",
};

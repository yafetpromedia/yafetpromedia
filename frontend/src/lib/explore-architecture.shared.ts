/**
 * CMS shape for the Explore Architecture modal (string icon keys → Lucide in the app).
 */
export type ExploreTrackId = "web" | "video" | "brand";

export type ExploreFlowStep = {
  label: string;
  detail: string;
  /** Must match a key in `exploreLucideIconOptions` or fallback is used. */
  icon: string;
};

export type ExploreStackCard = {
  name: string;
  value: string;
  note: string;
  icon: string;
};

export type ExploreArchitectureTrack = {
  id: ExploreTrackId;
  /** Tab label in the public UI, e.g. "Web & data" */
  tabLabel: string;
  /** Shown next to "Stack we ship on" */
  stackTitle: string;
  flowRow1: ExploreFlowStep[];
  flowRow2: ExploreFlowStep[];
  flowFooter: string;
  /** Typewriter terminal, one string per line */
  terminalLines: string[];
  stackCards: ExploreStackCard[];
};

export type ExploreServiceStripItem = { label: string; icon: string };

export type ExploreArchitectureContent = {
  eyebrow: string;
  title: string;
  description: string;
  serviceStrip: ExploreServiceStripItem[];
  dataFlowSectionTitle: string;
  stackSectionTitle: string;
  beforeAfterSectionTitle: string;
  beforeLabel: string;
  afterLabel: string;
  /** Exactly three tracks: web, video, brand (order preserved in admin). */
  tracks: ExploreArchitectureTrack[];
  beforeAfter: { before: string[]; after: string[] };
  closingLine: string;
  ctaLabel: string;
};

/** Icons available in the admin & mapped in `explore-architecture-icons`. */
export const exploreLucideIconOptions = [
  "LayoutGrid",
  "Server",
  "Database",
  "Lock",
  "Users",
  "Webhook",
  "Zap",
  "BarChart3",
  "FileText",
  "Camera",
  "Clapperboard",
  "Palette",
  "Film",
  "LineChart",
  "PencilRuler",
  "Type",
  "UserCheck",
  "Layers",
  "Image",
  "Wand2",
  "Video",
  "Globe2",
  "Sparkles",
  "Check",
] as const;

export type ExploreLucideIconKey = (typeof exploreLucideIconOptions)[number];

function step(label: string, detail: string, icon: string): ExploreFlowStep {
  return { label, detail, icon };
}

function scard(name: string, value: string, note: string, icon: string): ExploreStackCard {
  return { name, value, note, icon };
}

export const defaultExploreArchitectureContent: ExploreArchitectureContent = {
  eyebrow: "Blueprint",
  title: "How your full digital system runs",
  description:
    "Awud Digitals delivers the whole loop—strategy, design, build, media, and growth—on one architecture so nothing gets lost between agencies or tools.",
  serviceStrip: [
    { label: "Strategy & UX", icon: "LayoutGrid" },
    { label: "Build & integrate", icon: "Server" },
    { label: "Brand & content", icon: "Video" },
    { label: "Growth & data", icon: "LineChart" },
  ],
  dataFlowSectionTitle: "Data flow",
  stackSectionTitle: "Stack we ship on",
  beforeAfterSectionTitle: "Before vs after",
  beforeLabel: "Before",
  afterLabel: "After",
  tracks: [
    {
      id: "web",
      tabLabel: "Web & data",
      stackTitle: "Websites, apps & data",
      flowRow1: [
        step("Touchpoints", "Web, social, ads, forms", "Users"),
        step("Ingestion", "APIs, webhooks, validation", "Webhook"),
        step("Core data", "Structured storage & access", "Database"),
      ],
      flowRow2: [
        step("Automation", "Workflows & messaging", "Zap"),
        step("Intelligence", "Dashboards & reporting", "BarChart3"),
      ],
      flowFooter:
        "Every step is instrumented: logs, alerts, and rollbacks so your live digital services stay safe in production.",
      terminalLines: [
        `// awuddigitals — product & data`,
        `type ServiceLoop = {`,
        `  touchpoints: "web" | "social" | "ads" | "forms"`,
        `  stack: { surface: "Next.js", runtime: "edge", data: "SQL + cache" }`,
        `  ops: { logs: true, alerts: true, rollbacks: true }`,
        `}`,
        `const status: "instrumented" | "production-ready" = "production-ready"`,
      ],
      stackCards: [
        scard("Frontend", "Next.js / React", "Fast, SEO-friendly surfaces", "LayoutGrid"),
        scard("Runtime & APIs", "Node on the edge", "Secure routes and integrations", "Server"),
        scard("Data", "PostgreSQL + cache", "Relational truth for operations", "Database"),
        scard("Security", "TLS, auth, least privilege", "Encryption in transit & at rest", "Lock"),
      ],
    },
    {
      id: "video",
      tabLabel: "Video & post",
      stackTitle: "Video, motion & post",
      flowRow1: [
        step("Brief & creative", "Story, shot list, client alignment", "FileText"),
        step("Capture", "Sets, codecs, dailies & backups", "Camera"),
        step("Edit & comp", "Timeline, VFX, sound passes", "Clapperboard"),
      ],
      flowRow2: [
        step("Color & review", "Grades, sign-off, client reviews", "Palette"),
        step("Master & deliver", "Specs, handoff, all platforms", "Film"),
      ],
      flowFooter:
        "Each stage is versioned and reviewed: exports match what you approved, from offline to delivery formats.",
      terminalLines: [
        `// awuddigitals — post & motion`,
        `type PostPipeline = {`,
        `  edit: "Premiere"`,
        `  comp: "After Effects"`,
        `  stills: "Photoshop" | "keyArt"`,
        `  color: "Resolve" | "clientReview"`,
        `};`,
      ],
      stackCards: [
        scard("Edit & finishing", "Adobe Premiere Pro", "Assembly, story, and delivery formats", "Clapperboard"),
        scard("Design & key art", "Adobe Photoshop", "Stills, OOH, and retouching for every channel", "Image"),
        scard("Motion & compositing", "After Effects", "Packages, lower thirds, and clean compositing", "Wand2"),
        scard("Color & review", "DaVinci Resolve", "Grades, scopes, and managed review with clients", "Video"),
      ],
    },
    {
      id: "brand",
      tabLabel: "Brand & design",
      stackTitle: "Brand, UI & content",
      flowRow1: [
        step("Strategy", "Positioning, audience, KPIs", "LineChart"),
        step("Design system", "UI, print, brand rules", "PencilRuler"),
        step("Content", "Copy, key art, motion", "Type"),
      ],
      flowRow2: [
        step("Review & QA", "Stakeholders, brand & legal", "UserCheck"),
        step("Launch & handoff", "Toolkits, source files, training", "Layers"),
      ],
      flowFooter:
        "From brief to launch in one line: files, messaging, and guidelines stay linked to the brand you sign off on.",
      terminalLines: [
        `// awuddigitals — brand system`,
        `type BrandKit = {`,
        `  ui: "Figma"`,
        `  vector: "Illustrator"`,
        `  layout: "InDesign"`,
        `  sourceOfTruth: "Notion" | "DAM"`,
        `};`,
      ],
      stackCards: [
        scard("UI & handoff", "Figma", "Design systems, prototypes, and dev-ready specs", "PencilRuler"),
        scard("Vector & print", "Adobe Illustrator", "Logos, brand kits, and crisp export for print", "Palette"),
        scard("Type & layout", "InDesign", "Long-form decks, one-pagers, and campaign booklets", "Type"),
        scard("Asset & delivery", "Notion + DAM", "Single source of truth for copy, files, and approvals", "Layers"),
      ],
    },
  ],
  beforeAfter: {
    before: [
      "Fragmented tools and no single source of truth",
      "Agency for ads, another for the site, spreadsheets for leads",
      "Slow delivery and no clear ownership",
    ],
    after: [
      "One team & stack across brand, product, and media",
      "Automations that connect marketing, ops, and reporting",
      "Faster shipping with a roadmap you can see end-to-end",
    ],
  },
  closingLine: "One partner for your full digital service—from first workshop to live systems.",
  ctaLabel: "Start a project",
};

export function isExploreLucideIconKey(value: string): value is ExploreLucideIconKey {
  return (exploreLucideIconOptions as readonly string[]).includes(value);
}

export function coalesceExploreIconKey(value: unknown): string {
  const s = String(value ?? "").trim();
  if (isExploreLucideIconKey(s)) return s;
  return "LayoutGrid";
}

/** Variable-length lists; defaults fill missing slots on save. */
const FLOW_ROW_MIN = 1;
const FLOW_ROW_MAX = 6;
const STACK_CARD_MIN = 1;
const STACK_CARD_MAX = 8;
const SERVICE_STRIP_MIN = 1;
const SERVICE_STRIP_MAX = 8;

function mergeFlowSteps(
  raw: unknown,
  defaults: ExploreFlowStep[],
  minLen: number,
  maxLen: number
): ExploreFlowStep[] {
  const arr = Array.isArray(raw) ? (raw as Partial<ExploreFlowStep>[]) : [];
  const baseLen = arr.length > 0 ? arr.length : defaults.length;
  const len = Math.min(Math.max(baseLen, minLen), maxLen);
  const out: ExploreFlowStep[] = [];
  for (let i = 0; i < len; i += 1) {
    const r = arr[i];
    const d = defaults[i] ?? defaults[defaults.length - 1] ?? defaults[0];
    out.push({
      label: String(r?.label ?? d?.label ?? "").slice(0, 100),
      detail: String(r?.detail ?? d?.detail ?? "").slice(0, 180),
      icon: coalesceExploreIconKey(r?.icon ?? d?.icon),
    });
  }
  return out;
}

function mergeStackCards(raw: unknown, defaults: ExploreStackCard[]): ExploreStackCard[] {
  const arr = Array.isArray(raw) ? (raw as Partial<ExploreStackCard>[]) : [];
  const baseLen = arr.length > 0 ? arr.length : defaults.length;
  const len = Math.min(Math.max(baseLen, STACK_CARD_MIN), STACK_CARD_MAX);
  const out: ExploreStackCard[] = [];
  for (let i = 0; i < len; i += 1) {
    const r = arr[i];
    const d = defaults[i] ?? defaults[defaults.length - 1] ?? defaults[0];
    out.push({
      name: String(r?.name ?? d?.name ?? "").slice(0, 80),
      value: String(r?.value ?? d?.value ?? "").slice(0, 120),
      note: String(r?.note ?? d?.note ?? "").slice(0, 200),
      icon: coalesceExploreIconKey(r?.icon ?? d?.icon),
    });
  }
  return out;
}

function mergeTrack(
  id: ExploreTrackId,
  partial: unknown,
  def: ExploreArchitectureTrack
): ExploreArchitectureTrack {
  const t = partial && typeof partial === "object" ? (partial as Partial<ExploreArchitectureTrack>) : {};
  const term = Array.isArray(t.terminalLines)
    ? t.terminalLines.map((l) => String(l ?? "").slice(0, 200)).filter(Boolean)
    : def.terminalLines;
  const termOut = term.length > 0 ? term.slice(0, 25) : def.terminalLines;
  return {
    id,
    tabLabel: String(t.tabLabel ?? def.tabLabel).slice(0, 40),
    stackTitle: String(t.stackTitle ?? def.stackTitle).slice(0, 120),
    flowRow1: mergeFlowSteps(t.flowRow1, def.flowRow1, FLOW_ROW_MIN, FLOW_ROW_MAX),
    flowRow2: mergeFlowSteps(t.flowRow2, def.flowRow2, FLOW_ROW_MIN, FLOW_ROW_MAX),
    flowFooter: String(t.flowFooter ?? def.flowFooter).slice(0, 400),
    terminalLines: termOut,
    stackCards: mergeStackCards(t.stackCards, def.stackCards),
  };
}

export function sanitizeExploreArchitecture(input: unknown): ExploreArchitectureContent {
  const def = defaultExploreArchitectureContent;
  const raw = input && typeof input === "object" ? (input as Partial<ExploreArchitectureContent>) : {};
  const rawTracks = Array.isArray(raw.tracks) ? raw.tracks : def.tracks;
  const byId = (id: ExploreTrackId) => {
    const found = rawTracks.find((x) => x && typeof x === "object" && (x as ExploreArchitectureTrack).id === id);
    const defT = def.tracks.find((x) => x.id === id)!;
    return mergeTrack(id, found, defT);
  };
  const tracks: ExploreArchitectureTrack[] = ["web", "video", "brand"].map((id) => byId(id as ExploreTrackId));

  const stripRaw = Array.isArray(raw.serviceStrip) ? raw.serviceStrip : [];
  const baseStripLen = stripRaw.length > 0 ? stripRaw.length : def.serviceStrip.length;
  const stripLen = Math.min(Math.max(baseStripLen, SERVICE_STRIP_MIN), SERVICE_STRIP_MAX);
  const serviceStrip = Array.from({ length: stripLen }, (_, i) => {
    const s = stripRaw[i];
    const d = def.serviceStrip[i % def.serviceStrip.length]!;
    return {
      label: String(s?.label ?? d.label).slice(0, 64),
      icon: coalesceExploreIconKey(s?.icon ?? d.icon),
    };
  });

  const before = Array.isArray(raw.beforeAfter?.before) ? raw.beforeAfter!.before! : def.beforeAfter.before;
  const after = Array.isArray(raw.beforeAfter?.after) ? raw.beforeAfter!.after! : def.beforeAfter.after;
  return {
    eyebrow: String(raw.eyebrow ?? def.eyebrow).slice(0, 80),
    title: String(raw.title ?? def.title).slice(0, 200),
    description: String(raw.description ?? def.description).slice(0, 500),
    serviceStrip: serviceStrip as ExploreArchitectureContent["serviceStrip"],
    dataFlowSectionTitle: String(raw.dataFlowSectionTitle ?? def.dataFlowSectionTitle).slice(0, 80),
    stackSectionTitle: String(raw.stackSectionTitle ?? def.stackSectionTitle).slice(0, 80),
    beforeAfterSectionTitle: String(raw.beforeAfterSectionTitle ?? def.beforeAfterSectionTitle).slice(0, 80),
    beforeLabel: String(raw.beforeLabel ?? def.beforeLabel).slice(0, 40),
    afterLabel: String(raw.afterLabel ?? def.afterLabel).slice(0, 40),
    tracks,
    beforeAfter: {
      before: (before.length ? before : def.beforeAfter.before).slice(0, 6).map((l) => String(l).slice(0, 240)),
      after: (after.length ? after : def.beforeAfter.after).slice(0, 6).map((l) => String(l).slice(0, 240)),
    },
    closingLine: String(raw.closingLine ?? def.closingLine).slice(0, 300),
    ctaLabel: String(raw.ctaLabel ?? def.ctaLabel).slice(0, 64),
  };
}

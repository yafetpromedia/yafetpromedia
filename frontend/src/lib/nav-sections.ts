export type NavSectionLink = {
  labelKey: string;
  href: string;
  descriptionKey?: string;
};

export type NavSectionGroup = {
  labelKey: string;
  href: string;
  children: NavSectionLink[];
};

/** Homepage + company destinations grouped for navbar dropdowns. */
export const NAV_SECTION_GROUPS: NavSectionGroup[] = [
  {
    labelKey: "navEcosystem",
    href: "#ecosystem",
    children: [
      { labelKey: "navEcosystemPlatform", href: "#ecosystem", descriptionKey: "navEcosystemPlatformDesc" },
      { labelKey: "navSystems", href: "#systems", descriptionKey: "navSystemsDesc" },
    ],
  },
  {
    labelKey: "navServices",
    href: "#services",
    children: [
      { labelKey: "navServicesOverview", href: "#services", descriptionKey: "navServicesDesc" },
      { labelKey: "navProcessFaq", href: "#process-faq", descriptionKey: "navProcessFaqDesc" },
    ],
  },
  {
    labelKey: "navProducts",
    href: "#products",
    children: [
      { labelKey: "navProductsCatalog", href: "#products", descriptionKey: "navProductsDesc" },
      { labelKey: "navPricing", href: "#pricing", descriptionKey: "navPricingDesc" },
    ],
  },
  {
    labelKey: "navCaseStudies",
    href: "/portfolio",
    children: [
      { labelKey: "navCaseStudies", href: "/portfolio", descriptionKey: "navCaseStudiesDesc" },
      { labelKey: "navTrust", href: "#trust", descriptionKey: "navTrustDesc" },
      { labelKey: "navContact", href: "#contact", descriptionKey: "navContactDesc" },
    ],
  },
  {
    labelKey: "navInsights",
    href: "#insights",
    children: [
      { labelKey: "navInsights", href: "#insights", descriptionKey: "navInsightsDesc" },
    ],
  },
  {
    labelKey: "navAbout",
    href: "/about/yafet",
    children: [
      { labelKey: "navAboutYafet", href: "/about/yafet", descriptionKey: "navAboutYafetDesc" },
      { labelKey: "navContact", href: "#contact", descriptionKey: "navContactDesc" },
    ],
  },
];

export function collectHashSectionHrefs(groups: NavSectionGroup[] = NAV_SECTION_GROUPS): string[] {
  const hrefs = new Set<string>();
  for (const group of groups) {
    if (group.href.startsWith("#")) hrefs.add(group.href);
    for (const child of group.children) {
      if (child.href.startsWith("#")) hrefs.add(child.href);
    }
  }
  return Array.from(hrefs);
}

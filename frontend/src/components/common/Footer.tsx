"use client";

import Link from "next/link";
import Image from "next/image";
import {
  ArrowUpRight,
  AtSign,
  Briefcase,
  FolderGit2,
  Globe,
  Mail,
  MessageCircle,
  Play,
  Phone,
} from "lucide-react";
import { useSiteContent } from "@/components/common/SiteContentProvider";
import { defaultSiteContent } from "@/lib/site-content.shared";
import { shouldUseUnoptimizedImage } from "@/lib/image-src";
import { useHydrated } from "@/lib/use-hydrated";

function digitsToDisplayPhone(digits: string): string {
  const d = digits.replace(/\D/g, "");
  if (d.length < 9) return "";
  if (d.startsWith("251") && d.length >= 12) {
    return `+251 ${d.slice(3, 6)} ${d.slice(6, 9)} ${d.slice(9)}`.trim();
  }
  return d.startsWith("+") ? d : `+${d}`;
}

export default function Footer() {
  const { content, isLoading } = useSiteContent();
  const hydrated = useHydrated();
  // Keep SSR + first client paint on defaults to avoid hydration mismatch
  // when CMS content arrives after mount.
  const live = hydrated && !isLoading ? content : defaultSiteContent;
  const year = 2026;
  const logoSrc = live.siteLogoSrc || defaultSiteContent.siteLogoSrc;
  const founderName = live.aboutYafet.pageTitle || defaultSiteContent.aboutYafet.pageTitle;
  const phoneFromWhatsApp = digitsToDisplayPhone(live.whatsappNumber);
  const phoneDisplay =
    live.contactPhone.trim() ||
    phoneFromWhatsApp ||
    defaultSiteContent.contactPhone.trim();
  const iconMap = {
    whatsapp: MessageCircle,
    email: Mail,
    linkedin: Briefcase,
    instagram: AtSign,
    youtube: Play,
    github: FolderGit2,
    website: Globe,
  } as const;
  const socials = live.socialLinks
    .filter((item) => item.enabled && item.url.trim().length > 0)
    .map((item) => {
      const Icon = iconMap[item.icon] ?? Globe;
      return {
        ...item,
        icon: Icon,
        external: !item.url.startsWith("mailto:"),
      };
    });

  const linkCls =
    "group inline-flex items-center gap-1.5 text-[15px] text-foreground/65 transition-colors hover:text-foreground";

  const hasSocials = socials.length > 0;
  const trioSpan = hasSocials ? "lg:col-span-3" : "lg:col-span-4";

  return (
    <footer className="relative overflow-hidden border-t border-border/50 bg-background pb-12 pt-16 md:pb-14 md:pt-20">
      <div className="relative z-10 mx-auto w-full max-w-7xl px-5 sm:px-7 lg:px-10">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-10 xl:gap-12">
          {/* Brand + contact */}
          <div className={trioSpan}>
            <Link href="/" className="group mb-7 inline-flex items-center gap-3">
              <div className="relative flex size-11 items-center justify-center overflow-hidden rounded-2xl border border-border bg-white p-1.5 shadow-sm transition-colors group-hover:border-accent/35 dark:border-white/20">
                <Image
                  src={logoSrc}
                  alt="Awud Digitals Logo"
                  width={30}
                  height={30}
                  className="size-full object-contain"
                  unoptimized={shouldUseUnoptimizedImage(logoSrc)}
                />
              </div>
              <span className="text-xl font-semibold tracking-tight text-foreground md:text-[1.35rem]">
                Awud Digitals
              </span>
            </Link>

            <p className="mb-8 max-w-[26rem] text-[15px] leading-relaxed text-foreground/58 md:text-base">
              Awud Digitals — founded and owned by {founderName} — builds modern digital solutions
              for businesses, schools, startups, and organizations across Africa and globally.
            </p>

            <a
              href={`mailto:${live.contactEmail}`}
              className="inline-flex w-fit max-w-full items-center gap-2.5 text-[15px] text-foreground/75 transition-colors hover:text-foreground"
            >
              <span className="flex size-9 shrink-0 items-center justify-center rounded-full border border-border/70 bg-card/50 text-foreground/70">
                <Mail className="size-[17px]" strokeWidth={1.75} />
              </span>
              <span className="break-all sm:break-normal">{live.contactEmail}</span>
            </a>
          </div>

          {/* Solutions */}
          <nav className={`${trioSpan} lg:border-l lg:border-border/40 lg:pl-8 xl:pl-10`} aria-label="Solutions">
            <h2 className="mb-5 text-[11px] font-semibold uppercase tracking-[0.22em] text-foreground/45">Solutions</h2>
            <ul className="flex flex-col gap-1">
              {[
                { label: "Ecosystem", href: "#ecosystem" },
                { label: "Digital Infrastructure", href: "#systems" },
                { label: "Services", href: "#services" },
                { label: "Products", href: "#products" },
                { label: "Portfolio", href: "#case-studies" },
              ].map((item) => (
                <li key={item.label}>
                  <Link href={item.href} className={linkCls}>
                    <span>{item.label}</span>
                    <ArrowUpRight className="size-3.5 text-foreground/40 opacity-0 transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100" />
                  </Link>
                </li>
              ))}
            </ul>
            {phoneDisplay !== "" && (
              <a
                href={`tel:${phoneDisplay.replace(/\s+/g, "")}`}
                className="mt-8 inline-flex w-full max-w-[26rem] items-center gap-2.5 text-[15px] text-foreground/75 transition-colors hover:text-foreground"
              >
                <span className="flex size-9 shrink-0 items-center justify-center rounded-full border border-border/70 bg-card/50 text-foreground/70">
                  <Phone className="size-[17px]" strokeWidth={1.75} />
                </span>
                {phoneDisplay}
              </a>
            )}
          </nav>

          {/* Company */}
          <nav className={`${trioSpan} lg:border-l lg:border-border/40 lg:pl-8 xl:pl-10`} aria-label="Company">
            <h2 className="mb-5 text-[11px] font-semibold uppercase tracking-[0.22em] text-foreground/45">Company</h2>
            <ul className="flex flex-col gap-1">
              {[
                { label: "About Yafet", href: "/about/yafet" },
                { label: "Insights", href: "/#insights" },
                { label: "Process & FAQ", href: "#process-faq" },
                { label: "Contact", href: "#contact" },
              ].map((item) => (
                <li key={item.label}>
                  <Link href={item.href} className={linkCls}>
                    <span>{item.label}</span>
                    <ArrowUpRight className="size-3.5 text-foreground/40 opacity-0 transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100" />
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Connect — right column */}
          {socials.length > 0 && (
            <div className="flex min-w-0 flex-col items-center lg:col-span-3 lg:border-l lg:border-border/40 lg:pl-8 xl:pl-10">
              <h2 className="mb-5 w-full text-center text-[11px] font-semibold uppercase tracking-[0.22em] text-foreground/45">
                Connect
              </h2>
              <div className="grid w-full grid-cols-2 gap-x-2 gap-y-2 justify-items-center">
                {socials.map((social) => (
                  <Link
                    key={social.label}
                    href={social.url}
                    target={social.external ? "_blank" : undefined}
                    rel={social.external ? "noreferrer noopener" : undefined}
                    className="inline-flex min-w-0 max-w-full items-center justify-center gap-1.5 whitespace-nowrap rounded-full border border-border/55 bg-card/[0.35] px-2.5 py-1.5 text-[11px] font-medium text-foreground/75 shadow-sm backdrop-blur-sm transition-all duration-200 hover:border-primary/35 hover:bg-card/80 hover:text-foreground hover:shadow-md dark:bg-white/[0.03] sm:gap-2 sm:px-3 sm:text-[12px] md:text-[13px]"
                    aria-label={social.label}
                  >
                    <social.icon className="size-[14px] shrink-0 text-foreground/55 sm:size-[15px]" strokeWidth={2} />
                    <span>{social.label}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="mt-14 flex flex-row flex-nowrap items-center justify-between gap-4 border-t border-border/60 pt-8">
          <p className="min-w-0 flex-1 truncate text-[12px] text-foreground/45 sm:overflow-visible sm:flex-none sm:whitespace-normal sm:text-[13px]">
            © {year} Awud Digitals. All Rights Reserved.
          </p>
          <div className="flex shrink-0 flex-row flex-nowrap items-center gap-5 sm:gap-8">
            <Link
              href="#process-faq"
              className="text-[12px] font-medium uppercase tracking-[0.14em] text-foreground/45 transition-colors hover:text-foreground"
            >
              Process & FAQ
            </Link>
            <Link
              href="#contact"
              className="text-[12px] font-medium uppercase tracking-[0.14em] text-foreground/45 transition-colors hover:text-foreground"
            >
              Contact
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

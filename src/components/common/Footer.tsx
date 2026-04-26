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

export default function Footer() {
  const { content } = useSiteContent();
  const iconMap = {
    whatsapp: MessageCircle,
    email: Mail,
    linkedin: Briefcase,
    instagram: AtSign,
    youtube: Play,
    github: FolderGit2,
    website: Globe,
  } as const;
  const socials = content.socialLinks
    .filter((item) => item.enabled && item.url.trim().length > 0)
    .map((item) => {
      const Icon = iconMap[item.icon] ?? Globe;
      return {
        ...item,
        icon: Icon,
        external: !item.url.startsWith("mailto:"),
      };
    });

  return (
    <footer className="bg-background border-t border-border pt-24 pb-10 relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[920px] h-[360px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="max-w-7xl w-full mx-auto px-6 relative z-10 text-foreground">
        <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr_1fr] gap-12 lg:gap-16 mb-14">
          <div>
            <Link href="/" className="flex items-center gap-3 mb-6 group">
              <div className="relative size-10 rounded-xl overflow-hidden bg-primary/10 border border-primary/20 flex items-center justify-center p-1 group-hover:border-primary/50 transition-all duration-300">
                <Image
                  src="/images/navbar/hero image.svg"
                  alt="Yafetpromedia Logo"
                  width={32}
                  height={32}
                  className="object-contain w-full h-full"
                />
              </div>
              <span className="text-2xl font-bold tracking-tight text-foreground">
                Yafetpromedia
              </span>
            </Link>

            <p className="text-foreground/60 max-w-md text-base md:text-lg leading-relaxed mb-8 font-light text-balance">
              Designing and engineering the underlying digital ecosystems that drive 
              modern business operations and brand authority.
            </p>

            <div className="rounded-2xl border border-border/80 bg-gradient-to-b from-card/85 to-card/40 p-4 sm:p-5 max-w-xl">
              <p className="text-[11px] uppercase tracking-[0.16em] text-foreground/50 mb-3">Follow us</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {socials.map((social) => (
                <Link
                  key={social.label}
                  href={social.url}
                  target={social.external ? "_blank" : undefined}
                  rel={social.external ? "noreferrer noopener" : undefined}
                  className="group rounded-xl border border-border/80 bg-background/70 hover:bg-background hover:border-primary/40 h-10.5 px-3 inline-flex items-center gap-2 transition-all duration-300"
                  aria-label={social.label}
                >
                  <social.icon className="size-4 text-foreground/50 group-hover:text-primary transition-colors" />
                  <span className="text-xs font-medium text-foreground/70 group-hover:text-foreground transition-colors">
                    {social.label}
                  </span>
                </Link>
              ))}
              </div>
            </div>

            <div className="mt-6 space-y-2 text-sm text-foreground/60">
              <p className="inline-flex items-center gap-2">
                <Mail className="size-4 text-primary/80" />
                <a href={`mailto:${content.contactEmail}`} className="hover:text-foreground transition-colors">
                  {content.contactEmail}
                </a>
              </p>
              <p className="inline-flex items-center gap-2">
                <Phone className="size-4 text-primary/80" />
                <span>{content.contactPhone}</span>
              </p>
            </div>
          </div>

          <div>
            <h4 className="font-mono text-[10px] uppercase tracking-[0.2em] mb-6 text-primary">Solutions</h4>
            <ul className="space-y-3">
              {[
                { label: "Digital Infrastructure", href: "#systems" },
                { label: "Services", href: "#services" },
                { label: "Products", href: "#products" },
                { label: "Case Studies", href: "#case-studies" },
                { label: "Trust", href: "#trust" },
              ].map((item) => (
                <li key={item.label}>
                  <Link href={item.href} className="text-foreground/60 hover:text-foreground inline-flex items-center gap-2 group transition-colors font-light">
                    {item.label}
                    <ArrowUpRight className="size-3 opacity-0 -translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all text-primary" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-mono text-[10px] uppercase tracking-[0.2em] mb-6 text-primary">Company</h4>
            <ul className="space-y-3">
              {[
                { label: "About", href: "#services" },
                { label: "Process & FAQ", href: "#process-faq" },
                { label: "Contact", href: "#contact" }
              ].map((item) => (
                <li key={item.label}>
                  <Link href={item.href} className="text-foreground/60 hover:text-foreground inline-flex items-center gap-2 group transition-colors font-light">
                    {item.label}
                    <ArrowUpRight className="size-3 opacity-0 -translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all text-primary" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="pt-7 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-foreground/35 text-xs font-mono tracking-wider">
            © 2026 YAFETPROMEDIA. ALL RIGHTS RESERVED.
          </p>
          <div className="flex items-center gap-8">
            <Link href="#process-faq" className="text-[10px] font-mono text-foreground/40 hover:text-foreground uppercase tracking-widest transition-colors">PROCESS & FAQ</Link>
            <Link href="#contact" className="text-[10px] font-mono text-foreground/40 hover:text-foreground uppercase tracking-widest transition-colors">CONTACT</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

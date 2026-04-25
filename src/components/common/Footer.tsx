import Link from "next/link";
import Image from "next/image";
import { Code, MessageCircle, Briefcase, Mail, ArrowUpRight } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-background border-t border-border pt-32 pb-12 relative overflow-hidden">
      {/* Subtle background glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="max-w-7xl w-full mx-auto px-6 relative z-10 text-foreground">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 lg:gap-24 mb-24">
          <div className="col-span-1 lg:col-span-2">
            <Link href="/" className="flex items-center gap-3 mb-8 group">
              <div className="relative size-10 rounded-xl overflow-hidden bg-primary/10 border border-primary/20 flex items-center justify-center p-1 group-hover:border-primary/50 transition-all duration-300">
                <Image
                  src="/images/navbar/hero image.svg"
                  alt="Yafet Pro Media Logo"
                  width={32}
                  height={32}
                  className="object-contain w-full h-full"
                />
              </div>
              <span className="text-2xl font-bold tracking-tight text-foreground">
                Yafet<span className="text-foreground/50 font-normal">Pro</span>Media
              </span>
            </Link>
            <p className="text-foreground/60 max-w-sm text-lg leading-relaxed mb-10 font-light text-balance">
              Designing and engineering the underlying digital ecosystems that drive 
              modern business operations and brand authority.
            </p>
            <div className="flex items-center gap-4">
              {[
                { icon: MessageCircle, label: "Chat" },
                { icon: Briefcase, label: "Projects" },
                { icon: Code, label: "Systems" },
                { icon: Mail, label: "Email" }
              ].map((social, i) => (
                <Link
                  key={i}
                  href="#"
                  className="group relative size-12 rounded-full border border-border flex items-center justify-center bg-foreground/[0.02] hover:border-primary/50 transition-all duration-500"
                  aria-label={social.label}
                >
                  <div className="absolute inset-0 rounded-full bg-primary/0 group-hover:bg-primary/5 transition-all duration-500" />
                  <social.icon className="size-5 text-foreground/40 group-hover:text-primary transition-colors duration-500" />
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-mono text-[10px] uppercase tracking-[0.2em] mb-10 text-primary">Systems</h4>
            <ul className="space-y-5">
              {[
                "Digital Infrastructure",
                "Brand Identity",
                "Media Systems",
                "Growth Marketing"
              ].map((item) => (
                <li key={item}>
                  <Link href="#" className="text-foreground/60 hover:text-foreground flex items-center gap-2 group transition-colors font-light">
                    {item}
                    <ArrowUpRight className="size-3 opacity-0 -translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all text-primary" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-mono text-[10px] uppercase tracking-[0.2em] mb-10 text-primary">Company</h4>
            <ul className="space-y-5">
              {[
                "About Us",
                "Products",
                "Insights",
                "Contact"
              ].map((item) => (
                <li key={item}>
                  <Link href="#" className="text-foreground/60 hover:text-foreground flex items-center gap-2 group transition-colors font-light">
                    {item}
                    <ArrowUpRight className="size-3 opacity-0 -translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all text-primary" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="pt-12 border-t border-border flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8">
            <p className="text-foreground/30 text-xs font-mono tracking-wider">
              © 2026 YAFET PRO MEDIA. ALL SYSTEMS OPERATIONAL.
            </p>
          </div>
          <div className="flex items-center gap-10">
            <Link href="#" className="text-[10px] font-mono text-foreground/40 hover:text-foreground uppercase tracking-widest transition-colors">Privacy Policy</Link>
            <Link href="#" className="text-[10px] font-mono text-foreground/40 hover:text-foreground uppercase tracking-widest transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

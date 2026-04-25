import Link from "next/link";
import { Code, MessageCircle, Briefcase, Mail } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-black border-t border-white/5 pt-24 pb-12">
      <div className="container px-6 mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          <div className="col-span-1 lg:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-6 group">
              <div className="size-8 rounded bg-gradient-to-br from-primary to-orange-600 flex items-center justify-center font-bold text-white text-lg">
                Y
              </div>
              <span className="text-xl font-bold tracking-tighter text-white group-hover:text-primary transition-colors">
                Yafet<span className="text-primary group-hover:text-white transition-colors">Pro</span>Media
              </span>
            </Link>
            <p className="text-gray-400 max-w-sm leading-relaxed mb-8">
              We design and build complete digital infrastructure systems that 
              power modern organizations and drive scalable growth.
            </p>
            <div className="flex items-center gap-4">
              {[MessageCircle, Briefcase, Code, Mail].map((Icon, i) => (
                <Link
                  key={i}
                  href="#"
                  className="size-10 rounded-full border border-white/10 flex items-center justify-center text-gray-500 hover:text-primary hover:border-primary transition-all"
                >
                  <Icon className="size-5" />
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-white font-bold mb-6">Systems</h4>
            <ul className="space-y-4 text-gray-400">
              <li><Link href="#" className="hover:text-primary transition-colors">Digital Infrastructure</Link></li>
              <li><Link href="#" className="hover:text-primary transition-colors">Brand Identity</Link></li>
              <li><Link href="#" className="hover:text-primary transition-colors">Media Systems</Link></li>
              <li><Link href="#" className="hover:text-primary transition-colors">Growth Marketing</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-6">Company</h4>
            <ul className="space-y-4 text-gray-400">
              <li><Link href="#" className="hover:text-primary transition-colors">About Us</Link></li>
              <li><Link href="#" className="hover:text-primary transition-colors">Products</Link></li>
              <li><Link href="#" className="hover:text-primary transition-colors">Insights</Link></li>
              <li><Link href="#" className="hover:text-primary transition-colors">Contact</Link></li>
            </ul>
          </div>
        </div>

        <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-gray-500 text-sm">
            © 2026 Yafet Pro Media. All systems engineered for excellence.
          </p>
          <div className="flex items-center gap-8 text-sm text-gray-500">
            <Link href="#" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="#" className="hover:text-white transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

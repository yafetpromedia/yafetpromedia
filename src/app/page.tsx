import Hero from "@/sections/home/Hero";
import SystemsOverview from "@/sections/home/SystemsOverview";
import ProductsPreview from "@/sections/home/ProductsPreview";
import CaseStudiesPreview from "@/sections/home/CaseStudiesPreview";
import AuthorityPreview from "@/sections/home/AuthorityPreview";
import TrustSection from "@/sections/home/TrustSection";
import CTASection from "@/sections/home/CTASection";

export default function Home() {
  return (
    <main>
      <Hero />
      <SystemsOverview />
      <ProductsPreview />
      <CaseStudiesPreview />
      <AuthorityPreview />
      <TrustSection />
      <CTASection />
    </main>
  );
}

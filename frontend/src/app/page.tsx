import Hero from "@/sections/home/Hero";
import EcosystemSection from "@/sections/home/EcosystemSection";
import SystemsOverview from "@/sections/home/SystemsOverview";
import ServicesGrid from "@/sections/home/ServicesGrid";
import ProductsPreview from "@/sections/home/ProductsPreview";
import CaseStudiesPreview from "@/sections/home/CaseStudiesPreview";
import AuthorityPreview from "@/sections/home/AuthorityPreview";
import TrustSection from "@/sections/home/TrustSection";
import ProcessAndFaq from "@/sections/home/ProcessAndFaq";
import ContactSection from "@/sections/home/ContactSection";
import CTASection from "@/sections/home/CTASection";

export default function Home() {
  return (
    <main>
      <Hero />
      <EcosystemSection />
      <SystemsOverview />
      <ServicesGrid />
      <ProductsPreview />
      <CaseStudiesPreview />
      <AuthorityPreview />
      <TrustSection />
      <ProcessAndFaq />
      <ContactSection />
      <CTASection />
    </main>
  );
}

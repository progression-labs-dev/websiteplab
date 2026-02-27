import { Hero } from "@/components/marketing/hero";
import { ServicesGrid } from "@/components/marketing/services-grid";
import { PlatformSection } from "@/components/marketing/platform-section";
import { MetricsSection } from "@/components/marketing/metrics-section";
import { PricingSection } from "@/components/marketing/pricing-section";
import { ResourcesSection } from "@/components/marketing/resources-section";
import { CtaSection } from "@/components/marketing/cta-section";

export default function HomePage() {
  return (
    <main>
      <Hero />
      <ServicesGrid />
      <PlatformSection />
      <MetricsSection />
      <PricingSection />
      <ResourcesSection />
      <CtaSection />
    </main>
  );
}

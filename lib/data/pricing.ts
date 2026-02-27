export interface PricingTier {
  id: string;
  tier: string;
  description: string;
  engagementLabel: string;
  engagementValue: string;
  ctaText: string;
}

export const pricingTiers: PricingTier[] = [
  {
    id: "advisory",
    tier: "Strategic Advisory",
    description:
      "Expert-led AI strategy, digital transformation roadmapping, and business consultancy — from assessment through implementation.",
    engagementLabel: "Typical engagements from",
    engagementValue: "$25,000",
    ctaText: "Schedule a consultation",
  },
  {
    id: "managed",
    tier: "Managed AI Operations",
    description:
      "Ongoing platform access, AI agent orchestration, technical support, and dedicated engineering — your AI team on demand.",
    engagementLabel: "Typical engagements from",
    engagementValue: "$50,000",
    ctaText: "Talk to our team",
  },
  {
    id: "enterprise",
    tier: "Enterprise Transformation",
    description:
      "Full-scale digital transformation programs combining business consultancy, custom software development, and managed AI platforms.",
    engagementLabel: "Scoping",
    engagementValue: "Custom",
    ctaText: "Request a proposal",
  },
];

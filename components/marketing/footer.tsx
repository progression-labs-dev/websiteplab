import Link from "next/link";
import Image from "next/image";

const footerColumns = [
  {
    title: "Services",
    links: [
      { label: "Digital Transformation Advisory", href: "/#services" },
      { label: "Business Intelligence & Analytics", href: "/#services" },
      { label: "Strategic AI Roadmapping", href: "/#services" },
      { label: "AI Platform & AIaaS", href: "/#services" },
      { label: "Custom Software Development", href: "/#services" },
      { label: "AI Research & Consultancy", href: "/#services" },
    ],
  },
  {
    title: "Platform",
    links: [
      { label: "AI Agent Orchestration", href: "/#platform" },
      { label: "Data Pipeline Management", href: "/#platform" },
      { label: "Analytics Dashboard", href: "/#platform" },
      { label: "Integration Hub", href: "/#platform" },
      { label: "Progression OS", href: "/login" },
      { label: "Documentation", href: "#" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "#" },
      { label: "Careers", href: "#" },
      { label: "Blog", href: "/#resources" },
      { label: "Contact", href: "/#contact" },
      { label: "Security", href: "#" },
      { label: "Status", href: "#" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="bg-black text-white py-20 pb-10">
      <div className="max-w-container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1fr] gap-8 lg:gap-12 mb-16">
          {/* Brand column */}
          <div>
            <Image
              src="/logo-white.png"
              alt="Progression Labs"
              width={36}
              height={24}
              className="h-6 w-auto mb-3"
            />
            <div className="text-[17px] font-semibold tracking-[-0.03em] mb-3">
              Progression Labs
            </div>
            <p className="text-sm leading-relaxed text-white/50 mb-6">
              AI consultancy and technology partner. We build production-ready
              artificial intelligence systems, provide strategic business
              advisory, and operate managed AI platforms for enterprise clients.
            </p>
            <a
              href="https://twitter.com/WeAreProgression"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[15px] font-medium text-salmon inline-flex items-center gap-1.5 mb-2"
            >
              @WeAreProgression
            </a>
            <div className="text-[13px] text-white/40">
              WeAreProgression&trade; &mdash; Where strategy meets intelligence.
            </div>
          </div>

          {/* Link columns */}
          {footerColumns.map((col) => (
            <div key={col.title}>
              <h5 className="text-[13px] font-semibold tracking-[0.06em] uppercase text-white/40 mb-5">
                {col.title}
              </h5>
              {col.links.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="block text-sm text-white/70 py-1.5 hover:text-white transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          ))}
        </div>

        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <span className="text-[13px] text-white/40">
            &copy; 2026 Progression Labs. All rights reserved.
          </span>
          <div className="flex gap-6">
            {["Privacy Policy", "Terms of Service", "Cookie Policy"].map(
              (item) => (
                <a
                  key={item}
                  href="#"
                  className="text-[13px] text-white/40 hover:text-white/70 transition-colors"
                >
                  {item}
                </a>
              )
            )}
          </div>
        </div>
      </div>
    </footer>
  );
}

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { PHProvider } from "./providers";
import { CONTACT_EMAIL, LINKEDIN_URL } from "./experiment/data/siteContent";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-inter",
});

const SITE_URL = "https://www.progressionlabs.com";

// JSON-LD structured data for SEO / GEO (AI answer engines). ProfessionalService
// is the most accurate schema.org type for an AI consultancy and inherits all
// Organization properties. Values are sourced from siteContent.ts where possible.
const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  "@id": `${SITE_URL}/#organization`,
  name: "Progression Labs",
  url: SITE_URL,
  logo: { "@type": "ImageObject", url: `${SITE_URL}/logo-black.png` },
  image: `${SITE_URL}/logo-black.png`,
  description:
    "Progression Labs is an AI consultancy and AWS Select Tier Technology Partner delivering business transformation through production-ready artificial intelligence systems, strategic advisory, and managed AI platforms.",
  slogan: "AI systems that work in production — not just in demos.",
  email: CONTACT_EMAIL,
  sameAs: [LINKEDIN_URL],
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "sales",
    email: CONTACT_EMAIL,
    availableLanguage: ["en"],
  },
  areaServed: { "@type": "GeoShape", name: "Worldwide" },
  knowsAbout: [
    "Artificial Intelligence",
    "AI Agents",
    "Large Language Models",
    "AI Strategy",
    "Machine Learning Engineering",
    "AI Transformation",
    "Generative AI",
    "AI Product Development",
    "MLOps",
    "AWS",
  ],
  award: "AWS Select Tier Technology Partner",
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Progression Labs",
    template: "%s | Progression Labs",
  },
  description:
    "Progression Labs is an AI consultancy and AWS Select Tier Technology Partner delivering business transformation through production-ready artificial intelligence systems, strategic advisory, and managed AI platforms.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "Progression Labs",
    description: "AI systems that work in production — not just in demos.",
    type: "website",
    url: SITE_URL,
    siteName: "Progression Labs",
    images: [{ url: "/logo-white.png", alt: "Progression Labs" }],
  },
  twitter: {
    card: "summary",
    title: "Progression Labs",
    description: "AI systems that work in production — not just in demos.",
    images: ["/logo-white.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('pl-theme');if(t==='light'||t==='dark')document.documentElement.setAttribute('data-theme',t)}catch(e){}})()`,
          }}
        />
        {/* JSON-LD structured data for SEO / GEO (AI answer engines) */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
      </head>
      <body className={`${inter.variable} font-sans`}>
        <PHProvider>{children}</PHProvider>
      </body>
    </html>
  );
}

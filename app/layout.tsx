import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { AuthProvider } from "@/lib/auth-context";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Progression Labs — AI Consultancy & Technology Partner",
  description:
    "Progression Labs is an AI consultancy and technology partner delivering business transformation through production-ready artificial intelligence systems, strategic advisory, and managed AI platforms.",
  openGraph: {
    title: "Progression Labs — AI Consultancy & Technology Partner",
    description: "AI systems that work in production — not just in demos.",
    type: "website",
    url: "https://progressionlabs.com",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans`}>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}

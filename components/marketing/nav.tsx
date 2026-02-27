"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

export function Nav() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 h-16 bg-[rgba(245,245,245,0.85)] backdrop-blur-[20px] border-b border-[rgba(0,0,0,0.08)] z-[1000] transition-all duration-300">
        <div className="max-w-container mx-auto px-6 h-full flex items-center justify-between gap-8">
          <Link href="/" className="flex items-center gap-2.5 flex-shrink-0">
            <Image
              src="/logo-black.png"
              alt="Progression Labs"
              width={36}
              height={24}
              className="h-6 w-auto"
            />
            <span className="text-[17px] font-semibold tracking-[-0.03em] text-black">
              Progression Labs
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <Link href="/services" className="text-sm font-[450] text-text-secondary hover:text-black transition-colors tracking-[-0.01em]">
              Services
            </Link>
            <Link href="/#platform" className="text-sm font-[450] text-text-secondary hover:text-black transition-colors tracking-[-0.01em]">
              Platform
            </Link>
            <Link href="/#pricing" className="text-sm font-[450] text-text-secondary hover:text-black transition-colors tracking-[-0.01em]">
              Pricing
            </Link>
            <Link href="/#resources" className="text-sm font-[450] text-text-secondary hover:text-black transition-colors tracking-[-0.01em]">
              Resources
            </Link>
          </div>

          <div className="flex items-center gap-3 flex-shrink-0">
            <Link
              href="/login"
              className="text-sm font-medium text-black px-5 py-2 border-[1.5px] border-[rgba(0,0,0,0.15)] rounded-pill hover:border-black hover:bg-[rgba(0,0,0,0.03)] transition-all duration-200"
            >
              Log in
            </Link>
            <Link
              href="/#contact"
              className="hidden md:inline-flex text-sm font-medium text-black bg-salmon px-5 py-2 rounded-pill hover:bg-salmon-hover transition-all duration-200"
            >
              Get Started
            </Link>

            <button
              className="flex md:hidden flex-col gap-[5px] p-2"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
            >
              <span className={`block w-5 h-[1.5px] bg-black transition-all ${mobileOpen ? "rotate-45 translate-y-[6.5px]" : ""}`} />
              <span className={`block w-5 h-[1.5px] bg-black transition-all ${mobileOpen ? "opacity-0" : ""}`} />
              <span className={`block w-5 h-[1.5px] bg-black transition-all ${mobileOpen ? "-rotate-45 -translate-y-[6.5px]" : ""}`} />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile menu */}
      <div
        className={`fixed top-16 left-0 right-0 bottom-0 bg-smoke z-[999] p-8 flex-col gap-2 ${
          mobileOpen ? "flex" : "hidden"
        }`}
      >
        {[
          { label: "Services", href: "/services" },
          { label: "Platform", href: "/#platform" },
          { label: "Pricing", href: "/#pricing" },
          { label: "Resources", href: "/#resources" },
        ].map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className="text-lg font-medium py-3 border-b border-[rgba(0,0,0,0.08)]"
            onClick={() => setMobileOpen(false)}
          >
            {item.label}
          </Link>
        ))}
        <Link
          href="/login"
          className="mt-4 text-center py-3 border-[1.5px] border-[rgba(0,0,0,0.15)] rounded-pill font-medium"
          onClick={() => setMobileOpen(false)}
        >
          Log in
        </Link>
        <Link
          href="/#contact"
          className="text-center py-3 bg-salmon rounded-pill font-medium"
          onClick={() => setMobileOpen(false)}
        >
          Get Started
        </Link>
      </div>
    </>
  );
}

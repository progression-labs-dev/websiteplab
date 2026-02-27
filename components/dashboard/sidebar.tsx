"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const navItems = [
  {
    label: "Overview",
    href: "/app",
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <rect x="1" y="1" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
        <rect x="10" y="1" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
        <rect x="1" y="10" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
        <rect x="10" y="10" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    ),
  },
  {
    label: "Projects",
    href: "/app/projects",
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <path d="M2 5.5L9 2L16 5.5V12.5L9 16L2 12.5V5.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M2 5.5L9 9M9 9L16 5.5M9 9V16" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    ),
  },
  {
    label: "Invoices",
    href: "/app/invoices",
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <rect x="3" y="1" width="12" height="16" rx="2" stroke="currentColor" strokeWidth="1.5" />
        <line x1="6" y1="5" x2="12" y2="5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="6" y1="9" x2="12" y2="9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="6" y1="13" x2="9" y2="13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    label: "Clients",
    href: "/app/clients",
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <circle cx="9" cy="6" r="3.5" stroke="currentColor" strokeWidth="1.5" />
        <path d="M2.5 16.5C2.5 13.5 5.5 11 9 11C12.5 11 15.5 13.5 15.5 16.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    label: "Reports",
    href: "/app/reports",
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <polyline points="2,14 6,8 10,10 16,4" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <polyline points="12,4 16,4 16,8" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-[240px] h-screen bg-white border-r border-[rgba(0,0,0,0.08)] flex flex-col fixed left-0 top-0 z-50">
      {/* Logo area */}
      <div className="h-16 px-5 flex items-center gap-2.5 border-b border-[rgba(0,0,0,0.08)]">
        <Image
          src="/logo-black.png"
          alt="Progression Labs"
          width={24}
          height={16}
          className="h-4 w-auto"
        />
        <span className="text-[15px] font-semibold tracking-[-0.03em]">
          Progression OS
        </span>
      </div>

      {/* Nav items */}
      <nav className="flex-1 py-4 px-3">
        {navItems.map((item) => {
          const isActive =
            item.href === "/app"
              ? pathname === "/app"
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-sm text-sm font-medium transition-colors mb-0.5",
                isActive
                  ? "bg-smoke text-black"
                  : "text-text-secondary hover:bg-smoke/50 hover:text-black"
              )}
            >
              <span className={isActive ? "text-black" : "text-text-tertiary"}>
                {item.icon}
              </span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-5 py-4 border-t border-[rgba(0,0,0,0.08)]">
        <p className="text-[11px] text-text-tertiary">
          Progression OS v1.0
        </p>
      </div>
    </aside>
  );
}

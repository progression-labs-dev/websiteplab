"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Badge } from "@/components/ui/badge";

export function TopBar() {
  const router = useRouter();
  const { logout, user } = useAuth();

  function handleLogout() {
    logout();
    router.push("/");
  }

  return (
    <header className="h-16 bg-white border-b border-[rgba(0,0,0,0.08)] flex items-center justify-between px-8 sticky top-0 z-40">
      <div className="flex items-center gap-3">
        <h1 className="text-[15px] font-semibold tracking-[-0.02em]">
          Progression OS
        </h1>
        <Badge variant="orchid">Beta</Badge>
      </div>

      <div className="flex items-center gap-4">
        <span className="text-sm text-text-tertiary hidden sm:block">
          {user?.email}
        </span>
        <div className="w-8 h-8 rounded-full bg-orchid/10 flex items-center justify-center text-orchid text-xs font-semibold">
          {user?.email?.charAt(0).toUpperCase() || "D"}
        </div>
        <button
          onClick={handleLogout}
          className="text-sm text-text-secondary hover:text-black transition-colors"
        >
          Logout
        </button>
      </div>
    </header>
  );
}

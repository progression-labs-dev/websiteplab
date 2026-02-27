"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { Badge } from "@/components/ui/badge";
import { Input, Label } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  const router = useRouter();
  const { login, isAuthenticated } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Redirect if already logged in
  if (isAuthenticated) {
    router.push("/app");
    return null;
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Simulate a slight delay for realism
    setTimeout(() => {
      const success = login(email, password);
      if (success) {
        router.push("/app");
      } else {
        setError("Invalid credentials. Please check your email and password.");
        setLoading(false);
      }
    }, 600);
  }

  return (
    <div className="min-h-screen bg-smoke flex items-center justify-center px-6">
      <div className="w-full max-w-[420px]">
        <div className="bg-white rounded-md border border-[rgba(0,0,0,0.08)] p-10">
          {/* Header */}
          <div className="flex flex-col items-center mb-8">
            <Link href="/" className="flex items-center gap-2.5 mb-4">
              <Image
                src="/logo-black.png"
                alt="Progression Labs"
                width={36}
                height={24}
                className="h-6 w-auto"
              />
              <span className="text-[17px] font-semibold tracking-[-0.03em]">
                Progression Labs
              </span>
            </Link>
            <Badge variant="orchid">Private Beta</Badge>
          </div>

          {/* Title */}
          <h1 className="text-xl font-medium tracking-[-0.02em] text-center mb-1">
            Sign in to Progression OS
          </h1>
          <p className="text-sm text-text-tertiary text-center mb-8">
            Access your AI operations dashboard
          </p>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="demo@progressionlabs.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {error && (
              <p className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded-sm">
                {error}
              </p>
            )}

            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign in"}
            </Button>
          </form>

          <p className="text-xs text-text-tertiary text-center mt-6">
            Demo credentials: demo@progressionlabs.com / progression-demo
          </p>
        </div>

        <p className="text-center mt-6">
          <Link
            href="/"
            className="text-sm text-text-tertiary hover:text-black transition-colors"
          >
            &larr; Back to progressionlabs.com
          </Link>
        </p>
      </div>
    </div>
  );
}

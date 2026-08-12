"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Sparkles, ArrowRight, Lock, Mail, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth/client";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { toast } from "sonner";

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    try {
      const res = await authClient.signIn.email({
        email,
        password,
      });

      if (res.error) {
        setErrorMessage(res.error.message || "Invalid email or password.");
      } else {
        toast.success("Welcome back to PromptForge");
        router.push("/playground");
      }
    } catch {
      setErrorMessage("Unable to connect to authentication service.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-background p-4 sm:p-6">
      {/* Top bar header */}
      <div className="flex items-center justify-between max-w-6xl w-full mx-auto">
        <Link
          href="/"
          className="flex items-center gap-2 font-bold tracking-tight text-foreground hover:opacity-90 transition-opacity"
        >
          <div className="flex h-7 w-7 items-center justify-center rounded bg-primary text-primary-foreground shadow-xs">
            <Sparkles className="h-4 w-4" />
          </div>
          <span className="text-sm font-semibold tracking-wide">
            Prompt<span className="text-primary">Forge</span>
          </span>
        </Link>
        <ThemeToggle />
      </div>

      {/* Main card */}
      <div className="w-full max-w-md mx-auto my-auto py-8">
        <div className="rounded-[var(--radius-panel)] border border-border bg-surface p-6 sm:p-8 shadow-xl space-y-6">
          <div className="space-y-1.5 text-center">
            <h1 className="text-xl font-bold tracking-tight text-foreground">
              Sign In to PromptForge
            </h1>
            <p className="text-xs text-muted-foreground">
              Enter your credentials to access your system prompts and playgrounds.
            </p>
          </div>

          {errorMessage && (
            <div className="flex items-center gap-2 rounded border border-destructive/20 bg-destructive/10 p-3 text-xs text-destructive">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label
                htmlFor="email"
                className="text-xs font-medium text-muted-foreground"
              >
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground/70" />
                <Input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="pl-9 h-9 text-xs"
                />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="text-xs font-medium text-muted-foreground"
                >
                  Password
                </label>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground/70" />
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="pl-9 h-9 text-xs"
                />
              </div>
            </div>

            <Button
              type="submit"
              isLoading={isLoading}
              className="w-full text-xs font-semibold h-9 gap-1.5 mt-2"
            >
              Sign In
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </form>

          <div className="pt-2 text-center text-xs text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link
              href="/sign-up"
              className="font-medium text-primary hover:underline"
            >
              Create account
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center text-[11px] text-muted-foreground/60 py-4">
        PromptForge — Professional LLM System Prompt Workbench
      </div>
    </div>
  );
}

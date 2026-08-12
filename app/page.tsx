import Link from "next/link";
import {
  Sparkles,
  ArrowRight,
  Variable,
  Layers,
  History,
  Code2,
  Cpu,
  Shield,
  Terminal,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { getServerSession } from "@/lib/auth/session";
import { Suspense } from "react";
import { AuthAwareCTA } from "@/components/layout/auth-aware-cta";


export default function LandingPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen flex items-center justify-center">
          Loading...
        </main>
      }
    >
      <LandingPageContent />
    </Suspense>
  );
}

async function LandingPageContent() {
  const session = await getServerSession();

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground selection:bg-primary/20 selection:text-primary">
      {/* Navigation Header */}
      <header className="sticky top-0 z-40 w-full border-b border-border bg-surface/80 backdrop-blur-md">
        <div className="flex h-16 max-w-7xl items-center justify-between px-4 sm:px-8 mx-auto">
          <div className="flex items-center gap-2.5 font-bold tracking-tight text-foreground">
            <div className="flex h-8 w-8 items-center justify-center rounded bg-primary text-primary-foreground shadow-sm">
              <Sparkles className="h-4.5 w-4.5" />
            </div>
            <span className="text-base font-bold tracking-wide">
              Prompt<span className="text-primary">Forge</span>
            </span>
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            {session ? (
              <Link
                href="/playground"
                className="inline-flex items-center justify-center font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring select-none rounded-[var(--radius-control)] bg-primary text-primary-foreground hover:bg-primary-hover shadow-sm h-8 px-3 text-xs gap-1.5 font-semibold"
              >
                Open Workbench
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            ) : (
              <>
                <Link
                  href="/sign-in"
                  className="inline-flex items-center justify-center font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring select-none rounded-[var(--radius-control)] text-muted-foreground hover:text-foreground hover:bg-surface-elevated h-8 px-3 text-xs"
                >
                  Sign In
                </Link>
                <Link
                  href="/sign-up"
                  className="inline-flex items-center justify-center font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring select-none rounded-[var(--radius-control)] bg-primary text-primary-foreground hover:bg-primary-hover shadow-sm h-8 px-3 text-xs gap-1.5 font-semibold"
                >
                  Get Started
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-20 md:pt-24 md:pb-28">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3.5 py-1 text-xs font-semibold text-primary">
            <Zap className="h-3.5 w-3.5" />
            <span>Developer-First LLM System Prompt Workbench</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-foreground leading-[1.15]">
            Engineered Prompts. <br />
            <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
              Measurable, Reproducible, Production-Ready.
            </span>
          </h1>

          <p className="max-w-2xl mx-auto text-sm sm:text-base text-muted-foreground leading-relaxed">
            Stop guessing model behavior in raw chat windows. Parameterize
            instructions with real-time variable extraction, stream parallel
            comparisons, track immutable versions, and export production code in
            seconds.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
            <Link
              href={session ? "/playground" : "/sign-up"}
              className="inline-flex items-center justify-center font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring select-none rounded-[var(--radius-control)] bg-primary text-primary-foreground hover:bg-primary-hover shadow-md h-11 px-6 text-sm font-semibold gap-2"
            >
              Launch Workbench
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/sign-in"
              className="inline-flex items-center justify-center font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring select-none rounded-[var(--radius-control)] border border-border bg-transparent text-foreground hover:bg-surface-elevated h-11 px-6 text-sm"
            >
              Sign In to Library
            </Link>
          </div>
        </div>

        {/* Interactive Workspace Preview Mockup */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 mt-12">
          <div className="rounded-[var(--radius-panel)] border border-border bg-surface p-2 sm:p-3 shadow-2xl">
            {/* Fake top bar */}
            <div className="flex items-center justify-between border-b border-border pb-2.5 px-3">
              <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground">
                <span className="h-2.5 w-2.5 rounded-full bg-destructive/80" />
                <span className="h-2.5 w-2.5 rounded-full bg-warning/80" />
                <span className="h-2.5 w-2.5 rounded-full bg-success/80" />
                <span className="ml-2 font-semibold text-foreground">
                  Production API Router Prompt
                </span>
              </div>
              <div className="flex items-center gap-2 text-[11px] font-mono text-muted-foreground">
                <span className="text-success flex items-center gap-1">
                  ● Saved
                </span>
                <span>•</span>
                <span>142 tokens</span>
              </div>
            </div>

            {/* Simulated 3-col playground */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-2.5 pt-2.5 text-xs font-mono">
              {/* Variables */}
              <div className="md:col-span-3 rounded border border-border bg-surface-elevated/40 p-3 space-y-2">
                <div className="text-[11px] font-bold text-primary uppercase">
                  Variables
                </div>
                <div className="space-y-1">
                  <div className="text-[10px] text-muted-foreground">
                    &#123;&#123;role&#125;&#125;
                  </div>
                  <div className="rounded bg-surface px-2 py-1 text-foreground border border-border">
                    Senior Rust Architect
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-[10px] text-muted-foreground">
                    &#123;&#123;language&#125;&#125;
                  </div>
                  <div className="rounded bg-surface px-2 py-1 text-foreground border border-border">
                    Rust / Tokio
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-[10px] text-muted-foreground">
                    &#123;&#123;tone&#125;&#125;
                  </div>
                  <div className="rounded bg-surface px-2 py-1 text-foreground border border-border">
                    Strict & Idiomatic
                  </div>
                </div>
              </div>

              {/* Editor */}
              <div className="md:col-span-5 rounded border border-border bg-editor-background p-3 text-foreground leading-relaxed">
                <div className="text-[11px] font-bold text-muted-foreground uppercase mb-2">
                  Prompt Template
                </div>
                <p>
                  You are a{" "}
                  <span className="text-primary font-bold">
                    &#123;&#123;role&#125;&#125;
                  </span>{" "}
                  specialized in concurrent microservices.
                </p>
                <p className="mt-2">
                  Provide idiomatic code in{" "}
                  <span className="text-primary font-bold">
                    &#123;&#123;language&#125;&#125;
                  </span>{" "}
                  adhering to safety constraints.
                </p>
                <p className="mt-2">
                  Adopt a{" "}
                  <span className="text-primary font-bold">
                    &#123;&#123;tone&#125;&#125;
                  </span>{" "}
                  posture. Explain zero-cost abstractions.
                </p>
              </div>

              {/* Stream Output */}
              <div className="md:col-span-4 rounded border border-border bg-surface-elevated/40 p-3 text-muted-foreground space-y-2">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-bold text-success uppercase">
                    gpt-4o-mini [Streamed]
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    0.84s • $0.00012
                  </span>
                </div>
                <p className="text-[11px] text-foreground leading-relaxed">
                  Under Tokio concurrency model, using{" "}
                  <code className="text-primary">mpsc::channel</code> ensures
                  bounded backpressure across worker threads without heap
                  allocations...
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Pillars */}
      <section className="border-t border-border bg-surface/50 py-16 sm:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              Built for Professional Prompt Engineers
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-muted-foreground">
              Everything you need to iterate, measure, and deploy system prompts
              without context switching.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="rounded-[var(--radius-panel)] border border-border bg-surface p-6 shadow-2xs space-y-3">
              <div className="h-9 w-9 rounded bg-primary/10 flex items-center justify-center text-primary">
                <Variable className="h-5 w-5" />
              </div>
              <h3 className="text-base font-semibold text-foreground">
                Dynamic Variable Parsing
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Automatic detection of{" "}
                <code className="text-primary font-mono text-[11px]">
                  &#123;&#123;placeholders&#125;&#125;
                </code>{" "}
                as you type. Real-time preview rendering with missing parameter
                diagnostics.
              </p>
            </div>

            <div className="rounded-[var(--radius-panel)] border border-border bg-surface p-6 shadow-2xs space-y-3">
              <div className="h-9 w-9 rounded bg-primary/10 flex items-center justify-center text-primary">
                <Layers className="h-5 w-5" />
              </div>
              <h3 className="text-base font-semibold text-foreground">
                Parallel Model Comparison
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Run OpenAI and Anthropic models in side-by-side split streams.
                Compare latencies, token counts, and outputs simultaneously.
              </p>
            </div>

            <div className="rounded-[var(--radius-panel)] border border-border bg-surface p-6 shadow-2xs space-y-3">
              <div className="h-9 w-9 rounded bg-primary/10 flex items-center justify-center text-primary">
                <History className="h-5 w-5" />
              </div>
              <h3 className="text-base font-semibold text-foreground">
                Immutable Version Snapshots
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Freeze prompt configurations into permanent snapshots. Compare
                historical diffs and restore previous working states with zero
                data loss.
              </p>
            </div>

            <div className="rounded-[var(--radius-panel)] border border-border bg-surface p-6 shadow-2xs space-y-3">
              <div className="h-9 w-9 rounded bg-primary/10 flex items-center justify-center text-primary">
                <Code2 className="h-5 w-5" />
              </div>
              <h3 className="text-base font-semibold text-foreground">
                1-Click Code Exporters
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Export tested prompts directly into copy-pasteable TypeScript,
                Python, or cURL code with safe parameterization and key
                placeholders.
              </p>
            </div>

            <div className="rounded-[var(--radius-panel)] border border-border bg-surface p-6 shadow-2xs space-y-3">
              <div className="h-9 w-9 rounded bg-primary/10 flex items-center justify-center text-primary">
                <Shield className="h-5 w-5" />
              </div>
              <h3 className="text-base font-semibold text-foreground">
                Zero-Trust BYOK Security
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Provider keys are kept in memory only for the active session.
                Never stored in localStorage, URLs, analytics, or persistent
                databases.
              </p>
            </div>

            <div className="rounded-[var(--radius-panel)] border border-border bg-surface p-6 shadow-2xs space-y-3">
              <div className="h-9 w-9 rounded bg-primary/10 flex items-center justify-center text-primary">
                <Cpu className="h-5 w-5" />
              </div>
              <h3 className="text-base font-semibold text-foreground">
                Accurate Token & Cost Math
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Live cl100k_base tokenizer calculations alongside
                provider-specific cost approximations for transparent
                development economics.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-border py-8 text-center text-xs text-muted-foreground">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} PromptForge. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link
              href="/playground"
              className="hover:text-foreground transition-colors"
            >
              Playground
            </Link>
            <Link
              href="/prompts"
              className="hover:text-foreground transition-colors"
            >
              Library
            </Link>
            <Link
              href="/settings"
              className="hover:text-foreground transition-colors"
            >
              Settings
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

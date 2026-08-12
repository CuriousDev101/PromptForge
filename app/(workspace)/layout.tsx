import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/auth/session";
import { AppShell } from "@/components/layout/app-shell";

async function AuthenticatedWorkspace({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession();

  if (!session) {
    redirect("/sign-in");
  }

  return <AppShell>{children}</AppShell>;
}

export default function WorkspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-background">
          <p className="text-sm text-muted-foreground">
            Checking your session...
          </p>
        </div>
      }
    >
      <AuthenticatedWorkspace>{children}</AuthenticatedWorkspace>
    </Suspense>
  );
}

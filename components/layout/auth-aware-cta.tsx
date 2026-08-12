import { getServerSession } from "@/lib/auth/session";

export async function AuthAwareCTA() {
  const session = await getServerSession();

  if (session?.user) {
    return (
      <a
        href="/playground"
        className="inline-flex items-center justify-center rounded bg-primary px-5 py-3 text-sm font-medium text-white"
      >
        Open Playground
      </a>
    );
  }

  return (
    <a
      href="/sign-in"
      className="inline-flex items-center justify-center rounded bg-primary px-5 py-3 text-sm font-medium text-white"
    >
      Get Started
    </a>
  );
}

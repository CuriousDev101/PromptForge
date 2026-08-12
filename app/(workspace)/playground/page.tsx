import { Suspense } from "react";
import PlaygroundClient from "./playground-client";

export default function PlaygroundPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-[calc(100vh-3.5rem)] items-center justify-center bg-background">
          <p className="text-sm text-muted-foreground">Loading playground...</p>
        </div>
      }
    >
      <PlaygroundClient />
    </Suspense>
  );
}

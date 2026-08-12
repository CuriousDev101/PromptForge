import * as React from "react";
import { Loader2 } from "lucide-react";

export function LoadingState({ message = "Loading..." }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center text-muted-foreground">
      <Loader2 className="h-6 w-6 animate-spin text-primary" />
      <p className="mt-2 text-xs">{message}</p>
    </div>
  );
}

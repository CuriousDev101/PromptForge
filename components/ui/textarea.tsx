import * as React from "react";

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className = "", error, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={`w-full rounded-[var(--radius-control)] border bg-surface p-3 text-sm text-foreground placeholder:text-muted-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-50 ${
          error
            ? "border-destructive focus-visible:ring-destructive"
            : "border-border focus-visible:ring-focus-ring"
        } ${className}`}
        {...props}
      />
    );
  }
);

Textarea.displayName = "Textarea";

import * as React from "react";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className = "", error, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={`h-9 w-full rounded-[var(--radius-control)] border bg-surface px-3 py-1 text-sm text-foreground placeholder:text-muted-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-50 ${
          error
            ? "border-destructive focus-visible:ring-destructive"
            : "border-border focus-visible:ring-focus-ring"
        } ${className}`}
        {...props}
      />
    );
  }
);

Input.displayName = "Input";

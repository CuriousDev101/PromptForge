import * as React from "react";
import { ChevronDown } from "lucide-react";

export interface SelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: boolean;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className = "", children, error, ...props }, ref) => {
    return (
      <div className="relative w-full">
        <select
          ref={ref}
          className={`h-9 w-full appearance-none rounded-[var(--radius-control)] border bg-surface px-3 pr-8 text-sm text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer ${
            error
              ? "border-destructive focus-visible:ring-destructive"
              : "border-border focus-visible:ring-focus-ring"
          } ${className}`}
          {...props}
        >
          {children}
        </select>
        <ChevronDown className="pointer-events-none absolute right-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
      </div>
    );
  }
);

Select.displayName = "Select";

import * as React from "react";
import { Loader2 } from "lucide-react";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "secondary" | "outline" | "ghost" | "destructive";
  size?: "sm" | "md" | "lg" | "icon";
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className = "",
      variant = "default",
      size = "md",
      isLoading = false,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring disabled:opacity-50 disabled:pointer-events-none select-none rounded-[var(--radius-control)] cursor-pointer";

    const variants = {
      default:
        "bg-primary text-primary-foreground hover:bg-primary-hover shadow-sm active:scale-[0.98]",
      secondary:
        "bg-surface-elevated text-foreground hover:bg-border/40 active:scale-[0.98]",
      outline:
        "border border-border bg-transparent text-foreground hover:bg-surface-elevated active:scale-[0.98]",
      ghost:
        "text-muted-foreground hover:text-foreground hover:bg-surface-elevated active:scale-[0.98]",
      destructive:
        "bg-destructive text-white hover:bg-destructive/90 active:scale-[0.98]",
    };

    const sizes = {
      sm: "h-8 px-3 text-xs gap-1.5",
      md: "h-9 px-4 text-sm gap-2",
      lg: "h-10 px-5 text-base gap-2",
      icon: "h-9 w-9 p-0",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
        {...props}
      >
        {isLoading && <Loader2 className="h-4 w-4 animate-spin shrink-0" />}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";

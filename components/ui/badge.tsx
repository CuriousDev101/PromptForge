import * as React from "react";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "outline" | "success" | "warning" | "destructive";
}

export function Badge({
  className = "",
  variant = "default",
  ...props
}: BadgeProps) {
  const base =
    "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium transition-colors select-none";

  const variants = {
    default: "bg-primary/10 text-primary border border-primary/20",
    secondary: "bg-surface-elevated text-muted-foreground border border-border",
    outline: "border border-border text-foreground",
    success: "bg-success/15 text-success border border-success/30",
    warning: "bg-warning/15 text-warning border border-warning/30",
    destructive: "bg-destructive/15 text-destructive border border-destructive/30",
  };

  return (
    <div className={`${base} ${variants[variant]} ${className}`} {...props} />
  );
}

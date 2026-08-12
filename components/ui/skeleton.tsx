import * as React from "react";

export function Skeleton({
  className = "",
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`animate-pulse rounded-[var(--radius-control)] bg-surface-elevated/70 ${className}`}
      {...props}
    />
  );
}

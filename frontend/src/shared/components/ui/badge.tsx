import type { HTMLAttributes } from "react";
import { cn } from "../../lib/utils";

export function Badge({ className, tone = "neutral", ...props }: HTMLAttributes<HTMLSpanElement> & { tone?: "neutral" | "success" | "warning" | "danger" }) {
  const tones = { neutral: "bg-[var(--surface-muted)] text-[var(--ink-muted)]", success: "bg-[var(--success-soft)] text-[var(--success)]", warning: "bg-[var(--warning-soft)] text-[var(--warning)]", danger: "bg-[var(--danger-soft)] text-[var(--danger)]" };
  return <span className={cn("inline-flex items-center rounded-[var(--radius-pill)] px-2.5 py-1 text-xs font-semibold", tones[tone], className)} {...props} />;
}

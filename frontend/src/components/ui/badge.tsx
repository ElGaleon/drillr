import type { HTMLAttributes } from "react";
import { cn } from "../../lib/utils";

export function Badge({ className, tone = "neutral", ...props }: HTMLAttributes<HTMLSpanElement> & { tone?: "neutral" | "success" | "warning" | "danger" }) {
  const tones = { neutral: "bg-[var(--surface-muted)] text-[var(--ink-muted)]", success: "bg-[#e8f2e9] text-[#397046]", warning: "bg-[#fff1d8] text-[#94631a]", danger: "bg-[#fce9e5] text-[#a94839]" };
  return <span className={cn("inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold", tones[tone], className)} {...props} />;
}

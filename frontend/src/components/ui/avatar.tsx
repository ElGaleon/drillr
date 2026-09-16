import type { HTMLAttributes } from "react";
import { cn } from "../../lib/utils";

export function Avatar({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) { return <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--ink)] text-xs font-bold text-white", className)} {...props}>{children}</div>; }

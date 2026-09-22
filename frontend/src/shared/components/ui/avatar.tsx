import type { HTMLAttributes } from "react";
import { cn } from "../../lib/utils";

export function Avatar({ className, children, imageUrl, ...props }: HTMLAttributes<HTMLDivElement> & { imageUrl?: string | null }) { return <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[var(--ink)] text-xs font-bold text-[var(--on-ink)]", className)} {...props}>{imageUrl ? <img className="h-full w-full object-cover" src={imageUrl} alt="" /> : children}</div>; }

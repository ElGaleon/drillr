import * as DialogPrimitive from "@radix-ui/react-dialog";
import type { HTMLAttributes, ReactNode } from "react";
import { X } from "@phosphor-icons/react";
import { cn } from "../../lib/utils";

export const Dialog = DialogPrimitive.Root;
export const DialogTrigger = DialogPrimitive.Trigger;

export function DialogContent({ className, children, ...props }: DialogPrimitive.DialogContentProps & { children: ReactNode }) {
  return <DialogPrimitive.Portal><DialogPrimitive.Overlay className="fixed inset-0 z-40 bg-[var(--overlay)] backdrop-blur-[2px]" /><DialogPrimitive.Content className={cn("fixed left-1/2 top-1/2 z-50 max-h-[90vh] w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-[var(--radius-card)] border border-[var(--line)] bg-[var(--surface)] p-6 shadow-[var(--shadow-dialog)] focus:outline-none", className)} {...props}>{children}<DialogPrimitive.Close className="absolute right-4 top-4 rounded-[var(--radius-control)] p-1 text-[var(--ink-muted)] hover:bg-[var(--surface-muted)]" aria-label="Close"><X size={18} /></DialogPrimitive.Close></DialogPrimitive.Content></DialogPrimitive.Portal>;
}

export function DialogHeader({ className, ...props }: HTMLAttributes<HTMLDivElement>) { return <div className={cn("mb-5 flex flex-col gap-1", className)} {...props} />; }
export function DialogTitle({ className, ...props }: DialogPrimitive.DialogTitleProps) { return <DialogPrimitive.Title className={cn("font-display text-2xl font-semibold tracking-[-0.03em] text-[var(--ink)]", className)} {...props} />; }
export function DialogDescription({ className, ...props }: DialogPrimitive.DialogDescriptionProps) { return <DialogPrimitive.Description className={cn("text-sm leading-6 text-[var(--ink-muted)]", className)} {...props} />; }

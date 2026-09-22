import type { ButtonHTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/utils";

const sidebarMenuButtonVariants = cva("group flex w-full items-center gap-3 rounded-[var(--radius-control)] text-left text-sm font-semibold outline-none transition-colors focus-visible:ring-2 focus-visible:ring-[var(--ring)] disabled:pointer-events-none disabled:opacity-50", {
  variants: {
    variant: {
      default: "text-[var(--ink-muted)] hover:bg-[var(--sidebar-hover)] hover:text-[var(--ink)]",
      active: "bg-[var(--surface)] text-[var(--ink)] shadow-[var(--shadow-active)]",
    },
    size: {
      default: "min-h-11 px-3",
      compact: "min-h-10 px-2",
    },
  },
  defaultVariants: { variant: "default", size: "default" },
});

export function SidebarMenuButton({ className, variant, size, ...props }: ButtonHTMLAttributes<HTMLButtonElement> & VariantProps<typeof sidebarMenuButtonVariants>) {
  return <button className={cn(sidebarMenuButtonVariants({ variant, size }), className)} {...props} />;
}

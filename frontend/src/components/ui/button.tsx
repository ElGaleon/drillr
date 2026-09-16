import type { ButtonHTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/utils";

const buttonVariants = cva("inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] disabled:pointer-events-none disabled:opacity-50", {
  variants: {
    variant: {
      default: "bg-[var(--ink)] text-white shadow-sm hover:bg-[var(--ink-soft)]",
      secondary: "bg-[var(--surface-muted)] text-[var(--ink)] hover:bg-[var(--line)]",
      outline: "border border-[var(--line-strong)] bg-transparent text-[var(--ink)] hover:bg-[var(--surface-muted)]",
      ghost: "text-[var(--ink-muted)] hover:bg-[var(--surface-muted)] hover:text-[var(--ink)]",
      accent: "bg-[var(--accent)] text-white shadow-sm hover:bg-[var(--accent-deep)]",
    },
    size: { default: "h-10 px-4 py-2", sm: "h-9 rounded-md px-3", lg: "h-12 rounded-xl px-5", icon: "h-10 w-10" },
  },
  defaultVariants: { variant: "default", size: "default" },
});

export function Button({ className, variant, size, ...props }: ButtonHTMLAttributes<HTMLButtonElement> & VariantProps<typeof buttonVariants>) {
  return <button className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}

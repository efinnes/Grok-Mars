import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import type { ButtonHTMLAttributes } from "react";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-[var(--radius-md)] font-medium transition disabled:opacity-40 disabled:pointer-events-none",
  {
    variants: {
      variant: {
        default: "bg-accent text-accent-fg hover:opacity-90",
        outline: "border border-border bg-surface text-fg hover:bg-surface-2",
        ghost: "text-muted hover:text-fg hover:bg-surface-2",
        accent: "bg-hud text-accent-fg hover:opacity-90",
      },
      size: {
        default: "h-10 px-4 text-sm",
        sm: "h-9 px-3 text-xs",
        lg: "h-11 px-5 text-sm",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  },
);

export function Button({
  className,
  variant,
  size,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & VariantProps<typeof buttonVariants>) {
  return <button className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}

"use client";
import * as React from "react";
import { cn } from "@/lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "outline" | "danger";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  icon?: React.ReactNode;
  iconRight?: React.ReactNode;
}

/**
 * Butoane în limbajul „atelier editorial”:
 * primary = cerneală plină, outline = hairline, ghost = discret.
 */
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      loading = false,
      icon,
      iconRight,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const base =
      "inline-flex items-center justify-center gap-2 font-semibold rounded-[8px] transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--paper)] disabled:pointer-events-none disabled:opacity-45 select-none cursor-pointer";

    const variants = {
      primary:
        "bg-[var(--primary)] text-white border border-[var(--primary)] hover:bg-[var(--primary-strong)] hover:border-[var(--primary-strong)] hover:-translate-y-px active:translate-y-0 shadow-[0_1px_2px_rgba(37,99,235,0.3),0_6px_16px_-6px_rgba(37,99,235,0.5)]",
      secondary:
        "bg-[var(--muted)] text-[var(--ink)] border border-[var(--border)] hover:bg-[#e2e8f0]",
      ghost:
        "bg-transparent text-[var(--muted-foreground)] hover:text-[var(--ink)] hover:bg-[rgba(15,23,42,0.05)]",
      outline:
        "border-[1.5px] border-[var(--border)] bg-white text-[var(--ink)] hover:border-[var(--ink)] hover:bg-[#f8fafc]",
      danger:
        "bg-[var(--red,#dc2626)] text-white border border-transparent hover:opacity-90 shadow-[var(--shadow-paper)]",
    };

    const sizes = {
      sm: "text-[13.5px] px-3.5 h-9",
      md: "text-[15px] px-5 h-11",
      lg: "text-[16px] px-7 h-[52px]",
    };

    return (
      <button
        ref={ref}
        className={cn(base, variants[variant], sizes[size], className)}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
        ) : (
          icon
        )}
        {children}
        {!loading && iconRight}
      </button>
    );
  }
);

Button.displayName = "Button";

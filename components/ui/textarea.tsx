"use client";
import * as React from "react";
import { cn } from "@/lib/utils";

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  hint?: string;
  error?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, hint, error, id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="flex flex-col gap-2 w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="text-[14px] font-semibold text-[var(--ink)] tracking-wide"
          >
            {label}
          </label>
        )}
        <textarea
          id={inputId}
          ref={ref}
          className={cn(
            "w-full rounded-[8px] border border-[var(--input-border)] bg-[var(--card)] px-[16px] py-[14px] text-[15.5px] text-[var(--ink)] leading-relaxed",
            "placeholder:text-[var(--faint)] resize-none",
            "transition-all duration-150 shadow-[inset_0_1px_2px_rgba(15,23,42,0.04)]",
            "focus:outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[rgba(37,99,235,0.18)] focus:bg-white",
            "disabled:bg-[var(--muted)] disabled:text-[var(--faint)]",
            error &&
              "border-[var(--color-error,#dc2626)] focus:border-[var(--color-error,#dc2626)] focus:ring-[rgba(220,38,38,0.15)]",
            className
          )}
          {...props}
        />
        {hint && !error && (
          <p className="text-[13px] text-[var(--muted-foreground)]">{hint}</p>
        )}
        {error && (
          <p className="text-[13px] font-medium text-[var(--color-error,#dc2626)]">{error}</p>
        )}
      </div>
    );
  }
);

Textarea.displayName = "Textarea";

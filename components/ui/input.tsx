"use client";
import * as React from "react";
import { cn } from "@/lib/utils";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  error?: string;
  icon?: React.ReactNode;
  iconRight?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, hint, error, icon, iconRight, id, style, ...props }, ref) => {
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
        <div className="relative flex items-center">
          {icon && (
            <span
              className="absolute text-[var(--faint)] pointer-events-none"
              style={{ left: 14 }}
            >
              {icon}
            </span>
          )}
          <input
            id={inputId}
            ref={ref}
            className={cn(
              "w-full rounded-[8px] border border-[var(--input-border)] bg-[var(--card)] text-[15.5px] text-[var(--ink)]",
              "placeholder:text-[var(--faint)]",
              "transition-all duration-150 shadow-[inset_0_1px_2px_rgba(15,23,42,0.04)]",
              "focus:outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[rgba(244,90,39,0.18)] focus:bg-white",
              "disabled:bg-[var(--muted)] disabled:text-[var(--faint)]",
              error &&
                "border-[var(--color-error,#dc2626)] focus:border-[var(--color-error,#dc2626)] focus:ring-[rgba(220,38,38,0.15)]",
              className
            )}
            style={{
              // padding integral inline — nu depinde de clase Tailwind arbitrare
              paddingTop: 13,
              paddingBottom: 13,
              paddingLeft: icon ? 44 : 16,
              paddingRight: iconRight ? 44 : 16,
              ...style,
            }}
            {...props}
          />
          {iconRight && (
            <span
              className="absolute text-[var(--faint)] pointer-events-none"
              style={{ right: 14 }}
            >
              {iconRight}
            </span>
          )}
        </div>
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

Input.displayName = "Input";

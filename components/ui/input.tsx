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
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="text-lg font-medium text-slate-700"
          >
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {icon && (
            <span className="absolute text-slate-400 pointer-events-none" style={{ left: 16 }}>
              {icon}
            </span>
          )}
          <input
            id={inputId}
            ref={ref}
            className={cn(
              "w-full rounded-[10px] border border-slate-400 bg-white py-3 text-lg text-slate-900",
              "placeholder:text-slate-400",
              "transition-all duration-150",
              "focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100",
              "disabled:bg-slate-50 disabled:text-slate-400",
              error && "border-red-400 focus:border-red-400 focus:ring-red-100",
              className
            )}
            style={{
              paddingLeft: icon ? 56 : 20,
              paddingRight: iconRight ? 56 : 20,
              ...style,
            }}
            {...props}
          />
          {iconRight && (
            <span className="absolute text-slate-400 pointer-events-none" style={{ right: 16 }}>
              {iconRight}
            </span>
          )}
        </div>
        {hint && !error && (
          <p className="text-lg text-slate-500">{hint}</p>
        )}
        {error && (
          <p className="text-lg text-red-500">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

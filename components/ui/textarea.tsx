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
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label htmlFor={inputId} className="text-lg font-medium text-slate-700">
            {label}
          </label>
        )}
        <textarea
          id={inputId}
          ref={ref}
          className={cn(
            "w-full rounded-[10px] border border-slate-400 bg-white px-5 py-3 text-lg text-slate-900",
            "placeholder:text-slate-400 resize-none",
            "transition-all duration-150",
            "focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100",
            "disabled:bg-slate-50 disabled:text-slate-400",
            error && "border-red-400 focus:border-red-400 focus:ring-red-100",
            className
          )}
          {...props}
        />
        {hint && !error && <p className="text-lg text-slate-500">{hint}</p>}
        {error && <p className="text-lg text-red-500">{error}</p>}
      </div>
    );
  }
);

Textarea.displayName = "Textarea";

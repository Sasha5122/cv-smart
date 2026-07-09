"use client";
import * as React from "react";
import { cn } from "@/lib/utils";

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  hint?: string;
  error?: string;
  /** înălțimea maximă până la care crește automat (apoi scroll intern) */
  maxAutoHeight?: number;
}

/** Limita implicită de creștere (~500 de cuvinte vizibile), apoi scroll. */
const DEFAULT_MAX_AUTO_HEIGHT = 560;

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    { className, label, hint, error, id, style, maxAutoHeight = DEFAULT_MAX_AUTO_HEIGHT, ...props },
    ref
  ) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");
    const innerRef = React.useRef<HTMLTextAreaElement | null>(null);
    const minHeightRef = React.useRef<number | null>(null);

    // ref combinat: intern + cel primit din exterior
    const setRefs = React.useCallback(
      (el: HTMLTextAreaElement | null) => {
        innerRef.current = el;
        if (typeof ref === "function") ref(el);
        else if (ref) ref.current = el;
      },
      [ref]
    );

    /** Crește boxul pe verticală odată cu textul, până la maxAutoHeight. */
    const autoResize = React.useCallback(() => {
      const el = innerRef.current;
      if (!el) return;
      if (minHeightRef.current === null) {
        // înălțimea dată de `rows` devine minimul
        minHeightRef.current = el.offsetHeight;
      }
      el.style.height = "auto";
      const target = Math.max(
        minHeightRef.current ?? 0,
        Math.min(el.scrollHeight, maxAutoHeight)
      );
      el.style.height = `${target}px`;
      el.style.overflowY = el.scrollHeight > maxAutoHeight ? "auto" : "hidden";
    }, [maxAutoHeight]);

    // la montare + ori de câte ori valoarea se schimbă (inclusiv programatic,
    // ex. click pe un exemplu rapid care umple câmpul)
    React.useEffect(() => {
      autoResize();
    }, [autoResize, props.value]);

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
          ref={setRefs}
          // padding inline — nu depinde de generarea claselor Tailwind arbitrare
          style={{ padding: "14px 16px", ...style }}
          className={cn(
            "w-full rounded-[8px] border border-[var(--input-border)] bg-[var(--card)] text-[15.5px] text-[var(--ink)] leading-relaxed",
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

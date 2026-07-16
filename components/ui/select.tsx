"use client";
import * as React from "react";
import { cn } from "@/lib/utils";
import { ChevronDown, Check, Search } from "lucide-react";

export interface SelectOption {
  value: string;
  label?: string;
}

interface SelectProps {
  value: string;
  onChange: (value: string) => void;
  options: Array<string | SelectOption>;
  placeholder?: string;
  label?: string;
  error?: string;
  /** câmp de căutare în panou — pentru liste lungi (țări, localități) */
  searchable?: boolean;
  disabled?: boolean;
  id?: string;
  className?: string;
}

const ITEM_HEIGHT = 42;
/** regulă generală de design: maximum ~7 elemente vizibile, apoi scroll intern */
const MAX_VISIBLE = 7;

function normalize(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    // elimină diacriticele (combining marks) ca să caute și fără ele
    .replace(/[̀-ͯ]/g, "");
}

/**
 * Dropdown custom al aplicației — înlocuiește <select> nativ, pe care browserul
 * îl poate deschide în sus și oricât de lung (bug raportat: lista de județe
 * ieșea din pagină). Se deschide întotdeauna ÎN JOS, afișează max 7 elemente
 * cu scroll intern și folosește stilul vizual al aplicației.
 */
export function Select({
  value,
  onChange,
  options,
  placeholder = "alege...",
  label,
  error,
  searchable = false,
  disabled = false,
  id,
  className,
}: SelectProps) {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [highlight, setHighlight] = React.useState(-1);
  const rootRef = React.useRef<HTMLDivElement>(null);
  const panelRef = React.useRef<HTMLDivElement>(null);
  const listRef = React.useRef<HTMLDivElement>(null);
  const searchRef = React.useRef<HTMLInputElement>(null);

  const items = React.useMemo(
    () =>
      options.map((o) =>
        typeof o === "string" ? { value: o, label: o } : { value: o.value, label: o.label ?? o.value }
      ),
    [options]
  );

  const filtered = React.useMemo(() => {
    if (!query.trim()) return items;
    const q = normalize(query.trim());
    return items.filter((it) => normalize(it.label).includes(q));
  }, [items, query]);

  const selected = items.find((it) => it.value === value);

  // închidere la click în afară
  React.useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  // la deschidere: focus pe căutare + scroll la elementul selectat
  React.useEffect(() => {
    if (!open) {
      setQuery("");
      setHighlight(-1);
      return;
    }
    searchRef.current?.focus();
    const idx = items.findIndex((it) => it.value === value);
    if (idx >= 0) {
      setHighlight(idx);
    }
    requestAnimationFrame(() => {
      if (idx >= 0) {
        listRef.current?.scrollTo({ top: Math.max(0, idx * ITEM_HEIGHT - ITEM_HEIGHT * 2) });
      }
      // panoul deschis rămâne mereu în ecran (pagina derulează cât e nevoie)
      panelRef.current?.scrollIntoView({ block: "nearest", behavior: "instant" as ScrollBehavior });
    });
  }, [open, items, value]);

  const pick = (v: string) => {
    onChange(v);
    setOpen(false);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setOpen(false);
      return;
    }
    if (!open && (e.key === "Enter" || e.key === " " || e.key === "ArrowDown")) {
      e.preventDefault();
      setOpen(true);
      return;
    }
    if (!open) return;
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      const dir = e.key === "ArrowDown" ? 1 : -1;
      const next = Math.min(filtered.length - 1, Math.max(0, highlight + dir));
      setHighlight(next);
      listRef.current
        ?.querySelector(`[data-idx="${next}"]`)
        ?.scrollIntoView({ block: "nearest" });
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (highlight >= 0 && filtered[highlight]) pick(filtered[highlight].value);
    }
  };

  return (
    // min-w-0: într-un grid, dropdown-ul se strânge în loc să provoace
    // overflow orizontal (bug pe mobil: pagina se lărgea peste ecran)
    <div className="flex flex-col gap-2 w-full min-w-0" ref={rootRef}>
      {label && (
        <label
          htmlFor={id}
          className="text-[14px] font-semibold text-[var(--ink)] tracking-wide"
        >
          {label}
        </label>
      )}
      <div className="relative" onKeyDown={onKeyDown}>
        <button
          type="button"
          id={id}
          disabled={disabled}
          onClick={() => setOpen((o) => !o)}
          aria-haspopup="listbox"
          aria-expanded={open}
          style={{ padding: "13px 40px 13px 16px" }}
          className={cn(
            "w-full text-left rounded-[8px] border border-[var(--input-border)] bg-[var(--card)] text-[15.5px]",
            "transition-all duration-150 shadow-[inset_0_1px_2px_rgba(15,23,42,0.04)]",
            "focus:outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[rgba(244,90,39,0.18)]",
            "disabled:bg-[var(--muted)] disabled:text-[var(--faint)]",
            selected ? "text-[var(--ink)]" : "text-[var(--faint)]",
            error &&
              "border-[var(--color-error,#dc2626)] focus:border-[var(--color-error,#dc2626)] focus:ring-[rgba(220,38,38,0.15)]",
            className
          )}
        >
          <span className="block truncate">{selected ? selected.label : placeholder}</span>
          <ChevronDown
            className={cn(
              "w-4 h-4 absolute right-4 top-1/2 -translate-y-1/2 text-[var(--faint)] transition-transform",
              open && "rotate-180"
            )}
          />
        </button>

        {open && (
          <div
            ref={panelRef}
            className="absolute left-0 right-0 z-50 rounded-[10px] border border-[var(--input-border)] bg-white shadow-[0_12px_32px_rgba(15,23,42,0.14)] overflow-hidden"
            style={{ top: "calc(100% + 6px)" }}
            role="listbox"
          >
            {searchable && (
              <div className="flex items-center gap-2 border-b border-[var(--hairline)]" style={{ padding: "10px 14px" }}>
                <Search className="w-4 h-4 text-[var(--faint)] shrink-0" />
                <input
                  ref={searchRef}
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setHighlight(0);
                  }}
                  placeholder="Caută..."
                  className="w-full text-[14.5px] text-[var(--ink)] placeholder:text-[var(--faint)] focus:outline-none bg-transparent"
                />
              </div>
            )}
            <div
              ref={listRef}
              className="overflow-y-auto"
              style={{ maxHeight: ITEM_HEIGHT * MAX_VISIBLE }}
            >
              {filtered.length === 0 && (
                <div className="text-[14px] text-[var(--faint)]" style={{ padding: "12px 16px" }}>
                  Niciun rezultat
                </div>
              )}
              {filtered.map((it, idx) => {
                const isSel = it.value === value;
                return (
                  <button
                    key={it.value}
                    type="button"
                    data-idx={idx}
                    role="option"
                    aria-selected={isSel}
                    onClick={() => pick(it.value)}
                    onMouseEnter={() => setHighlight(idx)}
                    style={{ height: ITEM_HEIGHT, padding: "0 16px" }}
                    className={cn(
                      "w-full flex items-center justify-between text-left text-[15px] transition-colors",
                      idx === highlight ? "bg-[var(--wash)]" : "bg-white",
                      isSel ? "text-[var(--primary)] font-semibold" : "text-[var(--ink)]"
                    )}
                  >
                    <span className="truncate">{it.label}</span>
                    {isSel && <Check className="w-4 h-4 shrink-0 ml-2" />}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
      {error && (
        <p className="text-[13px] font-medium text-[var(--color-error,#dc2626)]">{error}</p>
      )}
    </div>
  );
}

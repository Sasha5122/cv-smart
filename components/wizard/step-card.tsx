"use client";

interface StepCardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
  icon?: React.ReactNode;
  /** etichetă mică deasupra titlului (ex: „Experiență · Pas 1 din 3”) */
  kicker?: string;
}

export function StepCard({ children, className, title, subtitle, kicker }: StepCardProps) {
  return (
    <div className={className} style={{ animation: "fade-in 0.35s cubic-bezier(0.22,1,0.36,1)" }}>
      {title && (
        <div style={{ marginBottom: 34 }}>
          {kicker && (
            <div
              style={{
                display: "inline-block",
                fontSize: 11.5,
                fontWeight: 700,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "var(--primary)",
                backgroundColor: "var(--wash)",
                border: "1px solid #bfdbfe",
                borderRadius: 6,
                padding: "4px 10px",
                marginBottom: 16,
              }}
            >
              {kicker}
            </div>
          )}
          <h2
            style={{
              fontFamily: "var(--font-display), sans-serif",
              fontSize: 30,
              fontWeight: 700,
              color: "var(--ink-strong)",
              marginBottom: 12,
              letterSpacing: "-0.022em",
              lineHeight: 1.18,
            }}
          >
            {title}
          </h2>
          {subtitle && (
            <p
              style={{
                fontSize: 16,
                color: "var(--muted-foreground)",
                lineHeight: 1.65,
                maxWidth: 560,
              }}
            >
              {subtitle}
            </p>
          )}
          <div
            style={{
              width: 52,
              height: 4,
              borderRadius: 99,
              background: "linear-gradient(90deg, var(--primary) 0%, #3b82f6 100%)",
              marginTop: 20,
            }}
          />
        </div>
      )}
      {children}
    </div>
  );
}

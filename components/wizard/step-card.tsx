"use client";

interface StepCardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
  icon?: React.ReactNode;
}

export function StepCard({ children, className, title, subtitle }: StepCardProps) {
  return (
    <div
      className={className}
      style={{ animation: "fadeIn 0.2s ease" }}
    >
      {title && (
        <div style={{ marginBottom: 28 }}>
          <h2 style={{
            fontSize: 36,
            fontWeight: 700,
            color: "#0F172A",
            marginBottom: 8,
            letterSpacing: -0.5,
            lineHeight: 1.2,
          }}>
            {title}
          </h2>
          {subtitle && (
            <p style={{ fontSize: 18, color: "#64748B", lineHeight: 1.6 }}>{subtitle}</p>
          )}
        </div>
      )}
      {children}
    </div>
  );
}

"use client";

interface StepCardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
  icon?: React.ReactNode;
}

export function StepCard({ children, className, title, subtitle, icon }: StepCardProps) {
  return (
    <div
      className={className}
      style={{
        backgroundColor: "#ffffff",
        borderRadius: 16,
        border: "1px solid #E5E7EB",
        boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
        padding: "32px",
        animation: "fadeIn 0.2s ease",
      }}
    >
      {(title || icon) && (
        <div style={{ marginBottom: 24 }}>
          {icon && (
            <div
              style={{
                width: 48,
                height: 48,
                backgroundColor: "#EEEDF8",
                borderRadius: 12,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 16,
                color: "#4F46E5",
              }}
            >
              {icon}
            </div>
          )}
          {title && (
            <h2 style={{ fontSize: 20, fontWeight: 700, color: "#0D0D0D", marginBottom: 4, letterSpacing: -0.3 }}>
              {title}
            </h2>
          )}
          {subtitle && (
            <p style={{ fontSize: 14, color: "#6B7280", lineHeight: 1.6 }}>{subtitle}</p>
          )}
        </div>
      )}
      {children}
    </div>
  );
}

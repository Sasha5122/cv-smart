"use client";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useState } from "react";

const ACCENT = "#4F46E5";
const ACCENT_DARK = "#3730A3";

export function NavCTA() {
  const [hovered, setHovered] = useState(false);
  return (
    <Link
      href="/creare-cv"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        backgroundColor: hovered ? ACCENT_DARK : ACCENT,
        color: "#fff",
        fontWeight: 600,
        fontSize: 14,
        padding: "10px 20px",
        borderRadius: 50,
        textDecoration: "none",
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        transition: "background-color 0.15s",
      }}
    >
      Începe gratuit
      <ArrowRight size={14} />
    </Link>
  );
}

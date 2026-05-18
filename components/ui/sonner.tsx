"use client";
import { Toaster as Sonner, type ToasterProps } from "sonner";

export function Toaster(props: ToasterProps) {
  return (
    <Sonner
      {...props}
      toastOptions={{
        style: {
          fontFamily: "Inter, sans-serif",
          borderRadius: "10px",
        },
      }}
    />
  );
}

"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { ZoomIn, ZoomOut, RotateCcw } from "lucide-react";

/* ────────────────────────────────────────────────────────────────
   Ajustarea încadrării pozei — vizibilă DIRECT după încărcare, fără
   buton intermediar: userul trage poza cu degetul sau cu mouse-ul,
   dă zoom din pinch (telefon), scroll (laptop) sau slider (ambele).
   Crop-ul 600×600 se aplică AUTOMAT (debounce) după fiecare gest;
   „Resetează" revine la încadrarea automată făcută la încărcare.
   Ghidajul rotund arată cum va apărea fața în modelele cu poză cerc.
   ──────────────────────────────────────────────────────────────── */

interface Props {
  /** imaginea completă (photoFull) sau, în lipsă, crop-ul curent */
  src: string;
  /** crop-ul de revenire pentru „Resetează" (încadrarea automată) */
  resetCrop?: string;
  /** primește crop-ul 600×600 după fiecare ajustare a userului */
  onCrop: (dataUrl: string) => void;
}

const OUT_SIZE = 600;
const MAX_ZOOM = 3;
const APPLY_DEBOUNCE_MS = 250;

interface View {
  zoom: number;
  tx: number;
  ty: number;
}

export function PhotoAdjust({ src, resetCrop, onCrop }: Props) {
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const [img, setImg] = useState<HTMLImageElement | null>(null);
  const [vp, setVp] = useState(0);
  // null = încadrarea implicită (centrat, fără zoom) — derivată la randare
  const [view, setView] = useState<View | null>(null);

  // pointerii activi (mouse / degete) — pentru pan și pinch
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const pinchStart = useRef<{ dist: number; zoom: number } | null>(null);
  const applyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const measureRef = useCallback((el: HTMLDivElement | null) => {
    viewportRef.current = el;
    if (el) setVp(el.offsetWidth);
  }, []);

  useEffect(() => {
    const el = new Image();
    el.onload = () => setImg(el);
    el.src = src;
  }, [src]);

  useEffect(
    () => () => {
      if (applyTimer.current) clearTimeout(applyTimer.current);
    },
    []
  );

  const coverScale = img && vp ? vp / Math.min(img.naturalWidth, img.naturalHeight) : 1;

  const clampView = useCallback(
    (zoom: number, tx: number, ty: number): View => {
      const z = Math.min(MAX_ZOOM, Math.max(1, zoom));
      if (!img || !vp) return { zoom: z, tx, ty };
      const s = coverScale * z;
      const w = img.naturalWidth * s;
      const h = img.naturalHeight * s;
      return {
        zoom: z,
        tx: Math.min(0, Math.max(vp - w, tx)),
        ty: Math.min(0, Math.max(vp - h, ty)),
      };
    },
    [img, vp, coverScale]
  );

  // încadrarea efectivă: cea aleasă de user sau, implicit, centrat
  const effective: View =
    view ??
    clampView(
      1,
      img && vp ? (vp - img.naturalWidth * coverScale) / 2 : 0,
      img && vp ? (vp - img.naturalHeight * coverScale) / 2 : 0
    );
  const scale = coverScale * effective.zoom;

  /** crop-ul 600×600 al ferestrei vizibile, în pixelii imaginii-sursă */
  const renderCrop = useCallback(
    (v: View): string | null => {
      if (!img || !vp) return null;
      const canvas = document.createElement("canvas");
      canvas.width = OUT_SIZE;
      canvas.height = OUT_SIZE;
      const ctx = canvas.getContext("2d");
      if (!ctx) return null;
      const s = coverScale * v.zoom;
      ctx.drawImage(img, -v.tx / s, -v.ty / s, vp / s, vp / s, 0, 0, OUT_SIZE, OUT_SIZE);
      return canvas.toDataURL("image/jpeg", 0.9);
    },
    [img, vp, coverScale]
  );

  /** aplică automat crop-ul, la scurt timp după ultimul gest */
  const scheduleApply = useCallback(
    (v: View) => {
      if (applyTimer.current) clearTimeout(applyTimer.current);
      applyTimer.current = setTimeout(() => {
        const url = renderCrop(v);
        if (url) onCrop(url);
      }, APPLY_DEBOUNCE_MS);
    },
    [renderCrop, onCrop]
  );

  const updateView = useCallback(
    (v: View) => {
      setView(v);
      scheduleApply(v);
    },
    [scheduleApply]
  );

  /** aplică un zoom nou păstrând fix punctul (ax, ay) din viewport */
  const zoomAround = useCallback(
    (newZoom: number, ax: number, ay: number) => {
      if (!img || !vp) return;
      const z = Math.min(MAX_ZOOM, Math.max(1, newZoom));
      const sOld = coverScale * effective.zoom;
      const sNew = coverScale * z;
      const nx = ax - ((ax - effective.tx) * sNew) / sOld;
      const ny = ay - ((ay - effective.ty) * sNew) / sOld;
      updateView(clampView(z, nx, ny));
    },
    [img, vp, coverScale, effective, clampView, updateView]
  );

  // scroll pe laptop — listener non-pasiv ca preventDefault să oprească
  // derularea paginii
  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const rect = el.getBoundingClientRect();
      zoomAround(
        effective.zoom * (e.deltaY < 0 ? 1.08 : 1 / 1.08),
        e.clientX - rect.left,
        e.clientY - rect.top
      );
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [effective.zoom, zoomAround]);

  const onPointerDown = (e: React.PointerEvent) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.current.size === 2) {
      const [a, b] = [...pointers.current.values()];
      pinchStart.current = { dist: Math.hypot(a.x - b.x, a.y - b.y), zoom: effective.zoom };
    }
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const prev = pointers.current.get(e.pointerId);
    if (!prev) return;
    const cur = { x: e.clientX, y: e.clientY };
    pointers.current.set(e.pointerId, cur);

    if (pointers.current.size === 2 && pinchStart.current) {
      // pinch: zoom în jurul mijlocului dintre degete
      const [a, b] = [...pointers.current.values()];
      const dist = Math.hypot(a.x - b.x, a.y - b.y);
      const rect = viewportRef.current?.getBoundingClientRect();
      if (rect && pinchStart.current.dist > 0) {
        zoomAround(
          pinchStart.current.zoom * (dist / pinchStart.current.dist),
          (a.x + b.x) / 2 - rect.left,
          (a.y + b.y) / 2 - rect.top
        );
      }
    } else if (pointers.current.size === 1) {
      // pan cu un deget / mouse
      updateView(
        clampView(effective.zoom, effective.tx + (cur.x - prev.x), effective.ty + (cur.y - prev.y))
      );
    }
  };

  const onPointerEnd = (e: React.PointerEvent) => {
    pointers.current.delete(e.pointerId);
    if (pointers.current.size < 2) pinchStart.current = null;
  };

  const handleReset = () => {
    // revenim la încadrarea automată de la încărcare, nu la un crop centrat
    if (applyTimer.current) clearTimeout(applyTimer.current);
    setView(null);
    if (resetCrop) onCrop(resetCrop);
  };

  return (
    <div
      data-testid="photo-adjust-editor"
      style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}
    >
      {/* viewport pătrat cu ghidaj rotund */}
      <div
        ref={measureRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerEnd}
        onPointerCancel={onPointerEnd}
        style={{
          position: "relative",
          width: "min(300px, 76vw)",
          aspectRatio: "1 / 1",
          borderRadius: 16,
          overflow: "hidden",
          backgroundColor: "#0f172a",
          touchAction: "none",
          userSelect: "none",
          cursor: "grab",
          boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
        }}
      >
        {img && vp > 0 && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={src}
            alt=""
            draggable={false}
            style={{
              position: "absolute",
              left: effective.tx,
              top: effective.ty,
              width: img.naturalWidth * scale,
              height: img.naturalHeight * scale,
              maxWidth: "none",
              pointerEvents: "none",
            }}
          />
        )}
        {/* ghidaj: cercul arată încadrarea din modelele cu poză rotundă */}
        <div
          style={{
            position: "absolute",
            inset: "6%",
            borderRadius: "50%",
            border: "1.5px dashed rgba(255,255,255,0.9)",
            boxShadow: "0 0 0 999px rgba(15, 23, 42, 0.35)",
            pointerEvents: "none",
          }}
        />
      </div>

      <p style={{ fontSize: 14.5, color: "var(--muted-foreground)", textAlign: "center", lineHeight: 1.45, maxWidth: 340 }}>
        Trage poza ca să o centrezi · zoom din slider, două degete sau scroll.
        Se salvează automat.
      </p>

      {/* zoom accesibil pe orice dispozitiv */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, width: "min(300px, 76vw)" }}>
        <ZoomOut style={{ width: 18, height: 18, color: "var(--muted-foreground)", flexShrink: 0 }} />
        <input
          type="range"
          min={1}
          max={MAX_ZOOM}
          step={0.05}
          value={effective.zoom}
          data-testid="photo-adjust-zoom"
          aria-label="Zoom poză"
          onChange={(e) => zoomAround(Number(e.target.value), vp / 2, vp / 2)}
          style={{ flex: 1, accentColor: "var(--primary)", cursor: "pointer", minHeight: 32 }}
        />
        <ZoomIn style={{ width: 18, height: 18, color: "var(--muted-foreground)", flexShrink: 0 }} />
        <Button
          variant="outline"
          onClick={handleReset}
          data-testid="photo-adjust-reset"
          icon={<RotateCcw className="w-4 h-4" />}
          style={{ flexShrink: 0, minHeight: 40 }}
          aria-label="Resetează încadrarea"
        />
      </div>
    </div>
  );
}

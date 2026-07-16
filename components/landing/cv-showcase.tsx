"use client";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";

const SLIDES = [
  { src: "/examples/cv-example-1.png", alt: "Exemplu de CV generat — template Clasic" },
  { src: "/examples/cv-example-2.png", alt: "Exemplu de CV generat — template Modern" },
];

/** Pauza fixă: un CV stă static exact 2 secunde, apoi începe glisarea. */
const REST_MS = 2000;

/** Showcase-ul CV-urilor — element central, pe toată pagina.
 *  Ritmul e condus de sfârșitul real al animației (animationend), nu de
 *  un interval fix: CV static 2s → glisare → static 2s → … Ritmul e
 *  identic la prima încărcare, după schimbări de tab și în orice condiții.
 *  Doar transform (GPU), imagini preîncărcate. */
export function CVShowcase() {
  const [active, setActive] = useState(0);
  const [cycle, setCycle] = useState(0); // 0 = prima afișare, fără slide
  const [paused, setPaused] = useState(false); // tab ascuns → animația îngheață pe loc
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const animating = useRef(false);

  const scheduleSwitch = (delay: number) => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      // nu porni glisări cât timp tab-ul nu e vizibil — la revenire
      // handler-ul de vizibilitate reia lanțul curat
      if (document.hidden) return;
      animating.current = true;
      setActive((a) => (a + 1) % SLIDES.length);
      setCycle((c) => c + 1);
    }, delay);
  };

  // sfârșitul real al glisării → CV-ul stă static exact 2s → următorul
  const onSlideEnd = () => {
    animating.current = false;
    scheduleSwitch(REST_MS);
  };

  useEffect(() => {
    const onVisibility = () => {
      setPaused(document.hidden);
      if (document.hidden) {
        if (timer.current) clearTimeout(timer.current);
        timer.current = null;
      } else if (!animating.current) {
        // eram în faza statică → următoarea glisare în cel mult 2s;
        // dacă eram în mijlocul glisării, ea se dezgheață și lanțul
        // continuă natural la animationend
        scheduleSwitch(REST_MS);
      }
    };
    // prima glisare pornește la exact 2s după încărcare
    scheduleSwitch(REST_MS);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      if (timer.current) clearTimeout(timer.current);
      document.removeEventListener("visibilitychange", onVisibility);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const goTo = (i: number) => {
    if (i === active) return;
    if (timer.current) clearTimeout(timer.current);
    animating.current = true;
    setActive(i);
    setCycle((c) => c + 1);
    // lanțul continuă natural la animationend (static 2s → următorul)
  };

  return (
    <div data-testid="cv-showcase" style={{ width: "100%" }}>
      {/* coloana showcase-ului — aliniată la dreapta, pe linia butonului
          „Începe" din header; pe mobil umple lățimea */}
      <div style={{ width: "min(100%, calc(88vh * 0.707))", marginLeft: "auto", marginRight: 0 }}>
      {/* scena — A4, dimensionată după înălțimea ecranului */}
      <div
        style={{
          position: "relative",
          width: "100%",
          aspectRatio: "420 / 594",
        }}
      >
        {SLIDES.map((s, i) => {
          const isActive = i === active;
          const entering = isActive && cycle > 0;
          return (
            <div
              key={s.src}
              className={entering ? (cycle % 2 === 1 ? "showcase-enter-a" : "showcase-enter-b") : undefined}
              onAnimationEnd={entering ? onSlideEnd : undefined}
              data-testid={`showcase-layer-${i}`}
              aria-hidden={!isActive}
              style={{
                position: "absolute",
                inset: 0,
                zIndex: isActive ? 2 : 1,
                borderRadius: 18,
                overflow: "hidden",
                backgroundColor: "#fff",
                border: "1px solid var(--hairline)",
                boxShadow:
                  "0 48px 100px -26px rgba(20, 20, 19, 0.4), 0 18px 44px -18px rgba(20, 20, 19, 0.24)",
                // tab ascuns → glisarea îngheață pe loc și continuă la revenire
                animationPlayState: paused ? "paused" : "running",
              }}
            >
              <div style={{ position: "absolute", inset: 0 }}>
                <Image
                  src={s.src}
                  alt={s.alt}
                  fill
                  priority
                  sizes="(max-width: 900px) 96vw, 700px"
                  style={{ objectFit: "cover", objectPosition: "top" }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* indicator minimal: două puncte */}
      <div style={{ display: "flex", justifyContent: "center", gap: 10, marginTop: 22 }}>
        {SLIDES.map((s, i) => (
          <button
            key={s.src}
            type="button"
            data-testid={`showcase-dot-${i}`}
            aria-label={`Arată exemplul ${i + 1}`}
            aria-current={i === active}
            onClick={() => goTo(i)}
            style={{
              width: 9,
              height: 9,
              borderRadius: "50%",
              border: "none",
              padding: 0,
              cursor: "pointer",
              backgroundColor: i === active ? "var(--primary)" : "var(--hairline-strong, #cdc8ba)",
              transition: "background-color 0.3s ease",
            }}
          />
        ))}
      </div>
      </div>
    </div>
  );
}

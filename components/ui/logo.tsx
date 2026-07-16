/**
 * Simbolul CVexpres — conceptul „Săgeata carierei": monograma CV în care
 * brațul drept al literei V urcă și devine săgeată (progres în carieră),
 * cu vârful orange (accent de brand).
 * `on="dark"` (default): trasee albe, pentru sidebar/footer închis.
 * `on="light"`: trasee negre, pentru fundal crem (landing header).
 */
export function LogoMark({ size = 32, on = "dark" }: { size?: number; on?: "dark" | "light" }) {
  const stroke = on === "dark" ? "#ffffff" : "#141413";
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      aria-hidden="true"
      style={{ flexShrink: 0 }}
    >
      <path
        d="M25 21 A11.5 11.5 0 1 0 25 43"
        stroke={stroke}
        strokeWidth="7"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M32 21 L40.5 43 L52 17.5"
        stroke={stroke}
        strokeWidth="7"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M44.5 15 L52.5 15 L52.5 23"
        stroke="#f45a27"
        strokeWidth="7"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

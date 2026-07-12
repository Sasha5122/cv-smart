/**
 * Simbolul CVexpress — conceptul „Săgeata carierei": monograma CV în care
 * brațul drept al literei V urcă și devine săgeată (progres în carieră),
 * cu vârful verde ca accent de succes. Varianta pentru fundal închis (navy):
 * trasee albe + săgeată verde.
 */
export function LogoMark({ size = 32 }: { size?: number }) {
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
        stroke="#ffffff"
        strokeWidth="7"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M32 21 L40.5 43 L52 17.5"
        stroke="#ffffff"
        strokeWidth="7"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M44.5 15 L52.5 15 L52.5 23"
        stroke="#059669"
        strokeWidth="7"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function ElenLogo({ size = 28 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="elenLogoBg" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#1B4DFF" />
          <stop offset="100%" stopColor="#0C2685" />
        </linearGradient>
        <linearGradient id="elenLogoSpark" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#00D4E0" />
          <stop offset="100%" stopColor="#10D4DA" />
        </linearGradient>
      </defs>

      {/* Rounded square background */}
      <rect width="40" height="40" rx="10" fill="url(#elenLogoBg)" />

      {/* Subtle inner highlight */}
      <rect x="1" y="1" width="38" height="38" rx="9" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />

      {/* Geometric letter "E" — vertical spine + three prongs */}
      <path
        d="M13 10 L13 30"
        stroke="#FFFFFF"
        strokeWidth="3.4"
        strokeLinecap="round"
      />
      <path
        d="M13 10 L26 10"
        stroke="#FFFFFF"
        strokeWidth="3.4"
        strokeLinecap="round"
      />
      <path
        d="M13 20 L22 20"
        stroke="#FFFFFF"
        strokeWidth="3.4"
        strokeLinecap="round"
      />
      <path
        d="M13 30 L26 30"
        stroke="#FFFFFF"
        strokeWidth="3.4"
        strokeLinecap="round"
      />

      {/* Cyan electric node — signature accent representing the "electric spark" */}
      <circle cx="28.5" cy="20" r="2.6" fill="url(#elenLogoSpark)" />
      <circle cx="28.5" cy="20" r="4.5" fill="#00D4E0" fillOpacity="0.22" />
    </svg>
  );
}

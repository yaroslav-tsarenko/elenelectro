export function AvontLogo({ size = 28 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <rect width="40" height="40" rx="8" fill="#E53935" />
      <path
        d="M20 6L24 18H28L20 34L12 18H16L20 6Z"
        fill="#FFF"
        stroke="#FFF"
        strokeWidth="0.5"
        strokeLinejoin="round"
      />
      <path
        d="M14 20H26"
        stroke="#E53935"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

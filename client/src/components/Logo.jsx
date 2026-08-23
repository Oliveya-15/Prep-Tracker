export default function Logo({ size = 26, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <rect x="1" y="1" width="30" height="30" rx="8" fill="#182420" />
      <rect x="7" y="18" width="4" height="7" rx="1.2" fill="#EAEEEB" />
      <rect x="14" y="13" width="4" height="12" rx="1.2" fill="#D98C22" />
      <rect x="21" y="7" width="4" height="18" rx="1.2" fill="#2C4FE0" />
      <path
        d="M6.5 12.5L11 8L14.5 11L21 5"
        stroke="#EAEEEB"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

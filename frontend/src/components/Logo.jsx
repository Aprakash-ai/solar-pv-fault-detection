export default function Logo({ size = 24 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 22 22" aria-hidden="true">
      <circle cx="11" cy="11" r="5" fill="#ffb84d" />
      <path
        d="M11 1.5v3M11 17.5v3M1.5 11h3M17.5 11h3M4.3 4.3l2.1 2.1M15.6 15.6l2.1 2.1M4.3 17.7l2.1-2.1M15.6 6.4l2.1-2.1"
        stroke="#ffb84d"
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  )
}
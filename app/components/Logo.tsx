export default function Logo({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="100" height="100" fill="#2563eb" rx="20" />
      <path
        d="M 70 30 A 25 25 0 0 0 70 70"
        fill="none"
        stroke="#ffffff"
        strokeWidth="14"
        strokeLinecap="round"
      />
    </svg>
  );
}

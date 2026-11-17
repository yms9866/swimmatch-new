import { Link } from "react-router";

// The original SwimMatch mark and wordmark, unchanged. Only size and
// placement vary; on dark grounds it sits on a sand chip (`chip`).
export function LogoMark({ size = 46 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true">
      <circle cx="20" cy="6" r="3" fill="#ee7a63" />
      <path d="M3 17c3-5 5 4 8 0s5 4 8 0 5 4 8 0M3 24c3-5 5 4 8 0s5 4 8 0 5 4 8 0" fill="none" stroke="#2f9488" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  );
}

export default function Logo({ size = "lg", chip = false, onClick }) {
  return (
    <Link to="/" className={`logo logo-${size}${chip ? " logo-chip" : ""}`} aria-label="SwimMatch home" onClick={onClick}>
      <LogoMark size={{ lg: 46, md: 36, sm: 32 }[size]} />
      <span className="logo-t">Swim<b>Match</b></span>
    </Link>
  );
}

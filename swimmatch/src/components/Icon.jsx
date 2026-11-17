// Lane Lines icon set: 24px grid, 2px rounded stroke.
const paths = {
  home: <path d="M4 11l8-7 8 7v9h-5v-6H9v6H4z" />,
  search: <><circle cx="11" cy="11" r="7" /><path d="M20 20l-4-4" /></>,
  waves: <path d="M2 9c2.5-2 4.5 2 7 0s4.5 2 7 0 4.5 2 6 0M2 15c2.5-2 4.5 2 7 0s4.5 2 7 0 4.5 2 6 0" />,
  whistle: <><circle cx="9" cy="14" r="5" /><path d="M12.6 10.6L21 6.5v4.2l-5.6 2.1" /></>,
  calendar: <><rect x="3" y="5" width="18" height="16" rx="3" /><path d="M3 10h18M8 3v4M16 3v4" /></>,
  heart: <path d="M12 20s-7.5-4.6-7.5-10A4.3 4.3 0 0 1 12 7.2 4.3 4.3 0 0 1 19.5 10c0 5.4-7.5 10-7.5 10z" />,
  user: <><circle cx="12" cy="8" r="4" /><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6" /></>,
  pin: <><path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z" /><circle cx="12" cy="9.5" r="2.5" /></>,
  steps: <path d="M4 18h4v-4h4v-4h4V6h4" />,
  arrow: <path d="M5 12h14M13 6l6 6-6 6" />,
  back: <path d="M19 12H5M11 6l-6 6 6 6" />,
  diag: <path d="M7 17L17 7M8 7h9v9" />,
  down: <path d="M12 5v14M6 13l6 6 6-6" />,
  close: <path d="M6 6l12 12M18 6L6 18" />,
  menu: <path d="M4 7h16M4 12h16M4 17h10" />,
  phone: <path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z" />,
  mail: <><rect x="3" y="5" width="18" height="14" rx="3" /><path d="M4 7l8 6 8-6" /></>,
  check: <path d="M5 12.5l4.5 4.5L19 7.5" />,
  plus: <path d="M12 5v14M5 12h14" />,
  ring: <><circle cx="12" cy="12" r="8.5" /><circle cx="12" cy="12" r="3.5" /><path d="M12 3.5v5M12 15.5v5M3.5 12h5M15.5 12h5" /></>,
  pair: <><circle cx="8" cy="8" r="3" /><circle cx="16.5" cy="9" r="2.5" /><path d="M2.5 20c.8-3.4 3-5.2 5.5-5.2s4.7 1.8 5.5 5.2M13.5 15.2c.9-.6 1.9-.9 3-.9 2.2 0 4 1.6 4.8 4.7" /></>,
  group: <><circle cx="12" cy="7" r="2.6" /><circle cx="5" cy="9.5" r="2.2" /><circle cx="19" cy="9.5" r="2.2" /><path d="M7.5 20c.6-3 2.3-4.8 4.5-4.8s3.9 1.8 4.5 4.8M1.5 19c.4-2.2 1.7-3.6 3.5-3.6M22.5 19c-.4-2.2-1.7-3.6-3.5-3.6" /></>,
};

export default function Icon({ name, size = 20, stroke = 2, filled = false, className, style }) {
  return (
    <svg
      className={className}
      style={style}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth={stroke}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {paths[name]}
    </svg>
  );
}

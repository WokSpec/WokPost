/* SVG icons used throughout WokPost — all inline, no emoji */

type IconProps = { size?: number; className?: string; style?: React.CSSProperties };

const mkIcon = (path: React.ReactNode, vb = '0 0 24 24') =>
  ({ size = 16, className, style }: IconProps) => (
    <svg
      width={size}
      height={size}
      viewBox={vb}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
      style={style}
    >
      {path}
    </svg>
  );

/* ── Category icons ─────────────────────────────────────── */
export const IcoAI = mkIcon(<>
  <path d="M12 2a4 4 0 0 1 4 4v1h1a3 3 0 0 1 0 6h-1v1a4 4 0 0 1-8 0v-1H7a3 3 0 0 1 0-6h1V6a4 4 0 0 1 4-4z" />
  <circle cx="9" cy="10" r="1" fill="currentColor" stroke="none" />
  <circle cx="15" cy="10" r="1" fill="currentColor" stroke="none" />
</>);

export const IcoBusiness = mkIcon(<>
  <rect x="2" y="7" width="20" height="14" rx="2" />
  <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
  <line x1="12" y1="12" x2="12" y2="16" />
  <line x1="10" y1="14" x2="14" y2="14" />
</>);

export const IcoSports = mkIcon(<>
  <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
  <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
  <path d="M4 22h16" />
  <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
  <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
  <path d="M18 2H6v7a6 6 0 0 0 12 0V2z" />
</>);

export const IcoScience = mkIcon(<>
  <path d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v11m0 0a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1v-4a1 1 0 0 1 1-1h5m1 5h10m0 0a1 1 0 0 0 1-1v-4a1 1 0 0 0-1-1h-5m0 5V3" />
</>, '0 0 24 24');

export const IcoHealth = mkIcon(<>
  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
</>);

export const IcoNutrition = mkIcon(<>
  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  <path d="M9 12l2 2 4-4" />
</>);

export const IcoFarming = mkIcon(<>
  <path d="M12 22V12" />
  <path d="M5 22V12" />
  <path d="M19 22V12" />
  <path d="M2 22h20" />
  <path d="M12 12C12 12 7 9 7 5a5 5 0 0 1 10 0c0 4-5 7-5 7z" />
  <path d="M5 12C5 12 2 10 2 7a3 3 0 0 1 6 0c0 3-3 5-3 5z" />
  <path d="M19 12c0 0 3-2 3-5a3 3 0 0 0-6 0c0 3 3 5 3 5z" />
</>);

export const IcoEntertainment = mkIcon(<>
  <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18" />
  <line x1="7" y1="2" x2="7" y2="22" />
  <line x1="17" y1="2" x2="17" y2="22" />
  <line x1="2" y1="12" x2="22" y2="12" />
  <line x1="2" y1="7" x2="7" y2="7" />
  <line x1="2" y1="17" x2="7" y2="17" />
  <line x1="17" y1="17" x2="22" y2="17" />
  <line x1="17" y1="7" x2="22" y2="7" />
</>);

export const IcoEducation = mkIcon(<>
  <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
  <path d="M6 12v5c3 3 9 3 12 0v-5" />
</>);

export const IcoLaw = mkIcon(<>
  <path d="M12 22V2" />
  <path d="M5 12H2a10 10 0 0 0 20 0h-3" />
  <path d="M8 6 2 12l6 6" />
  <path d="M16 6l6 6-6 6" />
</>);

export const IcoGaming = mkIcon(<>
  <rect x="6" y="8" width="12" height="10" rx="2" />
  <path d="M9 11h2m1 0h2" />
  <path d="M10 10v2" />
  <path d="M17 8V6a2 2 0 0 0-2-2H9a2 2 0 0 0-2 2v2" />
</>);

export const IcoSpace = mkIcon(<>
  <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z" />
  <path d="M12 2C6.5 17 6.5 7 12 22" />
  <path d="M12 2c5.5 15 5.5 5 0 20" />
  <path d="M2 12h20" />
</>);

export const IcoArt = mkIcon(<>
  <circle cx="13.5" cy="6.5" r=".5" fill="currentColor" stroke="none" />
  <circle cx="17.5" cy="10.5" r=".5" fill="currentColor" stroke="none" />
  <circle cx="8.5" cy="7.5" r=".5" fill="currentColor" stroke="none" />
  <circle cx="6.5" cy="12.5" r=".5" fill="currentColor" stroke="none" />
  <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z" />
</>);

export const IcoRobotics = mkIcon(<>
  <rect x="3" y="11" width="18" height="10" rx="2" />
  <path d="M12 2v9" />
  <path d="M8 11V9a4 4 0 0 1 8 0v2" />
  <circle cx="9" cy="16" r="1.5" fill="currentColor" stroke="none" />
  <circle cx="15" cy="16" r="1.5" fill="currentColor" stroke="none" />
</>);

export const IcoClimate = mkIcon(<>
  <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9z" />
</>);

export const IcoCybersecurity = mkIcon(<>
  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  <line x1="9" y1="12" x2="15" y2="12" />
  <line x1="12" y1="9" x2="12" y2="15" />
</>);

export const IcoCrypto = mkIcon(<>
  <circle cx="12" cy="12" r="10" />
  <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
  <line x1="12" y1="17" x2="12.01" y2="17" />
</>);

export const IcoPolitics = mkIcon(<>
  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
  <polyline points="9 22 9 12 15 12 15 22" />
</>);

export const IcoEnergy = mkIcon(<>
  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
</>);

export const IcoEthics = mkIcon(<>
  <circle cx="12" cy="12" r="10" />
  <line x1="12" y1="8" x2="12" y2="12" />
  <line x1="12" y1="16" x2="12.01" y2="16" />
</>);

/* ── UI icons ───────────────────────────────────────────── */
export const IcoWrite = mkIcon(<>
  <path d="M12 20h9" />
  <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
</>);

export const IcoEye = mkIcon(<>
  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
  <circle cx="12" cy="12" r="3" />
</>);

export const IcoLink = mkIcon(<>
  <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
  <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
</>);

export const IcoImage = mkIcon(<>
  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
  <circle cx="8.5" cy="8.5" r="1.5" />
  <polyline points="21 15 16 10 5 21" />
</>);

export const IcoCheck = mkIcon(<>
  <polyline points="20 6 9 17 4 12" />
</>);

export const IcoX = mkIcon(<>
  <line x1="18" y1="6" x2="6" y2="18" />
  <line x1="6" y1="6" x2="18" y2="18" />
</>);

export const IcoInfo = mkIcon(<>
  <circle cx="12" cy="12" r="10" />
  <line x1="12" y1="8" x2="12" y2="12" />
  <line x1="12" y1="16" x2="12.01" y2="16" />
</>);

export const IcoFire = mkIcon(<>
  <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
</>);

export const IcoNewspaper = mkIcon(<>
  <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2" />
  <path d="M18 14h-8" />
  <path d="M15 18h-5" />
  <path d="M10 6h8v4h-8V6z" />
</>);

export const IcoPen = mkIcon(<>
  <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
</>);

export const IcoChat = mkIcon(<>
  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
</>);

export const IcoThumbUp = mkIcon(<>
  <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
</>);

export const IcoTag = mkIcon(<>
  <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
  <line x1="7" y1="7" x2="7.01" y2="7" />
</>);

export const IcoGlobe = mkIcon(<>
  <circle cx="12" cy="12" r="10" />
  <line x1="2" y1="12" x2="22" y2="12" />
  <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
</>);

export const IcoBarChart = mkIcon(<>
  <line x1="12" y1="20" x2="12" y2="10" />
  <line x1="18" y1="20" x2="18" y2="4" />
  <line x1="6" y1="20" x2="6" y2="16" />
</>);

export const IcoSearch = mkIcon(<>
  <circle cx="11" cy="11" r="8" />
  <line x1="21" y1="21" x2="16.65" y2="16.65" />
</>);

export const IcoChevronLeft = mkIcon(<>
  <polyline points="15 18 9 12 15 6" />
</>);

export const IcoChevronRight = mkIcon(<>
  <polyline points="9 18 15 12 9 6" />
</>);

export const IcoRun = mkIcon(<>
  <circle cx="13" cy="4" r="2" />
  <path d="M5 21l4-7 2 3 2-4 4 8" />
  <path d="M8.5 13.5l1-2 3.5 1 2-4" />
</>);

export const IcoTrendingUp = mkIcon(<>
  <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
  <polyline points="17 6 23 6 23 12" />
</>);

/* Map category ID → icon component */
export const CATEGORY_ICONS: Record<string, React.ComponentType<IconProps>> = {
  ai:            IcoAI,
  business:      IcoBusiness,
  sports:        IcoSports,
  science:       IcoScience,
  health:        IcoHealth,
  nutrition:     IcoNutrition,
  farming:       IcoFarming,
  entertainment: IcoEntertainment,
  education:     IcoEducation,
  law:           IcoLaw,
  gaming:        IcoGaming,
  space:         IcoSpace,
  art:           IcoArt,
  robotics:      IcoRobotics,
  climate:       IcoClimate,
  cybersecurity: IcoCybersecurity,
  crypto:        IcoCrypto,
  politics:      IcoPolitics,
  energy:        IcoEnergy,
  ethics:        IcoEthics,
};

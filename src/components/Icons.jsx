// 선 아이콘 — 이모지 대신 인라인 SVG + currentColor (앱 팔레트를 그대로 먹는다)
const S = { fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' };
const Svg = ({ size = 16, children }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true" focusable="false">{children}</svg>
);

export const InstaIcon = (p) => (
  <Svg {...p}>
    <rect x="3" y="3" width="18" height="18" rx="5.5" {...S} />
    <circle cx="12" cy="12" r="4.2" {...S} />
    <circle cx="17.3" cy="6.7" r="1.35" fill="currentColor" />
  </Svg>
);
export const ShareIcon = (p) => (
  <Svg {...p}>
    <circle cx="18" cy="5" r="2.5" {...S} /><circle cx="6" cy="12" r="2.5" {...S} /><circle cx="18" cy="19" r="2.5" {...S} />
    <path d="M8.2 10.9l7.6-4.4M8.2 13.1l7.6 4.4" {...S} />
  </Svg>
);
export const InstallIcon = (p) => (
  <Svg {...p}>
    <rect x="5" y="2.5" width="14" height="19" rx="2.5" {...S} />
    <path d="M12 6.5v8M8.8 11.5L12 14.7l3.2-3.2" {...S} />
  </Svg>
);
export const FullscreenIcon = ({ on, ...p }) => (
  <Svg {...p}>
    <path d={on ? 'M9 3v6H3M15 21v-6h6M9 21v-6H3M15 3v6h6' : 'M3 9V3h6M21 15v6h-6M3 15v6h6M21 9V3h-6'} {...S} />
  </Svg>
);
export const SiteIcon = (p) => (
  <Svg {...p}>
    <path d="M3 10.5L12 4l9 6.5M5.5 9v10.5h13V9" {...S} />
    <path d="M10 19.5v-5h4v5" {...S} />
  </Svg>
);
export const InfoIcon = (p) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="9" {...S} /><path d="M12 11v5.5M12 7.6v.1" {...S} />
  </Svg>
);

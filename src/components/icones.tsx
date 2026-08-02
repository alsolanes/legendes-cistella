// ── Icones custom de bàsquet, estil lucide (stroke 2px, currentColor) ──
import type { SVGAttributes } from 'react';

export interface IconProps extends SVGAttributes<SVGSVGElement> {
  size?: number | string;
  strokeWidth?: number | string;
}

const base = (size: number | string, strokeWidth: number | string) => ({
  width: size,
  height: size,
  viewBox: '0 0 24 24',
  fill: 'none' as const,
  stroke: 'currentColor',
  strokeWidth,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
});

export function IconPilota({ size = 24, strokeWidth = 2, ...props }: IconProps) {
  return (
    <svg {...base(size, strokeWidth)} {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18" />
      <path d="M12 3v18" />
      <path d="M5.5 5.5c2 2 2 5.5 0 7.5s-2 5.5 0 7.5" />
      <path d="M18.5 5.5c-2 2-2 5.5 0 7.5s2 5.5 0 7.5" />
    </svg>
  );
}

export function IconCistella({ size = 24, strokeWidth = 2, ...props }: IconProps) {
  return (
    <svg {...base(size, strokeWidth)} {...props}>
      <path d="M4 3h16l-1 4H5z" />
      <ellipse cx="12" cy="7" rx="7" ry="1.6" />
      <path d="M6.2 7.6 8 16m9.8-8.4L16 16m-5.5-8 .7 8.2m2.6-8.2-.7 8.2" />
      <path d="M8 16h8l-2.2 4.5a2 2 0 0 1-3.6 0z" />
    </svg>
  );
}

export function IconTriple({ size = 24, strokeWidth = 2, ...props }: IconProps) {
  return (
    <svg {...base(size, strokeWidth)} {...props}>
      <circle cx="9" cy="9" r="5" />
      <path d="M6.8 5.3c1.2 1.2 1.2 3.2 0 4.4M7.7 12.9c1.2-1.2 1.2-3.2 0-4.4" />
      <path d="M3 20c2-5 6-8 11-8s9 3 11 8" />
    </svg>
  );
}

export function IconRebot({ size = 24, strokeWidth = 2, ...props }: IconProps) {
  return (
    <svg {...base(size, strokeWidth)} {...props}>
      <circle cx="12" cy="14" r="6" />
      <path d="M8 11c1.3 1.3 1.3 3.7 0 5M16 11c-1.3 1.3-1.3 3.7 0 5" />
      <path d="M12 4v4M9 4.8 12 8l3-3.2" />
    </svg>
  );
}

export function IconPavello({ size = 24, strokeWidth = 2, ...props }: IconProps) {
  return (
    <svg {...base(size, strokeWidth)} {...props}>
      <path d="M3 10 12 4l9 6" />
      <path d="M4 9v11h16V9" />
      <path d="M9 20v-6h6v6" />
      <path d="M4 14h16" />
    </svg>
  );
}

export function IconSobre({ size = 24, strokeWidth = 2, ...props }: IconProps) {
  return (
    <svg {...base(size, strokeWidth)} {...props}>
      <rect x="4" y="5" width="16" height="15" rx="1.5" />
      <path d="M4 8.5 12 13l8-4.5" />
      <path d="M8 3.5h8l1.5 3h-11z" />
    </svg>
  );
}

export function IconCromo({ size = 24, strokeWidth = 2, ...props }: IconProps) {
  return (
    <svg {...base(size, strokeWidth)} {...props}>
      <rect x="5" y="2.5" width="14" height="19" rx="1.8" />
      <path d="M12 9.5 13.3 12l2.7.4-2 1.9.5 2.7-2.5-1.3-2.5 1.3.5-2.7-2-1.9 2.7-.4z" />
    </svg>
  );
}

export function IconEntrenador({ size = 24, strokeWidth = 2, ...props }: IconProps) {
  return (
    <svg {...base(size, strokeWidth)} {...props}>
      <circle cx="8" cy="13" r="4.5" />
      <path d="M12.3 10.5A3 3 0 1 0 12 16.5" />
      <path d="M12.5 9h4a3 3 0 0 1 3 3v0" />
      <path d="M19.5 12v2" />
    </svg>
  );
}

export function IconTitul({ size = 24, strokeWidth = 2, ...props }: IconProps) {
  return (
    <svg {...base(size, strokeWidth)} {...props}>
      <path d="M7 4h10v5a5 5 0 0 1-10 0z" />
      <path d="M7 5H4a3 3 0 0 0 3 4.5M17 5h3a3 3 0 0 1-3 4.5" />
      <path d="M12 14v3" />
      <path d="M8.5 20.5 9.5 17h5l1 3.5z" />
    </svg>
  );
}

export function IconRuleta({ size = 24, strokeWidth = 2, ...props }: IconProps) {
  return (
    <svg {...base(size, strokeWidth)} {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 3v9l6.4 3.6M12 12 5.6 15.6M12 12 8 5" />
      <circle cx="12" cy="12" r="1.3" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function IconRasca({ size = 24, strokeWidth = 2, ...props }: IconProps) {
  return (
    <svg {...base(size, strokeWidth)} {...props}>
      <rect x="3" y="5" width="18" height="14" rx="1.8" />
      <path d="M6.5 9.5c1.5 1.5 1.5 3.5 0 5M11 8.5c1.5 1.5 1.5 5.5 0 7M15.5 9.5c1.5 1.5 1.5 3.5 0 5" />
    </svg>
  );
}

export function IconMemoria({ size = 24, strokeWidth = 2, ...props }: IconProps) {
  return (
    <svg {...base(size, strokeWidth)} {...props}>
      <rect x="3" y="4" width="8" height="11" rx="1.3" />
      <rect x="13" y="9" width="8" height="11" rx="1.3" />
      <path d="M7 7.5v4M5 9.5h4" />
      <path d="M15.3 16.8 17 14.5l1.7 2.3" />
    </svg>
  );
}

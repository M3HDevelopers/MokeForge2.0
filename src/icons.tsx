import type { SVGProps } from 'react';

type P = SVGProps<SVGSVGElement> & { size?: number };
const base = (p: P) => {
  const { size = 16, ...rest } = p;
  return { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.7, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, ...rest };
};

export const LogoMark = ({ size = 22, ...rest }: P) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...rest}>
    <rect x="2.5" y="4" width="15" height="11" rx="2" stroke="#ff6b3d" strokeWidth="1.9" />
    <rect x="9" y="9" width="12.5" height="11" rx="2" fill="#101114" stroke="#45d6c8" strokeWidth="1.9" />
    <circle cx="18.5" cy="5" r="2" fill="#ffd166" />
  </svg>
);

export const IcPlus = (p: P) => <svg {...base(p)}><path d="M12 5v14M5 12h14" /></svg>;
export const IcUpload = (p: P) => <svg {...base(p)}><path d="M12 16V4m0 0L7 9m5-5 5 5" /><path d="M4 17v2a1.5 1.5 0 0 0 1.5 1.5h13A1.5 1.5 0 0 0 20 19v-2" /></svg>;
export const IcDownload = (p: P) => <svg {...base(p)}><path d="M12 4v12m0 0 5-5m-5 5-5-5" /><path d="M4 17v2a1.5 1.5 0 0 0 1.5 1.5h13A1.5 1.5 0 0 0 20 19v-2" /></svg>;
export const IcLaptop = (p: P) => <svg {...base(p)}><rect x="4" y="5" width="16" height="11" rx="1.6" /><path d="M2 19h20l-1.2-2.2a1 1 0 0 0-.9-.8H4.1a1 1 0 0 0-.9.8Z" /></svg>;
export const IcPhone = (p: P) => <svg {...base(p)}><rect x="7" y="3" width="10" height="18" rx="2.4" /><path d="M10.5 17.8h3" /></svg>;
export const IcTablet = (p: P) => <svg {...base(p)}><rect x="4" y="4" width="16" height="16" rx="2.2" /><path d="M10.8 17h2.4" /></svg>;
export const IcBrowser = (p: P) => <svg {...base(p)}><rect x="3" y="4.5" width="18" height="15" rx="2" /><path d="M3 9h18" /><circle cx="6" cy="6.8" r=".4" fill="currentColor" /><circle cx="8.4" cy="6.8" r=".4" fill="currentColor" /></svg>;
export const IcMonitor = (p: P) => <svg {...base(p)}><rect x="3" y="4" width="18" height="12.5" rx="1.8" /><path d="M12 16.5v3m-4 0h8" /></svg>;
export const IcLayers = (p: P) => <svg {...base(p)}><path d="m12 3 9 5-9 5-9-5Z" /><path d="m4.5 12.8 7.5 4.2 7.5-4.2" /><path d="m4.5 16.8 7.5 4.2 7.5-4.2" /></svg>;
export const IcWand = (p: P) => <svg {...base(p)}><path d="m5 19 9.5-9.5m2-2L19 5" /><path d="M18.5 8.5 15.5 5.5 17 4l3 3Z" /><path d="M9 4.5v2M8 5.5h2M19.5 15v2m-1-1h2" /></svg>;
export const IcDice = (p: P) => <svg {...base(p)}><rect x="4" y="4" width="16" height="16" rx="3.5" /><circle cx="9" cy="9" r="1" fill="currentColor" stroke="none" /><circle cx="15" cy="15" r="1" fill="currentColor" stroke="none" /><circle cx="15" cy="9" r="1" fill="currentColor" stroke="none" /><circle cx="9" cy="15" r="1" fill="currentColor" stroke="none" /></svg>;
export const IcSave = (p: P) => <svg {...base(p)}><path d="M5 4h11l3 3v13H5Z" /><path d="M8 4v5h7V4M8 20v-6h8v6" /></svg>;
export const IcExport = (p: P) => <svg {...base(p)}><path d="M14 4h4a1.5 1.5 0 0 1 1.5 1.5v13A1.5 1.5 0 0 1 18 20H6a1.5 1.5 0 0 1-1.5-1.5v-13A1.5 1.5 0 0 1 6 4h4" /><path d="M12 4v10m0 0 3.5-3.5M12 14 8.5 10.5" /></svg>;
export const IcTrash = (p: P) => <svg {...base(p)}><path d="M5 7h14M9.5 7V5.5A1.5 1.5 0 0 1 11 4h2a1.5 1.5 0 0 1 1.5 1.5V7M7 7l.8 12a1.6 1.6 0 0 0 1.6 1.5h5.2a1.6 1.6 0 0 0 1.6-1.5L17 7" /></svg>;
export const IcCopy = (p: P) => <svg {...base(p)}><rect x="8" y="8" width="12" height="12" rx="2" /><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" /></svg>;
export const IcEye = (p: P) => <svg {...base(p)}><path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" /><circle cx="12" cy="12" r="3" /></svg>;
export const IcEyeOff = (p: P) => <svg {...base(p)}><path d="M4 4l16 16" /><path d="M9.9 5.9A9.6 9.6 0 0 1 12 5.5c6 0 9.5 6.5 9.5 6.5a17.6 17.6 0 0 1-3 3.6M6 8A16 16 0 0 0 2.5 12S6 18.5 12 18.5a9.4 9.4 0 0 0 3.5-.7" /></svg>;
export const IcUndo = (p: P) => <svg {...base(p)}><path d="M8 5 4 9l4 4" /><path d="M4 9h10a6 6 0 0 1 0 12h-4" /></svg>;
export const IcRedo = (p: P) => <svg {...base(p)}><path d="m16 5 4 4-4 4" /><path d="M20 9H10a6 6 0 0 0 0 12h4" /></svg>;
export const IcClose = (p: P) => <svg {...base(p)}><path d="m6 6 12 12M18 6 6 18" /></svg>;
export const IcCheck = (p: P) => <svg {...base(p)}><path d="m5 12.5 4.5 4.5L19 7.5" /></svg>;
export const IcArrowL = (p: P) => <svg {...base(p)}><path d="M19 12H5m0 0 6-6m-6 6 6 6" /></svg>;
export const IcArrowR = (p: P) => <svg {...base(p)}><path d="M5 12h14m0 0-6-6m6 6-6 6" /></svg>;
export const IcImage = (p: P) => <svg {...base(p)}><rect x="3.5" y="4.5" width="17" height="15" rx="2" /><circle cx="9" cy="10" r="1.6" /><path d="m5 18 5-5 3 3 3.5-3.5 4 4" /></svg>;
export const IcType = (p: P) => <svg {...base(p)}><path d="M6 6V4.5h12V6M12 4.5v15m-2.5 0h5" /></svg>;
export const IcBrand = (p: P) => <svg {...base(p)}><circle cx="12" cy="12" r="8" /><path d="M12 4a8 8 0 0 1 0 16c-2 0-3-1.5-3-3s1-2.6 2.4-3c1.7-.5 2.6-1.3 2.6-3 0-1.7-1-3-2-4Z" /></svg>;
export const IcBg = (p: P) => <svg {...base(p)}><rect x="3.5" y="3.5" width="17" height="17" rx="3" /><path d="M3.5 14c3-4 6 2 9-2s5.5-1 8-3" /></svg>;
export const IcGrid = (p: P) => <svg {...base(p)}><rect x="4" y="4" width="6.5" height="6.5" rx="1.2" /><rect x="13.5" y="4" width="6.5" height="6.5" rx="1.2" /><rect x="4" y="13.5" width="6.5" height="6.5" rx="1.2" /><rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1.2" /></svg>;
export const IcSpark = (p: P) => <svg {...base(p)}><path d="M12 3.5c.7 3.9 2 6.4 3.4 7.5 1.1.9 2.9 1.2 5.1 1-2.2.4-4 .9-5.1 1.9-1.4 1.2-2.7 3.6-3.4 6.6-.7-3-2-5.4-3.4-6.6-1.1-1-2.9-1.5-5.1-1.9 2.2-.2 4-.5 5.1-1.4C10 9.9 11.3 7.4 12 3.5Z" /></svg>;
export const IcZoomIn = (p: P) => <svg {...base(p)}><circle cx="10.5" cy="10.5" r="6.5" /><path d="m20 20-4.5-4.5M10.5 8v5M8 10.5h5" /></svg>;
export const IcZoomOut = (p: P) => <svg {...base(p)}><circle cx="10.5" cy="10.5" r="6.5" /><path d="m20 20-4.5-4.5M8 10.5h5" /></svg>;
export const IcFit = (p: P) => <svg {...base(p)}><path d="M4 9V5.5A1.5 1.5 0 0 1 5.5 4H9m6 0h3.5A1.5 1.5 0 0 1 20 5.5V9m0 6v3.5a1.5 1.5 0 0 1-1.5 1.5H15m-6 0H5.5A1.5 1.5 0 0 1 4 18.5V15" /></svg>;
export const IcUp = (p: P) => <svg {...base(p)}><path d="m6 14 6-6 6 6" /></svg>;
export const IcDown = (p: P) => <svg {...base(p)}><path d="m6 10 6 6 6-6" /></svg>;
export const IcFolder = (p: P) => <svg {...base(p)}><path d="M3.5 6.5A1.5 1.5 0 0 1 5 5h4l2 2.5h8A1.5 1.5 0 0 1 20.5 9v9A1.5 1.5 0 0 1 19 19.5H5A1.5 1.5 0 0 1 3.5 18Z" /></svg>;
export const IcLink = (p: P) => <svg {...base(p)}><path d="M10 14a4.5 4.5 0 0 0 6.4.4l2.4-2.4a4.5 4.5 0 0 0-6.4-6.4L11 7" /><path d="M14 10a4.5 4.5 0 0 0-6.4-.4l-2.4 2.4a4.5 4.5 0 0 0 6.4 6.4L13 17" /></svg>;
export const IcCrop = (p: P) => <svg {...base(p)}><path d="M7 2v13a2 2 0 0 0 2 2h13" /><path d="M2 7h13a2 2 0 0 1 2 2v13" /></svg>;
export const IcRefresh = (p: P) => <svg {...base(p)}><path d="M4.5 12a7.5 7.5 0 0 1 13-5.2L20 9.5m0-5v5h-5" /><path d="M19.5 12a7.5 7.5 0 0 1-13 5.2L4 14.5m0 5v-5h5" /></svg>;
export const IcDevice = (p: P) => <svg {...base(p)}><rect x="3" y="5" width="14" height="10" rx="1.6" /><path d="M17 9h2.5A1.5 1.5 0 0 1 21 10.5v6A1.5 1.5 0 0 1 19.5 18H10" /><path d="M6 18.5h8" /></svg>;
export const IcSpin = (p: P) => <svg {...base(p)} className={`anim-spin ${p.className ?? ''}`}><path d="M12 3a9 9 0 1 0 9 9" /></svg>;
export const IcStar = (p: P) => <svg {...base(p)}><path d="m12 3.6 2.5 5.2 5.7.7-4.2 4 1.1 5.6L12 16.4l-5.1 2.7 1.1-5.6-4.2-4 5.7-.7Z" /></svg>;
export const IcHeart = (p: P) => <svg {...base(p)}><path d="M12 20s-7.5-4.6-9-9.3C2 7.6 4 5 6.8 5 8.8 5 10.5 6.2 12 8c1.5-1.8 3.2-3 5.2-3C20 5 22 7.6 21 10.7c-1.5 4.7-9 9.3-9 9.3Z" /></svg>;
export const IcLock = (p: P) => <svg {...base(p)}><rect x="5.5" y="10.5" width="13" height="9.5" rx="2" /><path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5" /></svg>;
export const IcUnlock = (p: P) => <svg {...base(p)}><rect x="5.5" y="10.5" width="13" height="9.5" rx="2" /><path d="M8.5 10.5V8a3.5 3.5 0 0 1 6.9-.8" /></svg>;
export const IcCompare = (p: P) => <svg {...base(p)}><rect x="3.5" y="5" width="7.5" height="14" rx="1.6" /><rect x="13" y="5" width="7.5" height="14" rx="1.6" strokeDasharray="3 2.4" /></svg>;
export const IcSearch = (p: P) => <svg {...base(p)}><circle cx="10.5" cy="10.5" r="6.5" /><path d="m20 20-4.5-4.5" /></svg>;
export const IcAlignH = (p: P) => <svg {...base(p)}><path d="M4 12h16" /><rect x="6" y="7" width="4" height="10" rx="1" /><rect x="14" y="9" width="4" height="6" rx="1" /></svg>;
export const IcAlignV = (p: P) => <svg {...base(p)}><path d="M12 4v16" /><rect x="7" y="6" width="10" height="4" rx="1" /><rect x="9" y="14" width="6" height="4" rx="1" /></svg>;

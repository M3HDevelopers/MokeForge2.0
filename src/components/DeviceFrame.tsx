import { useId } from 'react';
import type { DeviceKind, Material } from '../types';
import { deviceGeometry, luminance, shade } from '../templates';

const glareK = (m?: Material) => (m === 'glossy' ? 1.8 : m === 'glass' ? 1.4 : m === 'metallic' ? 1.1 : 1);

export function DeviceFrame({ kind, color, w, h, part, url, radiusMul = 1, material, reflection = 0 }: {
  kind: DeviceKind; color: string; w: number; h: number; part: 'back' | 'front'; url?: string;
  radiusMul?: number; material?: Material; reflection?: number;
}) {
  const cid = useId().replace(/:/g, '');
  const g = deviceGeometry(kind, w, h, radiusMul);
  const light = luminance(color) > 0.5;
  const clip = `clip${cid}`;
  const gid = `glare${cid}`;
  const k = glareK(material);

  const glare = (
    <g clipPath={`url(#${clip})`}>
      <polygon
        points={`${g.x},${g.y} ${g.x + g.w * 0.45},${g.y} ${g.x + g.w * 0.16},${g.y + g.h} ${g.x},${g.y + g.h}`}
        fill={`rgba(255,255,255,${0.055 * k})`}
      />
      <rect x={g.x} y={g.y} width={g.w} height={g.h} rx={g.r} fill="none" stroke="rgba(0,0,0,0.4)" strokeWidth="1" />
    </g>
  );

  const reflectionEl = reflection > 0.02 && part === 'front' ? (
    <rect x={w * 0.08} y={h} width={w * 0.84} height={h * 0.22 * reflection} fill={`url(#${gid})`} />
  ) : null;

  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="absolute inset-0 pointer-events-none" style={{ overflow: 'visible' }}>
      <defs>
        <clipPath id={clip}>
          <rect x={g.x} y={g.y} width={g.w} height={g.h} rx={g.r} />
        </clipPath>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(255,255,255,0.12)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0)" />
        </linearGradient>
      </defs>

      {part === 'back' && (
        <>
          {kind === 'laptop' && (() => {
            const baseH = h * 0.062, lidH = h - baseH;
            return (
              <>
                <rect x={0} y={0} width={w} height={lidH} rx={w * 0.02} fill={color} stroke={shade(color, -22)} strokeWidth="1" />
                <rect x={g.x} y={g.y} width={g.w} height={g.h} rx={g.r} fill="#0b0c0f" />
                <circle cx={w / 2} cy={g.y / 2} r={Math.max(1.6, w * 0.004)} fill={shade(color, -38)} />
                <rect x={-w * 0.045} y={lidH} width={w * 1.09} height={baseH * 0.55} rx={baseH * 0.3} fill={shade(color, 26)} />
                <rect x={-w * 0.045} y={lidH + baseH * 0.5} width={w * 1.09} height={baseH * 0.5} rx={baseH * 0.3} fill={shade(color, -12)} />
                <rect x={w / 2 - w * 0.07} y={lidH} width={w * 0.14} height={baseH * 0.32} rx={baseH * 0.16} fill={shade(color, -30)} />
              </>
            );
          })()}

          {kind === 'phone' && (
            <>
              <rect x={0} y={0} width={w} height={h} rx={w * 0.13 * radiusMul} fill={color} stroke={shade(color, -25)} strokeWidth="1" />
              <rect x={w - 1.2} y={h * 0.24} width={2.6} height={h * 0.09} rx={1.3} fill={shade(color, -22)} />
              <rect x={w - 1.2} y={h * 0.36} width={2.6} height={h * 0.06} rx={1.3} fill={shade(color, -22)} />
              <rect x={g.x} y={g.y} width={g.w} height={g.h} rx={g.r} fill="#0b0c0f" />
            </>
          )}

          {kind === 'tablet' && (
            <>
              <rect x={0} y={0} width={w} height={h} rx={w * 0.035 * radiusMul} fill={color} stroke={shade(color, -22)} strokeWidth="1" />
              <rect x={g.x} y={g.y} width={g.w} height={g.h} rx={g.r} fill="#0b0c0f" />
              <circle cx={w / 2} cy={g.y / 2} r={Math.max(1.8, w * 0.0045)} fill={shade(color, -38)} />
            </>
          )}

          {kind === 'browser' && (() => {
            const chromeH = g.y;
            const dotR = Math.max(3, chromeH * 0.12);
            return (
              <>
                <rect x={0} y={0} width={w} height={h} rx={w * 0.02} fill={color} stroke={shade(color, -18)} strokeWidth="1" />
                <rect x={g.x} y={g.y} width={g.w} height={g.h} rx={g.r} fill={light ? '#fbfbfc' : '#15171b'} />
                {['#ff5f57', '#febc2e', '#28c840'].map((c, i) => (
                  <circle key={c} cx={chromeH * 0.55 + i * dotR * 2.6} cy={chromeH / 2} r={dotR} fill={c} />
                ))}
                <rect x={(w - w * 0.38) / 2} y={chromeH / 2 - chromeH * 0.27} width={w * 0.38} height={chromeH * 0.54} rx={chromeH * 0.27} fill={light ? '#e9ebef' : '#2c313a'} />
                <text
                  x={w / 2} y={chromeH / 2 + 1} textAnchor="middle" dominantBaseline="central"
                  fill={light ? '#6b7280' : '#9aa1ad'}
                  style={{ font: `500 ${Math.max(9, chromeH * 0.3)}px "JetBrains Mono", monospace` }}
                >
                  {url || 'yourapp.com'}
                </text>
              </>
            );
          })()}

          {kind === 'monitor' && (() => {
            const standH = h * 0.15, screenH = h - standH;
            return (
              <>
                <rect x={0} y={0} width={w} height={screenH} rx={w * 0.012} fill={color} stroke={shade(color, -20)} strokeWidth="1" />
                <rect x={g.x} y={g.y} width={g.w} height={g.h} rx={g.r} fill="#0b0c0f" />
                <circle cx={w / 2} cy={screenH - (screenH - g.y - g.h) / 2} r={Math.max(1.6, w * 0.004)} fill={shade(color, -30)} />
                <polygon
                  points={`${w * 0.465},${screenH} ${w * 0.535},${screenH} ${w * 0.55},${screenH + standH * 0.72} ${w * 0.45},${screenH + standH * 0.72}`}
                  fill={shade(color, -16)}
                />
                <rect x={w / 2 - w * 0.12} y={screenH + standH * 0.72} width={w * 0.24} height={standH * 0.2} rx={standH * 0.1} fill={shade(color, -6)} />
              </>
            );
          })()}
        </>
      )}

      {part === 'front' && (
        <>
          {kind === 'phone' && (
            <>
              <rect
                x={w / 2 - g.w * 0.15} y={g.y + g.h * 0.022} width={g.w * 0.3} height={g.h * 0.03}
                rx={g.h * 0.015} fill="#0b0c0f" stroke="#26282e" strokeWidth="1"
              />
              <rect x={w / 2 - g.w * 0.18} y={g.y + g.h * 0.965} width={g.w * 0.36} height={Math.max(3, h * 0.005)} rx={2} fill="rgba(255,255,255,0.4)" />
            </>
          )}
          {kind === 'browser' && <line x1={0} y1={g.y} x2={w} y2={g.y} stroke={light ? 'rgba(0,0,0,0.14)' : 'rgba(0,0,0,0.5)'} strokeWidth="1" />}
          {glare}
          {reflectionEl}
        </>
      )}
    </svg>
  );
}

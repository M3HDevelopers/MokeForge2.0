import type { ReactNode } from 'react';
import type { PosPreset } from '../types';
import { POSITIONS } from '../templates';

/* ---------------- section wrapper ---------------- */
export function Section({ title, children, right }: { title: string; children: ReactNode; right?: ReactNode }) {
  return (
    <div className="px-3.5 py-3.5 border-b border-line2">
      <div className="flex items-center justify-between mb-2.5">
        <div className="label-mono">{title}</div>
        {right}
      </div>
      {children}
    </div>
  );
}

/* ---------------- segmented control ---------------- */
export function Seg<T extends string>({ options, value, onChange }: {
  options: { id: T; label: string }[]; value: T; onChange: (v: T) => void;
}) {
  return (
    <div className="seg">
      {options.map(o => (
        <button key={o.id} className={value === o.id ? 'on' : ''} onClick={() => onChange(o.id)}>
          {o.label}
        </button>
      ))}
    </div>
  );
}

/* ---------------- slider row ---------------- */
export function SliderRow({ label, value, min, max, step = 1, fmt, onStart, onChange }: {
  label: string; value: number; min: number; max: number; step?: number;
  fmt?: (v: number) => string;
  onStart?: () => void;
  onChange: (v: number) => void;
}) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div className="mb-2.5">
      <div className="flex items-center justify-between mb-1">
        <span className="text-[11px] text-mut">{label}</span>
        <span className="text-[10.5px] font-mono text-dim">{fmt ? fmt(value) : value}</span>
      </div>
      <input
        type="range" className="slider w-full"
        min={min} max={max} step={step} value={value}
        style={{ '--fill': `${pct}%` } as React.CSSProperties}
        onPointerDown={onStart}
        onChange={(e) => onChange(parseFloat(e.target.value))}
      />
    </div>
  );
}

/* ---------------- toggle ---------------- */
export function Toggle({ on, onChange, label }: { on: boolean; onChange: (v: boolean) => void; label?: string }) {
  return (
    <button
      onClick={() => onChange(!on)}
      className="flex items-center gap-2 cursor-pointer"
    >
      <div
        className="relative w-9 h-5 rounded-full transition-colors"
        style={{ background: on ? 'var(--color-acc)' : 'var(--color-panel3)' }}
      >
        <div
          className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all"
          style={{ left: on ? 'calc(100% - 18px)' : '2px' }}
        />
      </div>
      {label && <span className="text-[11px] text-mut">{label}</span>}
    </button>
  );
}

/* ---------------- color input ---------------- */
export function ColorInput({ value, onChange, label }: { value: string; onChange: (v: string) => void; label?: string }) {
  return (
    <div className="flex items-center gap-2">
      <input
        type="color" className="swatch-input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      {label && <span className="text-[10px] text-dim">{label}</span>}
    </div>
  );
}

/* ---------------- position grid ---------------- */
export function PosGrid({ value, onChange }: { value: PosPreset; onChange: (v: PosPreset) => void }) {
  return (
    <div className="grid grid-cols-3 gap-1">
      {POSITIONS.map(p => (
        <button
          key={p}
          onClick={() => onChange(p)}
          className="h-8 rounded border text-[9px] transition-all"
          style={{
            borderColor: value === p ? 'var(--color-acc)' : 'var(--color-line)',
            background: value === p ? 'rgba(255,107,61,0.12)' : 'var(--color-panel)',
            color: value === p ? 'var(--color-acc)' : 'var(--color-mut)',
          }}
        >
          {p.replace('-', ' ')}
        </button>
      ))}
    </div>
  );
}

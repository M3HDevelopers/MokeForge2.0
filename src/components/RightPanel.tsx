import { useStudio } from '../store';
import { DEVICE_META, SHADOWS, FIT_MODES, MATERIALS } from '../templates';
import { Section, SliderRow, Seg, Toggle, ColorInput } from './ui';

export function RightPanel() {
  const project = useStudio(s => s.project)!;
  const update = useStudio(s => s.update);
  const selection = useStudio(s => s.selection);
  const selectedDevice = selection?.kind === 'device' && selection.id ? project.devices.find(d => d.id === selection.id) : null;

  if (!selectedDevice) {
    return (
      <div className="w-[292px] shrink-0 border-l border-line2 bg-panel flex flex-col overflow-hidden">
        <div className="flex-1 flex items-center justify-center text-dim text-[11px]" style={{ fontFamily: 'var(--font-mono)' }}>Select a device to edit</div>
      </div>
    );
  }

  const d = selectedDevice;
  const meta = DEVICE_META[d.kind];

  return (
    <div className="w-[292px] shrink-0 border-l border-line2 bg-panel flex flex-col overflow-hidden">
      <div className="px-3.5 py-2.5 border-b border-line2">
        <div className="text-[12px] font-semibold" style={{ fontFamily: 'var(--font-disp)' }}>{d.name}</div>
        <div className="text-[9px] mt-0.5" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-dim)' }}>{meta.label} · {Math.round(d.w)}px wide</div>
      </div>
      <div className="flex-1 overflow-y-auto">
        <Section title="Frame">
          <div className="flex flex-wrap gap-1 mb-2">
            {meta.colors.map(c => (
              <button key={c.hex} className={`w-7 h-7 rounded-lg border-2 transition-all ${d.color === c.hex ? 'border-acc scale-110' : 'border-line'}`} style={{ background: c.hex }} onClick={() => update(p => ({ ...p, devices: p.devices.map(dd => dd.id === d.id ? { ...dd, color: c.hex } : dd) }))} title={c.name} />
            ))}
          </div>
          <SliderRow label="Width" value={d.w} min={100} max={project.canvas.w * 0.9} step={10} fmt={(v) => `${Math.round(v)}px`} onChange={(v) => update(p => ({ ...p, devices: p.devices.map(dd => dd.id === d.id ? { ...dd, w: v } : dd) }))} />
          <SliderRow label="Tilt" value={d.tilt} min={-15} max={15} step={1} fmt={(v) => `${v}°`} onChange={(v) => update(p => ({ ...p, devices: p.devices.map(dd => dd.id === d.id ? { ...dd, tilt: v } : dd) }))} />
          <SliderRow label="Opacity" value={d.opacity} min={0} max={1} step={0.05} onChange={(v) => update(p => ({ ...p, devices: p.devices.map(dd => dd.id === d.id ? { ...dd, opacity: v } : dd) }))} />
        </Section>
        <Section title="Material">
          <Seg options={MATERIALS} value={d.material} onChange={(v) => update(p => ({ ...p, devices: p.devices.map(dd => dd.id === d.id ? { ...dd, material: v } : dd) }))} />
          <SliderRow label="Brightness" value={d.brightness} min={0.5} max={1.5} step={0.05} onChange={(v) => update(p => ({ ...p, devices: p.devices.map(dd => dd.id === d.id ? { ...dd, brightness: v } : dd) }))} />
          <SliderRow label="Reflection" value={d.reflection} min={0} max={1} step={0.05} onChange={(v) => update(p => ({ ...p, devices: p.devices.map(dd => dd.id === d.id ? { ...dd, reflection: v } : dd) }))} />
          <SliderRow label="Corner radius" value={d.radiusMul} min={0.4} max={2} step={0.1} onChange={(v) => update(p => ({ ...p, devices: p.devices.map(dd => dd.id === d.id ? { ...dd, radiusMul: v } : dd) }))} />
        </Section>
        <Section title="Screenshot">
          <Seg options={FIT_MODES} value={d.fit} onChange={(v) => update(p => ({ ...p, devices: p.devices.map(dd => dd.id === d.id ? { ...dd, fit: v } : dd) }))} />
          <SliderRow label="Zoom" value={d.zoom} min={0.5} max={3} step={0.05} onChange={(v) => update(p => ({ ...p, devices: p.devices.map(dd => dd.id === d.id ? { ...dd, zoom: v } : dd) }))} />
          <SliderRow label="Pan X" value={d.panX} min={-1} max={1} step={0.05} onChange={(v) => update(p => ({ ...p, devices: p.devices.map(dd => dd.id === d.id ? { ...dd, panX: v } : dd) }))} />
          <SliderRow label="Pan Y" value={d.panY} min={-1} max={1} step={0.05} onChange={(v) => update(p => ({ ...p, devices: p.devices.map(dd => dd.id === d.id ? { ...dd, panY: v } : dd) }))} />
        </Section>
        <Section title="Shadow">
          <div className="grid grid-cols-4 gap-1">
            {SHADOWS.map(s => (
              <button key={s.id} className={`py-1.5 rounded border text-[8px] transition-all ${d.shadow === s.id ? 'border-acc bg-acc/10 text-acc' : 'border-line text-mut hover:text-fg'}`} onClick={() => update(p => ({ ...p, devices: p.devices.map(dd => dd.id === d.id ? { ...dd, shadow: s.id } : dd) }))}>{s.label}</button>
            ))}
          </div>
        </Section>
        <Section title="Browser URL">
          <input className="input" value={d.url} onChange={(e) => update(p => ({ ...p, devices: p.devices.map(dd => dd.id === d.id ? { ...dd, url: e.target.value } : dd) }))} placeholder="yourapp.com" />
        </Section>
      </div>
    </div>
  );
}

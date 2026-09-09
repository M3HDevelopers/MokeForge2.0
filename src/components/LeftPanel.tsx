import { useState } from 'react';
import { useStudio } from '../store';
import { DEVICE_META, BG_PRESETS, SHADOWS, FIT_MODES, DECO_SETS, MATERIALS, PATTERNS, LIGHTING, TYPO_PRESETS } from '../templates';
import { Section, Seg, SliderRow, Toggle, ColorInput, PosGrid } from './ui';
import { IcBg, IcBrand, IcGrid, IcImage, IcLayers, IcType, IcUpload } from '../icons';

export function LeftPanel() {
  const [tab, setTab] = useState<'screens' | 'devices' | 'bg' | 'text' | 'logo' | 'deco'>('devices');
  const project = useStudio(s => s.project)!;
  const update = useStudio(s => s.update);
  const addDevice = useStudio(s => s.addDevice);
  const removeDevice = useStudio(s => s.removeDevice);
  const addFiles = useStudio(s => s.addFiles);
  const selection = useStudio(s => s.selection);
  const setSelection = useStudio(s => s.setSelection);

  const tabs = [
    { id: 'screens' as const, label: 'Screens', icon: <IcImage size={14} /> },
    { id: 'devices' as const, label: 'Devices', icon: <IcLayers size={14} /> },
    { id: 'bg' as const, label: 'BG', icon: <IcBg size={14} /> },
    { id: 'text' as const, label: 'Text', icon: <IcType size={14} /> },
    { id: 'logo' as const, label: 'Logo', icon: <IcBrand size={14} /> },
    { id: 'deco' as const, label: 'Deco', icon: <IcGrid size={14} /> },
  ];

  return (
    <div className="w-[264px] shrink-0 border-r border-line2 bg-panel flex flex-col overflow-hidden">
      <div className="flex border-b border-line2">
        {tabs.map(t => (
          <button key={t.id} className={`flex-1 flex flex-col items-center gap-0.5 py-2 text-[9px] transition-colors ${tab === t.id ? 'text-acc bg-panel2' : 'text-dim hover:text-mut'}`} onClick={() => setTab(t.id)}>
            {t.icon}<span>{t.label}</span>
          </button>
        ))}
      </div>
      <div className="flex-1 overflow-y-auto">
        {tab === 'devices' && (
          <Section title="Devices">
            <div className="grid grid-cols-5 gap-1 mb-3">
              {(Object.keys(DEVICE_META) as Array<keyof typeof DEVICE_META>).map(k => (
                <button key={k} className="icon-btn !w-full !h-9 flex-col gap-0.5 !rounded-lg border border-line text-[8px]" onClick={() => addDevice(k as any)}>
                  <span className="text-[9px]">{DEVICE_META[k].label.slice(0, 4)}</span>
                </button>
              ))}
            </div>
            {project.devices.map(d => (
              <div key={d.id} className={`flex items-center gap-2 px-2 py-1.5 rounded-lg cursor-pointer mb-1 ${selection?.id === d.id ? 'bg-panel3 border border-acc' : 'hover:bg-panel2'}`} onClick={() => setSelection({ kind: 'device', id: d.id })}>
                <span className="text-[11px] flex-1 truncate">{d.name}</span>
                <button className="icon-btn !w-5 !h-5" onClick={(e) => { e.stopPropagation(); removeDevice(d.id); }}>×</button>
              </div>
            ))}
          </Section>
        )}
        {tab === 'screens' && (
          <Section title="Screenshots">
            <label className="btn w-full justify-center cursor-pointer mb-3"><IcUpload size={14} />Upload images<input type="file" hidden multiple accept="image/*" onChange={(e) => { if (e.target.files) void addFiles(e.target.files); }} /></label>
            <div className="grid grid-cols-2 gap-1.5">
              {project.assets.map(a => (
                <div key={a.id} className="relative rounded-lg overflow-hidden border border-line aspect-video">
                  <img src={a.dataUrl} alt={a.name} className="w-full h-full object-cover" />
                  <div className="absolute bottom-0 inset-x-0 px-1.5 py-0.5 bg-black/60 text-[8px] truncate">{a.name}</div>
                </div>
              ))}
            </div>
          </Section>
        )}
        {tab === 'bg' && (
          <Section title="Background">
            <div className="grid grid-cols-4 gap-1 mb-3">
              {BG_PRESETS.map(bp => (
                <button key={bp.id} className="aspect-square rounded-lg border border-line overflow-hidden hover:border-acc transition-colors" onClick={() => update(p => ({ ...p, background: { ...bp.bg, seed: p.background.seed }, accents: { a1: bp.bg.c1 === '#17191e' ? '#ff6b3d' : '#45d6c8', a2: '#45d6c8' } }))}>
                  <div className="w-full h-full" style={{ background: `linear-gradient(135deg, ${bp.sw[0]}, ${bp.sw[1]})` }} />
                </button>
              ))}
            </div>
            <Seg options={PATTERNS} value={project.background.pattern} onChange={(v) => update(p => ({ ...p, background: { ...p.background, pattern: v } }))} />
            <SliderRow label="Pattern opacity" value={project.background.patternOpacity} min={0} max={1} step={0.05} onChange={(v) => update(p => ({ ...p, background: { ...p.background, patternOpacity: v } }))} />
            <Seg options={LIGHTING} value={project.background.light.type} onChange={(v) => update(p => ({ ...p, background: { ...p.background, light: { ...p.background.light, type: v } } }))} />
          </Section>
        )}
        {tab === 'text' && (
          <Section title="Text Block">
            <Toggle on={project.text.enabled} onChange={(v) => update(p => ({ ...p, text: { ...p.text, enabled: v } }))} label="Show text" />
            {project.text.enabled && (
              <>
                <input className="input mt-2" placeholder="Title" value={project.text.title} onChange={(e) => update(p => ({ ...p, text: { ...p.text, title: e.target.value } }))} />
                <input className="input mt-1.5" placeholder="Subtitle" value={project.text.subtitle} onChange={(e) => update(p => ({ ...p, text: { ...p.text, subtitle: e.target.value } }))} />
                <div className="mt-2"><div className="label-mono mb-1">Position</div><PosGrid value={project.text.position} onChange={(v) => update(p => ({ ...p, text: { ...p.text, position: v } }))} /></div>
                <SliderRow label="Scale" value={project.text.scale} min={0.5} max={2} step={0.05} onChange={(v) => update(p => ({ ...p, text: { ...p.text, scale: v } }))} />
                <Toggle on={project.text.autoColor} onChange={(v) => update(p => ({ ...p, text: { ...p.text, autoColor: v } }))} label="Auto color" />
              </>
            )}
          </Section>
        )}
        {tab === 'logo' && (
          <Section title="Logo">
            <Toggle on={project.logo.enabled} onChange={(v) => update(p => ({ ...p, logo: { ...p.logo, enabled: v } }))} label="Show logo" />
            {project.logo.enabled && (
              <>
                <div className="mt-2"><div className="label-mono mb-1">Position</div><PosGrid value={project.logo.position} onChange={(v) => update(p => ({ ...p, logo: { ...p.logo, position: v } }))} /></div>
                <SliderRow label="Size" value={project.logo.size} min={0.03} max={0.2} step={0.01} onChange={(v) => update(p => ({ ...p, logo: { ...p.logo, size: v } }))} />
                <SliderRow label="Opacity" value={project.logo.opacity} min={0} max={1} step={0.05} onChange={(v) => update(p => ({ ...p, logo: { ...p.logo, opacity: v } }))} />
              </>
            )}
          </Section>
        )}
        {tab === 'deco' && (
          <Section title="Decorations">
            <Seg options={DECO_SETS} value={project.decoration.set} onChange={(v) => update(p => ({ ...p, decoration: { ...p.decoration, set: v } }))} />
            <SliderRow label="Intensity" value={project.decoration.intensity} min={0.2} max={2} step={0.1} onChange={(v) => update(p => ({ ...p, decoration: { ...p.decoration, intensity: v } }))} />
            <SliderRow label="Density" value={project.decoration.density} min={0} max={1} step={0.05} onChange={(v) => update(p => ({ ...p, decoration: { ...p.decoration, density: v } }))} />
          </Section>
        )}
      </div>
    </div>
  );
}

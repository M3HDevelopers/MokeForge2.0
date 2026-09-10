import { useState } from 'react';
import { useStudio } from '../store';
import type { BgStyle, DeviceLayer, LightType, Material, PatternKind, ShadowPreset } from '../types';
import {
  clamp, DECO_SETS, DEVICE_META, FIT_MODES, LIGHTING, MATERIALS, PATTERNS, SHADOWS,
  TECH_BADGES, TYPO_PRESETS, textOn, suggestFitMode,
} from '../templates';
import { DECO_PRESETS } from '../templates';
import { ColorInput, PosGrid, Section, Seg, SliderRow, Toggle } from './ui';
import {
  IcAlignH, IcAlignV, IcArrowL, IcArrowR, IcBg, IcBrand, IcCopy, IcDown, IcEye, IcEyeOff, 
  IcImage, IcLayers, IcSpark, IcTrash, IcType, IcUp,
} from '../icons';

const BG_STYLE_OPTS: { id: BgStyle; label: string }[] = [
  { id: 'plain', label: 'Clean' }, { id: 'studio', label: 'Studio' }, { id: 'abstract', label: 'Abstract' },
  { id: 'architectural', label: 'Arch' }, { id: 'grid', label: 'Grid' }, { id: 'editorial', label: 'Editorial' },
  { id: 'tech', label: 'Tech' }, { id: 'glass', label: 'Glass' },
];

export function RightPanel() {
  const selection = useStudio(s => s.selection);
  const project = useStudio(s => s.project)!;
  const device = selection?.kind === 'device' ? project.devices.find(d => d.id === selection.id) : undefined;
  const icon = selection?.kind === 'icon' ? project.icons.find(i => i.id === selection.id) : undefined;
  const deco = selection?.kind === 'deco' ? project.decos.find(d => d.id === selection.id) : undefined;
  const textbox = selection?.kind === 'textbox' ? project.textboxes.find(t => t.id === selection.id) : undefined;
  const canvasImage = selection?.kind === 'image' ? project.canvasImages.find(img => img.id === selection.id) : undefined;

  return (
    <div className="w-[292px] shrink-0 border-l border-line2 bg-panel flex flex-col h-full overflow-hidden">
      <div className="flex-1 overflow-y-auto overflow-x-hidden bg-ink min-h-0">
        {device ? <DeviceProps d={device} />
          : canvasImage ? <CanvasImageProps img={canvasImage} />
          : icon ? <IconProps i={icon} />
          : deco ? <DecoProps d={deco} />
          : textbox ? <TextBoxProps t={textbox} />
          : selection?.kind === 'text' ? <TextProps />
          : selection?.kind === 'logo' ? <LogoProps />
          : <BackgroundProps />}
        <LayersList />
      </div>
    </div>
  );
}

function DeviceProps({ d }: { d: DeviceLayer }) {
  const project = useStudio(s => s.project)!;
  const update = useStudio(s => s.update);
  const checkpoint = useStudio(s => s.checkpoint);
  const removeDevice = useStudio(s => s.removeDevice);
  const duplicateDevice = useStudio(s => s.duplicateDevice);
  const reorderDevice = useStudio(s => s.reorderDevice);
  const alignDevices = useStudio(s => s.alignDevices);
  const distributeDevices = useStudio(s => s.distributeDevices);
  const meta = DEVICE_META[d.kind];
  const patch = (fn: (x: DeviceLayer) => DeviceLayer) =>
    update(p => ({ ...p, devices: p.devices.map(x => x.id === d.id ? fn(x) : x) }), false);
  const aspect = meta.aspect;
  const h = d.w / aspect;

  return (
    <>
      <Section title={meta.label} right={
        <span className="text-[10px]" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-dim)' }}>{d.name}</span>
      }>
        <div className="flex gap-1 mb-1">
          <button className="icon-btn" title="Move up (front)" onClick={() => reorderDevice(d.id, 1)}><IcUp size={14} /></button>
          <button className="icon-btn" title="Move down (back)" onClick={() => reorderDevice(d.id, -1)}><IcDown size={14} /></button>
          <button className="icon-btn" title="Duplicate (Ctrl+D)" onClick={() => duplicateDevice(d.id)}><IcCopy size={14} /></button>
          <button className="icon-btn hover:!text-danger" title="Delete (Del)" onClick={() => removeDevice(d.id)}><IcTrash size={14} /></button>
        </div>
      </Section>

      <Section title="Screenshot">
        <div className="grid grid-cols-4 gap-1.5">
          <button
            className="h-12 rounded-md border text-[9px] cursor-pointer transition-all"
            style={{
              fontFamily: 'var(--font-mono)',
              borderColor: d.assetId === null ? 'var(--color-acc)' : 'var(--color-line)',
              background: d.assetId === null ? 'rgba(255,107,61,0.1)' : 'var(--color-panel)',
              color: d.assetId === null ? 'var(--color-acc)' : 'var(--color-dim)',
            }}
            onClick={() => { checkpoint(); patch(x => ({ ...x, assetId: null })); }}
          >
            none
          </button>
          {project.assets.map(a => (
            <button
              key={a.id}
              className="h-12 rounded-md overflow-hidden border cursor-pointer transition-all hover:scale-[1.04]"
              style={{ borderColor: d.assetId === a.id ? 'var(--color-acc)' : 'var(--color-line)', boxShadow: d.assetId === a.id ? '0 0 0 2px rgba(255,107,61,0.2)' : undefined }}
              onClick={() => { checkpoint(); patch(x => ({ ...x, assetId: a.id })); }}
              title={a.name}
            >
              <img src={a.dataUrl} alt={a.name} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>

        {d.assetId && (
          <>
            <div className="mt-3">
              <div className="label-mono mb-1.5">Fit mode</div>
              <Seg options={FIT_MODES} value={d.fit} onChange={(v) => { checkpoint(); patch(x => ({ ...x, fit: v })); }} />
            </div>
            
            <div className="mt-3 flex gap-1.5">
              <button 
                className="btn flex-1 !text-[10px] !py-1.5 justify-center"
                onClick={() => { 
                  checkpoint(); 
                  // Auto-fit: calculate best fit mode based on aspect ratios
                  const asset = project.assets.find(a => a.id === d.assetId);
                  if (asset) {
                    const screenAspect = (d.w / DEVICE_META[d.kind].aspect) / d.w;
                    const imageAspect = asset.w / asset.h;
                    const suggestedFit = suggestFitMode(screenAspect, imageAspect);
                    patch(x => ({ ...x, zoom: 1, panX: 0, panY: 0, fit: suggestedFit }));
                  } else {
                    patch(x => ({ ...x, zoom: 1, panX: 0, panY: 0, fit: 'cover' }));
                  }
                }}
              >
                Auto-fit
              </button>
              <button 
                className="btn flex-1 !text-[10px] !py-1.5 justify-center"
                onClick={() => { 
                  checkpoint(); 
                  patch(x => ({ ...x, zoom: 1, panX: 0, panY: 0 })); 
                }}
              >
                Reset
              </button>
            </div>

            <div className="mt-3">
              <SliderRow label="Zoom" value={d.zoom} min={0.5} max={3} step={0.01} fmt={v => `${Math.round(v * 100)}%`} onStart={checkpoint} onChange={v => patch(x => ({ ...x, zoom: v }))} />
              <SliderRow label="Position X" value={d.panX} min={-1} max={1} step={0.01} fmt={v => `${Math.round(v * 100)}%`} onStart={checkpoint} onChange={v => patch(x => ({ ...x, panX: v }))} />
              <SliderRow label="Position Y" value={d.panY} min={-1} max={1} step={0.01} fmt={v => `${Math.round(v * 100)}%`} onStart={checkpoint} onChange={v => patch(x => ({ ...x, panY: v }))} />
            </div>

            <div className="mt-2 p-2 rounded-lg border border-line bg-panel">
              <div className="text-[9px] text-dim mb-1">Quick tips:</div>
              <ul className="text-[9px] text-mut space-y-0.5">
                <li>• Use "Auto-fit" for perfect fit</li>
                <li>• Zoom in/out to adjust size</li>
                <li>• Pan to reposition screenshot</li>
                <li>• "Cover" mode fills entire frame</li>
              </ul>
            </div>
          </>
        )}
      </Section>

      <Section title="Transform">
        <SliderRow label="Size" value={Math.round((d.w / project.canvas.w) * 100)} min={8} max={110} fmt={v => `${v}%`} onStart={checkpoint}
          onChange={v => patch(x => ({ ...x, w: clamp((v / 100) * project.canvas.w, 90, project.canvas.w * 1.1) }))} />
        <SliderRow label="Tilt" value={d.tilt} min={-24} max={24} fmt={v => `${v}°`} onStart={checkpoint} onChange={v => patch(x => ({ ...x, tilt: v }))} />
        <SliderRow label="X" value={Math.round(d.x)} min={-Math.round(d.w)} max={project.canvas.w} onStart={checkpoint} onChange={v => patch(x => ({ ...x, x: v }))} />
        <SliderRow label="Y" value={Math.round(d.y)} min={-Math.round(h)} max={project.canvas.h} onStart={checkpoint} onChange={v => patch(x => ({ ...x, y: v }))} />
      </Section>

      <Section title="Frame color">
        <div className="flex gap-2 flex-wrap">
          {meta.colors.map(c => (
            <button
              key={c.hex}
              title={c.name}
              onClick={() => { checkpoint(); patch(x => ({ ...x, color: c.hex })); }}
              className="cursor-pointer transition-transform hover:scale-110"
              style={{
                width: 26, height: 26, borderRadius: 8, background: c.hex,
                border: `2px solid ${d.color === c.hex ? 'var(--color-acc)' : 'var(--color-line)'}`,
                boxShadow: d.color === c.hex ? '0 0 0 3px rgba(255,107,61,0.18)' : undefined,
              }}
            />
          ))}
          <ColorInput value={d.color} onChange={(v) => patch(x => ({ ...x, color: v }))} label="custom" />
        </div>
      </Section>

      <Section title="Shadow">
        <div className="grid grid-cols-5 gap-1">
          {SHADOWS.map(sh => (
            <button
              key={sh.id}
              onClick={() => { checkpoint(); patch(x => ({ ...x, shadow: sh.id as ShadowPreset })); }}
              className="py-1.5 text-[10.5px] rounded-md border cursor-pointer transition-all"
              style={{
                fontFamily: 'var(--font-mono)',
                borderColor: d.shadow === sh.id ? 'var(--color-acc)' : 'var(--color-line)',
                background: d.shadow === sh.id ? 'rgba(255,107,61,0.12)' : 'var(--color-panel)',
                color: d.shadow === sh.id ? 'var(--color-acc)' : 'var(--color-mut)',
              }}
            >
              {sh.label}
            </button>
          ))}
        </div>
      </Section>

      <Section title="Appearance">
        <SliderRow label="Brightness" value={Math.round((d.brightness ?? 1) * 100)} min={50} max={150} fmt={v => `${v}%`} onStart={checkpoint} onChange={v => patch(x => ({ ...x, brightness: v / 100 }))} />
        <SliderRow label="Reflection" value={Math.round((d.reflection ?? 0) * 100)} min={0} max={100} fmt={v => `${v}%`} onStart={checkpoint} onChange={v => patch(x => ({ ...x, reflection: v / 100 }))} />
        <SliderRow label="Corner radius" value={Math.round((d.radiusMul ?? 1) * 100)} min={40} max={200} fmt={v => `${v}%`} onStart={checkpoint} onChange={v => patch(x => ({ ...x, radiusMul: v / 100 }))} />
        <SliderRow label="Opacity" value={Math.round((d.opacity ?? 1) * 100)} min={10} max={100} fmt={v => `${v}%`} onStart={checkpoint} onChange={v => patch(x => ({ ...x, opacity: v / 100 }))} />
        <div className="mt-2">
          <div className="label-mono mb-1.5">Material</div>
          <Seg options={MATERIALS} value={d.material ?? 'matte'} onChange={(v) => { checkpoint(); patch(x => ({ ...x, material: v as Material })); }} />
        </div>
      </Section>

      <Section title="Arrange all devices">
        <div className="grid grid-cols-2 gap-1.5">
          <button className="btn !text-[11px] justify-center" onClick={() => alignDevices('h')}><IcAlignH size={13} /> Top</button>
          <button className="btn !text-[11px] justify-center" onClick={() => alignDevices('center')}><IcAlignH size={13} /> Centers</button>
          <button className="btn !text-[11px] justify-center" onClick={() => alignDevices('v')}><IcAlignV size={13} /> Left</button>
          <button className="btn !text-[11px] justify-center" onClick={() => distributeDevices('h')}><IcAlignH size={13} /> Spread H</button>
        </div>
      </Section>

      {d.kind === 'browser' && (
        <Section title="Address bar">
          <input className="input" value={d.url} placeholder="yourapp.com"
            onChange={(e) => patch(x => ({ ...x, url: e.target.value }))}
            onFocus={() => checkpoint()} style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }} />
        </Section>
      )}
    </>
  );
}

function BackgroundProps() {
  const project = useStudio(s => s.project)!;
  const update = useStudio(s => s.update);
  const checkpoint = useStudio(s => s.checkpoint);
  const b = project.background;
  const patch = (fn: (x: typeof b) => typeof b) => update(p => ({ ...p, background: fn(p.background) }), false);
  const dpatch = (fn: (x: typeof project.decoration) => typeof project.decoration) => update(p => ({ ...p, decoration: fn(p.decoration) }), false);

  // When background style changes, clear existing decorations and icons to avoid duplicates
  const changeBgStyle = (style: BgStyle) => {
    checkpoint();
    update(p => ({
      ...p,
      background: { ...p.background, style },
      // Clear decorations and icons when switching background style
      decos: [],
      icons: [],
    }), false);
  };

  return (
    <>
      <Section title="Backdrop style">
        <div className="grid grid-cols-4 gap-1 mb-2.5">
          {BG_STYLE_OPTS.map(s => (
            <button
              key={s.id}
              onClick={() => changeBgStyle(s.id)}
              className="py-1.5 text-[9.5px] rounded-md border cursor-pointer transition-all"
              style={{
                fontFamily: 'var(--font-mono)',
                borderColor: b.style === s.id ? 'var(--color-acc)' : 'var(--color-line)',
                background: b.style === s.id ? 'rgba(255,107,61,0.12)' : 'var(--color-panel)',
                color: b.style === s.id ? 'var(--color-acc)' : 'var(--color-mut)',
              }}
            >
              {s.label}
            </button>
          ))}
        </div>
        <div className="label-mono mb-1.5">Lighting</div>
        <Seg
          options={LIGHTING.map(l => ({ id: l.id, label: l.label.split(' ')[0] })) as { id: LightType; label: string }[]}
          value={b.light?.type ?? 'none'}
          onChange={(v) => { checkpoint(); patch(x => ({ ...x, light: { type: v, intensity: x.light?.intensity ?? 0.55 } })); }}
        />
      </Section>

      <Section title="Background">
        <Seg
          options={[{ id: 'solid', label: 'Solid' }, { id: 'linear', label: 'Linear' }, { id: 'radial', label: 'Radial' }, { id: 'mesh', label: 'Mesh' }] as { id: typeof b.type; label: string }[]}
          value={b.type}
          onChange={(v) => { 
            checkpoint(); 
            // When changing background type, switch to procedural mode and clear decorations/icons
            patch(x => ({ ...x, type: v, kind: 'procedural' }));
            update(p => ({ ...p, decos: [], icons: [] }), false);
          }}
        />
        <div className="flex items-center gap-3 mt-3">
          <ColorInput value={b.c1} onChange={(v) => { checkpoint(); patch(x => ({ ...x, c1: v })); }} label="base" />
          {b.type !== 'solid' && <ColorInput value={b.c2} onChange={(v) => { checkpoint(); patch(x => ({ ...x, c2: v })); }} label="second" />}
          {b.type === 'mesh' && <ColorInput value={b.c3} onChange={(v) => { checkpoint(); patch(x => ({ ...x, c3: v })); }} label="third" />}
        </div>
      </Section>

      <Section title="Pattern overlay">
        <div className="grid grid-cols-6 gap-1 mb-2.5">
          {PATTERNS.map(pt => (
            <button
              key={pt.id}
              onClick={() => { 
                checkpoint(); 
                // When changing pattern, switch to procedural mode
                patch(x => ({ ...x, pattern: pt.id as PatternKind, kind: 'procedural' }));
              }}
              className="py-1.5 text-[9.5px] rounded-md border cursor-pointer transition-all"
              style={{
                fontFamily: 'var(--font-mono)',
                borderColor: b.pattern === pt.id ? 'var(--color-acc)' : 'var(--color-line)',
                background: b.pattern === pt.id ? 'rgba(255,107,61,0.12)' : 'var(--color-panel)',
                color: b.pattern === pt.id ? 'var(--color-acc)' : 'var(--color-mut)',
              }}
            >
              {pt.label}
            </button>
          ))}
        </div>
        {b.pattern !== 'none' && (
          <SliderRow label="Pattern opacity" value={Math.round(b.patternOpacity * 100)} min={2} max={60} fmt={v => `${v}%`}
            onStart={checkpoint} onChange={v => patch(x => ({ ...x, patternOpacity: v / 100 }))} />
        )}
      </Section>

      <Section title="Decorative shapes">
        <div className="grid grid-cols-6 gap-1 mb-2.5">
          {DECO_SETS.map(ds => (
            <button
              key={ds.id}
              onClick={() => { 
                checkpoint(); 
                // When changing decorative shapes, clear existing decorations to avoid duplicates
                update(p => ({ ...p, decos: [], decoration: { ...p.decoration, set: ds.id } }), false);
              }}
              className="py-1.5 text-[9.5px] rounded-md border cursor-pointer transition-all"
              style={{
                fontFamily: 'var(--font-mono)',
                borderColor: project.decoration.set === ds.id ? 'var(--color-acc)' : 'var(--color-line)',
                background: project.decoration.set === ds.id ? 'rgba(255,107,61,0.12)' : 'var(--color-panel)',
                color: project.decoration.set === ds.id ? 'var(--color-acc)' : 'var(--color-mut)',
              }}
            >
              {ds.label}
            </button>
          ))}
        </div>
        <SliderRow label="Intensity" value={Math.round(project.decoration.intensity * 100)} min={40} max={150} fmt={v => `${v}%`}
          onStart={checkpoint} onChange={v => dpatch(x => ({ ...x, intensity: v / 100 }))} />
        <div className="flex items-center gap-3 mt-3">
          <ColorInput value={project.accents.a1} onChange={(v) => { checkpoint(); update(p => ({ ...p, accents: { ...p.accents, a1: v } })); }} />
          <ColorInput value={project.accents.a2} onChange={(v) => { checkpoint(); update(p => ({ ...p, accents: { ...p.accents, a2: v } })); }} />
        </div>
      </Section>

      <Section title={`Decoration layers · ${project.decos.length}`}>
        {project.decos.length === 0 && (
          <p className="text-[10.5px]" style={{ color: 'var(--color-dim)', fontFamily: 'var(--font-mono)' }}>
            none — add from the Decor tab or press Surprise me
          </p>
        )}
        <div className="space-y-2">
          {project.decos.map((dec, i) => {
            const label = DECO_PRESETS.find(pp => pp.id === dec.preset)?.label ?? dec.preset;
            return (
              <div key={dec.id} className="rounded-lg border border-line bg-panel p-2">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] font-medium">{i + 1}. {label}</span>
                  <button className="icon-btn !w-5 !h-5" onClick={() => { checkpoint(); update(p => ({ ...p, decos: p.decos.filter(x => x.id !== dec.id) }), false); }}>
                    <IcTrash size={10} />
                  </button>
                </div>
                <SliderRow label="Opacity" value={Math.round(dec.opacity * 100)} min={5} max={100} fmt={v => `${v}%`}
                  onStart={checkpoint} onChange={v => update(p => ({ ...p, decos: p.decos.map(x => x.id === dec.id ? { ...x, opacity: v / 100 } : x) }), false)} />
                <SliderRow label="Scale" value={Math.round(dec.scale * 1000)} min={20} max={220} fmt={v => `${(v / 1000).toFixed(2)}`}
                  onStart={checkpoint} onChange={v => update(p => ({ ...p, decos: p.decos.map(x => x.id === dec.id ? { ...x, scale: v / 1000 } : x) }), false)} />
              </div>
            );
          })}
        </div>
      </Section>
    </>
  );
}

function TextProps() {
  const project = useStudio(s => s.project)!;
  const update = useStudio(s => s.update);
  const checkpoint = useStudio(s => s.checkpoint);
  const t = project.text;
  
  // Safety check - prevent crash if text is undefined
  if (!t) return null;
  
  const patch = (fn: (x: typeof t) => typeof t) => update(p => ({ ...p, text: fn(p.text) }), false);

  return (
    <>
      <Section title="Typography presets">
        <div className="flex flex-wrap gap-1.5">
          {TYPO_PRESETS.map(tp => (
            <button
              key={tp.id}
              className={`chip ${t.scale === tp.scale && t.position === tp.pos ? 'on' : ''}`}
              onClick={() => { checkpoint(); patch(x => ({ ...x, scale: tp.scale, position: tp.pos })); }}
            >
              {tp.label}
            </button>
          ))}
        </div>
      </Section>

      <Section title="Font family">
        <div className="grid grid-cols-3 gap-1.5 max-h-[300px] overflow-y-auto">
          {[
            { id: 'space-grotesk', label: 'Space Grotesk', font: '"Space Grotesk", sans-serif' },
            { id: 'ibm-plex', label: 'IBM Plex', font: '"IBM Plex Sans", sans-serif' },
            { id: 'system', label: 'System', font: 'system-ui, sans-serif' },
            { id: 'mono', label: 'Mono', font: '"JetBrains Mono", monospace' },
            { id: 'serif', label: 'Serif', font: 'Georgia, serif' },
            { id: 'rounded', label: 'Rounded', font: '"Nunito", sans-serif' },
            { id: 'playfair', label: 'Playfair', font: '"Playfair Display", serif' },
            { id: 'roboto', label: 'Roboto', font: '"Roboto", sans-serif' },
            { id: 'open-sans', label: 'Open Sans', font: '"Open Sans", sans-serif' },
            { id: 'lato', label: 'Lato', font: '"Lato", sans-serif' },
            { id: 'montserrat', label: 'Montserrat', font: '"Montserrat", sans-serif' },
            { id: 'poppins', label: 'Poppins', font: '"Poppins", sans-serif' },
            { id: 'raleway', label: 'Raleway', font: '"Raleway", sans-serif' },
            { id: 'oswald', label: 'Oswald', font: '"Oswald", sans-serif' },
            { id: 'merriweather', label: 'Merriweather', font: '"Merriweather", serif' },
            { id: 'source-code', label: 'Source Code', font: '"Source Code Pro", monospace' },
            { id: 'fira-code', label: 'Fira Code', font: '"Fira Code", monospace' },
            { id: 'inter', label: 'Inter', font: '"Inter", sans-serif' },
            { id: 'work-sans', label: 'Work Sans', font: '"Work Sans", sans-serif' },
            { id: 'nunito-sans', label: 'Nunito Sans', font: '"Nunito Sans", sans-serif' },
          ].map(f => (
            <button
              key={f.id}
              className="py-2 px-2 rounded-md border text-[10px] transition-all"
              style={{
                fontFamily: f.font,
                borderColor: (t.fontFamily || 'space-grotesk') === f.id ? 'var(--color-acc)' : 'var(--color-line)',
                background: (t.fontFamily || 'space-grotesk') === f.id ? 'rgba(255,107,61,0.12)' : 'var(--color-panel)',
                color: (t.fontFamily || 'space-grotesk') === f.id ? 'var(--color-acc)' : 'var(--color-mut)',
              }}
              onClick={() => { checkpoint(); patch(x => ({ ...x, fontFamily: f.id })); }}
            >
              {f.label}
            </button>
          ))}
        </div>
      </Section>

      <Section title="Text block" right={<Toggle on={t.enabled} onChange={(v) => { checkpoint(); patch(x => ({ ...x, enabled: v })); }} />}>
        <input className="input mb-2" placeholder="Project name" value={t.title}
          onChange={(e) => patch(x => ({ ...x, title: e.target.value }))} onFocus={checkpoint}
          style={{ fontFamily: 'var(--font-disp)', fontWeight: 600 }} />
        <input className="input" placeholder="One-line description" value={t.subtitle}
          onChange={(e) => patch(x => ({ ...x, subtitle: e.target.value }))} onFocus={checkpoint}
          style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }} />
        <div className="mt-3">
          <SliderRow label="Text scale" value={Math.round(t.scale * 100)} min={60} max={160} fmt={v => `${v}%`}
            onStart={checkpoint} onChange={v => patch(x => ({ ...x, scale: v / 100 }))} />
        </div>
      </Section>

      <Section title="Position">
        <PosGrid value={t.position} onChange={(v) => { checkpoint(); patch(x => ({ ...x, position: v })); }} />
      </Section>

      <Section title="Color">
        <div className="flex items-center gap-3">
          <Toggle on={t.autoColor} onChange={(v) => { checkpoint(); patch(x => ({ ...x, autoColor: v })); }} label="Auto contrast" />
          {!t.autoColor && <ColorInput value={t.color} onChange={(v) => { checkpoint(); patch(x => ({ ...x, color: v })); }} />}
        </div>
        <div className="mt-2 text-[10.5px]" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-dim)' }}>
          auto → {textOn(project.background.c1)}
        </div>
      </Section>

      <Section title="Tech badges" right={<Toggle on={t.showBadges} onChange={(v) => { checkpoint(); patch(x => ({ ...x, showBadges: v })); }} />}>
        <div className="flex flex-wrap gap-1.5">
          {TECH_BADGES.map(b => {
            const on = t.badges.includes(b);
            return (
              <button
                key={b}
                className={`chip ${on ? 'on' : ''}`}
                onClick={() => { checkpoint(); patch(x => ({ ...x, badges: on ? x.badges.filter(y => y !== b) : [...x.badges, b] })); }}
              >
                {b}
              </button>
            );
          })}
        </div>
      </Section>
    </>
  );
}

function LogoProps() {
  const project = useStudio(s => s.project)!;
  const update = useStudio(s => s.update);
  const checkpoint = useStudio(s => s.checkpoint);
  const l = project.logo;
  const patch = (fn: (x: typeof l) => typeof l) => update(p => ({ ...p, logo: fn(p.logo) }), false);

  return (
    <>
      <Section title="Logo" right={<Toggle on={l.enabled} onChange={(v) => { checkpoint(); patch(x => ({ ...x, enabled: v })); }} />}>
        <div className="grid grid-cols-4 gap-1.5">
          {project.assets.map(a => (
            <button
              key={a.id}
              className="h-12 rounded-md overflow-hidden border cursor-pointer bg-panel transition-all hover:scale-[1.04] p-1"
              style={{ borderColor: l.assetId === a.id ? 'var(--color-acc)' : 'var(--color-line)' }}
              onClick={() => { checkpoint(); patch(x => ({ ...x, assetId: a.id, enabled: true })); }}
              title={a.name}
            >
              <img src={a.dataUrl} alt={a.name} className="w-full h-full object-contain" />
            </button>
          ))}
          {project.assets.length === 0 && (
            <p className="col-span-4 text-[11.5px]" style={{ color: 'var(--color-dim)' }}>Upload a logo in the Screens tab first.</p>
          )}
        </div>
        <div className="mt-3">
          <SliderRow label="Size" value={Math.round(l.size * 100)} min={4} max={25} fmt={v => `${v}%`} onStart={checkpoint} onChange={v => patch(x => ({ ...x, size: v / 100 }))} />
          <SliderRow label="Opacity" value={Math.round(l.opacity * 100)} min={10} max={100} fmt={v => `${v}%`} onStart={checkpoint} onChange={v => patch(x => ({ ...x, opacity: v / 100 }))} />
        </div>
      </Section>
      <Section title="Position">
        <PosGrid value={l.position} onChange={(v) => { checkpoint(); patch(x => ({ ...x, position: v })); }} />
      </Section>
    </>
  );
}

function DecoProps({ d }: { d: any }) {
  const project = useStudio(s => s.project)!;
  const update = useStudio(s => s.update);
  const checkpoint = useStudio(s => s.checkpoint);
  const patch = (fn: (x: any) => any) =>
    update(p => ({ ...p, decos: p.decos.map(x => x.id === d.id ? fn(x) : x) }), false);

  return (
    <>
      <Section title="Decoration" right={
        <button className="icon-btn !w-6 !h-6 hover:!text-danger" onClick={() => {
          checkpoint();
          update(p => ({ ...p, decos: p.decos.filter(x => x.id !== d.id) }));
        }}>
          <IcTrash size={12} />
        </button>
      }>
        <div className="text-[11px] mb-2" style={{ color: 'var(--color-dim)', fontFamily: 'var(--font-mono)' }}>
          {d.preset}
        </div>
      </Section>

      <Section title="Transform">
        <SliderRow label="Size" value={Math.round(d.scale * 100)} min={2} max={30} fmt={v => `${v}%`} onStart={checkpoint} onChange={v => patch((x: any) => ({ ...x, scale: v / 100 }))} />
        <SliderRow label="Rotation" value={d.rotation} min={-180} max={180} fmt={v => `${v}°`} onStart={checkpoint} onChange={v => patch((x: any) => ({ ...x, rotation: v }))} />
        <SliderRow label="Opacity" value={Math.round(d.opacity * 100)} min={10} max={100} fmt={v => `${v}%`} onStart={checkpoint} onChange={v => patch((x: any) => ({ ...x, opacity: v / 100 }))} />
      </Section>

      <Section title="Effects">
        <SliderRow label="Blur" value={d.blur || 0} min={0} max={20} fmt={v => `${v}px`} onStart={checkpoint} onChange={v => patch((x: any) => ({ ...x, blur: v }))} />
        <Toggle on={d.shadow || false} onChange={(v) => { checkpoint(); patch((x: any) => ({ ...x, shadow: v })); }} label="Shadow" />
        <Toggle on={d.glow || false} onChange={(v) => { checkpoint(); patch((x: any) => ({ ...x, glow: v })); }} label="Glow" />
        {d.glow && (
          <ColorInput value={d.hue || '#ffffff'} onChange={(v) => { checkpoint(); patch((x: any) => ({ ...x, hue: v })); }} label="glow color" />
        )}
      </Section>

      <Section title="Depth">
        <div className="grid grid-cols-2 gap-1.5">
          <button
            className={`py-2 text-[10px] rounded-md border cursor-pointer transition-all ${d.depth === 'back' ? 'border-acc bg-acc/10 text-acc' : 'border-line bg-panel text-mut'}`}
            onClick={() => { checkpoint(); patch((x: any) => ({ ...x, depth: 'back' })); }}
          >
            Behind devices
          </button>
          <button
            className={`py-2 text-[10px] rounded-md border cursor-pointer transition-all ${d.depth === 'front' ? 'border-acc bg-acc/10 text-acc' : 'border-line bg-panel text-mut'}`}
            onClick={() => { checkpoint(); patch((x: any) => ({ ...x, depth: 'front' })); }}
          >
            In front
          </button>
        </div>
      </Section>
    </>
  );
}

function TextBoxProps({ t }: { t: any }) {
  const project = useStudio(s => s.project)!;
  const update = useStudio(s => s.update);
  const checkpoint = useStudio(s => s.checkpoint);
  const removeTextBox = useStudio(s => s.removeTextBox);
  const patch = (fn: (x: any) => any) =>
    update(p => ({ ...p, textboxes: p.textboxes.map(x => x.id === t.id ? fn(x) : x) }), false);

  const fontFamilies = [
    'Space Grotesk', 'IBM Plex Sans', 'Inter', 'Roboto', 'Open Sans', 
    'Montserrat', 'Poppins', 'Raleway', 'Oswald', 'Merriweather',
    'Source Code Pro', 'Fira Code', 'JetBrains Mono'
  ];

  return (
    <>
      <Section title="Text Box" right={
        <button className="icon-btn !w-6 !h-6 hover:!text-danger" onClick={() => removeTextBox(t.id)}>
          <IcTrash size={12} />
        </button>
      }>
        <textarea
          className="input !text-[12px] !min-h-[60px] resize-y"
          value={t.text}
          onChange={(e) => patch((x: any) => ({ ...x, text: e.target.value }))}
          onFocus={() => checkpoint()}
          placeholder="Enter your text..."
        />
      </Section>

      <Section title="Typography">
        <div className="space-y-2">
          <div>
            <div className="label-mono mb-1">Font Family</div>
            <select
              className="input !text-[11px]"
              value={t.fontFamily}
              onChange={(e) => patch((x: any) => ({ ...x, fontFamily: e.target.value }))}
            >
              {fontFamilies.map(f => (
                <option key={f} value={f} style={{ fontFamily: f }}>{f}</option>
              ))}
            </select>
          </div>
          <SliderRow label="Font Size" value={t.fontSize} min={12} max={120} fmt={v => `${v}px`} onStart={checkpoint} onChange={v => patch((x: any) => ({ ...x, fontSize: v }))} />
          <SliderRow label="Font Weight" value={t.fontWeight} min={100} max={900} step={100} fmt={v => `${v}`} onStart={checkpoint} onChange={v => patch((x: any) => ({ ...x, fontWeight: v }))} />
          <div>
            <div className="label-mono mb-1">Alignment</div>
            <div className="grid grid-cols-3 gap-1">
              {(['left', 'center', 'right'] as const).map(align => (
                <button
                  key={align}
                  className={`py-1.5 text-[10px] rounded-md border cursor-pointer transition-all capitalize ${t.align === align ? 'border-acc bg-acc/10 text-acc' : 'border-line bg-panel text-mut'}`}
                  onClick={() => { checkpoint(); patch((x: any) => ({ ...x, align })); }}
                >
                  {align}
                </button>
              ))}
            </div>
          </div>
          <ColorInput value={t.color} onChange={v => patch((x: any) => ({ ...x, color: v }))} label="text color" />
        </div>
      </Section>

      <Section title="Transform">
        <SliderRow label="Width" value={Math.round(t.width * 100)} min={10} max={80} fmt={v => `${v}%`} onStart={checkpoint} onChange={v => patch((x: any) => ({ ...x, width: v / 100 }))} />
        <SliderRow label="Rotation" value={t.rotation} min={-180} max={180} fmt={v => `${v}°`} onStart={checkpoint} onChange={v => patch((x: any) => ({ ...x, rotation: v }))} />
        <SliderRow label="Opacity" value={Math.round(t.opacity * 100)} min={10} max={100} fmt={v => `${v}%`} onStart={checkpoint} onChange={v => patch((x: any) => ({ ...x, opacity: v / 100 }))} />
      </Section>

      <Section title="Background">
        <div>
          <div className="label-mono mb-1">Type</div>
          <div className="grid grid-cols-4 gap-1">
            {(['none', 'solid', 'gradient', 'glass'] as const).map(type => (
              <button
                key={type}
                className={`py-1.5 text-[10px] rounded-md border cursor-pointer transition-all capitalize ${t.bgType === type ? 'border-acc bg-acc/10 text-acc' : 'border-line bg-panel text-mut'}`}
                onClick={() => { checkpoint(); patch((x: any) => ({ ...x, bgType: type })); }}
              >
                {type}
              </button>
            ))}
          </div>
        </div>
        {t.bgType !== 'none' && (
          <>
            <ColorInput value={t.bgColor} onChange={v => patch((x: any) => ({ ...x, bgColor: v }))} label="bg color" />
            <SliderRow label="Padding" value={t.padding} min={0} max={40} fmt={v => `${v}px`} onStart={checkpoint} onChange={v => patch((x: any) => ({ ...x, padding: v }))} />
            <SliderRow label="Border Radius" value={t.borderRadius} min={0} max={30} fmt={v => `${v}px`} onStart={checkpoint} onChange={v => patch((x: any) => ({ ...x, borderRadius: v }))} />
          </>
        )}
      </Section>

      <Section title="Effects">
        <Toggle on={t.shadow} onChange={v => patch((x: any) => ({ ...x, shadow: v }))} label="Shadow" />
        <Toggle on={t.glow} onChange={v => patch((x: any) => ({ ...x, glow: v }))} label="Glow" />
        {t.glow && (
          <ColorInput value={t.glowColor} onChange={v => patch((x: any) => ({ ...x, glowColor: v }))} label="glow color" />
        )}
      </Section>
    </>
  );
}

function CanvasImageProps({ img }: { img: import('../types').CanvasImage }) {
  const project = useStudio(s => s.project)!;
  const updateCanvasImage = useStudio(s => s.updateCanvasImage);
  const removeCanvasImage = useStudio(s => s.removeCanvasImage);
  const duplicateCanvasImage = useStudio(s => s.duplicateCanvasImage);
  const checkpoint = useStudio(s => s.checkpoint);
  const patch = (updates: Partial<import('../types').CanvasImage>) => {
    checkpoint();
    updateCanvasImage(img.id, updates);
  };

  const asset = project.assets.find(a => a.id === img.assetId);

  return (
    <>
      <Section title="Canvas Image" right={
        <div className="flex gap-1">
          <button className="icon-btn !w-6 !h-6" onClick={() => duplicateCanvasImage(img.id)} title="Duplicate">
            <IcCopy size={12} />
          </button>
          <button className="icon-btn !w-6 !h-6 hover:!text-danger" onClick={() => removeCanvasImage(img.id)} title="Delete">
            <IcTrash size={12} />
          </button>
        </div>
      }>
        <div className="text-[11px] mb-2" style={{ color: 'var(--color-dim)', fontFamily: 'var(--font-mono)' }}>
          {asset?.name || 'Image'}
        </div>
      </Section>

      <Section title="Transform">
        <SliderRow label="X" value={Math.round(img.x * project.canvas.w)} min={0} max={project.canvas.w} fmt={v => `${v}px`} onStart={checkpoint} onChange={v => patch({ x: v / project.canvas.w })} />
        <SliderRow label="Y" value={Math.round(img.y * project.canvas.h)} min={0} max={project.canvas.h} fmt={v => `${v}px`} onStart={checkpoint} onChange={v => patch({ y: v / project.canvas.h })} />
        <SliderRow label="Width" value={Math.round(img.width * project.canvas.w)} min={10} max={project.canvas.w} fmt={v => `${v}px`} onStart={checkpoint} onChange={v => patch({ width: v / project.canvas.w })} />
        <SliderRow label="Height" value={Math.round(img.height * project.canvas.h)} min={10} max={project.canvas.h} fmt={v => `${v}px`} onStart={checkpoint} onChange={v => patch({ height: v / project.canvas.h })} />
        <SliderRow label="Rotation" value={img.rotation} min={-180} max={180} fmt={v => `${v}°`} onStart={checkpoint} onChange={v => patch({ rotation: v })} />
        <SliderRow label="Opacity" value={Math.round(img.opacity * 100)} min={0} max={100} fmt={v => `${v}%`} onStart={checkpoint} onChange={v => patch({ opacity: v / 100 })} />
      </Section>

      <Section title="Image Adjustments">
        <SliderRow label="Brightness" value={Math.round(img.brightness * 100)} min={50} max={150} fmt={v => `${v}%`} onStart={checkpoint} onChange={v => patch({ brightness: v / 100 })} />
        <SliderRow label="Contrast" value={Math.round(img.contrast * 100)} min={50} max={150} fmt={v => `${v}%`} onStart={checkpoint} onChange={v => patch({ contrast: v / 100 })} />
        <SliderRow label="Saturation" value={Math.round(img.saturation * 100)} min={0} max={200} fmt={v => `${v}%`} onStart={checkpoint} onChange={v => patch({ saturation: v / 100 })} />
        <SliderRow label="Blur" value={img.blur} min={0} max={20} fmt={v => `${v}px`} onStart={checkpoint} onChange={v => patch({ blur: v })} />
      </Section>

      <Section title="Appearance">
        <SliderRow label="Border Radius" value={img.borderRadius} min={0} max={100} fmt={v => `${v}px`} onStart={checkpoint} onChange={v => patch({ borderRadius: v })} />
        <Toggle on={img.shadow} onChange={v => patch({ shadow: v })} label="Shadow" />
        {img.shadow && (
          <div className="mt-2">
            <div className="label-mono mb-1">Border</div>
            <div className="flex gap-2">
              <ColorInput value={img.borderColor || '#000000'} onChange={v => patch({ borderColor: v })} label="color" />
              <SliderRow label="Width" value={img.borderWidth} min={0} max={10} fmt={v => `${v}px`} onStart={checkpoint} onChange={v => patch({ borderWidth: v })} />
            </div>
          </div>
        )}
      </Section>

      <Section title="Layer">
        <SliderRow label="Z-Index" value={img.zIndex} min={0} max={100} onStart={checkpoint} onChange={v => patch({ zIndex: v })} />
        <Toggle on={img.locked} onChange={v => patch({ locked: v })} label="Locked" />
        <Toggle on={img.hidden} onChange={v => patch({ hidden: v })} label="Hidden" />
      </Section>
    </>
  );
}

function IconProps({ i }: { i: import('../types').IconLayer }) {
  const project = useStudio(s => s.project)!;
  const update = useStudio(s => s.update);
  const checkpoint = useStudio(s => s.checkpoint);
  const removeIcon = useStudio(s => s.removeIcon);
  const patch = (fn: (x: import('../types').IconLayer) => import('../types').IconLayer) =>
    update(p => ({ ...p, icons: p.icons.map(x => x.id === i.id ? fn(x) : x) }), false);

  return (
    <>
      <Section title="Icon" right={
        <button className="icon-btn !w-6 !h-6 hover:!text-danger" onClick={() => removeIcon(i.id)}><IcTrash size={12} /></button>
      }>
        <div className="text-[11px] mb-2" style={{ color: 'var(--color-dim)', fontFamily: 'var(--font-mono)' }}>
          Icon ID: {i.iconId}
        </div>
      </Section>

      <Section title="Transform">
        <SliderRow label="Size" value={Math.round(i.size * 100)} min={2} max={20} fmt={v => `${v}%`} onStart={checkpoint} onChange={v => patch(x => ({ ...x, size: v / 100 }))} />
        <SliderRow label="Rotation" value={i.rotation} min={-180} max={180} fmt={v => `${v}°`} onStart={checkpoint} onChange={v => patch(x => ({ ...x, rotation: v }))} />
        <SliderRow label="Opacity" value={Math.round(i.opacity * 100)} min={10} max={100} fmt={v => `${v}%`} onStart={checkpoint} onChange={v => patch(x => ({ ...x, opacity: v / 100 }))} />
      </Section>

      <Section title="Color">
        <ColorInput value={i.color} onChange={(v) => { checkpoint(); patch(x => ({ ...x, color: v })); }} label="icon" />
      </Section>

      <Section title="Background">
        <div className="grid grid-cols-3 gap-1 mb-2">
          {(['none', 'circle', 'rounded', 'glass', 'gradient', 'badge'] as const).map(bg => (
            <button
              key={bg}
              onClick={() => { checkpoint(); patch(x => ({ ...x, bgStyle: bg })); }}
              className="py-1.5 text-[10px] rounded-md border cursor-pointer transition-all capitalize"
              style={{
                fontFamily: 'var(--font-mono)',
                borderColor: i.bgStyle === bg ? 'var(--color-acc)' : 'var(--color-line)',
                background: i.bgStyle === bg ? 'rgba(255,107,61,0.12)' : 'var(--color-panel)',
                color: i.bgStyle === bg ? 'var(--color-acc)' : 'var(--color-mut)',
              }}
            >
              {bg}
            </button>
          ))}
        </div>
        {i.bgStyle !== 'none' && (
          <ColorInput value={i.bgColor || '#ffffff'} onChange={(v) => { checkpoint(); patch(x => ({ ...x, bgColor: v })); }} label="bg color" />
        )}
      </Section>

      <Section title="Effects">
        <Toggle on={i.shadow} onChange={(v) => { checkpoint(); patch(x => ({ ...x, shadow: v })); }} label="Shadow" />
        <Toggle on={i.glow} onChange={(v) => { checkpoint(); patch(x => ({ ...x, glow: v })); }} label="Glow" />
      </Section>

      <Section title="Material Style">
        <div className="grid grid-cols-3 gap-1">
          {(['matte', 'glossy', 'glass', 'metallic', 'ceramic', 'holographic'] as const).map(mat => (
            <button
              key={mat}
              onClick={() => { 
                checkpoint(); 
                // Apply material-specific styling
                const materialStyles = {
                  matte: { shadow: false, glow: false, bgStyle: 'rounded' as const, bgColor: '#888888' },
                  glossy: { shadow: true, glow: false, bgStyle: 'gradient' as const, bgColor: '#ffffff' },
                  glass: { shadow: false, glow: false, bgStyle: 'glass' as const, bgColor: '#ffffff' },
                  metallic: { shadow: true, glow: false, bgStyle: 'gradient' as const, bgColor: '#c0c0c0' },
                  ceramic: { shadow: true, glow: false, bgStyle: 'rounded' as const, bgColor: '#f5f5f5' },
                  holographic: { shadow: false, glow: true, bgStyle: 'gradient' as const, bgColor: '#ff69b4' },
                };
                patch(x => ({ ...x, ...materialStyles[mat] }));
              }}
              className="py-1.5 text-[10px] rounded-md border cursor-pointer transition-all capitalize"
              style={{
                fontFamily: 'var(--font-mono)',
                borderColor: 'var(--color-line)',
                background: 'var(--color-panel)',
                color: 'var(--color-mut)',
              }}
            >
              {mat}
            </button>
          ))}
        </div>
      </Section>
    </>
  );
}

function LayersList() {
  const project = useStudio(s => s.project)!;
  const selection = useStudio(s => s.selection);
  const setSelection = useStudio(s => s.setSelection);
  const update = useStudio(s => s.update);
  const checkpoint = useStudio(s => s.checkpoint);
  const reorderDevice = useStudio(s => s.reorderDevice);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set(['devices', 'images', 'text', 'icons', 'decos', 'system']));
  const [searchQuery, setSearchQuery] = useState('');

  const toggleGroup = (group: string) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(group)) {
      newExpanded.delete(group);
    } else {
      newExpanded.add(group);
    }
    setExpandedGroups(newExpanded);
  };

  const rowCls = (on: boolean) =>
    `w-full flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer transition-all text-left group ${on ? 'bg-[rgba(255,107,61,0.15)] border-l-2 border-acc' : 'hover:bg-panel2 border-l-2 border-transparent'}`;

  const LayerIcon = ({ type }: { type: string }) => {
    const iconMap: Record<string, JSX.Element> = {
      device: <IcLayers size={12} />,
      image: <IcImage size={12} />,
      textbox: <IcType size={12} />,
      icon: <IcSpark size={12} />,
      deco: <IcSpark size={12} />,
      text: <IcType size={12} />,
      logo: <IcBrand size={12} />,
      background: <IcBg size={12} />,
    };
    return <span className="text-dim">{iconMap[type] || <IcLayers size={12} />}</span>;
  };

  const GroupHeader = ({ group, title, count, icon }: { group: string; title: string; count: number; icon: JSX.Element }) => (
    <div 
      className="flex items-center gap-2 px-2 py-1.5 cursor-pointer hover:bg-panel2 rounded-md transition-colors"
      onClick={() => toggleGroup(group)}
    >
      <span className={`text-dim transition-transform ${expandedGroups.has(group) ? 'rotate-90' : ''}`}>
        <IcArrowR size={10} />
      </span>
      <span className="text-dim">{icon}</span>
      <span className="flex-1 text-[11px] font-semibold uppercase tracking-wider text-mut">{title}</span>
      <span className="text-[10px] text-dim bg-panel3 px-1.5 py-0.5 rounded">{count}</span>
    </div>
  );

  const totalLayers = 
    project.devices.length + 
    (project.canvasImages?.length || 0) + 
    (project.textboxes?.length || 0) + 
    (project.icons?.length || 0) + 
    (project.decos?.length || 0) + 3;

  return (
    <Section 
      title="Layers" 
      right={
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-dim font-mono">{totalLayers}</span>
          <IcLayers size={13} />
        </div>
      }
    >
      {/* Search Filter */}
      {totalLayers > 5 && (
        <div className="mb-2">
          <input
            type="text"
            placeholder="Search layers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input !py-1 !text-[11px]"
          />
        </div>
      )}

      <div className="space-y-1 max-h-[400px] overflow-y-auto">
        {/* Devices Group */}
        {project.devices.length > 0 && (
          <>
            <GroupHeader group="devices" title="Devices" count={project.devices.length} icon={<IcLayers size={12} />} />
            {expandedGroups.has('devices') && (
              <div className="space-y-0.5 ml-2">
                {[...project.devices].reverse().map((d, idx) => {
                  const on = selection?.kind === 'device' && selection.id === d.id;
                  const matchesSearch = !searchQuery || d.name.toLowerCase().includes(searchQuery.toLowerCase());
                  if (!matchesSearch) return null;
                  return (
                    <div key={d.id} className={rowCls(!!on)} onClick={() => setSelection({ kind: 'device', id: d.id })}>
                      <LayerIcon type="device" />
                      <button 
                        className="icon-btn !w-5 !h-5" 
                        onClick={(e) => { e.stopPropagation(); checkpoint(); update(p => ({ ...p, devices: p.devices.map(x => x.id === d.id ? { ...x, visible: !x.visible } : x) }), false); }}
                      >
                        {d.visible ? <IcEye size={11} /> : <IcEyeOff size={11} />}
                      </button>
                      <span className="flex-1 text-[11px] truncate" style={{ opacity: d.visible ? 1 : 0.45 }}>
                        {d.name}
                      </span>
                      <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          className="icon-btn !w-4 !h-4" 
                          onClick={(e) => { e.stopPropagation(); reorderDevice(d.id, 1); }}
                          title="Move up"
                        >
                          <IcArrowL size={9} className="rotate-90" />
                        </button>
                        <button 
                          className="icon-btn !w-4 !h-4" 
                          onClick={(e) => { e.stopPropagation(); reorderDevice(d.id, -1); }}
                          title="Move down"
                        >
                          <IcArrowL size={9} className="-rotate-90" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* Canvas Images Group */}
        {project.canvasImages?.length > 0 && (
          <>
            <GroupHeader group="images" title="Images" count={project.canvasImages.length} icon={<IcImage size={12} />} />
            {expandedGroups.has('images') && (
              <div className="space-y-0.5 ml-2">
                {project.canvasImages.map((img: any) => {
                  const on = selection?.kind === 'image' && selection.id === img.id;
                  const asset = project.assets.find(a => a.id === img.assetId);
                  const matchesSearch = !searchQuery || (asset?.name || 'Image').toLowerCase().includes(searchQuery.toLowerCase());
                  if (!matchesSearch) return null;
                  return (
                    <div key={img.id} className={rowCls(!!on)} onClick={() => setSelection({ kind: 'image', id: img.id })}>
                      <LayerIcon type="image" />
                      <button 
                        className="icon-btn !w-5 !h-5" 
                        onClick={(e) => { e.stopPropagation(); checkpoint(); useStudio.getState().updateCanvasImage(img.id, { hidden: !img.hidden }); }}
                      >
                        {img.hidden ? <IcEyeOff size={11} /> : <IcEye size={11} />}
                      </button>
                      <span className="flex-1 text-[11px] truncate" style={{ opacity: img.hidden ? 0.45 : 1 }}>
                        {asset?.name || 'Image'}
                      </span>
                      {img.locked && <span className="text-[10px]">🔒</span>}
                      <button 
                        className="icon-btn !w-4 !h-4 hover:!text-danger opacity-0 group-hover:opacity-100 transition-opacity" 
                        onClick={(e) => { e.stopPropagation(); useStudio.getState().removeCanvasImage(img.id); }}
                      >
                        <IcTrash size={9} />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* Text Boxes Group */}
        {project.textboxes?.length > 0 && (
          <>
            <GroupHeader group="text" title="Text Boxes" count={project.textboxes.length} icon={<IcType size={12} />} />
            {expandedGroups.has('text') && (
              <div className="space-y-0.5 ml-2">
                {project.textboxes.map((tb: any) => {
                  const on = selection?.kind === 'textbox' && selection.id === tb.id;
                  const matchesSearch = !searchQuery || (tb.name || 'Text Box').toLowerCase().includes(searchQuery.toLowerCase());
                  if (!matchesSearch) return null;
                  return (
                    <div key={tb.id} className={rowCls(!!on)} onClick={() => setSelection({ kind: 'textbox', id: tb.id })}>
                      <LayerIcon type="textbox" />
                      <button 
                        className="icon-btn !w-5 !h-5" 
                        onClick={(e) => { e.stopPropagation(); checkpoint(); update(p => ({ ...p, textboxes: p.textboxes.map(x => x.id === tb.id ? { ...x, opacity: x.opacity === 0 ? 1 : 0 } : x) }), false); }}
                      >
                        {tb.opacity > 0 ? <IcEye size={11} /> : <IcEyeOff size={11} />}
                      </button>
                      <span className="flex-1 text-[11px] truncate">{tb.name || 'Text Box'}</span>
                      <button 
                        className="icon-btn !w-4 !h-4 hover:!text-danger opacity-0 group-hover:opacity-100 transition-opacity" 
                        onClick={(e) => { e.stopPropagation(); checkpoint(); update(p => ({ ...p, textboxes: p.textboxes.filter(x => x.id !== tb.id) }), false); }}
                      >
                        <IcTrash size={9} />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* Icons Group */}
        {project.icons?.length > 0 && (
          <>
            <GroupHeader group="icons" title="Icons" count={project.icons.length} icon={<IcSpark size={12} />} />
            {expandedGroups.has('icons') && (
              <div className="space-y-0.5 ml-2">
                {project.icons.map((icon: any) => {
                  const on = selection?.kind === 'icon' && selection.id === icon.id;
                  return (
                    <div key={icon.id} className={rowCls(!!on)} onClick={() => setSelection({ kind: 'icon', id: icon.id })}>
                      <LayerIcon type="icon" />
                      <button 
                        className="icon-btn !w-5 !h-5" 
                        onClick={(e) => { e.stopPropagation(); checkpoint(); update(p => ({ ...p, icons: p.icons.map(x => x.id === icon.id ? { ...x, opacity: x.opacity === 0 ? 1 : 0 } : x) }), false); }}
                      >
                        {icon.opacity > 0 ? <IcEye size={11} /> : <IcEyeOff size={11} />}
                      </button>
                      <span className="flex-1 text-[11px] truncate">Icon</span>
                      <button 
                        className="icon-btn !w-4 !h-4 hover:!text-danger opacity-0 group-hover:opacity-100 transition-opacity" 
                        onClick={(e) => { e.stopPropagation(); checkpoint(); update(p => ({ ...p, icons: p.icons.filter(x => x.id !== icon.id) }), false); }}
                      >
                        <IcTrash size={9} />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* Decorations Group */}
        {project.decos?.length > 0 && (
          <>
            <GroupHeader group="decos" title="Decorations" count={project.decos.length} icon={<IcSpark size={12} />} />
            {expandedGroups.has('decos') && (
              <div className="space-y-0.5 ml-2">
                {project.decos.map((deco: any) => {
                  const on = selection?.kind === 'deco' && selection.id === deco.id;
                  return (
                    <div key={deco.id} className={rowCls(!!on)} onClick={() => setSelection({ kind: 'deco', id: deco.id })}>
                      <LayerIcon type="deco" />
                      <button 
                        className="icon-btn !w-5 !h-5" 
                        onClick={(e) => { e.stopPropagation(); checkpoint(); update(p => ({ ...p, decos: p.decos.map(x => x.id === deco.id ? { ...x, opacity: x.opacity === 0 ? 1 : 0 } : x) }), false); }}
                      >
                        {deco.opacity > 0 ? <IcEye size={11} /> : <IcEyeOff size={11} />}
                      </button>
                      <span className="flex-1 text-[11px] truncate">Decoration</span>
                      <button 
                        className="icon-btn !w-4 !h-4 hover:!text-danger opacity-0 group-hover:opacity-100 transition-opacity" 
                        onClick={(e) => { e.stopPropagation(); checkpoint(); update(p => ({ ...p, decos: p.decos.filter(x => x.id !== deco.id) }), false); }}
                      >
                        <IcTrash size={9} />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* System Elements Group */}
        <GroupHeader group="system" title="System" count={3} icon={<IcLayers size={12} />} />
        {expandedGroups.has('system') && (
          <div className="space-y-0.5 ml-2">
            {([
              { kind: 'text' as const, label: 'Text Block', on: project.text.enabled, toggle: () => update(p => ({ ...p, text: { ...p.text, enabled: !p.text.enabled } }), false) },
              { kind: 'logo' as const, label: 'Logo', on: project.logo.enabled, toggle: () => update(p => ({ ...p, logo: { ...p.logo, enabled: !p.logo.enabled } }), false) },
              { kind: 'background' as const, label: 'Background', on: true, toggle: () => undefined },
            ]).map(l => {
              const on = selection?.kind === l.kind;
              return (
                <div key={l.kind} className={rowCls(!!on)} onClick={() => setSelection({ kind: l.kind })}>
                  <LayerIcon type={l.kind} />
                  <button className="icon-btn !w-5 !h-5" onClick={(e) => { e.stopPropagation(); checkpoint(); l.toggle(); }}>
                    {l.on ? <IcEye size={11} /> : <IcEyeOff size={11} />}
                  </button>
                  <span className="flex-1 text-[11px]" style={{ opacity: l.on ? 1 : 0.45 }}>{l.label}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      {totalLayers > 0 && (
        <div className="mt-3 pt-3 border-t border-line2 flex gap-1">
          <button 
            className="btn-ghost !text-[10px] !py-1 flex-1"
            onClick={() => setExpandedGroups(new Set(['devices', 'images', 'text', 'icons', 'decos', 'system']))}
          >
            Expand All
          </button>
          <button 
            className="btn-ghost !text-[10px] !py-1 flex-1"
            onClick={() => setExpandedGroups(new Set())}
          >
            Collapse All
          </button>
        </div>
      )}
    </Section>
  );
}

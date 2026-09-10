import { useEffect, useMemo, useRef, useState } from 'react';
import type { DragEvent } from 'react';
import { useStudio, classifyAsset } from '../store';
import { DECO_PRESETS, DEVICE_META, uid } from '../templates';
import { COMPOSITIONS } from '../engine';
import { bgThumb } from '../backgrounds';
import type { BgStyle, BgType, DecoDepth, DeviceKind } from '../types';
import { loadDemoAssets } from '../sampleScreens';
import { Section } from './ui';
import {
  IcBrowser, IcDevice, IcImage, IcLaptop, IcMonitor, IcPhone, IcPlus, IcRefresh, IcSpark,
  IcSpin, IcTablet, IcTrash, IcUpload, IcCopy, IcSearch, IcBg, IcGrid, IcType,
} from '../icons';
import { IMAGE_ASSETS, searchImages } from '../imageAssets';
import { ICONS, searchIcons } from '../iconLibrary';

const DEVICE_ICONS: Record<DeviceKind, (p: { size?: number }) => JSX.Element> = {
  laptop: IcLaptop, phone: IcPhone, tablet: IcTablet, browser: IcBrowser, monitor: IcMonitor,
};

type Tab = 'screens' | 'devices' | 'backdrop' | 'decor' | 'images' | 'icons' | 'textboxes';

export function LeftPanel() {
  const [tab, setTab] = useState<Tab>('screens');
  const tabs: { id: Tab; label: string; icon: (p: { size?: number }) => JSX.Element }[] = [
    { id: 'screens', label: 'Screens', icon: IcImage },
    { id: 'devices', label: 'Layouts', icon: IcDevice },
    { id: 'backdrop', label: 'Backdrop', icon: IcBg },
    { id: 'decor', label: 'Decor', icon: IcSpark },
    { id: 'images', label: 'Images', icon: IcImage },
    { id: 'icons', label: 'Icons', icon: IcSpark },
    { id: 'textboxes', label: 'Text', icon: IcType },
  ];
  return (
    <div className="w-[264px] shrink-0 border-r border-line2 bg-panel flex flex-col">
      <div className="border-b border-line2 px-1.5 pt-2 pb-1">
        <div className="flex gap-0.5 mb-1">
          {tabs.slice(0, 3).map(t => {
            const Icon = t.icon;
            const on = tab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 text-[10.5px] font-medium transition-all duration-150"
                style={{
                  borderRadius: '6px 6px 0 0',
                  color: on ? 'var(--color-fg)' : 'var(--color-dim)',
                  background: on ? 'var(--color-ink)' : 'transparent',
                  boxShadow: on ? 'inset 0 2px 0 var(--color-acc)' : 'none',
                }}
              >
                <Icon size={12} />
                {t.label}
              </button>
            );
          })}
        </div>
        <div className="flex gap-0.5">
          {tabs.slice(3).map(t => {
            const Icon = t.icon;
            const on = tab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 text-[10.5px] font-medium transition-all duration-150"
                style={{
                  borderRadius: '6px 6px 0 0',
                  color: on ? 'var(--color-fg)' : 'var(--color-dim)',
                  background: on ? 'var(--color-ink)' : 'transparent',
                  boxShadow: on ? 'inset 0 2px 0 var(--color-acc)' : 'none',
                }}
              >
                <Icon size={12} />
                {t.label}
              </button>
            );
          })}
        </div>
      </div>
      <div className="flex-1 overflow-y-auto bg-ink">
        {tab === 'screens' && <ScreensTab />}
        {tab === 'devices' && <LayoutsTab />}
        {tab === 'backdrop' && <BackdropTab />}
        {tab === 'decor' && <DecorTab />}
        {tab === 'images' && <ImagesTab />}
        {tab === 'icons' && <IconsTab />}
        {tab === 'textboxes' && <TextboxesTab />}
      </div>
    </div>
  );
}

function TextboxesTab() {
  const project = useStudio(s => s.project)!;
  const addTextBox = useStudio(s => s.addTextBox);
  const removeTextBox = useStudio(s => s.removeTextBox);

  return (
    <>
      <Section title={`Text Boxes · ${project.textboxes.length}`}>
        <button
          className="btn w-full justify-center !text-[11px] mb-2"
          onClick={addTextBox}
        >
          <IcPlus size={12} /> Add Text Box
        </button>
        
        {project.textboxes.length === 0 ? (
          <p className="text-[10px] text-dim text-center py-4">
            No text boxes yet. Click "Add Text Box" to create one.
          </p>
        ) : (
          <div className="space-y-1.5">
            {project.textboxes.map((tb, i) => (
              <div key={tb.id} className="flex items-center gap-2 p-2 rounded-lg border border-line bg-panel">
                <div className="flex-1 min-w-0">
                  <div className="text-[11px] font-medium truncate">{tb.text || 'Empty text box'}</div>
                  <div className="text-[9px] text-dim" style={{ fontFamily: 'var(--font-mono)' }}>
                    {tb.fontFamily} · {tb.fontSize}px
                  </div>
                </div>
                <button
                  className="icon-btn !w-5 !h-5 hover:!text-danger"
                  onClick={() => removeTextBox(tb.id)}
                >
                  <IcTrash size={10} />
                </button>
              </div>
            ))}
          </div>
        )}
      </Section>

      <Section title="Tips">
        <ul className="text-[9px] text-dim space-y-1">
          <li>• Click text box on canvas to select</li>
          <li>• Drag to move anywhere</li>
          <li>• Edit properties in right panel</li>
          <li>• Change font, size, color, background</li>
          <li>• Add shadow or glow effects</li>
        </ul>
      </Section>
    </>
  );
}

function ScreensTab() {
  const project = useStudio(s => s.project)!;
  const addFiles = useStudio(s => s.addFiles);
  const removeAsset = useStudio(s => s.removeAsset);
  const renameAsset = useStudio(s => s.renameAsset);
  const duplicateAsset = useStudio(s => s.duplicateAsset);
  const addAsset = useStudio(s => s.addAsset);
  const responsive = useStudio(s => s.responsive);
  const toast = useStudio(s => s.toast);
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [loadingDemo, setLoadingDemo] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);

  const onDrop = (e: DragEvent) => {
    e.preventDefault();
    setDragging(false);
    void addFiles(e.dataTransfer.files);
  };

  return (
    <>
      <div className="p-3">
        <div
          className="transition-all duration-150 cursor-pointer text-center py-5 px-3"
          style={{
            border: `1.5px dashed ${dragging ? 'var(--color-acc)' : 'var(--color-line)'}`,
            borderRadius: 10,
            background: dragging ? 'rgba(255,107,61,0.06)' : 'var(--color-panel)',
          }}
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
        >
          <IcUpload size={18} />
          <div className="text-[12px] font-medium mt-1.5" style={{ color: dragging ? 'var(--color-acc)' : 'var(--color-fg)' }}>
            {dragging ? 'Drop to add' : 'Drop screenshots'}
          </div>
          <div className="text-[10px] mt-0.5" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-dim)' }}>
            browse · Ctrl+V · drag onto a device
          </div>
          <input
            ref={inputRef} type="file" hidden multiple accept="image/png,image/jpeg,image/webp,image/svg+xml"
            onChange={(e) => { if (e.target.files) void addFiles(e.target.files); e.target.value = ''; }}
          />
        </div>

        <div className="grid grid-cols-2 gap-1.5 mt-2">
          <button
            className="btn btn-ghost justify-center !text-[11px] !py-1.5"
            disabled={loadingDemo}
            onClick={async () => {
              setLoadingDemo(true);
              try {
                const assets = await loadDemoAssets();
                for (const a of assets) addAsset(a);
                toast('Sample screens inserted');
              } catch { toast('Could not load samples', 'err'); }
              setLoadingDemo(false);
            }}
          >
            {loadingDemo ? <IcSpin size={12} /> : <IcPlus size={12} />}
            Samples
          </button>
          <button className="btn btn-ghost justify-center !text-[11px] !py-1.5" onClick={responsive}>
            <IcRefresh size={12} />
            Responsive
          </button>
        </div>
      </div>

      <Section title={`Screenshots · ${project.assets.length}`}>
        {project.assets.length === 0 && (
          <p className="text-[11px] leading-relaxed" style={{ color: 'var(--color-dim)' }}>
            No screenshots yet. Drag one onto any device, or they auto-attach as you add devices.
          </p>
        )}
        <div className="space-y-1.5">
          {project.assets.map((a, i) => {
            const used = project.devices.some(d => d.assetId === a.id) || project.logo.assetId === a.id;
            const kind = classifyAsset(a);
            return (
              <div
                key={a.id}
                draggable
                onDragStart={(e) => { e.dataTransfer.setData('text/asset-id', a.id); e.dataTransfer.effectAllowed = 'copy'; }}
                className="group flex items-center gap-2 p-1.5 rounded-lg border border-transparent hover:border-line transition-colors cursor-grab active:cursor-grabbing"
                title="Drag onto a device screen"
              >
                <img src={a.dataUrl} alt={a.name} className="w-[46px] h-8 object-cover rounded-md border border-line2" draggable={false} />
                <div className="flex-1 min-w-0">
                  {editing === a.id ? (
                    <input
                      autoFocus className="input !py-0.5 !text-[11px]" defaultValue={a.name}
                      onBlur={(e) => { renameAsset(a.id, e.target.value); setEditing(null); }}
                      onKeyDown={(e) => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur(); }}
                    />
                  ) : (
                    <button className="text-[11.5px] font-medium truncate block text-left hover:text-acc transition-colors" onDoubleClick={() => setEditing(a.id)} title="Double-click to rename">
                      {a.name}
                    </button>
                  )}
                  <div className="text-[9.5px] flex items-center gap-1" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-dim)' }}>
                    <span style={{ color: kind === 'desktop' ? 'var(--color-acc2)' : kind === 'tablet' ? 'var(--color-gold)' : 'var(--color-acc)' }}>{kind}</span>
                    {used && <span style={{ color: 'var(--color-acc2)' }}>· in use</span>}
                  </div>
                </div>
                <div className="flex flex-col gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="icon-btn !w-5 !h-5" onClick={() => duplicateAsset(a.id)} title="Duplicate"><IcCopy size={10} /></button>
                  <button className="icon-btn !w-5 !h-5" onClick={() => removeAsset(a.id)} title="Remove"><IcTrash size={10} /></button>
                </div>
                <span className="text-[9.5px] pr-0.5" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-dim)' }}>{String(i + 1).padStart(2, '0')}</span>
              </div>
            );
          })}
        </div>
      </Section>
    </>
  );
}

const CATS = ['all', 'single', 'duo', 'trio', 'quad', 'multi', 'special'] as const;
function LayoutsTab() {
  const addDevice = useStudio(s => s.addDevice);
  const applyComposition = useStudio(s => s.applyComposition);
  const [cat, setCat] = useState<(typeof CATS)[number]>('all');
  const [q, setQ] = useState('');

  const list = useMemo(() => COMPOSITIONS.filter(c =>
    (cat === 'all' || c.cat === cat) &&
    (!q || (c.label + ' ' + c.tags.join(' ')).toLowerCase().includes(q.toLowerCase()))
  ), [cat, q]);

  return (
    <>
      <Section title="Add device">
        <div className="grid grid-cols-5 gap-1">
          {(Object.keys(DEVICE_META) as DeviceKind[]).map(kind => {
            const Icon = DEVICE_ICONS[kind];
            return (
              <button
                key={kind}
                onClick={() => addDevice(kind)}
                title={DEVICE_META[kind].label}
                className="flex items-center justify-center py-2 rounded-lg border border-line bg-panel hover:border-acc/50 hover:text-acc text-mut transition-all duration-150 cursor-pointer"
              >
                <Icon size={16} />
              </button>
            );
          })}
        </div>
      </Section>

      <Section title={`Composition library · ${COMPOSITIONS.length}`}>
        <div className="relative mb-2">
          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-dim"><IcSearch size={12} /></span>
          <input className="input !pl-7 !py-1.5 !text-[11.5px]" placeholder="Search layouts…" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <div className="flex flex-wrap gap-1 mb-2.5">
          {CATS.map(c => (
            <button key={c} onClick={() => setCat(c)} className={`chip capitalize !text-[10px] ${cat === c ? 'on' : ''}`}>{c}</button>
          ))}
        </div>
        <div className="space-y-1.5">
          {list.map(c => (
            <button
              key={c.id}
              onClick={() => applyComposition(c.id)}
              className="w-full flex items-center gap-2.5 p-1.5 rounded-lg border border-line bg-panel hover:border-[#4a4f5c] hover:bg-panel2 transition-all duration-150 cursor-pointer text-left group"
            >
              <CompositionGlyph slots={c.slots} />
              <div className="flex-1 min-w-0">
                <div className="text-[11.5px] font-medium group-hover:text-acc transition-colors truncate">{c.label}</div>
                <div className="text-[9px] truncate" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-dim)' }}>
                  {c.slots.length} device{c.slots.length > 1 ? 's' : ''} · {c.tags.slice(0, 3).join(' · ')}
                </div>
              </div>
            </button>
          ))}
          {list.length === 0 && <p className="text-[11px]" style={{ color: 'var(--color-dim)' }}>No matches for "{q}".</p>}
        </div>
      </Section>
    </>
  );
}

function CompositionGlyph({ slots }: { slots: { k: DeviceKind; x: number; y: number; w: number }[] }) {
  return (
    <svg width="44" height="30" viewBox="0 0 100 62" className="shrink-0 rounded-md" style={{ background: 'var(--color-ink)' }}>
      {slots.map((s, i) => {
        const aspect = DEVICE_META[s.k].aspect;
        const w = s.w * 100, h = w / aspect;
        return <rect key={i} x={s.x * 100} y={s.y * 62} width={w} height={Math.min(h, 62 - s.y * 62)} rx="2" fill="none" stroke="var(--color-mut)" strokeWidth="2" />;
      })}
    </svg>
  );
}

const BG_STYLES: { id: BgStyle; label: string }[] = [
  { id: 'studio', label: 'Studio' }, { id: 'abstract', label: 'Abstract 3D' }, { id: 'architectural', label: 'Architectural' },
  { id: 'grid', label: 'Grid' }, { id: 'editorial', label: 'Editorial' }, { id: 'tech', label: 'Tech' },
  { id: 'glass', label: 'Glass' }, { id: 'plain', label: 'Clean' },
];
function BackdropTab() {
  const project = useStudio(s => s.project)!;
  const update = useStudio(s => s.update);
  const checkpoint = useStudio(s => s.checkpoint);

  const presets = useMemo(() => {
    const out: { id: string; name: string; style: BgStyle; type: BgType; seed: number }[] = [];
    for (const st of BG_STYLES) {
      for (let i = 0; i < 3; i++) {
        out.push({
          id: `${st.id}-${i}`, name: `${st.label} ${i + 1}`, style: st.id,
          type: i === 0 ? 'solid' : i === 1 ? 'linear' : 'radial',
          seed: i * 97 + st.id.length * 31 + 13,
        });
      }
    }
    return out;
  }, []);

  const apply = (style: BgStyle, type: BgType, seed: number) => {
    update(p => ({ ...p, background: { ...p.background, style, type, seed, kind: 'procedural' } }), true);
  };

  const setBackgroundKind = (kind: 'procedural' | 'image' | 'hybrid' | 'auto') => {
    checkpoint();
    update(p => ({ ...p, background: { ...p.background, kind } }));
  };

  return (
    <>
      <Section title="Background Type">
        <div className="grid grid-cols-4 gap-1 mb-2.5">
          {(['procedural', 'image', 'hybrid', 'auto'] as const).map(k => (
            <button
              key={k}
              onClick={() => setBackgroundKind(k)}
              className="py-1.5 text-[10px] rounded-md border cursor-pointer transition-all capitalize"
              style={{
                fontFamily: 'var(--font-mono)',
                borderColor: (project.background.kind || 'procedural') === k ? 'var(--color-acc)' : 'var(--color-line)',
                background: (project.background.kind || 'procedural') === k ? 'rgba(255,107,61,0.12)' : 'var(--color-panel)',
                color: (project.background.kind || 'procedural') === k ? 'var(--color-acc)' : 'var(--color-mut)',
              }}
            >
              {k}
            </button>
          ))}
        </div>
        <p className="text-[9px] leading-relaxed" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-dim)' }}>
          auto = engine decides based on mood
        </p>
      </Section>

      <Section title={`Procedural Backgrounds · ${presets.length}`}>
        <p className="text-[10px] mb-2.5 leading-relaxed" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-dim)' }}>
          tap to apply · tune colors in the right panel
        </p>
        <div className="grid grid-cols-3 gap-1.5">
          {presets.map(bp => {
            const bg = { ...project.background, style: bp.style, type: bp.type, seed: bp.seed };
            const active = project.background.style === bp.style && project.background.type === bp.type;
            return (
              <button key={bp.id} onClick={() => apply(bp.style, bp.type, bp.seed)} className="group cursor-pointer text-left" title={bp.name}>
                <div style={{ borderRadius: 8, overflow: 'hidden', border: active ? '1.5px solid var(--color-acc)' : '1px solid var(--color-line)' }}>
                  <BgThumbView bg={bg} accents={project.accents} />
                </div>
                <div className="text-[9px] mt-1 truncate" style={{ fontFamily: 'var(--font-mono)', color: active ? 'var(--color-acc)' : 'var(--color-dim)' }}>{bp.name}</div>
              </button>
            );
          })}
        </div>
      </Section>
    </>
  );
}

function BgThumbView({ bg, accents }: { bg: import('../types').Background; accents: { a1: string; a2: string } }) {
  const [src, setSrc] = useState('');
  useEffect(() => {
    bgThumb(bg, accents, 150).then(setSrc);
  }, [bg, accents]);
  if (!src) return <div className="w-full aspect-[3/2] rounded-lg border border-line bg-panel" />;
  return <img src={src} alt="" className="w-full aspect-[3/2] object-cover rounded-lg border border-line group-hover:border-[#4a4f5c] transition-colors" draggable={false} />;
}

function DecorTab() {
  const project = useStudio(s => s.project)!;
  const update = useStudio(s => s.update);
  const checkpoint = useStudio(s => s.checkpoint);
  const [role, setRole] = useState<string>('all');

  const list = DECO_PRESETS.filter(d => role === 'all' || d.role === role);
  const add = (presetId: string) => {
    checkpoint();
    update(p => ({
      ...p,
      decos: [...p.decos, {
        id: uid(), preset: presetId,
        x: 0.1 + Math.random() * 0.8, y: 0.1 + Math.random() * 0.8,
        scale: 0.07, rotation: Math.floor(Math.random() * 40 - 20),
        opacity: 0.7, blur: 0, depth: (Math.random() > 0.5 ? 'front' : 'back') as DecoDepth,
        hue: null, seed: Math.floor(Math.random() * 1e9),
      }],
    }), false);
  };
  const clear = () => { checkpoint(); update(p => ({ ...p, decos: [] }), false); };

  return (
    <>
      <Section title={`Decorations · ${DECO_PRESETS.length}`}>
        <div className="flex flex-wrap gap-1 mb-2.5">
          {(['all', 'frame', 'depth', 'structure', 'texture', 'motion', 'tech', 'luxury', 'soft'] as const).map(r => (
            <button key={r} onClick={() => setRole(r)} className={`chip capitalize !text-[10px] ${role === r ? 'on' : ''}`}>{r}</button>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-1.5 max-h-[400px] overflow-y-auto">
          {list.map(d => (
            <button key={d.id} onClick={() => add(d.id)} className="p-2 rounded-lg border border-line bg-panel hover:border-acc/50 hover:bg-panel2 transition-all text-left group">
              <div className="text-[11px] font-medium group-hover:text-acc transition-colors">{d.label}</div>
              <div className="text-[9px]" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-dim)' }}>{d.role}</div>
            </button>
          ))}
        </div>
      </Section>
      <Section title={`On canvas · ${project.decos.length}`}>
        <button className="btn btn-ghost w-full justify-center !text-[11px]" onClick={clear} disabled={!project.decos.length}>
          <IcTrash size={12} /> Clear all decorations
        </button>
      </Section>
    </>
  );
}

function ImagesTab() {
  const project = useStudio(s => s.project)!;
  const update = useStudio(s => s.update);
  const checkpoint = useStudio(s => s.checkpoint);
  const [cat, setCat] = useState<string>('all');
  const [q, setQ] = useState('');
  const [customImages, setCustomImages] = useState<any[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const list = useMemo(() => {
    let imgs = [...IMAGE_ASSETS, ...customImages];
    if (cat !== 'all') {
      imgs = imgs.filter((i) => i.category === cat);
    }
    if (q) {
      imgs = searchImages(q, cat as any);
    }
    return imgs;
  }, [cat, q, customImages]);

  const applyImage = (imageId: string) => {
    checkpoint();
    const img = list.find((i: any) => i.id === imageId);
    // When applying image background, clear existing decorations and icons to avoid duplicates
    update(p => ({
      ...p,
      decos: [], // Clear decorations
      icons: [], // Clear icons
      background: {
        ...p.background,
        kind: 'image',
        style: 'plain', // Reset to plain style for image backgrounds
        image: {
          kind: 'image',
          imageId,
          customSrc: img?.customSrc || null,
          fit: 'cover',
          x: 0,
          y: 0,
          scale: 1,
          rotation: 0,
          opacity: 1,
          brightness: 1,
          contrast: 1,
          saturation: 1,
          blur: 0,
          hue: 0,
          colorFilter: 'original',
          tint: null,
          tintOpacity: 0,
          overlay: 'none',
          overlayColor: '#000000',
          overlayOpacity: 0,
          blend: 'source-over',
          mask: 'none',
        },
      },
    }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        const newImage = {
          id: `custom-${Date.now()}-${Math.random()}`,
          name: file.name.replace(/\.[^/.]+$/, ''),
          category: 'custom' as const,
          tags: ['custom', 'uploaded'],
          src: dataUrl,
          customSrc: dataUrl,
          width: 2048,
          height: 2048,
          dark: false,
          busy: false,
          mood: ['custom'],
        };
        setCustomImages(prev => [...prev, newImage]);
      };
      reader.readAsDataURL(file);
    });

    e.target.value = '';
  };

  return (
    <>
      <Section title={`Image Backgrounds · ${list.length}`}>
        <button
          className="btn btn-ghost w-full justify-center !text-[11px] mb-2"
          onClick={() => fileInputRef.current?.click()}
        >
          <IcUpload size={12} /> Upload Custom Image
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleImageUpload}
          style={{ display: 'none' }}
        />

        <div className="relative mb-2">
          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-dim"><IcSearch size={12} /></span>
          <input className="input !pl-7 !py-1.5 !text-[11.5px]" placeholder="Search images…" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <div className="flex flex-wrap gap-1 mb-2.5">
          {['all', 'abstract', '3d', 'studio', 'architectural', 'glass', 'paper', 'tech', 'editorial', 'custom'].map(c => (
            <button key={c} onClick={() => setCat(c)} className={`chip capitalize !text-[10px] ${cat === c ? 'on' : ''}`}>{c}</button>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-1.5">
          {list.map((img: any) => (
            <button key={img.id} onClick={() => applyImage(img.id)} className="group relative overflow-hidden rounded-lg border border-line hover:border-acc/50 transition-all">
              <img src={img.src} alt={img.name} className="w-full aspect-square object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
                <div className="text-left">
                  <div className="text-[10px] font-medium text-white">{img.name}</div>
                  <div className="text-[8px] text-white/70">{img.category}</div>
                </div>
              </div>
            </button>
          ))}
        </div>
        {list.length === 0 && (
          <p className="text-[11px] text-center py-4" style={{ color: 'var(--color-dim)' }}>No images found</p>
        )}
      </Section>
    </>
  );
}

function IconsTab() {
  const project = useStudio(s => s.project)!;
  const update = useStudio(s => s.update);
  const checkpoint = useStudio(s => s.checkpoint);
  const addTechStackIcons = useStudio(s => s.addTechStackIcons);
  const autoClusterIcons = useStudio(s => s.autoClusterIcons);
  const [cat, setCat] = useState<string>('all');
  const [q, setQ] = useState('');
  const [customIcons, setCustomIcons] = useState<any[]>([]);
  const [showTechStack, setShowTechStack] = useState(false);
  const [placementMode, setPlacementMode] = useState<'random' | 'around-device' | 'orbit'>('random');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const list = useMemo(() => {
    let icons = [...ICONS, ...customIcons];
    if (cat !== 'all') {
      icons = icons.filter((i) => i.category === cat);
    }
    if (q) {
      icons = searchIcons(q, cat);
    }
    return icons;
  }, [cat, q, customIcons]);

  const addIcon = (iconId: string) => {
    checkpoint();
    const icon = list.find((i: any) => i.id === iconId);
    
    // Calculate position based on placement mode
    let x = 0.5, y = 0.5;
    if (placementMode === 'around-device' && project.devices.length > 0) {
      const device = project.devices[0];
      const angle = Math.random() * Math.PI * 2;
      const distance = 0.25 + Math.random() * 0.15;
      x = (device.x + device.w / 2) / project.canvas.w + Math.cos(angle) * distance;
      y = (device.y + device.w / DEVICE_META[device.kind].aspect / 2) / project.canvas.h + Math.sin(angle) * distance;
    } else if (placementMode === 'orbit' && project.devices.length > 0) {
      const device = project.devices[0];
      const iconIndex = project.icons.length;
      const totalIcons = iconIndex + 1;
      const angle = (iconIndex / totalIcons) * Math.PI * 2;
      const distance = 0.3;
      x = (device.x + device.w / 2) / project.canvas.w + Math.cos(angle) * distance;
      y = (device.y + device.w / DEVICE_META[device.kind].aspect / 2) / project.canvas.h + Math.sin(angle) * distance;
    } else {
      // Random placement
      x = 0.2 + Math.random() * 0.6;
      y = 0.2 + Math.random() * 0.6;
    }
    
    update(p => ({
      ...p,
      icons: [...p.icons, {
        id: uid(),
        iconId,
        iconPath: icon?.d || icon?.pathData || '',
        x,
        y,
        size: 0.08,
        color: '#ffffff',
        opacity: 1,
        rotation: 0,
        bgStyle: 'none',
        bgColor: null,
        shadow: false,
        glow: false,
      }],
    }));
  };

  const handleSvgUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const svgText = event.target?.result as string;
        const parser = new DOMParser();
        const svgDoc = parser.parseFromString(svgText, 'image/svg+xml');
        const svgElement = svgDoc.querySelector('svg');
        
        if (svgElement) {
          const pathElement = svgElement.querySelector('path');
          const pathData = pathElement?.getAttribute('d') || '';
          
          if (pathData) {
            const newIcon = {
              id: `custom-icon-${Date.now()}-${Math.random()}`,
              name: file.name.replace(/\.[^/.]+$/, ''),
              category: 'custom',
              tags: ['custom', 'uploaded'],
              d: pathData,
              pathData: pathData,
              style: 'outline',
            };
            setCustomIcons(prev => [...prev, newIcon]);
          }
        }
      };
      reader.readAsText(file);
    });

    e.target.value = '';
  };

  return (
    <>
      <Section title={`Icon Library · ${list.length}`}>
        <button
          className="btn btn-ghost w-full justify-center !text-[11px] mb-2"
          onClick={() => fileInputRef.current?.click()}
        >
          <IcUpload size={12} /> Upload Custom SVG Icon
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".svg"
          multiple
          onChange={handleSvgUpload}
          style={{ display: 'none' }}
        />

        {/* Tech Stack Visualizer */}
        <button
          className="btn w-full justify-center !text-[11px] mb-2"
          onClick={() => setShowTechStack(!showTechStack)}
        >
          <IcSpark size={12} /> Tech Stack Visualizer
        </button>
        
        {showTechStack && (
          <div className="mb-2 p-2 rounded-lg border border-line bg-panel">
            <div className="text-[10px] text-dim mb-1">Select tech stack:</div>
            <div className="flex flex-wrap gap-1">
              {['React', 'Node.js', 'MongoDB', 'TypeScript', 'Tailwind', 'Next.js', 'Vue', 'Angular', 'Firebase', 'Supabase'].map(tech => (
                <button
                  key={tech}
                  className="chip !text-[9px]"
                  onClick={() => {
                    addTechStackIcons([tech]);
                    setShowTechStack(false);
                  }}
                >
                  {tech}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Auto-Cluster Icons */}
        {project.icons.length >= 3 && (
          <button
            className="btn btn-ghost w-full justify-center !text-[11px] mb-2"
            onClick={() => {
              checkpoint();
              autoClusterIcons();
            }}
          >
            <IcGrid size={12} /> Auto-Cluster Icons
          </button>
        )}

        {/* Placement Mode */}
        <div className="mb-2">
          <div className="label-mono mb-1">Placement Mode</div>
          <div className="flex gap-1">
            {(['random', 'around-device', 'orbit'] as const).map(mode => (
              <button
                key={mode}
                className={`chip flex-1 justify-center !text-[9px] ${placementMode === mode ? 'on' : ''}`}
                onClick={() => setPlacementMode(mode)}
              >
                {mode === 'random' ? 'Random' : mode === 'around-device' ? 'Around' : 'Orbit'}
              </button>
            ))}
          </div>
        </div>

        <div className="relative mb-2">
          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-dim"><IcSearch size={12} /></span>
          <input className="input !pl-7 !py-1.5 !text-[11.5px]" placeholder="Search icons…" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <div className="flex flex-wrap gap-1 mb-2.5">
          {['all', 'web', 'dev', 'mobile', 'ai', 'cloud', 'design', 'ecom', 'business', 'ui', 'misc', 'custom'].map(c => (
            <button key={c} onClick={() => setCat(c)} className={`chip capitalize !text-[10px] ${cat === c ? 'on' : ''}`}>{c}</button>
          ))}
        </div>
        <div className="grid grid-cols-4 gap-1.5">
          {list.map((icon: any) => (
            <button key={icon.id} onClick={() => addIcon(icon.id)} className="group p-2 rounded-lg border border-line hover:border-acc/50 hover:bg-panel2 transition-all flex flex-col items-center gap-1">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className="text-mut group-hover:text-acc transition-colors">
                <path d={icon.d || icon.pathData} />
              </svg>
              <div className="text-[8px] text-center truncate w-full" style={{ color: 'var(--color-dim)' }}>{icon.name}</div>
            </button>
          ))}
        </div>
        {list.length === 0 && (
          <p className="text-[11px] text-center py-4" style={{ color: 'var(--color-dim)' }}>No icons found</p>
        )}
      </Section>
      <Section title={`On canvas · ${project.icons.length}`}>
        <button className="btn btn-ghost w-full justify-center !text-[11px]" onClick={() => { checkpoint(); update(p => ({ ...p, icons: [] }), false); }} disabled={!project.icons.length}>
          <IcTrash size={12} /> Clear all icons
        </button>
      </Section>
    </>
  );
}

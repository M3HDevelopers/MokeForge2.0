import { useMemo, useState } from 'react';
import { useStudio } from '../store';
import type { DeviceKind, Project } from '../types';
import {
  applyLayoutPositions, CANVAS_PRESETS, DEVICE_META, DECO_PRESETS, makeDefaultProject, PROJECT_TYPES,
} from '../templates';
import { COMPOSITIONS } from '../engine';
import { makeThumbnail } from '../renderer';
import { loadDemoAssets } from '../sampleScreens';
import { DeviceFrame } from './DeviceFrame';
import {
  IcArrowR, IcCopy, IcFolder, IcPlus, IcSpin, IcStar, IcTrash, IcWand, LogoMark,
} from '../icons';

function timeAgo(ts: number): string {
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 60) return 'just now';
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

export function Dashboard() {
  const projects = useStudio(s => s.projects);
  const totalExports = useStudio(s => s.totalExports);
  const openProject = useStudio(s => s.openProject);
  const deleteProject = useStudio(s => s.deleteProject);
  const duplicateProject = useStudio(s => s.duplicateProject);
  const createProject = useStudio(s => s.createProject);
  const importProject = useStudio(s => s.importProject);
  const favorites = useStudio(s => s.favorites);
  const unfavorite = useStudio(s => s.unfavorite);
  const toast = useStudio(s => s.toast);
  const [modal, setModal] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);

  const stats = useMemo(() => ({
    projects: projects.length,
    exports: totalExports,
    screens: projects.reduce((n, p) => n + p.assets.length, 0),
    devices: projects.reduce((n, p) => n + p.devices.length, 0),
  }), [projects, totalExports]);

  const loadDemo = async () => {
    setDemoLoading(true);
    try {
      const assets = await loadDemoAssets();
      let p = makeDefaultProject('Aurora Analytics', 'Dashboard', 1600, 1000);
      p = { ...p, assets };
      p = applyLayoutPositions(p, 'responsive');
      p = {
        ...p,
        devices: p.devices.map((d, i) => ({ ...d, assetId: assets[i === 2 ? 1 : 0]?.id ?? null })),
        text: { ...p.text, enabled: true, title: 'Aurora Analytics', subtitle: 'MERN stack analytics platform', showBadges: true, badges: ['React', 'Node.js', 'MongoDB', 'Tailwind'] },
        decoration: { ...p.decoration, set: 'orbs', seed: 42 },
        accents: { a1: '#ff6b3d', a2: '#45d6c8' },
      };
      try { p.thumbnail = await makeThumbnail(p); } catch { /* ok */ }
      importProject(p);
      const created = useStudio.getState().projects[0];
      openProject(created.id);
      toast('Demo project ready — press "Surprise me" for variations');
    } catch {
      toast('Could not build the demo project', 'err');
    }
    setDemoLoading(false);
  };

  return (
    <div className="h-full overflow-y-auto noise-overlay">
      <header className="sticky top-0 z-20 flex items-center justify-between px-8 h-14 border-b border-line2 bg-ink/90" style={{ backdropFilter: 'blur(8px)' }}>
        <div className="flex items-center gap-2.5">
          <LogoMark size={24} />
          <span className="text-[17px] font-bold tracking-tight" style={{ fontFamily: 'var(--font-disp)' }}>MockForge</span>
          <span className="label-mono mt-0.5">mockup studio</span>
        </div>
        <button className="btn btn-acc" onClick={() => setModal(true)}>
          <IcPlus size={14} /> New project
        </button>
      </header>

      <main className="max-w-[1180px] mx-auto px-8 pb-20 relative z-10">
        <section className="pt-12 pb-10 anim-fade-up">
          <div className="label-mono mb-3" style={{ color: 'var(--color-acc)' }}>local-first · no ai runtime · canvas-true exports</div>
          <div className="flex flex-wrap items-end justify-between gap-6">
            <h1 className="text-[44px] leading-[1.04] font-bold tracking-tight max-w-[620px]" style={{ fontFamily: 'var(--font-disp)' }}>
              Screenshots in.<br />
              <span style={{ color: 'var(--color-acc)' }}>Portfolio pieces</span> out.
            </h1>
            <div className="flex gap-2.5 pb-2">
              <button className="btn !py-2.5 !px-5" onClick={() => void loadDemo()} disabled={demoLoading}>
                {demoLoading ? <IcSpin size={15} /> : <IcArrowR size={15} />}
                {demoLoading ? 'Building demo…' : 'Open demo project'}
              </button>
              <button className="btn btn-acc !py-2.5 !px-5" onClick={() => setModal(true)}>
                <IcPlus size={15} /> Start fresh
              </button>
            </div>
          </div>

          <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-px rounded-xl overflow-hidden border border-line2 bg-line2">
            {([
              ['Projects', stats.projects],
              ['Exports', stats.exports],
              ['Screens stored', stats.screens],
              ['Devices placed', stats.devices],
            ] as const).map(([label, n], i) => (
              <div key={label} className="bg-panel px-5 py-4 stagger-item" style={{ animation: `fadeUp .45s ${0.08 + i * 0.05}s cubic-bezier(.2,.7,.3,1) both` }}>
                <div className="text-[26px] font-bold leading-none" style={{ fontFamily: 'var(--font-disp)' }}>{n}</div>
                <div className="label-mono mt-1.5">{label}</div>
              </div>
            ))}
          </div>

          <div className="mt-4 card card-hover px-5 py-4 flex flex-wrap items-center gap-x-8 gap-y-3" style={{ animation: 'fadeUp .5s .3s cubic-bezier(.2,.7,.3,1) both' }}>
            <div className="flex items-center gap-2.5">
              <span className="text-acc"><IcWand size={18} /></span>
              <div>
                <div className="text-[13.5px] font-semibold" style={{ fontFamily: 'var(--font-disp)' }}>Procedural Design Engine</div>
                <div className="text-[10px]" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-dim)' }}>unlimited combinations · scored · constraint-aware</div>
              </div>
            </div>
            {([
              [`${COMPOSITIONS.length}+`, 'compositions'],
              ['8', 'backdrop styles'],
              [`${DECO_PRESETS.length}`, 'decor presets'],
              ['13', 'design moods'],
            ] as const).map(([n, l]) => (
              <div key={l} className="flex items-baseline gap-2">
                <span className="text-[17px] font-bold" style={{ fontFamily: 'var(--font-disp)', color: 'var(--color-acc2)' }}>{n}</span>
                <span className="label-mono">{l}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-12">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[19px] font-semibold" style={{ fontFamily: 'var(--font-disp)' }}>
              {projects.length ? 'Your projects' : 'No projects yet'}
            </h2>
            <span className="label-mono">{projects.length} saved in this browser</span>
          </div>

          {projects.length === 0 ? (
            <div className="card border-dashed !border-line px-8 py-14 text-center anim-fade-up" style={{ animationDelay: '.15s' }}>
              <div className="mx-auto w-fit mb-4 text-dim"><IcFolder size={34} /></div>
              <p className="text-[14px] text-mut max-w-[420px] mx-auto leading-relaxed">
                Everything you make lives in your browser — private and offline-ready.
                Start from a template below, or load the demo to see the full workflow.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 stagger">
              {projects.map(p => (
                <ProjectCard key={p.id} p={p} onOpen={() => openProject(p.id)} onDelete={() => deleteProject(p.id)} onDuplicate={() => duplicateProject(p.id)} />
              ))}
            </div>
          )}
        </section>

        {favorites.length > 0 && (
          <section className="mb-12">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[19px] font-semibold flex items-center gap-2" style={{ fontFamily: 'var(--font-disp)' }}>
                <span className="text-gold"><IcStar size={17} /></span> Favorite designs
              </h2>
              <span className="label-mono">{favorites.length} saved</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 stagger">
              {favorites.slice(0, 10).map(f => (
                <div key={f.id} className="group relative rounded-lg overflow-hidden border border-line hover:border-[#4a4f5c] transition-colors">
                  <img src={f.thumb} alt={f.label} className="w-full aspect-[8/5] object-cover" />
                  <div className="absolute inset-x-0 bottom-0 px-2 py-1.5 flex items-center justify-between" style={{ background: 'linear-gradient(transparent, rgba(8,9,11,0.85))' }}>
                    <span className="text-[10px] truncate" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-mut)' }}>{f.label}</span>
                    <button className="icon-btn !w-5 !h-5 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => unfavorite(f.id)}>
                      <IcTrash size={10} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        <section>
          <h2 className="text-[19px] font-semibold mb-1" style={{ fontFamily: 'var(--font-disp)' }}>Start from a device</h2>
          <p className="text-[12px] mb-4" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-dim)' }}>
            one click → a 1600×1000 canvas with the device centered
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 stagger">
            {(Object.keys(DEVICE_META) as DeviceKind[]).map(kind => (
              <QuickCard key={kind} kind={kind} onClick={() => createProject('', kind === 'phone' ? 'Mobile App' : 'Website', 1600, 1000, kind)} />
            ))}
          </div>
        </section>

        <footer className="mt-16 pt-6 border-t border-line2 flex items-center justify-between">
          <span className="label-mono">mockforge · template engine v1 · deterministic renders</span>
          <span className="label-mono">projects never leave this browser</span>
        </footer>
      </main>

      {modal && <NewProjectModal onClose={() => setModal(false)} />}
    </div>
  );
}

function ProjectCard({ p, onOpen, onDelete, onDuplicate }: { p: Project; onOpen: () => void; onDelete: () => void; onDuplicate: () => void }) {
  return (
    <div className="card card-hover overflow-hidden cursor-pointer group" onClick={onOpen}>
      <div className="relative aspect-[3/2] checker overflow-hidden">
        {p.thumbnail
          ? <img src={p.thumbnail} alt={p.name} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]" />
          : (
            <div className="w-full h-full flex items-center justify-center text-dim">
              <IcFolder size={26} />
            </div>
          )}
        <div className="absolute inset-0 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200" style={{ background: 'rgba(10,11,13,0.55)' }}>
          <button className="btn !py-1.5 !px-3 text-[12px]" onClick={(e) => { e.stopPropagation(); onOpen(); }}>Open</button>
          <button className="icon-btn bg-panel2 border border-line" title="Duplicate" onClick={(e) => { e.stopPropagation(); onDuplicate(); }}><IcCopy size={14} /></button>
          <button className="icon-btn bg-panel2 border border-line hover:!text-danger" title="Delete" onClick={(e) => { e.stopPropagation(); onDelete(); }}><IcTrash size={14} /></button>
        </div>
      </div>
      <div className="px-4 py-3 flex items-center justify-between">
        <div className="min-w-0">
          <div className="text-[13.5px] font-semibold truncate" style={{ fontFamily: 'var(--font-disp)' }}>{p.name}</div>
          <div className="text-[10.5px] mt-0.5" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-dim)' }}>
            {p.type} · {p.canvas.w}×{p.canvas.h} · {timeAgo(p.updatedAt)}
          </div>
        </div>
        <span className="text-[10px] shrink-0 px-2 py-1 rounded-md" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-mut)', background: 'var(--color-panel3)' }}>
          {p.devices.length} dev
        </span>
      </div>
    </div>
  );
}

function QuickCard({ kind, onClick }: { kind: DeviceKind; onClick: () => void }) {
  const meta = DEVICE_META[kind];
  const w = Math.min(118, 78 * meta.aspect);
  const h = w / meta.aspect;
  return (
    <button
      onClick={onClick}
      className="card card-hover cursor-pointer p-4 flex flex-col items-center group"
    >
      <div
        className="relative flex items-center justify-center w-full rounded-lg mb-3 overflow-hidden"
        style={{ height: 92, background: 'linear-gradient(135deg, #23262d, #191b20)' }}
      >
        <div className="relative" style={{ width: w, height: h }}>
          <DeviceFrame kind={kind} color={meta.colors[0].hex} w={w} h={h} part="back" />
          <div
            className="absolute transition-opacity group-hover:opacity-90 opacity-60"
            style={{ inset: 0, borderRadius: 6, background: 'linear-gradient(135deg, rgba(255,107,61,0.35), rgba(69,214,200,0.3))' }}
          />
          <DeviceFrame kind={kind} color={meta.colors[0].hex} w={w} h={h} part="front" />
        </div>
      </div>
      <span className="text-[13px] font-semibold group-hover:text-acc transition-colors" style={{ fontFamily: 'var(--font-disp)' }}>{meta.label}</span>
      <span className="text-[9.5px]" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-dim)' }}>{meta.colors.length} frame colors</span>
    </button>
  );
}

function NewProjectModal({ onClose }: { onClose: () => void }) {
  const createProject = useStudio(s => s.createProject);
  const [name, setName] = useState('');
  const [type, setType] = useState(PROJECT_TYPES[0]);
  const [preset, setPreset] = useState(CANVAS_PRESETS[0]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center anim-fade-in" style={{ background: 'rgba(8,9,11,0.78)', backdropFilter: 'blur(4px)' }} onPointerDown={onClose}>
      <div className="anim-pop w-[560px] max-w-[94vw] rounded-xl border border-line bg-panel shadow-[0_40px_120px_rgba(0,0,0,0.6)]" onPointerDown={(e) => e.stopPropagation()}>
        <div className="px-6 pt-5 pb-4 border-b border-line2">
          <div className="text-[17px] font-semibold" style={{ fontFamily: 'var(--font-disp)' }}>New project</div>
          <div className="text-[11px] mt-0.5" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-dim)' }}>pick a type and canvas — you can change everything later</div>
        </div>
        <div className="px-6 py-5 space-y-5">
          <div>
            <div className="label-mono mb-1.5">Project name</div>
            <input autoFocus className="input" placeholder="e.g. Nova Commerce" value={name} onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') createProject(name, type, preset.w, preset.h); }} />
          </div>
          <div>
            <div className="label-mono mb-2">Project type</div>
            <div className="flex flex-wrap gap-1.5">
              {PROJECT_TYPES.map(t => (
                <button key={t} className={`chip ${t === type ? 'on' : ''}`} onClick={() => setType(t)}>{t}</button>
              ))}
            </div>
          </div>
          <div>
            <div className="label-mono mb-2">Canvas size</div>
            <div className="grid grid-cols-4 gap-1.5">
              {CANVAS_PRESETS.map(cp => {
                const on = preset.w === cp.w && preset.h === cp.h;
                return (
                  <button
                    key={cp.label}
                    onClick={() => setPreset(cp)}
                    className="py-2 rounded-lg border cursor-pointer transition-all"
                    style={{
                      borderColor: on ? 'var(--color-acc)' : 'var(--color-line)',
                      background: on ? 'rgba(255,107,61,0.1)' : 'var(--color-ink)',
                    }}
                  >
                    <div className="text-[11px] font-medium" style={{ color: on ? 'var(--color-acc)' : 'var(--color-fg)', fontFamily: 'var(--font-disp)' }}>{cp.label}</div>
                    <div className="text-[9px] mt-0.5" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-dim)' }}>{cp.w}×{cp.h}</div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
        <div className="px-6 py-4 border-t border-line2 flex justify-end gap-2">
          <button className="btn" onClick={onClose}>Cancel</button>
          <button className="btn btn-acc" onClick={() => createProject(name, type, preset.w, preset.h)}>
            <IcPlus size={14} /> Create project
          </button>
        </div>
      </div>
    </div>
  );
}

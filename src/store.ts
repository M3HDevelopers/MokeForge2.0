import { create } from 'zustand';
import type { Asset, DesignSnapshot, DeviceKind, GenLocks, Mood, Project, Selection, SurpriseMode, Toast } from './types';
import { applyLayoutPositions, clamp, DEVICE_META, makeDefaultProject, makeDevice, migrate, uid } from './templates';
import { COMPOSITIONS, generateDesign, generateVariations, responsiveShowcase, scoreDesign } from './engine';
import { makeThumbnail } from './renderer';

const LS_PROJECTS = 'mockforge.projects.v1';
const LS_STATS = 'mockforge.stats.v1';
const LS_FAVS = 'mockforge.favorites.v1';

export function classifyAsset(a: Asset): 'desktop' | 'tablet' | 'mobile' {
  const r = a.w / a.h;
  if (r > 1.25) return 'desktop';
  if (r >= 0.7) return 'tablet';
  return 'mobile';
}

export function fileToAsset(file: File): Promise<Asset> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      try {
        const max = 1600;
        const sc = Math.min(1, max / Math.max(img.naturalWidth, img.naturalHeight));
        const w = Math.max(1, Math.round(img.naturalWidth * sc));
        const h = Math.max(1, Math.round(img.naturalHeight * sc));
        const c = document.createElement('canvas');
        c.width = w; c.height = h;
        const ctx = c.getContext('2d')!;
        ctx.drawImage(img, 0, 0, w, h);
        const isPng = file.type === 'image/png' || file.type === 'image/svg+xml';
        const dataUrl = isPng && file.size < 900_000 ? c.toDataURL('image/png') : c.toDataURL('image/jpeg', 0.86);
        resolve({ id: uid(), name: file.name.replace(/\.[^.]+$/, ''), dataUrl, w, h });
      } catch (e) { reject(e); }
      URL.revokeObjectURL(url);
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Could not read image')); };
    img.src = url;
  });
}

export function urlToAsset(url: string, name: string): Promise<Asset> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const max = 1600;
        const sc = Math.min(1, max / Math.max(img.naturalWidth, img.naturalHeight));
        const w = Math.max(1, Math.round(img.naturalWidth * sc));
        const h = Math.max(1, Math.round(img.naturalHeight * sc));
        const c = document.createElement('canvas');
        c.width = w; c.height = h;
        c.getContext('2d')!.drawImage(img, 0, 0, w, h);
        resolve({ id: uid(), name, dataUrl: c.toDataURL('image/jpeg', 0.88), w, h });
      } catch (e) { reject(e); }
    };
    img.onerror = () => reject(new Error('fetch failed'));
    img.src = url;
  });
}

function loadStats(): { totalExports: number } {
  try { return JSON.parse(localStorage.getItem(LS_STATS) || '{"totalExports":0}'); }
  catch { return { totalExports: 0 }; }
}
function loadFavs(): DesignSnapshot[] {
  try { return JSON.parse(localStorage.getItem(LS_FAVS) || '[]'); } catch { return []; }
}

let saveTimer: ReturnType<typeof setTimeout> | null = null;

function snapshot(p: Project, label: string, thumb: string): DesignSnapshot {
  const { assets, ...rest } = p;
  void assets;
  return { id: uid(), label, at: Date.now(), thumb, score: scoreDesign(p).total, project: rest };
}
function mergeSnapshot(cur: Project, s: DesignSnapshot): Project {
  return migrate({ ...s.project, id: cur.id, name: cur.name, assets: cur.assets, thumbnail: cur.thumbnail, exportCount: cur.exportCount });
}

function persist(projects: Project[]): boolean {
  try { localStorage.setItem(LS_PROJECTS, JSON.stringify(projects)); return true; }
  catch { return false; }
}

interface StudioState {
  booted: boolean;
  view: 'dashboard' | 'editor';
  projects: Project[];
  project: Project | null;
  selection: Selection | null;
  past: Project[];
  future: Project[];
  dirty: boolean;
  savedAt: number | null;
  saving: boolean;
  zoom: number;
  exportOpen: boolean;
  toasts: Toast[];
  totalExports: number;
  mood: Mood;
  locks: GenLocks;
  history: DesignSnapshot[];
  favorites: DesignSnapshot[];
  variations: DesignSnapshot[];
  variationsOpen: boolean;
  genOpen: boolean;
  compare: [DesignSnapshot | null, DesignSnapshot | null];
  compareOpen: boolean;

  boot: () => void;
  goto: (v: 'dashboard' | 'editor') => void;
  toast: (msg: string, tone?: Toast['tone']) => void;
  dismissToast: (id: number) => void;
  createProject: (name: string, type: string, cw: number, ch: number, quickKind?: DeviceKind) => void;
  openProject: (id: string) => void;
  closeEditor: () => void;
  deleteProject: (id: string) => void;
  duplicateProject: (id: string) => void;
  importProject: (p: Project) => void;
  checkpoint: () => void;
  update: (fn: (p: Project) => Project, history?: boolean) => void;
  undo: () => void;
  redo: () => void;
  addFiles: (files: FileList | File[]) => Promise<void>;
  addAsset: (a: Asset) => void;
  removeAsset: (id: string) => void;
  renameAsset: (id: string, name: string) => void;
  duplicateAsset: (id: string) => void;
  addTextBox: () => void;
  removeTextBox: (id: string) => void;
  removeIcon: (id: string) => void;
  assignAsset: (deviceId: string, assetId: string) => void;
  addDevice: (kind: DeviceKind) => void;
  applyLayout: (id: string) => void;
  applyComposition: (id: string) => void;
  responsive: () => void;
  removeDevice: (id: string) => void;
  duplicateDevice: (id: string) => void;
  reorderDevice: (id: string, dir: -1 | 1) => void;
  alignDevices: (axis: 'h' | 'v' | 'center') => void;
  distributeDevices: (axis: 'h' | 'v') => void;
  randomize: () => void;
  setMood: (m: Mood) => void;
  toggleLock: (k: keyof GenLocks) => void;
  generate: (mode: SurpriseMode) => void;
  makeVariations: () => Promise<void>;
  applyVariation: (id: string) => void;
  setVariationsOpen: (v: boolean) => void;
  setGenOpen: (v: boolean) => void;
  favorite: () => Promise<void>;
  unfavorite: (id: string) => void;
  applySnapshot: (s: DesignSnapshot) => void;
  restoreHistory: (id: string) => void;
  deleteHistory: (id: string) => void;
  setCompare: (slot: 0 | 1, s: DesignSnapshot | null) => void;
  setCompareOpen: (v: boolean) => void;
  pushHistoryNext: () => Promise<void>;
  exportMockup: () => void;
  importMockup: (file: File) => Promise<void>;
  save: (silent?: boolean) => void;
  setZoom: (z: number) => void;
  setSelection: (s: Selection | null) => void;
  setExportOpen: (v: boolean) => void;
  trackExport: () => void;
}

export const useStudio = create<StudioState>((set, get) => ({
  booted: false,
  view: 'dashboard',
  projects: [],
  project: null,
  selection: null,
  past: [],
  future: [],
  dirty: false,
  savedAt: null,
  saving: false,
  zoom: 0.5,
  exportOpen: false,
  toasts: [],
  totalExports: loadStats().totalExports,
  mood: 'auto',
  locks: { devices: false, background: false, decoration: false, text: false, logo: false },
  history: [],
  favorites: loadFavs(),
  variations: [],
  variationsOpen: false,
  genOpen: false,
  compare: [null, null],
  compareOpen: false,

  boot: () => {
    if (get().booted) return;
    let projects: Project[] = [];
    try { projects = (JSON.parse(localStorage.getItem(LS_PROJECTS) || '[]') as Project[]).map(migrate); } catch { /* corrupted */ }
    set({ projects, booted: true });
  },

  goto: (v) => {
    if (v === 'dashboard' && get().project) get().save(true);
    set({ view: v, ...(v === 'editor' ? {} : { project: null, selection: null, past: [], future: [], variations: [], variationsOpen: false, genOpen: false }) });
  },

  toast: (msg, tone = 'ok') => {
    const id = Date.now() + Math.random();
    set(s => ({ toasts: [...s.toasts, { id, msg, tone }] }));
    setTimeout(() => get().dismissToast(id), 3600);
  },
  dismissToast: (id) => set(s => ({ toasts: s.toasts.filter(t => t.id !== id) })),

  createProject: (name, type, cw, ch, quickKind) => {
    const p = makeDefaultProject(name || 'Untitled project', type, cw, ch);
    if (quickKind) {
      const { w, h } = p.canvas;
      p.devices = [makeDevice(quickKind, w, h, null, 0)];
    }
    set(s => ({ projects: [p, ...s.projects], project: p, view: 'editor', selection: { kind: 'device', id: p.devices[0]?.id }, past: [], future: [], dirty: false, savedAt: null, zoom: 0.5 }));
  },

  openProject: (id) => {
    const p = get().projects.find(x => x.id === id);
    if (!p) return;
    set({ project: migrate(JSON.parse(JSON.stringify(p))), view: 'editor', selection: { kind: 'device', id: p.devices[0]?.id }, past: [], future: [], dirty: false, savedAt: p.updatedAt, zoom: 0.5 });
  },

  closeEditor: () => { get().save(true); get().goto('dashboard'); },

  deleteProject: (id) => {
    set(s => ({ projects: s.projects.filter(p => p.id !== id) }));
    persist(get().projects);
    get().toast('Project deleted', 'info');
  },

  duplicateProject: (id) => {
    const p = get().projects.find(x => x.id === id);
    if (!p) return;
    const copy: Project = JSON.parse(JSON.stringify(p));
    copy.id = uid(); copy.name = `${p.name} copy`; copy.createdAt = Date.now(); copy.updatedAt = Date.now();
    set(s => ({ projects: [copy, ...s.projects] }));
    persist(get().projects);
    get().toast('Project duplicated');
  },

  importProject: (p) => {
    set(s => ({ projects: [{ ...migrate(p), id: uid() }, ...s.projects] }));
    persist(get().projects);
    get().toast('Project imported');
  },

  checkpoint: () => {
    const p = get().project;
    if (!p) return;
    const snap = JSON.parse(JSON.stringify({ ...p, assets: [], thumbnail: null }));
    set(s => ({ past: [...s.past.slice(-59), snap], future: [] }));
  },

  update: (fn, history = true) => {
    const cur = get().project;
    if (!cur) return;
    if (history) get().checkpoint();
    const next = { ...fn(cur), updatedAt: Date.now() };
    set({ project: next, dirty: true });
    if (saveTimer) clearTimeout(saveTimer);
    saveTimer = setTimeout(() => get().save(true), 1400);
  },

  undo: () => {
    const { past, project } = get();
    if (!past.length || !project) return;
    const prev = past[past.length - 1];
    set(s => ({
      past: s.past.slice(0, -1),
      future: [...s.future, JSON.parse(JSON.stringify({ ...project, thumbnail: null }))],
      project: migrate({ ...prev, assets: project.assets }),
      dirty: true,
    }));
  },

  redo: () => {
    const { future, project } = get();
    if (!future.length || !project) return;
    const next = future[future.length - 1];
    set(s => ({
      future: s.future.slice(0, -1),
      past: [...s.past, JSON.parse(JSON.stringify({ ...project, thumbnail: null }))],
      project: migrate({ ...next, assets: project.assets }),
      dirty: true,
    }));
  },

  addFiles: async (files) => {
    const list = Array.from(files).filter(f => f.type.startsWith('image/'));
    if (!list.length) { get().toast('Only image files are supported', 'err'); return; }
    const cur = get().project;
    if (!cur) return;
    let p = cur;
    let added: Asset[] = [];
    for (const f of list) {
      try { const a = await fileToAsset(f); added = [...added, a]; p = { ...p, assets: [...p.assets, a] }; }
      catch { get().toast(`Could not read ${f.name}`, 'err'); }
    }
    let ai = 0;
    p = { ...p, devices: p.devices.map(d => d.assetId ? d : (added[ai] ? { ...d, assetId: added[ai++]!.id } : d)) };
    set({ project: { ...p, updatedAt: Date.now() }, dirty: true });
    if (added.length) get().toast(`${added.length} screenshot${added.length > 1 ? 's' : ''} added`);
    get().save(true);
  },

  addAsset: (a) => {
    get().update(p => ({ ...p, assets: [...p.assets, a] }), false);
  },

  removeAsset: (id) => {
    get().update(p => ({ ...p, assets: p.assets.filter(a => a.id !== id), devices: p.devices.map(d => d.assetId === id ? { ...d, assetId: null } : d) }), false);
  },

  renameAsset: (id, name) => {
    get().update(p => ({ ...p, assets: p.assets.map(a => a.id === id ? { ...a, name: name || a.name } : a) }), false);
  },

  duplicateAsset: (id) => {
    const a = get().project?.assets.find(x => x.id === id);
    if (!a) return;
    get().update(p => ({ ...p, assets: [...p.assets, { ...a, id: uid(), name: `${a.name} copy` }] }), false);
  },

  addTextBox: () => {
    const id = uid();
    get().update(p => ({
      ...p,
      textboxes: [...p.textboxes, {
        id,
        text: 'Your text here',
        x: 0.5,
        y: 0.5,
        width: 0.3,
        fontSize: 24,
        fontFamily: 'Space Grotesk',
        fontWeight: 600,
        color: '#ffffff',
        align: 'center',
        bgType: 'none',
        bgColor: '#000000',
        padding: 12,
        borderRadius: 8,
        opacity: 1,
        rotation: 0,
        shadow: false,
        glow: false,
        glowColor: '#ff6b3d',
      }],
    }));
    set({ selection: { kind: 'textbox', id } });
  },

  removeTextBox: (id) => {
    get().update(p => ({ ...p, textboxes: p.textboxes.filter(t => t.id !== id) }));
    set(s => s.selection?.id === id ? { selection: null } : s);
  },

  removeIcon: (id) => {
    get().update(p => ({ ...p, icons: p.icons.filter(i => i.id !== id) }));
    set(s => s.selection?.id === id ? { selection: null } : s);
  },

  assignAsset: (deviceId, assetId) => {
    get().update(p => ({ ...p, devices: p.devices.map(d => d.id === deviceId ? { ...d, assetId } : d) }), false);
  },

  addDevice: (kind) => {
    get().update(p => {
      const d = makeDevice(kind, p.canvas.w, p.canvas.h, p.assets.find(a => !p.devices.some(dd => dd.assetId === a.id))?.id ?? null, p.devices.length);
      const offset = p.devices.length * 24;
      d.x = clamp(d.x + offset, 0, p.canvas.w - d.w);
      d.y = clamp(d.y + offset, 0, p.canvas.h - d.w / DEVICE_META[kind].aspect);
      d.z = p.devices.length;
      return { ...p, devices: [...p.devices, d] };
    });
    const p = get().project!;
    set({ selection: { kind: 'device', id: p.devices[p.devices.length - 1].id } });
    get().toast(`${DEVICE_META[kind].label} added`);
  },

  applyLayout: (id) => {
    get().checkpoint();
    set(s => s.project ? { project: applyLayoutPositions(s.project, id), dirty: true, selection: null } : s);
    get().toast('Layout applied');
    get().save(true);
  },

  applyComposition: (id) => {
    const comp = COMPOSITIONS.find(c => c.id === id);
    const cur = get().project;
    if (!comp || !cur) return;
    get().checkpoint();
    const { w: cw, h: ch } = cur.canvas;
    const assets = cur.assets;
    const devices = comp.slots.map((s, i) => {
      const prev = cur.devices[i];
      const d = makeDevice(s.k, cw, ch, null, i);
      return {
        ...d, x: s.x * cw, y: s.y * ch, w: s.w * cw, tilt: s.t ?? 0,
        assetId: assets.length ? assets[i % assets.length].id : (prev?.assetId ?? null),
        color: prev?.color ?? d.color, z: i,
      };
    });
    set(s => s.project ? { project: { ...s.project, devices, updatedAt: Date.now() }, dirty: true, selection: null } : s);
    get().toast(`Layout: ${comp.label}`);
    get().save(true);
  },

  responsive: () => {
    const cur = get().project;
    if (!cur) return;
    if (!cur.assets.length) { get().toast('Add screenshots first', 'err'); return; }
    get().checkpoint();
    const variant = Math.floor(Math.random() * 5);
    set(s => s.project ? { project: responsiveShowcase(s.project, variant), dirty: true } : s);
    get().toast('Responsive showcase built');
    get().save(true);
  },

  removeDevice: (id) => {
    get().update(p => ({ ...p, devices: p.devices.filter(d => d.id !== id) }));
    set(s => s.selection?.id === id ? { selection: null } : s);
  },

  duplicateDevice: (id) => {
    get().update(p => {
      const d = p.devices.find(x => x.id === id);
      if (!d) return p;
      const copy = { ...d, id: uid(), name: `${d.name} copy`, x: d.x + 28, y: d.y + 28, z: p.devices.length };
      return { ...p, devices: [...p.devices, copy] };
    });
    const p = get().project!;
    set({ selection: { kind: 'device', id: p.devices[p.devices.length - 1].id } });
  },

  reorderDevice: (id, dir) => {
    get().update(p => {
      const i = p.devices.findIndex(d => d.id === id);
      const j = i + dir;
      if (i < 0 || j < 0 || j >= p.devices.length) return p;
      const arr = [...p.devices];
      [arr[i], arr[j]] = [arr[j], arr[i]];
      return { ...p, devices: arr.map((d, k) => ({ ...d, z: k })) };
    });
  },

  alignDevices: (axis) => {
    get().update(p => {
      if (p.devices.length < 2) return p;
      const boxes = p.devices.map(d => ({ d, h: d.w / DEVICE_META[d.kind].aspect }));
      if (axis === 'h') {
        const y = Math.min(...boxes.map(b => b.d.y));
        return { ...p, devices: p.devices.map(d => ({ ...d, y })) };
      }
      if (axis === 'v') {
        const x = Math.min(...boxes.map(b => b.d.x));
        return { ...p, devices: p.devices.map(d => ({ ...d, x })) };
      }
      const cy = boxes.reduce((s, b) => s + b.d.y + b.h / 2, 0) / boxes.length;
      return { ...p, devices: p.devices.map(d => ({ ...d, y: cy - (d.w / DEVICE_META[d.kind].aspect) / 2 })) };
    });
    get().toast('Devices aligned');
  },

  distributeDevices: (axis) => {
    get().update(p => {
      if (p.devices.length < 3) return p;
      const sorted = [...p.devices].sort((a, b) => axis === 'h' ? a.x - b.x : a.y - b.y);
      const first = sorted[0], last = sorted[sorted.length - 1];
      const span = axis === 'h' ? (last.x - first.x) : (last.y - first.y);
      const step = span / (sorted.length - 1);
      const posOf = new Map(sorted.map((d, i) => [d.id, axis === 'h' ? first.x + step * i : first.y + step * i]));
      return { ...p, devices: p.devices.map(d => axis === 'h' ? { ...d, x: posOf.get(d.id)! } : { ...d, y: posOf.get(d.id)! }) };
    });
    get().toast('Devices distributed');
  },

  randomize: () => { get().generate('all'); },
  setMood: (m) => set({ mood: m }),
  toggleLock: (k) => set(s => ({ locks: { ...s.locks, [k]: !s.locks[k] } })),

  generate: (mode) => {
    const cur = get().project;
    if (!cur) return;
    get().checkpoint();
    const { mood, locks } = get();
    const seed = (Date.now() ^ Math.floor(Math.random() * 1e9)) >>> 0;
    const next = generateDesign(cur, { mode, mood, seed, locks });
    set({ project: { ...next, assets: cur.assets }, dirty: true });
    void get().pushHistoryNext();
    const label = mode === 'all' ? 'Surprise me' : `Randomize ${mode}`;
    get().toast(`${label} · score ${scoreDesign(next).total}`, 'info');
  },

  makeVariations: async () => {
    const cur = get().project;
    if (!cur) return;
    const list = generateVariations(cur, 10, get().mood);
    const snaps: DesignSnapshot[] = [];
    for (let i = 0; i < list.length; i++) {
      const p = { ...list[i], assets: cur.assets };
      const thumb = await makeThumbnail(p, 320);
      snaps.push(snapshot(p, `Variation ${String(i + 1).padStart(2, '0')}`, thumb));
    }
    set({ variations: snaps, variationsOpen: true });
  },

  applyVariation: (id) => {
    const v = get().variations.find(x => x.id === id);
    if (!v) return;
    get().applySnapshot(v);
    set({ variationsOpen: false });
    get().toast('Variation applied');
  },

  setVariationsOpen: (v) => set({ variationsOpen: v }),
  setGenOpen: (v) => set({ genOpen: v }),

  favorite: async () => {
    const cur = get().project;
    if (!cur) return;
    const thumb = await makeThumbnail(cur, 420);
    const snap = snapshot(cur, cur.name, thumb);
    const favs = [snap, ...get().favorites].slice(0, 40);
    set({ favorites: favs });
    try { localStorage.setItem(LS_FAVS, JSON.stringify(favs)); } catch { /* full */ }
    get().toast('Saved to favorites');
  },

  unfavorite: (id) => {
    const favs = get().favorites.filter(f => f.id !== id);
    set({ favorites: favs });
    try { localStorage.setItem(LS_FAVS, JSON.stringify(favs)); } catch { /* full */ }
  },

  applySnapshot: (s) => {
    const cur = get().project;
    if (!cur) return;
    get().checkpoint();
    set({ project: mergeSnapshot(cur, s), dirty: true });
    get().save(true);
  },

  restoreHistory: (id) => {
    const h = get().history.find(x => x.id === id);
    if (!h) return;
    get().applySnapshot(h);
    get().toast('Design restored');
  },

  deleteHistory: (id) => set(s => ({ history: s.history.filter(x => x.id !== id) })),

  setCompare: (slot, s) => set(st => ({ compare: slot === 0 ? [s, st.compare[1]] : [st.compare[0], s] })),
  setCompareOpen: (v) => set({ compareOpen: v }),

  pushHistoryNext: async () => {
    const cur = get().project;
    if (!cur) return;
    const thumb = await makeThumbnail(cur, 300);
    const snap = snapshot(cur, cur.name, thumb);
    set(s => ({ history: [snap, ...s.history].slice(0, 24) }));
  },

  exportMockup: () => {
    const cur = get().project;
    if (!cur) return;
    const blob = new Blob([JSON.stringify({ format: 'mockforge.mockup', version: 2, project: cur }, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `${cur.name.replace(/\s+/g, '-').toLowerCase()}.mockup.json`;
    a.click();
    URL.revokeObjectURL(url);
    get().toast('Project file exported (.mockup)');
  },

  importMockup: async (file) => {
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      const p = migrate(data.project ?? data);
      set(s => ({ projects: [{ ...p, id: uid() }, ...s.projects] }));
      persist(get().projects);
      get().toast('Project file imported');
    } catch {
      get().toast('Invalid .mockup file', 'err');
    }
  },

  save: (silent = false) => {
    const { project } = get();
    if (!project) return;
    set({ saving: true });
    const next = get().projects.some(x => x.id === project.id)
      ? get().projects.map(x => x.id === project.id ? { ...project, thumbnail: x.thumbnail } : x)
      : [project, ...get().projects];
    const ok = persist(next);
    if (ok) {
      set(s => ({ projects: next, dirty: false, savedAt: Date.now(), saving: false, project: s.project ? { ...s.project } : null }));
      if (!silent) get().toast('Project saved');
    } else {
      set({ saving: false });
      get().toast('Storage is full — export your work or delete old projects', 'err');
    }
  },

  setZoom: (z) => set({ zoom: clamp(z, 0.1, 2) }),
  setSelection: (sel) => set({ selection: sel }),
  setExportOpen: (v) => set({ exportOpen: v }),

  trackExport: () => {
    const { project } = get();
    const total = get().totalExports + 1;
    localStorage.setItem(LS_STATS, JSON.stringify({ totalExports: total }));
    if (project) {
      const next = get().projects.map(x => x.id === project.id ? { ...x, exportCount: x.exportCount + 1 } : x);
      persist(next);
      set(s => ({ projects: next, project: s.project ? { ...s.project, exportCount: s.project.exportCount + 1 } : null }));
    }
    set({ totalExports: total });
  },
}));

import { useStudio } from '../store';
import { IcClose, IcLock, IcSpark, IcUnlock, IcWand } from '../icons';
import type { Mood, SurpriseMode } from '../types';

const MOODS: { id: Mood; label: string }[] = [
  { id: 'auto', label: 'Auto' }, { id: 'minimal', label: 'Minimal' }, { id: 'premium', label: 'Premium' },
  { id: 'creative', label: 'Creative' }, { id: 'developer', label: 'Developer' }, { id: 'dark', label: 'Dark' },
  { id: 'light', label: 'Light' }, { id: 'editorial', label: 'Editorial' }, { id: 'bold', label: 'Bold' },
  { id: 'elegant', label: 'Elegant' }, { id: 'futuristic', label: 'Futuristic' }, { id: 'playful', label: 'Playful' },
  { id: 'corporate', label: 'Corporate' },
];

export function GeneratePanel() {
  const genOpen = useStudio(s => s.genOpen);
  const setGenOpen = useStudio(s => s.setGenOpen);
  const mood = useStudio(s => s.mood);
  const setMood = useStudio(s => s.setMood);
  const locks = useStudio(s => s.locks);
  const toggleLock = useStudio(s => s.toggleLock);
  const generate = useStudio(s => s.generate);
  const makeVariations = useStudio(s => s.makeVariations);
  const variations = useStudio(s => s.variations);
  const variationsOpen = useStudio(s => s.variationsOpen);
  const setVariationsOpen = useStudio(s => s.setVariationsOpen);
  const applyVariation = useStudio(s => s.applyVariation);
  const favorites = useStudio(s => s.favorites);
  const applySnapshot = useStudio(s => s.applySnapshot);
  const toast = useStudio(s => s.toast);

  if (!genOpen) return null;

  const modes: { id: SurpriseMode; label: string }[] = [
    { id: 'all', label: '🎲 Surprise me' },
    { id: 'background', label: '🎨 Background' },
    { id: 'layout', label: '📐 Layout' },
    { id: 'colors', label: '🌈 Colors' },
    { id: 'decor', label: '✨ Decor' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center anim-fade-in" style={{ background: 'rgba(8,9,11,0.78)', backdropFilter: 'blur(4px)' }} onPointerDown={() => setGenOpen(false)}>
      <div className="anim-pop w-[640px] max-w-[94vw] max-h-[85vh] rounded-xl border border-line bg-panel shadow-[0_40px_120px_rgba(0,0,0,0.6)] overflow-hidden flex flex-col" onPointerDown={(e) => e.stopPropagation()}>
        <div className="px-6 pt-5 pb-4 border-b border-line2 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2"><IcWand size={18} className="text-acc" /><div className="text-[17px] font-semibold" style={{ fontFamily: 'var(--font-disp)' }}>Design Engine</div></div>
          <button className="icon-btn" onClick={() => setGenOpen(false)}><IcClose size={16} /></button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {/* Mood */}
          <div>
            <div className="label-mono mb-2">Design mood</div>
            <div className="flex flex-wrap gap-1.5">{MOODS.map(m => (<button key={m.id} className={`chip ${mood === m.id ? 'on' : ''}`} onClick={() => setMood(m.id)}>{m.label}</button>))}</div>
          </div>
          {/* Locks */}
          <div>
            <div className="label-mono mb-2">Lock elements (surprise won't change these)</div>
            <div className="flex flex-wrap gap-1.5">
              {(Object.keys(locks) as Array<keyof typeof locks>).map(k => (
                <button key={k} className={`chip ${locks[k] ? 'on' : ''}`} onClick={() => toggleLock(k)}>
                  {locks[k] ? <IcLock size={10} /> : <IcUnlock size={10} />}
                  {k}
                </button>
              ))}
            </div>
          </div>
          {/* Generate buttons */}
          <div>
            <div className="label-mono mb-2">Generate</div>
            <div className="flex flex-wrap gap-2">
              {modes.map(m => (
                <button key={m.id} className="btn" onClick={() => generate(m.id)}>{m.label}</button>
              ))}
              <button className="btn btn-acc" onClick={() => void makeVariations()}><IcSpark size={14} />10 Variations</button>
            </div>
          </div>
          {/* Variations */}
          {variations.length > 0 && (
            <div>
              <div className="label-mono mb-2">Variations ({variations.length})</div>
              <div className="grid grid-cols-5 gap-2">{variations.map(v => (<button key={v.id} className="rounded-lg overflow-hidden border border-line hover:border-acc transition-colors" onClick={() => applyVariation(v.id)}><img src={v.thumb} alt={v.label} className="w-full aspect-[8/5] object-cover" /><div className="px-1 py-0.5 text-[8px] text-center" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-mut)' }}>{v.label} · {v.score}</div></button>))}</div>
            </div>
          )}
          {/* Favorites */}
          {favorites.length > 0 && (
            <div>
              <div className="label-mono mb-2">Favorites ({favorites.length})</div>
              <div className="grid grid-cols-5 gap-2">{favorites.slice(0, 10).map(f => (<button key={f.id} className="rounded-lg overflow-hidden border border-line hover:border-gold transition-colors" onClick={() => { applySnapshot(f); toast('Favorite applied'); }}><img src={f.thumb} alt={f.label} className="w-full aspect-[8/5] object-cover" /><div className="px-1 py-0.5 text-[8px] text-center truncate" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-mut)' }}>{f.label}</div></button>))}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

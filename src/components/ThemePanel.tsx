import { useState, useRef, useEffect } from 'react';
import { extractColorsFromImage, generateThemeVariations, type ExtractedColor, type ThemeVariation } from '../utils/colorExtraction';
import { useStudio } from '../store';
import { IcRefresh, IcLock, IcUnlock } from '../icons';

export function ThemePanel() {
  const project = useStudio(s => s.project);
  const update = useStudio(s => s.update);
  const setStoreThemeVariations = useStudio(s => s.setThemeVariations);
  const [extractedColors, setExtractedColors] = useState<ExtractedColor[]>([]);
  const [themeVariations, setThemeVariations] = useState<ThemeVariation[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('');
  const [selectedVariationIdx, setSelectedVariationIdx] = useState<number | null>(null);
  const [isFloating, setIsFloating] = useState(false);
  const [position, setPosition] = useState({ x: 100, y: 100 });
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef<HTMLDivElement>(null);

  const handleExtractColors = async () => {
    if (!selectedDeviceId || !project) return;

    const device = project.devices.find(d => d.id === selectedDeviceId);
    if (!device || !device.assetId) return;

    const asset = project.assets.find(a => a.id === device.assetId);
    if (!asset) return;

    setLoading(true);
    try {
      const colors = await extractColorsFromImage(asset.dataUrl, 5);
      setExtractedColors(colors);
      
      const variations = generateThemeVariations(colors);
      setThemeVariations(variations);
      setStoreThemeVariations(variations);
    } catch (error) {
      console.error('Failed to extract colors:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyTheme = (variation: ThemeVariation) => {
    if (!project) return;

    update(p => ({
      ...p,
      background: {
        ...p.background,
        c1: variation.background,
        c2: variation.accent,
      },
      accents: {
        a1: variation.accent,
        a2: variation.colors[0] || variation.accent,
      },
      text: {
        ...p.text,
        color: variation.text,
      },
    }));
  };

  const scrambleColors = (variationIdx: number) => {
    if (!project || !themeVariations[variationIdx]) return;

    const variation = themeVariations[variationIdx];
    const shuffled = [...variation.colors].sort(() => Math.random() - 0.5);
    
    const newVariation = {
      ...variation,
      colors: shuffled,
      background: shuffled[0] || variation.background,
      accent: shuffled[1] || variation.accent,
      text: shuffled[2] || variation.text,
    };

    const newVariations = [...themeVariations];
    newVariations[variationIdx] = newVariation;
    setThemeVariations(newVariations);
    setStoreThemeVariations(newVariations);

    // Apply the scrambled theme immediately
    applyTheme(newVariation);
  };

  const dragStartRef = useRef({ x: 0, y: 0, posX: 0, posY: 0 });

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!isFloating) return;
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      posX: position.x,
      posY: position.y,
    };
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;
    setPosition({
      x: dragStartRef.current.posX + dx,
      y: dragStartRef.current.posY + dy,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging]);

  if (!project) return null;

  const devicesWithScreenshots = project.devices.filter(d => d.assetId);

  const content = (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold" style={{ color: 'var(--color-fg)' }}>Smart Theme Generator</h3>
          <p className="text-xs mt-1" style={{ color: 'var(--color-dim)' }}>
            Extract colors and generate themes
          </p>
        </div>
        <button
          onClick={() => setIsFloating(!isFloating)}
          className="icon-btn"
          title={isFloating ? 'Dock panel' : 'Float panel'}
        >
          {isFloating ? <IcLock size={14} /> : <IcUnlock size={14} />}
        </button>
      </div>

      {devicesWithScreenshots.length > 0 ? (
        <>
          <div>
            <label className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--color-mut)' }}>Select Device</label>
            <select
              value={selectedDeviceId}
              onChange={(e) => setSelectedDeviceId(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-md border"
              style={{
                backgroundColor: 'var(--color-panel2)',
                borderColor: 'var(--color-line)',
                color: 'var(--color-fg)',
              }}
            >
              <option value="" style={{ backgroundColor: 'var(--color-panel2)' }}>Choose a device...</option>
              {devicesWithScreenshots.map(device => {
                const asset = project.assets.find(a => a.id === device.assetId);
                return (
                  <option key={device.id} value={device.id} style={{ backgroundColor: 'var(--color-panel2)' }}>
                    {device.name} - {asset?.name || 'Screenshot'}
                  </option>
                );
              })}
            </select>
          </div>

          <button
            onClick={handleExtractColors}
            disabled={!selectedDeviceId || loading}
            className="w-full px-4 py-2.5 text-sm font-medium rounded-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              backgroundColor: 'var(--color-acc)',
              color: '#1a0e08',
              border: 'none',
            }}
          >
            {loading ? 'Extracting...' : 'Extract Colors & Generate Themes'}
          </button>

          {extractedColors.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold mb-2" style={{ color: 'var(--color-fg)' }}>Extracted Colors</h4>
              <div className="flex gap-2 flex-wrap">
                {extractedColors.map((color, idx) => (
                  <div key={idx} className="flex flex-col items-center">
                    <div
                      className="w-12 h-12 rounded-md border-2"
                      style={{ 
                        backgroundColor: color.hex,
                        borderColor: 'var(--color-line)',
                      }}
                    />
                    <span className="text-[10px] mt-1 font-mono" style={{ color: 'var(--color-dim)' }}>
                      {color.percentage.toFixed(0)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {themeVariations.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-semibold" style={{ color: 'var(--color-fg)' }}>Theme Variations</h4>
                <span className="text-[10px]" style={{ color: 'var(--color-dim)' }}>
                  Click to apply
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {themeVariations.map((variation, idx) => (
                  <div
                    key={idx}
                    className="relative group"
                  >
                    <button
                      onClick={() => {
                        setSelectedVariationIdx(idx);
                        applyTheme(variation);
                      }}
                      className="w-full p-3 rounded-md border-2 transition-all text-left"
                      style={{
                        borderColor: selectedVariationIdx === idx ? 'var(--color-acc)' : 'var(--color-line)',
                        backgroundColor: selectedVariationIdx === idx ? 'rgba(255,107,61,0.1)' : 'var(--color-panel)',
                      }}
                    >
                      <div className="flex gap-1 mb-2">
                        {variation.colors.slice(0, 4).map((color, cidx) => (
                          <div
                            key={cidx}
                            className="w-6 h-6 rounded-sm border"
                            style={{ 
                              backgroundColor: color,
                              borderColor: 'var(--color-line)',
                            }}
                          />
                        ))}
                      </div>
                      <div className="text-xs font-medium" style={{ color: 'var(--color-fg)' }}>{variation.name}</div>
                      <div className="text-[10px] capitalize" style={{ color: 'var(--color-dim)' }}>
                        {variation.type}
                      </div>
                    </button>
                    
                    {/* Scramble Colors Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        scrambleColors(idx);
                      }}
                      className="absolute top-1 right-1 p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                      style={{
                        backgroundColor: 'var(--color-panel2)',
                        border: '1px solid var(--color-line)',
                      }}
                      title="Scramble colors"
                    >
                      <IcRefresh size={12} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-8">
          <p className="text-sm" style={{ color: 'var(--color-dim)' }}>
            Add a screenshot to a device to extract colors
          </p>
        </div>
      )}
    </div>
  );

  if (isFloating) {
    return (
      <div
        ref={dragRef}
        className="fixed z-[100] rounded-lg shadow-2xl border-2 overflow-hidden"
        style={{
          left: position.x,
          top: position.y,
          width: 340,
          maxHeight: '80vh',
          backgroundColor: 'var(--color-panel)',
          borderColor: 'var(--color-acc)',
          cursor: isDragging ? 'grabbing' : 'default',
        }}
        onMouseDown={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drag Handle */}
        <div 
          className="px-4 py-2 border-b cursor-move select-none"
          style={{ 
            backgroundColor: 'var(--color-panel2)',
            borderColor: 'var(--color-line)'
          }}
          onMouseDown={handleMouseDown}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold" style={{ color: 'var(--color-fg)' }}>
              Smart Theme Panel
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsFloating(false);
              }}
              className="icon-btn !w-6 !h-6"
              title="Dock panel"
            >
              <IcLock size={12} />
            </button>
          </div>
        </div>
        
        {/* Content */}
        <div className="p-4 overflow-y-auto" style={{ maxHeight: 'calc(80vh - 40px)' }}>
          {content}
        </div>
      </div>
    );
  }

  return <div className="p-4">{content}</div>;
}

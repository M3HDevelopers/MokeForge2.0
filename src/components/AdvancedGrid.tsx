import { useEffect, useState } from 'react';

interface DistanceGuide {
  type: 'horizontal' | 'vertical';
  position: number;
  distance: number;
  label: string;
}

interface AdvancedGridProps {
  canvasWidth: number;
  canvasHeight: number;
  zoom: number;
  isDragging: boolean;
  selectedObject?: {
    x: number;
    y: number;
    width: number;
    height: number;
  } | null;
  otherObjects?: Array<{
    x: number;
    y: number;
    width: number;
    height: number;
  }>;
}

export function AdvancedGrid({ canvasWidth, canvasHeight, zoom, isDragging, selectedObject, otherObjects = [] }: AdvancedGridProps) {
  const [guides, setGuides] = useState<DistanceGuide[]>([]);

  useEffect(() => {
    if (!isDragging || !selectedObject) {
      setGuides([]);
      return;
    }

    const allGuides: DistanceGuide[] = [];
    const maxDistance = 300;
    const maxGuidesPerSide = 2;

    const leftDist = selectedObject.x;
    const rightDist = canvasWidth - (selectedObject.x + selectedObject.width);
    const topDist = selectedObject.y;
    const bottomDist = canvasHeight - (selectedObject.y + selectedObject.height);

    const leftGuides: DistanceGuide[] = [];
    const rightGuides: DistanceGuide[] = [];
    const topGuides: DistanceGuide[] = [];
    const bottomGuides: DistanceGuide[] = [];

    if (leftDist > 0 && leftDist <= maxDistance) {
      const steps = Math.floor(leftDist / 20);
      for (let i = 1; i <= steps; i++) {
        const d = i * 20;
        leftGuides.push({
          type: 'vertical',
          position: selectedObject.x - d,
          distance: d,
          label: `${d}px`
        });
      }
    }

    if (rightDist > 0 && rightDist <= maxDistance) {
      const steps = Math.floor(rightDist / 20);
      for (let i = 1; i <= steps; i++) {
        const d = i * 20;
        rightGuides.push({
          type: 'vertical',
          position: selectedObject.x + selectedObject.width + d,
          distance: d,
          label: `${d}px`
        });
      }
    }

    if (topDist > 0 && topDist <= maxDistance) {
      const steps = Math.floor(topDist / 20);
      for (let i = 1; i <= steps; i++) {
        const d = i * 20;
        topGuides.push({
          type: 'horizontal',
          position: selectedObject.y - d,
          distance: d,
          label: `${d}px`
        });
      }
    }

    if (bottomDist > 0 && bottomDist <= maxDistance) {
      const steps = Math.floor(bottomDist / 20);
      for (let i = 1; i <= steps; i++) {
        const d = i * 20;
        bottomGuides.push({
          type: 'horizontal',
          position: selectedObject.y + selectedObject.height + d,
          distance: d,
          label: `${d}px`
        });
      }
    }

    const canvasCenterX = canvasWidth / 2;
    const canvasCenterY = canvasHeight / 2;
    const selectedCenterX = selectedObject.x + selectedObject.width / 2;
    const selectedCenterY = selectedObject.y + selectedObject.height / 2;

    if (Math.abs(selectedCenterX - canvasCenterX) < 5) {
      allGuides.push({
        type: 'vertical',
        position: canvasCenterX,
        distance: 0,
        label: 'center'
      });
    }

    if (Math.abs(selectedCenterY - canvasCenterY) < 5) {
      allGuides.push({
        type: 'horizontal',
        position: canvasCenterY,
        distance: 0,
        label: 'center'
      });
    }

    leftGuides.sort((a, b) => a.distance - b.distance);
    rightGuides.sort((a, b) => a.distance - b.distance);
    topGuides.sort((a, b) => a.distance - b.distance);
    bottomGuides.sort((a, b) => a.distance - b.distance);

    allGuides.push(...leftGuides.slice(0, maxGuidesPerSide));
    allGuides.push(...rightGuides.slice(0, maxGuidesPerSide));
    allGuides.push(...topGuides.slice(0, maxGuidesPerSide));
    allGuides.push(...bottomGuides.slice(0, maxGuidesPerSide));

    setGuides(allGuides);
  }, [selectedObject, otherObjects, canvasWidth, canvasHeight]);

  if (guides.length === 0) return null;

  const verticalLabelPositions: number[] = [];
  const horizontalLabelPositions: number[] = [];

  return (
    <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 9999 }}>
      {guides.map((guide, idx) => {
        if (guide.type === 'vertical') {
          let labelTop = 8;
          for (const existingPos of verticalLabelPositions) {
            if (Math.abs(existingPos - labelTop) < 20) {
              labelTop = existingPos + 20;
            }
          }
          verticalLabelPositions.push(labelTop);

          return (
            <div key={idx} className="absolute top-0 bottom-0" style={{ left: guide.position, zIndex: 9999 }}>
              <div 
                className="w-px h-full" 
                style={{ 
                  background: guide.distance === 0 ? 'var(--color-acc2)' : 'var(--color-acc)',
                  opacity: guide.distance === 0 ? 0.9 : 0.5
                }} 
              />
              {guide.distance > 0 && (
                <div 
                  className="absolute -translate-x-1/2 px-2 py-1 rounded text-[10px] font-mono font-bold whitespace-nowrap"
                  style={{ 
                    background: 'var(--color-acc)', 
                    color: 'white',
                    left: '50%',
                    top: `${labelTop}px`,
                    zIndex: 10000,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                    border: '1px solid rgba(255,255,255,0.2)'
                  }}
                >
                  {guide.label}
                </div>
              )}
            </div>
          );
        } else {
          let labelLeft = 8;
          for (const existingPos of horizontalLabelPositions) {
            if (Math.abs(existingPos - labelLeft) < 50) {
              labelLeft = existingPos + 50;
            }
          }
          horizontalLabelPositions.push(labelLeft);

          return (
            <div key={idx} className="absolute left-0 right-0" style={{ top: guide.position, zIndex: 9999 }}>
              <div 
                className="h-px w-full" 
                style={{ 
                  background: guide.distance === 0 ? 'var(--color-acc2)' : 'var(--color-acc)',
                  opacity: guide.distance === 0 ? 0.9 : 0.5
                }} 
              />
              {guide.distance > 0 && (
                <div 
                  className="absolute -translate-y-1/2 px-2 py-1 rounded text-[10px] font-mono font-bold whitespace-nowrap"
                  style={{ 
                    background: 'var(--color-acc)', 
                    color: 'white',
                    top: '50%',
                    left: `${labelLeft}px`,
                    zIndex: 10000,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                    border: '1px solid rgba(255,255,255,0.2)'
                  }}
                >
                  {guide.label}
                </div>
              )}
            </div>
          );
        }
      })}
    </div>
  );
}

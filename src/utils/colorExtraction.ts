export interface ExtractedColor {
  hex: string;
  rgb: [number, number, number];
  hsl: [number, number, number];
  percentage: number;
}

export interface ThemeVariation {
  name: string;
  type: 'matching' | 'opposite' | 'contrast' | 'tint' | 'shade' | 'monochrome' | 'analogous' | 'triadic';
  colors: string[];
  background: string;
  accent: string;
  text: string;
}

export async function extractColorsFromImage(imageUrl: string, numColors: number = 5): Promise<ExtractedColor[]> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) { reject(new Error('Could not get canvas context')); return; }
      const maxSize = 100;
      const scale = Math.min(maxSize / img.width, maxSize / img.height, 1);
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      try {
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const colors = extractDominantColors(imageData.data, numColors);
        resolve(colors);
      } catch (error) { reject(error); }
    };
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = imageUrl;
  });
}

function extractDominantColors(data: Uint8ClampedArray, numColors: number): ExtractedColor[] {
  const colorMap = new Map<string, { count: number; rgb: [number, number, number] }>();
  for (let i = 0; i < data.length; i += 16) {
    const r = data[i], g = data[i + 1], b = data[i + 2], a = data[i + 3];
    if (a < 128) continue;
    const qr = Math.round(r / 32) * 32, qg = Math.round(g / 32) * 32, qb = Math.round(b / 32) * 32;
    const key = `${qr},${qg},${qb}`;
    const existing = colorMap.get(key);
    if (existing) { existing.count++; } else { colorMap.set(key, { count: 1, rgb: [r, g, b] }); }
  }
  const sorted = Array.from(colorMap.values()).sort((a, b) => b.count - a.count).slice(0, numColors);
  const total = sorted.reduce((sum, c) => sum + c.count, 0);
  return sorted.map(c => ({ hex: rgbToHex(c.rgb), rgb: c.rgb, hsl: rgbToHsl(c.rgb), percentage: (c.count / total) * 100 }));
}

function rgbToHex(rgb: [number, number, number]): string { return '#' + rgb.map(x => x.toString(16).padStart(2, '0')).join(''); }
function rgbToHsl(rgb: [number, number, number]): [number, number, number] {
  const [r, g, b] = rgb.map(x => x / 255);
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return [0, 0, l * 100];
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h = 0;
  if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
  else if (max === g) h = ((b - r) / d + 2) / 6;
  else h = ((r - g) / d + 4) / 6;
  return [h * 360, s * 100, l * 100];
}

function hslToRgb(hsl: [number, number, number]): [number, number, number] {
  const [h, s, l] = [hsl[0] / 360, hsl[1] / 100, hsl[2] / 100];
  if (s === 0) { const v = Math.round(l * 255); return [v, v, v]; }
  const hue2rgb = (p: number, q: number, t: number) => { if (t < 0) t += 1; if (t > 1) t -= 1; if (t < 1/6) return p + (q - p) * 6 * t; if (t < 1/2) return q; if (t < 2/3) return p + (q - p) * (2/3 - t) * 6; return p; };
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  return [Math.round(hue2rgb(p, q, h + 1/3) * 255), Math.round(hue2rgb(p, q, h) * 255), Math.round(hue2rgb(p, q, h - 1/3) * 255)];
}

function adjustLightness(hex: string, amount: number): string {
  const rgb = hexToRgbArr(hex);
  const hsl = rgbToHsl(rgb);
  const newL = Math.max(0, Math.min(100, hsl[2] + amount));
  return rgbToHex(hslToRgb([hsl[0], hsl[1], newL]));
}

function hexToRgbArr(hex: string): [number, number, number] {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return [0, 0, 0];
  return [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)];
}

export function generateThemeVariations(colors: ExtractedColor[]): ThemeVariation[] {
  if (colors.length === 0) return [];
  const baseColor = colors[0];
  const variations: ThemeVariation[] = [];
  variations.push({ name: 'Matching Theme', type: 'matching', colors: colors.map(c => c.hex), background: adjustLightness(baseColor.hex, -20), accent: colors.length > 1 ? colors[1].hex : baseColor.hex, text: '#ffffff' });
  const oppositeHsl: [number, number, number] = [(baseColor.hsl[0] + 180) % 360, baseColor.hsl[1], baseColor.hsl[2]];
  const oppositeHex = rgbToHex(hslToRgb(oppositeHsl));
  variations.push({ name: 'Opposite Theme', type: 'opposite', colors: [baseColor.hex, oppositeHex], background: adjustLightness(oppositeHex, -20), accent: oppositeHex, text: '#ffffff' });
  variations.push({ name: 'High Contrast', type: 'contrast', colors: ['#000000', '#ffffff', baseColor.hex], background: '#000000', accent: baseColor.hex, text: '#ffffff' });
  return variations;
}

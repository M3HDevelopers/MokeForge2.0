/**
 * Color Extraction & Theme Harmony System
 * Extracts colors from screenshots and generates harmonious themes
 */

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

/**
 * Extract dominant colors from an image
 */
export async function extractColorsFromImage(imageUrl: string, numColors: number = 5): Promise<ExtractedColor[]> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }

      // Resize for performance
      const maxSize = 100;
      const scale = Math.min(maxSize / img.width, maxSize / img.height, 1);
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;

      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      
      try {
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const colors = extractDominantColors(imageData.data, numColors);
        resolve(colors);
      } catch (error) {
        reject(error);
      }
    };

    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = imageUrl;
  });
}

/**
 * Extract dominant colors from image data using color quantization
 */
function extractDominantColors(data: Uint8ClampedArray, numColors: number): ExtractedColor[] {
  const colorMap = new Map<string, { count: number; rgb: [number, number, number] }>();
  
  // Sample pixels and quantize colors
  for (let i = 0; i < data.length; i += 16) { // Sample every 4th pixel
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const a = data[i + 3];

    // Skip transparent pixels
    if (a < 128) continue;

    // Quantize to reduce color space
    const qr = Math.round(r / 32) * 32;
    const qg = Math.round(g / 32) * 32;
    const qb = Math.round(b / 32) * 32;
    
    const key = `${qr},${qg},${qb}`;
    const existing = colorMap.get(key);
    
    if (existing) {
      existing.count++;
    } else {
      colorMap.set(key, { count: 1, rgb: [r, g, b] });
    }
  }

  // Sort by frequency and get top colors
  const sorted = Array.from(colorMap.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, numColors);

  const total = sorted.reduce((sum, c) => sum + c.count, 0);

  return sorted.map(c => ({
    hex: rgbToHex(c.rgb),
    rgb: c.rgb,
    hsl: rgbToHsl(c.rgb),
    percentage: (c.count / total) * 100,
  }));
}

/**
 * Convert RGB to Hex
 */
function rgbToHex(rgb: [number, number, number]): string {
  const [r, g, b] = rgb;
  return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');
}

/**
 * Convert RGB to HSL
 */
function rgbToHsl(rgb: [number, number, number]): [number, number, number] {
  const [r, g, b] = rgb.map(x => x / 255);
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  
  if (max === min) {
    return [0, 0, l * 100];
  }

  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  
  let h = 0;
  if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
  else if (max === g) h = ((b - r) / d + 2) / 6;
  else h = ((r - g) / d + 4) / 6;

  return [h * 360, s * 100, l * 100];
}

/**
 * Convert HSL to RGB
 */
function hslToRgb(hsl: [number, number, number]): [number, number, number] {
  const [h, s, l] = [hsl[0] / 360, hsl[1] / 100, hsl[2] / 100];
  
  if (s === 0) {
    const v = Math.round(l * 255);
    return [v, v, v];
  }

  const hue2rgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1/6) return p + (q - p) * 6 * t;
    if (t < 1/2) return q;
    if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
    return p;
  };

  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;

  return [
    Math.round(hue2rgb(p, q, h + 1/3) * 255),
    Math.round(hue2rgb(p, q, h) * 255),
    Math.round(hue2rgb(p, q, h - 1/3) * 255),
  ];
}

/**
 * Generate theme variations from extracted colors
 */
export function generateThemeVariations(colors: ExtractedColor[]): ThemeVariation[] {
  if (colors.length === 0) return [];

  const baseColor = colors[0];
  const variations: ThemeVariation[] = [];

  // 1. Matching theme (use extracted colors as-is)
  variations.push({
    name: 'Matching Theme',
    type: 'matching',
    colors: colors.map(c => c.hex),
    background: adjustLightness(baseColor.hex, -20),
    accent: colors.length > 1 ? colors[1].hex : baseColor.hex,
    text: isLightColor(baseColor.hex) ? '#1a1a1a' : '#ffffff',
  });

  // 2. Opposite/Complementary theme
  const oppositeHsl: [number, number, number] = [
    (baseColor.hsl[0] + 180) % 360,
    baseColor.hsl[1],
    baseColor.hsl[2],
  ];
  const oppositeHex = rgbToHex(hslToRgb(oppositeHsl));
  variations.push({
    name: 'Opposite Theme',
    type: 'opposite',
    colors: [baseColor.hex, oppositeHex],
    background: adjustLightness(oppositeHex, -20),
    accent: oppositeHex,
    text: isLightColor(oppositeHex) ? '#1a1a1a' : '#ffffff',
  });

  // 3. High Contrast theme
  variations.push({
    name: 'High Contrast',
    type: 'contrast',
    colors: ['#000000', '#ffffff', baseColor.hex],
    background: '#000000',
    accent: baseColor.hex,
    text: '#ffffff',
  });

  // 4. Tint theme (lighter versions)
  const tintHex = adjustLightness(baseColor.hex, 30);
  variations.push({
    name: 'Tint Theme',
    type: 'tint',
    colors: colors.map(c => adjustLightness(c.hex, 30)),
    background: tintHex,
    accent: adjustLightness(colors.length > 1 ? colors[1].hex : baseColor.hex, 30),
    text: '#1a1a1a',
  });

  // 5. Shade theme (darker versions)
  const shadeHex = adjustLightness(baseColor.hex, -30);
  variations.push({
    name: 'Shade Theme',
    type: 'shade',
    colors: colors.map(c => adjustLightness(c.hex, -30)),
    background: shadeHex,
    accent: adjustLightness(colors.length > 1 ? colors[1].hex : baseColor.hex, -30),
    text: '#ffffff',
  });

  // 6. Monochrome theme
  variations.push({
    name: 'Monochrome',
    type: 'monochrome',
    colors: [
      adjustLightness(baseColor.hex, -40),
      adjustLightness(baseColor.hex, -20),
      baseColor.hex,
      adjustLightness(baseColor.hex, 20),
      adjustLightness(baseColor.hex, 40),
    ],
    background: adjustLightness(baseColor.hex, -30),
    accent: baseColor.hex,
    text: isLightColor(baseColor.hex) ? '#1a1a1a' : '#ffffff',
  });

  // 7. Analogous theme (colors adjacent on color wheel)
  const analogous1: [number, number, number] = [
    (baseColor.hsl[0] + 30) % 360,
    baseColor.hsl[1],
    baseColor.hsl[2],
  ];
  const analogous2: [number, number, number] = [
    (baseColor.hsl[0] - 30 + 360) % 360,
    baseColor.hsl[1],
    baseColor.hsl[2],
  ];
  variations.push({
    name: 'Analogous Theme',
    type: 'analogous',
    colors: [baseColor.hex, rgbToHex(hslToRgb(analogous1)), rgbToHex(hslToRgb(analogous2))],
    background: adjustLightness(baseColor.hex, -20),
    accent: rgbToHex(hslToRgb(analogous1)),
    text: isLightColor(baseColor.hex) ? '#1a1a1a' : '#ffffff',
  });

  // 8. Triadic theme (three colors evenly spaced)
  const triadic1: [number, number, number] = [
    (baseColor.hsl[0] + 120) % 360,
    baseColor.hsl[1],
    baseColor.hsl[2],
  ];
  const triadic2: [number, number, number] = [
    (baseColor.hsl[0] + 240) % 360,
    baseColor.hsl[1],
    baseColor.hsl[2],
  ];
  variations.push({
    name: 'Triadic Theme',
    type: 'triadic',
    colors: [baseColor.hex, rgbToHex(hslToRgb(triadic1)), rgbToHex(hslToRgb(triadic2))],
    background: adjustLightness(baseColor.hex, -20),
    accent: rgbToHex(hslToRgb(triadic1)),
    text: isLightColor(baseColor.hex) ? '#1a1a1a' : '#ffffff',
  });

  return variations;
}

/**
 * Adjust the lightness of a hex color
 */
function adjustLightness(hex: string, amount: number): string {
  const rgb = hexToRgb(hex);
  const hsl = rgbToHsl(rgb);
  const newL = Math.max(0, Math.min(100, hsl[2] + amount));
  return rgbToHex(hslToRgb([hsl[0], hsl[1], newL]));
}

/**
 * Convert Hex to RGB
 */
function hexToRgb(hex: string): [number, number, number] {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return [0, 0, 0];
  return [
    parseInt(result[1], 16),
    parseInt(result[2], 16),
    parseInt(result[3], 16),
  ];
}

/**
 * Check if a color is light
 */
function isLightColor(hex: string): boolean {
  const rgb = hexToRgb(hex);
  const hsl = rgbToHsl(rgb);
  return hsl[2] > 50;
}

/**
 * Get the best theme variation based on mood
 */
export function getBestThemeForMood(variations: ThemeVariation[], mood: string): ThemeVariation {
  if (variations.length === 0) {
    return {
      name: 'Default',
      type: 'matching',
      colors: ['#ff6b3d', '#45d6c8'],
      background: '#101114',
      accent: '#ff6b3d',
      text: '#ffffff',
    };
  }

  switch (mood) {
    case 'premium':
    case 'luxury':
      return variations.find(v => v.type === 'shade') || variations[0];
    
    case 'minimal':
      return variations.find(v => v.type === 'monochrome') || variations[0];
    
    case 'creative':
    case 'playful':
      return variations.find(v => v.type === 'triadic') || variations[0];
    
    case 'dark':
      return variations.find(v => v.type === 'shade') || variations[0];
    
    case 'light':
      return variations.find(v => v.type === 'tint') || variations[0];
    
    case 'bold':
      return variations.find(v => v.type === 'contrast') || variations[0];
    
    case 'elegant':
      return variations.find(v => v.type === 'analogous') || variations[0];
    
    case 'futuristic':
      return variations.find(v => v.type === 'opposite') || variations[0];
    
    default:
      return variations.find(v => v.type === 'matching') || variations[0];
  }
}

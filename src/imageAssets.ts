import type { ImageCategory } from './types';

export interface ImageAsset {
  id: string;
  name: string;
  category: ImageCategory;
  tags: string[];
  src: string;
  thumbnail?: string;
  width: number;
  height: number;
  dark: boolean;
  busy: boolean;
  mood: string[];
}

export const IMAGE_ASSETS: ImageAsset[] = [
  {
    id: 'abs-premium-01',
    name: 'Warm Dimensional',
    category: 'abstract',
    tags: ['warm', 'premium', 'minimal', 'cream', 'soft'],
    src: 'https://image.qwenlm.ai/generated-images/201e7b84-86f8-480d-a30c-39ccb28fcc0b/_result.png',
    width: 2048,
    height: 2048,
    dark: false,
    busy: false,
    mood: ['premium', 'minimal', 'elegant'],
  },
  {
    id: 'abs-premium-02',
    name: 'Vibrant Creative',
    category: 'abstract',
    tags: ['vibrant', 'creative', 'bold', 'purple', 'orange'],
    src: 'https://image.qwenlm.ai/generated-images/16ba7855-0cb9-4ee4-a596-4c5814c4cb18/_result.png',
    width: 2048,
    height: 2048,
    dark: false,
    busy: false,
    mood: ['creative', 'bold'],
  },
  {
    id: '3d-glass-01',
    name: '3D Glass Objects',
    category: '3d',
    tags: ['glass', '3d', 'translucent', 'blue', 'silver'],
    src: 'https://image.qwenlm.ai/generated-images/84278cc1-d790-4bb6-8776-dc04b2785329/_result.png',
    width: 2048,
    height: 2048,
    dark: true,
    busy: false,
    mood: ['premium', 'futuristic'],
  },
  {
    id: 'studio-light-01',
    name: 'Premium Studio',
    category: 'studio',
    tags: ['studio', 'product', 'clean', 'white', 'minimal'],
    src: 'https://image.qwenlm.ai/generated-images/712a3865-92b6-4c9b-8255-a482709eeab9/_result.png',
    width: 2048,
    height: 2048,
    dark: false,
    busy: false,
    mood: ['premium', 'minimal'],
  },
  {
    id: 'arch-concrete-01',
    name: 'Architectural Modern',
    category: 'architectural',
    tags: ['concrete', 'modern', 'minimal', 'neutral', 'geometric'],
    src: 'https://image.qwenlm.ai/generated-images/4f9be771-77fc-4c7d-b398-a2b72842a0e5/_result.png',
    width: 2048,
    height: 2048,
    dark: false,
    busy: false,
    mood: ['corporate', 'minimal'],
  },
];

export const IMAGE_CATEGORIES: { id: ImageCategory | 'all'; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'abstract', label: 'Abstract' },
  { id: '3d', label: '3D' },
  { id: 'studio', label: 'Studio' },
  { id: 'architectural', label: 'Architectural' },
  { id: 'glass', label: 'Glass' },
  { id: 'paper', label: 'Paper' },
  { id: 'tech', label: 'Tech' },
  { id: 'editorial', label: 'Editorial' },
];

export function findImage(id: string): ImageAsset | undefined {
  return IMAGE_ASSETS.find(a => a.id === id);
}

export function searchImages(query: string, category?: ImageCategory | 'all'): ImageAsset[] {
  let list = IMAGE_ASSETS;
  if (category && category !== 'all') {
    list = list.filter(a => a.category === category);
  }
  if (!query.trim()) return list;
  
  const q = query.toLowerCase();
  return list.filter(a =>
    a.name.toLowerCase().includes(q) ||
    a.tags.some(t => t.includes(q)) ||
    a.category.includes(q) ||
    a.mood.some(m => m.includes(q))
  );
}

export function getRandomImage(mood?: string): ImageAsset | null {
  let pool = IMAGE_ASSETS.filter(a => a.src);
  if (mood) {
    const moodFiltered = pool.filter(a => a.mood.includes(mood));
    if (moodFiltered.length > 0) pool = moodFiltered;
  }
  if (pool.length === 0) return null;
  return pool[Math.floor(Math.random() * pool.length)];
}

export function getCompatibleImage(composition: { dark: boolean; busy: boolean }, mood?: string): ImageAsset | null {
  let pool = IMAGE_ASSETS.filter(a => a.src);
  
  pool = pool.filter(a => {
    if (composition.dark && !a.dark) return false;
    if (!composition.dark && a.dark) return false;
    if (composition.busy && a.busy) return false;
    return true;
  });
  
  if (mood) {
    const moodFiltered = pool.filter(a => a.mood.includes(mood));
    if (moodFiltered.length > 0) pool = moodFiltered;
  }
  
  if (pool.length === 0) return null;
  return pool[Math.floor(Math.random() * pool.length)];
}

import type { ImageCategory } from './types';

export interface ImageAsset {
  id: string;
  name: string;
  category: ImageCategory;
  tags: string[];
  src: string; // URL or data URL
  thumbnail?: string;
  width: number;
  height: number;
  dark: boolean;
  busy: boolean;
  mood: string[];
}

/* =========================================================================
   IMAGE ASSET LIBRARY
   Data-driven registry. Add new images by appending to IMAGE_ASSETS array.
   Supports URLs, data URLs, and custom imports.
   ========================================================================= */

export const IMAGE_ASSETS: ImageAsset[] = [
  // CATEGORY A: Abstract Premium (3 images)
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
    id: 'abs-premium-03',
    name: 'Nature Organic',
    category: 'abstract',
    tags: ['nature', 'organic', 'sage', 'green', 'calm'],
    src: 'https://image.qwenlm.ai/generated-images/93afa216-3b76-4f2b-9b73-f2efda5647d2/_result.png',
    width: 2048,
    height: 2048,
    dark: false,
    busy: false,
    mood: ['minimal', 'elegant'],
  },

  // CATEGORY B: 3D Abstract (2 images)
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
    id: '3d-metallic-01',
    name: 'Dark Luxury',
    category: '3d',
    tags: ['dark', 'luxury', 'metallic', 'black', 'gold'],
    src: 'https://image.qwenlm.ai/generated-images/4cb466d9-7c20-4388-add8-2ef7bf95cd77/_result.png',
    width: 2048,
    height: 2048,
    dark: true,
    busy: false,
    mood: ['premium', 'luxury', 'dark'],
  },

  // CATEGORY C: Studio
  {
    id: 'studio-dark-01',
    name: 'Dark Studio',
    category: 'studio',
    tags: ['studio', 'dark', 'product', 'premium'],
    src: '',
    width: 2048,
    height: 2048,
    dark: true,
    busy: false,
    mood: ['premium', 'dark', 'luxury'],
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

  // CATEGORY D: Architectural
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

  // CATEGORY E: Glass
  {
    id: 'glass-panels-01',
    name: 'Glass Translucent',
    category: 'glass',
    tags: ['glass', 'frosted', 'translucent', 'cool', 'blue'],
    src: 'https://image.qwenlm.ai/generated-images/7977fae9-11aa-46ef-b006-b95036a7f837/_result.png',
    width: 2048,
    height: 2048,
    dark: false,
    busy: false,
    mood: ['premium', 'futuristic'],
  },

  // CATEGORY F: Paper/Material
  {
    id: 'paper-folded-01',
    name: 'Material Texture',
    category: 'paper',
    tags: ['paper', 'texture', 'editorial', 'warm', 'tactile'],
    src: 'https://image.qwenlm.ai/generated-images/321033be-ec4f-496b-806e-372629e05b7b/_result.png',
    width: 2048,
    height: 2048,
    dark: false,
    busy: false,
    mood: ['editorial', 'minimal'],
  },

  // CATEGORY G: Tech/Digital
  {
    id: 'tech-network-01',
    name: 'Tech Digital',
    category: 'tech',
    tags: ['tech', 'network', 'data', 'developer', 'navy', 'cyan'],
    src: 'https://image.qwenlm.ai/generated-images/6439bf1a-7951-48be-92fb-684f57845689/_result.png',
    width: 2048,
    height: 2048,
    dark: true,
    busy: false,
    mood: ['developer', 'futuristic'],
  },

  // CATEGORY H: Editorial (1 image)
  {
    id: 'editorial-asym-01',
    name: 'Editorial Modern',
    category: 'editorial',
    tags: ['editorial', 'asymmetric', 'modern', 'creative', 'cream', 'charcoal'],
    src: 'https://image.qwenlm.ai/generated-images/11db5e1d-7e9a-4fe4-b97d-8a6ae7d2efb2/_result.png',
    width: 2048,
    height: 2048,
    dark: false,
    busy: false,
    mood: ['editorial', 'creative'],
  },
  // EXPERIMENTAL COLLECTION (20 images)
  {
    id: 'exp-01',
    name: 'Liquid Chrome Flow',
    category: 'abstract',
    tags: ['liquid', 'chrome', 'metallic', 'flow', 'reflective'],
    src: 'https://image.qwenlm.ai/generated-images/54b09ab9-1b92-4e87-8551-a4a6943302b0/_result.png',
    width: 2048,
    height: 2048,
    dark: true,
    busy: false,
    mood: ['premium', 'creative', 'luxury'],
  },
  {
    id: 'exp-02',
    name: 'Colorful Acrylic Layers',
    category: 'abstract',
    tags: ['colorful', 'acrylic', 'layered', 'translucent', 'vibrant'],
    src: 'https://image.qwenlm.ai/generated-images/44847217-c331-411d-b27f-37604cff0468/_result.png',
    width: 2048,
    height: 2048,
    dark: false,
    busy: true,
    mood: ['creative', 'playful', 'bold'],
  },
  {
    id: 'exp-03',
    name: 'Monochrome Organic Waves',
    category: 'abstract',
    tags: ['monochrome', 'organic', 'waves', 'minimal', 'gray'],
    src: 'https://image.qwenlm.ai/generated-images/af95a796-3731-4d68-9baa-4c9599857b26/_result.png',
    width: 2048,
    height: 2048,
    dark: false,
    busy: false,
    mood: ['minimal', 'developer', 'technical'],
  },
  {
    id: 'exp-04',
    name: 'Iridescent Fabric Sculpture',
    category: 'abstract',
    tags: ['iridescent', 'fabric', 'silk', 'violet', 'luxury'],
    src: 'https://image.qwenlm.ai/generated-images/e9d24cbe-438f-4996-8fa6-381df6e9bd96/_result.png',
    width: 2048,
    height: 2048,
    dark: false,
    busy: false,
    mood: ['luxury', 'elegant', 'creative'],
  },
  {
    id: 'exp-05',
    name: 'Floating Geometric Blocks',
    category: '3d',
    tags: ['geometric', 'blocks', 'floating', 'cream', 'graphite'],
    src: 'https://image.qwenlm.ai/generated-images/1343b06a-b160-415c-8a90-be123165a5d0/_result.png',
    width: 2048,
    height: 2048,
    dark: false,
    busy: false,
    mood: ['editorial', 'modern', 'minimal'],
  },
  {
    id: 'exp-06',
    name: 'Ink in Water',
    category: 'abstract',
    tags: ['ink', 'water', 'fluid', 'navy', 'artistic'],
    src: 'https://image.qwenlm.ai/generated-images/f762d6af-54f2-4b01-b26f-c01cf9e0be1c/_result.png',
    width: 2048,
    height: 2048,
    dark: true,
    busy: false,
    mood: ['creative', 'artistic', 'elegant'],
  },
  {
    id: 'exp-07',
    name: 'Warm Sunset Architecture',
    category: 'architectural',
    tags: ['sunset', 'warm', 'peach', 'orange', 'gradient'],
    src: 'https://image.qwenlm.ai/generated-images/2da22f9a-0f2f-4706-a8ce-e3f037c1f7ae/_result.png',
    width: 2048,
    height: 2048,
    dark: false,
    busy: false,
    mood: ['editorial', 'warm', 'elegant'],
  },
  {
    id: 'exp-08',
    name: 'Crystal Geometry',
    category: '3d',
    tags: ['crystal', 'geometry', 'translucent', 'silver', 'futuristic'],
    src: 'https://image.qwenlm.ai/generated-images/76cb8196-dc84-4348-9c03-44b7eb436ab9/_result.png',
    width: 2048,
    height: 2048,
    dark: false,
    busy: false,
    mood: ['futuristic', 'premium', 'creative'],
  },
  {
    id: 'exp-09',
    name: 'Soft Foam Landscape',
    category: 'abstract',
    tags: ['foam', 'landscape', 'soft', 'ivory', 'surreal'],
    src: 'https://image.qwenlm.ai/generated-images/5862c000-2954-47f9-be6e-991362f34f74/_result.png',
    width: 2048,
    height: 2048,
    dark: false,
    busy: false,
    mood: ['creative', 'minimal', 'elegant'],
  },
  {
    id: 'exp-10',
    name: 'Neon Light Trails Refined',
    category: 'tech',
    tags: ['neon', 'light', 'trails', 'dark', 'elegant'],
    src: 'https://image.qwenlm.ai/generated-images/f3ea8982-8c9f-4cc4-b3b6-582028a4244e/_result.png',
    width: 2048,
    height: 2048,
    dark: true,
    busy: false,
    mood: ['futuristic', 'tech', 'bold'],
  },
  {
    id: 'exp-11',
    name: 'Folded Metallic Paper',
    category: 'paper',
    tags: ['metallic', 'paper', 'folded', 'silver', 'luxury'],
    src: 'https://image.qwenlm.ai/generated-images/f27532cb-e816-4169-bc17-6e37d3306f23/_result.png',
    width: 2048,
    height: 2048,
    dark: false,
    busy: false,
    mood: ['luxury', 'editorial', 'premium'],
  },
  {
    id: 'exp-12',
    name: 'Oceanic Glass Forms',
    category: 'glass',
    tags: ['oceanic', 'glass', 'blue', 'underwater', 'calm'],
    src: 'https://image.qwenlm.ai/generated-images/73dcf5ba-7d0b-431b-8d1b-05ff3505061b/_result.png',
    width: 2048,
    height: 2048,
    dark: true,
    busy: false,
    mood: ['premium', 'creative', 'elegant'],
  },
  {
    id: 'exp-13',
    name: 'Giant Soft Sphere',
    category: '3d',
    tags: ['sphere', 'minimal', 'ceramic', 'gray', 'clean'],
    src: 'https://image.qwenlm.ai/generated-images/9033b5c4-abf1-48f9-9726-b09993cb71a9/_result.png',
    width: 2048,
    height: 2048,
    dark: false,
    busy: false,
    mood: ['minimal', 'elegant', 'premium'],
  },
  {
    id: 'exp-14',
    name: 'Abstract Topographic Lines',
    category: 'tech',
    tags: ['topographic', 'lines', 'contour', 'navy', 'technical'],
    src: 'https://image.qwenlm.ai/generated-images/e5bc87b0-6182-4075-a49f-5d5ed14efc0f/_result.png',
    width: 2048,
    height: 2048,
    dark: true,
    busy: true,
    mood: ['technical', 'developer', 'modern'],
  },
  {
    id: 'exp-15',
    name: 'Minimal Bauhaus Composition',
    category: 'abstract',
    tags: ['bauhaus', 'geometric', 'minimal', 'red', 'editorial'],
    src: 'https://image.qwenlm.ai/generated-images/ac114d10-08c5-41a4-bcad-89c4fb1af9b4/_result.png',
    width: 2048,
    height: 2048,
    dark: false,
    busy: false,
    mood: ['editorial', 'modern', 'creative'],
  },
  {
    id: 'exp-16',
    name: 'Soft Shadow Photography',
    category: 'studio',
    tags: ['shadow', 'photography', 'minimal', 'ivory', 'clean'],
    src: 'https://image.qwenlm.ai/generated-images/3ccf9044-832b-425b-96ce-b4e6f5819ce1/_result.png',
    width: 2048,
    height: 2048,
    dark: false,
    busy: false,
    mood: ['premium', 'minimal', 'editorial'],
  },
  {
    id: 'exp-17',
    name: 'Holographic Material',
    category: 'abstract',
    tags: ['holographic', 'material', 'silver', 'cyan', 'futuristic'],
    src: 'https://image.qwenlm.ai/generated-images/0cb27848-8a27-426f-86c8-869b6479971c/_result.png',
    width: 2048,
    height: 2048,
    dark: false,
    busy: false,
    mood: ['futuristic', 'premium', 'creative'],
  },
  {
    id: 'exp-18',
    name: 'Organic Clay Forms',
    category: 'abstract',
    tags: ['clay', 'organic', 'terracotta', 'sculpture', 'artistic'],
    src: 'https://image.qwenlm.ai/generated-images/dd7e182c-40d5-4cfd-9464-3b293ffb7bcd/_result.png',
    width: 2048,
    height: 2048,
    dark: false,
    busy: false,
    mood: ['artistic', 'editorial', 'creative'],
  },
  {
    id: 'exp-19',
    name: 'Futuristic White Tunnel',
    category: 'architectural',
    tags: ['tunnel', 'white', 'futuristic', 'clean', 'architectural'],
    src: 'https://image.qwenlm.ai/generated-images/618d41d3-3394-4da8-8f50-24f14e7ec8c2/_result.png',
    width: 2048,
    height: 2048,
    dark: false,
    busy: false,
    mood: ['futuristic', 'minimal', 'premium'],
  },
  {
    id: 'exp-20',
    name: 'Abstract Color Powder',
    category: 'abstract',
    tags: ['powder', 'color', 'abstract', 'blue', 'violet'],
    src: 'https://image.qwenlm.ai/generated-images/f2c25c98-505d-4a87-aaef-91515157950a/_result.png',
    width: 2048,
    height: 2048,
    dark: false,
    busy: true,
    mood: ['creative', 'artistic', 'bold'],
  },
  // PROFESSIONAL PORTFOLIO COLLECTION (20 images)
  {
    id: 'pro-01',
    name: 'Premium SaaS Workspace',
    category: 'studio',
    tags: ['saas', 'workspace', 'premium', 'white', 'corporate'],
    src: 'https://image.qwenlm.ai/generated-images/e3830c79-356e-46d7-8f1c-dc240c02dc0f/_result.png',
    width: 2048,
    height: 2048,
    dark: false,
    busy: false,
    mood: ['corporate', 'premium', 'developer'],
  },
  {
    id: 'pro-02',
    name: 'Corporate Graphite Architecture',
    category: 'architectural',
    tags: ['corporate', 'graphite', 'charcoal', 'professional', 'serious'],
    src: 'https://image.qwenlm.ai/generated-images/9eccaf7c-1085-473f-9b9f-88f50ee76cf4/_result.png',
    width: 2048,
    height: 2048,
    dark: true,
    busy: false,
    mood: ['corporate', 'professional', 'technical'],
  },
  {
    id: 'pro-03',
    name: 'Luxury Cream & Black',
    category: 'studio',
    tags: ['luxury', 'cream', 'black', 'contrast', 'elegant'],
    src: 'https://image.qwenlm.ai/generated-images/39641d37-f0ee-4d3c-9662-a73a4138bf2a/_result.png',
    width: 2048,
    height: 2048,
    dark: false,
    busy: false,
    mood: ['luxury', 'premium', 'elegant'],
  },
  {
    id: 'pro-04',
    name: 'Modern Glass Office Abstract',
    category: 'glass',
    tags: ['glass', 'office', 'modern', 'transparent', 'saas'],
    src: 'https://image.qwenlm.ai/generated-images/a1828f41-4386-4c42-8cee-d9b46330de80/_result.png',
    width: 2048,
    height: 2048,
    dark: false,
    busy: false,
    mood: ['premium', 'developer', 'technical'],
  },
  {
    id: 'pro-05',
    name: 'Precision Grid Studio',
    category: 'tech',
    tags: ['grid', 'precision', 'minimal', 'engineering', 'developer'],
    src: 'https://image.qwenlm.ai/generated-images/65575320-9854-45f7-aa49-a17ecc72f8d2/_result.png',
    width: 2048,
    height: 2048,
    dark: false,
    busy: false,
    mood: ['developer', 'technical', 'minimal'],
  },
  {
    id: 'pro-06',
    name: 'Deep Navy Executive',
    category: 'architectural',
    tags: ['navy', 'executive', 'corporate', 'dark', 'enterprise'],
    src: 'https://image.qwenlm.ai/generated-images/256c76ad-7f5b-4eb5-ac9c-d6a4a204cdd9/_result.png',
    width: 2048,
    height: 2048,
    dark: true,
    busy: false,
    mood: ['corporate', 'premium', 'luxury'],
  },
  {
    id: 'pro-07',
    name: 'White Marble Minimal',
    category: 'studio',
    tags: ['marble', 'white', 'minimal', 'clean', 'elegant'],
    src: 'https://image.qwenlm.ai/generated-images/be01a3a8-41ac-4db2-9a73-7db7eddb73ca/_result.png',
    width: 2048,
    height: 2048,
    dark: false,
    busy: false,
    mood: ['premium', 'elegant', 'minimal'],
  },
  {
    id: 'pro-08',
    name: 'Titanium Product Environment',
    category: 'studio',
    tags: ['titanium', 'metallic', 'product', 'graphite', 'premium'],
    src: 'https://image.qwenlm.ai/generated-images/45d2542d-d95a-427a-8984-9f772a11c031/_result.png',
    width: 2048,
    height: 2048,
    dark: true,
    busy: false,
    mood: ['premium', 'luxury', 'technical'],
  },
  {
    id: 'pro-09',
    name: 'Architectural Light Beam',
    category: 'architectural',
    tags: ['light', 'beam', 'architectural', 'minimal', 'editorial'],
    src: 'https://image.qwenlm.ai/generated-images/a6c13b02-49e2-40f5-beb4-63f5a92e6a7a/_result.png',
    width: 2048,
    height: 2048,
    dark: false,
    busy: false,
    mood: ['editorial', 'premium', 'minimal'],
  },
  {
    id: 'pro-10',
    name: 'Emerald Corporate Glass',
    category: 'glass',
    tags: ['emerald', 'corporate', 'glass', 'fintech', 'green'],
    src: 'https://image.qwenlm.ai/generated-images/97f88df7-7341-4e24-9a56-0d3691f42c5b/_result.png',
    width: 2048,
    height: 2048,
    dark: true,
    busy: false,
    mood: ['corporate', 'premium', 'technical'],
  },
  {
    id: 'pro-11',
    name: 'Minimal Black Platform',
    category: 'studio',
    tags: ['black', 'platform', 'minimal', 'luxury', 'dark'],
    src: 'https://image.qwenlm.ai/generated-images/cd1eaa93-85a4-488b-8cfe-336bcfd69cc2/_result.png',
    width: 2048,
    height: 2048,
    dark: true,
    busy: false,
    mood: ['luxury', 'premium', 'minimal'],
  },
  {
    id: 'pro-12',
    name: 'Soft Blue Architectural Panels',
    category: 'architectural',
    tags: ['blue', 'panels', 'soft', 'clean', 'modern'],
    src: 'https://image.qwenlm.ai/generated-images/56eff0b1-593e-497c-af0c-0d9bd7529498/_result.png',
    width: 2048,
    height: 2048,
    dark: false,
    busy: false,
    mood: ['premium', 'developer', 'modern'],
  },
  {
    id: 'pro-13',
    name: 'Fintech Abstract Environment',
    category: 'abstract',
    tags: ['fintech', 'abstract', 'charcoal', 'emerald', 'business'],
    src: 'https://image.qwenlm.ai/generated-images/93d5a5eb-f4c1-4297-85f3-f3a3293e31aa/_result.png',
    width: 2048,
    height: 2048,
    dark: true,
    busy: false,
    mood: ['corporate', 'premium', 'technical'],
  },
  {
    id: 'pro-14',
    name: 'Clean Isometric Architecture',
    category: 'architectural',
    tags: ['isometric', 'clean', 'architecture', 'cream', 'modern'],
    src: 'https://image.qwenlm.ai/generated-images/c0c1ab0c-14a0-4770-92cc-475eae8c784e/_result.png',
    width: 2048,
    height: 2048,
    dark: false,
    busy: false,
    mood: ['premium', 'modern', 'developer'],
  },
  {
    id: 'pro-15',
    name: 'Soft Charcoal Gradient',
    category: 'studio',
    tags: ['charcoal', 'gradient', 'soft', 'dark', 'clean'],
    src: 'https://image.qwenlm.ai/generated-images/153f7382-9253-47a3-969e-de65c548919f/_result.png',
    width: 2048,
    height: 2048,
    dark: true,
    busy: false,
    mood: ['premium', 'minimal', 'technical'],
  },
  {
    id: 'pro-16',
    name: 'Modern Museum Surface',
    category: 'studio',
    tags: ['museum', 'modern', 'white', 'minimal', 'elegant'],
    src: 'https://image.qwenlm.ai/generated-images/ed77c5e4-334e-4bb6-8d83-21dfec95112d/_result.png',
    width: 2048,
    height: 2048,
    dark: false,
    busy: false,
    mood: ['premium', 'elegant', 'editorial'],
  },
  {
    id: 'pro-17',
    name: 'Copper & Stone',
    category: 'architectural',
    tags: ['copper', 'stone', 'warm', 'earthy', 'luxury'],
    src: 'https://image.qwenlm.ai/generated-images/f924a1cb-2949-46a8-bec1-f040f5b7cbea/_result.png',
    width: 2048,
    height: 2048,
    dark: false,
    busy: false,
    mood: ['luxury', 'premium', 'elegant'],
  },
  {
    id: 'pro-18',
    name: 'Data Center Inspired',
    category: 'tech',
    tags: ['data', 'center', 'infrastructure', 'devops', 'cloud'],
    src: 'https://image.qwenlm.ai/generated-images/4edfbff7-1018-4069-8375-b9acc2edd514/_result.png',
    width: 2048,
    height: 2048,
    dark: true,
    busy: false,
    mood: ['developer', 'technical', 'corporate'],
  },
  {
    id: 'pro-19',
    name: 'Premium Neutral Bento',
    category: 'abstract',
    tags: ['bento', 'neutral', 'modern', 'cream', 'agency'],
    src: 'https://image.qwenlm.ai/generated-images/60753aa6-f407-46e6-866e-bceea65e486a/_result.png',
    width: 2048,
    height: 2048,
    dark: false,
    busy: false,
    mood: ['premium', 'modern', 'creative'],
  },
  {
    id: 'pro-20',
    name: 'Executive Glass & Stone',
    category: 'glass',
    tags: ['executive', 'glass', 'stone', 'premium', 'enterprise'],
    src: 'https://image.qwenlm.ai/generated-images/9d26aa20-298d-43f1-af41-c7b836f4d268/_result.png',
    width: 2048,
    height: 2048,
    dark: true,
    busy: false,
    mood: ['luxury', 'corporate', 'premium'],
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
  let pool = IMAGE_ASSETS.filter(a => a.src); // Only images with actual sources
  if (mood) {
    const moodFiltered = pool.filter(a => a.mood.includes(mood));
    if (moodFiltered.length > 0) pool = moodFiltered;
  }
  if (pool.length === 0) return null;
  return pool[Math.floor(Math.random() * pool.length)];
}

export function getCompatibleImage(composition: { dark: boolean; busy: boolean }, mood?: string): ImageAsset | null {
  let pool = IMAGE_ASSETS.filter(a => a.src);
  
  // Filter by compatibility
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

/* =========================================================================
   ICON LIBRARY
   Data-driven SVG icon registry. Add new icons by appending to ICONS array.
   Each icon is a single SVG path (24x24 viewBox, stroke-based).
   ========================================================================= */

export interface IconDef {
  id: string;
  name: string;
  category: string;
  tags: string[];
  d: string; // SVG path data
  style: 'outline' | 'filled';
}

export const ICONS: IconDef[] = [
  // Premium 3D-Style Icons (50 new additions)
  { id: 'glass-orb', name: 'Glass Orb', category: 'premium', tags: ['glass', 'orb', '3d', 'premium'], d: 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm-2 6a3 3 0 1 1 0 6 3 3 0 0 1 0-6z', style: 'filled' },
  { id: 'chrome-ring', name: 'Chrome Ring', category: 'premium', tags: ['chrome', 'ring', 'metallic', 'premium'], d: 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm0 4a6 6 0 1 1 0 12 6 6 0 0 1 0-12z', style: 'filled' },
  { id: 'soft-sphere', name: 'Soft Sphere', category: 'premium', tags: ['sphere', 'soft', '3d', 'premium'], d: 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z', style: 'filled' },
  { id: 'rounded-cube', name: 'Rounded Cube', category: 'premium', tags: ['cube', 'rounded', '3d', 'premium'], d: 'M4 4h16v16H4zM8 8h8v8H8z', style: 'filled' },
  { id: 'glass-cube', name: 'Glass Cube', category: 'premium', tags: ['glass', 'cube', '3d', 'premium'], d: 'M4 4h16v16H4zM6 6h12v12H6z', style: 'filled' },
  { id: 'floating-pill', name: 'Floating Pill', category: 'premium', tags: ['pill', 'floating', '3d', 'premium'], d: 'M8 4h8a4 4 0 0 1 0 8H8a4 4 0 0 1 0-8zM8 12h8a4 4 0 0 1 0 8H8a4 4 0 0 1 0-8z', style: 'filled' },
  { id: 'metallic-disc', name: 'Metallic Disc', category: 'premium', tags: ['metallic', 'disc', 'premium'], d: 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm0 4a6 6 0 1 1 0 12 6 6 0 0 1 0-12z', style: 'filled' },
  { id: 'torus-3d', name: '3D Torus', category: 'premium', tags: ['torus', '3d', 'premium'], d: 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm0 6a4 4 0 1 1 0 8 4 4 0 0 1 0-8z', style: 'filled' },
  { id: 'glass-torus', name: 'Glass Torus', category: 'premium', tags: ['glass', 'torus', 'premium'], d: 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm0 5a5 5 0 1 1 0 10 5 5 0 0 1 0-10z', style: 'filled' },
  { id: 'pyramid-3d', name: '3D Pyramid', category: 'premium', tags: ['pyramid', '3d', 'premium'], d: 'M12 2l10 18H2L12 2zm0 6l5 10H7l5-10z', style: 'filled' },
  { id: 'iso-cube', name: 'Isometric Cube', category: 'premium', tags: ['isometric', 'cube', '3d', 'premium'], d: 'M12 2l8 4v12l-8 4-8-4V6l8-4zm0 4l4 2v8l-4 2-4-2V8l4-2z', style: 'filled' },
  { id: 'wireframe-cube', name: 'Wireframe Cube', category: 'premium', tags: ['wireframe', 'cube', 'tech'], d: 'M4 4h16v16H4zM8 8h8v8H8zM4 4l4 4M20 4l-4 4M4 20l4-4M20 20l-4-4', style: 'outline' },
  { id: 'hex-frame', name: 'Hexagonal Frame', category: 'premium', tags: ['hexagon', 'frame', 'tech'], d: 'M12 2l8 5v10l-8 5-8-5V7l8-5zm0 4l4 2.5v5L12 16l-4-2.5v-5L12 6z', style: 'outline' },
  { id: 'spiral-form', name: 'Spiral Form', category: 'premium', tags: ['spiral', 'motion', 'premium'], d: 'M12 2a10 10 0 1 0 0 20c-5 0-9-4-9-9s4-9 9-9c2 0 4 1 5 3s1 4-1 5-4 1-5-1', style: 'outline' },
  { id: 'orbit-lines', name: 'Orbit Lines', category: 'premium', tags: ['orbit', 'lines', 'tech'], d: 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm0 4a6 6 0 1 1 0 12 6 6 0 0 1 0-12zm0 3a3 3 0 1 0 0 6 3 3 0 0 0 0-6z', style: 'outline' },
  { id: 'halo-ring', name: 'Halo Ring', category: 'premium', tags: ['halo', 'ring', 'premium'], d: 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm0 3a7 7 0 1 1 0 14 7 7 0 0 1 0-14z', style: 'filled' },
  { id: 'fluid-ribbon', name: 'Fluid Ribbon', category: 'premium', tags: ['ribbon', 'fluid', 'motion'], d: 'M4 12c2-4 4-4 6 0s4 4 6 0 4-4 6 0', style: 'outline' },
  { id: 'liquid-blob', name: 'Liquid Blob', category: 'premium', tags: ['blob', 'liquid', 'premium'], d: 'M12 2c4 0 8 3 8 7s-2 6-4 8-4 5-4 5-2-3-4-5-4-4-4-8 4-7 8-7z', style: 'filled' },
  { id: 'layered-wave', name: 'Layered Wave', category: 'premium', tags: ['wave', 'layered', 'premium'], d: 'M2 12c2-3 4-3 6 0s4 3 6 0 4-3 6 0M2 16c2-3 4-3 6 0s4 3 6 0 4-3 6 0M2 8c2-3 4-3 6 0s4 3 6 0 4-3 6 0', style: 'outline' },
  
  // Web Development (Enhanced)
  { id: 'html', name: 'HTML', category: 'web', tags: ['html', 'markup', 'web'], d: 'M3 3h18l-1.5 16L12 21l-7.5-2L3 3zm4 4l.5 6 4.5 1.5 4.5-1.5.5-6', style: 'outline' },
  { id: 'css', name: 'CSS', category: 'web', tags: ['css', 'style', 'design'], d: 'M3 3h18l-1.5 16L12 21l-7.5-2L3 3zm4 4h10l-.5 4H8l.5 4 3.5 1 3.5-1 .3-2', style: 'outline' },
  { id: 'js', name: 'JavaScript', category: 'web', tags: ['javascript', 'js', 'script'], d: 'M4 4h16v16H4zm10 12c0 2 1 3 3 3s3-1 3-2m-12-1c0 2 1 3 3 3s3-1 3-2', style: 'outline' },
  { id: 'react', name: 'React', category: 'web', tags: ['react', 'component', 'ui'], d: 'M12 12m-2 0a2 2 0 1 0 4 0a2 2 0 1 0-4 0M12 3c4 3 6 6 6 9s-2 6-6 9c-4-3-6-6-6-9s2-6 6-9zM3 8c3-4 6-6 9-6s6 2 9 6M3 16c3 4 6 6 9 6s6-2 9-6', style: 'outline' },
  { id: 'vue', name: 'Vue', category: 'web', tags: ['vue', 'component', 'framework'], d: 'M2 4h20L12 20 2 4zm4 0l6 10 6-10', style: 'outline' },
  { id: 'angular', name: 'Angular', category: 'web', tags: ['angular', 'framework', 'typescript'], d: 'M12 2l9 3-1.5 11L12 22l-7.5-6L3 5l9-3zm-4 12h8l-4-9-4 9z', style: 'outline' },
  { id: 'nextjs', name: 'Next.js', category: 'web', tags: ['next', 'nextjs', 'react', 'ssr'], d: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM8 8l8 8M10 8v8', style: 'outline' },
  { id: 'node', name: 'Node.js', category: 'web', tags: ['node', 'backend', 'server'], d: 'M12 2l9 5v10l-9 5-9-5V7l9-5zm0 10l9-5M12 12v10', style: 'outline' },
  { id: 'typescript', name: 'TypeScript', category: 'web', tags: ['typescript', 'ts', 'type'], d: 'M4 4h16v16H4zm6 6h4m-2 0v6m4-6h-2', style: 'outline' },
  { id: 'tailwind', name: 'Tailwind', category: 'web', tags: ['tailwind', 'css', 'utility'], d: 'M6 10c1-3 3-4 6-4s4 1 5 3c1-1 2-1 3-1 2 0 3 2 2 4-1 3-3 4-6 4s-4-1-5-3c-1 1-2 1-3 1-2 0-3-2-2-4z', style: 'outline' },

  // Programming
  { id: 'code', name: 'Code', category: 'dev', tags: ['code', 'programming', 'terminal'], d: 'M8 6l-6 6 6 6M16 6l6 6-6 6M14 4l-4 16', style: 'outline' },
  { id: 'terminal', name: 'Terminal', category: 'dev', tags: ['terminal', 'console', 'cli'], d: 'M4 4h16v16H4zM8 10l3 2-3 2M14 14h4', style: 'outline' },
  { id: 'git', name: 'Git', category: 'dev', tags: ['git', 'version', 'branch'], d: 'M12 3v6m0 6v6M9 9l3-3 3 3M9 15l3 3 3-3M6 12h12', style: 'outline' },
  { id: 'api', name: 'API', category: 'dev', tags: ['api', 'rest', 'endpoint'], d: 'M4 6h16M4 12h16M4 18h10M18 15l3 3-3 3', style: 'outline' },
  { id: 'database', name: 'Database', category: 'dev', tags: ['database', 'db', 'storage'], d: 'M4 6c0-2 4-3 8-3s8 1 8 3v12c0 2-4 3-8 3s-8-1-8-3V6zM4 6c0 2 4 3 8 3s8-1 8-3M4 12c0 2 4 3 8 3s8-1 8-3', style: 'outline' },
  { id: 'server', name: 'Server', category: 'dev', tags: ['server', 'hosting', 'cloud'], d: 'M4 4h16v6H4zM4 14h16v6H4zM8 7h.01M8 17h.01', style: 'outline' },
  { id: 'cloud', name: 'Cloud', category: 'dev', tags: ['cloud', 'aws', 'hosting'], d: 'M6 18a4 4 0 0 1 0-8 6 6 0 0 1 12 0 4 4 0 0 1 0 8H6z', style: 'outline' },
  { id: 'security', name: 'Security', category: 'dev', tags: ['security', 'lock', 'auth'], d: 'M12 2l8 4v6c0 5-3.5 9-8 10-4.5-1-8-5-8-10V6l8-4z', style: 'outline' },
  { id: 'function', name: 'Function', category: 'dev', tags: ['function', 'lambda', 'code'], d: 'M8 4c-2 0-3 1-3 3v10c0 2 1 3 3 3M16 4c2 0 3 1 3 3v10c0 2-1 3-3 3M10 10h4', style: 'outline' },
  { id: 'bug', name: 'Bug', category: 'dev', tags: ['bug', 'debug', 'error'], d: 'M8 2l4 3 4-3M6 8h12M6 12h12M6 16h12M8 8v12M16 8v12', style: 'outline' },

  // Mobile
  { id: 'phone', name: 'Smartphone', category: 'mobile', tags: ['phone', 'mobile', 'app'], d: 'M7 2h10a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2zM12 18h.01', style: 'outline' },
  { id: 'tablet', name: 'Tablet', category: 'mobile', tags: ['tablet', 'ipad', 'device'], d: 'M5 3h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2zM12 18h.01', style: 'outline' },
  { id: 'notification', name: 'Notification', category: 'mobile', tags: ['notification', 'bell', 'alert'], d: 'M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0', style: 'outline' },
  { id: 'camera', name: 'Camera', category: 'mobile', tags: ['camera', 'photo', 'capture'], d: 'M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2zM12 17a4 4 0 1 0 0-8 4 4 0 0 0 0 8z', style: 'outline' },
  { id: 'gps', name: 'GPS', category: 'mobile', tags: ['gps', 'location', 'map'], d: 'M12 2a8 8 0 0 0-8 8c0 6 8 12 8 12s8-6 8-12a8 8 0 0 0-8-8zM12 10a2 2 0 1 0 0-4 2 2 0 0 0 0 4z', style: 'outline' },

  // AI / ML
  { id: 'ai', name: 'AI', category: 'ai', tags: ['ai', 'artificial', 'intelligence'], d: 'M12 2a4 4 0 0 1 4 4v2a4 4 0 0 1-8 0V6a4 4 0 0 1 4-4zM8 14h8v4a4 4 0 0 1-8 0v-4zM6 10h12M9 22v-2M15 22v-2', style: 'outline' },
  { id: 'neural', name: 'Neural Network', category: 'ai', tags: ['neural', 'network', 'brain'], d: 'M6 6h.01M6 12h.01M6 18h.01M18 6h.01M18 12h.01M18 18h.01M12 9h.01M12 15h.01M6 6l6 3M6 12l6-3M6 12l6 3M6 18l6-3M18 6l-6 3M18 12l-6-3M18 12l-6 3M18 18l-6-3', style: 'outline' },
  { id: 'robot', name: 'Robot', category: 'ai', tags: ['robot', 'automation', 'bot'], d: 'M7 10h10v8a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2v-8zM10 14h.01M14 14h.01M12 6v4M9 2h6', style: 'outline' },
  { id: 'data', name: 'Data', category: 'ai', tags: ['data', 'dataset', 'ml'], d: 'M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z', style: 'outline' },
  { id: 'model', name: 'Model', category: 'ai', tags: ['model', 'training', 'prediction'], d: 'M12 2l9 5v10l-9 5-9-5V7l9-5zM12 12l9-5M12 12v10M12 12L3 7', style: 'outline' },

  // Cloud / DevOps
  { id: 'container', name: 'Container', category: 'cloud', tags: ['container', 'docker', 'kubernetes'], d: 'M4 8h16v10H4zM4 8l2-4h12l2 4M8 12v2M12 12v2M16 12v2', style: 'outline' },
  { id: 'deploy', name: 'Deployment', category: 'cloud', tags: ['deploy', 'ci', 'cd'], d: 'M12 19V5M5 12l7-7 7 7M4 21h16', style: 'outline' },
  { id: 'monitor', name: 'Monitoring', category: 'cloud', tags: ['monitor', 'metrics', 'dashboard'], d: 'M3 12h4l3-8 4 16 3-8h4', style: 'outline' },
  { id: 'network', name: 'Network', category: 'cloud', tags: ['network', 'connection', 'nodes'], d: 'M12 5a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM5 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM19 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM12 5v6M8 15l-1 2M16 15l1 2', style: 'outline' },

  // Design
  { id: 'pen', name: 'Pen', category: 'design', tags: ['pen', 'draw', 'tool'], d: 'M12 20h9M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z', style: 'outline' },
  { id: 'brush', name: 'Brush', category: 'design', tags: ['brush', 'paint', 'art'], d: 'M9.06 11.9l8.07-8.06a2.85 2.85 0 1 1 4.03 4.03l-8.06 8.08M7.07 14.94c-1.66 0-3 1.35-3 3.02 0 1.33-2.5 1.52-2 2.02 1.08 1.1 2.49 2.02 4 2.02 2.2 0 4-1.8 4-4.04a3.01 3.01 0 0 0-3-3.02z', style: 'outline' },
  { id: 'layers', name: 'Layers', category: 'design', tags: ['layers', 'stack', 'design'], d: 'M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5', style: 'outline' },
  { id: 'typography', name: 'Typography', category: 'design', tags: ['typography', 'font', 'text'], d: 'M6 6V4.5h12V6M12 4.5v15m-2.5 0h5', style: 'outline' },
  { id: 'color', name: 'Color', category: 'design', tags: ['color', 'palette', 'swatch'], d: 'M12 2a10 10 0 0 0 0 20 2 2 0 0 0 2-2v-1a2 2 0 0 1 2-2h1a2 2 0 0 0 2-2 10 10 0 0 0-7-15z', style: 'outline' },
  { id: 'image', name: 'Image', category: 'design', tags: ['image', 'photo', 'picture'], d: 'M3 5h18v14H3zM3 15l5-5 4 4 3-3 6 6M8.5 9.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z', style: 'outline' },

  // E-commerce
  { id: 'cart', name: 'Cart', category: 'ecom', tags: ['cart', 'shopping', 'ecommerce'], d: 'M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6M10 21a1 1 0 1 0 0-2 1 1 0 0 0 0 2zM21 21a1 1 0 1 0 0-2 1 1 0 0 0 0 2z', style: 'outline' },
  { id: 'store', name: 'Store', category: 'ecom', tags: ['store', 'shop', 'retail'], d: 'M3 9l1-5h16l1 5M3 9v11h18V9M3 9h18M9 20v-6h6v6', style: 'outline' },
  { id: 'payment', name: 'Payment', category: 'ecom', tags: ['payment', 'card', 'checkout'], d: 'M2 6h20v12H2zM2 10h20M6 14h4', style: 'outline' },
  { id: 'package', name: 'Package', category: 'ecom', tags: ['package', 'delivery', 'box'], d: 'M12 2l9 5v10l-9 5-9-5V7l9-5zM12 12l9-5M12 12v10M12 12L3 7', style: 'outline' },
  { id: 'delivery', name: 'Delivery', category: 'ecom', tags: ['delivery', 'truck', 'shipping'], d: 'M1 3h15v13H1zM16 8h4l3 3v5h-7M5.5 21a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5zM18.5 21a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z', style: 'outline' },

  // Business
  { id: 'chart', name: 'Chart', category: 'business', tags: ['chart', 'analytics', 'graph'], d: 'M3 3v18h18M7 14l4-4 4 4 5-5', style: 'outline' },
  { id: 'users', name: 'Users', category: 'business', tags: ['users', 'team', 'people'], d: 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75', style: 'outline' },
  { id: 'target', name: 'Target', category: 'business', tags: ['target', 'goal', 'objective'], d: 'M12 12m-10 0a10 10 0 1 0 20 0 10 10 0 1 0-20 0M12 12m-6 0a6 6 0 1 0 12 0 6 6 0 1 0-12 0M12 12m-2 0a2 2 0 1 0 4 0 2 2 0 1 0-4 0', style: 'outline' },
  { id: 'growth', name: 'Growth', category: 'business', tags: ['growth', 'trend', 'up'], d: 'M23 6l-9.5 9.5-5-5L1 18M17 6h6v6', style: 'outline' },
  { id: 'calendar', name: 'Calendar', category: 'business', tags: ['calendar', 'date', 'schedule'], d: 'M3 6h18v15H3zM3 10h18M8 2v4M16 2v4', style: 'outline' },
  { id: 'document', name: 'Document', category: 'business', tags: ['document', 'file', 'paper'], d: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zM14 2v6h6M16 13H8M16 17H8M10 9H8', style: 'outline' },

  // UI / UX
  { id: 'layout', name: 'Layout', category: 'ui', tags: ['layout', 'grid', 'structure'], d: 'M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z', style: 'outline' },
  { id: 'component', name: 'Component', category: 'ui', tags: ['component', 'ui', 'module'], d: 'M12 2l4 4-4 4-4-4 4-4zM12 14l4 4-4 4-4-4 4-4zM2 12l4-4 4 4-4 4-4-4zM14 12l4-4 4 4-4 4-4-4z', style: 'outline' },
  { id: 'responsive', name: 'Responsive', category: 'ui', tags: ['responsive', 'mobile', 'adaptive'], d: 'M2 4h12v10H2zM16 8h6v10h-6zM7 20h4', style: 'outline' },
  { id: 'prototype', name: 'Prototype', category: 'ui', tags: ['prototype', 'wireframe', 'mockup'], d: 'M3 3h18v14H3zM8 21h8M12 17v4M7 7h10M7 11h6', style: 'outline' },

  // Misc
  { id: 'lightning', name: 'Lightning', category: 'misc', tags: ['lightning', 'fast', 'performance'], d: 'M13 2L3 14h9l-1 8 10-12h-9l1-8z', style: 'outline' },
  { id: 'heart', name: 'Heart', category: 'misc', tags: ['heart', 'love', 'favorite'], d: 'M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z', style: 'outline' },
  { id: 'star', name: 'Star', category: 'misc', tags: ['star', 'rating', 'favorite'], d: 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z', style: 'outline' },
  { id: 'settings', name: 'Settings', category: 'misc', tags: ['settings', 'gear', 'config'], d: 'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z', style: 'outline' },
  { id: 'search', name: 'Search', category: 'misc', tags: ['search', 'find', 'magnify'], d: 'M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16zM21 21l-4.35-4.35', style: 'outline' },
  { id: 'link', name: 'Link', category: 'misc', tags: ['link', 'url', 'chain'], d: 'M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71', style: 'outline' },
  { id: 'mail', name: 'Mail', category: 'misc', tags: ['mail', 'email', 'message'], d: 'M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2zM22 6l-10 7L2 6', style: 'outline' },
  { id: 'globe', name: 'Globe', category: 'misc', tags: ['globe', 'world', 'web'], d: 'M12 22c5.52 0 10-4.48 10-10S17.52 2 12 2 2 6.48 2 12s4.48 10 10 10zM2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z', style: 'outline' },
  { id: 'lock', name: 'Lock', category: 'misc', tags: ['lock', 'secure', 'private'], d: 'M5 11h14v10H5zM7 11V7a5 5 0 0 1 10 0v4', style: 'outline' },
  { id: 'key', name: 'Key', category: 'misc', tags: ['key', 'auth', 'access'], d: 'M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4', style: 'outline' },
  { id: 'shield', name: 'Shield', category: 'misc', tags: ['shield', 'protect', 'secure'], d: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z', style: 'outline' },
  { id: 'zap', name: 'Zap', category: 'misc', tags: ['zap', 'energy', 'power'], d: 'M13 2L3 14h9l-1 8 10-12h-9l1-8z', style: 'outline' },
  { id: 'sun', name: 'Sun', category: 'misc', tags: ['sun', 'light', 'day'], d: 'M12 17a5 5 0 1 0 0-10 5 5 0 0 0 0 10zM12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42', style: 'outline' },
  { id: 'moon', name: 'Moon', category: 'misc', tags: ['moon', 'dark', 'night'], d: 'M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z', style: 'outline' },
  { id: 'check', name: 'Check', category: 'misc', tags: ['check', 'done', 'success'], d: 'M20 6L9 17l-5-5', style: 'outline' },
  { id: 'x', name: 'Close', category: 'misc', tags: ['close', 'x', 'cancel'], d: 'M18 6L6 18M6 6l12 12', style: 'outline' },
  { id: 'plus', name: 'Plus', category: 'misc', tags: ['plus', 'add', 'new'], d: 'M12 5v14M5 12h14', style: 'outline' },
  { id: 'minus', name: 'Minus', category: 'misc', tags: ['minus', 'remove', 'subtract'], d: 'M5 12h14', style: 'outline' },
  { id: 'arrow-up', name: 'Arrow Up', category: 'misc', tags: ['arrow', 'up', 'top'], d: 'M12 19V5M5 12l7-7 7 7', style: 'outline' },
  { id: 'arrow-down', name: 'Arrow Down', category: 'misc', tags: ['arrow', 'down', 'bottom'], d: 'M12 5v14M19 12l-7 7-7-7', style: 'outline' },
  { id: 'arrow-left', name: 'Arrow Left', category: 'misc', tags: ['arrow', 'left', 'back'], d: 'M19 12H5M12 19l-7-7 7-7', style: 'outline' },
  { id: 'arrow-right', name: 'Arrow Right', category: 'misc', tags: ['arrow', 'right', 'forward'], d: 'M5 12h14M12 5l7 7-7 7', style: 'outline' },
  { id: 'home', name: 'Home', category: 'misc', tags: ['home', 'house', 'main'], d: 'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z', style: 'outline' },
  { id: 'user', name: 'User', category: 'misc', tags: ['user', 'person', 'profile'], d: 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z', style: 'outline' },
  { id: 'menu', name: 'Menu', category: 'misc', tags: ['menu', 'hamburger', 'nav'], d: 'M3 12h18M3 6h18M3 18h18', style: 'outline' },
  { id: 'filter', name: 'Filter', category: 'misc', tags: ['filter', 'sort', 'funnel'], d: 'M22 3H2l8 9.46V19l4 2v-8.54L22 3z', style: 'outline' },
  { id: 'download', name: 'Download', category: 'misc', tags: ['download', 'save', 'export'], d: 'M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3', style: 'outline' },
  { id: 'upload', name: 'Upload', category: 'misc', tags: ['upload', 'import', 'send'], d: 'M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12', style: 'outline' },
  { id: 'trash', name: 'Trash', category: 'misc', tags: ['trash', 'delete', 'remove'], d: 'M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2', style: 'outline' },
  { id: 'edit', name: 'Edit', category: 'misc', tags: ['edit', 'pencil', 'modify'], d: 'M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z', style: 'outline' },
  { id: 'copy', name: 'Copy', category: 'misc', tags: ['copy', 'duplicate', 'clipboard'], d: 'M20 9h-9a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h9a2 2 0 0 0 2-2v-9a2 2 0 0 0-2-2zM5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1', style: 'outline' },
  { id: 'share', name: 'Share', category: 'misc', tags: ['share', 'send', 'social'], d: 'M18 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM6 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM18 22a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM8.59 13.51l6.83 3.98M15.41 6.51l-6.82 3.98', style: 'outline' },
  { id: 'bookmark', name: 'Bookmark', category: 'misc', tags: ['bookmark', 'save', 'favorite'], d: 'M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z', style: 'outline' },
  { id: 'bell', name: 'Bell', category: 'misc', tags: ['bell', 'notification', 'alert'], d: 'M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0', style: 'outline' },
  { id: 'folder', name: 'Folder', category: 'misc', tags: ['folder', 'directory', 'file'], d: 'M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z', style: 'outline' },
  { id: 'file', name: 'File', category: 'misc', tags: ['file', 'document', 'page'], d: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zM14 2v6h6', style: 'outline' },
  { id: 'refresh', name: 'Refresh', category: 'misc', tags: ['refresh', 'reload', 'sync'], d: 'M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15', style: 'outline' },
  { id: 'eye', name: 'Eye', category: 'misc', tags: ['eye', 'view', 'visible'], d: 'M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8zM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z', style: 'outline' },
  { id: 'eye-off', name: 'Eye Off', category: 'misc', tags: ['eye', 'hidden', 'invisible'], d: 'M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24M1 1l22 22', style: 'outline' },
  { id: 'info', name: 'Info', category: 'misc', tags: ['info', 'information', 'about'], d: 'M12 22c5.52 0 10-4.48 10-10S17.52 2 12 2 2 6.48 2 12s4.48 10 10 10zM12 16v-4M12 8h.01', style: 'outline' },
  { id: 'alert', name: 'Alert', category: 'misc', tags: ['alert', 'warning', 'caution'], d: 'M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0zM12 9v4M12 17h.01', style: 'outline' },
];

export const ICON_CATEGORIES = [
  { id: 'all', label: 'All', count: ICONS.length },
  { id: 'web', label: 'Web Dev', count: ICONS.filter(i => i.category === 'web').length },
  { id: 'dev', label: 'Programming', count: ICONS.filter(i => i.category === 'dev').length },
  { id: 'mobile', label: 'Mobile', count: ICONS.filter(i => i.category === 'mobile').length },
  { id: 'ai', label: 'AI / ML', count: ICONS.filter(i => i.category === 'ai').length },
  { id: 'cloud', label: 'Cloud', count: ICONS.filter(i => i.category === 'cloud').length },
  { id: 'design', label: 'Design', count: ICONS.filter(i => i.category === 'design').length },
  { id: 'ecom', label: 'E-commerce', count: ICONS.filter(i => i.category === 'ecom').length },
  { id: 'business', label: 'Business', count: ICONS.filter(i => i.category === 'business').length },
  { id: 'ui', label: 'UI / UX', count: ICONS.filter(i => i.category === 'ui').length },
  { id: 'misc', label: 'General', count: ICONS.filter(i => i.category === 'misc').length },
];

export function findIcon(id: string): IconDef | undefined {
  return ICONS.find(i => i.id === id);
}

export function searchIcons(query: string, category?: string): IconDef[] {
  let list = ICONS;
  if (category && category !== 'all') {
    list = list.filter(i => i.category === category);
  }
  if (!query.trim()) return list;
  
  const q = query.toLowerCase();
  return list.filter(i =>
    i.name.toLowerCase().includes(q) ||
    i.tags.some(t => t.includes(q)) ||
    i.category.includes(q)
  );
}

export function getIconsForProjectType(type: string): IconDef[] {
  const t = type.toLowerCase();
  if (t.includes('ecom') || t.includes('shop')) {
    return ICONS.filter(i => i.category === 'ecom');
  }
  if (t.includes('ai') || t.includes('ml')) {
    return ICONS.filter(i => i.category === 'ai');
  }
  if (t.includes('mobile') || t.includes('app')) {
    return ICONS.filter(i => i.category === 'mobile');
  }
  if (t.includes('dashboard') || t.includes('analytics')) {
    return ICONS.filter(i => i.category === 'business' || i.category === 'ui');
  }
  if (t.includes('saas') || t.includes('web')) {
    return ICONS.filter(i => i.category === 'web' || i.category === 'cloud');
  }
  return ICONS.filter(i => i.category === 'web' || i.category === 'dev' || i.category === 'ui');
}

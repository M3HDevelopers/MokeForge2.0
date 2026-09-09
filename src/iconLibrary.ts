export interface IconDef {
  id: string;
  name: string;
  category: string;
  tags: string[];
  d: string;
  style: 'outline' | 'filled';
}

export const ICONS: IconDef[] = [
  { id: 'react', name: 'React', category: 'web', tags: ['react', 'component', 'ui'], d: 'M12 12m-2 0a2 2 0 1 0 4 0a2 2 0 1 0-4 0M12 3c4 3 6 6 6 9s-2 6-6 9c-4-3-6-6-6-9s2-6 6-9zM3 8c3-4 6-6 9-6s6 2 9 6M3 16c3 4 6 6 9 6s6-2 9-6', style: 'outline' },
  { id: 'vue', name: 'Vue', category: 'web', tags: ['vue', 'component', 'framework'], d: 'M2 4h20L12 20 2 4zm4 0l6 10 6-10', style: 'outline' },
  { id: 'angular', name: 'Angular', category: 'web', tags: ['angular', 'framework', 'typescript'], d: 'M12 2l9 3-1.5 11L12 22l-7.5-6L3 5l9-3zm-4 12h8l-4-9-4 9z', style: 'outline' },
  { id: 'nextjs', name: 'Next.js', category: 'web', tags: ['next', 'nextjs', 'react', 'ssr'], d: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM8 8l8 8M10 8v8', style: 'outline' },
  { id: 'node', name: 'Node.js', category: 'web', tags: ['node', 'backend', 'server'], d: 'M12 2l9 5v10l-9 5-9-5V7l9-5zm0 10l9-5M12 12v10', style: 'outline' },
  { id: 'typescript', name: 'TypeScript', category: 'web', tags: ['typescript', 'ts', 'type'], d: 'M4 4h16v16H4zm6 6h4m-2 0v6m4-6h-2', style: 'outline' },
  { id: 'html', name: 'HTML', category: 'web', tags: ['html', 'markup', 'web'], d: 'M3 3h18l-1.5 16L12 21l-7.5-2L3 3zm4 4l.5 6 4.5 1.5 4.5-1.5.5-6', style: 'outline' },
  { id: 'css', name: 'CSS', category: 'web', tags: ['css', 'style', 'design'], d: 'M3 3h18l-1.5 16L12 21l-7.5-2L3 3zm4 4h10l-.5 4H8l.5 4 3.5 1 3.5-1 .3-2', style: 'outline' },
  { id: 'js', name: 'JavaScript', category: 'web', tags: ['javascript', 'js', 'script'], d: 'M4 4h16v16H4zm10 12c0 2 1 3 3 3s3-1 3-2m-12-1c0 2 1 3 3 3s3-1 3-2', style: 'outline' },
  { id: 'tailwind', name: 'Tailwind', category: 'web', tags: ['tailwind', 'css', 'utility'], d: 'M6 10c1-3 3-4 6-4s4 1 5 3c1-1 2-1 3-1 2 0 3 2 2 4-1 3-3 4-6 4s-4-1-5-3c-1 1-2 1-3 1-2 0-3-2-2-4z', style: 'outline' },
  { id: 'code', name: 'Code', category: 'dev', tags: ['code', 'programming', 'terminal'], d: 'M8 6l-6 6 6 6M16 6l6 6-6 6M14 4l-4 16', style: 'outline' },
  { id: 'terminal', name: 'Terminal', category: 'dev', tags: ['terminal', 'console', 'cli'], d: 'M4 4h16v16H4zM8 10l3 2-3 2M14 14h4', style: 'outline' },
  { id: 'database', name: 'Database', category: 'dev', tags: ['database', 'db', 'storage'], d: 'M4 6c0-2 4-3 8-3s8 1 8 3v12c0 2-4 3-8 3s-8-1-8-3V6zM4 6c0 2 4 3 8 3s8-1 8-3M4 12c0 2 4 3 8 3s8-1 8-3', style: 'outline' },
  { id: 'cloud', name: 'Cloud', category: 'dev', tags: ['cloud', 'aws', 'hosting'], d: 'M6 18a4 4 0 0 1 0-8 6 6 0 0 1 12 0 4 4 0 0 1 0 8H6z', style: 'outline' },
  { id: 'chart', name: 'Chart', category: 'business', tags: ['chart', 'analytics', 'graph'], d: 'M3 3v18h18M7 14l4-4 4 4 5-5', style: 'outline' },
  { id: 'users', name: 'Users', category: 'business', tags: ['users', 'team', 'people'], d: 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z', style: 'outline' },
  { id: 'settings', name: 'Settings', category: 'misc', tags: ['settings', 'gear', 'config'], d: 'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z', style: 'outline' },
  { id: 'search', name: 'Search', category: 'misc', tags: ['search', 'find', 'magnify'], d: 'M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16zM21 21l-4.35-4.35', style: 'outline' },
  { id: 'heart', name: 'Heart', category: 'misc', tags: ['heart', 'love', 'favorite'], d: 'M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z', style: 'outline' },
  { id: 'star', name: 'Star', category: 'misc', tags: ['star', 'rating', 'favorite'], d: 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z', style: 'outline' },
];

export const ICON_CATEGORIES = [
  { id: 'all', label: 'All', count: ICONS.length },
  { id: 'web', label: 'Web Dev', count: ICONS.filter(i => i.category === 'web').length },
  { id: 'dev', label: 'Programming', count: ICONS.filter(i => i.category === 'dev').length },
  { id: 'business', label: 'Business', count: ICONS.filter(i => i.category === 'business').length },
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

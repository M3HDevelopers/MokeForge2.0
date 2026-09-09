import type { Asset } from './types';
import { uid } from './templates';
import { urlToAsset } from './store';

function paintDashboard(): string {
  const W = 1600, H = 1000;
  const c = document.createElement('canvas'); c.width = W; c.height = H;
  const x = c.getContext('2d')!;
  x.fillStyle = '#101318'; x.fillRect(0, 0, W, H);
  x.fillStyle = '#151a21'; x.fillRect(0, 0, 250, H);
  x.fillStyle = '#ff6b3d'; x.beginPath(); x.arc(42, 48, 12, 0, Math.PI * 2); x.fill();
  x.fillStyle = '#e9e7e1'; x.font = '600 22px "Space Grotesk"'; x.fillText('Nova', 66, 56);
  x.fillStyle = '#e9e7e1'; x.font = '700 34px "Space Grotesk"'; x.fillText('Dashboard', 300, 78);
  return c.toDataURL('image/jpeg', 0.88);
}

function paintMobile(): string {
  const W = 750, H = 1500;
  const c = document.createElement('canvas'); c.width = W; c.height = H;
  const x = c.getContext('2d')!;
  x.fillStyle = '#0f1115'; x.fillRect(0, 0, W, H);
  x.fillStyle = '#e9e7e1'; x.font = '600 30px "Space Grotesk"'; x.fillText('Mobile App', 44, 170);
  return c.toDataURL('image/jpeg', 0.88);
}

function generatedAssets(): Asset[] {
  const d = paintDashboard();
  const m = paintMobile();
  return [
    { id: uid(), name: 'analytics-dashboard', dataUrl: d, w: 1600, h: 1000 },
    { id: uid(), name: 'finance-app', dataUrl: m, w: 750, h: 1500 },
  ];
}

export async function loadDemoAssets(): Promise<Asset[]> {
  return generatedAssets();
}

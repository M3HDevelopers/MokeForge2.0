import type { Asset } from './types';
import { uid } from './templates';
import { urlToAsset } from './store';

/* Code-painted sample UIs — used when the bundled demo shots can't be fetched. */

function paintDashboard(): string {
  const W = 1600, H = 1000;
  const c = document.createElement('canvas'); c.width = W; c.height = H;
  const x = c.getContext('2d')!;
  x.fillStyle = '#101318'; x.fillRect(0, 0, W, H);
  // sidebar
  x.fillStyle = '#151a21'; x.fillRect(0, 0, 250, H);
  x.fillStyle = '#ff6b3d'; x.beginPath(); x.arc(42, 48, 12, 0, Math.PI * 2); x.fill();
  x.fillStyle = '#e9e7e1'; x.font = '600 22px "Space Grotesk"'; x.fillText('Nova', 66, 56);
  const nav = ['Overview', 'Analytics', 'Customers', 'Revenue', 'Payouts', 'Settings'];
  nav.forEach((n, i) => {
    const y = 130 + i * 58;
    if (i === 0) { x.fillStyle = '#232b36'; rr(x, 20, y - 26, 210, 46, 10); x.fill(); x.fillStyle = '#45d6c8'; }
    else x.fillStyle = '#7c8592';
    x.font = '500 17px "IBM Plex Sans"'; x.fillText(n, 56, y + 3);
    x.fillStyle = i === 0 ? '#45d6c8' : '#3a424e'; x.beginPath(); x.arc(36, y - 3, 4, 0, Math.PI * 2); x.fill();
  });
  // header
  x.fillStyle = '#e9e7e1'; x.font = '700 34px "Space Grotesk"'; x.fillText('Good morning, Aarav', 300, 78);
  x.fillStyle = '#7c8592'; x.font = '400 17px "IBM Plex Sans"'; x.fillText("Here's what's happening with your store today.", 300, 112);
  x.fillStyle = '#1d232c'; rr(x, 1330, 46, 220, 48, 10); x.fill();
  x.fillStyle = '#ff6b3d'; x.font = '600 16px "IBM Plex Sans"'; x.fillText('+ New report', 1368, 76);
  // stat cards
  const stats = [['Revenue', '₹4.82L', '+12.4%'], ['Orders', '1,284', '+8.1%'], ['Visitors', '38.2K', '+22.6%'], ['Refunds', '0.9%', '-1.2%']];
  stats.forEach((s, i) => {
    const cx = 300 + i * 322;
    x.fillStyle = '#171d25'; rr(x, cx, 160, 298, 130, 14); x.fill();
    x.fillStyle = '#7c8592'; x.font = '500 15px "IBM Plex Sans"'; x.fillText(s[0], cx + 26, 200);
    x.fillStyle = '#f2f0ea'; x.font = '700 34px "Space Grotesk"'; x.fillText(s[1], cx + 26, 248);
    x.fillStyle = s[2].startsWith('-') ? '#ff5d5d' : '#45d6c8'; x.font = '600 15px "IBM Plex Sans"'; x.fillText(s[2], cx + 26, 274);
  });
  // line chart card
  x.fillStyle = '#171d25'; rr(x, 300, 320, 940, 380, 14); x.fill();
  x.fillStyle = '#f2f0ea'; x.font = '600 21px "Space Grotesk"'; x.fillText('Revenue over time', 330, 366);
  x.fillStyle = '#3a424e'; x.font = '500 14px "JetBrains Mono"'; x.fillText('LAST 30 DAYS', 1100, 364);
  const pts = [620, 590, 600, 560, 575, 530, 545, 500, 520, 470, 490, 450, 465, 430];
  x.beginPath();
  pts.forEach((p, i) => { const px = 340 + (i / (pts.length - 1)) * 860; i === 0 ? x.moveTo(px, p) : x.lineTo(px, p); });
  x.strokeStyle = '#45d6c8'; x.lineWidth = 3.5; x.lineJoin = 'round'; x.stroke();
  x.lineTo(1200, 660); x.lineTo(340, 660); x.closePath();
  const g = x.createLinearGradient(0, 420, 0, 660); g.addColorStop(0, 'rgba(69,214,200,.28)'); g.addColorStop(1, 'rgba(69,214,200,0)');
  x.fillStyle = g; x.fill();
  x.strokeStyle = '#ff6b3d'; x.setLineDash([7, 7]); x.beginPath();
  pts.forEach((p, i) => { const px = 340 + (i / (pts.length - 1)) * 860; const py = p + 60; i === 0 ? x.moveTo(px, py) : x.lineTo(px, py); });
  x.stroke(); x.setLineDash([]);
  // orders card
  x.fillStyle = '#171d25'; rr(x, 300, 730, 940, 230, 14); x.fill();
  x.fillStyle = '#f2f0ea'; x.font = '600 21px "Space Grotesk"'; x.fillText('Recent orders', 330, 776);
  const rows = [['#8412 — Ananya S.', '₹2,450', 'Paid'], ['#8411 — Rohan M.', '₹1,180', 'Paid'], ['#8410 — Kavya P.', '₹3,920', 'Pending'], ['#8409 — Dev T.', '₹860', 'Paid']];
  rows.forEach((r, i) => {
    const y = 816 + i * 36;
    x.fillStyle = '#c4cad4'; x.font = '400 15px "IBM Plex Sans"'; x.fillText(r[0], 330, y);
    x.fillText(r[1], 780, y);
    x.fillStyle = r[2] === 'Paid' ? '#45d6c8' : '#ffd166'; x.fillText(r[2], 1120, y);
  });
  // right rail
  x.fillStyle = '#171d25'; rr(x, 1270, 320, 280, 380, 14); x.fill();
  x.fillStyle = '#f2f0ea'; x.font = '600 20px "Space Grotesk"'; x.fillText('Top products', 1296, 364);
  const bars = [0.9, 0.72, 0.6, 0.44, 0.3];
  bars.forEach((b, i) => {
    const y = 400 + i * 56;
    x.fillStyle = '#c4cad4'; x.font = '400 14px "IBM Plex Sans"'; x.fillText(['Aurora Lamp', 'Desk Mat', 'Keycap Set', 'Monitor Arm', 'USB-C Hub'][i], 1296, y);
    x.fillStyle = '#232b36'; rr(x, 1296, y + 10, 228, 8, 4); x.fill();
    x.fillStyle = i === 0 ? '#ff6b3d' : '#45d6c8'; rr(x, 1296, y + 10, 228 * b, 8, 4); x.fill();
  });
  x.fillStyle = '#171d25'; rr(x, 1270, 730, 280, 230, 14); x.fill();
  x.fillStyle = '#f2f0ea'; x.font = '600 20px "Space Grotesk"'; x.fillText('Goals', 1296, 776);
  x.beginPath(); x.arc(1410, 870, 62, 0, Math.PI * 2); x.strokeStyle = '#232b36'; x.lineWidth = 14; x.stroke();
  x.beginPath(); x.arc(1410, 870, 62, -Math.PI / 2, -Math.PI / 2 + Math.PI * 1.44); x.strokeStyle = '#ff6b3d'; x.stroke();
  x.fillStyle = '#f2f0ea'; x.font = '700 26px "Space Grotesk"'; x.textAlign = 'center'; x.fillText('72%', 1410, 879); x.textAlign = 'left';
  return c.toDataURL('image/jpeg', 0.88);
}

function paintMobile(): string {
  const W = 750, H = 1500;
  const c = document.createElement('canvas'); c.width = W; c.height = H;
  const x = c.getContext('2d')!;
  x.fillStyle = '#0f1115'; x.fillRect(0, 0, W, H);
  x.fillStyle = '#7c8592'; x.font = '500 26px "IBM Plex Sans"'; x.fillText('9:41', 44, 78);
  x.fillStyle = '#e9e7e1'; x.font = '600 30px "Space Grotesk"'; x.fillText('Hey, Mira', 44, 170);
  x.fillStyle = '#7c8592'; x.font = '400 24px "IBM Plex Sans"'; x.fillText('Your money at a glance', 44, 212);
  // balance card
  const g = x.createLinearGradient(44, 260, 706, 560); g.addColorStop(0, '#2a1c12'); g.addColorStop(1, '#3d2417');
  x.fillStyle = g; rr(x, 44, 260, 662, 300, 34); x.fill();
  x.fillStyle = '#c9a58c'; x.font = '500 24px "IBM Plex Sans"'; x.fillText('Total balance', 92, 330);
  x.fillStyle = '#f7ede2'; x.font = '700 72px "Space Grotesk"'; x.fillText('₹1,24,500', 92, 420);
  x.fillStyle = '#45d6c8'; x.font = '600 26px "IBM Plex Sans"'; x.fillText('+ ₹8,200 this month', 92, 480);
  x.fillStyle = '#ff6b3d'; rr(x, 540, 440, 120, 70, 22); x.fill();
  x.fillStyle = '#1a0e08'; x.font = '700 40px "Space Grotesk"'; x.textAlign = 'center'; x.fillText('↑', 600, 490); x.textAlign = 'left';
  // actions
  ['Send', 'Request', 'Top up', 'More'].forEach((a, i) => {
    const cx = 120 + i * 170;
    x.fillStyle = '#1a1e25'; x.beginPath(); x.arc(cx, 660, 52, 0, Math.PI * 2); x.fill();
    x.fillStyle = i === 0 ? '#ff6b3d' : '#45d6c8'; x.beginPath(); x.arc(cx, 648, 8, 0, Math.PI * 2); x.fill();
    x.fillStyle = '#c4cad4'; x.font = '500 24px "IBM Plex Sans"'; x.textAlign = 'center'; x.fillText(a, cx, 752); x.textAlign = 'left';
  });
  // donut card
  x.fillStyle = '#171b21'; rr(x, 44, 810, 662, 300, 30); x.fill();
  x.fillStyle = '#f2f0ea'; x.font = '600 30px "Space Grotesk"'; x.fillText('Spending', 92, 880);
  x.beginPath(); x.arc(180, 1000, 70, 0, Math.PI * 2); x.strokeStyle = '#242a33'; x.lineWidth = 26; x.stroke();
  const seg = [['#ff6b3d', 0.42], ['#45d6c8', 0.3], ['#ffd166', 0.18]] as const;
  let a0 = -Math.PI / 2;
  seg.forEach(([col, f]) => { x.beginPath(); x.arc(180, 1000, 70, a0, a0 + Math.PI * 2 * f); x.strokeStyle = col; x.stroke(); a0 += Math.PI * 2 * f; });
  const legend = [['Food', '₹6,400', '#ff6b3d'], ['Travel', '₹4,550', '#45d6c8'], ['Bills', '₹2,730', '#ffd166']];
  legend.forEach((l, i) => {
    const y = 930 + i * 66;
    x.fillStyle = l[2] as string; x.beginPath(); x.arc(330, y - 8, 9, 0, Math.PI * 2); x.fill();
    x.fillStyle = '#c4cad4'; x.font = '500 26px "IBM Plex Sans"'; x.fillText(l[0], 360, y);
    x.fillText(l[1], 560, y);
  });
  // transactions
  x.fillStyle = '#f2f0ea'; x.font = '600 30px "Space Grotesk"'; x.fillText('Recent activity', 44, 1190);
  const tx = [['Zomato', '− ₹480', 'Food'], ['Uber', '− ₹220', 'Travel'], ['Salary', '+ ₹52,000', 'Income'], ['Electricity', '− ₹1,140', 'Bills']];
  tx.forEach((t, i) => {
    const y = 1250 + i * 62;
    x.fillStyle = '#1a1e25'; x.beginPath(); x.arc(76, y - 8, 24, 0, Math.PI * 2); x.fill();
    x.fillStyle = '#c4cad4'; x.font = '500 26px "IBM Plex Sans"'; x.fillText(t[0], 120, y);
    x.fillStyle = '#7c8592'; x.font = '400 22px "IBM Plex Sans"'; x.fillText(t[2], 380, y);
    x.fillStyle = t[1].startsWith('+') ? '#45d6c8' : '#e9e7e1'; x.font = '600 26px "IBM Plex Sans"'; x.textAlign = 'right'; x.fillText(t[1], 706, y); x.textAlign = 'left';
  });
  return c.toDataURL('image/jpeg', 0.88);
}

function rr(x: CanvasRenderingContext2D, px: number, py: number, w: number, h: number, r: number) {
  x.beginPath();
  x.moveTo(px + r, py);
  x.arcTo(px + w, py, px + w, py + h, r);
  x.arcTo(px + w, py + h, px, py + h, r);
  x.arcTo(px, py + h, px, py, r);
  x.arcTo(px, py, px + w, py, r);
  x.closePath();
}

function generatedAssets(): Asset[] {
  const d = paintDashboard();
  const m = paintMobile();
  return [
    { id: uid(), name: 'analytics-dashboard', dataUrl: d, w: 1600, h: 1000 },
    { id: uid(), name: 'finance-app', dataUrl: m, w: 750, h: 1500 },
  ];
}

const REMOTE = [
  { url: 'https://image.qwenlm.ai/generated-images/3a3151f9-e7bc-4864-aa2d-3df75e7ff2de/_result.png', name: 'analytics-dashboard' },
  { url: 'https://image.qwenlm.ai/generated-images/89770c2a-6c19-4182-9bae-2d732f5188b3/_result.png', name: 'finance-app' },
];

export async function loadDemoAssets(): Promise<Asset[]> {
  try {
    const assets = await Promise.all(REMOTE.map(r => urlToAsset(r.url, r.name)));
    if (assets.every(a => a.dataUrl.length > 1000)) return assets;
    throw new Error('empty');
  } catch {
    return generatedAssets();
  }
}

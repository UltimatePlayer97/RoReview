import { FALLBACK_AVATAR } from './constants';
import { state } from './state';

export function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

export function bgLuminance(el: Element): number | null {
  const m = getComputedStyle(el).backgroundColor.match(/rgba?\(([^)]+)\)/);
  if (!m) return null;
  const parts = m[1].split(',').map(p => p.trim());
  const r = Number(parts[0]);
  const g = Number(parts[1]);
  const b = Number(parts[2]);
  const a = parts[3] === undefined ? 1 : Number(parts[3]);
  if (isNaN(r) || isNaN(g) || isNaN(b) || a < 0.1) return null;
  return 0.299 * r + 0.587 * g + 0.114 * b;
}

export function isPageDark(): boolean {
  const l = bgLuminance(document.body) ?? bgLuminance(document.documentElement);
  return l !== null && l < 110;
}

export async function fetchUsername(userId: number): Promise<string> {
  try {
    const res = await fetch(`https://users.roblox.com/v1/users/${userId}`);
    if (res.ok) {
      const data = await res.json();
      return data.name || data.displayName || 'User';
    }
  } catch (_) {}
  return 'User';
}

export async function fetchGameName(gameId: number): Promise<string> {
  try {
    const titleEl = document.querySelector('h1') || document.querySelector('.game-title') || document.querySelector('[class*=\"game-name\"]');
    if (titleEl && titleEl.textContent?.trim()) return titleEl.textContent.trim();
    if (document.title && !document.title.startsWith('Roblox')) return document.title.replace(' - Roblox', '').trim() || 'Game';
  } catch (_) {}

  try {
    const res = await fetch(`https://games.roblox.com/v1/games?universeIds=${gameId}`);
    if (res.ok) {
      const data = await res.json();
      if (data.data?.length > 0 && data.data[0].name) return data.data[0].name;
    }
  } catch (_) {}

  return 'Game';
}

export async function ensureAvatars(ids: number[]): Promise<void> {
  const S = state;
  const missing = [...new Set(ids)].filter(id => !(id in S.avatarCache));
  if (!missing.length) return;

  for (let i = 0; i < missing.length; i += 100) {
    const chunk = missing.slice(i, i + 100);
    try {
      const res = await fetch(`https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${chunk.join(',')}&size=150x150&format=Png&isCircular=false`);
      if (res.ok) {
        const data = await res.json();
        (data.data || []).forEach((item: any) => {
          if (item.state === 'Completed' && item.imageUrl) S.avatarCache[item.targetId] = item.imageUrl;
        });
      }
    } catch (e) {
      // swallow
      console.warn('Avatar fetch failed:', e);
    }
  }

  missing.forEach(id => {
    if (!(id in S.avatarCache)) S.avatarCache[id] = FALLBACK_AVATAR;
  });
}

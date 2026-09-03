import { state } from './state';
import { API_BASE } from './constants';

export async function apiCall(url: string, options: RequestInit = {}): Promise<any> {
  const S = state;
  if (S.currentUser?.session_token) {
    options.headers = {
      ...(options.headers as Record<string, string>),
      Authorization: `Bearer ${S.currentUser.session_token}`,
    };
  }

  const res = await fetch(url, options);
  const data = await res.json();

  if (data.error && (data.reason === 'Validation Required' || data.reason === 'Invalid JWT')) {
    // emulate previous behavior: logout and show auth UI handled elsewhere
    throw new Error('Session expired');
  }

  if (data.error) throw new Error(data.reason || 'Unknown API error');
  return data;
}

export function reviewUrl(targetId: string | null, targetIsGame: boolean, reviewId: string | null = null, suffix = ''): string {
  const gameQuery = targetIsGame ? '?game=true' : '';
  let url = `${API_BASE}/api/roblox/reviews/${targetId}`;
  if (reviewId !== null) url += `/${reviewId}`;
  if (suffix) url += `/${suffix}`;
  return `${url}${gameQuery}`;
}

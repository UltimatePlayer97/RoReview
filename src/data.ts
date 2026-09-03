import { apiCall } from './api';
import { state } from './state';
import { updateSummary, renderAuthState, renderPage, renderBlockedStrip } from './ui';

export async function loadReviews(): Promise<void> {
  const S = state;
  try {
    const gameQuery = S.targetIsGame ? '?game=true' : '';
    const data = await apiCall(`${S.targetId ? `https://hermivore.cat/api/roblox/reviews/${S.targetId}${gameQuery}` : ''}`);

    S.allReviews = data.reviews || [];
    S.profileRating = (data as any).profile_rating || { up: [], down: [] };
    S.blockedUsers = data.blocked || [];
    S.viewerBlocked = !!data.viewer_blocked;

    updateSummary();
    renderAuthState();
    await renderPage(1);
    renderBlockedStrip();
  } catch (e) {
    console.error(e);
  }
}

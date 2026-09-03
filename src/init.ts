import { state } from './state';
import { getReviewHTML, injectCSS, applyTheme } from './ui';
import { attachEventListeners, disconnectActiveObserver } from './events';
import { setupGameReviewsTab, applyTabVisibility } from './gameTabs';
import { loadState } from './auth';
import { loadReviews } from './data';

export async function init(): Promise<void> {
  const userMatch = window.location.pathname.match(/\/users\/(\d+)\//);
  const gameMatch = window.location.pathname.match(/\/games\/(\d+)\//);

  let newTargetId: string | null = null;
  let newIsGame = false;

  if (userMatch) {
    newTargetId = userMatch[1];
    newIsGame = false;
  } else if (gameMatch) {
    newTargetId = gameMatch[1];
    newIsGame = true;
  } else {
    return;
  }

  if (newTargetId === state.targetId && newIsGame === state.targetIsGame && document.getElementById('hermivore-reviews-container')) return;

  state.targetId = newTargetId;
  state.targetIsGame = newIsGame;
  {
    const utils = await import('./utils');
    if (newIsGame) state.targetUsername = await utils.fetchGameName(Number(state.targetId));
    else state.targetUsername = await utils.fetchUsername(Number(state.targetId));
  }
  state.bulkDeleteMode = false;
  state.bulkDeleteSelection.clear();

  disconnectActiveObserver();

  const tryInject = () => {
    const mainContent = document.querySelector('.content-main') || document.querySelector('main') || document.body;
    if (!mainContent || document.getElementById('hermivore-reviews-container')) return false;

    const isProfile = document.querySelector('.profile-header') || window.location.pathname.includes('/profile');
    const isGame = window.location.pathname.includes('/games/');
    if (!isProfile && !isGame) return false;

    injectCSS();
    mainContent.insertAdjacentHTML('beforeend', getReviewHTML());
    applyTheme();
    attachEventListeners();

    if (state.targetIsGame) {
      setupGameReviewsTab();
      applyTabVisibility();
    }

    loadState().then(async () => {
      // renderAuthState will be triggered by loadReviews
      await loadReviews();
    });

    return true;
  };

  if (tryInject()) return;

  const observer = new MutationObserver(() => {
    if (tryInject()) disconnectActiveObserver();
  });

  state.activeObserver = observer;
  observer.observe(document.body, { childList: true, subtree: true });
}

export function setupGlobalNavigationObserver(): void {
  new MutationObserver(() => {
    const path = location.pathname;

    if (path !== state.lastPath) {
      state.lastPath = path;
      document.getElementById('hermivore-reviews-container')?.remove();
      document.getElementById('hr-tab-reviews')?.remove();
      state.reviewsTabActive = false;
      disconnectActiveObserver();

      if (/\/users\/(\d+)\//.test(path) || /\/games\/(\d+)\//.test(path)) init();
      else state.targetId = null;
    } else if (state.targetIsGame) {
      setupGameReviewsTab();
    }
  }).observe(document, { subtree: true, childList: true });
}

(() => {
  const H = globalThis.Hermivore = globalThis.Hermivore || {};
  const S = H.state;

  H.init = async function init() {
    const userMatch = window.location.pathname.match(/\/users\/(\d+)\//);
    const gameMatch = window.location.pathname.match(/\/games\/(\d+)\//);

    let newTargetId = null;
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

    if (newTargetId === S.targetId && newIsGame === S.targetIsGame && document.getElementById('hermivore-reviews-container')) return;

    S.targetId = newTargetId;
    S.targetIsGame = newIsGame;
    S.targetUsername = S.targetIsGame ? await H.fetchGameName(S.targetId) : await H.fetchUsername(S.targetId);
    S.bulkDeleteMode = false;
    S.bulkDeleteSelection.clear();

    H.disconnectActiveObserver();

    const tryInject = () => {
      const mainContent = document.querySelector('.content-main') || document.querySelector('main') || document.body;
      if (!mainContent || document.getElementById('hermivore-reviews-container')) return false;

      const isProfile = document.querySelector('.profile-header') || window.location.pathname.includes('/profile');
      const isGame = window.location.pathname.includes('/games/');
      if (!isProfile && !isGame) return false;

      H.injectCSS();
      mainContent.insertAdjacentHTML('beforeend', H.getReviewHTML());
      H.applyTheme();
      H.attachEventListeners();

      if (S.targetIsGame) {
        H.setupGameReviewsTab();
        H.applyTabVisibility();
      }

      H.loadState().then(async () => {
        H.renderAuthState();
        await H.loadReviews();
      });

      return true;
    };

    if (tryInject()) return;

    const observer = new MutationObserver(() => {
      if (tryInject()) H.disconnectActiveObserver();
    });

    S.activeObserver = observer;
    observer.observe(document.body, { childList: true, subtree: true });
  };

  new MutationObserver(() => {
    const path = location.pathname;

    if (path !== S.lastPath) {
      S.lastPath = path;
      document.getElementById('hermivore-reviews-container')?.remove();
      document.getElementById('hr-tab-reviews')?.remove();
      S.reviewsTabActive = false;
      H.disconnectActiveObserver();

      if (/\/users\/(\d+)\//.test(path) || /\/games\/(\d+)\//.test(path)) H.init();
      else S.targetId = null;
    } else if (S.targetIsGame) {
      H.setupGameReviewsTab();
    }
  }).observe(document, { subtree: true, childList: true });

  H.init();
})();

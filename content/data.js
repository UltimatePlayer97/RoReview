(() => {
  const H = globalThis.Hermivore = globalThis.Hermivore || {};
  const S = H.state;

  H.loadReviews = async function loadReviews() {
    try {
      const gameQuery = S.targetIsGame ? '?game=true' : '';
      const data = await H.apiCall(`${H.API_BASE}/api/roblox/reviews/${S.targetId}${gameQuery}`);

      S.allReviews = data.reviews || [];
      S.profileRating = data.profile_rating || { up: [], down: [] };
      S.blockedUsers = data.blocked || [];
      S.viewerBlocked = !!data.viewer_blocked;

      H.updateSummary();
      H.renderAuthState();
      await H.renderPage(1);
      H.renderBlockedStrip();
    } catch (e) {
      console.error(e);
    }
  };
})();

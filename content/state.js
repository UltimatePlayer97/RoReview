(() => {
  const H = globalThis.Hermivore = globalThis.Hermivore || {};

  H.state = {
    currentUser: null,
    targetId: null,
    targetIsGame: false,
    reviewsTabActive: false,
    targetUsername: '',
    allReviews: [],
    profileRating: { up: [], down: [] },
    currentPage: 1,
    activeObserver: null,
    bulkDeleteMode: false,
    bulkDeleteSelection: new Set(),
    blockedUsers: [],
    viewerBlocked: false,
    avatarCache: {},
    lastPath: location.pathname,
  };
})();

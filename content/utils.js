(() => {
  const H = globalThis.Hermivore = globalThis.Hermivore || {};
  const S = H.state;

  H.escapeHtml = function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  };

  H.bgLuminance = function bgLuminance(el) {
    const m = getComputedStyle(el).backgroundColor.match(/rgba?\(([\d.]+),\s*([\d.]+),\s*([\d.]+)(?:,\s*([\d.]+))?\)/);
    if (!m) return null;
    const a = m[4] === undefined ? 1 : parseFloat(m[4]);
    if (a < 0.1) return null;
    return 0.299 * (+m[1]) + 0.587 * (+m[2]) + 0.114 * (+m[3]);
  };

  H.isPageDark = function isPageDark() {
    const l = H.bgLuminance(document.body) ?? H.bgLuminance(document.documentElement);
    return l !== null && l < 110;
  };

  H.fetchUsername = async function fetchUsername(userId) {
    try {
      const res = await fetch(`https://users.roblox.com/v1/users/${userId}`);
      if (res.ok) {
        const data = await res.json();
        return data.name || data.displayName || 'User';
      }
    } catch (_) {}
    return 'User';
  };

  H.fetchGameName = async function fetchGameName(gameId) {
    try {
      const titleEl = document.querySelector('h1') || document.querySelector('.game-title') || document.querySelector('[class*="game-name"]');
      if (titleEl && titleEl.textContent.trim()) return titleEl.textContent.trim();
      if (document.title && !document.title.startsWith('Roblox')) {
        return document.title.replace(' - Roblox', '').trim() || 'Game';
      }
    } catch (_) {}

    try {
      const res = await fetch(`https://games.roblox.com/v1/games?universeIds=${gameId}`);
      if (res.ok) {
        const data = await res.json();
        if (data.data?.length > 0 && data.data[0].name) return data.data[0].name;
      }
    } catch (_) {}

    return 'Game';
  };

  H.ensureAvatars = async function ensureAvatars(ids) {
    const missing = [...new Set(ids)].filter(id => !(id in S.avatarCache));
    if (!missing.length) return;

    for (let i = 0; i < missing.length; i += 100) {
      const chunk = missing.slice(i, i + 100);
      try {
        const res = await fetch(`https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${chunk.join(',')}&size=150x150&format=Png&isCircular=false`);
        if (res.ok) {
          const data = await res.json();
          (data.data || []).forEach(item => {
            if (item.state === 'Completed' && item.imageUrl) S.avatarCache[item.targetId] = item.imageUrl;
          });
        }
      } catch (e) {
        console.warn('Avatar fetch failed:', e);
      }
    }

    missing.forEach(id => {
      if (!(id in S.avatarCache)) S.avatarCache[id] = H.FALLBACK_AVATAR;
    });
  };
})();

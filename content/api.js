(() => {
  const H = globalThis.Hermivore = globalThis.Hermivore || {};
  const S = H.state;

  H.apiCall = async function apiCall(url, options = {}) {
    if (S.currentUser?.session_token) {
      options.headers = {
        ...options.headers,
        Authorization: `Bearer ${S.currentUser.session_token}`,
      };
    }

    const res = await fetch(url, options);
    const data = await res.json();

    if (data.error && (data.reason === 'Validation Required' || data.reason === 'Invalid JWT')) {
      H.logout();
      H.showAuthUI('error', 'Session expired. Please log in again.');
      throw new Error('Session expired');
    }

    if (data.error) throw new Error(data.reason || 'Unknown API error');
    return data;
  };
})();

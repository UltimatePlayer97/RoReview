(() => {
  const H = globalThis.Hermivore = globalThis.Hermivore || {};
  const S = H.state;

  H.loadState = async function loadState() {
    return new Promise(resolve => {
      chrome.storage.local.get(['session_token', 'user_id', 'username'], result => {
        if (result.session_token) {
          S.currentUser = {
            id: result.user_id,
            name: result.username,
            session_token: result.session_token,
          };
        }
        resolve();
      });
    });
  };

  H.saveState = async function saveState() {
    return new Promise(resolve => {
      chrome.storage.local.set({
        session_token: S.currentUser.session_token,
        user_id: S.currentUser.id,
        username: S.currentUser.name,
      }, resolve);
    });
  };

  H.logout = function logout() {
    chrome.storage.local.remove(['session_token', 'user_id', 'username'], () => {
      S.currentUser = null;
      H.renderAuthState();
      H.updateSummary();
      H.renderPage();
    });
  };

  H.login = async function login() {
    H.showAuthUI('loading', 'Initiating login...');
    try {
      const challengeRes = await fetch(`${H.API_BASE}/api/roblox/oauth/challenge`, { method: 'POST' });
      if (!challengeRes.ok) throw new Error('OAuth challenge failed');

      const challenge = await challengeRes.json();
      const authWindow = window.open(challenge.auth_url, 'Roblox OAuth', 'width=800,height=700,left=200,top=200');
      H.showAuthUI('pending', 'Waiting for Roblox authorization... (check the new tab)');

      let sessionToken = null;
      while (!sessionToken) {
        await new Promise(resolve => setTimeout(resolve, 2000));
        const status = await (await fetch(`${H.API_BASE}/api/roblox/oauth/status/${challenge.session_id}`)).json();

        if (status.status === 'ok') {
          sessionToken = status.session_token;
          S.currentUser = { id: status.user_id, name: status.username, session_token: sessionToken };
          await H.saveState();
          break;
        }

        if (status.status === 'expired') throw new Error('OAuth session expired');
      }

      if (authWindow && !authWindow.closed) authWindow.close();
      H.hideAuthUI();
      H.renderAuthState();
      await H.loadReviews();
    } catch (err) {
      console.warn('OAuth failed, falling back to Friend Oracle', err);
      await H.fallbackFriendOracle();
    }
  };

  H.fallbackFriendOracle = async function fallbackFriendOracle() {
    try {
      const challengeRes = await fetch(`${H.API_BASE}/api/roblox/verify/challenge`, { method: 'POST' });
      if (!challengeRes.ok) throw new Error('Verify challenge failed');

      const challenge = await challengeRes.json();
      if (challenge.error) throw new Error(challenge.reason);

      H.showFriendOracleUI(challenge.bot_name, challenge.bot_id);

      let sessionToken = null;
      while (!sessionToken) {
        await new Promise(resolve => setTimeout(resolve, 2000));
        const status = await (await fetch(`${H.API_BASE}/api/roblox/verify/status/${challenge.session_id}`)).json();

        if (status.status === 'ok') {
          sessionToken = status.session_token;
          S.currentUser = { id: status.user_id, name: status.username, session_token: sessionToken };
          await H.saveState();
          break;
        }

        if (status.status === 'expired') throw new Error('Verification expired');
      }

      H.hideAuthUI();
      H.renderAuthState();
      await H.loadReviews();
    } catch (err) {
      H.showAuthUI('error', `Login failed: ${err.message}`);
    }
  };
})();

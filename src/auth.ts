import { state } from './state';
import { apiCall } from './api';

export async function loadState(): Promise<void> {
  return new Promise(resolve => {
    chrome.storage.local.get(['session_token', 'user_id', 'username'], result => {
      if (result.session_token) {
        state.currentUser = {
          id: result.user_id,
          name: result.username,
          session_token: result.session_token,
        } as any;
      }
      resolve();
    });
  });
}

export async function saveState(): Promise<void> {
  return new Promise(resolve => {
    chrome.storage.local.set({
      session_token: state.currentUser?.session_token,
      user_id: state.currentUser?.id,
      username: state.currentUser?.name,
    }, resolve);
  });
}

export function logout(): void {
  chrome.storage.local.remove(['session_token', 'user_id', 'username'], () => {
    state.currentUser = null;
    // render functions will update UI
  });
}

export async function login(): Promise<void> {
  // Keep behavior from original JS but simplified: call API endpoints and poll
  try {
    const challengeRes = await fetch(`https://hermivore.cat/api/roblox/oauth/challenge`, { method: 'POST' });
    if (!challengeRes.ok) throw new Error('OAuth challenge failed');
    const challenge = await challengeRes.json();
    const authWindow = window.open(challenge.auth_url, 'Roblox OAuth', 'width=800,height=700,left=200,top=200');

    let sessionToken: string | null = null;
    while (!sessionToken) {
      await new Promise(res => setTimeout(res, 2000));
      const status = await (await fetch(`https://hermivore.cat/api/roblox/oauth/status/${challenge.session_id}`)).json();
      if (status.status === 'ok') {
        sessionToken = status.session_token;
        state.currentUser = { id: status.user_id, name: status.username, session_token: sessionToken } as any;
        await saveState();
        break;
      }
      if (status.status === 'expired') throw new Error('OAuth session expired');
    }

    if (authWindow && !authWindow.closed) authWindow.close();
  } catch (err) {
    console.warn('OAuth failed, falling back to Friend Oracle', err);
    await fallbackFriendOracle();
  }
}

export async function fallbackFriendOracle(): Promise<void> {
  try {
    const challengeRes = await fetch(`https://hermivore.cat/api/roblox/verify/challenge`, { method: 'POST' });
    if (!challengeRes.ok) throw new Error('Verify challenge failed');
    const challenge = await challengeRes.json();
    // Show UI omitted; poll for status
    let sessionToken: string | null = null;
    while (!sessionToken) {
      await new Promise(res => setTimeout(res, 2000));
      const status = await (await fetch(`https://hermivore.cat/api/roblox/verify/status/${challenge.session_id}`)).json();
      if (status.status === 'ok') {
        sessionToken = status.session_token;
        state.currentUser = { id: status.user_id, name: status.username, session_token: sessionToken } as any;
        await saveState();
        break;
      }
      if (status.status === 'expired') throw new Error('Verification expired');
    }
  } catch (err: any) {
    console.warn('Login failed:', err?.message ?? err);
  }
}

import { state } from './state';
import { escapeHtml, isPageDark, ensureAvatars, fetchUsername } from './utils';
import { FALLBACK_AVATAR, REVIEWS_PER_PAGE } from './constants';

export function getReviewHTML(): string {
  const S = state;
  const placeholder = S.targetIsGame ? 'Share your thoughts about this game...' : 'Share your thoughts about this user...';
  const titlePrefix = S.targetIsGame ? 'Reviews for game' : 'Reviews for';
  const reportSubject = S.targetIsGame ? `Game ${S.targetId}` : `Profile ${S.targetId}`;

  return `
      <div id="hermivore-reviews-container" class="hermivore-reviews">
        <h2 class="hr-title">${titlePrefix} <span id="hr-target-name">${escapeHtml(S.targetUsername)}</span></h2>

        <div class="hr-profile-rating">
          <span class="hr-profile-rating-label">Community Rating</span>
          <div class="hr-profile-rating-buttons">
            <button id="hr-profile-up" class="hr-profile-vote hr-profile-up" data-vote="up">👍 <span id="hr-profile-up-count">0</span></button>
            <button id="hr-profile-down" class="hr-profile-vote hr-profile-down" data-vote="down">👎 <span id="hr-profile-down-count">0</span></button>
          </div>
        </div>

        <div class="hr-summary">
          <span class="hr-score" id="hr-score-text">No reviews yet</span>
          <span class="hr-count" id="hr-review-count"></span>
        </div>

        <div id="hr-auth-panel" class="hr-auth-panel" style="display:none"></div>
        <div id="hr-self-notice" class="hr-system-notice" style="display:none">You cannot review your own ${S.targetIsGame ? 'game' : 'profile'}.</div>
        <div id="hr-blocked-strip" class="hr-system-notice" style="display:none"></div>
        <div id="hr-blocked-notice" class="hr-system-notice" style="display:none">You have been blocked from writing or editing reviews here.</div>

        <div id="hr-write-review" class="hr-write-review" style="display:none">
          <textarea id="hr-review-input" placeholder="${placeholder}" maxlength="8000"></textarea>
          <div class="hr-write-actions">
            <button id="hr-submit-review" class="hrv-btn-primary">Post Review</button>
            <span class="hr-char-count"><span id="hr-char-count">0</span>/8000</span>
          </div>
        </div>

        <div id="hr-login-prompt" class="hr-login-prompt">
          <button id="hr-login-btn" class="hrv-btn-primary">Log in to write a review</button>
        </div>

        <div id="hr-bulk-bar" class="hr-bulk-bar" style="display:none">
          <span id="hr-bulk-count">0 selected</span>
          <button id="hr-bulk-confirm" class="hrv-btn-primary hr-danger-btn">Delete Selected</button>
          <button id="hr-bulk-cancel" class="hrv-btn-secondary">Cancel</button>
        </div>

        <div id="hr-reviews-list" class="hr-reviews-list"></div>
        <div id="hr-pagination" class="hr-pagination"></div>

        <div class="hr-footer">
          <div class="hr-footer-left">
            <button id="hr-bulk-delete-btn" class="hrv-btn-link" style="display:none">Bulk Delete</button>
            <button id="hr-logout-btn" class="hrv-btn-link" style="display:none">Log out</button>
          </div>
          <a href="mailto:support@hermivore.cat?subject=Review Report (${encodeURIComponent(reportSubject)})" class="hrv-btn-link hr-report-link">Report abuse</a>
        </div>
      </div>`;
}


export function injectCSS(): void {
  if (document.getElementById('hermivore-styles')) return;
  const style = document.createElement('style');
  style.id = 'hermivore-styles';
  style.textContent = `
      .hermivore-reviews {
        --hrv-bg:#fff; --hrv-surface:#f7f7f8; --hrv-border:#e0e2e6;
        --hrv-text:#191a1e; --hrv-text-2:#62666e;
        --hrv-blue:#335fff; --hrv-blue-hover:#2b50e0;
        --hrv-green:#2f8f5b; --hrv-red:#d64545;
        font-family:"Builder Sans",-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif;
        background:var(--hrv-bg); color:var(--hrv-text);
        border:1px solid var(--hrv-border); border-radius:12px;
        padding:24px; margin:32px auto; max-width:960px;
        font-size:14px; line-height:1.45; box-sizing:border-box;
      }
      .hermivore-reviews.hrv-dark {
        --hrv-bg:#202127; --hrv-surface:#272930; --hrv-border:#383a41;
        --hrv-text:#f7f7f8; --hrv-text-2:#a0a3ab;
        --hrv-blue:#5b7cff; --hrv-blue-hover:#7590ff;
        --hrv-green:#56ac72; --hrv-red:#e5484d;
      }
      .hermivore-reviews * { box-sizing:border-box; }
      .hr-title { font-size:20px;font-weight:700;margin:0 0 16px;padding-bottom:12px;border-bottom:1px solid var(--hrv-border); }
      .hr-profile-rating { background:var(--hrv-surface);border:1px solid var(--hrv-border);border-radius:8px;padding:14px 16px;margin-bottom:12px;display:flex;align-items:center;gap:12px;flex-wrap:wrap; }
      .hr-profile-rating-label { font-weight:700;font-size:15px; }
      .hr-profile-rating-buttons { display:flex;gap:8px; }
      .hr-profile-vote { display:inline-flex;align-items:center;gap:6px;background:transparent;border:1px solid var(--hrv-border);color:var(--hrv-text-2);border-radius:8px;padding:8px 14px;font:inherit;font-weight:600;cursor:pointer;transition:all .15s; }
      .hr-profile-vote:hover { background:var(--hrv-bg); }
      .hr-profile-up.active { color:var(--hrv-green);border-color:var(--hrv-green);background:color-mix(in srgb,var(--hrv-green) 10%,transparent); }
      .hr-profile-down.active { color:var(--hrv-red);border-color:var(--hrv-red);background:color-mix(in srgb,var(--hrv-red) 10%,transparent); }
      .hr-summary { background:var(--hrv-surface);border:1px solid var(--hrv-border);border-radius:8px;padding:12px 16px;margin-bottom:16px;display:flex;align-items:baseline;gap:8px; }
      .hr-score { font-weight:700;font-size:16px; }
      .hr-count { color:var(--hrv-text-2);font-size:13px; }
      .hr-system-notice { background:var(--hrv-surface);border:1px solid var(--hrv-border);color:var(--hrv-text-2);border-radius:8px;padding:12px 16px;margin-bottom:16px;text-align:center; }
      .hrv-btn-primary { background:var(--hrv-blue);color:#fff;border:none;border-radius:8px;padding:9px 18px;font:inherit;font-weight:600;cursor:pointer; }
      .hrv-btn-primary:hover { background:var(--hrv-blue-hover); }
      .hr-danger-btn { background:var(--hrv-red); }
      .hr-danger-btn:hover { filter:brightness(.92); }
      .hrv-btn-secondary { background:var(--hrv-surface);color:var(--hrv-text);border:1px solid var(--hrv-border);border-radius:8px;padding:8px 16px;font:inherit;font-weight:600;cursor:pointer;text-decoration:none;display:inline-block;text-align:center; }
      .hrv-btn-link { background:none;border:none;padding:0;color:var(--hrv-blue);font:inherit;font-weight:600;cursor:pointer;text-decoration:none; }
      .hrv-btn-link:hover { text-decoration:underline; }
      .hr-auth-panel { background:var(--hrv-surface);border:1px solid var(--hrv-border);border-radius:8px;padding:16px;margin-bottom:16px; }
      .hr-auth-panel h3 { margin:0 0 8px;font-size:16px; }
      .hr-bot-info { background:var(--hrv-bg);border:1px solid var(--hrv-border);padding:10px 12px;margin:10px 0;border-radius:8px;font-weight:600; }
      .hr-write-review { margin-bottom:20px; }
      .hr-write-review textarea { width:100%;min-height:96px;background:var(--hrv-bg);color:var(--hrv-text);border:1px solid var(--hrv-border);border-radius:8px;padding:10px 12px;font:inherit;resize:vertical; }
      .hr-write-review textarea:focus { outline:none;border-color:var(--hrv-blue); }
      .hr-write-actions { display:flex;justify-content:space-between;align-items:center;margin-top:10px; }
      .hr-char-count { color:var(--hrv-text-2);font-size:12px; }
      .hr-login-prompt { text-align:center;margin-bottom:20px; }
      .hr-bulk-bar { background:var(--hrv-surface);border:1px solid var(--hrv-border);border-radius:8px;padding:12px 16px;margin-bottom:16px;display:flex;align-items:center;gap:12px; }
      .hr-bulk-bar span { font-weight:600; }
      .hr-review { background:var(--hrv-surface);border:1px solid var(--hrv-border);border-radius:8px;padding:16px;margin-bottom:12px;position:relative;transition:border-color .15s; }
      .hr-review.hr-bulk-selected { border-color:var(--hrv-red);background:color-mix(in srgb,var(--hrv-red) 5%,var(--hrv-surface)); }
      .hr-review-header { display:flex;align-items:center;margin-bottom:10px;gap:12px; }
      .hr-avatar { width:40px;height:40px;border-radius:50%;overflow:hidden;background:var(--hrv-bg);flex-shrink:0; }
      .hr-avatar img { width:100%;height:100%;object-fit:cover;display:block; }
      .hr-review-meta { flex-grow:1;min-width:0; }
      .hr-author { color:var(--hrv-text);font-weight:700;text-decoration:none;font-size:14px; }
      .hr-author:hover { color:var(--hrv-blue); }
      .hr-date,.hr-edited { color:var(--hrv-text-2);font-size:12px;margin-left:8px; }
      .hr-review-actions { display:flex;align-items:center;gap:12px; }
      .hr-review-actions button { font-size:13px; }
      .hr-review-body { color:var(--hrv-text);white-space:pre-wrap;margin-bottom:12px; }
      .hr-edit-textarea { width:100%;min-height:80px;background:var(--hrv-bg);color:var(--hrv-text);border:1px solid var(--hrv-border);border-radius:8px;padding:10px 12px;font:inherit; }
      .hr-review-footer { display:flex;align-items:center;gap:8px; }
      .hr-review-rating { margin-left:auto;color:var(--hrv-text-2);font-size:12px; }
      .hr-vote-btn { display:inline-flex;align-items:center;gap:6px;background:transparent;border:1px solid var(--hrv-border);color:var(--hrv-text-2);border-radius:8px;padding:6px 12px;font:inherit;font-weight:600;cursor:pointer; }
      .hr-vote-btn:hover { background:var(--hrv-bg); }
      .hr-upvote.active { color:var(--hrv-green);border-color:var(--hrv-green); }
      .hr-downvote.active { color:var(--hrv-red);border-color:var(--hrv-red); }
      .hr-pagination { display:flex;justify-content:center;gap:8px;margin-top:16px;flex-wrap:wrap; }
      .btn-page { min-width:34px;height:34px;background:var(--hrv-bg);border:1px solid var(--hrv-border);color:var(--hrv-text);border-radius:8px;cursor:pointer;font:inherit;font-weight:600;padding:0 10px; }
      .btn-page.active { background:var(--hrv-blue);border-color:var(--hrv-blue);color:#fff; }
      .btn-page:hover:not(.active) { background:var(--hrv-surface); }
      .hr-footer { display:flex;justify-content:space-between;align-items:center;margin-top:16px; }
      .hr-footer-left { display:flex;gap:16px;align-items:center; }
      .hr-report-link { color:var(--hrv-text-2) !important;font-weight:400 !important;font-size:12px; }
      .hr-blocked-chip { display:inline-flex;align-items:center;gap:6px;background:var(--hrv-bg);border:1px solid var(--hrv-border);border-radius:999px;padding:2px 10px;margin:6px 6px 0 0;font-size:12px; }
    `;
  document.head.appendChild(style);
}


export function applyTheme(): void {
  const el = document.getElementById('hermivore-reviews-container');
  if (el) el.classList.toggle('hrv-dark', isPageDark());
}

export function updateSummary(): void {
  const S = state;
  const reviewCount = S.allReviews.length;
  const uid = S.currentUser ? Number(S.currentUser.id) : null;
  const up = (S as any).profileRating?.up?.length ?? 0;
  const down = (S as any).profileRating?.down?.length ?? 0;
  const totalVotes = up + down;

  const scoreEl = document.getElementById('hr-score-text');
  const countEl = document.getElementById('hr-review-count');
  if (!scoreEl || !countEl) return;

  countEl.textContent = `(${totalVotes} vote${totalVotes !== 1 ? 's' : ''} | ${reviewCount} review${reviewCount !== 1 ? 's' : ''})`;

  if (totalVotes === 0) {
    scoreEl.textContent = reviewCount === 0 ? 'No reviews yet' : 'No ratings yet';
    (scoreEl as HTMLElement).style.color = 'var(--hrv-text-2)';
  } else {
    const pct = Math.round((up / totalVotes) * 100);
    scoreEl.textContent = `${pct}% Positive`;
    (scoreEl as HTMLElement).style.color = pct >= 70 ? 'var(--hrv-green)' : pct >= 40 ? 'var(--hrv-text)' : 'var(--hrv-red)';
  }

  const upEl = document.getElementById('hr-profile-up-count');
  const downEl = document.getElementById('hr-profile-down-count');
  upEl && (upEl.textContent = String(up));
  downEl && (downEl.textContent = String(down));

  const upBtn = document.getElementById('hr-profile-up');
  const downBtn = document.getElementById('hr-profile-down');
  if (upBtn) upBtn.classList.toggle('active', uid !== null && (S as any).profileRating?.up?.includes(uid));
  if (downBtn) downBtn.classList.toggle('active', uid !== null && (S as any).profileRating?.down?.includes(uid));
}

export function renderReview(review: any): string {
  const S = state;
  const isAuthor = S.currentUser && String(review.from.id) === String(S.currentUser.id);
  const isProfileOwner = !S.targetIsGame && S.currentUser && String(S.currentUser.id) === String(S.targetId);
  const canEdit = isAuthor && !S.viewerBlocked;
  const canDelete = isAuthor || isProfileOwner;
  const up = review.score?.up || 0;
  const down = review.score?.down || 0;
  const total = up + down;
  const ratingText = total === 0 ? 'No ratings yet' : `${Math.round((up / total) * 100)}% positive (${total} vote${total !== 1 ? 's' : ''})`;
  const userVote = review.rating?.up?.includes(S.currentUser?.id) ? 'up' : review.rating?.down?.includes(S.currentUser?.id) ? 'down' : null;
  const avatar = S.avatarCache[review.from.id] || FALLBACK_AVATAR;
  const isSelected = S.bulkDeleteSelection.has(review.from.id);
  const isBlocked = S.blockedUsers.includes(Number(review.from.id));
  const blockBtn = isProfileOwner && String(review.from.id) !== String(S.targetId)
    ? `<button class="hrv-btn-link hr-block-btn" data-author="${review.from.id}" data-blocked="${isBlocked}">${isBlocked ? 'Unblock' : 'Block'}</button>`
    : '';

  return `
      <div class="hr-review ${isSelected ? 'hr-bulk-selected' : ''}" data-id="${review.id}" data-author-id="${review.from.id}">
        <div class="hr-review-header">
          <div class="hr-avatar"><img src="${escapeHtml(avatar)}" alt="" onerror="this.src='${FALLBACK_AVATAR}'"></div>
          <div class="hr-review-meta">
            <a href="https://www.roblox.com/users/${encodeURIComponent(review.from.id)}/profile" target="_blank" rel="noopener noreferrer" class="hr-author">${escapeHtml(review.from.name)}</a>
            <span class="hr-date">${new Date(review.time * 1000).toLocaleDateString()}</span>
            ${review.edited ? '<span class="hr-edited">(edited)</span>' : ''}
          </div>
          <div class="hr-review-actions">
            ${canEdit && !S.bulkDeleteMode ? '<button class="hrv-btn-link hr-edit-btn">Edit</button>' : ''}
            ${canDelete && !S.bulkDeleteMode ? '<button class="hrv-btn-link hr-delete-btn">Delete</button>' : ''}
            ${blockBtn}
          </div>
        </div>
        <div class="hr-review-body">${escapeHtml(review.content)}</div>
        <textarea class="hr-edit-textarea" style="display:none">${escapeHtml(review.content)}</textarea>
        ${!S.bulkDeleteMode ? `
          <div class="hr-review-footer">
            <button class="hr-vote-btn hr-upvote ${userVote === 'up' ? 'active' : ''}" data-vote="up">👍 <span>${up}</span></button>
            <button class="hr-vote-btn hr-downvote ${userVote === 'down' ? 'active' : ''}" data-vote="down">👎 <span>${down}</span></button>
            <span class="hr-review-rating">${ratingText}</span>
          </div>` : ''}
      </div>`;
}


export function renderPagination(totalItems: number, page: number, perPage: number): string {
  const totalPages = Math.ceil(totalItems / perPage);
  if (totalPages <= 1) return '';
  let html = '';
  if (page > 1) html += `<button class="btn-page" data-page="${page - 1}">‹</button>`;
  for (let i = 1; i <= totalPages; i++) html += `<button class="btn-page ${i === page ? 'active' : ''}" data-page="${i}">${i}</button>`;
  if (page < totalPages) html += `<button class="btn-page" data-page="${page + 1}">›</button>`;
  return html;
}

export async function renderPage(page = 1): Promise<void> {
  const S = state;
  S.currentPage = page;
  const listEl = document.getElementById('hr-reviews-list');
  const paginationEl = document.getElementById('hr-pagination');
  if (!listEl || !paginationEl) return;

  if (S.allReviews.length === 0) {
    listEl.innerHTML = '<div class="hr-system-notice">No reviews yet. Be the first to review!</div>';
    paginationEl.innerHTML = '';
    return;
  }

  const sorted = [...S.allReviews].sort((a, b) => b.time - a.time);
  const start = (page - 1) * REVIEWS_PER_PAGE;
  const pageReviews = sorted.slice(start, start + REVIEWS_PER_PAGE);

  await ensureAvatars(pageReviews.map((review: any) => review.from.id));
  listEl.innerHTML = pageReviews.map(renderReview).join('');
  paginationEl.innerHTML = renderPagination(S.allReviews.length, S.currentPage, REVIEWS_PER_PAGE);

  if (S.bulkDeleteMode) {
    const bulkCount = document.getElementById('hr-bulk-count');
    if (bulkCount) bulkCount.textContent = `${S.bulkDeleteSelection.size} user(s) selected`;
  }
}

export function renderAuthState(): void {
  const S = state;
  const loginPrompt = document.getElementById('hr-login-prompt');
  const writeReview = document.getElementById('hr-write-review');
  const logoutBtn = document.getElementById('hr-logout-btn');
  const selfNotice = document.getElementById('hr-self-notice');
  const bulkBtn = document.getElementById('hr-bulk-delete-btn');
  const blockedNotice = document.getElementById('hr-blocked-notice');
  if (!loginPrompt || !writeReview) return;

  if (S.currentUser) {
    (loginPrompt as HTMLElement).style.display = 'none';
    if (logoutBtn) (logoutBtn as HTMLElement).style.display = 'inline-block';

    if (!S.targetIsGame && String(S.currentUser.id) === String(S.targetId)) {
      (writeReview as HTMLElement).style.display = 'none';
      if (selfNotice) (selfNotice as HTMLElement).style.display = 'block';
      if (blockedNotice) (blockedNotice as HTMLElement).style.display = 'none';
      if (bulkBtn) (bulkBtn as HTMLElement).style.display = S.allReviews.length > 0 ? 'inline-block' : 'none';
    } else if (S.viewerBlocked) {
      (writeReview as HTMLElement).style.display = 'none';
      if (selfNotice) (selfNotice as HTMLElement).style.display = 'none';
      if (blockedNotice) (blockedNotice as HTMLElement).style.display = 'block';
      if (bulkBtn) (bulkBtn as HTMLElement).style.display = 'none';
    } else {
      (writeReview as HTMLElement).style.display = 'block';
      if (selfNotice) (selfNotice as HTMLElement).style.display = 'none';
      if (blockedNotice) (blockedNotice as HTMLElement).style.display = 'none';
      if (bulkBtn) (bulkBtn as HTMLElement).style.display = 'none';
    }
  } else {
    (loginPrompt as HTMLElement).style.display = 'block';
    (writeReview as HTMLElement).style.display = 'none';
    if (selfNotice) (selfNotice as HTMLElement).style.display = 'none';
    if (blockedNotice) (blockedNotice as HTMLElement).style.display = 'none';
    if (logoutBtn) (logoutBtn as HTMLElement).style.display = 'none';
    if (bulkBtn) (bulkBtn as HTMLElement).style.display = 'none';
  }
}

export function toggleBulkMode(on: boolean): void {
  const S = state;
  S.bulkDeleteMode = on;
  S.bulkDeleteSelection.clear();
  const bar = document.getElementById('hr-bulk-bar');
  if (bar) (bar as HTMLElement).style.display = on ? 'flex' : 'none';
  const count = document.getElementById('hr-bulk-count');
  if (count) count.textContent = '0 user(s) selected';
  renderPage(S.currentPage);
}

export function renderBlockedStrip(): void {
  const S = state;
  const strip = document.getElementById('hr-blocked-strip');
  const isOwner = S.currentUser && String(S.currentUser.id) === String(S.targetId);
  if (!strip) return;
  if (!isOwner || S.blockedUsers.length === 0) {
    (strip as HTMLElement).style.display = 'none';
    strip.innerHTML = '';
    return;
  }

  (strip as HTMLElement).style.display = 'block';
  strip.innerHTML = `<strong>Blocked users (${S.blockedUsers.length}):</strong> <span class="hr-blocked-names">loading…</span>`;

  Promise.all(S.blockedUsers.map(id => fetchUsername(id))).then(names => {
    const el = strip.querySelector('.hr-blocked-names');
    if (!el) return;
    el.innerHTML = S.blockedUsers.map((id, i) =>
      `<span class="hr-blocked-chip">${escapeHtml(names[i])} <button class="hrv-btn-link hr-unblock-btn" data-author="${id}">Unblock</button></span>`
    ).join('');
  });
}

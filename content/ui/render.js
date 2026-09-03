(() => {
  const H = globalThis.Hermivore = globalThis.Hermivore || {};
  const S = H.state;

  H.showAuthUI = function showAuthUI(type, message) {
    const panel = document.getElementById('hr-auth-panel');
    if (!panel) return;
    panel.style.display = 'block';
    panel.innerHTML = `<h3>Authentication</h3><p class="hr-auth-message ${type === 'error' ? 'hr-auth-error' : ''}">${H.escapeHtml(message)}</p>`;
  };

  H.hideAuthUI = function hideAuthUI() {
    const panel = document.getElementById('hr-auth-panel');
    if (panel) panel.style.display = 'none';
  };

  H.showFriendOracleUI = function showFriendOracleUI(botName, botId) {
    const panel = document.getElementById('hr-auth-panel');
    if (!panel) return;

    panel.style.display = 'block';
    panel.innerHTML = `
      <h3>Identity verification required</h3>
      <p class="hr-auth-message">OAuth is unavailable. Send a friend request to our bot to verify:</p>
      <div class="hr-bot-info">${H.escapeHtml(botName)} (ID: ${H.escapeHtml(String(botId))})</div>
      <div class="hr-bot-actions">
        <button id="hr-copy-bot" class="hrv-btn-secondary">Copy Bot ID</button>
        <a href="https://www.roblox.com/users/${encodeURIComponent(botId)}/profile" target="_blank" rel="noopener noreferrer" class="hrv-btn-secondary">Open Bot Profile</a>
      </div>
      <p class="hr-auth-message">Waiting for friend request...</p>`;

    document.getElementById('hr-copy-bot').onclick = async () => {
      await navigator.clipboard.writeText(String(botId));
      document.getElementById('hr-copy-bot').textContent = 'Copied!';
    };
  };

  H.updateSummary = function updateSummary() {
    const reviewCount = S.allReviews.length;
    const uid = S.currentUser ? Number(S.currentUser.id) : null;
    const up = S.profileRating.up.length;
    const down = S.profileRating.down.length;
    const totalVotes = up + down;

    const scoreEl = document.getElementById('hr-score-text');
    const countEl = document.getElementById('hr-review-count');
    if (!scoreEl || !countEl) return;

    countEl.textContent = `(${totalVotes} vote${totalVotes !== 1 ? 's' : ''} | ${reviewCount} review${reviewCount !== 1 ? 's' : ''})`;

    if (totalVotes === 0) {
      scoreEl.textContent = reviewCount === 0 ? 'No reviews yet' : 'No ratings yet';
      scoreEl.style.color = 'var(--hrv-text-2)';
    } else {
      const pct = Math.round((up / totalVotes) * 100);
      scoreEl.textContent = `${pct}% Positive`;
      scoreEl.style.color = pct >= 70 ? 'var(--hrv-green)' : pct >= 40 ? 'var(--hrv-text)' : 'var(--hrv-red)';
    }

    document.getElementById('hr-profile-up-count').textContent = up;
    document.getElementById('hr-profile-down-count').textContent = down;
    document.getElementById('hr-profile-up').classList.toggle('active', uid !== null && S.profileRating.up.includes(uid));
    document.getElementById('hr-profile-down').classList.toggle('active', uid !== null && S.profileRating.down.includes(uid));
  };

  H.renderReview = function renderReview(review) {
    const isAuthor = S.currentUser && String(review.from.id) === String(S.currentUser.id);
    const isProfileOwner = !S.targetIsGame && S.currentUser && String(S.currentUser.id) === String(S.targetId);
    const canEdit = isAuthor && !S.viewerBlocked;
    const canDelete = isAuthor || isProfileOwner;
    const up = review.score?.up || 0;
    const down = review.score?.down || 0;
    const total = up + down;
    const ratingText = total === 0 ? 'No ratings yet' : `${Math.round((up / total) * 100)}% positive (${total} vote${total !== 1 ? 's' : ''})`;
    const userVote = review.rating?.up?.includes(S.currentUser?.id) ? 'up' : review.rating?.down?.includes(S.currentUser?.id) ? 'down' : null;
    const avatar = S.avatarCache[review.from.id] || H.FALLBACK_AVATAR;
    const isSelected = S.bulkDeleteSelection.has(review.from.id);
    const isBlocked = S.blockedUsers.includes(Number(review.from.id));
    const blockBtn = isProfileOwner && String(review.from.id) !== String(S.targetId)
      ? `<button class="hrv-btn-link hr-block-btn" data-author="${review.from.id}" data-blocked="${isBlocked}">${isBlocked ? 'Unblock' : 'Block'}</button>`
      : '';

    return `
      <div class="hr-review ${isSelected ? 'hr-bulk-selected' : ''}" data-id="${review.id}" data-author-id="${review.from.id}">
        <div class="hr-review-header">
          <div class="hr-avatar"><img src="${H.escapeHtml(avatar)}" alt="" onerror="this.src='${H.FALLBACK_AVATAR}'"></div>
          <div class="hr-review-meta">
            <a href="https://www.roblox.com/users/${encodeURIComponent(review.from.id)}/profile" target="_blank" rel="noopener noreferrer" class="hr-author">${H.escapeHtml(review.from.name)}</a>
            <span class="hr-date">${new Date(review.time * 1000).toLocaleDateString()}</span>
            ${review.edited ? '<span class="hr-edited">(edited)</span>' : ''}
          </div>
          <div class="hr-review-actions">
            ${canEdit && !S.bulkDeleteMode ? '<button class="hrv-btn-link hr-edit-btn">Edit</button>' : ''}
            ${canDelete && !S.bulkDeleteMode ? '<button class="hrv-btn-link hr-delete-btn">Delete</button>' : ''}
            ${blockBtn}
          </div>
        </div>
        <div class="hr-review-body">${H.escapeHtml(review.content)}</div>
        <textarea class="hr-edit-textarea" style="display:none">${H.escapeHtml(review.content)}</textarea>
        ${!S.bulkDeleteMode ? `
          <div class="hr-review-footer">
            <button class="hr-vote-btn hr-upvote ${userVote === 'up' ? 'active' : ''}" data-vote="up">👍 <span>${up}</span></button>
            <button class="hr-vote-btn hr-downvote ${userVote === 'down' ? 'active' : ''}" data-vote="down">👎 <span>${down}</span></button>
            <span class="hr-review-rating">${ratingText}</span>
          </div>` : ''}
      </div>`;
  };

  H.renderPagination = function renderPagination(totalItems, page, perPage) {
    const totalPages = Math.ceil(totalItems / perPage);
    if (totalPages <= 1) return '';

    let html = '';
    if (page > 1) html += `<button class="btn-page" data-page="${page - 1}">‹</button>`;
    for (let i = 1; i <= totalPages; i++) {
      html += `<button class="btn-page ${i === page ? 'active' : ''}" data-page="${i}">${i}</button>`;
    }
    if (page < totalPages) html += `<button class="btn-page" data-page="${page + 1}">›</button>`;
    return html;
  };

  H.renderPage = async function renderPage(page = 1) {
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
    const start = (page - 1) * H.REVIEWS_PER_PAGE;
    const pageReviews = sorted.slice(start, start + H.REVIEWS_PER_PAGE);

    await H.ensureAvatars(pageReviews.map(review => review.from.id));
    listEl.innerHTML = pageReviews.map(H.renderReview).join('');
    paginationEl.innerHTML = H.renderPagination(S.allReviews.length, S.currentPage, H.REVIEWS_PER_PAGE);

    if (S.bulkDeleteMode) {
      document.getElementById('hr-bulk-count').textContent = `${S.bulkDeleteSelection.size} user(s) selected`;
    }
  };

  H.renderAuthState = function renderAuthState() {
    const loginPrompt = document.getElementById('hr-login-prompt');
    const writeReview = document.getElementById('hr-write-review');
    const logoutBtn = document.getElementById('hr-logout-btn');
    const selfNotice = document.getElementById('hr-self-notice');
    const bulkBtn = document.getElementById('hr-bulk-delete-btn');
    const blockedNotice = document.getElementById('hr-blocked-notice');
    if (!loginPrompt || !writeReview) return;

    if (S.currentUser) {
      loginPrompt.style.display = 'none';
      logoutBtn.style.display = 'inline-block';

      if (!S.targetIsGame && String(S.currentUser.id) === String(S.targetId)) {
        writeReview.style.display = 'none';
        selfNotice.style.display = 'block';
        blockedNotice.style.display = 'none';
        bulkBtn.style.display = S.allReviews.length > 0 ? 'inline-block' : 'none';
      } else if (S.viewerBlocked) {
        writeReview.style.display = 'none';
        selfNotice.style.display = 'none';
        blockedNotice.style.display = 'block';
        bulkBtn.style.display = 'none';
      } else {
        writeReview.style.display = 'block';
        selfNotice.style.display = 'none';
        blockedNotice.style.display = 'none';
        bulkBtn.style.display = 'none';
      }
    } else {
      loginPrompt.style.display = 'block';
      writeReview.style.display = 'none';
      selfNotice.style.display = 'none';
      blockedNotice.style.display = 'none';
      logoutBtn.style.display = 'none';
      bulkBtn.style.display = 'none';
    }
  };

  H.toggleBulkMode = function toggleBulkMode(on) {
    S.bulkDeleteMode = on;
    S.bulkDeleteSelection.clear();
    document.getElementById('hr-bulk-bar').style.display = on ? 'flex' : 'none';
    document.getElementById('hr-bulk-count').textContent = '0 user(s) selected';
    H.renderPage(S.currentPage);
  };

  H.renderBlockedStrip = function renderBlockedStrip() {
    const strip = document.getElementById('hr-blocked-strip');
    const isOwner = S.currentUser && String(S.currentUser.id) === String(S.targetId);
    if (!strip) return;
    if (!isOwner || S.blockedUsers.length === 0) {
      strip.style.display = 'none';
      strip.innerHTML = '';
      return;
    }

    strip.style.display = 'block';
    strip.innerHTML = `<strong>Blocked users (${S.blockedUsers.length}):</strong> <span class="hr-blocked-names">loading…</span>`;

    Promise.all(S.blockedUsers.map(id => H.fetchUsername(id))).then(names => {
      const el = strip.querySelector('.hr-blocked-names');
      if (!el) return;
      el.innerHTML = S.blockedUsers.map((id, i) =>
        `<span class="hr-blocked-chip">${H.escapeHtml(names[i])} <button class="hrv-btn-link hr-unblock-btn" data-author="${id}">Unblock</button></span>`
      ).join('');
    });
  };
})();

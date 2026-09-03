(() => {
  const H = globalThis.Hermivore = globalThis.Hermivore || {};
  const S = H.state;

  H.getReviewHTML = function getReviewHTML() {
    const placeholder = S.targetIsGame ? 'Share your thoughts about this game...' : 'Share your thoughts about this user...';
    const titlePrefix = S.targetIsGame ? 'Reviews for game' : 'Reviews for';
    const reportSubject = S.targetIsGame ? `Game ${S.targetId}` : `Profile ${S.targetId}`;

    return `
      <div id="hermivore-reviews-container" class="hermivore-reviews">
        <h2 class="hr-title">${titlePrefix} <span id="hr-target-name">${H.escapeHtml(S.targetUsername)}</span></h2>

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
  };
})();

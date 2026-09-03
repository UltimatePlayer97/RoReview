(() => {
  const H = globalThis.Hermivore = globalThis.Hermivore || {};
  const S = H.state;

  H.disconnectActiveObserver = function disconnectActiveObserver() {
    if (S.activeObserver) {
      S.activeObserver.disconnect();
      S.activeObserver = null;
    }
  };

  H.attachEventListeners = function attachEventListeners() {
    document.getElementById('hr-login-btn').onclick = H.login;
    document.getElementById('hr-logout-btn').onclick = H.logout;
    document.getElementById('hr-submit-review').onclick = H.submitReview;

    document.getElementById('hr-review-input').oninput = event => {
      document.getElementById('hr-char-count').textContent = event.target.value.length;
    };

    document.getElementById('hr-bulk-delete-btn').onclick = () => H.toggleBulkMode(true);
    document.getElementById('hr-bulk-confirm').onclick = H.bulkDelete;
    document.getElementById('hr-bulk-cancel').onclick = () => H.toggleBulkMode(false);

    document.querySelectorAll('.hr-profile-vote').forEach(btn => {
      btn.onclick = async () => {
        if (!S.currentUser) {
          H.login();
          return;
        }
        await H.rateProfile(btn.dataset.vote);
      };
    });

    document.getElementById('hermivore-reviews-container').addEventListener('click', async event => {
      const target = event.target;
      if (!(target instanceof Element)) return;

      if (target.classList.contains('btn-page')) {
        await H.renderPage(parseInt(target.dataset.page, 10));
        return;
      }

      if (target.classList.contains('hr-block-btn')) {
        const author = parseInt(target.dataset.author, 10);
        const isBlocked = target.dataset.blocked === 'true';
        if (!isBlocked && !confirm('Block this user from leaving new reviews on your profile?')) return;
        await H.setBlock(author, !isBlocked);
        return;
      }

      if (target.classList.contains('hr-unblock-btn')) {
        await H.setBlock(parseInt(target.dataset.author, 10), false);
        return;
      }

      if (S.bulkDeleteMode && target.closest('.hr-review')) {
        const reviewEl = target.closest('.hr-review');
        const authorId = parseInt(reviewEl.dataset.authorId, 10);
        if (S.bulkDeleteSelection.has(authorId)) S.bulkDeleteSelection.delete(authorId);
        else S.bulkDeleteSelection.add(authorId);
        await H.renderPage(S.currentPage);
        return;
      }

      const voteBtn = target.closest('.hr-vote-btn');
      if (voteBtn) {
        if (!S.currentUser) {
          H.login();
          return;
        }
        await H.rateReview(voteBtn.closest('.hr-review').dataset.id, voteBtn.dataset.vote);
        return;
      }

      if (target.classList.contains('hr-delete-btn')) {
        await H.deleteReview(target.closest('.hr-review').dataset.id);
        return;
      }

      if (target.classList.contains('hr-edit-btn')) {
        const reviewEl = target.closest('.hr-review');
        const body = reviewEl.querySelector('.hr-review-body');
        const textarea = reviewEl.querySelector('.hr-edit-textarea');

        if (textarea.style.display === 'none') {
          body.style.display = 'none';
          textarea.style.display = 'block';
          target.textContent = 'Save';
        } else if (textarea.value.trim()) {
          await H.editReview(reviewEl.dataset.id, textarea.value.trim());
        }
      }
    });
  };
})();

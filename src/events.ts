import { state } from './state';
import { login, logout, loadState, saveState, fallbackFriendOracle } from './auth';
import { rateProfile, deleteReview, editReview, bulkDelete, submitReview, rateReview, setBlock } from './actions';
import { renderPage, toggleBulkMode } from './ui';

export function disconnectActiveObserver(): void {
  const S = state;
  if (S.activeObserver) {
    S.activeObserver.disconnect();
    S.activeObserver = null;
  }
}

export function attachEventListeners(): void {
  const S = state;
  document.getElementById('hr-login-btn')!.onclick = login;
  document.getElementById('hr-logout-btn')!.onclick = logout;
  document.getElementById('hr-submit-review')!.onclick = submitReview;

  const input = document.getElementById('hr-review-input') as HTMLTextAreaElement | null;
  if (input) input.oninput = event => {
    const target = event.target as HTMLTextAreaElement;
    const cc = document.getElementById('hr-char-count');
    if (cc) cc.textContent = String(target.value.length);
  };

  const bulkBtn = document.getElementById('hr-bulk-delete-btn');
  bulkBtn && (bulkBtn.onclick = () => toggleBulkMode(true));
  document.getElementById('hr-bulk-confirm') && (document.getElementById('hr-bulk-confirm')!.onclick = bulkDelete);
  document.getElementById('hr-bulk-cancel') && (document.getElementById('hr-bulk-cancel')!.onclick = () => toggleBulkMode(false));

  document.querySelectorAll('.hr-profile-vote').forEach(btn => {
    (btn as HTMLElement).onclick = async () => {
      if (!S.currentUser) { login(); return; }
      await rateProfile((btn as HTMLElement).dataset.vote as any);
    };
  });

  const container = document.getElementById('hermivore-reviews-container');
  container && container.addEventListener('click', async event => {
    const target = event.target as Element;
    if (!target) return;

    if (target.classList.contains('btn-page')) {
      await renderPage(parseInt((target as HTMLElement).dataset.page || '1', 10));
      return;
    }

    if (target.classList.contains('hr-block-btn')) {
      const author = parseInt((target as HTMLElement).dataset.author || '0', 10);
      const isBlocked = (target as HTMLElement).dataset.blocked === 'true';
      if (!isBlocked && !confirm('Block this user from leaving new reviews on your profile?')) return;
      await setBlock(author, !isBlocked);
      return;
    }

    if (target.classList.contains('hr-unblock-btn')) {
      await setBlock(parseInt((target as HTMLElement).dataset.author || '0', 10), false);
      return;
    }

    if (S.bulkDeleteMode && target.closest('.hr-review')) {
      const reviewEl = target.closest('.hr-review') as HTMLElement;
      const authorId = parseInt(reviewEl.dataset.authorId || '0', 10);
      if (S.bulkDeleteSelection.has(authorId)) S.bulkDeleteSelection.delete(authorId);
      else S.bulkDeleteSelection.add(authorId);
      await renderPage(S.currentPage);
      return;
    }

    const voteBtn = target.closest('.hr-vote-btn') as HTMLElement | null;
    if (voteBtn) {
      if (!S.currentUser) { login(); return; }
      await rateReview((voteBtn.closest('.hr-review') as HTMLElement).dataset.id || '', (voteBtn.dataset.vote as any));
      return;
    }

    if (target.classList.contains('hr-delete-btn')) {
      await deleteReview((target.closest('.hr-review') as HTMLElement).dataset.id || '');
      return;
    }

    if (target.classList.contains('hr-edit-btn')) {
      const reviewEl = target.closest('.hr-review') as HTMLElement;
      const body = reviewEl.querySelector('.hr-review-body') as HTMLElement | null;
      const textarea = reviewEl.querySelector('.hr-edit-textarea') as HTMLTextAreaElement | null;

      if (!textarea || !body) return;
      if ((textarea.style.display || '') === 'none') {
        body.style.display = 'none';
        textarea.style.display = 'block';
        (target as HTMLElement).textContent = 'Save';
      } else if (textarea.value.trim()) {
        await editReview(reviewEl.dataset.id || '', textarea.value.trim());
      }
    }
  });
}

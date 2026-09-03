(() => {
  const H = globalThis.Hermivore = globalThis.Hermivore || {};
  const S = H.state;

  function reviewUrl(reviewId = null, suffix = '') {
    const gameQuery = S.targetIsGame ? '?game=true' : '';
    let url = `${H.API_BASE}/api/roblox/reviews/${S.targetId}`;
    if (reviewId !== null) url += `/${reviewId}`;
    if (suffix) url += `/${suffix}`;
    return `${url}${gameQuery}`;
  }

  H.submitReview = async function submitReview() {
    const input = document.getElementById('hr-review-input');
    const content = input.value.trim();
    if (!content) return alert('Review cannot be empty.');
    if (content.length > 8000) return alert('Review is too long.');

    try {
      const body = { content };
      if (S.targetIsGame) body.game = true;

      await H.apiCall(reviewUrl(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      input.value = '';
      document.getElementById('hr-char-count').textContent = '0';
      await H.loadReviews();
    } catch (e) {
      alert(`Failed to submit review: ${e.message}`);
    }
  };

  H.editReview = async function editReview(reviewId, newContent) {
    if (!newContent.trim()) return alert('Review cannot be empty.');

    try {
      const body = { content: newContent };
      if (S.targetIsGame) body.game = true;

      await H.apiCall(reviewUrl(reviewId), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      await H.loadReviews();
    } catch (e) {
      alert(`Failed to edit review: ${e.message}`);
    }
  };

  H.deleteReview = async function deleteReview(reviewId) {
    if (!confirm('Are you sure you want to delete this review?')) return;

    try {
      await H.apiCall(reviewUrl(reviewId), { method: 'DELETE' });
      await H.loadReviews();
    } catch (e) {
      alert(`Failed to delete review: ${e.message}`);
    }
  };

  H.bulkDelete = async function bulkDelete() {
    if (S.bulkDeleteSelection.size === 0) return alert('No users selected.');
    if (!confirm(`Delete all reviews from ${S.bulkDeleteSelection.size} selected user(s)? This can only be done once per day.`)) return;

    try {
      const body = { user_ids: [...S.bulkDeleteSelection] };
      if (S.targetIsGame) body.game = true;

      await H.apiCall(reviewUrl(null, 'bulk-delete'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      S.bulkDeleteMode = false;
      S.bulkDeleteSelection.clear();
      await H.loadReviews();
    } catch (e) {
      alert(`Bulk delete failed: ${e.message}`);
    }
  };

  H.rateReview = async function rateReview(reviewId, vote) {
    try {
      const body = { vote };
      if (S.targetIsGame) body.game = true;

      await H.apiCall(reviewUrl(reviewId, 'rate'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      await H.loadReviews();
    } catch (e) {
      alert(`Failed to rate review: ${e.message}`);
    }
  };

  H.rateProfile = async function rateProfile(vote) {
    try {
      const body = { vote };
      if (S.targetIsGame) body.game = true;

      await H.apiCall(reviewUrl(null, 'rate'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      await H.loadReviews();
    } catch (e) {
      alert(`Failed to rate profile: ${e.message}`);
    }
  };

  H.setBlock = async function setBlock(userId, blocked) {
    try {
      const body = { user_id: userId, blocked };
      if (S.targetIsGame) body.game = true;

      await H.apiCall(reviewUrl(null, 'block'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      await H.loadReviews();
    } catch (e) {
      alert(`Block failed: ${e.message}`);
    }
  };
})();

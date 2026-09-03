import { apiCall, reviewUrl } from './api';
import { state } from './state';
import { loadReviews } from './data';

export async function submitReview(): Promise<void> {
  const input = document.getElementById('hr-review-input') as HTMLTextAreaElement | null;
  const content = input?.value.trim() ?? '';
  if (!content) return alert('Review cannot be empty.');
  if (content.length > 8000) return alert('Review is too long.');

  try {
    const body: any = { content };
    if (state.targetIsGame) body.game = true;

    await apiCall(reviewUrl(state.targetId, state.targetIsGame), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (input) input.value = '';
    const charCount = document.getElementById('hr-char-count');
    if (charCount) charCount.textContent = '0';
    await loadReviews();
  } catch (e: any) {
    alert(`Failed to submit review: ${e?.message ?? String(e)}`);
  }
}

export async function editReview(reviewId: string, newContent: string): Promise<void> {
  if (!newContent.trim()) return alert('Review cannot be empty.');

  try {
    const body: any = { content: newContent };
    if (state.targetIsGame) body.game = true;

    await apiCall(reviewUrl(state.targetId, state.targetIsGame, reviewId), {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    await loadReviews();
  } catch (e: any) {
    alert(`Failed to edit review: ${e?.message ?? String(e)}`);
  }
}

export async function deleteReview(reviewId: string): Promise<void> {
  if (!confirm('Are you sure you want to delete this review?')) return;

  try {
    await apiCall(reviewUrl(state.targetId, state.targetIsGame, reviewId), { method: 'DELETE' });
    await loadReviews();
  } catch (e: any) {
    alert(`Failed to delete review: ${e?.message ?? String(e)}`);
  }
}

export async function bulkDelete(): Promise<void> {
  if (state.bulkDeleteSelection.size === 0) return alert('No users selected.');
  if (!confirm(`Delete all reviews from ${state.bulkDeleteSelection.size} selected user(s)? This can only be done once per day.`)) return;

  try {
    const body: any = { user_ids: [...state.bulkDeleteSelection] };
    if (state.targetIsGame) body.game = true;

    await apiCall(reviewUrl(state.targetId, state.targetIsGame, null, 'bulk-delete'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    state.bulkDeleteMode = false;
    state.bulkDeleteSelection.clear();
    await loadReviews();
  } catch (e: any) {
    alert(`Bulk delete failed: ${e?.message ?? String(e)}`);
  }
}

export async function rateReview(reviewId: string, vote: 'up' | 'down'): Promise<void> {
  try {
    const body: any = { vote };
    if (state.targetIsGame) body.game = true;

    await apiCall(reviewUrl(state.targetId, state.targetIsGame, reviewId, 'rate'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    await loadReviews();
  } catch (e: any) {
    alert(`Failed to rate review: ${e?.message ?? String(e)}`);
  }
}

export async function rateProfile(vote: 'up' | 'down'): Promise<void> {
  try {
    const body: any = { vote };
    if (state.targetIsGame) body.game = true;

    await apiCall(reviewUrl(state.targetId, state.targetIsGame, null, 'rate'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    await loadReviews();
  } catch (e: any) {
    alert(`Failed to rate profile: ${e?.message ?? String(e)}`);
  }
}

export async function setBlock(userId: number, blocked: boolean): Promise<void> {
  try {
    const body: any = { user_id: userId, blocked };
    if (state.targetIsGame) body.game = true;

    await apiCall(reviewUrl(state.targetId, state.targetIsGame, null, 'block'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    await loadReviews();
  } catch (e: any) {
    alert(`Block failed: ${e?.message ?? String(e)}`);
  }
}

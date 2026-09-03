(() => {
  const H = globalThis.Hermivore = globalThis.Hermivore || {};

  H.injectCSS = function injectCSS() {
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
  };

  H.applyTheme = function applyTheme() {
    const el = document.getElementById('hermivore-reviews-container');
    if (el) el.classList.toggle('hrv-dark', H.isPageDark());
  };
})();

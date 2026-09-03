(() => {
  const H = globalThis.Hermivore = globalThis.Hermivore || {};
  const S = H.state;

  H.findGameTabBar = function findGameTabBar() {
    return document.querySelector('#horizontal-tabs') ||
           document.querySelector('.tabs-horizontal ul') ||
           document.querySelector('ul[role="tablist"]');
  };

  H.setupGameReviewsTab = function setupGameReviewsTab() {
    if (!S.targetIsGame) return false;
    if (document.getElementById('hr-tab-reviews')) return true;

    const tabList = H.findGameTabBar();
    if (!tabList) return false;

    const sample = tabList.querySelector('li');
    const li = document.createElement('li');
    li.id = 'hr-tab-reviews';
    if (sample) li.className = sample.className;

    const sampleLink = sample ? sample.querySelector('a,button') : null;
    const link = document.createElement(sampleLink ? sampleLink.tagName.toLowerCase() : 'a');
    if (sampleLink) link.className = sampleLink.className;
    link.textContent = 'Reviews';
    link.href = '#';
    li.appendChild(link);

    [li, link].forEach(el => {
      el.className = String(el.className).split(/\s+/)
        .filter(c => c && !/active|selected|current/i.test(c)).join(' ');
    });

    tabList.appendChild(li);
    return true;
  };

  H.applyTabVisibility = function applyTabVisibility() {
    const content = document.querySelector('.tab-content') || document.querySelector('.rbx-tab-content');
    const container = document.getElementById('hermivore-reviews-container');
    if (content) content.style.display = S.reviewsTabActive ? 'none' : '';
    if (container) container.style.display = S.reviewsTabActive ? '' : 'none';
  };

  H.setReviewsTab = function setReviewsTab(on) {
    S.reviewsTabActive = on;

    const tabList = H.findGameTabBar();
    if (tabList) {
      tabList.querySelectorAll('li').forEach(li => {
        const isOurs = li.id === 'hr-tab-reviews';
        const link = li.querySelector('a,button');
        if (isOurs) {
          li.classList.toggle('active', on);
          if (link) link.classList.toggle('active', on);
        } else if (on) {
          li.classList.remove('active');
          if (link) link.classList.remove('active');
        }
      });
    }

    H.applyTabVisibility();
    requestAnimationFrame(H.applyTabVisibility);
    setTimeout(H.applyTabVisibility, 50);

    if (on) {
      const container = document.getElementById('hermivore-reviews-container');
      if (container) container.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  document.addEventListener('click', event => {
    if (!S.targetIsGame || !(event.target instanceof Element)) return;

    if (event.target.closest('#hr-tab-reviews')) {
      event.preventDefault();
      event.stopPropagation();
      H.setReviewsTab(true);
      return;
    }

    const tabList = H.findGameTabBar();
    if (tabList && tabList.contains(event.target) && S.reviewsTabActive) {
      H.setReviewsTab(false);
    }
  }, true);

  window.addEventListener('hashchange', () => {
    if (S.targetIsGame && S.reviewsTabActive) H.setReviewsTab(false);
  });

  window.addEventListener('popstate', () => {
    if (S.targetIsGame && S.reviewsTabActive) H.setReviewsTab(false);
  });
})();

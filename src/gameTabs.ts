import { state } from './state';

export function findGameTabBar(): Element | null {
  return document.querySelector('#horizontal-tabs') || document.querySelector('.tabs-horizontal ul') || document.querySelector('ul[role="tablist"]');
}

export function setupGameReviewsTab(): boolean {
  const S = state;
  if (!S.targetIsGame) return false;
  if (document.getElementById('hr-tab-reviews')) return true;

  const tabList = findGameTabBar();
  if (!tabList) return false;

  const sample = tabList.querySelector('li');
  const li = document.createElement('li');
  li.id = 'hr-tab-reviews';
  if (sample) li.className = (sample as HTMLElement).className;

  const sampleLink = sample ? sample.querySelector('a,button') : null;
  const link = document.createElement(sampleLink ? sampleLink.tagName.toLowerCase() : 'a');
  if (sampleLink) (link as HTMLElement).className = (sampleLink as HTMLElement).className;
  link.textContent = 'Reviews';
  (link as HTMLAnchorElement).href = '#';
  li.appendChild(link);

  [li, link].forEach(el => {
    (el as HTMLElement).className = String((el as HTMLElement).className).split(/\s+/).filter(c => c && !/active|selected|current/i.test(c)).join(' ');
  });

  tabList.appendChild(li);

  // Attach a direct click handler to our new tab so clicks reliably open the reviews tab
  try {
    const created = document.getElementById('hr-tab-reviews');
    const linkEl = created ? created.querySelector('a,button') as HTMLElement | null : null;
    if (linkEl) {
      linkEl.addEventListener('click', ev => {
        ev.preventDefault();
        ev.stopPropagation();
        setReviewsTab(true);
      });
    } else if (created) {
      // Fallback: click on the LI itself
      created.addEventListener('click', ev => {
        ev.preventDefault();
        ev.stopPropagation();
        setReviewsTab(true);
      });
    }
  } catch (e) {
    // swallow — non-critical
  }

  return true;
}


export function applyTabVisibility(): void {
  const S = state;
  const content = document.querySelector('.tab-content') || document.querySelector('.rbx-tab-content');
  const container = document.getElementById('hermivore-reviews-container');
  if (content) (content as HTMLElement).style.display = S.reviewsTabActive ? 'none' : '';
  if (container) container.style.display = S.reviewsTabActive ? '' : 'none';
}

export function setReviewsTab(on: boolean): void {
  const S = state;
  S.reviewsTabActive = on;

  const tabList = findGameTabBar();
  if (tabList) {
    tabList.querySelectorAll('li').forEach(li => {
      const isOurs = li.id === 'hr-tab-reviews';
      const link = li.querySelector('a,button') as HTMLElement | null;
      if (isOurs) {
        li.classList.toggle('active', on);
        if (link) link.classList.toggle('active', on);
      } else if (on) {
        li.classList.remove('active');
        if (link) link.classList.remove('active');
      }
    });
  }

  applyTabVisibility();
  requestAnimationFrame(applyTabVisibility);
  setTimeout(applyTabVisibility, 50);

  if (on) {
    const container = document.getElementById('hermivore-reviews-container');
    if (container) container.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

let listenersAttached = false;

export function initGameTabListeners(): void {
  if (listenersAttached) return;
  listenersAttached = true;

  document.addEventListener('click', event => {
    const S = state;
    if (!S.targetIsGame || !(event.target instanceof Element)) return;

    if ((event.target as Element).closest('#hr-tab-reviews')) {
      event.preventDefault();
      event.stopPropagation();
      setReviewsTab(true);
      return;
    }

    const tabList = findGameTabBar();
    if (tabList && tabList.contains(event.target as Node) && S.reviewsTabActive) {
      setReviewsTab(false);
    }
  }, true);

  window.addEventListener('hashchange', () => {
    if (state.targetIsGame && state.reviewsTabActive) setReviewsTab(false);
  });

  window.addEventListener('popstate', () => {
    if (state.targetIsGame && state.reviewsTabActive) setReviewsTab(false);
  });
}

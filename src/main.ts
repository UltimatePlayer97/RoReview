import { init, setupGlobalNavigationObserver } from './init';
import { initGameTabListeners } from './gameTabs';

// Entry point
initGameTabListeners();
init();
setupGlobalNavigationObserver();

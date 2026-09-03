import type { CurrentUser, Review, ReviewRating } from './types';

export interface HermivoreState {
  currentUser: CurrentUser | null;

  targetId: string | null;
  targetIsGame: boolean;
  targetUsername: string;

  reviewsTabActive: boolean;

  allReviews: Review[];

  currentPage: number;

  activeObserver: MutationObserver | null;

  bulkDeleteMode: boolean;
  bulkDeleteSelection: Set<number>;

  blockedUsers: number[];

  viewerBlocked: boolean;

  avatarCache: Record<number, string>;

  profileRating: ReviewRating;

  lastPath: string;
}

export const state: HermivoreState = {
  currentUser: null,

  targetId: null,
  targetIsGame: false,
  targetUsername: '',

  reviewsTabActive: false,

  allReviews: [],

  currentPage: 1,

  activeObserver: null,

  bulkDeleteMode: false,
  bulkDeleteSelection: new Set(),

  blockedUsers: [],

  viewerBlocked: false,

  avatarCache: {},

  profileRating: { up: [], down: [] },

  lastPath: location.pathname,
};

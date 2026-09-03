export type Vote = 'up' | 'down';

export interface User {
  id: number;
  name: string;
}

export interface ReviewScore {
  up: number;
  down: number;
}

export interface ReviewRating {
  up: number[];
  down: number[];
}

export interface Review {
  id: string;
  content: string;
  time: number;
  edited?: boolean;

  from: User;

  score: ReviewScore;
  rating: ReviewRating;
}

export interface CurrentUser {
  id: number;
  name: string;
  session_token?: string;
}

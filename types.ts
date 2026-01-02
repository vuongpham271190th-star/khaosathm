
export type RatingLevel = 'satisfied' | 'unsatisfied';

export interface Review {
  id: string;
  className: string;
  ratings: Record<string, RatingLevel>;
  comment: string;
  submissionDate: string;
  ipAddress: string;
}

export interface IPLog {
  id: string;
  ipAddress: string;
  className: string;
  timestamp: string;
}

export type View = 'parent' | 'admin';
export type Language = 'vi';
export type Theme = 'light' | 'dark';

export type UserRole = 'superadmin' | 'admin';

export interface LoggedInUser {
  id: string;
  username: string;
  role: UserRole;
}

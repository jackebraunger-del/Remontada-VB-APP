import type { Category, Gender, PreferredSide, SkillLevel } from './remontada-types';

export interface OnlineProfile {
  id: string;
  display_name: string;
  gender: Gender;
  preferred_side: PreferredSide | null;
}
export interface OnlineMember {
  user_id: string;
  team: 1 | 2;
  profiles: { display_name: string };
}
export interface OnlineResult {
  match_id: string;
  reporter_id: string;
  winning_team: 1 | 2;
  score: string;
  status: 'pending' | 'confirmed' | 'disputed';
  reported_at: string;
  reviewed_by: string | null;
}
export interface OnlineMatch {
  id: string;
  creator_id: string;
  location: string;
  starts_at: string;
  category: Category;
  skill: SkillLevel;
  status: 'open' | 'awaiting_confirmation' | 'completed' | 'cancelled';
  match_members: OnlineMember[];
  match_results: OnlineResult | null;
}
export interface CreateOnlineMatch {
  location: string;
  startsAt: string;
  category: string;
  skill: string;
  requestId: string;
}

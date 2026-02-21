// Tournament types and interfaces

export type TournamentStatus = 'draft' | 'upcoming' | 'active' | 'paused' | 'completed' | 'cancelled';
export type TournamentType = 'swiss' | 'arena';
export type EntryType = 'free' | 'paid';
export type CertificateType = 'participation' | 'winner' | 'top_n';

export interface Tournament {
  id: string;
  name: string;
  description: string | null;
  start_date: string;
  total_rounds: number;
  time_control: string;
  max_players: number;
  entry_type: EntryType;
  entry_fee: number | null;
  required_points: number;
  tournament_type: TournamentType;
  duration_minutes: number | null;
  win_streak_bonus: boolean;
  auto_start: boolean;
  registration_deadline: string | null;
  certificate_type: CertificateType;
  certificate_top_n: number | null;
  status: TournamentStatus;
  current_round: number | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  win_points_bonus: number | null;
  draw_points_bonus: number | null;
  prize_description: string | null;
}

export interface TournamentRegistration {
  id: string;
  tournament_id: string;
  user_id: string;
  profile_id: string;
  player_number: number;
  points: number;
  buchholz: number;
  games_played: number;
  wins: number;
  draws: number;
  losses: number;
  arena_score: number;
  current_streak: number;
  last_game_at: string | null;
  is_disqualified: boolean;
  disqualification_reason: string | null;
  registered_at: string;
  profiles?: {
    username: string | null;
    avatar_url: string | null;
  };
}

export interface TournamentRound {
  id: string;
  tournament_id: string;
  round_number: number;
  status: string;
  started_at: string | null;
  ended_at: string | null;
  created_at: string;
}

export interface TournamentMatch {
  id: string;
  tournament_id: string;
  round_id: string;
  white_player_id: string | null;
  black_player_id: string | null;
  board_number: number;
  result: string | null;
  white_points: number | null;
  black_points: number | null;
  pgn: string | null;
  room_code: string | null;
  status: string;
  started_at: string | null;
  ended_at: string | null;
  forfeit_by: string | null;
  forfeit_reason: string | null;
  time_limit_seconds: number | null;
  created_at: string;
  white_player?: TournamentRegistration;
  black_player?: TournamentRegistration;
}

export interface CreateTournamentData {
  name: string;
  description?: string;
  start_date: string;
  tournament_type: TournamentType;
  total_rounds: number;
  duration_minutes?: number;
  time_control: string;
  max_players: number;
  entry_type: EntryType;
  entry_fee?: number;
  required_points?: number;
  win_streak_bonus?: boolean;
  auto_start?: boolean;
  registration_deadline?: string;
  certificate_type: CertificateType;
  certificate_top_n?: number;
  status: TournamentStatus;
  win_points_bonus?: number;
  draw_points_bonus?: number;
  prize_description?: string;
}

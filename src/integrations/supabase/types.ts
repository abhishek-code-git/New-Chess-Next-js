export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      certificates: {
        Row: {
          certificate_id: string
          certificate_type: Database["public"]["Enums"]["certificate_type"]
          id: string
          issued_at: string | null
          player_name: string
          profile_id: string
          rank: number | null
          tournament_id: string
          tournament_name: string
          user_id: string
        }
        Insert: {
          certificate_id: string
          certificate_type: Database["public"]["Enums"]["certificate_type"]
          id?: string
          issued_at?: string | null
          player_name: string
          profile_id: string
          rank?: number | null
          tournament_id: string
          tournament_name: string
          user_id: string
        }
        Update: {
          certificate_id?: string
          certificate_type?: Database["public"]["Enums"]["certificate_type"]
          id?: string
          issued_at?: string | null
          player_name?: string
          profile_id?: string
          rank?: number | null
          tournament_id?: string
          tournament_name?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "certificates_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "leaderboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "certificates_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "certificates_tournament_id_fkey"
            columns: ["tournament_id"]
            isOneToOne: false
            referencedRelation: "tournaments"
            referencedColumns: ["id"]
          },
        ]
      }
      games: {
        Row: {
          created_at: string | null
          difficulty: string | null
          ended_at: string | null
          game_mode: string
          id: string
          pgn: string | null
          player_black: string | null
          player_white: string | null
          points_earned: number | null
          result: string | null
          winner: string | null
        }
        Insert: {
          created_at?: string | null
          difficulty?: string | null
          ended_at?: string | null
          game_mode: string
          id?: string
          pgn?: string | null
          player_black?: string | null
          player_white?: string | null
          points_earned?: number | null
          result?: string | null
          winner?: string | null
        }
        Update: {
          created_at?: string | null
          difficulty?: string | null
          ended_at?: string | null
          game_mode?: string
          id?: string
          pgn?: string | null
          player_black?: string | null
          player_white?: string | null
          points_earned?: number | null
          result?: string | null
          winner?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "games_player_black_fkey"
            columns: ["player_black"]
            isOneToOne: false
            referencedRelation: "leaderboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "games_player_black_fkey"
            columns: ["player_black"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "games_player_white_fkey"
            columns: ["player_white"]
            isOneToOne: false
            referencedRelation: "leaderboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "games_player_white_fkey"
            columns: ["player_white"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "games_winner_fkey"
            columns: ["winner"]
            isOneToOne: false
            referencedRelation: "leaderboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "games_winner_fkey"
            columns: ["winner"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          draws: number | null
          id: string
          losses: number | null
          points: number | null
          total_games: number | null
          updated_at: string | null
          user_id: string
          username: string | null
          wallet_balance: number | null
          wins: number | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          draws?: number | null
          id?: string
          losses?: number | null
          points?: number | null
          total_games?: number | null
          updated_at?: string | null
          user_id: string
          username?: string | null
          wallet_balance?: number | null
          wins?: number | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          draws?: number | null
          id?: string
          losses?: number | null
          points?: number | null
          total_games?: number | null
          updated_at?: string | null
          user_id?: string
          username?: string | null
          wallet_balance?: number | null
          wins?: number | null
        }
        Relationships: []
      }
      tournament_matches: {
        Row: {
          black_player_id: string | null
          black_points: number | null
          board_number: number
          created_at: string | null
          ended_at: string | null
          forfeit_by: string | null
          forfeit_reason: string | null
          id: string
          pgn: string | null
          result: string | null
          room_code: string | null
          round_id: string
          started_at: string | null
          status: string
          time_limit_seconds: number | null
          tournament_id: string
          white_player_id: string | null
          white_points: number | null
        }
        Insert: {
          black_player_id?: string | null
          black_points?: number | null
          board_number: number
          created_at?: string | null
          ended_at?: string | null
          forfeit_by?: string | null
          forfeit_reason?: string | null
          id?: string
          pgn?: string | null
          result?: string | null
          room_code?: string | null
          round_id: string
          started_at?: string | null
          status?: string
          time_limit_seconds?: number | null
          tournament_id: string
          white_player_id?: string | null
          white_points?: number | null
        }
        Update: {
          black_player_id?: string | null
          black_points?: number | null
          board_number?: number
          created_at?: string | null
          ended_at?: string | null
          forfeit_by?: string | null
          forfeit_reason?: string | null
          id?: string
          pgn?: string | null
          result?: string | null
          room_code?: string | null
          round_id?: string
          started_at?: string | null
          status?: string
          time_limit_seconds?: number | null
          tournament_id?: string
          white_player_id?: string | null
          white_points?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "tournament_matches_black_player_id_fkey"
            columns: ["black_player_id"]
            isOneToOne: false
            referencedRelation: "tournament_registrations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tournament_matches_round_id_fkey"
            columns: ["round_id"]
            isOneToOne: false
            referencedRelation: "tournament_rounds"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tournament_matches_tournament_id_fkey"
            columns: ["tournament_id"]
            isOneToOne: false
            referencedRelation: "tournaments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tournament_matches_white_player_id_fkey"
            columns: ["white_player_id"]
            isOneToOne: false
            referencedRelation: "tournament_registrations"
            referencedColumns: ["id"]
          },
        ]
      }
      tournament_registrations: {
        Row: {
          arena_score: number | null
          buchholz: number | null
          current_streak: number | null
          disqualification_reason: string | null
          draws: number | null
          games_played: number | null
          id: string
          is_disqualified: boolean | null
          last_game_at: string | null
          losses: number | null
          player_number: number
          points: number | null
          profile_id: string
          registered_at: string | null
          tournament_id: string
          user_id: string
          wins: number | null
        }
        Insert: {
          arena_score?: number | null
          buchholz?: number | null
          current_streak?: number | null
          disqualification_reason?: string | null
          draws?: number | null
          games_played?: number | null
          id?: string
          is_disqualified?: boolean | null
          last_game_at?: string | null
          losses?: number | null
          player_number: number
          points?: number | null
          profile_id: string
          registered_at?: string | null
          tournament_id: string
          user_id: string
          wins?: number | null
        }
        Update: {
          arena_score?: number | null
          buchholz?: number | null
          current_streak?: number | null
          disqualification_reason?: string | null
          draws?: number | null
          games_played?: number | null
          id?: string
          is_disqualified?: boolean | null
          last_game_at?: string | null
          losses?: number | null
          player_number?: number
          points?: number | null
          profile_id?: string
          registered_at?: string | null
          tournament_id?: string
          user_id?: string
          wins?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "tournament_registrations_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "leaderboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tournament_registrations_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tournament_registrations_tournament_id_fkey"
            columns: ["tournament_id"]
            isOneToOne: false
            referencedRelation: "tournaments"
            referencedColumns: ["id"]
          },
        ]
      }
      tournament_rounds: {
        Row: {
          created_at: string | null
          ended_at: string | null
          id: string
          round_number: number
          started_at: string | null
          status: string
          tournament_id: string
        }
        Insert: {
          created_at?: string | null
          ended_at?: string | null
          id?: string
          round_number: number
          started_at?: string | null
          status?: string
          tournament_id: string
        }
        Update: {
          created_at?: string | null
          ended_at?: string | null
          id?: string
          round_number?: number
          started_at?: string | null
          status?: string
          tournament_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tournament_rounds_tournament_id_fkey"
            columns: ["tournament_id"]
            isOneToOne: false
            referencedRelation: "tournaments"
            referencedColumns: ["id"]
          },
        ]
      }
      tournaments: {
        Row: {
          auto_start: boolean | null
          certificate_top_n: number | null
          certificate_type: Database["public"]["Enums"]["certificate_type"]
          created_at: string | null
          created_by: string | null
          current_round: number | null
          description: string | null
          draw_points_bonus: number | null
          duration_minutes: number | null
          entry_fee: number | null
          entry_type: Database["public"]["Enums"]["entry_type"]
          id: string
          max_players: number
          name: string
          prize_description: string | null
          registration_deadline: string | null
          required_points: number | null
          start_date: string
          status: Database["public"]["Enums"]["tournament_status"]
          time_control: string
          total_rounds: number
          tournament_type: Database["public"]["Enums"]["tournament_type"]
          updated_at: string | null
          win_points_bonus: number | null
          win_streak_bonus: boolean | null
        }
        Insert: {
          auto_start?: boolean | null
          certificate_top_n?: number | null
          certificate_type?: Database["public"]["Enums"]["certificate_type"]
          created_at?: string | null
          created_by?: string | null
          current_round?: number | null
          description?: string | null
          draw_points_bonus?: number | null
          duration_minutes?: number | null
          entry_fee?: number | null
          entry_type?: Database["public"]["Enums"]["entry_type"]
          id?: string
          max_players?: number
          name: string
          prize_description?: string | null
          registration_deadline?: string | null
          required_points?: number | null
          start_date: string
          status?: Database["public"]["Enums"]["tournament_status"]
          time_control?: string
          total_rounds?: number
          tournament_type?: Database["public"]["Enums"]["tournament_type"]
          updated_at?: string | null
          win_points_bonus?: number | null
          win_streak_bonus?: boolean | null
        }
        Update: {
          auto_start?: boolean | null
          certificate_top_n?: number | null
          certificate_type?: Database["public"]["Enums"]["certificate_type"]
          created_at?: string | null
          created_by?: string | null
          current_round?: number | null
          description?: string | null
          draw_points_bonus?: number | null
          duration_minutes?: number | null
          entry_fee?: number | null
          entry_type?: Database["public"]["Enums"]["entry_type"]
          id?: string
          max_players?: number
          name?: string
          prize_description?: string | null
          registration_deadline?: string | null
          required_points?: number | null
          start_date?: string
          status?: Database["public"]["Enums"]["tournament_status"]
          time_control?: string
          total_rounds?: number
          tournament_type?: Database["public"]["Enums"]["tournament_type"]
          updated_at?: string | null
          win_points_bonus?: number | null
          win_streak_bonus?: boolean | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      withdrawals: {
        Row: {
          admin_notes: string | null
          amount: number
          created_at: string | null
          id: string
          payment_details: Json | null
          payment_method: string | null
          points_used: number
          processed_at: string | null
          status: string | null
          user_id: string
        }
        Insert: {
          admin_notes?: string | null
          amount: number
          created_at?: string | null
          id?: string
          payment_details?: Json | null
          payment_method?: string | null
          points_used: number
          processed_at?: string | null
          status?: string | null
          user_id: string
        }
        Update: {
          admin_notes?: string | null
          amount?: number
          created_at?: string | null
          id?: string
          payment_details?: Json | null
          payment_method?: string | null
          points_used?: number
          processed_at?: string | null
          status?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "withdrawals_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "withdrawals_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      leaderboard: {
        Row: {
          avatar_url: string | null
          draws: number | null
          id: string | null
          losses: number | null
          points: number | null
          rank: number | null
          total_games: number | null
          user_id: string | null
          username: string | null
          win_rate: number | null
          wins: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      check_match_forfeit: {
        Args: { p_match_id: string; p_timeout_seconds?: number }
        Returns: undefined
      }
      find_arena_opponent: {
        Args: { p_player_registration_id: string; p_tournament_id: string }
        Returns: string
      }
      generate_certificate_id: { Args: never; Returns: string }
      get_next_player_number: {
        Args: { p_tournament_id: string }
        Returns: number
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      refund_points_on_cancellation: {
        Args: { p_tournament_id: string }
        Returns: undefined
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
      certificate_type: "participation" | "winner" | "top_n"
      entry_type: "free" | "paid"
      tournament_status:
        | "draft"
        | "upcoming"
        | "active"
        | "paused"
        | "completed"
        | "cancelled"
      tournament_type: "swiss" | "arena"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "moderator", "user"],
      certificate_type: ["participation", "winner", "top_n"],
      entry_type: ["free", "paid"],
      tournament_status: [
        "draft",
        "upcoming",
        "active",
        "paused",
        "completed",
        "cancelled",
      ],
      tournament_type: ["swiss", "arena"],
    },
  },
} as const

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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      card_reports: {
        Row: {
          card_id: string
          card_text: string | null
          created_at: string
          id: string
          reason: string | null
          room_code: string | null
        }
        Insert: {
          card_id: string
          card_text?: string | null
          created_at?: string
          id?: string
          reason?: string | null
          room_code?: string | null
        }
        Update: {
          card_id?: string
          card_text?: string | null
          created_at?: string
          id?: string
          reason?: string | null
          room_code?: string | null
        }
        Relationships: []
      }
      hands: {
        Row: {
          cards: Json
          player_id: string
        }
        Insert: {
          cards?: Json
          player_id: string
        }
        Update: {
          cards?: Json
          player_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "hands_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: true
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
        ]
      }
      players: {
        Row: {
          avatar: string
          created_at: string
          has_left: boolean
          id: string
          is_ready: boolean
          last_seen: string
          name: string
          room_id: string
          rounds_won: number
          score: number
          secret: string
          votes_received: number
        }
        Insert: {
          avatar?: string
          created_at?: string
          has_left?: boolean
          id?: string
          is_ready?: boolean
          last_seen?: string
          name: string
          room_id: string
          rounds_won?: number
          score?: number
          secret: string
          votes_received?: number
        }
        Update: {
          avatar?: string
          created_at?: string
          has_left?: boolean
          id?: string
          is_ready?: boolean
          last_seen?: string
          name?: string
          room_id?: string
          rounds_won?: number
          score?: number
          secret?: string
          votes_received?: number
        }
        Relationships: [
          {
            foreignKeyName: "players_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      rooms: {
        Row: {
          categories: string[]
          code: string
          created_at: string
          current_round_id: string | null
          hidden_cards: string[]
          host_player_id: string | null
          id: string
          max_players: number
          max_rounds: number
          mode: string
          round_number: number
          status: string
          updated_at: string
          used_prompts: string[]
          used_responses: string[]
        }
        Insert: {
          categories?: string[]
          code: string
          created_at?: string
          current_round_id?: string | null
          hidden_cards?: string[]
          host_player_id?: string | null
          id?: string
          max_players?: number
          max_rounds?: number
          mode?: string
          round_number?: number
          status?: string
          updated_at?: string
          used_prompts?: string[]
          used_responses?: string[]
        }
        Update: {
          categories?: string[]
          code?: string
          created_at?: string
          current_round_id?: string | null
          hidden_cards?: string[]
          host_player_id?: string | null
          id?: string
          max_players?: number
          max_rounds?: number
          mode?: string
          round_number?: number
          status?: string
          updated_at?: string
          used_prompts?: string[]
          used_responses?: string[]
        }
        Relationships: []
      }
      rounds: {
        Row: {
          created_at: string
          deadline: string | null
          id: string
          number: number
          phase: string
          presenter_id: string | null
          prompt: Json
          room_id: string
          special: Json | null
          target_id: string | null
        }
        Insert: {
          created_at?: string
          deadline?: string | null
          id?: string
          number: number
          phase?: string
          presenter_id?: string | null
          prompt: Json
          room_id: string
          special?: Json | null
          target_id?: string | null
        }
        Update: {
          created_at?: string
          deadline?: string | null
          id?: string
          number?: number
          phase?: string
          presenter_id?: string | null
          prompt?: Json
          room_id?: string
          special?: Json | null
          target_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "rounds_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      submissions: {
        Row: {
          card: Json
          created_at: string
          id: string
          player_id: string
          round_id: string
          votes: number
        }
        Insert: {
          card: Json
          created_at?: string
          id?: string
          player_id: string
          round_id: string
          votes?: number
        }
        Update: {
          card?: Json
          created_at?: string
          id?: string
          player_id?: string
          round_id?: string
          votes?: number
        }
        Relationships: [
          {
            foreignKeyName: "submissions_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "submissions_round_id_fkey"
            columns: ["round_id"]
            isOneToOne: false
            referencedRelation: "rounds"
            referencedColumns: ["id"]
          },
        ]
      }
      votes: {
        Row: {
          created_at: string
          id: string
          round_id: string
          submission_id: string
          voter_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          round_id: string
          submission_id: string
          voter_id: string
        }
        Update: {
          created_at?: string
          id?: string
          round_id?: string
          submission_id?: string
          voter_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "votes_round_id_fkey"
            columns: ["round_id"]
            isOneToOne: false
            referencedRelation: "rounds"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "votes_submission_id_fkey"
            columns: ["submission_id"]
            isOneToOne: false
            referencedRelation: "submissions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "votes_voter_id_fkey"
            columns: ["voter_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const

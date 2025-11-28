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
      evidence_items: {
        Row: {
          blockchain_timestamp: string | null
          created_at: string | null
          description: string | null
          evidence_type: string
          file_hash: string
          file_url: string | null
          id: string
          metadata: Json | null
          status: string | null
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          blockchain_timestamp?: string | null
          created_at?: string | null
          description?: string | null
          evidence_type: string
          file_hash: string
          file_url?: string | null
          id?: string
          metadata?: Json | null
          status?: string | null
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          blockchain_timestamp?: string | null
          created_at?: string | null
          description?: string | null
          evidence_type?: string
          file_hash?: string
          file_url?: string | null
          id?: string
          metadata?: Json | null
          status?: string | null
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      geo_captures: {
        Row: {
          browser_fingerprint: string | null
          captured_at: string | null
          device_info: Json | null
          geolocation: Json | null
          id: string
          ip_address: string | null
          screenshot_url: string | null
          tracking_link_id: string
        }
        Insert: {
          browser_fingerprint?: string | null
          captured_at?: string | null
          device_info?: Json | null
          geolocation?: Json | null
          id?: string
          ip_address?: string | null
          screenshot_url?: string | null
          tracking_link_id: string
        }
        Update: {
          browser_fingerprint?: string | null
          captured_at?: string | null
          device_info?: Json | null
          geolocation?: Json | null
          id?: string
          ip_address?: string | null
          screenshot_url?: string | null
          tracking_link_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "geo_captures_tracking_link_id_fkey"
            columns: ["tracking_link_id"]
            isOneToOne: false
            referencedRelation: "tracking_links"
            referencedColumns: ["id"]
          },
        ]
      }
      linked_attackers: {
        Row: {
          attacker_fingerprint: string
          behavioral_patterns: Json | null
          first_seen: string | null
          id: string
          incident_count: number | null
          known_aliases: Json | null
          last_seen: string | null
          platforms: Json | null
          risk_score: number | null
        }
        Insert: {
          attacker_fingerprint: string
          behavioral_patterns?: Json | null
          first_seen?: string | null
          id?: string
          incident_count?: number | null
          known_aliases?: Json | null
          last_seen?: string | null
          platforms?: Json | null
          risk_score?: number | null
        }
        Update: {
          attacker_fingerprint?: string
          behavioral_patterns?: Json | null
          first_seen?: string | null
          id?: string
          incident_count?: number | null
          known_aliases?: Json | null
          last_seen?: string | null
          platforms?: Json | null
          risk_score?: number | null
        }
        Relationships: []
      }
      threat_incidents: {
        Row: {
          created_at: string | null
          harasser_profile_url: string | null
          harasser_username: string | null
          id: string
          incident_date: string
          incident_description: string
          linked_attacker_id: string | null
          metadata: Json | null
          platform: string
          reporter_id: string
          severity_level: string | null
        }
        Insert: {
          created_at?: string | null
          harasser_profile_url?: string | null
          harasser_username?: string | null
          id?: string
          incident_date: string
          incident_description: string
          linked_attacker_id?: string | null
          metadata?: Json | null
          platform: string
          reporter_id: string
          severity_level?: string | null
        }
        Update: {
          created_at?: string | null
          harasser_profile_url?: string | null
          harasser_username?: string | null
          id?: string
          incident_date?: string
          incident_description?: string
          linked_attacker_id?: string | null
          metadata?: Json | null
          platform?: string
          reporter_id?: string
          severity_level?: string | null
        }
        Relationships: []
      }
      tracking_links: {
        Row: {
          captures_count: number | null
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          link_code: string
          target_url: string | null
          title: string
          user_id: string
        }
        Insert: {
          captures_count?: number | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          link_code: string
          target_url?: string | null
          title: string
          user_id: string
        }
        Update: {
          captures_count?: number | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          link_code?: string
          target_url?: string | null
          title?: string
          user_id?: string
        }
        Relationships: []
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
    Enums: {},
  },
} as const

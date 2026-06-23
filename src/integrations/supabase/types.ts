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
      attendee_profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          display_name: string | null
          headline: string | null
          home_state: string | null
          hub_affiliations: string[]
          is_active_member: boolean
          linkedin_sub: string | null
          linkedin_url: string | null
          networking_opt_in: boolean
          registration_id: string | null
          sectors: string[]
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string | null
          headline?: string | null
          home_state?: string | null
          hub_affiliations?: string[]
          is_active_member?: boolean
          linkedin_sub?: string | null
          linkedin_url?: string | null
          networking_opt_in?: boolean
          registration_id?: string | null
          sectors?: string[]
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string | null
          headline?: string | null
          home_state?: string | null
          hub_affiliations?: string[]
          is_active_member?: boolean
          linkedin_sub?: string | null
          linkedin_url?: string | null
          networking_opt_in?: boolean
          registration_id?: string | null
          sectors?: string[]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "attendee_profiles_registration_id_fkey"
            columns: ["registration_id"]
            isOneToOne: true
            referencedRelation: "registrations"
            referencedColumns: ["id"]
          },
        ]
      }
      contact_submissions: {
        Row: {
          created_at: string
          email: string
          id: string
          message: string
          name: string
          status: string
          subject: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          message: string
          name: string
          status?: string
          subject: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          message?: string
          name?: string
          status?: string
          subject?: string
        }
        Relationships: []
      }
      hackathon_entries: {
        Row: {
          created_at: string
          deck_url: string | null
          id: string
          problem: string | null
          project_name: string | null
          repo_url: string | null
          solution: string | null
          status: string
          submitted_at: string | null
          summary: string | null
          track: string
          updated_at: string
          user_id: string
          video_url: string | null
        }
        Insert: {
          created_at?: string
          deck_url?: string | null
          id?: string
          problem?: string | null
          project_name?: string | null
          repo_url?: string | null
          solution?: string | null
          status?: string
          submitted_at?: string | null
          summary?: string | null
          track: string
          updated_at?: string
          user_id: string
          video_url?: string | null
        }
        Update: {
          created_at?: string
          deck_url?: string | null
          id?: string
          problem?: string | null
          project_name?: string | null
          repo_url?: string | null
          solution?: string | null
          status?: string
          submitted_at?: string | null
          summary?: string | null
          track?: string
          updated_at?: string
          user_id?: string
          video_url?: string | null
        }
        Relationships: []
      }
      hackathon_team_members: {
        Row: {
          accepted_user_id: string | null
          email: string
          entry_id: string
          full_name: string | null
          id: string
          invited_at: string
          role: string | null
        }
        Insert: {
          accepted_user_id?: string | null
          email: string
          entry_id: string
          full_name?: string | null
          id?: string
          invited_at?: string
          role?: string | null
        }
        Update: {
          accepted_user_id?: string | null
          email?: string
          entry_id?: string
          full_name?: string | null
          id?: string
          invited_at?: string
          role?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "hackathon_team_members_entry_id_fkey"
            columns: ["entry_id"]
            isOneToOne: false
            referencedRelation: "hackathon_entries"
            referencedColumns: ["id"]
          },
        ]
      }
      networking_connections: {
        Row: {
          created_at: string
          from_user: string
          note: string | null
          to_user: string
        }
        Insert: {
          created_at?: string
          from_user: string
          note?: string | null
          to_user: string
        }
        Update: {
          created_at?: string
          from_user?: string
          note?: string | null
          to_user?: string
        }
        Relationships: []
      }
      pwa_analytics: {
        Row: {
          created_at: string
          event_type: string
          id: string
          metadata: Json
          path: string | null
          platform: string | null
          session_id: string | null
          user_agent: string | null
        }
        Insert: {
          created_at?: string
          event_type: string
          id?: string
          metadata?: Json
          path?: string | null
          platform?: string | null
          session_id?: string | null
          user_agent?: string | null
        }
        Update: {
          created_at?: string
          event_type?: string
          id?: string
          metadata?: Json
          path?: string | null
          platform?: string | null
          session_id?: string | null
          user_agent?: string | null
        }
        Relationships: []
      }
      registrations: {
        Row: {
          accommodation_needed: boolean
          amount_kobo: number | null
          attendee_type: string
          audience_reach: string | null
          calendar_downloaded: boolean
          checked_in_at: string | null
          checked_in_by: string | null
          created_at: string
          dietary_restrictions: string | null
          email: string
          email_confirmed: boolean
          full_name: string
          heard_about_summit: string | null
          id: string
          media_coverage_focus: string | null
          media_outlet: string | null
          media_type: string | null
          organization: string | null
          payment_status: string
          paystack_reference: string | null
          phone: string
          prior_volunteer_experience: string | null
          profession: string | null
          pwa_installed: boolean
          reason_for_attending: string | null
          role_title: string | null
          sponsor_goals: string | null
          sponsor_tier: string | null
          state: string
          ticket_code: string
          track_selection: string | null
          travel_support_needed: boolean
          tshirt_size: string | null
          verification_checked_at: string | null
          verification_confidence: number | null
          verification_model: string | null
          verification_reason: string | null
          verification_status: string
          volunteer_availability: string | null
          volunteer_skills: string | null
          whatsapp_notified: boolean
          yali_certificate_url: string | null
          yali_id: string | null
        }
        Insert: {
          accommodation_needed?: boolean
          amount_kobo?: number | null
          attendee_type: string
          audience_reach?: string | null
          calendar_downloaded?: boolean
          checked_in_at?: string | null
          checked_in_by?: string | null
          created_at?: string
          dietary_restrictions?: string | null
          email: string
          email_confirmed?: boolean
          full_name: string
          heard_about_summit?: string | null
          id?: string
          media_coverage_focus?: string | null
          media_outlet?: string | null
          media_type?: string | null
          organization?: string | null
          payment_status?: string
          paystack_reference?: string | null
          phone: string
          prior_volunteer_experience?: string | null
          profession?: string | null
          pwa_installed?: boolean
          reason_for_attending?: string | null
          role_title?: string | null
          sponsor_goals?: string | null
          sponsor_tier?: string | null
          state: string
          ticket_code?: string
          track_selection?: string | null
          travel_support_needed?: boolean
          tshirt_size?: string | null
          verification_checked_at?: string | null
          verification_confidence?: number | null
          verification_model?: string | null
          verification_reason?: string | null
          verification_status?: string
          volunteer_availability?: string | null
          volunteer_skills?: string | null
          whatsapp_notified?: boolean
          yali_certificate_url?: string | null
          yali_id?: string | null
        }
        Update: {
          accommodation_needed?: boolean
          amount_kobo?: number | null
          attendee_type?: string
          audience_reach?: string | null
          calendar_downloaded?: boolean
          checked_in_at?: string | null
          checked_in_by?: string | null
          created_at?: string
          dietary_restrictions?: string | null
          email?: string
          email_confirmed?: boolean
          full_name?: string
          heard_about_summit?: string | null
          id?: string
          media_coverage_focus?: string | null
          media_outlet?: string | null
          media_type?: string | null
          organization?: string | null
          payment_status?: string
          paystack_reference?: string | null
          phone?: string
          prior_volunteer_experience?: string | null
          profession?: string | null
          pwa_installed?: boolean
          reason_for_attending?: string | null
          role_title?: string | null
          sponsor_goals?: string | null
          sponsor_tier?: string | null
          state?: string
          ticket_code?: string
          track_selection?: string | null
          travel_support_needed?: boolean
          tshirt_size?: string | null
          verification_checked_at?: string | null
          verification_confidence?: number | null
          verification_model?: string | null
          verification_reason?: string | null
          verification_status?: string
          volunteer_availability?: string | null
          volunteer_skills?: string | null
          whatsapp_notified?: boolean
          yali_certificate_url?: string | null
          yali_id?: string | null
        }
        Relationships: []
      }
      session_bookmarks: {
        Row: {
          created_at: string
          session_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          session_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          session_id?: string
          user_id?: string
        }
        Relationships: []
      }
      sponsor_inquiries: {
        Row: {
          assigned_to: string | null
          budget_range: string
          company_name: string
          contact_name: string
          created_at: string
          decision_timeline: string
          email: string
          goals: string
          id: string
          notes: string | null
          phone: string
          preferred_tier: string
          status: string
        }
        Insert: {
          assigned_to?: string | null
          budget_range: string
          company_name: string
          contact_name: string
          created_at?: string
          decision_timeline: string
          email: string
          goals: string
          id?: string
          notes?: string | null
          phone: string
          preferred_tier: string
          status?: string
        }
        Update: {
          assigned_to?: string | null
          budget_range?: string
          company_name?: string
          contact_name?: string
          created_at?: string
          decision_timeline?: string
          email?: string
          goals?: string
          id?: string
          notes?: string | null
          phone?: string
          preferred_tier?: string
          status?: string
        }
        Relationships: []
      }
      stats: {
        Row: {
          id: string
          key: string
          updated_at: string
          value: number
        }
        Insert: {
          id?: string
          key: string
          updated_at?: string
          value?: number
        }
        Update: {
          id?: string
          key?: string
          updated_at?: string
          value?: number
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      admin_dashboard_stats: { Args: never; Returns: Json }
      get_public_registration_confirmation: {
        Args: { registration_id: string }
        Returns: Json
      }
      get_public_ticket_by_code: {
        Args: { ticket_code_input: string }
        Returns: Json
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_checked_in: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "staff" | "hub_admin"
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
      app_role: ["admin", "staff", "hub_admin"],
    },
  },
} as const

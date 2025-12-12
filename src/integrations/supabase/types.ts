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
      audit_logs: {
        Row: {
          action: string
          created_at: string
          entity_id: string | null
          entity_type: string
          id: string
          ip_address: string | null
          new_values: Json | null
          old_values: Json | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          entity_id?: string | null
          entity_type: string
          id?: string
          ip_address?: string | null
          new_values?: Json | null
          old_values?: Json | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          entity_id?: string | null
          entity_type?: string
          id?: string
          ip_address?: string | null
          new_values?: Json | null
          old_values?: Json | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      bug_scan_reports: {
        Row: {
          auto_fixed_count: number | null
          created_at: string
          critical_count: number | null
          id: string
          issues_found: number | null
          report_data: Json | null
          scan_type: string
          status: string
          warnings_count: number | null
        }
        Insert: {
          auto_fixed_count?: number | null
          created_at?: string
          critical_count?: number | null
          id?: string
          issues_found?: number | null
          report_data?: Json | null
          scan_type: string
          status?: string
          warnings_count?: number | null
        }
        Update: {
          auto_fixed_count?: number | null
          created_at?: string
          critical_count?: number | null
          id?: string
          issues_found?: number | null
          report_data?: Json | null
          scan_type?: string
          status?: string
          warnings_count?: number | null
        }
        Relationships: []
      }
      calendar_events: {
        Row: {
          all_day: boolean | null
          assigned_to: string | null
          color: string | null
          created_at: string
          created_by: string | null
          description: string | null
          end_time: string
          event_type: Database["public"]["Enums"]["event_type"]
          family_id: string
          id: string
          location: string | null
          notes: string | null
          recurrence_rule: string | null
          recurring: boolean | null
          start_time: string
          title: string
          updated_at: string
        }
        Insert: {
          all_day?: boolean | null
          assigned_to?: string | null
          color?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          end_time: string
          event_type?: Database["public"]["Enums"]["event_type"]
          family_id: string
          id?: string
          location?: string | null
          notes?: string | null
          recurrence_rule?: string | null
          recurring?: boolean | null
          start_time: string
          title: string
          updated_at?: string
        }
        Update: {
          all_day?: boolean | null
          assigned_to?: string | null
          color?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          end_time?: string
          event_type?: Database["public"]["Enums"]["event_type"]
          family_id?: string
          id?: string
          location?: string | null
          notes?: string | null
          recurrence_rule?: string | null
          recurring?: boolean | null
          start_time?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "calendar_events_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "families"
            referencedColumns: ["id"]
          },
        ]
      }
      call_sessions: {
        Row: {
          call_type: string
          created_at: string
          duration_seconds: number | null
          ended_at: string | null
          family_id: string
          id: string
          initiated_by: string | null
          participants: string[]
          started_at: string
          status: string | null
        }
        Insert: {
          call_type?: string
          created_at?: string
          duration_seconds?: number | null
          ended_at?: string | null
          family_id: string
          id?: string
          initiated_by?: string | null
          participants: string[]
          started_at?: string
          status?: string | null
        }
        Update: {
          call_type?: string
          created_at?: string
          duration_seconds?: number | null
          ended_at?: string | null
          family_id?: string
          id?: string
          initiated_by?: string | null
          participants?: string[]
          started_at?: string
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "call_sessions_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "families"
            referencedColumns: ["id"]
          },
        ]
      }
      conversation_participants: {
        Row: {
          conversation_id: string
          id: string
          joined_at: string
          last_read_at: string | null
          user_id: string
        }
        Insert: {
          conversation_id: string
          id?: string
          joined_at?: string
          last_read_at?: string | null
          user_id: string
        }
        Update: {
          conversation_id?: string
          id?: string
          joined_at?: string
          last_read_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversation_participants_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          created_at: string
          family_id: string
          id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          family_id: string
          id?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          family_id?: string
          id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversations_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "families"
            referencedColumns: ["id"]
          },
        ]
      }
      expenses: {
        Row: {
          amount: number
          category: Database["public"]["Enums"]["expense_category"]
          created_at: string
          created_by: string | null
          description: string | null
          expense_date: string
          family_id: string
          id: string
          is_settled: boolean | null
          receipt_url: string | null
          settled_at: string | null
          settled_by: string | null
          split_percentage: number | null
          title: string
          updated_at: string
        }
        Insert: {
          amount: number
          category?: Database["public"]["Enums"]["expense_category"]
          created_at?: string
          created_by?: string | null
          description?: string | null
          expense_date?: string
          family_id: string
          id?: string
          is_settled?: boolean | null
          receipt_url?: string | null
          settled_at?: string | null
          settled_by?: string | null
          split_percentage?: number | null
          title: string
          updated_at?: string
        }
        Update: {
          amount?: number
          category?: Database["public"]["Enums"]["expense_category"]
          created_at?: string
          created_by?: string | null
          description?: string | null
          expense_date?: string
          family_id?: string
          id?: string
          is_settled?: boolean | null
          receipt_url?: string | null
          settled_at?: string | null
          settled_by?: string | null
          split_percentage?: number | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "expenses_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "families"
            referencedColumns: ["id"]
          },
        ]
      }
      families: {
        Row: {
          created_at: string
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      files: {
        Row: {
          created_at: string
          description: string | null
          family_id: string
          file_name: string
          file_path: string
          file_size: number | null
          file_type: string | null
          folder: string | null
          id: string
          is_shared: boolean | null
          updated_at: string
          uploaded_by: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          family_id: string
          file_name: string
          file_path: string
          file_size?: number | null
          file_type?: string | null
          folder?: string | null
          id?: string
          is_shared?: boolean | null
          updated_at?: string
          uploaded_by?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          family_id?: string
          file_name?: string
          file_path?: string
          file_size?: number | null
          file_type?: string | null
          folder?: string | null
          id?: string
          is_shared?: boolean | null
          updated_at?: string
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "files_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "families"
            referencedColumns: ["id"]
          },
        ]
      }
      incidents: {
        Row: {
          attachment_urls: string[] | null
          created_at: string
          description: string
          family_id: string
          hash: string | null
          id: string
          incident_date: string
          location: string | null
          previous_hash: string | null
          reported_by: string | null
          severity: Database["public"]["Enums"]["incident_severity"]
          title: string
          witnesses: string | null
        }
        Insert: {
          attachment_urls?: string[] | null
          created_at?: string
          description: string
          family_id: string
          hash?: string | null
          id?: string
          incident_date: string
          location?: string | null
          previous_hash?: string | null
          reported_by?: string | null
          severity?: Database["public"]["Enums"]["incident_severity"]
          title: string
          witnesses?: string | null
        }
        Update: {
          attachment_urls?: string[] | null
          created_at?: string
          description?: string
          family_id?: string
          hash?: string | null
          id?: string
          incident_date?: string
          location?: string | null
          previous_hash?: string | null
          reported_by?: string | null
          severity?: Database["public"]["Enums"]["incident_severity"]
          title?: string
          witnesses?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "incidents_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "families"
            referencedColumns: ["id"]
          },
        ]
      }
      invites: {
        Row: {
          accepted_at: string | null
          created_at: string
          email: string
          expires_at: string
          family_id: string
          id: string
          invited_by: string | null
          role: Database["public"]["Enums"]["app_role"]
          token: string
        }
        Insert: {
          accepted_at?: string | null
          created_at?: string
          email: string
          expires_at: string
          family_id: string
          id?: string
          invited_by?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          token: string
        }
        Update: {
          accepted_at?: string | null
          created_at?: string
          email?: string
          expires_at?: string
          family_id?: string
          id?: string
          invited_by?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          token?: string
        }
        Relationships: [
          {
            foreignKeyName: "invites_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "families"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          attachment_type: string | null
          attachment_url: string | null
          content: string
          conversation_id: string
          created_at: string
          id: string
          is_read: boolean | null
          sender_id: string | null
          tone_label: string | null
          tone_score: number | null
          updated_at: string
        }
        Insert: {
          attachment_type?: string | null
          attachment_url?: string | null
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          is_read?: boolean | null
          sender_id?: string | null
          tone_label?: string | null
          tone_score?: number | null
          updated_at?: string
        }
        Update: {
          attachment_type?: string | null
          attachment_url?: string | null
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          is_read?: boolean | null
          sender_id?: string | null
          tone_label?: string | null
          tone_score?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string
          family_id: string | null
          full_name: string | null
          id: string
          language: string | null
          phone: string | null
          timezone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email: string
          family_id?: string | null
          full_name?: string | null
          id?: string
          language?: string | null
          phone?: string | null
          timezone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          family_id?: string | null
          full_name?: string | null
          id?: string
          language?: string | null
          phone?: string | null
          timezone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "families"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          created_at: string
          current_period_end: string | null
          current_period_start: string | null
          family_id: string
          id: string
          plan_type: string
          status: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          family_id: string
          id?: string
          plan_type?: string
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          family_id?: string
          id?: string
          plan_type?: string
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: true
            referencedRelation: "families"
            referencedColumns: ["id"]
          },
        ]
      }
      swap_requests: {
        Row: {
          created_at: string
          event_id: string
          id: string
          proposed_date: string
          reason: string | null
          requested_by: string
          requested_to: string
          responded_at: string | null
          status: Database["public"]["Enums"]["swap_status"]
        }
        Insert: {
          created_at?: string
          event_id: string
          id?: string
          proposed_date: string
          reason?: string | null
          requested_by: string
          requested_to: string
          responded_at?: string | null
          status?: Database["public"]["Enums"]["swap_status"]
        }
        Update: {
          created_at?: string
          event_id?: string
          id?: string
          proposed_date?: string
          reason?: string | null
          requested_by?: string
          requested_to?: string
          responded_at?: string | null
          status?: Database["public"]["Enums"]["swap_status"]
        }
        Relationships: [
          {
            foreignKeyName: "swap_requests_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "calendar_events"
            referencedColumns: ["id"]
          },
        ]
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
          role?: Database["public"]["Enums"]["app_role"]
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
      get_user_family_id: { Args: { _user_id: string }; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_family_member: {
        Args: { _family_id: string; _user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role:
        | "superadmin"
        | "support_agent"
        | "finance_manager"
        | "lawyer"
        | "parent"
      event_type:
        | "custody"
        | "event"
        | "holiday"
        | "medical"
        | "school"
        | "activity"
      expense_category:
        | "medical"
        | "education"
        | "clothing"
        | "activities"
        | "food"
        | "transportation"
        | "childcare"
        | "entertainment"
        | "other"
      incident_severity: "low" | "medium" | "high" | "critical"
      swap_status: "pending" | "approved" | "rejected" | "cancelled"
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
      app_role: [
        "superadmin",
        "support_agent",
        "finance_manager",
        "lawyer",
        "parent",
      ],
      event_type: [
        "custody",
        "event",
        "holiday",
        "medical",
        "school",
        "activity",
      ],
      expense_category: [
        "medical",
        "education",
        "clothing",
        "activities",
        "food",
        "transportation",
        "childcare",
        "entertainment",
        "other",
      ],
      incident_severity: ["low", "medium", "high", "critical"],
      swap_status: ["pending", "approved", "rejected", "cancelled"],
    },
  },
} as const

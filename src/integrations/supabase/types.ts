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
      ad_drafts: {
        Row: {
          ad_content: Json | null
          approved_at: string | null
          approved_by: string | null
          budget: number | null
          created_at: string
          id: string
          name: string
          platform: string
          status: string
          updated_at: string
        }
        Insert: {
          ad_content?: Json | null
          approved_at?: string | null
          approved_by?: string | null
          budget?: number | null
          created_at?: string
          id?: string
          name: string
          platform?: string
          status?: string
          updated_at?: string
        }
        Update: {
          ad_content?: Json | null
          approved_at?: string | null
          approved_by?: string | null
          budget?: number | null
          created_at?: string
          id?: string
          name?: string
          platform?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
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
      campaign_drafts: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          click_count: number | null
          content: string | null
          created_at: string | null
          created_by: string | null
          id: string
          name: string
          open_count: number | null
          scheduled_at: string | null
          sent_count: number | null
          status: string | null
          subject: string | null
          target_audience: string | null
          type: string
          updated_at: string | null
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          click_count?: number | null
          content?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          name: string
          open_count?: number | null
          scheduled_at?: string | null
          sent_count?: number | null
          status?: string | null
          subject?: string | null
          target_audience?: string | null
          type: string
          updated_at?: string | null
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          click_count?: number | null
          content?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          name?: string
          open_count?: number | null
          scheduled_at?: string | null
          sent_count?: number | null
          status?: string | null
          subject?: string | null
          target_audience?: string | null
          type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      campaigns: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          campaign_type: string
          content: Json | null
          created_at: string
          description: string | null
          id: string
          name: string
          scheduled_at: string | null
          status: string
          target_audience: string | null
          updated_at: string
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          campaign_type?: string
          content?: Json | null
          created_at?: string
          description?: string | null
          id?: string
          name: string
          scheduled_at?: string | null
          status?: string
          target_audience?: string | null
          updated_at?: string
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          campaign_type?: string
          content?: Json | null
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          scheduled_at?: string | null
          status?: string
          target_audience?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      children: {
        Row: {
          allergies: string[] | null
          created_at: string
          date_of_birth: string | null
          doctor_address: string | null
          doctor_name: string | null
          doctor_phone: string | null
          emergency_contacts: Json | null
          family_id: string
          id: string
          medications: string[] | null
          name: string
          notes: string | null
          school_address: string | null
          school_name: string | null
          school_phone: string | null
          updated_at: string
        }
        Insert: {
          allergies?: string[] | null
          created_at?: string
          date_of_birth?: string | null
          doctor_address?: string | null
          doctor_name?: string | null
          doctor_phone?: string | null
          emergency_contacts?: Json | null
          family_id: string
          id?: string
          medications?: string[] | null
          name: string
          notes?: string | null
          school_address?: string | null
          school_name?: string | null
          school_phone?: string | null
          updated_at?: string
        }
        Update: {
          allergies?: string[] | null
          created_at?: string
          date_of_birth?: string | null
          doctor_address?: string | null
          doctor_name?: string | null
          doctor_phone?: string | null
          emergency_contacts?: Json | null
          family_id?: string
          id?: string
          medications?: string[] | null
          name?: string
          notes?: string | null
          school_address?: string | null
          school_name?: string | null
          school_phone?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "children_family_id_fkey"
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
      custody_templates: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_system: boolean | null
          name: string
          schedule_pattern: Json
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_system?: boolean | null
          name: string
          schedule_pattern?: Json
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_system?: boolean | null
          name?: string
          schedule_pattern?: Json
        }
        Relationships: []
      }
      custody_transfers: {
        Row: {
          child_id: string | null
          created_at: string
          family_id: string
          id: string
          location: string | null
          notes: string | null
          transfer_type: string
          transferred_by: string | null
          transferred_to: string | null
        }
        Insert: {
          child_id?: string | null
          created_at?: string
          family_id: string
          id?: string
          location?: string | null
          notes?: string | null
          transfer_type: string
          transferred_by?: string | null
          transferred_to?: string | null
        }
        Update: {
          child_id?: string | null
          created_at?: string
          family_id?: string
          id?: string
          location?: string | null
          notes?: string | null
          transfer_type?: string
          transferred_by?: string | null
          transferred_to?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "custody_transfers_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "custody_transfers_family_id_fkey"
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
      heat_regions: {
        Row: {
          country: string
          created_at: string
          engagement_score: number | null
          family_count: number | null
          id: string
          region_name: string
          state_code: string | null
          updated_at: string
          user_count: number | null
        }
        Insert: {
          country?: string
          created_at?: string
          engagement_score?: number | null
          family_count?: number | null
          id?: string
          region_name: string
          state_code?: string | null
          updated_at?: string
          user_count?: number | null
        }
        Update: {
          country?: string
          created_at?: string
          engagement_score?: number | null
          family_count?: number | null
          id?: string
          region_name?: string
          state_code?: string | null
          updated_at?: string
          user_count?: number | null
        }
        Relationships: []
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
      integration_configs: {
        Row: {
          config_data: Json | null
          connected_at: string | null
          connected_by: string | null
          created_at: string
          id: string
          integration_name: string
          is_enabled: boolean
          last_sync_at: string | null
          updated_at: string
        }
        Insert: {
          config_data?: Json | null
          connected_at?: string | null
          connected_by?: string | null
          created_at?: string
          id?: string
          integration_name: string
          is_enabled?: boolean
          last_sync_at?: string | null
          updated_at?: string
        }
        Update: {
          config_data?: Json | null
          connected_at?: string | null
          connected_by?: string | null
          created_at?: string
          id?: string
          integration_name?: string
          is_enabled?: boolean
          last_sync_at?: string | null
          updated_at?: string
        }
        Relationships: []
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
      issued_cards: {
        Row: {
          card_status: string
          created_at: string
          family_id: string
          id: string
          last_four: string | null
          spending_limit: number | null
          stripe_card_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          card_status?: string
          created_at?: string
          family_id: string
          id?: string
          last_four?: string | null
          spending_limit?: number | null
          stripe_card_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          card_status?: string
          created_at?: string
          family_id?: string
          id?: string
          last_four?: string | null
          spending_limit?: number | null
          stripe_card_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "issued_cards_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "families"
            referencedColumns: ["id"]
          },
        ]
      }
      merchant_whitelist: {
        Row: {
          created_at: string
          family_id: string
          id: string
          is_allowed: boolean
          merchant_category: string | null
          merchant_name: string
        }
        Insert: {
          created_at?: string
          family_id: string
          id?: string
          is_allowed?: boolean
          merchant_category?: string | null
          merchant_name: string
        }
        Update: {
          created_at?: string
          family_id?: string
          id?: string
          is_allowed?: boolean
          merchant_category?: string | null
          merchant_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "merchant_whitelist_family_id_fkey"
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
      notifications: {
        Row: {
          action_url: string | null
          category: string
          created_at: string | null
          id: string
          is_read: boolean | null
          message: string
          read_at: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          action_url?: string | null
          category?: string
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message: string
          read_at?: string | null
          title: string
          type?: string
          user_id: string
        }
        Update: {
          action_url?: string | null
          category?: string
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message?: string
          read_at?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      partner_assignments: {
        Row: {
          access_level: string | null
          assigned_at: string | null
          assigned_by: string | null
          family_id: string | null
          id: string
          notes: string | null
          organization_id: string | null
          partner_user_id: string
          status: string | null
        }
        Insert: {
          access_level?: string | null
          assigned_at?: string | null
          assigned_by?: string | null
          family_id?: string | null
          id?: string
          notes?: string | null
          organization_id?: string | null
          partner_user_id: string
          status?: string | null
        }
        Update: {
          access_level?: string | null
          assigned_at?: string | null
          assigned_by?: string | null
          family_id?: string | null
          id?: string
          notes?: string | null
          organization_id?: string | null
          partner_user_id?: string
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "partner_assignments_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "families"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "partner_assignments_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "partner_organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      partner_messages: {
        Row: {
          assignment_id: string | null
          content: string
          created_at: string | null
          id: string
          is_read: boolean | null
          sender_id: string
        }
        Insert: {
          assignment_id?: string | null
          content: string
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          sender_id: string
        }
        Update: {
          assignment_id?: string | null
          content?: string
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "partner_messages_assignment_id_fkey"
            columns: ["assignment_id"]
            isOneToOne: false
            referencedRelation: "partner_assignments"
            referencedColumns: ["id"]
          },
        ]
      }
      partner_organizations: {
        Row: {
          address: string | null
          created_at: string | null
          email: string | null
          id: string
          logo_url: string | null
          name: string
          phone: string | null
          type: string
          updated_at: string | null
          verified: boolean | null
          verified_at: string | null
          website: string | null
        }
        Insert: {
          address?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          logo_url?: string | null
          name: string
          phone?: string | null
          type: string
          updated_at?: string | null
          verified?: boolean | null
          verified_at?: string | null
          website?: string | null
        }
        Update: {
          address?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          logo_url?: string | null
          name?: string
          phone?: string | null
          type?: string
          updated_at?: string | null
          verified?: boolean | null
          verified_at?: string | null
          website?: string | null
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount: number
          completed_at: string | null
          created_at: string
          description: string | null
          family_id: string
          id: string
          recipient_id: string
          sender_id: string
          status: string
          stripe_payment_id: string | null
        }
        Insert: {
          amount: number
          completed_at?: string | null
          created_at?: string
          description?: string | null
          family_id: string
          id?: string
          recipient_id: string
          sender_id: string
          status?: string
          stripe_payment_id?: string | null
        }
        Update: {
          amount?: number
          completed_at?: string | null
          created_at?: string
          description?: string | null
          family_id?: string
          id?: string
          recipient_id?: string
          sender_id?: string
          status?: string
          stripe_payment_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "families"
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
          gdpr_consent_at: string | null
          id: string
          language: string | null
          notification_calendar: boolean | null
          notification_email: boolean | null
          notification_expenses: boolean | null
          notification_messages: boolean | null
          notification_push: boolean | null
          notification_sms: boolean | null
          onboarding_completed: boolean | null
          organization_name: string | null
          partner_type: string | null
          partner_verified: boolean | null
          phone: string | null
          preferred_currency: string | null
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
          gdpr_consent_at?: string | null
          id?: string
          language?: string | null
          notification_calendar?: boolean | null
          notification_email?: boolean | null
          notification_expenses?: boolean | null
          notification_messages?: boolean | null
          notification_push?: boolean | null
          notification_sms?: boolean | null
          onboarding_completed?: boolean | null
          organization_name?: string | null
          partner_type?: string | null
          partner_verified?: boolean | null
          phone?: string | null
          preferred_currency?: string | null
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
          gdpr_consent_at?: string | null
          id?: string
          language?: string | null
          notification_calendar?: boolean | null
          notification_email?: boolean | null
          notification_expenses?: boolean | null
          notification_messages?: boolean | null
          notification_push?: boolean | null
          notification_sms?: boolean | null
          onboarding_completed?: boolean | null
          organization_name?: string | null
          partner_type?: string | null
          partner_verified?: boolean | null
          phone?: string | null
          preferred_currency?: string | null
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
      reimbursement_requests: {
        Row: {
          amount: number
          created_at: string
          expense_id: string | null
          family_id: string
          id: string
          notes: string | null
          requested_by: string
          requested_to: string
          responded_at: string | null
          status: string
        }
        Insert: {
          amount: number
          created_at?: string
          expense_id?: string | null
          family_id: string
          id?: string
          notes?: string | null
          requested_by: string
          requested_to: string
          responded_at?: string | null
          status?: string
        }
        Update: {
          amount?: number
          created_at?: string
          expense_id?: string | null
          family_id?: string
          id?: string
          notes?: string | null
          requested_by?: string
          requested_to?: string
          responded_at?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "reimbursement_requests_expense_id_fkey"
            columns: ["expense_id"]
            isOneToOne: false
            referencedRelation: "expenses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reimbursement_requests_family_id_fkey"
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
      user_payment_methods: {
        Row: {
          account_last_four: string | null
          account_name: string | null
          country: string | null
          created_at: string | null
          id: string
          is_primary: boolean | null
          is_verified: boolean | null
          metadata: Json | null
          method_type: string
          provider: string
          provider_account_id: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          account_last_four?: string | null
          account_name?: string | null
          country?: string | null
          created_at?: string | null
          id?: string
          is_primary?: boolean | null
          is_verified?: boolean | null
          metadata?: Json | null
          method_type: string
          provider: string
          provider_account_id?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          account_last_four?: string | null
          account_name?: string | null
          country?: string | null
          created_at?: string | null
          id?: string
          is_primary?: boolean | null
          is_verified?: boolean | null
          metadata?: Json | null
          method_type?: string
          provider?: string
          provider_account_id?: string | null
          updated_at?: string | null
          user_id?: string
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
      notify_upcoming_events: {
        Args: { hours_ahead?: number }
        Returns: number
      }
      seed_demo_data_for_user: {
        Args: { demo_user_id: string }
        Returns: undefined
      }
    }
    Enums: {
      app_role:
        | "superadmin"
        | "support_agent"
        | "finance_manager"
        | "lawyer"
        | "parent"
        | "partner"
        | "mediator"
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
        "partner",
        "mediator",
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

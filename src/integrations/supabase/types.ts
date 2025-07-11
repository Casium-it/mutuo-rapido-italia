export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      admin_notification_settings: {
        Row: {
          admin_name: string
          created_at: string
          id: string
          notifications_enabled: boolean
          phone_number: string
          updated_at: string
        }
        Insert: {
          admin_name: string
          created_at?: string
          id?: string
          notifications_enabled?: boolean
          phone_number: string
          updated_at?: string
        }
        Update: {
          admin_name?: string
          created_at?: string
          id?: string
          notifications_enabled?: boolean
          phone_number?: string
          updated_at?: string
        }
        Relationships: []
      }
      form_blocks: {
        Row: {
          block_data: Json
          created_at: string
          form_id: string
          id: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          block_data: Json
          created_at?: string
          form_id: string
          id?: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          block_data?: Json
          created_at?: string
          form_id?: string
          id?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "form_blocks_form_id_fkey"
            columns: ["form_id"]
            isOneToOne: false
            referencedRelation: "forms"
            referencedColumns: ["id"]
          },
        ]
      }
      form_responses: {
        Row: {
          block_id: string
          created_at: string
          id: string
          question_id: string
          question_text: string
          response_value: Json
          submission_id: string
        }
        Insert: {
          block_id: string
          created_at?: string
          id?: string
          question_id: string
          question_text: string
          response_value: Json
          submission_id: string
        }
        Update: {
          block_id?: string
          created_at?: string
          id?: string
          question_id?: string
          question_text?: string
          response_value?: Json
          submission_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "form_responses_submission_id_fkey"
            columns: ["submission_id"]
            isOneToOne: false
            referencedRelation: "form_submissions"
            referencedColumns: ["id"]
          },
        ]
      }
      form_submissions: {
        Row: {
          consulting: boolean | null
          created_at: string
          email: string | null
          expires_at: string
          first_name: string | null
          form_type: string
          id: string
          last_name: string | null
          lead_status: Database["public"]["Enums"]["lead_status"] | null
          mediatore: string | null
          metadata: Json | null
          notes: string | null
          phone_number: string | null
          user_identifier: string | null
        }
        Insert: {
          consulting?: boolean | null
          created_at?: string
          email?: string | null
          expires_at: string
          first_name?: string | null
          form_type: string
          id?: string
          last_name?: string | null
          lead_status?: Database["public"]["Enums"]["lead_status"] | null
          mediatore?: string | null
          metadata?: Json | null
          notes?: string | null
          phone_number?: string | null
          user_identifier?: string | null
        }
        Update: {
          consulting?: boolean | null
          created_at?: string
          email?: string | null
          expires_at?: string
          first_name?: string | null
          form_type?: string
          id?: string
          last_name?: string | null
          lead_status?: Database["public"]["Enums"]["lead_status"] | null
          mediatore?: string | null
          metadata?: Json | null
          notes?: string | null
          phone_number?: string | null
          user_identifier?: string | null
        }
        Relationships: []
      }
      form_versions: {
        Row: {
          created_at: string
          created_by: string | null
          form_id: string
          form_snapshot: Json
          id: string
          published_at: string | null
          version_number: number
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          form_id: string
          form_snapshot: Json
          id?: string
          published_at?: string | null
          version_number: number
        }
        Update: {
          created_at?: string
          created_by?: string | null
          form_id?: string
          form_snapshot?: Json
          id?: string
          published_at?: string | null
          version_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "form_versions_form_id_fkey"
            columns: ["form_id"]
            isOneToOne: false
            referencedRelation: "forms"
            referencedColumns: ["id"]
          },
        ]
      }
      forms: {
        Row: {
          completion_behavior: Database["public"]["Enums"]["completion_behavior_type"]
          created_at: string
          description: string | null
          form_type: string
          id: string
          is_active: boolean
          slug: string
          title: string
          updated_at: string
          version: number
        }
        Insert: {
          completion_behavior?: Database["public"]["Enums"]["completion_behavior_type"]
          created_at?: string
          description?: string | null
          form_type?: string
          id?: string
          is_active?: boolean
          slug: string
          title: string
          updated_at?: string
          version?: number
        }
        Update: {
          completion_behavior?: Database["public"]["Enums"]["completion_behavior_type"]
          created_at?: string
          description?: string | null
          form_type?: string
          id?: string
          is_active?: boolean
          slug?: string
          title?: string
          updated_at?: string
          version?: number
        }
        Relationships: []
      }
      linked_forms: {
        Row: {
          created_at: string
          email: string
          form_slug: string
          id: string
          link: string | null
          name: string
          percentage: number
          phone_number: string
          state: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          form_slug?: string
          id?: string
          link?: string | null
          name: string
          percentage?: number
          phone_number: string
          state?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          form_slug?: string
          id?: string
          link?: string | null
          name?: string
          percentage?: number
          phone_number?: string
          state?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string | null
          email: string
          first_name: string | null
          id: string
          last_name: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          first_name?: string | null
          id: string
          last_name?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      saved_simulations: {
        Row: {
          created_at: string
          email: string
          expires_at: string
          form_slug: string
          form_state: Json
          id: string
          linked_form_id: string | null
          name: string
          phone: string
          resume_code: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          expires_at?: string
          form_slug?: string
          form_state: Json
          id?: string
          linked_form_id?: string | null
          name: string
          phone: string
          resume_code?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          expires_at?: string
          form_slug?: string
          form_state?: Json
          id?: string
          linked_form_id?: string | null
          name?: string
          phone?: string
          resume_code?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "saved_simulations_linked_form_id_fkey"
            columns: ["linked_form_id"]
            isOneToOne: false
            referencedRelation: "linked_forms"
            referencedColumns: ["id"]
          },
        ]
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
          role: Database["public"]["Enums"]["app_role"]
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_resume_code: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_current_user_role: {
        Args: Record<PropertyKey, never>
        Returns: Database["public"]["Enums"]["app_role"]
      }
      get_masked_admin_notifications: {
        Args: Record<PropertyKey, never>
        Returns: {
          admin_id: string
          admin_display_name: string
          phone_masked: string
          phone_full: string
        }[]
      }
      has_role: {
        Args: {
          _user_id: string
          _role: Database["public"]["Enums"]["app_role"]
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "customer" | "broker"
      completion_behavior_type: "form-completed" | "form-completed-redirect"
      lead_status:
        | "not_contacted"
        | "first_contact"
        | "advanced_conversations"
        | "converted"
        | "rejected"
        | "non_risponde_x1"
        | "non_risponde_x2"
        | "non_risponde_x3"
        | "non_interessato"
        | "da_risentire"
        | "prenotata_consulenza"
        | "pratica_bocciata"
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
      app_role: ["admin", "customer", "broker"],
      completion_behavior_type: ["form-completed", "form-completed-redirect"],
      lead_status: [
        "not_contacted",
        "first_contact",
        "advanced_conversations",
        "converted",
        "rejected",
        "non_risponde_x1",
        "non_risponde_x2",
        "non_risponde_x3",
        "non_interessato",
        "da_risentire",
        "prenotata_consulenza",
        "pratica_bocciata",
      ],
    },
  },
} as const

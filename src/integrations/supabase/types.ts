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
      ai_prompts: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          messages: Json
          model: string
          name: string
          updated_at: string
          variables: string[] | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          messages?: Json
          model?: string
          name: string
          updated_at?: string
          variables?: string[] | null
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          messages?: Json
          model?: string
          name?: string
          updated_at?: string
          variables?: string[] | null
        }
        Relationships: []
      }
      blog_article_tags: {
        Row: {
          article_id: string
          created_at: string
          id: string
          tag_id: string
        }
        Insert: {
          article_id: string
          created_at?: string
          id?: string
          tag_id: string
        }
        Update: {
          article_id?: string
          created_at?: string
          id?: string
          tag_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "blog_article_tags_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "blog_articles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "blog_article_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "blog_tags"
            referencedColumns: ["id"]
          },
        ]
      }
      blog_articles: {
        Row: {
          allow_comments: boolean | null
          author_id: string | null
          author_name: string
          canonical_url: string | null
          category_id: string | null
          content: string
          created_at: string
          excerpt: string | null
          featured_image_alt: string | null
          featured_image_url: string | null
          id: string
          is_featured: boolean | null
          last_edited_by: string | null
          meta_description: string | null
          meta_keywords: string | null
          meta_title: string | null
          og_description: string | null
          og_image_url: string | null
          og_title: string | null
          published_at: string | null
          reading_time_minutes: number | null
          slug: string
          status: string
          title: string
          twitter_description: string | null
          twitter_image_url: string | null
          twitter_title: string | null
          updated_at: string
          view_count: number | null
        }
        Insert: {
          allow_comments?: boolean | null
          author_id?: string | null
          author_name?: string
          canonical_url?: string | null
          category_id?: string | null
          content: string
          created_at?: string
          excerpt?: string | null
          featured_image_alt?: string | null
          featured_image_url?: string | null
          id?: string
          is_featured?: boolean | null
          last_edited_by?: string | null
          meta_description?: string | null
          meta_keywords?: string | null
          meta_title?: string | null
          og_description?: string | null
          og_image_url?: string | null
          og_title?: string | null
          published_at?: string | null
          reading_time_minutes?: number | null
          slug: string
          status?: string
          title: string
          twitter_description?: string | null
          twitter_image_url?: string | null
          twitter_title?: string | null
          updated_at?: string
          view_count?: number | null
        }
        Update: {
          allow_comments?: boolean | null
          author_id?: string | null
          author_name?: string
          canonical_url?: string | null
          category_id?: string | null
          content?: string
          created_at?: string
          excerpt?: string | null
          featured_image_alt?: string | null
          featured_image_url?: string | null
          id?: string
          is_featured?: boolean | null
          last_edited_by?: string | null
          meta_description?: string | null
          meta_keywords?: string | null
          meta_title?: string | null
          og_description?: string | null
          og_image_url?: string | null
          og_title?: string | null
          published_at?: string | null
          reading_time_minutes?: number | null
          slug?: string
          status?: string
          title?: string
          twitter_description?: string | null
          twitter_image_url?: string | null
          twitter_title?: string | null
          updated_at?: string
          view_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "blog_articles_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "blog_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      blog_categories: {
        Row: {
          color: string | null
          created_at: string
          description: string | null
          id: string
          meta_description: string | null
          meta_title: string | null
          name: string
          slug: string
          updated_at: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          description?: string | null
          id?: string
          meta_description?: string | null
          meta_title?: string | null
          name: string
          slug: string
          updated_at?: string
        }
        Update: {
          color?: string | null
          created_at?: string
          description?: string | null
          id?: string
          meta_description?: string | null
          meta_title?: string | null
          name?: string
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      blog_tags: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          slug: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          slug: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          slug?: string
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
          ai_notes: string | null
          assigned_to: string | null
          consulting: boolean | null
          created_at: string
          email: string | null
          expires_at: string
          first_name: string | null
          form_id: string | null
          id: string
          last_name: string | null
          lead_status: Database["public"]["Enums"]["lead_status"] | null
          mediatore: string | null
          notes: string | null
          phone_number: string | null
          prossimo_contatto: string | null
          reminder: boolean
          reminder_sent: boolean
          saved_simulation_id: string | null
          ultimo_contatto: string | null
          user_identifier: string | null
        }
        Insert: {
          ai_notes?: string | null
          assigned_to?: string | null
          consulting?: boolean | null
          created_at?: string
          email?: string | null
          expires_at: string
          first_name?: string | null
          form_id?: string | null
          id?: string
          last_name?: string | null
          lead_status?: Database["public"]["Enums"]["lead_status"] | null
          mediatore?: string | null
          notes?: string | null
          phone_number?: string | null
          prossimo_contatto?: string | null
          reminder?: boolean
          reminder_sent?: boolean
          saved_simulation_id?: string | null
          ultimo_contatto?: string | null
          user_identifier?: string | null
        }
        Update: {
          ai_notes?: string | null
          assigned_to?: string | null
          consulting?: boolean | null
          created_at?: string
          email?: string | null
          expires_at?: string
          first_name?: string | null
          form_id?: string | null
          id?: string
          last_name?: string | null
          lead_status?: Database["public"]["Enums"]["lead_status"] | null
          mediatore?: string | null
          notes?: string | null
          phone_number?: string | null
          prossimo_contatto?: string | null
          reminder?: boolean
          reminder_sent?: boolean
          saved_simulation_id?: string | null
          ultimo_contatto?: string | null
          user_identifier?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "form_submissions_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "admin_notification_settings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "form_submissions_form_id_fkey"
            columns: ["form_id"]
            isOneToOne: false
            referencedRelation: "forms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "form_submissions_mediatore_assegnato_fkey"
            columns: ["mediatore"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "form_submissions_saved_simulation_id_fkey"
            columns: ["saved_simulation_id"]
            isOneToOne: false
            referencedRelation: "saved_simulations"
            referencedColumns: ["id"]
          },
        ]
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
      lead_activity_log: {
        Row: {
          activity_type: Database["public"]["Enums"]["activity_type"]
          created_at: string
          description: string
          id: string
          mediatore_id: string
          metadata: Json | null
          new_value: Json | null
          old_value: Json | null
          related_note_id: string | null
          related_pratica_id: string | null
          submission_id: string
        }
        Insert: {
          activity_type: Database["public"]["Enums"]["activity_type"]
          created_at?: string
          description: string
          id?: string
          mediatore_id: string
          metadata?: Json | null
          new_value?: Json | null
          old_value?: Json | null
          related_note_id?: string | null
          related_pratica_id?: string | null
          submission_id: string
        }
        Update: {
          activity_type?: Database["public"]["Enums"]["activity_type"]
          created_at?: string
          description?: string
          id?: string
          mediatore_id?: string
          metadata?: Json | null
          new_value?: Json | null
          old_value?: Json | null
          related_note_id?: string | null
          related_pratica_id?: string | null
          submission_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lead_activity_log_mediatore_id_fkey"
            columns: ["mediatore_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lead_activity_log_related_note_id_fkey"
            columns: ["related_note_id"]
            isOneToOne: false
            referencedRelation: "lead_notes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lead_activity_log_related_pratica_id_fkey"
            columns: ["related_pratica_id"]
            isOneToOne: false
            referencedRelation: "pratiche"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lead_activity_log_submission_id_fkey"
            columns: ["submission_id"]
            isOneToOne: false
            referencedRelation: "form_submissions"
            referencedColumns: ["id"]
          },
        ]
      }
      lead_notes: {
        Row: {
          contenuto: string
          created_at: string
          id: string
          is_important: boolean | null
          is_private: boolean | null
          mediatore_id: string
          submission_id: string
          tipo: Database["public"]["Enums"]["note_type"] | null
          titolo: string
          updated_at: string
        }
        Insert: {
          contenuto: string
          created_at?: string
          id?: string
          is_important?: boolean | null
          is_private?: boolean | null
          mediatore_id: string
          submission_id: string
          tipo?: Database["public"]["Enums"]["note_type"] | null
          titolo: string
          updated_at?: string
        }
        Update: {
          contenuto?: string
          created_at?: string
          id?: string
          is_important?: boolean | null
          is_private?: boolean | null
          mediatore_id?: string
          submission_id?: string
          tipo?: Database["public"]["Enums"]["note_type"] | null
          titolo?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "lead_notes_mediatore_id_fkey"
            columns: ["mediatore_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lead_notes_submission_id_fkey"
            columns: ["submission_id"]
            isOneToOne: false
            referencedRelation: "form_submissions"
            referencedColumns: ["id"]
          },
        ]
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
      pratica_documents: {
        Row: {
          content_type: string | null
          created_at: string
          file_path: string
          file_size: number | null
          filename: string
          id: string
          pratica_id: string
          updated_at: string
          uploaded_by: string
        }
        Insert: {
          content_type?: string | null
          created_at?: string
          file_path: string
          file_size?: number | null
          filename: string
          id?: string
          pratica_id: string
          updated_at?: string
          uploaded_by: string
        }
        Update: {
          content_type?: string | null
          created_at?: string
          file_path?: string
          file_size?: number | null
          filename?: string
          id?: string
          pratica_id?: string
          updated_at?: string
          uploaded_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_pratica_documents_pratica"
            columns: ["pratica_id"]
            isOneToOne: false
            referencedRelation: "pratiche"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_pratica_documents_user"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      pratiche: {
        Row: {
          altri_finanziamenti: number | null
          anticipo: number | null
          banca_preferita: string | null
          consulente_banca: string | null
          created_at: string
          data_prevista_erogazione: string | null
          data_richiesta: string | null
          destinazione_uso: string | null
          durata_anni: number | null
          id: string
          importo_richiesto: number | null
          mediatore_id: string
          note_interne: string | null
          priorita: number | null
          reddito_mensile_netto: number | null
          spese_mensili: number | null
          status: Database["public"]["Enums"]["pratica_status"] | null
          submission_id: string
          tasso_interesse_atteso: number | null
          tipo_immobile: string | null
          tipo_tasso: Database["public"]["Enums"]["interest_type"] | null
          updated_at: string
          valore_immobile: number | null
        }
        Insert: {
          altri_finanziamenti?: number | null
          anticipo?: number | null
          banca_preferita?: string | null
          consulente_banca?: string | null
          created_at?: string
          data_prevista_erogazione?: string | null
          data_richiesta?: string | null
          destinazione_uso?: string | null
          durata_anni?: number | null
          id?: string
          importo_richiesto?: number | null
          mediatore_id: string
          note_interne?: string | null
          priorita?: number | null
          reddito_mensile_netto?: number | null
          spese_mensili?: number | null
          status?: Database["public"]["Enums"]["pratica_status"] | null
          submission_id: string
          tasso_interesse_atteso?: number | null
          tipo_immobile?: string | null
          tipo_tasso?: Database["public"]["Enums"]["interest_type"] | null
          updated_at?: string
          valore_immobile?: number | null
        }
        Update: {
          altri_finanziamenti?: number | null
          anticipo?: number | null
          banca_preferita?: string | null
          consulente_banca?: string | null
          created_at?: string
          data_prevista_erogazione?: string | null
          data_richiesta?: string | null
          destinazione_uso?: string | null
          durata_anni?: number | null
          id?: string
          importo_richiesto?: number | null
          mediatore_id?: string
          note_interne?: string | null
          priorita?: number | null
          reddito_mensile_netto?: number | null
          spese_mensili?: number | null
          status?: Database["public"]["Enums"]["pratica_status"] | null
          submission_id?: string
          tasso_interesse_atteso?: number | null
          tipo_immobile?: string | null
          tipo_tasso?: Database["public"]["Enums"]["interest_type"] | null
          updated_at?: string
          valore_immobile?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "pratiche_mediatore_id_fkey"
            columns: ["mediatore_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pratiche_submission_id_fkey"
            columns: ["submission_id"]
            isOneToOne: true
            referencedRelation: "form_submissions"
            referencedColumns: ["id"]
          },
        ]
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
      question_ids: {
        Row: {
          created_at: string
          current_version: number
          description: string | null
          id: string
          question_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          current_version?: number
          description?: string | null
          id?: string
          question_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          current_version?: number
          description?: string | null
          id?: string
          question_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      question_versions: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          placeholder_values: Json | null
          question_id_record: string
          question_text: string
          question_type: string
          version_number: number
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          placeholder_values?: Json | null
          question_id_record: string
          question_text: string
          question_type: string
          version_number: number
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          placeholder_values?: Json | null
          question_id_record?: string
          question_text?: string
          question_type?: string
          version_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "question_versions_question_id_record_fkey"
            columns: ["question_id_record"]
            isOneToOne: false
            referencedRelation: "question_ids"
            referencedColumns: ["id"]
          },
        ]
      }
      saved_simulations: {
        Row: {
          created_at: string
          email: string | null
          expires_at: string
          form_slug: string
          form_state: Json
          id: string
          linked_form_id: string | null
          name: string | null
          percentage: number
          phone: string | null
          resume_code: string
          save_method: Database["public"]["Enums"]["save_method_type"]
          simulation_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          expires_at?: string
          form_slug?: string
          form_state: Json
          id?: string
          linked_form_id?: string | null
          name?: string | null
          percentage?: number
          phone?: string | null
          resume_code?: string
          save_method: Database["public"]["Enums"]["save_method_type"]
          simulation_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          expires_at?: string
          form_slug?: string
          form_state?: Json
          id?: string
          linked_form_id?: string | null
          name?: string | null
          percentage?: number
          phone?: string | null
          resume_code?: string
          save_method?: Database["public"]["Enums"]["save_method_type"]
          simulation_id?: string | null
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
      calculate_reading_time: {
        Args: { content: string }
        Returns: number
      }
      generate_resume_code: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      generate_simulation_id: {
        Args: { created_date?: string }
        Returns: string
      }
      generate_slug: {
        Args: { title: string }
        Returns: string
      }
      get_current_user_role: {
        Args: Record<PropertyKey, never>
        Returns: Database["public"]["Enums"]["app_role"]
      }
      get_lead_timeline: {
        Args: { lead_submission_id: string }
        Returns: {
          activity_type: Database["public"]["Enums"]["activity_type"]
          created_at: string
          description: string
          id: string
          mediatore_name: string
          metadata: Json
          new_value: Json
          old_value: Json
        }[]
      }
      get_masked_admin_notifications: {
        Args: Record<PropertyKey, never>
        Returns: {
          admin_display_name: string
          admin_id: string
          phone_full: string
          phone_masked: string
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_question_used: {
        Args: { question_id_param: string }
        Returns: boolean
      }
      reconstruct_form_state: {
        Args: { submission_id_param: string }
        Returns: Json
      }
    }
    Enums: {
      activity_type:
        | "status_change"
        | "note_added"
        | "note_updated"
        | "note_deleted"
        | "pratica_created"
        | "pratica_updated"
        | "field_updated"
        | "document_added"
        | "document_removed"
        | "reminder_set"
        | "contact_made"
      app_role: "admin" | "customer" | "broker" | "mediatore"
      completion_behavior_type: "form-completed" | "form-completed-redirect"
      interest_type: "fisso" | "variabile" | "misto"
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
        | "perso"
        | "da_assegnare"
      note_type:
        | "generale"
        | "telefonata"
        | "incontro"
        | "documentazione"
        | "banca"
        | "cliente"
        | "urgente"
        | "sistema"
      pratica_status:
        | "lead"
        | "consulenza_programmata"
        | "consulenza_completata"
        | "in_attesa_documenti"
        | "documenti_ricevuti"
        | "in_attesa_mandato"
        | "mandato_firmato"
        | "inviata_alla_banca"
        | "predelibera_ricevuta"
        | "istruttoria_ricevuta"
        | "rogito_completato"
        | "pratica_rifiutata"
        | "pratica_sospesa"
        | "non_risponde"
        | "persa"
      save_method_type: "auto-save" | "manual-save" | "completed-save"
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
      activity_type: [
        "status_change",
        "note_added",
        "note_updated",
        "note_deleted",
        "pratica_created",
        "pratica_updated",
        "field_updated",
        "document_added",
        "document_removed",
        "reminder_set",
        "contact_made",
      ],
      app_role: ["admin", "customer", "broker", "mediatore"],
      completion_behavior_type: ["form-completed", "form-completed-redirect"],
      interest_type: ["fisso", "variabile", "misto"],
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
        "perso",
        "da_assegnare",
      ],
      note_type: [
        "generale",
        "telefonata",
        "incontro",
        "documentazione",
        "banca",
        "cliente",
        "urgente",
        "sistema",
      ],
      pratica_status: [
        "lead",
        "consulenza_programmata",
        "consulenza_completata",
        "in_attesa_documenti",
        "documenti_ricevuti",
        "in_attesa_mandato",
        "mandato_firmato",
        "inviata_alla_banca",
        "predelibera_ricevuta",
        "istruttoria_ricevuta",
        "rogito_completato",
        "pratica_rifiutata",
        "pratica_sospesa",
        "non_risponde",
        "persa",
      ],
      save_method_type: ["auto-save", "manual-save", "completed-save"],
    },
  },
} as const

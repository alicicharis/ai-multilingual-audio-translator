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
      generated_audio: {
        Row: {
          audio_url: string
          created_at: string | null
          duration_seconds: number | null
          id: string
          translation_job_id: string | null
          tts_provider: string | null
          voice_id: string | null
        }
        Insert: {
          audio_url: string
          created_at?: string | null
          duration_seconds?: number | null
          id?: string
          translation_job_id?: string | null
          tts_provider?: string | null
          voice_id?: string | null
        }
        Update: {
          audio_url?: string
          created_at?: string | null
          duration_seconds?: number | null
          id?: string
          translation_job_id?: string | null
          tts_provider?: string | null
          voice_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "generated_audio_translation_job_id_fkey"
            columns: ["translation_job_id"]
            isOneToOne: false
            referencedRelation: "translation_jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      media_files: {
        Row: {
          created_at: string | null
          duration_seconds: number | null
          file_name: string
          id: string
          media_type: string
          original_filename: string
          source_url: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          duration_seconds?: number | null
          file_name: string
          id?: string
          media_type: string
          original_filename: string
          source_url: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          duration_seconds?: number | null
          file_name?: string
          id?: string
          media_type?: string
          original_filename?: string
          source_url?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "media_files_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          id: string
          updated_at: string | null
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          id: string
          updated_at?: string | null
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          id?: string
          updated_at?: string | null
          username?: string | null
        }
        Relationships: []
      }
      transcripts: {
        Row: {
          created_at: string | null
          id: string
          language: string
          transcript_text: string
          translation_job_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          language: string
          transcript_text: string
          translation_job_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          language?: string
          transcript_text?: string
          translation_job_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "transcripts_translation_job_id_fkey"
            columns: ["translation_job_id"]
            isOneToOne: false
            referencedRelation: "translation_jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      translation_jobs: {
        Row: {
          completed_at: string | null
          created_at: string | null
          gpt_model: string | null
          id: string
          media_file_id: string | null
          status: string
          target_language: string
          tts_provider: string | null
          user_id: string | null
          voice_mode: string
          whisper_model: string | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          gpt_model?: string | null
          id?: string
          media_file_id?: string | null
          status?: string
          target_language: string
          tts_provider?: string | null
          user_id?: string | null
          voice_mode: string
          whisper_model?: string | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          gpt_model?: string | null
          id?: string
          media_file_id?: string | null
          status?: string
          target_language?: string
          tts_provider?: string | null
          user_id?: string | null
          voice_mode?: string
          whisper_model?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "translation_jobs_media_file_id_fkey"
            columns: ["media_file_id"]
            isOneToOne: false
            referencedRelation: "media_files"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "translation_jobs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      translations: {
        Row: {
          created_at: string | null
          id: string
          model: string | null
          target_language: string
          tone: string | null
          translated_text: string
          translation_job_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          model?: string | null
          target_language: string
          tone?: string | null
          translated_text: string
          translation_job_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          model?: string | null
          target_language?: string
          tone?: string | null
          translated_text?: string
          translation_job_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "translations_translation_job_id_fkey"
            columns: ["translation_job_id"]
            isOneToOne: false
            referencedRelation: "translation_jobs"
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

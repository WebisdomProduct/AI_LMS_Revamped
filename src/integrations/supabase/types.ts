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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      assessments: {
        Row: {
          class_name: string
          created_at: string
          description: string | null
          difficulty: string | null
          due_date: string | null
          grade: string
          id: string
          passing_marks: number | null
          release_date: string | null
          rubric: Json | null
          status: string
          subject: string
          teacher_id: string
          time_limit: number | null
          title: string
          topic: string
          total_marks: number | null
          type: string
          updated_at: string
        }
        Insert: {
          class_name: string
          created_at?: string
          description?: string | null
          difficulty?: string | null
          due_date?: string | null
          grade: string
          id?: string
          passing_marks?: number | null
          release_date?: string | null
          rubric?: Json | null
          status?: string
          subject: string
          teacher_id: string
          time_limit?: number | null
          title: string
          topic: string
          total_marks?: number | null
          type?: string
          updated_at?: string
        }
        Update: {
          class_name?: string
          created_at?: string
          description?: string | null
          difficulty?: string | null
          due_date?: string | null
          grade?: string
          id?: string
          passing_marks?: number | null
          release_date?: string | null
          rubric?: Json | null
          status?: string
          subject?: string
          teacher_id?: string
          time_limit?: number | null
          title?: string
          topic?: string
          total_marks?: number | null
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      curriculum_metadata: {
        Row: {
          class_name: string
          created_at: string
          grade: string
          id: string
          subject: string
          topics: string[]
        }
        Insert: {
          class_name: string
          created_at?: string
          grade: string
          id?: string
          subject: string
          topics?: string[]
        }
        Update: {
          class_name?: string
          created_at?: string
          grade?: string
          id?: string
          subject?: string
          topics?: string[]
        }
        Relationships: []
      }
      grades: {
        Row: {
          ai_feedback: string | null
          assessment_id: string
          created_at: string
          feedback: Json | null
          grade_letter: string | null
          graded_at: string | null
          graded_by: string | null
          id: string
          max_score: number
          percentage: number
          student_id: string
          submission_id: string
          teacher_comments: string | null
          total_score: number
          updated_at: string
        }
        Insert: {
          ai_feedback?: string | null
          assessment_id: string
          created_at?: string
          feedback?: Json | null
          grade_letter?: string | null
          graded_at?: string | null
          graded_by?: string | null
          id?: string
          max_score?: number
          percentage?: number
          student_id: string
          submission_id: string
          teacher_comments?: string | null
          total_score?: number
          updated_at?: string
        }
        Update: {
          ai_feedback?: string | null
          assessment_id?: string
          created_at?: string
          feedback?: Json | null
          grade_letter?: string | null
          graded_at?: string | null
          graded_by?: string | null
          id?: string
          max_score?: number
          percentage?: number
          student_id?: string
          submission_id?: string
          teacher_comments?: string | null
          total_score?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "grades_assessment_id_fkey"
            columns: ["assessment_id"]
            isOneToOne: false
            referencedRelation: "assessments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "grades_submission_id_fkey"
            columns: ["submission_id"]
            isOneToOne: false
            referencedRelation: "submissions"
            referencedColumns: ["id"]
          },
        ]
      }
      lessons: {
        Row: {
          class_name: string
          content: string
          created_at: string
          google_doc_id: string | null
          grade: string
          id: string
          prompt: string | null
          shared_with: string[] | null
          status: string
          subject: string
          teacher_id: string
          title: string
          topic: string
          updated_at: string
        }
        Insert: {
          class_name: string
          content: string
          created_at?: string
          google_doc_id?: string | null
          grade: string
          id?: string
          prompt?: string | null
          shared_with?: string[] | null
          status?: string
          subject: string
          teacher_id: string
          title: string
          topic: string
          updated_at?: string
        }
        Update: {
          class_name?: string
          content?: string
          created_at?: string
          google_doc_id?: string | null
          grade?: string
          id?: string
          prompt?: string | null
          shared_with?: string[] | null
          status?: string
          subject?: string
          teacher_id?: string
          title?: string
          topic?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string
          full_name: string | null
          id: string
          role: string
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email: string
          full_name?: string | null
          id?: string
          role: string
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          role?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      questions: {
        Row: {
          assessment_id: string
          correct_answer: string | null
          created_at: string
          explanation: string | null
          hint: string | null
          id: string
          marks: number | null
          options: Json | null
          order_index: number | null
          question_text: string
          question_type: string
        }
        Insert: {
          assessment_id: string
          correct_answer?: string | null
          created_at?: string
          explanation?: string | null
          hint?: string | null
          id?: string
          marks?: number | null
          options?: Json | null
          order_index?: number | null
          question_text: string
          question_type?: string
        }
        Update: {
          assessment_id?: string
          correct_answer?: string | null
          created_at?: string
          explanation?: string | null
          hint?: string | null
          id?: string
          marks?: number | null
          options?: Json | null
          order_index?: number | null
          question_text?: string
          question_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "questions_assessment_id_fkey"
            columns: ["assessment_id"]
            isOneToOne: false
            referencedRelation: "assessments"
            referencedColumns: ["id"]
          },
        ]
      }
      student_enrollments: {
        Row: {
          class_name: string
          enrolled_at: string
          grade: string
          id: string
          student_id: string
          subject: string
        }
        Insert: {
          class_name: string
          enrolled_at?: string
          grade: string
          id?: string
          student_id: string
          subject: string
        }
        Update: {
          class_name?: string
          enrolled_at?: string
          grade?: string
          id?: string
          student_id?: string
          subject?: string
        }
        Relationships: []
      }
      submissions: {
        Row: {
          answers: Json
          assessment_id: string
          created_at: string
          id: string
          started_at: string | null
          status: string
          student_id: string
          submitted_at: string | null
          time_taken: number | null
        }
        Insert: {
          answers?: Json
          assessment_id: string
          created_at?: string
          id?: string
          started_at?: string | null
          status?: string
          student_id: string
          submitted_at?: string | null
          time_taken?: number | null
        }
        Update: {
          answers?: Json
          assessment_id?: string
          created_at?: string
          id?: string
          started_at?: string | null
          status?: string
          student_id?: string
          submitted_at?: string | null
          time_taken?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "submissions_assessment_id_fkey"
            columns: ["assessment_id"]
            isOneToOne: false
            referencedRelation: "assessments"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_admin: { Args: never; Returns: boolean }
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

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      activity_logs: {
        Row: {
          action: string
          created_at: string
          details: string
          id: string
          user_id: string
        }
        Insert: {
          action: string
          created_at?: string
          details?: string
          id?: string
          user_id: string
        }
        Update: {
          action?: string
          created_at?: string
          details?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      comment_reports: {
        Row: {
          comment_id: string
          created_at: string
          details: string | null
          id: string
          reason: string
          user_id: string
        }
        Insert: {
          comment_id: string
          created_at?: string
          details?: string | null
          id?: string
          reason: string
          user_id: string
        }
        Update: {
          comment_id?: string
          created_at?: string
          details?: string | null
          id?: string
          reason?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "comment_reports_comment_id_fkey"
            columns: ["comment_id"]
            isOneToOne: false
            referencedRelation: "comments"
            referencedColumns: ["id"]
          },
        ]
      }
      comments: {
        Row: {
          comments_count: number
          created_at: string
          device: string | null
          id: string
          image_meta: Json | null
          image_url: string | null
          is_edited: boolean
          is_nsfw: boolean
          is_pending: boolean
          likes_count: number
          moderation_context: Json | null
          post_id: string
          status: Database["public"]["Enums"]["content_status"]
          text: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          comments_count?: number
          created_at?: string
          device?: string | null
          id?: string
          image_meta?: Json | null
          image_url?: string | null
          is_edited?: boolean
          is_nsfw?: boolean
          is_pending?: boolean
          likes_count?: number
          moderation_context?: Json | null
          post_id: string
          status?: Database["public"]["Enums"]["content_status"]
          text?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          comments_count?: number
          created_at?: string
          device?: string | null
          id?: string
          image_meta?: Json | null
          image_url?: string | null
          is_edited?: boolean
          is_nsfw?: boolean
          is_pending?: boolean
          likes_count?: number
          moderation_context?: Json | null
          post_id?: string
          status?: Database["public"]["Enums"]["content_status"]
          text?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      likes: {
        Row: {
          id: string
          liked_at: string
          parent_collection: string
          parent_id: string
          user_id: string
        }
        Insert: {
          id: string
          liked_at?: string
          parent_collection: string
          parent_id: string
          user_id: string
        }
        Update: {
          id?: string
          liked_at?: string
          parent_collection?: string
          parent_id?: string
          user_id?: string
        }
        Relationships: []
      }
      moderation_logs: {
        Row: {
          action_taken: string
          actor_id: string | null
          categories: string[]
          created_at: string
          id: string
          new_status: Database["public"]["Enums"]["content_status"] | null
          previous_status: Database["public"]["Enums"]["content_status"] | null
          reason_details: string | null
          reason_summary: string | null
          resource_id: string | null
          resource_type: string | null
          source: string | null
          timestamp: string
          user_id: string
          verdict: string
        }
        Insert: {
          action_taken: string
          actor_id?: string | null
          categories?: string[]
          created_at?: string
          id?: string
          new_status?: Database["public"]["Enums"]["content_status"] | null
          previous_status?: Database["public"]["Enums"]["content_status"] | null
          reason_details?: string | null
          reason_summary?: string | null
          resource_id?: string | null
          resource_type?: string | null
          source?: string | null
          timestamp?: string
          user_id: string
          verdict: string
        }
        Update: {
          action_taken?: string
          actor_id?: string | null
          categories?: string[]
          created_at?: string
          id?: string
          new_status?: Database["public"]["Enums"]["content_status"] | null
          previous_status?: Database["public"]["Enums"]["content_status"] | null
          reason_details?: string | null
          reason_summary?: string | null
          resource_id?: string | null
          resource_type?: string | null
          source?: string | null
          timestamp?: string
          user_id?: string
          verdict?: string
        }
        Relationships: []
      }
      post_reports: {
        Row: {
          created_at: string
          details: string | null
          id: string
          post_id: string
          reason: string
          user_id: string
        }
        Insert: {
          created_at?: string
          details?: string | null
          id?: string
          post_id: string
          reason: string
          user_id: string
        }
        Update: {
          created_at?: string
          details?: string | null
          id?: string
          post_id?: string
          reason?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_reports_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      posts: {
        Row: {
          comments_count: number
          created_at: string
          device: string | null
          id: string
          image_meta: Json | null
          image_url: string | null
          is_edited: boolean
          is_nsfw: boolean
          is_pending: boolean
          likes_count: number
          moderation_context: Json | null
          status: Database["public"]["Enums"]["content_status"]
          text: string
          updated_at: string | null
          user_id: string
          youtube_url: string | null
        }
        Insert: {
          comments_count?: number
          created_at?: string
          device?: string | null
          id?: string
          image_meta?: Json | null
          image_url?: string | null
          is_edited?: boolean
          is_nsfw?: boolean
          is_pending?: boolean
          likes_count?: number
          moderation_context?: Json | null
          status?: Database["public"]["Enums"]["content_status"]
          text?: string
          updated_at?: string | null
          user_id: string
          youtube_url?: string | null
        }
        Update: {
          comments_count?: number
          created_at?: string
          device?: string | null
          id?: string
          image_meta?: Json | null
          image_url?: string | null
          is_edited?: boolean
          is_nsfw?: boolean
          is_pending?: boolean
          likes_count?: number
          moderation_context?: Json | null
          status?: Database["public"]["Enums"]["content_status"]
          text?: string
          updated_at?: string | null
          user_id?: string
          youtube_url?: string | null
        }
        Relationships: []
      }
      users: {
        Row: {
          avatar_meta: Json | null
          avatar_url: string | null
          banned_at: string | null
          banned_by: string | null
          banned_reason: string | null
          created_at: string
          display_name: string
          display_name_normalized: string
          email: string
          is_active: boolean | null
          is_banned: boolean | null
          is_restricted: boolean | null
          last_known_ip: string | null
          last_online: string
          restricted_at: string | null
          restricted_by: string | null
          restriction_reason: string | null
          role: string
          session_invalidated_at: string | null
          uid: string
          updated_at: string | null
        }
        Insert: {
          avatar_meta?: Json | null
          avatar_url?: string | null
          banned_at?: string | null
          banned_by?: string | null
          banned_reason?: string | null
          created_at?: string
          display_name?: string
          display_name_normalized?: string
          email: string
          is_active?: boolean | null
          is_banned?: boolean | null
          is_restricted?: boolean | null
          last_known_ip?: string | null
          last_online?: string
          restricted_at?: string | null
          restricted_by?: string | null
          restriction_reason?: string | null
          role?: string
          session_invalidated_at?: string | null
          uid: string
          updated_at?: string | null
        }
        Update: {
          avatar_meta?: Json | null
          avatar_url?: string | null
          banned_at?: string | null
          banned_by?: string | null
          banned_reason?: string | null
          created_at?: string
          display_name?: string
          display_name_normalized?: string
          email?: string
          is_active?: boolean | null
          is_banned?: boolean | null
          is_restricted?: boolean | null
          last_known_ip?: string | null
          last_online?: string
          restricted_at?: string | null
          restricted_by?: string | null
          restriction_reason?: string | null
          role?: string
          session_invalidated_at?: string | null
          uid?: string
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_comment_tx: {
        Args: {
          p_comments_count: number
          p_created_at: string
          p_device: string
          p_image_meta: Json
          p_image_url: string
          p_is_nsfw: boolean
          p_is_pending: boolean
          p_likes_count: number
          p_moderation_context?: Json
          p_post_id: string
          p_text: string
          p_updated_at: string
          p_user_id: string
        }
        Returns: string
      }
      delete_comment_tx: {
        Args: { p_comment_id: string; p_post_id: string }
        Returns: undefined
      }
      moderator_block_user_tx: {
        Args: {
          p_banned_by: string
          p_banned_reason: string
          p_uid_to_block: string
        }
        Returns: undefined
      }
      moderator_review_comment_tx: {
        Args: {
          p_action: string
          p_ban_author?: boolean
          p_categories: string[]
          p_comment_id: string
          p_justification: string
          p_moderator_uid: string
        }
        Returns: Json
      }
      moderator_review_content_guarded_tx: {
        Args: {
          p_action: string
          p_ban_author?: boolean
          p_categories: string[]
          p_justification: string
          p_moderator_uid: string
          p_resource_id: string
          p_resource_type: string
        }
        Returns: Json
      }
      moderator_review_post_tx: {
        Args: {
          p_action: string
          p_ban_author?: boolean
          p_categories: string[]
          p_justification: string
          p_moderator_uid: string
          p_post_id: string
        }
        Returns: Json
      }
      moderator_unblock_user_tx: {
        Args: { p_moderator_uid: string; p_uid: string }
        Returns: undefined
      }
      set_like_state_tx: {
        Args: {
          p_liked: boolean
          p_parent_collection: string
          p_parent_id: string
          p_user_id: string
        }
        Returns: Json
      }
    }
    Enums: {
      content_status: "visible" | "pending" | "quarantined" | "rejected"
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      content_status: ["visible", "pending", "quarantined", "rejected"],
    },
  },
} as const

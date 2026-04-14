export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.5";
  };
  public: {
    Tables: {
      categories: {
        Row: {
          created_at: string;
          description: string | null;
          is_active: boolean;
          label: string;
          slug: string;
          sort_order: number;
        };
        Insert: {
          created_at?: string;
          description?: string | null;
          is_active?: boolean;
          label: string;
          slug: string;
          sort_order?: number;
        };
        Update: {
          created_at?: string;
          description?: string | null;
          is_active?: boolean;
          label?: string;
          slug?: string;
          sort_order?: number;
        };
        Relationships: [];
      };
      photos: {
        Row: {
          alt_text: string | null;
          caption: string | null;
          category_slug: string;
          created_at: string;
          created_by: string | null;
          display_size_bytes: number | null;
          display_bucket: string;
          display_path: string;
          height: number | null;
          id: string;
          original_bucket: string;
          original_path: string | null;
          original_size_bytes: number | null;
          photographer_id: string | null;
          published_at: string | null;
          sort_order: number;
          status: string;
          thumbnail_size_bytes: number | null;
          thumbnail_bucket: string;
          thumbnail_path: string | null;
          title: string;
          updated_at: string;
          updated_by: string | null;
          width: number | null;
        };
        Insert: {
          alt_text?: string | null;
          caption?: string | null;
          category_slug: string;
          created_at?: string;
          created_by?: string | null;
          display_size_bytes?: number | null;
          display_bucket?: string;
          display_path: string;
          height?: number | null;
          id?: string;
          original_bucket?: string;
          original_path?: string | null;
          original_size_bytes?: number | null;
          photographer_id?: string | null;
          published_at?: string | null;
          sort_order?: number;
          status?: string;
          thumbnail_size_bytes?: number | null;
          thumbnail_bucket?: string;
          thumbnail_path?: string | null;
          title: string;
          updated_at?: string;
          updated_by?: string | null;
          width?: number | null;
        };
        Update: {
          alt_text?: string | null;
          caption?: string | null;
          category_slug?: string;
          created_at?: string;
          created_by?: string | null;
          display_size_bytes?: number | null;
          display_bucket?: string;
          display_path?: string;
          height?: number | null;
          id?: string;
          original_bucket?: string;
          original_path?: string | null;
          original_size_bytes?: number | null;
          photographer_id?: string | null;
          published_at?: string | null;
          sort_order?: number;
          status?: string;
          thumbnail_size_bytes?: number | null;
          thumbnail_bucket?: string;
          thumbnail_path?: string | null;
          title?: string;
          updated_at?: string;
          updated_by?: string | null;
          width?: number | null;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          created_at: string;
          display_name: string | null;
          email: string | null;
          id: string;
          is_active: boolean;
          role: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          display_name?: string | null;
          email?: string | null;
          id: string;
          is_active?: boolean;
          role?: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          display_name?: string | null;
          email?: string | null;
          id?: string;
          is_active?: boolean;
          role?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      is_admin: {
        Args: never;
        Returns: boolean;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

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
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      profiles: {
        Row: {
          created_at: string
          email: string
          full_name: string | null
          id: string
          invited_at: string | null
          invited_by: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email: string
          full_name?: string | null
          id?: string
          invited_at?: string | null
          invited_by?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          invited_at?: string | null
          invited_by?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          assigned_at: string
          assigned_by: string | null
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          assigned_at?: string
          assigned_by?: string | null
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          assigned_at?: string
          assigned_by?: string | null
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      organizations: {
        Row: {
          id: string
          name: string
          description: string | null
          sector: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          sector?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          sector?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      sectors: {
        Row: {
          id: string
          name: string
          description: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      cities: {
        Row: {
          id: string
          name: string
          region: string | null
          country: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          region?: string | null
          country?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          region?: string | null
          country?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      sites: {
        Row: {
          id: string
          name: string
          food_court_unit: string
          sector_id: string | null
          city_id: string | null
          address: string | null
          postcode: string | null
          contact_person: string | null
          contact_email: string | null
          contact_phone: string | null
          status: string
          created_at: string
          updated_at: string
          created_by: string | null
          cafeteria_type: Database["public"]["Enums"]["cafeteria_type"]
          capacity: number
          expected_footfall: number
          description: string | null
        }
        Insert: {
          id?: string
          name: string
          food_court_unit: string
          sector_id?: string | null
          city_id?: string | null
          address?: string | null
          postcode?: string | null
          contact_person?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          status?: string
          created_at?: string
          updated_at?: string
          created_by?: string | null
          cafeteria_type?: Database["public"]["Enums"]["cafeteria_type"]
          capacity?: number
          expected_footfall?: number
          description?: string | null
        }
        Update: {
          id?: string
          name?: string
          food_court_unit?: string
          sector_id?: string | null
          city_id?: string | null
          address?: string | null
          postcode?: string | null
          contact_person?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          status?: string
          created_at?: string
          updated_at?: string
          created_by?: string | null
          cafeteria_type?: Database["public"]["Enums"]["cafeteria_type"]
          capacity?: number
          expected_footfall?: number
          description?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sites_sector_id_fkey"
            columns: ["sector_id"]
            isOneToOne: false
            referencedRelation: "sectors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sites_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sites_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          }
        ]
      }
      site_assignments: {
        Row: {
          id: string
          site_id: string
          ops_manager_id: string | null
          deployment_engineer_id: string | null
          assigned_at: string
          assigned_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          site_id: string
          ops_manager_id?: string | null
          deployment_engineer_id?: string | null
          assigned_at?: string
          assigned_by: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          site_id?: string
          ops_manager_id?: string | null
          deployment_engineer_id?: string | null
          assigned_at?: string
          assigned_by?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "site_assignments_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "site_assignments_ops_manager_id_fkey"
            columns: ["ops_manager_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "site_assignments_deployment_engineer_id_fkey"
            columns: ["deployment_engineer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "site_assignments_assigned_by_fkey"
            columns: ["assigned_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          }
        ]
      }
      site_studies: {
        Row: {
          id: string
          site_id: string
          conducted_by: string
          study_date: string
          findings: string | null
          site_map_url: string | null
          counter_count: number | null
          hardware_requirements: Json | null
          geolocation_lat: number | null
          geolocation_lng: number | null
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          site_id: string
          conducted_by: string
          study_date: string
          findings?: string | null
          site_map_url?: string | null
          counter_count?: number | null
          hardware_requirements?: Json | null
          geolocation_lat?: number | null
          geolocation_lng?: number | null
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          site_id?: string
          conducted_by?: string
          study_date?: string
          findings?: string | null
          site_map_url?: string | null
          counter_count?: number | null
          hardware_requirements?: Json | null
          geolocation_lat?: number | null
          geolocation_lng?: number | null
          status?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "site_studies_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "site_studies_conducted_by_fkey"
            columns: ["conducted_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          }
        ]
      }
      site_status_tracking: {
        Row: {
          id: string
          site_id: string
          study_status: string
          cost_approval_status: string
          inventory_status: string
          products_status: string
          deployment_status: string
          overall_status: Database["public"]["Enums"]["site_status"]
          updated_at: string
          updated_by: string
        }
        Insert: {
          id?: string
          site_id: string
          study_status?: string
          cost_approval_status?: string
          inventory_status?: string
          products_status?: string
          deployment_status?: string
          overall_status?: Database["public"]["Enums"]["site_status"]
          updated_at?: string
          updated_by: string
        }
        Update: {
          id?: string
          site_id?: string
          study_status?: string
          cost_approval_status?: string
          inventory_status?: string
          products_status?: string
          deployment_status?: string
          overall_status?: Database["public"]["Enums"]["site_status"]
          updated_at?: string
          updated_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "site_status_tracking_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "site_status_tracking_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_current_user_roles: {
        Args: Record<PropertyKey, never>
        Returns: Database["public"]["Enums"]["app_role"][]
      }
      has_role: {
        Args: {
          _user_id: string
          _role: Database["public"]["Enums"]["app_role"]
        }
        Returns: boolean
      }
      is_admin: {
        Args: { _user_id?: string }
        Returns: boolean
      }
      get_site_with_details: {
        Args: {
          site_uuid: string
        }
        Returns: {
          id: string
          name: string
          food_court_unit: string
          address: string | null
          postcode: string | null
          cafeteria_type: Database["public"]["Enums"]["cafeteria_type"]
          capacity: number
          expected_footfall: number
          description: string | null
          status: string
          created_at: string
          updated_at: string
          created_by: string | null
          sector_name: string | null
          city_name: string | null
          ops_manager_name: string | null
          deployment_engineer_name: string | null
          study_status: string | null
          cost_approval_status: string | null
          inventory_status: string | null
          products_status: string | null
          deployment_status: string | null
          overall_status: Database["public"]["Enums"]["site_status"] | null
        }[]
      }
    }
          Enums: {
        app_role: "admin" | "ops_manager" | "deployment_engineer"
      cafeteria_type: "staff" | "visitor" | "mixed"
      site_status: "new" | "in-progress" | "active" | "deployed"
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
      app_role: ["admin", "ops_manager", "deployment_engineer"],
      cafeteria_type: ["staff", "visitor", "mixed"],
      site_status: ["new", "in-progress", "active", "deployed"],
    },
  },
} as const

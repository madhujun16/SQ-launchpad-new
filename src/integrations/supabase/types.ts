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
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      approval_actions: {
        Row: {
          action: string
          approval_id: string
          comment: string | null
          created_at: string
          id: string
          metadata: Json | null
          performed_at: string
          performed_by: string
          performed_by_role: string
        }
        Insert: {
          action: string
          approval_id: string
          comment?: string | null
          created_at?: string
          id?: string
          metadata?: Json | null
          performed_at?: string
          performed_by: string
          performed_by_role: string
        }
        Update: {
          action?: string
          approval_id?: string
          comment?: string | null
          created_at?: string
          id?: string
          metadata?: Json | null
          performed_at?: string
          performed_by?: string
          performed_by_role?: string
        }
        Relationships: [
          {
            foreignKeyName: "approval_actions_approval_id_fkey"
            columns: ["approval_id"]
            isOneToOne: false
            referencedRelation: "scoping_approvals"
            referencedColumns: ["id"]
          },
        ]
      }
      assets: {
        Row: {
          assigned_to: string | null
          cost: number
          created_at: string | null
          id: string
          last_maintenance: string | null
          license_expiry: string | null
          license_key: string | null
          location: string | null
          maintenance_schedule: string | null
          manufacturer: string | null
          model: string | null
          name: string
          next_maintenance: string | null
          notes: string | null
          purchase_date: string | null
          serial_number: string | null
          site_id: string | null
          site_name: string | null
          status: string
          type: string
          updated_at: string | null
          warranty_expiry: string | null
        }
        Insert: {
          assigned_to?: string | null
          cost?: number
          created_at?: string | null
          id?: string
          last_maintenance?: string | null
          license_expiry?: string | null
          license_key?: string | null
          location?: string | null
          maintenance_schedule?: string | null
          manufacturer?: string | null
          model?: string | null
          name: string
          next_maintenance?: string | null
          notes?: string | null
          purchase_date?: string | null
          serial_number?: string | null
          site_id?: string | null
          site_name?: string | null
          status?: string
          type: string
          updated_at?: string | null
          warranty_expiry?: string | null
        }
        Update: {
          assigned_to?: string | null
          cost?: number
          created_at?: string | null
          id?: string
          last_maintenance?: string | null
          license_expiry?: string | null
          license_key?: string | null
          location?: string | null
          maintenance_schedule?: string | null
          manufacturer?: string | null
          model?: string | null
          name?: string
          next_maintenance?: string | null
          notes?: string | null
          purchase_date?: string | null
          serial_number?: string | null
          site_id?: string | null
          site_name?: string | null
          status?: string
          type?: string
          updated_at?: string | null
          warranty_expiry?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "assets_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          created_at: string | null
          details: string | null
          entity: string
          id: string
          ip_address: unknown | null
          record_id: string | null
          table_name: string | null
          timestamp: string | null
          user_id: string | null
          user_name: string
        }
        Insert: {
          action: string
          created_at?: string | null
          details?: string | null
          entity: string
          id?: string
          ip_address?: unknown | null
          record_id?: string | null
          table_name?: string | null
          timestamp?: string | null
          user_id?: string | null
          user_name: string
        }
        Update: {
          action?: string
          created_at?: string | null
          details?: string | null
          entity?: string
          id?: string
          ip_address?: unknown | null
          record_id?: string | null
          table_name?: string | null
          timestamp?: string | null
          user_id?: string | null
          user_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      business_rules: {
        Row: {
          created_at: string | null
          created_by: string | null
          description: string | null
          hardware_item_ids: string[] | null
          id: string
          name: string
          priority: number | null
          rule_type: string
          rule_value: string | null
          software_module_ids: string[] | null
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          hardware_item_ids?: string[] | null
          id?: string
          name: string
          priority?: number | null
          rule_type: string
          rule_value?: string | null
          software_module_ids?: string[] | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          hardware_item_ids?: string[] | null
          id?: string
          name?: string
          priority?: number | null
          rule_type?: string
          rule_value?: string | null
          software_module_ids?: string[] | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: []
      }
      cities: {
        Row: {
          created_at: string
          id: string
          name: string
          region: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          region: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          region?: string
          updated_at?: string
        }
        Relationships: []
      }
      configuration_audit_log: {
        Row: {
          action: string
          changed_at: string | null
          changed_by: string | null
          id: string
          ip_address: unknown | null
          new_values: Json | null
          old_values: Json | null
          record_id: string
          table_name: string
          user_agent: string | null
        }
        Insert: {
          action: string
          changed_at?: string | null
          changed_by?: string | null
          id?: string
          ip_address?: unknown | null
          new_values?: Json | null
          old_values?: Json | null
          record_id: string
          table_name: string
          user_agent?: string | null
        }
        Update: {
          action?: string
          changed_at?: string | null
          changed_by?: string | null
          id?: string
          ip_address?: unknown | null
          new_values?: Json | null
          old_values?: Json | null
          record_id?: string
          table_name?: string
          user_agent?: string | null
        }
        Relationships: []
      }
      costing_approval_audit_log: {
        Row: {
          action: string
          comment: string | null
          costing_approval_id: string
          id: string
          metadata: Json | null
          timestamp: string
          user_id: string
          user_role: string
        }
        Insert: {
          action: string
          comment?: string | null
          costing_approval_id: string
          id?: string
          metadata?: Json | null
          timestamp?: string
          user_id: string
          user_role: string
        }
        Update: {
          action?: string
          comment?: string | null
          costing_approval_id?: string
          id?: string
          metadata?: Json | null
          timestamp?: string
          user_id?: string
          user_role?: string
        }
        Relationships: [
          {
            foreignKeyName: "costing_approval_audit_log_costing_approval_id_fkey"
            columns: ["costing_approval_id"]
            isOneToOne: false
            referencedRelation: "costing_approvals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "costing_approval_audit_log_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      costing_approvals: {
        Row: {
          created_at: string
          deployment_engineer_id: string
          grand_total: number | null
          id: string
          ops_manager_id: string
          procurement_status:
            | Database["public"]["Enums"]["procurement_status"]
            | null
          rejection_reason: string | null
          review_comment: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          site_id: string
          status: Database["public"]["Enums"]["costing_approval_status"] | null
          submitted_at: string
          total_hardware_cost: number | null
          total_license_cost: number | null
          total_monthly_fees: number | null
          total_software_cost: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          deployment_engineer_id: string
          grand_total?: number | null
          id?: string
          ops_manager_id: string
          procurement_status?:
            | Database["public"]["Enums"]["procurement_status"]
            | null
          rejection_reason?: string | null
          review_comment?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          site_id: string
          status?: Database["public"]["Enums"]["costing_approval_status"] | null
          submitted_at?: string
          total_hardware_cost?: number | null
          total_license_cost?: number | null
          total_monthly_fees?: number | null
          total_software_cost?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          deployment_engineer_id?: string
          grand_total?: number | null
          id?: string
          ops_manager_id?: string
          procurement_status?:
            | Database["public"]["Enums"]["procurement_status"]
            | null
          rejection_reason?: string | null
          review_comment?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          site_id?: string
          status?: Database["public"]["Enums"]["costing_approval_status"] | null
          submitted_at?: string
          total_hardware_cost?: number | null
          total_license_cost?: number | null
          total_monthly_fees?: number | null
          total_software_cost?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "costing_approvals_deployment_engineer_id_fkey"
            columns: ["deployment_engineer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "costing_approvals_ops_manager_id_fkey"
            columns: ["ops_manager_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "costing_approvals_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      costing_items: {
        Row: {
          annual_fee: number | null
          category: string | null
          costing_approval_id: string
          created_at: string
          id: string
          is_required: boolean | null
          item_description: string | null
          item_name: string
          item_type: string
          manufacturer: string | null
          model: string | null
          monthly_fee: number | null
          quantity: number
          total_cost: number
          unit_cost: number
          updated_at: string
        }
        Insert: {
          annual_fee?: number | null
          category?: string | null
          costing_approval_id: string
          created_at?: string
          id?: string
          is_required?: boolean | null
          item_description?: string | null
          item_name: string
          item_type: string
          manufacturer?: string | null
          model?: string | null
          monthly_fee?: number | null
          quantity?: number
          total_cost?: number
          unit_cost?: number
          updated_at?: string
        }
        Update: {
          annual_fee?: number | null
          category?: string | null
          costing_approval_id?: string
          created_at?: string
          id?: string
          is_required?: boolean | null
          item_description?: string | null
          item_name?: string
          item_type?: string
          manufacturer?: string | null
          model?: string | null
          monthly_fee?: number | null
          quantity?: number
          total_cost?: number
          unit_cost?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "costing_items_costing_approval_id_fkey"
            columns: ["costing_approval_id"]
            isOneToOne: false
            referencedRelation: "costing_approvals"
            referencedColumns: ["id"]
          },
        ]
      }
      deployment_checklist_items: {
        Row: {
          category: string
          completed: boolean | null
          completed_at: string | null
          completed_by: string | null
          created_at: string | null
          deployment_id: string | null
          description: string | null
          id: string
          title: string
        }
        Insert: {
          category: string
          completed?: boolean | null
          completed_at?: string | null
          completed_by?: string | null
          created_at?: string | null
          deployment_id?: string | null
          description?: string | null
          id?: string
          title: string
        }
        Update: {
          category?: string
          completed?: boolean | null
          completed_at?: string | null
          completed_by?: string | null
          created_at?: string | null
          deployment_id?: string | null
          description?: string | null
          id?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "deployment_checklist_items_completed_by_fkey"
            columns: ["completed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "deployment_checklist_items_deployment_id_fkey"
            columns: ["deployment_id"]
            isOneToOne: false
            referencedRelation: "deployments"
            referencedColumns: ["id"]
          },
        ]
      }
      deployments: {
        Row: {
          assigned_deployment_engineer: string | null
          assigned_ops_manager: string | null
          created_at: string | null
          deployment_date: string
          go_live_ready: boolean | null
          hardware_delivered: boolean | null
          id: string
          installation_started: boolean | null
          notes: string | null
          progress_percentage: number
          site_id: string | null
          site_name: string
          status: string
          testing_completed: boolean | null
          updated_at: string | null
        }
        Insert: {
          assigned_deployment_engineer?: string | null
          assigned_ops_manager?: string | null
          created_at?: string | null
          deployment_date: string
          go_live_ready?: boolean | null
          hardware_delivered?: boolean | null
          id?: string
          installation_started?: boolean | null
          notes?: string | null
          progress_percentage?: number
          site_id?: string | null
          site_name: string
          status?: string
          testing_completed?: boolean | null
          updated_at?: string | null
        }
        Update: {
          assigned_deployment_engineer?: string | null
          assigned_ops_manager?: string | null
          created_at?: string | null
          deployment_date?: string
          go_live_ready?: boolean | null
          hardware_delivered?: boolean | null
          id?: string
          installation_started?: boolean | null
          notes?: string | null
          progress_percentage?: number
          site_id?: string | null
          site_name?: string
          status?: string
          testing_completed?: boolean | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "deployments_assigned_deployment_engineer_fkey"
            columns: ["assigned_deployment_engineer"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "deployments_assigned_ops_manager_fkey"
            columns: ["assigned_ops_manager"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      hardware_items: {
        Row: {
          category: string
          created_at: string | null
          description: string | null
          estimated_cost: number | null
          id: string
          installation_cost: number | null
          is_active: boolean | null
          maintenance_cost: number | null
          manufacturer: string | null
          model: string | null
          name: string
          unit_cost: number | null
          updated_at: string | null
        }
        Insert: {
          category: string
          created_at?: string | null
          description?: string | null
          estimated_cost?: number | null
          id?: string
          installation_cost?: number | null
          is_active?: boolean | null
          maintenance_cost?: number | null
          manufacturer?: string | null
          model?: string | null
          name: string
          unit_cost?: number | null
          updated_at?: string | null
        }
        Update: {
          category?: string
          created_at?: string | null
          description?: string | null
          estimated_cost?: number | null
          id?: string
          installation_cost?: number | null
          is_active?: boolean | null
          maintenance_cost?: number | null
          manufacturer?: string | null
          model?: string | null
          name?: string
          unit_cost?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      hardware_request_items: {
        Row: {
          created_at: string | null
          hardware_item_id: string | null
          id: string
          notes: string | null
          quantity: number
          request_id: string | null
          total_cost: number
          unit_cost: number
        }
        Insert: {
          created_at?: string | null
          hardware_item_id?: string | null
          id?: string
          notes?: string | null
          quantity?: number
          request_id?: string | null
          total_cost?: number
          unit_cost?: number
        }
        Update: {
          created_at?: string | null
          hardware_item_id?: string | null
          id?: string
          notes?: string | null
          quantity?: number
          request_id?: string | null
          total_cost?: number
          unit_cost?: number
        }
        Relationships: [
          {
            foreignKeyName: "hardware_request_items_hardware_item_id_fkey"
            columns: ["hardware_item_id"]
            isOneToOne: false
            referencedRelation: "hardware_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hardware_request_items_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "hardware_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      hardware_requests: {
        Row: {
          assigned_deployment_engineer: string | null
          assigned_ops_manager: string | null
          comments: string | null
          created_at: string | null
          expected_delivery: string | null
          id: string
          items_count: number
          priority: string
          procurement_status: string | null
          rejection_reason: string | null
          requested_at: string | null
          requested_by: string | null
          site_id: string | null
          site_name: string
          status: string
          total_value: number
          updated_at: string | null
        }
        Insert: {
          assigned_deployment_engineer?: string | null
          assigned_ops_manager?: string | null
          comments?: string | null
          created_at?: string | null
          expected_delivery?: string | null
          id?: string
          items_count?: number
          priority?: string
          procurement_status?: string | null
          rejection_reason?: string | null
          requested_at?: string | null
          requested_by?: string | null
          site_id?: string | null
          site_name: string
          status?: string
          total_value?: number
          updated_at?: string | null
        }
        Update: {
          assigned_deployment_engineer?: string | null
          assigned_ops_manager?: string | null
          comments?: string | null
          created_at?: string | null
          expected_delivery?: string | null
          id?: string
          items_count?: number
          priority?: string
          procurement_status?: string | null
          rejection_reason?: string | null
          requested_at?: string | null
          requested_by?: string | null
          site_id?: string | null
          site_name?: string
          status?: string
          total_value?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "hardware_requests_assigned_deployment_engineer_fkey"
            columns: ["assigned_deployment_engineer"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "hardware_requests_assigned_ops_manager_fkey"
            columns: ["assigned_ops_manager"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "hardware_requests_requested_by_fkey"
            columns: ["requested_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      inventory_items: {
        Row: {
          assigned_to: string | null
          created_at: string
          created_by: string
          group_type: Database["public"]["Enums"]["group_type"]
          id: string
          inventory_type: Database["public"]["Enums"]["inventory_type"]
          model: string
          notes: string | null
          purchase_date: string | null
          serial_number: string
          site_id: string | null
          status: Database["public"]["Enums"]["inventory_status"] | null
          updated_at: string
          warranty_expiry: string | null
        }
        Insert: {
          assigned_to?: string | null
          created_at?: string
          created_by: string
          group_type: Database["public"]["Enums"]["group_type"]
          id?: string
          inventory_type: Database["public"]["Enums"]["inventory_type"]
          model: string
          notes?: string | null
          purchase_date?: string | null
          serial_number: string
          site_id?: string | null
          status?: Database["public"]["Enums"]["inventory_status"] | null
          updated_at?: string
          warranty_expiry?: string | null
        }
        Update: {
          assigned_to?: string | null
          created_at?: string
          created_by?: string
          group_type?: Database["public"]["Enums"]["group_type"]
          id?: string
          inventory_type?: Database["public"]["Enums"]["inventory_type"]
          model?: string
          notes?: string | null
          purchase_date?: string | null
          serial_number?: string
          site_id?: string | null
          status?: Database["public"]["Enums"]["inventory_status"] | null
          updated_at?: string
          warranty_expiry?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "inventory_items_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_items_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      licenses: {
        Row: {
          cost: number | null
          created_at: string
          created_by: string | null
          expiry_date: string | null
          id: string
          license_key: string | null
          license_type: string | null
          name: string
          notes: string | null
          purchase_date: string | null
          status: string | null
          updated_at: string
          vendor: string | null
        }
        Insert: {
          cost?: number | null
          created_at?: string
          created_by?: string | null
          expiry_date?: string | null
          id?: string
          license_key?: string | null
          license_type?: string | null
          name: string
          notes?: string | null
          purchase_date?: string | null
          status?: string | null
          updated_at?: string
          vendor?: string | null
        }
        Update: {
          cost?: number | null
          created_at?: string
          created_by?: string | null
          expiry_date?: string | null
          id?: string
          license_key?: string | null
          license_type?: string | null
          name?: string
          notes?: string | null
          purchase_date?: string | null
          status?: string | null
          updated_at?: string
          vendor?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "licenses_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      licenses_secure: {
        Row: {
          created_at: string | null
          id: string
          license_key: string | null
          owner_id: string | null
          product: string | null
          updated_at: string | null
          vendor: string | null
        }
        Insert: {
          created_at?: string | null
          id: string
          license_key?: string | null
          owner_id?: string | null
          product?: string | null
          updated_at?: string | null
          vendor?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          license_key?: string | null
          owner_id?: string | null
          product?: string | null
          updated_at?: string | null
          vendor?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "licenses_secure_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      maintenance_logs: {
        Row: {
          asset_id: string | null
          asset_name: string
          cost: number
          created_at: string | null
          description: string
          id: string
          maintenance_type: string
          next_maintenance_date: string | null
          notes: string | null
          performed_at: string | null
          performed_by: string | null
        }
        Insert: {
          asset_id?: string | null
          asset_name: string
          cost?: number
          created_at?: string | null
          description: string
          id?: string
          maintenance_type: string
          next_maintenance_date?: string | null
          notes?: string | null
          performed_at?: string | null
          performed_by?: string | null
        }
        Update: {
          asset_id?: string | null
          asset_name?: string
          cost?: number
          created_at?: string | null
          description?: string
          id?: string
          maintenance_type?: string
          next_maintenance_date?: string | null
          notes?: string | null
          performed_at?: string | null
          performed_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "maintenance_logs_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "assets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maintenance_logs_performed_by_fkey"
            columns: ["performed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      notification_preferences: {
        Row: {
          approval_notifications: boolean | null
          created_at: string | null
          deployment_notifications: boolean | null
          email_enabled: boolean | null
          forecast_notifications: boolean | null
          id: string
          maintenance_notifications: boolean | null
          push_enabled: boolean | null
          scoping_notifications: boolean | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          approval_notifications?: boolean | null
          created_at?: string | null
          deployment_notifications?: boolean | null
          email_enabled?: boolean | null
          forecast_notifications?: boolean | null
          id?: string
          maintenance_notifications?: boolean | null
          push_enabled?: boolean | null
          scoping_notifications?: boolean | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          approval_notifications?: boolean | null
          created_at?: string | null
          deployment_notifications?: boolean | null
          email_enabled?: boolean | null
          forecast_notifications?: boolean | null
          id?: string
          maintenance_notifications?: boolean | null
          push_enabled?: boolean | null
          scoping_notifications?: boolean | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          action_url: string | null
          created_at: string | null
          created_by: string
          entity_id: string
          entity_type: string
          id: string
          is_read: boolean | null
          message: string
          metadata: Json | null
          priority: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          action_url?: string | null
          created_at?: string | null
          created_by: string
          entity_id: string
          entity_type: string
          id?: string
          is_read?: boolean | null
          message: string
          metadata?: Json | null
          priority?: string | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          action_url?: string | null
          created_at?: string | null
          created_by?: string
          entity_id?: string
          entity_type?: string
          id?: string
          is_read?: boolean | null
          message?: string
          metadata?: Json | null
          priority?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      organizations: {
        Row: {
          archive_reason: string | null
          archived_at: string | null
          created_at: string | null
          created_by: string | null
          created_on: string | null
          description: string | null
          id: string
          is_archived: boolean | null
          logo_url: string | null
          name: string
          sector: string
          unit_code: string | null
          updated_at: string | null
        }
        Insert: {
          archive_reason?: string | null
          archived_at?: string | null
          created_at?: string | null
          created_by?: string | null
          created_on?: string | null
          description?: string | null
          id?: string
          is_archived?: boolean | null
          logo_url?: string | null
          name: string
          sector: string
          unit_code?: string | null
          updated_at?: string | null
        }
        Update: {
          archive_reason?: string | null
          archived_at?: string | null
          created_at?: string | null
          created_by?: string | null
          created_on?: string | null
          description?: string | null
          id?: string
          is_archived?: boolean | null
          logo_url?: string | null
          name?: string
          sector?: string
          unit_code?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          full_name: string | null
          id: string
          invited_at: string | null
          invited_by: string | null
          is_active: boolean
          last_login_at: string | null
          updated_at: string
          user_id: string
          welcome_email_sent: boolean | null
        }
        Insert: {
          created_at?: string
          email: string
          full_name?: string | null
          id?: string
          invited_at?: string | null
          invited_by?: string | null
          is_active?: boolean
          last_login_at?: string | null
          updated_at?: string
          user_id: string
          welcome_email_sent?: boolean | null
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          invited_at?: string | null
          invited_by?: string | null
          is_active?: boolean
          last_login_at?: string | null
          updated_at?: string
          user_id?: string
          welcome_email_sent?: boolean | null
        }
        Relationships: []
      }
      recommendation_rules: {
        Row: {
          cost_multiplier: number | null
          created_at: string | null
          created_by: string | null
          default_quantity: number | null
          hardware_item_id: string
          id: string
          is_required: boolean | null
          reason: string | null
          software_module_id: string
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          cost_multiplier?: number | null
          created_at?: string | null
          created_by?: string | null
          default_quantity?: number | null
          hardware_item_id: string
          id?: string
          is_required?: boolean | null
          reason?: string | null
          software_module_id: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          cost_multiplier?: number | null
          created_at?: string | null
          created_by?: string | null
          default_quantity?: number | null
          hardware_item_id?: string
          id?: string
          is_required?: boolean | null
          reason?: string | null
          software_module_id?: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "recommendation_rules_hardware_item_id_fkey"
            columns: ["hardware_item_id"]
            isOneToOne: false
            referencedRelation: "hardware_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recommendation_rules_software_module_id_fkey"
            columns: ["software_module_id"]
            isOneToOne: false
            referencedRelation: "software_modules"
            referencedColumns: ["id"]
          },
        ]
      }
      scoping_approvals: {
        Row: {
          cost_breakdown: Json
          created_at: string
          deployment_engineer_id: string
          deployment_engineer_name: string
          id: string
          ops_manager_id: string | null
          ops_manager_name: string | null
          previous_version_id: string | null
          rejection_reason: string | null
          review_comment: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          scoping_data: Json
          site_id: string
          site_name: string
          status: string
          submitted_at: string
          updated_at: string
          version: number
        }
        Insert: {
          cost_breakdown: Json
          created_at?: string
          deployment_engineer_id: string
          deployment_engineer_name: string
          id?: string
          ops_manager_id?: string | null
          ops_manager_name?: string | null
          previous_version_id?: string | null
          rejection_reason?: string | null
          review_comment?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          scoping_data: Json
          site_id: string
          site_name: string
          status?: string
          submitted_at?: string
          updated_at?: string
          version?: number
        }
        Update: {
          cost_breakdown?: Json
          created_at?: string
          deployment_engineer_id?: string
          deployment_engineer_name?: string
          id?: string
          ops_manager_id?: string | null
          ops_manager_name?: string | null
          previous_version_id?: string | null
          rejection_reason?: string | null
          review_comment?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          scoping_data?: Json
          site_id?: string
          site_name?: string
          status?: string
          submitted_at?: string
          updated_at?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "scoping_approvals_previous_version_id_fkey"
            columns: ["previous_version_id"]
            isOneToOne: false
            referencedRelation: "scoping_approvals"
            referencedColumns: ["id"]
          },
        ]
      }
      sectors: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      site_assignments: {
        Row: {
          assigned_at: string
          assigned_by: string
          created_at: string
          deployment_engineer_id: string | null
          id: string
          ops_manager_id: string | null
          site_id: string
          updated_at: string
        }
        Insert: {
          assigned_at?: string
          assigned_by: string
          created_at?: string
          deployment_engineer_id?: string | null
          id?: string
          ops_manager_id?: string | null
          site_id: string
          updated_at?: string
        }
        Update: {
          assigned_at?: string
          assigned_by?: string
          created_at?: string
          deployment_engineer_id?: string | null
          id?: string
          ops_manager_id?: string | null
          site_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "site_assignments_assigned_by_fkey"
            columns: ["assigned_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "site_assignments_deployment_engineer_id_fkey"
            columns: ["deployment_engineer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "site_assignments_ops_manager_id_fkey"
            columns: ["ops_manager_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      site_hardware_scoping: {
        Row: {
          created_at: string | null
          custom_name: string | null
          hardware_item_id: string | null
          id: string
          is_auto_suggested: boolean | null
          is_custom: boolean | null
          notes: string | null
          quantity: number | null
          scoped_at: string | null
          scoped_by: string | null
          site_id: string | null
          software_module_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          custom_name?: string | null
          hardware_item_id?: string | null
          id?: string
          is_auto_suggested?: boolean | null
          is_custom?: boolean | null
          notes?: string | null
          quantity?: number | null
          scoped_at?: string | null
          scoped_by?: string | null
          site_id?: string | null
          software_module_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          custom_name?: string | null
          hardware_item_id?: string | null
          id?: string
          is_auto_suggested?: boolean | null
          is_custom?: boolean | null
          notes?: string | null
          quantity?: number | null
          scoped_at?: string | null
          scoped_by?: string | null
          site_id?: string | null
          software_module_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "site_hardware_scoping_hardware_item_id_fkey"
            columns: ["hardware_item_id"]
            isOneToOne: false
            referencedRelation: "hardware_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "site_hardware_scoping_scoped_by_fkey"
            columns: ["scoped_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "site_hardware_scoping_software_module_id_fkey"
            columns: ["software_module_id"]
            isOneToOne: false
            referencedRelation: "software_modules"
            referencedColumns: ["id"]
          },
        ]
      }
      site_software_scoping: {
        Row: {
          created_at: string | null
          id: string
          is_frozen: boolean | null
          is_selected: boolean | null
          notes: string | null
          quantity: number | null
          scoped_at: string | null
          scoped_by: string | null
          site_id: string | null
          software_module_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_frozen?: boolean | null
          is_selected?: boolean | null
          notes?: string | null
          quantity?: number | null
          scoped_at?: string | null
          scoped_by?: string | null
          site_id?: string | null
          software_module_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_frozen?: boolean | null
          is_selected?: boolean | null
          notes?: string | null
          quantity?: number | null
          scoped_at?: string | null
          scoped_by?: string | null
          site_id?: string | null
          software_module_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "site_software_scoping_scoped_by_fkey"
            columns: ["scoped_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "site_software_scoping_software_module_id_fkey"
            columns: ["software_module_id"]
            isOneToOne: false
            referencedRelation: "software_modules"
            referencedColumns: ["id"]
          },
        ]
      }
      site_status_tracking: {
        Row: {
          cost_approval_status: string | null
          deployment_status: string | null
          id: string
          inventory_status: string | null
          notes: string | null
          overall_status: Database["public"]["Enums"]["site_status"] | null
          products_status: string | null
          site_id: string
          study_status: string | null
          updated_at: string
          updated_by: string
        }
        Insert: {
          cost_approval_status?: string | null
          deployment_status?: string | null
          id?: string
          inventory_status?: string | null
          notes?: string | null
          overall_status?: Database["public"]["Enums"]["site_status"] | null
          products_status?: string | null
          site_id: string
          study_status?: string | null
          updated_at?: string
          updated_by: string
        }
        Update: {
          cost_approval_status?: string | null
          deployment_status?: string | null
          id?: string
          inventory_status?: string | null
          notes?: string | null
          overall_status?: Database["public"]["Enums"]["site_status"] | null
          products_status?: string | null
          site_id?: string
          study_status?: string | null
          updated_at?: string
          updated_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "site_status_tracking_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      site_studies: {
        Row: {
          additional_site_details: string | null
          conducted_by: string
          counter_count: number | null
          created_at: string
          findings: string | null
          geolocation_lat: number | null
          geolocation_lng: number | null
          hardware_requirements: Json | null
          id: string
          site_id: string
          site_map_url: string | null
          site_notes: string | null
          stakeholders: Json | null
          status: string | null
          study_date: string
          updated_at: string
        }
        Insert: {
          additional_site_details?: string | null
          conducted_by: string
          counter_count?: number | null
          created_at?: string
          findings?: string | null
          geolocation_lat?: number | null
          geolocation_lng?: number | null
          hardware_requirements?: Json | null
          id?: string
          site_id: string
          site_map_url?: string | null
          site_notes?: string | null
          stakeholders?: Json | null
          status?: string | null
          study_date: string
          updated_at?: string
        }
        Update: {
          additional_site_details?: string | null
          conducted_by?: string
          counter_count?: number | null
          created_at?: string
          findings?: string | null
          geolocation_lat?: number | null
          geolocation_lng?: number | null
          hardware_requirements?: Json | null
          id?: string
          site_id?: string
          site_map_url?: string | null
          site_notes?: string | null
          stakeholders?: Json | null
          status?: string | null
          study_date?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "site_studies_conducted_by_fkey"
            columns: ["conducted_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      site_workflow_stages: {
        Row: {
          assigned_to: string | null
          completed_at: string | null
          created_at: string | null
          id: string
          notes: string | null
          site_id: string | null
          stage_name: string
          started_at: string | null
          status: string
          updated_at: string | null
        }
        Insert: {
          assigned_to?: string | null
          completed_at?: string | null
          created_at?: string | null
          id?: string
          notes?: string | null
          site_id?: string | null
          stage_name: string
          started_at?: string | null
          status?: string
          updated_at?: string | null
        }
        Update: {
          assigned_to?: string | null
          completed_at?: string | null
          created_at?: string | null
          id?: string
          notes?: string | null
          site_id?: string | null
          stage_name?: string
          started_at?: string | null
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "site_workflow_stages_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      sites: {
        Row: {
          additional_contact_email: string | null
          additional_contact_name: string | null
          address: string | null
          archive_reason: string | null
          archived_at: string | null
          assigned_deployment_engineer: string | null
          assigned_deployment_engineer_id: string | null
          assigned_ops_manager: string | null
          assigned_ops_manager_id: string | null
          country: string | null
          created_at: string | null
          criticality_level: string | null
          food_court_unit: string | null
          id: string
          is_archived: boolean | null
          job_title: string | null
          latitude: number | null
          location: string
          longitude: number | null
          name: string
          organization_id: string | null
          organization_logo: string | null
          organization_name: string
          postcode: string | null
          region: string | null
          sector: string | null
          stakeholders: Json | null
          status: string
          target_live_date: string | null
          team_assignment: string | null
          unit_code: string | null
          unit_manager_email: string | null
          unit_manager_mobile: string | null
          unit_manager_name: string | null
          updated_at: string | null
        }
        Insert: {
          additional_contact_email?: string | null
          additional_contact_name?: string | null
          address?: string | null
          archive_reason?: string | null
          archived_at?: string | null
          assigned_deployment_engineer?: string | null
          assigned_deployment_engineer_id?: string | null
          assigned_ops_manager?: string | null
          assigned_ops_manager_id?: string | null
          country?: string | null
          created_at?: string | null
          criticality_level?: string | null
          food_court_unit?: string | null
          id?: string
          is_archived?: boolean | null
          job_title?: string | null
          latitude?: number | null
          location: string
          longitude?: number | null
          name: string
          organization_id?: string | null
          organization_logo?: string | null
          organization_name: string
          postcode?: string | null
          region?: string | null
          sector?: string | null
          stakeholders?: Json | null
          status: string
          target_live_date?: string | null
          team_assignment?: string | null
          unit_code?: string | null
          unit_manager_email?: string | null
          unit_manager_mobile?: string | null
          unit_manager_name?: string | null
          updated_at?: string | null
        }
        Update: {
          additional_contact_email?: string | null
          additional_contact_name?: string | null
          address?: string | null
          archive_reason?: string | null
          archived_at?: string | null
          assigned_deployment_engineer?: string | null
          assigned_deployment_engineer_id?: string | null
          assigned_ops_manager?: string | null
          assigned_ops_manager_id?: string | null
          country?: string | null
          created_at?: string | null
          criticality_level?: string | null
          food_court_unit?: string | null
          id?: string
          is_archived?: boolean | null
          job_title?: string | null
          latitude?: number | null
          location?: string
          longitude?: number | null
          name?: string
          organization_id?: string | null
          organization_logo?: string | null
          organization_name?: string
          postcode?: string | null
          region?: string | null
          sector?: string | null
          stakeholders?: Json | null
          status?: string
          target_live_date?: string | null
          team_assignment?: string | null
          unit_code?: string | null
          unit_manager_email?: string | null
          unit_manager_mobile?: string | null
          unit_manager_name?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sites_assigned_deployment_engineer_id_fkey"
            columns: ["assigned_deployment_engineer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "sites_assigned_ops_manager_id_fkey"
            columns: ["assigned_ops_manager_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "sites_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      software_hardware_mapping: {
        Row: {
          created_at: string | null
          hardware_item_id: string | null
          id: string
          is_required: boolean | null
          quantity: number | null
          software_module_id: string | null
        }
        Insert: {
          created_at?: string | null
          hardware_item_id?: string | null
          id?: string
          is_required?: boolean | null
          quantity?: number | null
          software_module_id?: string | null
        }
        Update: {
          created_at?: string | null
          hardware_item_id?: string | null
          id?: string
          is_required?: boolean | null
          quantity?: number | null
          software_module_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "software_hardware_mapping_hardware_item_id_fkey"
            columns: ["hardware_item_id"]
            isOneToOne: false
            referencedRelation: "hardware_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "software_hardware_mapping_software_module_id_fkey"
            columns: ["software_module_id"]
            isOneToOne: false
            referencedRelation: "software_modules"
            referencedColumns: ["id"]
          },
        ]
      }
      software_modules: {
        Row: {
          category: string
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          license_fee: number | null
          monthly_fee: number | null
          name: string
          setup_fee: number | null
          updated_at: string | null
        }
        Insert: {
          category: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          license_fee?: number | null
          monthly_fee?: number | null
          name: string
          setup_fee?: number | null
          updated_at?: string | null
        }
        Update: {
          category?: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          license_fee?: number | null
          monthly_fee?: number | null
          name?: string
          setup_fee?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          assigned_at: string
          assigned_by: string | null
          created_at: string
          created_by: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          assigned_at?: string
          assigned_by?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          assigned_at?: string
          assigned_by?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_user_roles_user_id"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      workflow_audit_logs: {
        Row: {
          admin_override: boolean | null
          created_at: string | null
          from_status: string
          id: string
          reason: string | null
          site_id: string
          to_status: string
          user_id: string
          user_role: string
        }
        Insert: {
          admin_override?: boolean | null
          created_at?: string | null
          from_status: string
          id?: string
          reason?: string | null
          site_id: string
          to_status: string
          user_id: string
          user_role: string
        }
        Update: {
          admin_override?: boolean | null
          created_at?: string | null
          from_status?: string
          id?: string
          reason?: string | null
          site_id?: string
          to_status?: string
          user_id?: string
          user_role?: string
        }
        Relationships: [
          {
            foreignKeyName: "workflow_audit_logs_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      audit_rls_policies: {
        Args: Record<PropertyKey, never>
        Returns: {
          policy_definition: string
          policy_name: string
          security_status: string
          table_name: string
        }[]
      }
      audit_security_check: {
        Args: Record<PropertyKey, never>
        Returns: {
          policy_count: number
          rls_enabled: boolean
          security_status: string
          table_name: string
        }[]
      }
      can_access_sites: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      check_email_exists: {
        Args: { email_to_check: string }
        Returns: boolean
      }
      check_email_exists_secure: {
        Args: { email_to_check: string }
        Returns: boolean
      }
      clear_organization_logo: {
        Args: { org_id: string }
        Returns: boolean
      }
      create_notification: {
        Args: {
          _action_url?: string
          _entity_id: string
          _entity_type: string
          _message: string
          _metadata?: Json
          _priority?: string
          _title: string
          _type: string
          _user_ids: string[]
        }
        Returns: undefined
      }
      get_current_user_roles: {
        Args: Record<PropertyKey, never>
        Returns: Database["public"]["Enums"]["app_role"][]
      }
      get_filtered_inventory: {
        Args: {
          p_assigned_to?: string
          p_inventory_type?: Database["public"]["Enums"]["inventory_type"]
          p_site_id?: string
          p_status?: Database["public"]["Enums"]["inventory_status"]
        }
        Returns: {
          assigned_to: string | null
          created_at: string
          created_by: string
          group_type: Database["public"]["Enums"]["group_type"]
          id: string
          inventory_type: Database["public"]["Enums"]["inventory_type"]
          model: string
          notes: string | null
          purchase_date: string | null
          serial_number: string
          site_id: string | null
          status: Database["public"]["Enums"]["inventory_status"] | null
          updated_at: string
          warranty_expiry: string | null
        }[]
      }
      get_inventory_summary: {
        Args: Record<PropertyKey, never>
        Returns: {
          available_items: number
          deployed_items: number
          maintenance_items: number
          retired_items: number
          total_items: number
        }[]
      }
      get_license_summary: {
        Args: Record<PropertyKey, never>
        Returns: {
          active_licenses: number
          by_type: Json
          expired_licenses: number
          expiring_soon: number
          total_licenses: number
        }[]
      }
      get_license_with_sensitive_data: {
        Args: { license_id: string }
        Returns: {
          cost: number
          created_at: string
          created_by: string
          expiry_date: string
          id: string
          license_key: string
          license_type: string
          name: string
          notes: string
          purchase_date: string
          status: string
          updated_at: string
          vendor: string
        }[]
      }
      get_licenses_count: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      get_licenses_secure: {
        Args: { p_limit?: number; p_offset?: number }
        Returns: {
          cost: string
          created_at: string
          created_by: string
          expiry_date: string
          id: string
          license_key: string
          license_type: string
          name: string
          notes: string
          purchase_date: string
          status: string
          updated_at: string
          vendor: string
        }[]
      }
      get_mappings_with_details: {
        Args: Record<PropertyKey, never>
        Returns: {
          created_at: string
          hardware_item_category: string
          hardware_item_id: string
          hardware_item_name: string
          id: string
          is_required: boolean
          quantity: number
          software_module_category: string
          software_module_id: string
          software_module_name: string
          updated_at: string
        }[]
      }
      get_organization_logo: {
        Args: { org_id: string }
        Returns: string
      }
      get_organizations_with_logo_status: {
        Args: Record<PropertyKey, never>
        Returns: {
          created_by: string
          created_on: string
          description: string
          has_logo: boolean
          id: string
          logo_file_size: number
          logo_url: string
          name: string
          sector: string
          unit_code: string
          updated_at: string
        }[]
      }
      get_safe_profile_data: {
        Args: { target_user_id?: string }
        Returns: {
          created_at: string
          email: string
          full_name: string
          id: string
          last_login_at: string
          updated_at: string
          user_id: string
        }[]
      }
      get_site_with_details: {
        Args: { site_uuid: string }
        Returns: {
          address: string
          cafeteria_type: Database["public"]["Enums"]["cafeteria_type"]
          capacity: number
          city_name: string
          cost_approval_status: string
          created_at: string
          created_by: string
          deployment_engineer_name: string
          deployment_status: string
          description: string
          expected_footfall: number
          food_court_unit: string
          id: string
          inventory_status: string
          name: string
          ops_manager_name: string
          overall_status: Database["public"]["Enums"]["site_status"]
          postcode: string
          products_status: string
          sector_name: string
          status: string
          study_status: string
          updated_at: string
        }[]
      }
      get_unread_notification_count: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      get_user_management_stats: {
        Args: Record<PropertyKey, never>
        Returns: {
          admin_count: number
          deployment_engineer_count: number
          ops_manager_count: number
          total_users: number
        }[]
      }
      get_user_notifications: {
        Args: { _limit?: number; _offset?: number }
        Returns: {
          action_url: string
          created_at: string
          created_by: string
          entity_id: string
          entity_type: string
          id: string
          is_read: boolean
          message: string
          metadata: Json
          priority: string
          title: string
          type: string
        }[]
      }
      get_user_role: {
        Args: { user_uuid: string }
        Returns: string
      }
      get_user_role_simple: {
        Args: { user_uuid?: string }
        Returns: string
      }
      get_workflow_statistics: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      has_role: {
        Args:
          | { _role: Database["public"]["Enums"]["app_role"]; _user_id: string }
          | { role_name: string; user_uuid: string }
        Returns: boolean
      }
      is_admin: {
        Args: { _user_id?: string }
        Returns: boolean
      }
      is_assigned_to_site: {
        Args: { site_uuid: string }
        Returns: boolean
      }
      is_verified_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      list_safe_profiles: {
        Args: Record<PropertyKey, never>
        Returns: {
          created_at: string
          email: string
          full_name: string
          id: string
          last_login_at: string
          updated_at: string
          user_id: string
        }[]
      }
      log_admin_profile_access: {
        Args: { action: string; target_user_id: string }
        Returns: undefined
      }
      log_audit_event: {
        Args:
          | {
              _action: string
              _metadata?: Json
              _new_values?: Json
              _old_values?: Json
              _record_id?: string
              _table_name: string
            }
          | { p_action: string; p_details?: string; p_entity: string }
        Returns: string
      }
      log_costing_approval_action: {
        Args: {
          p_action: string
          p_approval_id: string
          p_comment?: string
          p_metadata?: Json
        }
        Returns: undefined
      }
      log_license_access: {
        Args: { action: string; license_id: string }
        Returns: undefined
      }
      log_license_function_access: {
        Args: { p_function_name: string; p_user_role: string }
        Returns: undefined
      }
      mark_notification_read: {
        Args: { _notification_id: string }
        Returns: boolean
      }
      seed_notification_preferences: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      update_organization_logo: {
        Args: { new_logo_url: string; org_id: string }
        Returns: boolean
      }
      validate_email_access: {
        Args: { requesting_user_id: string; target_user_id: string }
        Returns: boolean
      }
      validate_profile_access: {
        Args: { action: string; target_user_id: string }
        Returns: boolean
      }
      validate_status_progression: {
        Args:
          | { context: string; new_status: string; prev_status: string }
          | {
              current_status: Database["public"]["Enums"]["site_status_enum"]
              new_status: Database["public"]["Enums"]["site_status_enum"]
              user_role?: string
            }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "ops_manager" | "deployment_engineer" | "default_user"
      app_role_new: "admin" | "ops_manager" | "deployment_engineer"
      cafeteria_type: "staff" | "visitor" | "mixed"
      costing_approval_status:
        | "pending_review"
        | "approved"
        | "rejected"
        | "resubmitted"
      group_type: "hardware" | "software" | "network" | "accessories"
      inventory_status: "available" | "deployed" | "maintenance" | "retired"
      inventory_type: "counter" | "tablet" | "router" | "cable" | "other"
      procurement_status:
        | "pending"
        | "approved"
        | "ordered"
        | "in_transit"
        | "delivered"
        | "installed"
      site_status: "new" | "in-progress" | "active" | "deployed"
      site_status_enum:
        | "site_created"
        | "site_study_done"
        | "scoping_done"
        | "approved"
        | "procurement_done"
        | "deployed"
        | "live"
        | "created"
        | "study_in_progress"
        | "study_completed"
        | "hardware_scoped"
        | "procurement"
        | "deployment"
        | "activated"
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
      app_role: ["admin", "ops_manager", "deployment_engineer", "default_user"],
      app_role_new: ["admin", "ops_manager", "deployment_engineer"],
      cafeteria_type: ["staff", "visitor", "mixed"],
      costing_approval_status: [
        "pending_review",
        "approved",
        "rejected",
        "resubmitted",
      ],
      group_type: ["hardware", "software", "network", "accessories"],
      inventory_status: ["available", "deployed", "maintenance", "retired"],
      inventory_type: ["counter", "tablet", "router", "cable", "other"],
      procurement_status: [
        "pending",
        "approved",
        "ordered",
        "in_transit",
        "delivered",
        "installed",
      ],
      site_status: ["new", "in-progress", "active", "deployed"],
      site_status_enum: [
        "site_created",
        "site_study_done",
        "scoping_done",
        "approved",
        "procurement_done",
        "deployed",
        "live",
        "created",
        "study_in_progress",
        "study_completed",
        "hardware_scoped",
        "procurement",
        "deployment",
        "activated",
      ],
    },
  },
} as const

// Temporary type definitions to work around read-only types file issue
export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          user_id: string;
          email: string;
          full_name: string | null;
          created_at: string;
          updated_at: string;
          last_login_at: string | null;
          invited_by: string | null;
          invited_at: string | null;
          welcome_email_sent: boolean | null;
          is_active: boolean;
        };
      };
      user_roles: {
        Row: {
          id: string;
          user_id: string;
          role: string;
          created_at: string;
          created_by: string | null;
        };
      };
    };
    Enums: {
      app_role: "admin" | "ops_manager" | "deployment_engineer" | "user";
    };
  };
};
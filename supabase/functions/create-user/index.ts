import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.53.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type"
};

const handler = async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: corsHeaders
    });
  }

  try {
    // Initialize Supabase client with service role key
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Initialize regular client to verify admin privileges
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({
          error: "Missing authorization header"
        }),
        {
          status: 401,
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders
          }
        }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: {
          headers: {
            Authorization: authHeader
          }
        }
      }
    );

    // Verify the requesting user is an admin
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.error("Auth error:", authError);
      return new Response(
        JSON.stringify({
          error: "Unauthorized"
        }),
        {
          status: 401,
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders
          }
        }
      );
    }

    // Check if user has admin role
    const { data: userRoles, error: roleError } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .limit(1);

    if (roleError || !userRoles || userRoles.length === 0) {
      console.error("Role check failed:", roleError);
      return new Response(
        JSON.stringify({
          error: "Insufficient privileges. Admin role required."
        }),
        {
          status: 403,
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders
          }
        }
      );
    }

    // Parse request body - updated for OTP-based login (no password) and multiple roles
    let requestBody;
    try {
      requestBody = await req.json();
      console.log("Received request body:", JSON.stringify(requestBody, null, 2));
    } catch (parseError) {
      console.error("Error parsing request body:", parseError);
      return new Response(
        JSON.stringify({
          error: "Invalid JSON in request body"
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders
          }
        }
      );
    }

    const { email, full_name, roles } = requestBody;

    // Validate input
    if (!email || !full_name) {
      console.error("Missing required fields:", {
        email: !!email,
        full_name: !!full_name,
        roles
      });
      return new Response(
        JSON.stringify({
          error: "Missing required fields: email and full_name are required"
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders
          }
        }
      );
    }

    if (!roles || !Array.isArray(roles) || roles.length === 0) {
      console.error("Invalid roles:", roles);
      return new Response(
        JSON.stringify({
          error: "Missing or invalid roles: roles must be a non-empty array"
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders
          }
        }
      );
    }

    // Get primary role for user metadata
    const primaryRole = roles[0]?.role || "admin";

    // Create the user using admin client (without password for OTP-based login)
    const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email: email.toLowerCase(),
      // No password - OTP-based login only
      user_metadata: {
        full_name: full_name,
        role: primaryRole,
        admin_created: true
      },
      email_confirm: true // Skip email confirmation for admin-created users
    });

    if (createError) {
      console.error("User creation error:", createError);
      return new Response(
        JSON.stringify({
          error: createError.message
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders
          }
        }
      );
    }

    if (!newUser.user) {
      return new Response(
        JSON.stringify({
          error: "Failed to create user"
        }),
        {
          status: 500,
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders
          }
        }
      );
    }

    const newUserId = newUser.user.id;

    // Wait a brief moment for trigger to potentially create profile (if it does)
    await new Promise(resolve => setTimeout(resolve, 100));

    // Use upsert to handle both cases: profile created by trigger or not
    // This will insert if doesn't exist, or update if it does (by user_id)
    let profile;
    const { data: upsertedProfile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .upsert({
        user_id: newUserId,
        email: email.toLowerCase(),
        full_name: full_name,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id',
        ignoreDuplicates: false
      })
      .select()
      .single();

    // If upsert succeeded, use the returned profile
    if (upsertedProfile && !profileError) {
      profile = upsertedProfile;
    } else if (profileError) {
      console.error("Profile upsert error:", profileError);
      
      // If it's a duplicate email error, try to find and update by email instead
      if (profileError.message?.includes('profiles_email_key')) {
        console.log("Email already exists, attempting to update by email...");
        const { data: existingByEmail, error: findError } = await supabaseAdmin
          .from("profiles")
          .select("*")
          .eq("email", email.toLowerCase())
          .maybeSingle();
        
        if (existingByEmail && existingByEmail.user_id === newUserId) {
          // Same user, just update it
          const { data: updatedProfile, error: updateError } = await supabaseAdmin
            .from("profiles")
            .update({
              user_id: newUserId,
              full_name: full_name,
              is_active: true,
              updated_at: new Date().toISOString()
            })
            .eq("user_id", newUserId)
            .select()
            .single();
          
          if (updateError) {
            console.error("Profile update error:", updateError);
            await supabaseAdmin.auth.admin.deleteUser(newUserId);
            return new Response(
              JSON.stringify({
                error: "Failed to update user profile: " + updateError.message
              }),
              {
                status: 400,
                headers: {
                  "Content-Type": "application/json",
                  ...corsHeaders
                }
              }
            );
          }
          profile = updatedProfile;
        } else {
          // Email exists for a different user
          await supabaseAdmin.auth.admin.deleteUser(newUserId);
          return new Response(
            JSON.stringify({
              error: "Email already exists for another user"
            }),
            {
              status: 400,
              headers: {
                "Content-Type": "application/json",
                ...corsHeaders
              }
            }
          );
        }
      } else {
        // Other error, clean up
        await supabaseAdmin.auth.admin.deleteUser(newUserId);
        return new Response(
          JSON.stringify({
            error: "Failed to create user profile: " + profileError.message
          }),
          {
            status: 400,
            headers: {
              "Content-Type": "application/json",
              ...corsHeaders
            }
          }
        );
      }
    }

    // Assign all roles to the new user (support multiple roles)
    // Handle both { role: 'admin' } format and direct string format
    const rolesToInsert = roles.map((roleObj) => {
      const roleValue = typeof roleObj === "string" ? roleObj : roleObj.role;
      if (!roleValue) {
        throw new Error(`Invalid role format: ${JSON.stringify(roleObj)}`);
      }
      return {
        user_id: newUserId,
        role: roleValue,
        assigned_by: user.id,
        assigned_at: new Date().toISOString(),
        created_at: new Date().toISOString()
      };
    });

    const { error: roleAssignError } = await supabaseAdmin
      .from("user_roles")
      .insert(rolesToInsert);

    if (roleAssignError) {
      console.error("Role assignment error:", roleAssignError);
      // Try to clean up: delete profile and auth user if role assignment fails
      await supabaseAdmin.from("profiles").delete().eq("id", profile.id);
      await supabaseAdmin.auth.admin.deleteUser(newUserId);
      return new Response(
        JSON.stringify({
          error: "Failed to assign roles to user: " + roleAssignError.message
        }),
        {
          status: 500,
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders
          }
        }
      );
    }

    const roleNames = roles.map((r) => (typeof r === "string" ? r : r.role)).join(", ");
    console.log(`Successfully created user: ${email} with roles: ${roleNames}`);

    return new Response(
      JSON.stringify({
        success: true,
        message: "User created successfully",
        user: {
          id: profile.id,
          user_id: newUserId,
          email: newUser.user.email,
          full_name: full_name,
          roles: roles
        }
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders
        }
      }
    );
  } catch (error) {
    console.error("Error in create-user function:", error);
    return new Response(
      JSON.stringify({
        error: error.message || "Internal server error"
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders
        }
      }
    );
  }
};

serve(handler);

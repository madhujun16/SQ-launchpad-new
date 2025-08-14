import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

// Centralized API service that respects RLS policies and role-based access
export class ApiService {
  private static instance: ApiService;

  public static getInstance(): ApiService {
    if (!ApiService.instance) {
      ApiService.instance = new ApiService();
    }
    return ApiService.instance;
  }

  // Generic method to handle API calls with proper error handling
  private async handleApiCall<T>(
    operation: () => Promise<{ data: T | null; error: any }>
  ): Promise<T> {
    try {
      const { data, error } = await operation();
      if (error) {
        console.error('API Error:', error);
        throw new Error(error.message || 'An error occurred');
      }
      return data as T;
    } catch (error) {
      console.error('API Service Error:', error);
      throw error;
    }
  }

  // Sites API - respects RLS policies for assignment-based access
  async getSites() {
    return this.handleApiCall(async () => {
      return await supabase
        .from('sites')
        .select(`
          *,
          sector:sectors(name),
          city:cities(name),
          assignments:site_assignments(
            ops_manager:profiles!ops_manager_id(full_name),
            deployment_engineer:profiles!deployment_engineer_id(full_name)
          ),
          status_tracking:site_status_tracking(*)
        `)
        .order('created_at', { ascending: false });
    });
  }

  async getSiteById(id: string) {
    return this.handleApiCall(async () => {
      return await supabase
        .from('sites')
        .select(`
          *,
          sector:sectors(name),
          city:cities(name),
          assignments:site_assignments(
            ops_manager:profiles!ops_manager_id(full_name, email),
            deployment_engineer:profiles!deployment_engineer_id(full_name, email)
          ),
          status_tracking:site_status_tracking(*),
          studies:site_studies(*)
        `)
        .eq('id', id)
        .single();
    });
  }

  async createSite(siteData: Omit<Database['public']['Tables']['sites']['Insert'], 'id'>) {
    return this.handleApiCall(async () => {
      return await supabase
        .from('sites')
        .insert(siteData)
        .select()
        .single();
    });
  }

  async updateSite(id: string, updates: Database['public']['Tables']['sites']['Update']) {
    return this.handleApiCall(async () => {
      return await supabase
        .from('sites')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();
    });
  }

  // Assets API - respects role-based filtering
  async getAssets() {
    return this.handleApiCall(async () => {
      return await supabase
        .from('assets')
        .select(`
          *,
          site:sites(name),
          assigned_user:profiles!assigned_to(full_name, email)
        `)
        .order('created_at', { ascending: false });
    });
  }

  async createAsset(assetData: Omit<Database['public']['Tables']['assets']['Insert'], 'id'>) {
    return this.handleApiCall(async () => {
      return await supabase
        .from('assets')
        .insert(assetData)
        .select()
        .single();
    });
  }

  async updateAsset(id: string, updates: Database['public']['Tables']['assets']['Update']) {
    return this.handleApiCall(async () => {
      return await supabase
        .from('assets')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();
    });
  }

  // Inventory API
  async getInventoryItems() {
    return this.handleApiCall(async () => {
      return await supabase
        .from('inventory_items')
        .select(`
          *,
          site:sites(name),
          assigned_user:profiles!assigned_to(full_name, email),
          creator:profiles!created_by(full_name, email)
        `)
        .order('created_at', { ascending: false });
    });
  }

  async createInventoryItem(itemData: Omit<Database['public']['Tables']['inventory_items']['Insert'], 'id'>) {
    return this.handleApiCall(async () => {
      return await supabase
        .from('inventory_items')
        .insert(itemData)
        .select()
        .single();
    });
  }

  async updateInventoryItem(id: string, updates: Database['public']['Tables']['inventory_items']['Update']) {
    return this.handleApiCall(async () => {
      return await supabase
        .from('inventory_items')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();
    });
  }

  // Hardware Requests API - respects role-based access
  async getHardwareRequests() {
    return this.handleApiCall(async () => {
      return await supabase
        .from('hardware_requests')
        .select(`
          *,
          site:sites(name),
          requestor:profiles!requested_by(full_name, email),
          ops_manager:profiles!assigned_ops_manager(full_name, email),
          deployment_engineer:profiles!assigned_deployment_engineer(full_name, email),
          items:hardware_request_items(
            *,
            hardware_item:hardware_items(*)
          )
        `)
        .order('requested_at', { ascending: false });
    });
  }

  async createHardwareRequest(requestData: Omit<Database['public']['Tables']['hardware_requests']['Insert'], 'id'>) {
    return this.handleApiCall(async () => {
      return await supabase
        .from('hardware_requests')
        .insert(requestData)
        .select()
        .single();
    });
  }

  async updateHardwareRequest(id: string, updates: Database['public']['Tables']['hardware_requests']['Update']) {
    return this.handleApiCall(async () => {
      return await supabase
        .from('hardware_requests')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();
    });
  }

  // Scoping Approvals API
  async getScopingApprovals() {
    return this.handleApiCall(async () => {
      return await supabase
        .from('scoping_approvals')
        .select(`
          *,
          site:sites(name),
          deployment_engineer:profiles!deployment_engineer_id(full_name, email),
          ops_manager:profiles!ops_manager_id(full_name, email),
          reviewer:profiles!reviewed_by(full_name, email)
        `)
        .order('submitted_at', { ascending: false });
    });
  }

  async createScopingApproval(approvalData: Omit<Database['public']['Tables']['scoping_approvals']['Insert'], 'id'>) {
    return this.handleApiCall(async () => {
      return await supabase
        .from('scoping_approvals')
        .insert(approvalData)
        .select()
        .single();
    });
  }

  async updateScopingApproval(id: string, updates: Database['public']['Tables']['scoping_approvals']['Update']) {
    return this.handleApiCall(async () => {
      return await supabase
        .from('scoping_approvals')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();
    });
  }

  // Costing Approvals API
  async getCostingApprovals() {
    return this.handleApiCall(async () => {
      return await supabase
        .from('costing_approvals')
        .select(`
          *,
          site:sites(name),
          deployment_engineer:profiles!deployment_engineer_id(full_name, email),
          ops_manager:profiles!ops_manager_id(full_name, email),
          reviewer:profiles!reviewed_by(full_name, email),
          items:costing_items(*)
        `)
        .order('submitted_at', { ascending: false });
    });
  }

  async createCostingApproval(approvalData: Omit<Database['public']['Tables']['costing_approvals']['Insert'], 'id'>) {
    return this.handleApiCall(async () => {
      return await supabase
        .from('costing_approvals')
        .insert(approvalData)
        .select()
        .single();
    });
  }

  async updateCostingApproval(id: string, updates: Database['public']['Tables']['costing_approvals']['Update']) {
    return this.handleApiCall(async () => {
      return await supabase
        .from('costing_approvals')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();
    });
  }

  // Deployments API
  async getDeployments() {
    return this.handleApiCall(async () => {
      return await supabase
        .from('deployments')
        .select(`
          *,
          site:sites(name),
          ops_manager:profiles!assigned_ops_manager(full_name, email),
          deployment_engineer:profiles!assigned_deployment_engineer(full_name, email)
        `)
        .order('created_at', { ascending: false });
    });
  }

  async updateDeployment(id: string, updates: Database['public']['Tables']['deployments']['Update']) {
    return this.handleApiCall(async () => {
      return await supabase
        .from('deployments')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();
    });
  }

  // Site Studies API
  async getSiteStudies() {
    return this.handleApiCall(async () => {
      return await supabase
        .from('site_studies')
        .select(`
          *,
          site:sites(name),
          conductor:profiles!conducted_by(full_name, email)
        `)
        .order('created_at', { ascending: false });
    });
  }

  async createSiteStudy(studyData: Omit<Database['public']['Tables']['site_studies']['Insert'], 'id'>) {
    return this.handleApiCall(async () => {
      return await supabase
        .from('site_studies')
        .insert(studyData)
        .select()
        .single();
    });
  }

  async updateSiteStudy(id: string, updates: Database['public']['Tables']['site_studies']['Update']) {
    return this.handleApiCall(async () => {
      return await supabase
        .from('site_studies')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();
    });
  }

  // Platform Configuration APIs (Admin only)
  async getHardwareItems() {
    return this.handleApiCall(async () => {
      return await supabase
        .from('hardware_items')
        .select('*')
        .order('created_at', { ascending: false });
    });
  }

  async createHardwareItem(itemData: Omit<Database['public']['Tables']['hardware_items']['Insert'], 'id'>) {
    return this.handleApiCall(async () => {
      return await supabase
        .from('hardware_items')
        .insert(itemData)
        .select()
        .single();
    });
  }

  async updateHardwareItem(id: string, updates: Database['public']['Tables']['hardware_items']['Update']) {
    return this.handleApiCall(async () => {
      return await supabase
        .from('hardware_items')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();
    });
  }

  async deleteHardwareItem(id: string) {
    return this.handleApiCall(async () => {
      return await supabase
        .from('hardware_items')
        .delete()
        .eq('id', id);
    });
  }

  // User Management APIs (Admin only)
  async getProfiles() {
    return this.handleApiCall(async () => {
      return await supabase
        .from('profiles')
        .select(`
          *,
          roles:user_roles(role)
        `)
        .order('created_at', { ascending: false });
    });
  }

  async getUserRoles() {
    return this.handleApiCall(async () => {
      return await supabase
        .from('user_roles')
        .select(`
          *,
          user:profiles(full_name, email)
        `)
        .order('created_at', { ascending: false });
    });
  }

  async createUserRole(roleData: Omit<Database['public']['Tables']['user_roles']['Insert'], 'id'>) {
    return this.handleApiCall(async () => {
      return await supabase
        .from('user_roles')
        .insert(roleData)
        .select()
        .single();
    });
  }

  async deleteUserRole(id: string) {
    return this.handleApiCall(async () => {
      return await supabase
        .from('user_roles')
        .delete()
        .eq('id', id);
    });
  }

  // Site Assignments API (Admin only)
  async getSiteAssignments() {
    return this.handleApiCall(async () => {
      return await supabase
        .from('site_assignments')
        .select(`
          *,
          site:sites(name),
          ops_manager:profiles!ops_manager_id(full_name, email),
          deployment_engineer:profiles!deployment_engineer_id(full_name, email),
          assigner:profiles!assigned_by(full_name, email)
        `)
        .order('assigned_at', { ascending: false });
    });
  }

  async createSiteAssignment(assignmentData: Omit<Database['public']['Tables']['site_assignments']['Insert'], 'id'>) {
    return this.handleApiCall(async () => {
      return await supabase
        .from('site_assignments')
        .insert(assignmentData)
        .select()
        .single();
    });
  }

  async updateSiteAssignment(id: string, updates: Database['public']['Tables']['site_assignments']['Update']) {
    return this.handleApiCall(async () => {
      return await supabase
        .from('site_assignments')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();
    });
  }

  // Real-time subscriptions for live updates
  subscribeToSites(callback: (payload: any) => void) {
    return supabase
      .channel('sites-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'sites' }, 
        callback
      )
      .subscribe();
  }

  subscribeToAssets(callback: (payload: any) => void) {
    return supabase
      .channel('assets-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'assets' }, 
        callback
      )
      .subscribe();
  }

  subscribeToHardwareRequests(callback: (payload: any) => void) {
    return supabase
      .channel('hardware-requests-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'hardware_requests' }, 
        callback
      )
      .subscribe();
  }

  // Audit logging
  async logAuditEvent(entity: string, action: string, details?: string) {
    return this.handleApiCall(async () => {
      return await supabase.rpc('log_audit_event', {
        p_entity: entity,
        p_action: action,
        p_details: details
      });
    });
  }
}

// Export singleton instance
export const apiService = ApiService.getInstance();
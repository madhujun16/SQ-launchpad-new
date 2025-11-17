import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';

// Organization Logo Component with Error Handling
const OrganizationLogo: React.FC<{ src?: string | null; alt: string }> = ({ src, alt }) => {
  const [imageError, setImageError] = useState(false);

  // Check if src is valid - if it's null, undefined, empty, or looks like a malformed URL
  const isValidUrl = src && 
    src.trim() !== '' && 
    !src.includes('FFFFFF?text=') && 
    !src.includes('placeholder.com') &&
    (src.startsWith('http://') || src.startsWith('https://') || src.startsWith('data:'));

  // If src is invalid or there was a previous error, show fallback
  if (!isValidUrl || imageError) {
    return (
      <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
        <Building className="h-4 w-4 text-gray-500" />
      </div>
    );
  }

  return (
    <img 
      src={src} 
      alt={alt}
      className="h-8 w-8 rounded-full object-cover"
      onError={() => setImageError(true)}
    />
  );
};
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Building,
  Home,
  ChevronRight,
  AlertCircle,
  Plus,
  Edit,
  Trash2,
  Upload,
  Search
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { getRoleConfig } from '@/lib/roles';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { PageLoader } from '@/components/ui/loader';

// Interfaces
interface Organization {
  id: string;
  name: string;
  description: string;
  sector: string;
  unit_code: string;
  logo_url?: string;
  created_by: string;
  created_on: string;
  updated_at: string;
  is_archived?: boolean;
  archived_at?: string;
  archive_reason?: string;
  mapped_sites_count?: number;
}

interface LogoUpload {
  file: File;
  preview: string;
}

// Predefined sector options
const sectorOptions = [
  'Business & Industry',
  'Healthcare & Senior Living',
  'Education',
  'Sports & Leisure',
  'Defence',
  'Offshore & Remote'
];

export default function OrganizationsManagement() {
  const { currentRole } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [editingOrganization, setEditingOrganization] = useState<Organization | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sectorFilter, setSectorFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(50);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [archiveModalOpen, setArchiveModalOpen] = useState(false);
  const [archiveReason, setArchiveReason] = useState('');
  const [organizationToArchive, setOrganizationToArchive] = useState<Organization | null>(null);
  const [archiving, setArchiving] = useState(false);
  const [logoUpload, setLogoUpload] = useState<LogoUpload | null>(null);

  const roleConfig = getRoleConfig(currentRole || 'admin');

  // Load organizations with caching (similar to Sites page)
  useEffect(() => {
    // Load organizations even if currentRole is not set yet - this prevents the blank page issue
    console.log('OrganizationsManagement: Loading organizations...', { currentRole });

    const loadWithRetry = async () => {
      try {
        await loadOrganizations();
      } catch (error) {
        console.error('First load attempt failed, retrying...', error);
        // Retry once after a short delay
        setTimeout(async () => {
          try {
            await loadOrganizations();
          } catch (retryError) {
            console.error('Retry also failed:', retryError);
            // Set empty array to show the page without error
            setOrganizations([]);
            setLoading(false);
          }
        }, 2000);
      }
    };

    loadWithRetry();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Intentionally empty to load once on mount

  const loadOrganizations = async () => {
    try {
      console.log('OrganizationsManagement: Starting loadOrganizations...');
      setLoading(true);
      setError(null);
      
      // First, get organizations with site counts
      console.log('OrganizationsManagement: Fetching organizations from Supabase...');
      const { data: orgsData, error: orgsError } = await supabase
        .from('organizations')
        .select('*')
        .order('name');
      
      console.log('OrganizationsManagement: Organizations response:', { orgsData: orgsData?.length, orgsError });
      
      if (orgsError) {
        console.error('Error loading organizations:', orgsError);
        // Don't show error to user, just set empty array
        setOrganizations([]);
        setLoading(false);
        return;
      }

      if (orgsData && orgsData.length > 0) {
        // OPTIMIZED: Get site counts for all organizations in a single aggregated query
        console.log('OrganizationsManagement: Fetching site counts from Supabase...');
        const { data: siteCounts, error: siteCountsError } = await supabase
          .from('sites')
          .select('organization_id')
          .not('organization_id', 'is', null)
          .eq('is_archived', false);

        console.log('OrganizationsManagement: Site counts response:', { siteCounts: siteCounts?.length, siteCountsError });

        if (siteCountsError) {
          console.error('Error fetching site counts:', siteCountsError);
        }

        // Create a map of organization_id -> site count
        const siteCountMap = new Map<string, number>();
        if (siteCounts) {
          siteCounts.forEach(site => {
            const orgId = site.organization_id;
            siteCountMap.set(orgId, (siteCountMap.get(orgId) || 0) + 1);
          });
        }

        // Transform organizations with their site counts
        const orgsWithSiteCounts = orgsData.map((org: { id: string; name: string; description: string; sector: string; unit_code: string; logo_url: string | null; created_by: string; created_on: string; created_at: string; updated_at: string; is_archived: boolean; archived_at: string | null; archive_reason: string | null; }) => ({
          id: org.id,
          name: org.name,
          description: org.description || '',
          sector: org.sector || '',
          unit_code: org.unit_code || '',
          logo_url: org.logo_url || null,
          created_by: org.created_by || 'system',
          created_on: org.created_on || org.created_at || new Date().toISOString(),
          updated_at: org.updated_at || new Date().toISOString(),
          is_archived: org.is_archived || false,
          archived_at: org.archived_at || null,
          archive_reason: org.archive_reason || null,
          mapped_sites_count: siteCountMap.get(org.id) || 0
        }));
        
        console.log('OrganizationsManagement: Setting organizations:', orgsWithSiteCounts.length);
        setOrganizations(orgsWithSiteCounts);
      } else {
        // No organizations found, seed defaults silently
        console.log('OrganizationsManagement: No organizations found, seeding defaults...');
        await seedDefaultOrganizations();
      }
    } catch (error) {
      console.error('Error loading organizations:', error);
      // Don't show error to user, just set empty array
      setOrganizations([]);
    } finally {
      console.log('OrganizationsManagement: Finished loadOrganizations');
      setLoading(false);
    }
  };

  const seedDefaultOrganizations = async () => {
    const defaults: Organization[] = [
      {
        id: 'org-chartwells',
        name: 'Chartwells',
        description: 'Leading food service provider for education sector',
        sector: 'Education',
        unit_code: 'CHT',
        created_by: 'admin',
        created_on: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 'org-hsbc',
        name: 'HSBC',
        description: 'Global banking and financial services',
        sector: 'Business & Industry',
        unit_code: 'HSB',
        created_by: 'admin',
        created_on: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 'org-levy',
        name: 'Levy',
        description: 'Premium sports and entertainment hospitality',
        sector: 'Sports & Leisure',
        unit_code: 'LEV',
        created_by: 'admin',
        created_on: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 'org-bi',
        name: 'B&I',
        description: 'Business and Industry food services',
        sector: 'Business & Industry',
        unit_code: 'BI',
        created_by: 'admin',
        created_on: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 'org-compass-one',
        name: 'Compass One',
        description: 'Specialized food service solutions',
        sector: 'Business & Industry',
        unit_code: 'COM',
        created_by: 'admin',
        created_on: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 'org-minley-station',
        name: 'Minley Station',
        description: 'Defence sector food services',
        sector: 'Defence',
        unit_code: 'MIN',
        created_by: 'admin',
        created_on: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 'org-peabody',
        name: 'Peabody',
        description: 'Housing and community services',
        sector: 'Business & Industry',
        unit_code: 'PEA',
        created_by: 'admin',
        created_on: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 'org-ra',
        name: 'RA',
        description: 'Restaurant Associates - premium dining',
        sector: 'Business & Industry',
        unit_code: 'RA',
        created_by: 'admin',
        created_on: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 'org-morgan-stanley',
        name: 'Morgan Stanley',
        description: 'Global financial services',
        sector: 'Business & Industry',
        unit_code: 'MOR',
        created_by: 'admin',
        created_on: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 'org-next',
        name: 'NEXT',
        description: 'NEXT Retail',
        sector: 'Business & Industry',
        unit_code: 'NEX',
        created_by: 'admin',
        created_on: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
    ];

    try {
      const { error } = await supabase
        .from('organizations')
        .insert(defaults);
      
      if (error) {
        console.error('Error seeding organizations:', error);
        // Don't show error to user, just continue silently
      } else {
        // Reload to get the seeded data silently
        await loadOrganizations();
      }
    } catch (error) {
      console.error('Error seeding organizations:', error);
      // Don't show error to user, just continue silently
    }
  };

  const addOrganization = () => {
    setEditingOrganization({
      id: 'new',
      name: '',
      description: '',
      sector: '',
      unit_code: '',
      created_by: 'admin',
      created_on: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });
  };

  const editOrganization = (org: Organization) => {
    setEditingOrganization({ ...org });
  };

  const archiveOrganization = async (org: Organization) => {
    setOrganizationToArchive(org);
    setArchiveModalOpen(true);
  };

  const confirmArchiveOrganization = async () => {
    if (!organizationToArchive || !archiveReason.trim()) {
      toast.error('Please provide a reason for archiving');
      return;
    }

    setArchiving(true);
    try {
      // 1. Archive the organization only (not sites)
      const { error: orgError } = await supabase
        .from('organizations')
        .update({
          is_archived: true,
          archived_at: new Date().toISOString(),
          archive_reason: archiveReason.trim(),
          updated_at: new Date().toISOString()
        })
        .eq('id', organizationToArchive.id);

      if (orgError) {
        console.error('Error archiving organization:', orgError);
        toast.error('Failed to archive organization');
        return;
      }

      // 2. Update local state - keep the site count but mark as archived
      setOrganizations(prev => 
        prev.map(o => 
          o.id === organizationToArchive.id 
            ? { 
                ...o, 
                is_archived: true, 
                archived_at: new Date().toISOString(), 
                archive_reason: archiveReason.trim()
              }
            : o
        )
      );

      toast.success(`Organization "${organizationToArchive.name}" has been archived`);
      
      // Reset modal state
      setArchiveModalOpen(false);
      setOrganizationToArchive(null);
      setArchiveReason('');
    } catch (error) {
      console.error('Error archiving organization:', error);
      toast.error('Failed to archive organization');
    } finally {
      setArchiving(false);
    }
  };

  const unarchiveOrganization = async (org: Organization) => {
    try {
      // 1. Unarchive the organization only (not sites)
      const { error: orgError } = await supabase
        .from('organizations')
        .update({
          is_archived: false,
          archived_at: null,
          archive_reason: null,
          updated_at: new Date().toISOString()
        })
        .eq('id', org.id);

      if (orgError) {
        console.error('Error unarchiving organization:', orgError);
        toast.error('Failed to unarchive organization');
        return;
      }

      // 2. Update local state
      setOrganizations(prev => 
        prev.map(o => 
          o.id === org.id 
            ? { 
                ...o, 
                is_archived: false, 
                archived_at: null, 
                archive_reason: null
              }
            : o
        )
      );

      toast.success(`Organization "${org.name}" has been unarchived`);
    } catch (error) {
      console.error('Error unarchiving organization:', error);
      toast.error('Failed to unarchive organization');
    }
  };

  const saveOrganization = async () => {
    if (!editingOrganization) return;
    
    // Validate required fields
    if (!editingOrganization.name.trim()) {
      toast.error('Organization name is required');
      return;
    }
    
    if (!editingOrganization.sector) {
      toast.error('Please select a sector');
      return;
    }
    
    if (!editingOrganization.unit_code.trim()) {
      toast.error('Unit code is required');
      return;
    }
    
    setSaving(true);
    try {
      let logoUrl = editingOrganization.logo_url;

      // Handle logo upload if there's a new logo
      if (logoUpload?.file) {
        const uploadedLogoUrl = await uploadLogoToStorage(logoUpload.file, editingOrganization.id);
        if (uploadedLogoUrl) {
          logoUrl = uploadedLogoUrl;
        } else {
          // Don't proceed with save if logo upload failed
          toast.error('Logo upload failed. Please try again.');
          return;
        }
      }

      if (editingOrganization.id && editingOrganization.id !== 'new') {
        // Update existing organization
        const { error } = await supabase
          .from('organizations')
          .update({
            name: editingOrganization.name.trim(),
            description: editingOrganization.description.trim(),
            sector: editingOrganization.sector,
            unit_code: editingOrganization.unit_code.trim(),
            logo_url: logoUrl,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingOrganization.id);
        
        if (error) {
          console.error('Supabase update error:', error);
          toast.error(`Failed to update organization: ${error.message}`);
          return;
        }
        
        const updatedOrg = { ...editingOrganization, logo_url: logoUrl };
        setOrganizations(prev => 
          prev.map(o => o.id === editingOrganization.id ? updatedOrg : o)
        );
        toast.success('Organization updated successfully');
      } else {
        // Add new organization
        const { data, error } = await supabase
          .from('organizations')
          .insert([{
            name: editingOrganization.name.trim(),
            description: editingOrganization.description.trim(),
            sector: editingOrganization.sector,
            unit_code: editingOrganization.unit_code.trim(),
            logo_url: logoUrl,
            created_by: editingOrganization.created_by,
            created_on: editingOrganization.created_on
          }])
          .select()
          .single();
        
        if (error) {
          console.error('Supabase insert error:', error);
          toast.error(`Failed to create organization: ${error.message}`);
          return;
        }
        
        const newOrg: Organization = {
          id: data.id,
          name: data.name,
          description: data.description,
          sector: data.sector || '',
          unit_code: data.unit_code || '',
          logo_url: data.logo_url || logoUrl || null,
          created_by: data.created_by || '',
          created_on: data.created_on || '',
          updated_at: data.updated_at
        };
        
        setOrganizations(prev => [...prev, newOrg]);
        toast.success('Organization created successfully');
      }
      
      // Clear logo upload state
      clearLogoUpload();
      setEditingOrganization(null);
    } catch (error) {
      console.error('Error saving organization:', error);
      toast.error(`Failed to save organization: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setSaving(false);
    }
  };

  // Logo upload functions
  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }
      
      // Validate file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        toast.error('File size must be less than 2MB');
        return;
      }

      const preview = URL.createObjectURL(file);
      setLogoUpload({ file, preview });
    }
  };

  const clearLogoUpload = () => {
    if (logoUpload?.preview) {
      URL.revokeObjectURL(logoUpload.preview);
    }
    setLogoUpload(null);
  };

  const uploadLogoToStorage = async (file: File, organizationId: string): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${organizationId}-${Date.now()}.${fileExt}`;

      const { data, error } = await supabase.storage
        .from('organization-logos')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (error) {
        console.error('Error uploading logo:', error);
        toast.error(`Failed to upload logo: ${error.message}`);
        return null;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('organization-logos')
        .getPublicUrl(fileName);

      return publicUrl;
    } catch (error) {
      console.error('Error uploading logo:', error);
      toast.error(`Failed to upload logo: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return null;
    }
  };

  // Filter and paginate organizations (similar to Sites page)
  const filteredData = useMemo(() => {
    let filtered = organizations;

    // Filter out archived organizations by default
    filtered = filtered.filter(org => !org.is_archived);

    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(org =>
        org.name.toLowerCase().includes(searchLower) ||
        org.description.toLowerCase().includes(searchLower) ||
        org.unit_code.toLowerCase().includes(searchLower)
      );
    }

    if (sectorFilter !== 'all') {
      filtered = filtered.filter(org => org.sector === sectorFilter);
    }

    const totalPages = Math.ceil(filtered.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentOrganizations = filtered.slice(startIndex, endIndex);

    return { filteredOrganizations: filtered, totalPages, currentOrganizations };
  }, [organizations, searchTerm, sectorFilter, currentPage, itemsPerPage]);

  const { filteredOrganizations, totalPages, currentOrganizations } = filteredData;

  // Only allow admin access (check after all hooks)
  if (currentRole !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            You do not have permission to access Organizations Management. Please contact an administrator.
          </AlertDescription>
        </Alert>
        </div>
      </div>
    );
  }

  const clearFilters = () => {
    setSearchTerm('');
    setSectorFilter('all');
    setCurrentPage(1);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
        toast.error('Please upload a CSV file');
        return;
      }
      setImportFile(file);
    }
  };

  const importOrganizations = async () => {
    if (!importFile) {
      toast.error('Please select a file to import');
      return;
    }

    setImporting(true);
    try {
      const text = await importFile.text();
      const lines = text.split('\n').filter(line => line.trim());
      
      if (lines.length < 2) {
        toast.error('CSV file must have at least a header row and one data row');
        return;
      }

      // Parse CSV (simple parsing - assumes comma-separated)
      const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
      const dataRows = lines.slice(1);

      const organizations = dataRows.map((row, index) => {
        const values = row.split(',').map(v => v.trim());
        const org: Record<string, string> = {};
        
        headers.forEach((header, i) => {
          org[header] = values[i] || '';
        });

        return {
          id: `imported-${Date.now()}-${index}`,
          name: org.name || org.organization_name || '',
          description: org.description || org.desc || '',
          sector: org.sector || 'Business & Industry',
          unit_code: org.unit_code || org.code || '',
          created_by: 'admin',
          created_on: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
      }).filter(org => org.name); // Filter out empty names

      if (organizations.length === 0) {
        toast.error('No valid organizations found in the CSV file');
        return;
      }

      // Insert organizations into database
      const { error } = await supabase
        .from('organizations')
        .insert(organizations);

      if (error) {
        console.error('Error importing organizations:', error);
        toast.error('Failed to import organizations');
      } else {
        toast.success(`Successfully imported ${organizations.length} organizations`);
        setImportModalOpen(false);
        setImportFile(null);
        loadOrganizations(); // Reload to show new data
      }
    } catch (error) {
      console.error('Error processing CSV:', error);
      toast.error('Failed to process CSV file');
    } finally {
      setImporting(false);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <PageLoader />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
      {/* Breadcrumb Navigation */}
        <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-6">
        <Link to="/dashboard" className="flex items-center space-x-1 hover:text-gray-900">
          <Home className="h-4 w-4" />
          <span>Dashboard</span>
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-gray-900 font-medium">Organizations</span>
      </nav>

        {/* Header with Add Organization Button */}
        <div className="mb-6 flex justify-between items-end">
        <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Organizations</h1>
            <p className="text-gray-600">
              Manage organizations, their details, and configurations.
          </p>
        </div>
          <div className="flex items-center space-x-3">
            <Button 
              variant="outline" 
              onClick={() => setImportModalOpen(true)}
              className="bg-white hover:bg-gray-50"
            >
              <Upload className="h-4 w-4 mr-2" />
              Import
            </Button>
            <Button 
              onClick={addOrganization} 
              className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-6 py-3 rounded-lg font-semibold shadow-lg text-lg"
            >
              <Plus className="h-5 w-5 mr-3" />
              Add Organization
            </Button>
        </div>
      </div>

        {/* Search and Filters - All in One Line (Desktop) */}
        <div className="mb-4">
          <div className="flex flex-col lg:flex-row gap-3 items-start lg:items-center">
            {/* Search Bar */}
            <div className="flex-1 lg:flex-none lg:w-80">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search by name, description, or unit code..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full"
                />
              </div>
            </div>
            
            {/* Sector Filter */}
                <Select value={sectorFilter} onValueChange={setSectorFilter}>
              <SelectTrigger className="w-full lg:w-48">
                    <SelectValue placeholder="All Sectors" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Sectors</SelectItem>
                    {sectorOptions.map(sector => (
                      <SelectItem key={sector} value={sector}>
                        {sector}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
            
            {/* Clear Filters Button */}
            <Button variant="outline" onClick={clearFilters} className="w-full lg:w-auto">
              Clear Filters
                </Button>
              </div>
            </div>

            {/* Organizations Table */}
        <Card className="mt-2">
          <CardContent className="p-0">
            <div className="overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                     <TableHead>Organization</TableHead>
                     <TableHead>Mapped Sites</TableHead>
                     <TableHead>Sector</TableHead>
                     <TableHead>Unit Code</TableHead>
                     <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentOrganizations.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-12">
                        <Building className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                        <p className="text-sm text-gray-500">No organizations found</p>
                        <p className="text-xs text-gray-400">Create your first organization to get started</p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    currentOrganizations.map(org => (
                      <TableRow key={org.id} className="hover:bg-gray-50">
                                                 <TableCell className="font-medium">
                           <div className="flex items-center space-x-3">
                             {org.logo_url ? (
                               <OrganizationLogo 
                                 src={org.logo_url} 
                                 alt={`${org.name} logo`}
                               />
                             ) : (
                               <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                                 <Building className="h-4 w-4 text-gray-500" />
                               </div>
                             )}
                             <span>{org.name}</span>
                           </div>
                         </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                             <span className="font-medium">{org.mapped_sites_count || 0}</span>
                             <span className="text-sm text-gray-500">sites</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {org.sector && (
                            <Badge variant="outline">
                              {org.sector}
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <span className="font-mono text-sm">{org.unit_code}</span>
                        </TableCell>
                                                 <TableCell>
                           <div className="flex items-center justify-end space-x-2">
                             <Button
                               variant="ghost"
                               size="sm"
                               onClick={() => editOrganization(org)}
                               className="h-8 w-8 p-0 hover:bg-green-50"
                               title="Edit Organization"
                             >
                               <Edit className="h-4 w-4 text-green-600" />
                            </Button>
                             {org.is_archived ? (
                            <Button 
                                 variant="ghost"
                              size="sm" 
                                 onClick={() => unarchiveOrganization(org)}
                                 className="h-8 w-8 p-0 hover:bg-green-50"
                                 title="Unarchive Organization"
                            >
                                 <Trash2 className="h-4 w-4 text-green-600" />
                            </Button>
                             ) : (
                               <Button
                                 variant="ghost"
                                 size="sm"
                                 onClick={() => archiveOrganization(org)}
                                 className="h-8 w-8 p-0 hover:bg-orange-50"
                                 title="Archive Organization"
                               >
                                 <Trash2 className="h-4 w-4 text-orange-600" />
                               </Button>
                             )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
          </div>
        </CardContent>
      </Card>

        {/* Summary and Pagination */}
        <div className="mt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="text-sm text-gray-500">
            Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredOrganizations.length)} of {filteredOrganizations.length} organizations
          </div>
          
          {totalPages > 1 && (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    size="sm"
                    onClick={() => handlePageChange(page)}
                    className="w-8 h-8 p-0"
                  >
                    {page}
                  </Button>
                ))}
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Edit Organization Dialog */}
      {editingOrganization && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium mb-4">
              {editingOrganization.id === 'new' ? 'Add Organization' : 'Edit Organization'}
            </h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="orgName">Organization Name</Label>
                <Input
                  id="orgName"
                  value={editingOrganization.name}
                  onChange={(e) => setEditingOrganization({...editingOrganization, name: e.target.value})}
                  placeholder="Enter organization name"
                />
              </div>
              
              <div>
                <Label htmlFor="orgDescription">Description</Label>
                <Input
                  id="orgDescription"
                  value={editingOrganization.description}
                  onChange={(e) => setEditingOrganization({...editingOrganization, description: e.target.value})}
                  placeholder="Enter organization description"
                />
              </div>
              
              <div>
                <Label htmlFor="orgSector">Sector</Label>
                <Select 
                  value={editingOrganization.sector} 
                  onValueChange={(value) => setEditingOrganization({...editingOrganization, sector: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select sector" />
                  </SelectTrigger>
                  <SelectContent>
                    {sectorOptions.map(sector => (
                      <SelectItem key={sector} value={sector}>
                        {sector}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="orgUnitCode">Unit Code</Label>
                <Input
                  id="orgUnitCode"
                  value={editingOrganization.unit_code}
                  onChange={(e) => setEditingOrganization({...editingOrganization, unit_code: e.target.value})}
                  placeholder="Enter unit code"
                />
              </div>
              
              {/* Logo Upload Section */}
              <div>
                <Label htmlFor="orgLogo">Organization Logo</Label>
                <div className="space-y-3">
                                     {/* Current Logo Display */}
                   {(editingOrganization.logo_url || logoUpload?.preview) && (
                     <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                       {logoUpload?.preview ? (
                         <img 
                           src={logoUpload.preview} 
                           alt="New organization logo"
                           className="h-12 w-12 rounded-full object-cover border"
                         />
                       ) : editingOrganization.logo_url ? (
                         <OrganizationLogo 
                           src={editingOrganization.logo_url} 
                           alt="Current organization logo"
                         />
                       ) : null}
                       <div className="flex-1">
                         <p className="text-sm font-medium">Current Logo</p>
                         <p className="text-xs text-gray-500">
                           {logoUpload ? 'New logo selected' : 'Existing logo'}
                         </p>
                       </div>
                       {logoUpload && (
                         <Button
                           type="button"
                           variant="ghost"
                           size="sm"
                           onClick={clearLogoUpload}
                           className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                         >
                           <Trash2 className="h-4 w-4" />
                         </Button>
                       )}
                     </div>
                   )}

                  {/* Logo Upload Input */}
                  <div className="flex items-center space-x-2">
                <Input
                      id="orgLogo"
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="cursor-pointer"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => document.getElementById('orgLogo')?.click()}
                    >
                      <Upload className="h-4 w-4 mr-1" />
                      Upload
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500">
                    Upload a logo image (JPG, PNG, GIF). Max size: 2MB.
                  </p>
                </div>
              </div>
              
              <div className="flex justify-end space-x-2 pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    clearLogoUpload();
                    setEditingOrganization(null);
                  }}
                  disabled={saving}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={saveOrganization}
                  disabled={saving}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {saving ? 'Saving...' : 'Save'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

             {/* Import Organizations Modal */}
       {importModalOpen && (
         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
           <div className="bg-white rounded-lg p-6 w-full max-w-md">
             <h3 className="text-lg font-medium mb-4">Import Organizations</h3>
             <div className="space-y-4">
               <div>
                 <Label htmlFor="csvFile">CSV File</Label>
                 <Input
                   id="csvFile"
                   type="file"
                   accept=".csv"
                   onChange={handleFileUpload}
                   className="cursor-pointer"
                 />
                 <p className="text-sm text-gray-500 mt-1">
                   Upload a CSV file with columns: name, description, sector, unit_code
                 </p>
               </div>
               
               {importFile && (
                 <div className="bg-gray-50 p-3 rounded-lg">
                   <p className="text-sm text-gray-700">
                     <strong>Selected file:</strong> {importFile.name}
                   </p>
                   <p className="text-xs text-gray-500 mt-1">
                     Size: {(importFile.size / 1024).toFixed(1)} KB
                   </p>
                 </div>
               )}
               
               <div className="bg-green-50 p-3 rounded-lg">
                 <h4 className="text-sm font-medium text-green-900 mb-2">CSV Format Example:</h4>
                 <pre className="text-xs text-green-800 bg-green-100 p-2 rounded">
{`name,description,sector,unit_code
"Acme Corp","Technology company","Business & Industry","ACM"
"Health Plus","Healthcare provider","Healthcare & Senior Living","HLP"`}
                 </pre>
               </div>
               
               <div className="flex justify-end space-x-2 pt-4">
                 <Button 
                   variant="outline" 
                   onClick={() => {
                     setImportModalOpen(false);
                     setImportFile(null);
                   }}
                 >
                   Cancel
                 </Button>
                 <Button 
                   onClick={importOrganizations}
                   disabled={!importFile || importing}
                   className="bg-green-600 hover:bg-green-700"
                 >
                   {importing ? 'Importing...' : 'Import Organizations'}
                 </Button>
               </div>
             </div>
           </div>
         </div>
       )}

       {/* Archive Organization Modal */}
       {archiveModalOpen && organizationToArchive && (
         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
           <div className="bg-white rounded-lg p-6 w-full max-w-md">
             <h3 className="text-lg font-medium mb-4">Archive Organization</h3>
             <div className="space-y-4">
               <div className="bg-orange-50 p-3 rounded-lg">
                 <p className="text-sm text-orange-800">
                   <strong>Warning:</strong> This will archive "{organizationToArchive.name}" only. Sites will remain active and can be managed independently.
                 </p>
               </div>
               
               <div>
                 <Label htmlFor="archiveReason">Reason for Archiving</Label>
                 <Select value={archiveReason} onValueChange={setArchiveReason}>
                   <SelectTrigger>
                     <SelectValue placeholder="Select a reason" />
                   </SelectTrigger>
                   <SelectContent>
                     <SelectItem value="No longer active">No longer active</SelectItem>
                     <SelectItem value="Contract ended">Contract ended</SelectItem>
                     <SelectItem value="Business closure">Business closure</SelectItem>
                     <SelectItem value="Restructuring">Restructuring</SelectItem>
                     <SelectItem value="Other">Other</SelectItem>
                   </SelectContent>
                 </Select>
               </div>
               
               <div className="flex justify-end space-x-2 pt-4">
                 <Button 
                   variant="outline" 
                   onClick={() => {
                     setArchiveModalOpen(false);
                     setOrganizationToArchive(null);
                     setArchiveReason('');
                   }}
                   disabled={archiving}
                 >
                   Cancel
                 </Button>
                 <Button 
                   onClick={confirmArchiveOrganization}
                   disabled={!archiveReason.trim() || archiving}
                   className="bg-orange-600 hover:bg-orange-700"
                 >
                   {archiving ? 'Archiving...' : 'Archive Organization'}
                 </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

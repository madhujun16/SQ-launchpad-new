import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  DollarSign, 
  FileSpreadsheet,
  FileText,
  Filter,
  ChevronRight,
  ChevronDown,
  MoreHorizontal
} from 'lucide-react';
import { useRoleAccess } from '@/hooks/useRoleAccess';
import { AccessDenied } from '@/components/AccessDenied';
import { ContentLoader } from '@/components/ui/loader';
import { getRoleConfig } from '@/lib/roles';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatDate } from '@/lib/dateUtils';

// Channel types for Channels Enabled
const CHANNEL_TYPES = {
  'CONTROL DESK': 'Control Desk',
  'POS': 'POS',
  'KIOSK': 'Kiosk',
  'WEBORT': 'Webort',
  'APP/PWA': 'App/PWA',
  'SCAN & GO': 'Scan & Go'
} as const;

// Monthly labels (Oct-Sep)
const MONTHS = ['Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'] as const;

interface LicenseCostData {
  id: string;
  sector: string;
  org: string;
  foodCourt: string;
  venue: string;
  unitNo: string;
  type: string;
  goLiveDate: string;
  fy: string;
  fyQtr: string;
  licenses: {
    [key: string]: number; // License component counts
  };
  supportCost: number;
  maintenanceCost: number;
  monthlyCosts: number[]; // 12 months Oct-Sep
}

// Helper function to get current month index (0-11)
const getCurrentMonthIndex = (): number => {
  const now = new Date();
  return now.getMonth(); // 0-11 (Jan-Dec)
};

// Helper function to get status based on go live date
const getStatus = (goLiveDate: string): string => {
  const goLive = new Date(goLiveDate);
  const now = new Date();
  if (goLive > now) return 'Upcoming';
  const daysDiff = Math.floor((now.getTime() - goLive.getTime()) / (1000 * 60 * 60 * 24));
  if (daysDiff <= 30) return 'Live';
  return 'Active';
};

// Helper function to get channels enabled
const getChannelsEnabled = (licenses: { [key: string]: number }): string[] => {
  return Object.entries(CHANNEL_TYPES)
    .filter(([key]) => licenses[key] && licenses[key] > 0)
    .map(([, value]) => value);
};

// Helper function to get subsidy type
const getSubsidyType = (licenses: { [key: string]: number }): string => {
  const hasGeneric = licenses['SUBSIDY GENERIC'] && licenses['SUBSIDY GENERIC'] > 0;
  const hasPersonalised = licenses['SUBSIDY PERSONALISED'] && licenses['SUBSIDY PERSONALISED'] > 0;
  
  if (hasGeneric && hasPersonalised) return 'Both';
  if (hasGeneric) return 'Generic';
  if (hasPersonalised) return 'Personalized';
  return 'None';
};

// Helper function to get loyalty status
const getLoyaltyStatus = (licenses: { [key: string]: number }): boolean => {
  return !!(licenses['LOYALTY ENGINE'] && licenses['LOYALTY ENGINE'] > 0);
};

const Financials: React.FC = () => {
  const { currentRole, profile } = useAuth();
  const { getTabAccess } = useRoleAccess();
  const roleConfig = getRoleConfig(currentRole || 'admin');
  
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<LicenseCostData[]>([]);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  
  // Filters
  const [selectedSector, setSelectedSector] = useState<string>('all');
  const [selectedOrg, setSelectedOrg] = useState<string>('all');
  const [selectedFY, setSelectedFY] = useState<string>('all');

  // Toggle row expansion
  const toggleRow = (siteId: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(siteId)) {
      newExpanded.delete(siteId);
    } else {
      newExpanded.add(siteId);
    }
    setExpandedRows(newExpanded);
  };

  // Check access permissions - Finance or Deployment roles
  const tabAccess = getTabAccess('/insights/financials');
  const hasAccess = currentRole === 'admin' || 
                    currentRole === 'ops_manager' || 
                    currentRole === 'deployment_engineer' ||
                    tabAccess.canAccess;
  
  if (!hasAccess) {
    return (
      <AccessDenied 
        pageName="License & Cost Summary"
        customMessage="You don't have permission to access this page. Finance or Deployment role required."
      />
    );
  }

  // Mock data generation
  useEffect(() => {
    if (!currentRole || !profile) {
      return;
    }
    
    // Generate mock data
    const mockData: LicenseCostData[] = [
      {
        id: '1',
        sector: 'Retail',
        org: 'HSBC',
        foodCourt: 'Canary Wharf Food Court',
        venue: 'Main Hall',
        unitNo: 'CW-001',
        type: 'Full Service',
        goLiveDate: '2025-10-15',
        fy: 'FY2026',
        fyQtr: 'Q1',
        licenses: {
          'CONTROL DESK': 2,
          'POS': 5,
          'KIOSK': 3,
          'WEBORT': 1,
          'TDS': 2,
          'IMD': 1,
          'APP/PWA': 1,
          'SUBSIDY GENERIC': 1,
          'SUBSIDY PERSONALISED': 1,
          'LOYALTY ENGINE': 1,
          'SCAN & GO': 1
        },
        supportCost: 5000,
        maintenanceCost: 3000,
        monthlyCosts: []
      },
      {
        id: '2',
        sector: 'Corporate',
        org: 'JLR',
        foodCourt: 'Whitley Campus',
        venue: 'Cafeteria A',
        unitNo: 'JLR-001',
        type: 'Quick Service',
        goLiveDate: '2025-11-01',
        fy: 'FY2026',
        fyQtr: 'Q1',
        licenses: {
          'CONTROL DESK': 1,
          'POS': 3,
          'KIOSK': 2,
          'WEBORT': 1,
          'TDS': 1,
          'IMD': 0,
          'APP/PWA': 1,
          'SUBSIDY GENERIC': 1,
          'SUBSIDY PERSONALISED': 0,
          'LOYALTY ENGINE': 0,
          'SCAN & GO': 1
        },
        supportCost: 3500,
        maintenanceCost: 2000,
        monthlyCosts: []
      },
      {
        id: '3',
        sector: 'Finance',
        org: 'Morgan Stanley',
        foodCourt: 'London Office',
        venue: 'Executive Dining',
        unitNo: 'MS-001',
        type: 'Full Service',
        goLiveDate: '2025-10-20',
        fy: 'FY2026',
        fyQtr: 'Q1',
        licenses: {
          'CONTROL DESK': 3,
          'POS': 8,
          'KIOSK': 4,
          'WEBORT': 2,
          'TDS': 3,
          'IMD': 2,
          'APP/PWA': 1,
          'SUBSIDY GENERIC': 1,
          'SUBSIDY PERSONALISED': 1,
          'LOYALTY ENGINE': 1,
          'SCAN & GO': 1
        },
        supportCost: 8000,
        maintenanceCost: 5000,
        monthlyCosts: []
      }
    ];

    // Calculate monthly costs
    const processedData = mockData.map(site => {
      // Calculate channel licenses only (excluding TDS, IMD, Subsidy, Loyalty)
      const channelLicenses = Object.entries(site.licenses)
        .filter(([key]) => Object.keys(CHANNEL_TYPES).includes(key))
        .reduce((sum, [, count]) => sum + count, 0);
      
      const licenseCost = channelLicenses * 1000; // £1000 per license
      const totalAnnualCost = licenseCost + site.supportCost + site.maintenanceCost;
      const monthlyCost = totalAnnualCost / 12;
      
      return {
        ...site,
        monthlyCosts: Array(12).fill(monthlyCost)
      };
    });

    setData(processedData);
    setLoading(false);
  }, [currentRole, profile]);

  // Get unique filter values
  const sectors = useMemo(() => Array.from(new Set(data.map(d => d.sector))), [data]);
  const orgs = useMemo(() => Array.from(new Set(data.map(d => d.org))), [data]);
  const fiscalYears = useMemo(() => Array.from(new Set(data.map(d => d.fy))), [data]);

  // Filter data
  const filteredData = useMemo(() => {
    return data.filter(site => {
      if (selectedSector !== 'all' && site.sector !== selectedSector) return false;
      if (selectedOrg !== 'all' && site.org !== selectedOrg) return false;
      if (selectedFY !== 'all' && site.fy !== selectedFY) return false;
      return true;
    });
  }, [data, selectedSector, selectedOrg, selectedFY]);

  // Calculate summary totals
  const summary = useMemo(() => {
    const totalMonthlyCost = filteredData.reduce((sum, site) => {
      return sum + (site.monthlyCosts[0] || 0);
    }, 0);
    
    return {
      totalMonthlyCost,
      siteCount: filteredData.length
    };
  }, [filteredData]);

  // Get current month index in fiscal year (Oct=0, Nov=1, ..., Sep=11)
  const currentMonthIndex = useMemo(() => {
    const now = new Date();
    const month = now.getMonth(); // 0-11 (Jan=0, Feb=1, ..., Dec=11)
    // Convert to fiscal year month (Oct=0, Nov=1, ..., Sep=11)
    // Jan (0) -> Oct (9), Feb (1) -> Nov (10), ..., Sep (8) -> Jun (8), Oct (9) -> Jul (9), Nov (10) -> Aug (10), Dec (11) -> Sep (11)
    // Actually: Oct=9, Nov=10, Dec=11, Jan=0, Feb=1, ..., Sep=8
    // So: if month >= 9 (Oct-Dec), subtract 9; else add 3
    return month >= 9 ? month - 9 : month + 3;
  }, []);

  // Get site name (merged from foodCourt, venue, unitNo)
  const getSiteName = (site: LicenseCostData): string => {
    return `${site.foodCourt} - ${site.venue} (${site.unitNo})`;
  };


  // Export functions
  const handleExportExcel = () => {
    // TODO: Implement Excel export
    alert('Excel export functionality will be implemented');
  };

  const handleExportPDF = () => {
    // TODO: Implement PDF export
    alert('PDF export functionality will be implemented');
  };

  if (loading) {
    return <ContentLoader />;
  }

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">License & Cost Summary Report</h1>
          <p className="text-gray-600 mt-1">
            View and analyze license fees, support costs, and maintenance costs for deployed sites
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button onClick={handleExportExcel} variant="outline" size="sm">
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            Export Excel
          </Button>
          <Button onClick={handleExportPDF} variant="outline" size="sm">
            <FileText className="h-4 w-4 mr-2" />
            Export PDF
          </Button>
          <Badge variant="outline" className="flex items-center space-x-1">
            <roleConfig.icon className="h-3 w-3" />
            <span>{roleConfig.displayName}</span>
          </Badge>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Filter className="h-5 w-5" />
            <span>Filters</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Sector</label>
              <Select value={selectedSector} onValueChange={setSelectedSector}>
                <SelectTrigger>
                  <SelectValue placeholder="All Sectors" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sectors</SelectItem>
                  {sectors.map(sector => (
                    <SelectItem key={sector} value={sector}>{sector}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Organization</label>
              <Select value={selectedOrg} onValueChange={setSelectedOrg}>
                <SelectTrigger>
                  <SelectValue placeholder="All Organizations" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Organizations</SelectItem>
                  {orgs.map(org => (
                    <SelectItem key={org} value={org}>{org}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Fiscal Year</label>
              <Select value={selectedFY} onValueChange={setSelectedFY}>
                <SelectTrigger>
                  <SelectValue placeholder="All FY" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Fiscal Years</SelectItem>
                  {fiscalYears.map(fy => (
                    <SelectItem key={fy} value={fy}>{fy}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-sm text-gray-600">Total Sites</p>
              <p className="text-2xl font-bold text-gray-900">{summary.siteCount}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-sm text-gray-600">Total Monthly Cost</p>
              <p className="text-2xl font-bold text-blue-600">£{summary.totalMonthlyCost.toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Data Table */}
      <Card>
        <CardHeader>
          <CardTitle>Site Overview</CardTitle>
          <CardDescription>
            View site details, status, and monthly cost breakdown
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12"></TableHead>
                  <TableHead>Site Name</TableHead>
                  <TableHead>Org</TableHead>
                  <TableHead>Sector</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Go Live Date</TableHead>
                  <TableHead>Current Qtr</TableHead>
                  <TableHead>Channels Enabled</TableHead>
                  <TableHead>Subsidy Type</TableHead>
                  <TableHead>Loyalty</TableHead>
                  <TableHead>
                    <div className="flex items-center space-x-1">
                      <span>{MONTHS[currentMonthIndex]}</span>
                      <span className="text-gray-400">...</span>
                    </div>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.map((site) => {
                  const isExpanded = expandedRows.has(site.id);
                  const channels = getChannelsEnabled(site.licenses);
                  const subsidyType = getSubsidyType(site.licenses);
                  const hasLoyalty = getLoyaltyStatus(site.licenses);
                  const status = getStatus(site.goLiveDate);
                  const statusColor = status === 'Live' ? 'bg-green-100 text-green-800' : 
                                    status === 'Active' ? 'bg-blue-100 text-blue-800' : 
                                    'bg-yellow-100 text-yellow-800';
                  
                  // Get additional months (next 8 months after current)
                  const additionalMonths = [];
                  for (let i = 1; i <= 8; i++) {
                    const monthIndex = (currentMonthIndex + i) % 12;
                    additionalMonths.push({ index: monthIndex, label: MONTHS[monthIndex] });
                  }
                  
                  return (
                    <React.Fragment key={site.id}>
                      <TableRow>
                        <TableCell>
                          <button
                            onClick={() => toggleRow(site.id)}
                            className="p-1 hover:bg-gray-100 rounded"
                          >
                            {isExpanded ? (
                              <ChevronDown className="h-4 w-4" />
                            ) : (
                              <ChevronRight className="h-4 w-4" />
                            )}
                          </button>
                        </TableCell>
                        <TableCell className="font-medium">{getSiteName(site)}</TableCell>
                        <TableCell>{site.org}</TableCell>
                        <TableCell>{site.sector}</TableCell>
                        <TableCell>{site.type}</TableCell>
                        <TableCell>
                          <Badge className={statusColor}>{status}</Badge>
                        </TableCell>
                        <TableCell>{formatDate(site.goLiveDate)}</TableCell>
                        <TableCell>{site.fyQtr}</TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {channels.length > 0 ? (
                              channels.map((channel, idx) => (
                                <Badge key={idx} variant="outline" className="text-xs">
                                  {channel}
                                </Badge>
                              ))
                            ) : (
                              <span className="text-gray-400 text-sm">None</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={subsidyType === 'None' ? 'outline' : 'secondary'}>
                            {subsidyType}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={hasLoyalty ? 'default' : 'outline'}>
                            {hasLoyalty ? 'Yes' : 'No'}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-semibold">
                          <div className="flex items-center space-x-1">
                            <span>£{site.monthlyCosts[currentMonthIndex]?.toFixed(0) || '0'}</span>
                            {additionalMonths.length > 0 && (
                              <button
                                onClick={() => toggleRow(site.id)}
                                className="p-1 hover:bg-gray-100 rounded ml-1"
                                title="View additional months"
                              >
                                <MoreHorizontal className="h-3 w-3 text-gray-400" />
                              </button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                      {isExpanded && (
                        <TableRow>
                          <TableCell colSpan={12} className="bg-gray-50">
                            <div className="p-4">
                              <h4 className="font-semibold mb-3">Monthly Cost Breakdown (Nov - Jun)</h4>
                              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                                {additionalMonths.map(({ index, label }) => (
                                  <div key={index} className="text-center">
                                    <div className="text-sm text-gray-600 mb-1">{label}</div>
                                    <div className="font-semibold text-gray-900">
                                      £{site.monthlyCosts[index]?.toFixed(0) || '0'}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </React.Fragment>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Financials;

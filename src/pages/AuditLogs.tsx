import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  FileText,
  Home,
  ChevronRight,
  AlertCircle,
  Download,
  Filter,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { getRoleConfig } from '@/lib/roles';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Loader } from '@/components/ui/loader';

// Interfaces
interface AuditLog {
  id: string;
  type: 'create' | 'update' | 'delete' | 'info' | 'error';
  message: string;
  actor?: string | null;
  created_at: string;
}

export default function AuditLogs() {
  const { currentRole } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [logFilter, setLogFilter] = useState<'all' | AuditLog['type']>('all');

  const roleConfig = getRoleConfig(currentRole || 'admin');

  // Only allow admin access
  if (currentRole !== 'admin') {
    return (
      <div className="container mx-auto px-4 py-6">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            You do not have permission to access Audit & Logs. Please contact an administrator.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  useEffect(() => {
    loadAuditLogs();
  }, []);

  const loadAuditLogs = async () => {
    try {
      setLoading(true);
      
      // For now, we'll use sample audit logs since the actual audit system might not be fully implemented
      const sampleLogs: AuditLog[] = [
        {
          id: '1',
          type: 'create',
          message: 'New organization "HSBC" created',
          actor: 'admin',
          created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString() // 30 minutes ago
        },
        {
          id: '2',
          type: 'update',
          message: 'Software module "POS System" updated',
          actor: 'admin',
          created_at: new Date(Date.now() - 1000 * 60 * 60).toISOString() // 1 hour ago
        },
        {
          id: '3',
          type: 'delete',
          message: 'Hardware item "Old Printer" deleted',
          actor: 'admin',
          created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString() // 2 hours ago
        },
        {
          id: '4',
          type: 'info',
          message: 'System backup completed successfully',
          actor: 'system',
          created_at: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString() // 4 hours ago
        },
        {
          id: '5',
          type: 'error',
          message: 'Failed to connect to external API',
          actor: 'system',
          created_at: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString() // 6 hours ago
        },
        {
          id: '6',
          type: 'create',
          message: 'New user "john.doe@example.com" registered',
          actor: 'system',
          created_at: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString() // 8 hours ago
        },
        {
          id: '7',
          type: 'update',
          message: 'User role updated for "jane.smith@example.com"',
          actor: 'admin',
          created_at: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString() // 12 hours ago
        },
        {
          id: '8',
          type: 'info',
          message: 'Daily maintenance routine completed',
          actor: 'system',
          created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString() // 1 day ago
        }
      ];

      setAuditLogs(sampleLogs);
      
      // In a real implementation, you would fetch from the database:
      // const { data: logsData, error: logsError } = await supabase
      //   .from('audit_logs')
      //   .select('*')
      //   .order('created_at', { ascending: false });
      
      // if (logsError) {
      //   console.error('Error loading audit logs:', logsError);
      //   toast.error('Failed to load audit logs');
      //   setAuditLogs([]);
      // } else {
      //   setAuditLogs(logsData || []);
      // }
      
    } catch (error) {
      console.error('Error loading audit logs:', error);
      setError('Failed to load audit logs');
    } finally {
      setLoading(false);
    }
  };

  const logAudit = async (entry: Omit<AuditLog, 'id' | 'created_at'>) => {
    try {
      // Log to database
      await supabase.rpc('log_audit_event', {
        _action: entry.type,
        _table_name: 'platform_configuration',
        _metadata: { message: entry.message, actor: entry.actor }
      });
      
      // Also update local state for immediate UI feedback
      setAuditLogs(prev => [
        { id: crypto.randomUUID(), created_at: new Date().toISOString(), ...entry },
        ...prev,
      ]);
    } catch (error) {
      console.error('Failed to log audit event:', error);
      // Fallback to local state only
      setAuditLogs(prev => [
        { id: crypto.randomUUID(), created_at: new Date().toISOString(), ...entry },
        ...prev,
      ]);
    }
  };

  // CSV export for logs
  const downloadLogsCsv = () => {
    const visible = auditLogs.filter(l => logFilter === 'all' ? true : l.type === logFilter);
    const rows = [ 
      ['Timestamp','Type','Message','Actor'], 
      ...visible.map(l => [
        l.created_at, 
        l.type, 
        l.message, 
        l.actor || ''
      ]) 
    ];
    const csv = rows.map(r => r.map(v => `"${String(v).replace(/"/g,'""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; 
    a.download = 'audit-logs.csv'; 
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Audit logs downloaded successfully');
  };

  // Filter logs based on selected type
  const filteredLogs = auditLogs.filter(log => 
    logFilter === 'all' || log.type === logFilter
  );

  // Show loading state
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader size="lg" />
            <p className="text-gray-600 mt-4">Loading audit logs...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="container mx-auto px-4 py-6">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error}
            <Button 
              variant="outline" 
              className="ml-4" 
              onClick={() => {
                setError(null);
                loadAuditLogs();
              }}
            >
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center space-x-2 text-sm text-gray-600">
        <Link to="/dashboard" className="flex items-center space-x-1 hover:text-gray-900">
          <Home className="h-4 w-4" />
          <span>Dashboard</span>
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-gray-900 font-medium">Audit & Logs</span>
      </nav>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Audit & System Logs</h1>
          <p className="text-gray-600 mt-1">
            View system logs, audit trails, and activity records
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="flex items-center space-x-1">
            <roleConfig.icon className="h-3 w-3" />
            <span>{roleConfig.displayName}</span>
          </Badge>
        </div>
      </div>

      {/* Main Content */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-4 w-4" />
            <span>System Activity Logs</span>
          </CardTitle>
          <CardDescription>
            View system logs, audit trails, and activity records
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Controls */}
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">
                Audit Logs ({filteredLogs.length})
              </h3>
              <div className="flex items-center space-x-2">
                <Select value={logFilter} onValueChange={(value) => setLogFilter(value as any)}>
                  <SelectTrigger className="w-[180px]">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Filter logs" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Logs</SelectItem>
                    <SelectItem value="create">Create</SelectItem>
                    <SelectItem value="update">Update</SelectItem>
                    <SelectItem value="delete">Delete</SelectItem>
                    <SelectItem value="info">Info</SelectItem>
                    <SelectItem value="error">Error</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" onClick={loadAuditLogs}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
                <Button onClick={downloadLogsCsv}>
                  <Download className="h-4 w-4 mr-2" />
                  Download CSV
                </Button>
              </div>
            </div>

            {/* Logs Table */}
            <div className="border rounded-lg overflow-y-auto max-h-[600px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[20%]">Timestamp</TableHead>
                    <TableHead className="w-[15%]">Type</TableHead>
                    <TableHead className="w-[55%]">Message</TableHead>
                    <TableHead className="w-[10%]">Actor</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLogs.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8 text-gray-500">
                        <FileText className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                        <p className="text-sm">No audit logs found</p>
                        <p className="text-xs">Logs will appear here as system activities occur</p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredLogs.map(log => (
                      <TableRow key={log.id} className="hover:bg-gray-50">
                        <TableCell>
                          <span className="text-sm text-gray-600">
                            {new Date(log.created_at).toLocaleString()}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={
                              log.type === 'delete' || log.type === 'error' 
                                ? 'destructive' 
                                : log.type === 'create' 
                                  ? 'default' 
                                  : log.type === 'update' 
                                    ? 'secondary' 
                                    : 'outline'
                            }
                            className="capitalize"
                          >
                            {log.type}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-gray-900">{log.message}</span>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-gray-600">
                            {log.actor || 'System'}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Log Statistics */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 pt-4 border-t">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {auditLogs.filter(l => l.type === 'create').length}
                </div>
                <div className="text-sm text-gray-600">Create</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {auditLogs.filter(l => l.type === 'update').length}
                </div>
                <div className="text-sm text-gray-600">Update</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {auditLogs.filter(l => l.type === 'delete').length}
                </div>
                <div className="text-sm text-gray-600">Delete</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {auditLogs.filter(l => l.type === 'info').length}
                </div>
                <div className="text-sm text-gray-600">Info</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {auditLogs.filter(l => l.type === 'error').length}
                </div>
                <div className="text-sm text-gray-600">Error</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

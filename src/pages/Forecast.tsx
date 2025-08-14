import React, { useEffect, useMemo, useState } from 'react';
import { useSiteContext, type Site } from '@/contexts/SiteContext';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { Calendar, AlertTriangle, CheckCircle2, Clock, FileDown, Plus, Edit3 } from 'lucide-react';

type MilestoneKey =
  | 'site_study'
  | 'scoping_approvals'
  | 'procurement'
  | 'installation'
  | 'testing'
  | 'go_live'
  | 'post_go_live';

type MilestoneStatus = 'pending' | 'in_progress' | 'completed' | 'delayed' | 'at_risk';

interface Milestone {
  id: string;
  key: MilestoneKey | string; // allow custom keys
  name: string;
  startDate: string; // ISO date (yyyy-mm-dd)
  endDate: string;   // ISO date (yyyy-mm-dd)
  status: MilestoneStatus;
  dependsOn?: string[]; // ids
  notes?: string;
}

interface SiteForecast {
  siteId: string;
  goLiveDate: string; // from site
  milestones: Milestone[];
}

function formatDate(d: Date): string {
  return d.toISOString().split('T')[0];
}

function addDays(base: Date, days: number): Date {
  const dt = new Date(base);
  dt.setDate(dt.getDate() + days);
  return dt;
}

function generateDefaultMilestones(goLiveISO: string): Milestone[] {
  const goLive = new Date(goLiveISO);
  // Durations set by typical playbook; editable later
  const plan: Array<{ key: MilestoneKey; name: string; startOffset: number; endOffset: number; }> = [
    { key: 'site_study', name: 'Site Study', startOffset: -90, endOffset: -75 },
    { key: 'scoping_approvals', name: 'Scoping & Approvals', startOffset: -74, endOffset: -45 },
    { key: 'procurement', name: 'Procurement', startOffset: -44, endOffset: -21 },
    { key: 'installation', name: 'Installation & Configuration', startOffset: -20, endOffset: -7 },
    { key: 'testing', name: 'Testing & Validation', startOffset: -6, endOffset: -1 },
    { key: 'go_live', name: 'Go Live', startOffset: 0, endOffset: 0 },
    { key: 'post_go_live', name: 'Post-Go Live Support', startOffset: 1, endOffset: 14 },
  ];
  return plan.map((p, idx) => ({
    id: `${p.key}-${idx}`,
    key: p.key,
    name: p.name,
    startDate: formatDate(addDays(goLive, p.startOffset)),
    endDate: formatDate(addDays(goLive, p.endOffset)),
    status: 'pending',
    dependsOn: idx > 0 ? [`${plan[idx - 1].key}-${idx - 1}`] : [],
  }));
}

function computeStatus(m: Milestone): MilestoneStatus {
  const today = new Date();
  const start = new Date(m.startDate);
  const end = new Date(m.endDate);
  if (m.status === 'completed') return 'completed';
  if (today < start) return 'pending';
  if (today >= start && today <= end) return 'in_progress';
  if (today > end) return 'delayed';
  return 'pending';
}

function getStatusBadge(status: MilestoneStatus) {
  switch (status) {
    case 'completed':
      return <Badge className="bg-green-100 text-green-800"><CheckCircle2 className="h-3 w-3 mr-1" />Completed</Badge>;
    case 'in_progress':
      return <Badge className="bg-blue-100 text-blue-800"><Clock className="h-3 w-3 mr-1" />In Progress</Badge>;
    case 'delayed':
      return <Badge className="bg-red-100 text-red-800"><AlertTriangle className="h-3 w-3 mr-1" />Delayed</Badge>;
    case 'at_risk':
      return <Badge className="bg-orange-100 text-orange-800"><AlertTriangle className="h-3 w-3 mr-1" />At Risk</Badge>;
    default:
      return <Badge className="bg-gray-100 text-gray-800">Pending</Badge>;
  }
}

function dateRangePercent(date: string, min: Date, max: Date): number {
  const x = new Date(date).getTime();
  const a = min.getTime();
  const b = max.getTime();
  if (b === a) return 0;
  const pct = ((x - a) / (b - a)) * 100;
  return Math.max(0, Math.min(100, pct));
}

const Forecast: React.FC = () => {
  const { currentRole } = useAuth();
  const { sites, updateSite } = useSiteContext();

  const [forecasts, setForecasts] = useState<Record<string, SiteForecast>>({});
  const [editTarget, setEditTarget] = useState<{ siteId: string; milestoneId: string } | null>(null);
  const [editStart, setEditStart] = useState('');
  const [editEnd, setEditEnd] = useState('');
  const [editNotes, setEditNotes] = useState('');

  const canEditDates = currentRole === 'admin';
  const canUpdateProgress = currentRole === 'deployment_engineer' || currentRole === 'admin';

  // Initialize forecast structures based on go live
  useEffect(() => {
    const next: Record<string, SiteForecast> = {};
    sites.forEach((site) => {
      if (!site.goLiveDate) return;
      const ms = site.forecast?.milestones as unknown as Milestone[] | undefined;
      const milestones = (ms && ms.length > 0) ? ms : generateDefaultMilestones(site.goLiveDate);
      // refresh dynamic statuses
      const refreshed = milestones.map(m => ({ ...m, status: computeStatus(m) }));
      next[site.id] = { siteId: site.id, goLiveDate: site.goLiveDate, milestones: refreshed };
    });
    setForecasts(next);
  }, [sites]);

  const allSiteCards = useMemo(() => Object.values(forecasts), [forecasts]);

  const handleOpenEdit = (siteId: string, milestoneId: string) => {
    const m = forecasts[siteId]?.milestones.find(x => x.id === milestoneId);
    if (!m) return;
    setEditTarget({ siteId, milestoneId });
    setEditStart(m.startDate);
    setEditEnd(m.endDate);
    setEditNotes(m.notes || '');
  };

  const handleSaveEdit = () => {
    if (!editTarget) return;
    const { siteId, milestoneId } = editTarget;
    setForecasts(prev => {
      const copy = { ...prev };
      const site = copy[siteId];
      if (!site) return prev;
      site.milestones = site.milestones.map(m => m.id === milestoneId ? { ...m, startDate: editStart, endDate: editEnd, notes: editNotes } : m);
      return copy;
    });
    toast.success('Milestone updated');
    setEditTarget(null);
    // Persist into site context to keep in sync (optional lightweight persistence)
    const updated = forecasts[siteId]?.milestones.map(m => m.id === milestoneId ? { ...m, startDate: editStart, endDate: editEnd, notes: editNotes } : m) || [];
    updateSite(siteId, { forecast: { milestones: updated as unknown as string[] } as any });
  };

  const handleMarkComplete = (siteId: string, milestoneId: string) => {
    if (!canUpdateProgress) return;
    setForecasts(prev => {
      const copy = { ...prev };
      const site = copy[siteId];
      if (!site) return prev;
      site.milestones = site.milestones.map(m => m.id === milestoneId ? { ...m, status: 'completed' } : m);
      return copy;
    });
  };

  const exportCsv = () => {
    const rows: string[] = ['Site,Milestone,Start,End,Status'];
    allSiteCards.forEach(sf => {
      sf.milestones.forEach(m => rows.push(`${JSON.stringify(sites.find(s => s.id === sf.siteId)?.name || '')},${JSON.stringify(m.name)},${m.startDate},${m.endDate},${m.status}`));
    });
    const blob = new Blob([rows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'forecast.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  if (sites.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Forecast</CardTitle>
            <CardDescription>No sites available. Create a site with a Go Live Date to generate a forecast.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Forecast</h1>
          <p className="text-gray-600 mt-1">Strategic deployment roadmap driven by site Go Live dates</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={exportCsv}><FileDown className="h-4 w-4 mr-1" />Export CSV</Button>
        </div>
      </div>

      {allSiteCards.map((sf) => {
        const site = sites.find(s => s.id === sf.siteId) as Site | undefined;
        if (!site) return null;
        const minStart = new Date(Math.min(...sf.milestones.map(m => new Date(m.startDate).getTime())));
        const maxEnd = new Date(Math.max(...sf.milestones.map(m => new Date(m.endDate).getTime())));
        return (
          <Card key={sf.siteId} className="overflow-hidden">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl">{site.name}</CardTitle>
                  <CardDescription className="flex items-center gap-2 mt-1">
                    <Calendar className="h-4 w-4" /> Go Live: {site.goLiveDate || 'TBD'}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">Priority: {site.priority}</Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Timeline (simple Gantt) */}
              <div className="relative w-full border rounded-lg p-4 bg-white">
                <div className="relative h-12">
                  {sf.milestones.map((m) => {
                    const left = dateRangePercent(m.startDate, minStart, maxEnd);
                    const right = dateRangePercent(m.endDate, minStart, maxEnd);
                    const width = Math.max(1, right - left);
                    const color = m.status === 'completed' ? 'bg-green-600' : m.status === 'delayed' ? 'bg-red-600' : 'bg-emerald-600';
                    return (
                      <div key={m.id} className="absolute top-2 h-8 rounded-md text-xs text-white flex items-center px-2"
                        style={{ left: `${left}%`, width: `${width}%`, minWidth: '6%' }}>
                        <div className={`${color} w-full h-full rounded-md flex items-center px-2 overflow-hidden`}
                          title={`${m.name} (${m.startDate} → ${m.endDate})`}>
                          <span className="truncate">{m.name}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="mt-2 flex justify-between text-[10px] text-gray-500">
                  <span>{formatDate(minStart)}</span>
                  <span>{formatDate(maxEnd)}</span>
                </div>
              </div>

              <Separator className="my-4" />

              {/* Milestone list */}
              <div className="space-y-3">
                {sf.milestones.map((m) => {
                  const status = computeStatus(m);
                  return (
                    <div key={m.id} className="p-3 border rounded-lg flex items-center justify-between">
                      <div className="min-w-0">
                        <div className="font-medium truncate">{m.name}</div>
                        <div className="text-xs text-gray-600">{m.startDate} → {m.endDate}</div>
                        {m.notes && <div className="text-xs text-gray-500 mt-1 line-clamp-2">{m.notes}</div>}
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(status)}
                        {canEditDates && (
                          <Button size="sm" variant="outline" onClick={() => handleOpenEdit(sf.siteId, m.id)}>
                            <Edit3 className="h-4 w-4 mr-1" /> Edit
                          </Button>
                        )}
                        {canUpdateProgress && status !== 'completed' && (
                          <Button size="sm" onClick={() => handleMarkComplete(sf.siteId, m.id)}>
                            <CheckCircle2 className="h-4 w-4 mr-1" /> Mark Complete
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        );
      })}

      {/* Edit Milestone Dialog */}
      <Dialog open={!!editTarget} onOpenChange={() => setEditTarget(null)}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>Edit Milestone</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <label className="text-sm">Start Date</label>
              <Input type="date" value={editStart} onChange={(e) => setEditStart(e.target.value)} />
            </div>
            <div>
              <label className="text-sm">End Date</label>
              <Input type="date" value={editEnd} onChange={(e) => setEditEnd(e.target.value)} />
            </div>
            <div>
              <label className="text-sm">Notes</label>
              <Textarea value={editNotes} onChange={(e) => setEditNotes(e.target.value)} rows={3} />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setEditTarget(null)}>Cancel</Button>
              <Button onClick={handleSaveEdit}>Save</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Forecast;



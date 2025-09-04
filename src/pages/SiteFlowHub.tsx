import React, { useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MultiStepForm } from '@/components/ui/enhanced-stepper';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { getSiteFlow, getEnhancedSteps } from '@/services/siteFlowMockService';
import { useAuth } from '@/hooks/useAuth';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { format, parseISO, isValid } from 'date-fns';
import { FileText, ClipboardList, CheckSquare, ShoppingCart, Truck, CheckCircle, MapPin } from 'lucide-react';
import { useSiteContext } from '@/contexts/SiteContext';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';

const SiteFlowHub: React.FC = () => {
  const { id: siteId = 'demo-site' } = useParams();
  const navigate = useNavigate();
  const { currentRole } = useAuth();
  const { getSiteById } = useSiteContext();
  const siteMeta = getSiteById(siteId);

  const flow = getSiteFlow(siteId);
  const steps = useMemo(() => getEnhancedSteps(flow), [flow]);
  const completed = flow.steps.filter(s => s.status === 'completed').length;
  const progress = Math.round((completed / flow.steps.length) * 100);
  const [selectedIdx, setSelectedIdx] = useState(() => Math.min(steps.findIndex(s => s.status !== 'completed'), steps.length - 1));

  const selectedStep = flow.steps[selectedIdx];
  const canEdit = currentRole === 'admin' || currentRole === 'deployment_engineer';

  const formatDate = (value?: string) => {
    if (!value) return '';
    // Accept yyyy-mm-dd or ISO; fallback to raw
    const d = parseISO(value);
    return isValid(d) ? format(d, 'dd MMM yyyy') : String(value);
  };

  const buildRows = () => {
    const rows: { label: string; value: React.ReactNode }[] = [];
    const v: Record<string, any> = selectedStep?.values || {};
    switch (selectedStep?.key) {
      case 'create_site':
        if (v.name) rows.push({ label: 'Site Name', value: v.name });
        if (v.goLiveDate) rows.push({ label: 'Go Live Date', value: formatDate(v.goLiveDate) });
        if (v.address) rows.push({ label: 'Address', value: v.address });
        break;
      case 'site_study': {
        if (v.address) rows.push({ label: 'Address', value: v.address });
        const lat = v.latitude ?? v.lat;
        const lng = v.longitude ?? v.lng;
        if (lat !== undefined && lng !== undefined) rows.push({ label: 'Coordinates', value: `${lat}, ${lng}` });
        if (v.counters !== undefined) rows.push({ label: 'Counter Count', value: String(v.counters) });
        if (v.map) rows.push({ label: 'Map', value: <a className="text-green-700 underline" href={String(v.map)} target="_blank" rel="noreferrer">Open map</a> });
        break;
      }
      case 'scoping':
        if (v.hardwareList) rows.push({ label: 'Hardware List', value: v.hardwareList });
        if (Array.isArray(v.breakdown)) {
          rows.push({ label: 'CAPEX Breakdown', value: (
            <div className="mt-1 space-y-1">
              {v.breakdown.map((b: any, i: number) => (
                <div key={i} className="flex justify-between text-xs">
                  <span>{b.item} × {b.qty}</span>
                  <span>£{b.total}</span>
                </div>
              ))}
              <div className="border-t pt-1 mt-1 flex justify-between text-sm font-medium">
                <span>Total</span>
                <span>£{v.totalCapex}</span>
              </div>
            </div>
          ) });
        }
        break;
      case 'approval':
        if (v.signedBy) rows.push({ label: 'Signed By', value: v.signedBy });
        break;
      case 'procurement':
        if (v.poNumber) rows.push({ label: 'PO Number', value: v.poNumber });
        break;
      case 'deployment':
        if (v.installDate) rows.push({ label: 'Install Date', value: formatDate(v.installDate) });
        break;
      case 'go_live':
        if (v.handoverDoc) rows.push({ label: 'Handover Document', value: <a className="text-green-700 underline" href={String(v.handoverDoc)} target="_blank" rel="noreferrer">View</a> });
        break;
      default:
        Object.entries(v).forEach(([k, val]) => rows.push({ label: k.replace(/([A-Z])/g, ' $1'), value: String(val) }));
    }
    return rows;
  };

  const rows = buildRows();

  const downloadReport = () => {
    const payload = {
      siteId,
      step: selectedStep?.key,
      title: selectedStep?.title,
      generatedAt: new Date().toISOString(),
      data: selectedStep?.values || {}
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${siteId}-${selectedStep?.key}-report.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <Breadcrumb className="mb-2">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/sites">Sites</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href={`/sites/${siteId}`}>{siteMeta?.name || 'Site'}</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Flow</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Site title, status and progress */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold">{siteMeta?.name || 'Site Flow'}</h1>
            {siteMeta?.status && (
              <span className="px-2 py-0.5 rounded-md text-xs bg-green-100 text-green-800">{siteMeta.status}</span>
            )}
          </div>
          <div className="mt-1 flex items-center gap-3 text-sm text-gray-600">
            <span>{siteMeta?.organization}</span>
            {siteMeta?.goLiveDate && <span>• Target Date: {formatDate(siteMeta.goLiveDate)}</span>}
            <span>• Progress</span>
            <div className="flex items-center gap-2">
              <Progress value={progress} className="w-40" />
              <span className="text-sm text-gray-600">{progress}%</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {canEdit && selectedStep?.status !== 'completed' && (
            <Button size="sm" onClick={() => navigate(`/sites/${siteId}/flow/${selectedStep?.key}`)}>Edit</Button>
          )}
          <Button size="sm" variant="outline" onClick={downloadReport}>Download Report</Button>
        </div>
      </div>

      <MultiStepForm
        steps={steps}
        currentStep={selectedIdx}
        onStepChange={(idx) => setSelectedIdx(idx)}
        showNavigation={false}
      >
        {selectedStep && (
          <Card>
            <CardContent className="p-5">
              <div className="space-y-4">
                <div>
                  <div className="text-base font-semibold">{selectedStep.key === 'create_site' ? 'Site Creation' : selectedStep.title}</div>
                </div>

                <div className="grid grid-cols-1 gap-6">
                  {/* Left column: key-value details like a document */}
                  <div className="lg:col-span-2">
                    <div className="rounded-xl border bg-white p-4">
                      <div className="divide-y">
                        {rows.length === 0 && (
                          <div className="text-sm text-gray-500 py-2">No data captured yet.</div>
                        )}
                        {rows.map((row) => (
                          <div key={String(row.label)} className="grid grid-cols-12 items-start py-3">
                            <div className="col-span-5 text-sm text-gray-500">{row.label}</div>
                            <div className="col-span-7 text-sm text-gray-900">{row.value}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </MultiStepForm>

      {/* Icon legend below stepper to reflect each stage */}
      <div className="mt-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 text-xs text-gray-600">
        <div className="flex items-center gap-2"><MapPin className="h-4 w-4" /> Create Site</div>
        <div className="flex items-center gap-2"><FileText className="h-4 w-4" /> Site Study</div>
        <div className="flex items-center gap-2"><ClipboardList className="h-4 w-4" /> Define Scope</div>
        <div className="flex items-center gap-2"><CheckSquare className="h-4 w-4" /> Approval</div>
        <div className="flex items-center gap-2"><ShoppingCart className="h-4 w-4" /> Procurement</div>
        <div className="flex items-center gap-2"><Truck className="h-4 w-4" /> Deployment</div>
        <div className="flex items-center gap-2"><CheckCircle className="h-4 w-4" /> Go Live</div>
      </div>
    </div>
  );
};

export default SiteFlowHub;



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

const SiteFlowHub: React.FC = () => {
  const { id: siteId = 'demo-site' } = useParams();
  const navigate = useNavigate();
  const { currentRole } = useAuth();

  const flow = getSiteFlow(siteId);
  const steps = useMemo(() => getEnhancedSteps(flow), [flow]);
  const completed = flow.steps.filter(s => s.status === 'completed').length;
  const progress = Math.round((completed / flow.steps.length) * 100);
  const [selectedIdx, setSelectedIdx] = useState(() => Math.min(steps.findIndex(s => s.status !== 'completed'), steps.length - 1));

  const selectedStep = flow.steps[selectedIdx];

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

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6 flex items-center justify-between">
          <div className="space-y-2">
            <div className="text-lg font-semibold">Site Workflow Progress</div>
            <div className="flex items-center gap-3">
              <Progress value={progress} className="w-48" />
              <span className="text-sm text-gray-600">{progress}%</span>
            </div>
          </div>
          <Button disabled={progress < 100}>Submit All</Button>
        </CardContent>
      </Card>

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
                  <div className="text-base font-semibold">{selectedStep.title}</div>
                  <div className="text-sm text-gray-600">{selectedStep.description}</div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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

                  {/* Right column: previews (maps/photos/docs) */}
                  <div className="lg:col-span-1 space-y-4">
                    <Accordion type="single" collapsible className="w-full">
                      <AccordionItem value="previews">
                        <AccordionTrigger>Previews</AccordionTrigger>
                        <AccordionContent>
                          <div className="space-y-3">
                            {/* Site Study photos preview */}
                            {selectedStep.key === 'site_study' && Array.isArray((selectedStep as any).values?.photos) && (
                              <div className="grid grid-cols-2 gap-2">
                                {(selectedStep as any).values.photos.map((src: string, i: number) => (
                                  <div key={i} className="aspect-video rounded-lg overflow-hidden border bg-white/50">
                                    <img src={src} alt={`photo-${i}`} className="w-full h-full object-cover" />
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* Map preview link */}
                            {selectedStep.key === 'site_study' && (selectedStep as any).values?.map && (
                              <a className="text-sm text-green-700 underline" href={(selectedStep as any).values.map} target="_blank" rel="noreferrer">Open map</a>
                            )}

                            {/* Handover doc preview */}
                            {selectedStep.key === 'go_live' && (selectedStep as any).values?.handoverDoc && (
                              <a className="text-sm text-green-700 underline" href={(selectedStep as any).values.handoverDoc} target="_blank" rel="noreferrer">View handover document</a>
                            )}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </MultiStepForm>
    </div>
  );
};

export default SiteFlowHub;



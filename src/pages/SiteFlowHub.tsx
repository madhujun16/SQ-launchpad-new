import React, { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MultiStepForm } from '@/components/ui/enhanced-stepper';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { getSiteFlow, getEnhancedSteps } from '@/services/siteFlowMockService';
import { useAuth } from '@/hooks/useAuth';

const SiteFlowHub: React.FC = () => {
  const { id: siteId = 'demo-site' } = useParams();
  const navigate = useNavigate();
  const { currentRole } = useAuth();

  const flow = getSiteFlow(siteId);
  const steps = useMemo(() => getEnhancedSteps(flow), [flow]);
  const completed = flow.steps.filter(s => s.status === 'completed').length;
  const progress = Math.round((completed / flow.steps.length) * 100);

  const canEdit = currentRole === 'admin' || currentRole === 'deployment_engineer';

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
        currentStep={Math.min(steps.findIndex(s => s.status !== 'completed'), steps.length - 1)}
        onStepChange={(idx) => {
          const step = flow.steps[idx];
          if (!step) return;
          if (canEdit) {
            navigate(`/sites/${siteId}/flow/${step.key}`);
          }
        }}
        showNavigation={false}
      >
        <div className="space-y-4">
          {flow.steps.map((s) => {
            // Build a document-like readout per step (no interactive fields)
            const rows: { label: string; value: string }[] = [];
            const v: Record<string, any> = s.values || {};

            switch (s.key) {
              case 'create_site':
                if (v.name) rows.push({ label: 'Site Name', value: String(v.name) });
                if (v.goLiveDate) rows.push({ label: 'Go Live Date', value: String(v.goLiveDate) });
                if (v.address) rows.push({ label: 'Address', value: String(v.address) });
                break;
              case 'site_study': {
                if (v.address) rows.push({ label: 'Address', value: String(v.address) });
                const lat = v.latitude ?? v.lat;
                const lng = v.longitude ?? v.lng;
                if (lat !== undefined && lng !== undefined) {
                  rows.push({ label: 'Coordinates', value: `${lat}, ${lng}` });
                }
                if (v.counters !== undefined) rows.push({ label: 'Counter Count', value: String(v.counters) });
                if (v.map) rows.push({ label: 'Map', value: String(v.map) });
                break;
              }
              case 'scoping':
                if (v.hardwareList) rows.push({ label: 'Hardware List', value: String(v.hardwareList) });
                break;
              case 'approval':
                if (v.signedBy) rows.push({ label: 'Signed By', value: String(v.signedBy) });
                break;
              case 'procurement':
                if (v.poNumber) rows.push({ label: 'PO Number', value: String(v.poNumber) });
                break;
              case 'deployment':
                if (v.installDate) rows.push({ label: 'Install Date', value: String(v.installDate) });
                break;
              case 'go_live':
                if (v.handoverDoc) rows.push({ label: 'Handover Document', value: String(v.handoverDoc) });
                break;
              default: {
                // Fallback to showing whatever fields exist
                Object.entries(v).forEach(([k, val]) =>
                  rows.push({ label: k.replace(/([A-Z])/g, ' $1'), value: String(val) })
                );
              }
            }

            return (
              <Card key={s.id}>
                <CardContent className="p-5">
                  <div className="space-y-2">
                    <div className="text-base font-semibold">{s.title}</div>
                    <div className="text-sm text-gray-600">{s.description}</div>
                    <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
                      {rows.length === 0 && (
                        <div className="text-sm text-gray-500">No data captured yet.</div>
                      )}
                      {rows.map((row) => (
                        <div key={row.label} className="text-sm">
                          <span className="text-gray-500">{row.label}</span>
                          <span className="mx-2 text-gray-400">:</span>
                          <span className="text-gray-900">{row.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </MultiStepForm>
    </div>
  );
};

export default SiteFlowHub;



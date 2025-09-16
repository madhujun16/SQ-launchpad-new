import React, { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { getSiteFlow, getStep, isStepCompletable, updateStepValues } from '@/services/siteFlowMockService';

const fieldRenderers: Record<string, (value: any, set: (v: any) => void) => React.ReactNode> = {
  name: (v, set) => (
    <div className="space-y-2">
      <Label>Name</Label>
      <Input value={v || ''} onChange={(e) => set(e.target.value)} />
    </div>
  ),
  goLiveDate: (v, set) => (
    <div className="space-y-2">
      <Label>Go Live Date</Label>
      <Input type="date" value={v || ''} onChange={(e) => set(e.target.value)} />
    </div>
  ),
  map: (v, set) => (
    <div className="space-y-2">
      <Label>Site Map URL</Label>
      <Input value={v || ''} onChange={(e) => set(e.target.value)} placeholder="https://..." />
    </div>
  ),
  counters: (v, set) => (
    <div className="space-y-2">
      <Label>Counter Count</Label>
      <Input type="number" value={v || ''} onChange={(e) => set(e.target.value)} />
    </div>
  ),
  hardwareList: (v, set) => (
    <div className="space-y-2">
      <Label>Hardware List</Label>
      <Textarea rows={4} value={v || ''} onChange={(e) => set(e.target.value)} />
    </div>
  ),
  signedBy: (v, set) => (
    <div className="space-y-2">
      <Label>Signed By</Label>
      <Input value={v || ''} onChange={(e) => set(e.target.value)} />
    </div>
  ),
  poNumber: (v, set) => (
    <div className="space-y-2">
      <Label>PO Number</Label>
      <Input value={v || ''} onChange={(e) => set(e.target.value)} />
    </div>
  ),
  installDate: (v, set) => (
    <div className="space-y-2">
      <Label>Install Date</Label>
      <Input type="date" value={v || ''} onChange={(e) => set(e.target.value)} />
    </div>
  ),
  handoverDoc: (v, set) => (
    <div className="space-y-2">
      <Label>Handover Doc URL</Label>
      <Input value={v || ''} onChange={(e) => set(e.target.value)} placeholder="https://..." />
    </div>
  ),
};

const SiteStepEdit: React.FC = () => {
  const { id: siteId = 'demo-site', stepKey = '' } = useParams();
  const navigate = useNavigate();
  const flow = getSiteFlow(siteId);
  const step = getStep(siteId, stepKey as any);

  const [draft, setDraft] = useState<Record<string, any>>(() => ({ ...(step?.values || {}) }));

  const mandatory = step?.mandatoryFields || [];
  const canMarkComplete = useMemo(() => {
    if (!step) return false;
    const merged: any = { ...step.values, ...draft };
    const clone = { ...step, values: merged } as any;
    return isStepCompletable(clone);
  }, [step, draft]);

  if (!step) {
    return (
      <div>
        <p className="text-sm text-gray-600">Step not found.</p>
        <Button className="mt-4" onClick={() => navigate(`/sites/${siteId}/flow`)}>Back to Summary</Button>
      </div>
    );
  }

  const renderField = (key: string) => {
    const render = fieldRenderers[key];
    const value = draft[key];
    const set = (v: any) => setDraft(d => ({ ...d, [key]: v }));
    return render ? render(value, set) : (
      <div className="space-y-2" key={key}>
        <Label>{key}</Label>
        <Input value={value || ''} onChange={(e) => set(e.target.value)} />
      </div>
    );
  };

  const onSave = (markCompleted: boolean) => {
    updateStepValues(siteId, step.key, draft, markCompleted);
    if (markCompleted) {
      navigate(`/sites/${siteId}/flow`);
    }
  };

  const goNext = () => {
    const idx = flow.steps.findIndex(s => s.key === step.key);
    const next = flow.steps[idx + 1];
    updateStepValues(siteId, step.key, draft, false);
    if (next) navigate(`/sites/${siteId}/flow/${next.key}`);
    else navigate(`/sites/${siteId}/flow`);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{step.title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-gray-600">Required fields: {mandatory.join(', ') || 'None'}</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {mandatory.map(key => (
              <div key={key}>{renderField(key)}</div>
            ))}
          </div>
          <div className="flex flex-wrap gap-2 pt-2">
            <Button variant="outline" onClick={() => onSave(false)}>Save as Draft</Button>
            <Button onClick={() => onSave(true)} disabled={!canMarkComplete}>Mark Complete</Button>
            <Button variant="ghost" onClick={() => navigate(`/sites/${siteId}/flow`)}>Back to Summary</Button>
            <Button variant="secondary" onClick={goNext}>Save and Continue</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SiteStepEdit;



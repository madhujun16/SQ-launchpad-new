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
          {flow.steps.map((s) => (
            <Card key={s.id}>
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <div className="text-base font-medium">{s.title}</div>
                  <div className="text-sm text-gray-600">{s.description}</div>
                </div>
                {canEdit && s.status !== 'completed' && (
                  <Button onClick={() => navigate(`/sites/${siteId}/flow/${s.key}`)}>Start / Edit</Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </MultiStepForm>
    </div>
  );
};

export default SiteFlowHub;



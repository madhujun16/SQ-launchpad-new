import { EnhancedStepperStep } from "@/components/ui/enhanced-stepper";
import { UnifiedSiteStatus } from "@/lib/siteTypes";

export type SiteFlowStepKey =
  | "create_site"
  | "site_study"
  | "scoping"
  | "approval"
  | "procurement"
  | "deployment"
  | "go_live";

export interface SiteFlowStepData {
  id: string; // step id
  key: SiteFlowStepKey;
  title: string;
  description?: string;
  mandatoryFields: string[];
  values: Record<string, any>;
  status: "not_started" | "in_progress" | "completed";
  updatedAt: string;
}

export interface SiteFlowSummary {
  siteId: string;
  overallStatus: UnifiedSiteStatus;
  steps: SiteFlowStepData[];
}

// In-memory mock store per site
const store: Record<string, SiteFlowSummary> = {};

const defaultSteps: Omit<SiteFlowStepData, "updatedAt">[] = [
  { id: "create_site", key: "create_site", title: "Create Site", description: "Basic site details", mandatoryFields: ["name", "goLiveDate"], values: {}, status: "completed" },
  { id: "site_study", key: "site_study", title: "Site Study", description: "Assessment & notes", mandatoryFields: ["map", "counters"], values: {}, status: "not_started" },
  { id: "scoping", key: "scoping", title: "Define Scope", description: "Hardware & software", mandatoryFields: ["hardwareList"], values: {}, status: "not_started" },
  { id: "approval", key: "approval", title: "Approval", description: "Stakeholder sign-off", mandatoryFields: ["signedBy"], values: {}, status: "not_started" },
  { id: "procurement", key: "procurement", title: "Procurement", description: "Source hardware", mandatoryFields: ["poNumber"], values: {}, status: "not_started" },
  { id: "deployment", key: "deployment", title: "Deployment", description: "On-site installation", mandatoryFields: ["installDate"], values: {}, status: "not_started" },
  { id: "go_live", key: "go_live", title: "Go Live", description: "Activate site", mandatoryFields: ["handoverDoc"], values: {}, status: "not_started" }
].map(s => ({ ...s, updatedAt: new Date().toISOString() }));

export function initSiteFlow(siteId: string): SiteFlowSummary {
  if (!store[siteId]) {
    store[siteId] = {
      siteId,
      overallStatus: "Created",
      steps: JSON.parse(JSON.stringify(defaultSteps))
    };
  }
  return store[siteId];
}

export function getSiteFlow(siteId: string): SiteFlowSummary {
  return initSiteFlow(siteId);
}

export function getStep(siteId: string, stepKey: SiteFlowStepKey): SiteFlowStepData | undefined {
  const flow = initSiteFlow(siteId);
  return flow.steps.find(s => s.key === stepKey);
}

export function updateStepValues(siteId: string, stepKey: SiteFlowStepKey, values: Record<string, any>, markCompleted: boolean = false): SiteFlowSummary {
  const flow = initSiteFlow(siteId);
  const step = flow.steps.find(s => s.key === stepKey);
  if (!step) return flow;
  step.values = { ...step.values, ...values };
  step.status = markCompleted ? "completed" : "in_progress";
  step.updatedAt = new Date().toISOString();
  // Update overall status loosely based on progression
  const lastCompletedIndex = Math.max(-1, ...flow.steps.map((s, i) => (s.status === "completed" ? i : -1)));
  const statusOrder: UnifiedSiteStatus[] = ["Created", "site_study_done", "scoping_done", "approved", "procurement_done", "deployed", "live"];
  flow.overallStatus = statusOrder[Math.min(lastCompletedIndex + 1, statusOrder.length - 1)] || "Created";
  return flow;
}

export function getEnhancedSteps(flow: SiteFlowSummary): EnhancedStepperStep[] {
  return flow.steps.map((s, idx) => ({
    id: s.id,
    title: s.title,
    description: s.description,
    status: s.status === "completed" ? "completed" : idx === firstIncompleteIndex(flow.steps) ? "current" : "upcoming",
    readOnly: true
  }));
}

function firstIncompleteIndex(steps: SiteFlowStepData[]): number {
  const i = steps.findIndex(s => s.status !== "completed");
  return i === -1 ? steps.length - 1 : i;
}

export function isStepCompletable(step: SiteFlowStepData): boolean {
  return step.mandatoryFields.every(f => {
    const v = step.values?.[f];
    return v !== undefined && v !== null && String(v).trim() !== "";
  });
}



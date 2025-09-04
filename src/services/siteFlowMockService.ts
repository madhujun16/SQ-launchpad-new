import { EnhancedStepperStep } from "@/components/ui/enhanced-stepper";
import { UnifiedSiteStatus } from "@/lib/siteTypes";
import { MapPin, FileText, ClipboardList, CheckSquare, ShoppingCart, Truck, CheckCircle } from 'lucide-react';

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
  {
    id: "create_site",
    key: "create_site",
    title: "Create Site",
    description: "Basic site details",
    mandatoryFields: ["name", "goLiveDate"],
    values: { name: "Demo Site", goLiveDate: "2025-10-01", address: "25 ER Restaurant, London" },
    status: "completed"
  },
  {
    id: "site_study",
    key: "site_study",
    title: "Site Study",
    description: "Assessment & notes",
    mandatoryFields: ["map", "counters"],
    values: {
      address: "25 ER Restaurant, Redditch",
      map: "https://maps.example.com/demo",
      counters: 4,
      latitude: 52.3067,
      longitude: -1.9456,
      photos: [
        "/placeholder.svg",
        "/smartq-launchpad-logo.svg"
      ]
    },
    status: "not_started"
  },
  {
    id: "scoping",
    key: "scoping",
    title: "Define Scope",
    description: "Hardware & software",
    mandatoryFields: ["hardwareList"],
    values: {
      hardwareList: "POS x2, PED x2, Printer x1, Cash Drawer x1",
      breakdown: [
        { item: "ELO POS Terminal", qty: 2, unit: 1250, total: 2500 },
        { item: "PED Verifone", qty: 2, unit: 400, total: 800 },
        { item: "Thermal Printer", qty: 1, unit: 300, total: 300 },
        { item: "Cash Drawer", qty: 1, unit: 150, total: 150 }
      ],
      totalCapex: 3750
    },
    status: "not_started"
  },
  {
    id: "approval",
    key: "approval",
    title: "Approval",
    description: "Stakeholder sign-off",
    mandatoryFields: ["signedBy"],
    values: { signedBy: "Ops Manager", approvedDate: "2025-10-05" },
    status: "not_started"
  },
  {
    id: "procurement",
    key: "procurement",
    title: "Procurement",
    description: "Source hardware",
    mandatoryFields: ["poNumber"],
    values: { poNumber: "PO-12345", vendor: "Melford" },
    status: "not_started"
  },
  {
    id: "deployment",
    key: "deployment",
    title: "Deployment",
    description: "On-site installation",
    mandatoryFields: ["installDate"],
    values: { installDate: "2025-10-10", installer: "SmartQ Team" },
    status: "not_started"
  },
  {
    id: "go_live",
    key: "go_live",
    title: "Go Live",
    description: "Activate site",
    mandatoryFields: ["handoverDoc"],
    values: { handoverDoc: "https://docs.example.com/handover.pdf", goLiveDate: "2025-10-15" },
    status: "not_started"
  }
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
  const iconByKey: Record<string, any> = {
    create_site: MapPin,
    site_study: FileText,
    scoping: ClipboardList,
    approval: CheckSquare,
    procurement: ShoppingCart,
    deployment: Truck,
    go_live: CheckCircle,
  };

  return flow.steps.map((s, idx) => ({
    id: s.id,
    title: s.title,
    description: undefined,
    status: s.status === "completed" ? "completed" : idx === firstIncompleteIndex(flow.steps) ? "current" : "upcoming",
    readOnly: true,
    icon: iconByKey[s.key]
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



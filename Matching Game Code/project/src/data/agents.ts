export interface Agent {
  key: string;
  title: string;
  businessValue: string;
  keyBenefits: string[];
  description: string;
  scenarios: string[];
  technologies: string[];
  industries: string;
  licences: string;
}

export const agents: Agent[] = [
  {
    key: "payment-reconciliation",
    title: "Payment Reconciliation Agent",
    businessValue:
      "Improves confidence by reconciling retail transactions to payment provider statements, highlighting mismatches and exceptions for faster resolution.",
    keyBenefits: [
      "Automated matching and settlement validation",
      "Detects discrepancies, variances, and missing/unprocessed transactions",
      "Configurable reconciliation policies and tolerance rules",
      "Audit-ready output with clear exception lists",
      "Human-in-the-loop review to approve and action exceptions",
    ],
    description:
      "A finance operations agent that ingests settlement files, normalises them into a data store, applies reconciliation policies, and produces a prioritised exception set and reconciliation outputs for review and downstream reporting.",
    scenarios: [
      "Reconcile PSP settlement files vs. retail transactions",
      "Identify fee and payout variances beyond tolerance",
      "Detect orphan / missing transactions",
      "Produce exception worklists for finance operations",
      "Generate audit logs and reconciliation reports",
    ],
    technologies: ["Dynamics 365 Commerce", "Copilot Studio", "Power Apps", "Power Automate"],
    industries: "Retail",
    licences: "Dynamics 365 Commerce, Copilot Studio, Power Apps/Power Automate, Azure services as required",
  },
  {
    key: "store-monitoring",
    title: "Store Monitoring Agent",
    businessValue:
      "A must have for all retailers operating retail POS devices. Provides an autonomous, singular, proactive and conversational control plane for monitoring thousands of retail POS devices, enabling retailers to detect and understand issues before they impact transactions or store operations.",
    keyBenefits: [
      "Centralized visibility across the entire POS fleet from one interface",
      "Early detection of application, hardware, and database issues",
      "Democratized diagnostics for non-technical users (store managers, first-line support)",
      "Reduced escalations and faster root-cause analysis for IT and operations teams",
      "Noise-reduced monitoring: quiet when healthy, explicit when issues emerge",
    ],
    description:
      "A lightweight, AI agent built with Copilot Studio that reasons and analyses POS device telemetry. It analyses logs, metrics, and health signals from Windows-based POS devices and surfaces insights as natural language for Store Managers, First-line Support and IT admins in Microsoft Teams or Microsoft 365 Copilot.",
    scenarios: [
      "Fleet-wide POS health monitoring",
      "Scheduled or autonomous reporting to Teams channels via Agentic flows",
      "Proactive alerting for POS devices, application errors, and hardware failures",
      "Device-level diagnostics (CPU, memory, connectivity, offline SQL DB health)",
      "Cross-device summarization and automated health reports",
    ],
    technologies: ["Dynamics 365 Commerce", "Copilot Studio", "Azure Arc", "Azure Monitor + Log Analytics"],
    industries: "Retail (primary), with applicability to any environment operating distributed device fleets",
    licences: "Dynamics 365 Commerce (POS environment), Azure Log Analytics Workspace, Copilot Studio Credits",
  },
  {
    key: "adaptive-skills",
    title: "Adaptive Skills Policy Agent",
    businessValue:
      "Automates day-to-day BAU ERP operations by executing customer-defined processes and policies with auditable, controlled autonomy – reducing manual effort and improving consistency and compliance.",
    keyBenefits: [
      "Policy-driven, model-first execution with configurable guardrails",
      "Customer-maintained catalogue of approved executable processes",
      "Tool-based integration via the Finance & Operations MCP server",
      "Supports approvals and exception handling for higher-risk actions",
      "Operational logging and traceability for audit and governance",
    ],
    description:
      "A configurable agent that uses an approved set of processes and policies to plan and execute ERP tasks through the Finance & Operations MCP server, while enforcing permissions, approvals, and auditing.",
    scenarios: [
      "Execute routine operational playbooks (e.g., credit holds, replenishment, invoice exception triage)",
      "Monitor for policy breaches and raise tasks for resolution",
      "Run scheduled controls (e.g., period-end checks) and summarise results",
      "Assist operational teams in Teams with guided, policy-aware actions",
      "Orchestrate multi-step ERP processes with human approval where required",
    ],
    technologies: ["Dynamics 365 AI ERP", "Copilot Studio", "Dynamics 365 ERP MCP server", "Power Platform"],
    industries: "Retail (ERP-backed operations), distribution",
    licences: "Dynamics 365 Finance & Operations, Copilot Studio, and required Power Platform services",
  },
  {
    key: "personalization-ui",
    title: "Personalization UI Agent",
    businessValue:
      "Enables store associates to deliver highly personalized in-store experiences by dynamically adapting the Store Commerce App UI to each customer. Surfaces only the most relevant KPIs and insights at the moment of interaction.",
    keyBenefits: [
      "Adaptive Store Commerce App UI based on customer context and insights",
      "Fast access to only the most relevant customer KPIs per interaction",
      "Reduced cognitive load for store associates through focused insights",
      "Improved upsell, cross-sell, and loyalty engagement in-store",
      "Prompt-driven configuration without front-end code changes",
    ],
    description:
      "A custom Azure Foundry–based agent that dynamically changes the Store Commerce App UI based on customer insights, loyalty data, and behavioral signals. It uses AI prompts and data from Dynamics 365 Commerce to surface and recommend KPIs, offers, and insights most relevant in each moment.",
    scenarios: [
      "Personalized KPI display for VIP and loyalty customers",
      "Contextual upsell and cross-sell recommendations in-store",
      "Birthday, loyalty tier, and offer-driven prompts at checkout",
      "Adaptive UI changes based on customer preferences and history",
      "Near real-time personalization during Store Commerce App interactions",
    ],
    technologies: ["Dynamics 365 Commerce", "Azure Foundry", "Power Automate", "Optional: Customer Insights Data"],
    industries: "Retail (primary), especially premium and loyalty-driven store environments",
    licences: "Dynamics 365 Commerce (Store Commerce App, Commerce Scale Unit), AI Foundry, Power Automate",
  },
];

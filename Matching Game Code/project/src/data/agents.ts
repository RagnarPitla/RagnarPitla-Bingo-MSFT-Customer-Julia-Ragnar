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
    key: "bank-account-balance",
    title: "Account Reconciliation Agent",
    businessValue:
      "Helps customers maintain a continuously reconciled state by proactively identifying exceptions, suggesting mitigations, and logging every action for full transparency and financial accuracy.",
    keyBenefits: [
      "Enhanced Efficiency: Customers can maintain a reconciled state more consistently, reducing the time and effort required for manual reconciliation.",
      "Proactive Management: The intelligent agent proactively identifies and suggests mitigations for exceptions, minimizing the risk of errors and ensuring financial accuracy.",
      "Improved Transparency: Every exception is meticulously logged, capturing the history of actions taken by users, automation, or agents, thereby enhancing transparency and accountability.",
      "Regular Reconciliation: The ability to reconcile on a more regular basis ensures that customers' financial records are always up-to-date, leading to better decision-making and financial planning.",
    ],
    description:
      "Helps customers maintain a continuously reconciled state by proactively identifying exceptions, suggesting mitigations, and logging every action for full transparency and financial accuracy.",
    scenarios: [
      "Continuous reconciliation",
      "Identify issues in real time",
      "Close books faster",
      "Focus on planning",
    ],
    technologies: ["Dynamics 365 Finance", "Copilot Studio"],
    industries: "Finance",
    licences: "Dynamics 365 Finance, Copilot Studio",
  },
  {
    key: "vendor-risk-analysis",
    title: "Vendor Risk Analysis Agent",
    businessValue:
      "Identifies high-risk vendors based on unpaid invoices and enforces controls by automatically placing them on hold.",
    keyBenefits: [
      "Automated detection of high-risk vendors",
      "Policy-driven enforcement of credit controls",
      "Fully autonomous workflow with no manual intervention",
      "Built-in stakeholder notifications",
    ],
    description:
      "Identifies high-risk vendors based on unpaid invoices and enforces controls by automatically placing them on hold.",
    scenarios: [
      "Reduced financial exposure from risky vendors",
      "Improved auditability with confirmation tracking",
      "Consistent enforcement of risk policies",
    ],
    technologies: ["Dynamics 365 Finance", "Copilot Studio", "Power Automate"],
    industries: "Finance",
    licences: "Dynamics 365 Finance, Copilot Studio, Power Automate",
  },
  {
    key: "dead-stock",
    title: "Dead Stock Agent",
    businessValue:
      "Analyzes inventory aging to identify excess or obsolete stock and recommend corrective actions to optimize inventory management.",
    keyBenefits: [
      "Reduced dead stock exposure through early detection",
      "Improved inventory turns and warehouse efficiency",
      "Better visibility into carrying costs",
      "Faster response to inventory issues",
    ],
    description:
      "Analyzes inventory aging to identify excess or obsolete stock and recommend corrective actions to optimize inventory management.",
    scenarios: [
      "Lower inventory carrying and storage costs",
      "Reduced risk of write-offs from obsolete stock",
      "Improved capital efficiency tied up in inventory",
      "More data-driven and disciplined inventory decisions",
    ],
    technologies: ["Dynamics 365 Finance", "Dynamics 365 Supply Chain", "Copilot Studio"],
    industries: "Finance, Supply Chain",
    licences: "Dynamics 365 Finance, Dynamics 365 Supply Chain, Copilot Studio",
  },
  {
    key: "cash-collection",
    title: "Cash Collection Agent",
    businessValue:
      "Manages the full dunning and collections process by automating customer outreach, escalation, and tracking within Dynamics 365.",
    keyBenefits: [
      "Automated end-to-end collections lifecycle",
      "Intelligent, stage-based customer communications",
      "Integrated scheduling and call preparation",
      "Full activity tracking and audit trail",
    ],
    description:
      "Manages the full dunning and collections process by automating customer outreach, escalation, and tracking within Dynamics 365.",
    scenarios: [
      "Reduced bad debt through early intervention",
      "Faster cash inflow by reducing payment delays",
      "More consistent and structured escalation process",
      "Audit-ready record of all collection activities",
    ],
    technologies: ["Dynamics 365 Finance", "Copilot Studio", "Power Automate"],
    industries: "Finance",
    licences: "Dynamics 365 Finance, Copilot Studio, Power Automate",
  },
  {
    key: "period-close-execution",
    title: "Period Close Agent",
    businessValue:
      "Automates and orchestrates financial period close tasks in Dynamics 365 by retrieving task lists and executing approved activities.",
    keyBenefits: [
      "Real-time visibility into close tasks and status",
      "Controlled automation using #Agent tagging",
      "Reduced manual coordination across teams",
      "Conversational tracking of close progress",
    ],
    description:
      "Automates and orchestrates financial period close tasks in Dynamics 365 by retrieving task lists and executing approved activities.",
    scenarios: [
      "Faster financial close cycles",
      "Controlled and auditable automation execution",
      "Fewer bottlenecks through proactive task identification",
      "Full audit trail captured in Dynamics 365",
    ],
    technologies: ["Dynamics 365 Finance", "Copilot Studio", "Power Automate"],
    industries: "Finance",
    licences: "Dynamics 365 Finance, Copilot Studio, Power Automate",
  },
];

import { Agent } from "@/data/agents";
import { Check } from "lucide-react";

interface AgentCardProps {
  agent: Agent;
  isSelected: boolean;
  onSelect: () => void;
  selectedBy: { name: string; company: string }[];
}

export function AgentCard({ agent, isSelected, onSelect, selectedBy }: AgentCardProps) {
  return (
    <button
      onClick={onSelect}
      className={`relative w-full text-left rounded-xl border-2 p-6 transition-all duration-300 cursor-pointer group
        ${isSelected
          ? "border-primary card-glow-selected bg-secondary/80"
          : "border-border hover:border-primary/40 hover:card-glow bg-card"
        }`}
    >
      {/* Selected badge */}
      {isSelected && (
        <div className="absolute top-4 right-4 w-8 h-8 rounded-full bg-primary flex items-center justify-center">
          <Check className="w-5 h-5 text-primary-foreground" />
        </div>
      )}

      {/* Title */}
      <h3 className="text-xl font-bold mb-3 pr-10 font-['Space_Grotesk']">{agent.title}</h3>

      {/* Business Value */}
      <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{agent.businessValue}</p>

      {/* Key Benefits */}
      <div className="mb-4">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-primary mb-2">Key Benefits</h4>
        <ul className="space-y-1">
          {agent.keyBenefits.map((b, i) => (
            <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
              <span className="text-primary mt-0.5">✓</span>
              <span>{b}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Technologies */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        {agent.technologies.map((t) => (
          <span key={t} className="text-[10px] px-2 py-1 rounded-md border border-border bg-muted/50 text-muted-foreground">
            {t}
          </span>
        ))}
      </div>

      {/* Scenarios */}
      <div className="mb-4">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-primary mb-2">Scenarios</h4>
        <ul className="space-y-1">
          {agent.scenarios.map((s, i) => (
            <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
              <span className="text-primary mt-0.5">✓</span>
              <span>{s}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Selected by */}
      {selectedBy.length > 0 && (
        <div className="pt-3 border-t border-border">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5">
            Selected by ({selectedBy.length})
          </p>
          <div className="flex flex-wrap gap-1.5">
            {selectedBy.map((p, i) => (
              <span key={i} className="text-[10px] px-2 py-0.5 rounded-full bg-primary/15 text-primary">
                {p.name} · {p.company}
              </span>
            ))}
          </div>
        </div>
      )}
    </button>
  );
}

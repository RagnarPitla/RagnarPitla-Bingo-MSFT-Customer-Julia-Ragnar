import { Agent } from "@/data/agents";
import { Check } from "lucide-react";

interface RevealedCardProps {
  agent: Agent;
  isSelected: boolean;
  onSelect?: () => void;
  onDismiss?: () => void;
  selectedBy: { name: string; company: string }[];
}

export function RevealedCard({ agent, isSelected, onSelect, onDismiss, selectedBy }: RevealedCardProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
      {/* Backdrop - subtle so the table is still visible */}
      <div className="absolute inset-0 bg-background/60 backdrop-blur-sm pointer-events-auto" />

      {/* Card */}
      <div
        className="relative w-[90vw] max-w-lg max-h-[85vh] overflow-y-auto rounded-xl border-2 p-5 md:p-6 pointer-events-auto animate-scale-in"
        style={{
          background: "linear-gradient(135deg, hsl(222, 40%, 14%), hsl(222, 40%, 10%))",
          borderColor: isSelected ? "hsl(160, 60%, 45%)" : "hsl(300, 60%, 60%)",
          boxShadow: isSelected
            ? "0 0 40px hsl(160, 60%, 45%, 0.4), 0 20px 60px hsl(0, 0%, 0%, 0.5)"
            : "0 0 40px hsl(300, 60%, 60%, 0.3), 0 20px 60px hsl(0, 0%, 0%, 0.5)",
        }}
      >
        {/* Selected badge */}
        {isSelected && (
          <div className="absolute top-4 right-4 w-8 h-8 rounded-full bg-[hsl(160,60%,45%)] flex items-center justify-center">
            <Check className="w-5 h-5 text-background" />
          </div>
        )}

        {/* Title */}
        <h3 className="text-xl md:text-2xl font-bold mb-3 pr-10 font-['Space_Grotesk'] text-foreground">
          {agent.title}
        </h3>

        {/* Business Value */}
        <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{agent.businessValue}</p>

        {/* Key Benefits */}
        <div className="mb-4">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-primary mb-2">Key Benefits</h4>
          <ul className="space-y-1.5">
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
          <ul className="space-y-1.5">
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
          <div className="pt-3 border-t border-border mb-4">
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

        {/* Select button - only for players */}
        {onSelect ? (
          <button
            onClick={onSelect}
            className="w-full py-2.5 rounded-lg text-sm font-semibold transition-all"
            style={{
              background: isSelected
                ? "linear-gradient(135deg, hsl(160, 60%, 45%), hsl(160, 40%, 35%))"
                : "linear-gradient(135deg, hsl(300, 60%, 60%), hsl(300, 40%, 45%))",
              color: "hsl(222, 47%, 8%)",
              boxShadow: isSelected
                ? "0 4px 15px hsl(160, 60%, 45%, 0.3)"
                : "0 4px 15px hsl(300, 60%, 60%, 0.3)",
            }}
          >
            {isSelected ? "✓ Selected — Tap to Deselect" : "Select This Agent"}
          </button>
        ) : (
          <div className="space-y-2">
            <p className="text-center text-xs text-muted-foreground">
              You are the Dealer — players will select this card
            </p>
            {onDismiss && (
              <button
                onClick={onDismiss}
                className="w-full py-2.5 rounded-lg text-sm font-semibold transition-all border border-border text-muted-foreground hover:text-foreground hover:border-primary/50"
                style={{ background: "hsl(222, 40%, 12%)" }}
              >
                ✕ Return Card to Deck
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

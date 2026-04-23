import { useState, useEffect, useRef } from "react";
import * as gameApi from "@/lib/gameApi";
import { getAgentColor } from "@/data/agentColors";
import { agents } from "@/data/agents";
import { AnimatedPerson } from "@/components/AnimatedPerson";
import { CardDeck } from "@/components/CardDeck";
import { RevealedCard } from "@/components/RevealedCard";
import { useToast } from "@/hooks/use-toast";
import { exportSelectionsToExcel } from "@/utils/exportSelections";

interface Participant {
  id: string;
  name: string;
  company: string;
  role: "dealer" | "player";
}

interface PokerTableProps {
  participant: Participant;
  onRestart?: () => void;
}

interface SelectionWithInfo {
  participant_id: string;
  agent_key: string;
  name: string;
  company: string;
}

export function PokerTable({ participant, onRestart }: PokerTableProps) {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [selections, setSelections] = useState<SelectionWithInfo[]>([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(-1);
  const [gameStateId] = useState("state");
  const [showCard, setShowCard] = useState(false);
  const [viewingAgent, setViewingAgent] = useState<typeof agents[number] | null>(null);
  const [showRestartConfirm, setShowRestartConfirm] = useState(false);
  const lastCardIndexRef = useRef(-2);
  const lastReviewingKeyRef = useRef<string | null | undefined>(undefined);
  const { toast } = useToast();

  const isDealer = participant.role === "dealer";
  const mySelections = selections.filter((s) => s.participant_id === participant.id).map((s) => s.agent_key);
  const currentAgent = currentCardIndex >= 0 && currentCardIndex < agents.length ? agents[currentCardIndex] : null;
  const allDealt = currentCardIndex >= agents.length - 1;

  const fetchAll = async () => {
    try {
      const [parts, sels, gs] = await Promise.all([
        gameApi.participants.list(),
        gameApi.selections.list(),
        gameApi.gameState.get(),
      ]);

      setParticipants(parts.map(p => ({ ...p, role: p.role as "dealer" | "player" })));

      const newIndex = gs.current_card_index;
      const prevIndex = lastCardIndexRef.current;
      if (prevIndex !== -2 && newIndex !== prevIndex && newIndex >= 0) {
        setShowCard(true);
      }
      lastCardIndexRef.current = newIndex;
      setCurrentCardIndex(newIndex);

      // Reviewing card key — broadcast replacement via polled game state
      const newReviewingKey = gs.reviewing_card_key || null;
      const prevReviewingKey = lastReviewingKeyRef.current;
      if (!isDealer && prevReviewingKey !== undefined && newReviewingKey !== prevReviewingKey) {
        if (newReviewingKey) {
          const agent = agents.find(a => a.key === newReviewingKey);
          if (agent) setViewingAgent(agent);
        } else {
          setViewingAgent(null);
        }
      }
      lastReviewingKeyRef.current = newReviewingKey;

      const enriched = sels.map((s) => {
        const p = parts.find((p) => p.id === s.participant_id);
        return { ...s, name: p?.name ?? "Unknown", company: p?.company ?? "" };
      });
      setSelections(enriched);
    } catch (err) {
      console.error("fetchAll error:", err);
    }
  };

  useEffect(() => {
    fetchAll();
    const poll = setInterval(fetchAll, 3000);
    return () => clearInterval(poll);
  }, [participant.id]);

  const handleFlipNext = async () => {
    const next = currentCardIndex + 1;
    if (next >= agents.length) return;
    await gameApi.gameState.update({ current_card_index: next });
    setCurrentCardIndex(next);
    setShowCard(true);
  };

  const handleSelectCard = async (agentKey: string) => {
    const alreadySelected = mySelections.includes(agentKey);
    if (alreadySelected) {
      await gameApi.selections.delete(participant.id, agentKey);
      toast({ title: "Card deselected" });
      return;
    }
    await gameApi.selections.create({ participant_id: participant.id, agent_key: agentKey });
    const agent = agents.find((a) => a.key === agentKey);
    toast({ title: "Card selected!", description: `You chose: ${agent?.title}` });
    setShowCard(false);
  };

  const handleRestart = async () => {
    await gameApi.resetGame();
    setShowCard(false);
    setViewingAgent(null);
    lastCardIndexRef.current = -2;
    lastReviewingKeyRef.current = undefined;
    toast({ title: "Game restarted!", description: "All users cleared and cards returned to the deck." });
    onRestart?.();
  };

  const handleDealerReviewCard = async (agent: typeof agents[number]) => {
    setViewingAgent(agent);
    await gameApi.gameState.update({ reviewing_card_key: agent.key });
  };

  const handleCloseReview = async () => {
    setViewingAgent(null);
    await gameApi.gameState.update({ reviewing_card_key: null });
  };

  const cardTitles = Object.fromEntries(agents.map((a) => [a.key, a.title]));

  const selectionsForExport = selections.map(s => ({
    participant_id: s.participant_id,
    agent_key: s.agent_key,
    name: s.name,
    company: s.company,
  }));

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-4 overflow-hidden relative"
      style={{
        backgroundImage: `url('${import.meta.env.BASE_URL}images/casino-bg.png')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="absolute inset-0 bg-black/60 pointer-events-none" />

      {/* Header */}
      <div className="text-center mb-4 z-30">
        <img
          src={`${import.meta.env.BASE_URL}images/casino-sign.png`}
          alt="Dynamics Agents"
          className="mx-auto h-36 md:h-48 w-auto drop-shadow-2xl animate-sign-glow"
        />
        <p className="text-[10px] md:text-xs text-muted-foreground">
          Playing as <span className="text-foreground font-medium">{participant.name}</span> · {participant.company}
        </p>
        <div className="flex items-center gap-3 mt-1">
          <button
            onClick={() => exportSelectionsToExcel(selectionsForExport)}
            className="text-xs px-4 py-1.5 rounded-full bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors shadow-md"
          >
            📊 Export
          </button>
          <button
            onClick={() => setShowRestartConfirm(true)}
            className="text-xs px-4 py-1.5 rounded-full bg-destructive text-destructive-foreground font-medium hover:bg-destructive/90 transition-colors shadow-md"
          >
            🔄 Restart Game
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="relative w-full max-w-3xl aspect-square md:aspect-[4/3]">
        <div
          className="absolute inset-[8%] rounded-[50%] border-4"
          style={{
            background: "radial-gradient(ellipse at center, hsl(120, 50%, 30%), hsl(120, 45%, 22%), hsl(120, 40%, 14%))",
            borderColor: "hsl(30, 50%, 25%)",
            boxShadow: "inset 0 0 60px hsl(150, 30%, 8%), 0 0 40px hsl(0, 0%, 0%, 0.5), 0 10px 30px hsl(0, 0%, 0%, 0.3)",
          }}
        >
          <div
            className="absolute inset-0 rounded-[50%] opacity-10"
            style={{
              backgroundImage: "repeating-linear-gradient(45deg, transparent, transparent 10px, hsl(150, 40%, 30%) 10px, hsl(150, 40%, 30%) 11px)",
            }}
          />
        </div>
        <div
          className="absolute inset-[6%] rounded-[50%] border-8 pointer-events-none"
          style={{ borderColor: "hsl(30, 40%, 20%)", boxShadow: "inset 0 2px 8px hsl(30, 50%, 30%, 0.3)" }}
        />
        <CardDeck currentCardIndex={currentCardIndex} onFlipNext={handleFlipNext} canFlip={isDealer} />
        {[...participants].sort((a, b) => (a.role === "dealer" ? -1 : b.role === "dealer" ? 1 : 0)).map((p, i) => (
          <AnimatedPerson
            key={p.id}
            name={p.name}
            company={p.company}
            index={i}
            total={participants.length}
            isCurrentUser={p.id === participant.id}
            selectedCards={selections.filter((s) => s.participant_id === p.id).map((s) => s.agent_key)}
            cardTitles={cardTitles}
            role={p.role}
          />
        ))}
      </div>

      {/* Current card overlay */}
      {showCard && currentAgent && (
        <RevealedCard
          agent={currentAgent}
          isSelected={mySelections.includes(currentAgent.key)}
          onSelect={isDealer ? undefined : () => handleSelectCard(currentAgent.key)}
          onSkip={isDealer ? undefined : () => setShowCard(false)}
          onDismiss={isDealer ? () => setShowCard(false) : undefined}
          selectedBy={selections.filter((s) => s.agent_key === currentAgent.key).map((s) => ({ name: s.name, company: s.company }))}
        />
      )}

      {/* Reviewing a past card */}
      {viewingAgent && !showCard && (
        <RevealedCard
          agent={viewingAgent}
          isSelected={mySelections.includes(viewingAgent.key)}
          onSelect={isDealer ? undefined : () => handleSelectCard(viewingAgent.key)}
          onDismiss={isDealer ? handleCloseReview : () => setViewingAgent(null)}
          selectedBy={selections.filter((s) => s.agent_key === viewingAgent.key).map((s) => ({ name: s.name, company: s.company }))}
        />
      )}

      {/* Agent legend */}
      {currentCardIndex >= 0 && (
        <div className="z-30 mt-4 w-full max-w-lg">
          <div className="bg-black/40 border border-white/10 rounded-xl p-4 backdrop-blur-sm">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-primary mb-2">Card Legend</h3>
            <div className="flex flex-col gap-1.5">
              {agents.slice(0, currentCardIndex + 1).map((agent, i) => (
                <div key={agent.key} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: getAgentColor(i) }} />
                  <span className="text-xs text-muted-foreground">{agent.title}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* How to Play */}
      <div className="z-30 mt-4 w-full max-w-lg">
        <div className="bg-black/40 border border-white/10 rounded-xl p-4 backdrop-blur-sm">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-primary mb-2">How to Play</h3>
          <ol className="space-y-1 text-xs text-muted-foreground list-decimal list-inside">
            <li>The dealer flips a card from the deck</li>
            <li>The group discusses the details shown on the card</li>
            <li>Each player selects or skips the card</li>
            <li>Once all cards have been dealt, the dealer can flip any card again for further discussion</li>
          </ol>
        </div>
      </div>

      {/* Played cards — dealer only */}
      {isDealer && currentCardIndex >= 0 && (
        <div className="z-30 mt-4 flex flex-col items-center gap-2">
          <p className="text-[10px] text-muted-foreground">Played Cards — tap to flip again</p>
          <div className="flex gap-2 flex-wrap justify-center">
            {agents.slice(0, currentCardIndex + 1).map((agent) => {
              const selected = mySelections.includes(agent.key);
              return (
                <button
                  key={agent.key}
                  onClick={() => handleDealerReviewCard(agent)}
                  className="relative w-16 h-22 md:w-20 md:h-28 rounded-md border-2 shadow-lg hover:scale-110 transition-transform overflow-hidden"
                  style={{
                    background: selected ? "linear-gradient(135deg, hsl(300, 60%, 40%), hsl(300, 50%, 25%))" : "linear-gradient(135deg, hsl(0, 70%, 45%), hsl(0, 60%, 30%))",
                    borderColor: selected ? "hsl(300, 60%, 60%)" : "rgba(255,255,255,0.8)",
                    boxShadow: selected ? "0 0 12px hsl(300, 60%, 60%, 0.5)" : "0 4px 12px rgba(0,0,0,0.4)",
                  }}
                  title={agent.title}
                >
                  <div className="absolute inset-[2px] rounded-sm border border-white/30" />
                  <div className="relative flex flex-col items-center justify-center h-full z-10 px-1">
                    <span className="text-[7px] md:text-[8px] font-bold text-white/90 leading-tight text-center font-['Space_Grotesk']">
                      {agent.title.replace(" Agent", "")}
                    </span>
                    {selected && <span className="text-[6px] text-green-300 mt-0.5 font-semibold">✓ selected</span>}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Restart confirmation */}
      {showRestartConfirm && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/70" onClick={() => setShowRestartConfirm(false)} />
          <div className="relative bg-card border border-border rounded-xl p-6 max-w-sm w-full mx-4 shadow-2xl">
            <h3 className="text-lg font-semibold text-foreground mb-2">Restart Game?</h3>
            <p className="text-sm text-muted-foreground mb-6">
              This will clear all participants and selections and return all cards to the deck.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowRestartConfirm(false)}
                className="flex-1 py-2.5 rounded-lg border border-border text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => { setShowRestartConfirm(false); handleRestart(); }}
                className="flex-1 py-2.5 rounded-lg bg-destructive text-destructive-foreground text-sm font-semibold hover:bg-destructive/90 transition-colors"
              >
                Yes, Restart
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

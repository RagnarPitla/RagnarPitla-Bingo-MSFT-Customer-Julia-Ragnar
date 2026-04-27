import { useState, useEffect, useRef } from "react";
import * as gameApi from "@/lib/gameApi";
import { agents } from "@/data/agents";
import { AnimatedPerson } from "@/components/AnimatedPerson";
import { CardDeck } from "@/components/CardDeck";
import { RevealedCard } from "@/components/RevealedCard";
import { useToast } from "@/hooks/use-toast";
import { exportSelectionsToExcel } from "@/utils/exportSelections";
import { getAgentColor } from "@/data/agentColors";

interface Participant {
  id: string;
  name: string;
  company: string;
  role: "dealer" | "player";
  created_at: string;
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
  const [showCard, setShowCard] = useState(false);
  const [viewingAgent, setViewingAgent] = useState<typeof agents[number] | null>(null);
  const [showRestartConfirm, setShowRestartConfirm] = useState(false);
  const lastCardIndexRef = useRef(-2);
  const lastReviewingKeyRef = useRef<string | null | undefined>(undefined);
  const { toast } = useToast();

  const isDealer = participant.role === "dealer";
  const mySelections = selections.filter((s) => s.participant_id === participant.id).map((s) => s.agent_key);
  const currentAgent = currentCardIndex >= 0 && currentCardIndex < agents.length ? agents[currentCardIndex] : null;

  const dealer = participants.find(p => p.role === "dealer");
  const players = participants
    .filter(p => p.role === "player")
    .sort((a, b) => a.created_at.localeCompare(b.created_at));
  const allParticipantsSorted = dealer ? [dealer, ...players] : players;

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
      // Show card on initial join if game is already in progress,
      // or whenever the dealer advances to a new card
      if (newIndex >= 0 && (prevIndex === -2 || newIndex !== prevIndex)) setShowCard(true);
      lastCardIndexRef.current = newIndex;
      setCurrentCardIndex(newIndex);

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
        const p = parts.find(p => p.id === s.participant_id);
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
    const agent = agents.find(a => a.key === agentKey);
    toast({ title: "Card selected!", description: `You chose: ${agent?.title}` });
    setShowCard(false);
  };

  const handleRestart = async () => {
    await gameApi.resetGame();
    setShowCard(false);
    setViewingAgent(null);
    lastCardIndexRef.current = -2;
    lastReviewingKeyRef.current = undefined;
    toast({ title: "Game restarted!" });
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

  const cardTitles = Object.fromEntries(agents.map(a => [a.key, a.title]));
  const selectionsForExport = selections.map(s => ({ participant_id: s.participant_id, agent_key: s.agent_key, name: s.name, company: s.company }));

  return (
    <div
      className="min-h-screen flex flex-col overflow-hidden"
      style={{
        backgroundImage: `url('${import.meta.env.BASE_URL}images/dating-game-background.png')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/50 pointer-events-none" />

      {/* ── TITLE ── */}
      <div className="relative z-30 flex flex-col items-center pt-6 pb-2">
        <h1
          style={{
            fontFamily: "'Fredoka One', 'Arial Black', sans-serif",
            fontSize: "clamp(2.2rem, 7vw, 4.5rem)",
            color: "#c4521a",
            fontStyle: "italic",
            textShadow: "2px 2px 0 #8b3210, 4px 4px 0 #6b2208, 6px 6px 0 rgba(0,0,0,0.35)",
            WebkitTextStroke: "1px #8b3210",
            letterSpacing: "0.04em",
            lineHeight: 1,
            textAlign: "center",
          }}
        >
          DYNAMICS AGENTS
        </h1>

        {/* Controls */}
        <div className="flex items-center gap-3 mt-2">
          <p className="text-[10px] text-white/70">
            Playing as <span className="text-white font-medium">{participant.name}</span> · {participant.company}
          </p>
          {isDealer && (
            <button onClick={() => exportSelectionsToExcel(selectionsForExport)}
              className="text-xs px-3 py-1 rounded-full bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors">
              📊 Export
            </button>
          )}
          {isDealer && (
            <button onClick={() => setShowRestartConfirm(true)}
              className="text-xs px-3 py-1 rounded-full bg-destructive text-destructive-foreground font-medium hover:bg-destructive/90 transition-colors">
              🔄 Restart
            </button>
          )}
        </div>
      </div>

      {/* ── MAIN GAME FLOOR ── */}
      <div className="relative z-10 flex-1 flex items-end px-4 md:px-8 pb-4 gap-6 overflow-x-auto">

        {/* LEFT: Dealer + Card Deck */}
        <div className="flex items-end gap-4 flex-shrink-0">
          {/* Dealer avatar */}
          {dealer && (
            <div className="flex flex-col items-center">
              <p className="text-[9px] uppercase tracking-widest text-white/60 mb-1 font-semibold">Host</p>
              <AnimatedPerson
                name={dealer.name}
                company={dealer.company}
                index={0}
                isCurrentUser={dealer.id === participant.id}
                selectedCards={selections.filter(s => s.participant_id === dealer.id).map(s => s.agent_key)}
                cardTitles={cardTitles}
                role="dealer"
              />
            </div>
          )}

          {/* Card deck */}
          <div className="flex flex-col items-center justify-end pb-14">
            <CardDeck currentCardIndex={currentCardIndex} onFlipNext={handleFlipNext} canFlip={isDealer} />
          </div>
        </div>

        {/* Divider */}
        <div className="self-stretch w-px bg-white/20 flex-shrink-0 mb-14" />

        {/* CENTER/RIGHT: Players on stools */}
        <div className="flex items-end gap-4 flex-1 flex-wrap">
          {players.length === 0 && (
            <p className="text-white/40 text-sm italic pb-16 pl-4">Waiting for participants to join…</p>
          )}
          {players.map((p, i) => (
            <AnimatedPerson
              key={p.id}
              name={p.name}
              company={p.company}
              index={i + 1}
              isCurrentUser={p.id === participant.id}
              selectedCards={selections.filter(s => s.participant_id === p.id).map(s => s.agent_key)}
              cardTitles={cardTitles}
              role="player"
            />
          ))}
        </div>
      </div>

      {/* ── BOTTOM PANELS ── */}
      <div className="relative z-20 flex flex-wrap gap-3 px-4 md:px-8 pb-4">

        {/* Card legend */}
        {currentCardIndex >= 0 && (
          <div className="bg-black/50 border border-white/10 rounded-xl p-3 backdrop-blur-sm min-w-[180px]">
            <h3 className="text-[10px] font-semibold uppercase tracking-wider text-primary mb-1.5">Card Legend</h3>
            <div className="flex flex-col gap-1">
              {agents.slice(0, currentCardIndex + 1).map((agent, i) => (
                <div key={agent.key} className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: getAgentColor(i) }} />
                  <span className="text-[10px] text-muted-foreground">{agent.title}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* How to Play */}
        <div className="bg-black/50 border border-white/10 rounded-xl p-3 backdrop-blur-sm flex-1 min-w-[220px]">
          <h3 className="text-[10px] font-semibold uppercase tracking-wider text-primary mb-1.5">How to Play</h3>
          <ol className="space-y-0.5 text-[10px] text-muted-foreground list-decimal list-inside">
            <li>The host flips a card from the deck</li>
            <li>The group discusses the agent shown</li>
            <li>Each player selects or skips the card</li>
            <li>The host can flip any past card again for discussion</li>
          </ol>
        </div>

        {/* Played cards — host only */}
        {isDealer && currentCardIndex >= 0 && (
          <div className="bg-black/50 border border-white/10 rounded-xl p-3 backdrop-blur-sm">
            <h3 className="text-[10px] font-semibold uppercase tracking-wider text-primary mb-1.5">Played Cards</h3>
            <div className="flex gap-1.5 flex-wrap">
              {agents.slice(0, currentCardIndex + 1).map((agent) => (
                <button
                  key={agent.key}
                  onClick={() => handleDealerReviewCard(agent)}
                  className="relative w-12 h-16 rounded border-2 shadow hover:scale-110 transition-transform overflow-hidden"
                  style={{
                    background: "linear-gradient(135deg, hsl(0, 70%, 45%), hsl(0, 60%, 30%))",
                    borderColor: mySelections.includes(agent.key) ? "hsl(300, 60%, 60%)" : "rgba(255,255,255,0.7)",
                  }}
                  title={agent.title}
                >
                  <div className="absolute inset-[2px] rounded-sm border border-white/20" />
                  <div className="relative flex items-center justify-center h-full z-10 px-0.5">
                    <span className="text-[6px] font-bold text-white/90 leading-tight text-center">
                      {agent.title.replace(" Agent", "")}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── OVERLAYS ── */}

      {showCard && currentAgent && (
        <RevealedCard
          agent={currentAgent}
          isSelected={mySelections.includes(currentAgent.key)}
          onSelect={isDealer ? undefined : () => handleSelectCard(currentAgent.key)}
          onSkip={isDealer ? undefined : () => setShowCard(false)}
          onDismiss={isDealer ? () => setShowCard(false) : undefined}
          selectedBy={selections.filter(s => s.agent_key === currentAgent.key).map(s => ({ name: s.name, company: s.company }))}
        />
      )}

      {viewingAgent && !showCard && (
        <RevealedCard
          agent={viewingAgent}
          isSelected={mySelections.includes(viewingAgent.key)}
          onSelect={isDealer ? undefined : () => handleSelectCard(viewingAgent.key)}
          onDismiss={isDealer ? handleCloseReview : () => setViewingAgent(null)}
          selectedBy={selections.filter(s => s.agent_key === viewingAgent.key).map(s => ({ name: s.name, company: s.company }))}
        />
      )}

      {showRestartConfirm && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/70" onClick={() => setShowRestartConfirm(false)} />
          <div className="relative bg-card border border-border rounded-xl p-6 max-w-sm w-full mx-4 shadow-2xl">
            <h3 className="text-lg font-semibold mb-2">Restart Game?</h3>
            <p className="text-sm text-muted-foreground mb-6">This will clear all participants and selections and return all cards to the deck.</p>
            <div className="flex gap-3">
              <button onClick={() => setShowRestartConfirm(false)}
                className="flex-1 py-2.5 rounded-lg border border-border text-sm text-muted-foreground hover:text-foreground transition-colors">
                Cancel
              </button>
              <button onClick={() => { setShowRestartConfirm(false); handleRestart(); }}
                className="flex-1 py-2.5 rounded-lg bg-destructive text-destructive-foreground text-sm font-semibold hover:bg-destructive/90 transition-colors">
                Yes, Restart
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

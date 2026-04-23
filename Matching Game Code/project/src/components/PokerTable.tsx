import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { agents } from "@/data/agents";
import { AnimatedPerson } from "@/components/AnimatedPerson";
import { CardDeck } from "@/components/CardDeck";
import { RevealedCard } from "@/components/RevealedCard";
import { useToast } from "@/hooks/use-toast";
import { exportSelectionsToExcel } from "@/utils/exportSelections";
import { getAgentColor } from "@/data/agentColors";
import { DynamicsSign } from "@/components/DynamicsSign";

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
  const [gameStateId, setGameStateId] = useState<string | null>(null);
  const [showCard, setShowCard] = useState(false);
  const [viewingAgent, setViewingAgent] = useState<typeof agents[number] | null>(null);
  const [showRestartConfirm, setShowRestartConfirm] = useState(false);
  const lastCardIndexRef = useRef(-2); // -2 = not yet initialised
  const broadcastChannelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const { toast } = useToast();

  const isDealer = participant.role === "dealer";
  const mySelections = selections.filter((s) => s.participant_id === participant.id).map((s) => s.agent_key);
  const currentAgent = currentCardIndex >= 0 && currentCardIndex < agents.length ? agents[currentCardIndex] : null;
  const allDealt = currentCardIndex >= agents.length - 1;

  const fetchAll = async () => {
    const [{ data: parts }, { data: sels }, { data: gs }] = await Promise.all([
      supabase.from("participants").select("id, name, company, role"),
      supabase.from("selections").select("participant_id, agent_key"),
      supabase.from("game_state").select("*").limit(1).single(),
    ]);

    if (parts) setParticipants(parts.map(p => ({ ...p, role: p.role as "dealer" | "player" })));
    if (gs) {
      const prevIndex = lastCardIndexRef.current;
      const newIndex = gs.current_card_index;
      // Only show card overlay when the index actually advances (not on initial load)
      if (prevIndex !== -2 && newIndex !== prevIndex && newIndex >= 0) {
        setShowCard(true);
      }
      lastCardIndexRef.current = newIndex;
      setCurrentCardIndex(newIndex);
      setGameStateId(gs.id);
    }
    if (sels && parts) {
      const enriched = sels.map((s) => {
        const p = parts.find((p) => p.id === s.participant_id);
        return { ...s, name: p?.name ?? "Unknown", company: p?.company ?? "" };
      });
      setSelections(enriched);
    }
  };

  useEffect(() => {
    fetchAll();

    // Poll every 3 seconds so participants always see new joiners
    // even if the realtime subscription misses an event
    const poll = setInterval(fetchAll, 3000);

    const ch1 = supabase
      .channel("table-selections")
      .on("postgres_changes", { event: "*", schema: "public", table: "selections" }, fetchAll)
      .subscribe();
    const ch2 = supabase
      .channel("table-participants")
      .on("postgres_changes", { event: "*", schema: "public", table: "participants" }, fetchAll)
      .subscribe();
    const ch3 = supabase
      .channel("table-gamestate")
      .on("postgres_changes", { event: "*", schema: "public", table: "game_state" }, fetchAll)
      .subscribe();

    // Broadcast channel — dealer opens/closes past cards for everyone
    const broadcastCh = supabase
      .channel("game-review-broadcast")
      .on("broadcast", { event: "review-card" }, ({ payload }) => {
        if (!isDealer) {
          const agent = agents.find(a => a.key === payload.agentKey);
          if (agent) setViewingAgent(agent);
        }
      })
      .on("broadcast", { event: "close-review" }, () => {
        setViewingAgent(null);
      })
      .subscribe();
    broadcastChannelRef.current = broadcastCh;

    return () => {
      clearInterval(poll);
      supabase.removeChannel(ch1);
      supabase.removeChannel(ch2);
      supabase.removeChannel(ch3);
      supabase.removeChannel(broadcastCh);
    };
  }, [participant.id]);

  const handleFlipNext = async () => {
    if (!gameStateId) return;
    const next = currentCardIndex + 1;
    if (next >= agents.length) return;
    await supabase.from("game_state").update({ current_card_index: next }).eq("id", gameStateId);
    setCurrentCardIndex(next);
    setShowCard(true);
  };

  const handleSelectCard = async (agentKey: string) => {
    const alreadySelected = mySelections.includes(agentKey);

    if (alreadySelected) {
      await supabase
        .from("selections")
        .delete()
        .eq("participant_id", participant.id)
        .eq("agent_key", agentKey);
      toast({ title: "Card deselected" });
      return;
    }

    await supabase
      .from("selections")
      .insert({ participant_id: participant.id, agent_key: agentKey });

    const agent = agents.find((a) => a.key === agentKey);
    toast({ title: "Card selected!", description: `You chose: ${agent?.title}` });
    setShowCard(false);
  };

  const handleRestart = async () => {
    if (gameStateId) {
      await Promise.all([
        supabase.from("selections").delete().neq("id", "00000000-0000-0000-0000-000000000000"),
        supabase.from("participants").delete().neq("id", "00000000-0000-0000-0000-000000000000"),
        supabase.from("game_state").update({ current_card_index: -1 }).eq("id", gameStateId),
      ]);
    }
    setShowCard(false);
    toast({ title: "Game restarted!", description: "All users cleared and cards returned to the deck." });
    onRestart?.();
  };

  const handleDealerReviewCard = async (agent: typeof agents[number]) => {
    setViewingAgent(agent);
    await broadcastChannelRef.current?.send({
      type: "broadcast",
      event: "review-card",
      payload: { agentKey: agent.key },
    });
  };

  const handleCloseReview = async () => {
    setViewingAgent(null);
    await broadcastChannelRef.current?.send({
      type: "broadcast",
      event: "close-review",
      payload: {},
    });
  };

  const cardTitles = Object.fromEntries(agents.map((a) => [a.key, a.title]));
  const dealerParticipant = participants.find((p) => p.role === "dealer") ?? null;
  const players = participants.filter((p) => p.role === "player");
  const totalPeople = (dealerParticipant ? 1 : 0) + players.length;
  const personScale = totalPeople <= 5 ? 1 : totalPeople <= 8 ? 0.85 : 0.72;
  const stageGap = totalPeople <= 5 ? "gap-6" : totalPeople <= 8 ? "gap-4" : "gap-3";

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-4 overflow-hidden relative"
      style={{
        backgroundImage: `url('${import.meta.env.BASE_URL}images/dating game background.png')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      {/* Dark overlay to mute background */}
      <div className="absolute inset-0 bg-black/60 pointer-events-none" />
      {/* Header */}
      <div className="text-center mb-4 z-30">
        <DynamicsSign className="mx-auto mb-1" />
        <p className="text-[10px] md:text-xs text-muted-foreground">
          Playing as <span className="text-foreground font-medium">{participant.name}</span> · {participant.company}
        </p>
        <div className="flex items-center gap-3 mt-1">
          <button
            onClick={() => exportSelectionsToExcel(selections)}
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

      {/* Stage */}
      <div className="relative w-full z-20">
        {/* Stage floor */}
        <div
          className="absolute bottom-0 left-0 right-0 h-14"
          style={{
            background: "linear-gradient(to bottom, hsl(0,0%,14%), hsl(0,0%,9%))",
            borderTop: "2px solid hsl(0,0%,28%)",
            boxShadow: "0 -6px 24px rgba(0,0,0,0.6)",
          }}
        />
        {/* Characters + deck row */}
        <div className={`relative flex flex-row items-end ${stageGap} px-6 md:px-10 pb-12 overflow-x-auto`}>
          {/* Dealer — far left */}
          {dealerParticipant && (
            <AnimatedPerson
              key={dealerParticipant.id}
              name={dealerParticipant.name}
              company={dealerParticipant.company}
              index={0}
              isCurrentUser={dealerParticipant.id === participant.id}
              selectedCards={selections.filter((s) => s.participant_id === dealerParticipant.id).map((s) => s.agent_key)}
              cardTitles={cardTitles}
              role="dealer"
              scale={personScale}
            />
          )}
          {/* Card deck */}
          <div className="flex-shrink-0 pb-2 flex flex-col items-center">
            <CardDeck currentCardIndex={currentCardIndex} onFlipNext={handleFlipNext} canFlip={isDealer} />
          </div>
          {/* Players */}
          {players.map((p, i) => (
            <AnimatedPerson
              key={p.id}
              name={p.name}
              company={p.company}
              index={i + 1}
              isCurrentUser={p.id === participant.id}
              selectedCards={selections.filter((s) => s.participant_id === p.id).map((s) => s.agent_key)}
              cardTitles={cardTitles}
              role="player"
              scale={personScale}
            />
          ))}
        </div>
      </div>

      {/* Revealed card overlay */}
      {showCard && currentAgent && (
        <RevealedCard
          agent={currentAgent}
          isSelected={mySelections.includes(currentAgent.key)}
          onSelect={isDealer ? undefined : () => handleSelectCard(currentAgent.key)}
          onSkip={isDealer ? undefined : () => setShowCard(false)}
          onDismiss={isDealer ? () => setShowCard(false) : undefined}
          selectedBy={selections
            .filter((s) => s.agent_key === currentAgent.key)
            .map((s) => ({ name: s.name, company: s.company }))}
        />
      )}

      {/* Viewing a past card — broadcast by dealer, visible to all */}
      {viewingAgent && !showCard && (
        <RevealedCard
          agent={viewingAgent}
          isSelected={mySelections.includes(viewingAgent.key)}
          onSelect={isDealer ? undefined : () => handleSelectCard(viewingAgent.key)}
          onDismiss={isDealer ? handleCloseReview : () => setViewingAgent(null)}
          selectedBy={selections
            .filter((s) => s.agent_key === viewingAgent.key)
            .map((s) => ({ name: s.name, company: s.company }))}
        />
      )}

      {/* Agent colour legend — builds as cards are flipped */}
      {currentCardIndex >= 0 && (
        <div className="z-30 mt-4 w-full max-w-lg">
          <div className="bg-black/40 border border-white/10 rounded-xl p-4 backdrop-blur-sm">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-primary mb-2">Card Legend</h3>
            <div className="flex flex-col gap-1.5">
              {agents.slice(0, currentCardIndex + 1).map((agent, i) => (
                <div key={agent.key} className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ background: getAgentColor(i) }}
                  />
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

      {/* Played cards row — dealer only */}
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
                    background: selected
                      ? "linear-gradient(135deg, hsl(300, 60%, 40%), hsl(300, 50%, 25%))"
                      : "linear-gradient(135deg, hsl(0, 70%, 45%), hsl(0, 60%, 30%))",
                    borderColor: selected ? "hsl(300, 60%, 60%)" : "rgba(255,255,255,0.8)",
                    boxShadow: selected
                      ? "0 0 12px hsl(300, 60%, 60%, 0.5)"
                      : "0 4px 12px rgba(0,0,0,0.4)",
                  }}
                  title={agent.title}
                >
                  <div className="absolute inset-[2px] rounded-sm border border-white/30" />
                  <div className="relative flex flex-col items-center justify-center h-full z-10 px-1">
                    <span className="text-[7px] md:text-[8px] font-bold text-white/90 leading-tight text-center font-['Space_Grotesk']">
                      {agent.title.replace(" Agent", "")}
                    </span>
                    {selected && (
                      <span className="text-[6px] text-green-300 mt-0.5 font-semibold">✓ selected</span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
      {/* Restart confirmation dialog */}
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

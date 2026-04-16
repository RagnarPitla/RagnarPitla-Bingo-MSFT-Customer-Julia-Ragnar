import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
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
  const [gameStateId, setGameStateId] = useState<string | null>(null);
  const [showCard, setShowCard] = useState(false);
  const [viewingAgent, setViewingAgent] = useState<typeof agents[number] | null>(null);
  const lastCardIndexRef = useRef(-2); // -2 = not yet initialised
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

    return () => {
      clearInterval(poll);
      supabase.removeChannel(ch1);
      supabase.removeChannel(ch2);
      supabase.removeChannel(ch3);
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

  const cardTitles = Object.fromEntries(agents.map((a) => [a.key, a.title]));

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
      {/* Dark overlay to mute background */}
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
            onClick={() => exportSelectionsToExcel(selections)}
            className="text-xs px-4 py-1.5 rounded-full bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors shadow-md"
          >
            📊 Export
          </button>
          <button
            onClick={handleRestart}
            className="text-xs px-4 py-1.5 rounded-full bg-destructive text-destructive-foreground font-medium hover:bg-destructive/90 transition-colors shadow-md"
          >
            🔄 Restart Game
          </button>
        </div>
      </div>

      {/* Table container */}
      <div className="relative w-full max-w-3xl aspect-square md:aspect-[4/3]">
        {/* Table surface */}
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

        {/* Wood rim */}
        <div
          className="absolute inset-[6%] rounded-[50%] border-8 pointer-events-none"
          style={{
            borderColor: "hsl(30, 40%, 20%)",
            boxShadow: "inset 0 2px 8px hsl(30, 50%, 30%, 0.3)",
          }}
        />

        {/* Card deck in center */}
        <CardDeck currentCardIndex={currentCardIndex} onFlipNext={handleFlipNext} canFlip={isDealer} />

        {/* People around the table */}
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

      {/* Viewing a past card */}
      {viewingAgent && !showCard && (
        <RevealedCard
          agent={viewingAgent}
          isSelected={mySelections.includes(viewingAgent.key)}
          onSelect={isDealer ? undefined : () => handleSelectCard(viewingAgent.key)}
          onDismiss={() => setViewingAgent(null)}
          selectedBy={selections
            .filter((s) => s.agent_key === viewingAgent.key)
            .map((s) => ({ name: s.name, company: s.company }))}
        />
      )}

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
                  onClick={() => setViewingAgent(agent)}
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
    </div>
  );
}

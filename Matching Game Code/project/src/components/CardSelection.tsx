import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { agents } from "@/data/agents";
import { AgentCard } from "@/components/AgentCard";
import { useToast } from "@/hooks/use-toast";

interface Participant {
  id: string;
  name: string;
  company: string;
}

interface Selection {
  participant_id: string;
  agent_key: string;
}

interface CardSelectionProps {
  participant: Participant;
}

export function CardSelection({ participant }: CardSelectionProps) {
  const [selections, setSelections] = useState<(Selection & { name: string; company: string })[]>([]);
  const [mySelection, setMySelection] = useState<string | null>(null);
  const { toast } = useToast();

  // Load selections and subscribe to realtime
  useEffect(() => {
    const fetchSelections = async () => {
      const { data } = await supabase
        .from("selections")
        .select("participant_id, agent_key");

      const { data: participants } = await supabase
        .from("participants")
        .select("id, name, company");

      if (data && participants) {
        const enriched = data.map((s) => {
          const p = participants.find((p) => p.id === s.participant_id);
          return { ...s, name: p?.name ?? "Unknown", company: p?.company ?? "" };
        });
        setSelections(enriched);
        const mine = data.find((s) => s.participant_id === participant.id);
        if (mine) setMySelection(mine.agent_key);
      }
    };

    fetchSelections();

    const channel = supabase
      .channel("selections-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "selections" }, () => {
        fetchSelections();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [participant.id]);

  const handleSelect = async (agentKey: string) => {
    // If already selected, deselect
    if (mySelection === agentKey) {
      await supabase.from("selections").delete().eq("participant_id", participant.id);
      setMySelection(null);
      return;
    }

    // Upsert selection
    if (mySelection) {
      await supabase
        .from("selections")
        .update({ agent_key: agentKey })
        .eq("participant_id", participant.id);
    } else {
      await supabase
        .from("selections")
        .insert({ participant_id: participant.id, agent_key: agentKey });
    }
    setMySelection(agentKey);
    toast({
      title: "Selection updated!",
      description: `You selected: ${agents.find((a) => a.key === agentKey)?.title}`,
    });
  };

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold font-['Space_Grotesk'] mb-1">
            Choose Your <span className="text-primary">Agent</span>
          </h1>
          <p className="text-muted-foreground text-sm">
            Signed in as <span className="text-foreground font-medium">{participant.name}</span> · {participant.company}
          </p>
          <p className="text-muted-foreground text-xs mt-1">
            Tap a card to select · Tap again to deselect · You can change your mind anytime
          </p>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {agents.map((agent) => (
            <AgentCard
              key={agent.key}
              agent={agent}
              isSelected={mySelection === agent.key}
              onSelect={() => handleSelect(agent.key)}
              selectedBy={selections
                .filter((s) => s.agent_key === agent.key)
                .map((s) => ({ name: s.name, company: s.company }))}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

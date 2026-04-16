import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SignInForm } from "@/components/SignInForm";
import { PokerTable } from "@/components/PokerTable";

interface Participant {
  id: string;
  name: string;
  company: string;
  role: "dealer" | "player";
}

const Index = () => {
  const [participant, setParticipant] = useState<Participant | null>(null);
  const [loading, setLoading] = useState(false);
  const [testMode, setTestMode] = useState(false);
  const [testParticipants, setTestParticipants] = useState<Participant[]>([]);
  const [activeTestIndex, setActiveTestIndex] = useState(0);
  const [dealerExists, setDealerExists] = useState(false);

  useEffect(() => {
    const checkDealer = async () => {
      const [{ data: parts }, { data: gs }] = await Promise.all([
        supabase.from("participants").select("id, created_at").eq("role", "dealer"),
        supabase.from("game_state").select("current_card_index").limit(1).single(),
      ]);
      if (!parts || parts.length === 0) {
        setDealerExists(false);
        return;
      }
      const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();
      const dealerIsRecent = parts[0].created_at > twoHoursAgo;
      const gameIsActive = gs && gs.current_card_index >= 0;
      setDealerExists(dealerIsRecent || !!gameIsActive);
    };
    checkDealer();
    const poll = setInterval(checkDealer, 3000);
    const ch = supabase
      .channel("signin-participants")
      .on("postgres_changes", { event: "*", schema: "public", table: "participants" }, checkDealer)
      .subscribe();
    return () => { clearInterval(poll); supabase.removeChannel(ch); };
  }, []);

  const handleRestart = async () => {
    const { data: gs } = await supabase.from("game_state").select("id").limit(1).single();
    await Promise.all([
      supabase.from("selections").delete().neq("id", "00000000-0000-0000-0000-000000000000"),
      supabase.from("participants").delete().neq("id", "00000000-0000-0000-0000-000000000000"),
      gs ? supabase.from("game_state").update({ current_card_index: -1 }).eq("id", gs.id) : Promise.resolve(),
    ]);
    setParticipant(null);
    setTestMode(false);
    setTestParticipants([]);
  };

  const handleSignIn = async (name: string, company: string, role: "dealer" | "player") => {
    setLoading(true);
    const { data, error } = await supabase
      .from("participants")
      .insert({ name, company, role })
      .select()
      .single();

    if (error) {
      console.error(error);
      setLoading(false);
      return;
    }

    const p = { id: data.id, name: data.name, company: data.company, role: (data.role as "dealer" | "player") };

    if (testMode) {
      setTestParticipants((prev) => {
        const updated = [...prev, p];
        setActiveTestIndex(updated.length - 1);
        return updated;
      });
      setParticipant(p);
    } else {
      setParticipant(p);
    }
    setLoading(false);
  };

  // Test mode: show sign-in for adding more users + switcher
  if (testMode && testParticipants.length > 0) {
    const active = testParticipants[activeTestIndex] || testParticipants[0];

    return (
      <div className="relative min-h-screen" style={{ background: "linear-gradient(135deg, hsl(0, 60%, 12%), hsl(0, 40%, 8%))" }}>
        {/* Test mode banner */}
        <div className="fixed top-0 left-0 right-0 z-[60] bg-destructive/90 text-destructive-foreground text-center py-1 text-xs font-semibold flex items-center justify-center gap-4">
          <span>🧪 TEST MODE — Playing as: {active.name}</span>
          <div className="flex gap-1">
            {testParticipants.map((p, i) => (
              <button
                key={p.id}
                onClick={() => {
                  setActiveTestIndex(i);
                  setParticipant(p);
                }}
                className={`px-2 py-0.5 rounded text-[10px] font-medium transition-all ${
                  i === activeTestIndex
                    ? "bg-background text-foreground"
                    : "bg-destructive-foreground/20 text-destructive-foreground hover:bg-destructive-foreground/30"
                }`}
              >
                {p.name} ({p.role === "dealer" ? "🃏" : "🎮"})
              </button>
            ))}
          </div>
          <button
            onClick={() => {
              setParticipant(null);
            }}
            className="px-2 py-0.5 rounded bg-background/20 text-[10px] hover:bg-background/30"
          >
            + Add User
          </button>
          <button
            onClick={() => {
              setTestMode(false);
              setTestParticipants([]);
              setParticipant(null);
            }}
            className="px-2 py-0.5 rounded bg-background/20 text-[10px] hover:bg-background/30"
          >
            Exit Test
          </button>
        </div>

        <div className="pt-8">
          {participant === null ? (
            <SignInForm onSignIn={handleSignIn} loading={loading} onRestart={handleRestart} dealerExists={dealerExists} />
          ) : (
            <PokerTable participant={active} onRestart={() => { setTestParticipants([]); setParticipant(null); setActiveTestIndex(0); }} />
          )}
        </div>
      </div>
    );
  }

  if (!participant) {
    return (
      <div className="relative min-h-screen" style={testMode ? { background: "linear-gradient(135deg, hsl(0, 60%, 12%), hsl(0, 40%, 8%))" } : undefined}>
        {testMode && (
          <div className="fixed top-0 left-0 right-0 z-50 bg-destructive/90 text-destructive-foreground text-center py-1 text-xs font-semibold">
            🧪 TEST MODE ACTIVE
          </div>
        )}
        <div className={testMode ? "pt-8" : ""}>
          <SignInForm onSignIn={handleSignIn} loading={loading} onRestart={handleRestart} dealerExists={dealerExists} />
        </div>
        <button
          onClick={() => setTestMode(!testMode)}
          className={`fixed bottom-8 left-1/2 -translate-x-1/2 px-6 py-3 rounded-full text-sm font-semibold border-2 z-50 transition-colors ${
            testMode
              ? "border-destructive bg-destructive/20 text-destructive hover:bg-destructive/30"
              : "border-border bg-card text-muted-foreground hover:text-foreground hover:border-primary/50"
          }`}
        >
          🧪 {testMode ? "Exit Test Mode" : "Test Mode"}
        </button>
      </div>
    );
  }

  return <PokerTable participant={participant} onRestart={() => { setParticipant(null); setTestMode(false); setTestParticipants([]); }} />;
};

export default Index;

import { useState, useEffect } from "react";
import * as gameApi from "@/lib/gameApi";
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
  const [dealerExists, setDealerExists] = useState(false);
  const [signInError, setSignInError] = useState<string | null>(null);

  useEffect(() => {
    const checkDealer = async () => {
      try {
        const [parts, gs] = await Promise.all([
          gameApi.participants.list(),
          gameApi.gameState.get(),
        ]);
        const dealers = parts.filter(p => p.role === "dealer");
        if (dealers.length === 0) { setDealerExists(false); return; }
        const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();
        const dealerIsRecent = dealers[0].created_at > twoHoursAgo;
        const gameIsActive = gs.current_card_index >= 0;
        setDealerExists(dealerIsRecent || gameIsActive);
      } catch {
        // Silently ignore — API might not be ready yet
      }
    };
    checkDealer();
    const poll = setInterval(checkDealer, 3000);
    return () => clearInterval(poll);
  }, []);

  const handleRestart = async () => {
    await gameApi.resetGame();
    setParticipant(null);
    setDealerExists(false);
  };

  const handleSignIn = async (name: string, company: string, role: "dealer" | "player") => {
    setLoading(true);
    setSignInError(null);
    try {
      const timeout = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("Could not reach the game server. Please try again in a few seconds.")), 10000)
      );
      const p = await Promise.race([
        gameApi.participants.create({ name, company, role }),
        timeout,
      ]);
      setParticipant({ id: p.id, name: p.name, company: p.company, role: p.role });
    } catch (err: any) {
      setSignInError(err.message ?? "Connection error — please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!participant) {
    return (
      <div className="relative min-h-screen">
        <SignInForm
          onSignIn={handleSignIn}
          loading={loading}
          onRestart={handleRestart}
          dealerExists={dealerExists}
          error={signInError}
        />
      </div>
    );
  }

  return (
    <PokerTable
      participant={participant}
      onRestart={() => { setParticipant(null); setDealerExists(false); }}
    />
  );
};

export default Index;

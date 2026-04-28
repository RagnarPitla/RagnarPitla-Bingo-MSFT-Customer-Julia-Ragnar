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

const STORAGE_KEY = "matching-game-participant";

const Index = () => {
  const [participant, setParticipant] = useState<Participant | null>(null);
  const [loading, setLoading] = useState(false);
  const [dealerExists, setDealerExists] = useState(false);
  const [signInError, setSignInError] = useState<string | null>(null);

  // On mount: restore participant instantly from localStorage — no API call needed
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const p: Participant = JSON.parse(saved);
        setParticipant(p);
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  }, []);

  // Dealer availability check
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
        // Silently ignore
      }
    };
    checkDealer();
    const poll = setInterval(checkDealer, 3000);
    return () => clearInterval(poll);
  }, []);

  const saveParticipant = (p: Participant) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(p));
    setParticipant(p);
  };

  const clearParticipant = () => {
    localStorage.removeItem(STORAGE_KEY);
    setParticipant(null);
  };

  const handleRestart = async () => {
    await gameApi.resetGame();
    clearParticipant();
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
      saveParticipant({ id: p.id, name: p.name, company: p.company, role: p.role });
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
      onRestart={() => { clearParticipant(); setDealerExists(false); }}
    />
  );
};

export default Index;

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
  const [restoring, setRestoring] = useState(true); // true while checking localStorage
  const [dealerExists, setDealerExists] = useState(false);
  const [signInError, setSignInError] = useState<string | null>(null);

  // On mount: restore participant from localStorage and verify they still exist in the API
  useEffect(() => {
    const restore = async () => {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        try {
          const p: Participant = JSON.parse(saved);
          const parts = await gameApi.participants.list();
          const found = parts.find(part => part.id === p.id);
          if (found) {
            setParticipant({ id: found.id, name: found.name, company: found.company, role: found.role as "dealer" | "player" });
          } else {
            // Participant no longer in DB (game was restarted) — clear cache
            localStorage.removeItem(STORAGE_KEY);
          }
        } catch {
          // API unavailable — restore from cache anyway so screen doesn't reset
          try {
            const p: Participant = JSON.parse(saved);
            setParticipant(p);
          } catch {
            localStorage.removeItem(STORAGE_KEY);
          }
        }
      }
      setRestoring(false);
    };
    restore();
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

  // Show nothing while restoring session to avoid flash of sign-in screen
  if (restoring) return null;

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

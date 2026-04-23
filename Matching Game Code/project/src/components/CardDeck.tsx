import { useState } from "react";
import { agents } from "@/data/agents";

interface CardDeckProps {
  currentCardIndex: number;
  onFlipNext: () => void;
  canFlip: boolean;
}

export function CardDeck({ currentCardIndex, onFlipNext, canFlip }: CardDeckProps) {
  const [isFlipping, setIsFlipping] = useState(false);
  const remainingCards = agents.length - currentCardIndex - 1;

  const handleFlip = () => {
    if (!canFlip || currentCardIndex >= agents.length - 1 || isFlipping) return;
    setIsFlipping(true);
    setTimeout(() => {
      onFlipNext();
      setIsFlipping(false);
    }, 400);
  };

  return (
    <div className="flex flex-col items-center gap-2">
      {/* Deck stack */}
      <div className={`relative ${canFlip ? 'cursor-pointer' : 'cursor-default'}`} onClick={handleFlip}>
        {[...Array(Math.min(Math.max(remainingCards, 0), 4))].map((_, i) => (
          <div
            key={i}
            className="absolute w-16 h-24 md:w-20 md:h-28 rounded-md border"
            style={{
              background: "linear-gradient(135deg, #c41e3a, #8b0000)",
              borderColor: "#fff",
              top: `${-i * 2}px`,
              left: `${i * 1.5}px`,
              zIndex: -i,
            }}
          >
            {/* Card back pattern */}
            <div
              className="absolute inset-[3px] rounded-sm border border-white/30"
              style={{
                backgroundImage:
                  "repeating-conic-gradient(#c41e3a 0% 25%, #8b0000 0% 50%) 0 0 / 8px 8px",
              }}
            />
          </div>
        ))}
        <div
          className={`w-16 h-24 md:w-20 md:h-28 rounded-md border flex items-center justify-center relative overflow-hidden ${
            isFlipping ? "animate-flip" : ""
          }`}
          style={{
            background: "linear-gradient(135deg, #c41e3a, #8b0000)",
            borderColor: "#fff",
            boxShadow: "0 4px 15px rgba(0,0,0,0.4)",
          }}
        >
          {/* Card back pattern */}
          <div
            className="absolute inset-[3px] rounded-sm border border-white/30"
            style={{
              backgroundImage:
                "repeating-conic-gradient(#c41e3a 0% 25%, #8b0000 0% 50%) 0 0 / 8px 8px",
            }}
          />
          <div className="relative text-center z-10 bg-white/90 rounded-sm px-1.5 py-1">
            <p className="text-[7px] md:text-[8px] text-red-800 font-bold font-['Space_Grotesk'] leading-tight">
              DYNAMICS
            </p>
            <p className="text-[7px] md:text-[8px] text-red-800 font-bold font-['Space_Grotesk'] leading-tight">
              AGENTS
            </p>
          </div>
        </div>
      </div>

      {canFlip && (
        <button
          onClick={handleFlip}
          disabled={currentCardIndex >= agents.length - 1 || isFlipping}
        className="px-4 py-1.5 rounded-full text-[10px] md:text-xs font-semibold transition-all disabled:opacity-30 disabled:cursor-not-allowed"
        style={{
          background: "linear-gradient(135deg, hsl(300, 60%, 60%), hsl(300, 40%, 45%))",
          color: "hsl(222, 47%, 8%)",
          boxShadow: "0 4px 15px hsl(300, 60%, 60%, 0.3)",
        }}
      >
        {currentCardIndex < 0
          ? "Flip First Card"
          : currentCardIndex >= agents.length - 1
          ? "All Cards Revealed"
          : `Flip Next (${remainingCards} left)`}
      </button>
      )}

      <p className="text-[9px] text-muted-foreground">
        {currentCardIndex + 1} / {agents.length} revealed
      </p>
    </div>
  );
}

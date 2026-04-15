import { useEffect, useState } from "react";

interface AnimatedPersonProps {
  name: string;
  company: string;
  index: number;
  total: number;
  isCurrentUser: boolean;
  selectedCards: string[];
  cardTitles: Record<string, string>;
  role?: "dealer" | "player";
}

const AVATAR_COLORS = [
  { skin: "hsl(30, 55%, 70%)", hair: "hsl(30, 30%, 25%)", shirt: "hsl(210, 60%, 45%)" },
  { skin: "hsl(20, 60%, 40%)", hair: "hsl(0, 0%, 8%)", shirt: "hsl(160, 50%, 40%)" },
  { skin: "hsl(35, 60%, 78%)", hair: "hsl(35, 25%, 35%)", shirt: "hsl(270, 45%, 50%)" },
  { skin: "hsl(25, 70%, 30%)", hair: "hsl(0, 0%, 5%)", shirt: "hsl(45, 70%, 50%)" },
  { skin: "hsl(30, 50%, 55%)", hair: "hsl(20, 40%, 15%)", shirt: "hsl(340, 55%, 50%)" },
  { skin: "hsl(15, 40%, 75%)", hair: "hsl(25, 60%, 20%)", shirt: "hsl(190, 60%, 42%)" },
  { skin: "hsl(28, 65%, 45%)", hair: "hsl(0, 0%, 10%)", shirt: "hsl(25, 65%, 50%)" },
  { skin: "hsl(40, 50%, 82%)", hair: "hsl(30, 20%, 40%)", shirt: "hsl(130, 45%, 40%)" },
  { skin: "hsl(22, 55%, 35%)", hair: "hsl(0, 0%, 6%)", shirt: "hsl(220, 50%, 55%)" },
  { skin: "hsl(33, 45%, 62%)", hair: "hsl(20, 35%, 18%)", shirt: "hsl(0, 50%, 55%)" },
];

export function AnimatedPerson({
  name,
  company,
  index,
  total,
  isCurrentUser,
  selectedCards,
  cardTitles,
  role = "player",
}: AnimatedPersonProps) {
  const [bobOffset, setBobOffset] = useState(0);
  const [blinkOpen, setBlinkOpen] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setBobOffset(Math.sin(Date.now() / 1000 + index * 1.8) * 2.5);
    }, 50);
    return () => clearInterval(interval);
  }, [index]);

  // Blink effect
  useEffect(() => {
    const blink = () => {
      setBlinkOpen(false);
      setTimeout(() => setBlinkOpen(true), 150);
    };
    const interval = setInterval(blink, 3000 + index * 700);
    return () => clearInterval(interval);
  }, [index]);

  // Position around the table ellipse
  const angle = (index / Math.max(total, 1)) * Math.PI * 2 - Math.PI / 2;
  const radiusX = 42;
  const radiusY = 38;
  const x = 50 + radiusX * Math.cos(angle);
  const y = 50 + radiusY * Math.sin(angle);

  const colors = AVATAR_COLORS[index % AVATAR_COLORS.length];

  return (
    <div
      className="absolute flex flex-col items-center z-10"
      style={{
        left: `${x}%`,
        top: `${y}%`,
        transform: `translate(-50%, -50%) translateY(${bobOffset}px)`,
        transition: "left 0.5s ease, top 0.5s ease",
      }}
    >
      {/* Glow ring for current user */}
      {isCurrentUser && (
        <div
          className="absolute -inset-2 rounded-full animate-pulse opacity-50"
          style={{
            background: "radial-gradient(circle, hsl(300, 60%, 60%, 0.3), transparent 70%)",
          }}
        />
      )}

      {/* SVG Head */}
      <svg width="48" height="56" viewBox="0 0 48 56" fill="none" className="md:w-14 md:h-16 drop-shadow-lg">
        {/* Neck */}
        <rect x="18" y="38" width="12" height="8" rx="3" fill={colors.skin} />
        
        {/* Shoulders / body top */}
        <path
          d="M8 52 C8 46, 16 42, 24 42 C32 42, 40 46, 40 52 L40 56 L8 56 Z"
          fill={role === "dealer" ? "hsl(0, 70%, 40%)" : colors.shirt}
          stroke={role === "dealer" ? "hsl(0, 70%, 50%)" : colors.shirt.replace(")", ", 0.8)").replace("hsl(", "hsl(")}
          strokeWidth="0.5"
        />

        {/* Head shape */}
        <ellipse cx="24" cy="22" rx="14" ry="17" fill={colors.skin} />
        
        {/* Dealer top hat */}
        {role === "dealer" && (
          <>
            {/* Hat brim */}
            <ellipse cx="24" cy="5" rx="18" ry="3" fill="hsl(0, 0%, 10%)" stroke="hsl(40, 70%, 50%)" strokeWidth="0.8" />
            {/* Hat crown */}
            <rect x="12" y="-14" width="24" height="19" rx="2" fill="hsl(0, 0%, 12%)" stroke="hsl(40, 70%, 50%)" strokeWidth="0.5" />
            {/* Hat band */}
            <rect x="12" y="0" width="24" height="3" fill="hsl(40, 70%, 50%)" />
            {/* Band buckle */}
            <rect x="21" y="-0.5" width="6" height="4" rx="0.5" fill="none" stroke="hsl(45, 80%, 65%)" strokeWidth="0.8" />
          </>
        )}

        {/* Hair - gender neutral short style */}
        <path
          d="M10 20 C10 8, 18 3, 24 3 C30 3, 38 8, 38 20 C38 14, 34 9, 24 9 C14 9, 10 14, 10 20 Z"
          fill={colors.hair}
        />
        {/* Side hair */}
        <path d="M10 20 C9 16, 10 12, 12 10 L10 22 Z" fill={colors.hair} />
        <path d="M38 20 C39 16, 38 12, 36 10 L38 22 Z" fill={colors.hair} />

        {/* Eyes */}
        {blinkOpen ? (
          <>
            <ellipse cx="18" cy="22" rx="2.2" ry="2.5" fill="white" />
            <ellipse cx="30" cy="22" rx="2.2" ry="2.5" fill="white" />
            <circle cx="18.5" cy="22.3" r="1.3" fill="hsl(222, 40%, 15%)" />
            <circle cx="30.5" cy="22.3" r="1.3" fill="hsl(222, 40%, 15%)" />
            <circle cx="19" cy="21.5" r="0.4" fill="white" />
            <circle cx="31" cy="21.5" r="0.4" fill="white" />
          </>
        ) : (
          <>
            <line x1="16" y1="22" x2="20" y2="22" stroke="hsl(222, 40%, 15%)" strokeWidth="1.2" strokeLinecap="round" />
            <line x1="28" y1="22" x2="32" y2="22" stroke="hsl(222, 40%, 15%)" strokeWidth="1.2" strokeLinecap="round" />
          </>
        )}

        {/* Eyebrows */}
        <path d="M15 18.5 Q18 17, 21 18.5" stroke={colors.hair} strokeWidth="1" fill="none" strokeLinecap="round" />
        <path d="M27 18.5 Q30 17, 33 18.5" stroke={colors.hair} strokeWidth="1" fill="none" strokeLinecap="round" />

        {/* Nose */}
        <path d="M23 25 Q24 27, 25 25" stroke={`${colors.skin.replace(")", ", 0.6)")}`} strokeWidth="0.8" fill="none" />

        {/* Smile */}
        <path
          d="M19 30 Q24 34, 29 30"
          stroke="hsl(0, 30%, 45%)"
          strokeWidth="1"
          fill="none"
          strokeLinecap="round"
        />

        {/* Current user indicator star */}
        {isCurrentUser && (
          <circle cx="40" cy="6" r="5" fill="hsl(300, 60%, 60%)" stroke="hsl(222, 47%, 8%)" strokeWidth="1">
            <animate attributeName="opacity" values="1;0.5;1" dur="2s" repeatCount="indefinite" />
          </circle>
        )}
      </svg>

      {/* Name tag */}
      <div
        className="mt-0.5 text-center px-2 py-0.5 rounded-md max-w-[80px] md:max-w-[100px]"
        style={{
          background: isCurrentUser ? "hsl(300, 60%, 60%, 0.15)" : "hsl(222, 40%, 12%, 0.8)",
          border: isCurrentUser ? "1px solid hsl(300, 60%, 60%, 0.3)" : "1px solid hsl(222, 30%, 22%)",
        }}
      >
        <p className="text-[9px] md:text-[10px] font-semibold text-foreground truncate leading-tight">
          {name}
        </p>
        <p className="text-[7px] md:text-[8px] text-muted-foreground truncate leading-tight">
          {company}
        </p>
      </div>

      {/* Selected cards (mini cards near the person) */}
      {/* Selected cards (mini cards near the person) */}
      <div className="flex gap-1 mt-1 flex-wrap justify-center max-w-[140px] md:max-w-[180px]">
        {selectedCards.map((cardKey, i) => (
          <div
            key={cardKey}
            className="w-10 h-14 md:w-12 md:h-16 rounded border-2 text-[7px] md:text-[8px] flex items-center justify-center p-1 text-center leading-tight font-bold animate-scale-in shadow-md"
            style={{
              background: "linear-gradient(135deg, hsl(0, 70%, 45%), hsl(0, 60%, 30%))",
              borderColor: "hsl(40, 70%, 50%)",
              color: "hsl(45, 90%, 90%)",
              transform: `rotate(${(i - selectedCards.length / 2) * 4}deg)`,
              boxShadow: "0 2px 8px hsl(0, 0%, 0%, 0.4)",
            }}
          >
            {(cardTitles[cardKey] || cardKey).split(" ").slice(0, 2).join(" ")}
          </div>
        ))}
      </div>
    </div>
  );
}

import { useEffect, useState } from "react";
import { getAgentColor } from "@/data/agentColors";

interface AnimatedPersonProps {
  name: string;
  company: string;
  index: number;
  isCurrentUser: boolean;
  selectedCards: string[];
  cardTitles: Record<string, string>;
  role?: "dealer" | "player";
  scale?: number;
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
  isCurrentUser,
  selectedCards,
  cardTitles,
  role = "player",
  scale = 1,
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

  const colors = AVATAR_COLORS[index % AVATAR_COLORS.length];

  // Colour each dot by the agent's position in cardTitles (matches legend)
  const cardKeys = Object.keys(cardTitles);
  const getCardColor = (key: string) => getAgentColor(cardKeys.indexOf(key));

  const s = scale;
  const personW = Math.round(48 * s);
  const personH = Math.round(56 * s);
  const stoolW  = Math.round(44 * s);
  const stoolH  = Math.round(60 * s);
  const crownW  = Math.round(24 * s);
  const crownH  = Math.round(15 * s);
  const crownTop = Math.round(-20 * s);
  const nameMaxW = Math.round(90 * s);

  return (
    <div
      className="relative flex-shrink-0 flex flex-col items-center z-10"
      style={{ transform: `translateY(${bobOffset}px)` }}
    >
      {/* Golden glow for current user */}
      {isCurrentUser && (
        <div
          className="absolute -inset-2 rounded-full animate-pulse opacity-60"
          style={{
            background: "radial-gradient(circle, hsl(45, 100%, 60%, 0.35), transparent 70%)",
          }}
        />
      )}

      {/* Crown — floats above the avatar for current user */}
      {isCurrentUser && (
        <div
          className="absolute z-20"
          style={{
            top: `${crownTop}px`,
            left: "50%",
            transform: "translateX(-50%)",
            filter: "drop-shadow(0 0 5px hsl(45, 100%, 65%)) drop-shadow(0 0 2px hsl(35, 80%, 40%))",
          }}
        >
          <svg width={crownW} height={crownH} viewBox="0 0 24 15" fill="none">
            {/* Crown body */}
            <path
              d="M1 14 L1 8.5 L6 2 L12 7.5 L18 2 L23 8.5 L23 14 Z"
              fill="hsl(45, 95%, 52%)"
              stroke="hsl(35, 65%, 35%)"
              strokeWidth="0.7"
              strokeLinejoin="round"
            />
            {/* Band across middle */}
            <line x1="1" y1="10" x2="23" y2="10" stroke="hsl(35, 65%, 38%)" strokeWidth="0.6" />
            {/* Left gem */}
            <circle cx="6" cy="2.5" r="1.6" fill="hsl(0, 85%, 62%)" stroke="hsl(0, 55%, 40%)" strokeWidth="0.4" />
            {/* Centre gem */}
            <circle cx="12" cy="7.5" r="1.6" fill="hsl(220, 85%, 68%)" stroke="hsl(220, 55%, 40%)" strokeWidth="0.4" />
            {/* Right gem */}
            <circle cx="18" cy="2.5" r="1.6" fill="hsl(0, 85%, 62%)" stroke="hsl(0, 55%, 40%)" strokeWidth="0.4" />
            {/* Highlight sheen */}
            <path d="M4 10.5 L4 13" stroke="hsl(45, 100%, 75%)" strokeWidth="0.5" strokeLinecap="round" opacity="0.6" />
            <path d="M12 10.5 L12 13" stroke="hsl(45, 100%, 75%)" strokeWidth="0.5" strokeLinecap="round" opacity="0.6" />
            <path d="M20 10.5 L20 13" stroke="hsl(45, 100%, 75%)" strokeWidth="0.5" strokeLinecap="round" opacity="0.6" />
          </svg>
        </div>
      )}

      {/* SVG Head */}
      <svg width={personW} height={personH} viewBox="0 0 48 56" fill="none" className="drop-shadow-lg">
        {/* Neck */}
        <rect x="18" y="38" width="12" height="8" rx="3" fill={colors.skin} />
        
        {/* Shoulders / body top */}
        <path
          d="M8 52 C8 46, 16 42, 24 42 C32 42, 40 46, 40 52 L40 56 L8 56 Z"
          fill={role === "dealer" ? "hsl(0, 0%, 95%)" : colors.shirt}
          stroke={role === "dealer" ? "hsl(0, 0%, 80%)" : colors.shirt.replace(")", ", 0.8)").replace("hsl(", "hsl(")}
          strokeWidth="0.5"
        />

        {/* Dealer vest + bow tie */}
        {role === "dealer" && (
          <>
            {/* Vest - left side */}
            <path d="M8 52 C8 46, 16 42, 21 42 L21 56 L8 56 Z" fill="hsl(0, 0%, 10%)" />
            {/* Vest - right side */}
            <path d="M40 52 C40 46, 32 42, 27 42 L27 56 L40 56 Z" fill="hsl(0, 0%, 10%)" />
            {/* Vest lapel edges */}
            <line x1="21" y1="42" x2="22" y2="56" stroke="hsl(0, 0%, 20%)" strokeWidth="0.5" />
            <line x1="27" y1="42" x2="26" y2="56" stroke="hsl(0, 0%, 20%)" strokeWidth="0.5" />
            {/* Bow tie */}
            <polygon points="20,44 24,46 20,48" fill="hsl(0, 70%, 40%)" />
            <polygon points="28,44 24,46 28,48" fill="hsl(0, 70%, 40%)" />
            <circle cx="24" cy="46" r="1.2" fill="hsl(0, 70%, 35%)" />
          </>
        )}

        {/* Head shape */}
        <ellipse cx="24" cy="22" rx="14" ry="17" fill={colors.skin} />
        


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

        {/* Selection count badge */}
        {selectedCards.length > 0 && (
          <g>
            <circle cx="8" cy="6" r="6" fill="hsl(160, 60%, 42%)" stroke="hsl(222, 47%, 8%)" strokeWidth="1.5" />
            <text x="8" y="9.5" textAnchor="middle" fontSize="7" fontWeight="bold" fill="white">
              {selectedCards.length}
            </text>
          </g>
        )}
      </svg>

      {/* Stool */}
      <svg width={stoolW} height={stoolH} viewBox="0 0 44 60" fill="none" className="-mt-1">
        {/* Seat */}
        <ellipse cx="22" cy="5" rx="17" ry="5" fill="hsl(0,0%,9%)" stroke="hsl(0,0%,22%)" strokeWidth="1"/>
        <ellipse cx="22" cy="3" rx="15" ry="3.5" fill="hsl(0,0%,13%)"/>
        {/* Center pole */}
        <rect x="19.5" y="10" width="5" height="34" rx="2.5" fill="hsl(0,0%,7%)" stroke="hsl(0,0%,17%)" strokeWidth="0.5"/>
        {/* Footrest */}
        <rect x="8" y="28" width="28" height="3.5" rx="1.75" fill="hsl(0,0%,9%)" stroke="hsl(0,0%,24%)" strokeWidth="0.6"/>
        {/* Base legs */}
        <line x1="22" y1="44" x2="5"  y2="58" stroke="hsl(0,0%,8%)"  strokeWidth="3.5" strokeLinecap="round"/>
        <line x1="22" y1="44" x2="39" y2="58" stroke="hsl(0,0%,8%)"  strokeWidth="3.5" strokeLinecap="round"/>
        <line x1="22" y1="44" x2="11" y2="56" stroke="hsl(0,0%,6%)" strokeWidth="3"   strokeLinecap="round"/>
        <line x1="22" y1="44" x2="33" y2="56" stroke="hsl(0,0%,6%)" strokeWidth="3"   strokeLinecap="round"/>
      </svg>

      {/* Name tag */}
      <div
        className="mt-0.5 text-center px-2 py-0.5 rounded-md"
        style={{
          maxWidth: `${nameMaxW}px`,
          background: isCurrentUser ? "hsl(45, 95%, 52%, 0.12)" : "hsl(222, 40%, 12%, 0.8)",
          border: isCurrentUser ? "1px solid hsl(45, 95%, 52%, 0.5)" : "1px solid hsl(222, 30%, 22%)",
        }}
      >
        {isCurrentUser && (
          <p className="text-[6px] font-bold uppercase tracking-wider leading-tight" style={{ color: "hsl(45, 95%, 60%)" }}>
            You
          </p>
        )}
        <p className="text-[9px] md:text-[10px] font-semibold text-foreground truncate leading-tight">
          {name}
        </p>
        <p className="text-[7px] md:text-[8px] text-muted-foreground truncate leading-tight">
          {company}
        </p>
      </div>

      {/* Selection dots — one per chosen card */}
      {selectedCards.length > 0 && (
        <div className="flex gap-1 mt-1 justify-center flex-wrap max-w-[60px]">
          {selectedCards.map((cardKey) => (
            <div
              key={cardKey}
              className="w-2.5 h-2.5 rounded-full shadow-sm animate-scale-in"
              style={{ background: getCardColor(cardKey) }}
              title={cardTitles[cardKey] || cardKey}
            />
          ))}
        </div>
      )}
    </div>
  );
}

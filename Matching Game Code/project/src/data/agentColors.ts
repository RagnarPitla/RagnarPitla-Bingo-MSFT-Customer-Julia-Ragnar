// Shared colour palette — one colour per agent slot, by position in the agents array.
// Used by AnimatedPerson (dots) and PokerTable (legend) so they always match.
export const AGENT_DOT_COLORS = [
  "hsl(210, 75%, 60%)",
  "hsl(140, 65%, 50%)",
  "hsl(35, 85%, 58%)",
  "hsl(280, 65%, 65%)",
  "hsl(0, 70%, 60%)",
  "hsl(180, 60%, 50%)",
];

export const getAgentColor = (index: number): string =>
  AGENT_DOT_COLORS[index % AGENT_DOT_COLORS.length];

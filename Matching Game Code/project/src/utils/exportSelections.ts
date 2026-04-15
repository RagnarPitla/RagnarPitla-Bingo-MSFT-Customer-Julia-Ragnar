import * as XLSX from "xlsx";
import { agents } from "@/data/agents";

interface SelectionWithInfo {
  participant_id: string;
  agent_key: string;
  name: string;
  company: string;
}

export function exportSelectionsToExcel(selections: SelectionWithInfo[]) {
  const cardTitles = Object.fromEntries(agents.map((a) => [a.key, a.title]));

  // Group selections by participant
  const byParticipant = new Map<string, { name: string; company: string; cards: string[] }>();
  for (const s of selections) {
    const existing = byParticipant.get(s.participant_id);
    if (existing) {
      existing.cards.push(cardTitles[s.agent_key] || s.agent_key);
    } else {
      byParticipant.set(s.participant_id, {
        name: s.name,
        company: s.company,
        cards: [cardTitles[s.agent_key] || s.agent_key],
      });
    }
  }

  const rows = Array.from(byParticipant.values()).map((p) => ({
    Name: p.name,
    Company: p.company,
    "Selected Cards": p.cards.join(", "),
    "Number of Selections": p.cards.length,
  }));

  if (rows.length === 0) {
    rows.push({ Name: "No selections made", Company: "", "Selected Cards": "", "Number of Selections": 0 });
  }

  const ws = XLSX.utils.json_to_sheet(rows);
  ws["!cols"] = [{ wch: 20 }, { wch: 20 }, { wch: 50 }, { wch: 20 }];
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Selections");
  XLSX.writeFile(wb, "agent-selections.xlsx");
}

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { randomUUID } from "crypto";

// In-memory store — mirrors Azure Table Storage for local dev
const store = {
  participants: [] as { id: string; name: string; company: string; role: string; created_at: string }[],
  selections: [] as { participant_id: string; agent_key: string }[],
  gameState: { id: "1", current_card_index: -1, reviewing_card_key: null as string | null },
};

function devApiPlugin() {
  return {
    name: "dev-api",
    configureServer(server: any) {
      server.middlewares.use("/api", async (req: any, res: any, next: any) => {
        const url = new URL(req.url, "http://localhost");
        const route = url.pathname; // e.g. "/participants" (mount prefix stripped)
        const method = req.method as string;

        const send = (status: number, body: unknown) => {
          res.statusCode = status;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify(body));
        };

        const readBody = () =>
          new Promise<any>((resolve) => {
            let data = "";
            req.on("data", (chunk: any) => (data += chunk));
            req.on("end", () => {
              try { resolve(JSON.parse(data)); } catch { resolve({}); }
            });
          });

        if (route === "/participants" || route === "/participants/") {
          if (method === "GET") {
            send(200, store.participants);
          } else if (method === "POST") {
            const body = await readBody();
            const p = { id: randomUUID(), ...body, created_at: new Date().toISOString() };
            store.participants.push(p);
            send(201, p);
          } else if (method === "DELETE") {
            store.participants = [];
            send(200, { ok: true });
          } else next();

        } else if (route === "/selections" || route === "/selections/") {
          if (method === "GET") {
            send(200, store.selections);
          } else if (method === "POST") {
            const body = await readBody();
            store.selections.push(body);
            send(201, { ok: true });
          } else if (method === "DELETE") {
            const participantId = url.searchParams.get("participantId");
            const agentKey = url.searchParams.get("agentKey");
            if (participantId && agentKey) {
              store.selections = store.selections.filter(
                s => !(s.participant_id === participantId && s.agent_key === agentKey)
              );
            } else {
              store.selections = [];
            }
            send(200, { ok: true });
          } else next();

        } else if (route === "/gamestate" || route === "/gamestate/") {
          if (method === "GET") {
            send(200, store.gameState);
          } else if (method === "PATCH") {
            const body = await readBody();
            store.gameState = { ...store.gameState, ...body };
            send(200, store.gameState);
          } else next();

        } else if (route === "/reset" || route === "/reset/") {
          if (method === "POST") {
            store.participants = [];
            store.selections = [];
            store.gameState = { id: "1", current_card_index: -1, reviewing_card_key: null };
            send(200, { ok: true });
          } else next();

        } else {
          next();
        }
      });
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  base: "/matching-game/",
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [react(), mode === "development" && componentTagger(), mode === "development" && devApiPlugin()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    dedupe: ["react", "react-dom", "react/jsx-runtime", "react/jsx-dev-runtime", "@tanstack/react-query", "@tanstack/query-core"],
  },
}));

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface SignInFormProps {
  onSignIn: (name: string, company: string, role: "dealer" | "player") => void;
  loading: boolean;
  onRestart?: () => void;
}

export function SignInForm({ onSignIn, loading, onRestart }: SignInFormProps) {
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [role, setRole] = useState<"dealer" | "player">("player");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() && company.trim()) {
      onSignIn(name.trim(), company.trim(), role);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 relative"
      style={{
        backgroundImage: `url('${import.meta.env.BASE_URL}images/casino-bg.png')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="absolute inset-0 bg-black/60 pointer-events-none" />
      <div className="w-full max-w-md z-10">
        <div className="text-center mb-8">
          <img
            src={`${import.meta.env.BASE_URL}images/casino-sign.png`}
            alt="Dynamics Agents"
            className="mx-auto h-36 md:h-48 w-auto drop-shadow-2xl mb-4 animate-sign-glow"
          />
          <p className="text-muted-foreground">Choose the agent that fits your business</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 bg-card border border-border rounded-xl p-6">
          <div>
            <label className="text-sm text-muted-foreground mb-1 block">Your Name</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              required
              className="bg-muted border-border"
            />
          </div>
          <div>
            <label className="text-sm text-muted-foreground mb-1 block">Company</label>
            <Input
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="Enter your company"
              required
              className="bg-muted border-border"
            />
          </div>

          {/* Role selector */}
          <div>
            <label className="text-sm text-muted-foreground mb-2 block">Your Role</label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setRole("player")}
                className={`flex-1 px-3 py-2.5 rounded-lg border text-sm font-medium transition-all ${
                  role === "player"
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-muted border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                🎮 Player
              </button>
              <button
                type="button"
                onClick={() => setRole("dealer")}
                className={`flex-1 px-3 py-2.5 rounded-lg border text-sm font-medium transition-all ${
                  role === "dealer"
                    ? "bg-destructive text-destructive-foreground border-destructive"
                    : "bg-muted border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                🃏 Dealer / Admin
              </button>
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={loading || !name.trim() || !company.trim()}>
            {loading ? "Joining..." : role === "dealer" ? "Join as Dealer" : "Join the Game"}
          </Button>
        </form>

      </div>
    </div>
  );
}

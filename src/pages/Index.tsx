import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { fetchBets } from "@/services/api";
import { useBankrolls } from "@/hooks/useBankrolls";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Plus, ArrowRight, Wallet, X, ChevronDown, Users } from "lucide-react";
import { Bankroll } from "@/types/bet";
import { NavigateFunction } from "react-router-dom";

function BankrollCard({ br, navigate, disabled, ongoingCount }: { br: Bankroll; navigate: NavigateFunction; disabled?: boolean; ongoingCount: number }) {
  return (
    <div
      key={br.id}
      className={`rounded-lg bg-card border border-border p-5 flex flex-col md:flex-row md:items-center gap-4 animate-fade-in transition-colors cursor-pointer group ${disabled ? "opacity-50 hover:border-border" : "hover:border-primary/30"}`}
      onClick={() => navigate(`/bankroll/${br.id}`)}>
      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
        <Wallet className="w-5 h-5 text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-foreground">{br.name}</p>
        {br.description && <p className="text-xs text-muted-foreground">{br.description}</p>}
      </div>
      <div className="flex items-center gap-6 font-mono text-sm">
        <div className="text-center">
          <p className="text-xs text-muted-foreground">Ongoing</p>
          <p className="text-ongoing">{ongoingCount}</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-muted-foreground">Current</p>
          <p className={br.balance >= 0 ? "text-win" : "text-loss"}>€{(br.initialValue + br.balance).toFixed(2)}</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-muted-foreground">ROI</p>
          <p className={br.roi >= 0 ? "text-win" : "text-loss"}>{br.roi >= 0 ? "+" : ""}{br.roi.toFixed(1)}%</p>
        </div>
      </div>
      <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
    </div>
  );
}

const Index = () => {
  const { bankrolls, addBankroll, deleteBankroll } = useBankrolls();
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [ongoingCounts, setOngoingCounts] = useState<Record<number, number>>({});
  const navigate = useNavigate();

  useEffect(() => {
    bankrolls.forEach(async (br) => {
      try {
        const bets = await fetchBets(br.id);
        const count = bets.filter(b => b.status === "ONGOING").length;
        setOngoingCounts(prev => ({ ...prev, [br.id]: count }));
      } catch {
        // ignore
      }
    });
  }, [bankrolls]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !amount) return;
    const bankroll = await addBankroll(name.trim(), parseFloat(amount), description.trim() || undefined);
    if (!bankroll) return;
    setName("");
    setDescription("");
    setAmount("");
    setShowForm(false);
    navigate(`/bankroll/${bankroll.id}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="container max-w-4xl mx-auto px-4 py-4 flex items-center gap-3">
          <div className="flex items-center gap-3">
            <img src="/favicon.ico" alt="BetLogger" className="w-9 h-9 rounded-lg" />
            <div>
              <h1 className="text-lg font-bold text-foreground tracking-tight">BetLogger</h1>
              <p className="text-xs text-muted-foreground">Track your bets, maximize your edge</p>
            </div>
          </div>
          <Button variant="outline" onClick={() => navigate("/teams")} className="gap-2">
            <Users className="w-4 h-4" /> Teams
          </Button>
          </div>
        </div>
      </header>

      <main className="container max-w-4xl mx-auto px-4 py-8 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-foreground">Your Bankrolls</h2>
          {!showForm &&
          <Button onClick={() => setShowForm(true)} className="gap-2">
              <Plus className="w-4 h-4" /> New Bankroll
            </Button>
          }
        </div>

        {showForm &&
        <form onSubmit={handleCreate} className="rounded-lg bg-card border border-border p-5 animate-fade-in">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-foreground">Create Bankroll</h3>
              <Button type="button" variant="ghost" size="icon" onClick={() => setShowForm(false)}>
                <X className="w-4 h-4" />
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input placeholder="e.g. Football Strategy" value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Initial Amount (€)</Label>
                <Input type="number" step="0.01" min="0" placeholder="e.g. 500" value={amount} onChange={(e) => setAmount(e.target.value)} />
              </div>
            </div>
            <div className="mt-4 space-y-2">
              <Label>Description <span className="text-muted-foreground font-normal">(optional)</span></Label>
              <Input placeholder="e.g. Long-term value betting strategy" value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>
            <div className="mt-4">
              <Button type="submit" className="w-full">Create</Button>
            </div>
          </form>
        }

        {bankrolls.length === 0 && !showForm ?
        <div className="rounded-lg bg-card border border-border p-12 text-center animate-fade-in">
            <Wallet className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground text-lg">No bankrolls yet.</p>
            <p className="text-sm text-muted-foreground">Create your first bankroll to start tracking bets!</p>
          </div> :

        <>
          {bankrolls.filter(br => br.active !== false).length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Active</h3>
              {[...bankrolls.filter(br => br.active !== false)].sort((a, b) => b.numBets - a.numBets).map((br) => (
                <BankrollCard key={br.id} br={br} navigate={navigate} ongoingCount={ongoingCounts[br.id] ?? 0} />
              ))}
            </div>
          )}

          {bankrolls.filter(br => br.active === false).length > 0 && (
            <Collapsible>
              <CollapsibleTrigger className="flex items-center gap-2 group w-full">
                <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Disabled</h3>
                <ChevronDown className="w-4 h-4 text-muted-foreground transition-transform group-data-[state=open]:rotate-180" />
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-3 mt-3">
                {[...bankrolls.filter(br => br.active === false)].sort((a, b) => b.numBets - a.numBets).map((br) => (
                  <BankrollCard key={br.id} br={br} navigate={navigate} disabled ongoingCount={ongoingCounts[br.id] ?? 0} />
                ))}
              </CollapsibleContent>
            </Collapsible>
          )}
        </>
        }
      </main>
    </div>);

};

export default Index;
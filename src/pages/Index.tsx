import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useBankrolls } from "@/hooks/useBankrolls";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BarChart3, Plus, Trash2, ArrowRight, Wallet, X } from "lucide-react";

const Index = () => {
  const { bankrolls, addBankroll, deleteBankroll } = useBankrolls();
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const navigate = useNavigate();

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !amount) return;
    const bankroll = await addBankroll(name.trim(), parseFloat(amount));
    if (!bankroll) return;
    setName("");
    setAmount("");
    setShowForm(false);
    navigate(`/bankroll/${bankroll.id}`);
  };

  return (
    <div className="min-h-screen bg-[#0e242a]">
      <header className="border-b border-border">
        <div className="container max-w-4xl mx-auto px-4 py-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-foreground tracking-tight">BetTracker</h1>
            <p className="text-xs text-muted-foreground">Track your bets, maximize your edge</p>
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input placeholder="e.g. Football Strategy" value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Initial Amount (€)</Label>
                <Input type="number" step="0.01" min="0" placeholder="e.g. 500" value={amount} onChange={(e) => setAmount(e.target.value)} />
              </div>
              <div className="flex items-end">
                <Button type="submit" className="w-full">Create</Button>
              </div>
            </div>
          </form>
        }

        {bankrolls.length === 0 && !showForm ?
        <div className="rounded-lg bg-card border border-border p-12 text-center animate-fade-in">
            <Wallet className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground text-lg">No bankrolls yet.</p>
            <p className="text-sm text-muted-foreground">Create your first bankroll to start tracking bets!</p>
          </div> :

        <div className="space-y-3">
            {bankrolls.map((br) =>
          <div
            key={br.id}
            className="rounded-lg bg-card border border-border p-5 flex flex-col md:flex-row md:items-center gap-4 animate-fade-in hover:border-primary/30 transition-colors cursor-pointer group"
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
                    <p className="text-xs text-muted-foreground">Initial</p>
                    <p className="text-foreground">€{br.initialValue.toFixed(2)}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground">Balance</p>
                    <p className={br.balance >= 0 ? "text-win" : "text-loss"}>€{(br.initialValue + br.balance).toFixed(2)}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground">P&L</p>
                    <p className={br.balance >= 0 ? "text-win" : "text-loss"}>{br.balance >= 0 ? "+" : ""}€{br.balance.toFixed(2)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                variant="ghost"
                size="icon"
                className="text-muted-foreground hover:text-loss"
                onClick={(e) => {e.stopPropagation();deleteBankroll(br.id);}}>

                    <Trash2 className="w-4 h-4" />
                  </Button>
                  <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
              </div>
          )}
          </div>
        }
      </main>
    </div>);

};

export default Index;
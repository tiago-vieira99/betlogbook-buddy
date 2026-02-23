import { useState } from "react";
import { Bet, BetResult } from "@/types/bet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, X } from "lucide-react";

interface AddBetFormProps {
  onAdd: (bet: Omit<Bet, "id">) => void;
}

export function AddBetForm({ onAdd }: AddBetFormProps) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    odds: "",
    stake: "",
    result: "pending" as BetResult,
    date: new Date().toISOString().split("T")[0],
    comment: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.odds || !form.stake) return;
    onAdd({
      odds: parseFloat(form.odds),
      stake: parseFloat(form.stake),
      result: form.result,
      date: form.date,
      comment: form.comment || undefined,
    });
    setForm({
      odds: "",
      stake: "",
      result: "pending",
      date: new Date().toISOString().split("T")[0],
      comment: "",
    });
    setOpen(false);
  };

  if (!open) {
    return (
      <Button onClick={() => setOpen(true)} className="gap-2">
        <Plus className="w-4 h-4" /> New Bet
      </Button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-lg bg-card border border-border p-5 animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-foreground">Add New Bet</h3>
        <Button type="button" variant="ghost" size="icon" onClick={() => setOpen(false)}>
          <X className="w-4 h-4" />
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="space-y-2">
          <Label>Odds (decimal)</Label>
          <Input type="number" step="0.01" min="1" placeholder="e.g. 1.85" value={form.odds} onChange={(e) => setForm({ ...form, odds: e.target.value })} />
        </div>
        <div className="space-y-2">
          <Label>Stake ($)</Label>
          <Input type="number" step="0.01" min="0" placeholder="e.g. 50" value={form.stake} onChange={(e) => setForm({ ...form, stake: e.target.value })} />
        </div>
        <div className="space-y-2">
          <Label>Date</Label>
          <Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
        </div>
        <div className="space-y-2">
          <Label>Result</Label>
          <Select value={form.result} onValueChange={(v) => setForm({ ...form, result: v as BetResult })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">⏳ Pending</SelectItem>
              <SelectItem value="win">✅ Win</SelectItem>
              <SelectItem value="loss">❌ Loss</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Comment <span className="text-muted-foreground">(optional)</span></Label>
          <Input placeholder="e.g. Good value bet" value={form.comment} onChange={(e) => setForm({ ...form, comment: e.target.value })} />
        </div>
      </div>
      <div className="mt-4 flex justify-end">
        <Button type="submit">Add Bet</Button>
      </div>
    </form>
  );
}

import { useState } from "react";
import { Bet, BetStatus } from "@/types/bet";
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
  const today = new Date();
  const todayStr = `${String(today.getDate()).padStart(2, "0")}/${String(today.getMonth() + 1).padStart(2, "0")}/${today.getFullYear()}`;

  const [form, setForm] = useState({
    odd: "",
    stake: "",
    status: "PENDING" as BetStatus,
    date: todayStr,
    comment: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.odd || !form.stake) return;
    onAdd({
      bankrollID: 0, // Will be set by the hook/API
      odd: parseFloat(form.odd),
      stake: parseFloat(form.stake),
      balance: 0, // Calculated by the API
      status: form.status,
      date: form.date,
      comment: form.comment || "",
    });
    setForm({
      odd: "",
      stake: "",
      status: "PENDING",
      date: todayStr,
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
          <Label>Odd (decimal)</Label>
          <Input type="number" step="0.01" min="1" placeholder="e.g. 1.85" value={form.odd} onChange={(e) => setForm({ ...form, odd: e.target.value })} />
        </div>
        <div className="space-y-2">
          <Label>Stake ($)</Label>
          <Input type="number" step="0.01" min="0" placeholder="e.g. 50" value={form.stake} onChange={(e) => setForm({ ...form, stake: e.target.value })} />
        </div>
        <div className="space-y-2">
          <Label>Date (DD/MM/YYYY)</Label>
          <Input placeholder="e.g. 01/10/2022" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
        </div>
        <div className="space-y-2">
          <Label>Status</Label>
          <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as BetStatus })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="PENDING">⏳ Pending</SelectItem>
              <SelectItem value="WON">✅ Won</SelectItem>
              <SelectItem value="LOST">❌ Lost</SelectItem>
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

import { useState } from "react";
import { Bet } from "@/types/bet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Plus, X, CalendarIcon } from "lucide-react";
import { format, parse } from "date-fns";
import { cn } from "@/lib/utils";

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
    date: todayStr,
    comment: "",
  });

  const parseDate = (dateStr: string): Date | undefined => {
    try {
      return parse(dateStr, "dd/MM/yyyy", new Date());
    } catch {
      return undefined;
    }
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setForm({ ...form, date: format(date, "dd/MM/yyyy") });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.odd || !form.stake) return;
    onAdd({
      bankrollID: 0,
      odd: parseFloat(form.odd),
      stake: parseFloat(form.stake),
      balance: 0,
      status: "ONGOING",
      date: form.date,
      comment: form.comment || "",
    });
    setForm({
      odd: "",
      stake: "",
      date: todayStr,
      comment: "",
    });
  };

  if (!open) {
    return (
      <Button onClick={() => setOpen(true)} className="gap-2">
        <Plus className="w-4 h-4" /> New Bet
      </Button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-lg bg-card border border-border p-5 animate-fade-in w-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-foreground">Add New Bet</h3>
        <Button type="button" variant="ghost" size="icon" onClick={() => setOpen(false)}>
          <X className="w-4 h-4" />
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="space-y-2">
          <Label>Odd (decimal)</Label>
          <Input inputMode="decimal" type="number" step="0.01" min="1" placeholder="e.g. 1.85" value={form.odd} onChange={(e) => setForm({ ...form, odd: e.target.value })} />
        </div>
        <div className="space-y-2">
          <Label>Stake (€)</Label>
          <Input inputMode="decimal" type="number" step="0.01" min="1" placeholder="e.g. 50" value={form.stake} onChange={(e) => setForm({ ...form, stake: e.target.value })} />
        </div>
        <div className="space-y-2">
          <Label>Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !form.date && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {form.date || "Pick a date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={parseDate(form.date)}
                onSelect={handleDateSelect}
                initialFocus
                className={cn("p-3 pointer-events-auto")}
              />
            </PopoverContent>
          </Popover>
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

import { useState, useEffect } from "react";
import { Bankroll } from "@/types/bet";

const STORAGE_KEY = "bettracker_bankrolls";

export function useBankrolls() {
  const [bankrolls, setBankrolls] = useState<Bankroll[]>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(bankrolls));
  }, [bankrolls]);

  const addBankroll = (name: string, initialAmount: number) => {
    const bankroll: Bankroll = {
      id: crypto.randomUUID(),
      name,
      initialAmount,
      createdAt: new Date().toISOString().split("T")[0],
    };
    setBankrolls((prev) => [bankroll, ...prev]);
    return bankroll;
  };

  const deleteBankroll = (id: string) => {
    setBankrolls((prev) => prev.filter((b) => b.id !== id));
    localStorage.removeItem(`bettracker_bets_${id}`);
  };

  const getBankroll = (id: string) => bankrolls.find((b) => b.id === id);

  return { bankrolls, addBankroll, deleteBankroll, getBankroll };
}

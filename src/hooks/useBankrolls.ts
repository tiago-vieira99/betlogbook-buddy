import { useState, useEffect, useCallback } from "react";
import { Bankroll } from "@/types/bet";
import { fetchBankrolls, fetchBankroll, createBankroll, deleteBankrollApi } from "@/services/api";
import { toast } from "sonner";

export function useBankrolls() {
  const [bankrolls, setBankrolls] = useState<Bankroll[]>([]);
  const [loading, setLoading] = useState(true);

  const loadBankrolls = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchBankrolls();
      setBankrolls(data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load bankrolls");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBankrolls();
  }, [loadBankrolls]);

  const addBankroll = async (name: string, initialValue: number, description?: string): Promise<Bankroll | null> => {
    try {
      const bankroll = await createBankroll(name, initialValue, description);
      setBankrolls((prev) => [bankroll, ...prev]);
      return bankroll;
    } catch (err) {
      console.error(err);
      toast.error("Failed to create bankroll");
      return null;
    }
  };

  const deleteBankroll = async (id: number) => {
    try {
      await deleteBankrollApi(id);
      setBankrolls((prev) => prev.filter((b) => b.id !== id));
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete bankroll");
    }
  };

  const getBankroll = (id: number) => bankrolls.find((b) => b.id === id);

  const refreshBankroll = async (id: number) => {
    try {
      const updated = await fetchBankroll(id);
      if (updated) {
        setBankrolls((prev) => prev.map((b) => (b.id === id ? updated : b)));
      }
    } catch (err) {
      console.error(err);
    }
  };

  return { bankrolls, addBankroll, deleteBankroll, getBankroll, refreshBankroll, loading };
}

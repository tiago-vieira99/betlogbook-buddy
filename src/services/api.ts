import { Bankroll, Bet } from "@/types/bet";

// ============================================================
// 🔧 CONFIGURATION — Edit the base URL to point to your API
// ============================================================
const API_BASE_URL = "https://your-api-url.com/api"; // <-- EDIT THIS

// Optional: Add your auth headers or API key here
function getHeaders(): HeadersInit {
  return {
    "Content-Type": "application/json",
    // "Authorization": "Bearer YOUR_TOKEN_HERE",  // <-- UNCOMMENT & EDIT
    // "x-api-key": "YOUR_API_KEY_HERE",           // <-- UNCOMMENT & EDIT
  };
}

// ============================================================
// 📦 BANKROLL ENDPOINTS
// ============================================================

export async function fetchBankrolls(): Promise<Bankroll[]> {
  const res = await fetch(`${API_BASE_URL}/bankrolls`, {
    method: "GET",
    headers: getHeaders(),
  });
  if (!res.ok) throw new Error("Failed to fetch bankrolls");
  return res.json();
}

export async function fetchBankroll(id: number): Promise<Bankroll | null> {
  const res = await fetch(`${API_BASE_URL}/bankrolls/${id}`, {
    method: "GET",
    headers: getHeaders(),
  });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error("Failed to fetch bankroll");
  return res.json();
}

export async function createBankroll(
  name: string,
  initialValue: number
): Promise<Bankroll> {
  const res = await fetch(`${API_BASE_URL}/bankrolls`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({ name, initialValue }),
  });
  if (!res.ok) throw new Error("Failed to create bankroll");
  return res.json();
}

export async function deleteBankrollApi(id: number): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/bankrolls/${id}`, {
    method: "DELETE",
    headers: getHeaders(),
  });
  if (!res.ok) throw new Error("Failed to delete bankroll");
}

// ============================================================
// 🎲 BET ENDPOINTS
// ============================================================

export async function fetchBets(bankrollId: number): Promise<Bet[]> {
  const res = await fetch(`${API_BASE_URL}/bankrolls/${bankrollId}/bets`, {
    method: "GET",
    headers: getHeaders(),
  });
  if (!res.ok) throw new Error("Failed to fetch bets");
  return res.json();
}

export async function createBet(
  bankrollId: number,
  bet: Omit<Bet, "id">
): Promise<Bet> {
  const res = await fetch(`${API_BASE_URL}/bankrolls/${bankrollId}/bets`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(bet),
  });
  if (!res.ok) throw new Error("Failed to create bet");
  return res.json();
}

export async function updateBetApi(
  bankrollId: number,
  betId: number,
  updates: Partial<Bet>
): Promise<Bet> {
  const res = await fetch(
    `${API_BASE_URL}/bankrolls/${bankrollId}/bets/${betId}`,
    {
      method: "PATCH",
      headers: getHeaders(),
      body: JSON.stringify(updates),
    }
  );
  if (!res.ok) throw new Error("Failed to update bet");
  return res.json();
}

export async function deleteBetApi(
  bankrollId: number,
  betId: number
): Promise<void> {
  const res = await fetch(
    `${API_BASE_URL}/bankrolls/${bankrollId}/bets/${betId}`,
    {
      method: "DELETE",
      headers: getHeaders(),
    }
  );
  if (!res.ok) throw new Error("Failed to delete bet");
}

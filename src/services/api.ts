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
// 📦 BANKROLL ENDPOINTS — Edit paths to match your API routes
// ============================================================

export async function fetchBankrolls(): Promise<Bankroll[]> {
  const res = await fetch(`${API_BASE_URL}/bankrolls`, {
    // <-- EDIT PATH
    method: "GET",
    headers: getHeaders(),
  });
  if (!res.ok) throw new Error("Failed to fetch bankrolls");
  return res.json(); // <-- Adjust if your API wraps data, e.g. return (await res.json()).data
}

export async function fetchBankroll(id: string): Promise<Bankroll | null> {
  const res = await fetch(`${API_BASE_URL}/bankrolls/${id}`, {
    // <-- EDIT PATH
    method: "GET",
    headers: getHeaders(),
  });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error("Failed to fetch bankroll");
  return res.json(); // <-- Adjust if needed
}

export async function createBankroll(
  name: string,
  initialAmount: number
): Promise<Bankroll> {
  const res = await fetch(`${API_BASE_URL}/bankrolls`, {
    // <-- EDIT PATH
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({ name, initialAmount }), // <-- Adjust field names to match your API
  });
  if (!res.ok) throw new Error("Failed to create bankroll");
  return res.json(); // <-- Should return the created Bankroll object with id, name, initialAmount, createdAt
}

export async function deleteBankrollApi(id: string): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/bankrolls/${id}`, {
    // <-- EDIT PATH
    method: "DELETE",
    headers: getHeaders(),
  });
  if (!res.ok) throw new Error("Failed to delete bankroll");
}

// ============================================================
// 🎲 BET ENDPOINTS — Edit paths to match your API routes
// ============================================================

export async function fetchBets(bankrollId: string): Promise<Bet[]> {
  const res = await fetch(
    `${API_BASE_URL}/bankrolls/${bankrollId}/bets`, // <-- EDIT PATH
    {
      method: "GET",
      headers: getHeaders(),
    }
  );
  if (!res.ok) throw new Error("Failed to fetch bets");
  return res.json(); // <-- Adjust if your API wraps data
}

export async function createBet(
  bankrollId: string,
  bet: Omit<Bet, "id">
): Promise<Bet> {
  const res = await fetch(
    `${API_BASE_URL}/bankrolls/${bankrollId}/bets`, // <-- EDIT PATH
    {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(bet), // <-- Adjust field names if needed (odds, stake, result, date, comment)
    }
  );
  if (!res.ok) throw new Error("Failed to create bet");
  return res.json(); // <-- Should return the created Bet object with id
}

export async function updateBetApi(
  bankrollId: string,
  betId: string,
  updates: Partial<Bet>
): Promise<Bet> {
  const res = await fetch(
    `${API_BASE_URL}/bankrolls/${bankrollId}/bets/${betId}`, // <-- EDIT PATH
    {
      method: "PATCH", // <-- Change to PUT if your API uses PUT
      headers: getHeaders(),
      body: JSON.stringify(updates),
    }
  );
  if (!res.ok) throw new Error("Failed to update bet");
  return res.json();
}

export async function deleteBetApi(
  bankrollId: string,
  betId: string
): Promise<void> {
  const res = await fetch(
    `${API_BASE_URL}/bankrolls/${bankrollId}/bets/${betId}`, // <-- EDIT PATH
    {
      method: "DELETE",
      headers: getHeaders(),
    }
  );
  if (!res.ok) throw new Error("Failed to delete bet");
}

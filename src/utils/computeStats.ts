import { Bet, Bankroll } from "@/types/bet";

function parseDateToISO(dateStr: string): string {
  const [d, m, y] = dateStr.split("/");
  return `${y}-${m}-${d}`;
}

export function computeStatsFromBets(
  bets: Bet[],
  baseBankroll: Bankroll,
  selectedMonth: string
): Bankroll {
  if (selectedMonth === "all") return baseBankroll;

  const settled = bets
    .filter((b) => b.status !== "ONGOING")
    .sort((a, b) => parseDateToISO(a.date).localeCompare(parseDateToISO(b.date)));

  const monthBets = settled.filter(
    (b) => parseDateToISO(b.date).slice(0, 7) === selectedMonth
  );
  const monthOngoing = bets.filter(
    (b) => b.status === "ONGOING" && parseDateToISO(b.date).slice(0, 7) === selectedMonth
  );
  const allMonthBets = [...monthBets, ...monthOngoing];

  if (allMonthBets.length === 0) return baseBankroll;

  const greens = monthBets.filter((b) => b.status === "WON");
  const reds = monthBets.filter((b) => b.status === "LOST");
  const numBets = monthBets.length;

  const greensRate = numBets > 0 ? (greens.length / numBets) * 100 : 0;
  const redsRate = numBets > 0 ? (reds.length / numBets) * 100 : 0;

  let balance = 0;
  let totalInvested = 0;
  for (const bet of monthBets) {
    if (bet.status === "WON") balance += bet.stake * (bet.odd - 1);
    else balance -= bet.stake;
    totalInvested += bet.stake;
  }

  const roi = totalInvested > 0 ? (balance / totalInvested) * 100 : 0;

  const oddAvg = numBets > 0 ? monthBets.reduce((s, b) => s + b.odd, 0) / numBets : 0;
  const stakeAvg = numBets > 0 ? monthBets.reduce((s, b) => s + b.stake, 0) / numBets : 0;

  // Streaks
  let longestGreenSeries = 0, longestRedSeries = 0, curGreen = 0, curRed = 0;
  for (const bet of monthBets) {
    if (bet.status === "WON") { curGreen++; curRed = 0; longestGreenSeries = Math.max(longestGreenSeries, curGreen); }
    else { curRed++; curGreen = 0; longestRedSeries = Math.max(longestRedSeries, curRed); }
  }

  const profits = greens.map((b) => b.stake * (b.odd - 1));
  const losses = reds.map((b) => b.stake);

  const biggestProfit = profits.length > 0 ? Math.max(...profits) : 0;
  const biggestExpense = losses.length > 0 ? Math.max(...losses) : 0;
  const biggestOdd = numBets > 0 ? Math.max(...monthBets.map((b) => b.odd)) : 0;
  const biggestStake = numBets > 0 ? Math.max(...monthBets.map((b) => b.stake)) : 0;
  const biggestGreenOdd = greens.length > 0 ? Math.max(...greens.map((b) => b.odd)) : 0;

  // Calculate bankroll at start of month
  let bankAtMonthStart = baseBankroll.initialValue;
  for (const bet of settled) {
    if (parseDateToISO(bet.date).slice(0, 7) >= selectedMonth) break;
    if (bet.status === "WON") bankAtMonthStart += bet.stake * (bet.odd - 1);
    else bankAtMonthStart -= bet.stake;
  }

  const progression = bankAtMonthStart > 0 ? (balance / bankAtMonthStart) * 100 : 0;

  return {
    ...baseBankroll,
    numBets,
    balance: parseFloat(balance.toFixed(2)),
    roi: parseFloat(roi.toFixed(2)),
    progression: parseFloat(progression.toFixed(2)),
    greensRate: parseFloat(greensRate.toFixed(2)),
    redsRate: parseFloat(redsRate.toFixed(2)),
    oddAvg: parseFloat(oddAvg.toFixed(2)),
    stakeAvg: parseFloat(stakeAvg.toFixed(2)),
    longestGreenSeries,
    longestRedSeries,
    biggestProfit: parseFloat(biggestProfit.toFixed(2)),
    biggestExpense: parseFloat(biggestExpense.toFixed(2)),
    biggestOdd: parseFloat(biggestOdd.toFixed(2)),
    biggestStake: parseFloat(biggestStake.toFixed(2)),
    biggestGreenOdd: parseFloat(biggestGreenOdd.toFixed(2)),
    totalInvested: parseFloat(totalInvested.toFixed(2)),
  };
}

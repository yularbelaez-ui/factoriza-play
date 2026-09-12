export interface StudentRank {
  name: string;
  icon: string;
  minXP: number;
  maxXP: number | null;
  nextName: string | null;
  nextIcon: string | null;
  nextXP: number | null;
  progressPercent: number;
}

const RANKS = [
  { name: "Bronce", icon: "🥉", minXP: 0, maxXP: 500 },
  { name: "Plata", icon: "🥈", minXP: 501, maxXP: 1200 },
  { name: "Oro", icon: "🥇", minXP: 1201, maxXP: 2200 },
  { name: "Diamante", icon: "💎", minXP: 2201, maxXP: 3500 },
  { name: "Heroico", icon: "🔥", minXP: 3501, maxXP: 5000 },
  { name: "Gran Maestro", icon: "👑", minXP: 5001, maxXP: null },
] as const;

export function getRankForXp(xp: number): StudentRank {
  const safeXp = Math.max(0, xp);
  const index = Math.max(0, RANKS.findIndex((rank) =>
    rank.maxXP === null || safeXp <= rank.maxXP
  ));
  const rank = RANKS[index];
  const next = RANKS[index + 1];
  return {
    ...rank,
    nextName: next?.name ?? null,
    nextIcon: next?.icon ?? null,
    nextXP: next?.minXP ?? null,
    progressPercent: next
      ? Math.max(0, Math.min(100, Math.round(((safeXp - rank.minXP) / (next.minXP - rank.minXP)) * 100)))
      : 100,
  };
}

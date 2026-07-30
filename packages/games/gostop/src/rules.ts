import type { GostopState } from "./state.js";

// ── Card helpers ──────────────────────────────────────────────────────────────

/** Card code: `MM-T` e.g. "01-b"=1월광, "03-d"=3월띠, "12-p"=12월피 */

export const MONTHS = [1,2,3,4,5,6,7,8,9,10,11,12] as const;

// Each month has: 1 광(b) or none, 1 or more 띠(d), 1 쌍피(j) or more 피(p)
// Standard distribution (48 cards total):
// Months with 광: 1,3,8,11,12
// Months with 고도리 띠: 2(빨간),4(빨간),8(파란), and more
// For simplicity, standardized distribution:

const DECK_TEMPLATE: [number, string][] = [];

const BRIGHT_MONTHS = new Set([1, 3, 8, 11, 12]);
// Ribbon months (simplified): all months have a ribbon card
// Red ribbons: 1,2,3 (red 단); Blue ribbons: 6,9,10 (청단)
// Plant ribbons: 4,5,7
// Special: 고도리 = 2월띠+4월띠+8월띠

for (const m of MONTHS) {
  const mm = String(m).padStart(2, "0");
  if (BRIGHT_MONTHS.has(m)) {
    DECK_TEMPLATE.push([m, `${mm}-b`]); // 광
  }
  DECK_TEMPLATE.push([m, `${mm}-d`]); // 띠 (ribbon)
  DECK_TEMPLATE.push([m, `${mm}-j`]); // 쌍피 (double chaff)
  DECK_TEMPLATE.push([m, `${mm}-p`]); // 피 (chaff)
}
// Add extra 피 for non-bright months (each non-bright month gets 4 cards total)
// With 광: 광+띠+쌍피+피 = 4 cards ✓
// Without 광: 띠+쌍피+피 = 3 cards → add one more 피
for (const m of MONTHS) {
  if (!BRIGHT_MONTHS.has(m)) {
    const mm = String(m).padStart(2, "0");
    DECK_TEMPLATE.push([m, `${mm}-p2`]); // second 피
  }
}
// Total: 5 months × 4 + 7 months × 4 = 48 cards ✓

export function createDeck(): string[] {
  return DECK_TEMPLATE.map(([, code]) => code);
}

export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}

export function getMonth(card: string): number {
  return parseInt(card.split("-")[0] ?? "0", 10);
}

export function getType(card: string): string {
  return card.split("-")[1] ?? "";
}

export function isBright(card: string): boolean { return getType(card) === "b"; }
export function isRibbon(card: string): boolean { return getType(card) === "d"; }
export function isDoubleChaff(card: string): boolean { return getType(card) === "j"; }
export function isChaff(card: string): boolean {
  const t = getType(card);
  return t === "p" || t === "p2" || t === "j";
}

// Red ribbons: months 1, 2, 3
// Blue ribbons: months 6, 9, 10
// 고도리: months 2, 4, 8 ribbons

export function isRedRibbon(card: string): boolean {
  return isRibbon(card) && [1, 2, 3].includes(getMonth(card));
}
export function isBlueRibbon(card: string): boolean {
  return isRibbon(card) && [6, 9, 10].includes(getMonth(card));
}
export function isGodoriRibbon(card: string): boolean {
  return isRibbon(card) && [2, 4, 8].includes(getMonth(card));
}

// ── Pile helpers ──────────────────────────────────────────────────────────────

export function toPile(csv: string): string[] {
  return csv ? csv.split(",").filter(Boolean) : [];
}

export function fromPile(cards: string[]): string {
  return cards.join(",");
}

export function getHand(state: GostopState, idx: number): string[] {
  return toPile(state.hands[idx] ?? "");
}

export function setHand(state: GostopState, idx: number, cards: string[]): void {
  state.hands[idx] = fromPile(cards);
}

export function getCaptures(state: GostopState, idx: number): string[] {
  return toPile(state.captures[idx] ?? "");
}

export function setCaptures(state: GostopState, idx: number, cards: string[]): void {
  state.captures[idx] = fromPile(cards);
}

// ── Matching ──────────────────────────────────────────────────────────────────

/** Cards on the field that match the given month. */
export function fieldMatchesFor(field: string[], month: number): string[] {
  return field.filter((c) => getMonth(c) === month);
}

// ── Scoring ──────────────────────────────────────────────────────────────────

export interface Score {
  brights: number;
  ribbons: number;
  chaff: number; // 쌍피 counts as 2
  godori: boolean;
  redDan: boolean;
  blueDan: boolean;
  total: number;
}

export function computeScore(captures: string[]): Score {
  const brights = captures.filter(isBright).length;
  const ribbons = captures.filter(isRibbon).length;
  const chaffCount = captures.reduce((sum, c) => sum + (isDoubleChaff(c) ? 2 : isChaff(c) ? 1 : 0), 0);

  const godori = [2, 4, 8].every((m) => captures.some((c) => getMonth(c) === m && isRibbon(c)));
  const redDan = [1, 2, 3].every((m) => captures.some((c) => getMonth(c) === m && isRibbon(c)));
  const blueDan = [6, 9, 10].every((m) => captures.some((c) => getMonth(c) === m && isRibbon(c)));

  let total = 0;

  // 광 scoring
  if (brights >= 5) total += 15;
  else if (brights === 4) total += 4;
  else if (brights === 3) total += 3;

  // 띠 scoring: 5+ ribbons = (ribbons - 4) points
  if (ribbons >= 5) total += ribbons - 4;

  // Bonus: 고도리 = 5pt, 단 = 3pt extra
  if (godori) total += 5;
  if (redDan) total += 3;
  if (blueDan) total += 3;

  // 피 scoring: 10+ = (chaff - 9) points
  if (chaffCount >= 10) total += chaffCount - 9;

  return { brights, ribbons, chaff: chaffCount, godori, redDan, blueDan, total };
}

// ── Month name labels ─────────────────────────────────────────────────────────

export const MONTH_NAMES = [
  "", "1월", "2월", "3월", "4월", "5월", "6월",
  "7월", "8월", "9월", "10월", "11월", "12월",
];

export const TYPE_LABELS: Record<string, string> = {
  b: "광", d: "띠", j: "쌍피", p: "피", p2: "피",
};

export const MONTH_EMOJI: Record<number, string> = {
  1: "🌸", 2: "🎋", 3: "🌸", 4: "🌿", 5: "🌾", 6: "🦋",
  7: "🐗", 8: "🌕", 9: "🍁", 10: "🦌", 11: "🌧️", 12: "🌊",
};

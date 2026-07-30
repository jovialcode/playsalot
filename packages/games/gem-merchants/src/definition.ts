import type { GameDefinition, GameMoveResult, GameOverResult, PlayerId } from "@playsalot/game-engine-core";
import { COLORS, GemMerchantsState, type GemColor, type GemMerchantsMove } from "./state.js";

type Card = { id: string; name: string; bonus: GemColor; points: number; cost: number[] };
const CARDS: Card[] = [
  ["광산","r",1,[0,2,1,1]],["항구","b",1,[2,0,1,1]],["정원","g",1,[1,1,0,2]],["성소","w",1,[1,2,1,0]],
  ["루비 궁전","r",2,[0,3,2,2]],["푸른 시장","b",2,[3,0,2,2]],["비취 탑","g",2,[2,2,0,3]],["백은 길드","w",2,[2,3,2,0]],
  ["왕실 금고","r",3,[0,4,3,3]],["별빛 항로","b",3,[4,0,3,3]],["숲의 계약","g",3,[3,3,0,4]],["달빛 저택","w",3,[3,4,3,0]],
].map(([name, bonus, points, cost], i) => ({ id: `c${i}`, name: name as string, bonus: bonus as GemColor, points: points as number, cost: cost as number[] }));

const parse = (csv: string) => csv.split(",").map(Number);
const stringify = (values: number[]) => values.join(",");
const cardById = (id: string) => CARDS.find((card) => card.id === id);
function draw(state: GemMerchantsState) { const deck = state.deck ? state.deck.split(",") : []; const id = deck.pop(); state.deck = deck.join(","); if (id) state.market.push(id); }
function playerName(state: GemMerchantsState, index: number) { return state.playerNames[index] ?? "상인"; }
function next(state: GemMerchantsState) { state.turnIndex = (state.turnIndex + 1) % state.players.length; state.message = `${playerName(state, state.turnIndex)}님의 차례예요.`; }
function canAfford(card: Card, gems: number[], bonuses: number[]) { return card.cost.every((cost, i) => cost <= gems[i]! + bonuses[i]!); }

export const gemMerchantsDefinition: GameDefinition<GemMerchantsState, GemMerchantsMove> = {
  id: "gem-merchants", displayName: "왕국의 보석 상단", minPlayers: 2, maxPlayers: 2,
  createInitialState: () => new GemMerchantsState(),
  addPlayer(state, player) {
    const id = typeof player === "string" ? player : player.id;
    state.players.push(id); state.playerNames.push(typeof player === "string" ? player : player.displayName); state.gems.push("0,0,0,0"); state.bonuses.push("0,0,0,0"); state.scores.push(0);
    if (state.players.length === 2) { state.deck = [...CARDS].sort(() => Math.random() - 0.5).map((card) => card.id).join(","); for (let i = 0; i < 4; i += 1) draw(state); state.message = `${playerName(state, 0)}님이 먼저 상단을 꾸립니다.`; }
  },
  applyMove(state, playerId, move): GameMoveResult {
    const player = state.players.indexOf(playerId);
    if (state.winnerId) return { ok: false, error: "이미 왕실의 선택이 끝났어요." };
    if (player < 0 || player !== state.turnIndex || state.players.length < 2) return { ok: false, error: "지금은 당신의 차례가 아니에요." };
    if (!move) return { ok: false, error: "행동을 선택해 주세요." };
    const gems = parse(state.gems[player] ?? "0,0,0,0"); const bank = parse(state.bank);
    if (move.action === "take") {
      const unique = [...new Set(move.colors)];
      if (unique.length < 1 || unique.length > 2 || unique.some((color) => !COLORS.includes(color))) return { ok: false, error: "서로 다른 보석을 1~2개 선택하세요." };
      if (unique.some((color) => bank[COLORS.indexOf(color)]! <= 0)) return { ok: false, error: "그 보석은 시장에 없어요." };
      unique.forEach((color) => { const i = COLORS.indexOf(color); gems[i]! += 1; bank[i]! -= 1; });
      state.gems[player] = stringify(gems); state.bank = stringify(bank); state.message = `${playerName(state, player)}님이 보석을 가져갔어요.`; next(state); return { ok: true };
    }
    const cardIndex = Array.from(state.market).indexOf(move.cardId); const card = cardById(move.cardId);
    if (cardIndex < 0 || !card) return { ok: false, error: "시장에 없는 상단 카드예요." };
    const bonuses = parse(state.bonuses[player] ?? "0,0,0,0");
    if (!canAfford(card, gems, bonuses)) return { ok: false, error: "보석이 부족해요. 먼저 시장에서 보석을 가져오세요." };
    card.cost.forEach((cost, i) => { const paid = Math.max(0, cost - bonuses[i]!); gems[i]! -= paid; bank[i]! += paid; });
    bonuses[COLORS.indexOf(card.bonus)]! += 1; state.gems[player] = stringify(gems); state.bonuses[player] = stringify(bonuses); state.bank = stringify(bank);
    state.scores[player] = (state.scores[player] ?? 0) + card.points; state.market.splice(cardIndex, 1); draw(state);
    if ((state.scores[player] ?? 0) >= 12) { state.winnerId = playerId; state.message = `${playerName(state, player)}님이 왕실의 최고 상인이 되었습니다!`; } else { state.message = `${card.name} 카드를 영입했어요. ${card.bonus.toUpperCase()} 할인 +1!`; next(state); }
    return { ok: true };
  },
  checkGameOver: (state): GameOverResult | null => state.winnerId ? { winnerId: state.winnerId } : null,
  getCurrentTurnPlayerId: (state): PlayerId | null => state.players.length === 2 && !state.winnerId ? state.players[state.turnIndex] ?? null : null,
  chooseBotMove(state, botId) {
    const player = state.players.indexOf(botId); const gems = parse(state.gems[player] ?? "0,0,0,0"); const bonuses = parse(state.bonuses[player] ?? "0,0,0,0");
    const affordable = Array.from(state.market).map(cardById).filter((card): card is Card => !!card && canAfford(card, gems, bonuses)).sort((a, b) => b.points - a.points)[0];
    if (affordable) return { action: "buy", cardId: affordable.id };
    const bank = parse(state.bank); const wanted = Array.from(state.market).map(cardById).filter((card): card is Card => !!card).sort((a, b) => b.points - a.points)[0];
    const colors = COLORS.filter((_, i) => bank[i]! > 0 && (wanted?.cost[i] ?? 0) > gems[i]! + bonuses[i]!).slice(0, 2); return { action: "take", colors: colors.length ? colors : COLORS.filter((_, i) => bank[i]! > 0).slice(0, 2) };
  },
};

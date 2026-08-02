import type { GameDefinition, GameMoveResult, GameOverResult, PlayerId } from "@playsalot/game-engine-core";
import { BOARD_SIZE, BurumableState, STARTING_CASH, type BurumableMove } from "./state.js";

export const SPACES = [
  "출발", "서울", "부산", "황금열쇠", "제주", "도쿄", "휴식", "파리", "런던", "황금열쇠",
  "뉴욕", "시드니", "무인도", "로마", "베를린", "황금열쇠", "홍콩", "싱가포르", "세계여행", "두바이",
];
const PRICES = [0, 180, 150, 0, 220, 250, 0, 280, 300, 0, 330, 260, 0, 290, 310, 0, 340, 360, 0, 270];
const price = (space: number) => PRICES[space] ?? 0;
const isProperty = (space: number) => price(space) > 0;
const rent = (space: number, level: number) => Math.round((PRICES[space] ?? 0) * (0.3 + level * 0.25));

function activeCount(state: BurumableState) { return Array.from(state.bankrupt).filter((value) => value === 0).length; }
function nextPlayer(state: BurumableState) {
  for (let i = 1; i <= state.players.length; i += 1) {
    const index = (state.turnIndex + i) % state.players.length;
    if (state.bankrupt[index] === 0) { state.turnIndex = index; return; }
  }
}
function playerName(state: BurumableState, index: number) { return state.playerNames[index] ?? "플레이어"; }
function finishTurn(state: BurumableState, eventMessage?: string) {
  nextPlayer(state);
  state.phase = "roll";
  const nextTurn = `${playerName(state, state.turnIndex)}님의 차례: 주사위를 굴리세요.`;
  state.message = eventMessage ? `${eventMessage} 다음 ${nextTurn}` : nextTurn;
}
function chargeRent(state: BurumableState, playerIndex: number, amount: number, message: string) {
  const space = state.positions[playerIndex] ?? 0;
  const owner = state.owners[space] ?? -1;
  const remainingCash = (state.cash[playerIndex] ?? 0) - amount;
  state.cash[playerIndex] = remainingCash;
  if (owner >= 0) state.cash[owner] = (state.cash[owner] ?? 0) + amount;
  if (remainingCash <= 0) bankrupt(state, playerIndex);
  else finishTurn(state, message);
}
function resolveLanding(state: BurumableState, playerIndex: number) {
  const space = state.positions[playerIndex] ?? 0;
  const money = state.cash[playerIndex] ?? 0;
  if (space === 0) { state.cash[playerIndex] = money + 200; finishTurn(state, "출발점을 지나 보너스 ₩200을 받았어요!"); return; }
  if (space === 3 || space === 9 || space === 15) { const bonus = 120; state.cash[playerIndex] = money + bonus; finishTurn(state, `황금열쇠! ₩${bonus} 보너스를 받았어요.`); return; }
  if (space === 6) { finishTurn(state, "휴식 공간입니다. 한 턴 쉬어가세요."); return; }
  if (space === 12) { const penalty = 100; state.cash[playerIndex] = money - penalty; if (money - penalty <= 0) bankrupt(state, playerIndex); else finishTurn(state, `무인도 탈출 비용 ₩${penalty}!`); return; }
  if (space === 18) { state.positions[playerIndex] = 0; state.cash[playerIndex] = money + 200; finishTurn(state, "세계여행! 출발점으로 이동해 ₩200을 받았어요."); return; }
  const owner = state.owners[space] ?? -1;
  if (owner === -1) { state.phase = "buy"; state.message = `${SPACES[space] ?? "이 도시"}에 도착! ₩${price(space)}에 매입할까요?`; return; }
  if (owner === playerIndex) { state.phase = "buy"; state.message = `${SPACES[space] ?? "이 도시"} 내 땅입니다. 건물을 올릴 수 있어요.`; return; }
  const cost = rent(space, state.levels[space] ?? 0);
  state.phase = "visit";
  state.message = `${playerName(state, owner)}님의 ${SPACES[space] ?? "도시"}에 방문했어요! 통행료 ₩${cost.toLocaleString()} — 정중히 지불하거나 환대를 협상하세요.`;
}
function bankrupt(state: BurumableState, index: number) { state.bankrupt[index] = 1; for (let i = 0; i < BOARD_SIZE; i += 1) if (state.owners[i] === index) { state.owners[i] = -1; state.levels[i] = 0; } state.message = `${playerName(state, index)}님이 파산했습니다.`; if (activeCount(state) <= 1) state.winnerId = state.players.find((_, i) => state.bankrupt[i] === 0) ?? ""; else finishTurn(state); }

export const burumableDefinition: GameDefinition<BurumableState, BurumableMove> = {
  id: "burumable", displayName: "부루마블 스타일", minPlayers: 2, maxPlayers: 4,
  createInitialState: () => new BurumableState(),
  addPlayer(state, player) { const playerId = typeof player === "string" ? player : player.id; state.players.push(playerId); state.playerNames.push(typeof player === "string" ? player : player.displayName); state.positions.push(0); state.cash.push(STARTING_CASH); state.bankrupt.push(0); if (state.players.length >= 2) state.message = `${playerName(state, 0)}님의 차례: 주사위를 굴리세요.`; },
  applyMove(state, playerId, move): GameMoveResult {
    if (state.winnerId) return { ok: false, error: "게임이 이미 끝났어요." };
    const index = state.players.indexOf(playerId); if (index < 0 || state.bankrupt[index]) return { ok: false, error: "플레이할 수 없는 상태예요." };
    if (index !== state.turnIndex) return { ok: false, error: "상대방의 차례예요." };
    if (!move || !["roll", "buy", "pass", "build", "pay-rent", "negotiate-rent"].includes(move.action)) return { ok: false, error: "알 수 없는 행동이에요." };
    if (move.action === "roll") { if (state.phase !== "roll") return { ok: false, error: "먼저 현재 선택을 마무리하세요." }; const dice = Math.floor(Math.random() * 6) + 1; state.lastRoll = dice; const before = state.positions[index] ?? 0; state.positions[index] = (before + dice) % BOARD_SIZE; if (before + dice >= BOARD_SIZE) state.cash[index] = (state.cash[index] ?? 0) + 200; resolveLanding(state, index); return { ok: true }; }
    if (state.phase === "visit") {
      const space = state.positions[index] ?? 0;
      const owner = state.owners[space] ?? -1;
      if (owner < 0 || owner === index || !isProperty(space)) return { ok: false, error: "통행료를 정산할 땅이 아니에요." };
      const baseRent = rent(space, state.levels[space] ?? 0);
      if (move.action === "pay-rent") { chargeRent(state, index, baseRent, `${SPACES[space]}에 정중히 들러 통행료 ₩${baseRent.toLocaleString()}을 냈어요.`); return { ok: true }; }
      if (move.action === "negotiate-rent") {
        const welcomed = Math.random() < 0.55;
        const amount = Math.round(baseRent * (welcomed ? 0.6 : 1.2));
        const result = welcomed ? "집주인의 환대 성공! 40% 할인" : "협상은 실패… 특별 접대비 20% 추가";
        chargeRent(state, index, amount, `${result}으로 ₩${amount.toLocaleString()}을 냈어요.`);
        return { ok: true };
      }
      return { ok: false, error: "통행료를 지불하거나 환대를 협상하세요." };
    }
    if (state.phase !== "buy") return { ok: false, error: "지금은 주사위를 굴릴 차례예요." };
    const space = state.positions[index] ?? 0;
    if (move.action === "buy" && state.owners[space] === -1 && isProperty(space)) { if ((state.cash[index] ?? 0) < price(space)) return { ok: false, error: "보유금이 부족해요." }; state.cash[index] = (state.cash[index] ?? 0) - price(space); state.owners[space] = index; state.levels[space] = 1; state.message = `${SPACES[space] ?? "도시"}을(를) 매입했어요!`; finishTurn(state); return { ok: true }; }
    if (move.action === "build" && state.owners[space] === index) { const cost = Math.round(price(space) * 0.45); if ((state.cash[index] ?? 0) < cost) return { ok: false, error: "건설비가 부족해요." }; state.cash[index] = (state.cash[index] ?? 0) - cost; state.levels[space] = Math.min(4, (state.levels[space] ?? 0) + 1); state.message = `${SPACES[space] ?? "도시"} 건물을 올렸어요!`; finishTurn(state); return { ok: true }; }
    if (move.action === "pass") { finishTurn(state); return { ok: true }; }
    return { ok: false, error: "이 행동은 지금 할 수 없어요." };
  },
  checkGameOver(state): GameOverResult | null { return state.winnerId ? { winnerId: state.winnerId } : null; },
  getCurrentTurnPlayerId(state): PlayerId | null { return state.winnerId || state.players.length < 2 ? null : state.players[state.turnIndex] ?? null; },
  chooseBotMove(state, botId): BurumableMove { const index = state.players.indexOf(botId); if (state.phase === "roll") return { action: "roll" }; if (state.phase === "visit") return Math.random() < 0.35 ? { action: "negotiate-rent" } : { action: "pay-rent" }; const space = state.positions[index] ?? 0; if (state.owners[space] === -1 && (state.cash[index] ?? 0) >= price(space)) return { action: "buy" }; if (state.owners[space] === index && (state.levels[space] ?? 0) < 3 && (state.cash[index] ?? 0) > 800) return { action: "build" }; return { action: "pass" }; },
};

import { FRUITS, type Fruit, type HalliGalliState } from "./state.js";

export function cardFruit(card: string): Fruit {
  return card[0] as Fruit;
}

export function cardCount(card: string): number {
  return Number(card.slice(1));
}

/**
 * The real deck skews toward low counts (5 copies of count-1 down to 1 copy
 * of count-5 per fruit) so a sum of exactly 5 stays rare enough to be
 * exciting: 4 fruits * (5+4+3+2+1) = 60 cards.
 */
export function createDeck(): string[] {
  const deck: string[] = [];
  for (const fruit of FRUITS) {
    for (let count = 1; count <= 5; count += 1) {
      const quantity = 6 - count;
      for (let i = 0; i < quantity; i += 1) deck.push(`${fruit}${count}`);
    }
  }
  return deck;
}

export function shuffle(cards: string[]): string[] {
  const result = [...cards];
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j]!, result[i]!];
  }
  return result;
}

/** The single visible card per player right now: the last card of their face-up pile, if any. */
export function visibleTopCards(state: HalliGalliState): Array<string | undefined> {
  return state.players.map((_, idx) => {
    const pile = state.faceUp[idx];
    if (!pile) return undefined;
    const cards = pile.split(",");
    return cards[cards.length - 1];
  });
}

/**
 * A bell ring is justified when the currently visible top cards contain a
 * single fruit whose counts add up to exactly 5. Returns that fruit, or
 * null if nothing on the table currently matches.
 */
export function findMatchingFruit(topCards: Array<string | undefined>): Fruit | null {
  const totals = new Map<Fruit, number>();
  for (const card of topCards) {
    if (!card) continue;
    const fruit = cardFruit(card);
    totals.set(fruit, (totals.get(fruit) ?? 0) + cardCount(card));
  }
  for (const [fruit, total] of totals) {
    if (total === 5) return fruit;
  }
  return null;
}

import type { GameDefinition } from "./game-definition.js";
import type { Schema } from "@colyseus/schema";

/**
 * Central lookup so the generic BoardGameRoom never needs a per-game
 * branch: adding a game means registering a GameDefinition here, not
 * touching room/networking code.
 */
export class GameRegistry {
  /**
   * A registry necessarily stores definitions with different concrete state
   * and move types. Erase those types only at this boundary; game packages
   * retain their strongly typed GameDefinition implementations.
   */
  private readonly games = new Map<string, GameDefinition>();

  register<TState extends Schema, TMove>(definition: GameDefinition<TState, TMove>): void {
    if (this.games.has(definition.id)) {
      throw new Error(`Game "${definition.id}" is already registered`);
    }
    this.games.set(definition.id, definition as unknown as GameDefinition);
  }

  get(id: string): GameDefinition | undefined {
    return this.games.get(id);
  }

  require(id: string): GameDefinition {
    const definition = this.get(id);
    if (!definition) {
      throw new Error(`Unknown game id "${id}"`);
    }
    return definition;
  }

  list(): GameDefinition[] {
    return [...this.games.values()];
  }
}

export const gameRegistry = new GameRegistry();

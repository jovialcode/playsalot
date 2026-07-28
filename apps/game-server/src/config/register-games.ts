import { gameRegistry } from "@playsalot/game-engine-core";
import { omokDefinition } from "@playsalot/game-omok";

/**
 * Single place that wires concrete game packages into the registry.
 * Adding a new game = implement a GameDefinition in its own package,
 * then register it here — no other server code changes.
 */
export function registerGames(): void {
  gameRegistry.register(omokDefinition);
}

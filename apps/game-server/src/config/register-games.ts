import { gameRegistry } from "@playsalot/game-engine-core";
import { burumableDefinition } from "@playsalot/game-burumable";
import { halliGalliDefinition } from "@playsalot/game-halligalli";
import { omokDefinition } from "@playsalot/game-omok";
import { unoDefinition } from "@playsalot/game-uno";
import { yutnoriDefinition } from "@playsalot/game-yutnori";
import { battleshipDefinition } from "@playsalot/game-battleship";
import { gostopDefinition } from "@playsalot/game-gostop";
import { presidentDefinition } from "@playsalot/game-president";
import { gemMerchantsDefinition } from "@playsalot/game-gem-merchants";

/**
 * Single place that wires concrete game packages into the registry.
 * Adding a new game = implement a GameDefinition in its own package,
 * then register it here — no other server code changes.
 */
export function registerGames(): void {
  gameRegistry.register(omokDefinition);
  gameRegistry.register(burumableDefinition);
  gameRegistry.register(unoDefinition);
  gameRegistry.register(halliGalliDefinition);
  gameRegistry.register(yutnoriDefinition);
  gameRegistry.register(battleshipDefinition);
  gameRegistry.register(gostopDefinition);
  gameRegistry.register(presidentDefinition);
  gameRegistry.register(gemMerchantsDefinition);
}

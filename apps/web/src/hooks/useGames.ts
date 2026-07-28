import { useState, useEffect } from "react";
import type { GameCatalogEntry } from "@playsalot/shared-types";
import { GameService } from "@/services/game.service";

export function useGames() {
  const [games, setGames] = useState<GameCatalogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    GameService.fetchGames()
      .then(setGames)
      .finally(() => setLoading(false));
  }, []);

  return { games, loading };
}

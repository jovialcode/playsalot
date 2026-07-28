import { describe, expect, it } from "vitest";
import { createLobbyGames } from "./games";

describe("createLobbyGames", () => {
  it("marks only server-catalog games as playable and carries bot support", () => {
    const games = createLobbyGames([
      { id: "omok", displayName: "오목 (Omok)", minPlayers: 2, maxPlayers: 2, supportsBot: true },
    ]);

    expect(games.find((game) => game.id === "omok")).toMatchObject({
      isPlayable: true,
      supportsBot: true,
      playersLabel: "2인",
    });
    expect(games.find((game) => game.id === "chess")).toMatchObject({ isPlayable: false });
  });

  it("renders a safe default card for a server game without design metadata", () => {
    const games = createLobbyGames([
      { id: "checkers", displayName: "체커", minPlayers: 2, maxPlayers: 2, supportsBot: false },
    ]);

    expect(games.find((game) => game.id === "checkers")).toMatchObject({
      name: "체커",
      isPlayable: true,
      supportsBot: false,
    });
  });
});

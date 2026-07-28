import { useEffect, useRef, useState } from "react";
import type { Room } from "colyseus.js";
import type { GameCatalogEntry, GuestSession } from "@playsalot/shared-types";
import { GameService } from "@/services/game.service";
import { MatchState } from "@/types/lobby";
import { clearReconnectionToken } from "@/lib/reconnect";
import { supportsGameScreen } from "@/features/games/game-ui-registry";

export function useMatch(session: GuestSession | null, games: GameCatalogEntry[], onShowToast: (msg: string) => void) {
  const [room, setRoom] = useState<Room | null>(null);
  const [activeGameId, setActiveGameId] = useState<string | null>(null);
  const [pendingMatch, setPendingMatch] = useState<{ room: Room; gameId: string } | null>(null);
  const [matchingState, setMatchingState] = useState<MatchState>("idle");
  const [matchOpponent, setMatchOpponent] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const quickMatchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!session) return;
    
    // Initial reconnect attempt
    let cancelled = false;
    GameService.tryReconnect().then(rejoinedGame => {
        if (!cancelled && rejoinedGame) {
          setRoom(rejoinedGame.room);
          setActiveGameId(rejoinedGame.gameId);
        }
    });
    return () => {
      cancelled = true;
    };
  }, [session]);

  useEffect(() => () => {
    if (quickMatchTimer.current) clearTimeout(quickMatchTimer.current);
  }, []);

  const handlePlay = async (gameId: string, vsBot: boolean) => {
    if (!session) return;
    setError(null);
    
    const isImplemented = games.some(g => g.id === gameId);
    if (!isImplemented) {
      onShowToast("이 게임은 아직 준비 중이에요!");
      setMatchingState("idle");
      return;
    }
    if (!supportsGameScreen(gameId)) {
      onShowToast("이 게임 화면은 아직 준비 중이에요!");
      setMatchingState("idle");
      return;
    }

    try {
      const joinedRoom = await GameService.joinGame(gameId, session, vsBot);
      
      if (!vsBot) {
          setMatchOpponent("상대방");
          setMatchingState("found");
          setPendingMatch({ room: joinedRoom, gameId });
      } else {
          setRoom(joinedRoom);
          setActiveGameId(gameId);
          setMatchingState("idle");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "방에 참가하지 못했습니다.");
      setMatchingState("idle");
    }
  };

  const startQuickMatch = (gameId: string) => {
    setMatchingState("searching");
    if (quickMatchTimer.current) clearTimeout(quickMatchTimer.current);
    quickMatchTimer.current = setTimeout(() => {
        handlePlay(gameId, false);
    }, 1500);
  };

  const confirmMatchStart = () => {
      if (pendingMatch) {
          setRoom(pendingMatch.room);
          setActiveGameId(pendingMatch.gameId);
          setPendingMatch(null);
      }
      setMatchingState("idle");
  };

  const cancelMatch = () => {
    if (quickMatchTimer.current) clearTimeout(quickMatchTimer.current);
    setMatchingState("idle");
    if (pendingMatch) {
        pendingMatch.room.leave();
        setPendingMatch(null);
    }
  };

  const leaveRoom = () => {
      if (room) {
          room.leave();
          setRoom(null);
          setActiveGameId(null);
          clearReconnectionToken();
      }
  };

  return {
    room,
    activeGameId,
    matchingState,
    matchOpponent,
    error,
    startQuickMatch,
    handlePlay,
    confirmMatchStart,
    cancelMatch,
    leaveRoom
  };
}

import { useEffect, useRef, useState } from "react";
import type { Room } from "colyseus.js";
import type { GameCatalogEntry, GuestSession, PublicRoomSummary, RoomRoster } from "@playsalot/shared-types";
import { GameService } from "@/services/game.service";
import { MatchState } from "@/types/lobby";
import { clearReconnectionToken, saveReconnectionToken } from "@/lib/reconnect";
import { supportsGameScreen } from "@/features/games/game-ui-registry";
import { isMember } from "@/lib/session";

const LOGIN_REQUIRED_MESSAGE = "로그인이 필요해요. 마이페이지에서 로그인해 주세요.";

export interface WaitingRoom {
  room: Room;
  roster: RoomRoster | null;
}

/** State for the browsable public-room list opened from a game's detail screen. */
export interface PublicRoomsBrowser {
  gameId: string;
  rooms: PublicRoomSummary[];
  loading: boolean;
}

export function useMatch(session: GuestSession | null, games: GameCatalogEntry[], onShowToast: (msg: string) => void) {
  const [room, setRoom] = useState<Room | null>(null);
  const [activeGameId, setActiveGameId] = useState<string | null>(null);
  const [pendingMatch, setPendingMatch] = useState<{ room: Room; gameId: string } | null>(null);
  const [matchingState, setMatchingState] = useState<MatchState>("idle");
  const [matchOpponent, setMatchOpponent] = useState<string | null>(null);
  const [waitingRoom, setWaitingRoom] = useState<WaitingRoom | null>(null);
  const [publicRooms, setPublicRooms] = useState<PublicRoomsBrowser | null>(null);
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

  /** Wires up the messages BoardGameRoom sends only to private (host-start) rooms. */
  const attachWaitingRoomListeners = (waitingRoomRoom: Room) => {
    waitingRoomRoom.onMessage<RoomRoster>("roster", (roster) => {
      setWaitingRoom(prev => (prev && prev.room === waitingRoomRoom ? { room: waitingRoomRoom, roster } : prev));
    });
    waitingRoomRoom.onMessage<{ error: string }>("start-game-rejected", (payload) => {
      onShowToast(payload.error);
    });
    waitingRoomRoom.onMessage<{ gameId: string }>("game-started", (payload) => {
      saveReconnectionToken(waitingRoomRoom.reconnectionToken, payload.gameId);
      setRoom(waitingRoomRoom);
      setActiveGameId(payload.gameId);
      setWaitingRoom(null);
    });
  };

  /** Attaches the waiting-room listeners and shows the overlay for a freshly joined/created room. */
  const enterWaitingRoom = (newRoom: Room) => {
    attachWaitingRoomListeners(newRoom);
    setWaitingRoom({ room: newRoom, roster: null });
    setPublicRooms(null);
  };

  const createRoom = async (gameId: string, visibility: "public" | "private") => {
    if (!session) return;
    // Creating/hosting a room is login-required; guests are gated here (and again
    // server-side in BoardGameRoom.onAuth). Joining by code stays open to guests.
    if (!isMember(session)) { onShowToast(LOGIN_REQUIRED_MESSAGE); return; }
    setError(null);
    if (!supportsGameScreen(gameId)) {
      onShowToast("이 게임 화면은 아직 준비 중이에요!");
      return;
    }
    try {
      const newRoom = visibility === "public"
        ? await GameService.createPublicRoom(gameId, session)
        : await GameService.createPrivateRoom(gameId, session);
      enterWaitingRoom(newRoom);
    } catch (err) {
      onShowToast(err instanceof Error ? err.message : "방을 만들지 못했습니다.");
    }
  };

  const joinRoomByCode = async (roomCode: string) => {
    if (!session) return;
    const trimmed = roomCode.trim();
    if (!trimmed) return;
    setError(null);
    try {
      enterWaitingRoom(await GameService.joinRoomById(trimmed, session));
    } catch {
      onShowToast("입장 코드를 확인해주세요.");
    }
  };

  /** Opens the browsable list of open public rooms for a game and loads it. */
  const openPublicRooms = async (gameId: string) => {
    if (!session) return;
    if (!supportsGameScreen(gameId)) {
      onShowToast("이 게임 화면은 아직 준비 중이에요!");
      return;
    }
    setPublicRooms({ gameId, rooms: [], loading: true });
    await refreshPublicRoomsFor(gameId);
  };

  const refreshPublicRoomsFor = async (gameId: string) => {
    setPublicRooms((prev) => (prev && prev.gameId === gameId ? { ...prev, loading: true } : prev));
    try {
      const rooms = await GameService.fetchPublicRooms(gameId);
      setPublicRooms((prev) => (prev && prev.gameId === gameId ? { gameId, rooms, loading: false } : prev));
    } catch {
      setPublicRooms((prev) => (prev && prev.gameId === gameId ? { ...prev, loading: false } : prev));
    }
  };

  const refreshPublicRooms = () => {
    if (publicRooms) void refreshPublicRoomsFor(publicRooms.gameId);
  };

  const closePublicRooms = () => setPublicRooms(null);

  const createPublicRoom = async (gameId: string) => {
    if (!session) return;
    if (!isMember(session)) { onShowToast(LOGIN_REQUIRED_MESSAGE); return; }
    setError(null);
    try {
      enterWaitingRoom(await GameService.createPublicRoom(gameId, session));
    } catch (err) {
      onShowToast(err instanceof Error ? err.message : "방을 만들지 못했습니다.");
    }
  };

  const joinPublicRoom = async (roomId: string) => {
    if (!session) return;
    setError(null);
    try {
      enterWaitingRoom(await GameService.joinRoomById(roomId, session));
    } catch {
      onShowToast("이미 시작됐거나 마감된 방이에요.");
      if (publicRooms) void refreshPublicRoomsFor(publicRooms.gameId);
    }
  };

  const startWaitingRoomGame = () => {
    waitingRoom?.room.send("start-game");
  };

  const leaveWaitingRoom = () => {
    if (waitingRoom) {
      waitingRoom.room.leave();
      setWaitingRoom(null);
    }
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
    waitingRoom,
    publicRooms,
    error,
    startQuickMatch,
    handlePlay,
    confirmMatchStart,
    cancelMatch,
    leaveRoom,
    createRoom,
    joinRoomByCode,
    startWaitingRoomGame,
    leaveWaitingRoom,
    openPublicRooms,
    refreshPublicRooms,
    closePublicRooms,
    createPublicRoom,
    joinPublicRoom
  };
}

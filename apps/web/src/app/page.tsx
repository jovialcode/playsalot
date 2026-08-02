"use client";

import { useMemo, useState } from "react";
import { createLobbyGames } from "@/constants/games";
import { GameScreen } from "@/features/games/GameScreen";
import { Tab } from "@/types/lobby";

// Components
import { HomeView } from "@/components/lobby/HomeView";
import { FriendsView } from "@/components/lobby/FriendsView";
import { MissionsView } from "@/components/lobby/MissionsView";
import { RankingView } from "@/components/lobby/RankingView";
import { MyPageView } from "@/components/lobby/MyPageView";
import { GameDetailView } from "@/components/lobby/GameDetailView";
import { LobbyNavigation } from "@/components/lobby/LobbyNavigation";
import { MatchingOverlay } from "@/components/lobby/MatchingOverlay";
import { WaitingRoomOverlay } from "@/components/lobby/WaitingRoomOverlay";
import { PublicRoomsOverlay } from "@/components/lobby/PublicRoomsOverlay";

// Hooks
import { useSession } from "@/hooks/useSession";
import { useGames } from "@/hooks/useGames";
import { useMatch } from "@/hooks/useMatch";
import { useToast } from "@/hooks/useToast";

export default function LobbyPage() {
  const session = useSession();
  const { games } = useGames();
  const { toast, showToast } = useToast();
  const {
    room,
    activeGameId,
    matchingState,
    matchOpponent,
    waitingRoom,
    publicRooms,
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
  } = useMatch(session, games, showToast);

  // UI States
  const [activeTab, setActiveTab] = useState<Tab>("home");
  const [selectedGameId, setSelectedGameId] = useState<string | null>(null);

  const lobbyGames = useMemo(() => createLobbyGames(games), [games]);
  const selectedGame = useMemo(() => 
    lobbyGames.find(g => g.id === selectedGameId),
  [lobbyGames, selectedGameId]);

  // In-Game View
  if (room && session) {
    const gameInfo = lobbyGames.find(g => g.id === activeGameId);
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center bg-[var(--cream)] min-[540px]:bg-[var(--cream-deep)] min-[540px]:p-4 font-[var(--font-body)]">
        <div className="relative flex h-dvh w-full max-w-[500px] flex-col overflow-hidden bg-[var(--cream)] min-[540px]:h-full min-[540px]:rounded-[24px] min-[540px]:border min-[540px]:border-[var(--mist)] min-[540px]:shadow-[var(--shadow-2)]">
            <div className="flex items-center gap-[10px] border-b border-[var(--mist)] bg-[rgba(247,242,232,0.9)] p-[calc(14px+env(safe-area-inset-top,0px))_16px_14px] backdrop-blur-[12px]">
                <button
                    onClick={leaveRoom}
                    className="inline-flex h-[40px] w-[40px] flex-shrink-0 items-center justify-center rounded-full border border-[var(--mist)] bg-[var(--paper)] text-[var(--ink)] cursor-pointer"
                >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
                </button>
                <div className="overflow-hidden text-ellipsis whitespace-nowrap text-[18px] font-medium tracking-[-0.02em] text-[var(--ink)] font-[var(--font-display)]">
                    {gameInfo?.name || "게임 중"}
                </div>
            </div>
            <div className={activeGameId === "yutnori"
              ? "flex min-h-0 flex-1 overflow-hidden p-[16px_12px_calc(16px+env(safe-area-inset-bottom,0px))] sm:p-8"
              : "flex-1 overflow-y-auto p-[16px_12px_calc(16px+env(safe-area-inset-bottom,0px))] sm:p-8"}>
                {activeGameId && <GameScreen gameId={activeGameId} room={room} guestId={session.guestId} />}
            </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-dvh justify-center bg-[var(--cream)] min-[540px]:bg-[var(--cream-deep)] min-[540px]:p-[24px] font-[var(--font-body)]">
      <div className="relative flex h-dvh w-full max-w-[500px] flex-col overflow-hidden bg-[var(--cream)] min-[540px]:h-auto min-[540px]:min-h-[calc(100dvh-48px)] min-[540px]:rounded-[24px] min-[540px]:border min-[540px]:border-[var(--mist)] min-[540px]:shadow-[var(--shadow-2)]">
        
        {/* View Layer */}
        <div className="flex flex-1 flex-col overflow-y-auto">
          {selectedGame ? (
            <GameDetailView 
              game={selectedGame}
              onClose={() => setSelectedGameId(null)}
              onQuickMatch={startQuickMatch}
              onPlayWithBot={(id) => { handlePlay(id, true); }}
              onCreateRoom={createRoom}
              onInviteFriends={(id) => { createRoom(id, "private"); }}
              onJoinRoomByCode={joinRoomByCode}
              onOpenPublicRooms={openPublicRooms}
              onShowToast={showToast}
            />
          ) : (
            <div key={activeTab} className="flex flex-1 flex-col animate-[viewFadeIn_260ms_var(--ease)]">
              {activeTab === "home" && (
                <HomeView
                  games={lobbyGames}
                  onGameSelect={setSelectedGameId}
                  onQuickMatch={startQuickMatch}
                  onViewRanking={() => setActiveTab("ranking")}
                />
              )}
              {activeTab === "friends" && (
                <FriendsView onShowToast={showToast} />
              )}
              {activeTab === "missions" && (
                <MissionsView onShowToast={showToast} />
              )}
              {activeTab === "ranking" && (
                <RankingView />
              )}
              {activeTab === "my" && (
                <MyPageView session={session} />
              )}
            </div>
          )}
        </div>

        {/* Navigation Bar */}
        {!selectedGame && (
          <LobbyNavigation activeTab={activeTab} onTabChange={setActiveTab} />
        )}

        {/* Overlays */}
        <MatchingOverlay
          state={matchingState}
          opponent={matchOpponent}
          onCancel={cancelMatch}
          onConfirm={confirmMatchStart}
        />

        <WaitingRoomOverlay
          waitingRoom={waitingRoom}
          guestId={session?.guestId ?? ""}
          onStart={startWaitingRoomGame}
          onLeave={leaveWaitingRoom}
        />

        <PublicRoomsOverlay
          browser={publicRooms}
          gameName={lobbyGames.find((g) => g.id === publicRooms?.gameId)?.name ?? ""}
          onJoin={joinPublicRoom}
          onCreate={createPublicRoom}
          onRefresh={refreshPublicRooms}
          onClose={closePublicRooms}
        />

        {toast && (
          <div className="absolute bottom-[90px] left-1/2 z-40 -translate-x-1/2 animate-[toastIn_200ms_ease-out] whitespace-nowrap rounded-full bg-[var(--ink)] p-[10px_18px] text-[13px] text-[var(--cream)] shadow-[var(--shadow-2)]">
            {toast}
          </div>
        )}
      </div>
    </div>
  );
}

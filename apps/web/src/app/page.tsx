"use client";

import { useMemo, useState } from "react";
import { createLobbyGames } from "@/constants/games";
import { GameScreen } from "@/features/games/GameScreen";
import { Tab } from "@/types/lobby";

// Components
import { HomeView } from "@/components/lobby/HomeView";
import { GamesView } from "@/components/lobby/GamesView";
import { RankingView } from "@/components/lobby/RankingView";
import { MyPageView } from "@/components/lobby/MyPageView";
import { GameDetailView } from "@/components/lobby/GameDetailView";
import { LobbyNavigation } from "@/components/lobby/LobbyNavigation";
import { MatchingOverlay } from "@/components/lobby/MatchingOverlay";

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
    startQuickMatch,
    handlePlay,
    confirmMatchStart,
    cancelMatch,
    leaveRoom
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
      <div className="flex min-h-screen flex-col items-center justify-center bg-[var(--cream-deep)] p-4 font-[var(--font-body)]">
        <div className="relative flex h-full w-full max-w-[440px] flex-col overflow-hidden rounded-[24px] border border-[var(--mist)] bg-[var(--cream)] shadow-[var(--shadow-2)]">
            <div className="flex items-center gap-[10px] border-b border-[var(--mist)] bg-[rgba(247,242,232,0.9)] p-[16px_16px_14px] backdrop-blur-[12px]">
                <button 
                    onClick={leaveRoom}
                    className="inline-flex h-[36px] w-[36px] flex-shrink-0 items-center justify-center rounded-full border border-[var(--mist)] bg-[var(--paper)] text-[var(--ink)] cursor-pointer"
                >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
                </button>
                <div className="overflow-hidden text-ellipsis whitespace-nowrap text-[18px] font-medium tracking-[-0.02em] text-[var(--ink)] font-[var(--font-display)]">
                    {gameInfo?.name || "게임 중"}
                </div>
            </div>
            <div className="flex-1 overflow-y-auto p-8">
                {activeGameId && <GameScreen gameId={activeGameId} room={room} guestId={session.guestId} />}
            </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen justify-center bg-[var(--cream-deep)] p-[24px] font-[var(--font-body)]">
      <div className="relative flex min-h-[calc(100vh-48px)] w-[440px] max-w-full flex-col overflow-hidden rounded-[24px] border border-[var(--mist)] bg-[var(--cream)] shadow-[var(--shadow-2)]">
        
        {/* View Layer */}
        <div className="flex flex-1 flex-col overflow-y-auto">
          {selectedGame ? (
            <GameDetailView 
              game={selectedGame}
              onClose={() => setSelectedGameId(null)}
              onQuickMatch={(id) => { setSelectedGameId(null); startQuickMatch(id); }}
              onPlayWithBot={(id) => { setSelectedGameId(null); handlePlay(id, true); }}
              onShowToast={showToast}
            />
          ) : (
            <>
              {activeTab === "home" && (
                <HomeView 
                  games={lobbyGames}
                  onGameSelect={setSelectedGameId} 
                  onQuickMatch={startQuickMatch}
                  onViewAllGames={() => setActiveTab("games")}
                />
              )}
              {activeTab === "games" && (
                <GamesView games={lobbyGames} onGameSelect={setSelectedGameId} />
              )}
              {activeTab === "ranking" && (
                <RankingView />
              )}
              {activeTab === "my" && (
                <MyPageView session={session} />
              )}
            </>
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

        {toast && (
          <div className="absolute bottom-[90px] left-1/2 z-40 -translate-x-1/2 animate-[toastIn_200ms_ease-out] whitespace-nowrap rounded-full bg-[var(--ink)] p-[10px_18px] text-[13px] text-[var(--cream)] shadow-[var(--shadow-2)]">
            {toast}
          </div>
        )}
      </div>
    </div>
  );
}

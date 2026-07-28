export type PlayerId = string;

export interface GameMoveResult {
  ok: boolean;
  error?: string;
}

export interface GameOverResult {
  winnerId?: PlayerId;
  draw?: boolean;
}

export interface PlayerInfo {
  id: PlayerId;
  displayName: string;
}

import type { CSSProperties, ReactNode } from "react";
import type { DesignGame } from "@/types/game";

interface GameCardProps {
  game: DesignGame;
  onSelect: (gameId: string) => void;
  /** Absolutely-positioned overlay for the image area (rank number, "신규", …). */
  badge?: ReactNode;
  /** Wide horizontal layout (image left, text right) — for bento tiles that span two columns. */
  wide?: boolean;
  /** Extra classes on the outer card — e.g. a fixed width for horizontal scrollers, or a grid span. */
  className?: string;
  style?: CSSProperties;
}

const IMAGE_ICON = (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>
);

/**
 * The single game card used everywhere games are listed (home carousels, the
 * bento grid, the games tab) so every surface shares one identical look. The
 * image area falls back to a labelled placeholder until a real `game.image`
 * is provided. `wide` switches to a horizontal layout for bento variety.
 */
export function GameCard({ game, onSelect, badge, wide = false, className = "", style }: GameCardProps) {
  const imageArea = (
    <div
      className={`relative flex flex-col items-center justify-center overflow-hidden p-[12px] ${wide ? "w-[42%] flex-shrink-0 self-stretch" : "aspect-[4/3] w-full"}`}
      style={{ background: game.tint }}
    >
      {game.image ? (
        <img src={game.image} alt="" className="absolute inset-0 h-full w-full object-cover" />
      ) : (
        <>
          <div className="absolute inset-0 m-[8px] rounded-[12px] border-2 border-dashed border-black/10" />
          <div className="z-10 flex flex-col items-center gap-[8px] text-center opacity-60" style={{ color: "var(--ink)" }}>
            {IMAGE_ICON}
            {!wide && (
              <div className="px-2 text-[12px] font-medium leading-tight text-[var(--ink)]">
                {game.name} 이미지<br/>
                <span className="text-[10px] opacity-70 underline">or browse files</span>
              </div>
            )}
          </div>
        </>
      )}
      <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/20 to-transparent" />
      {badge}
    </div>
  );

  return (
    <div
      onClick={() => onSelect(game.id)}
      style={style}
      className={`stagger-in flex cursor-pointer overflow-hidden rounded-[20px] border border-[var(--mist)] bg-[var(--paper)] shadow-sm transition-transform active:scale-[0.98] ${wide ? "flex-row" : "flex-col"} ${className}`}
    >
      {imageArea}
      {wide ? (
        <div className="flex flex-1 flex-col justify-center gap-[6px] p-[16px]">
          <div className="text-[17px] font-bold tracking-[-0.01em] text-[var(--ink)]">{game.name}</div>
          <div className="line-clamp-2 text-[12px] leading-[1.4] text-[var(--ink-mute)]">{game.desc}</div>
          <div className="mt-[2px] flex items-center gap-[6px] text-[12px] font-medium text-[var(--ink-soft)]">
            <span className="h-[6px] w-[6px] rounded-full bg-[var(--coral)]" />
            {game.activeNow.toLocaleString()}명 플레이 중
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-[4px] p-[16px_16px_18px]">
          <div className="text-[16px] font-bold tracking-[-0.01em] text-[var(--ink)]">{game.name}</div>
          <div className="text-[13px] text-[var(--ink-mute)] font-medium">{game.activeNow.toLocaleString()}명 플레이 중</div>
        </div>
      )}
    </div>
  );
}

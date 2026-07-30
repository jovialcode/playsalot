import { Tab } from "@/types/lobby";

interface LobbyNavigationProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
}

export function LobbyNavigation({ activeTab, onTabChange }: LobbyNavigationProps) {
  const tabs = [
    { id: "home", label: "홈", d: "M3 12 12 4l9 8M5 10v10h14V10" },
    { id: "games", label: "게임", d: "M12 3 3 8l9 5 9-5-9-5ZM3 13l9 5 9-5M3 18l9 5 9-5" },
    { id: "ranking", label: "랭킹", d: "M8 21h8M12 17v4M7 4h10v4a5 5 0 0 1-10 0V4ZM7 6H5a2 2 0 1 0 0 4h2M17 6h2a2 2 0 1 1 0 4h-2" },
    { id: "my", label: "마이", d: "M12 7a3 3 0 1 0 0 6 3 3 0 0 0 0-6ZM5 20c0-3.9 3.1-7 7-7s7 3.1 7 7" },
  ];

  return (
    <nav className="flex flex-shrink-0 justify-around border-t border-[var(--mist)] bg-[rgba(247,242,232,0.9)] p-[8px_12px_calc(10px+env(safe-area-inset-bottom,0px))] backdrop-blur-[12px]">
      {tabs.map((t) => (
        <button
          key={t.id}
          onClick={() => onTabChange(t.id as Tab)}
          className="flex cursor-pointer flex-col items-center gap-[3px] border-none bg-transparent p-[6px_10px] font-[var(--font-body)] transition-transform duration-150 active:scale-[.88]"
        >
          <svg
            key={activeTab === t.id ? `${t.id}-active` : `${t.id}-idle`}
            width="22" height="22" viewBox="0 0 24 24" fill="none"
            stroke={activeTab === t.id ? "var(--sage)" : "var(--ink-mute)"}
            strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"
            style={{ transition: "stroke 150ms var(--ease)", animation: activeTab === t.id ? "tabPop 320ms var(--ease)" : "none" }}
          ><path d={t.d}/></svg>
          <span className="text-[11px] transition-colors duration-150" style={{ color: activeTab === t.id ? "var(--sage)" : "var(--ink-mute)", fontWeight: activeTab === t.id ? 600 : 400 }}>{t.label}</span>
        </button>
      ))}
    </nav>
  );
}

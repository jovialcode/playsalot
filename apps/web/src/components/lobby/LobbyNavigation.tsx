import { Tab } from "@/types/lobby";

interface LobbyNavigationProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
}

export function LobbyNavigation({ activeTab, onTabChange }: LobbyNavigationProps) {
  const tabs = [
    { id: "home", label: "홈", d: "M3 12 12 4l9 8M5 10v10h14V10" },
    { id: "friends", label: "친구", d: "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" },
    // "도전"(missions) 탭은 일단 숨김 — MissionsView는 남겨두었고, 이 줄만 되살리면 복구됨:
    // { id: "missions", label: "도전", d: "M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20M12 6a6 6 0 1 0 0 12 6 6 0 0 0 0-12M12 10a2 2 0 1 0 0 4 2 2 0 0 0 0-4" },
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

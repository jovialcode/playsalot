"use client";

import { useEffect, useState } from "react";
import type { GuestSession, MyRanking } from "@playsalot/shared-types";
import { API_URL } from "@/lib/env";
import { clearSession, friendRequest } from "@/lib/session";

interface MyPageViewProps {
  session: GuestSession | null;
}

type Provider = "google" | "kakao" | "naver";

const PROVIDERS: { id: Provider; label: string; className: string }[] = [
  { id: "google", label: "Google로 계속하기", className: "bg-white text-[#3c4043] border border-[var(--mist)]" },
  { id: "kakao", label: "카카오로 계속하기", className: "bg-[#FEE500] text-[#191600] border border-[#FEE500]" },
  { id: "naver", label: "네이버로 계속하기", className: "bg-[#03C75A] text-white border border-[#03C75A]" },
];

export function MyPageView({ session }: MyPageViewProps) {
  const isMember = session?.accountType === "member";
  const [ranking, setRanking] = useState<MyRanking | null>(null);

  useEffect(() => {
    if (!session) return;
    friendRequest<MyRanking>(session, "/ranking/me")
      .then(setRanking)
      .catch(() => setRanking(null));
  }, [session]);

  const stats: [string, string][] = [
    [ranking ? ranking.wins.toLocaleString() : "-", "승리"],
    [ranking ? ranking.plays.toLocaleString() : "-", "플레이"],
    [ranking ? ranking.score.toLocaleString() : "-", "포인트"],
  ];

  const login = (provider: Provider) => {
    window.location.assign(`${API_URL}/api/auth/${provider}/login`);
  };

  const logout = () => {
    clearSession();
    window.location.reload();
  };

  return (
    <div className="flex flex-col">
      <div className="sticky top-0 z-20 border-b border-[var(--mist)] bg-[rgba(247,242,232,0.85)] backdrop-blur-[12px]">
        <div className="p-[20px_22px_14px] pt-[calc(20px+env(safe-area-inset-top,0px))]">
          <div className="mb-[4px] text-[11px] font-medium uppercase tracking-[0.08em] text-[var(--sage-soft)]">계정</div>
          <div className="text-[28px] font-medium tracking-[-0.02em] text-[var(--ink)] font-[var(--font-display)]">마이페이지</div>
        </div>
      </div>
      <div className="flex flex-col gap-[22px] p-[18px_20px_32px]">
        <div className="flex items-center gap-[14px]">
          {session?.profileImageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={session.profileImageUrl}
              alt=""
              className="h-[56px] w-[56px] flex-shrink-0 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-[56px] w-[56px] flex-shrink-0 items-center justify-center rounded-full bg-[var(--sage)] text-[var(--cream)] font-[var(--font-display)] text-[20px] font-medium">
              {session?.displayName?.[0] || "게"}
            </div>
          )}
          <div>
            <div className="text-[19px] font-medium tracking-[-0.02em] text-[var(--ink)] font-[var(--font-display)]">{session?.displayName || "게스트"}</div>
            <div className="mt-[6px] flex gap-[6px]">
              <span className="chip inline-flex">{isMember ? "회원" : "게스트"}</span>
              {session?.isAdmin && (
                <span className="chip inline-flex bg-[var(--sage)] text-[var(--cream)]">관리자</span>
              )}
            </div>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-[8px]">
          {stats.map(([value, label], i) => (
            <div key={label} style={{ animationDelay: `${i * 60}ms` }} className="stagger-in card-interactive rounded-[12px] border border-[var(--mist)] bg-[var(--paper)] p-[14px_8px] text-center">
              <div className="text-[22px] font-medium text-[var(--ink)] font-[var(--font-display)]">{value}</div>
              <div className="mt-[4px] text-[11px] text-[var(--ink-mute)]">{label}</div>
            </div>
          ))}
        </div>

        {isMember ? (
          <button onClick={logout} className="btn btn-ghost text-[var(--danger)] justify-start px-0">로그아웃</button>
        ) : (
          <div className="flex flex-col gap-[10px]">
            <div className="text-[13px] text-[var(--ink-mute)]">간편 로그인하고 별명·프로필을 저장하세요.</div>
            {PROVIDERS.map(({ id, label, className }) => (
              <button
                key={id}
                onClick={() => login(id)}
                className={`flex h-[48px] w-full items-center justify-center rounded-[12px] text-[15px] font-medium cursor-pointer ${className}`}
              >
                {label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

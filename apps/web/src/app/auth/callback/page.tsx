"use client";

import { useEffect, useState } from "react";
import { hydrateMemberSession } from "@/lib/session";

/**
 * Landing page for the OAuth redirect. The game-server sends the browser here
 * with either ?token=<jwt> (success) or ?error=<reason>. We cache the session
 * and bounce back to the lobby, where useSession picks up the stored member.
 */
export default function AuthCallbackPage() {
  const [message, setMessage] = useState("로그인 중...");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    const error = params.get("error");

    if (error || !token) {
      // One-shot status message on mount before bouncing home; not a cascading render.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setMessage("로그인에 실패했어요. 잠시 후 다시 시도해 주세요.");
      const timer = setTimeout(() => { window.location.replace("/"); }, 1600);
      return () => clearTimeout(timer);
    }

    hydrateMemberSession(token)
      .then(() => { window.location.replace("/"); })
      .catch(() => {
        setMessage("로그인 세션을 확인하지 못했어요.");
        setTimeout(() => { window.location.replace("/"); }, 1600);
      });
  }, []);

  return (
    <div className="flex min-h-dvh items-center justify-center bg-[var(--cream)] font-[var(--font-body)]">
      <div className="text-[15px] text-[var(--ink-mute)]">{message}</div>
    </div>
  );
}

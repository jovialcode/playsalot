"use client";

import { useState } from "react";
import type { GuestSession } from "@playsalot/shared-types";
import { API_URL } from "@/lib/env";
import { storeSession } from "@/lib/session";

export default function AdminLoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    setError("");
    setSubmitting(true);
    try {
      const response = await fetch(`${API_URL}/api/auth/admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as { message?: string } | null;
        throw new Error(body?.message ?? "로그인에 실패했어요.");
      }
      const session = (await response.json()) as GuestSession;
      storeSession(session);
      window.location.replace("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "로그인에 실패했어요.");
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-dvh items-center justify-center bg-[var(--cream-deep)] p-[24px] font-[var(--font-body)]">
      <form
        onSubmit={(e) => { e.preventDefault(); void submit(); }}
        className="flex w-full max-w-[360px] flex-col gap-[16px] rounded-[20px] border border-[var(--mist)] bg-[var(--cream)] p-[28px_24px] shadow-[var(--shadow-2)]"
      >
        <div>
          <div className="text-[11px] font-medium uppercase tracking-[0.08em] text-[var(--sage-soft)]">관리자</div>
          <h1 className="text-[24px] font-medium tracking-[-0.02em] text-[var(--ink)] font-[var(--font-display)]">관리자 로그인</h1>
        </div>
        <label className="flex flex-col gap-[6px] text-[13px] text-[var(--ink-mute)]">
          아이디
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
            className="h-[46px] rounded-[12px] border border-[var(--mist)] bg-[var(--paper)] px-[14px] text-[15px] text-[var(--ink)] outline-none focus:border-[var(--sage)]"
          />
        </label>
        <label className="flex flex-col gap-[6px] text-[13px] text-[var(--ink-mute)]">
          비밀번호
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            className="h-[46px] rounded-[12px] border border-[var(--mist)] bg-[var(--paper)] px-[14px] text-[15px] text-[var(--ink)] outline-none focus:border-[var(--sage)]"
          />
        </label>
        {error && <div className="text-[13px] text-[var(--danger)]">{error}</div>}
        <button
          type="submit"
          disabled={submitting}
          className="mt-[4px] flex h-[48px] items-center justify-center rounded-[12px] bg-[var(--sage)] text-[15px] font-medium text-[var(--cream)] cursor-pointer disabled:opacity-60"
        >
          {submitting ? "로그인 중..." : "로그인"}
        </button>
      </form>
    </div>
  );
}

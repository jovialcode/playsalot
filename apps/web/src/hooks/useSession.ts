import { useState, useEffect } from "react";
import type { GuestSession } from "@playsalot/shared-types";
import { getOrCreateGuestSession } from "@/lib/session";

export function useSession() {
  const [session, setSession] = useState<GuestSession | null>(null);

  useEffect(() => {
    getOrCreateGuestSession().then(setSession);
  }, []);

  return session;
}

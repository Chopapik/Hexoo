"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Avatar } from "@/features/posts/components/Avatar";
import fetchClient from "@/lib/fetchClient";
import { useAppStore } from "@/lib/store/store";

type PreviewUser = {
  uid: string;
  name: string;
  avatarUrl?: string;
};

const DEBOUNCE_MS = 200;

export function RightNavActiveUsers() {
  const onlineUids = useAppStore((s) => s.presence.onlineUids);
  const selfUid = useAppStore((s) => s.auth.user?.uid);

  const uidsKey = useMemo(() => [...onlineUids].sort().join(","), [onlineUids]);

  const [users, setUsers] = useState<PreviewUser[]>([]);

  useEffect(() => {
    const uids = uidsKey ? uidsKey.split(",") : [];

    if (uids.length === 0) {
      setUsers([]);
      return;
    }

    let cancelled = false;
    const debounceId = window.setTimeout(async () => {
      try {
        const data = await fetchClient.post<{ users: PreviewUser[] }>(
          "/users/by-ids",
          { uids },
        );
        if (!cancelled) setUsers(data.users ?? []);
      } catch {
        if (!cancelled) setUsers([]);
      }
    }, DEBOUNCE_MS);

    return () => {
      cancelled = true;
      window.clearTimeout(debounceId);
    };
  }, [uidsKey]);

  const others = useMemo(
    () => (selfUid ? users.filter((u) => u.uid !== selfUid) : users),
    [users, selfUid],
  );

  // Zmieniony stan dla braku użytkowników
  if (others.length === 0) {
    return (
      <section
        className="w-full rounded-xl px-2 py-3 bg-[radial-gradient(ellipse_113.20%_442.25%_at_26.12%_10.28%,var(--text-main,rgba(255,255,255,0.04))_0%,var(--text-neutral,rgba(115,115,115,0.04))_100%)] flex flex-col justify-center items-center min-h-[90px]"
        aria-label="Brak aktywnych użytkowników"
      >
        <div className="mb-2 px-0.5 flex items-center gap-1.5">
          <h3 className="text-[10px] font-bold tracking-wider text-text-neutral font-Albert_Sans">
            /aktywni/
          </h3>
        </div>

        <div className="flex flex-col items-center justify-center text-text-neutral/50 transition-opacity">
          <span className="text-xl font-mono whitespace-pre select-none tracking-tighter">
            {` (∪｡∪)｡｡｡zzZ `}
          </span>
          <span className="text-[10px] mt-1.5 font-Albert_Sans tracking-widest uppercase opacity-80">
            pusto tutaj
          </span>
        </div>
      </section>
    );
  }

  return (
    <section
      className="w-full rounded-xl   px-2 py-3 bg-[radial-gradient(ellipse_113.20%_442.25%_at_26.12%_10.28%,var(--text-main,rgba(255,255,255,0.04))_0%,var(--text-neutral,rgba(115,115,115,0.04))_100%)] flex flex-col justify-center items-center"
      aria-label="Użytkownicy aktywni na stronie"
    >
      <div className="mb-2 px-0.5 flex items-center gap-1.5 bg-erd">
        <h3 className="text-[10px] font-bold  tracking-wider text-text-neutral font-Albert_Sans">
          /aktywni/
        </h3>
      </div>

      <div className="flex flex-col items-center gap-2.5 lg:flex-row lg:flex-nowrap lg:justify-start lg:overflow-x-auto lg:pb-1 lg:gap-2 [scrollbar-width:thin]">
        {others.map((u) => (
          <Link
            key={u.uid}
            href={`/profile/${encodeURIComponent(u.name)}`}
            title={u.name}
            className="group relative shrink-0 rounded-2xl p-0.5 outline-none transition-transform duration-200 focus-visible:scale-[1.04] focus-visible:ring-2 focus-visible:ring-primary-fuchsia-stroke-default focus-visible:ring-offset-2 focus-visible:ring-offset-primary-neutral-background-default ring-offset-2 ring-offset-primary-neutral-background-default"
          >
            <Avatar
              src={u.avatarUrl}
              alt={u.name}
              className="w-11 h-11 lg:w-10 lg:h-10 border border-white/10 transition-colors"
              width={52}
              height={52}
            />
            <span className="sr-only">Profil: {u.name}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}

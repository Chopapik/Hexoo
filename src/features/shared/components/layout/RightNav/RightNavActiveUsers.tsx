"use client";

import { Loader2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Avatar } from "@/features/shared/components/ui/Avatar";
import { useActiveUsers } from "@/features/users/hooks/useActiveUsers";
import { useAppStore } from "@/lib/store/store";

export function RightNavActiveUsers() {
  const onlineUids = useAppStore((s) => s.presence.onlineUids);
  const selfUid = useAppStore((s) => s.auth.user?.uid);

  const { data: users = [], isLoading } = useActiveUsers(
    Array.from(onlineUids),
  );

  const activeUsers = users.filter((u) => u.uid !== selfUid);
  const isEmpty = activeUsers.length === 0;

  return (
    <section className="flex min-h-[200px] w-full flex-col items-center justify-start rounded-xl bg-[radial-gradient(ellipse_113.20%_442.25%_at_26.12%_10.28%,var(--text-main,rgba(255,255,255,0.04))_0%,var(--text-neutral,rgba(115,115,115,0.04))_100%)] px-2 py-3">
      <div className="mb-2 flex items-center gap-1.5 px-0.5">
        <h3 className="text-text-neutral text-[10px] font-bold tracking-wider">
          /aktywni użytkownicy/
        </h3>
      </div>

      <div
        className={`flex h-full w-full text-text-neutral/50 ${
          isEmpty
            ? "flex-col items-center justify-center gap-1.5"
            : "flex-row flex-wrap content-center items-center justify-center gap-2.5 overflow-y-auto pb-1 [scrollbar-width:thin]"
        }`}
      >
        {isEmpty ? (
          <>
            <Image
              src="/images/face01.png"
              alt=""
              width={180}
              height={320}
              className="h-auto w-[75px]"
              sizes="75px"
            />
            <span className="font-serif text-center text-sm">
              aktualnie nikt poza tobą nie jest aktywny
            </span>
          </>
        ) : (
          activeUsers.map((u) => (
            <Link
              key={u.uid}
              href={`/profile/${encodeURIComponent(u.name)}`}
              title={u.name}
            >
              <Avatar src={u.avatarUrl} alt={u.name} width={52} height={52} />
              <span className="sr-only">Profil: {u.name}</span>
            </Link>
          ))
        )}
      </div>
    </section>
  );

}

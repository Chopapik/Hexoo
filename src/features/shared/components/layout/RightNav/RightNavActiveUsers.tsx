"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Avatar } from "@/features/shared/components/ui/Avatar";
import { useActiveUsers } from "@/features/users/hooks/useActiveUsers";
import { useAppStore } from "@/lib/store/store";
import { useI18n } from "@/i18n/useI18n";

const READY_MIN_MS = 600;

export function RightNavActiveUsers() {
  const { t } = useI18n();
  const onlineUids = useAppStore((s) => s.presence.onlineUids);
  const selfUid = useAppStore((s) => s.auth.user?.uid);

  const uids = useMemo(() => Array.from(onlineUids), [onlineUids]);
  const needsFetch = uids.length > 1;

  const { data: users = [], isLoading } = useActiveUsers(uids);

  const [minDelayElapsed, setMinDelayElapsed] = useState(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const id = window.setTimeout(() => setMinDelayElapsed(true), READY_MIN_MS);
    return () => window.clearTimeout(id);
  }, []);

  useEffect(() => {
    if (isReady) return;

    if (!minDelayElapsed) return;

    if (needsFetch && isLoading) return;

    setIsReady(true);
  }, [isReady, minDelayElapsed, needsFetch, isLoading]);

  const activeUsers = users.filter((u) => u.uid !== selfUid);
  const isEmpty = activeUsers.length === 0;

  return (
    <section className="flex min-h-[215px] w-full flex-col items-center justify-start">
      <div className="mb-2 flex items-center gap-1.5 px-0.5 transition-all duration-300 ease-soft">
        <h3 className="text-foreground-secondary-default text-[10px] font-bold tracking-wider transition-all duration-300 ease-soft">
          {t("right.activeUsers")}
        </h3>
      </div>

      <div
        className={`flex h-full w-full text-foreground-secondary-default/50 ${
          !isReady || isEmpty
            ? "flex-col items-center justify-center gap-1.5"
            : "flex-row flex-wrap content-center items-center justify-center gap-2.5 overflow-y-auto pb-1 [scrollbar-width:thin]"
        }`}
      >
        {!isReady ? null : isEmpty ? (
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
              {t("right.noActiveUsers")}
            </span>
          </>
        ) : (
          activeUsers.map((u) => (
            <Link
              key={u.uid}
              href={`/profile/${encodeURIComponent(u.uid)}`}
              title={u.name}
            >
              <Avatar src={u.avatarUrl} alt={u.name} width={52} height={52} />
              <span className="sr-only">{t("right.profileSr", { name: u.name })}</span>
            </Link>
          ))
        )}
      </div>
    </section>
  );
}
